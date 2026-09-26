#!/usr/bin/env python3
"""Ermittelt die Dekade mit der GROESSTEN verbleibenden UK-Charts-Luecke --
gleiches Muster wie tools/pick_billboard_decade.py, aber bewusst NUR auf
80er/90er beschraenkt (Nutzerwunsch 26.9.: "das selbe machen wir mit den
UK Charts der 80er 90er", nicht alle Dekaden). Gibt 'decade=<key>' auf
stdout aus (fuer $GITHUB_OUTPUT)."""
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__))))
import fetch_uk_chart_hits as uk

DECADES = ["80er", "90er"]


def main():
    workbook = uk.load_uk_chart_workbook()
    best_key, best_count = None, -1
    for decade_key in DECADES:
        hits = uk.collect_decade_hits(workbook, decade_key, 50)
        catalog_index = uk.build_catalog_index(decade_key)
        queue_path = os.path.join(uk.ROOT, uk.DECADE_QUEUE[decade_key])
        queue_index = {}
        if os.path.exists(queue_path):
            with open(queue_path, "r", encoding="utf-8") as f:
                existing_queue = json.load(f)
            for c in existing_queue:
                queue_index.setdefault(uk.artist_key(c.get("a")), set()).update(uk.title_variants(c.get("t")))
        missing = sum(
            1 for hit in hits.values()
            if not uk.is_in_catalog(catalog_index, hit["a"], hit["t"])
            and not uk.is_in_catalog(queue_index, hit["a"], hit["t"])
        )
        print(f"{decade_key}: {missing} fehlen noch", file=sys.stderr)
        if missing > best_count:
            best_count, best_key = missing, decade_key
    print(f"decade={best_key}")


if __name__ == "__main__":
    main()
