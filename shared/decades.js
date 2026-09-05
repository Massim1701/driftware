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
var GRID_SVG = '<svg viewBox="0 0 24 24" fill="#8fe3c7" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6"/></svg>';

/* Player-Bediensymbole: dezente Linien-/Flaechen-Icons statt Emoji, gleicher
   Grund wie bei den Genre-Kacheln (siehe THEME_ICON_PATHS weiter unten). */
var PLAY_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
var PAUSE_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
var PREV_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h2v14H6z"/><path d="M20 5v14l-11-7z"/></svg>';
var NEXT_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 5h2v14h-2z"/><path d="M4 5v14l11-7z"/></svg>';
var SEARCH_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-5-5"/></svg>';
var REFRESH_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 0 1 14-5.3M20 4v5h-5"/><path d="M20 12a8 8 0 0 1-14 5.3M4 20v-5h5"/></svg>';
var SPEAKER_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9a4 4 0 0 1 0 6"/></svg>';
var NOTE_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="7" cy="18" r="3"/><path d="M10 18V4l9-2v13"/><circle cx="16" cy="17" r="3"/></svg>';
var PLUS_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
var COPY_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="12" height="14" rx="1.5"/><path d="M8 20h9a1.5 1.5 0 0 0 1.5-1.5V8"/></svg>';
var DOWNLOAD_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0-4-4m4 4 4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>';
var CLOCK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>';
var CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6"/></svg>';

function utilityBlockHTML(mailHref) {
  return '' +
    '<div class="utility-block">' +
    '  <a class="utility-tile" href="/" aria-label="Zurück zur Driftware Startseite">' +
    '    <div class="utility-icon" style="background:#d98c1f">' + HOME_SVG + '</div>' +
    '    <span class="utility-label">Home</span>' +
    '  </a>' +
    '  <a class="utility-tile" href="/dekaden/" aria-label="Zurück zur Dekaden-Übersicht">' +
    '    <div class="utility-icon" style="background:#1c8f6f">' + GRID_SVG + '</div>' +
    '    <span class="utility-label">Dekaden</span>' +
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
    '  <button type="button" class="song-modal-play" id="song-modal-play">' + PLAY_SVG + ' Song abspielen</button>' +
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

/* Auswahl (grüner Haken) + bevorzugter Dienst, damit "Senden" ohne Umweg über
   Kopieren/CSV direkt beim Streaming-Anbieter landet. Modul-weit, nicht pro
   Theme: eine Auswahl kann Songs aus mehreren Themen der Seite sammeln. */
var PREFERRED_SERVICE_KEY = 'driftware-preferred-streaming';
var preferredService = null;
try { preferredService = localStorage.getItem(PREFERRED_SERVICE_KEY); } catch (e) {}
var selectedSongs = {};
var lastGridSongs = [];

function songId(song) { return song.u || (song.a + '␟' + song.t); }
function isSongSelected(song) { return Object.prototype.hasOwnProperty.call(selectedSongs, songId(song)); }

function toggleSongSelected(song, tileEl) {
  var id = songId(song);
  if (selectedSongs[id]) { delete selectedSongs[id]; } else { selectedSongs[id] = song; }
  tileEl.classList.toggle('selected', !!selectedSongs[id]);
  updateSendPanel();
}

function preferredServiceObj() {
  return STREAMING_SERVICES.filter(function (s) { return s.key === preferredService; })[0] || null;
}

function updateSendPanel() {
  var sendBtn = document.getElementById('gen-send');
  var clearBtn = document.getElementById('gen-send-clear');
  if (!sendBtn) return;
  var count = Object.keys(selectedSongs).length;
  var svc = preferredServiceObj();
  sendBtn.disabled = count === 0 || !svc;
  if (count === 0) {
    sendBtn.textContent = 'Auswahl senden';
  } else if (!svc) {
    sendBtn.textContent = count + (count === 1 ? ' Song ausgewählt – Dienst wählen' : ' Songs ausgewählt – Dienst wählen');
  } else {
    sendBtn.textContent = count + (count === 1 ? ' Song an ' : ' Songs an ') + svc.label + ' senden';
  }
  if (clearBtn) clearBtn.hidden = count === 0;
}

function renderProviderPicker(container) {
  container.innerHTML = STREAMING_SERVICES.map(function (svc) {
    return '' +
      '<button type="button" class="provider-btn' + (svc.key === preferredService ? ' active' : '') + '" ' +
      'data-key="' + svc.key + '" title="' + svc.label + '" aria-label="' + svc.label + ' als bevorzugten Dienst wählen" ' +
      'style="background:' + svc.color + '">' +
      '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' + svc.icon + '</svg>' +
      '</button>';
  }).join('');
  container.querySelectorAll('.provider-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      preferredService = btn.dataset.key;
      try { localStorage.setItem(PREFERRED_SERVICE_KEY, preferredService); } catch (e) {}
      container.querySelectorAll('.provider-btn').forEach(function (b) {
        b.classList.toggle('active', b.dataset.key === preferredService);
      });
      updateSendPanel();
    });
  });
}

function sendSelection() {
  var svc = preferredServiceObj();
  var songs = Object.keys(selectedSongs).map(function (id) { return selectedSongs[id]; });
  if (!svc || !songs.length) return;
  if (songs.length > 8 && !confirm(
    'Jeder Song öffnet einen eigenen Tab direkt bei ' + svc.label + ' (keine Sammel-Playlist möglich ohne Login beim Anbieter). ' +
    'Das sind ' + songs.length + ' neue Tabs. Fortfahren?'
  )) return;
  songs.forEach(function (song) {
    var q = encodeURIComponent(song.a + ' ' + song.t);
    window.open(svc.url(q), '_blank', 'noopener');
  });
}

function clearSelection() {
  selectedSongs = {};
  document.querySelectorAll('.song-tile.selected').forEach(function (t) { t.classList.remove('selected'); });
  updateSendPanel();
}

/* Suche bleibt in der eigenen Dekade. Kein Treffer dort? Dann leise in den
   anderen Dekaden nachschauen (eigene songs.json je Dekade, lazy geladen und
   gecacht) und per 💡-Hinweis auf die richtige Dekade verlinken. */
var DECADE_REGISTRY = [
  { key: '70er', label: '70er Music', page: '/70er-music/index.html', dataUrl: '/70er-music/songs.json' },
  { key: '80er', label: '80er Music', page: '/80er-music/index.html', dataUrl: '/80er-music/songs.json' },
  { key: '90er', label: '90er Music', page: '/90er-music/index.html', dataUrl: '/90er-music/songs.json' },
  { key: '2000er', label: '2000er Music', page: '/2000er-music/index.html', dataUrl: '/2000er-music/songs.json' },
  { key: '2010er', label: '2010er Music', page: '/2010er-music/index.html', dataUrl: '/2010er-music/songs.json' },
  { key: '2020er', label: '2020er Music', page: '/2020er-music/index.html', dataUrl: '/2020er-music/songs.json' }
];
var otherDecadeDataCache = {};

function normalizeText(s) { return (s || '').toString().toLowerCase(); }

function flattenSongs(dataObj) {
  var out = [];
  Object.keys(dataObj || {}).forEach(function (k) { (dataObj[k] || []).forEach(function (s) { out.push(s); }); });
  return out;
}

function searchSongs(list, query) {
  var q = normalizeText(query);
  var seen = {};
  var out = [];
  list.forEach(function (s) {
    var hit = normalizeText(s.a).indexOf(q) !== -1 ||
      normalizeText(s.t).indexOf(q) !== -1 ||
      normalizeText(s.g).indexOf(q) !== -1 ||
      normalizeText(s.s).indexOf(q) !== -1;
    if (!hit) return;
    var id = songId(s);
    if (seen[id]) return;
    seen[id] = true;
    out.push(s);
  });
  return out;
}

function fetchDecadeSongs(entry) {
  if (Object.prototype.hasOwnProperty.call(otherDecadeDataCache, entry.key)) {
    return Promise.resolve(otherDecadeDataCache[entry.key]);
  }
  return fetch(entry.dataUrl)
    .then(function (r) { if (!r.ok) throw new Error('no data'); return r.json(); })
    .then(function (json) { var flat = flattenSongs(json); otherDecadeDataCache[entry.key] = flat; return flat; })
    .catch(function () { otherDecadeDataCache[entry.key] = null; return null; });
}

