#!/usr/bin/env python3
"""Generisches Phase B fuer dekaden-uebergreifende Stimmungs-Playlists
(siehe fetch_mood_playlist_top.py fuer Phase A): loest fuer jeden
Kandidaten in queue/<project>-erweiterung.json per yt-dlp einen YouTube-
Link auf und importiert nach <project>-music/songs.json. Gleiche Logik
wie tools/process_decade_queue.py, nur projektbezogen statt dekaden-
bezogen (kein festes DECADE_CATALOG-Mapping).

Aufruf: python3 process_mood_queue.py <project>
"""
import json
import os
import random
import subprocess
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TIME_BUDGET_SECONDS = int(os.environ.get("MOOD_TIME_BUDGET_SECONDS", "1500"))
SAVE_EVERY = 5
START_TS = time.time()


def load_json(path, default):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return default


def save_json(path, data):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"), ensure_ascii=False)
    os.replace(tmp, path)


def _yt_dlp_search(query, player_client=None):
    cmd = ["yt-dlp", query, "--dump-json", "--skip-download", "--no-warnings"]
    if player_client:
        cmd += ["--extractor-args", f"youtube:player_client={player_client}"]
    try:
        return subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    except Exception as e:
        print(f"  yt-dlp fehlgeschlagen: {e}")
        return None


def search_youtube(artist, title):
    query = f"ytsearch5:{artist} {title}"
    out = _yt_dlp_search(query)
    candidates = []
    if out is not None:
        for line in out.stdout.splitlines():
            try:
                candidates.append(json.loads(line))
            except Exception:
                continue
    if not candidates:
        retry = _yt_dlp_search(query, player_client="android")
        if retry is not None:
            for line in retry.stdout.splitlines():
                try:
                    candidates.append(json.loads(line))
                except Exception:
                    continue
    if not candidates:
        return None
    for c in candidates:
        channel = (c.get("channel") or c.get("uploader") or "").lower()
        if "vevo" in channel:
            return c
    return candidates[0]


def build_song_entry(cand, yt_info):
    yt_id = yt_info.get("id") if yt_info else None
    yt_thumb = yt_info.get("thumbnail") if yt_info else None
    year = cand.get("y")
    try:
        year = int(year) if year else None
    except (TypeError, ValueError):
        pass
    return {
        "a": cand["a"],
        "t": cand["t"],
        "y": year,
        "g": cand.get("g"),
        "s": cand.get("s"),
        "c": cand.get("c"),
        "l": cand.get("l"),
        "th": cand.get("th") or yt_thumb,
        "cv": cand.get("cv") or yt_thumb,
        "u": cand.get("u"),
        "hv": cand.get("hv", 0),
        "yt": yt_id,
    }


def main():
    project = sys.argv[1] if len(sys.argv) > 1 else None
    if not project:
        print("Usage: process_mood_queue.py <project>")
        sys.exit(1)

    queue_path = os.path.join(ROOT, "queue", f"{project}-erweiterung.json")
    catalog_path = os.path.join(ROOT, f"{project}-music", "songs.json")

    queue = load_json(queue_path, [])
    if not queue:
        print("Warteliste leer -- nichts zu tun.")
        return
    catalog = load_json(catalog_path, {})

    processed = 0
    found = 0
    remaining = []
    i = 0
    while i < len(queue):
        if time.time() - START_TS > TIME_BUDGET_SECONDS:
            print(f"Zeitbudget ({TIME_BUDGET_SECONDS}s) erreicht, Rest bleibt fuer den naechsten Lauf stehen.")
            break
        cand = queue[i]
        i += 1
        print(f"[{processed + 1}/{len(queue)}] {cand['a']} - {cand['t']} ({cand.get('y')}) -> {cand.get('genre_key')}")
        yt_info = None
        try:
            yt_info = search_youtube(cand["a"], cand["t"])
        except Exception as e:
            print(f"  Fehler bei yt-dlp: {e}")
        processed += 1
        if not yt_info:
            print("  kein YouTube-Treffer, bleibt in der Warteliste.")
            remaining.append(cand)
        else:
            entry = build_song_entry(cand, yt_info)
            bucket = cand.get("genre_key") or "Ohne"
            catalog.setdefault(bucket, []).append(entry)
            found += 1
            print(f"  -> {bucket} ({entry['yt']})")
        if processed % SAVE_EVERY == 0:
            save_json(catalog_path, catalog)
            save_json(queue_path, remaining + queue[i:])
            print(f"  Zwischenstand gespeichert ({processed} verarbeitet, {found} gefunden).")
        time.sleep(random.uniform(1.0, 2.0))

    remaining.extend(queue[i:])
    save_json(catalog_path, catalog)
    save_json(queue_path, remaining)
    print(f"Fertig fuer diesen Lauf ({project}): {processed} verarbeitet, {found} neue Songs, {len(remaining)} bleiben in der Warteliste.")


if __name__ == "__main__":
    main()
