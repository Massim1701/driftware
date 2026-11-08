"""Gemeinsame Dublettenpruefung fuer Import (merge_server_import.py) und Nachtlauf (process_missing_queue.py).

Ein Lied gilt als schon vorhanden, wenn
  (a) der Titel gleich ist (tolerant, siehe titel_key) UND der Interpret aehnlich ist (siehe interpret_teile/aehnlich)
      UND beide dieselbe Versions-Marke tragen (Remix/Live/Version/... bleiben eigene Lieder), oder
  (b) die YouTube-ID schon im Katalog steht UND zum selben Titel gehoert.

Toleranzen (eingebaut 08.11.2026, gemessen an Katalog und abgelehnten Kandidaten):
  Akzente, "&" = "and", "feat./ft./featuring"-Zusatz am Titel, Klammerzusaetze, B-Seite ("Titel / Anderer"),
  fuehrender Artikel (The/A/Der/Die/Das/Le/La/Les), Discogs-Marker "(2)" und "*", mehrere Interpreten
  (feat./with/and/vs/x/Komma/Schraegstrich), Namensanfang, Titel in nicht-lateinischer Schrift.
Das Fach "Karaoke" zaehlt nicht (Karaoke-Fassungen sind eigene Eintraege).
"""
import re
import unicodedata
from collections import defaultdict

VERSION_RE = re.compile(r"remix|version|\blive\b|\bedit\b|\bmix\b|remaster|reprise|acoustic|instrumental|unplugged|demo|cover", re.I)
ARTIKEL_RE = re.compile(r"^(the|a|an|der|die|das|le|la|les)\s+")
FUELL = {"the", "and", "feat", "ft", "featuring", "with", "of", "dj", "mc", "band", "orchestra", "his", "her", "y", "et"}
SPLIT_RE = re.compile(r"\s+(?:feat\.?|ft\.?|featuring|with|and|vs\.?|x)\s+|,|/|;")
KARAOKE = "Karaoke"


def _deacc(text):
    return "".join(c for c in unicodedata.normalize("NFKD", text or "") if not unicodedata.combining(c)).lower()


def _alnum(text):
    # \w ohne Unterstrich: auch kyrillisch, griechisch, japanisch usw. bleibt erhalten (alte Regel machte daraus "")
    return "".join(c for c in text if c.isalnum())


def titel_key(title):
    t = _deacc(title).replace("&", " and ")
    t = re.sub(r"\s(?:feat|ft|featuring)\b\.?.*$", "", t)
    basis = re.sub(r"[\(\[][^\)\]]*[\)\]]", " ", t)
    basis = re.split(r"\s-\s|\s/\s", basis)[0]
    if not _alnum(basis):  # Titel steht nur in Klammern
        basis = t
    basis = ARTIKEL_RE.sub("", basis.strip())
    return _alnum(basis)


def version_marke(title):
    return frozenset(m.lower() for m in VERSION_RE.findall(title or ""))


def interpret_teile(artist):
    a = _deacc(artist).replace("&", " and ").replace("*", "")
    a = re.sub(r"\(\d+\)", "", a)
    teile = []
    for p in SPLIT_RE.split(a):
        w = frozenset(x for x in re.findall(r"\w+", p) if x not in FUELL and x != "_")
        if w:
            teile.append(w)
    return teile


def aehnlich(a_teile, b_teile):
    for x in a_teile:
        for y in b_teile:
            if x == y:
                return True
            k = len(x & y)
            if k and k / min(len(x), len(y)) >= 0.6 and k / max(len(x), len(y)) >= 0.5:
                return True
    return False


def akey(artist):
    return _alnum(re.sub(r"\(\d+\)", "", _deacc(artist)).replace("*", ""))


def namensanfang(a, b):
    """Wie bisher: einer der Namen beginnt mit dem anderen (ab 4 Zeichen), z. B. 'Daryl Hall John Oates' / 'Daryl Hall'."""
    return min(len(a), len(b)) >= 4 and (a.startswith(b) or b.startswith(a))


class Index:
    def __init__(self):
        self.titel = defaultdict(list)  # titel_key -> [(interpret_teile, versions_marke)]
        self.yt = defaultdict(set)      # YouTube-ID -> {titel_key}

    def add(self, artist, title, yt=None, fach=None):
        if fach == KARAOKE:
            return
        tk = titel_key(title)
        if not tk:
            return
        self.titel[tk].append((interpret_teile(artist), version_marke(title), akey(artist)))
        if yt:
            self.yt[yt].add(tk)

    def ist_dublette(self, artist, title, yt=None):
        tk = titel_key(title)
        if not tk:
            return False
        teile = interpret_teile(artist)
        if not teile:
            return False
        vm, ak = version_marke(title), akey(artist)
        for x, m, k in self.titel.get(tk, ()):
            if m == vm and (aehnlich(teile, x) or namensanfang(ak, k)):
                return True
        return bool(yt and tk in self.yt.get(yt, ()))
