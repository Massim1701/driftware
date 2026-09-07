#!/usr/bin/env python3
"""Verarbeitet queue/fehlende-lieder.json einmal taeglich (siehe
.github/workflows/process-missing-songs.yml): fuer jeden Eintrag per
Discogs-API Metadaten und per yt-dlp einen YouTube-Link suchen, den Song
in die passende <dekade>-music/songs.json einsortieren und NUR bei
vollstaendigem Erfolg (Metadaten + YouTube-Link gefunden) aus der
Warteliste entfernen. Fehlgeschlagene Eintraege bleiben stehen und werden
am naechsten Tag erneut versucht.

Sicherheit: Ein aus der Warteliste kommendes "yt"-Feld wird NUR benutzt,
wenn es exakt wie eine YouTube-Video-ID aussieht (11 Zeichen, siehe
YOUTUBE_ID_RE) -- alles andere wird verworfen und nie als Link geoeffnet
oder ausgefuehrt.
"""
import json
import os
import re
import subprocess
import sys
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUEUE_PATH = os.path.join(ROOT, "queue", "fehlende-lieder.json")
DISCOGS_TOKEN = os.environ.get("DISCOGS_TOKEN", "").strip()

YOUTUBE_ID_RE = re.compile(r"^[A-Za-z0-9_-]{11}$")

DECADE_CATALOGS = [
    (1970, 1979, "70er-music/songs.json"),
    (1980, 1989, "80er-music/songs.json"),
    (1990, 1999, "90er-music/songs.json"),
    (2000, 2009, "2000er-music/songs.json"),
    (2010, 2019, "2010er-music/songs.json"),
    (2020, 2099, "2020er-music/songs.json"),  # "2020er-heute", offen nach oben
]


def valid_yt_id(value):
    """Nur eine exakte YouTube-Video-ID durchlassen -- niemals eine
    beliebige URL oder etwas anderes als 'echten Link' interpretieren."""
    if not value or not isinstance(value, str):
        return None
    value = value.strip()
    return value if YOUTUBE_ID_RE.match(value) else None


VK_URL_RE = re.compile(r"^https://(?:www\.)?(?:vkvideo\.ru|vk\.com)/\S{1,300}$", re.IGNORECASE)


def valid_vk_url(value):
    """Fallback wenn kein YouTube-Video existiert (siehe shared/manualadd.js):
    ein vom Nutzer selbst gefundener VK-Link wird NICHT eingebettet (VK bietet
    keine Fernsteuerung wie die YouTube-IFrame-API), nur als Link gespeichert."""
    if not value or not isinstance(value, str):
        return None
    value = value.strip()
    return value if VK_URL_RE.match(value) else None


PAREN_SUFFIX_RE = re.compile(r"\s*\([^()]*\)\s*$")


def strip_parenthetical_suffix(title):
    """Entfernt einen abschliessenden Klammerzusatz wie '(Radio Version)',
    '(Extended Mix)', '(Remastered)' -- der ist oft nicht Teil des
    Original-Release-Titels auf Discogs und fuehrt sonst zu unnoetig vielen
    Fehltreffern. Nur EIN Fallback-Versuch, wenn die exakte Suche mit dem
    vollen Titel nichts findet -- der ungekuerzte Titel bleibt immer der
    erste Versuch."""
    stripped = PAREN_SUFFIX_RE.sub("", title).strip()
    return stripped if stripped and stripped != title else None


def catalog_path_for_year(year):
    for lo, hi, path in DECADE_CATALOGS:
        if lo <= year <= hi:
            return path
    return None


