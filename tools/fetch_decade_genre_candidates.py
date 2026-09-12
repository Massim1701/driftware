#!/usr/bin/env python3
"""Phase A (einmalig von Claude/Massimo ausgefuehrt, wie schon bei der
Christmas-Erweiterung): fuer duenne Genres EINER Dekade per Discogs-API
Kandidaten sammeln, gegen den bestehenden Katalog (ALLE Genres dieser
Dekade, nicht nur das Zielgenre) deduplizieren und in
queue/<dekade>-erweiterung.json schreiben. Phase B (tools/
process_decade_queue.py, per GitHub-Actions-Workflow) loest dann nur noch
die YouTube-Links auf -- exakt die gleiche Aufteilung wie bei Christmas.

Genau-Jahr-Suche statt Jahrzehnt-Bereich: der Discogs-Parameter "decade"
filtert NICHT zuverlaessig (empirisch getestet: liefert Ergebnisse aus
allen Jahren) -- stattdessen wird jedes Jahr der Dekade EINZELN abgefragt
(year=<Jahr>), sortiert nach Beliebtheit (community "have"-Zaehler), das
ist zuverlaessig und die Ergebnismengen pro Jahr+Style sind klein genug
(meist < 300), um sie vollstaendig statt nur eine Stichprobe zu holen.

Unauthentifiziert (kein DISCOGS_TOKEN lokal verfuegbar) -- wie bei
Christmas fehlen dadurch thumb/cover_image in der Suche; Phase B faellt
dafuer auf das YouTube-Vorschaubild zurueck (siehe process_decade_queue.py).
"""
import json
import os
import sys
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) if "__file__" in dir() else "."

DECADE_YEARS = {
    "70er": range(1970, 1980),
    "80er": range(1980, 1990),
    "90er": range(1990, 2000),
    "2000er": range(2000, 2010),
    "2010er": range(2010, 2020),
    "2020er": range(2020, 2026),  # offen nach oben, hier nur bis "heute"
}

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

USER_AGENT = "DriftwareCatalogBot/1.0 +https://driftware.online"


def api_get(url, retries=5):
    for attempt in range(retries):
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = 3 * (attempt + 1)
                print(f"    Rate-Limit (429), warte {wait}s ...")
                time.sleep(wait)
                continue
            print(f"    HTTP-Fehler {e.code} bei {url}: {e.read()[:200]}")
            return None
        except Exception as e:
            print(f"    Fehler bei {url}: {e}")
            time.sleep(2)
    return None


def search_style_year(style, year, page=1, per_page=100):
    params = {
        "style": style,
        "year": str(year),
        "type": "release",
        "sort": "have",
        "sort_order": "desc",
        "per_page": str(per_page),
        "page": str(page),
    }
    url = "https://api.discogs.com/database/search?" + urllib.parse.urlencode(params)
    return api_get(url)


def song_id(artist, title):
    """Wie tools/process_missing_queue.py::song_id -- normalisierter
    Artist+Titel-Schluessel. Zwei Discogs-Releases derselben Aufnahme
    (z.B. Original + Reissue) haben oft VERSCHIEDENE Release-IDs aber
    IDENTISCHEN Artist+Titel -- Release-ID-Dedup allein reicht deshalb
    nicht (siehe dedup_decade.py-Bereinigung: genau dieses Muster fand
    sich zu tausenden im Bestandskatalog, alles cross-genre-Duplikate)."""
    return (artist or "").strip().lower(), (title or "").strip().lower()


def existing_release_ids(decade_key):
    """Release-IDs (aus dem 'u'-Feld, https://www.discogs.com/release/<ID>-...)
    UND normalisierte Artist+Titel-Schluessel ALLER bereits vorhandenen
    Songs dieser Dekade -- ueber ALLE Genres hinweg, damit ein Kandidat,
    der zufaellig schon unter einem ANDEREN Genre im Katalog steht (per
    Release-ID oder als dieselbe Aufnahme unter einer anderen Release-ID),
    nicht doppelt eingefuegt wird. Rueckgabe: (release_ids, title_keys)."""
    path = os.path.join(ROOT, DECADE_CATALOG[decade_key])
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    ids = set()
    title_keys = set()
    for songs in data.values():
        for s in songs:
            u = s.get("u") or ""
            if "/release/" in u:
                try:
                    rid = int(u.split("/release/")[1].split("-")[0])
                    ids.add(rid)
                except (ValueError, IndexError):
                    pass
            title_keys.add(song_id(s.get("a"), s.get("t")))
    return ids, title_keys


MIN_HAVE = 20  # Qualitaets-Untergrenze: der BESTEHENDE Katalog hat median~400
# Discogs-"have" (Popularitaets-Proxy) und nur ~4% aller Eintraege liegen
# unter 20 -- eine rohe Jahr+Style-Suche ohne Filter zieht dagegen sehr
# viel Nischen-/Bootleg-Material rein (median bei einem Testlauf: 13, siehe
# Analyse). MIN_HAVE haelt die neuen Kandidaten auf einem mit dem
# bestehenden Katalog vergleichbaren Qualitaetsniveau statt ihn zu fluten.