/* Sucht in ALLEN anderen Dekaden (nicht nur als Fallback) und liefert die
   Treffer direkt mit — jeder Song wird mit _decade (Dekaden-Schluessel)
   markiert, damit er im Grid als Herkunfts-Badge angezeigt werden kann. */
function searchAllDecades(query, ownKey) {
  var others = DECADE_REGISTRY.filter(function (d) { return d.key !== ownKey; });
  return Promise.all(others.map(function (d) {
    return fetchDecadeSongs(d).then(function (songs) {
      if (!songs) return [];
      var matched = searchSongs(songs, query);
      matched.forEach(function (s) { s._decade = d.key; });
      return matched;
    });
  })).then(function (results) {
    var out = [];
    results.forEach(function (r) { out = out.concat(r); });
    return out;
  });
}

/* ---------- Eigener DJ-Player: zwei Plattenspieler (Deck A/B) nebeneinander
   mit Crossfader für Überblendungen. Songs per Klick oder per Drag&Drop auf
   ein Deck laden. Nutzt die offizielle YouTube IFrame Player API (offiziell
   erlaubtes Embed, YouTube bleibt als Quelle sichtbar, Player-Funktionalität
   wird nicht verändert/entfernt — nur optisch als rundes Vinyl-Label
   eingekreist). Alles, was ein Deck abspielt, landet zusätzlich im
   "Mein Mix"-Verlauf (localStorage), um den Mix später erneut zu hören. */
var ytApiLoading = false;
var ytApiReady = false;

function loadYouTubeAPI(onReady) {
  if (ytApiReady && window.YT && window.YT.Player) { onReady(); return; }
  var prevCb = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = function () {
    ytApiReady = true;
    if (typeof prevCb === 'function') prevCb();
    onReady();
  };
  if (ytApiLoading) return;
  ytApiLoading = true;
  var tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

var DECKS = {
  A: { player: null, queue: [], index: -1, isPlaying: false, song: null, rate: 1, preloadedFor: null },
  B: { player: null, queue: [], index: -1, isPlaying: false, song: null, rate: 1, preloadedFor: null }
};
var nextLoadDeck = 'A';
var crossfaderValue = 50; /* 0 = nur Deck A hörbar, 100 = nur Deck B */
var masterVolume = 80; /* Gesamtlautstärke, 0-100, skaliert beide Decks zusaetzlich zum Crossfader */
var autoFadeEnabled = true; /* Autofade-Button: automatisches Überblenden an/aus, siehe maybeStartAutoCrossfade */

/* Verlauf bereits gespielter Songs (global, seitenweit — es gibt nur einen
   Player pro Seite). Ein Song wird beim Start des tatsaechlichen Abspielens
   eingetragen (nicht schon beim Laden), und nur einmal pro Ladevorgang
   (deck.historyLogged verhindert Duplikate durch Pause/Resume). */
var playHistory = [];
function logPlayHistory(song) {
  if (!song) return;
  playHistory.unshift({ a: song.a, t: song.t });
  if (playHistory.length > 30) playHistory.length = 30;
  renderPlayHistory();
}
function renderPlayHistory() {
  var list = document.getElementById('gen-history-list');
  if (!list) return;
  if (!playHistory.length) {
    list.innerHTML = '<li class="gen-history-empty">Noch nichts gespielt.</li>';
    return;
  }
  list.innerHTML = playHistory.map(function (h) {
    return '<li><strong>' + escapeHtml(h.t) + '</strong><span>' + escapeHtml(h.a) + '</span></li>';
  }).join('');
}

function deckHTML(key) {
  return '' +
    '<div class="dj-deck" id="deck-' + key + '">' +
    '  <div class="dj-deck-label">Deck ' + key + '</div>' +
    '  <div class="dj-deck-top">' +
    '    <div class="dj-vinyl" id="deck-' + key + '-drop">' +
    '      <div class="dj-vinyl-disc" id="deck-' + key + '-disc">' +
    '        <div class="dj-vinyl-video" id="deck-' + key + '-mount"></div>' +
    '        <div class="dj-vinyl-ring" aria-hidden="true"><span class="dj-vinyl-dot"></span></div>' +
    '      </div>' +
    '      <div class="dj-vinyl-hint">Song hierher ziehen</div>' +
    '    </div>' +
    '    <div class="dj-pitch">' +
    '      <div class="dj-pitch-display" id="deck-' + key + '-pitch-display">PITCH 0%</div>' +
    '      <div class="dj-pitch-slider-wrap">' +
    '        <input type="range" class="dj-pitch-slider" id="deck-' + key + '-pitch" min="-50" max="50" step="25" value="0" aria-label="Deck ' + key + ': Pitch">' +
    '      </div>' +
    '    </div>' +
    '  </div>' +
    '  <div class="dj-deck-info">' +
    '    <strong id="deck-' + key + '-artist">–</strong>' +
    '    <span id="deck-' + key + '-title">Kein Song geladen</span>' +
    '    <span class="dj-deck-remaining" id="deck-' + key + '-remaining"></span>' +
    '    <span class="dj-deck-bpm" id="deck-' + key + '-bpm"></span>' +
    '  </div>' +
    '  <div class="dj-deck-controls">' +
    '    <button type="button" id="deck-' + key + '-prev" aria-label="Deck ' + key + ': voriger Song">' + PREV_SVG + '</button>' +
    '    <button type="button" id="deck-' + key + '-toggle" aria-label="Deck ' + key + ': abspielen/pause">' + PLAY_SVG + '</button>' +
    '    <button type="button" id="deck-' + key + '-next" aria-label="Deck ' + key + ': nächster Song">' + NEXT_SVG + '</button>' +
    '  </div>' +
    '</div>';
}

/* Suche + Player sind jetzt untrennbar: die Suche lebt oben in dieser
   fest-positionierten Leiste (statt weiter oben im Seiteninhalt), damit
   sie beim Nutzen des Players immer erreichbar bleibt. Die Leiste ist
   von Anfang an sichtbar (kein Ein-/Ausblenden mehr, kein X zum
   Schließen) — Suche muss jederzeit zugaenglich sein. */
/* Der Player steht auf breiten Screens als Spalte rechts, darunter als
   Leiste am unteren Rand. Wie hoch diese Leiste ist, haengt vom Inhalt ab
   (geladene Songtitel, Umbrueche) — deshalb wird der Freiraum unter dem
   Seiteninhalt hier gemessen statt in der CSS geraten. Sonst verschwindet
   auf Tablets der untere Teil der Seite hinter dem Player. */
function syncPlayerSpacing() {
  var bar = document.getElementById('dj-player');
  if (!bar) return;
  if (window.innerWidth <= 1100) {
    document.body.style.paddingBottom = (bar.offsetHeight + 12) + 'px';
  } else {
    document.body.style.paddingBottom = '';
  }
}
var spacingHandle = null;
function queuePlayerSpacing() {
  if (spacingHandle) return;
  spacingHandle = window.requestAnimationFrame(function () {
    spacingHandle = null;
    syncPlayerSpacing();
  });
}
window.addEventListener('resize', queuePlayerSpacing);
window.addEventListener('orientationchange', queuePlayerSpacing);

function ensureDjPlayer() {
  var existing = document.getElementById('dj-player');
  if (existing) return existing;
  var bar = document.createElement('div');
  bar.className = 'dj-player open';
  bar.id = 'dj-player';
  bar.innerHTML = '' +
    '<div class="search-box dj-search-box">' +
    '  <span class="search-box-icon">' + SEARCH_SVG + '</span>' +
    '  <input type="search" id="gen-search" class="search-input" placeholder="Song, Künstler oder Genre suchen — alle Dekaden …" autocomplete="off">' +
    '</div>' +
    '<p class="search-hint" id="gen-search-hint" hidden></p>' +
    '<div class="dj-decks">' +
    deckHTML('A') +
    '<div class="dj-master">' +
    '  <div class="dj-crossfader">' +
    '    <span class="dj-crossfader-label">A</span>' +
    '    <input type="range" id="dj-crossfader" min="0" max="100" value="50" aria-label="Crossfader zwischen Deck A und Deck B">' +
    '    <span class="dj-crossfader-label">B</span>' +
    '  </div>' +
    '  <button type="button" id="dj-autofade-toggle" class="dj-autofade-toggle active" aria-pressed="true" ' +
    '    title="Automatisches Überblenden 5s vor Songende (nur bei passenden BPM) an/aus">' + REFRESH_SVG + ' Autofade An</button>' +
    '  <div class="dj-volume">' +
    '    <span class="dj-volume-label">' + SPEAKER_SVG + '</span>' +
    '    <input type="range" id="dj-master-volume" min="0" max="100" value="80" aria-label="Gesamtlautstärke">' +
    '  </div>' +
    '</div>' +
    deckHTML('B') +
    '</div>';
  document.body.appendChild(bar);

  ['A', 'B'].forEach(function (key) {
    bar.querySelector('#deck-' + key + '-toggle').addEventListener('click', function () { deckTogglePlay(key); });
    bar.querySelector('#deck-' + key + '-prev').addEventListener('click', function () { deckStep(key, -1); });
    bar.querySelector('#deck-' + key + '-next').addEventListener('click', function () { deckStep(key, 1); });
    var dropzone = bar.querySelector('#deck-' + key + '-drop');
    dropzone.addEventListener('dragover', function (e) { e.preventDefault(); dropzone.classList.add('drag-over'); });
    dropzone.addEventListener('dragleave', function () { dropzone.classList.remove('drag-over'); });
    dropzone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      var raw = e.dataTransfer.getData('application/json');
      if (!raw) return;
      try {
        var song = JSON.parse(raw);
        loadSongToDeck(song, key, lastGridSongs, false);
      } catch (err) {}
    });
    var pitchSlider = bar.querySelector('#deck-' + key + '-pitch');
    if (pitchSlider) {
      pitchSlider.addEventListener('input', function () {
        setDeckPitch(key, 1 + parseInt(pitchSlider.value, 10) / 100);
      });
    }
  });

  var fader = bar.querySelector('#dj-crossfader');
  fader.addEventListener('input', function () {
    crossfaderValue = parseInt(fader.value, 10);
    applyCrossfaderVolumes();
  });

  var volumeInput = bar.querySelector('#dj-master-volume');
  volumeInput.addEventListener('input', function () {
    masterVolume = parseInt(volumeInput.value, 10);
    applyCrossfaderVolumes();
  });

  var autoFadeBtn = bar.querySelector('#dj-autofade-toggle');
  autoFadeBtn.addEventListener('click', function () {
    autoFadeEnabled = !autoFadeEnabled;
    autoFadeBtn.classList.toggle('active', autoFadeEnabled);
    autoFadeBtn.setAttribute('aria-pressed', autoFadeEnabled ? 'true' : 'false');
    autoFadeBtn.innerHTML = REFRESH_SVG + (autoFadeEnabled ? ' Autofade An' : ' Autofade Aus');
    if (!autoFadeEnabled && activeAutoFade) {
      clearInterval(activeAutoFade.intervalId);
      activeAutoFade = null;
    }
  });

  queuePlayerSpacing();
  return bar;
}

