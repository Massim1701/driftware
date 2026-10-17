/* driftware-api: das Wenige, was die Seite von einem Backend braucht.
     POST /v1/views        Besuchszaehler +1, Antwort {total}
     GET  /v1/views        aktueller Stand {total}
     GET  /v1/online       WebSocket: jede offene Verbindung zaehlt, Server schickt {online} bei jeder Aenderung
                           (ohne WebSocket: {online} als JSON)
     POST /v1/flag         "Passt nicht"-Meldung {key,page,genre,artist,title}
     POST /v1/sync/vote    Karaoke-Zeitkorrektur melden {video,offset,scale}
     GET  /v1/sync?video=  gemeinsamer Wert {median_offset,median_scale,n}
     POST /v1/queue        fehlenden Song an queue/fehlende-lieder.json im Repo anhaengen {a,t,yt?,vk?,g?,y?}
     POST /v1/queue/dispatch  Warteliste sofort verarbeiten (startet den GitHub-Workflow), Antwort {dispatched,count}
     (ersetzen den frueheren Proxy driftware-warteliste-proxy; Secret GITHUB_TOKEN, Variablen GITHUB_REPO/GITHUB_BRANCH)
   Anonym: keine IPs, keine Cookies, keine Nutzer-IDs gespeichert. Eingaben werden hart geprueft. */

const VIDEO_RE = /^[A-Za-z0-9_-]{6,20}$/;
const LOCAL_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const MAX_BODY = 4096;
const YT_RE = /^[A-Za-z0-9_-]{11}$/;
const VK_RE = /^https:\/\/(www\.)?(vkvideo\.ru|vk\.com)\/\S{1,300}$/i;
const QUEUE_PATH = 'queue/fehlende-lieder.json';
const QUEUE_WORKFLOW = 'process-missing-songs.yml';

async function gh(env, path, init) {
  const res = await fetch('https://api.github.com/repos/' + env.GITHUB_REPO + path, Object.assign({}, init, {
    headers: Object.assign({
      'Authorization': 'Bearer ' + env.GITHUB_TOKEN,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'driftware-api',
      'X-GitHub-Api-Version': '2022-11-28',
    }, init && init.headers),
  }));
  return res;
}

const toB64 = text => { const bytes = new TextEncoder().encode(text); let bin = ''; for (const b of bytes) bin += String.fromCharCode(b); return btoa(bin); };
const fromB64 = b64 => { const bin = atob(b64.replace(/\s/g, '')); return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))); };

