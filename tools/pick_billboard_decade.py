#!/usr/bin/env python3
"""Ermittelt die Dekade mit der GROESSTEN verbleibenden Billboard-Luecke
(meiste Hot-100-Songs, die weder im Katalog noch schon in der Warteliste
stehen) und gibt 'decade=<key>' auf stdout aus (fuer $GITHUB_OUTPUT).
Gleiches Muster wie tools/pick_bpm_decade.py -- eigenes Skript statt
YAML-Heredoc, wegen Einrueckungsproblemen dort.

Rechnet bei jedem Aufruf frisch (kein gespeicherter Fortschritts-Zustand
noetig): sobald eine Dekade abgearbeitet ist, sinkt ihre Luecke automatisch
unter die der anderen, der naechste Tag wechselt dann von selbst zur
naechsten Dekade -- kein Round-Robin-Zaehler noetig."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__))))
import fetch_billboard_hits as fb


def main():
    billboard_all = fb.load_billboard_all()
    best_key, best_count = None, -1
    for decade_key in fb.DECADE_YEARS:
        hits = fb.collect_decade_hits(billboard_all, decade_key, 100)
        catalog_index = fb.build_catalog_index(decade_key)
        queue_path = os.path.join(fb.ROOT, fb.DECADE_QUEUE[decade_key])
        queue_index = {}
        if os.path.exists(queue_path):
            import json
            with open(queue_path, "r", encoding="utf-8") as f:
                existing_queue = json.load(f)
            for c in existing_queue:
                queue_index.setdefault(fb.artist_key(c.get("a")), set()).update(fb.title_variants(c.get("t")))
        missing = sum(
            1 for hit in hits.values()
            if not fb.is_in_catalog(catalog_index, hit["a"], hit["t"])
            and not fb.is_in_catalog(queue_index, hit["a"], hit["t"])
        )
        print(f"{decade_key}: {missing} fehlen noch", file=sys.stderr)
        if missing > best_count:
            best_count, best_key = missing, decade_key
    print(f"decade={best_key}")


if __name__ == "__main__":
    main()
