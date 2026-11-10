#!/usr/bin/env python3
"""Loescht von der YouTube-API abgerufene Daten (vc = viewCount, vc_ts = Abrufzeit),
die aelter als 30 Tage sind (YouTube API Developer Policies III.E.4).
Standard: Trockenlauf. Mit --anwenden werden die Felder entfernt."""
import glob, json, sys, time
GRENZE = 30 * 86400
anwenden = "--anwenden" in sys.argv
jetzt = time.time()
gesamt = alt = 0
for f in sorted(glob.glob("*-music/songs.json")):
    raw = open(f, encoding="utf-8").read()
    d = json.loads(raw)
    n = 0
    def lauf(o):
        global gesamt
        nonlocal_n = 0
        if isinstance(o, dict):
            if "vc" in o or "vc_ts" in o:
                gesamt += 1
                if jetzt - o.get("vc_ts", 0) > GRENZE:
                    nonlocal_n += 1
                    if anwenden:
                        o.pop("vc", None); o.pop("vc_ts", None)
            for v in o.values():
                nonlocal_n += lauf(v)
        elif isinstance(o, list):
            for v in o:
                nonlocal_n += lauf(v)
        return nonlocal_n
    n = lauf(d)
    alt += n
    if anwenden and n:
        open(f, "w", encoding="utf-8").write(json.dumps(d, ensure_ascii=False, separators=(",", ":")) if "\n" not in raw[:200] else json.dumps(d, ensure_ascii=False, indent=1))
    if n: print(f"{f}: {n} veraltet")
print(f"mit API-Daten: {gesamt}, aelter als 30 Tage: {alt}", "(angewendet)" if anwenden else "(Trockenlauf)")
