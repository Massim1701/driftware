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
    '  <button type="button" class="song-modal-play" id="song-modal-play">▶️ Song abspielen</button>' +
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
    if (normalizeText(s.a).indexOf(q) === -1 && normalizeText(s.t).indexOf(q) === -1) return;
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

function checkOtherDecades(query, ownKey) {
  var q = normalizeText(query);
  var others = DECADE_REGISTRY.filter(function (d) { return d.key !== ownKey; });
  return Promise.all(others.map(function (d) {
    return fetchDecadeSongs(d).then(function (songs) {
      if (!songs) return null;
      var found = songs.some(function (s) {
        return normalizeText(s.a).indexOf(q) !== -1 || normalizeText(s.t).indexOf(q) !== -1;
      });
      return found ? d : null;
    });
  })).then(function (results) { return results.filter(Boolean); });
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
  A: { player: null, queue: [], index: -1, isPlaying: false, song: null, rate: 1 },
  B: { player: null, queue: [], index: -1, isPlaying: false, song: null, rate: 1 }
};
var nextLoadDeck = 'A';
var crossfaderValue = 50; /* 0 = nur Deck A hörbar, 100 = nur Deck B */

var MIX_HISTORY_KEY = 'driftware-mix-history';
var MIX_HISTORY_MAX = 300;
var mixHistory = [];
try {
  var storedMixHistory = localStorage.getItem(MIX_HISTORY_KEY);
  if (storedMixHistory) mixHistory = JSON.parse(storedMixHistory) || [];
} catch (e) { mixHistory = []; }

function saveMixHistory() {
  try { localStorage.setItem(MIX_HISTORY_KEY, JSON.stringify(mixHistory.slice(-MIX_HISTORY_MAX))); } catch (e) {}
}

function updateMixCount() {
  var el = document.getElementById('dj-mix-count');
  if (el) el.textContent = mixHistory.length;
}

function logToMixHistory(song, deckKey) {
  if (!song) return;
  mixHistory.push({
    a: song.a, t: song.t, y: song.y, cv: song.cv, th: song.th, u: song.u, yt: song.yt,
    deck: deckKey, ts: Date.now()
  });
  if (mixHistory.length > MIX_HISTORY_MAX) mixHistory = mixHistory.slice(-MIX_HISTORY_MAX);
  saveMixHistory();
  updateMixCount();
  var panel = document.getElementById('dj-mix-panel');
  if (panel && !panel.hidden) renderMixHistoryList();
}

function renderMixHistoryList() {
  var list = document.getElementById('mix-history-list');
  if (!list) return;
  updateMixCount();
  if (!mixHistory.length) {
    list.innerHTML = '<p class="dj-mix-empty">Noch nichts gespielt — leg einen Song auf ein Deck.</p>';
    return;
  }
  var items = mixHistory.slice().reverse();
  list.innerHTML = '';
  items.forEach(function (song) {
    var row = document.createElement('button');
    row.type = 'button';
    row.className = 'dj-mix-item';
    row.innerHTML = '' +
      '<img src="' + (song.th || song.cv || '') + '" alt="" loading="lazy">' +
      '<span class="dj-mix-item-info"><strong>' + escapeHtml(song.a) + '</strong><span>' + escapeHtml(song.t) + '</span></span>';
    row.addEventListener('click', function () { loadSongToDeck(song, nextLoadDeck, mixHistory); });
    list.appendChild(row);
  });
}

