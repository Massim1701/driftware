#!/usr/bin/env python3
"""MusicBrainz-CSVs (data/musicbrainz/<jahr>.csv, aus tools/fetch_musicbrainz.py)
mit dem bestehenden Katalog abgleichen und NUR fehlende Songs in die
Warteliste queue/<dekade>-erweiterung.json eintragen. Die YouTube-Suche und
das Einsortieren in <dekade>-music/songs.json macht danach wie gewohnt
tools/process_decade_queue.py (Workflow expand-decade-genres.yml).

Drei Schritte, jeweils eigener Aufruf:

  --dry-run      Nur Bericht: neu / schon vorhanden / unklar. Schreibt nichts
                 (ausser optional --bericht <pfad>.csv).
  --anreichern   Neue Songs per Discogs nachschlagen (Genre, Stil, Land, Label,
                 Cover, Discogs-Link, Sammlerzahl 'hv', Zielgruppe per
                 Discogs-Stil). Ergebnis nur nach
                 data/musicbrainz/angereichert-<dekade>.json -- Katalog und
                 Warteliste bleiben unberuehrt. Wiederaufnehmbar, Zeitbudget.
                 Braucht DISCOGS_TOKEN (Env), sonst sehr langsam.
  --eintragen --min-have N
                 Angereicherte Songs mit hv >= N an die Warteliste anhaengen,
                 alle anderen (zu selten oder bei Discogs nicht gefunden) an
                 queue/<dekade>-musicbrainz-selten.json. Vorher Backup nach
                 data/musicbrainz/backup/, danach JSON-Pruefung + Zaehlung.

Bestehende Eintraege werden nie geaendert oder geloescht -- es wird nur
angehaengt, und vor dem Schreiben wird geprueft, dass der alte Inhalt
unveraendert am Anfang der neuen Liste steht.

Abgleich (normalisiert): Kleinschreibung, Akzente entfernt, nur Buchstaben/
Ziffern, "The " am Anfang weg, "feat./ft./featuring ..." weg, Discogs-
Namenszusaetze ("Prince (2)", "Neworder*") weg. Verglichen wird gegen ALLE
Dekaden-Kataloge plus Wartelisten (nicht gegen *-notfound.json: das sind
Billboard-Hits, die Discogs nicht kannte, keine Katalog-Eintraege) (Jahre an Dekadengrenzen weichen zwischen
Discogs und MusicBrainz ab). Remixe/Versionen/Doppel-A-Seiten werden nicht
automatisch zusammengelegt, sondern als "unklar" bzw. markiert berichtet.

Aufruf: python3 tools/merge_into_json.py --dekade 80 --dry-run [--bericht x.csv]
"""
import argparse
import collections
import csv
import glob
import json
import os
import re
import shutil
import sys
import time
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))

MB_DIR = os.path.join(ROOT, "data", "musicbrainz")
BACKUP_DIR = os.path.join(MB_DIR, "backup")
DECADES = {"70": "70er", "80": "80er", "90": "90er"}
ALL_CATALOGS = ["70er", "80er", "90er", "2000er", "2010er", "2020er"]
TIME_BUDGET_SECONDS = int(os.environ.get("MERGE_TIME_BUDGET_SECONDS", "19800"))  # 5.5h
DISCOGS_MIN_INTERVAL = 1.05  # mit Token 60 Anfragen/min
SAVE_EVERY = 10
HV_STUFEN = [0, 3, 10, 20, 50, 100, 250]
START_TS = time.time()

FEAT_RE = re.compile(r"\s*[\(\[]?\s*\b(feat\.?|ft\.?|featuring)\s+[^\)\]]*[\)\]]?", re.IGNORECASE)
DISCOGS_NUM_RE = re.compile(r"\s*\(\d+\)\s*$")
PAREN_RE = re.compile(r"\s*[\(\[][^\)\]]*[\)\]]")
VERSION_RE = re.compile(
    r"\b(remix|re-?mix|mix|version|edit|live|remaster(ed)?|instrumental|dub|extended|acoustic|demo|"
    r"re-?recorded|radio|single version|12\"|7\")\b", re.IGNORECASE)


