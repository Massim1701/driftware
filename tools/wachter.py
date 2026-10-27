#!/usr/bin/env python3
"""Waechter + Caretaker fuer die taeglichen Daten-Workflows (Forgejo-Fassung).

Aufruf (meist ueber tools/wachter.sh):
  wachter.py fail    <workflow-datei>        Lauf ist fehlgeschlagen -> HEAL (neu starten) oder STOP (Ticket)
  wachter.py restart <workflow-datei>        Workflow frisch starten (wenn nicht schon aktiv)
  wachter.py ok      <workflow-datei>        Lauf war erfolgreich   -> offenes Ticket schliessen
  wachter.py ticket  <workflow-datei> <txt>  Ticket "Waechter: <Name>" anlegen/ergaenzen
  wachter.py sweep                           alle ueberwachten Workflows auf Aktualitaet pruefen
  wachter.py active  <workflow-datei>        Anzahl laufender/wartender Laeufe ausgeben
  wachter.py failed-last <datei> <n>         Anzahl nicht erfolgreicher unter den letzten n beendeten Laeufen
  wachter.py dispatch <datei> [key=wert ...] Workflow starten (mit Eingaben)
  wachter.py selftest                        Ticket anlegen/kommentieren/schliessen und Laeufe zaehlen

Umgebung: GITHUB_REPOSITORY (owner/repo), GITHUB_API_URL (Forgejo-API), FORGEJO_TOKEN
oder GITHUB_TOKEN. DRY_RUN=1 schreibt nur, was getan wuerde.

Strategie: sofort neu starten, nur bei wiederholtem Scheitern ein Ticket oeffnen
(= Mail an den Repo-Besitzer). Eine KI-Reparatur gibt es hier nicht mehr.
"""
import datetime as dt
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

REPO = os.environ.get("GITHUB_REPOSITORY", "")
API = os.environ.get("GITHUB_API_URL", "http://192.168.0.50:3000/api/v1").rstrip("/")
TOKEN = os.environ.get("FORGEJO_TOKEN") or os.environ.get("GITHUB_TOKEN") or ""
BRANCH = os.environ.get("WACHTER_BRANCH", "master")
DRY = os.environ.get("DRY_RUN") == "1"

MAX_FAILS_24H = 3    # so viele Fehlschlaege in 24 h werden neu gestartet, danach Ticket
ESKALATION_H = 60    # so lange ohne Erfolg -> trotzdem Ticket

# Datei -> (Anzeigename = Ticket-Titel, maximales Alter des letzten Erfolgs in Stunden)
WATCHED = {
    "nachts.yml": ("Nachtlauf (Daten-Kette)", 36),
    "check-dead-videos.yml": ("Tote Videos pruefen", 36),
    "karaoke-songs.yml": ("Karaoke-Songs nachziehen", 30),
}
# Nur fuer Tests: weitere ueberwachte Workflows (Repo-Variable WACHTER_EXTRA), im echten Repo leer.
for _e in filter(None, (os.environ.get("WACHTER_EXTRA") or "").split(";")):
    _f, _n, _h = (_e.split("|") + ["", "36"])[:3]
    WATCHED[_f.strip()] = (_n.strip() or _f.strip(), int(_h or 36))
ACTIVE = {"running", "waiting", "queued", "blocked", "in_progress", "pending"}
DONE = {"success", "failure", "cancelled"}


