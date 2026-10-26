#!/usr/bin/env bash
# Duenne Huelle: die Logik liegt in tools/wachter.py (Forgejo-Schnittstelle).
# Aufruf wie bisher: wachter.sh fail|restart|ok|ticket|sweep ... (Argument = Workflow-Dateiname, z. B. nachts.yml)
exec python3 "$(dirname "$0")/wachter.py" "$@"
