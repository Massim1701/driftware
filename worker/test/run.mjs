const B = process.env.API || 'http://127.0.0.1:8787';
let fails = 0;
const ok = (c, m, extra) => { console.log((c ? 'OK   ' : 'FAIL ') + m + (c ? '' : '  -> ' + JSON.stringify(extra))); if (!c) fails++; };
const post = (p, b, h) => fetch(B + p, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json', Origin: 'https://driftware.online' }, h), body: typeof b === 'string' ? b : JSON.stringify(b) });
const get = p => fetch(B + p, { headers: { Origin: 'https://driftware.online' } });
const wait = ms => new Promise(r => setTimeout(r, ms));

// Besuchszaehler
let r = await get('/v1/views'); const t0 = (await r.json()).total;
r = await post('/v1/views', {}); const t1 = (await r.json()).total;
ok(t1 === t0 + 1, 'Besuchszaehler zaehlt um 1 hoch', { t0, t1 });
ok(r.headers.get('access-control-allow-origin') === 'https://driftware.online', 'CORS fuer driftware.online');
r = await fetch(B + '/v1/views', { headers: { Origin: 'https://boese.example' } });
ok(!r.headers.get('access-control-allow-origin'), 'CORS nicht fuer fremde Seiten');

// Flags
r = await post('/v1/flag', { key: 'abc123XYZ', page: '80er-music', genre: 'Rock', artist: 'A', title: 'T' });
ok(r.status === 200, 'Flag wird angenommen');
await post('/v1/flag', { key: 'abc123XYZ', page: '80er-music', genre: 'Rock', artist: 'A', title: 'T' });
r = await post('/v1/flag', { key: '', page: 'x' }); ok(r.status === 400, 'Flag ohne Key abgelehnt');
r = await post('/v1/flag', { key: 'k'.repeat(201), page: 'x' }); ok(r.status === 400, 'Flag mit zu langem Key abgelehnt');
r = await post('/v1/flag', 'kein json'); ok(r.status === 400, 'kaputtes JSON abgelehnt');
r = await post('/v1/flag', { key: 'a'.repeat(100), page: 'p', title: 'x'.repeat(5000) }); ok(r.status === 400, 'zu grosser Body abgelehnt');

// Zeitkorrektur
const V = 'dQw4w9WgXcQ';
r = await get('/v1/sync?video=' + V); ok((await r.json()).n === 0, 'ohne Stimmen: n = 0');
for (const o of [2.0, 2.4, 9.9]) { r = await post('/v1/sync/vote', { video: V, offset: o, scale: 1.01 }); ok(r.status === 200, 'Stimme ' + o + ' angenommen'); }
r = await get('/v1/sync?video=' + V); let s = await r.json();
ok(s.n === 3 && s.median_offset === 2.4 && s.median_scale === 1.01, 'Median robust gegen Ausreisser', s);
for (const bad of [{ video: 'a/b', offset: 1, scale: 1 }, { video: V, offset: 99, scale: 1 }, { video: V, offset: 1, scale: 1.5 }, { video: V, offset: 'x', scale: 1 }, { video: V, offset: null, scale: 1 }]) {
  r = await post('/v1/sync/vote', bad); ok(r.status === 400, 'ungueltige Stimme abgelehnt ' + JSON.stringify(bad));
}
r = await post('/v1/sync/vote', { video: V, offset: 1 }); ok(r.status === 200, 'Tempo optional (Standard 1)');
for (let i = 0; i < 30; i++) await post('/v1/sync/vote', { video: 'Limit_Test1', offset: i / 10, scale: 1 });
r = await get('/v1/sync?video=Limit_Test1'); ok((await r.json()).n === 25, 'nur die neuesten 25 Stimmen bleiben');
r = await get('/v1/sync?video=../x'); ok(r.status === 400, 'ungueltige Video-ID beim Lesen abgelehnt');

// Gerade online (WebSocket)
const ws1 = new WebSocket(B.replace('http', 'ws') + '/v1/online'); const got1 = [];
ws1.onmessage = e => got1.push(JSON.parse(e.data).online);
await wait(500);
const ws2 = new WebSocket(B.replace('http', 'ws') + '/v1/online'); const got2 = [];
ws2.onmessage = e => got2.push(JSON.parse(e.data).online);
await wait(500);
ok(got1.at(-1) === 2 && got2.at(-1) === 2, 'zwei Verbindungen = 2 online', { got1, got2 });
r = await get('/v1/online'); ok((await r.json()).online === 2, 'HTTP-Abfrage liefert dieselbe Zahl');
ws2.close(); await wait(700);
ok(got1.at(-1) === 1, 'nach Schliessen wieder 1 online', got1);
ws1.close();
r = await get('/v1/nix'); ok(r.status === 404, 'unbekannter Pfad = 404');
console.log(fails ? `\n${fails} FEHLER` : '\nalle Tests bestanden'); process.exit(fails ? 1 : 0);
