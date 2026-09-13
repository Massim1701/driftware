#!/usr/bin/env python3
"""Ermittelt die Dekade mit dem geringsten BPM-Fortschritt (Anteil Songs mit
'bpm'-Feld unter allen Songs mit 'yt'-Feld) und gibt 'decade=<key>' auf
stdout aus -- gedacht zum Anhaengen an $GITHUB_OUTPUT.

Ausgelagert aus bpm-fetch.yml (statt eines inline Python-Heredocs in einem
YAML 'run: |'-Block), weil die dortige Einrueckung als fuehrende
Leerzeichen im Python-Code landet und dort zu einem IndentationError
fuehrt -- ein eigenes Skript ist robuster und einfacher zu testen."""

import json
import os

DECADES = ["70er", "80er", "90er", "2000er", "2010er", "2020er"]


def main():
    best_key, best_ratio = None, 2.0
    for d in DECADES:
        path = f"{d}-music/songs.json"
        if not os.path.exists(path):
            continue
        data = json.load(open(path, encoding="utf-8"))
        songs = [s for g in data.values() for s in g if s.get("yt")]
        if not songs:
            continue
        have = sum(1 for s in songs if s.get("bpm"))
        ratio = have / len(songs)
        if ratio < best_ratio:
            best_ratio, best_key = ratio, d
    print(f"decade={best_key}")


if __name__ == "__main__":
    main()
