/* Baustellen-Banner (10.11.2026): rot-weisse Absperrbaender kreuzen sich ueber der Seite.
   Hinweis an Besucher und an die YouTube-API-Pruefung: Der Player wird nach den Richtlinien umgebaut.
   Klicks gehen durch (pointer-events: none), die Seite bleibt bedienbar.
   Entfernen: Script-Zeile aus den HTML-Seiten loeschen oder window.DRIFTWARE_BAUSTELLE = false setzen. */
(function () {
  if (window.DRIFTWARE_BAUSTELLE === false || document.getElementById('dw-baustelle')) return;
  var css =
    '#dw-baustelle{position:fixed;inset:0;z-index:2147483000;pointer-events:none;overflow:hidden}' +
    '#dw-baustelle .dw-band{position:absolute;left:50%;top:50%;width:260vmax;height:78px;margin-left:-130vmax;margin-top:-39px;' +
    'background:repeating-linear-gradient(-45deg,#d6001c 0 30px,#fff 30px 60px);' +
    'border-top:5px solid #1a1a1a;border-bottom:5px solid #1a1a1a;box-shadow:0 8px 26px rgba(0,0,0,.55)}' +
    '#dw-baustelle .dw-band.a{transform:rotate(30deg)}' +
    '#dw-baustelle .dw-band.b{transform:rotate(-30deg)}' +
    '#dw-baustelle .dw-label{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);' +
    'background:#fff;color:#d6001c;border:5px solid #d6001c;border-radius:6px;padding:14px 26px;text-align:center;' +
    'font:800 clamp(22px,5vw,46px)/1.1 "Arial Black",Impact,system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase;' +
    'box-shadow:0 10px 34px rgba(0,0,0,.6)}' +
    '#dw-baustelle .dw-label small{display:block;margin-top:8px;color:#1a1a1a;font:600 clamp(12px,2.2vw,18px)/1.3 system-ui,sans-serif;letter-spacing:.01em;text-transform:none}' +
    '@media (max-width:640px){#dw-baustelle .dw-band{height:56px;margin-top:-28px;background:repeating-linear-gradient(-45deg,#d6001c 0 22px,#fff 22px 44px)}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var box = document.createElement('div'); box.id = 'dw-baustelle'; box.setAttribute('role', 'note'); box.setAttribute('aria-label', 'Baustelle: Der Player wird überarbeitet');
  box.innerHTML = '<div class="dw-band a"></div><div class="dw-band b"></div>' +
    '<div class="dw-label">Under Construction<small>Wir überarbeiten den Player nach den YouTube-Richtlinien.</small></div>';
  (document.body || document.documentElement).appendChild(box);
})();
