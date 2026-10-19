#!/usr/bin/env python3
"""Einzel-Abfrage bei MusicBrainz: Erscheinungsjahr und Tags zu Interpret + Titel.

Zweite Quelle fuer die Warteliste (tools/process_missing_queue.py), wenn Discogs den Song nicht
kennt. Liefert {"year": int|None, "tags": [str, ...]} oder None, wenn nichts Passendes gefunden wurde.
MusicBrainz: 1 Anfrage/s, eigener User-Agent (https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting).
"""
import collections
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request

UA = "DriftwareCatalogBot/1.0 (info@driftware.online)"
MIN_INTERVAL = 1.1
_last = [0.0]


def _alnum(s):
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def _get(path, params):
    wait = MIN_INTERVAL - (time.time() - _last[0])
    if wait > 0:
        time.sleep(wait)
    url = "https://musicbrainz.org/ws/2/" + path + "?" + urllib.parse.urlencode({**params, "fmt": "json"})
    for attempt in range(3):
        _last[0] = time.time()
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code in (429, 503):
                time.sleep(5 * (attempt + 1))
                continue
            return {}
        except Exception:
            time.sleep(3)
    return {}


def _tags(obj):
    out = collections.Counter()
    for key in ("tags", "genres"):
        for t in obj.get(key) or []:
            out[t["name"].lower()] += max(1, int(t.get("count") or 1))
    return out


def lookup(artist, title):
    """Passende Aufnahme suchen (Score >= 85, Interpret stimmt ueberein)."""
    artist = re.split(r"\s+(?:feat\.?|ft\.?|featuring)\s+", artist or "", flags=re.I)[0]
    title_clean = re.sub(r"\s*[\(\[][^\)\]]*[\)\]]", "", title or "").strip() or title
    q = f'recording:"{title_clean}" AND artist:"{artist}"'
    years, tags, artist_id = [], collections.Counter(), None
    for rec in _get("recording", {"query": q, "limit": "5"}).get("recordings", []):
        if rec.get("score", 0) < 85:
            continue
        names = " ".join(c.get("name", "") for c in rec.get("artist-credit", []) if isinstance(c, dict))
        if not _alnum(artist) or not (_alnum(artist) in _alnum(names) or _alnum(names) in _alnum(artist)):
            continue
        m = re.match(r"(\d{4})", rec.get("first-release-date") or "")
        if m:
            years.append(int(m.group(1)))
        tags += _tags(rec)
        if not artist_id:
            for c in rec.get("artist-credit", []):
                if isinstance(c, dict) and c.get("artist", {}).get("id"):
                    artist_id = c["artist"]["id"]
                    break
    if not years and not tags:
        return None
    if artist_id:
        tags += _tags(_get(f"artist/{artist_id}", {"inc": "tags+genres"}))
    return {"year": min(years) if years else None, "tags": [t for t, _ in tags.most_common(8)]}


if __name__ == "__main__":
    import sys
    print(lookup(sys.argv[1], sys.argv[2]))
