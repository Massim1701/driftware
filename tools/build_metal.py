#!/usr/bin/env python3
"""Baut die Playlist 'Metall' (metal-music/songs.json) aus den Dekaden-Katalogen.

Metal-Songs werden anhand ihrer Discogs-Stile erkannt und in Unterkategorien
einsortiert (erster Treffer in UNTERKATEGORIEN gewinnt, spezifisch vor allgemein).
Die Songs werden KOPIERT (die Dekaden-Kataloge bleiben unveraendert, wie bei den
anderen Stimmungs-Playlists). Mehrdeutige Stile ('Hardcore', 'Industrial', 'Glam',
'Hard Rock', 'Post-Hardcore') zaehlen nur, wenn das Discogs-Genre Rock oder Metal ist
(sonst sind es Happy Hardcore, Hardcore Hip-Hop, EBM ...). 'Karaoke' und 'Ohne' werden
nicht gelesen; Dubletten (gleicher Interpret + Titel ueber mehrere Dekaden) nur einmal.

  python3 tools/build_metal.py            Probelauf (zeigt Zahlen)
  python3 tools/build_metal.py --apply    schreibt metal-music/songs.json
"""
import collections
import json
import os
import re
import sys

DECADES = ["70er", "80er", "90er", "2000er", "2010er", "2020er"]
SKIP_CATS = {"Karaoke"}

# (Schluessel, Anzeigename, Stile)  -- Reihenfolge = Prioritaet
UNTERKATEGORIEN = [
    ("BlackMetal", "🖤 Black Metal", ["black metal", "atmospheric black metal", "viking metal"]),
    ("DeathGrind", "💀 Death & Grind", ["death metal", "melodic death metal", "grindcore", "goregrind",
                                        "deathcore", "crust", "brutal death metal"]),
    ("DoomStoner", "🌫️ Doom & Stoner", ["doom metal", "sludge metal", "stoner rock", "stoner metal",
                                        "drone", "funeral doom"]),
    ("ThrashSpeed", "⚡ Thrash & Speed", ["thrash", "speed metal", "crossover thrash", "groove metal"]),
    ("PowerSymphonic", "🏰 Power & Symphonic", ["power metal", "symphonic metal", "folk metal",
                                               "melodic metal", "neoclassical metal"]),
    ("DarkIndustrial", "🌑 Dark & Industrial", ["gothic metal", "industrial metal", "dark metal",
                                               "doom/gothic", "industrial"]),
    ("ProgAlternative", "🧠 Progressive & Alternative", ["progressive metal", "alternative metal",
                                                        "funk metal", "avant-garde metal", "post-metal"]),
    ("NuMetal", "🔊 Nu Metal", ["nu metal", "rap metal", "rap rock"]),
    ("Metalcore", "🔥 Metalcore & Screamo", ["metalcore", "melodic hardcore", "screamo"]),
    ("HeavyMetal", "🤘 Heavy Metal", ["heavy metal", "nwobhm", "metal"]),
]
# diese Stile zaehlen nur mit Rock/Metal im Discogs-Genre
MEHRDEUTIG = {"melodic hardcore", "crust", "drone", "screamo", "rap rock", "industrial"}
# Bewusst NICHT enthalten: reiner 'Hardcore'/'Post-Hardcore' (Punk, Demos), 'Hard Rock', 'Glam',
# 'Emo' -- kein Metal. 'rap rock' (Limp-Bizkit-Naehe) nur zusammen mit einem weiteren Stil.
NUR_ZUSAMMEN = {"rap rock"}


def alnum(s):
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def tokens(field):
    return [t.strip().lower() for t in (field or "").split(",") if t.strip()]


def einordnen(song):
    st, ge = tokens(song.get("s")), tokens(song.get("g"))
    rock_oder_metal = any(g in ("rock", "metal") or "metal" in g for g in ge)
    treffer = {t for t in st if (t not in MEHRDEUTIG or rock_oder_metal)}
    for key, _, styles in UNTERKATEGORIEN:
        for s in styles:
            if s in treffer and not (s in NUR_ZUSAMMEN and len(treffer) == 1):
                return key
    return None


def main():
    apply = "--apply" in sys.argv
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out = {k: [] for k, _, _ in UNTERKATEGORIEN}
    gesehen, dubl = set(), 0
    je_dek = collections.Counter()
    for dec in DECADES:
        with open(os.path.join(root, f"{dec}-music", "songs.json"), encoding="utf-8") as f:
            data = json.load(f)
        for cat, songs in data.items():
            if cat in SKIP_CATS or not isinstance(songs, list):
                continue
            for s in songs:
                key = einordnen(s)
                if not key:
                    continue
                ident = alnum(s.get("a")) + "|" + alnum(s.get("t"))
                if ident in gesehen:
                    dubl += 1
                    continue
                gesehen.add(ident)
                out[key].append(s)
                je_dek[dec] += 1
    for key, label, _ in UNTERKATEGORIEN:
        print(f"{len(out[key]):5}  {label}")
    print(f"{sum(len(v) for v in out.values()):5}  GESAMT ({dubl} Dubletten uebersprungen)  je Dekade: {dict(je_dek)}")
    if apply:
        out = {k: v for k, v in out.items() if v}
        os.makedirs(os.path.join(root, "metal-music"), exist_ok=True)
        path = os.path.join(root, "metal-music", "songs.json")
        with open(path + ".tmp", "w", encoding="utf-8") as f:
            json.dump(out, f, separators=(",", ":"), ensure_ascii=False)
        os.replace(path + ".tmp", path)
        print("geschrieben:", path)


if __name__ == "__main__":
    main()