def discogs_search(artist, title):
    if not DISCOGS_TOKEN:
        return None
    q = urllib.parse.urlencode({
        "artist": artist,
        "track": title,
        "type": "release",
        "token": DISCOGS_TOKEN,
        "per_page": 6,
    })
    url = f"https://api.discogs.com/database/search?{q}"
    req = urllib.request.Request(url, headers={"User-Agent": "driftware-queue-batch/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.load(r)
    except Exception as e:
        print(f"  Discogs-Suche fehlgeschlagen: {e}")
        return None
    results = [r for r in data.get("results", []) if r.get("year")]
    if not results:
        return None
    # Kandidat mit den meisten "haves" -- guter Proxy fuer die bekannteste/
    # kanonischste Version statt eines obskuren Bootlegs oder einer
    # Compilation ganz unten in der Liste.
    best = max(results, key=lambda r: r.get("community", {}).get("have", 0))
    time.sleep(1)  # Discogs Rate-Limit
    return discogs_release(best["id"])


def discogs_release(release_id):
    url = f"https://api.discogs.com/releases/{release_id}?token={DISCOGS_TOKEN}"
    req = urllib.request.Request(url, headers={"User-Agent": "driftware-queue-batch/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return json.load(r)
    except Exception as e:
        print(f"  Discogs-Release-Abruf fehlgeschlagen: {e}")
        return None


def search_youtube(artist, title):
    query = f"ytsearch5:{artist} {title}"
    try:
        out = subprocess.run(
            ["yt-dlp", query, "--dump-json", "--skip-download", "--no-warnings"],
            capture_output=True, text=True, timeout=60,
        )
    except Exception as e:
        print(f"  yt-dlp fehlgeschlagen: {e}")
        return None
    candidates = []
    for line in out.stdout.splitlines():
        try:
            candidates.append(json.loads(line))
        except Exception:
            continue
    if not candidates:
        return None
    # VEVO-Kanaele bevorzugen (Standing Rule aus dem Projekt: beste Qualitaet).
    for c in candidates:
        channel = (c.get("channel") or c.get("uploader") or "").lower()
        if "vevo" in channel:
            return c.get("id")
    return candidates[0].get("id")


def pick_bucket(catalog_data, discogs_release_data):
    style_words = " ".join(discogs_release_data.get("styles") or []).lower()
    genre_words = " ".join(discogs_release_data.get("genres") or []).lower()
    haystack = style_words + " " + genre_words
    for bucket_name in catalog_data.keys():
        if bucket_name == "Ohne":
            continue
        # simple normalisierter Vergleich: Bucket-Name (CamelCase) in
        # lesbare Woerter zerlegen und gegen Discogs-Styles/-Genres pruefen.
        readable = re.sub(r"(?<!^)(?=[A-Z])", " ", bucket_name).lower()
        words = [w for w in readable.split() if len(w) > 2]
        if words and all(w in haystack for w in words):
            return bucket_name
    return "Ohne"


def humanize_bucket(name):
    """Nur fuer das Anzeige-Feld 'g' (Genre) manuell zugeordneter Songs --
    z.B. 'SynthPop' -> 'Synth Pop'. Der Bucket-KEY selbst bleibt unveraendert
    (camelCase, siehe DECADE_GENRES im Frontend/shared/manualadd.js)."""
    return re.sub(r"(?<!^)(?=[A-Z])", " ", name or "").strip()


def song_id(artist, title):
    return (artist or "").strip().lower(), (title or "").strip().lower()


def build_song_entry(artist, title, release, yt_id, vk_url=None):
    images = release.get("images") or []
    thumb = next((im.get("uri150") for im in images if im.get("uri150")), None)
    cover = next((im.get("uri") for im in images if im.get("uri")), None)
    labels = ", ".join(dict.fromkeys(l.get("name", "") for l in release.get("labels", []) if l.get("name")))
    entry = {
        "a": artist,
        "t": title,
        "y": release.get("year"),
        "g": ", ".join(release.get("genres") or []) or None,
        "s": ", ".join(release.get("styles") or []) or None,
        "c": release.get("country"),
        "l": labels or None,
        "th": thumb,
        "cv": cover,
        "u": release.get("uri"),
        "hv": (release.get("community") or {}).get("have", 0),
        "yt": yt_id,
    }
    if vk_url:
        entry["vk"] = vk_url
    return entry


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))


def main():
    if not os.path.exists(QUEUE_PATH):
        print("Keine Warteliste gefunden, nichts zu tun.")
        return

    queue = load_json(QUEUE_PATH)
    if not isinstance(queue, list) or not queue:
        print("Warteliste ist leer.")
        return

    remaining = []
    changed_catalogs = {}  # path -> data (nur einmal geladen/geschrieben)

    for entry in queue:
        try:
            artist = (entry.get("a") or "").strip()
            title = (entry.get("t") or "").strip()
            if not artist or not title:
                print("Eintrag ohne Interpret/Titel uebersprungen:", entry)
                continue  # kaputten Eintrag verwerfen, nicht ewig behalten

            manual_genre = entry.get("g") if isinstance(entry.get("g"), str) else None
            manual_genre = manual_genre.strip() if manual_genre else None
            manual_year_raw = entry.get("y")
            manual_year = None
            if isinstance(manual_year_raw, bool):
                manual_year = None
            elif isinstance(manual_year_raw, (int, float)):
                manual_year = int(manual_year_raw)
            elif isinstance(manual_year_raw, str) and manual_year_raw.strip().isdigit():
                manual_year = int(manual_year_raw.strip())

            if manual_genre and manual_year:
                # Nutzer hat Jahr + Genre selbst zugeordnet (Haken bei
                # "Discogs" war aus) -- keine Discogs-Suche noetig/gewollt.
                print(f"Bearbeite (manuell, ohne Discogs): {artist} - {title} [{manual_genre}, {manual_year}]")
                catalog_path_rel = catalog_path_for_year(manual_year)
                if not catalog_path_rel:
                    print(f"  Jahr {manual_year} passt zu keiner Dekaden-Kategorie, bleibt in der Warteliste")
                    remaining.append(entry)
                    continue

                catalog_path_abs = os.path.join(ROOT, catalog_path_rel)
                if catalog_path_rel not in changed_catalogs:
                    changed_catalogs[catalog_path_rel] = load_json(catalog_path_abs)
                catalog_data = changed_catalogs[catalog_path_rel]

                # Genre-Korrektur eines bereits vorhandenen Katalog-Songs (kommt
                # vom "Genre bearbeiten"-Button bei Songs ohne Genre, siehe
                # shared/decades.js setupGenreEditUI/submitGenreFix): der Song
                # steckt schon (meist im Bucket "Ohne") in dieser songs.json,
                # nur Bucket + "g"-Feld muessen sich aendern -- kein Discogs-/
                # YouTube-Abgleich noetig, alle vorhandenen Felder (Cover,
                # YouTube-Link, ...) bleiben unangetastet. Deshalb VOR dem
                # sonst zwingenden YouTube-/VK-Link-Check geprueft.
                wanted_id = song_id(artist, title)
                moved = False
                for bucket_name, songs_list in list(catalog_data.items()):
                    if bucket_name == manual_genre:
                        continue
                    for i, s in enumerate(songs_list):
                        if song_id(s.get("a"), s.get("t")) == wanted_id:
                            existing_song = songs_list.pop(i)
                            existing_song["g"] = humanize_bucket(manual_genre)
                            catalog_data.setdefault(manual_genre, []).append(existing_song)
                            print(f"  verschoben nach {catalog_path_rel} / {manual_genre} (Korrektur, bereits vorhanden)")
                            moved = True
                            break
                    if moved:
                        break
                if moved:
                    continue

                yt_id = valid_yt_id(entry.get("yt")) or search_youtube(artist, title)
                vk_url = valid_vk_url(entry.get("vk"))
                if not yt_id and not vk_url:
                    print("  kein YouTube-Link und kein VK-Link gefunden, bleibt in der Warteliste")
                    remaining.append(entry)
                    continue

                existing_ids = {song_id(s.get("a"), s.get("t")) for lst in catalog_data.values() for s in lst}
                if song_id(artist, title) in existing_ids:
                    print("  ist schon in der Datenbank, wird aus der Warteliste entfernt")
                    continue

                song = {
                    "a": artist,
                    "t": title,
                    "y": manual_year,
                    "g": humanize_bucket(manual_genre),
                    "s": None,
                    "c": None,
                    "l": None,
                    "th": None,
                    "cv": None,
                    "u": None,
                    "hv": 0,
                    "yt": yt_id,
                }
                if vk_url:
                    song["vk"] = vk_url
                catalog_data.setdefault(manual_genre, []).append(song)
                print(f"  hinzugefuegt zu {catalog_path_rel} / {manual_genre} (manuell)")
                continue

            print(f"Bearbeite: {artist} - {title}")
            release = discogs_search(artist, title)
            if not release or not release.get("year"):
                alt_title = strip_parenthetical_suffix(title)
                if alt_title:
                    print(f"  keine Treffer fuer \"{title}\", versuche ohne Klammerzusatz: \"{alt_title}\"")
                    release = discogs_search(artist, alt_title)
            if not release or not release.get("year"):
                print("  keine Discogs-Metadaten gefunden, bleibt in der Warteliste")
                remaining.append(entry)
                continue

            catalog_path_rel = catalog_path_for_year(release["year"])
            if not catalog_path_rel:
                print(f"  Jahr {release['year']} passt zu keiner Dekaden-Kategorie, bleibt in der Warteliste")
                remaining.append(entry)
                continue

            yt_id = valid_yt_id(entry.get("yt")) or search_youtube(artist, title)
            vk_url = valid_vk_url(entry.get("vk"))
            if not yt_id and not vk_url:
                print("  kein YouTube-Link und kein VK-Link gefunden, bleibt in der Warteliste")
                remaining.append(entry)
                continue

            catalog_path_abs = os.path.join(ROOT, catalog_path_rel)
            if catalog_path_rel not in changed_catalogs:
                changed_catalogs[catalog_path_rel] = load_json(catalog_path_abs)
            catalog_data = changed_catalogs[catalog_path_rel]

            existing_ids = {song_id(s.get("a"), s.get("t")) for lst in catalog_data.values() for s in lst}
            if song_id(artist, title) in existing_ids:
                print("  ist schon in der Datenbank, wird aus der Warteliste entfernt")
                continue  # erfolgreich (schon vorhanden) -> aus Warteliste

            bucket = pick_bucket(catalog_data, release)
            song = build_song_entry(artist, title, release, yt_id, vk_url)
            catalog_data.setdefault(bucket, []).append(song)
            print(f"  hinzugefuegt zu {catalog_path_rel} / {bucket}")
            # erfolgreich verarbeitet -> NICHT zu remaining hinzufuegen
        except Exception as e:
            print(f"  Fehler bei Eintrag, bleibt in der Warteliste: {e}")
            remaining.append(entry)

    for path_rel, data in changed_catalogs.items():
        save_json(os.path.join(ROOT, path_rel), data)

    save_json(QUEUE_PATH, remaining)
    print(f"Fertig. {len(queue) - len(remaining)} von {len(queue)} Eintraegen verarbeitet, {len(remaining)} bleiben in der Warteliste.")


if __name__ == "__main__":
    main()
