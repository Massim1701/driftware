#!/usr/bin/env python3
"""Phase B der Dekaden-Genre-Erweiterung (siehe tools/
fetch_decade_genre_candidates.py fuer Phase A): fuer jeden Kandidaten in
queue/<dekade>-erweiterung.json (schon vollstaendige Discogs-Metadaten +
bekanntes Zielgenre aus der Phase-A-Suche) per yt-dlp einen YouTube-Link
suchen, in die passende Genre-Kategorie in <dekade>-music/songs.json
einsortieren und aus der Warteliste entfernen. KEIN Discogs-API-Aufruf
noetig -- laeuft daher auch ohne DISCOGS_TOKEN, genau wie tools/
process_christmas_queue.py, an dem dieses Skript sich orientiert (gleiche
Zeitbudget-/Zwischenspeicher-Logik, damit sich ein Lauf sauber ueber
mehrere manuelle Workflow-Starts verteilen kann).

Aufruf: DECADE_QUEUE_KEY=70er python3 tools/process_decade_queue.py
(oder als erstes Kommandozeilenargument, siehe main())."""
import json
import os
import subprocess
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DECADE_CATALOG = {
    "70er": "70er-music/songs.json",
    "80er": "80er-music/songs.json",
    "90er": "90er-music/songs.json",
    "2000er": "2000er-music/songs.json",
    "2010er": "2010er-music/songs.json",
    "2020er": "2020er-music/songs.json",
}
DECADE_QUEUE = {
    "70er": "queue/70er-erweiterung.json",
    "80er": "queue/80er-erweiterung.json",
    "90er": "queue/90er-erweiterung.json",
    "2000er": "queue/2000er-erweiterung.json",
    "2010er": "queue/2010er-erweiterung.json",
    "2020er": "queue/2020er-erweiterung.json",
}

TIME_BUDGET_SECONDS = int(os.environ.get("DECADE_TIME_BUDGET_SECONDS", "19800"))  # 5.5h
SAVE_EVERY = 25
START_TS = time.time()


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


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
    """Identisch zu tools/process_missing_queue.py::search_youtube und
    tools/process_christmas_queue.py::search_youtube (Android-Client-Retry
    gegen Bot-Erkennung, VEVO-Praeferenz) -- hier dupliziert statt
    importiert, damit dieses Skript eigenstaendig bleibt."""
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
            if not candidates and retry.stderr and retry.stderr.strip():
                print(f"  yt-dlp ohne Treffer, stderr: {retry.stderr.strip()[:300]}")
        elif out is not None and out.stderr and out.stderr.strip():
            print(f"  yt-dlp ohne Treffer, stderr: {out.stderr.strip()[:300]}")

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
        # Discogs liefert bei unauthentifizierten Suchen keine Bilder (th/cv
        # kommen aus Phase A leer) -- Fallback auf das YouTube-Vorschaubild,
        # damit trotzdem jeder Song ein Cover hat (wie bei Christmas).
        "th": cand.get("th") or yt_thumb,
        "cv": cand.get("cv") or yt_thumb,
        "u": cand.get("u"),
        "hv": cand.get("hv", 0),
        "yt": yt_id,
    }


def main():
    decade_key = os.environ.get("DECADE_QUEUE_KEY") or (sys.argv[1] if len(sys.argv) > 1 else None)
    if not decade_key or decade_key not in DECADE_QUEUE:
        print("Bitte Dekade angeben (Env DECADE_QUEUE_KEY oder 1. Argument):", list(DECADE_QUEUE))
        sys.exit(1)

    queue_path = os.path.join(ROOT, DECADE_QUEUE[decade_key])
    catalog_path = os.path.join(ROOT, DECADE_CATALOG[decade_key])

    if not os.path.exists(queue_path):
        print(f"Keine Warteliste ({queue_path}) -- nichts zu tun.")
        return
    queue = load_json(queue_path)
    if not queue:
        print("Warteliste leer -- nichts zu tun.")
        return
    catalog = load_json(catalog_path)

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
            print("  kein YouTube-Treffer, bleibt in der Warteliste fuer den naechsten Lauf.")
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

        time.sleep(0.3)

    remaining.extend(queue[i:])
    save_json(catalog_path, catalog)
    save_json(queue_path, remaining)
    print(f"Fertig fuer diesen Lauf ({decade_key}): {processed} verarbeitet, {found} neue Songs hinzugefuegt, "
          f"{len(remaining)} bleiben in der Warteliste.")


if __name__ == "__main__":
    main()