function applyCrossfaderVolumes() {
  var scale = masterVolume / 100;
  var volA = Math.round((100 - crossfaderValue) * scale);
  var volB = Math.round(crossfaderValue * scale);
  if (DECKS.A.player && DECKS.A.player.setVolume) { try { DECKS.A.player.setVolume(volA); } catch (e) {} }
  if (DECKS.B.player && DECKS.B.player.setVolume) { try { DECKS.B.player.setVolume(volB); } catch (e) {} }
}

/* Pitch/Tempo eines Decks setzen — wirkt ueber die YouTube IFrame API
   (setPlaybackRate), die nur feste Stufen kennt (0.5/0.75/1/1.25/1.5x).
   Der Regler ist deshalb auf genau diese 5 Stufen genastet (step=25),
   damit die Anzeige immer zu dem passt, was tatsächlich zu hören ist. */
function setDeckPitch(key, rate) {
  var deck = DECKS[key];
  deck.rate = rate;
  if (deck.player && deck.player.setPlaybackRate) {
    try { deck.player.setPlaybackRate(rate); } catch (e) {}
  }
  var pct = Math.round((rate - 1) * 100);
  var display = document.getElementById('deck-' + key + '-pitch-display');
  if (display) {
    display.textContent = 'PITCH ' + (pct > 0 ? '+' : '') + pct + '%';
  }
  var slider = document.getElementById('deck-' + key + '-pitch');
  if (slider && parseInt(slider.value, 10) !== pct) { slider.value = pct; }
}

function updateDeckInfoUI(key) {
  var deck = DECKS[key];
  var artistEl = document.getElementById('deck-' + key + '-artist');
  var titleEl = document.getElementById('deck-' + key + '-title');
  if (artistEl) artistEl.textContent = deck.song ? deck.song.a : '–';
  if (titleEl) titleEl.textContent = deck.song ? deck.song.t : 'Kein Song geladen';
  var discEl = document.getElementById('deck-' + key + '-disc');
  /* Weisser Punkt auf der Scheibe zeigt, ob gerade abgespielt wird —
     die Scheibe selbst dreht sich nicht mehr (siehe weiter unten). */
  if (discEl) discEl.classList.toggle('playing', !!deck.isPlaying);
  var deckEl = document.getElementById('deck-' + key);
  if (deckEl) deckEl.classList.toggle('dj-deck-loaded', !!deck.song);
  var toggleBtn = document.getElementById('deck-' + key + '-toggle');
  if (toggleBtn) toggleBtn.innerHTML = deck.isPlaying ? PAUSE_SVG : PLAY_SVG;
  var bpmEl = document.getElementById('deck-' + key + '-bpm');
  if (bpmEl) bpmEl.innerHTML = (deck.song && deck.song.bpm) ? NOTE_SVG + ' ' + deck.song.bpm + ' BPM' : '';
  queuePlayerSpacing();
  refreshMixableHighlight();
}

/* Mix-Hilfe ±10 BPM: sobald auf einem Deck ein Song mit bekanntem bpm
   liegt, werden in der sichtbaren Songliste alle Songs markiert, deren
   bpm innerhalb von ±10 des geladenen Songs liegt (Prinzip wie bei
   BPM-Studio-artiger DJ-Software — harmonisch mixbares Tempo). Ohne
   geladenen Song mit bpm (oder ohne bpm am Song selbst) keine Markierung. */
function activeDeckBpms() {
  var bpms = [];
  ['A', 'B'].forEach(function (key) {
    var song = DECKS[key].song;
    if (song && song.bpm) bpms.push(song.bpm);
  });
  return bpms;
}

function refreshMixableHighlight() {
  var deckBpms = activeDeckBpms();
  document.querySelectorAll('.song-tile').forEach(function (tile) {
    var bpm = parseInt(tile.dataset.songBpm, 10);
    var mixable = !isNaN(bpm) && deckBpms.some(function (b) { return Math.abs(bpm - b) <= 10; });
    tile.classList.toggle('song-tile-mixable', mixable);
  });
}

function onDeckStateChange(key) {
  return function (e) {
    var deck = DECKS[key];
    if (e.data === YT.PlayerState.PLAYING) {
      deck.isPlaying = true;
      if (!deck.historyLogged) { logPlayHistory(deck.song); deck.historyLogged = true; }
      maybePreloadNext(key);
    } else if (e.data === YT.PlayerState.PAUSED) {
      deck.isPlaying = false;
    } else if (e.data === YT.PlayerState.ENDED) {
      if (activeAutoFade && activeAutoFade.fromKey === key) {
        finishAutoCrossfade();
      } else if (!tryGaplessHandoff(key)) {
        advanceAlternating(key);
      }
    }
    updateDeckInfoUI(key);
  };
}

/* Vorausschauendes Puffern: waehrend ein Deck spielt, wird der naechste
   Song der Warteschlange stumm auf das ANDERE Deck geladen (nicht
   abgespielt), sofern dieses gerade unbenutzt ist. So ist beim Songende
   kein Nachladen mehr noetig — die 1-2s Ladeluecke zwischen zwei Songs
   entfaellt, weil beide Player-Instanzen bereits laufen/gepuffert sind.
   Betrifft nur den Normalfall (Playlist durchspielen mit nur einem aktiv
   genutzten Deck); ist das zweite Deck bereits belegt, greift dieses
   Vorladen bewusst nicht ein. */
