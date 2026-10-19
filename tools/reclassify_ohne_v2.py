#!/usr/bin/env python3
"""Zweiter Durchgang fuer 'Ohne': ordnet Songs anhand der Daten zu, die schon
im Katalog stehen (kein Raten, keine neue Abfrage noetig -- die Discogs-Felder
'g'/'s' sind bei allen 'Ohne'-Songs bereits gefuellt).

Regeln je Dekade (Kategorie 'Karaoke' zaehlt nie als Lernquelle):
  1. Stil: Ein Discogs-Stil-Token wird einer Kategorie zugeordnet, wenn er in
     den bereits einsortierten Songs der Dekade mind. MIN_STYLE-mal vorkommt
     und mind. SHARE_STYLE davon in derselben Kategorie liegen.
  2. Interpret: Hat derselbe Interpret in der Dekade mind. MIN_ARTIST
     einsortierte Songs und mind. SHARE_ARTIST davon in einer Kategorie,
     kommt der Song dorthin.
Songs ohne eindeutige Zuordnung bleiben in 'Ohne'. Es wird nur verschoben.

Aufruf:  python3 tools/reclassify_ohne_v2.py           (Probelauf, schreibt nichts)
         python3 tools/reclassify_ohne_v2.py --apply   (schreibt die songs.json)
"""
import collections
import json
import os
import re
import sys

DECADES = ["70er", "80er", "90er", "2000er", "2010er", "2020er"]
SKIP = {"Ohne", "Karaoke"}
MIN_STYLE, SHARE_STYLE = 10, 0.70
MIN_ARTIST, SHARE_ARTIST = 2, 0.80
# zu allgemein, um daraus eine Kategorie abzuleiten
GENERIC = {"vocal", "acoustic", "theme", "soundtrack", "holiday", "novelty", "score", "spoken word"}


def tokens(song):
    out = []
    for field in ("s", "g"):
        out += [t.strip().lower() for t in (song.get(field) or "").split(",") if t.strip()]
    return out


def artist_key(song):
    a = (song.get("a") or "").lower()
    a = re.split(r"\s+(?:feat\.?|ft\.?|featuring|&|and|x|vs\.?)\s+", a)[0]
    return re.sub(r"[^a-z0-9]", "", re.sub(r"^the\s+", "", a))


def majority(counter, min_n, share):
    total = sum(counter.values())
    if total < min_n:
        return None
    cat, n = counter.most_common(1)[0]
    return cat if n / total >= share else None


def learn(data):
    style = collections.defaultdict(collections.Counter)
    artist = collections.defaultdict(collections.Counter)
    for cat, songs in data.items():
        if cat in SKIP or not isinstance(songs, list):
            continue
        for s in songs:
            for tok in set(tokens(s)):
                if tok not in GENERIC:
                    style[tok][cat] += 1
            artist[artist_key(s)][cat] += 1
    style_map = {t: c for t, cnt in style.items() if (c := majority(cnt, MIN_STYLE, SHARE_STYLE))}
    artist_map = {a: c for a, cnt in artist.items() if a and (c := majority(cnt, MIN_ARTIST, SHARE_ARTIST))}
    return style_map, artist_map


def classify(song, style_map, artist_map):
    for tok in tokens(song):
        if tok in style_map:
            return style_map[tok], "stil:" + tok
    c = artist_map.get(artist_key(song))
    return (c, "interpret") if c else (None, None)


def main():
    apply = "--apply" in sys.argv
    grand = 0
    for dec in DECADES:
        path = f"{dec}-music/songs.json"
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        style_map, artist_map = learn(data)
        rest, moved = [], collections.Counter()
        why = collections.Counter()
        for s in data.get("Ohne", []):
            cat, reason = classify(s, style_map, artist_map)
            if cat:
                data.setdefault(cat, []).append(s)
                moved[cat] += 1
                why[reason.split(":")[0]] += 1
            else:
                rest.append(s)
        n_before = len(rest) + sum(moved.values())
        data["Ohne"] = rest
        grand += sum(moved.values())
        print(f"{dec}: {sum(moved.values())} von {n_before} verschoben "
              f"({dict(why)}), {len(rest)} bleiben")
        for cat, n in moved.most_common():
            print(f"    -> {cat}: {n}")
        if apply and moved:
            tmp = path + ".tmp"
            with open(tmp, "w", encoding="utf-8") as f:
                json.dump(data, f, separators=(",", ":"), ensure_ascii=False)
            os.replace(tmp, path)
    print(f"\nGESAMT: {grand} verschoben" + ("" if apply else "  (Probelauf, nichts geschrieben)"))


if __name__ == "__main__":
    main()
