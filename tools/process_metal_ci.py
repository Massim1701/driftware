#!/usr/bin/env python3
"""Phase B der Metall-Erweiterung in GitHub Actions (ersetzt process_metal_local.py auf dem Mac).

  python3 tools/process_metal_ci.py [Dekade ...]

Loest die Kandidaten aus queue/<dekade>-metal.json ueber die YouTube-Data-API auf (YOUTUBE_API_KEY;
yt-dlp-Suchen werden von YouTube auf den Runnern blockiert), fuegt Treffer in <dekade>-music/songs.json
ein und baut die Metall-Playlist neu. Erledigte Kandidaten verlassen die Warteschlange; Fehlanzeigen
landen in queue/metal-ohne-treffer.json, damit fetch_metal_candidates.py sie nicht erneut vorschlaegt.
Ist das API-Tageskontingent aufgebraucht, endet der Lauf sauber, der Rest bleibt in der Warteschlange.
Zustandslos: nach einem Neu-Lauf auf frischem Stand setzt es dort fort, wo die Warteschlange noch Eintraege hat.
"""
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import process_decade_queue as pq  # noqa: E402  (build_song_entry)

DEKADEN = ["70er", "80er", "90er", "2000er", "2010er", "2020er"]
OHNE_PFAD = os.path.join(ROOT, "queue", "metal-ohne-treffer.json")
API_KEY = os.environ.get("YOUTUBE_API_KEY", "").strip()
BUDGET = int(os.environ.get("METAL_TIME_BUDGET_SECONDS") or os.environ.get("REDO_BUDGET_SECONDS") or "19800")
START = time.time()


class KontingentErschoepft(Exception):
    pass


def lade(pfad, default):
    return json.load(open(pfad, encoding="utf-8")) if os.path.exists(pfad) else default


def speichere(pfad, daten):
    tmp = pfad + ".tmp"
    json.dump(daten, open(tmp, "w", encoding="utf-8"), separators=(",", ":"), ensure_ascii=False)
    os.replace(tmp, pfad)


def suche_api(artist, title):
    params = {"part": "snippet", "q": f"{artist} {title}", "type": "video", "maxResults": "5", "key": API_KEY}
    url = "https://www.googleapis.com/youtube/v3/search?" + urllib.parse.urlencode(params)
    try:
        with urllib.request.urlopen(url, timeout=20) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        if e.code == 403:
            raise KontingentErschoepft(e.read().decode("utf-8", "replace")[:200])
        raise
    kandidaten = []
    for item in data.get("items", []):
        vid = item.get("id", {}).get("videoId")
        if not vid:
            continue
        sn = item.get("snippet", {})
        th = sn.get("thumbnails", {})
        thumb = (th.get("high") or th.get("medium") or th.get("default") or {}).get("url")
        kandidaten.append({"id": vid, "channel": sn.get("channelTitle", ""), "thumbnail": thumb})
    for c in kandidaten:
        if "vevo" in c["channel"].lower():
            return c
    return kandidaten[0] if kandidaten else None


def dekade(dec, ohne):
    q_pfad = os.path.join(ROOT, "queue", f"{dec}-metal.json")
    queue = lade(q_pfad, [])
    if not queue:
        return 0, False
    kat_pfad = os.path.join(ROOT, f"{dec}-music", "songs.json")
    kat = json.load(open(kat_pfad, encoding="utf-8"))
    schluessel = {(s.get("a", "").lower(), s.get("t", "").lower()) for l in kat.values() for s in l}
    ytids = {s.get("yt") for l in kat.values() for s in l}
    print(f"{dec}: {len(queue)} Kandidaten", flush=True)
    neu, erledigt, stopp = 0, set(), False

    def sichern():
        speichere(kat_pfad, kat)
        rest = [c for c in queue if c["id"] not in erledigt]
        if rest:
            speichere(q_pfad, rest)
        elif os.path.exists(q_pfad):
            os.remove(q_pfad)
        speichere(OHNE_PFAD, sorted(ohne))

    for i, c in enumerate(queue, 1):
        if time.time() - START > BUDGET:
            print("Zeitbudget erreicht, Rest bleibt in der Warteschlange.", flush=True)
            stopp = True
            break
        try:
            info = suche_api(c["a"], c["t"])
        except KontingentErschoepft as e:
            print(f"YouTube-API-Kontingent erschoepft, Rest bleibt in der Warteschlange: {e}", flush=True)
            stopp = True
            break
        except Exception as e:
            print(f"  Fehler {c['a']} - {c['t']}: {e}", flush=True)
            continue
        erledigt.add(c["id"])
        if not info:
            ohne.add(c["id"])
            continue
        e = pq.build_song_entry(c, info)
        if e["yt"] not in ytids and (e["a"].lower(), e["t"].lower()) not in schluessel:
            kat.setdefault(c["genre_key"], []).append(e)
            ytids.add(e["yt"]); schluessel.add((e["a"].lower(), e["t"].lower()))
            neu += 1
        if i % 20 == 0:
            sichern()
            print(f"  {dec}: {i}/{len(queue)} geprueft, {neu} eingefuegt", flush=True)
        time.sleep(0.3)
    sichern()
    print(f"{dec}: {neu} Songs eingefuegt", flush=True)
    return neu, stopp


def main():
    if not API_KEY:
        sys.exit("YOUTUBE_API_KEY fehlt (yt-dlp-Suche geht auf den Runnern nicht).")
    ohne = set(lade(OHNE_PFAD, []))
    gesamt = 0
    for dec in (sys.argv[1:] or DEKADEN):
        n, stopp = dekade(dec, ohne)
        gesamt += n
        if stopp:
            break
    if gesamt:
        subprocess.run([sys.executable, os.path.join(ROOT, "tools", "build_metal.py"), "--apply"], check=True)
    print(f"Fertig: {gesamt} Songs eingefuegt.")


if __name__ == "__main__":
    main()
