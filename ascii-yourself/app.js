/* ASCII Yourself – Foto und Video in Farb-ASCII. Läuft komplett im Browser, nichts wird hochgeladen. */
(() => {
'use strict';

const $ = (id) => document.getElementById(id);
const MAX_SEC = 10;                 // längstes erlaubtes Video
const CHARSETS = {
  classic: ' .:-=+*#%@',
  dense: ' .\'`^",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
  blocks: ' ░▒▓█',
  binary: ' 01'
};

/* ---------- Einstellungen ---------- */
const IDS = ['cols','charset','word','color','bg','glow','bright','contrast','sat','invert','mirror','audio'];
const DEFAULTS = { cols:120, charset:'classic', word:'DRIFTWARE', color:'orig', bg:'black', glow:60, bright:0, contrast:120, sat:130, invert:false, mirror:false, audio:false };
const S = Object.assign({}, DEFAULTS);
try { Object.assign(S, JSON.parse(localStorage.getItem('asciiyourself.v1') || '{}')); } catch (e) { /* ohne Speicher weiter */ }

function applyToControls() {
  for (const id of IDS) {
    const el = $(id); if (!el) continue;
    if (el.type === 'checkbox') el.checked = !!S[id]; else el.value = S[id];
  }
  syncOutputs();
}
function syncOutputs() {
  for (const id of ['cols','glow','bright','contrast','sat']) { const o = $('o_' + id); if (o) o.textContent = S[id]; }
  $('wordRow').hidden = S.charset !== 'letters';
}
function save() { try { localStorage.setItem('asciiyourself.v1', JSON.stringify(S)); } catch (e) { /* egal */ } }

/* ---------- Zustand ---------- */
const out = $('out');
const octx = out.getContext('2d');
const small = document.createElement('canvas');
const sctx = small.getContext('2d', { willReadFrequently: true });
const mid = document.createElement('canvas');
const mctx = mid.getContext('2d');

let source = null;       // { kind:'image'|'video', el, w, h, dur, limit, url, audio }
let grid = null;         // letzter Rasterzustand für Export
let previewing = false;
let recording = false;
let rafId = 0;

function msg(text, isErr) {
  const m = $('msg'); m.textContent = text || ''; m.classList.toggle('err', !!isErr);
}

/* ---------- Umwandlung ---------- */
function layout(sw, sh) {
  const cols = S.cols % 2 ? S.cols + 1 : S.cols;
  const cw = Math.max(5, Math.min(14, Math.round(1280 / cols)));
  const ch = cw * 2;
  const rows = Math.max(8, Math.round(cols * sh / (sw * 2)));
  return { cols, rows, cw, ch };
}

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

function drawFrame() {
  if (!source) return;
  const { el, w, h } = source;
  const L = layout(w, h);
  const W = L.cols * L.cw, H = L.rows * L.ch;
  if (out.width !== W || out.height !== H) { out.width = W; out.height = H; }
  if (small.width !== L.cols || small.height !== L.rows) { small.width = L.cols; small.height = L.rows; }

  /* in zwei Schritten verkleinern, damit feine Muster nicht flimmern */
  sctx.imageSmoothingEnabled = true; sctx.imageSmoothingQuality = 'high';
  sctx.save();
  if (S.mirror) { sctx.translate(L.cols, 0); sctx.scale(-1, 1); }
  if (w > L.cols * 6) {
    const mw = L.cols * 3, mh = L.rows * 3;
    if (mid.width !== mw || mid.height !== mh) { mid.width = mw; mid.height = mh; }
    mctx.imageSmoothingEnabled = true; mctx.imageSmoothingQuality = 'high';
    mctx.drawImage(el, 0, 0, mw, mh);
    sctx.drawImage(mid, 0, 0, L.cols, L.rows);
  } else {
    sctx.drawImage(el, 0, 0, L.cols, L.rows);
  }
  sctx.restore();
  const data = sctx.getImageData(0, 0, L.cols, L.rows).data;

  const chars = S.charset === 'letters' ? null : CHARSETS[S.charset] || CHARSETS.classic;
  const word = (S.word || 'ASCII').toUpperCase();
  const n = chars ? chars.length : 0;
  const white = S.bg === 'white';
  const photoBg = S.bg === 'photo';
  const k = S.glow / 100;
  const satMul = (S.color === 'neon' ? S.sat * 1.5 : S.sat) / 100;
  const contrast = S.contrast / 100;
  const flip = S.invert !== white;           // auf weißem Grund steht dichtes Zeichen für dunkel

  octx.fillStyle = white ? '#fff' : '#000';
  octx.fillRect(0, 0, W, H);
  octx.font = (L.cw / 0.6).toFixed(1) + 'px ui-monospace, Menlo, Consolas, "DejaVu Sans Mono", monospace';
  octx.textAlign = 'center'; octx.textBaseline = 'middle';

  const colors = new Uint8ClampedArray(L.cols * L.rows * 3);
  const rowsTxt = new Array(L.rows);
  let wi = 0;

  for (let y = 0; y < L.rows; y++) {
    let line = '';
    for (let x = 0; x < L.cols; x++) {
      const i = (y * L.cols + x) * 4;
      let r = data[i], g = data[i + 1], b = data[i + 2];
      const lum0 = 0.299 * r + 0.587 * g + 0.114 * b;
      r = clamp(lum0 + (r - lum0) * satMul, 0, 255);
      g = clamp(lum0 + (g - lum0) * satMul, 0, 255);
      b = clamp(lum0 + (b - lum0) * satMul, 0, 255);
      const l = clamp((lum0 - 128) * contrast + 128 + S.bright, 0, 255);
      let t = l / 255; if (flip) t = 1 - t;

      let ch, draw = true;
      if (chars) {
        ch = chars[Math.round(t * (n - 1))];
        if (ch === ' ') draw = false;
      } else {
        draw = t > 0.06;
        ch = word[wi % word.length]; wi++;
      }

      let cr, cg, cb;
      const tv = flip ? 1 - t : t;             // Helligkeit des Bildpunkts 0..1
      if (S.color === 'matrix') { cg = 70 + 185 * tv; cr = cg * 0.08; cb = cg * 0.3; }
      else if (S.color === 'amber') { const q = 0.35 + 0.65 * tv; cr = 255 * q; cg = 176 * q; cb = 0; }
      else if (S.color === 'mono') { cr = cg = cb = white ? 0 : 255; }
      else {
        const m = Math.max(r, g, b, 1), boost = 255 / m;
        cr = r * (1 - k) + r * boost * k; cg = g * (1 - k) + g * boost * k; cb = b * (1 - k) + b * boost * k;
        if (white) { cr *= 0.82; cg *= 0.82; cb *= 0.82; }
      }
      cr = cr | 0; cg = cg | 0; cb = cb | 0;
      const ci = (y * L.cols + x) * 3; colors[ci] = cr; colors[ci + 1] = cg; colors[ci + 2] = cb;

      if (photoBg) {
        octx.fillStyle = 'rgb(' + (r * 0.3 | 0) + ',' + (g * 0.3 | 0) + ',' + (b * 0.3 | 0) + ')';
        octx.fillRect(x * L.cw, y * L.ch, L.cw, L.ch);
      }
      if (draw) {
        octx.fillStyle = 'rgb(' + cr + ',' + cg + ',' + cb + ')';
        octx.fillText(ch, x * L.cw + L.cw / 2, y * L.ch + L.ch / 2 + 1);
        line += ch;
      } else line += ' ';
    }
    rowsTxt[y] = line;
  }
  grid = { cols: L.cols, rows: L.rows, text: rowsTxt, colors, bg: S.bg, bgPhoto: photoBg ? data.slice() : null };
}

/* ---------- Datei laden ---------- */
function clearSource() {
  stopPreview();
  if (source && source.url) URL.revokeObjectURL(source.url);
  if (source && source.audio && source.audio.ac) { try { source.audio.ac.close(); } catch (e) { /* egal */ } }
  source = null; grid = null;
  $('canvasbox').classList.remove('has');
  $('photoBar').hidden = true; $('videoBar').hidden = true;
  hideResult();
  octx.fillStyle = '#000'; octx.fillRect(0, 0, out.width, out.height);
}

function hideResult() {
  const r = $('result'); r.hidden = true;
  const v = $('resVideo'); v.pause(); v.removeAttribute('src'); v.load();
  const a = $('resDl'); if (a.dataset.url) { URL.revokeObjectURL(a.dataset.url); a.dataset.url = ''; }
}

async function loadFile(f) {
  if (!f) return;
  clearSource(); msg('');
  const isVideo = f.type.startsWith('video/') || /\.(mp4|mov|m4v|webm)$/i.test(f.name);
  const isImage = f.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|avif|heic|heif)$/i.test(f.name);
  if (!isVideo && !isImage) { msg('Dieses Dateiformat kenne ich nicht. Bitte ein Foto (JPG, PNG) oder Video (MP4, MOV) nehmen.', true); return; }
  try {
    if (isImage) await loadImage(f); else await loadVideo(f);
  } catch (e) {
    msg(e && e.message ? e.message : 'Die Datei konnte nicht gelesen werden.', true);
    clearSource();
  }
}

async function loadImage(f) {
  let el, w, h;
  try {
    el = await createImageBitmap(f, { imageOrientation: 'from-image' });
    w = el.width; h = el.height;
  } catch (e) {
    el = await new Promise((res, rej) => {
      const im = new Image(); const u = URL.createObjectURL(f);
      im.onload = () => { URL.revokeObjectURL(u); res(im); };
      im.onerror = () => { URL.revokeObjectURL(u); rej(new Error('Dieses Bildformat kann dein Browser nicht lesen (zum Beispiel HEIC). Bitte als JPG oder PNG speichern.')); };
      im.src = u;
    });
    w = el.naturalWidth; h = el.naturalHeight;
  }
  if (!w || !h) throw new Error('Das Bild hat keine Größe.');
  source = { kind: 'image', el, w, h };
  $('canvasbox').classList.add('has');
  $('photoBar').hidden = false;
  drawFrame();
  msg('Fertig. Mit den Reglern links kannst du das Aussehen ändern.');
}

async function loadVideo(f) {
  const v = document.createElement('video');
  v.muted = true; v.playsInline = true; v.preload = 'auto'; v.setAttribute('playsinline', '');
  const url = URL.createObjectURL(f);
  v.src = url;
  await new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('Das Video lässt sich nicht öffnen. Bitte MP4 (H.264) oder MOV versuchen.')), 12000);
    v.onloadeddata = () => { clearTimeout(t); res(); };
    v.onerror = () => { clearTimeout(t); rej(new Error('Das Video lässt sich nicht öffnen. Bitte MP4 (H.264) oder MOV versuchen.')); };
  });
  if (!v.videoWidth || !v.videoHeight) { URL.revokeObjectURL(url); throw new Error('Das Video hat kein Bild.'); }
  const dur = isFinite(v.duration) ? v.duration : MAX_SEC;
  const limit = Math.min(dur, MAX_SEC);
  source = { kind: 'video', el: v, w: v.videoWidth, h: v.videoHeight, dur, limit, url, audio: null };
  $('canvasbox').classList.add('has');
  $('videoBar').hidden = false;
  $('vinfo').textContent = 'Länge ' + dur.toFixed(1).replace('.', ',') + ' s' + (dur > MAX_SEC ? ' · es werden nur die ersten 10 s genommen' : '');
  if (dur > MAX_SEC) msg('Das Video ist länger als 10 Sekunden. Es werden nur die ersten 10 Sekunden umgewandelt.');
  else msg('Fertig. „Vorschau“ zeigt die Bewegung, „Video erzeugen“ speichert sie als Datei.');
  await seekTo(0.05);
  drawFrame();
}

