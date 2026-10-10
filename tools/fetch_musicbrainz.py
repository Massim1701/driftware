#!/usr/bin/env python3
"""Singles eines oder mehrerer Jahre aus der MusicBrainz-Suche (release-group,
primarytype:single AND firstreleasedate:<Jahr>) als CSV listen:
data/musicbrainz/<jahr>.csv mit den Spalten
jahr, erstveroeffentlichung, interpret, titel, mbid.

Quelle: MusicBrainz (https://musicbrainz.org), Daten CC0 -- siehe
data/musicbrainz/README.md.

Die Suche liefert pro Abfrage hoechstens 500 Treffer (offset >= 500 -> HTTP
400, getestet 10.10.). Deshalb pro Jahr in Haeppchen zerlegt:
  1. artistname:<x>* fuer x in a-z, 0-9. Hat ein Haeppchen > 500 Treffer,
     rekursiv mit einem Buchstaben/einer Ziffer mehr verfeinern (ab*, ac*, ...)
     PLUS den exakten Begriff (artistname:a) -- sonst fielen Namensteile, die
     NUR aus dem Praefix bestehen ("A Flock of Seagulls"), durch alle
     Zweibuchstaben-Wildcards.
  2. Rest-Durchlauf: NOT (artistname:a* OR ... OR artistname:9*) -- trifft
     genau die Interpreten, deren Namensteile alle nicht mit a-z/0-9
     beginnen (praktisch: Japanisch, Kyrillisch, ...). Akzente faltet die
     Suche selbst (artistname:e* trifft auch "Echo"), die stecken also
     schon in Schritt 1.
  4. Kontrolldurchlauf ueber das ganze Jahr, geteilt nach rgid:0* ... rgid:f*
     (lueckenlos, ~250-500 Treffer je Teil), faengt den letzten Rest ein.
  3. Ist ein Haeppchen auch auf Tiefe MAX_PREFIX_LEN noch > 500 (oder der
     Rest-Durchlauf > 500), wird es lueckenlos ueber den Anfang der
     Release-Group-ID geteilt (rgid:0* ... rgid:f*, je ~1/16).
Die Suche trifft Woerter im ganzen Namen, Haeppchen ueberschneiden sich --
dedupliziert wird nach mbid.

Wiederaufnehmbar: erledigte Abfragen und bisher gesammelte Zeilen stehen in
data/musicbrainz/fortschritt/<jahr>.json; ein abgebrochener Lauf macht dort
weiter. Nach vollstaendigem Jahr wird die Fortschrittsdatei geloescht.

Aufruf: python3 tools/fetch_musicbrainz.py 1980 [1981 ...]
        python3 tools/fetch_musicbrainz.py --dekade 80
"""
import csv
import json
import os
import string
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "data", "musicbrainz")
PROGRESS_DIR = os.path.join(OUT_DIR, "fortschritt")

API_URL = "https://musicbrainz.org/ws/2/release-group/"
# MusicBrainz verlangt einen eigenen User-Agent mit Projektname + Kontakt.
USER_AGENT = "DriftwareCatalogBot/1.0 ( https://driftware.online )"
MIN_INTERVAL = 1.1  # Sekunden zwischen zwei Anfragen (Limit: 1/s)
PAGE_SIZE = 100
MAX_RESULTS = 500   # Suche liefert nie mehr als 500 Treffer pro Abfrage
MAX_PREFIX_LEN = 3  # danach Aufteilung ueber rgid statt weiterer Buchstaben
ALNUM = string.ascii_lowercase + string.digits
HEX = "0123456789abcdef"
TIME_BUDGET_SECONDS = int(os.environ.get("MB_TIME_BUDGET_SECONDS", "19800"))  # 5.5h

START_TS = time.time()
_last_request = 0.0


class TimeBudgetExceeded(Exception):
    pass


