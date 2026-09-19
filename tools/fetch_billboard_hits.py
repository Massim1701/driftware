#!/usr/bin/env python3
"""Phase A (einmalig/iterativ von Claude ausgefuehrt, wie schon bei der
Dekaden-Genre-Erweiterung, siehe tools/fetch_decade_genre_candidates.py):
gleicht die Billboard-Hot-100-Chartgeschichte (kostenloses, taeglich
aktualisiertes JSON-Archiv von github.com/mhollingshead/billboard-hot-100,
1958-heute, keine Auth noetig) gegen den bestehenden Katalog ab und sammelt
fuer jeden Song, der es in die Hot 100 geschafft hat, aber noch NICHT im
Katalog dieser Dekade steht, per Discogs-Suche vollstaendige Metadaten.
Ergebnis landet in derselben queue/<dekade>-erweiterung.json wie die
Genre-Erweiterung -- Phase B (tools/process_decade_queue.py, per bestehendem
Workflow "Dekaden-Genres erweitern") loest davon unveraendert nur noch die
YouTube-Links auf und importiert in den Katalog-Bucket "Ohne" (genre_key),
von wo aus sich das Genre spaeter ueber den bestehenden "Genre bearbeiten"-
Button im Song-Modal manuell zuordnen laesst.

Hintergrund (Nutzerfrage 19.9.: "haben wir alles von discogs gezogen?"):
Discogs' "have"-Zaehler misst physische Sammlungen -- reine Streaming-Aera-
Hits (z.B. Shape Of You) sind dort stark unterrepraesentiert, obwohl sie
echte Chart-Nummer-1-Hits waren. Die Katalog-Basis (fetch_decade_genre_
candidates.py, sortiert nach "have") uebersieht solche Songs deshalb
systematisch. Dieses Skript schliesst genau diese Luecke ueber eine
UNABHAENGIGE, chart-basierte Quelle statt weiterer Discogs-Style-Suchen.

Aufruf: python3 tools/fetch_billboard_hits.py <decade> [--min-peak N]
(Default min-peak: 100, d.h. die komplette Hot 100 zaehlt als "Hit".)
Zeitbudget wie bei den anderen Phase-A-Skripten ueber
BILLBOARD_TIME_BUDGET_SECONDS steuerbar, laeuft resumable ueber mehrere
Aufrufe (Fortschritt wird laufend in die Warteliste gespeichert)."""
import json
import os
import random
import re
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) if "__file__" in dir() else "."

DECADE_YEARS = {
    "70er": range(1970, 1980),
    "80er": range(1980, 1990),
    "90er": range(1990, 2000),
    "2000er": range(2000, 2010),
    "2010er": range(2010, 2020),
    "2020er": range(2020, 2026),
}

DECADE_CATALOG = {
    "70er": "70er-music/songs.json",
    "80er": "80er-music/songs.json",
    "90er": "90er-music/songs.json",
    "2000er": "2000er-music/songs.json",
    "2010er": "2010er-music/songs.json",
    "2020er": "2020er-music/songs.json",
}

# Dieselben Wartelisten wie fetch_decade_genre_candidates.py / process_decade_queue.py
# -- bewusst KEIN eigener Queue-Name, damit Phase B unveraendert bleibt.
DECADE_QUEUE = {
    "70er": "queue/70er-erweiterung.json",
    "80er": "queue/80er-erweiterung.json",
    "90er": "queue/90er-erweiterung.json",
    "2000er": "queue/2000er-erweiterung.json",
    "2010er": "queue/2010er-erweiterung.json",
    "2020er": "queue/2020er-erweiterung.json",
}