function maybePreloadNext(key) {
  var deck = DECKS[key];
  var otherKey = key === 'A' ? 'B' : 'A';
  var other = DECKS[otherKey];
  if (other.song || other.isPlaying) return;
  var nextIdx = deck.index + 1;
  if (nextIdx < 0 || nextIdx >= deck.queue.length) return;
  var nextSong = deck.queue[nextIdx];
  if (!nextSong || !nextSong.yt) return;
  var wantedId = songId(nextSong);
  if (other.preloadedFor === wantedId) return;
  other.preloadedFor = wantedId;
  ensureDjPlayer();
  function cue() {
    if (other.preloadedFor !== wantedId) return; /* zwischenzeitlich ueberholt */
    if (other.player && other.player.cueVideoById) {
      try { other.player.setVolume(0); } catch (e) {}
      try { other.player.cueVideoById(nextSong.yt); } catch (e) {}
    } else if (!other.player) {
      other.player = new YT.Player('deck-' + otherKey + '-mount', {
        width: '100%',
        height: '100%',
        videoId: nextSong.yt,
        playerVars: { rel: 0, playsinline: 1, autoplay: 0 },
        events: {
          onReady: function (e) { try { e.target.setVolume(0); } catch (err) {} },
          onStateChange: onDeckStateChange(otherKey),
          onError: function () { other.preloadedFor = null; }
        }
      });
    }
  }
  loadYouTubeAPI(cue);
}

/* Beim Songende pruefen, ob der naechste Song bereits stumm auf dem
   anderen Deck bereitliegt (siehe maybePreloadNext) — wenn ja, sofort
   nahtlos dorthin umschalten statt neu zu laden/zu puffern. Gibt true
   zurueck bei erfolgreichem Handoff, sonst false (dann laeuft der
   normale deckStep()-Pfad weiter). */
function tryGaplessHandoff(key) {
  var finished = DECKS[key];
  var otherKey = key === 'A' ? 'B' : 'A';
  var other = DECKS[otherKey];
  var nextIdx = finished.index + 1;
  if (nextIdx < 0 || nextIdx >= finished.queue.length) return false;
  var nextSong = finished.queue[nextIdx];
  if (!nextSong || !other.player || !other.preloadedFor || other.preloadedFor !== songId(nextSong)) return false;

  other.queue = finished.queue;
  other.index = nextIdx;
  other.song = nextSong;
  other.historyLogged = false;
  other.preloadedFor = null;

  crossfaderValue = (otherKey === 'A') ? 0 : 100;
  var fader = document.getElementById('dj-crossfader');
  if (fader) fader.value = crossfaderValue;
  applyCrossfaderVolumes();
  try { other.player.setPlaybackRate(other.rate || 1); } catch (e) {}
  try { other.player.playVideo(); } catch (e) {}
  updateDeckInfoUI(otherKey);

  finished.song = null;
  finished.queue = [];
  finished.index = -1;
  finished.isPlaying = false;
  updateDeckInfoUI(key);

  maybePreloadNext(otherKey);
  return true;
}

/* Fallback, wenn beim Songende noch kein fertiges Preload auf dem anderen
   Deck bereitliegt (z.B. sehr kurzer Song, oder das Preload war noch am
   Puffern): trotzdem IMMER das jeweils andere Deck fuer den naechsten Song
   uebernehmen, nie zweimal hintereinander dasselbe Deck -- so alternieren
   A und B garantiert bei jedem Songwechsel, auch ohne den nahtlosen
   Handoff. Das eigentliche Ein-/Ausblenden (Auto/Manuell) kommt separat.
   Gibt true zurueck, wenn ein naechster Song vorhanden war und uebernommen
   wurde, sonst false (Ende der Warteschlange). */
function advanceAlternating(key) {
  var finished = DECKS[key];
  var otherKey = key === 'A' ? 'B' : 'A';
  var other = DECKS[otherKey];
  var nextIdx = finished.index + 1;
  if (nextIdx < 0 || nextIdx >= finished.queue.length) return false;
  var nextSong = finished.queue[nextIdx];
  if (!nextSong || !nextSong.yt) return false;

  other.queue = finished.queue;
  other.index = nextIdx;
  playDeckSong(otherKey, nextSong, true);

  finished.song = null;
  finished.queue = [];
  finished.index = -1;
  finished.isPlaying = false;
  updateDeckInfoUI(key);

  return true;
}

/* Automatisches Überblenden statt hartem Schnitt: 5 Sekunden vor Songende
   beginnt das bereits vorgeladene andere Deck einzufaden, waehrend das
   endende Deck ausfadet (Crossfader wandert in dieser Zeit automatisch von
   der aktuellen Position zur Gegenseite). Die "Intelligenz" dahinter ist
   dieselbe ±10-BPM-Schwelle wie bei der "mixbar"-Markierung im Grid
   (siehe refreshMixableHighlight): passen die Tempi der beiden Songs
   zusammen, laeuft der volle, sanfte 5s-Übergang; passen sie NICHT zusammen
   (oder fehlt einem der Songs die BPM), wuerde ein langer Übergang zwei
   unpassende Rhythmen gleichzeitig hoerbar machen — deshalb dann nur ein
   kurzer 1,2s-Wechsel statt eines ausgedehnten Blends. Ein echtes Beatmatching
   (Zeitdehnung exakt auf die Ziel-BPM) ist mit der YouTube-IFrame-API nicht
   moeglich, da setPlaybackRate nur die festen Stufen 0.5/0.75/1/1.25/1.5
   kennt — zu grob fuer eine Feinanpassung im niedrigen BPM-Bereich. */
var CROSSFADE_LEAD_SECONDS = 5;
var QUICK_HANDOFF_SECONDS = 1.2;
var activeAutoFade = null;

function bpmsCompatible(bpmA, bpmB) {
  return !!bpmA && !!bpmB && Math.abs(bpmA - bpmB) <= 10;
}

function maybeStartAutoCrossfade(key, remaining) {
  if (!autoFadeEnabled || activeAutoFade) return;
  var deck = DECKS[key];
  var otherKey = key === 'A' ? 'B' : 'A';
  var other = DECKS[otherKey];
  var nextIdx = deck.index + 1;
  if (nextIdx < 0 || nextIdx >= deck.queue.length) return;
  var nextSong = deck.queue[nextIdx];
  if (!nextSong || !other.player || !other.preloadedFor || other.preloadedFor !== songId(nextSong)) return;

  var compatible = bpmsCompatible(deck.song && deck.song.bpm, nextSong.bpm);
  var leadTime = compatible ? CROSSFADE_LEAD_SECONDS : QUICK_HANDOFF_SECONDS;
  if (remaining > leadTime) return;

  startAutoCrossfade(key, otherKey, nextIdx, nextSong, Math.max(remaining, 0.5));
}

function startAutoCrossfade(fromKey, toKey, nextIdx, nextSong, durationSeconds) {
  var from = DECKS[fromKey];
  var to = DECKS[toKey];

  to.queue = from.queue;
  to.index = nextIdx;
  to.song = nextSong;
  to.historyLogged = false;
  to.preloadedFor = null;

  try { to.player.setPlaybackRate(to.rate || 1); } catch (e) {}
  try { to.player.playVideo(); } catch (e) {}
  updateDeckInfoUI(toKey);

  var startFader = crossfaderValue;
  var targetFader = (toKey === 'A') ? 0 : 100;
  var startTime = Date.now();
  var durationMs = durationSeconds * 1000;
  var faderEl = document.getElementById('dj-crossfader');

  activeAutoFade = {
    fromKey: fromKey,
    toKey: toKey,
    intervalId: setInterval(function () {
      var t = Math.min(1, (Date.now() - startTime) / durationMs);
      crossfaderValue = Math.round(startFader + (targetFader - startFader) * t);
      if (faderEl) faderEl.value = crossfaderValue;
      applyCrossfaderVolumes();
      if (t >= 1) finishAutoCrossfade();
    }, 100)
  };
}

/* Greift der Nutzer waehrend eines laufenden Auto-Crossfades manuell ein
   (neuen Song laden, Deck pausieren), wird der automatische Übergang
   abgebrochen statt im Hintergrund weiterzulaufen und den Crossfader gegen
   die manuelle Aktion zu ziehen. */
