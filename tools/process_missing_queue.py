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
import urllib.error
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dubletten  # gemeinsame, tolerante Dublettenpruefung (08.11.2026)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUEUE_PATH = os.path.join(ROOT, "queue", "fehlende-lieder.json")
AUFGEGEBEN_PATH = os.path.join(ROOT, "queue", "fehlende-lieder-aufgegeben.json")
MAX_VERSUCHE = 7  # nach so vielen erfolglosen Naechten wandert ein Lied in die Aufgegeben-Liste (eingebaut 08.11.2026; am 09.11.2026 von 3 auf 7, solange unklar ist, warum so viele YouTube-Suchen stumm leer bleiben)
DISCOGS_TOKEN = os.environ.get("DISCOGS_TOKEN", "").strip()

YOUTUBE_ID_RE = re.compile(r"^[A-Za-z0-9_-]{11}$")

# Lieder unter 30 Sekunden (Jingles, Senderkennungen, Werbung) kommen nicht in den Katalog.
# Gemessen wird die Laenge der YouTube-Treffer (yt-dlp liefert "duration"); Treffer ohne
# Laenge (YouTube-API-Fallback) zaehlen als lang genug.
MIN_DAUER_S = 30
_NUR_KURZE = False  # von search_youtube gesetzt: es gab Treffer, aber alle kuerzer als MIN_DAUER_S

# Sentinel im "g"-Feld eines Warteliste-Eintrags: markiert eine
# Loesch-Anfrage statt einer Genre-Korrektur (siehe Verwendung unten).
# Bewusst kein gueltiger Genre-Name, damit es nie mit einem echten Bucket
# kollidiert.
REMOVE_SENTINEL = "__REMOVE__"

DECADE_CATALOGS = [
    (1970, 1979, "70er-music/songs.json"),
    (1980, 1989, "80er-music/songs.json"),
    (1990, 1999, "90er-music/songs.json"),
    (2000, 2009, "2000er-music/songs.json"),
    (2010, 2019, "2010er-music/songs.json"),
    (2020, 2099, "2020er-music/songs.json"),  # "2020er-heute", offen nach oben
]


YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY", "")


# --- Schutz vor API-Limits (09.11.2026) -------------------------------------------------------
# Das Tageskontingent der YouTube-Data-API liegt standardmaessig bei 10.000 Einheiten, eine Suche
# (search.list) kostet 100. Mehr als rund 90 Suchen pro Lauf sind also nicht drin. Antwortet die API
# mit 429/403, wird nicht weiter gehaemmert, und die Nacht zaehlt fuer das Lied NICHT als Fehlversuch.
YT_API_MAX_SUCHEN = int(os.environ.get("YT_API_MAX_SUCHEN", "90"))
YT_API_PAUSE_S = float(os.environ.get("YT_API_PAUSE_S", "1.5"))
_api_suchen = 0              # bisher gestellte API-Suchen in diesem Lauf
_api_abgeschaltet = False    # nach Limit/wiederholter Ablehnung: keine API-Anfragen mehr in diesem Lauf
_api_fehler_folge = 0        # aufeinanderfolgende Ablehnungen (429/403)
_SUCHE_BLOCKIERT = False     # die Suche des aktuellen Eintrags wurde von YouTube abgelehnt (kein echtes "nicht gefunden")


def _blockiert():
    global _SUCHE_BLOCKIERT
    _SUCHE_BLOCKIERT = True


def _suche_zuruecksetzen():
    """Vor jedem Eintrag aufrufen: die Ablehnung eines Liedes gilt nicht fuer das naechste."""
    global _SUCHE_BLOCKIERT
    _SUCHE_BLOCKIERT = False


_ZAEHLER = {}


def _zaehle(name):
    _ZAEHLER[name] = _ZAEHLER.get(name, 0) + 1


