#!/usr/bin/env python3
"""Fuegt die Kategorie 'NDW' (Neue Deutsche Welle, 127 Songs, per Discogs
gefunden) in 80er-music/songs.json ein. Einmalig auszufuehren, siehe
Anweisung im Chat -- am besten NACH einem Neustart oder VOR dem Start des
laufenden bpm_fetch.py 80er, damit der BPM-Job die neue Kategorie beim
naechsten Einlesen mitbekommt (er haelt die Datei sonst im Speicher und
ueberschreibt externe Aenderungen bei jedem Checkpoint)."""
import json
import os

with open("add_ndw_songs.json", encoding="utf-8") as f:
    ndw_songs = json.load(f)

path = "80er-music/songs.json"
with open(path, encoding="utf-8") as f:
    data = json.load(f)

data["NDW"] = ndw_songs

tmp = path + ".tmp"
with open(tmp, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False)
os.replace(tmp, path)

print(f"NDW eingefuegt: {len(ndw_songs)} Songs. Kategorien jetzt: {len(data)}")
