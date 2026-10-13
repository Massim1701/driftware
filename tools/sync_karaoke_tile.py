#!/usr/bin/env python3
"""Karaoke-Kachel aus karaoke/videos.json neu aufbauen (deterministisch, wiederholbar).

Fuer jede Dekade (70er-2020er): Kategorie "Karaoke" = alle Songs der Dekade, zu denen
karaoke/videos.json eine Studiofassung kennt. Es sind KOPIEN (Originale bleiben in ihren
Genres) mit yt = Studiofassung ("Interpret - Topic"), kar = 1, kd = Laenge in Sekunden.
Pro Song nur ein Eintrag je Dekade (beste Version: Discogs-have 'hv').
Zusaetzlich: karaoke-music (Stimmung) bekommt die Kategorie "TextLaeuftMit" mit allen
Karaoke-Songs aller Dekaden; gleiche Songs in den dortigen Listen werden auf die
Studiofassung umgestellt.
karaoke/ausschluss.json: Songs, die nie in die Kachel duerfen.

Aufruf: python3 tools/sync_karaoke_tile.py
"""
import collections
import glob
import json
import os
import re
import sys
import unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fetch_karaoke_videos import ist_studio_titel  # noqa: E402  (gleiche Studio-Regel wie beim Suchen)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEKADEN = ["70er", "80er", "90er", "2000er", "2010er", "2020er"]
STOP = {"and", "the", "feat", "ft", "featuring", "with", "vs", "x", "und", "et", "presents", "pres", "meets"}


def deacc(s):
    return "".join(c for c in unicodedata.normalize("NFKD", s or "") if not unicodedata.combining(c)).lower()


def akey(a):
    a = re.sub(r"\(\d+\)", "", deacc(a)).replace("*", "")
    return " ".join(sorted(set(t for t in re.findall(r"[a-z0-9]+", a) if t not in STOP)))


def tkey(t):
    t = deacc(t)
    t = re.sub(r"[\(\[][^\)\]]*[\)\]]", " ", t)
    t = re.sub(r"\s-\s(.*)$", "", t)
    return " ".join(re.findall(r"[a-z0-9]+", t))


def load(path):
    raw = open(path, encoding="utf-8").read()
    return raw, json.loads(raw)


def save(path, raw, data):
    indent = 2 if raw.startswith("{\n") else None
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=indent, separators=None if indent else (",", ":"))


def score(s):
    return (1 if s.get("yt") else 0, s.get("hv") or 0, 1 if s.get("cv") else 0, -len(s.get("t", "")))


def karaoke_kopie(s, v):
    n = dict(s)
    n["yt"] = v["yk"]
    n["kar"] = 1
    n["kd"] = v["d"]
    return n


def main():
    videos = json.load(open(os.path.join(ROOT, "karaoke", "videos.json"), encoding="utf-8"))
    ausschluss = set(json.load(open(os.path.join(ROOT, "karaoke", "ausschluss.json"), encoding="utf-8")).get("songs", []))
    videos = {k: v for k, v in videos.items() if k not in ausschluss}
    # Zuordnung auch ueber die normalisierte Schreibweise: Dubletten wurden aus den Katalogen entfernt,
    # der uebrig gebliebene Eintrag heisst evtl. anders als der, zu dem das Video gefunden wurde.
    norm_videos = {}
    for k, v in videos.items():
        a, _, ti = k.rpartition("|")
        if not ist_studio_titel(ti):
            continue  # Mix-/Remix-/Live-Titel: nie in die Kachel
        norm_videos.setdefault((akey(a), tkey(ti)), v)
    norm_ausschluss = {(akey(k.rpartition("|")[0]), tkey(k.rpartition("|")[2])) for k in ausschluss}
    alle = {}
    for d in DEKADEN:
        path = os.path.join(ROOT, f"{d}-music", "songs.json")
        raw, j = load(path)
        best = {}
        for cat, lst in j.items():
            if cat == "Karaoke":
                continue
            for s in lst:
                key = (akey(s["a"]), tkey(s["t"]))
                if key in norm_ausschluss or not ist_studio_titel(s["t"]):
                    continue
                v = videos.get(f'{s["a"]}|{s["t"]}') or norm_videos.get(key)
                if not v:
                    continue
                if key not in best or score(s) > score(best[key][0]):
                    best[key] = (s, v)
        kar = sorted((karaoke_kopie(s, v) for s, v in best.values()), key=lambda s: -(s.get("vc") or 0))
        j["Karaoke"] = kar
        save(path, raw, j)
        for s in kar:
            alle.setdefault((akey(s["a"]), tkey(s["t"])), s)
        print(f"{d}: Karaoke {len(kar)} Songs")
    # Stimmung Karaoke
    path = os.path.join(ROOT, "karaoke-music", "songs.json")
    raw, j = load(path)
    bestand = {k: v for k, v in j.items() if k != "TextLaeuftMit"}
    upd = 0
    for lst in bestand.values():
        for s in lst:
            ks = alle.get((akey(s["a"]), tkey(s["t"])))
            if ks:
                s["yt"], s["kar"], s["kd"] = ks["yt"], 1, ks["kd"]
                upd += 1
    neu = {"TextLaeuftMit": sorted((dict(s) for s in alle.values()), key=lambda s: -(s.get("vc") or 0))}
    neu.update(bestand)
    save(path, raw, neu)
    print(f"karaoke-music: TextLaeuftMit {len(alle)} Songs, {upd} Bestandssongs auf Studiofassung umgestellt")


if __name__ == "__main__":
    main()
