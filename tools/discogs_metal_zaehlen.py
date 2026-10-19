#!/usr/bin/env python3
"""Zaehlt bei Discogs, wie viele Metal-Master-Releases es je Stil und Dekade gibt,
und stellt sie unseren Songs gegenueber (nur Lesen, aendert keine Daten).

  DISCOGS_TOKEN=... python3 tools/discogs_metal_zaehlen.py > bericht.md
"""
import json
import os
import sys
import time
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import fetch_billboard_hits as fb  # noqa: E402

STILE = ["Heavy Metal", "Thrash", "Speed Metal", "Death Metal", "Black Metal", "Doom Metal",
         "Power Metal", "Symphonic Metal", "Folk Metal", "Gothic Metal", "Industrial",
         "Progressive Metal", "Alternative Metal", "Nu-metal", "Metalcore", "Grindcore",
         "Sludge Metal", "Stoner Rock", "Groove Metal", "Hard Rock"]
DEKADEN = [("70er", 1970), ("80er", 1980), ("90er", 1990), ("2000er", 2000), ("2010er", 2010), ("2020er", 2020)]


def anzahl(stil, jahr):
    time.sleep(1.05)
    p = {"type": "master", "style": stil, "year": jahr, "per_page": 1}
    r = fb.api_get("https://api.discogs.com/database/search?" + urllib.parse.urlencode(p))
    return ((r or {}).get("pagination") or {}).get("items", 0)


def unsere(dek, stil):
    n = 0
    with open(os.path.join(ROOT, f"{dek}-music", "songs.json"), encoding="utf-8") as f:
        data = json.load(f)
    for cat, songs in data.items():
        if cat == "Karaoke" or not isinstance(songs, list):
            continue
        n += sum(1 for s in songs if stil.lower() in [t.strip().lower() for t in (s.get("s") or "").split(",")])
    return n


print("| Stil | " + " | ".join(f"{d} Discogs / bei uns" for d, _ in DEKADEN) + " |")
print("|---|" + "---|" * len(DEKADEN))
for stil in STILE:
    zellen = []
    for dek, start in DEKADEN:
        ende = 2026 if start == 2020 else start + 9
        zellen.append(f"{sum(anzahl(stil, j) for j in range(start, ende + 1))} / {unsere(dek, stil)}")
        sys.stdout.flush()
    print(f"| {stil} | " + " | ".join(zellen) + " |")
    sys.stdout.flush()
