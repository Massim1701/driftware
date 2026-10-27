#!/usr/bin/env python3
"""Holt den Posteingang der Warteliste vom Cloudflare-Worker (driftware-api) und haengt ihn an
queue/fehlende-lieder.json im Forgejo-Repo an. Laeuft auf fornetta per systemd-Timer (alle 5 Minuten).

  Worker  GET  /v1/queue/inbox       (Bearer INBOX_TOKEN)  -> {entries:[{id,a,t,...}], fetch:bool}
  Worker  POST /v1/queue/inbox/ack   {upto, clear_fetch}   -> geholte Eintraege loeschen
  Wunsch "Jetzt einbauen" (fetch=true) startet in Forgejo nachts mit nur=fehlende (hoechstens 1x pro Stunde).

Umgebung (alles mit Standardwerten fuer fornetta): WORKER_API, INBOX_TOKEN_FILE, FORGEJO_TOKEN_FILE,
FORGEJO_API, GIT_REMOTE, WORKDIR, STATE_FILE. Das Token wird nie in Argumenten oder Logs ausgegeben."""
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request

API = os.environ.get("WORKER_API", "https://driftware-api.driftware-api.workers.dev/v1")
INBOX_TOKEN_FILE = os.environ.get("INBOX_TOKEN_FILE", "/srv/www/inbox-token")
FORGEJO_TOKEN_FILE = os.environ.get("FORGEJO_TOKEN_FILE", "/home/massimo/.forgejo-admin-token")
FORGEJO_API = os.environ.get("FORGEJO_API", "http://192.168.0.50:3000/api/v1")
GIT_REMOTE = os.environ.get("GIT_REMOTE", "http://192.168.0.50:3000/massimo/driftware.git")
REPO = os.environ.get("FORGEJO_REPO", "massimo/driftware")
WORKDIR = os.environ.get("WORKDIR", "/srv/www/queue-work")
STATE_FILE = os.environ.get("STATE_FILE", "/srv/www/queue-work.state")
QUEUE = "queue/fehlende-lieder.json"
UA = "fornetta-inbox/1"


def log(msg):
    print(time.strftime("%F %T"), msg, flush=True)


def read_secret(path):
    with open(path) as f:
        return "".join(f.read().split())


