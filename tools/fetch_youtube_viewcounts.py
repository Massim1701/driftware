#!/usr/bin/env python3
"""Ruft ueber die offizielle YouTube-Data-API (videos.list, part=statistics)
die echten weltweiten Aufrufzahlen fuer alle Songs mit hinterlegter
YouTube-Video-ID ab und speichert sie als 'vc' (viewCount, int) + 'vc_ts'
(Unix-Timestamp des letzten Abrufs) direkt im jeweiligen Song-Objekt in
<decade>-music/songs.json.

Hintergrund (Nutzerfrage 20.9.: "nicht nach Sammlerzahl, nach Beliebtheit...
die die meist gespielt werden, weltweit, gibt es da zahlen zu?"): bisher
diente Discogs' 'hv' (Sammler-Anzahl, wie viele Leute die Platte im Bestand
haben) als Naeherung fuer Beliebtheit -- das ist aber ein Vinyl-Sammler-Proxy,
keine echte Wiedergabezahl. Da praktisch jeder Song schon eine YouTube-ID
(Feld 'yt') hat, holen wir stattdessen die tatsaechliche YouTube-Aufrufzahl.

Kosten/Quota: videos.list mit part=statistics kostet nur 1 Unit PRO ANFRAGE,
unabhaengig davon, wie viele IDs (bis zu 50) in einer Anfrage stecken -- ganz
anders als die teure search.list (100 Units/Anfrage), die process_christmas_
queue.py fuer die YouTube-Suche benutzt. Bei ~51.000 Songs total sind das
gebatcht in 50er-Gruppen ca. 1.030 Anfragen = ca. 1.030 Units -- weit unter
dem taeglichen 10.000-Unit-Standardkontingent, auch zusammen mit den anderen
taeglichen Workflows, die denselben YOUTUBE_API_KEY (Repo-Secret, bereits
vorhanden/genutzt in expand-christmas-songs.yml) verwenden.

Priorisierung pro Lauf (Zeitbudget-gesteuert, wie process_decade_queue.py):
zuerst Songs ganz ohne 'vc' (noch nie abgerufen), danach die mit dem
aeltesten 'vc_ts' zuerst (Auffrischung) -- so bekommt bei einem
Erstlauf ueber alle 6 Dekaden jeder Song schnell einen Anfangswert, und
danach werden die Zahlen reihum aktuell gehalten, ohne bei jedem Lauf
den kompletten Katalog neu abzufragen."""

import json
import os
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DECADE_CATALOG = {
    "70er": "70er-music/songs.json",
    "80er": "80er-music/songs.json",
    "90er": "90er-music/songs.json",
    "2000er": "2000er-music/songs.json",
    "2010er": "2010er-music/songs.json",
    "2020er": "2020er-music/songs.json",
}

YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY", "").strip() or None
YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"
BATCH_SIZE = 50
TIME_BUDGET_SECONDS = int(os.environ.get("VIEWCOUNT_TIME_BUDGET_SECONDS", "1500"))


def load_decade(decade_key):
    path = os.path.join(ROOT, DECADE_CATALOG[decade_key])
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_decade(decade_key, data):
    path = os.path.join(ROOT, DECADE_CATALOG[decade_key])
    tmp_fd, tmp_path = tempfile.mkstemp(dir=os.path.dirname(path), suffix=".tmp")
    try:
        with os.fdopen(tmp_fd, "w", encoding="utf-8") as f:
            json.dump(data, f, separators=(",", ":"), ensure_ascii=False)
        os.replace(tmp_path, path)
    except Exception:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
        raise


def flatten_with_refs(data):
    """Liefert eine flache Liste aller Song-Dicts (als direkte Referenzen ins
    verschachtelte data-Dict, damit In-Place-Aenderungen an den Song-Objekten
    beim Speichern automatisch mit rausgeschrieben werden)."""
    out = []
    for genre_key, songs in data.items():
        for s in songs:
            out.append(s)
    return out


def pick_batch(songs, limit):
    """Waehlt bis zu `limit` Songs mit 'yt'-ID aus: zuerst ohne 'vc' (noch nie
    abgerufen), dann nach aeltestem 'vc_ts' -- siehe Docstring oben."""
    never_fetched = [s for s in songs if s.get("yt") and "vc" not in s]
    stale = [s for s in songs if s.get("yt") and "vc" in s]
    stale.sort(key=lambda s: s.get("vc_ts") or 0)
    ordered = never_fetched + stale
    return ordered[:limit]


