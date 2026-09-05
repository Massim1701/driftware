#!/usr/bin/env python3
"""Ordnet 23 bereits im 80er-Katalog vorhandene Songs (aus Electro, SynthPop,
NewWave, PostPunkGoth usw.) zusaetzlich der Kategorie 'NDW' zu (Falco, Nena,
Alphaville, Nina Hagen, DAF, Der Plan, Rheingold, Fehlfarben, The
Wirtschaftswunder, Hubert Kah). Bleiben in ihrer bisherigen Kategorie erhalten,
werden nur zusaetzlich unter NDW gelistet (kein Verschieben, nur Erweitern).

Einmalig auszufuehren -- am besten NACH einem Neustart oder VOR dem Start des
laufenden bpm_fetch.py 80er, damit der BPM-Job die Erweiterung beim naechsten
Einlesen mitbekommt (er haelt die Datei sonst im Speicher und ueberschreibt
externe Aenderungen bei jedem Checkpoint)."""
import json
import os

with open("reclassified_ndw_songs.json", encoding="utf-8") as f:
    extra_songs = json.load(f)

path = "80er-music/songs.json"
with open(path, encoding="utf-8") as f:
    data = json.load(f)

existing = data.setdefault("NDW", [])
existing_keys = {(s["a"], s["t"]) for s in existing}
added = 0
for s in extra_songs:
    key = (s["a"], s["t"])
    if key in existing_keys:
        continue
    existing.append(s)
    existing_keys.add(key)
    added += 1

tmp = path + ".tmp"
with open(tmp, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False)
os.replace(tmp, path)

print(f"NDW erweitert: {added} zusaetzliche Songs. NDW-Gesamt jetzt: {len(existing)}")