def _bilanz_ausgeben():
    """Eine Zeile am Ende des Laufs: Wo bleiben die YouTube-Suchen haengen? (Diagnose, kostet nichts)"""
    namen = ["ytdlp_start_fehler", "ytdlp_standard_treffer", "ytdlp_standard_leer", "ytdlp_android_treffer",
             "ytdlp_ganz_leer", "ytdlp_leer_stumm", "ytdlp_blockiert",
             "api_ohne_schluessel", "api_uebersprungen", "api_treffer", "api_leer", "api_fehler"]
    teile = [f"{n}={_ZAEHLER[n]}" for n in namen if n in _ZAEHLER]
    print("YouTube-Bilanz: " + (", ".join(teile) if teile else "keine YouTube-Suche in diesem Lauf"))


def _yt_dlp_blockiert(stderr):
    """True, wenn yt-dlp von YouTube abgelehnt wurde (Bot-Pruefung, 429), statt wirklich nichts zu finden."""
    t = (stderr or "").lower()
    return any(k in t for k in ("http error 429", "too many requests", "confirm you", "not a bot", "sign in to confirm"))


def _youtube_api(path, params):
    """YouTube-Data-API v3 -- laeuft unabhaengig von der Bot-Erkennung, die yt-dlp auf
    GitHub-Actions-Runnern oft leer laufen laesst. None bei fehlendem Schluessel oder Fehler.
    Bei Ablehnung (429/403) setzt sie _SUCHE_BLOCKIERT, damit der Eintrag nicht als erfolglose Nacht zaehlt."""
    global _api_suchen, _api_abgeschaltet, _api_fehler_folge
    if not YOUTUBE_API_KEY:
        if path == "search":
            _zaehle("api_ohne_schluessel")
        return None
    if _api_abgeschaltet:
        if path == "search":
            _zaehle("api_uebersprungen")
        _blockiert()
        return None
    if path == "search":
        if _api_suchen >= YT_API_MAX_SUCHEN:
            _api_abgeschaltet = True
            print(f"  YouTube-API: Limit von {YT_API_MAX_SUCHEN} Suchen pro Lauf erreicht, ab jetzt keine API-Suche mehr in diesem Lauf")
            _blockiert()
            return None
        _api_suchen += 1
        time.sleep(YT_API_PAUSE_S)
    url = "https://www.googleapis.com/youtube/v3/" + path + "?" + urllib.parse.urlencode({**params, "key": YOUTUBE_API_KEY})
    for versuch in (1, 2):
        try:
            with urllib.request.urlopen(url, timeout=20) as resp:
                daten = json.loads(resp.read().decode("utf-8"))
            _api_fehler_folge = 0
            if path == "search":
                if (daten or {}).get("items"):
                    _zaehle("api_treffer")
                else:
                    _zaehle("api_leer")
                    if _ZAEHLER.get("api_leer", 0) <= 10:
                        print(f"  YouTube-API: 0 Treffer fuer \"{params.get('q')}\"")
            return daten
        except urllib.error.HTTPError as e:
            if e.code == 429 and versuch == 1:
                print("  YouTube-API: 429, einmal nach 10 s noch einmal")
                time.sleep(10)
                continue
            print(f"  YouTube-API fehlgeschlagen: {e}")
            _blockiert()
            if path == "search":
                _zaehle("api_fehler")
            if e.code in (429, 403):
                _api_fehler_folge += 1
                if _api_fehler_folge >= 3:
                    _api_abgeschaltet = True
                    print("  YouTube-API lehnt wiederholt ab (Kontingent oder Limit erschoepft): ab jetzt keine API-Anfragen mehr in diesem Lauf")
            return None
        except Exception as e:
            print(f"  YouTube-API fehlgeschlagen: {e}")
            _blockiert()
            if path == "search":
                _zaehle("api_fehler")
            return None


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


