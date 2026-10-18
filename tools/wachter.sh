#!/usr/bin/env bash
# Waechter + Caretaker fuer die taeglichen Daten-Workflows.
#
#   wachter.sh fail  "<Workflow-Name>"   Lauf ist fehlgeschlagen -> HEAL (Caretaker repariert) oder STOP (Ticket)
#   wachter.sh restart "<Name>"          Workflow frisch starten (wenn nicht schon aktiv)
#   wachter.sh ticket "<Name>" <Datei>   Ticket "Waechter: <Name>" anlegen/ergaenzen
#   wachter.sh ok    "<Workflow-Name>"   Lauf war erfolgreich   -> offenes Ticket schliessen
#   wachter.sh sweep                     alle ueberwachten Workflows auf Aktualitaet pruefen
#
# Strategie: sofort selbst heilen (Fehler analysieren, Code fixen, Workflow
# neu starten, siehe caretaker.yml), nur bei wiederholtem Scheitern ein
# Ticket oeffnen (= Mail an den Repo-Besitzer).
# DRY_RUN=1 schreibt nur, was getan wuerde.
set -uo pipefail

REPO="${GITHUB_REPOSITORY:?GITHUB_REPOSITORY fehlt}"
MAX_FAILS_24H=3     # so viele Fehlschlaege in 24h analysiert/repariert der Caretaker, danach Ticket
ESKALATION_H=60     # so lange ohne Erfolg (und ohne Fehlschlag-Serie) -> trotzdem Ticket

# Name|maximales Alter des letzten Erfolgs in Stunden
WATCHED=(
  "Fehlende Songs verarbeiten|36"
  "Song-Statistik aktualisieren|36"
  "Tote Videos pruefen|36"
  "Billboard-Hits nachziehen|36"
  "Christmas-Playlist erweitern|36"
  "YouTube-Aufrufzahlen aktualisieren|36"
  "UK-Charts-Hits nachziehen|36"
  "BPM-Werte ermitteln|36"
  "Karaoke-Songs nachziehen|30"
)

run() { if [ "${DRY_RUN:-0}" = 1 ]; then echo "[dry-run] $*"; else "$@"; fi; }

epoch() { date -u -d "$1" +%s; }

active_runs() {
  local n s=0
  for st in in_progress queued; do
    n=$(gh run list -R "$REPO" -w "$1" --status "$st" --json databaseId --jq length 2>/dev/null || echo 0)
    s=$(( s + n ))
  done
  echo "$s"
}

fails_24h() {
  gh run list -R "$REPO" -w "$1" --status failure --limit 30 \
    --created ">=$(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%SZ)" \
    --json databaseId --jq length 2>/dev/null || echo 0
}

issue_number() {
  gh issue list -R "$REPO" --state open --search "\"Wächter: $1\" in:title" \
    --json number,title --jq "[.[]|select(.title==\"Wächter: $1\")][0].number // empty" 2>/dev/null
}

open_issue() {
  local name="$1" body="$2" num
  num=$(issue_number "$name")
  if [ -n "$num" ]; then
    run gh issue comment "$num" -R "$REPO" --body "$body"
  else
    run gh issue create -R "$REPO" --title "Wächter: $name" --body "$body"
  fi
}

close_issue() {
  local name="$1" num
  num=$(issue_number "$name")
  [ -z "$num" ] && return 0
  run gh issue close "$num" -R "$REPO" --comment "Automatisch geschlossen: '$name' laeuft wieder erfolgreich."
}

retry() {
  local name="$1"
  if [ "$(active_runs "$name")" -gt 0 ]; then
    echo "'$name': laeuft oder wartet schon, kein Neustart noetig."
    return 0
  fi
  echo "'$name': starte frisch neu."
  run gh workflow run "$name" -R "$REPO" --ref master
}

# Entscheidet, ob der Caretaker analysieren/reparieren soll (HEAL) oder ob
# schon zu oft gescheitert wurde und nur noch ein Ticket sinnvoll ist (STOP).
# Schreibt das Ergebnis zusaetzlich nach $GITHUB_OUTPUT (heal=true|false).
decide() {
  local name="$1" f verdict
  f=$(fails_24h "$name")
  if [ "$f" -le "$MAX_FAILS_24H" ]; then
    echo "'$name': $f Fehlschlag/Fehlschlaege in 24h -> Caretaker analysiert und repariert."
    verdict=HEAL
  else
    echo "'$name': $f Fehlschlaege in 24h -> Reparaturen helfen nicht, Ticket."
    open_issue "$name" "'$name' ist in den letzten 24 Stunden $f-mal fehlgeschlagen, die automatischen Reparaturversuche des Caretakers helfen nicht.

Letzte Laeufe: https://github.com/$REPO/actions?query=workflow%3A%22$(printf %s "$name" | sed 's/ /+/g')%22"
    verdict=STOP
  fi
  [ -n "${GITHUB_OUTPUT:-}" ] && echo "heal=$([ $verdict = HEAL ] && echo true || echo false)" >> "$GITHUB_OUTPUT"
  echo "$verdict"
}

# Wächter -> Caretaker: den Heil-Workflow sofort anstossen (ohne Warten).
call_caretaker() {
  local name="$1"
  if [ "$(active_runs "$name")" -gt 0 ]; then
    echo "'$name': laeuft oder wartet schon, kein Eingriff noetig."
    return 0
  fi
  if [ "$(decide "$name" | tail -1)" = HEAL ]; then
    run gh workflow run caretaker.yml -R "$REPO" --ref master -f workflow="$name"
  fi
}

case "${1:-}" in
  fail) decide "${2:?Name fehlt}" ;;
  restart) retry "${2:?Name fehlt}" ;;
  ticket) open_issue "${2:?Name fehlt}" "$(cat "${3:?Textdatei fehlt}")" ;;
  ok)   close_issue "${2:?Name fehlt}" ;;
  sweep)
    now=$(date -u +%s)
    for entry in "${WATCHED[@]}"; do
      name="${entry%|*}"; max_h="${entry#*|}"
      last=$(gh run list -R "$REPO" -w "$name" --status success --limit 1 --json createdAt --jq '.[0].createdAt // empty')
      if [ -z "$last" ]; then age_h=9999; else age_h=$(( (now - $(epoch "$last")) / 3600 )); fi
      if [ "$age_h" -le "$max_h" ]; then
        echo "OK     $name (letzter Erfolg vor ${age_h}h)"
        close_issue "$name"
        continue
      fi
      echo "ALT    $name (letzter Erfolg vor ${age_h}h, erlaubt ${max_h}h)"
      if [ "$(active_runs "$name")" -gt 0 ]; then
        echo "       laeuft gerade, warte das Ergebnis ab."
      elif [ "$age_h" -ge "$ESKALATION_H" ]; then
        open_issue "$name" "'$name' hatte seit ${age_h} Stunden keinen erfolgreichen Lauf (erlaubt: ${max_h}h). Neustarts des Caretakers haben nicht geholfen."
      else
        call_caretaker "$name"
      fi
    done
    ;;
  *) echo "Aufruf: $0 fail|ok \"<Name>\" | sweep" >&2; exit 2 ;;
esac