# ---------------------------------------------------------------- Normalisierung

def fold(s):
    s = unicodedata.normalize("NFKD", s or "")
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    s = s.lower().replace("&", " and ").replace("’", "'")
    return s


def alnum(s):
    return "".join(ch for ch in s if ch.isalnum())


def artist_key(a):
    a = (a or "").strip().rstrip("*")
    a = DISCOGS_NUM_RE.sub("", a)
    a = FEAT_RE.sub("", a)
    a = fold(a).strip()
    if a.startswith("the "):
        a = a[4:]
    return alnum(a)


def title_full_key(t):
    return alnum(fold(FEAT_RE.sub("", t or "")))


def title_base_key(t):
    """Titel ohne Klammerzusaetze und ohne ' - xyz Remix'-Anhang."""
    t = FEAT_RE.sub("", t or "")
    t = PAREN_RE.sub("", t)
    t = re.split(r"\s+-\s+", t)[0]
    return alnum(fold(t))


def is_version(t):
    extras = " ".join(re.findall(r"[\(\[]([^\)\]]*)[\)\]]", t or ""))
    tail = " ".join(re.split(r"\s+-\s+", t or "")[1:])
    return bool(VERSION_RE.search(extras + " " + tail))


def sides(t):
    parts = [p.strip() for p in re.split(r"\s+/\s+", t or "") if p.strip()]
    return parts if len(parts) > 1 else []


# ---------------------------------------------------------------- Daten laden

def load_json(path, default=None):
    if not os.path.exists(path):
        return default
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"), ensure_ascii=False)
    os.replace(tmp, path)


def queue_path(dek):
    return os.path.join(ROOT, "queue", f"{dek}-erweiterung.json")


def selten_path(dek):
    return os.path.join(ROOT, "queue", f"{dek}-musicbrainz-selten.json")


def staging_path(dek):
    return os.path.join(MB_DIR, f"angereichert-{dek}.json")


class CatalogIndex:
    def __init__(self):
        self.full = {}                            # (artist, title_full) -> Herkunft
        self.base = collections.defaultdict(list)  # (artist, title_base) -> [(Titel, Herkunft)]
        self.by_title = collections.defaultdict(set)  # title_full -> {artist_key}
        self.mbids = set()
        self.sizes = {}

    def add(self, a, t, origin, mb=None):
        ak = artist_key(a)
        tf = title_full_key(t)
        if not ak or not tf:
            return
        self.full.setdefault((ak, tf), origin)
        self.base[(ak, title_base_key(t))].append((t, origin))
        self.by_title[tf].add(ak)
        if mb:
            self.mbids.add(mb)

    @classmethod
    def build(cls):
        idx = cls()
        for dek in ALL_CATALOGS:
            path = os.path.join(ROOT, f"{dek}-music", "songs.json")
            data = load_json(path, {}) or {}
            n = 0
            for bucket, songs in data.items():
                if not isinstance(songs, list):
                    continue
                for s in songs:
                    idx.add(s.get("a"), s.get("t"), f"{dek}-music/{bucket}", s.get("mb"))
                    n += 1
            idx.sizes[f"{dek}-music/songs.json"] = n
            for qp, label in ((queue_path(dek), f"queue/{dek}-erweiterung"),
                              (selten_path(dek), f"queue/{dek}-musicbrainz-selten")):
                q = load_json(qp, []) or []
                for c in q:
                    idx.add(c.get("a"), c.get("t"), label, c.get("mb"))
                if q:
                    idx.sizes[label] = len(q)
        return idx


def read_csvs(dek):
    start = 1900 + int(dek[:2])
    rows, missing = [], []
    for y in range(start, start + 10):
        p = os.path.join(MB_DIR, f"{y}.csv")
        if not os.path.exists(p):
            missing.append(y)
            continue
        with open(p, "r", encoding="utf-8", newline="") as f:
            rows.extend(csv.DictReader(f))
    return rows, missing


