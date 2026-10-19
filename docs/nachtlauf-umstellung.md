# Nachtlauf: Umstellung von den Einzel-Workflows

`nachts.yml` fuehrt die Daten-Workflows nacheinander aus (nur ein Schreiber auf
`*-music/songs.json`) und pusht ueber `tools/push_retry.sh`. Bis zur Umstellung laufen
die alten Workflows unveraendert weiter; `nachts.yml` startet nur manuell.

## Test (vor dem Umstellen)
1. `gh workflow run nachts.yml -f nur=statistik` -- kleinster Schritt, prueft Checkout + Push.
2. `gh workflow run nachts.yml -f nur=fehlende`, dann `-f nur=christmas`, `aufrufzahlen`.
3. `billboard`, `uk`, `bpm` dauern je bis zu mehreren Stunden -- einzeln starten und Log pruefen.
4. Kollisionstest: waehrend eines Laufs von Hand etwas auf master pushen, der Lauf muss
   "Push abgelehnt ... Sauber rebased" melden und trotzdem durchlaufen.

## Umstellen
1. In `nachts.yml` den `schedule:`-Block aktivieren (Kommentar entfernen).
2. Die Crons der alten Workflows entfernen (oder die Dateien loeschen):
   process-missing-songs, expand-christmas-songs, fetch-youtube-viewcounts,
   expand-billboard-hits, expand-uk-chart-hits, bpm-fetch. `update-stats.yml` bleibt
   (Push-Trigger bei manuellen Aenderungen).
3. `"Nachtlauf (Daten-Kette)"` in `.github/workflows/caretaker.yml` (workflows-Liste) und in
   `tools/wachter.sh` (WATCHED, z. B. `|36`) eintragen; die ersetzten Namen entfernen.

## Zurueck
Cron in `nachts.yml` wieder auskommentieren und die alten Crons zurueckholen (`git revert`).

## Laufzeit
Mit den bisherigen Zeitbudgets kann die Kette bis ca. 18 h dauern (typisch ca. 10 h).
Reicht das nicht, die Budgets in `nachts.yml` je Job senken.
