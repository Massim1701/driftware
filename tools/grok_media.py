#!/usr/bin/env python3
"""Bilder per xAI-API (Grok Imagine) erzeugen -- mit Budgetschutz.

  python3 tools/grok_media.py bild "<Prompt>" --out ~/Pictures/grok/haushalt [--n 2] [--model ...] [--aspect 4:3]
  python3 tools/grok_media.py video "<Prompt>" --out ~/Pictures/grok/video [--dauer 5] [--aufloesung 480p] [--bild datei.jpg]
  python3 tools/grok_media.py status          # Guthaben-Stand laut eigener Buchfuehrung

Schluessel: Umgebungsvariable XAI_API_KEY oder ~/.config/xai/api-key.txt (nie im Repo, nie im Chat).
Budget: ~/.config/xai/budget.json  {"start_usd": 8.95, "spent_usd": ...}; jeder Lauf bucht die
tatsaechlichen Kosten aus der API-Antwort (usage.cost_in_usd_ticks, 1e10 Ticks = 1 USD).
Sicherheitsgrenzen: vor dem Lauf wird der Preis geschaetzt; ueber MAX_RUN_USD je Lauf oder ueber
dem Restbudget bricht das Skript ab (MAX_RUN_USD ueberschreiten nur mit --ja).
"""
import argparse
import base64
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

API = "https://api.x.ai/v1"
KEY_FILE = os.path.expanduser("~/.config/xai/api-key.txt")
BUDGET_FILE = os.path.expanduser("~/.config/xai/budget.json")
LOG_FILE = os.path.expanduser("~/.config/xai/log.jsonl")
START_USD = 8.95      # Guthaben laut Konsole am 19.10.2026
MAX_RUN_USD = 0.50    # mehr pro Lauf nur mit --ja
BILD_PREISE = {       # USD je Bild (Models-Seite der Konsole, 19.10.2026)
    "grok-imagine-image": 0.02,
    "grok-imagine-image-2.0": 0.04,
    "grok-imagine-image-quality": 0.05,
}
VIDEO_PREISE = {      # USD je Sekunde, 480p (Models-Seite der Konsole, 19.10.2026)
    "grok-imagine-video-1.5-lite": 0.02,
}
TICKS = 10_000_000_000


def schluessel():
    k = os.environ.get("XAI_API_KEY", "").strip()
    if not k and os.path.exists(KEY_FILE):
        k = open(KEY_FILE, encoding="utf-8").read().strip()
    if not k.startswith("xai-"):
        sys.exit("Kein xAI-Schluessel gefunden (XAI_API_KEY oder ~/.config/xai/api-key.txt).")
    return k


def budget():
    if os.path.exists(BUDGET_FILE):
        return json.load(open(BUDGET_FILE, encoding="utf-8"))
    return {"start_usd": START_USD, "spent_usd": 0.0}


def budget_speichern(b):
    os.makedirs(os.path.dirname(BUDGET_FILE), exist_ok=True)
    json.dump(b, open(BUDGET_FILE, "w", encoding="utf-8"))
    os.chmod(BUDGET_FILE, 0o600)


def post(pfad, body):
    req = urllib.request.Request(
        API + pfad, data=json.dumps(body).encode(), method="POST",
        headers={"Authorization": "Bearer " + schluessel(), "Content-Type": "application/json",
                 "User-Agent": "DriftwareMedia/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        sys.exit(f"API-Fehler {e.code}: {e.read().decode()[:400]}")


def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:40] or "bild"


def cmd_bild(a):
    preis = BILD_PREISE.get(a.model)
    if preis is None:
        sys.exit(f"Unbekanntes Modell {a.model}; bekannt: {', '.join(BILD_PREISE)}")
    schaetzung = preis * a.n
    b = budget()
    rest = b["start_usd"] - b["spent_usd"]
    print(f"Modell {a.model}, {a.n} Bild(er): geschaetzt ${schaetzung:.2f}, Restbudget ${rest:.2f}")
    if schaetzung > rest:
        sys.exit("Abbruch: Schaetzung liegt ueber dem Restbudget.")
    if schaetzung > MAX_RUN_USD and not a.ja:
        sys.exit(f"Abbruch: ueber ${MAX_RUN_USD:.2f} je Lauf. Mit --ja bestaetigen.")
    antwort = post("/images/generations", {
        "model": a.model, "prompt": a.prompt, "n": a.n,
        "aspect_ratio": a.aspect, "resolution": a.resolution, "response_format": "b64_json"})
    kosten = antwort.get("usage", {}).get("cost_in_usd_ticks", 0) / TICKS or schaetzung
    b["spent_usd"] = round(b["spent_usd"] + kosten, 4)
    budget_speichern(b)
    os.makedirs(os.path.expanduser(a.out), exist_ok=True)
    stamp = time.strftime("%H%M%S")
    pfade = []
    for i, d in enumerate(antwort.get("data", []), 1):
        ext = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}.get(d.get("mime_type"), "jpg")
        p = os.path.join(os.path.expanduser(a.out), f"{slug(a.prompt)}-{a.model.split('-', 2)[-1]}-{stamp}-{i}.{ext}")
        open(p, "wb").write(base64.b64decode(d["b64_json"]))
        pfade.append(p)
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps({"zeit": time.strftime("%Y-%m-%d %H:%M:%S"), "modell": a.model, "n": a.n,
                            "kosten_usd": round(kosten, 4), "prompt": a.prompt[:200]}, ensure_ascii=False) + "\n")
    print(f"Kosten ${kosten:.3f}; Restbudget ${b['start_usd'] - b['spent_usd']:.2f}")
    for p in pfade:
        print(p)