var PITCH_RATES = [1.5, 1.25, 1, 0.75, 0.5];
function pitchButtonsHTML(key) {
  return PITCH_RATES.map(function (rate) {
    var pct = Math.round((rate - 1) * 100);
    var label = (pct > 0 ? '+' : '') + pct + '%';
    return '<button type="button" class="dj-pitch-btn' + (rate === 1 ? ' active' : '') + '" data-rate="' + rate + '" aria-label="Deck ' + key + ': Pitch ' + label + '">' + label + '</button>';
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
    '      </div>' +
    '      <div class="dj-vinyl-hint">Song hierher ziehen</div>' +
    '    </div>' +
    '    <div class="dj-pitch">' +
    '      <div class="dj-pitch-display" id="deck-' + key + '-pitch-display">PITCH 0%</div>' +
    '      <div class="dj-pitch-btns" id="deck-' + key + '-pitch-btns">' + pitchButtonsHTML(key) + '</div>' +
    '    </div>' +
    '  </div>' +
    '  <div class="dj-deck-info">' +
    '    <strong id="deck-' + key + '-artist">–</strong>' +
    '    <span id="deck-' + key + '-title">Kein Song geladen</span>' +
    '  </div>' +
    '  <div class="dj-deck-controls">' +
    '    <button type="button" id="deck-' + key + '-prev" aria-label="Deck ' + key + ': voriger Song">⏮</button>' +
    '    <button type="button" id="deck-' + key + '-toggle" aria-label="Deck ' + key + ': abspielen/pause">▶️</button>' +
    '    <button type="button" id="deck-' + key + '-next" aria-label="Deck ' + key + ': nächster Song">⏭</button>' +
    '  </div>' +
    '</div>';
}

function ensureDjPlayer() {
  var existing = document.getElementById('dj-player');
  if (existing) return existing;
  var bar = document.createElement('div');
  bar.className = 'dj-player';
  bar.id = 'dj-player';
  bar.innerHTML = '' +
    '<button type="button" class="dj-close" id="dj-close" aria-label="Player schließen">&times;</button>' +
    '<div class="dj-decks">' +
    deckHTML('A') +
    '<div class="dj-crossfader">' +
    '  <span class="dj-crossfader-label">A</span>' +
    '  <input type="range" id="dj-crossfader" min="0" max="100" value="50" aria-label="Crossfader zwischen Deck A und Deck B">' +
    '  <span class="dj-crossfader-label">B</span>' +
    '</div>' +
    deckHTML('B') +
    '</div>' +
    '<button type="button" class="dj-mix-btn" id="dj-mix-toggle">🎚️ Mein Mix (<span id="dj-mix-count">0</span>)</button>' +
    '<div class="dj-mix-panel" id="dj-mix-panel" hidden>' +
    '  <div class="dj-mix-panel-head">' +
    '    <strong>Mein Mix – zuletzt gespielt</strong>' +
    '    <div class="dj-mix-panel-actions">' +
    '      <button type="button" id="dj-mix-play-all">▶️ Nochmal hören</button>' +
    '      <button type="button" id="dj-mix-clear">🗑️ Leeren</button>' +
    '      <button type="button" id="dj-mix-close">Schließen</button>' +
    '    </div>' +
    '  </div>' +
    '  <div class="dj-mix-list" id="mix-history-list"></div>' +
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
        /* Reingezogene Songs starten nicht automatisch — erst Pitch
           einstellen, dann per ▶️ am Deck starten. */
        loadSongToDeck(song, key, lastGridSongs, false);
      } catch (err) {}
    });
    var pitchBtns = bar.querySelector('#deck-' + key + '-pitch-btns');
    if (pitchBtns) {
      Array.prototype.forEach.call(pitchBtns.querySelectorAll('.dj-pitch-btn'), function (btn) {
        btn.addEventListener('click', function () {
          setDeckPitch(key, parseFloat(btn.getAttribute('data-rate')));
        });
      });
    }
  });

  bar.querySelector('#dj-close').addEventListener('click', function () {
    ['A', 'B'].forEach(function (key) { deckPause(key); });
    bar.classList.remove('open');
  });

  var fader = bar.querySelector('#dj-crossfader');
  fader.addEventListener('input', function () {
    crossfaderValue = parseInt(fader.value, 10);
    applyCrossfaderVolumes();
  });

  bar.querySelector('#dj-mix-toggle').addEventListener('click', function () {
    var panel = document.getElementById('dj-mix-panel');
    panel.hidden = !panel.hidden;
    if (!panel.hidden) renderMixHistoryList();
  });
  bar.querySelector('#dj-mix-close').addEventListener('click', function () {
    document.getElementById('dj-mix-panel').hidden = true;
  });
  bar.querySelector('#dj-mix-clear').addEventListener('click', function () {
    if (!confirm('Mix-Verlauf wirklich leeren?')) return;
    mixHistory = [];
    saveMixHistory();
    renderMixHistoryList();
  });
  bar.querySelector('#dj-mix-play-all').addEventListener('click', function () {
    var withVideo = mixHistory.filter(function (s) { return !!s.yt; });
    if (!withVideo.length) return;
    loadSongToDeck(withVideo[withVideo.length - 1], nextLoadDeck, withVideo.slice().reverse());
  });

  updateMixCount();
  return bar;
}

