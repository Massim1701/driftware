/* Gemeinsame Render-Logik fuer alle Dekaden-Seiten (80er, 90er, 2000er, ...).
   Jede Dekaden-Seite definiert nur ein DECADE-Konfigurationsobjekt und ruft
   eine der drei render*-Funktionen unten auf. So bleibt jede neue Dekade
   ein kleines Config-File statt kopiertem HTML/CSS/JS. */

function applyPalette(colors) {
  var root = document.documentElement.style;
  Object.keys(colors || {}).forEach(function (key) {
    root.setProperty('--' + key, colors[key]);
  });
}

var HOME_SVG = '<svg viewBox="0 0 24 24" fill="#f5cb7a" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.5 1.5 11h3V21h6v-6h3v6h6V11h3L12 2.5z"/></svg>';
var MAIL_SVG = '<svg viewBox="0 0 24 24" fill="#bfe0ff" xmlns="http://www.w3.org/2000/svg"><path d="M2 5h20v14H2V5zm2 2v.4l8 5.4 8-5.4V7H4zm16 2.9-8 5.4-8-5.4V17h16V9.9z"/></svg>';
var LOCK_SVG = '<svg viewBox="0 0 24 24" fill="#d6cbfa" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z"/></svg>';

function utilityBlockHTML(mailHref) {
  return '' +
    '<div class="utility-block">' +
    '  <a class="utility-tile" href="/" aria-label="Zurück zur Driftware Startseite">' +
    '    <div class="utility-icon" style="background:#d98c1f">' + HOME_SVG + '</div>' +
    '    <span class="utility-label">Home</span>' +
    '  </a>' +
    '  <a class="utility-tile" href="' + mailHref + '">' +
    '    <div class="utility-icon" style="background:#4a90d9">' + MAIL_SVG + '</div>' +
    '    <span class="utility-label">Mail</span>' +
    '  </a>' +
    '  <a class="utility-tile" href="privacy.html">' +
    '    <div class="utility-icon" style="background:#6a5acd">' + LOCK_SVG + '</div>' +
    '    <span class="utility-label">Datenschutz</span>' +
    '  </a>' +
    '</div>';
}

function contactFormHTML(subject) {
  return '' +
    '<form class="contact-form" method="POST" action="https://formsubmit.co/0b4cb7348b4cff5d1891bf8d99f1e757">' +
    '  <input type="hidden" name="_subject" value="' + subject + '">' +
    '  <input type="hidden" name="_template" value="table">' +
    '  <input type="text" name="_honey" class="contact-honey" tabindex="-1" autocomplete="off">' +
    '  <label><span>Name</span><input type="text" name="name" required></label>' +
    '  <label><span>Deine E-Mail-Adresse</span><input type="email" name="email" required></label>' +
    '  <label><span>Nachricht</span><textarea name="message" required></textarea></label>' +
    '  <button type="submit">Senden</button>' +
    '</form>';
}

/* ---------- Startseite der Dekade (index.html) ---------- */
function renderDecadeIndex(cfg) {
  applyPalette(cfg.colors);
  document.title = cfg.name + ' — ' + cfg.years + ' nach Stimmung sortiert';
  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', cfg.name + ': ' + cfg.tagline);

  document.body.insertAdjacentHTML('afterbegin', utilityBlockHTML('privacy.html#kontakt'));

  var featuresHTML = (cfg.features || []).map(function (f) {
    return '<div class="feature"><h3>' + f.emoji + ' ' + f.title + '</h3><p>' + f.desc + '</p></div>';
  }).join('');

  var main = document.getElementById('decade-root');
  main.insertAdjacentHTML('beforeend', '' +
    '<header class="decade-header">' +
    '  <div class="app-icon-hero" style="background:' + cfg.iconBg + '">' + cfg.icon + '</div>' +
    '  <p class="decade-logo">' + cfg.name + '</p>' +
    '  <p class="decade-years">' + cfg.years + '</p>' +
    '  <p class="decade-tagline">' + cfg.tagline + '</p>' +
    '  <div class="badges"><span class="badge">' + cfg.badgeText + '</span></div>' +
    '</header>' +
    '<main class="decade-main">' +
    '  <div class="features">' + featuresHTML + '</div>' +
    '  <div class="info-note"><strong>Woher kommen die Songs?</strong> ' + cfg.sourceNote + '</div>' +
    '</main>' +
    '<footer class="decade-footer">' +
    '  <span>&copy; 2026 Massimo — ' + cfg.name + '</span>' +
    '  <div class="links"><a href="impressum.html">Impressum</a></div>' +
    '</footer>'
  );
}

