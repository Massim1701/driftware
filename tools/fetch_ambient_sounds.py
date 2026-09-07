"""
fetch_ambient_sounds.py

Holt kostenfreie (CC0 = gemeinfrei, keine Attribution noetig) Ambient-Loops
von der Freesound-API und speichert sie unter assets/ambient/<kategorie>/.

Braucht einen Freesound-API-Key (kostenloser Account -> App registrieren
unter https://freesound.org/apiv2/apply/), als Umgebungsvariable
FREESOUND_API_KEY.

Nutzung:
    FREESOUND_API_KEY=xxx python3 tools/fetch_ambient_sounds.py ambient
    FREESOUND_API_KEY=xxx python3 tools/fetch_ambient_sounds.py "christmas bells"

Laedt NUR Sounds mit Lizenz "Creative Commons 0" (CC0) -- keine Attribution
noetig, unproblematisch fuer eine oeffentliche Seite. LQ-Preview-Dateien
(~128kbps mp3, reicht fuer Hintergrund-Atmo) statt Original-Dateien, damit
kein OAuth2-Login noetig ist (nur einfacher API-Key) und der Download
schnell bleibt.

Begrenzung (Absprache: 100 reichen, "alle" waeren bei manchen Suchbegriffen
20.000+ Treffer): pro Kategorie werden nur die LIMIT beliebtesten Treffer
(sortiert nach Downloads) geholt, mit Mindestlaenge MIN_DURATION Sekunden,
damit wirklich Atmo-Loops statt kurzer Einzel-Effekte dabei sind.

Downloads laufen parallel (WORKERS gleichzeitige Verbindungen) -- die
Verbindung zum Freesound-CDN ist pro Verbindung eher langsam (~12s fuer
1MB seriell gemessen), mit 10 parallelen Downloads ca. 5x schneller.

Idempotent: bereits heruntergeladene Sounds (per Freesound-ID im Dateinamen)
werden uebersprungen, ein erneuter Lauf holt nur Neues nach (bis LIMIT
insgesamt erreicht ist).
"""

import json
import os
import re
import sys
import threading
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

API_KEY = os.environ.get("FREESOUND_API_KEY", "").strip()
SEARCH_URL = "https://freesound.org/apiv2/search/text/"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS_ROOT = os.path.join(ROOT, "assets", "ambient")

FIELDS = "id,name,previews,duration,username,license,tags,url"
PAGE_SIZE = 100
LIMIT = 100          # Absprache: 100 Treffer pro Kategorie reichen
MIN_DURATION = 15    # Sekunden -- filtert kurze Einzel-Effekte raus
SORT = "downloads_desc"  # beliebteste zuerst, verlaesslicher als Rating (viele CC0-Sounds haben 0 Ratings)
WORKERS = 10

manifest_lock = threading.Lock()


def slugify(name):
    name = re.sub(r"[^A-Za-z0-9\-_. ]", "", name).strip()
    name = re.sub(r"\s+", "-", name)
    return name[:80] or "sound"


def api_get(url, params):
    qs = urllib.parse.urlencode(params)
    full_url = f"{url}?{qs}"
    req = urllib.request.Request(full_url, headers={"Authorization": f"Token {API_KEY}"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def download_file(url, dest_path):
    req = urllib.request.Request(url, headers={"Authorization": f"Token {API_KEY}"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = resp.read()
    with open(dest_path, "wb") as f:
        f.write(data)


def fetch_one(sound, category_dir):
    sid = sound["id"]
    previews = sound.get("previews") or {}
    preview_url = previews.get("preview-lq-mp3") or previews.get("preview-hq-mp3")
    if not preview_url:
        return None
    filename = f"{sid}_{slugify(sound.get('name', 'sound'))}.mp3"
    dest_path = os.path.join(category_dir, filename)
    try:
        download_file(preview_url, dest_path)
    except Exception as e:
        print(f"  Download fehlgeschlagen ({sid}): {e}")
        return None
    return {
        "id": sid,
        "file": filename,
        "name": sound.get("name"),
        "username": sound.get("username"),
        "license": sound.get("license"),
        "duration": sound.get("duration"),
        "tags": sound.get("tags"),
        "freesound_url": sound.get("url"),
    }


def main():
    if not API_KEY:
        print("FEHLER: FREESOUND_API_KEY nicht gesetzt.")
        sys.exit(1)

    query = sys.argv[1] if len(sys.argv) > 1 else "ambient"
    category_dir = os.path.join(ASSETS_ROOT, slugify(query))
    os.makedirs(category_dir, exist_ok=True)
    manifest_path = os.path.join(category_dir, "manifest.json")
    manifest = []
    if os.path.exists(manifest_path):
        with open(manifest_path, encoding="utf-8") as f:
            manifest = json.load(f)
    known_ids = {entry["id"] for entry in manifest}

    if len(known_ids) >= LIMIT:
        print(f'"{query}": schon {len(known_ids)}/{LIMIT} vorhanden, nichts zu tun.')
        return

    print(f'Suche "{query}", Lizenz CC0, min. {MIN_DURATION}s, Top {LIMIT} nach Downloads, {WORKERS} parallel ...')

    # Erst alle Kandidaten sammeln (paginiert), dann parallel downloaden.
    candidates = []
    page = 1
    while len(candidates) + len(known_ids) < LIMIT:
        params = {
            "query": query,
            "filter": f'license:"Creative Commons 0" duration:[{MIN_DURATION} TO *]',
            "fields": FIELDS,
            "sort": SORT,
            "page": page,
            "page_size": PAGE_SIZE,
        }
        try:
            result = api_get(SEARCH_URL, params)
        except urllib.error.HTTPError as e:
            print(f"  API-Fehler Seite {page}: {e.code} {e.reason}")
            break
        results = result.get("results", [])
        if not results:
            break
        for sound in results:
            if sound["id"] not in known_ids:
                candidates.append(sound)
        if not result.get("next"):
            break
        page += 1

    need = LIMIT - len(known_ids)
    candidates = candidates[:need]
    print(f"  {len(candidates)} neue Kandidaten, lade parallel herunter ...")

    total_downloaded = 0
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = {pool.submit(fetch_one, sound, category_dir): sound for sound in candidates}
        for future in as_completed(futures):
            entry = future.result()
            if not entry:
                continue
            with manifest_lock:
                manifest.append(entry)
                known_ids.add(entry["id"])
                with open(manifest_path, "w", encoding="utf-8") as f:
                    json.dump(manifest, f, indent=2, ensure_ascii=False)
                total_downloaded += 1
                print(f"  + [{len(known_ids)}/{LIMIT}] {entry['file']}")

    print(f"Fertig: {total_downloaded} neu heruntergeladen, {len(known_ids)}/{LIMIT} insgesamt in {category_dir}")


if __name__ == "__main__":
    main()