BILLBOARD_ALL_URL = "https://raw.githubusercontent.com/mhollingshead/billboard-hot-100/main/all.json"
# Bewusst AUSSERHALB des Repos (nicht unter ROOT) -- die ~44 MB Roh-Chartdaten
# sind nur ein Zwischenstand fuer diesen Lauf, kein Katalog-Inhalt, und sollen
# nie versehentlich mit committet werden. Auf einem GitHub-Actions-Runner ist
# das ohnehin bei jedem Lauf frisch (kein persistenter Zustand), lokal spart
# der Cache bei mehreren Laeufen kurz hintereinander die 44-MB-Downloadzeit.
BILLBOARD_CACHE = os.path.join(tempfile.gettempdir(), "driftware-billboard-hot-100-cache.json")
BILLBOARD_CACHE_MAX_AGE = 24 * 3600  # 1 Tag -- Chartgeschichte aendert sich nur an der aktuellen Woche

USER_AGENT = "DriftwareCatalogBot/1.0 +https://driftware.online"
MIN_HAVE = 3  # niedriger als bei der Style-Suche (MIN_HAVE=20 dort) -- hier ist die
# Qualitaet schon durch die Chart-Platzierung selbst gesichert, nicht durch Discogs'
# Sammler-Zahl. Ein Song bleibt trotzdem ein ECHTER Hit, auch wenn kaum jemand die
# Vinyl-Single gesammelt hat (typisch fuer reine Streaming-Aera-Songs).
TIME_BUDGET_SECONDS = int(os.environ.get("BILLBOARD_TIME_BUDGET_SECONDS", "1500"))
SAVE_EVERY = 5
START_TS = time.time()


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


def song_id(artist, title):
    return (artist or "").strip().lower(), (title or "").strip().lower()


def normalize(s):
    return "".join(ch for ch in (s or "").lower() if ch.isalnum())


def artist_key(a):
    """Normalisierter Kuenstlername fuer den Katalog-Abgleich, 'The '-Praefix
    entfernt (Discogs/Billboard schreiben "The Jackson 5" vs "Jackson 5"
    uneinheitlich -- ohne diesen Schritt haetten wir massenhaft falsche
    "fehlt noch"-Treffer fuer laengst vorhandene Songs produziert)."""
    a = (a or "").strip().lower()
    if a.startswith("the "):
        a = a[4:]
    return normalize(a)


def title_variants(t):
    """Volltitel UND der Teil vor '/' oder '(' (z.B. Doppel-A-Seiten wie
    "Whole Lotta Love / Immigrant Song" oder "(Radio Edit)"-Zusaetze) --
    beide normalisiert, damit ein Katalogeintrag mit Zusatz trotzdem als
    Treffer erkannt wird."""
    t = (t or "").strip().lower()
    primary = re.split(r"[/(]", t)[0].strip()
    return {normalize(t), normalize(primary)} - {""}


def build_catalog_index(decade_key):
    """artist_key -> Menge aller Titel-Varianten dieses Kuenstlers im
    bestehenden Katalog (ueber ALLE Genres hinweg)."""
    path = os.path.join(ROOT, DECADE_CATALOG[decade_key])
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    index = {}
    for songs in data.values():
        for s in songs:
            index.setdefault(artist_key(s.get("a")), set()).update(title_variants(s.get("t")))
    return index


def is_in_catalog(index, artist, title):
    variants = title_variants(title)
    cat_titles = index.get(artist_key(artist))
    if not cat_titles:
        return False
    if variants & cat_titles:
        return True
    return any(
        len(v) > 3 and len(ct) > 3 and (v in ct or ct in v)
        for v in variants for ct in cat_titles
    )


def load_billboard_all():
    if os.path.exists(BILLBOARD_CACHE) and (time.time() - os.path.getmtime(BILLBOARD_CACHE)) < BILLBOARD_CACHE_MAX_AGE:
        print("Billboard-Archiv aus lokalem Cache geladen.")
        with open(BILLBOARD_CACHE, "r", encoding="utf-8") as f:
            return json.load(f)
    print("Lade Billboard-Hot-100-Archiv (~44 MB, einmalig)...")
    req = urllib.request.Request(BILLBOARD_ALL_URL, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=120) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    os.makedirs(os.path.dirname(BILLBOARD_CACHE), exist_ok=True)
    with open(BILLBOARD_CACHE, "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"))
    return data


