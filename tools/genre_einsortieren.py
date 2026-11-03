"""Ordnet einen Song nach seinen hinterlegten Discogs-/MusicBrainz-STYLES einer bestehenden Genre-Kategorie des Katalogs zu.
Gleiche Regeln wie beim Aufraeumen von "Ohne" (03.11.2026): nur Style-Tokens (Genre allein ist zu grob), das Ziel muss im Katalog
schon existieren, bei Unklarheit gibt die Funktion None zurueck (der Song bleibt in "Ohne" und wird von Hand einsortiert).
Benutzt von tools/process_missing_queue.py (pick_bucket) im Nachtlauf."""

DARK = ["ebm", "industrial", "darkwave", "dark electro", "goth rock", "gothic rock", "goth", "coldwave", "deathrock"]

# Style-Token (klein) -> moegliche Kategorien in Vorrangreihenfolge; es zaehlt die erste, die im Katalog existiert
TOKENS = {
    "pop rock": ["PopRock"], "soft rock": ["SoftRock"], "classic rock": ["ClassicRock", "RockClassic", "RockArenaAOR"],
    "rock & roll": ["ClassicRock", "RockClassic", "RockArenaAOR"], "hard rock": ["HardRockMetal"], "heavy metal": ["HardRockMetal", "HeavyMetal"],
    "blues rock": ["BluesSouthernRock"], "southern rock": ["BluesSouthernRock", "RockClassic"], "folk rock": ["FolkRock"], "folk": ["FolkRock", "Folk", "FolkCeltic", "FolkCountry"],
    "prog rock": ["ProgRock"], "krautrock": ["Krautrock"], "glam": ["GlamRock"], "glam rock": ["GlamRock"], "punk": ["Punk"], "ska": ["Ska"],
    "psychedelic rock": ["PsychGarageRock"], "psychedelic": ["PsychGarageRock"], "garage rock": ["PsychGarageRock"], "space rock": ["PsychGarageRock"], "mod": ["PsychGarageRock"], "beat": ["PsychGarageRock"],
    "alternative rock": ["AlternativeRock"], "indie rock": ["IndieRock"], "indie pop": ["IndiePop"], "britpop": ["Britpop"], "grunge": ["Grunge"],
    "new wave": ["NewWave", "NewWavePostPunk", "AlternativePostPunk"], "post-punk": ["PostPunkGoth", "NewWavePostPunk", "AlternativePostPunk"], "shoegaze": ["NewWavePostPunk"],
    "synth-pop": ["SynthPop", "SynthPopSynthwave", "EBMIndustrialDark"], "synthwave": ["SynthPopSynthwave"],
    "disco": ["Disco", "DiscoNuDisco"], "nu-disco": ["DiscoNuDisco"], "italo-disco": ["ItaloDisco"], "euro-disco": ["Disco", "Eurobeat"], "hi nrg": ["HiNRG"],
    "funk": ["FunkSoul"], "soul": ["FunkSoul"], "funk / soul": ["FunkSoul"], "rhythm & blues": ["FunkSoul"], "boogie": ["Boogie"],
    "contemporary r&b": ["ContemporaryRnB", "RnBNeoSoul"], "r&b": ["RnBNeoSoul", "ContemporaryRnB"], "neo soul": ["RnBNeoSoul"], "new jack swing": ["NewJackSwing"],
    "ballad": ["Ballads"], "schlager": ["Schlager"], "europop": ["Europop"], "eurodance": ["Eurodance"], "dance-pop": ["DancePop"], "pop rap": ["PopRap"],
    "country": ["Country", "FolkCountry"], "country rock": ["Country", "FolkCountry"], "bluegrass": ["Country", "FolkCountry"],
    "reggae": ["ReggaeDub", "ReggaeDancehall", "ReggaeDubAfro", "ReggaeDubAfrobeat", "Dancehall"], "roots reggae": ["ReggaeDub", "ReggaeDancehall", "ReggaeDubAfro", "ReggaeDubAfrobeat"],
    "dub": ["ReggaeDub", "ReggaeDubAfro", "ReggaeDubAfrobeat", "ReggaeDancehall"], "dancehall": ["ReggaeDub", "ReggaeDancehall", "Dancehall", "ReggaeDubAfro", "ReggaeDubAfrobeat"],
    "lovers rock": ["ReggaeDub"], "reggae-pop": ["ReggaeDub", "ReggaeDancehall", "ReggaeDubAfro", "ReggaeDubAfrobeat"], "reggaeton": ["Reggaeton", "LatinReggaeton"], "k-pop": ["KPop"],
    "jazz": ["JazzBlues"], "blues": ["JazzBlues"], "soul jazz": ["JazzBlues"], "smooth jazz": ["JazzBlues"], "soundtrack": ["SoundtrackKlassik"],
    "hip hop": ["OldSchoolHipHop", "HipHopBoomBap"], "boom bap": ["HipHopBoomBap"], "conscious": ["OldSchoolHipHop", "HipHopBoomBap", "GangstaConsciousHipHop"],
    "gangsta": ["GangstaGFunk", "GangstaConsciousHipHop"], "g-funk": ["GangstaGFunk"], "trap": ["CrunkTrapSnap", "TrapMoombahton", "TrapPhonk"],
    "house": ["House"], "electro house": ["ElectroHouse"], "progressive house": ["ProgTechHouse", "DeepProgTropicalHouse", "DeepProgHouse"], "deep house": ["DeepProgTropicalHouse", "DeepProgHouse"],
    "tech house": ["ProgTechHouse"], "minimal": ["House"], "techno": ["Techno"], "trance": ["Trance", "TranceHardDance"], "electro": ["Electro"], "electronic": ["Electro"],
    "drum n bass": ["DrumNBass", "JungleDnB"], "jungle": ["JungleDnB"], "dubstep": ["DubstepGrime", "DubstepFutureBass"], "future bass": ["DubstepFutureBass"],
    "grime": ["UKBassGrimeDrill", "DubstepGrime"], "drill": ["UKBassGrimeDrill"], "ambient": ["AmbientDowntempo", "AmbientLoFi"], "downtempo": ["Downtempo", "AmbientDowntempo"],
    "chillwave": ["ChillwaveVaporwave"], "vaporwave": ["ChillwaveVaporwave", "HyperpopVaporwave"], "hyperpop": ["HyperpopVaporwave"], "lo-fi": ["AmbientLoFi"],
    "pop punk": ["PopPunk", "PopPunkEmo"], "emo": ["Emo", "PopPunkEmo"], "metalcore": ["MetalcoreHardcore", "MetalcoreNuMetalHardcore", "AlternativePostHardcore"],
    "nu metal": ["NuMetalHardcore", "NuMetal", "MetalcoreNuMetalHardcore"], "freestyle": ["Freestyle"],
    "chanson": ["Chanson"], "levenslied": ["Chanson"], "vocal": ["VocalEasyListening"], "easy listening": ["VocalEasyListening"], "lounge": ["VocalEasyListening"], "light music": ["VocalEasyListening"],
    "novelty": ["NoveltyComedy", "NoveltyKids"], "parody": ["NoveltyComedy", "NoveltyKids"], "comedy": ["NoveltyComedy", "NoveltyKids"],
    "holiday": ["Holiday"], "christmas": ["Holiday"],
    "ranchera": ["LatinWorld"], "african": ["LatinWorld"], "cumbia": ["LatinWorld"], "salsa": ["LatinWorld"], "bolero": ["LatinWorld"], "mpb": ["LatinWorld"], "latin": ["LatinWorld"],
    "samba": ["LatinWorld"], "bossa nova": ["LatinWorld"], "afrobeat": ["LatinWorld", "ReggaeDubAfrobeat"], "highlife": ["LatinWorld"], "flamenco": ["LatinWorld"],
}
for _t in DARK:
    TOKENS[_t] = ["EBMIndustrialDark", "PostPunkGoth"] if _t in ("goth rock", "gothic rock", "goth", "deathrock", "coldwave") else ["EBMIndustrialDark"]


def kategorie(styles, katalog_keys):
    """styles: Liste oder Komma-Text; katalog_keys: vorhandene Kategorien. Gibt den Kategorienamen oder None zurueck."""
    if isinstance(styles, str):
        styles = styles.split(",")
    toks = [str(t).strip().lower() for t in (styles or []) if str(t).strip()]
    if not toks:
        return None
    # Metal/Hardcore-Lieder mit Style "Industrial" gehoeren nicht zu EBM/Industrial (Dark Wave): dunkle Tokens dann ignorieren
    if any("metal" in t or "hardcore" in t for t in toks):
        toks = [t for t in toks if t not in DARK]
    # Dunkle Styles (EBM, Industrial, Goth ...) haben Vorrang vor dem allgemeinen "electro"/"synth-pop"
    ordnung = [t for t in toks if t in DARK] + [t for t in toks if t not in DARK]
    for t in ordnung:
        for k in TOKENS.get(t, []):
            if k in katalog_keys:
                return k
    return None