def http(url, token, method="GET", body=None):
    req = urllib.request.Request(url, method=method, data=None if body is None else json.dumps(body).encode(),
                                 headers={"Authorization": "Bearer " + token, "User-Agent": UA,
                                          "Content-Type": "application/json", "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read() or b"{}")


def git(*args, token=None, check=True):
    env = dict(os.environ, GIT_TERMINAL_PROMPT="0")
    if token and GIT_REMOTE.startswith("http"):
        env.update(GIT_CONFIG_COUNT="1", GIT_CONFIG_KEY_0="http.extraheader",
                   GIT_CONFIG_VALUE_0="Authorization: token " + token)
    r = subprocess.run(["git", "-C", WORKDIR, *args], env=env, capture_output=True, text=True, timeout=300)
    if check and r.returncode:
        raise RuntimeError("git " + args[0] + " fehlgeschlagen: " + (r.stderr or r.stdout).strip()[:300])
    return r


def prepare_clone(token):
    if not os.path.isdir(os.path.join(WORKDIR, ".git")):
        os.makedirs(os.path.dirname(WORKDIR), exist_ok=True)
        env = dict(os.environ, GIT_TERMINAL_PROMPT="0")
        if GIT_REMOTE.startswith("http"):
            env.update(GIT_CONFIG_COUNT="1", GIT_CONFIG_KEY_0="http.extraheader",
                       GIT_CONFIG_VALUE_0="Authorization: token " + token)
        r = subprocess.run(["git", "clone", "-q", "--depth", "1", "--filter=blob:none", "--no-checkout",
                            "--sparse", GIT_REMOTE, WORKDIR], env=env, capture_output=True, text=True, timeout=600)
        if r.returncode:
            raise RuntimeError("clone fehlgeschlagen: " + r.stderr.strip()[:300])
        git("sparse-checkout", "set", "--no-cone", "/queue/fehlende-lieder.json")
        git("config", "user.name", "fornetta-inbox")
        git("config", "user.email", "inbox@fornetta.online")
    git("fetch", "-q", "--depth", "1", "origin", "master", token=token)
    git("checkout", "-q", "-f", "-B", "master", "FETCH_HEAD")


def key(e):
    return "|".join([str(e.get("a", "")), str(e.get("t", "")), str(e.get("g") or ""), str(e.get("yt") or "")]).lower()


def append_and_push(entries, token):
    """Haengt neue Eintraege an die Warteliste an und pusht (mit Wiederholung bei Konflikt)."""
    path = os.path.join(WORKDIR, QUEUE)
    for versuch in range(1, 5):
        prepare_clone(token)
        try:
            with open(path, encoding="utf-8") as f:
                liste = json.load(f)
        except FileNotFoundError:
            liste = []
        if not isinstance(liste, list):
            raise RuntimeError(QUEUE + " ist keine Liste")
        vorhanden = {key(e) for e in liste}
        neu = []
        for e in entries:
            clean = {k: v for k, v in e.items() if k != "id"}
            if key(clean) not in vorhanden:
                vorhanden.add(key(clean))
                neu.append(clean)
        if not neu:
            return 0
        liste.extend(neu)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            f.write(json.dumps(liste, ensure_ascii=False, indent=2) + "\n")
        git("add", QUEUE)
        git("commit", "-q", "-m", "Warteliste: %d neue Meldung%s von der Webseite" % (len(neu), "" if len(neu) == 1 else "en"))
        r = git("push", "-q", "origin", "HEAD:refs/heads/master", token=token, check=False)
        if r.returncode == 0:
            return len(neu)
        log("Push abgelehnt (Versuch %d): %s" % (versuch, r.stderr.strip()[:120]))
        time.sleep(2 * versuch)
    raise RuntimeError("Warteliste konnte nach 4 Versuchen nicht gepusht werden")


def dispatch_fehlende(fg_token):
    try:
        last = float(open(STATE_FILE).read())
    except Exception:
        last = 0
    if time.time() - last < 3600:
        log("Jetzt-einbauen-Wunsch: Start in der letzten Stunde schon erfolgt, uebersprungen")
        return
    http(FORGEJO_API + "/repos/%s/actions/workflows/nachts.yml/dispatches" % REPO, fg_token, "POST",
         {"ref": "master", "inputs": {"nur": "fehlende"}})
    with open(STATE_FILE, "w") as f:
        f.write(str(time.time()))
    log("nachts (nur=fehlende) in Forgejo gestartet")


def main():
    try:
        inbox_token = read_secret(INBOX_TOKEN_FILE)
    except FileNotFoundError:
        log("kein Inbox-Token (%s) - nichts zu tun" % INBOX_TOKEN_FILE)
        return 0
    try:
        data = http(API + "/queue/inbox", inbox_token)
    except urllib.error.HTTPError as e:
        # Worker noch nicht neu ausgeliefert (404) oder Secret noch nicht gesetzt (401): kein Fehler, nur Hinweis
        log("Worker antwortet mit HTTP %d - noch nicht eingerichtet?" % e.code)
        return 0 if e.code in (401, 404) else 1
    entries = data.get("entries") or []
    wunsch = bool(data.get("fetch"))
    if not entries and not wunsch:
        return 0
    fg_token = read_secret(FORGEJO_TOKEN_FILE)
    if entries:
        n = append_and_push(entries, fg_token)
        log("%d von %d Eintraegen neu in %s" % (n, len(entries), QUEUE))
    upto = max([e["id"] for e in entries], default=0)
    if entries or wunsch:
        http(API + "/queue/inbox/ack", inbox_token, "POST", {"upto": upto, "clear_fetch": wunsch})
    if wunsch:
        dispatch_fehlende(fg_token)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:
        log("FEHLER: %s" % exc)
        sys.exit(1)
