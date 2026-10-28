#!/usr/bin/env python3
"""Sucht fuer tote/nicht einbettbare YouTube-Videos (queue/dead-videos.json, aus tools/check_dead_videos.py)
ein neues Video und tauscht es in allen Katalogen aus.

Ablauf je toter Video-ID: Interpret/Titel des Eintrags per yt-dlp suchen (5 Treffer, wie beim Server-Import),
nur nehmen, wenn Interpret UND Titel zum Videotitel passen, das Video nicht selbst tot ist (oEmbed) und nicht
schon im selben Genre steht. Dann in ALLEN Eintraegen mit der alten ID: yt tauschen; th/cv nur dann, wenn sie
auf das alte Video zeigen (Discogs-Cover bleiben). Findet sich nichts, bleibt der Eintrag unveraendert --
es wird nie ein Lied geloescht.

Fortschritt: queue/dead-videos-ersatz.json {"ersetzt": {alt: neu}, "nichts": [alt, ...]}; "nichts" wird
erst nach 30 Tagen erneut versucht.

Aufruf: python3 tools/ersetze_tote_videos.py [--limit N] [--dry]
Umgebung: ERSATZ_TIME_BUDGET_SECONDS (Standard 1800), YT_DLP (Pfad, Standard yt-dlp)
"""
import argparse
import glob
import json
import os
import random
import re
import subprocess
import time
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEAD = os.path.join(ROOT, "queue", "dead-videos.json")
STATE = os.path.join(ROOT, "queue", "dead-videos-ersatz.json")
YT_DLP = os.environ.get("YT_DLP", "yt-dlp")
BUDGET = int(os.environ.get("ERSATZ_TIME_BUDGET_SECONDS", "1800"))
ERNEUT_NACH = 30 * 86400
START = time.time()

FORMATE = [dict(separators=(",", ":"), ensure_ascii=False), dict(ensure_ascii=False), dict(indent=2, ensure_ascii=False)]


def erkenne_format(raw, data):
    for kw in FORMATE:
        s = json.dumps(data, **kw)
        if s == raw or s + "\n" == raw:
            return kw, raw.endswith("\n")
    raise SystemExit("Unbekanntes Schreibformat -- Datei bleibt unangetastet.")


def norm(s):
    s = (s or "").lower()
    for a, b in (("ö", "o"), ("ü", "u"), ("ä", "a"), ("é", "e"), ("è", "e"), ("á", "a"), ("í", "i"), ("ó", "o"), ("ñ", "n"), ("ß", "ss")):
        s = s.replace(a, b)
    return re.sub(r"[^a-z0-9]", "", s)


def passt(a, t, video):
    """Interpret und Titel muessen im Videotitel bzw. Kanalnamen vorkommen (wie tools/server_import)."""
    vt = norm(video.get("title"))
    vc = norm(video.get("channel") or video.get("uploader"))
    art = norm(re.split(r"\s+(?:feat\.?|ft\.?|featuring|with|and|&|x)\s+|,", re.sub(r"^the ", "", re.sub(r"\(\d+\)", "", a.lower())))[0])
    tit = norm(re.sub(r"^the ", "", re.sub(r"\s*[\(\[][^)\]]*[\)\]]", "", t).lower()))
    return bool(art) and bool(tit) and (art in vt or art in vc) and tit in vt


def suche(a, t):
    for pc in (None, "android"):
        cmd = [YT_DLP, f"ytsearch5:{a} {t}", "--dump-json", "--skip-download", "--no-warnings"]
        if pc:
            cmd += ["--extractor-args", f"youtube:player_client={pc}"]
        try:
            r = subprocess.run(cmd, capture_output=True, text=True, timeout=90)
        except Exception:
            continue
        treffer = []
        for zeile in r.stdout.splitlines():
            try:
                treffer.append(json.loads(zeile))
            except ValueError:
                pass
        if treffer:
            # Vevo-Kanaele zuerst, sonst Suchreihenfolge
            return sorted(treffer, key=lambda x: 0 if "vevo" in (x.get("channel") or x.get("uploader") or "").lower() else 1)
    return []


