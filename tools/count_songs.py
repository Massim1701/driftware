#!/usr/bin/env python3
"""Zaehlt alle EINZIGARTIGEN Songs ueber alle *-music/songs.json (gleiches Video
bzw. gleicher Interpret+Titel zaehlt nur einmal, auch ueber Playlisten hinweg),
zeigt eine Tabelle und schreibt dekaden/stats.json (Startseite /dekaden/).
Aufruf: python3 tools/count_songs.py"""
import glob, json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def key(s):
    return s.get("yt") or ((s.get("a") or "").strip().lower() + "|" + (s.get("t") or "").strip().lower())

all_keys = set(); with_video = set(); rows = []
for f in sorted(glob.glob(os.path.join(ROOT, "*-music", "songs.json"))):
    d = json.load(open(f, encoding="utf-8"))
    own = set()
    for v in d.values():
        for s in v:
            k = key(s); own.add(k); all_keys.add(k)
            if s.get("yt"): with_video.add(k)
    rows.append((os.path.basename(os.path.dirname(f)), len(own)))
total = len(all_keys)
for name, n in rows:
    print(f"{name:22s}{n:>8,}".replace(",", "."))
print(f"{'EINZIGARTIG GESAMT':22s}{total:>8,}".replace(",", "."), f"| Playlisten: {len(rows)} | mit Video: {len(with_video)/total*100:.1f}%")
with open(os.path.join(ROOT, "dekaden", "stats.json"), "w", encoding="utf-8") as fh:
    json.dump({"songs": total, "playlists": len(rows), "videoPct": round(len(with_video) / total * 100, 1)}, fh)