function applyCrossfaderVolumes() {
  var volA = Math.round(100 - crossfaderValue);
  var volB = Math.round(crossfaderValue);
  if (DECKS.A.player && DECKS.A.player.setVolume) { try { DECKS.A.player.setVolume(volA); } catch (e) {} }
  if (DECKS.B.player && DECKS.B.player.setVolume) { try { DECKS.B.player.setVolume(volB); } catch (e) {} }
}

/* Pitch/Tempo eines Decks setzen — wirkt ueber die YouTube IFrame API
   (setPlaybackRate), die nur feste Stufen kennt (0.5/0.75/1/1.25/1.5x).
   Eine feine Vinyl-Pitch-Regelung wie bei echten Plattenspielern ist
   darueber technisch nicht moeglich, daher rechteckige Stufen-Buttons
   statt eines stufenlosen Reglers. */
function setDeckPitch(key, rate) {
  var deck = DECKS[key];
  deck.rate = rate;
  if (deck.player && deck.player.setPlaybackRate) {
    try { deck.player.setPlaybackRate(rate); } catch (e) {}
  }
  var display = document.getElementById('deck-' + key + '-pitch-display');
  if (display) {
    var pct = Math.round((rate - 1) * 100);
    display.textContent = 'PITCH ' + (pct > 0 ? '+' : '') + pct + '%';
  }
  var btnWrap = document.getElementById('deck-' + key + '-pitch-btns');
  if (btnWrap) {
    Array.prototype.forEach.call(btnWrap.querySelectorAll('.dj-pitch-btn'), function (b) {
      b.classList.toggle('active', parseFloat(b.getAttribute('data-rate')) === rate);
    });
  }
}

function updateDeckInfoUI(key) {
  var deck = DECKS[key];
  var artistEl = document.getElementById('deck-' + key + '-artist');
  var titleEl = document.getElementById('deck-' + key + '-title');
  if (artistEl) artistEl.textContent = deck.song ? deck.song.a : '–';
  if (titleEl) titleEl.textContent = deck.song ? deck.song.t : 'Kein Song geladen';
  var discEl = document.getElementById('deck-' + key + '-disc');
  if (discEl) discEl.classList.toggle('spinning', !!deck.isPlaying);
  var deckEl = document.getElementById('deck-' + key);
  if (deckEl) deckEl.classList.toggle('dj-deck-loaded', !!deck.song);
  var toggleBtn = document.getElementById('deck-' + key + '-toggle');
  if (toggleBtn) toggleBtn.textContent = deck.isPlaying ? '⏸' : '▶️';
}

function onDeckStateChange(key) {
  return function (e) {
    var deck = DECKS[key];
    if (e.data === YT.PlayerState.PLAYING) {
      deck.isPlaying = true;
    } else if (e.data === YT.PlayerState.PAUSED) {
      deck.isPlaying = false;
    } else if (e.data === YT.PlayerState.ENDED) {
      deckStep(key, 1);
    }
    updateDeckInfoUI(key);
  };
}

function playDeckSong(key, song, autoplay) {
  if (autoplay === undefined) autoplay = true;
  var deck = DECKS[key];
  deck.song = song;
  updateDeckInfoUI(key);
  logToMixHistory(song, key);
  var bar = ensureDjPlayer();
  bar.classList.add('open');

  function start() {
    if (deck.player && deck.player.loadVideoById) {
      if (autoplay) {
        deck.player.loadVideoById(song.yt);
      } else {
        deck.player.cueVideoById(song.yt);
      }
      try { deck.player.setPlaybackRate(deck.rate || 1); } catch (e) {}
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
          onError: function () { deckStep(key, 1); }
        }
      });
    }
  }
  loadYouTubeAPI(start);
}

/* Song (per Klick, Drag&Drop oder Mix-Verlauf) auf ein bestimmtes Deck
   laden — die restliche sichtbare Liste (Genre/Suche) wird die Warteschlange
   dieses Decks, damit ⏮/⏭ am Deck weiter durch dieselbe Liste läuft. */