# ---------------------------------------------------------------- Abgleich

def classify(rows, idx):
    """Liefert Liste von dicts mit status neu / vorhanden / unklar / dublette."""
    out = []
    seen = {}
    rows = sorted(rows, key=lambda r: (r.get("erstveroeffentlichung") or r["jahr"], r["mbid"]))
    for r in rows:
        a, t, mb = r["interpret"], r["titel"], r["mbid"]
        ak, tf, tb = artist_key(a), title_full_key(t), title_base_key(t)
        res = dict(r, status="", grund="", treffer="", version="ja" if is_version(t) else "")
        if not ak or not tf:
            res.update(status="unklar", grund="Interpret/Titel nach Normalisierung leer (nur Sonderzeichen)")
        elif mb in idx.mbids:
            res.update(status="vorhanden", grund="MBID schon im Katalog")
        elif (ak, tf) in idx.full:
            res.update(status="vorhanden", grund="Interpret+Titel gleich", treffer=idx.full[(ak, tf)])
        elif sides(t) and all((ak, title_full_key(x)) in idx.full for x in sides(t)):
            res.update(status="vorhanden", grund="Doppel-A-Seite, beide Seiten im Katalog")
        elif (ak, tf) in seen:
            res.update(status="dublette", grund="gleicher Song mehrfach in MusicBrainz (Neuauflage)", treffer=seen[(ak, tf)])
        else:
            base_hits = [h for h in idx.base.get((ak, tb), []) if title_full_key(h[0]) != tf]
            side_hits = [s for s in sides(t) if (ak, title_full_key(s)) in idx.full]
            similar = [x for x in idx.by_title.get(tf, ())
                       if x != ak and len(x) > 3 and len(ak) > 3 and (x in ak or ak in x)]
            if base_hits:
                res.update(status="unklar", grund="andere Fassung im Katalog (Remix/Version?)",
                           treffer=" | ".join(f"{h[0]} [{h[1]}]" for h in base_hits[:3]))
            elif side_hits:
                res.update(status="unklar", grund="Doppel-A-Seite, eine Seite schon im Katalog",
                           treffer=" | ".join(side_hits))
            elif similar:
                res.update(status="unklar", grund="gleicher Titel, aehnlicher Interpret", treffer=" | ".join(sorted(similar)[:3]))
            else:
                res.update(status="neu", grund="Doppel-A-Seite" if sides(t) else "")
        if res["status"] in ("neu", "unklar") and ak and tf:
            seen.setdefault((ak, tf), mb)
        out.append(res)
    return out


def print_report(dek, results, missing_years, idx, bericht=None):
    c = collections.Counter(r["status"] for r in results)
    print(f"\n=== Bericht {dek} ===")
    if missing_years:
        print(f"WARNUNG: keine CSV fuer {missing_years}")
    print("Katalog/Wartelisten geladen:", ", ".join(f"{k}={v}" for k, v in idx.sizes.items()))
    print(f"MusicBrainz-Zeilen: {len(results)}")
    for st in ("neu", "vorhanden", "unklar", "dublette"):
        print(f"  {st:<10} {c.get(st, 0)}")
    neu = [r for r in results if r["status"] == "neu"]
    print(f"  davon neu und als Version/Remix markiert: {sum(1 for r in neu if r['version'])}")
    print(f"  davon neu und Doppel-A-Seite: {sum(1 for r in neu if r['grund'] == 'Doppel-A-Seite')}")
    per_year = collections.Counter(r["jahr"] for r in neu)
    print("  neu je Jahr:", dict(sorted(per_year.items())))
    gc = collections.Counter(r["grund"] for r in results if r["status"] == "unklar")
    print("  unklar nach Grund:", dict(gc))
    for st in ("unklar", "neu"):
        sample = [r for r in results if r["status"] == st][:15]
        print(f"\n  Beispiele {st}:")
        for r in sample:
            extra = f"  -> {r['treffer']}" if r["treffer"] else ""
            print(f"    {r['jahr']} | {r['interpret']} - {r['titel']} ({r['grund'] or '-'}){extra}")
    if bericht:
        with open(bericht, "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=["status", "grund", "version", "jahr", "erstveroeffentlichung",
                                              "interpret", "titel", "mbid", "treffer"])
            w.writeheader()
            for r in results:
                w.writerow({k: r.get(k, "") for k in w.fieldnames})
        print(f"\nBericht-CSV: {bericht}")


