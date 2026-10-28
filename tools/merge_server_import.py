#!/usr/bin/env python3
"""Uebernimmt die Treffer des Server-Imports (~/import/out/*.ok.jsonl auf fornetta, Format
{"c": {a,t,y,g,s,c,l,...,genre_key,dec}, "yt", "th", ...}) in die Kataloge und raeumt die Wartelisten auf.

- Ziel: <dec>-music/songs.json, Kategorie c.genre_key; Chillhouse-Dateien (chill_*) -> chillhouse-music.
- Nicht uebernommen: Video-ID oder Interpret+Titel schon irgendwo im Katalog, doppelt im Import,
  ohne Genre oder Genre "Ohne", Ziel-Katalog unbekannt.
- Danach: die Dekaden-Wartelisten queue/<dekade>-erweiterung.json verlieren alle Eintraege, die jetzt im Katalog derselben Dekade stehen.
- Schreibformat jeder Datei bleibt erhalten. Fuer die neuen Eintraege: kein Land/Label/Stil, wenn der
  Import keine hatte (die ergaenzt tools/anreichern_lieder.py).

Aufruf: python3 tools/merge_server_import.py <ordner-mit-ok.jsonl | datei.ok.jsonl ...> [--dry]
"""
import argparse
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FORMATE = [dict(separators=(",", ":"), ensure_ascii=False), dict(ensure_ascii=False), dict(indent=2, ensure_ascii=False)]


def erkenne_format(raw, data, name):
    for kw in FORMATE:
        s = json.dumps(data, **kw)
        if s == raw or s + "\n" == raw:
            return kw, raw.endswith("\n")
    raise SystemExit(f"Unbekanntes Schreibformat bei {name} -- nichts geschrieben.")


def norm(s):
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def jahr(y):
    try:
        return int(y)
    except (TypeError, ValueError):
        return y


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("quellen", nargs="+")
    ap.add_argument("--dry", action="store_true")
    args = ap.parse_args()

    dateien = []
    for q in args.quellen:
        dateien += sorted(glob.glob(os.path.join(q, "*.ok.jsonl"))) if os.path.isdir(q) else [q]

    kat = {}
    for path in sorted(glob.glob(os.path.join(ROOT, "*-music", "songs.json"))):
        raw = open(path, encoding="utf-8").read()
        data = json.loads(raw)
        kat[path] = (data, erkenne_format(raw, data, path))
    yts, keys = set(), set()
    for data, _ in kat.values():
        for lst in data.values():
            for s in lst:
                yts.add(s.get("yt"))
                keys.add(norm(s["a"]) + "|" + norm(s["t"]))

    neu, uebersprungen = {}, {}
    gesehen = set()

    def skip(grund):
        uebersprungen[grund] = uebersprungen.get(grund, 0) + 1

    for f in dateien:
        chill = os.path.basename(f).startswith("chill")
        for zeile in open(f, encoding="utf-8"):
            try:
                r = json.loads(zeile)
            except ValueError:
                continue
            c, yt = r["c"], r.get("yt")
            k = norm(c["a"]) + "|" + norm(c["t"])
            if not yt or yt in yts or yt in gesehen:
                skip("Video schon vorhanden")
                continue
            if k in keys:
                skip("Interpret+Titel schon vorhanden")
                continue
            g = c.get("genre_key")
            if not g or g == "Ohne":
                skip("ohne Genre")
                continue
            ziel = os.path.join(ROOT, "chillhouse-music" if chill else f"{c.get('dec')}-music", "songs.json")
            if ziel not in kat:
                skip("Ziel-Katalog fehlt")
                continue
            th = r.get("th") or c.get("th")
            e = {x: c.get(x) for x in ("a", "t", "y", "g", "s", "c", "l")}
            e["y"] = jahr(e["y"])
            e.update({"th": th, "cv": th, "u": c.get("u"), "hv": c.get("hv") or 0, "yt": yt})
            neu.setdefault((ziel, g), []).append(e)
            gesehen.add(yt)
            keys.add(k)

    gesamt = sum(len(v) for v in neu.values())
    for (ziel, g), lst in sorted(neu.items()):
        print(f"  {os.path.basename(os.path.dirname(ziel))} / {g}: {len(lst)}")
    print(f"Neu: {gesamt} | uebersprungen: {uebersprungen}")
    if args.dry:
        return

    for (ziel, g), lst in neu.items():
        kat[ziel][0].setdefault(g, []).extend(lst)
    for ziel in {z for z, _ in neu}:
        data, (kw, nl) = kat[ziel]
        with open(ziel, "w", encoding="utf-8") as fh:
            fh.write(json.dumps(data, **kw) + ("\n" if nl else ""))

    # Wartelisten aufraeumen: nur die Dekaden-Wartelisten, und nur Eintraege, die jetzt im Katalog DERSELBEN Dekade stehen
    # (Stimmungs-Wartelisten wie cozy/yoga bleiben unberuehrt: dieselben Lieder duerfen dort noch fehlen)
    for dek in ("70er", "80er", "90er", "2000er", "2010er", "2020er"):
        qpath = os.path.join(ROOT, "queue", f"{dek}-erweiterung.json")
        kpath = os.path.join(ROOT, f"{dek}-music", "songs.json")
        if not os.path.exists(qpath) or kpath not in kat:
            continue
        q = json.load(open(qpath, encoding="utf-8"))
        vorhanden = {norm(x["a"]) + "|" + norm(x["t"]) for lst in kat[kpath][0].values() for x in lst}
        rest = [x for x in q if (norm(x.get("a")) + "|" + norm(x.get("t"))) not in vorhanden]
        if len(rest) != len(q):
            with open(qpath, "w", encoding="utf-8") as fh:
                json.dump(rest, fh, separators=(",", ":"), ensure_ascii=False)
            print(f"  Warteliste {dek}: {len(q)} -> {len(rest)}")


if __name__ == "__main__":
    main()
