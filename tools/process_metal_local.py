#!/usr/bin/env python3
"""Phase B der Metall-Erweiterung, lokal auf dem Mac (yt-dlp wird auf GitHub-Runnern geblockt).

  python3 tools/process_metal_local.py suchen  [Dekade ...]   YouTube-Links zu queue/<dekade>-metal.json
                                                              suchen, Zwischenstand in ~/driftware-metal/
  python3 tools/process_metal_local.py anwenden [Dekade ...]  Treffer in <dekade>-music/songs.json einfuegen,
                                                              Metall-Playlist neu bauen, committen, pushen

'suchen' ist beliebig oft wiederholbar (macht dort weiter, wo es aufgehoert hat) und fasst das Repo nicht an.
'anwenden' arbeitet in einem eigenen Klon auf dem frischen origin/master und ist bei einem abgelehnten Push wiederholbar.
"""
import concurrent.futures
import json
import os
import random
import subprocess
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import process_decade_queue as pq  # noqa: E402  (search_youtube, build_song_entry)

STATE = os.path.expanduser("~/driftware-metal")
DEKADEN = ["70er", "80er", "90er", "2000er", "2010er", "2020er"]
THREADS = 4


def lade(pfad, default):
    return json.load(open(pfad, encoding="utf-8")) if os.path.exists(pfad) else default


def speichere(pfad, daten):
    tmp = pfad + ".tmp"
    json.dump(daten, open(tmp, "w", encoding="utf-8"), separators=(",", ":"), ensure_ascii=False)
    os.replace(tmp, pfad)


def suchen(dec):
    queue = lade(os.path.join(ROOT, "queue", f"{dec}-metal.json"), [])
    erg_pfad = os.path.join(STATE, f"{dec}-ergebnis.json")
    erg = lade(erg_pfad, {})  # Release-ID -> Katalogeintrag oder None (kein Treffer)
    offen = [c for c in queue if str(c["id"]) not in erg]
    print(f"{dec}: {len(queue)} Kandidaten, {len(offen)} noch offen", flush=True)

    def arbeit(c):
        time.sleep(random.uniform(0.5, 1.5))
        try:
            info = pq.search_youtube(c["a"], c["t"])
        except Exception as e:
            print(f"  Fehler {c['a']} - {c['t']}: {e}", flush=True)
            return c, "fehler"
        return c, (pq.build_song_entry(c, info) | {"_k": c["genre_key"]} if info else None)

    fertig = 0
    with concurrent.futures.ThreadPoolExecutor(THREADS) as ex:
        for c, r in ex.map(arbeit, offen):
            if r == "fehler":
                continue
            erg[str(c["id"])] = r
            fertig += 1
            if fertig % 20 == 0:
                speichere(erg_pfad, erg)
                treffer = sum(1 for v in erg.values() if v)
                print(f"  {dec}: {fertig}/{len(offen)} geprueft, {treffer} Treffer gesamt", flush=True)
    speichere(erg_pfad, erg)
    print(f"{dec}: fertig, {sum(1 for v in erg.values() if v)} Treffer", flush=True)


def anwenden(decs):
    # eigener flacher Klon in ~/driftware-metal/repo: der Arbeitsklon bleibt unberuehrt
    klon = os.path.join(STATE, "repo")
    if not os.path.isdir(klon):
        url = subprocess.run(["git", "-C", ROOT, "remote", "get-url", "origin"], capture_output=True,
                             text=True, check=True).stdout.strip()
        subprocess.run(["git", "clone", "--depth", "1", url, klon], check=True)

    def git(*a, check=True):
        return subprocess.run(["git", "-C", klon, *a], capture_output=True, text=True, check=check)

    for versuch in range(5):
        git("fetch", "--depth", "1", "origin", "master")
        git("reset", "--hard", "origin/master")  # Reste verwerfen; alles hier ist reproduzierbar
        neu = 0
        for dec in decs:
            erg = lade(os.path.join(STATE, f"{dec}-ergebnis.json"), {})
            kat_pfad = os.path.join(klon, f"{dec}-music", "songs.json")
            kat = json.load(open(kat_pfad, encoding="utf-8"))
            schluessel = {(s.get("a", "").lower(), s.get("t", "").lower()) for l in kat.values() for s in l}
            ytids = {s.get("yt") for l in kat.values() for s in l}
            n = 0
            for e in erg.values():
                if not e:
                    continue
                e = dict(e)
                k = e.pop("_k")
                if e["yt"] in ytids or (e["a"].lower(), e["t"].lower()) in schluessel:
                    continue
                kat.setdefault(k, []).append(e)
                ytids.add(e["yt"]); schluessel.add((e["a"].lower(), e["t"].lower()))
                n += 1
            if n:
                json.dump(kat, open(kat_pfad, "w", encoding="utf-8"), separators=(",", ":"), ensure_ascii=False)
                neu += n
            q = os.path.join(klon, "queue", f"{dec}-metal.json")
            if os.path.exists(q):  # nur Erledigte (Treffer und Fehlanzeigen) entfernen, Rest bleibt in der Warteschlange
                rest = [c for c in json.load(open(q, encoding="utf-8")) if str(c["id"]) not in erg]
                if rest:
                    json.dump(rest, open(q, "w", encoding="utf-8"), separators=(",", ":"), ensure_ascii=False)
                else:
                    os.remove(q)
            print(f"{dec}: {n} Songs eingefuegt", flush=True)
        subprocess.run([sys.executable, os.path.join(klon, "tools", "build_metal.py"), "--apply"], check=True)
        git("add", "-A", "--", "*-music/songs.json", "queue")
        if git("diff", "--cached", "--quiet", check=False).returncode == 0:
            print("Keine Aenderungen."); return
        git("commit", "-m", f"Metall-Erweiterung: {neu} Songs aus Discogs-Top-Listen ({', '.join(decs)})\n\n"
            "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>")
        if git("push", "origin", "HEAD:master", check=False).returncode == 0:
            print("Gepusht."); return
        print(f"Push abgelehnt (Versuch {versuch + 1}), neuer Anlauf auf frischem Stand ...", flush=True)
        time.sleep(5)
    sys.exit("Push nach 5 Versuchen fehlgeschlagen.")


if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in ("suchen", "anwenden"):
        sys.exit(__doc__)
    os.makedirs(STATE, exist_ok=True)
    decs = sys.argv[2:] or DEKADEN
    if sys.argv[1] == "suchen":
        for d in decs:
            suchen(d)
    else:
        anwenden(decs)
