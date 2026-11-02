#!/usr/bin/env bash
# Gemeinsamer Commit-und-Push-Schritt fuer die Daten-Workflows (nur in GitHub Actions).
#
#   push_retry.sh "<Commit-Meldung>" "<Neu-Lauf-Befehl oder ->" <Pfad>...
#
# Ablauf: Pfade stagen, committen, pushen. Wird der Push abgelehnt (ein anderer
# Workflow oder Massimo war schneller): Reste im Arbeitsverzeichnis verwerfen
# (die sind aus den Skripten jederzeit neu erzeugbar), per Rebase auf den frischen
# Stand setzen. Gibt es einen echten Konflikt, wird auf origin/<Branch>
# zurueckgesetzt und der Neu-Lauf-Befehl auf dem frischen Stand wiederholt --
# die Skripte sind dafuer zustandslos. $REDO_BUDGET_SECONDS ist im Neu-Lauf-Befehl
# verfuegbar (Rest des 6h-Job-Limits, anhand von JOB_START_TS).
#
# Der alte Inline-Code in den Workflows scheiterte mit Exit 128: Nach dem
# abgelehnten Push brach "git rebase --autostash" mit "You have unstaged
# changes" ab, das folgende "git rebase --abort" hatte nichts abzubrechen.
set -uo pipefail

if [ "${GITHUB_ACTIONS:-}" != "true" ] && [ "${PUSH_ALLOW_LOCAL:-}" != "1" ]; then
  echo "push_retry.sh verwirft Arbeitsverzeichnis-Reste und laeuft nur in GitHub Actions." >&2
  exit 2
fi

MSG="${1:?Commit-Meldung fehlt}"
REDO="${2:?Neu-Lauf-Befehl fehlt (oder -)}"
shift 2
BRANCH="${PUSH_BRANCH:-master}"
LIMIT="${JOB_LIMIT_SECONDS:-20700}"  # Ziel: Job unter ~5h45min (6h-Hardlimit)

git config user.name "driftware-bot"
git config user.email "actions@users.noreply.github.com"

stage_and_commit() {
  local p
  for p in "$@"; do git add -- "$p" 2>/dev/null || true; done
  git diff --cached --quiet && return 1
  git commit -q -m "$MSG"
}

# Der Logger haengt alle ~40 Min Lieder an queue/fehlende-lieder.json an (eine einzige Zeile),
# der Nachtlauf entfernt verarbeitete -- das gab immer einen Konflikt, und die Arbeit ging
# verloren. Ist NUR diese Datei im Konflikt, mischen wir sie selbst (tools/queue_merge.py):
# Remote-Stand minus unsere Entfernungen.
queue_konflikt_loesen() {
  [ "$(git diff --name-only --diff-filter=U)" = "queue/fehlende-lieder.json" ] || return 1
  python3 tools/queue_merge.py || return 1
  git add -- queue/fehlende-lieder.json || return 1
  GIT_EDITOR=true git rebase --continue >/dev/null 2>&1
}

stage_and_commit "$@" || { echo "Keine Aenderungen."; exit 0; }

for i in 1 2 3 4 5; do
  if git push -q origin "HEAD:${BRANCH}"; then
    echo "Push erfolgreich (Versuch $i)."
    exit 0
  fi
  echo "Push abgelehnt (Versuch $i), hole Remote-Stand..."
  git fetch -q origin "$BRANCH"
  # Alles, was nicht im Commit steht, ist neu erzeugbar -- weg damit, sonst
  # verweigert der Rebase den Dienst.
  git reset -q --hard HEAD
  git clean -fdq
  if git rebase -q "origin/${BRANCH}"; then
    echo "Sauber rebased, versuche erneut zu pushen."
    continue
  fi
  if queue_konflikt_loesen; then
    echo "Konflikt in der Warteliste selbst aufgeloest, versuche erneut zu pushen."
    continue
  fi

  echo "Echter Rebase-Konflikt -- zurueck auf den frischen Stand, Lauf wird dort wiederholt."
  git rebase --abort 2>/dev/null || true
  git reset -q --hard "origin/${BRANCH}"
  git clean -fdq
  if [ "$REDO" = "-" ]; then
    echo "::error::Konflikt und kein Neu-Lauf-Befehl angegeben, Aenderungen verworfen."
    exit 1
  fi
  ELAPSED=$(( $(date +%s) - ${JOB_START_TS:-$(date +%s)} ))
  export REDO_BUDGET_SECONDS=$(( LIMIT - ELAPSED ))
  if [ "$REDO_BUDGET_SECONDS" -lt 120 ]; then
    echo "::warning::Konflikt und kaum noch Zeit im Job-Limit -- Ergebnis dieses Laufs verworfen, der naechste Lauf macht es erneut."
    exit 0
  fi
  bash -c "$REDO" || { echo "::error::Neu-Lauf fehlgeschlagen."; exit 1; }
  stage_and_commit "$@" || { echo "Nach dem Neu-Lauf keine eigenen Aenderungen mehr uebrig."; exit 0; }
done

echo "::error::Push nach mehreren Versuchen fehlgeschlagen, Fortschritt geht mit dem Runner verloren."
exit 1
