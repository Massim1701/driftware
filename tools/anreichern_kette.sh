#!/usr/bin/env bash
# Startet den naechsten noetigen Anreicherungslauf (merge_songs.yml, schritt=anreichern),
# solange noch etwas offen ist. Wird vom Workflow anreichern-kette.yml aufgerufen, den jeder
# merge_songs-Lauf am Ende weckt (Forgejo hat kein workflow_run). Es laeuft nie mehr als ein Lauf gleichzeitig
# (gemeinsames Discogs-Limit: zwei parallele Laeufe wuerden Songs faelschlich als
# "nicht gefunden" markieren).
#
# Reihenfolge steht in PLAN: "<dekade>[:<tag>]" je Eintrag, der erste mit offenen Songs gewinnt.
# Pausieren: Datei kette-pause.txt im Repo-Stamm anlegen (und pushen).
# DRY=1: nur anzeigen, nichts starten (zum lokalen Testen).
set -u
PLAN="${PLAN:-2010:techno 90 90:techno}"
W="$(dirname "$0")/wachter.py"   # Forgejo-Schnittstelle (statt gh)

if [ -f kette-pause.txt ]; then echo "kette-pause.txt vorhanden -- Kette pausiert."; exit 0; fi

if [ "${DRY:-0}" != "1" ]; then
  # Der weckende Lauf ist beim Start dieser Kette meist noch aktiv (letzter Schritt in merge_songs.yml):
  # bis zu 3 Minuten warten, bis er fertig ist. Laeuft danach noch einer, ist es ein anderer.
  for _ in $(seq 1 12); do
    aktiv=$(python3 "$W" active merge_songs.yml) || { echo "::error::Forgejo-Abfrage fehlgeschlagen."; exit 1; }
    [ "${aktiv:-0}" = "0" ] && break
    sleep 15
  done
  if [ "${aktiv:-0}" != "0" ]; then
    echo "Es laeuft schon ein merge_songs-Lauf (aktiv $aktiv) -- der weckt die Kette beim Ende wieder."
    exit 0
  fi
  # Schutz vor Endlosschleife: die letzten drei abgeschlossenen Laeufe alle fehlgeschlagen -> stopp
  fehl=$(python3 "$W" failed-last merge_songs.yml 3) || fehl=0
  if [ "${fehl:-0}" -ge 3 ]; then
    echo "::error::Die letzten drei merge_songs-Laeufe sind fehlgeschlagen -- Kette gestoppt, bitte pruefen."
    exit 1
  fi
fi

for eintrag in $PLAN; do
  dek="${eintrag%%:*}"; tag=""; [ "$eintrag" != "$dek" ] && tag="${eintrag#*:}"
  args=(--dekade "$dek"); [ -n "$tag" ] && args+=(--tag "$tag")
  offen=$(python3 tools/merge_into_json.py "${args[@]}" --offen 2>/dev/null | sed -n 's/^OFFEN=//p' | tail -1)
  echo "Dekade $dek${tag:+ (Tag $tag)}: offen ${offen:-?}"
  if [ -z "${offen:-}" ]; then echo "::error::Offen-Zaehlung fehlgeschlagen fuer $eintrag -- Kette gestoppt."; exit 1; fi
  if [ "$offen" -gt 0 ]; then
    echo "-> naechster Lauf: Dekade $dek${tag:+, Tag $tag}"
    if [ "${DRY:-0}" = "1" ]; then exit 0; fi
    python3 "$W" dispatch merge_songs.yml dekade="$dek" schritt=anreichern apply=true ${tag:+tag="$tag"}
    exit $?
  fi
done
echo "Alles angereichert -- Kette fertig."
