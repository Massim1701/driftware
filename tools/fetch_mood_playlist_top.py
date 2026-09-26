#!/usr/bin/env python3
"""Phase-A-Sammler fuer dekaden-uebergreifende Stimmungs-Playlists, Variante
"Top-N pro Style": sucht bei Discogs OHNE Jahresfilter, sortiert nach
Beliebtheit ("have", absteigend), und nimmt pro Style nur die TOP_N
beliebtesten (nach Dedup ueber Release-ID und normalisiertem Artist+Titel).

Hintergrund: Ein Jahr-fuer-Jahr-Sweep (siehe fetch_mood_playlist_candidates.py)
liefert bei sehr breiten Styles wie "Disco" zehntausende Treffer, weil
Discogs Neuauflagen/Compilations alter Hits mit dem Neuauflage-Jahr taggt --
das treibt die Ergebnismenge ins Uferlose. Diese Variante begrenzt die
Groesse direkt und vorhersehbar: TOP_N beliebteste Einzeltitel je Style,
unabhaengig vom Jahr.

Aufruf: python3 fetch_mood_playlist_top.py <project> <top_n> <genre_key>=<style1,style2,...> [...]
"""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) if "__file__" in dir() else "."

USER_AGENT = "DriftwareCatalogBot/1.0 +https://driftware.online"
TIME_BUDGET_SECONDS = int(os.environ.get("MOOD_TIME_BUDGET_SECONDS", "1500"))
START_TS = time.time()


def api_get(url, retries=5):
    headers = {"User-Agent": USER_AGENT}
    token = os.environ.get("DISCOGS_TOKEN")
    if token:
        headers["Authorization"] = "Discogs token=" + token
    for attempt in range(retries):
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = 3 * (attempt + 1)
                print(f"    Rate-Limit (429), warte {wait}s ...")
                time.sleep(wait)
                continue
            print(f"    HTTP-Fehler {e.code} bei {url}: {e.read()[:200]}")
            return None
        except Exception as e:
            print(f"    Fehler bei {url}: {e}")
            time.sleep(2)
    return None


def search_style(style, page=1, per_page=100):
    params = {
        "style": style,
        "format": "Single",
        "type": "release",
        "sort": "have",
        "sort_order": "desc",
        "per_page": str(per_page),
        "page": str(page),
    }
    url = "https://api.discogs.com/database/search?" + urllib.parse.urlencode(params)
    return api_get(url)


def song_id(artist, title):
    return (artist or "").strip().lower(), (title or "").strip().lower()


def load_json(path, default):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return default


def save_json(path, data):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"), ensure_ascii=False)
    os.replace(tmp, path)


def main():
    if len(sys.argv) < 4:
        print("Usage: fetch_mood_playlist_top.py <project> <top_n> <genre_key>=<style1,style2,...> [...]")
        sys.exit(1)
    project = sys.argv[1]
    top_n = int(sys.argv[2])
    genre_specs = sys.argv[3:]

    queue_path = os.path.join(ROOT, "queue", f"{project}-erweiterung.json")
    progress_path = os.path.join(ROOT, "queue", f"{project}-fortschritt.json")

    queue = load_json(queue_path, [])
    progress = load_json(progress_path, {"done_styles": {}})
    done_styles = progress.get("done_styles", {})

    seen_ids = set(c["id"] for c in queue if c.get("id"))
    seen_title_keys = set(song_id(c.get("a"), c.get("t")) for c in queue)

    for spec in genre_specs:
        genre_key, styles_raw = spec.split("=", 1)
        styles = [s.strip() for s in styles_raw.split(",")]
        for style in styles:
            style_state_key = f"{genre_key}::{style}"
            state = done_styles.get(style_state_key, {"page": 1, "count": 0, "finished": False})
            if state.get("finished"):
                print(f"-- {style_state_key} schon fertig ({state.get('count')} Songs) --")
                continue
            page = state["page"]
            count = state["count"]
            while count < top_n:
                if time.time() - START_TS > TIME_BUDGET_SECONDS:
                    print(f"Zeitbudget erreicht bei {style_state_key} (Seite {page}, {count}/{top_n}).")
                    done_styles[style_state_key] = {"page": page, "count": count, "finished": False}
                    save_json(queue_path, queue)
                    save_json(progress_path, {"done_styles": done_styles})
                    return
                data = search_style(style, page=page)
                if not data:
                    break
                results = data.get("results", [])
                if not results:
                    break
                for r in results:
                    if count >= top_n:
                        break
                    rid = r.get("id")
                    have = (r.get("community") or {}).get("have", 0)
                    if not rid or rid in seen_ids:
                        continue
                    title_full = r.get("title") or ""
                    if " - " in title_full:
                        artist, title = title_full.split(" - ", 1)
                    else:
                        artist, title = "", title_full
                    artist, title = artist.strip(), title.strip()
                    tkey = song_id(artist, title)
                    if tkey in seen_title_keys:
                        seen_ids.add(rid)
                        continue
                    seen_ids.add(rid)
                    seen_title_keys.add(tkey)
                    queue.append({
                        "id": rid,
                        "a": artist,
                        "t": title,
                        "y": r.get("year"),
                        "g": ", ".join(r.get("genre") or []),
                        "s": ", ".join(r.get("style") or []),
                        "c": r.get("country"),
                        "l": ", ".join(r.get("label") or []),
                        "th": r.get("thumb") or None,
                        "cv": r.get("cover_image") or None,
                        "u": "https://www.discogs.com" + r.get("uri", ""),
                        "hv": have,
                        "genre_key": genre_key,
                    })
                    count += 1
                pages_total = data.get("pagination", {}).get("pages", 1)
                page += 1
                if page > pages_total:
                    break
                time.sleep(0.6)
            done_styles[style_state_key] = {"page": page, "count": count, "finished": True}
            save_json(queue_path, queue)
            save_json(progress_path, {"done_styles": done_styles})
            print(f"-- {style_state_key} fertig: {count} Songs, Queue gesamt {len(queue)} --")

    save_json(queue_path, queue)
    save_json(progress_path, {"done_styles": done_styles})
    print(f"Alles fertig. Queue gesamt: {len(queue)}.")


if __name__ == "__main__":
    main()