async function readQueue(env) {
  const res = await gh(env, '/contents/' + QUEUE_PATH + '?ref=' + encodeURIComponent(env.GITHUB_BRANCH));
  if (!res.ok) throw new Error('read-failed: ' + res.status);
  const file = await res.json();
  const list = JSON.parse(fromB64(file.content));
  return { sha: file.sha, list: Array.isArray(list) ? list : [] };
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const h = { 'Vary': 'Origin' };
  if (origin && (allowed.includes(origin) || LOCAL_RE.test(origin))) {
    h['Access-Control-Allow-Origin'] = origin;
    h['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    h['Access-Control-Allow-Headers'] = 'Content-Type';
    h['Access-Control-Max-Age'] = '86400';
  }
  return h;
}

function json(data, status, extra) {
  return new Response(JSON.stringify(data), { status: status || 200, headers: Object.assign({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, extra) });
}

async function readJson(request) {
  const len = Number(request.headers.get('Content-Length') || 0);
  if (len > MAX_BODY) return null;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return null;
    const v = JSON.parse(text);
    return v && typeof v === 'object' && !Array.isArray(v) ? v : null;
  } catch (e) { return null; }
}

const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
const num = v => (typeof v === 'number' && Number.isFinite(v) ? v : null);

function median(values) {
  const a = values.slice().sort((x, y) => x - y), m = a.length >> 1;
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

async function limited(env, request) {
  /* optional: Cloudflare-Rate-Limit-Binding "LIMITER" (siehe README); ohne Binding kein Limit */
  if (!env.LIMITER) return false;
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const { success } = await env.LIMITER.limit({ key: ip });
  return !success;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const path = url.pathname.replace(/\/+$/, '');
    const reply = (data, status) => json(data, status, cors);

    try {
      if (path === '/v1/online') {
        const stub = env.ONLINE.get(env.ONLINE.idFromName('main'));
        return request.headers.get('Upgrade') === 'websocket' ? stub.fetch(request) : stub.fetch(new Request(request.url));
      }

      if (path === '/v1/views' && request.method === 'GET') {
        const row = await env.DB.prepare("SELECT total_views FROM site_stats WHERE id = 'total'").first();
        return reply({ total: row ? row.total_views : 0 });
      }
      if (path === '/v1/views' && request.method === 'POST') {
        if (await limited(env, request)) return reply({ error: 'rate' }, 429);
        const row = await env.DB.prepare("UPDATE site_stats SET total_views = total_views + 1 WHERE id = 'total' RETURNING total_views").first();
        return reply({ total: row ? row.total_views : 0 });
      }

      if (path === '/v1/flag' && request.method === 'POST') {
        if (await limited(env, request)) return reply({ error: 'rate' }, 429);
        const b = await readJson(request);
        const key = b && str(b.key, 201), page = b && str(b.page, 61);
        if (!b || !key || key.length > 200 || !page || page.length > 60) return reply({ error: 'invalid' }, 400);
        await env.DB.prepare(
          "INSERT INTO song_flags (song_key, page, genre, artist, title) VALUES (?1, ?2, ?3, ?4, ?5) " +
          "ON CONFLICT (song_key, page) DO UPDATE SET votes = votes + 1, updated_at = datetime('now')"
        ).bind(key, page, str(b.genre, 80), str(b.artist, 200), str(b.title, 200)).run();
        return reply({ ok: true });
      }

      if (path === '/v1/sync/vote' && request.method === 'POST') {
        if (await limited(env, request)) return reply({ error: 'rate' }, 429);
        const b = await readJson(request);
        const video = b && b.video, offset = b && num(b.offset), scale = b && num(b.scale === undefined ? 1 : b.scale);
        if (!b || typeof video !== 'string' || !VIDEO_RE.test(video) || offset === null || offset < -60 || offset > 60 || scale === null || scale < 0.9 || scale > 1.1) {
          return reply({ error: 'invalid' }, 400);
        }
        await env.DB.batch([
          env.DB.prepare('INSERT INTO lyrics_sync_votes (video_id, offset_s, scale) VALUES (?1, ?2, ?3)')
            .bind(video, Math.round(offset * 10) / 10, Math.round(scale * 10000) / 10000),
          /* pro Video nur die neuesten 25 Stimmen behalten */
          env.DB.prepare('DELETE FROM lyrics_sync_votes WHERE video_id = ?1 AND id NOT IN (SELECT id FROM lyrics_sync_votes WHERE video_id = ?1 ORDER BY id DESC LIMIT 25)').bind(video),
        ]);
        return reply({ ok: true });
      }

      if (path === '/v1/sync' && request.method === 'GET') {
        const video = url.searchParams.get('video') || '';
        if (!VIDEO_RE.test(video)) return reply({ error: 'invalid' }, 400);
        const { results } = await env.DB.prepare('SELECT offset_s, scale FROM lyrics_sync_votes WHERE video_id = ?1 ORDER BY id DESC LIMIT 25').bind(video).all();
        if (!results.length) return reply({ n: 0 });
        return reply({
          median_offset: Math.round(median(results.map(r => r.offset_s)) * 10) / 10,
          median_scale: Math.round(median(results.map(r => r.scale)) * 10000) / 10000,
          n: results.length,
        });
      }

      if (path === '/v1/queue' && request.method === 'POST') {
        if (await limited(env, request)) return reply({ error: 'rate' }, 429);
        const b = await readJson(request);
        const a = b && str(b.a, 200).trim(), t = b && str(b.t, 200).trim();
        if (!b || !a || !t) return reply({ error: 'invalid' }, 400);
        const entry = { a, t, yt: null, note: null, ts: new Date().toISOString() };
        if (typeof b.yt === 'string' && b.yt) { if (!YT_RE.test(b.yt)) return reply({ error: 'invalid' }, 400); entry.yt = b.yt; }
        if (typeof b.vk === 'string' && b.vk) { if (!VK_RE.test(b.vk)) return reply({ error: 'invalid' }, 400); entry.vk = b.vk; }
        if (typeof b.g === 'string' && b.g) entry.g = str(b.g, 80);
        if (Number.isInteger(b.y) && b.y >= 1900 && b.y <= 2100) entry.y = b.y;
        /* SHA-Konflikt (parallele Meldung oder Workflow-Push): neu lesen und erneut versuchen */
        for (let i = 0; i < 4; i++) {
          const { sha, list } = await readQueue(env);
          const key = (e => (e.a + '|' + e.t + '|' + (e.g || '') + '|' + (e.yt || '')).toLowerCase());
          if (list.some(e => key(e) === key(entry))) return reply({ ok: true, duplicate: true });
          list.push(entry);
          const put = await gh(env, '/contents/' + QUEUE_PATH, {
            method: 'PUT',
            body: JSON.stringify({ message: 'Warteliste: ' + a + ' - ' + t, content: toB64(JSON.stringify(list, null, 2) + '\n'), sha, branch: env.GITHUB_BRANCH }),
          });
          if (put.ok) return reply({ ok: true });
          if (put.status !== 409 && put.status !== 422) return reply({ error: 'upstream-failed', detail: 'write-failed: ' + put.status }, 502);
        }
        return reply({ error: 'conflict' }, 503);
      }

      if (path === '/v1/queue/dispatch' && request.method === 'POST') {
        if (await limited(env, request)) return reply({ error: 'rate' }, 429);
        const { list } = await readQueue(env);
        if (!list.length) return reply({ dispatched: false, count: 0 });
        /* laeuft der Job schon, nicht noch einen starten (Schutz gegen Dauerklicken) */
        const runs = await gh(env, '/actions/workflows/' + QUEUE_WORKFLOW + '/runs?per_page=5');
        if (runs.ok) {
          const data = await runs.json();
          if ((data.workflow_runs || []).some(r => r.status === 'queued' || r.status === 'in_progress')) {
            return reply({ dispatched: true, running: true, count: list.length });
          }
        }
        const res = await gh(env, '/actions/workflows/' + QUEUE_WORKFLOW + '/dispatches', { method: 'POST', body: JSON.stringify({ ref: env.GITHUB_BRANCH }) });
        if (!res.ok) return reply({ error: 'upstream-failed', detail: 'dispatch-failed: ' + res.status }, 502);
        return reply({ dispatched: true, count: list.length });
      }

      return reply({ error: 'not found' }, 404);
    } catch (e) {
      return reply({ error: 'server', detail: String(e && e.message || e).slice(0, 120) }, 500);
    }
  },
};

/* "Gerade online": ein einziges Durable Object haelt alle offenen WebSockets. Die Zahl der Verbindungen
   IST die Zahl der Besucher -- nichts wird gespeichert, geschlossene Tabs verschwinden von selbst. */
export class Online {
  constructor(state) {
    this.state = state;
    this.state.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'));
  }
  async fetch(request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return json({ online: Math.max(1, this.state.getWebSockets().length) }, 200, { 'Access-Control-Allow-Origin': '*' });
    }
    const pair = new WebSocketPair();
    this.state.acceptWebSocket(pair[1]);
    this.broadcast();
    return new Response(null, { status: 101, webSocket: pair[0] });
  }
  broadcast(exclude) {
    const sockets = this.state.getWebSockets().filter(s => s !== exclude);
    const msg = JSON.stringify({ online: Math.max(1, sockets.length) });
    for (const s of sockets) { try { s.send(msg); } catch (e) {} }
  }
  webSocketMessage() { /* ping/pong laeuft automatisch */ }
  webSocketClose(ws) { try { ws.close(); } catch (e) {} this.broadcast(ws); }
  webSocketError(ws) { this.broadcast(ws); }
}
