#!/usr/bin/env python3
"""Gleicht die mitgeschriebenen Radio-Titel (songlog, ~/songlog/titel.jsonl auf fornetta) mit den Katalogen
ab und traegt fehlende Lieder in queue/fehlende-lieder.json ein. Den Import (Discogs, YouTube-Link,
Einsortieren) macht danach der vorhandene Workflow (nachts.yml, Schritt "fehlende").

Als schon vorhanden gilt ein Lied, wenn Interpret+Titel (normalisiert, ohne feat./Klammern/Discogs-Zusaetze)
in irgendeinem Katalog oder einer Warteliste stehen. Nur neue Zeilen seit dem letzten Lauf werden gelesen
(Merkdatei neben der Titeldatei: abgleich.pos).

Aufruf: python3 tools/songlog_abgleich.py <titel.jsonl> [--dry]
Ausgabe: "NEU=<anzahl>" (letzte Zeile), fuer Skripte.
"""
import argparse
import glob
import json
import os
import re
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUEUE = os.path.join(ROOT, "queue", "fehlende-lieder.json")


def deacc(s):
    return "".join(c for c in unicodedata.normalize("NFKD", s or "") if not unicodedata.combining(c)).lower()


def akey(a):
    a = re.sub(r"\(\d+\)", "", deacc(a)).replace("*", "")
    a = re.split(r"\s+(?:feat\.?|ft\.?|featuring|with|and|&|x|vs\.?)\s+|,", re.sub(r"^the ", "", a.strip()))[0]
    return re.sub(r"[^a-z0-9]", "", a)


def tkey(t):
    t = deacc(t)
    t = re.sub(r"[\(\[][^\)\]]*[\)\]]", " ", t)
    t = re.sub(r"\s-\s.*$", "", t)
    return re.sub(r"[^a-z0-9]", "", t)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("titel")
    ap.add_argument("--dry", action="store_true")
    args = ap.parse_args()

    pos_datei = os.path.join(os.path.dirname(os.path.abspath(args.titel)), "abgleich.pos")
    pos = int(open(pos_datei).read().strip() or 0) if os.path.exists(pos_datei) else 0
    with open(args.titel, "rb") as f:
        f.seek(pos)
        neu_bytes = f.read()
        ende = pos + len(neu_bytes)
    zeilen = [z for z in neu_bytes.decode("utf-8", "replace").splitlines() if z.strip()]

    bekannt = {}  # Titel-Schluessel -> Interpret-Schluessel, die dazu schon bekannt sind

    def merke(a, t):
        bekannt.setdefault(tkey(t), set()).add(akey(a))

    def ist_bekannt(a, t):
        """Gleicher Titel und gleicher Interpret; auch bei abweichender Schreibweise, wenn der eine Name
        mit dem anderen beginnt (z. B. 'Daryl Hall & John Oates' und 'Daryl Hall John Oates')."""
        ak = akey(a)
        return any(ak == b or (min(len(ak), len(b)) >= 4 and (ak.startswith(b) or b.startswith(ak)))
                   for b in bekannt.get(tkey(t), ()))

    for path in glob.glob(os.path.join(ROOT, "*-music", "songs.json")):
        for lst in json.load(open(path, encoding="utf-8")).values():
            for s in lst:
                merke(s["a"], s["t"])
    for path in [QUEUE] + glob.glob(os.path.join(ROOT, "queue", "*-erweiterung.json")):
        if os.path.exists(path):
            for x in json.load(open(path, encoding="utf-8")):
                merke(x["a"], x["t"])

    raw = open(QUEUE, encoding="utf-8").read()
    queue = json.loads(raw)
    neu, gesehen = [], 0
    for z in zeilen:
        try:
            x = json.loads(z)
            a, t = x["a"], x["t"]
        except (ValueError, KeyError):
            continue
        gesehen += 1
        if not akey(a) or not tkey(t) or ist_bekannt(a, t):
            continue
        merke(a, t)
        neu.append({"a": a, "t": t})

    print(f"gelesen: {gesehen} neue Zeilen | fehlend und neu: {len(neu)}")
    for x in neu:
        print("  +", x["a"], "-", x["t"])
    if not args.dry:
        if neu:
            indent = 2 if raw.startswith("[\n") else None
            queue += neu
            with open(QUEUE, "w", encoding="utf-8") as f:
                f.write(json.dumps(queue, ensure_ascii=False, indent=indent, separators=None if indent else (",", ":")) + ("\n" if raw.endswith("\n") else ""))
        with open(pos_datei, "w") as f:
            f.write(str(ende))
    print(f"NEU={len(neu)}")


if __name__ == "__main__":
    main()