def lebt(vid):
    u = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    try:
        urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=15)
        return True
    except urllib.error.HTTPError as e:
        return e.code not in (401, 403, 404)
    except Exception:
        return True  # Netzfehler: nicht als tot werten


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--dry", action="store_true", help="nichts schreiben, nur anzeigen")
    args = ap.parse_args()

    tot = set(json.load(open(DEAD, encoding="utf-8")))
    state = json.load(open(STATE, encoding="utf-8")) if os.path.exists(STATE) else {"ersetzt": {}, "nichts": {}}
    state.setdefault("ersetzt", {})
    if isinstance(state.get("nichts"), list):  # aeltere Form
        state["nichts"] = {y: 0 for y in state["nichts"]}
    state.setdefault("nichts", {})

    dateien = {}
    for path in sorted(glob.glob(os.path.join(ROOT, "*-music", "songs.json"))):
        raw = open(path, encoding="utf-8").read()
        data = json.loads(raw)
        dateien[path] = (data, erkenne_format(raw, data))

    eintraege = {}  # alte ID -> [(datei, genre, eintrag)]
    for path, (data, _) in dateien.items():
        for g, lst in data.items():
            for s in lst:
                if s.get("yt") in tot:
                    eintraege.setdefault(s["yt"], []).append((path, g, s))
    jetzt = time.time()
    offen = [y for y in eintraege if y not in state["ersetzt"] and jetzt - state["nichts"].get(y, 0) > ERNEUT_NACH]
    print(f"Tote Videos: {len(eintraege)} in Katalogen, {len(offen)} offen")

    def genre_ids(path, g):
        return {s.get("yt") for s in dateien[path][0][g]}

    def speichern():
        for path, (data, (kw, nl)) in dateien.items():
            with open(path, "w", encoding="utf-8") as f:
                f.write(json.dumps(data, **kw) + ("\n" if nl else ""))
        with open(STATE, "w", encoding="utf-8") as f:
            json.dump(state, f, ensure_ascii=False, separators=(",", ":"))

    done = ok = 0
    for alt in offen:
        if time.time() - START > BUDGET:
            print("Zeitbudget erreicht, Rest folgt im naechsten Lauf.")
            break
        if args.limit and done >= args.limit:
            break
        liste = eintraege[alt]
        a, t = liste[0][2]["a"], liste[0][2]["t"]
        belegt = set()
        for path, g, _ in liste:
            belegt |= genre_ids(path, g)
        # nie: Cover, Karaoke, Instrumental, Reaktionen, veraenderte Geschwindigkeit -- ausser der Titel des Liedes selbst sagt das
        verboten = re.compile(r"karaoke|\bcover\b|instrumental|reaction|slowed|sped up|nightcore|\b8d\b|tutorial", re.I)
        gute = []
        for rang, v in enumerate(suche(a, t)):
            vid = v.get("id")
            vt = v.get("title") or ""
            if not vid or vid == alt or vid in tot or vid in belegt or not passt(a, t, v):
                continue
            if verboten.search(vt) and not verboten.search(t):
                continue
            lyrics = 1 if re.search(r"lyric", vt, re.I) and not re.search(r"lyric", t, re.I) else 0
            gute.append((lyrics, rang, v))
        neu = None
        for _, _, v in sorted(gute, key=lambda x: (x[0], x[1])):  # ohne Lyrics zuerst, dann Suchreihenfolge (Vevo steht vorn)
            if lebt(v["id"]):
                neu = v
                break
        done += 1
        if neu:
            ok += 1
            state["ersetzt"][alt] = neu["id"]
            print(f"  + {a} - {t}: {alt} -> {neu['id']}  ({neu.get('title')})")
            if not args.dry:
                for path, g, s in liste:
                    s["yt"] = neu["id"]
                    for feld in ("th", "cv"):
                        if s.get(feld) and alt in str(s[feld]):
                            s[feld] = neu.get("thumbnail") or s[feld].replace(alt, neu["id"])
        else:
            state["nichts"][alt] = int(time.time())
            print(f"  - {a} - {t}: kein passendes Video")
        if not args.dry and done % 10 == 0:
            speichern()
        time.sleep(random.uniform(1, 2))
    if not args.dry:
        speichern()
    print(f"Fertig fuer diesen Lauf: {done} gesucht, {ok} ersetzt, {len(offen) - done} noch offen.")


if __name__ == "__main__":
    main()
