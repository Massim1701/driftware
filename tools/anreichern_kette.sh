#!/usr/bin/env bash
# Startet den naechsten noetigen Anreicherungslauf (merge_songs.yml, schritt=anreichern),
# solange noch etwas offen ist. Wird vom Workflow anreichern-kette.yml bei jedem Ende
# eines merge_songs-Laufs aufgerufen. Es laeuft nie mehr als ein Lauf gleichzeitig
# (gemeinsames Discogs-Limit: zwei parallele Laeufe wuerden Songs faelschlich als
# "nicht gefunden" markieren).
#
# Reihenfolge steht in PLAN: "<dekade>[:<tag>]" je Eintrag, der erste mit offenen Songs gewinnt.
# Pausieren: Datei kette-pause.txt im Repo-Stamm anlegen (und pushen).
# DRY=1: nur anzeigen, nichts starten (zum lokalen Testen).
set -u
PLAN="${PLAN:-2010:techno 90}"
REPO="${GITHUB_REPOSITORY:-Massim1701/driftware}"

if [ -f kette-pause.txt ]; then echo "kette-pause.txt vorhanden -- Kette pausiert."; exit 0; fi

if [ "${DRY:-0}" != "1" ]; then
  laufend=$(gh run list -R "$REPO" -w merge_songs.yml --status in_progress --json databaseId --jq length)
  wartend=$(gh run list -R "$REPO" -w merge_songs.yml --status queued --json databaseId --jq length)
  if [ "${laufend:-0}" != "0" ] || [ "${wartend:-0}" != "0" ]; then
    echo "Es laeuft schon ein merge_songs-Lauf (laufend $laufend, wartend $wartend) -- der weckt die Kette beim Ende wieder."
    exit 0
  fi
  # Schutz vor Endlosschleife: die letzten drei abgeschlossenen Laeufe alle fehlgeschlagen -> stopp
  fehl=$(gh run list -R "$REPO" -w merge_songs.yml --status completed -L 3 --json conclusion --jq '[.[]|select(.conclusion!="success")]|length')
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
    gh workflow run merge_songs.yml -R "$REPO" -f dekade="$dek" -f schritt=anreichern -f apply=true ${tag:+-f tag="$tag"}
    exit $?
  fi
done
echo "Alles angereichert -- Kette fertig."
