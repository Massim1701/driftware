#!/usr/bin/env python3
"""Einmaliges Reclassify: viele Songs in der 'Ohne'-Kategorie jeder Dekade
haben bereits ein Discogs-Genre/Style hinterlegt ('g'/'s'-Feld), wurden aber
nie einer der internen Genre-Kategorien zugeordnet (Nutzerfund 25.9.: "das
sind eigentlich sehr viele wo das Genre hinterlegt ist"). Ordnet jeden
'Ohne'-Song anhand seiner Discogs-Style-Tokens (bevorzugt) bzw. Genre-Tokens
(Fallback) einer bestehenden internen Kategorie zu, wenn ein eindeutiges
Keyword-Mapping existiert -- sonst bleibt der Song in 'Ohne' (kein Raten bei
Unklarheit). Verschiebt (nicht kopiert) aus 'Ohne' in die Zielkategorie.

Mapping ist bewusst konservativ: nur Discogs-Style/Genre-Tokens, die in der
jeweiligen Dekade eindeutig einer bestehenden Kategorie zuzuordnen sind
(anhand der Kategorienamen selbst, siehe DECADE_MAPS unten), tauchen ueberhaupt
auf. Mehrdeutige/generische Tokens (z.B. "Vocal", "Theme", "Soundtrack",
"Acoustic") bleiben absichtlich unklassifiziert."""
import json
import os

DECADE_MAPS = {
    "70er": {
        "pop rock": "PopRock",
        "soul": "FunkSoul",
        "funk": "FunkSoul",
        "funk / soul": "FunkSoul",
        "rhythm & blues": "FunkSoul",
        "disco": "Disco",
        "soft rock": "SoftRock",
        "classic rock": "ClassicRock",
        "rock & roll": "ClassicRock",
        "ballad": "Ballads",
        "country": "Country",
        "country rock": "Country",
        "folk rock": "FolkRock",
        "folk": "FolkRock",
        "blues rock": "BluesSouthernRock",
        "hard rock": "HardRockMetal",
        "pop": "PopCharts",
    },
    "80er": {
        "pop rock": "PopRock",
        "synth-pop": "SynthPop",
        "disco": "Disco",
        "soul": "FunkSoul",
        "funk": "FunkSoul",
        "soft rock": "SoftRock",
        "ballad": "Ballads",
        "hip hop": "OldSchoolHipHop",
        "britcore": "OldSchoolHipHop",
        "conscious": "OldSchoolHipHop",
        "house": "House",
        "techno": "House",
        "hard rock": "HardRockMetal",
        "classic rock": "RockArenaAOR",
        "rock & roll": "RockArenaAOR",
    },
    "90er": {
        "contemporary r&b": "ContemporaryRnB",
        "pop rock": "PopRock",
        "ballad": "Ballads",
        "downtempo": "Downtempo",
        "ambient": "Downtempo",
        "house": "House",
        "euro house": "House",
        "hip-house": "House",
        "breakbeat": "BigBeat",
        "new jack swing": "NewJackSwing",
    },
    "2000er": {
        "contemporary r&b": "ContemporaryRnB",
        "pop rap": "PopRap",
        "pop rock": "PopRock",
        "alternative rock": "AlternativeRock",
        "grunge": "AlternativeRock",
        "ballad": "Ballads",
        "garage house": "ElectroHouse",
        "techno": "ElectroHouse",
        "house": "ElectroHouse",
        "electro": "ElectroHouse",
        "ambient": "Downtempo",
        "soul": "RnBNeoSoul",
        "gangsta": "GangstaGFunk",
        "soft rock": "RockClassic",
        "heavy metal": "NuMetalHardcore",
        "punk": "PopPunk",
    },
    "2010er": {
        "pop": "PopCharts",
        "hip hop": "GangstaConsciousHipHop",
        "pop rap": "PopRap",
        "pop rock": "PopRock",
        "house": "ElectroHouse",
        "electro house": "ElectroHouse",
        "trap": "TrapMoombahton",
        "electro": "ElectroHouse",
        "dance-pop": "DancePop",
        "country": "Country",
        "contemporary r&b": "ContemporaryRnB",
        "synth-pop": "SynthPopSynthwave",
        "rock": "RockClassic",
        "folk": "Folk",
        "soul": "RnBNeoSoul",
        "indie pop": "IndiePop",
        "alternative rock": "AlternativePostHardcore",
        "rnb/swing": "RnBNeoSoul",
    },
    "2020er": {
        "pop": "PopCharts",
        "pop rap": "PopRap",
        "trap": "TrapPhonk",
        "heavy metal": "MetalcoreHardcore",
        "industrial metal": "MetalcoreHardcore",
        "hip hop": "HipHopBoomBap",
        "rock": "RockClassic",
        "hard rock": "RockClassic",
        "pop rock": "PopRock",
        "grunge": "AlternativePostPunk",
        "punk": "AlternativePostPunk",
        "contemporary r&b": "RnBNeoSoul",
        "synth-pop": "SynthPopSynthwave",
        "rocksteady": "ReggaeDubAfro",
    },
}


def classify(song, mapping):
    for field in ("s", "g"):
        raw = song.get(field) or ""
        tokens = [t.strip().lower() for t in raw.split(",") if t.strip()]
        for tok in tokens:
            if tok in mapping:
                return mapping[tok]
    return None


def main():
    total_moved = 0
    total_left = 0
    for decade, mapping in DECADE_MAPS.items():
        path = f"{decade}-music/songs.json"
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        ohne = data.get("Ohne", [])
        still_ohne = []
        moved_by_target = {}
        for song in ohne:
            target = classify(song, mapping)
            if target:
                data.setdefault(target, []).append(song)
                moved_by_target[target] = moved_by_target.get(target, 0) + 1
            else:
                still_ohne.append(song)
        data["Ohne"] = still_ohne
        moved = len(ohne) - len(still_ohne)
        total_moved += moved
        total_left += len(still_ohne)
        tmp = path + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(data, f, separators=(",", ":"), ensure_ascii=False)
        os.replace(tmp, path)
        print(f"{decade}: {moved} verschoben, {len(still_ohne)} bleiben in Ohne")
        for target, cnt in sorted(moved_by_target.items(), key=lambda x: -x[1]):
            print(f"    -> {target}: {cnt}")
    print(f"\nGESAMT: {total_moved} verschoben, {total_left} bleiben in Ohne")


if __name__ == "__main__":
    main()