function loadSongToDeck(song, key, contextSongs, autoplay) {
  if (!song || !song.yt) { alert('Für diesen Song wurde noch kein passendes YouTube-Video gefunden.'); return; }
  var deck = DECKS[key];
  var withVideo = (contextSongs || [song]).filter(function (s) { return !!s.yt; });
  deck.queue = withVideo.length ? withVideo : [song];
  var idx = deck.queue.indexOf(song);
  deck.index = idx === -1 ? 0 : idx;
  playDeckSong(key, deck.queue[deck.index], autoplay);
  nextLoadDeck = (key === 'A') ? 'B' : 'A';
}

function deckStep(key, dir) {
  var deck = DECKS[key];
  var newIndex = deck.index + dir;
  if (newIndex < 0 || newIndex >= deck.queue.length) return;
  deck.index = newIndex;
  playDeckSong(key, deck.queue[newIndex]);
}

function deckTogglePlay(key) {
  var deck = DECKS[key];
  if (!deck.player) return;
  if (deck.isPlaying) { deck.player.pauseVideo(); } else { deck.player.playVideo(); }
}

function deckPause(key) {
  var deck = DECKS[key];
  if (deck.player && deck.player.pauseVideo) { try { deck.player.pauseVideo(); } catch (e) {} }
}

/* Einzelnen Song abspielen, im Kontext der aktuell sichtbaren Liste (Genre
   oder Suchergebnis) — landet abwechselnd auf Deck A/B, damit sich der
   nächste Klick sauber überblenden lässt. */
function playSongInContext(song, contextSongs) {
  loadSongToDeck(song, nextLoadDeck, contextSongs);
}

/* Ganze aktuelle Auswahl (Genre-Playlist) von vorne auf das nächste freie
   Deck laden. */
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
    playBtn.textContent = song.yt ? '▶️ Song abspielen' : '▶️ Kein Video gefunden';
    playBtn.onclick = song.yt ? function () { playSongInContext(song, lastGridSongs); } : null;
  }

  document.getElementById('song-modal-streaming').innerHTML = streamingLinksHTML(song);

  var link = document.getElementById('song-modal-link');
  if (song.u) { link.href = song.u; link.style.display = ''; } else { link.style.display = 'none'; }

  overlay.classList.add('open');
}

