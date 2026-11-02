#!/usr/bin/env python3
"""Loest einen Rebase-Konflikt in queue/fehlende-lieder.json selbst auf.

Hintergrund: Die Datei ist eine einzige Zeile. Schreiben der Logger (alle ~40 Min, neue
Lieder anhaengen) und der Nachtlauf (verarbeitete Lieder entfernen) gleichzeitig, meldet git
immer einen Konflikt -- und die Arbeit des Nachtlaufs ging verloren.

Aufruf waehrend eines Rebase mit Konflikt (Stufe 1 = gemeinsame Basis, 2 = frischer
Remote-Stand, 3 = unser Commit). Ergebnis = Remote-Stand ohne die Eintraege, die WIR
entfernt haben, plus Eintraege, die nur WIR neu haben. Schreibt wie die Skripte kompakt,
eine Zeile, ohne Zeilenumbruch. Exit 1, wenn eine Stufe fehlt oder kein JSON-Array ist.
"""
import json
import subprocess
import sys

PFAD = "queue/fehlende-lieder.json"


def stufe(n):
    r = subprocess.run(["git", "show", f":{n}:{PFAD}"], capture_output=True, text=True)
    if r.returncode != 0:
        raise ValueError(f"Stufe {n} fehlt")
    d = json.loads(r.stdout)
    if not isinstance(d, list):
        raise ValueError(f"Stufe {n} ist kein Array")
    return d


def kanon(e):
    return json.dumps(e, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def zusammenfuehren(basis, remote, unser):
    kb = {kanon(e) for e in basis}
    ku = {kanon(e) for e in unser}
    kr = {kanon(e) for e in remote}
    entfernt = kb - ku
    nur_unsere = ku - kb
    ergebnis = [e for e in remote if kanon(e) not in entfernt]
    ergebnis += [e for e in unser if kanon(e) in nur_unsere and kanon(e) not in kr]
    return ergebnis


def main():
    try:
        ergebnis = zusammenfuehren(stufe(1), stufe(2), stufe(3))
    except (ValueError, json.JSONDecodeError) as e:
        print(f"queue_merge: {e}", file=sys.stderr)
        return 1
    with open(PFAD, "w", encoding="utf-8") as f:
        json.dump(ergebnis, f, ensure_ascii=False, separators=(",", ":"))
    print(f"queue_merge: {len(ergebnis)} Eintraege nach dem Zusammenfuehren")
    return 0


if __name__ == "__main__":
    sys.exit(main())
