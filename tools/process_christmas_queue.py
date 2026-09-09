#!/usr/bin/env python3
"""Verarbeitet queue/christmas-erweiterung.json: fuer jeden Kandidaten (schon
vollstaendige Discogs-Metadaten aus einer style=Holiday-Suche, siehe
Erstbefuellung durch Claude/Massimo) per yt-dlp einen YouTube-Link suchen, in
die passende Genre-Kategorie in christmas-music/songs.json einsortieren und
aus der Warteliste entfernen. KEIN Discogs-API-Aufruf noetig (Metadaten liegen
schon vor) -- laeuft daher auch ohne DISCOGS_TOKEN. Fehlende Cover/Thumbnails
(Discogs liefert bei unauthentifizierten Suchen keine Bilder) werden durch
das YouTube-Vorschaubild ersetzt, siehe build_song_entry().

Zeitbudget + Zwischenspeicherung wie tools/process_missing_queue.py, damit
sich ein Lauf sauber ueber mehrere manuelle Workflow-Starts verteilen kann,
falls die Warteliste nicht in einem Durchlauf fertig wird."""
import json
import os
import subprocess
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUEUE_PATH = os.path.join(ROOT, "queue", "christmas-erweiterung.json")
CATALOG_PATH = os.path.join(ROOT, "christmas-music", "songs.json")

TIME_BUDGET_SECONDS = int(os.environ.get("CHRISTMAS_TIME_BUDGET_SECONDS", "19800"))  # 5.5h, wie process_missing_queue.py
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
    """Identische Strategie wie tools/process_missing_queue.py::search_youtube
    (Android-Client-Retry gegen die Bot-Erkennung von GitHub-Actions-Runner-IPs,
    VEVO-Praeferenz) -- hier dupliziert statt importiert, damit dieses Skript
    eigenstaendig bleibt. Gibt (anders als dort) das volle yt-dlp-Info-Dict
    zurueck statt nur der ID, weil wir zusaetzlich das Vorschaubild brauchen
    (siehe build_song_entry)."""
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


# Gleiche Bucket-Aufteilung wie bei der Erstbefuellung von christmas-music/
# songs.json (siehe Commit "Reload-Bug 'Dekade verbinden' gefixt, ... Christmas-
# Genres") -- Reihenfolge = Prioritaet, erster Treffer gewinnt, "Classics" ist
# der Auffang-Bucket fuer alles, was zu keiner der spezifischeren Kategorien
# passt (Vocal/Ballad/Easy-Listening/Folk/Country/Schlager/Chanson/Soundtrack).
CLASSIFY_RULES = [
    ("Novelty", ["novelty", "comedy", "parody", "spoken word", "experimental"]),
    ("DiscoHouse", ["disco", "house", "synth-pop", "europop", "euro house"]),
    ("SoulFunk", ["soul", "rhythm & blues", "contemporary r&b", "funk"]),
    ("RockPop", ["pop rock", "rock & roll", "indie rock", "alternative rock", "garage rock",
                 "punk", "hard rock", "new wave", "power pop", "glam", "rockabilly", "surf",
                 "folk rock", "blues rock", "soft rock"]),
]


def classify(style):
    sw = (style or "").lower()
    for bucket, keywords in CLASSIFY_RULES:
        if any(k in sw for k in keywords):
            return bucket
    return "Classics"


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
        # kommen aus der Erstbefuellung leer) -- Fallback auf das YouTube-
        # Vorschaubild, damit trotzdem jeder Song ein Cover hat.
        "th": cand.get("th") or yt_thumb,
        "cv": cand.get("cv") or yt_thumb,
        "u": cand.get("u"),
        "hv": cand.get("hv", 0),
        "yt": yt_id,
    }


def main():
    if not os.path.exists(QUEUE_PATH):
        print("Keine Warteliste (queue/christmas-erweiterung.json) -- nichts zu tun.")
        return
    queue = load_json(QUEUE_PATH)
    if not queue:
        print("Warteliste leer -- nichts zu tun.")
        return
    catalog = load_json(CATALOG_PATH)

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
        print(f"[{processed + 1}/{len(queue)}] {cand['a']} - {cand['t']} ({cand.get('y')})")

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
            bucket = classify(cand.get("s"))
            catalog.setdefault(bucket, []).append(entry)
            found += 1
            print(f"  -> {bucket} ({entry['yt']})")

        if processed % SAVE_EVERY == 0:
            save_json(CATALOG_PATH, catalog)
            save_json(QUEUE_PATH, remaining + queue[i:])
            print(f"  Zwischenstand gespeichert ({processed} verarbeitet, {found} gefunden).")

        time.sleep(0.3)  # kleine Pause, kein Grund YouTube zu stressen

    remaining.extend(queue[i:])
    save_json(CATALOG_PATH, catalog)
    save_json(QUEUE_PATH, remaining)
    print(f"Fertig fuer diesen Lauf: {processed} verarbeitet, {found} neue Songs hinzugefuegt, "
          f"{len(remaining)} bleiben in der Warteliste.")


if __name__ == "__main__":
    main()