function cancelActiveAutoFade(key) {
  if (!activeAutoFade) return;
  if (activeAutoFade.fromKey !== key && activeAutoFade.toKey !== key) return;
  clearInterval(activeAutoFade.intervalId);
  activeAutoFade = null;
}

function finishAutoCrossfade() {
  if (!activeAutoFade) return;
  var fromKey = activeAutoFade.fromKey;
  var toKey = activeAutoFade.toKey;
  clearInterval(activeAutoFade.intervalId);
  activeAutoFade = null;

  var from = DECKS[fromKey];
  try { from.player.pauseVideo(); } catch (e) {}
  from.song = null;
  from.queue = [];
  from.index = -1;
  from.isPlaying = false;
  updateDeckInfoUI(fromKey);

  maybePreloadNext(toKey);
}

/* Restzeit-Anzeige (Minuten:Sekunden bis Songende) pro Deck, laeuft per
   Intervall alle 500ms unabhaengig von Play/Pause-Events, da die YouTube
   IFrame API keine "timeupdate"-Events feuert. */
function formatRemaining(seconds) {
  if (!isFinite(seconds) || seconds < 0) seconds = 0;
  var m = Math.floor(seconds / 60);
  var s = Math.floor(seconds % 60);
  return '-' + m + ':' + (s < 10 ? '0' : '') + s;
}
function updateRemainingTime() {
  ['A', 'B'].forEach(function (key) {
    var deck = DECKS[key];
    var el = document.getElementById('deck-' + key + '-remaining');
    if (!el) return;
    if (deck.isPlaying && deck.player && deck.player.getDuration) {
      try {
        var dur = deck.player.getDuration();
        var cur = deck.player.getCurrentTime();
        if (dur > 0) {
          el.textContent = formatRemaining(dur - cur);
          maybeStartAutoCrossfade(key, dur - cur);
          return;
        }
      } catch (e) {}
    }
    el.textContent = '';
  });
}
setInterval(updateRemainingTime, 500);

/* Autoplay ist standardmaessig AUS: ein geladener Song startet nicht von
   selbst, damit sich vorher (bei Bedarf) der Pitch einstellen laesst.
   Manuell per ▶️ am Deck starten. Ausnahme: deckStep() beim automatischen
   Weiterspringen (Song zu Ende, oder ⏮/⏭ waehrend das Deck laeuft) — das
   ist kein neues 'Laden' durch den Nutzer, sondern die Fortsetzung eines
   laufenden Sets. */
function playDeckSong(key, song, autoplay) {
  if (autoplay === undefined) autoplay = false;
  cancelActiveAutoFade(key);
  var deck = DECKS[key];
  deck.song = song;
  deck.historyLogged = false;
  updateDeckInfoUI(key);
  var bar = ensureDjPlayer();

  function start() {
    if (deck.player && deck.player.loadVideoById) {
      if (autoplay) {
        deck.player.loadVideoById(song.yt);
      } else {
        deck.player.cueVideoById(song.yt);
      }
      try { deck.player.setPlaybackRate(deck.rate || 1); } catch (e) {}
      // Ein wiederverwendeter Player kann von einem frueheren Vorladen
      // (maybePreloadNext) noch stumm geschaltet sein (setVolume(0)) --
      // ohne diesen Reset bliebe das Deck lautlos, bis der Nutzer zufaellig
      // den Crossfader/die Lautstaerke anfasst und dadurch applyCrossfaderVolumes()
      // erneut auslaest.
      applyCrossfaderVolumes();
    } else {
      deck.player = new YT.Player('deck-' + key + '-mount', {
        width: '100%',
        height: '100%',
        videoId: song.yt,
        playerVars: { rel: 0, playsinline: 1, autoplay: autoplay ? 1 : 0 },
        events: {
          onReady: function (e) {
            try { e.target.setPlaybackRate(deck.rate || 1); } catch (err) {}
            if (autoplay) { e.target.playVideo(); }
            applyCrossfaderVolumes();
          },
          onStateChange: onDeckStateChange(key),
          onError: function () { deckStep(key, 1, true); }
        }
      });
    }
  }
  loadYouTubeAPI(start);
}

/* Song (per Klick, Drag&Drop oder Suche) auf ein bestimmtes Deck laden —
   die restliche sichtbare Liste (Genre/Suche) wird die Warteschlange
   dieses Decks, damit ⏮/⏭ am Deck weiter durch dieselbe Liste läuft.
   Der Abgleich mit der Warteschlange laeuft ueber songId() statt
   Objekt-Referenz: ein per Drag&Drop uebergebener Song kommt aus
   JSON.parse() und ist nie referenzgleich mit dem Original-Objekt aus
   der Liste — mit indexOf() waere das immer -1 und es haette immer den
   ERSTEN Song der Liste geladen, egal welcher gezogen wurde. */
function loadSongToDeck(song, key, contextSongs, autoplay) {
  if (!song || !song.yt) { alert('Für diesen Song wurde noch kein passendes YouTube-Video gefunden.'); return; }
  var deck = DECKS[key];
  var withVideo = (contextSongs || [song]).filter(function (s) { return !!s.yt; });
  deck.queue = withVideo.length ? withVideo : [song];
  var wantedId = songId(song);
  var idx = -1;
  for (var i = 0; i < deck.queue.length; i++) {
    if (songId(deck.queue[i]) === wantedId) { idx = i; break; }
  }
  if (idx === -1) {
    deck.queue = [song].concat(deck.queue);
    idx = 0;
  }
  deck.index = idx;
  playDeckSong(key, deck.queue[deck.index], autoplay);
  nextLoadDeck = (key === 'A') ? 'B' : 'A';
}

function deckStep(key, dir, autoplay) {
  var deck = DECKS[key];
  var newIndex = deck.index + dir;
  if (newIndex < 0 || newIndex >= deck.queue.length) return;
  deck.index = newIndex;
  playDeckSong(key, deck.queue[newIndex], autoplay === undefined ? true : autoplay);
}

function deckTogglePlay(key) {
  var deck = DECKS[key];
  if (!deck.player) return;
  if (deck.isPlaying) { cancelActiveAutoFade(key); deck.player.pauseVideo(); } else { deck.player.playVideo(); }
}

function deckPause(key) {
  var deck = DECKS[key];
  cancelActiveAutoFade(key);
  if (deck.player && deck.player.pauseVideo) { try { deck.player.pauseVideo(); } catch (e) {} }
}

/* Einzelnen Song laden, im Kontext der aktuell sichtbaren Liste (Genre
   oder Suchergebnis) — landet abwechselnd auf Deck A/B. Startet nicht
   automatisch (siehe playDeckSong). */
function playSongInContext(song, contextSongs) {
  loadSongToDeck(song, nextLoadDeck, contextSongs);
}

/* Ganze aktuelle Auswahl (Genre-Playlist) von vorne auf das nächste freie
   Deck laden. Startet nicht automatisch (siehe playDeckSong). */
function playAllCurrent(songs) {
  var withVideo = (songs || []).filter(function (s) { return !!s.yt; });
  if (!withVideo.length) { alert('Für diese Auswahl wurde noch kein passendes YouTube-Video gefunden.'); return; }
  loadSongToDeck(withVideo[0], nextLoadDeck, withVideo);
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

  var playBtn = document.getElementById('song-modal-play');
  if (playBtn) {
    playBtn.disabled = !song.yt;
    playBtn.innerHTML = PLAY_SVG + (song.yt ? ' Song abspielen' : ' Kein Video gefunden');
    playBtn.onclick = song.yt ? function () { playSongInContext(song, lastGridSongs); } : null;
  }

  document.getElementById('song-modal-streaming').innerHTML = streamingLinksHTML(song);

  var link = document.getElementById('song-modal-link');
  if (song.u) { link.href = song.u; link.style.display = ''; } else { link.style.display = 'none'; }

  overlay.classList.add('open');
}

/* Song-Liste: eine Zeile pro Song, Titel zuerst und fett, Interpret
   darunter/daneben klein. Icons (Info/Play/Haken) sind eine normale
   Reihe am rechten Rand statt Overlays auf einem großen Cover. */
