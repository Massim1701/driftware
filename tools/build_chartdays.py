#!/usr/bin/env python3
"""Baut shared/chartdays.json fuer "Heute vor X Jahren": UK-Nr.-1-Hits je Chartwoche
(Datum aus Blattname 'Week YYYYMMDD'), abgeglichen mit unseren Katalogen (nur Songs mit Video).
Aufruf: python3 tools/build_chartdays.py [Zeitbudget_Sekunden]"""
import glob, json, os, re, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_uk_chart_hits as F
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUDGET = float(sys.argv[1]) if len(sys.argv) > 1 else 100
PART = os.path.join(F.tempfile.gettempdir(), "chartdays-part.json")

wb = F.load_uk_chart_workbook()
done = json.load(open(PART)) if os.path.exists(PART) else {}
t0 = time.time()
for name in wb.sheetnames:
    m = F.WEEK_SHEET_RE.match(name)
    if not m or name in done: continue
    if time.time() - t0 > BUDGET: break
    ws = wb[name]; rows = ws.iter_rows(values_only=True); header = next(rows, None)
    res = []
    if header and "Position" in header:
        ip, isg, ia = header.index("Position"), header.index("Song"), header.index("Artist")
        for r in rows:
            try:
                pos = int(str(r[ip]).strip())
            except (TypeError, ValueError): continue
            if pos <= 3: res.append([str(r[ia]).strip(), str(r[isg]).strip(), pos])
    done[name] = res
json.dump(done, open(PART, "w"))
total = sum(1 for n in wb.sheetnames if F.WEEK_SHEET_RE.match(n))
print("Wochen verarbeitet:", len(done), "/", total)
if len(done) < total: sys.exit(0)

idx = {}
for f in glob.glob(os.path.join(ROOT, "*-music", "songs.json")):
    for v in json.load(open(f, encoding="utf-8")).values():
        for s in v:
            if s.get("yt"): idx.setdefault(F.song_id(s["a"], s["t"]), s)
out = []; miss = 0
for name, lst in sorted(done.items()):
    for res in (lst or []):
        s = idx.get(F.song_id(res[0], res[1]))
        if not s: miss += 1; continue
        d = name.split()[1]
        out.append({"d": d, "p": res[2], "a": s["a"], "t": s["t"], "y": s.get("y"), "yt": s["yt"], "th": s.get("th") or s.get("cv")})
json.dump(out, open(os.path.join(ROOT, "shared", "chartdays.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("gespeichert:", len(out), "| nicht im Katalog:", miss)
