#!/usr/bin/env python3
"""MusicBrainz-Durchgang fuer die Songs, die in 'Ohne' uebrig bleiben, weil Discogs
nichts Eindeutiges liefert. Je Song: Aufnahme-Suche (Interpret + Titel), Tags der
passenden Aufnahmen plus Genres/Tags des Interpreten. Die Tags werden mit der aus
dem Katalog gelernten Stil-Zuordnung (reclassify_ohne_v2.learn) auf Kategorien
abgebildet; eine Kategorie gewinnt nur mit mind. MIN_STIMMEN Stimmen und ANTEIL
der Stimmen. Weihnachtslieder bleiben aussen vor (Schritt 'weihnacht' im
Discogs-Skript). Sonst bleibt der Song in 'Ohne'.

  python3 tools/reclassify_ohne_musicbrainz.py suchen   --cache mb-cache.json --bericht mb.csv
  python3 tools/reclassify_ohne_musicbrainz.py anwenden --cache mb-cache.json

MusicBrainz: 1 Anfrage/s, eigener User-Agent (https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting).
"""
import argparse
import collections
import csv
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import reclassify_ohne_v2 as v2  # noqa: E402

UA = "DriftwareCatalogBot/1.0 (info@driftware.online)"
MIN_INTERVAL = 1.1
MIN_STIMMEN, ANTEIL = 4, 0.75
XMAS = {"christmas", "holiday", "xmas", "christmas music"}
_last = [0.0]


def alnum(s):
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def get(path, params):
    wait = MIN_INTERVAL - (time.time() - _last[0])
    if wait > 0:
        time.sleep(wait)
    url = "https://musicbrainz.org/ws/2/" + path + "?" + urllib.parse.urlencode({**params, "fmt": "json"})
    for attempt in range(4):
        _last[0] = time.time()
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code in (429, 503):
                time.sleep(5 * (attempt + 1))
                continue
            return {}
        except Exception:
            time.sleep(3)
    return {}


def tags_of(obj):
    out = collections.Counter()
    for k in ("tags", "genres"):
        for t in obj.get(k) or []:
            out[t["name"].lower()] += max(1, int(t.get("count") or 1))
    return out


def suche(song):
    artist = re.split(r"\s+(?:feat\.?|ft\.?|featuring)\s+", song.get("a") or "", flags=re.I)[0]
    title = re.sub(r"\s*[\(\[][^\)\]]*[\)\]]", "", song.get("t") or "").strip()
    q = f'recording:"{title}" AND artist:"{artist}"'
    res = get("recording", {"query": q, "limit": "5"}).get("recordings", [])
    tags, artist_id = collections.Counter(), None
    for r in res:
        if r.get("score", 0) < 85:
            continue
        names = " ".join(c.get("name", "") for c in r.get("artist-credit", []) if isinstance(c, dict))
        if alnum(artist) and (alnum(artist) in alnum(names) or alnum(names) in alnum(artist)):
            tags += tags_of(r)
            if not artist_id:
                for c in r.get("artist-credit", []):
                    if isinstance(c, dict) and c.get("artist", {}).get("id"):
                        artist_id = c["artist"]["id"]
                        break
    art = collections.Counter()
    if artist_id:
        art = tags_of(get(f"artist/{artist_id}", {"inc": "tags+genres"}))
    return {"rec": dict(tags), "art": dict(art), "treffer": bool(artist_id)}


def entscheide(eintrag, style_map):
    alle = collections.Counter(eintrag["rec"])
    alle.update(eintrag["art"])
    if any(t in XMAS for t in alle):
        return None
    stimmen = collections.Counter()
    for tag, n in alle.items():
        cat = style_map.get(alnum(tag))
        if cat:
            stimmen[cat] += n
    if not stimmen:
        return None
    cat, n = stimmen.most_common(1)[0]
    return cat if n >= MIN_STIMMEN and n / sum(stimmen.values()) >= ANTEIL else None


def style_map_of(data):
    sm, _ = v2.learn(data)
    return {alnum(k): v for k, v in sm.items()}


def key(dec, s):
    return f"{dec}|{s.get('a')}|{s.get('t')}"


def lade(p):
    return json.load(open(p, encoding="utf-8")) if p and os.path.exists(p) else {}


def speichere(p, d):
    tmp = p + ".tmp"
    json.dump(d, open(tmp, "w", encoding="utf-8"), ensure_ascii=False)
    os.replace(tmp, p)


def cmd_suchen(a):
    cache, zeilen, n = lade(a.cache), [], 0
    for dec in v2.DECADES:
        data = json.load(open(f"{dec}-music/songs.json", encoding="utf-8"))
        sm = style_map_of(data)
        for s in data.get("Ohne", []):
            k = key(dec, s)
            if k not in cache:
                cache[k] = suche(s)
                n += 1
                if n % 10 == 0:
                    speichere(a.cache, cache)
                    print(f"  {n} Songs abgefragt ...", flush=True)
            e = cache[k]
            zeilen.append([dec, s.get("a"), s.get("t"), "ja" if e["treffer"] else "nein", entscheide(e, sm) or ""])
    speichere(a.cache, cache)
    if a.bericht:
        w = csv.writer(open(a.bericht, "w", newline="", encoding="utf-8"))
        w.writerow(["dekade", "interpret", "titel", "mb_treffer", "neue_kategorie"])
        w.writerows(zeilen)
    print(f"{sum(1 for z in zeilen if z[4])} von {len(zeilen)} zuordenbar, "
          f"{sum(1 for z in zeilen if z[3] == 'nein')} ohne MusicBrainz-Treffer.")


def cmd_anwenden(a):
    cache, gesamt = lade(a.cache), 0
    for dec in v2.DECADES:
        path = f"{dec}-music/songs.json"
        data = json.load(open(path, encoding="utf-8"))
        sm = style_map_of(data)
        rest, mv = [], collections.Counter()
        for s in data.get("Ohne", []):
            cat = entscheide(cache[key(dec, s)], sm) if key(dec, s) in cache else None
            if cat:
                data.setdefault(cat, []).append(s)
                mv[cat] += 1
            else:
                rest.append(s)
        data["Ohne"] = rest
        n = sum(mv.values())
        gesamt += n
        print(f"{dec}: {n} verschoben, {len(rest)} bleiben in Ohne  {dict(mv)}")
        if n:
            tmp = path + ".tmp"
            json.dump(data, open(tmp, "w", encoding="utf-8"), separators=(",", ":"), ensure_ascii=False)
            os.replace(tmp, path)
    print(f"GESAMT: {gesamt} verschoben")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("schritt", choices=["suchen", "anwenden"])
    p.add_argument("--cache", required=True)
    p.add_argument("--bericht")
    a = p.parse_args()
    (cmd_suchen if a.schritt == "suchen" else cmd_anwenden)(a)