# ---------------------------------------------------------------- Discogs

def setup_discogs():
    import fetch_billboard_hits as fb
    import process_missing_queue as pm
    fb.MIN_HAVE = 0  # Sammlerzahl entscheidet hier erst --eintragen --min-have
    orig = fb.api_get
    state = {"last": 0.0}

    def throttled(url, retries=5):
        wait = DISCOGS_MIN_INTERVAL - (time.time() - state["last"])
        if wait > 0:
            time.sleep(wait)
        state["last"] = time.time()
        return orig(url, retries)

    fb.api_get = throttled
    return fb, pm


def build_candidate(r, release, bucket):
    year = r["jahr"]
    try:
        year = int(year)
    except (TypeError, ValueError):
        pass
    return {
        "id": release.get("id"),
        "a": r["interpret"],
        "t": r["titel"],
        "y": year,
        "g": ", ".join(release.get("genre") or []),
        "s": ", ".join(release.get("style") or []),
        "c": release.get("country"),
        "l": ", ".join(release.get("label") or []),
        "th": release.get("thumb") or None,
        "cv": release.get("cover_image") or None,
        "u": "https://www.discogs.com" + (release.get("uri") or ""),
        "hv": (release.get("community") or {}).get("have", 0),
        "genre_key": bucket,
        "src": "musicbrainz",
        "mb": r["mbid"],
    }


def hv_verteilung(staged):
    found = [v["cand"]["hv"] for v in staged.values() if v.get("status") == "gefunden"]
    nf = sum(1 for v in staged.values() if v.get("status") == "nicht_gefunden")
    print(f"\nDiscogs: {len(found)} gefunden, {nf} nicht gefunden")
    for s in HV_STUFEN:
        print(f"  hv >= {s:<4}: {sum(1 for h in found if h >= s)}")


def anreichern(dek, results):
    if not os.environ.get("DISCOGS_TOKEN"):
        print("WARNUNG: kein DISCOGS_TOKEN gesetzt -- unauthentifiziert sehr langsam und ohne Cover.")
    fb, pm = setup_discogs()
    catalog = load_json(os.path.join(ROOT, f"{dek}-music", "songs.json"), {})
    sp = staging_path(dek)
    staged = load_json(sp, {}) or {}
    todo = [r for r in results if r["status"] == "neu" and r["mbid"] not in staged]
    print(f"\nAnreichern {dek}: {len(todo)} offen, {len(staged)} schon erledigt")
    done = 0
    for r in todo:
        if time.time() - START_TS > TIME_BUDGET_SECONDS:
            print("Zeitbudget erreicht, Rest folgt im naechsten Lauf.")
            break
        release = fb.discogs_search_release(r["interpret"], r["titel"])
        if not release and sides(r["titel"]):
            release = fb.discogs_search_release(r["interpret"], sides(r["titel"])[0])
        if release:
            bucket = pm.pick_bucket(catalog, {"styles": release.get("style"), "genres": release.get("genre")})
            cand = build_candidate(r, release, bucket)
            staged[r["mbid"]] = {"status": "gefunden", "cand": cand}
            print(f"  + {r['interpret']} - {r['titel']} -> {bucket}, hv {cand['hv']}")
        else:
            staged[r["mbid"]] = {"status": "nicht_gefunden",
                                 "row": {k: r[k] for k in ("jahr", "erstveroeffentlichung", "interpret", "titel", "mbid")}}
            print(f"  - {r['interpret']} - {r['titel']}: bei Discogs nicht gefunden")
        done += 1
        if done % SAVE_EVERY == 0:
            save_json(sp, staged)
    save_json(sp, staged)
    rest = sum(1 for r in results if r["status"] == "neu" and r["mbid"] not in staged)
    print(f"Fertig fuer diesen Lauf: {done} nachgeschlagen, {rest} noch offen.")
    hv_verteilung(staged)


