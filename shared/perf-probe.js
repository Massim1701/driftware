/* Mess-Feld fuer Ruckler (nur mit ?perf=1 in der Adresse, wird von decades.js nachgeladen).
   Zeigt Bilder pro Sekunde, schaltet teure Effekte einzeln ab und misst beim Scrollen der Songliste, welcher
   Effekt die Bildzeit verbessert. "Alle Varianten testen" macht das automatisch und liefert eine Tabelle zum Kopieren.
   Aendert nichts an den Daten; "Zuruecksetzen" bzw. Neuladen stellt alles wieder her. */
(function () {
  if (window.__ccPerfProbe) return;
  window.__ccPerfProbe = true;
  var html = document.documentElement;

  var EFFECTS = [
    { key: 'lite', label: 'Leicht-Modus', kind: 'class', cls: 'lite' },
    { key: 'light', label: 'Mauslicht aus', css: '#cc-cursor-light{display:none!important}' },
    { key: 'filter', label: 'Filter/Blur/backdrop aus', css: '*{filter:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}' },
    { key: 'shadow', label: 'Schatten aus', css: '*{box-shadow:none!important;text-shadow:none!important}' },
    { key: 'anim', label: 'Animationen/Uebergaenge aus', css: '*{animation:none!important;transition:none!important}' },
    { key: 'blend', label: 'Blend-Modi aus', css: '*{mix-blend-mode:normal!important}' },
    { key: 'player', label: 'Deck-Bereich ausblenden', css: '#dj-player{visibility:hidden!important}' },
    { key: 'grad', label: 'Verlaeufe/Hintergruende aus', css: '*{background-image:none!important}' }
  ];
  var state = {}; // key -> true = "Effekt abgeschaltet" (bei lite: true = Leicht-Modus an)
  var baseLite = html.classList.contains('lite');
  var styleEl = document.createElement('style'); styleEl.id = 'cc-perf-style'; document.head.appendChild(styleEl);

  function apply() {
    var css = '';
    EFFECTS.forEach(function (e) { if (e.kind !== 'class' && state[e.key]) css += e.css; });
    styleEl.textContent = css;
    html.classList.toggle('lite', state.lite === undefined ? baseLite : !!state.lite);
  }
  function describe() {
    var on = EFFECTS.filter(function (e) { return e.key === 'lite' ? html.classList.contains('lite') : state[e.key]; }).map(function (e) { return e.label; });
    return on.length ? on.join(' + ') : 'nichts geaendert';
  }

  /* --- Bildrate --- */
  var fps = { n: 0, t0: performance.now(), worst: 0, last: performance.now(), shown: '' };
  (function loop(now) {
    requestAnimationFrame(loop);
    var dt = now - fps.last; fps.last = now; fps.n++; if (dt > fps.worst) fps.worst = dt;
    if (now - fps.t0 >= 1000) { fps.shown = Math.round(fps.n * 1000 / (now - fps.t0)) + ' B/s, schlechtester Frame ' + Math.round(fps.worst) + ' ms'; fps.n = 0; fps.worst = 0; fps.t0 = now; }
  })(performance.now());

  /* --- Scroll-Test --- */
  function runScroll(target, frames) {
    return new Promise(function (resolve) {
      var g = target === 'list' ? document.querySelector('.song-grid') : null;
      var startY = window.scrollY;
      if (g) { g.scrollIntoView({ block: 'center' }); g.scrollTop = 0; }
      var t = [], last = performance.now(), n = 0, pos = 0;
      requestAnimationFrame(function f(now) {
        t.push(now - last); last = now; n++;
        if (g) { pos += 90; g.scrollTop = pos; } else { pos += 40; window.scrollTo(0, pos % Math.max(1, document.documentElement.scrollHeight - innerHeight)); }
        if (n < frames) return requestAnimationFrame(f);
        t.shift(); t.sort(function (a, b) { return a - b; });
        if (g) g.scrollTop = 0; else window.scrollTo(0, startY);
        resolve({ median: t[t.length >> 1], p95: t[Math.floor(t.length * 0.95)], max: t[t.length - 1], slow: t.filter(function (x) { return x > 25; }).length, n: t.length });
      });
    });
  }
  function fmt(r) { return r.median.toFixed(1) + ' ms | p95 ' + r.p95.toFixed(1) + ' | max ' + r.max.toFixed(0) + ' | langsam ' + r.slow + '/' + r.n; }

  /* --- Oberflaeche --- */
  var box = document.createElement('div');
  box.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:2147483647;width:320px;max-height:80vh;overflow:auto;background:rgba(10,10,14,.94);color:#e8e8f0;font:12px/1.35 ui-monospace,Menlo,monospace;border:1px solid #555;border-radius:8px;padding:8px;box-shadow:0 4px 18px rgba(0,0,0,.6)';
  box.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center"><b>Mess-Feld</b><span id="ccp-fps" style="color:#7dffb0"></span></div>' +
    '<div id="ccp-fx" style="margin:6px 0"></div>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px"><button id="ccp-list">Liste scrollen</button><button id="ccp-page">Seite scrollen</button><button id="ccp-all"><b>Alle Varianten testen</b></button><button id="ccp-reset">Zuruecksetzen</button><button id="ccp-copy">Ergebnis kopieren</button></div>' +
    '<pre id="ccp-log" style="margin:0;white-space:pre-wrap;color:#cfd3ff"></pre>';
  box.querySelectorAll('button').forEach(function (b) { b.style.cssText = 'font:inherit;background:#2a2a38;color:#fff;border:1px solid #666;border-radius:5px;padding:3px 7px;cursor:pointer'; });
  (document.body || html).appendChild(box);
  var fxBox = box.querySelector('#ccp-fx');
  EFFECTS.forEach(function (e) {
    var l = document.createElement('label'); l.style.cssText = 'display:block;cursor:pointer';
    var c = document.createElement('input'); c.type = 'checkbox'; c.id = 'ccp-' + e.key; c.checked = e.key === 'lite' ? baseLite : false; c.style.marginRight = '6px';
    c.addEventListener('change', function () { state[e.key] = c.checked; apply(); });
    l.appendChild(c); l.appendChild(document.createTextNode(e.label)); fxBox.appendChild(l);
  });
  function syncChecks() { EFFECTS.forEach(function (e) { var c = document.getElementById('ccp-' + e.key); if (c) c.checked = e.key === 'lite' ? html.classList.contains('lite') : !!state[e.key]; }); }
  var logEl = box.querySelector('#ccp-log'), lines = [];
  function log(s) { lines.push(s); logEl.textContent = lines.slice(-14).join('\n'); }
  setInterval(function () { box.querySelector('#ccp-fps').textContent = fps.shown; }, 500);

  var busy = false;
  function guard(fn) { return function () { if (busy) return; busy = true; Promise.resolve(fn()).then(function () { busy = false; }, function (e) { busy = false; log('Fehler: ' + e); }); }; }
  box.querySelector('#ccp-list').onclick = guard(function () { return runScroll('list', 180).then(function (r) { log('Liste [' + describe() + ']: ' + fmt(r)); }); });
  box.querySelector('#ccp-page').onclick = guard(function () { return runScroll('page', 180).then(function (r) { log('Seite [' + describe() + ']: ' + fmt(r)); }); });
  box.querySelector('#ccp-reset').onclick = function () { state = {}; apply(); syncChecks(); log('zurueckgesetzt'); };
  box.querySelector('#ccp-copy').onclick = function () {
    var txt = 'Safari ' + (navigator.userAgent.match(/Version\/[\d.]+/) || [''])[0] + ' | ' + innerWidth + 'x' + innerHeight + ' @' + devicePixelRatio + 'x | ' + location.pathname + '\n' + lines.join('\n');
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { log('kopiert'); }, function () { logEl.textContent = txt; log('(Kopieren nicht erlaubt: Text oben markieren)'); });
  };
  box.querySelector('#ccp-all').onclick = guard(function () {
    var results = [];
    var variants = [{ name: 'Ausgangslage (so wie die Seite ist)', set: {} }, { name: 'Leicht-Modus AUS (Zustand vor meinen Aenderungen)', set: { lite: false } }].concat(EFFECTS.filter(function (e) { return e.key !== 'lite'; }).map(function (e) { var s = {}; s[e.key] = true; return { name: e.label, set: s }; }));
    var allOff = {}; EFFECTS.forEach(function (e) { if (e.key !== 'lite') allOff[e.key] = true; });
    variants.push({ name: 'ALLES aus', set: allOff });
    var btn = box.querySelector('#ccp-all'), btnText = btn.innerHTML;
    log('--- START: ' + variants.length + ' Varianten, ca. ' + Math.round(variants.length * 5) + ' s. Bitte NICHT kopieren, bevor "FERTIG" erscheint ---');
    var i = 0;
    function next() {
      if (i >= variants.length) {
        state = {}; apply(); syncChecks(); btn.innerHTML = btnText;
        results.sort(function (a, b) { return (a.l.median + a.p.median) - (b.l.median + b.p.median); });
        log('=== FERTIG - Median je Bild in ms (Liste / Seite), kleiner = besser ===');
        results.forEach(function (x) { log(x.l.median.toFixed(1) + ' / ' + x.p.median.toFixed(1) + '  (p95 ' + x.l.p95.toFixed(0) + ' / ' + x.p.p95.toFixed(0) + ')  ' + x.name); });
        return;
      }
      var v = variants[i++]; btn.textContent = 'laeuft ' + i + '/' + variants.length + ' ...';
      state = Object.assign({}, v.set); apply(); syncChecks();
      var res = {};
      return new Promise(function (r) { setTimeout(r, 900); })
        .then(function () { return runScroll('list', 120); }).then(function (r) { res.l = r; return new Promise(function (r2) { setTimeout(r2, 300); }); })
        .then(function () { return runScroll('page', 120); }).then(function (r) { res.p = r; results.push({ name: v.name, l: res.l, p: res.p }); return next(); });
    }
    return next();
  });
  log('Bereit. "Alle Varianten testen" druecken, ca. 1 Minute warten bis "FERTIG" erscheint, dann "Ergebnis kopieren".');
})();