def collect_decade_hits(billboard_all, decade_key, min_peak):
    """Bester (niedrigster) peak_position je Song ueber alle Chartwochen,
    deren Datum in die Dekade faellt -- Bucketing nach Chart-Jahr (nicht
    Discogs-Erscheinungsjahr, das kennen wir an dieser Stelle noch nicht;
    kleine Ueberschneidungen am Dekaden-Rand sind hier vertretbar)."""
    years = set(DECADE_YEARS[decade_key])
    best = {}
    for week in billboard_all:
        try:
            y = int(week["date"][:4])
        except (KeyError, ValueError, TypeError):
            continue
        if y not in years:
            continue
        for entry in week.get("data", []):
            peak = entry.get("peak_position")
            if peak is None or peak > min_peak:
                continue
            artist = (entry.get("artist") or "").strip()
            title = (entry.get("song") or "").strip()
            if not artist or not title:
                continue
            key = song_id(artist, title)
            cur = best.get(key)
            if cur is None or peak < cur["peak"]:
                best[key] = {"a": artist, "t": title, "peak": peak, "year": y}
    return best


def _pick_matching_release(results, artist, title):
    a_key = artist_key(artist)
    t_variants = title_variants(title)
    for r in results:
        have = (r.get("community") or {}).get("have", 0)
        if have < MIN_HAVE:
            continue
        title_full = r.get("title") or ""
        r_artist, r_title = (title_full.split(" - ", 1) + [""])[:2] if " - " in title_full else ("", title_full)
        r_artist_key = artist_key(r_artist)
        r_t_variants = title_variants(r_title)
        title_ok = bool(t_variants & r_t_variants) or any(
            len(v) > 3 and len(rv) > 3 and (v in rv or rv in v) for v in t_variants for rv in r_t_variants
        )
        if not title_ok:
            continue
        artist_ok = bool(a_key) and bool(r_artist_key) and (
            a_key == r_artist_key or (len(a_key) > 3 and len(r_artist_key) > 3 and (a_key in r_artist_key or r_artist_key in a_key))
        )
        if artist_ok:
            return r
    return None


def discogs_search_release(artist, title):
    """Zwei Anlaeufe: zuerst gezielt ueber das Discogs-Feld 'release_title'
    (viel praeziser als eine Freitext-'q'-Suche fuer eine einzelne Aufnahme --
    eine 'q'-Suche nach Interpret+Titel liefert bei sehr bekannten Kuenstlern
    oft Best-of-/Greatest-Hits-Alben statt der eigentlichen Single, weil die
    'have'-Sortierung Alben bevorzugt). Der 'artist'-Parameter wird bewusst
    NICHT an Discogs selbst uebergeben (matcht dort zu streng, z.B. bricht er
    bei "The 5th Dimension" auf 0 Treffer ab) -- die Interpret-Pruefung
    passiert stattdessen selbst in _pick_matching_release(). Fallback: freie
    'q'-Suche, falls die gezielte Suche nichts Passendes findet."""
    params = {"release_title": title, "type": "release", "sort": "have", "sort_order": "desc", "per_page": "25"}
    url = "https://api.discogs.com/database/search?" + urllib.parse.urlencode(params)
    data = api_get(url)
    match = _pick_matching_release((data or {}).get("results", []), artist, title)
    if match:
        return match

    params = {"q": f"{artist} {title}", "type": "release", "sort": "have", "sort_order": "desc", "per_page": "20"}
    url = "https://api.discogs.com/database/search?" + urllib.parse.urlencode(params)
    data = api_get(url)
    return _pick_matching_release((data or {}).get("results", []), artist, title)