def _yt_dlp_search(query, player_client=None):
    cmd = ["yt-dlp", query, "--dump-json", "--skip-download", "--no-warnings"]
    if player_client:
        cmd += ["--extractor-args", f"youtube:player_client={player_client}"]
    try:
        return subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    except Exception as e:
        print(f"  yt-dlp fehlgeschlagen: {e}")
        return None


def _youtube_candidates(artist, title):
    """Bis zu 5 YouTube-Treffer (yt-dlp-JSON). Mit Android-Client-Retry, siehe search_youtube."""
    query = f"ytsearch5:{artist} {title}"
    out = _yt_dlp_search(query)
    if out is None:
        _zaehle("ytdlp_start_fehler")
    candidates = []
    if out is not None:
        for line in out.stdout.splitlines():
            try:
                candidates.append(json.loads(line))
            except Exception:
                continue

    _zaehle("ytdlp_standard_treffer" if candidates else "ytdlp_standard_leer")
    if not candidates:
        retry = _yt_dlp_search(query, player_client="android")
        if retry is not None:
            for line in retry.stdout.splitlines():
                try:
                    candidates.append(json.loads(line))
                except Exception:
                    continue
            if candidates:
                _zaehle("ytdlp_android_treffer")
            if not candidates and retry.stderr and retry.stderr.strip():
                print(f"  yt-dlp ohne Treffer, stderr: {retry.stderr.strip()[:300]}")
        elif out is not None and out.stderr and out.stderr.strip():
            print(f"  yt-dlp ohne Treffer, stderr: {out.stderr.strip()[:300]}")

    if not candidates:
        _zaehle("ytdlp_ganz_leer")
        if not any(r is not None and (r.stderr or "").strip() for r in (out, retry)):
            _zaehle("ytdlp_leer_stumm")   # leer und ohne jede Meldung: verdaechtig nach stiller Sperre
        for r in (out, retry):
            if r is not None and _yt_dlp_blockiert(r.stderr):
                _blockiert()
                _zaehle("ytdlp_blockiert")
        data = _youtube_api("search", {"part": "snippet", "q": f"{artist} {title}", "type": "video", "maxResults": "5"})
        for item in (data or {}).get("items", []):
            vid = (item.get("id") or {}).get("videoId")
            sn = item.get("snippet") or {}
            if vid:
                candidates.append({"id": vid, "title": sn.get("title", ""), "channel": sn.get("channelTitle", ""),
                                   "upload_date": (sn.get("publishedAt") or "")[:10].replace("-", "")})
        if candidates:
            print("  (YouTube-API statt yt-dlp)")
    return candidates


def search_youtube(artist, title):
    """GitHub-Actions-Runner-IPs werden von YouTube haeufiger als
    "verdaechtig" eingestuft als ein normaler Heim-/Browser-Zugriff (das ist
    der Grund, warum manuell auf youtube.com sofort Treffer da sind, wo der
    Workflow "kein YouTube-Link gefunden" meldet) -- der Standard-yt-dlp-
    Client bekommt in dem Fall oft eine leere/blockierte Antwort statt eines
    Fehlers. Deshalb: bei leerem Ergebnis mit dem Android-Client erneut
    versuchen (umgeht die Bot-Pruefung meist, laeuft ueber eine andere
    YouTube-API-Oberflaeche) -- und im endgueltigen Fehlerfall stderr loggen,
    damit ein echter Blocker (statt "Song existiert wirklich nicht") in den
    Action-Logs sichtbar ist, statt stillschweigend zu verschwinden.
    """
    global _NUR_KURZE
    _NUR_KURZE = False
    candidates = _youtube_candidates(artist, title)
    if not candidates:
        return None
    lang = [c for c in candidates
            if not (isinstance(c.get("duration"), (int, float)) and c["duration"] < MIN_DAUER_S)]
    if not lang:
        _NUR_KURZE = True
        return None
    candidates = lang
    # VEVO-Kanaele bevorzugen (Standing Rule aus dem Projekt: beste Qualitaet).
    for c in candidates:
        channel = (c.get("channel") or c.get("uploader") or "").lower()
        if "vevo" in channel:
            return c.get("id")
    return candidates[0].get("id")