def api(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(API + path, data=data, method=method, headers={
        "Authorization": "token " + TOKEN, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=40) as r:
        raw = r.read()
    return json.loads(raw) if raw else {}


def now():
    return dt.datetime.now(dt.timezone.utc)


def parse(ts):
    return dt.datetime.fromisoformat(ts.replace("Z", "+00:00"))


def say_output(key, value):
    path = os.environ.get("GITHUB_OUTPUT")
    if path:
        with open(path, "a", encoding="utf-8") as f:
            f.write(f"{key}={value}\n")


def runs_of(wf_file, pages=6):
    """Laeufe eines Workflows, neueste zuerst. Forgejo liefert Jobs; ein Lauf (run_number)
    gilt als fehlgeschlagen, wenn ein Job fehlschlug, als aktiv, solange ein Job aktiv ist."""
    groups = {}
    for page in range(1, pages + 1):
        d = api("GET", f"/repos/{REPO}/actions/tasks?limit=100&page={page}")
        items = d.get("workflow_runs") or []
        if not items:
            break
        for t in items:
            if t.get("workflow_id") != wf_file:
                continue
            g = groups.setdefault(t["run_number"], {"jobs": [], "created": t["created_at"]})
            g["jobs"].append(t["status"])
            if t["created_at"] < g["created"]:
                g["created"] = t["created_at"]
    runs = []
    for num, g in groups.items():
        st = set(g["jobs"])
        if st & ACTIVE:
            status = "active"
        elif st & {"failure", "cancelled"}:
            status = "failure"
        elif "success" in st:
            status = "success"
        else:
            status = "skipped"
        runs.append({"run": num, "status": status, "created": parse(g["created"])})
    return sorted(runs, key=lambda r: r["created"], reverse=True)


def resolve(arg):
    if arg in WATCHED:
        return arg
    for f, (name, _h) in WATCHED.items():
        if arg == name:
            return f
    return arg


def title_of(wf):
    return "Wächter: " + (WATCHED[wf][0] if wf in WATCHED else wf)


def find_issue(wf):
    t = title_of(wf)
    for page in (1, 2, 3):
        items = api("GET", f"/repos/{REPO}/issues?state=open&type=issues&limit=50&page={page}")
        if not items:
            return None
        for i in items:
            if i.get("title") == t:
                return i["number"]
    return None


def open_issue(wf, body):
    num = find_issue(wf)
    if DRY:
        print(f"[dry-run] Ticket '{title_of(wf)}' {'ergaenzen #' + str(num) if num else 'anlegen'}: {body[:120]}")
        return
    if num:
        api("POST", f"/repos/{REPO}/issues/{num}/comments", {"body": body})
    else:
        api("POST", f"/repos/{REPO}/issues", {"title": title_of(wf), "body": body})


def close_issue(wf):
    num = find_issue(wf)
    if not num:
        return
    name = WATCHED[wf][0] if wf in WATCHED else wf
    if DRY:
        print(f"[dry-run] Ticket #{num} schliessen")
        return
    api("POST", f"/repos/{REPO}/issues/{num}/comments",
        {"body": f"Automatisch geschlossen: '{name}' laeuft wieder erfolgreich."})
    api("PATCH", f"/repos/{REPO}/issues/{num}", {"state": "closed"})


def dispatch(wf, inputs=None):
    body = {"ref": BRANCH}
    if inputs:
        body["inputs"] = inputs
    if DRY:
        print(f"[dry-run] starte {wf} {inputs or ''}")
        return
    api("POST", f"/repos/{REPO}/actions/workflows/{wf}/dispatches", body)


def active_count(wf):
    return sum(1 for r in runs_of(wf) if r["status"] == "active")


def fails_24h(wf):
    limit = now() - dt.timedelta(hours=24)
    return sum(1 for r in runs_of(wf) if r["status"] == "failure" and r["created"] >= limit)


def retry(wf):
    # Der rufende Lauf (Job "meldung") ist beim Start des Caretakers oft noch aktiv: kurz warten.
    for _ in range(12):
        if active_count(wf) == 0:
            break
        time.sleep(5)
    if active_count(wf) > 0:
        print(f"'{wf}': laeuft oder wartet schon, kein Neustart noetig.")
        return
    print(f"'{wf}': starte frisch neu.")
    dispatch(wf)


def decide(wf):
    f = fails_24h(wf)
    if f <= MAX_FAILS_24H:
        print(f"'{wf}': {f} Fehlschlag/Fehlschlaege in 24h -> wird neu gestartet.")
        verdict = "HEAL"
    else:
        print(f"'{wf}': {f} Fehlschlaege in 24h -> Neustarts helfen nicht, Ticket.")
        open_issue(wf, f"'{WATCHED.get(wf, (wf,))[0]}' ist in den letzten 24 Stunden {f}-mal fehlgeschlagen, "
                       f"die automatischen Neustarts helfen nicht.\n\nLaeufe: {os.environ.get('GITHUB_SERVER_URL', '')}/{REPO}/actions")
        verdict = "STOP"
    say_output("heal", "true" if verdict == "HEAL" else "false")
    print(verdict)
    return verdict


def call_caretaker(wf):
    if active_count(wf) > 0:
        print(f"'{wf}': laeuft oder wartet schon, kein Eingriff noetig.")
        return
    if decide(wf) == "HEAL":
        dispatch("caretaker.yml", {"workflow": wf, "result": "failure"})


def sweep():
    for wf, (name, max_h) in WATCHED.items():
        runs = runs_of(wf)
        good = [r for r in runs if r["status"] == "success"]
        age_h = int((now() - good[0]["created"]).total_seconds() // 3600) if good else 9999
        if age_h <= max_h:
            print(f"OK     {name} (letzter Erfolg vor {age_h}h)")
            close_issue(wf)
            continue
        print(f"ALT    {name} (letzter Erfolg vor {age_h}h, erlaubt {max_h}h)")
        if any(r["status"] == "active" for r in runs):
            print("       laeuft gerade, warte das Ergebnis ab.")
        elif age_h >= ESKALATION_H:
            open_issue(wf, f"'{name}' hatte seit {age_h} Stunden keinen erfolgreichen Lauf (erlaubt: {max_h}h). "
                           f"Neustarts des Caretakers haben nicht geholfen.")
        else:
            call_caretaker(wf)


def selftest():
    global DRY
    DRY = False
    runs = api("GET", f"/repos/{REPO}/actions/tasks?limit=5")
    print("Laeufe lesbar:", len(runs.get("workflow_runs") or []))
    t = f"/repos/{REPO}/issues"
    n = api("POST", t, {"title": "Wächter: Selbsttest", "body": "wird sofort geschlossen"})["number"]
    api("POST", f"{t}/{n}/comments", {"body": "Kommentar ok"})
    api("PATCH", f"{t}/{n}", {"state": "closed"})
    print("Ticket anlegen/kommentieren/schliessen: ok (#%s)" % n)
    wf = os.environ.get("SELFTEST_DISPATCH")
    if wf:
        dispatch(wf)
        print("Workflow starten:", wf, "ok")


def main(argv):
    if not REPO:
        print("GITHUB_REPOSITORY fehlt", file=sys.stderr)
        return 2
    if not TOKEN:
        print("Kein Token (FORGEJO_TOKEN oder GITHUB_TOKEN)", file=sys.stderr)
        return 2
    cmd = argv[1] if len(argv) > 1 else ""
    arg = resolve(argv[2]) if len(argv) > 2 else ""
    try:
        if cmd == "fail":
            decide(arg)
        elif cmd == "restart":
            retry(arg)
        elif cmd == "ok":
            close_issue(arg)
        elif cmd == "ticket":
            open_issue(arg, open(argv[3], encoding="utf-8").read())
        elif cmd == "sweep":
            sweep()
        elif cmd == "active":
            print(active_count(arg))
        elif cmd == "failed-last":
            n = int(argv[3])
            done = [r for r in runs_of(arg) if r["status"] in DONE]
            print(sum(1 for r in done[:n] if r["status"] != "success"))
        elif cmd == "dispatch":
            dispatch(arg, dict(kv.split("=", 1) for kv in argv[3:]) or None)
        elif cmd == "selftest":
            selftest()
        else:
            print(__doc__, file=sys.stderr)
            return 2
    except urllib.error.HTTPError as e:
        print(f"Forgejo-API-Fehler {e.code} bei {cmd}: {e.read()[:300].decode(errors='replace')}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