def build_candidate(hit, release):
    return {
        "id": release.get("id"),
        "a": hit["a"],
        "t": hit["t"],
        "y": release.get("year") or hit.get("year"),
        "g": ", ".join(release.get("genre") or []),
        "s": ", ".join(release.get("style") or []),
        "c": release.get("country"),
        "l": ", ".join(release.get("label") or []),
        "th": release.get("thumb") or None,
        "cv": release.get("cover_image") or None,
        "u": "https://www.discogs.com" + (release.get("uri") or ""),
        "hv": (release.get("community") or {}).get("have", 0),
        "genre_key": "Ohne",
        "src": "billboard",
        "bb_peak": hit["peak"],
    }


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in DECADE_YEARS:
        print("Usage: fetch_billboard_hits.py <decade> [--min-peak N]")
        print("Dekaden:", list(DECADE_YEARS))
        sys.exit(1)
    decade_key = sys.argv[1]
    min_peak = 100
    if "--min-peak" in sys.argv:
        min_peak = int(sys.argv[sys.argv.index("--min-peak") + 1])

    billboard_all = load_billboard_all()
    hits = collect_decade_hits(billboard_all, decade_key, min_peak)
    print(f"{decade_key}: {len(hits)} eindeutige Billboard-Hits (peak<={min_peak}) im Dekaden-Zeitraum.")

    catalog_index = build_catalog_index(decade_key)
    print(f"{decade_key}: {sum(len(v) for v in catalog_index.values())} Titel-Varianten im Katalog indiziert.")

    queue_path = os.path.join(ROOT, DECADE_QUEUE[decade_key])
    existing_queue = []
    if os.path.exists(queue_path):
        with open(queue_path, "r", encoding="utf-8") as f:
            existing_queue = json.load(f)
    queue_index = {}
    for c in existing_queue:
        queue_index.setdefault(artist_key(c.get("a")), set()).update(title_variants(c.get("t")))

    missing = [
        hit for hit in hits.values()
        if not is_in_catalog(catalog_index, hit["a"], hit["t"])
        and not is_in_catalog(queue_index, hit["a"], hit["t"])
    ]
    # Groesste Hits zuerst (niedrigste peak_position) -- bei Zeitbudget-Abbruch
    # bleiben so die wichtigsten Luecken zuerst geschlossen.
    missing.sort(key=lambda h: h["peak"])
    print(f"{decade_key}: {len(missing)} Songs fehlen noch und werden jetzt bei Discogs gesucht.")

    def save_progress(new_candidates):
        # Kein separater Fortschritts-Zustand noetig: beim naechsten Lauf wird
        # "missing" ohnehin frisch aus Katalog+Warteliste neu berechnet, bereits
        # hinzugefuegte Kandidaten fallen dabei automatisch raus (siehe oben).
        merged = existing_queue + new_candidates
        tmp = queue_path + ".tmp"
        os.makedirs(os.path.dirname(queue_path), exist_ok=True)
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(merged, f, separators=(",", ":"), ensure_ascii=False)
        os.replace(tmp, queue_path)

    new_candidates = []
    not_found = 0
    i = 0
    while i < len(missing):
        if time.time() - START_TS > TIME_BUDGET_SECONDS:
            print(f"Zeitbudget ({TIME_BUDGET_SECONDS}s) erreicht, Rest bleibt fuer den naechsten Lauf.")
            break
        hit = missing[i]
        i += 1
        release = discogs_search_release(hit["a"], hit["t"])
        if release:
            new_candidates.append(build_candidate(hit, release))
            print(f"  [{i}/{len(missing)}] + {hit['a']} - {hit['t']} (Peak #{hit['peak']})")
        else:
            not_found += 1
            print(f"  [{i}/{len(missing)}] kein Discogs-Treffer: {hit['a']} - {hit['t']}")
        if len(new_candidates) and len(new_candidates) % SAVE_EVERY == 0:
            save_progress(new_candidates)
        time.sleep(1.1)

    save_progress(new_candidates)
    print(f"Fertig fuer diesen Lauf ({decade_key}): {len(new_candidates)} neue Kandidaten in die Warteliste, "
          f"{not_found} ohne Discogs-Treffer uebersprungen, {len(missing) - i} bleiben fuer den naechsten Lauf.")


if __name__ == "__main__":
    main()