function renderSongGrid(container, songs) {
  lastGridSongs = songs;
  container.innerHTML = '';
  songs.forEach(function (song) {
    var tile = document.createElement('button');
    tile.className = 'song-tile' + (isSongSelected(song) ? ' selected' : '');
    tile.type = 'button';
    tile.setAttribute('aria-pressed', isSongSelected(song) ? 'true' : 'false');
    if (song.bpm) tile.dataset.songBpm = song.bpm;

    var media = document.createElement('span');
    media.className = 'song-tile-media';
    var img = document.createElement('img');
    img.src = song.th || song.cv || '';
    img.alt = song.a + ' – ' + song.t;
    img.loading = 'lazy';
    media.appendChild(img);
    tile.appendChild(media);

    var text = document.createElement('span');
    text.className = 'song-tile-text';

    var title = document.createElement('span');
    title.className = 'song-tile-title';
    title.appendChild(document.createTextNode(song.t));
    var meta = [song.y, song.s || song.g].filter(Boolean).join(' · ');
    if (meta) {
      var metaEl = document.createElement('em');
      metaEl.className = 'song-tile-year';
      metaEl.textContent = ' (' + meta + ')';
      title.appendChild(metaEl);
    }
    text.appendChild(title);

    var artist = document.createElement('span');
    artist.className = 'song-tile-artist';
    artist.textContent = song.a;
    text.appendChild(artist);

    tile.appendChild(text);

    /* Nur bei dekadenuebergreifenden Suchergebnissen gesetzt (song._decade) —
       zeigt, aus welcher Dekade der Treffer stammt. */
    if (song._decade) {
      var decadeBadge = document.createElement('span');
      decadeBadge.className = 'song-tile-decade';
      decadeBadge.textContent = song._decade;
      tile.appendChild(decadeBadge);
    }

    var icons = document.createElement('span');
    icons.className = 'song-tile-icons';

    var info = document.createElement('span');
    info.className = 'song-tile-info';
    info.textContent = 'ⓘ';
    info.setAttribute('role', 'button');
    info.setAttribute('tabindex', '0');
    info.setAttribute('aria-label', 'Songdetails: ' + song.a + ' – ' + song.t);
    info.addEventListener('click', function (e) { e.stopPropagation(); openSongModal(song); });
    info.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); openSongModal(song); }
    });
    icons.appendChild(info);

    var play = document.createElement('span');
    play.className = 'song-tile-play' + (song.yt ? '' : ' disabled');
    play.innerHTML = '▶';
    play.setAttribute('role', 'button');
    play.setAttribute('tabindex', song.yt ? '0' : '-1');
    play.setAttribute('aria-label', song.yt ? ('Abspielen: ' + song.a + ' – ' + song.t) : 'Kein Video gefunden');
    if (song.yt) {
      play.addEventListener('click', function (e) { e.stopPropagation(); playSongInContext(song, songs); });
      play.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); playSongInContext(song, songs); }
      });
    }
    icons.appendChild(play);

    var check = document.createElement('span');
    check.className = 'song-tile-check';
    check.textContent = '✓';
    check.setAttribute('aria-hidden', 'true');
    icons.appendChild(check);

    tile.appendChild(icons);

    tile.addEventListener('click', function () {
      toggleSongSelected(song, tile);
      tile.setAttribute('aria-pressed', isSongSelected(song) ? 'true' : 'false');
    });

    if (song.yt) {
      tile.draggable = true;
      tile.addEventListener('dragstart', function (e) {
        try {
          e.dataTransfer.setData('application/json', JSON.stringify(song));
          e.dataTransfer.effectAllowed = 'copy';
        } catch (err) {}
        tile.classList.add('dragging');
      });
      tile.addEventListener('dragend', function () { tile.classList.remove('dragging'); });
    }

    container.appendChild(tile);
  });
  refreshMixableHighlight();
}

/* Genre-Kacheln zeigen dezente Linien-Icons statt Emoji (Emoji wirken auf
   dieser Seite zu verspielt/kindlich). Ein kleines Set an Icon-"Familien"
   deckt alle Genres über alle Dekaden/Ambient-Seiten ab (THEME_KEY_ICON
   ordnet jeden Themen-Key einer Familie zu, THEME_ICON_PATHS liefert die
   SVG-Pfade dazu) — mehrere verwandte Genres teilen sich bewusst dasselbe
   Icon, statt für jede Wortkombination ein eigenes zu brauchen. */
var THEME_ICON_PATHS = {
  guitar: '<path d="M6 4v13.5a2.5 2.5 0 1 0 1.5 2.3V8l9-2v9.5a2.5 2.5 0 1 0 1.5 2.3V4l-12 2z"/>',
  metal: '<path d="M13 2 5 14h5l-1 8 9-12h-5l1-8z"/>',
  punk: '<path d="M4 20 7 6l2 7 3-9 3 9 2-7 3 14"/>',
  cloud: '<path d="M7 18a4 4 0 0 1-1-7.9 5.5 5.5 0 0 1 10.6-2A4.5 4.5 0 0 1 17 18H7z"/>',
  house: '<path d="M4 11 12 4l8 7"/><path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9"/><path d="M10 20v-5h4v5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  heart: '<path d="M12 20s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 5c-2.5 4.65-9.5 9-9.5 9z"/>',
  pulse: '<path d="M2 12h4l2-7 4 14 3-10 2 3h5"/>',
  vinyl: '<circle cx="9" cy="15" r="6"/><circle cx="9" cy="15" r="1.3"/><path d="M15 5v11.5a2.5 2.5 0 1 1-1.5-2.3V7z"/>',
  banjo: '<circle cx="8" cy="16" r="5"/><path d="M8 11V3"/><path d="M8 4l6 2M8 7l6 1.5"/>',
  drum: '<ellipse cx="12" cy="6.5" rx="7" ry="3"/><path d="M5 6.5v9a7 3 0 0 0 14 0v-9"/>',
  palm: '<path d="M4 15c2-4 4-6 8-6s6 2 8 6"/><path d="M12 9v13"/>',
  star: '<path d="M12 3l2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 17l-5.6 3.1 1.4-6.3L3 9.5l6.4-.6z"/>',
  disco: '<path d="M12 2v3"/><circle cx="12" cy="13" r="7"/><path d="M5 13h14M12 6v14M7.5 8.5l9 9M16.5 8.5l-9 9"/>',
  bass: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r="0.8"/>',
  rocket: '<path d="M12 2c3 2.2 5 6 5 10 0 2-1 3.8-2 5l-1-3-2 2-2-2-1 3c-1-1.2-2-3-2-5 0-4 2-7.8 5-10z"/><circle cx="12" cy="10" r="1.4"/><path d="M9 17l-1.5 3.5M15 17l1.5 3.5"/>',
  mic: '<rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v4M8 22h8"/>',
  boombox: '<rect x="3" y="9" width="18" height="10" rx="2"/><circle cx="8" cy="14" r="2.3"/><circle cx="16" cy="14" r="2.3"/><path d="M8 9V6.5A2.5 2.5 0 0 1 10.5 4h3A2.5 2.5 0 0 1 16 6.5V9"/>',
  chip: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5M5.5 5.5l3 3M18.5 5.5l-3 3M5.5 18.5l3-3M18.5 18.5l-3-3"/>',
  tape: '<rect x="3" y="6" width="18" height="12" rx="1.5"/><circle cx="8" cy="12" r="2.3"/><circle cx="16" cy="12" r="2.3"/><path d="M10.5 12h3"/>',
  cocktail: '<path d="M4 4h16L12 12 4 4z"/><path d="M12 12v6"/><path d="M8.5 18h7"/>',
  wave: '<path d="M2 10c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/><path d="M2 16c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/>',
  synth: '<rect x="3" y="6" width="18" height="12" rx="1.2"/><path d="M7 6v7M11 6v7M15 6v7"/>',
  horn: '<path d="M3 10h9l4-3v10l-4-3H3z"/><circle cx="18.5" cy="14" r="2.3"/>',
  folder: '<path d="M3 6.5a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-11z"/>',
  dice: '<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8" r="1.3"/><circle cx="16" cy="8" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="8" cy="16" r="1.3"/><circle cx="16" cy="16" r="1.3"/>',
  radio: '<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V6l8-2v6"/><circle cx="9" cy="15" r="1.8"/><circle cx="15" cy="15" r="1.8"/>',
  headphones: '<path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="3" y="13" width="4" height="7" rx="1.5"/><rect x="17" y="13" width="4" height="7" rx="1.5"/>',
  sunset: '<circle cx="12" cy="12" r="4"/><path d="M2 18h20"/><path d="M5 15l1.5-1.5M19 15l-1.5-1.5M12 6V4M7 8l-1-1M17 8l1-1"/>',
  brain: '<path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 5.5 1.5V4.5A3 3 0 0 0 9 3z"/><path d="M15 3a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-5.5 1.5V4.5A3 3 0 0 1 15 3z"/>',
  runner: '<circle cx="14" cy="4" r="1.8"/><path d="M9 21l2-5 3-2-1-5-4 2-1 4"/><path d="M11 14l4 1 3 4"/>',
  wineGlass: '<path d="M7 3h10l-1 6a4 4 0 0 1-8 0L7 3z"/><path d="M12 13v6M8.5 19h7"/>'
};