/* ---------- Impressum (impressum.html) ---------- */
function renderDecadeImpressum(cfg) {
  applyPalette(cfg.colors);
  document.title = 'Impressum — ' + cfg.name;
  document.body.insertAdjacentHTML('afterbegin', utilityBlockHTML('privacy.html#kontakt'));
  var main = document.getElementById('decade-root');
  main.insertAdjacentHTML('beforeend', '' +
    '<main class="legal-main">' +
    '  <a class="back-link" href="index.html">&larr; Zurück</a>' +
    '  <h1>Impressum</h1>' +
    '  <h2>Angaben gemäß § 5 TMG</h2>' +
    '  <p>Massimo</p>' +
    '  <p>Vollständiger Name und ladungsfähige Anschrift werden auf Anfrage über das Kontaktformular unten mitgeteilt.</p>' +
    '  <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>' +
    '  <p>Massimo</p>' +
    '  <h2>Hinweis</h2>' +
    '  <p>Dieses Impressum wurde als Entwurf für eine Einzelperson (kein Gewerbe) erstellt und ersetzt keine Rechtsberatung. Bei Unsicherheiten zur Impressumspflicht empfiehlt sich eine kurze Prüfung durch einen Anwalt oder einen Generator wie eRecht24.</p>' +
    '  <div class="contact-panel">' +
    '    <h2 style="margin-top:0;border-bottom:none;padding-bottom:0;">Kontaktformular</h2>' +
    contactFormHTML(cfg.name + ' — neue Kontaktanfrage') +
    '  </div>' +
    '</main>'
  );
}

/* ---------- Datenschutz (privacy.html) ---------- */
function renderDecadePrivacy(cfg) {
  applyPalette(cfg.colors);
  document.title = 'Datenschutzerklärung — ' + cfg.name;
  document.body.insertAdjacentHTML('afterbegin', utilityBlockHTML('#kontakt'));
  var main = document.getElementById('decade-root');
  main.insertAdjacentHTML('beforeend', '' +
    '<main class="legal-main">' +
    '  <a class="back-link" href="index.html">&larr; Zurück</a>' +
    '  <h1>Datenschutzerklärung – ' + cfg.name + '</h1>' +
    '  <p class="stand">Stand: September 2026</p>' +
    '  <h2>1. Verantwortlicher</h2>' +
    '  <p>Vollständiger Name und ladungsfähige Anschrift werden auf Anfrage über das Kontaktformular unten mitgeteilt.</p>' +
    '  <h2>2. Worum es hier geht</h2>' +
    '  <p>' + cfg.name + ' ist ein Projekt, das Songs aus ' + cfg.years + ' aus der offenen Musikdatenbank Discogs nach Stimmung/Genre sortiert und als Playlisten für Streaming-Dienste aufbereitet. ' + cfg.sourceNote + '</p>' +
    '  <h2>3. Keine Erhebung personenbezogener Daten</h2>' +
    '  <p>Diese Seite verwendet kein Nutzerkonto, kein Tracking und keine Analyse- oder Werbe-SDKs. Es werden keine Gerätekennungen, Standortdaten oder Nutzungsstatistiken erhoben, gespeichert oder übertragen.</p>' +
    '  <h2>4. Kontaktformular</h2>' +
    '  <p>Wenn du uns über das Kontaktformular schreibst, werden Name, E-Mail-Adresse und Nachricht über den Dienst formsubmit.co an uns weitergeleitet und ausschließlich zur Beantwortung deiner Anfrage genutzt.</p>' +
    '  <h2>5. Kinder</h2>' +
    '  <p>Dieses Angebot richtet sich nicht gezielt an Kinder unter 16 Jahren. Da keine personenbezogenen Daten automatisiert erhoben werden, werden auch keine Daten von Kindern gesammelt.</p>' +
    '  <h2>6. Deine Rechte</h2>' +
    '  <p>Da diese Seite keine personenbezogenen Daten automatisiert erhebt oder speichert, bestehen unsererseits keine Datenbestände, auf die sich Auskunfts-, Berichtigungs- oder Löschungsansprüche beziehen könnten. Bei Fragen erreichst du uns jederzeit über das Kontaktformular unten.</p>' +
    '  <h2>7. Änderungen dieser Erklärung</h2>' +
    '  <p>Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen, etwa wenn neue Funktionen hinzukommen. Die jeweils aktuelle Version ist unter dieser Seite abrufbar.</p>' +
    '  <div class="contact-panel" id="kontakt">' +
    '    <h2 style="margin-top:0;border-bottom:none;padding-bottom:0;">Kontakt</h2>' +
    contactFormHTML(cfg.name + ' — neue Kontaktanfrage') +
    '  </div>' +
    '</main>'
  );
}

