#!/usr/bin/env python3
"""Ergaenzt bei Liedern, die schon im Katalog stehen, aber nur Interpret/Titel/Jahr haben,
Genre (g), Stil (s), Land (c), Label (l), Discogs-Link (u) und Sammlerzahl (hv) per Discogs.

Welche Lieder: die YouTube-IDs in queue/anreichern-lieder.json. Angefasst werden nur Eintraege
dieser Liste, bei denen g, s, c und l alle leer sind; nur leere Felder werden gefuellt, vorhandene
bleiben. Genre-Zuordnung (Kategorie) und Video bleiben unveraendert. Gleiche Video-ID in mehreren
Katalogen: alle Eintraege bekommen dieselben Angaben.

Fortschritt: queue/anreichern-lieder-fortschritt.json merkt sich Lieder, die bei Discogs nicht
gefunden wurden (werden nicht noch einmal gesucht). Wiederaufnehmbar, mit Zeitbudget.
Braucht DISCOGS_TOKEN (Env), sonst sehr langsam.

Aufruf: python3 tools/anreichern_lieder.py [--limit N]
"""
import argparse
import glob
import json
import os
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))

LISTE = os.path.join(ROOT, "queue", "anreichern-lieder.json")
FORTSCHRITT = os.path.join(ROOT, "queue", "anreichern-lieder-fortschritt.json")
TIME_BUDGET_SECONDS = int(os.environ.get("ANREICHERN_TIME_BUDGET_SECONDS", "3000"))
DISCOGS_MIN_INTERVAL = 1.05  # mit Token 60 Anfragen/min
SAVE_EVERY = 10
START_TS = time.time()

# Schreibformate der Kataloge (jede Datei bleibt in ihrem Format)
FORMATE = [dict(separators=(",", ":"), ensure_ascii=False), dict(ensure_ascii=False), dict(indent=2, ensure_ascii=False)]


def erkenne_format(raw, data):
    for kw in FORMATE:
        s = json.dumps(data, **kw)
        if s == raw or s + "\n" == raw:
            return kw, raw.endswith("\n")
    raise SystemExit("Unbekanntes Schreibformat -- Datei bleibt unangetastet.")


def leer(s):
    return not (s.get("g") or s.get("s") or s.get("c") or s.get("l"))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0, help="hoechstens so viele Lieder (zum Testen)")
    args = ap.parse_args()

    if not os.environ.get("DISCOGS_TOKEN"):
        print("WARNUNG: kein DISCOGS_TOKEN gesetzt -- unauthentifiziert sehr langsam und ohne Cover.")

    import fetch_billboard_hits as fb
    fb.MIN_HAVE = 0  # Sammlerzahl spielt hier keine Rolle, wir wollen nur die Angaben
    orig = fb.api_get
    state = {"last": 0.0}

    def throttled(url, retries=5):
        wait = DISCOGS_MIN_INTERVAL - (time.time() - state["last"])
        if wait > 0:
            time.sleep(wait)
        state["last"] = time.time()
        return orig(url, retries)

    fb.api_get = throttled

    liste = set(json.load(open(LISTE, encoding="utf-8")))
    fort = json.load(open(FORTSCHRITT, encoding="utf-8")) if os.path.exists(FORTSCHRITT) else {"nicht_gefunden": []}
    nicht_gefunden = set(fort["nicht_gefunden"])

    dateien = {}
    for path in sorted(glob.glob(os.path.join(ROOT, "*-music", "songs.json"))):
        raw = open(path, encoding="utf-8").read()
        data = json.loads(raw)
        dateien[path] = (data, erkenne_format(raw, data))

    offen = {}  # yt -> [Eintraege]
    for data, _ in dateien.values():
        for lst in data.values():
            for s in lst:
                y = s.get("yt")
                if y in liste and y not in nicht_gefunden and leer(s):
                    offen.setdefault(y, []).append(s)
    print(f"Anreichern: {len(offen)} Lieder offen, {len(nicht_gefunden)} bei Discogs nicht gefunden")

    def speichern():
        for path, (data, (kw, nl)) in dateien.items():
            with open(path, "w", encoding="utf-8") as f:
                f.write(json.dumps(data, **kw) + ("\n" if nl else ""))
        with open(FORTSCHRITT, "w", encoding="utf-8") as f:
            json.dump({"nicht_gefunden": sorted(nicht_gefunden)}, f, ensure_ascii=False)

    done = gefunden = 0
    for y, eintraege in offen.items():
        if time.time() - START_TS > TIME_BUDGET_SECONDS:
            print("Zeitbudget erreicht, Rest folgt im naechsten Lauf.")
            break
        if args.limit and done >= args.limit:
            break
        s0 = eintraege[0]
        release = fb.discogs_search_release(s0["a"], s0["t"])
        done += 1
        if release:
            angaben = {
                "g": ", ".join(release.get("genre") or []) or None,
                "s": ", ".join(release.get("style") or []) or None,
                "c": release.get("country"),
                "l": ", ".join(release.get("label") or []) or None,
                "u": "https://www.discogs.com" + release["uri"] if release.get("uri") else None,
                "hv": (release.get("community") or {}).get("have", 0),
            }
            for s in eintraege:
                for k, v in angaben.items():
                    if k == "hv":
                        if not s.get("hv"):
                            s["hv"] = v
                    elif v and not s.get(k):
                        s[k] = v
            gefunden += 1
            print(f"  + {s0['a']} - {s0['t']}: {angaben['g']} / {angaben['s']} / {angaben['c']}")
        else:
            nicht_gefunden.add(y)
            print(f"  - {s0['a']} - {s0['t']}: bei Discogs nicht gefunden")
        if done % SAVE_EVERY == 0:
            speichern()
    speichern()
    rest = sum(1 for y in offen if y not in nicht_gefunden and any(leer(s) for s in offen[y]))
    print(f"Fertig fuer diesen Lauf: {done} nachgeschlagen, {gefunden} ergaenzt, {rest} noch offen.")


if __name__ == "__main__":
    main()