/* Hero-Icon oben auf jeder Seite + Icon im Badge daneben nutzen dieselbe
   Pfad-Bibliothek wie die Genre-Kacheln, nur ohne den Kachel-Wrapper. Wird
   auch direkt aus den Seiten-Configs (icon:/badgeText:) aufgerufen, da
   decades.js vor dem Inline-Config-Script geladen wird. */
function rawIconSVG(iconName) {
  var paths = THEME_ICON_PATHS[iconName];
  if (!paths) return '';
  return '<svg viewBox="0 0 24 24" aria-hidden="true">' + paths + '</svg>';
}

var THEME_KEY_ICON = {
  AlternativePostHardcore: 'metal', AlternativePostPunk: 'punk', AlternativeRock: 'guitar',
  Ambient: 'cloud', AmbientDowntempo: 'cloud', AmbientHouse: 'house', AmbientLoFi: 'cloud',
  AsiaPop: 'globe', Ballads: 'heart', BigBeat: 'pulse', BluesSouthernRock: 'guitar',
  Boogie: 'vinyl', Britpop: 'globe', ChillwaveVaporwave: 'cloud', ClassicRock: 'guitar',
  CloudEmoRap: 'cloud', ContemporaryRnB: 'vinyl', Country: 'banjo', CrunkTrapSnap: 'drum',
  Dancehall: 'palm', DancePop: 'star', DeepHouse: 'house', DeepProgHouse: 'house',
  DeepProgTropicalHouse: 'house', Disco: 'disco', DiscoNuDisco: 'disco', Downtempo: 'cloud',
  DrumAndBass: 'drum', DrumNBass: 'drum', DubstepFutureBass: 'bass', DubstepGrime: 'bass',
  Electro: 'pulse', ElectroHouse: 'house', Emo: 'heart', Eurobeat: 'rocket', Eurodance: 'globe',
  Europop: 'globe', Folk: 'banjo', FolkCountry: 'banjo', FolkRock: 'guitar', Freestyle: 'pulse',
  Funk: 'vinyl', FunkSoul: 'vinyl', GangstaConsciousHipHop: 'mic', GangstaGFunk: 'mic',
  GlamRock: 'guitar', Grunge: 'guitar', HardcoreHappy: 'pulse', HardRockMetal: 'metal',
  HiNRG: 'pulse', HipHopBoomBap: 'boombox', House: 'house', HyperpopVaporwave: 'cloud',
  IDM: 'chip', IndiePop: 'guitar', IndieRock: 'guitar', ItaloDisco: 'disco', JungleDnB: 'drum',
  KPop: 'globe', Krautrock: 'globe', LatinReggaeton: 'palm', LoFi: 'tape',
  LoungeBalearic: 'cocktail', MetalcoreHardcore: 'metal', MetalcoreNuMetalHardcore: 'metal',
  NewJackSwing: 'boombox', NewWave: 'wave', NewWavePostPunk: 'wave', NuDisco: 'disco',
  NuMetal: 'metal', NuMetalHardcore: 'metal', Ohne: 'folder', OldSchoolHipHop: 'boombox',
  PopCharts: 'star', PopPunk: 'punk', PopPunkEmo: 'punk', PopRap: 'mic', PopRock: 'star',
  PostPunkGoth: 'punk', ProgressiveHouse: 'house', ProgRock: 'guitar', ProgTechHouse: 'house',
  Punk: 'punk', ReggaeDub: 'palm', ReggaeDubAfro: 'palm', ReggaeDubAfrobeat: 'palm',
  Reggaeton: 'palm', RnBNeoSoul: 'vinyl', RnBSwing: 'vinyl', RockArenaAOR: 'guitar',
  RockClassic: 'guitar', Schlager: 'star', Ska: 'horn', SkaPunk: 'horn', SoftRock: 'cocktail',
  SynthPop: 'synth', SynthPopSynthwave: 'synth', Techno: 'pulse', Trance: 'pulse',
  TranceHardDance: 'pulse', TrapMoombahton: 'drum', TrapPhonk: 'drum', TripHop: 'cloud',
  UKBassGrimeDrill: 'bass', Soul: 'vinyl', NeoSoul: 'vinyl', AcidJazz: 'horn', SmoothJazz: 'cocktail'
};

function themeIconHTML(iconName) {
  var paths = THEME_ICON_PATHS[iconName];
  if (!paths) return '';
  return '<span class="theme-btn-icon"><svg viewBox="0 0 24 24" aria-hidden="true">' + paths + '</svg></span>';
}

/* config: { mountBefore: CSS-Selektor im Ziel-Container, dataUrl, themes: [{key,label}], csvPrefix }
   csvPrefix dient auch als Dekaden-Schlüssel fürs DECADE_REGISTRY (70er, 80er, ...). */
var MIX_KEY = '__mix__';
var MIX_PER_CATEGORY = 5;