function seekTo(t) {
  return new Promise((res) => {
    const v = source.el;
    if (Math.abs(v.currentTime - t) < 0.001) return res();
    const done = () => { v.removeEventListener('seeked', done); res(); };
    v.addEventListener('seeked', done);
    v.currentTime = t;
    setTimeout(done, 1500);
  });
}

/* ---------- Vorschau ---------- */
function frameLoop(cb) {
  const v = source && source.el;
  if (v && typeof v.requestVideoFrameCallback === 'function') v.requestVideoFrameCallback(() => cb());
  else rafId = requestAnimationFrame(() => cb());
}

function startPreview() {
  if (!source || source.kind !== 'video' || previewing || recording) return;
  previewing = true; $('btnPlay').textContent = 'Pause';
  source.el.muted = true;
  source.el.play().catch(() => {});
  const tick = () => {
    if (!previewing || !source) return;
    drawFrame();
    if (source.el.currentTime >= source.limit - 0.03) { source.el.currentTime = 0.01; }
    frameLoop(tick);
  };
  frameLoop(tick);
}

function stopPreview() {
  if (!previewing) return;
  previewing = false; cancelAnimationFrame(rafId);
  $('btnPlay').textContent = 'Vorschau';
  if (source && source.el && source.kind === 'video') source.el.pause();
}