def get(pfad):
    req = urllib.request.Request(API + pfad, headers={
        "Authorization": "Bearer " + schluessel(), "User-Agent": "DriftwareMedia/1.0"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode())


def cmd_video(a):
    preis = VIDEO_PREISE.get(a.model)
    if preis is None:
        sys.exit(f"Unbekanntes Modell {a.model}; bekannt: {', '.join(VIDEO_PREISE)}")
    schaetzung = preis * a.dauer
    b = budget()
    rest = b["start_usd"] - b["spent_usd"]
    print(f"Modell {a.model}, {a.dauer}s {a.aufloesung}: geschaetzt ${schaetzung:.2f}, Restbudget ${rest:.2f}")
    if schaetzung > rest:
        sys.exit("Abbruch: Schaetzung liegt ueber dem Restbudget.")
    if schaetzung > MAX_RUN_USD and not a.ja:
        sys.exit(f"Abbruch: ueber ${MAX_RUN_USD:.2f} je Lauf. Mit --ja bestaetigen.")
    body = {"model": a.model, "prompt": a.prompt, "duration": a.dauer,
            "aspect_ratio": a.aspect, "resolution": a.aufloesung}
    if a.bild:
        rohdaten = base64.b64encode(open(os.path.expanduser(a.bild), "rb").read()).decode()
        body["image"] = {"url": "data:image/jpeg;base64," + rohdaten}
    start = post("/videos/generations", body)
    rid = start.get("request_id")
    if not rid:
        sys.exit(f"Unerwartete Antwort: {json.dumps(start)[:400]}")
    print("Auftrag", rid, "-- warte ...")
    for _ in range(120):
        time.sleep(5)
        erg = get("/videos/" + rid)
        if erg.get("status") in ("done", "completed") or erg.get("video"):
            break
        if erg.get("status") in ("failed", "expired", "error"):
            sys.exit(f"Fehlgeschlagen: {json.dumps(erg)[:400]}")
    else:
        sys.exit("Zeitueberschreitung beim Warten auf das Video.")
    kosten = erg.get("usage", {}).get("cost_in_usd_ticks", 0) / TICKS or schaetzung
    b["spent_usd"] = round(b["spent_usd"] + kosten, 4)
    budget_speichern(b)
    url = (erg.get("video") or {}).get("url")
    if not url:
        sys.exit(f"Keine Video-URL in der Antwort: {json.dumps(erg)[:400]}")
    os.makedirs(os.path.expanduser(a.out), exist_ok=True)
    pfad = os.path.join(os.path.expanduser(a.out), f"{slug(a.prompt)}-{time.strftime('%H%M%S')}.mp4")
    urllib.request.urlretrieve(url, pfad)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps({"zeit": time.strftime("%Y-%m-%d %H:%M:%S"), "modell": a.model, "dauer": a.dauer,
                            "kosten_usd": round(kosten, 4), "prompt": a.prompt[:200]}, ensure_ascii=False) + "\n")
    print(f"Kosten ${kosten:.3f}; Restbudget ${b['start_usd'] - b['spent_usd']:.2f}")
    print(pfad)


def cmd_status(_):
    b = budget()
    print(f"Start ${b['start_usd']:.2f}, ausgegeben ${b['spent_usd']:.2f}, Rest ${b['start_usd'] - b['spent_usd']:.2f}")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    s = p.add_subparsers(dest="cmd", required=True)
    b = s.add_parser("bild")
    b.add_argument("prompt")
    b.add_argument("--out", default="~/Pictures/grok")
    b.add_argument("--n", type=int, default=1)
    b.add_argument("--model", default="grok-imagine-image")
    b.add_argument("--aspect", default="4:3")
    b.add_argument("--resolution", default="1k")
    b.add_argument("--ja", action="store_true", help="Lauf ueber dem Kostenlimit bestaetigen")
    b.set_defaults(f=cmd_bild)
    v = s.add_parser("video")
    v.add_argument("prompt")
    v.add_argument("--out", default="~/Pictures/grok/video")
    v.add_argument("--dauer", type=int, default=5)
    v.add_argument("--model", default="grok-imagine-video-1.5-lite")
    v.add_argument("--aspect", default="16:9")
    v.add_argument("--aufloesung", default="480p")
    v.add_argument("--bild", help="Startbild fuer Bild-zu-Video")
    v.add_argument("--ja", action="store_true", help="Lauf ueber dem Kostenlimit bestaetigen")
    v.set_defaults(f=cmd_video)
    st = s.add_parser("status")
    st.set_defaults(f=cmd_status)
    a = p.parse_args()
    a.f(a)