function renderPlaylistGenerator(mountRoot, config) {
  var data = null;
  var currentTheme = null;
  var mixSongsCache = null;
  var allSongsFlat = null;
  var searchDebounceHandle = null;
  var searchToken = 0;
  var ownDecadeKey = config.csvPrefix || null;
  var ownDecadeLabel = (DECADE_REGISTRY.filter(function (d) { return d.key === ownDecadeKey; })[0] || {}).label || 'dieser Dekade';

  /* Mix-Button: aus JEDER Kategorie die 5 beliebtesten Songs (Discogs-'have'-
     Zahl als Popularitäts-Proxy, dieselbe Kennzahl wie im README erklärt). */
  function buildMixSongs() {
    if (!data) return [];
    var out = [];
    Object.keys(data).forEach(function (cat) {
      var songs = (data[cat] || []).slice();
      songs.sort(function (a, b) { return (b.hv || 0) - (a.hv || 0); });
      out = out.concat(songs.slice(0, MIX_PER_CATEGORY));
    });
    return out;
  }

  /* Reihenfolge des Mixes wird bei jeder Auswahl neu gemischt (siehe
     selectTheme, das mixSongsCache zuruecksetzt), bleibt aber innerhalb
     dieser einen Auswahl stabil — sonst wuerden Grid, CSV-Export und
     "Playlist auf Deck laden" bei jedem currentSongs()-Aufruf jeweils neu
     (und unterschiedlich) gemischt. */
  function shuffled(list) {
    var out = list.slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = out[i]; out[i] = out[j]; out[j] = tmp;
    }
    return out;
  }

  function currentSongs() {
    if (!data) return [];
    if (currentTheme === MIX_KEY) {
      if (!mixSongsCache) mixSongsCache = shuffled(buildMixSongs());
      return mixSongsCache;
    }
    return currentTheme ? (data[currentTheme] || []) : [];
  }

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
    return fetch(config.dataUrl)
      .then(function (r) { if (!r.ok) throw new Error('no data'); return r.json(); })
      .then(function (j) { data = j; return j; })
      .catch(function () { data = {}; return data; });
  }

  function refresh() {
    document.getElementById('gen-count').textContent = currentSongs().length + ' Songs';
    renderSongGrid(document.getElementById('gen-grid'), currentSongs());
  }

  function clearSearchUI() {
    var input = document.getElementById('gen-search');
    if (input) input.value = '';
    var hintEl = document.getElementById('gen-search-hint');
    if (hintEl) { hintEl.hidden = true; hintEl.innerHTML = ''; }
  }

  function selectTheme(key) {
    currentTheme = key;
    if (key === MIX_KEY) mixSongsCache = null;
    clearSearchUI();
    mountRoot.querySelectorAll('.theme-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.key === key);
    });
    document.getElementById('gen-actions').classList.add('visible');
    loadData().then(refresh);
  }

  function runSearch(query) {
    var hintEl = document.getElementById('gen-search-hint');
    var countEl = document.getElementById('gen-count');
    var gridEl = document.getElementById('gen-grid');
    var myToken = ++searchToken;

    if (!query) {
      hintEl.hidden = true;
      hintEl.innerHTML = '';
      if (config.themes && config.themes.length) { refresh(); } else { showEmptyState(); }
      return;
    }

    mountRoot.querySelectorAll('.theme-btn').forEach(function (b) { b.classList.remove('active'); });
    document.getElementById('gen-actions').classList.add('visible');

    hintEl.hidden = false;
    hintEl.innerHTML = 'Durchsuche alle Dekaden …';
    countEl.textContent = '';
    gridEl.innerHTML = '';

    /* Suche laeuft jetzt immer dekadenuebergreifend: eigene Dekade (falls
       vorhanden) + alle anderen werden parallel durchsucht und als ein
       gemeinsames Ergebnis-Grid angezeigt, jeder Treffer mit Dekaden-Badge. */
    loadData().then(function () {
      if (myToken !== searchToken) return [];
      if (!allSongsFlat) allSongsFlat = flattenSongs(data);
      var ownResults = searchSongs(allSongsFlat, query);
      ownResults.forEach(function (s) { s._decade = ownDecadeKey; });
      return searchAllDecades(query, ownDecadeKey).then(function (otherResults) {
        if (myToken !== searchToken) return;
        var combined = ownResults.concat(otherResults);
        renderSongGrid(gridEl, combined);
        countEl.textContent = combined.length + (combined.length === 1 ? ' Treffer für „' : ' Treffer für „') + query + '“';

        if (!combined.length) {
          hintEl.innerHTML = 'Keine Treffer in irgendeiner Dekade.';
          return;
        }
        if (!otherResults.length) {
          hintEl.hidden = true;
          hintEl.innerHTML = '';
          return;
        }
        var seenDecades = {};
        var otherLabels = [];
        otherResults.forEach(function (s) {
          if (seenDecades[s._decade]) return;
          seenDecades[s._decade] = true;
          var entry = DECADE_REGISTRY.filter(function (d) { return d.key === s._decade; })[0];
          if (entry) otherLabels.push('<a href="' + entry.page + '?q=' + encodeURIComponent(query) + '">' + entry.label + '</a>');
        });
        hintEl.innerHTML = '<span class="hint-icon">' + SEARCH_SVG + '</span> Treffer auch in: ' + otherLabels.join(', ');
      });
    });
  }

  function showEmptyState() {
    document.getElementById('gen-count').textContent = '';
    document.getElementById('gen-actions').classList.remove('visible');
    document.getElementById('gen-grid').innerHTML =
      '<p class="song-hint">Für ' + ownDecadeLabel + ' sind noch keine eigenen Genres hinterlegt. ' +
      'Die Suche oben durchsucht aber schon alle anderen Dekaden — Treffer lassen sich direkt im Player abspielen.</p>';
  }

  var section = document.createElement('section');
  section.className = 'generator';
  section.innerHTML = '' +
    '<h2>🎛️ Playlist-Generator</h2>' +
    '<p class="sub">Songs anklicken für einen grünen Haken, ⓘ zeigt alle Song-Infos. Die Suche dazu steht oben im Player. Auswahl direkt an deinen Streaming-Dienst senden.</p>' +
    '<div class="theme-buttons" id="gen-buttons"></div>' +
    '<div class="send-panel">' +
    '  <span class="send-panel-label">Dein Dienst:</span>' +
    '  <div class="provider-picker" id="gen-provider-picker"></div>' +
    '  <button class="send-btn" id="gen-send" type="button" disabled>Auswahl senden</button>' +
    '  <button class="send-clear" id="gen-send-clear" type="button" hidden>Auswahl leeren</button>' +
    '</div>' +
    '<div class="generator-actions" id="gen-actions">' +
    '  <span class="generator-count" id="gen-count"></span>' +
    '  <button id="gen-play-all" type="button">' + PLUS_SVG + ' Playlist auf Deck laden</button>' +
    '  <button id="gen-copy" type="button">' + COPY_SVG + ' Liste kopieren</button>' +
    '  <a id="gen-download" download>' + DOWNLOAD_SVG + ' Als CSV exportieren</a>' +
    '</div>' +
    '<div class="generator-body">' +
    '  <div class="song-grid" id="gen-grid"></div>' +
    '  <aside class="gen-history">' +
    '    <h3>' + CLOCK_SVG + ' Zuletzt gespielt</h3>' +
    '    <ul id="gen-history-list"><li class="gen-history-empty">Noch nichts gespielt.</li></ul>' +
    '  </aside>' +
    '</div>' +
    '<p class="song-hint">Für den Import in Spotify, Apple Music oder YouTube Music: Liste kopieren oder CSV herunterladen und bei ' +
    '<a href="https://soundiiz.com" target="_blank" rel="noopener">Soundiiz</a> oder ' +
    '<a href="https://www.tunemymusic.com" target="_blank" rel="noopener">TuneMyMusic</a> hochladen.</p>';

  var buttons = section.querySelector('#gen-buttons');
  if (config.themes && config.themes.length) {
    var mixBtn = document.createElement('button');
    mixBtn.className = 'theme-btn theme-btn-mix';
    mixBtn.type = 'button';
    mixBtn.innerHTML = themeIconHTML('dice') + '<span>Mix – Best-of aller Genres</span>';
    mixBtn.title = 'Die ' + MIX_PER_CATEGORY + ' beliebtesten Songs aus jedem Genre';
    mixBtn.dataset.key = MIX_KEY;
    mixBtn.addEventListener('click', function () { selectTheme(MIX_KEY); });
    buttons.appendChild(mixBtn);

    config.themes.forEach(function (t) {
      var btn = document.createElement('button');
      btn.className = 'theme-btn';
      btn.type = 'button';
      btn.innerHTML = themeIconHTML(THEME_KEY_ICON[t.key]) + '<span>' + escapeHtml(t.label) + '</span>';
      btn.dataset.key = t.key;
      btn.addEventListener('click', function () { selectTheme(t.key); });
      buttons.appendChild(btn);
    });
  }

  var target = mountRoot.querySelector(config.mountBefore);
  mountRoot.insertBefore(section, target || null);

  renderProviderPicker(section.querySelector('#gen-provider-picker'));
  section.querySelector('#gen-send').addEventListener('click', sendSelection);
  section.querySelector('#gen-send-clear').addEventListener('click', clearSelection);
  updateSendPanel();

  /* Suchfeld lebt im DJ-Player (fest positioniert, immer erreichbar) —
     ensureDjPlayer() baut es bei Bedarf jetzt schon auf, statt erst beim
     ersten Songstart. */
  ensureDjPlayer();
  var searchInput = document.getElementById('gen-search');
  searchInput.addEventListener('input', function () {
    clearTimeout(searchDebounceHandle);
    var val = searchInput.value.trim();
    searchDebounceHandle = setTimeout(function () { runSearch(val); }, 250);
  });
  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { searchInput.value = ''; clearTimeout(searchDebounceHandle); runSearch(''); }
  });

  section.querySelector('#gen-play-all').addEventListener('click', function () {
    playAllCurrent(currentSongs());
  });
  section.querySelector('#gen-copy').addEventListener('click', function (e) {
    var btn = e.currentTarget;
    navigator.clipboard.writeText(asLines()).then(function () {
      btn.innerHTML = CHECK_SVG + ' Kopiert!';
      setTimeout(function () { btn.innerHTML = COPY_SVG + ' Liste kopieren'; }, 1500);
    });
  });
  section.querySelector('#gen-download').addEventListener('click', function (e) {
    var link = e.currentTarget;
    var blob = new Blob([asCSV()], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    link.href = url;
    link.download = (config.csvPrefix || 'playlist') + '-' + (currentTheme || 'songs') + '.csv';
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  });

  if (config.themes && config.themes.length) {
    selectTheme(config.themes[0].key);
  } else {
    showEmptyState();
  }

  try {
    var incomingQuery = new URLSearchParams(location.search).get('q');
    if (incomingQuery) { searchInput.value = incomingQuery; runSearch(incomingQuery); }
  } catch (e) {}
}