/* ---------- Video erzeugen ---------- */
function pickMime() {
  if (!window.MediaRecorder) return '';
  const list = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
  return list.find((m) => MediaRecorder.isTypeSupported(m)) || '';
}

function setBusy(b) {
  document.querySelectorAll('.panel input, .panel select, .panel button, #btnPlay, #btnRec, #audio').forEach((e) => { e.disabled = b; });
}

async function record() {
  if (!source || source.kind !== 'video' || recording) return;
  const mime = pickMime();
  if (!window.MediaRecorder || !out.captureStream) { msg('Dein Browser kann kein Video aufnehmen. Bitte Chrome, Edge, Firefox oder Safari (neu) benutzen.', true); return; }
  stopPreview(); hideResult();
  recording = true; setBusy(true);
  const v = source.el;
  try {
    await seekTo(0);
    const stream = out.captureStream(30);
    let note = '';
    if (S.audio) {
      try {
        if (!source.audio) {
          const ac = new (window.AudioContext || window.webkitAudioContext)();
          const node = ac.createMediaElementSource(v);
          const dest = ac.createMediaStreamDestination();
          node.connect(dest);                 // nur in die Aufnahme, nicht auf die Lautsprecher
          source.audio = { ac, node, dest };
        }
        await source.audio.ac.resume();
        source.audio.dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
        v.muted = false; v.volume = 1;
      } catch (e) { note = 'Ton konnte nicht übernommen werden, das Video ist stumm.'; v.muted = true; }
    } else v.muted = true;

    const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 8000000 } : { videoBitsPerSecond: 8000000 });
    const chunks = [];
    rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    const finished = new Promise((res) => { rec.onstop = res; });
    rec.start(250);
    await v.play();
    const t0 = performance.now();
    await new Promise((res) => {
      const tick = () => {
        drawFrame();
        const t = v.currentTime;
        $('vinfo').textContent = 'Nehme auf … ' + Math.min(t, source.limit).toFixed(1).replace('.', ',') + ' von ' + source.limit.toFixed(1).replace('.', ',') + ' s';
        if (v.ended || t >= source.limit - 0.03 || performance.now() - t0 > (source.limit + 3) * 1000) return res();
        frameLoop(tick);
      };
      frameLoop(tick);
    });
    drawFrame();
    await new Promise((r) => setTimeout(r, 120));   // letztes Bild noch mitnehmen
    v.pause(); v.muted = true;
    rec.stop(); await finished;
    stream.getTracks().forEach((t) => t.stop());
    const type = rec.mimeType || mime || 'video/webm';
    const blob = new Blob(chunks, { type });
    if (!blob.size) throw new Error('Die Aufnahme ist leer geblieben.');
    const ext = /mp4/.test(type) ? 'mp4' : 'webm';
    const u = URL.createObjectURL(blob);
    const a = $('resDl'); a.href = u; a.dataset.url = u; a.download = 'ascii-yourself.' + ext;
    const rv = $('resVideo'); rv.src = u; $('result').hidden = false;
    $('resNote').textContent = (ext === 'webm' ? 'Dateiformat WebM: läuft in Browsern und den meisten Playern. Für WhatsApp oder iPhone brauchst du eventuell MP4. ' : '') + note;
    $('vinfo').textContent = 'Fertig: ' + (blob.size / 1048576).toFixed(1).replace('.', ',') + ' MB, ' + ext.toUpperCase();
    msg('Das Video ist fertig. Unten kannst du es ansehen und speichern.');
    $('result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (e) {
    msg(e && e.message ? e.message : 'Die Aufnahme hat nicht geklappt.', true);
    $('vinfo').textContent = '';
  } finally {
    recording = false; setBusy(false);
    if (source && source.el) { source.el.pause(); }
  }
}