/* ---------- Playlist-Generator (Themen-Auswahl, Cover-Kacheln, Popup) ----------
   Wiederverwendbar fuer alle Dekaden: jede Seite ruft nur
   renderPlaylistGenerator(mountPoint, config) auf, sobald ihre songs.json steht. */

function ensureSongModal() {
  var existing = document.getElementById('song-modal-overlay');
  if (existing) return existing;
  var overlay = document.createElement('div');
  overlay.className = 'song-modal-overlay';
  overlay.id = 'song-modal-overlay';
  overlay.innerHTML = '' +
    '<div class="song-modal">' +
    '  <button class="song-modal-close" aria-label="Schließen"><span class="song-modal-close-x">&times;</span></button>' +
    '  <img id="song-modal-img" alt="">' +
    '  <div class="song-modal-artist" id="song-modal-artist"></div>' +
    '  <div class="song-modal-title" id="song-modal-title"></div>' +
    '  <dl class="song-modal-meta" id="song-modal-meta"></dl>' +
    '  <div class="streaming-row" id="song-modal-streaming"></div>' +
    '  <a class="song-modal-link" id="song-modal-link" target="_blank" rel="noopener">Auf Discogs ansehen →</a>' +
    '</div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeSongModal(); });
  overlay.querySelector('.song-modal-close').addEventListener('click', closeSongModal);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSongModal(); });
  return overlay;
}