def fetch_statistics(video_ids):
    """Ein videos.list-Call fuer bis zu 50 IDs, 1 Unit Kosten. Gibt
    {video_id: viewCount(int)} zurueck, fehlende IDs (geloescht/privat)
    tauchen im Ergebnis-Dict einfach nicht auf."""
    params = {
        "part": "statistics",
        "id": ",".join(video_ids),
        "key": YOUTUBE_API_KEY,
    }
    url = YOUTUBE_VIDEOS_URL + "?" + urllib.parse.urlencode(params)
    try:
        with urllib.request.urlopen(url, timeout=20) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read()[:300]
        print(f"  HTTP-Fehler {e.code} bei videos.list: {body}")
        return {}
    except Exception as e:
        print(f"  Fehler bei videos.list: {e}")
        return {}

    result = {}
    for item in data.get("items", []):
        vid = item.get("id")
        stats = item.get("statistics", {})
        vc = stats.get("viewCount")
        if vid and vc is not None:
            try:
                result[vid] = int(vc)
            except (TypeError, ValueError):
                pass
    return result


def process_decade(decade_key, deadline):
    data = load_decade(decade_key)
    all_songs = flatten_with_refs(data)
    with_yt = [s for s in all_songs if s.get("yt")]
    if not with_yt:
        print(f"{decade_key}: keine Songs mit YouTube-ID.")
        return False

    now_ts = int(time.time())
    updated = 0
    misses = 0
    changed = False

    while True:
        if time.time() >= deadline:
            print(f"{decade_key}: Zeitbudget erreicht, Rest folgt im naechsten Lauf.")
            break

        batch = pick_batch(with_yt, BATCH_SIZE)
        if not batch:
            print(f"{decade_key}: alle Songs mit YouTube-ID haben eine aktuelle Aufrufzahl.")
            break

        by_id = {}
        for s in batch:
            by_id.setdefault(s["yt"], []).append(s)

        stats = fetch_statistics(list(by_id.keys()))
        for vid, songs_for_id in by_id.items():
            vc = stats.get(vid)
            for s in songs_for_id:
                if vc is not None:
                    s["vc"] = vc
                    updated += 1
                else:
                    # Video nicht (mehr) abrufbar (geloescht/privat) -- vc_ts
                    # trotzdem setzen, damit es nicht bei jedem Lauf erneut
                    # ganz oben in der Prioritaet landet.
                    misses += 1
                s["vc_ts"] = now_ts
                changed = True

        print(f"  [{decade_key}] Batch: {len(by_id)} IDs abgefragt, {updated} Songs aktualisiert bisher, {misses} ohne Treffer.")
        time.sleep(0.3)

    if changed:
        save_decade(decade_key, data)
        print(f"{decade_key}: gespeichert ({updated} aktualisiert, {misses} ohne Treffer).")
    return changed


def main():
    if not YOUTUBE_API_KEY:
        print("Kein YOUTUBE_API_KEY gesetzt -- ueberspringe (siehe Repo-Secret).")
        sys.exit(0)

    start = time.time()
    deadline = start + TIME_BUDGET_SECONDS

    any_changed = False
    for decade_key in DECADE_CATALOG:
        if time.time() >= deadline:
            print("Gesamt-Zeitbudget erreicht, weitere Dekaden folgen im naechsten Lauf.")
            break
        # Zeitbudget grob auf die verbleibenden Dekaden aufteilen, damit ein
        # einzelner riesiger Katalog (z.B. 2020er) nicht das ganze Budget
        # fuer sich beansprucht und die anderen Dekaden nie drankommen.
        remaining_decades = list(DECADE_CATALOG.keys())
        idx = remaining_decades.index(decade_key)
        share_deadline = time.time() + (deadline - time.time()) / max(1, (len(remaining_decades) - idx))
        changed = process_decade(decade_key, min(deadline, share_deadline))
        any_changed = any_changed or changed

    if not any_changed:
        print("Keine Aenderungen in diesem Lauf.")


if __name__ == "__main__":
    main()
