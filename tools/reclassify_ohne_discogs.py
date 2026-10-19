#!/usr/bin/env python3
"""Discogs-Zweitlauf fuer 'Ohne': fragt je Song mehrere Discogs-Veroeffentlichungen
ab (Release-Suche und Master-Suche nach Interpret + Titel) und sammelt deren
Stile. Die Stile werden mit der in reclassify_ohne_v2.py aus dem Katalog gelernten
Stil-Zuordnung einer Kategorie zugeordnet; eine Kategorie gewinnt nur, wenn mind.
MIN_TREFFER Veroeffentlichungen sie stuetzen und sie mind. ANTEIL der Stimmen hat.
Sonst bleibt der Song in 'Ohne'.

Zwei getrennte Schritte (Zwischenstand in --cache, damit 'anwenden' nach einem
Push-Konflikt ohne neue Discogs-Abfrage wiederholbar ist):
  suchen    fragt Discogs ab, schreibt Cache + Bericht-CSV, aendert keine songs.json
  anwenden  liest den Cache, verschiebt die Songs in <dekade>-music/songs.json

Aufruf:  DISCOGS_TOKEN=... python3 tools/reclassify_ohne_discogs.py suchen --dekade alle \
             --cache cache.json --bericht bericht.csv
         python3 tools/reclassify_ohne_discogs.py anwenden --dekade alle --cache cache.json
"""
import argparse
import collections
import csv
import json
import os
import re
import sys
import time
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))

import fetch_billboard_hits as fb  # noqa: E402  (api_get mit Token und Retry)
import reclassify_ohne_v2 as v2  # noqa: E402

MIN_INTERVAL = 1.05  # mit Token 60 Anfragen/min
MIN_TREFFER, ANTEIL = 2, 0.60
TIME_BUDGET = int(os.environ.get("OHNE_TIME_BUDGET_SECONDS", "19200"))
START = time.time()
_last = [0.0]


def alnum(s):
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def get(params):
    wait = MIN_INTERVAL - (time.time() - _last[0])
    if wait > 0:
        time.sleep(wait)
    _last[0] = time.time()
    url = "https://api.discogs.com/database/search?" + urllib.parse.urlencode(params)
    return (fb.api_get(url) or {}).get("results", [])


def suche(song):
    """Liefert die Stil-Token-Listen aller Discogs-Treffer, deren Titel den Interpreten enthaelt."""
    artist = re.split(r"\s+(?:feat\.?|ft\.?|featuring)\s+", song.get("a") or "", flags=re.I)[0]
    title = re.sub(r"\s*[\(\[][^\)\]]*[\)\]]", "", song.get("t") or "").strip()
    treffer = []
    for typ in ("release", "master"):
        for r in get({"artist": artist, "track": title, "type": typ, "per_page": "25"}):
            if alnum(artist) and alnum(artist) in alnum(r.get("title", "")):
                toks = [t.lower() for t in (r.get("style") or []) + (r.get("genre") or [])]
                if toks:
                    treffer.append({"id": r.get("id"), "typ": typ, "tok": toks})
    return treffer


def entscheide(treffer, style_map):
    """Stimmen: je Treffer zaehlt jede Kategorie, auf die einer seiner Stile zeigt, einmal."""
    stimmen = collections.Counter()
    for t in treffer:
        for cat in {style_map[x] for x in t["tok"] if x in style_map and x not in v2.GENERIC}:
            stimmen[cat] += 1
    if not stimmen:
        return None
    cat, n = stimmen.most_common(1)[0]
    if n >= MIN_TREFFER and n / sum(stimmen.values()) >= ANTEIL:
        return cat
    return None


def dekaden(arg):
    return v2.DECADES if arg == "alle" else [arg]


def key(dec, song):
    return f"{dec}|{song.get('a')}|{song.get('t')}"


def lade(path):
    if path and os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return {}


def speichere(path, data):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
    os.replace(tmp, path)


def cmd_suchen(args):
    cache = lade(args.cache)
    zeilen, neu = [], 0
    for dec in dekaden(args.dekade):
        with open(f"{dec}-music/songs.json", encoding="utf-8") as f:
            data = json.load(f)
        style_map, _ = v2.learn(data)
        for s in data.get("Ohne", []):
            k = key(dec, s)
            if k not in cache:
                if time.time() - START > TIME_BUDGET:
                    print("Zeitbudget erreicht -- Rest beim naechsten Lauf.")
                    break
                cache[k] = suche(s)
                neu += 1
                if neu % 10 == 0:
                    speichere(args.cache, cache)
                    print(f"  {neu} Songs abgefragt ...", flush=True)
            cat = entscheide(cache[k], style_map)
            zeilen.append([dec, s.get("a"), s.get("t"), len(cache[k]), cat or ""])
    speichere(args.cache, cache)
    if args.bericht:
        with open(args.bericht, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["dekade", "interpret", "titel", "treffer", "neue_kategorie"])
            w.writerows(zeilen)
    ok = sum(1 for z in zeilen if z[4])
    print(f"Bericht: {ok} von {len(zeilen)} 'Ohne'-Songs waeren zuzuordnen ({neu} neu abgefragt).")


def cmd_anwenden(args):
    cache = lade(args.cache)
    gesamt = 0
    for dec in dekaden(args.dekade):
        path = f"{dec}-music/songs.json"
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        style_map, _ = v2.learn(data)
        rest, bewegt = [], collections.Counter()
        for s in data.get("Ohne", []):
            cat = entscheide(cache.get(key(dec, s), []), style_map)
            if cat:
                data.setdefault(cat, []).append(s)
                bewegt[cat] += 1
            else:
                rest.append(s)
        data["Ohne"] = rest
        n = sum(bewegt.values())
        gesamt += n
        print(f"{dec}: {n} verschoben, {len(rest)} bleiben in Ohne")
        for cat, c in bewegt.most_common():
            print(f"    -> {cat}: {c}")
        if n:
            v2_save = path + ".tmp"
            with open(v2_save, "w", encoding="utf-8") as f:
                json.dump(data, f, separators=(",", ":"), ensure_ascii=False)
            os.replace(v2_save, path)
    print(f"GESAMT: {gesamt} verschoben")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("schritt", choices=["suchen", "anwenden"])
    p.add_argument("--dekade", default="alle", choices=["alle"] + v2.DECADES)
    p.add_argument("--cache", required=True)
    p.add_argument("--bericht")
    args = p.parse_args()
    if args.schritt == "suchen" and not os.environ.get("DISCOGS_TOKEN"):
        print("WARNUNG: kein DISCOGS_TOKEN -- unauthentifiziert sehr langsam.")
    (cmd_suchen if args.schritt == "suchen" else cmd_anwenden)(args)


if __name__ == "__main__":
    main()