var STREAMING_SERVICES = [
  {
    key: 'spotify',
    label: 'Spotify',
    color: '#1DB954',
    icon: '<path d="M6.3 9.8c3.6-1 7.7-1 11.3.5" stroke="#fff" stroke-width="1.7" fill="none" stroke-linecap="round"/><path d="M6.8 12.7c3.1-.8 6.2-.8 9.3.3" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M7.3 15.5c2.4-.6 4.8-.6 7.1.2" stroke="#fff" stroke-width="1.3" fill="none" stroke-linecap="round"/>',
    url: function (q) { return 'https://open.spotify.com/search/' + q; }
  },
  {
    key: 'apple',
    label: 'Apple Music',
    color: '#fa233b',
    icon: '<path d="M15.3 6.3v7.9a2.5 2.5 0 1 0 1.4 2.24V9.75l-5.4 1.2v4.75a2.5 2.5 0 1 0 1.4 2.24V8.1l2.6-.6z" fill="#fff"/>',
    url: function (q) { return 'https://music.apple.com/de/search?term=' + q; }
  },
  {
    key: 'ytmusic',
    label: 'YouTube Music',
    color: '#ff0000',
    icon: '<circle cx="12" cy="12" r="6.2" fill="#fff"/><path d="M10.3 9.4 15 12l-4.7 2.6z" fill="#ff0000"/>',
    url: function (q) { return 'https://music.youtube.com/search?q=' + q; }
  },
  {
    key: 'deezer',
    label: 'Deezer',
    color: '#a238ff',
    icon: '<rect x="5.7" y="14" width="2.3" height="4" rx="0.6" fill="#fff"/><rect x="9.1" y="11.3" width="2.3" height="6.7" rx="0.6" fill="#fff"/><rect x="12.5" y="8.6" width="2.3" height="9.4" rx="0.6" fill="#fff"/><rect x="15.9" y="6" width="2.3" height="12" rx="0.6" fill="#fff"/>',
    url: function (q) { return 'https://www.deezer.com/search/' + q; }
  },
  {
    key: 'amazon',
    label: 'Amazon Music',
    color: '#00a8e1',
    icon: '<circle cx="12" cy="9.8" r="2.9" fill="#fff"/><rect x="10.7" y="9.8" width="1.6" height="6.2" rx="0.8" fill="#fff"/><path d="M6.8 17.2c2.3 1.7 8.1 1.7 10.4 0" stroke="#fff" stroke-width="1.3" fill="none" stroke-linecap="round"/>',
    url: function (q) { return 'https://music.amazon.de/search/' + q; }
  }
];

function streamingLinksHTML(song) {
  var q = encodeURIComponent(song.a + ' ' + song.t);
  return STREAMING_SERVICES.map(function (svc) {
    return '' +
      '<a class="streaming-icon" href="' + svc.url(q) + '" target="_blank" rel="noopener" ' +
      'title="' + svc.label + '" aria-label="' + svc.label + ' – nach ' + song.a + ' – ' + song.t + ' suchen" ' +
      'style="background:' + svc.color + '" onclick="event.stopPropagation()">' +
      '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' + svc.icon + '</svg>' +
      '</a>';
  }).join('');
}

function closeSongModal() {
  var overlay = document.getElementById('song-modal-overlay');
  if (overlay) overlay.classList.remove('open');
}

function openSongModal(song) {
  var overlay = ensureSongModal();
  var img = document.getElementById('song-modal-img');
  img.src = song.cv || song.th || '';
  img.alt = song.a + ' – ' + song.t;
  document.getElementById('song-modal-artist').textContent = song.a;
  document.getElementById('song-modal-title').textContent = song.t;

  var meta = document.getElementById('song-modal-meta');
  meta.innerHTML = '';
  var rows = [
    ['Jahr', song.y],
    ['Genre', song.g],
    ['Style', song.s],
    ['Land', song.c],
    ['Label', song.l]
  ];
  rows.forEach(function (pair) {
    if (!pair[1]) return;
    var dt = document.createElement('dt'); dt.textContent = pair[0];
    var dd = document.createElement('dd'); dd.textContent = pair[1];
    meta.appendChild(dt); meta.appendChild(dd);
  });

  document.getElementById('song-modal-streaming').innerHTML = streamingLinksHTML(song);

  var link = document.getElementById('song-modal-link');
  if (song.u) { link.href = song.u; link.style.display = ''; } else { link.style.display = 'none'; }

  overlay.classList.add('open');
}

function renderSongGrid(container, songs) {
  container.innerHTML = '';
  songs.forEach(function (song) {
    var wrap = document.createElement('div');
    wrap.className = 'song-tile-wrap';

    var tile = document.createElement('button');
    tile.className = 'song-tile';
    tile.type = 'button';

    var img = document.createElement('img');
    img.src = song.th || song.cv || '';
    img.alt = song.a + ' – ' + song.t;
    img.loading = 'lazy';
    tile.appendChild(img);

    var artist = document.createElement('span');
    artist.className = 'song-tile-artist';
    artist.textContent = song.a;
    tile.appendChild(artist);

    var title = document.createElement('span');
    title.className = 'song-tile-title';
    title.textContent = song.t;
    tile.appendChild(title);

    tile.addEventListener('click', function () { openSongModal(song); });
    wrap.appendChild(tile);

    var streaming = document.createElement('div');
    streaming.className = 'streaming-row streaming-row-tile';
    streaming.innerHTML = streamingLinksHTML(song);
    wrap.appendChild(streaming);

    container.appendChild(wrap);
  });
}

