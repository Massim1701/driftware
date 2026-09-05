#!/usr/bin/env python3
"""BPM-Analyse pro Dekade: liest <decade>-music/songs.json, ermittelt BPM via
YouTube-Audio-Ausschnitt + librosa und schreibt das Ergebnis als 'bpm'-Feld
zurück (mit Checkpointing nach jedem Song)."""

import json
import os
import subprocess
import sys
import tempfile
import time

import librosa
import numpy as np

COOKIE_BROWSER = "chrome"
CLIP_SECTION = "*30-55"  # 25s statt 45s reichen fuer die BPM-Erkennung, spart Downloadzeit
DOWNLOAD_TIMEOUT = 120
SLEEP_BETWEEN = 1.5
PROGRESS_EVERY = 25


def load_songs(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_songs(path, data):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
    os.replace(tmp, path)


def detect_bpm(wav_path):
    y, sr = librosa.load(wav_path, sr=None, mono=True)
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    bpm = float(np.atleast_1d(tempo)[0])

    candidates = [bpm]
    if bpm < 70:
        candidates.append(bpm * 2)
    if bpm > 180:
        candidates.append(bpm / 2)
    for c in candidates:
        if 70 <= c <= 180:
            return round(c)
    return round(bpm)


def download_clip(yt_id, out_base):
    wav_path = out_base + ".wav"
    cmd = [
        "yt-dlp",
        f"https://www.youtube.com/watch?v={yt_id}",
        "-x", "--audio-format", "wav",
        "--download-sections", CLIP_SECTION,
        "--cookies-from-browser", COOKIE_BROWSER,
        "-o", out_base,
        "--quiet", "--no-warnings",
    ]
    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=DOWNLOAD_TIMEOUT
        )
    except subprocess.TimeoutExpired:
        return None, "Timeout beim Download"
    if result.returncode != 0 or not os.path.exists(wav_path):
        return None, (result.stderr or "").strip()[-300:]
    return wav_path, None


def main():
    if len(sys.argv) != 2:
        print("Usage: bpm_fetch.py <decade>  (z.B. 80er)")
        sys.exit(1)

    decade = sys.argv[1]
    base_dir = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(base_dir, f"{decade}-music", "songs.json")
    if not os.path.exists(path):
        print(f"Nicht gefunden: {path}")
        sys.exit(1)

    data = load_songs(path)
    songs = [s for genre_songs in data.values() for s in genre_songs if s.get("yt")]
    # Nach Popularitaet (hv = Discogs-Sammler-Zahl) absteigend sortieren, damit die
    # meistgehoerten/bekanntesten Songs zuerst ein BPM-Feld bekommen -- das Feature
    # ist damit schon frueh fuer den Grossteil der tatsaechlichen Nutzung nutzbar,
    # statt erst nach 100% Durchlauf durch den ganzen (auch obskuren) Katalog.
    songs.sort(key=lambda s: s.get("hv", 0) or 0, reverse=True)
    total = len(songs)
    already = sum(1 for s in songs if s.get("bpm"))
    print(f"{decade}: {total} Songs mit yt-Feld, {already} bereits mit bpm.")

    for i, song in enumerate(songs, 1):
        if song.get("bpm"):
            continue

        yt_id = song["yt"]
        artist = song.get("a", "")
        title = song.get("t", "")

        with tempfile.TemporaryDirectory() as tmpdir:
            out_base = os.path.join(tmpdir, "clip")
            wav_path, err = download_clip(yt_id, out_base)
            if wav_path is None:
                print(f"  [Fehler] {artist} - {title} ({yt_id}): {err}")
                continue
            try:
                bpm = detect_bpm(wav_path)
                song["bpm"] = bpm
            except Exception as e:
                print(f"  [Fehler/Analyse] {artist} - {title} ({yt_id}): {e}")
                continue

        save_songs(path, data)

        if i % PROGRESS_EVERY == 0 or i == total:
            print(f"[{i}/{total}] {artist} - {title}: {song.get('bpm', '?')} BPM")

        time.sleep(SLEEP_BETWEEN)

    print(f"Fertig: {decade}")


if __name__ == "__main__":
    main()