/* ---------- Exporte ---------- */
function download(name, blob) {
  const a = document.createElement('a'); const u = URL.createObjectURL(blob);
  a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 4000);
}
function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function exportPng() { if (!grid) return; out.toBlob((b) => b && download('ascii-yourself.png', b), 'image/png'); }
function exportTxt() { if (!grid) return; download('ascii-yourself.txt', new Blob([grid.text.join('\n')], { type: 'text/plain;charset=utf-8' })); }
function exportHtml() {
  if (!grid) return;
  const bg = grid.bg === 'white' ? '#fff' : '#000';
  let body = '';
  for (let y = 0; y < grid.rows; y++) {
    let run = '', cur = '';
    const flush = () => { if (run) { body += cur ? '<span style="color:' + cur + '">' + esc(run) + '</span>' : esc(run); run = ''; } };
    for (let x = 0; x < grid.cols; x++) {
      const ch = grid.text[y][x]; const i = (y * grid.cols + x) * 3;
      const col = ch === ' ' ? '' : 'rgb(' + grid.colors[i] + ',' + grid.colors[i + 1] + ',' + grid.colors[i + 2] + ')';
      if (col !== cur) { flush(); cur = col; }
      run += ch;
    }
    flush(); body += '\n';
  }
  const html = '<!doctype html><meta charset="utf-8"><title>ASCII Yourself</title><body style="margin:0;background:' + bg + '"><pre style="margin:0;padding:12px;font:10px/1.2 ui-monospace,Menlo,Consolas,monospace;letter-spacing:0;background:' + bg + '">' + body + '</pre>';
  download('ascii-yourself.html', new Blob([html], { type: 'text/html;charset=utf-8' }));
}