/* config: { mountBefore: CSS-Selektor im Ziel-Container, dataUrl, themes: [{key,label}], csvPrefix } */
function renderPlaylistGenerator(mountRoot, config) {
  var data = null;
  var currentTheme = null;

  function currentSongs() { return (data && currentTheme) ? (data[currentTheme] || []) : []; }

  function asLines() {
    return currentSongs().map(function (s) { return s.a + ' - ' + s.t; }).join('\n');
  }
  function asCSV() {
    var esc = function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; };
    var lines = ['Artist,Title,Year,Genre,Style'];
    currentSongs().forEach(function (s) {
      lines.push([esc(s.a), esc(s.t), s.y, esc(s.g), esc(s.s)].join(','));
    });
    return lines.join('\n');
  }

  function loadData() {
    if (data) return Promise.resolve(data);
    return fetch(config.dataUrl).then(function (r) { return r.json(); }).then(function (j) { data = j; return j; });
  }

  function refresh() {
    document.getElementById('gen-count').textContent = currentSongs().length + ' Songs';
    renderSongGrid(document.getElementById('gen-grid'), currentSongs());
  }

  function selectTheme(key) {
    currentTheme = key;
    mountRoot.querySelectorAll('.theme-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.key === key);
    });
    document.getElementById('gen-actions').classList.add('visible');
    loadData().then(refresh);
  }

  var section = document.createElement('section');
  section.className = 'generator';
  section.innerHTML = '' +
    '<h2>🎛️ Playlist-Generator</h2>' +
    '<p class="sub">Thema wählen, Cover anklicken für alle Song-Infos, Liste kopieren oder exportieren.</p>' +
    '<div class="theme-buttons" id="gen-buttons"></div>' +
    '<div class="generator-actions" id="gen-actions">' +
    '  <span class="generator-count" id="gen-count"></span>' +
    '  <button id="gen-copy" type="button">📋 Liste kopieren</button>' +
    '  <a id="gen-download" download>⬇️ Als CSV exportieren</a>' +
    '</div>' +
    '<div class="song-grid" id="gen-grid"></div>' +
    '<p class="song-hint">Für den Import in Spotify, Apple Music oder YouTube Music: Liste kopieren oder CSV herunterladen und bei ' +
    '<a href="https://soundiiz.com" target="_blank" rel="noopener">Soundiiz</a> oder ' +
    '<a href="https://www.tunemymusic.com" target="_blank" rel="noopener">TuneMyMusic</a> hochladen.</p>';

  var buttons = section.querySelector('#gen-buttons');
  config.themes.forEach(function (t) {
    var btn = document.createElement('button');
    btn.className = 'theme-btn';
    btn.type = 'button';
    btn.textContent = t.label;
    btn.dataset.key = t.key;
    btn.addEventListener('click', function () { selectTheme(t.key); });
    buttons.appendChild(btn);
  });

  var target = mountRoot.querySelector(config.mountBefore);
  mountRoot.insertBefore(section, target || null);

  section.querySelector('#gen-copy').addEventListener('click', function (e) {
    navigator.clipboard.writeText(asLines()).then(function () {
      e.target.textContent = '✅ Kopiert!';
      setTimeout(function () { e.target.textContent = '📋 Liste kopieren'; }, 1500);
    });
  });
  section.querySelector('#gen-download').addEventListener('click', function (e) {
    var blob = new Blob([asCSV()], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    e.target.href = url;
    e.target.download = (config.csvPrefix || 'playlist') + '-' + (currentTheme || 'songs') + '.csv';
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  });

  selectTheme(config.themes[0].key);
}