function renderSongGrid(container, songs) {
  lastGridSongs = songs;
  container.innerHTML = '';
  songs.forEach(function (song) {
    var tile = document.createElement('button');
    tile.className = 'song-tile' + (isSongSelected(song) ? ' selected' : '');
    tile.type = 'button';
    tile.setAttribute('aria-pressed', isSongSelected(song) ? 'true' : 'false');

    var media = document.createElement('span');
    media.className = 'song-tile-media';

    var check = document.createElement('span');
    check.className = 'song-tile-check';
    check.textContent = '✓';
    check.setAttribute('aria-hidden', 'true');
    media.appendChild(check);

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
    media.appendChild(info);

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
    media.appendChild(play);

    var img = document.createElement('img');
    img.src = song.th || song.cv || '';
    img.alt = song.a + ' – ' + song.t;
    img.loading = 'lazy';
    media.appendChild(img);
    tile.appendChild(media);

    var artist = document.createElement('span');
    artist.className = 'song-tile-artist';
    artist.textContent = song.a;
    tile.appendChild(artist);

    var title = document.createElement('span');
    title.className = 'song-tile-title';
    title.textContent = song.t;
    tile.appendChild(title);

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
}

/* config: { mountBefore: CSS-Selektor im Ziel-Container, dataUrl, themes: [{key,label}], csvPrefix }
   csvPrefix dient auch als Dekaden-Schlüssel fürs DECADE_REGISTRY (70er, 80er, ...). */
var MIX_KEY = '__mix__';
var MIX_PER_CATEGORY = 5;

function renderPlaylistGenerator(mountRoot, config) {
  var data = null;
  var currentTheme = null;
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

  function currentSongs() {
    if (!data) return [];
    if (currentTheme === MIX_KEY) return buildMixSongs();
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
    return fetch(config.dataUrl).then(function (r) { return r.json(); }).then(function (j) { data = j; return j; });
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
      refresh();
      return;
    }

    mountRoot.querySelectorAll('.theme-btn').forEach(function (b) { b.classList.remove('active'); });
    document.getElementById('gen-actions').classList.add('visible');

    loadData().then(function () {
      if (myToken !== searchToken) return;
      if (!allSongsFlat) allSongsFlat = flattenSongs(data);
      var results = searchSongs(allSongsFlat, query);
      renderSongGrid(gridEl, results);
      countEl.textContent = results.length + (results.length === 1 ? ' Treffer für „' : ' Treffer für „') + query + '“';

      if (results.length > 0) {
        hintEl.hidden = true;
        hintEl.innerHTML = '';
        return;
      }

      hintEl.hidden = false;
      hintEl.innerHTML = 'Suche in anderen Dekaden …';
      checkOtherDecades(query, ownDecadeKey).then(function (hits) {
        if (myToken !== searchToken) return;
        if (!hits.length) {
          hintEl.innerHTML = 'Keine Treffer – auch nicht in anderen Dekaden.';
          return;
        }
        hintEl.innerHTML = '💡 Nicht in ' + ownDecadeLabel + ', aber gefunden in: ' +
          hits.map(function (d) {
            return '<a href="' + d.page + '?q=' + encodeURIComponent(query) + '">' + d.label + '</a>';
          }).join(', ');
      });
    });
  }

  var section = document.createElement('section');
  section.className = 'generator';
  section.innerHTML = '' +
    '<h2>🎛️ Playlist-Generator</h2>' +
    '<p class="sub">Songs anklicken für einen grünen Haken, ⓘ zeigt alle Song-Infos, 🔍 durchsucht ' + ownDecadeLabel + '. Auswahl direkt an deinen Streaming-Dienst senden.</p>' +
    '<div class="search-box">' +
    '  <input type="search" id="gen-search" class="search-input" placeholder="🔍 Song oder Künstler in ' + ownDecadeLabel + ' suchen …" autocomplete="off">' +
    '</div>' +
    '<p class="search-hint" id="gen-search-hint" hidden></p>' +
    '<div class="theme-buttons" id="gen-buttons"></div>' +
    '<div class="send-panel">' +
    '  <span class="send-panel-label">Dein Dienst:</span>' +
    '  <div class="provider-picker" id="gen-provider-picker"></div>' +
    '  <button class="send-btn" id="gen-send" type="button" disabled>Auswahl senden</button>' +
    '  <button class="send-clear" id="gen-send-clear" type="button" hidden>Auswahl leeren</button>' +
    '</div>' +
    '<div class="generator-actions" id="gen-actions">' +
    '  <span class="generator-count" id="gen-count"></span>' +
    '  <button id="gen-play-all" type="button">▶️ Playlist abspielen</button>' +
    '  <button id="gen-copy" type="button">📋 Liste kopieren</button>' +
    '  <a id="gen-download" download>⬇️ Als CSV exportieren</a>' +
    '</div>' +
    '<div class="song-grid" id="gen-grid"></div>' +
    '<p class="song-hint">Für den Import in Spotify, Apple Music oder YouTube Music: Liste kopieren oder CSV herunterladen und bei ' +
    '<a href="https://soundiiz.com" target="_blank" rel="noopener">Soundiiz</a> oder ' +
    '<a href="https://www.tunemymusic.com" target="_blank" rel="noopener">TuneMyMusic</a> hochladen.</p>';

  var buttons = section.querySelector('#gen-buttons');
  var mixBtn = document.createElement('button');
  mixBtn.className = 'theme-btn theme-btn-mix';
  mixBtn.type = 'button';
  mixBtn.textContent = '🎲 Mix – Best-of aller Genres';
  mixBtn.title = 'Die ' + MIX_PER_CATEGORY + ' beliebtesten Songs aus jedem Genre';
  mixBtn.dataset.key = MIX_KEY;
  mixBtn.addEventListener('click', function () { selectTheme(MIX_KEY); });
  buttons.appendChild(mixBtn);

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

  renderProviderPicker(section.querySelector('#gen-provider-picker'));
  section.querySelector('#gen-send').addEventListener('click', sendSelection);
  section.querySelector('#gen-send-clear').addEventListener('click', clearSelection);
  updateSendPanel();

  var searchInput = section.querySelector('#gen-search');
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

  try {
    var incomingQuery = new URLSearchParams(location.search).get('q');
    if (incomingQuery) { searchInput.value = incomingQuery; runSearch(incomingQuery); }
  } catch (e) {}
}