def fetch_genre(decade_key, genre_key, discogs_styles, seen_ids, existing_ids, existing_title_keys, seen_title_keys, on_progress=None):
    """Sammelt fuer EIN internes Genre (kann mehrere Discogs-Styles
    umfassen, z.B. NewWavePostPunk = 'New Wave' + 'Post-Punk') alle
    Kandidaten aus allen Jahren der Dekade. on_progress(candidates_so_far)
    wird nach jedem Jahr aufgerufen, damit ein Aufrufer zwischenspeichern
    kann -- unauthentifiziert wird das Discogs-Rate-Limit (429) haeufig
    getroffen, ein Lauf kann daher laenger dauern als ein einzelner
    Tool-Call-Timeout und muss ueber mehrere Aufrufe hinweg fortsetzbar
    sein, ohne bereits gesammelte Kandidaten zu verlieren."""
    candidates = []
    for style in discogs_styles:
        for year in DECADE_YEARS[decade_key]:
            page = 1
            while True:
                data = search_style_year(style, year, page=page)
                if not data:
                    break
                results = data.get("results", [])
                below_threshold = False
                for r in results:
                    rid = r.get("id")
                    have = (r.get("community") or {}).get("have", 0)
                    if have < MIN_HAVE:
                        # Ergebnisse sind nach "have" absteigend sortiert --
                        # sobald wir unter die Schwelle fallen, sind auch
                        # alle folgenden (dieser + weitere Seiten) darunter,
                        # also Pagination fuer dieses Jahr/Style abbrechen
                        # statt weiter unnoetig Seiten zu holen.
                        below_threshold = True
                        break
                    if not rid or rid in seen_ids or rid in existing_ids:
                        continue
                    title_full = r.get("title") or ""
                    if " - " in title_full:
                        artist, title = title_full.split(" - ", 1)
                    else:
                        artist, title = "", title_full
                    artist, title = artist.strip(), title.strip()
                    tkey = song_id(artist, title)
                    if tkey in existing_title_keys or tkey in seen_title_keys:
                        # Gleiche Aufnahme steckt schon im Katalog (oder in
                        # dieser Kandidatenrunde) unter einer ANDEREN
                        # Release-ID -- reine Release-ID-Pruefung wuerde das
                        # nicht erkennen und den Song doppelt importieren.
                        seen_ids.add(rid)
                        continue
                    seen_ids.add(rid)
                    seen_title_keys.add(tkey)
                    candidates.append({
                        "id": rid,
                        "a": artist.strip(),
                        "t": title.strip(),
                        "y": r.get("year"),
                        "g": ", ".join(r.get("genre") or []),
                        "s": ", ".join(r.get("style") or []),
                        "c": r.get("country"),
                        "l": ", ".join(r.get("label") or []),
                        "th": r.get("thumb") or None,
                        "cv": r.get("cover_image") or None,
                        "u": "https://www.discogs.com" + r.get("uri", ""),
                        "hv": (r.get("community") or {}).get("have", 0),
                        "genre_key": genre_key,
                    })
                pages_total = data.get("pagination", {}).get("pages", 1)
                if below_threshold or page >= pages_total or page >= 5:  # Deckel: max 5 Seiten (~500) pro Jahr+Style
                    break
                page += 1
                time.sleep(1.1)  # unauthentifiziert: konservativ ~50/min
            time.sleep(1.1)
            if on_progress:
                on_progress(candidates)
    return candidates


def main():
    if len(sys.argv) < 2:
        print("Usage: fetch_decade_genre_candidates.py <decade> [genre_key=style1,style2 ...]")
        sys.exit(1)
    decade_key = sys.argv[1]
    if decade_key not in DECADE_YEARS:
        print("Unbekannte Dekade:", decade_key, "-- erlaubt:", list(DECADE_YEARS))
        sys.exit(1)

    genre_specs = sys.argv[2:]
    if not genre_specs:
        print("Keine Genres angegeben.")
        sys.exit(1)

    existing_ids, existing_title_keys = existing_release_ids(decade_key)
    print(f"{decade_key}: {len(existing_ids)} bestehende Release-IDs / {len(existing_title_keys)} Artist+Titel im Katalog geladen.")

    queue_path = os.path.join(ROOT, DECADE_QUEUE[decade_key])
    existing_queue = []
    if os.path.exists(queue_path):
        with open(queue_path, "r", encoding="utf-8") as f:
            existing_queue = json.load(f)
    seen_ids = set(c["id"] for c in existing_queue) | existing_ids
    seen_title_keys = set(song_id(c.get("a"), c.get("t")) for c in existing_queue)

    all_new = []

    def save_progress():
        merged = existing_queue + all_new
        tmp = queue_path + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(merged, f, separators=(",", ":"), ensure_ascii=False)
        os.replace(tmp, queue_path)

    for spec in genre_specs:
        genre_key, styles_raw = spec.split("=", 1)
        styles = [s.strip() for s in styles_raw.split(",")]
        print(f"-- {genre_key} ({', '.join(styles)}) --")

        def on_progress(candidates_so_far, genre_key=genre_key):
            # ersetzt evtl. schon gespeicherte (unvollstaendige) Kandidaten
            # dieses Genres aus einem vorherigen, abgebrochenen Lauf durch
            # den aktuellen (laengeren) Zwischenstand.
            del all_new[:]
            all_new.extend(c for c in prior_new if c.get("genre_key") != genre_key)
            all_new.extend(candidates_so_far)
            save_progress()

        prior_new = list(all_new)
        found = fetch_genre(decade_key, genre_key, styles, seen_ids, existing_ids, existing_title_keys, seen_title_keys, on_progress=on_progress)
        all_new[:] = [c for c in prior_new if c.get("genre_key") != genre_key] + found
        print(f"   {len(found)} neue Kandidaten gefunden.")

    save_progress()
    print(f"Insgesamt {len(all_new)} neue Kandidaten zu {queue_path} hinzugefuegt (jetzt {len(existing_queue) + len(all_new)} gesamt).")


if __name__ == "__main__":
    main()