# ---------------------------------------------------------------- Eintragen

def backup(path):
    if not os.path.exists(path):
        return None
    os.makedirs(BACKUP_DIR, exist_ok=True)
    stamp = time.strftime("%Y%m%d-%H%M%S")
    dst = os.path.join(BACKUP_DIR, f"{os.path.basename(path)[:-5]}-{stamp}.json")
    shutil.copy2(path, dst)
    return dst


def append_checked(path, new_items):
    if not new_items:
        print(f"  {os.path.relpath(path, ROOT)}: nichts anzuhaengen, unveraendert")
        return
    old = load_json(path, []) or []
    if not isinstance(old, list):
        raise SystemExit(f"{path} ist keine Liste -- Abbruch, nichts geschrieben.")
    b = backup(path)
    merged = old + new_items
    save_json(path, merged)
    check = load_json(path)  # JSON-Gueltigkeit
    if check[:len(old)] != old or len(check) != len(old) + len(new_items):
        raise SystemExit(f"Pruefung fehlgeschlagen fuer {path} -- Backup: {b}")
    print(f"  {os.path.relpath(path, ROOT)}: vorher {len(old)}, nachher {len(check)} (+{len(new_items)}), "
          f"Backup {os.path.relpath(b, ROOT) if b else '-'}")


def eintragen(dek, results, min_have):
    staged = load_json(staging_path(dek), {}) or {}
    if not staged:
        raise SystemExit("Keine angereicherten Daten -- zuerst --anreichern laufen lassen.")
    still_new = {r["mbid"] for r in results if r["status"] == "neu"}
    to_queue, to_selten = [], []
    for mb, v in staged.items():
        if mb not in still_new:
            continue  # inzwischen im Katalog/in einer Warteliste
        if v.get("status") == "gefunden" and (v["cand"].get("hv") or 0) >= min_have:
            to_queue.append(v["cand"])
        elif v.get("status") == "gefunden":
            to_selten.append(v["cand"])
        else:
            row = v["row"]
            to_selten.append({"a": row["interpret"], "t": row["titel"], "y": int(row["jahr"]),
                              "mb": mb, "src": "musicbrainz", "discogs": "nicht gefunden"})
    print(f"\nEintragen {dek} (min-have {min_have}): {len(to_queue)} in die Warteliste, "
          f"{len(to_selten)} in die Selten-Liste, {len(still_new) - len(to_queue) - len(to_selten)} neu, aber noch nicht angereichert")
    append_checked(queue_path(dek), to_queue)
    append_checked(selten_path(dek), to_selten)


def main():
    ap = argparse.ArgumentParser(description="MusicBrainz-CSVs mit dem Katalog abgleichen")
    ap.add_argument("--dekade", required=True, choices=sorted(DECADES))
    mode = ap.add_mutually_exclusive_group(required=True)
    mode.add_argument("--dry-run", action="store_true")
    mode.add_argument("--anreichern", action="store_true")
    mode.add_argument("--eintragen", action="store_true")
    ap.add_argument("--min-have", type=int)
    ap.add_argument("--bericht", help="Bericht zusaetzlich als CSV schreiben (Pfad)")
    args = ap.parse_args()
    if args.eintragen and args.min_have is None:
        ap.error("--eintragen braucht --min-have N")

    dek = DECADES[args.dekade]
    rows, missing = read_csvs(dek)
    if not rows:
        raise SystemExit(f"Keine CSVs fuer {dek} in data/musicbrainz/")
    idx = CatalogIndex.build()
    results = classify(rows, idx)
    print_report(dek, results, missing, idx, args.bericht)
    if args.anreichern:
        anreichern(dek, results)
    elif args.eintragen:
        eintragen(dek, results, args.min_have)


if __name__ == "__main__":
    main()
