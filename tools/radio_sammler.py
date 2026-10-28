#!/usr/bin/env python3
"""Schreibt mit, welcher Interpret/Titel auf den 80s80s-Kanaelen laeuft (nur Text, kein Audio).

Laeuft als GitHub-Actions-Job (.github/workflows/radio-liste.yml) und sammelt die Liste fuer fornetta;
Abgleich, Warteliste, Discogs und YouTube-Link macht danach fornetta (tools/songlog_abgleich.py).

Wie ein Player: kurz mit dem oeffentlichen Stream verbinden (streams.80s80s.de/<kanal>/mp3-192/homepage/),
die ICY-Metadaten (StreamTitle) lesen, trennen. Bei einem Songwechsel kommt eine Zeile an die Ausgabedatei:
  {"z": "2026-10-28T21:41:07", "k": "ndw", "a": "Nena", "t": "99 Luftballons"}   (Zeit in UTC)
Kanalnamen, Jingles und Ansagen (kein "Interpret - Titel") werden nicht gespeichert. Alle Kanaele werden
parallel gelesen (8 Verbindungen), alle 2 Minuten ein Durchlauf.

Aufruf: python3 tools/radio_sammler.py <titel.jsonl> --minuten 20
"""
import argparse
import json
import re
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

INTERVALL = 120  # Sekunden zwischen zwei Durchlaeufen
THREADS = 8

# Name im Menue von myonlineradio.de -> Kennung im Stream (Prince hat keine oeffentliche Adresse)
KANAELE = {
    "80s80s Digital": "80s80sMV", "Love": "love", "Italo Disco": "italodiscomix", "Wave": "wave",
    "Romantic Rock": "romanticrock", "Funk & Soul": "soul", "Rock": "rock", "Party": "party",
    "German": "deutsch", "Dark Wave": "darkwave", "Alternative": "alternative", "Dance": "dance",
    "NDW": "ndw", "Dinner Party": "dinnerparty", "Live": "livemusic", "EBM": "ebm",
    "Soul Ballads": "soulballads", "Hip Hop": "hiphop", "Freestyle": "freestyle", "Techno": "techno",
    "WGT": "wgt", "Neo": "neo", "Breakdance": "breakdance", "Reggae": "reggae", "Queen": "queen",
    "Pop Stories": "popstories", "Summer": "summerhits", "Xmas": "christmas",
}
KEIN_LIED = re.compile(r"^80s80s|werbung|jingle|nachrichten|wetter|verkehr|news|sendung|moderation|gewinnspiel", re.I)


def lese_titel(slug):
    """(icy_name, StreamTitle): der Titel kommt nach dem Vorspann (Kanalname) bei etwa Block 58."""
    req = urllib.request.Request(f"http://streams.80s80s.de/{slug}/mp3-192/homepage/",
                                 headers={"Icy-MetaData": "1", "User-Agent": "Mozilla/5.0 (driftware-songlist)"})
    r = urllib.request.urlopen(req, timeout=20)
    try:
        mi = int(r.headers.get("icy-metaint") or 0)
        name = r.headers.get("icy-name") or ""
        titel = ""
        if mi:
            for _ in range(80):
                r.read(mi)
                n = r.read(1)[0] * 16
                if n:
                    m = r.read(n).rstrip(b"\0").decode("utf-8", "replace")
                    if m.startswith("StreamTitle='"):
                        t = m[len("StreamTitle='"):]
                        titel = (t[: t.rfind("';")] if "';" in t else t).strip()
                        if titel and titel != name:
                            break
        return name, titel
    finally:
        r.close()


def als_lied(titel, name):
    if not titel or titel == name or KEIN_LIED.search(titel) or " - " not in titel:
        return None
    a, t = titel.split(" - ", 1)
    a, t = a.strip(), t.strip()
    return (a, t) if a and t else None


def abfragen(slug):
    try:
        name, titel = lese_titel(slug)
        return slug, als_lied(titel, name), None
    except Exception as e:  # Stream kurz weg oder gesperrt: spaeter erneut
        return slug, None, str(e)[:80]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ausgabe")
    ap.add_argument("--minuten", type=float, default=10)
    args = ap.parse_args()

    zuletzt = {}
    try:  # Zustand aus der Datei (frueherer Lauf): keine Doppeleintraege
        for zeile in open(args.ausgabe, encoding="utf-8"):
            try:
                x = json.loads(zeile)
                zuletzt[x["k"]] = (x["a"], x["t"])
            except (ValueError, KeyError):
                pass
    except FileNotFoundError:
        open(args.ausgabe, "a").close()

    ende = time.time() + args.minuten * 60
    fehler = {}
    gesamt = 0
    while True:
        start = time.time()
        neu = 0
        with ThreadPoolExecutor(THREADS) as ex, open(args.ausgabe, "a", encoding="utf-8") as out:
            for slug, lied, err in ex.map(abfragen, KANAELE.values()):
                if err:
                    fehler[slug] = fehler.get(slug, 0) + 1
                    if fehler[slug] in (1, 10, 100):
                        print(f"{slug}: {err} (Fehler Nr. {fehler[slug]})", flush=True)
                    continue
                fehler[slug] = 0
                if lied and zuletzt.get(slug) != lied:
                    zuletzt[slug] = lied
                    out.write(json.dumps({"z": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S"), "k": slug, "a": lied[0], "t": lied[1]}, ensure_ascii=False) + "\n")
                    neu += 1
        gesamt += neu
        print(f"{datetime.now(timezone.utc):%H:%M:%S} Durchlauf: {neu} neue Titel ({gesamt} in diesem Lauf), Kanaele mit Fehler: {sum(1 for v in fehler.values() if v)}", flush=True)
        rest = ende - time.time()
        if rest <= INTERVALL * 0.5:
            break
        time.sleep(max(0, min(INTERVALL - (time.time() - start), rest)))
    print(f"fertig: {gesamt} neue Titel")


if __name__ == "__main__":
    sys.exit(main())
