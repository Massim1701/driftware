#!/bin/bash
# Sichert die Songdaten (songs.json je Playlist, karaoke/, queue/) in den fornetta-api-Worker.
# Grosse Dateien einzeln gepackt (Limit 20 MB je Datei), der Rest in einem Archiv.
# Unveraenderte Dateien speichert der Worker nicht erneut (SHA-256), daher ist taegliches Laufen billig.
# Noetig: Umgebungsvariable FORNETTA_TOKEN (GitHub-Secret FORNETTA_BACKUP_TOKEN).
set -euo pipefail

URL="${FORNETTA_URL:-https://fornetta-api.driftware-api.workers.dev}"
: "${FORNETTA_TOKEN:?FORNETTA_TOKEN fehlt}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
NEU=0; GLEICH=0

put() { # name, datei
  local code
  code=$(curl -sS --retry 3 --retry-delay 5 -o "$TMP/resp" -w '%{http_code}' -X PUT \
    -H "Authorization: Bearer $FORNETTA_TOKEN" -H 'content-type: application/gzip' \
    --data-binary "@$2" "$URL/b/$1")
  case "$code" in
    201) NEU=$((NEU+1)); echo "neu      $1" ;;
    200) GLEICH=$((GLEICH+1)) ;;
    *)   echo "FEHLER $1: HTTP $code $(cat "$TMP/resp")" >&2; exit 1 ;;
  esac
}

echo "Quelle: $(git rev-parse --short HEAD)"

while read -r f; do
  gzip -9 -n -c "$f" > "$TMP/f.gz"
  put "songs-$(echo "${f%.json}" | tr '/' '-').json.gz" "$TMP/f.gz"
done < <(git ls-files | grep -E '(^|/)songs[^/]*\.json$')

: > "$TMP/small.txt"
while read -r f; do
  if [ "$(wc -c < "$f")" -ge 1048576 ]; then
    gzip -9 -n -c "$f" > "$TMP/f.gz"
    put "$(echo "${f%.json}" | tr '/' '-').json.gz" "$TMP/f.gz"
  else
    echo "$f" >> "$TMP/small.txt"
  fi
done < <(git ls-files | grep -E '^(karaoke|queue)/.*\.json$')

# Kleine Dateien als ein JSON {pfad: inhalt}, sortiert und ohne Zeitstempel (bleibt bei gleichem Inhalt byte-gleich)
python3 -I - "$TMP/small.txt" "$TMP/kq.json.gz" <<'PY'
import gzip, json, sys
paths = sorted(l.strip() for l in open(sys.argv[1]) if l.strip())
data = {p: open(p, encoding='utf-8').read() for p in paths}
raw = json.dumps(data, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode('utf-8')
with open(sys.argv[2], 'wb') as out:
    with gzip.GzipFile(fileobj=out, mode='wb', compresslevel=9, mtime=0) as gz:
        gz.write(raw)
PY
put "karaoke-queue-klein.json.gz" "$TMP/kq.json.gz"

echo "Fertig: $NEU neu gespeichert, $GLEICH unveraendert."
