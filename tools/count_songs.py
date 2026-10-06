#!/usr/bin/env python3
"""Zaehlt alle Songs ueber alle *-music/songs.json, zeigt eine Tabelle und
schreibt dekaden/stats.json (wird von der Startseite /dekaden/ angezeigt).
Aufruf: python3 tools/count_songs.py"""
import glob, json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
total = with_video = 0
rows = []
for f in sorted(glob.glob(os.path.join(ROOT, "*-music", "songs.json"))):
    d = json.load(open(f, encoding="utf-8"))
    n = sum(len(v) for v in d.values())
    vid = sum(1 for v in d.values() for s in v if s.get("yt"))
    total += n; with_video += vid
    rows.append((os.path.basename(os.path.dirname(f)), n))
for name, n in rows:
    print(f"{name:22s}{n:>8,}".replace(",", "."))
print(f"{'GESAMT':22s}{total:>8,}".replace(",", "."), f"| Playlisten: {len(rows)} | mit Video: {with_video/total*100:.1f}%".replace(".", ",", 0))
with open(os.path.join(ROOT, "dekaden", "stats.json"), "w", encoding="utf-8") as fh:
    json.dump({"songs": total, "playlists": len(rows), "videoPct": round(with_video / total * 100, 1)}, fh)
