#!/usr/bin/env python3
"""Prueft per YouTube-oEmbed, ob die YouTube-IDs der Kataloge noch abspielbar/einbettbar sind.
404/401 = tot oder nicht einbettbar. Ergebnis: queue/dead-videos.json ({yt: [seiten]}).
Zustand (geprueft): queue/dead-videos-state.json. Aufruf: python3 tools/check_dead_videos.py [Sekunden] [Threads]"""
import glob, json, os, sys, time, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUDGET = float(sys.argv[1]) if len(sys.argv) > 1 else 120
THREADS = int(sys.argv[2]) if len(sys.argv) > 2 else 10
ST = os.path.join(ROOT, "queue", "dead-videos-state.json")
OUT = os.path.join(ROOT, "queue", "dead-videos.json")
state = json.load(open(ST)) if os.path.exists(ST) else {"checked": {}}
pages = {}
for f in glob.glob(os.path.join(ROOT, "*-music", "songs.json")):
    slug = os.path.basename(os.path.dirname(f))
    for v in json.load(open(f, encoding="utf-8")).values():
        for s in v:
            if s.get("yt"): pages.setdefault(s["yt"], set()).add(slug)
ids = [i for i in pages if i not in state["checked"]]
# aelteste zuerst: bereits gepruefte (aelter als 30 Tage) hinten anstellen
ids += sorted((i for i in pages if i in state["checked"] and time.time() - state["checked"][i][0] > 30 * 86400), key=lambda i: state["checked"][i][0])
t0 = time.time()
def check(i):
    if time.time() - t0 > BUDGET: return i, None
    u = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={i}&format=json"
    for _ in range(2):
        try:
            urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=15); return i, "ok"
        except urllib.error.HTTPError as e:
            if e.code in (401, 403, 404): return i, "dead"
            if e.code == 429: time.sleep(5)
        except Exception: time.sleep(1)
    return i, None
n = 0
with ThreadPoolExecutor(THREADS) as ex:
    for i, r in ex.map(check, ids):
        if r: state["checked"][i] = [int(time.time()), r]; n += 1
dead = {i: sorted(pages[i]) for i, (ts, r) in state["checked"].items() if r == "dead" and i in pages}
json.dump(state, open(ST, "w"), separators=(",", ":"))
json.dump(dead, open(OUT, "w"), separators=(",", ":"))
print(f"geprueft jetzt {n} | insgesamt {len(state['checked'])}/{len(pages)} | tot {len(dead)}")