def api_get(query, offset, retries=8):
    global _last_request
    params = {"query": query, "fmt": "json", "limit": str(PAGE_SIZE), "offset": str(offset)}
    url = API_URL + "?" + urllib.parse.urlencode(params)
    for attempt in range(retries):
        if time.time() - START_TS > TIME_BUDGET_SECONDS:
            raise TimeBudgetExceeded()
        wait = MIN_INTERVAL - (time.time() - _last_request)
        if wait > 0:
            time.sleep(wait)
        _last_request = time.time()
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code in (429, 502, 503, 504):
                pause = min(5 * 2 ** attempt, 120)
                print(f"    HTTP {e.code}, warte {pause}s (Versuch {attempt + 1}/{retries}) ...")
                time.sleep(pause)
                continue
            raise RuntimeError(f"HTTP {e.code} bei Abfrage {query!r} offset {offset}: {e.read()[:200]!r}")
        except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
            pause = min(5 * 2 ** attempt, 120)
            print(f"    Netzwerkfehler ({e}), warte {pause}s ...")
            time.sleep(pause)
    raise RuntimeError(f"Abfrage {query!r} offset {offset} nach {retries} Versuchen fehlgeschlagen")


def artist_credit_name(rg):
    parts = []
    for ac in rg.get("artist-credit") or []:
        parts.append((ac.get("name") or (ac.get("artist") or {}).get("name") or "") + (ac.get("joinphrase") or ""))
    return "".join(parts).strip()


def row_from(rg, year):
    return {
        "jahr": year,
        "erstveroeffentlichung": rg.get("first-release-date") or "",
        "interpret": artist_credit_name(rg),
        "titel": (rg.get("title") or "").strip(),
        "mbid": rg.get("id"),
    }


def load_progress(year):
    path = os.path.join(PROGRESS_DIR, f"{year}.json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"done": {}, "rows": {}, "api_count": None, "requests": 0, "seconds": 0.0}


def save_progress(year, prog):
    os.makedirs(PROGRESS_DIR, exist_ok=True)
    path = os.path.join(PROGRESS_DIR, f"{year}.json")
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(prog, f, ensure_ascii=False)
    os.replace(tmp, path)


def write_csv(year, rows):
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, f"{year}.csv")
    tmp = path + ".tmp"
    ordered = sorted(rows.values(), key=lambda r: (r["interpret"].lower(), r["titel"].lower(), r["mbid"]))
    with open(tmp, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["jahr", "erstveroeffentlichung", "interpret", "titel", "mbid"])
        w.writeheader()
        w.writerows(ordered)
    os.replace(tmp, path)
    return path


class YearFetcher:
    def __init__(self, year):
        self.year = year
        self.base = f"primarytype:single AND firstreleasedate:{year}"
        self.prog = load_progress(year)
        self.stats = {"ueber_500_ohne_teilung": []}
        self.prog.setdefault("gain", {})
        self._t0 = time.time()

    def _save(self):
        self.prog["seconds"] = self.prog.get("seconds", 0.0) + (time.time() - self._t0)
        self._t0 = time.time()
        save_progress(self.year, self.prog)

    def _collect(self, data):
        new = 0
        for rg in data.get("release-groups") or []:
            if rg.get("id") and rg["id"] not in self.prog["rows"]:
                self.prog["rows"][rg["id"]] = row_from(rg, self.year)
                new += 1
        return new

    def leaf(self, label, clause):
        """Eine Abfrage komplett abholen (max. 500). Gibt die count der API
        zurueck. Bei count > 500 wird nur Seite 1 eingesammelt und der
        Aufrufer verfeinert."""
        if label in self.prog["done"]:
            return self.prog["done"][label]
        query = f"{self.base} AND {clause}"
        data = api_get(query, 0)
        self.prog["requests"] += 1
        count = data.get("count", 0)
        new = self._collect(data)
        if count <= MAX_RESULTS:
            offset = PAGE_SIZE
            while offset < count:
                data = api_get(query, offset)
                self.prog["requests"] += 1
                new += self._collect(data)
                offset += PAGE_SIZE
        kind = ("kontrolle" if label.startswith("kontrolle") else "rest" if label.startswith("rest:") else "rgid" if "|rgid:" in label
                else "exakt" if not label.endswith("*") else "buchstaben")
        self.prog["gain"][kind] = self.prog["gain"].get(kind, 0) + new
        print(f"  {label:<28} count {count:>5}  neu {new:>4}  gesamt {len(self.prog['rows'])}")
        self.prog["done"][label] = count
        self._save()
        return count

    def by_rgid(self, label, clause, prefix=""):
        for h in HEX:
            p = prefix + h
            sub_label = f"{label}|rgid:{p}"
            sub_clause = f"({clause}) AND rgid:{p}*"
            count = self.leaf(sub_label, sub_clause)
            if count > MAX_RESULTS:
                if len(p) < 3:
                    self.by_rgid(label, clause, p)
                else:
                    self.stats["ueber_500_ohne_teilung"].append((sub_label, count))

    def by_prefix(self, prefix):
        clause = f"artistname:{prefix}*"
        count = self.leaf(f"artist:{prefix}*", clause)
        if count <= MAX_RESULTS:
            return
        if len(prefix) >= MAX_PREFIX_LEN:
            self.by_rgid(f"artist:{prefix}*", clause)
            return
        # exakter Begriff (Namensteil == Praefix), faellt sonst durch
        exact = self.leaf(f"artist:{prefix}", f"artistname:{prefix}")
        if exact > MAX_RESULTS:
            self.by_rgid(f"artist:{prefix}", f"artistname:{prefix}")
        for c in ALNUM:
            self.by_prefix(prefix + c)

    def run(self):
        print(f"== {self.year} ==")
        if self.prog.get("api_count") is None:
            data = api_get(self.base, 0)
            self.prog["requests"] += 1
            self.prog["api_count"] = data.get("count", 0)
            self._collect(data)
            self._save()
        print(f"  API-count fuer {self.year}: {self.prog['api_count']}")
        for c in ALNUM:
            self.by_prefix(c)
        before_rest = len(self.prog["rows"])
        rest_clause = "NOT (" + " OR ".join(f"artistname:{c}*" for c in ALNUM) + ")"
        rest_count = self.leaf("rest:sonderzeichen", rest_clause)
        if rest_count > MAX_RESULTS:
            self.by_rgid("rest:sonderzeichen", rest_clause)
        rest_gain = len(self.prog["rows"]) - before_rest
        # Kontrolldurchlauf: ganze Jahresmenge lueckenlos ueber den rgid-Anfang
        # geteilt -- faengt ein, was die Namens-Haeppchen trotz allem verfehlen
        # (z.B. Gruppen ohne verwertbaren artistname-Begriff).
        self.by_rgid("kontrolle", self.base)
        return rest_count, rest_gain