def _words(text):
    return {w for w in re.findall(r"[a-z0-9]+", (text or "").lower()) if len(w) > 2}


def youtube_match(artist, title):
    """Bestes YouTube-Video, das wirklich zum Song passt: mind. die Haelfte der Titelwoerter und
    ein Interpret-Wort im Videotitel/Kanalnamen. Sonst None (lieber nichts als ein falsches Video)."""
    tw, aw = _words(title), _words(artist)
    good = []
    for c in _youtube_candidates(artist, title):
        hay = _words((c.get("title") or "") + " " + (c.get("channel") or c.get("uploader") or ""))
        t_hit = not tw or len(tw & hay) >= max(1, len(tw) // 2)
        a_hit = not aw or bool(aw & hay)
        if t_hit and a_hit and c.get("id"):
            good.append(c)
    for c in good:
        if "vevo" in (c.get("channel") or c.get("uploader") or "").lower():
            return c
    return good[0] if good else None


def _upload_year(yt_id):
    data = _youtube_api("videos", {"part": "snippet", "id": yt_id})
    for item in (data or {}).get("items", []):
        m = re.match(r"(\d{4})", (item.get("snippet") or {}).get("publishedAt") or "")
        if m:
            return int(m.group(1))
    out = _yt_dlp_search(f"https://www.youtube.com/watch?v={yt_id}")
    if out is None:
        return None
    for line in out.stdout.splitlines():
        try:
            m = re.match(r"(\d{4})", json.loads(line).get("upload_date") or "")
            if m:
                return int(m.group(1))
        except Exception:
            continue
    return None


def fallback_release(artist, title, entry):
    """Discogs kennt den Song nicht: Jahr + Tags von MusicBrainz, das Video von YouTube.
    Liefert ein Discogs-aehnliches release-Dict oder None (dann bleibt der Eintrag in der Warteliste).
    Hat auch MusicBrainz kein Jahr, zaehlt als letzte Notloesung das YouTube-Upload-Jahr."""
    mb = None
    try:
        import musicbrainz_lookup
        mb = musicbrainz_lookup.lookup(artist, title)
    except Exception as e:
        print(f"  MusicBrainz-Abfrage fehlgeschlagen: {e}")
    yt_id = valid_yt_id(entry.get("yt"))
    cand = None
    if not yt_id:
        cand = youtube_match(artist, title)
        if not cand:
            print("  weder Discogs noch YouTube kennen den Song, bleibt in der Warteliste")
            return None
        yt_id = cand["id"]
    year, quelle = (mb or {}).get("year"), "musicbrainz"
    if not year:
        m = re.match(r"(\d{4})", (cand or {}).get("upload_date") or "")
        year = int(m.group(1)) if m else _upload_year(yt_id)
        quelle = "youtube-upload"
    if not year:
        print("  kein Jahr zu ermitteln, bleibt in der Warteliste")
        return None
    print(f"  Discogs ohne Treffer -> Jahr {year} ({quelle}), Video {yt_id}")
    return {"year": year, "genres": [], "styles": ((mb or {}).get("tags") or [])[:5], "country": None,
            "labels": [], "images": [], "uri": None, "community": {}, "_yt": yt_id, "_quelle": quelle}


def pick_bucket(catalog_data, discogs_release_data):
    style_words = " ".join(discogs_release_data.get("styles") or []).lower()
    genre_words = " ".join(discogs_release_data.get("genres") or []).lower()
    haystack = style_words + " " + genre_words
    # Zuerst nach den hinterlegten Styles einsortieren (03.11.2026), damit "Ohne" nicht wieder anwaechst.
    # Unklar -> weiter wie bisher; bleibt am Ende "Ohne", wird von Hand einsortiert.
    if "Ohne" in catalog_data:
        try:
            import genre_einsortieren
            z = genre_einsortieren.kategorie(discogs_release_data.get("styles"), {k for k in catalog_data if k != "Ohne"}, discogs_release_data.get("genres"))
            if z:
                return z
        except Exception as e:
            print(f"  Hinweis: Style-Einsortierung nicht moeglich ({e})")
    for bucket_name in catalog_data.keys():
        if bucket_name == "Ohne":
            continue
        # simple normalisierter Vergleich: Bucket-Name (CamelCase) in
        # lesbare Woerter zerlegen und gegen Discogs-Styles/-Genres pruefen.
        readable = re.sub(r"(?<!^)(?=[A-Z])", " ", bucket_name).lower()
        words = [w for w in readable.split() if len(w) > 2]
        if words and all(w in haystack for w in words):  # "electro" trifft bewusst auch "electronic" (gleiche Sache)
            return bucket_name
    return "Ohne"


def humanize_bucket(name):
    """Nur fuer das Anzeige-Feld 'g' (Genre) manuell zugeordneter Songs --
    z.B. 'SynthPop' -> 'Synth Pop'. Der Bucket-KEY selbst bleibt unveraendert
    (camelCase, siehe DECADE_GENRES im Frontend/shared/manualadd.js)."""
    return re.sub(r"(?<!^)(?=[A-Z])", " ", name or "").strip()


def song_id(artist, title):
    return (artist or "").strip().lower(), (title or "").strip().lower()


# --- Dublettenpruefung mit mehreren Indizien (eingebaut 07.11.2026) -------------------------------
# Ein Lied gilt als schon vorhanden, wenn (a) Titel (ohne Klammern/B-Seite) und Interpret (inkl. feat./&,
# Namensanfang erlaubt) gleich sind UND dieselbe Versions-Marke tragen (Remix/Live/Version/... bleiben
# eigene Lieder), oder (b) die YouTube-ID schon im Katalog steht UND zum selben Titel gehoert.
# Gepruefte Messung (Trockenlauf 07.11.): erkennt 120 von 121 bekannten Dubletten, alte Regel 92.
import unicodedata
from collections import defaultdict

_VERSION_RE = re.compile(r"remix|version|\blive\b|\bedit\b|\bmix\b|remaster|reprise|acoustic|instrumental|unplugged|demo|cover", re.I)


def _deacc(text):
    return "".join(c for c in unicodedata.normalize("NFKD", text or "") if not unicodedata.combining(c)).lower()


def _akey(artist):
    return re.sub(r"\(\d+\)", "", _deacc(artist)).replace("*", "")


def _tkey(title):
    t = _deacc(title)
    t = re.sub(r"[\(\[][^\)\]]*[\)\]]", " ", t)
    t = re.split(r"\s-\s|\s/\s", t)[0]
    return re.sub(r"[^a-z0-9]", "", t)


def _version_marke(title):
    return frozenset(m.lower() for m in _VERSION_RE.findall(title or ""))


def neuer_index():
    return dubletten.Index()


def _idx_add(index, artist, title, yt, fach=None):
    index.add(artist, title, yt, fach)


def ist_dublette(artist, title, yt, index):
    return index.ist_dublette(artist, title, yt)


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


def _fehlversuch(entry):
    """Zaehlt eine Nacht ohne Treffer (YouTube/Discogs) am Eintrag mit.
    Hat YouTube die Anfrage nur abgelehnt (429, Bot-Pruefung, Limit), war es keine echte Nacht ohne Treffer."""
    if _SUCHE_BLOCKIERT:
        print("  (YouTube hat die Anfrage abgelehnt: zaehlt nicht als Fehlversuch)")
        return entry
    entry["versuche"] = int(entry.get("versuche") or 0) + 1
    return entry


def _abspalten(eintraege):
    """Trennt Eintraege, die MAX_VERSUCHE Naechte erfolglos blieben (Nutzer-Korrekturen ausgenommen), von der Warteliste.
    Die aufgegebenen kommen in queue/fehlende-lieder-aufgegeben.json (nichts geht verloren, kein Dauerlauf mehr)."""
    bleiben, auf = [], []
    for e in eintraege:
        if int(e.get("versuche") or 0) >= MAX_VERSUCHE and not (e.get("g") and e.get("y")):
            auf.append(e)
        else:
            bleiben.append(e)
    if auf:
        alt = load_json(AUFGEGEBEN_PATH) if os.path.exists(AUFGEGEBEN_PATH) else []
        bekannt = {song_id(x.get("a"), x.get("t")) for x in alt}
        for e in auf:
            if song_id(e.get("a"), e.get("t")) not in bekannt:
                alt.append(e)
                bekannt.add(song_id(e.get("a"), e.get("t")))
        save_json(AUFGEGEBEN_PATH, alt)
        print(f"{len(auf)} Eintraege nach {MAX_VERSUCHE} erfolglosen Naechten in die Aufgegeben-Liste verschoben.")
    return bleiben


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

    def _is_quick_genre_fix(e):
        g = e.get("g")
        y = e.get("y")
        has_g = isinstance(g, str) and g.strip()
        has_y = isinstance(y, bool) is False and (
            (isinstance(y, (int, float)))
            or (isinstance(y, str) and y.strip().isdigit())
        )
        return bool(has_g and has_y)

    # Vorab-Bereinigung: Eintraege raus, die (Interpret, Titel) zufolge SCHON
    # in IRGENDEINER Dekaden-songs.json stehen -- kann passieren, wenn
    # derselbe Song mehrfach in die Warteliste gerutscht ist, oder wenn ein
    # frueherer Lauf ihn bereits eingetragen hat (die Datenbank-Pruefung
    # weiter unten schaut sonst NUR im per Discogs-Jahr geratenen EINEN
    # Dekaden-Bucket nach, nicht dekadenuebergreifend -- ein Song, der z.B.
    # unter einem leicht anderen Jahr schon in einer NACHBAR-Dekade steckt,
    # wuerde sonst jeden Tag aufs Neue (erfolglos oder als echtes Duplikat)
    # verarbeitet). Manuelle Genre-Korrekturen sind ausgenommen -- die
    # SOLLEN einen bereits vorhandenen Katalog-Song finden, das ist ihr Zweck.
    all_catalog_ids = set()
    KIDX = neuer_index()
    for _, _, catalog_path_rel in DECADE_CATALOGS:
        catalog_path_abs = os.path.join(ROOT, catalog_path_rel)
        if not os.path.exists(catalog_path_abs):
            continue
        try:
            catalog_data = load_json(catalog_path_abs)
        except Exception:
            continue
        for fach, songs_list in catalog_data.items():
            for s in songs_list:
                if fach != "Karaoke":  # Karaoke-Fassungen sind eigene Eintraege, keine Dubletten
                    all_catalog_ids.add(song_id(s.get("a"), s.get("t")))
                _idx_add(KIDX, s.get("a"), s.get("t"), s.get("yt"), fach)

    cleaned_queue = []
    dropped = 0
    for e in queue:
        if not _is_quick_genre_fix(e):
            a = (e.get("a") or "").strip()
            t = (e.get("t") or "").strip()
            if a and t and (song_id(a, t) in all_catalog_ids or ist_dublette(a, t, e.get("yt"), KIDX)):
                dropped += 1
                continue
        cleaned_queue.append(e)
    if dropped:
        print(f"{dropped} Eintraege waren schon dekadenuebergreifend im Katalog, "
              f"vorab aus der Warteliste entfernt.")
        save_json(QUEUE_PATH, cleaned_queue)
    queue = cleaned_queue
    if not queue:
        print("Warteliste nach Bereinigung leer.")
        return

    # Genre-Korrekturen (kommen vom "Genre bearbeiten"-Button bei Songs im
    # Bucket "Ohne", siehe shared/decades.js submitGenreFix) sind praktisch
    # kostenlos -- der Song existiert schon im Katalog, es wird nur der
    # Bucket verschoben, keine Discogs-/YouTube-Suche noetig. Ohne diese
    # Priorisierung wuerden sie stur in Einfuege-Reihenfolge verarbeitet und
    # koennten bei einer grossen Warteliste (z.B. nach einem Batch-Import)
    # tagelang hinter tausenden ratenlimitierten Neuentdeckungen feststecken
    # -- obwohl die UI "erscheint spaetestens am naechsten Tag" verspricht.
    # Deshalb: erst alle schnellen Korrekturen, dann der Rest in
    # urspruenglicher Reihenfolge. (_is_quick_genre_fix ist jetzt weiter
    # oben definiert, wird auch von der Vorab-Bereinigung gebraucht.)
    quick_entries = [e for e in queue if _is_quick_genre_fix(e)]
    other_entries = [e for e in queue if not _is_quick_genre_fix(e)]
    if quick_entries and other_entries:
        print(f"{len(quick_entries)} Genre-Korrektur(en) vorgezogen, "
              f"{len(other_entries)} Neuentdeckungen folgen danach.")
    queue = quick_entries + other_entries

    remaining = []
    changed_catalogs = {}  # path -> data (nur einmal geladen/geschrieben)

    # Sicherheitsnetz fuer grosse Wartelisten (z.B. Batch-Importe mit
    # tausenden Eintraegen): GitHub Actions killt den Job nach 6h
    # Default-Timeout hart ab, OHNE dass dieses Skript noch etwas
    # speichern koennte -- bisher wurde NUR ganz am Ende der kompletten
    # Schleife gespeichert, ein Timeout haette also den GESAMTEN
    # Fortschritt dieses Laufs verworfen. Ab hier: regelmaessig
    # zwischenspeichern und rechtzeitig VOR dem Timeout selbst kontrolliert
    # aufhoeren -- die restlichen Eintraege bleiben einfach in der
    # Warteliste fuer den naechsten taeglichen Lauf, kein Datenverlust,
    # nur ueber mehrere Tage verteilt.
    start_time = time.time()
    time_budget = float(os.environ.get("QUEUE_TIME_BUDGET_SECONDS", "19800"))  # 5.5h
    save_interval = 300  # Sekunden zwischen Zwischenspeicherungen
    last_save = start_time

    def save_progress(remaining_tail):
        for path_rel, data in changed_catalogs.items():
            save_json(os.path.join(ROOT, path_rel), data)
        save_json(QUEUE_PATH, _abspalten(remaining + remaining_tail))

    for i, entry in enumerate(queue):
        _suche_zuruecksetzen()
        now = time.time()
        if now - start_time > time_budget:
            print(f"Zeitbudget ({time_budget:.0f}s) erreicht, breche kontrolliert ab -- "
                  f"restliche {len(queue) - i} Eintraege bleiben in der Warteliste fuer den naechsten Lauf.")
            save_progress(queue[i:])
            _bilanz_ausgeben()
            print(f"Fertig (Zeitlimit). {i - len(remaining)} von {len(queue)} Eintraegen "
                  f"verarbeitet, {len(queue) - (i - len(remaining))} bleiben in der Warteliste.")
            return
        if now - last_save > save_interval:
            save_progress(queue[i:])
            last_save = now
            print(f"  Zwischenstand gespeichert ({i}/{len(queue)} durchlaufen)")
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

                # Nutzerwunsch (13.9.): "endgueltiges Entfernen" eines Songs
                # aus dem Song-Info-Modal (siehe shared/decades.js
                # submitSongRemoval) -- kommt ueber denselben Proxy/dieselbe
                # Warteliste wie die Genre-Korrektur, erkennbar am reservierten
                # Sentinel-Wert REMOVE_SENTINEL statt eines echten Genre-Keys.
                # Der Song wird ueberall im Katalog dieser Dekade gesucht
                # (per song_id) und komplett geloescht -- NICHT nur in einen
                # anderen Bucket verschoben. Kein Zurueckholen moeglich, daher
                # bewusst nur per exaktem (Artist, Titel)-Treffer.
                if manual_genre == REMOVE_SENTINEL:
                    wanted_id = song_id(artist, title)
                    removed = False
                    for bucket_name, songs_list in list(catalog_data.items()):
                        for i, s in enumerate(songs_list):
                            if song_id(s.get("a"), s.get("t")) == wanted_id:
                                songs_list.pop(i)
                                removed = True
                                print(f"  entfernt aus {catalog_path_rel} / {bucket_name} (Nutzer-Meldung: falsches/kein Video)")
                                break
                        if removed:
                            break
                    if not removed:
                        print(f"  nicht gefunden in {catalog_path_rel} (schon entfernt?), wird aus der Warteliste genommen")
                    continue

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
                    remaining.append(_fehlversuch(entry))
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
                release = fallback_release(artist, title, entry)
                if not release:
                    remaining.append(_fehlversuch(entry))
                    continue

            catalog_path_rel = catalog_path_for_year(release["year"])
            if not catalog_path_rel:
                print(f"  Jahr {release['year']} passt zu keiner Dekaden-Kategorie, bleibt in der Warteliste")
                remaining.append(_fehlversuch(entry))
                continue

            yt_id = release.get("_yt") or valid_yt_id(entry.get("yt")) or search_youtube(artist, title)
            vk_url = valid_vk_url(entry.get("vk"))
            if not yt_id and not vk_url and _NUR_KURZE:
                print(f"  alle YouTube-Treffer kuerzer als {MIN_DAUER_S} s -> kein Lied, wird aus der Warteliste entfernt")
                continue
            if not yt_id and not vk_url:
                print("  kein YouTube-Link und kein VK-Link gefunden, bleibt in der Warteliste")
                remaining.append(_fehlversuch(entry))
                continue

            catalog_path_abs = os.path.join(ROOT, catalog_path_rel)
            if catalog_path_rel not in changed_catalogs:
                changed_catalogs[catalog_path_rel] = load_json(catalog_path_abs)
            catalog_data = changed_catalogs[catalog_path_rel]

            existing_ids = {song_id(s.get("a"), s.get("t")) for lst in catalog_data.values() for s in lst}
            if song_id(artist, title) in existing_ids or ist_dublette(artist, title, yt_id, KIDX):
                print("  ist schon in der Datenbank (oder als Dublette erkannt), wird aus der Warteliste entfernt")
                continue  # erfolgreich (schon vorhanden) -> aus Warteliste

            bucket = pick_bucket(catalog_data, release)
            song = build_song_entry(artist, title, release, yt_id, vk_url)
            if release.get("_quelle"):
                song["src"] = "fallback-" + release["_quelle"]  # nicht von Discogs
            catalog_data.setdefault(bucket, []).append(song)
            print(f"  hinzugefuegt zu {catalog_path_rel} / {bucket}")
            _idx_add(KIDX, artist, title, yt_id)
            # erfolgreich verarbeitet -> NICHT zu remaining hinzufuegen
        except Exception as e:
            print(f"  Fehler bei Eintrag, bleibt in der Warteliste: {e}")
            remaining.append(entry)

    for path_rel, data in changed_catalogs.items():
        save_json(os.path.join(ROOT, path_rel), data)

    remaining = _abspalten(remaining)
    save_json(QUEUE_PATH, remaining)
    _bilanz_ausgeben()
    print(f"Fertig. {len(queue) - len(remaining)} von {len(queue)} Eintraegen verarbeitet, {len(remaining)} bleiben in der Warteliste.")


if __name__ == "__main__":
    main()
