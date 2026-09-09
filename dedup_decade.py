#!/usr/bin/env python3
"""Einmaliges Bereinigungsskript: entfernt Songs, die (Artist+Titel,
normalisiert) MEHRFACH im selben Dekaden-Katalog stehen -- meist weil
dieselbe Aufnahme unter zwei verschiedenen Discogs-Releases in zwei
verschiedenen Genre-Buckets gelandet ist. Behaelt pro Duplikat-Gruppe
GENAU EINEN Eintrag: bevorzugt einen mit gueltigem YouTube-Link (yt),
bei mehreren Kandidaten den mit dem hoechsten Discogs-"have"-Wert (hv,
Popularitaets-Proxy) als Tie-Breaker.

Aufruf: python3 dedup_decade.py <pfad-zur-songs.json>
Schreibt die Datei nur, wenn tatsaechlich Duplikate gefunden wurden, und
gibt vorher/nachher-Zahlen aus."""
import json
import sys


def song_id(artist, title):
    return (artist or "").strip().lower(), (title or "").strip().lower()


def main():
    if len(sys.argv) != 2:
        print("Usage: dedup_decade.py <songs.json>")
        sys.exit(1)
    path = sys.argv[1]
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    groups = {}
    total_before = 0
    for genre, songs in data.items():
        for s in songs:
            total_before += 1
            key = song_id(s.get("a"), s.get("t"))
            groups.setdefault(key, []).append((genre, s))

    def score(entry):
        genre, s = entry
        has_yt = 1 if s.get("yt") else 0
        return (has_yt, s.get("hv") or 0)

    removed = 0
    new_data = {g: [] for g in data.keys()}
    for key, entries in groups.items():
        if len(entries) == 1:
            genre, s = entries[0]
            new_data[genre].append(s)
            continue
        best = max(entries, key=score)
        best_genre, best_song = best
        new_data[best_genre].append(best_song)
        removed += len(entries) - 1

    total_after = sum(len(v) for v in new_data.values())
    print(f"{path}: {total_before} -> {total_after} Songs ({removed} Duplikate entfernt)")

    if removed:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(new_data, f, separators=(",", ":"), ensure_ascii=False)


if __name__ == "__main__":
    main()