def years_for_decade(d):
    d = str(d).strip().rstrip("er")
    start = {"70": 1970, "80": 1980, "90": 1990}.get(d)
    if not start:
        raise SystemExit(f"Unbekannte Dekade {d!r} (erlaubt: 70, 80, 90)")
    return list(range(start, start + 10))


def main():
    args = sys.argv[1:]
    if not args:
        raise SystemExit(__doc__)
    if args[0] == "--dekade":
        years = years_for_decade(args[1])
    else:
        years = [int(a) for a in args]

    summary = []
    for year in years:
        f = YearFetcher(year)
        try:
            rest_count, rest_gain = f.run()
        except TimeBudgetExceeded:
            f._save()
            print(f"Zeitbudget erreicht -- {year} unvollstaendig, Fortschritt gespeichert, naechster Lauf macht weiter.")
            break
        rows = f.prog["rows"]
        path = write_csv(year, rows)
        api_count = f.prog["api_count"]
        got = len(rows)
        pct = (100.0 * got / api_count) if api_count else 0.0
        secs = f.prog.get("seconds", 0.0)
        print(f"  -> {os.path.relpath(path, ROOT)}")
        print(f"ERGEBNIS {year}: erfasst {got} / API-count {api_count} ({pct:.1f} %), "
              f"Luecke {api_count - got}, Sonderzeichen-Durchlauf +{rest_gain} "
              f"(Rest-Abfrage count {rest_count}), Anfragen {f.prog['requests']}, Laufzeit {secs / 60:.1f} min")
        print(f"  Beitrag je Abfrageart (neue mbids): {f.prog.get('gain')}")
        if f.stats["ueber_500_ohne_teilung"]:
            print(f"  WARNUNG: trotz Teilung > 500: {f.stats['ueber_500_ohne_teilung']}")
        summary.append((year, got, api_count, rest_gain))
        os.remove(os.path.join(PROGRESS_DIR, f"{year}.json"))

    if summary:
        print("\nZUSAMMENFASSUNG")
        for year, got, api_count, rest_gain in summary:
            print(f"  {year}: {got}/{api_count} erfasst, Sonderzeichen-Durchlauf +{rest_gain}")


if __name__ == "__main__":
    main()
