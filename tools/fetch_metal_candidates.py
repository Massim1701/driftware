#!/usr/bin/env python3
"""Phase A fuer die Metall-Erweiterung: holt je Dekade die beliebtesten Metal-Veroeffentlichungen
aus Discogs (nach 'have' sortiert), dedupliziert gegen den Katalog der Dekade und schreibt
queue/<dekade>-metal.json. Je Dekade gibt es ein Gesamtkontingent (QUOTA), das nach
Stil-Gewichten (WEIGHT) verteilt wird, damit nicht nur Heavy Metal hereinkommt.

  DISCOGS_TOKEN=... python3 tools/fetch_metal_candidates.py [Dekade ...]    (ohne Angabe: alle)

Phase B (YouTube-Link suchen und in den Katalog einsortieren): tools/process_metal_local.py.
Die Songs landen in der naechstpassenden bestehenden Kategorie der Dekade (GENRE_KEY); die
Metall-Playlist (tools/build_metal.py) sortiert sie danach nach Discogs-Stil in ihre
Unterkategorien.
"""
import json
import os
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import fetch_billboard_hits as fb  # noqa: E402  (api_get mit Token und Retry)
import fetch_decade_genre_candidates as fd  # noqa: E402

fd.api_get = fb.api_get  # Suche mit Token (60 Anfragen/min)

QUOTA = {"70er": 60, "80er": 480, "90er": 700, "2000er": 750, "2010er": 600, "2020er": 410}
GENRE_KEY = {"70er": "HardRockMetal", "80er": "HardRockMetal", "90er": "HeavyMetal",
             "2000er": "NuMetalHardcore", "2010er": "MetalcoreNuMetalHardcore", "2020er": "MetalcoreHardcore"}
WEIGHT = {
    "Heavy Metal": .22, "Thrash": .12, "Death Metal": .12, "Black Metal": .10, "Doom Metal": .07,
    "Power Metal": .07, "Speed Metal": .04, "Symphonic Metal": .04, "Folk Metal": .03,
    "Gothic Metal": .04, "Progressive Metal": .04, "Alternative Metal": .03, "Nu Metal": .05,
    "Grindcore": .03, "Sludge Metal": .02, "Stoner Rock": .03, "Groove Metal": .02,
}
NUR_AB = {"Nu Metal": 1990}  # Stil gibt es vorher nicht
MIN_HAVE = 20

# Modus 'dark' (METAL_MODUS=dark): nur Dark & Industrial aufstocken. Eigene Stil-Gewichte und Kontingente;
# Industrial zaehlt nur zusammen mit einem Metal-Stil (ist_metal), kein EBM/Techno.
DARK_WEIGHT = {"Gothic Metal": .7, "Industrial": .3}
DARK_QUOTA = {"70er": 0, "80er": 0, "90er": 70, "2000er": 100, "2010er": 80, "2020er": 60}


def ist_metal(r, style):
    stile = [s.lower() for s in (r.get("style") or [])]
    genres = [g.lower() for g in (r.get("genre") or [])]
    if style == "Stoner Rock":  # kann auch Psychedelia sein
        return "rock" in genres or "metal" in genres
    return any("metal" in s or s in ("thrash", "grindcore") for s in stile) or "metal" in genres


def sammeln(style, years):
    pool = {}
    for year in years:
        data = fd.search_style_year(style, year, page=1, per_page=100)
        time.sleep(1.05)
        for r in (data or {}).get("results", []):
            have = (r.get("community") or {}).get("have", 0)
            if have < MIN_HAVE or not r.get("id") or not ist_metal(r, style):
                continue
            t = r.get("title") or ""
            a, ti = (t.split(" - ", 1) + [""])[:2] if " - " in t else ("", t)
            pool[r["id"]] = {
                "id": r["id"], "a": a.strip(), "t": ti.strip(), "y": r.get("year"),
                "g": ", ".join(r.get("genre") or []), "s": ", ".join(r.get("style") or []),
                "c": r.get("country"), "l": ", ".join(r.get("label") or []),
                "th": r.get("thumb") or None, "cv": r.get("cover_image") or None,
                "u": "https://www.discogs.com" + r.get("uri", ""), "hv": have, "src": "metal",
            }
    return sorted(pool.values(), key=lambda c: -c["hv"])


def dekade(dec):
    ids, tkeys = fd.existing_release_ids(dec)
    ohne = os.path.join(ROOT, "queue", "metal-ohne-treffer.json")  # von process_metal_ci.py: ohne YouTube-Treffer
    if os.path.exists(ohne):
        ids = set(ids) | set(json.load(open(ohne, encoding="utf-8")))
    dark = os.environ.get("METAL_MODUS") == "dark"
    quota = DARK_QUOTA if dark else QUOTA
    if quota[dec] == 0:
        return
    stile = {s: w for s, w in (DARK_WEIGHT if dark else WEIGHT).items() if min(fd.DECADE_YEARS[dec]) + 9 >= NUR_AB.get(s, 0)}
    summe = sum(stile.values())
    pools = {}
    for style in stile:
        pools[style] = sammeln(style, fd.DECADE_YEARS[dec])
        print(f"  {dec} {style}: {len(pools[style])} Kandidaten", flush=True)
    gewaehlt, gesehen_ids, gesehen_keys = [], set(ids), set(tkeys)
    for style in sorted(pools, key=lambda s: len(pools[s])):  # kleine Pools zuerst
        ziel = round(quota[dec] * stile[style] / summe)
        n = 0
        for c in pools[style]:
            k = fd.song_id(c["a"], c["t"])
            if c["id"] in gesehen_ids or k in gesehen_keys:
                continue
            gesehen_ids.add(c["id"]); gesehen_keys.add(k)
            c["genre_key"] = GENRE_KEY[dec]
            gewaehlt.append(c)
            n += 1
            if n >= ziel:
                break
        print(f"  {dec} {style}: {n} von Ziel {ziel} gewaehlt", flush=True)
    pfad = os.path.join(ROOT, "queue", f"{dec}-metal.json")
    with open(pfad, "w", encoding="utf-8") as f:
        json.dump(gewaehlt, f, separators=(",", ":"), ensure_ascii=False)
    print(f"{dec}: {len(gewaehlt)} Kandidaten -> {pfad}", flush=True)


if __name__ == "__main__":
    for d in (sys.argv[1:] or list(QUOTA)):
        dekade(d)