/* ---------- Bedienung ---------- */
let redrawTimer = 0;
function redraw() {
  if (!source || recording) return;
  if (source.kind === 'video' && previewing) return;       // Vorschau zeichnet selbst
  clearTimeout(redrawTimer);
  redrawTimer = setTimeout(drawFrame, 20);
}

for (const id of IDS) {
  const el = $(id); if (!el) continue;
  el.addEventListener('input', () => {
    S[id] = el.type === 'checkbox' ? el.checked : (el.type === 'range' ? Number(el.value) : el.value);
    syncOutputs(); save(); if (id !== 'audio') redraw();
  });
}

const drop = $('drop'), fileIn = $('file');
drop.addEventListener('click', () => fileIn.click());
drop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileIn.click(); } });
fileIn.addEventListener('change', () => { loadFile(fileIn.files[0]); fileIn.value = ''; });
$('btnSelfie').addEventListener('click', () => $('selfie').click());
$('selfie').addEventListener('change', (e) => { loadFile(e.target.files[0]); e.target.value = ''; });
['dragenter', 'dragover'].forEach((t) => document.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((t) => document.addEventListener(t, (e) => { e.preventDefault(); if (t === 'drop' || e.target === document.documentElement) drop.classList.remove('over'); }));
document.addEventListener('drop', (e) => { const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f) loadFile(f); });

$('btnReset').addEventListener('click', () => { Object.assign(S, DEFAULTS); applyToControls(); save(); if (source) drawFrame(); msg('Einstellungen zurückgesetzt.'); });
$('btnPng').addEventListener('click', exportPng);
$('btnTxt').addEventListener('click', exportTxt);
$('btnHtml').addEventListener('click', exportHtml);
$('btnPlay').addEventListener('click', () => { if (previewing) stopPreview(); else startPreview(); });
$('btnRec').addEventListener('click', record);

applyToControls();

/* für Tests: kleine Schnittstelle */
window.__ascii = { loadFile, state: () => ({ S, hasGrid: !!grid, kind: source && source.kind, w: out.width, h: out.height }) };
})();
