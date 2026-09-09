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
var EXTERNAL_LINK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>';
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
var SHUFFLE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h3.5c2 0 3 .8 4 2.3M3 18h3.5c2 0 3-.8 4-2.3M14 6h4M14 18h4"/><path d="M17 3.5 20.5 6 17 8.5M17 15.5l3.5 2.5-3.5 2.5"/></svg>';
var LINK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 15 15 9"/><path d="M8 17H6a4 4 0 0 1 0-8h2"/><path d="M16 7h2a4 4 0 0 1 0 8h-2"/></svg>';

/* Driftware-Logo: Vinyl-Ring + Label-Punkt + "Drift"-Schwung, feste
   Marken-Farben (nicht die pro-Dekade --accent-Variable, bewusst flache
   Farben statt Gradient-<defs> — die ID waere bei mehreren gleichzeitig
   eingefuegten Kopien (Deck A + B) nicht eindeutig). Platzhalter im Deck,
   wenn fuer einen Song kein YouTube-Video existiert (siehe playDeckSong). */
var DRIFTWARE_LOGO_SVG = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
  '<circle cx="12" cy="12" r="9.5" fill="none" stroke="#ff2fb3" stroke-width="1.4"/>' +
  '<circle cx="12" cy="12" r="3" fill="#29e2ff"/>' +
  '<path d="M3.5 15.5c3.5-5 13.5-5 17 0" fill="none" stroke="#ff2fb3" stroke-width="1.4" stroke-linecap="round"/>' +
  '</svg>';

/* Alle Dekaden-/Ambient-Seiten (index.html), die denselben Seitenaufbau
   teilen (#decade-root + renderDecadeIndex/renderPlaylistGenerator) --
   Grundlage sowohl fuer den Wechsel-Umschalter unten als auch fuer die
   AJAX-Navigation (siehe navigateToPage), damit ein Wechsel den laufenden
   Player nicht unterbricht. */
var SITE_PAGES = [
  { slug: '70er', folder: '70er-music', label: '70er', group: 'Dekaden', color: '#c9762f' },
  { slug: '80er', folder: '80er-music', label: '80er', group: 'Dekaden', color: '#ff2fb3' },
  { slug: '90er', folder: '90er-music', label: '90er', group: 'Dekaden', color: '#29e2ff' },
  { slug: '2000er', folder: '2000er-music', label: '2000er', group: 'Dekaden', color: '#4a90d9' },
  { slug: '2010er', folder: '2010er-music', label: '2010er', group: 'Dekaden', color: '#8b5cf6' },
  { slug: '2020er', folder: '2020er-music', label: '2020er', group: 'Dekaden', color: '#8bc34a' },
  { slug: 'afterwork', folder: 'afterwork-music', label: 'Afterwork', group: 'Stimmungen', color: '#d98c1f' },
  { slug: 'chillhouse', folder: 'chillhouse-music', label: 'Chill House', group: 'Stimmungen', color: '#1c8f6f' },
  { slug: 'christmas', folder: 'christmas-music', label: 'Christmas', group: 'Stimmungen', color: '#e0453f' },
  { slug: 'dinnerparty', folder: 'dinnerparty-music', label: 'Dinner Party', group: 'Stimmungen', color: '#d9527c' },
  { slug: 'focuswork', folder: 'focuswork-music', label: 'Focus & Work', group: 'Stimmungen', color: '#4ecdc4' },
  { slug: 'latenight', folder: 'latenight-music', label: 'Late Night', group: 'Stimmungen', color: '#6a5acd' },
  { slug: 'morning', folder: 'morning-music', label: 'Morning', group: 'Stimmungen', color: '#f2b705' },
  { slug: 'roadtrip', folder: 'roadtrip-music', label: 'Road Trip', group: 'Stimmungen', color: '#e8712f' },
  { slug: 'workout', folder: 'workout-music', label: 'Workout & Running', group: 'Stimmungen', color: '#e2472d' }
];

function currentPageFolder() {
  var m = location.pathname.match(/\/([a-z0-9]+-music)\/?/i);
  return m ? m[1] : null;
}

/* Schnellzugriff auf andere Dekaden/Stimmungen als zwei durchgehende,
   horizontal scrollbare Zeilen (Dekaden, Stimmungen darunter) -- fest
   eingebaut im Playlist-Generator zwischen Suchfeld und Genre-Buttons.
   Ersetzt das fruehere separate "Wechseln"-Dropdown im Utility-Block
   (entfernt, da redundant). Wechselt per AJAX (siehe navigateToPage),
   der Player laeuft beim Klick ungestoert weiter. */
function switchRowHTML() {
  var current = currentPageFolder();
  function dropdownFor(group, placeholder, idSuffix) {
    var items = SITE_PAGES.filter(function (p) { return p.group === group; });
    var activeItem = items.filter(function (p) { return p.folder === current; })[0];
    var selectId = 'gen-switch-select-' + idSuffix;
    var options = (activeItem ? '' : '<option value="" disabled selected hidden>' + escapeHtml(placeholder) + '</option>') +
      items.map(function (p) {
        var active = p.folder === current;
        return '<option value="' + p.folder + '" data-color="' + p.color + '"' + (active ? ' selected' : '') + '>' + escapeHtml(p.label) + '</option>';
      }).join('');
    /* <label for="..."> statt <div>: ein Klick IRGENDWO im Pill (auch auf
       der Gruppen-Beschriftung/Polsterung, nicht nur exakt auf dem
       <select>) oeffnet damit nativ das Dropdown -- Browser leiten Klicks
       auf ein zugeordnetes <label> an sein Formularelement weiter. */
    return '' +
      '<label class="gen-switch-dropdown" for="' + selectId + '" style="--item-color:' + (activeItem ? activeItem.color : 'var(--border)') + '">' +
      '  <span class="gen-switch-dd-label">' + escapeHtml(group) + '</span>' +
      '  <select id="' + selectId + '" class="gen-switch-select" aria-label="' + escapeHtml(group) + ' wechseln">' + options + '</select>' +
      '</label>';
  }
  return '' +
    '<div class="gen-switch-rows" id="gen-switch-row">' +
    dropdownFor('Dekaden', 'Dekade wechseln', 'dekaden') +
    dropdownFor('Stimmungen', 'Stimmung wechseln', 'stimmungen') +
    '</div>';
}

function wireSwitchRow(root) {
  var row = root.querySelector('#gen-switch-row');
  if (!row) return;
  row.querySelectorAll('.gen-switch-select').forEach(function (select) {
    select.addEventListener('change', function () {
      if (!select.value) return;
      var opt = select.options[select.selectedIndex];
      var color = opt && opt.dataset.color;
      var wrap = select.closest('.gen-switch-dropdown');
      if (color && wrap) wrap.style.setProperty('--item-color', color);
      navigateToPage(select.value);
    });
  });
}

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

function insertUtilityBlock(mailHref) {
  document.body.insertAdjacentHTML('afterbegin', utilityBlockHTML(mailHref));
}

/* ---------- AJAX-Navigation zwischen Dekaden-/Ambient-Seiten ----------
   Jede dieser Seiten ist technisch ein eigenes, komplett getrenntes
   HTML-Dokument -- ein normaler Link waere immer ein echter Seiten-Reload
   und wuerde den laufenden YouTube-Player/DECKS-Zustand zerstoeren (siehe
   continuity.js fuer den bisherigen Notbehelf: automatisches Weiterladen
   mit kurzer Luecke). Stattdessen wird die Zielseite per fetch() geholt,
   NUR der Seiteninhalt (#decade-root + Utility-Block) ausgetauscht und
   ihr mitgelieferter Inline-Bootstrap-Code (der dieselben renderDecadeIndex/
   renderPlaylistGenerator-Aufrufe enthaelt wie ein echter Page-Load) erneut
   ausgefuehrt. #dj-player, die laufenden YouTube-Iframes, DECKS und
   playHistory werden dabei nicht angefasst -- die Wiedergabe laeuft nahtlos
   weiter. Nur ueber SITE_PAGES erreichbare Zielseiten (alle mit demselben
   #decade-root-Aufbau) werden so behandelt; alles andere (z.B. /dekaden/,
   externe Links) bleibt ein normaler Linkaufruf. */
var ajaxNavInFlight = false;

function pageForFolder(folder) {
  for (var i = 0; i < SITE_PAGES.length; i++) {
    if (SITE_PAGES[i].folder === folder) return SITE_PAGES[i];
  }
  return null;
}

function swapDecadePage(html) {
  var doc;
  try { doc = new DOMParser().parseFromString(html, 'text/html'); } catch (e) { return false; }
  var scripts = doc.querySelectorAll('body script:not([src])');
  var bootScript = scripts.length ? scripts[scripts.length - 1].textContent : null;
  var root = document.getElementById('decade-root');
  if (!bootScript || !root) return false;

  /* Alte Song-Fortsetzungs-Notiz (continuity.js) fuer den bisherigen
     Seitenaufbau ist hier nicht relevant -- der Player laeuft ja gerade
     nahtlos weiter, kein echter Reload passiert. */
  var oldUtility = document.querySelector('.utility-block');
  if (oldUtility) oldUtility.remove();
  root.innerHTML = '';

  /* Als <script>-Element einfuegen statt eval() -- fuehrt den Code
     synchron im globalen Scope aus (renderDecadeIndex/renderPlaylistGenerator
     etc. sind bereits global aus decades.js bekannt) und wird danach
     wieder entfernt. */
  var s = document.createElement('script');
  s.textContent = bootScript;
  document.body.appendChild(s);
  s.remove();

  if (typeof window.reinitMidiPanel === 'function') window.reinitMidiPanel();
  if (typeof window.reinitManualAdd === 'function') window.reinitManualAdd();
  if (typeof window.reinitNextUp === 'function') window.reinitNextUp();

  return true;
}

function navigateToPage(folder, pushHistory) {
  var page = pageForFolder(folder);
  if (!page) return;
  if (ajaxNavInFlight) return;
  if (folder === currentPageFolder() && pushHistory !== false) return;

  ajaxNavInFlight = true;
  var url = '/' + folder + '/index.html';

  /* WICHTIG: erst die URL umstellen (pushState), DANN den Bootstrap-Code
     der Zielseite ausfuehren -- der laedt seine eigene songs.json ueber
     einen relativen Pfad ("songs.json?v=..."), der sich sonst noch gegen
     die ALTE Seite aufloesen wuerde. */
  fetch(url)
    .then(function (r) { if (!r.ok) throw new Error('nav-fetch-failed'); return r.text(); })
    .then(function (html) {
      if (pushHistory !== false) history.pushState({ driftwareNav: true, folder: folder }, '', url);
      var ok = swapDecadePage(html);
      if (!ok) throw new Error('nav-swap-failed');
    })
    .catch(function () {
      /* Fallback: echter Seitenwechsel, falls AJAX aus irgendeinem Grund
         fehlschlaegt (Netzwerk, unerwartetes Seitenformat, ...). */
      location.href = url;
    })
    .then(function () { ajaxNavInFlight = false; })
    .catch(function () { ajaxNavInFlight = false; });
}

window.addEventListener('popstate', function () {
  var folder = currentPageFolder();
  if (folder && pageForFolder(folder)) navigateToPage(folder, false);
});

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

  insertUtilityBlock('privacy.html#kontakt');

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
  insertUtilityBlock('privacy.html#kontakt');
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
  insertUtilityBlock('#kontakt');
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
    '  <button type="button" class="song-modal-edit-genre-toggle" id="song-modal-edit-genre-toggle" hidden>Genre bearbeiten</button>' +
    '  <div class="song-modal-genre-edit" id="song-modal-genre-edit" hidden>' +
    '    <select class="song-modal-genre-select" id="song-modal-genre-select"></select>' +
    '    <button type="button" class="song-modal-genre-save" id="song-modal-genre-save">Speichern</button>' +
    '    <p class="song-modal-genre-status" id="song-modal-genre-status"></p>' +
    '  </div>' +
    '  <div class="streaming-row" id="song-modal-streaming"></div>' +
    '  <a class="song-modal-link" id="song-modal-link" target="_blank" rel="noopener">Auf Discogs ansehen →</a>' +
    '  <a class="song-modal-link" id="song-modal-vk-link" target="_blank" rel="noopener">Auf VK ansehen →</a>' +
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
    icon: '<path d="M9.8 7.8v8.4l7.2-4.2z" fill="#fff"/>',
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

/* Fuer den "Genre bearbeiten"-Button im Song-Modal (siehe openSongModal):
   die Genre-Liste der aktuell offenen Dekaden-Seite (aus dem themes-Array
   in renderPlaylistGenerator), damit das Dropdown dieselben Buckets zeigt
   wie die Tabs oben. Wird pro Song beim Rendern der Songliste gesetzt
   (song._bucket, siehe refresh()) -- nur dann ist bekannt, in welchem
   Bucket ein Song aktuell steckt, und der Button erscheint nur fuer
   Songs im Bucket "Ohne". */
var activeDecadeThemes = null;

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

/* Fuer "Dekade verbinden" (siehe renderPlaylistGenerator) wird -- anders als
   bei der Suche oben, die nur eine flache Liste braucht -- das RAW-JSON pro
   Kategorie gebraucht (fuer buildMixSongsFrom und den Genre-Abgleich).
   Eigener Cache, unabhaengig von otherDecadeDataCache, gleicher Aufbau wie
   das `data` der eigenen Seite (loadData() in renderPlaylistGenerator). */
var rawDecadeDataCache = {};
function fetchRawDecadeData(key) {
  if (Object.prototype.hasOwnProperty.call(rawDecadeDataCache, key)) {
    return Promise.resolve(rawDecadeDataCache[key]);
  }
  var entry = DECADE_REGISTRY.filter(function (d) { return d.key === key; })[0];
  if (!entry) return Promise.resolve(null);
  return fetch(entry.dataUrl)
    .then(function (r) { if (!r.ok) throw new Error('no data'); return r.json(); })
    .then(function (json) { rawDecadeDataCache[key] = json; return json; })
    .catch(function () { rawDecadeDataCache[key] = null; return null; });
}

/* Nachbar-Dekaden fuer "Dekade verbinden": nur die beiden direkt angrenzenden
   Eintraege in DECADE_REGISTRY (Reihenfolge = chronologische Kette 70er..2020er),
   NIE beliebige Kombinationen -- genau das haelt den Mix stilistisch nah
   beieinander (70+80, 80+90, 90+2000, 2000+2010, 2010+2020). */
function neighborDecadesOf(ownKey) {
  var idx = -1;
  for (var i = 0; i < DECADE_REGISTRY.length; i++) {
    if (DECADE_REGISTRY[i].key === ownKey) { idx = i; break; }
  }
  if (idx === -1) return [];
  var out = [];
  if (idx > 0) out.push(DECADE_REGISTRY[idx - 1]);
  if (idx < DECADE_REGISTRY.length - 1) out.push(DECADE_REGISTRY[idx + 1]);
  return out;
}

/* Aus JEDER Kategorie eines beliebigen Song-Datensatzes (eigene Dekade ODER
   verlinkte Nachbar-Dekade) die MIX_PER_CATEGORY beliebtesten Songs -- Basis
   sowohl fuer den normalen "Mix"-Button (siehe buildMixSongs in
   renderPlaylistGenerator) als auch fuer den Nachbar-Anteil beim Verbinden. */
function buildMixSongsFrom(dataObj) {
  if (!dataObj) return [];
  var out = [];
  var seen = {};
  Object.keys(dataObj).forEach(function (cat) {
    var songs = (dataObj[cat] || []).slice();
    songs.sort(function (a, b) { return (b.hv || 0) - (a.hv || 0); });
    songs.slice(0, MIX_PER_CATEGORY).forEach(function (s) {
      var id = songId(s);
      if (seen[id]) return;
      seen[id] = true;
      out.push(s);
    });
  });
  return out;
}

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

/* Fehler-Log fuers Debugging von "stuertzt ab/haengt sich auf"-Meldungen,
   die sich vor Ort nicht reproduzieren lassen: haelt die letzten 20
   uncaught Errors/Promise-Rejections in localStorage fest (Zeit, Nachricht,
   Datei/Zeile, Stack), damit sie nach einem realen Vorfall im Nachhinein
   ausgelesen werden koennen (F12-Konsole -> localStorage.getItem(...)),
   statt dass der Fehler spurlos im Nichts verschwindet. Rein additiv,
   greift nicht in den eigentlichen Fehler ein (kein preventDefault) und
   darf selbst unter keinen Umstaenden etwas werfen. */
(function () {
  var LOG_KEY = 'driftware-error-log-v1';
  var MAX_ENTRIES = 20;
  function pushEntry(entry) {
    try {
      var raw = localStorage.getItem(LOG_KEY);
      var log = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(log)) log = [];
      log.push(entry);
      if (log.length > MAX_ENTRIES) log = log.slice(log.length - MAX_ENTRIES);
      localStorage.setItem(LOG_KEY, JSON.stringify(log));
    } catch (e) {}
  }
  window.addEventListener('error', function (e) {
    try {
      pushEntry({
        ts: new Date().toISOString(), type: 'error',
        msg: e.message, source: e.filename, line: e.lineno, col: e.colno,
        stack: e.error && e.error.stack ? String(e.error.stack).slice(0, 800) : null,
        page: location.pathname
      });
    } catch (err) {}
  });
  window.addEventListener('unhandledrejection', function (e) {
    try {
      var reason = e.reason;
      pushEntry({
        ts: new Date().toISOString(), type: 'unhandledrejection',
        msg: reason && reason.message ? reason.message : String(reason),
        stack: reason && reason.stack ? String(reason.stack).slice(0, 800) : null,
        page: location.pathname
      });
    } catch (err) {}
  });
})();
var nextLoadDeck = 'A';
var crossfaderValue = 50; /* 0 = nur Deck A hörbar, 100 = nur Deck B */
var masterVolume = 80; /* Gesamtlautstärke, 0-100, skaliert beide Decks zusaetzlich zum Crossfader */
var autoFadeEnabled = true; /* Autofade-Button: automatisches Überblenden an/aus, siehe maybeStartAutoCrossfade */
var PITCH_STEPS = [-50, -25, 0, 25, 50]; /* die 5 festen Stufen der YouTube-API, siehe setDeckPitch */
var pitchGlideTimers = {}; /* laufende glideDeckPitch-Animationen pro Deck, siehe dort */
var bpmSyncActive = false; /* true waehrend der Sync-Button-Ablauf (meetInMiddleThenSettle) laeuft */
var bpmSyncKeys = []; /* die 1-2 Decks, die dabei gerade bewegt werden -- fuer Abbruch bei manuellem Eingriff */

/* Viele YouTube-Videos haben ein paar Sekunden stillen/leisen Vorspann
   (Label-Intro, Fade-in) oder einen ausklingenden/stillen Nachspann
   (Fade-out) -- die YouTube-IFrame-API liefert keine Audio-Analyse, eine
   automatische Erkennung ist technisch nicht moeglich. Deshalb: ein
   globaler Standard-Sicherheitsabstand gilt fuer JEDEN Song (siehe
   introSkipFor/outroSkipFor), zusaetzlich kann fuer hartnaeckige
   Einzelfaelle ein Override hinterlegt werden -- bewusst NICHT in
   songs.json (Kataloge bleiben unangetastet), sondern in einer eigenen
   kleinen Datei, siehe loadSongTimingOverrides(). */
var DEFAULT_INTRO_SKIP_SECONDS = 2;
var DEFAULT_OUTRO_SKIP_SECONDS = 2;
var songTimingOverrides = null; /* {songId: {introSkip, outroSkip}}, siehe loadSongTimingOverrides() */

function loadSongTimingOverrides() {
  if (songTimingOverrides) return Promise.resolve(songTimingOverrides);
  return fetch('/shared/song-timing.json')
    .then(function (r) { if (!r.ok) throw new Error('no-overrides'); return r.json(); })
    .then(function (j) { songTimingOverrides = (j && typeof j === 'object') ? j : {}; return songTimingOverrides; })
    .catch(function () { songTimingOverrides = {}; return songTimingOverrides; });
}
loadSongTimingOverrides();

function introSkipFor(song) {
  var ov = song && songTimingOverrides && songTimingOverrides[songId(song)];
  if (ov && typeof ov.introSkip === 'number' && ov.introSkip >= 0) return ov.introSkip;
  return DEFAULT_INTRO_SKIP_SECONDS;
}
function outroSkipFor(song) {
  var ov = song && songTimingOverrides && songTimingOverrides[songId(song)];
  if (ov && typeof ov.outroSkip === 'number' && ov.outroSkip >= 0) return ov.outroSkip;
  return DEFAULT_OUTRO_SKIP_SECONDS;
}

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
  saveDjState();
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

/* Verlauf UND Warteschlange (Deck A/B: Song, Queue, Position) ueberleben
   einen Dekaden-Wechsel -- jede Dekade ist eine eigene Seite (eigener
   Page-Load), daher geht der In-Memory-Zustand beim Wechsel sonst
   komplett verloren. Alle Dekaden-Seiten liegen auf derselben Domain
   (nur andere Pfade), localStorage ist deshalb seitenuebergreifend
   sichtbar. Es wird bewusst NICHT die Ton-/Player-Instanz selbst
   gespeichert (isPlaying, Wiedergabeposition) -- die YouTube-Iframes
   existieren nach einem Seitenwechsel ohnehin nicht mehr. Stattdessen
   wird der Song beim Wiederherstellen pausiert neu geladen (siehe
   playDeckSong(..., false)), Titel/Warteschlange sind sofort wieder da,
   Play muss der Nutzer einmal neu antippen. */
var DJ_STATE_KEY = 'driftware_dj_state_v1';
var djSaveTimer = null;
var djStateRestored = false;

function songForStorage(s) {
  if (!s) return null;
  return { a: s.a, t: s.t, u: s.u || null, yt: s.yt || null, bpm: s.bpm || null, g: s.g, y: s.y, s: s.s };
}

function saveDjState() {
  try {
    var state = {
      history: playHistory,
      decks: {
        A: {
          queue: (DECKS.A.queue || []).map(songForStorage),
          index: DECKS.A.index,
          song: songForStorage(DECKS.A.song),
          rate: DECKS.A.rate || 1
        },
        B: {
          queue: (DECKS.B.queue || []).map(songForStorage),
          index: DECKS.B.index,
          song: songForStorage(DECKS.B.song),
          rate: DECKS.B.rate || 1
        }
      }
    };
    localStorage.setItem(DJ_STATE_KEY, JSON.stringify(state));
  } catch (e) {}
}

/* Wird bei jeder Deck-UI-Aktualisierung angestossen (siehe updateDeckInfoUI),
   das kann waehrend eines Crossfades sehr oft pro Sekunde passieren --
   deshalb debounced statt bei jedem Aufruf sofort zu schreiben. */
function scheduleDjStateSave() {
  clearTimeout(djSaveTimer);
  djSaveTimer = setTimeout(saveDjState, 800);
}

try {
  window.addEventListener('pagehide', saveDjState);
  window.addEventListener('beforeunload', saveDjState);
} catch (e) {}

function restoreDjState() {
  if (djStateRestored) return;
  djStateRestored = true;
  var raw;
  try { raw = localStorage.getItem(DJ_STATE_KEY); } catch (e) { return; }
  if (!raw) return;
  var state;
  try { state = JSON.parse(raw); } catch (e) { return; }
  if (!state) return;

  if (state.history && state.history.length) {
    playHistory = state.history.slice(0, 30);
    renderPlayHistory();
  }

  ['A', 'B'].forEach(function (key) {
    var saved = state.decks && state.decks[key];
    if (!saved || !saved.song) return;
    var deck = DECKS[key];
    var queue = (saved.queue && saved.queue.length) ? saved.queue : [saved.song];
    var idx = -1;
    for (var i = 0; i < queue.length; i++) {
      if (queue[i].t === saved.song.t && queue[i].a === saved.song.a) { idx = i; break; }
    }
    idx = idx !== -1 ? idx : 0;

    /* continuity.js laeuft VOR diesem Aufruf und setzt bei einem frischen
       Seitenwechsel (< 20s) bereits deck.song -- inkl. tatsaechlich
       laufender Wiedergabe an der richtigen Position. Das hier NICHT
       ueberschreiben/neu laden (sonst wird aus "spielt an Position X" wieder
       "pausiert von vorne"), sondern nur die volle Warteschlange nachliefern
       (continuity.js kennt nur den einzelnen Song, nicht den Listenkontext),
       falls es wirklich derselbe Song ist. */
    if (deck.song) {
      if (deck.song.t === saved.song.t && deck.song.a === saved.song.a) {
        deck.queue = queue;
        deck.index = idx;
      }
      return;
    }

    deck.queue = queue;
    deck.index = idx;
    deck.rate = saved.rate || 1;
    playDeckSong(key, deck.queue[deck.index], false);
    setDeckPitch(key, deck.rate);
  });

  highlightResumedPlayer();
}

/* Der Player ist fest angedockt (position: fixed) und damit nach einem
   Reload IMMER sichtbar, ganz ohne Scrollen -- trotzdem faellt eine
   fortgesetzte Wiedergabe in der Ecke leicht nicht sofort auf. Statt die
   Seite zu einem bestimmten Scroll-Ziel zu zwingen, blitzt der Player
   deshalb kurz auf, sobald nach einem Reload Song/Warteschlange wieder da
   sind (durch restoreDjState() hier ODER durch continuity.js, das diese
   Funktion nach seinem eigenen Resume ebenfalls aufruft -- je nach
   Ladereihenfolge kann jede der beiden zuerst fertig sein). */
var djResumeHighlightShown = false;
function highlightResumedPlayer() {
  if (djResumeHighlightShown) return;
  if (!(DECKS.A.song || DECKS.B.song)) return;
  djResumeHighlightShown = true;
  var bar = document.getElementById('dj-player');
  if (!bar) return;
  bar.classList.add('dj-player-resumed');
  setTimeout(function () { bar.classList.remove('dj-player-resumed'); }, 2600);
}

function deckHTML(key) {
  return '' +
    '<div class="dj-deck" id="deck-' + key + '">' +
    '  <div class="dj-deck-head">' +
    '    <div class="dj-deck-label">Deck ' + key + '</div>' +
    '    <div class="dj-deck-info" id="deck-' + key + '-info">' +
    '      <div class="dj-digital-swatches" id="deck-' + key + '-digital-swatches">' +
    '        <button type="button" class="dj-digital-swatch" data-color="green" aria-label="Display gruen"></button>' +
    '        <button type="button" class="dj-digital-swatch" data-color="blue" aria-label="Display blau"></button>' +
    '        <button type="button" class="dj-digital-swatch" data-color="yellow" aria-label="Display gelb"></button>' +
    '        <button type="button" class="dj-digital-swatch" data-color="orange" aria-label="Display orange"></button>' +
    '      </div>' +
    '      <strong id="deck-' + key + '-title">Kein Song geladen</strong>' +
    '      <span id="deck-' + key + '-artist">–</span>' +
    '      <div class="dj-deck-meta">' +
    '        <span class="dj-deck-remaining" id="deck-' + key + '-remaining"></span>' +
    '        <span class="dj-deck-bpm" id="deck-' + key + '-bpm"></span>' +
    '      </div>' +
    '    </div>' +
    '  </div>' +
    '  <div class="dj-deck-top">' +
    '    <div class="dj-vinyl" id="deck-' + key + '-drop">' +
    '      <div class="dj-vinyl-disc" id="deck-' + key + '-disc">' +
    '        <div class="dj-vinyl-video" id="deck-' + key + '-mount"></div>' +
    '        <div class="dj-vinyl-ring" aria-hidden="true"><span class="dj-vinyl-dot"></span></div>' +
    '      </div>' +
    '      <div class="dj-vinyl-hint">Song hierher ziehen</div>' +
    '      <div class="dj-vinyl-dragshield" id="deck-' + key + '-dragshield" aria-hidden="true"></div>' +
    '    </div>' +
    '  </div>' +
    '  <div class="dj-waveform" id="deck-' + key + '-waveform" role="slider" tabindex="0" ' +
    '    aria-label="Deck ' + key + ': Songposition" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
    '    <canvas id="deck-' + key + '-waveform-canvas"></canvas>' +
    '  </div>' +
    '  <div class="dj-pitch">' +
    '    <div class="dj-knob-wrap">' +
    '      <div class="dj-knob" id="deck-' + key + '-pitch-knob" role="slider" tabindex="0" ' +
    '        aria-label="Deck ' + key + ': Pitch" aria-valuemin="-50" aria-valuemax="50" aria-valuenow="0" data-value="0">' +
    '        <div class="dj-knob-ticks" aria-hidden="true"><span></span><span></span><span class="mid"></span><span></span><span></span></div>' +
    '        <div class="dj-knob-dial" id="deck-' + key + '-pitch-dial"><div class="dj-knob-pointer"></div></div>' +
    '      </div>' +
    '    </div>' +
    '    <div class="dj-pitch-display" id="deck-' + key + '-pitch-display">0,00</div>' +
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
    '<div class="dj-decks">' +
    deckHTML('A') +
    '<div class="dj-master">' +
    '  <div class="dj-crossfader">' +
    '    <span class="dj-crossfader-label">A</span>' +
    '    <div class="dj-slider-wrap">' +
    '      <input type="range" id="dj-crossfader" min="0" max="100" value="50" aria-label="Crossfader zwischen Deck A und Deck B">' +
    '      <div class="dj-scale" aria-hidden="true"><span></span><span></span><span class="mid"></span><span></span><span></span></div>' +
    '    </div>' +
    '    <span class="dj-crossfader-label">B</span>' +
    '  </div>' +
    '  <div class="dj-fade-row">' +
    '    <button type="button" id="dj-autofade-toggle" class="dj-autofade-toggle active" aria-pressed="true" ' +
    '      title="Automatisches Überblenden 10s vor Songende (nur bei passenden BPM) an/aus">' + REFRESH_SVG + ' Autofade An</button>' +
    '    <button type="button" id="dj-manual-fade" class="dj-manual-fade-btn" aria-label="Fade jetzt" ' +
    '      title="Manuellen Überblend-Vorgang starten (5 Sekunden Verzögerung, dann Crossfade zum anderen Deck)">' + REFRESH_SVG + '</button>' +
    '  </div>' +
    '  <div class="dj-volume">' +
    '    <span class="dj-volume-label">' + SPEAKER_SVG + '</span>' +
    '    <div class="dj-slider-wrap">' +
    '      <input type="range" id="dj-master-volume" min="0" max="100" value="80" aria-label="Gesamtlautstärke">' +
    '      <div class="dj-scale" aria-hidden="true"><span></span><span></span><span class="mid"></span><span></span><span></span></div>' +
    '    </div>' +
    '  </div>' +
    '</div>' +
    deckHTML('B') +
    '</div>';
  document.body.appendChild(bar);

  var toolsPanel = document.createElement('div');
  toolsPanel.className = 'dj-tools-panel';
  toolsPanel.id = 'dj-tools-panel';
  toolsPanel.innerHTML = '' +
    '<div class="dj-tools-title">BPM-Sync</div>' +
    '<div class="dj-bpm-readout">' +
    '  <div class="dj-bpm-readout-row"><span class="dj-bpm-readout-label">A</span><span class="dj-bpm-readout-value" id="dj-bpm-a">–</span></div>' +
    '  <div class="dj-bpm-readout-row"><span class="dj-bpm-readout-label">B</span><span class="dj-bpm-readout-value" id="dj-bpm-b">–</span></div>' +
    '</div>' +
    '<div class="dj-bpm-match" id="dj-bpm-match">Songs mit BPM laden</div>' +
    '<button type="button" id="dj-bpm-sync-btn" class="dj-bpm-sync-btn" disabled>' + REFRESH_SVG + ' Angleichen</button>';
  document.body.appendChild(toolsPanel);
  var bpmSyncBtn = toolsPanel.querySelector('#dj-bpm-sync-btn');
  if (bpmSyncBtn) bpmSyncBtn.addEventListener('click', syncIdleDeckToPlaying);
  updateBpmSync();

  /* Schallplatten-Drag-Bild schon jetzt anlegen (nicht erst beim ersten
     dragstart) -- manche Browser (v.a. Safari) rendern ein Element, das
     im selben Moment wie setDragImage() erst neu ins DOM kommt, nicht
     zuverlaessig als Drag-Bild und brechen dann den ganzen Drag ab, statt
     nur die Optik zu verlieren. Mit einem laengst existierenden Element
     ist das Layout schon berechnet, wenn der erste echte Drag startet. */
  ensureDragGhost({});

  ['A', 'B'].forEach(function (key) {
    bar.querySelector('#deck-' + key + '-toggle').addEventListener('click', function () { deckTogglePlay(key); });
    bar.querySelector('#deck-' + key + '-prev').addEventListener('click', function () { deckStep(key, -1); });
    bar.querySelector('#deck-' + key + '-next').addEventListener('click', function () { deckStep(key, 1); });
    wireWaveformSeek(key);
    wireDigitalDisplay(key);
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
    var pitchKnob = bar.querySelector('#deck-' + key + '-pitch-knob');
    if (pitchKnob) {
      var knobDragging = false;
      var pitchFromPointer = function (e) {
        var rect = pitchKnob.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var deg = Math.atan2(e.clientX - cx, cy - e.clientY) * 180 / Math.PI;
        deg = Math.max(-135, Math.min(135, deg));
        var raw = deg / 135 * 50;
        return PITCH_STEPS.reduce(function (a, b) { return Math.abs(b - raw) < Math.abs(a - raw) ? b : a; });
      };
      pitchKnob.addEventListener('pointerdown', function (e) {
        userInterruptPitchGlide(key);
        knobDragging = true;
        try { pitchKnob.setPointerCapture(e.pointerId); } catch (err) {}
        setDeckPitch(key, 1 + pitchFromPointer(e) / 100);
      });
      pitchKnob.addEventListener('pointermove', function (e) {
        if (!knobDragging) return;
        setDeckPitch(key, 1 + pitchFromPointer(e) / 100);
      });
      pitchKnob.addEventListener('pointerup', function () { knobDragging = false; });
      pitchKnob.addEventListener('pointercancel', function () { knobDragging = false; });
      pitchKnob.addEventListener('keydown', function (e) {
        var cur = parseInt(pitchKnob.dataset.value, 10) || 0;
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { cur = Math.min(50, cur + 25); }
        else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { cur = Math.max(-50, cur - 25); }
        else { return; }
        e.preventDefault();
        userInterruptPitchGlide(key);
        setDeckPitch(key, 1 + cur / 100);
      });
    }
  });

  var fader = bar.querySelector('#dj-crossfader');
  fader.addEventListener('input', function () {
    /* Nutzer greift manuell an den Regler -- laeuft gerade ein automatischer
       Crossfade, muss der abgebrochen werden, sonst zieht dessen Intervall
       (alle 100ms) den Regler im naechsten Tick sofort wieder auf die
       animierte Position zurueck (siehe cancelActiveAutoFade). */
    if (activeAutoFade) cancelActiveAutoFade(activeAutoFade.fromKey);
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
      /* cancelActiveAutoFade statt nur clearInterval+null: sonst bleiben
         die Pitch-Gleitvorgaenge von meetInMiddleThenSettle (siehe dort)
         unabhaengig weiterlaufen, obwohl der Crossfade selbst schon
         gestoppt ist -- der Regler bleibt dann auf halber Strecke stehen,
         waehrend der Pitch trotzdem noch weiter Richtung Zielwert driftet. */
      cancelActiveAutoFade(activeAutoFade.fromKey);
    }
  });
  var manualFadeBtn = bar.querySelector('#dj-manual-fade');
  if (manualFadeBtn) {
    manualFadeBtn.addEventListener('click', function () { triggerManualFade(manualFadeBtn); });
  }

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
    var diff = rate - 1;
    display.textContent = (diff > 0 ? '+' : '') + diff.toFixed(2).replace('.', ',');
  }
  var knob = document.getElementById('deck-' + key + '-pitch-knob');
  if (knob) {
    knob.dataset.value = pct;
    knob.setAttribute('aria-valuenow', pct);
  }
  var dial = document.getElementById('deck-' + key + '-pitch-dial');
  if (dial) { dial.style.transform = 'rotate(' + (pct / 50 * 135) + 'deg)'; }
  updateBpmSync();
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
  ensureWaveformBars(key);
  drawWaveform(key);
  queuePlayerSpacing();
  refreshMixableHighlight();
  updateBpmSync();
  scheduleDjStateSave();
}

/* BPM-Sync-Panel: zeigt die (durch den Pitch bereits skalierte) effektive
   BPM beider Decks und erlaubt per Klick, das gerade NICHT spielende Deck
   automatisch auf die Pitch-Stufe zu setzen, die der BPM des spielenden
   Decks am naechsten kommt. A/B wechseln staendig die Rolle (mal spielt A
   und B ist das naechste vorbereitete Deck, mal umgekehrt — siehe
   maybePreloadNext) — welche Richtung angeglichen wird, wird deshalb bei
   jedem Update neu bestimmt, nie fest auf B->A. Nutzt dieselbe feste
   5-Stufen-Skala wie der Pitch-Knopf (siehe setDeckPitch) — echte
   Feinabstimmung ist mit der YouTube-IFrame-API nicht moeglich, aber die
   naeheste Stufe reicht fuer einen hoerbar saubereren Uebergang. */
function effectiveBpm(key) {
  var deck = DECKS[key];
  if (!deck.song || !deck.song.bpm) return null;
  return deck.song.bpm * (deck.rate || 1);
}

/* Eindeutig nur, wenn genau ein Deck gerade spielt -- laeuft keins oder
   laufen (kurz beim Ueberblenden) beide, gibt es kein sinnvolles "Ziel"
   und der Sync-Button wird deaktiviert statt zu raten. */
function currentSyncRoles() {
  var aPlaying = DECKS.A.isPlaying;
  var bPlaying = DECKS.B.isPlaying;
  if (aPlaying && !bPlaying) return { playing: 'A', idle: 'B' };
  if (bPlaying && !aPlaying) return { playing: 'B', idle: 'A' };
  return null;
}

function updateBpmSync() {
  var panel = document.getElementById('dj-tools-panel');
  if (!panel) return;
  var aEl = document.getElementById('dj-bpm-a');
  var bEl = document.getElementById('dj-bpm-b');
  var matchEl = document.getElementById('dj-bpm-match');
  var syncBtn = document.getElementById('dj-bpm-sync-btn');
  var rawA = DECKS.A.song && DECKS.A.song.bpm;
  var rawB = DECKS.B.song && DECKS.B.song.bpm;
  if (aEl) aEl.textContent = rawA ? rawA + ' BPM' : '–';
  if (bEl) bEl.textContent = rawB ? rawB + ' BPM' : '–';

  if (bpmSyncActive) return; /* Button/Text bleiben waehrend der Animation wie gesetzt */

  if (!rawA || !rawB) {
    if (matchEl) { matchEl.textContent = 'Songs mit BPM laden'; matchEl.className = 'dj-bpm-match'; }
    if (syncBtn) { syncBtn.disabled = true; syncBtn.innerHTML = REFRESH_SVG + ' Angleichen'; syncBtn.title = ''; }
    return;
  }
  var effA = effectiveBpm('A');
  var effB = effectiveBpm('B');
  var diff = Math.round(Math.abs(effA - effB) * 10) / 10;
  var ok = diff <= 3;
  if (matchEl) {
    matchEl.textContent = (ok ? '✓ synchron' : 'Δ ' + diff + ' BPM') + ' · eff. ' + Math.round(effA) + '/' + Math.round(effB);
    matchEl.className = 'dj-bpm-match' + (ok ? ' ok' : '');
  }
  var roles = currentSyncRoles();
  if (syncBtn) {
    if (!roles) {
      syncBtn.disabled = true;
      syncBtn.innerHTML = REFRESH_SVG + ' Angleichen';
      syncBtn.title = 'Nur möglich, wenn genau ein Deck spielt.';
    } else {
      syncBtn.disabled = ok;
      syncBtn.innerHTML = REFRESH_SVG + ' Angleichen';
      syncBtn.title = 'Beide Decks treffen sich kurz auf halber BPM zur Vorbereitung, danach kehren beide von selbst wieder auf ihr Original-Tempo zurueck, sobald sie nicht mehr im Uebergang sind';
    }
  }
}

/* Sync faehrt den Pitch nicht in einem Sprung auf die Zielstufe, sondern
   Stufe fuer Stufe mit kurzer Pause dazwischen (die YouTube-API kennt
   keine Zwischenwerte, ein sofortiger Sprung waere als Tempo-/Tonhoehen-
   Ruck deutlich hoerbar). Rein internes Aufraeumen (auch von
   glideDeckPitch selbst genutzt, um einen alten Timer vor einem neuen
   Zielwert zu kappen) -- fuer den Abbruch durch eine echte Nutzeraktion
   siehe userInterruptPitchGlide() weiter unten. */
function cancelPitchGlide(key) {
  if (pitchGlideTimers[key]) {
    clearTimeout(pitchGlideTimers[key]);
    pitchGlideTimers[key] = null;
  }
  setKnobAutoGlide(key, false);
}

/* Visuelles "der Player arbeitet gerade selbststaendig"-Signal: waehrend
   glideDeckPitch einen Regler automatisch bewegt (nie bei direkter
   Nutzer-Interaktion am Knopf, die setzt den Pitch sofort ohne Glide),
   bekommen Knopf + Anzeige eine Klasse fuer sanftere Drehung + pulsierenden
   Schein (siehe .auto-glide in decades.css). */
function setKnobAutoGlide(key, on) {
  var knobEl = document.getElementById('deck-' + key + '-pitch-knob');
  var displayEl = document.getElementById('deck-' + key + '-pitch-display');
  if (knobEl) knobEl.classList.toggle('auto-glide', on);
  if (displayEl) displayEl.classList.toggle('auto-glide', on);
}

/* Nutzer greift waehrend eines laufenden Sync-Ablaufs (meetInMiddleThenSettle,
   siehe unten) manuell an einen der beteiligten Pitch-Knoepfe -- bricht den
   GESAMTEN Ablauf ab, nicht nur diese eine Seite, sonst liefe die andere
   Seite alleine auf einen jetzt sinnlosen Zielwert weiter. Nur von echten
   Knopf-Interaktionen (Pointerdown/Keydown) aufrufen, nie von
   glideDeckPitch selbst -- sonst wuerde ein Sync-Ablauf seinen eigenen
   ersten Schritt als Unterbrechung missverstehen und sich sofort selbst
   abbrechen. */
function userInterruptPitchGlide(key) {
  cancelPitchGlide(key);
  if (bpmSyncActive && bpmSyncKeys.indexOf(key) !== -1) {
    bpmSyncKeys.forEach(cancelPitchGlide);
    bpmSyncActive = false;
    bpmSyncKeys = [];
    updateBpmSync();
  }
}

function glideDeckPitch(key, targetPct, stepDelayMs, onDone) {
  cancelPitchGlide(key);
  stepDelayMs = stepDelayMs || 600;
  setKnobAutoGlide(key, true);
  function step() {
    var cur = Math.round(((DECKS[key].rate || 1) - 1) * 100);
    if (cur === targetPct) {
      pitchGlideTimers[key] = null;
      setKnobAutoGlide(key, false);
      if (onDone) onDone();
      return;
    }
    var next = cur + (targetPct > cur ? 25 : -25);
    setDeckPitch(key, 1 + next / 100);
    pitchGlideTimers[key] = setTimeout(step, stepDelayMs);
  }
  step();
}

/* "In der Mitte treffen": statt nur ein Deck komplett auf das andere zu
   zwingen, faehrt bei einem echten BPM-Unterschied (siehe bpmsCompatible)
   der Pitch auf BEIDEN beteiligten Decks Richtung Mittelwert der beiden
   Original-BPM -- jede Seite muss sich dadurch nur noch halb so weit
   bewegen, der Uebergang wirkt spuerbar sanfter/fluessiger. Sobald beide
   Seiten ihre Zielstufe erreicht haben, loest sich NUR das eingehende
   Deck (toKey) langsam wieder auf sein eigenes Original-Tempo (0%) --
   das auslaufende (fromKey) bleibt auf der Mitte stehen, es spielt
   ohnehin gleich nicht mehr. Passen die BPM schon zusammen, passiert
   nichts (onSettled wird trotzdem sofort aufgerufen). Wird von beiden
   Uebergaengen (Auto-Crossfade, manueller Fade) UND vom Sync-Button im
   BPM-Panel genutzt. */
function meetInMiddleThenSettle(fromKey, toKey, opts) {
  opts = opts || {};
  var stepDelayMs = opts.stepDelayMs || 600;
  var bpmFrom = DECKS[fromKey].song && DECKS[fromKey].song.bpm;
  var bpmTo = DECKS[toKey].song && DECKS[toKey].song.bpm;
  if (!bpmFrom || !bpmTo || bpmsCompatible(bpmFrom, bpmTo)) {
    if (opts.onSettled) opts.onSettled();
    return;
  }
  var mid = (bpmFrom + bpmTo) / 2;
  function bestStepFor(bpm) {
    var best = PITCH_STEPS[0];
    var bestDiff = Infinity;
    PITCH_STEPS.forEach(function (pct) {
      var diff = Math.abs(bpm * (1 + pct / 100) - mid);
      if (diff < bestDiff) { bestDiff = diff; best = pct; }
    });
    return best;
  }
  var pending = 2;
  function afterPhase1() {
    pending -= 1;
    if (pending > 0) return;
    glideDeckPitch(toKey, 0, stepDelayMs, opts.onSettled);
  }
  glideDeckPitch(fromKey, bestStepFor(bpmFrom), stepDelayMs, afterPhase1);
  glideDeckPitch(toKey, bestStepFor(bpmTo), stepDelayMs, afterPhase1);
}

function syncIdleDeckToPlaying() {
  if (bpmSyncActive) return;
  var roles = currentSyncRoles();
  if (!roles) return;
  var bpmPlaying = DECKS[roles.playing].song && DECKS[roles.playing].song.bpm;
  var bpmIdle = DECKS[roles.idle].song && DECKS[roles.idle].song.bpm;
  if (!bpmPlaying || !bpmIdle) return;
  var syncBtn = document.getElementById('dj-bpm-sync-btn');
  bpmSyncActive = true;
  bpmSyncKeys = [roles.playing, roles.idle];
  if (syncBtn) { syncBtn.disabled = true; syncBtn.innerHTML = REFRESH_SVG + ' gleicht an …'; }
  meetInMiddleThenSettle(roles.playing, roles.idle, {
    stepDelayMs: 600,
    onSettled: function () {
      bpmSyncActive = false;
      bpmSyncKeys = [];
      updateBpmSync();
    }
  });
}

/* BPM-Sync soll HOERBAR nur waehrend eines echten Uebergangs wirken (siehe
   meetInMiddleThenSettle), nie dauerhaft: sobald genau ein Deck allein im
   Player laeuft (currentSyncRoles liefert nur dann etwas -- laufen beide
   oder keins, ist gerade ein Uebergang im Gange oder nichts spielt),
   kein Crossfade und kein manueller Sync-Ablauf aktiv sind, aber der Pitch
   dieses Decks noch nicht auf 0% (Original-BPM) steht, faehrt der Regler
   automatisch mit sichtbarem Glide-Effekt (.auto-glide, siehe
   setKnobAutoGlide) wieder dorthin zurueck. Deckt sowohl das "Angleichen"
   im BPM-Panel ab (das spielende Deck landet danach kurz auf der Mitte,
   hier faehrt es von selbst wieder zurueck) als auch jeden Rest-Zustand,
   den ein frueherer Uebergang hinterlassen haben koennte. */
function maybeAutoRevertSoloPitch() {
  if (activeAutoFade || bpmSyncActive) return;
  var roles = currentSyncRoles();
  if (!roles) return;
  var key = roles.playing;
  if (pitchGlideTimers[key]) return;
  var curPct = Math.round(((DECKS[key].rate || 1) - 1) * 100);
  if (curPct !== 0) glideDeckPitch(key, 0, 500);
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

/* Zaehlt aufeinanderfolgende Video-Fehler pro Deck (siehe onError weiter
   unten) -- ohne diese Bremse haengt eine Kette kaputter/gesperrter
   YouTube-IDs in der Warteschlange den Player in einer schnellen Folge aus
   deckStep()->loadVideoById()->onError()->deckStep()->... jeder Sprung baut
   den Player neu auf, das kann den Tab bei vielen Fehlschlaegen in Serie
   spuerbar ausbremsen bis hin zum Haengenbleiben. Wird bei jedem
   erfolgreichen Play-Start (PLAYING-Event) wieder auf 0 gesetzt. */
var deckErrorStreak = { A: 0, B: 0 };

function onDeckStateChange(key) {
  return function (e) {
    var deck = DECKS[key];
    if (e.data === YT.PlayerState.PLAYING) {
      deck.isPlaying = true;
      deckErrorStreak[key] = 0;
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
   Vorladen bewusst nicht ein.
   deck.song wird dabei schon jetzt gesetzt (nicht erst beim tatsaechlichen
   Handoff) — das Deck zeigt Titel/Artist/BPM also sofort an, obwohl es
   noch pausiert ist. Dadurch weiss das BPM-Sync-Panel schon waehrend das
   erste Deck laeuft, wie die beiden Tempi zueinander stehen, statt erst
   nachdem das zweite Deck manuell gestartet wurde. */
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
  other.song = nextSong;
  other.historyLogged = false;
  updateDeckInfoUI(otherKey);
  function cue() {
    if (other.preloadedFor !== wantedId) return; /* zwischenzeitlich ueberholt */
    if (other.player && other.player.cueVideoById) {
      try { other.player.setVolume(0); } catch (e) {}
      try { other.player.cueVideoById(nextSong.yt, introSkipFor(nextSong)); } catch (e) {}
    } else if (!other.player) {
      other.player = new YT.Player('deck-' + otherKey + '-mount', {
        width: '100%',
        height: '100%',
        videoId: nextSong.yt,
        playerVars: { rel: 0, playsinline: 1, autoplay: 0, start: introSkipFor(nextSong) },
        events: {
          onReady: function (e) { try { e.target.setVolume(0); } catch (err) {} },
          onStateChange: onDeckStateChange(otherKey),
          onError: function () {
            other.preloadedFor = null;
            if (other.song && songId(other.song) === wantedId) { other.song = null; updateDeckInfoUI(otherKey); }
          }
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
  cancelPitchGlide(key);
  if (finished.rate !== 1) setDeckPitch(key, 1);
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
  cancelPitchGlide(key);
  if (finished.rate !== 1) setDeckPitch(key, 1);
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
   (oder fehlt einem der Songs die BPM) macht das inzwischen keinen
   Unterschied mehr: Minimum ist immer 10s, damit der Uebergang immer
   gut wahrnehmbar ist, egal ob die Tempi zusammenpassen. Ein echtes Beatmatching
   (Zeitdehnung exakt auf die Ziel-BPM) ist mit der YouTube-IFrame-API nicht
   moeglich, da setPlaybackRate nur die festen Stufen 0.5/0.75/1/1.25/1.5
   kennt — zu grob fuer eine Feinanpassung im niedrigen BPM-Bereich. */
var CROSSFADE_LEAD_SECONDS = 10;
var QUICK_HANDOFF_SECONDS = 10;
var activeAutoFade = null;

function bpmsCompatible(bpmA, bpmB) {
  return !!bpmA && !!bpmB && Math.abs(bpmA - bpmB) <= 10;
}

/* Playlist so um-ordnen, dass aufeinanderfolgende Songs moeglichst nah
   beieinander liegende BPM haben, statt wie bisher per Zufallsmischung oder
   Datenbank-Reihenfolge querbeet zu springen (in der Praxis auch mal 50+
   BPM Unterschied, siehe BPM-Sync-Panel). Greedy "naechster Nachbar"-Kette:
   startet bei einem zufaelligen Song mit BPM, haengt danach immer den noch
   nicht platzierten Song mit dem kleinsten BPM-Abstand zum zuletzt
   platzierten an -- dadurch bleiben die Schritte klein, ohne die Playlist
   stur nach BPM aufsteigend zu sortieren (jeder Durchlauf startet woanders).
   Songs ganz ohne BPM-Wert (aktuell z.B. komplett bei 2000er/2010er/2020er,
   teilweise bei 90er) koennen nicht sinnvoll einsortiert werden und bleiben
   in ihrer bisherigen Reihenfolge hinten angehaengt -- damit ist die
   Funktion ein reines No-Op fuer Dekaden ohne (bzw. mit noch zu wenig)
   BPM-Daten, statt dort halbe Playlists durcheinanderzuwuerfeln. */
function bpmSmooth(list) {
  var withBpm = [];
  var withoutBpm = [];
  (list || []).forEach(function (s) {
    if (s && s.bpm) withBpm.push(s); else withoutBpm.push(s);
  });
  if (withBpm.length < 2) return (list || []).slice();

  var remaining = withBpm.slice();
  var startIdx = Math.floor(Math.random() * remaining.length);
  var ordered = [remaining.splice(startIdx, 1)[0]];

  while (remaining.length) {
    var lastBpm = ordered[ordered.length - 1].bpm;
    var bestIdx = 0;
    var bestDiff = Infinity;
    for (var i = 0; i < remaining.length; i++) {
      var diff = Math.abs(remaining[i].bpm - lastBpm);
      if (diff < bestDiff) { bestDiff = diff; bestIdx = i; }
    }
    ordered.push(remaining.splice(bestIdx, 1)[0]);
  }
  return ordered.concat(withoutBpm);
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
  meetInMiddleThenSettle(fromKey, toKey);

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

/* Manueller "Fade jetzt"-Button: startet nach 5 Sekunden Verzoegerung (Countdown
   auf dem Button sichtbar) denselben Ueberblend-Sweep wie das automatische
   Crossfade, aber unabhaengig von einer Warteschlange -- faedet einfach vom
   gerade dominanten Deck zum anderen, sofern dort etwas geladen ist. Das
   Quelldeck wird danach genau wie beim automatischen Crossfade (siehe
   finishAutoCrossfade) komplett geleert, nicht nur pausiert: ein nur
   pausiertes Deck behaelt deck.song gesetzt, und maybePreloadNext()
   bricht dann ueber "if (other.song || other.isPlaying) return;" fuer
   IMMER ab, weil dieses Deck als "belegt" gilt -- kein Vorladen des
   naechsten Songs mehr moeglich, die Wiedergabe haengt danach zwischen
   genau diesen zwei Liedern fest. */
var manualFadeCountdownId = null;

function startManualFadeSweep(fromKey, toKey) {
  var from = DECKS[fromKey];
  var to = DECKS[toKey];

  /* Kam der Song auf dem Zieldeck aus dem stillen Vorladen (maybePreloadNext),
     gehoert er zur Warteschlange des AUSLAUFENDEN Decks -- die muss genau wie
     beim automatischen Crossfade (siehe startAutoCrossfade) jetzt uebernommen
     werden. OHNE das hier: to.queue bleibt leer/stehen auf einem alten Stand,
     das Zieldeck hat nach dem Uebergang KEINE Warteschlange mehr (nur den
     einen geladenen Song) -- Vorladen des naechsten Songs UND ein weiterer
     manueller Fade brechen danach beide ab ("Kein Song geladen"), obwohl
     eigentlich noch eine ganze Playlist dahinter waere. Wurde der Song
     stattdessen manuell per Drag&Drop auf das Zieldeck gezogen, hat es (ueber
     loadSongToDeck) schon seine eigene korrekte Warteschlange -- die bleibt
     dann unangetastet. */
  var fromNextIdx = from.index + 1;
  var fromNextSong = (fromNextIdx >= 0 && fromNextIdx < from.queue.length) ? from.queue[fromNextIdx] : null;
  if (fromNextSong && to.preloadedFor === songId(fromNextSong)) {
    to.queue = from.queue;
    to.index = fromNextIdx;
  }
  to.preloadedFor = null;

  /* Anders als beim automatischen Crossfade (startAutoCrossfade) ist das
     Zieldeck hier oft nur geladen/gecued, aber nicht schon am Spielen --
     ohne diesen Start würde die Lautstärke zwar hochgefahren, aber das
     Video bliebe pausiert (stumm). */
  try { to.player.playVideo(); } catch (e) {}
  meetInMiddleThenSettle(fromKey, toKey);
  var startFader = crossfaderValue;
  var targetFader = (toKey === 'A') ? 0 : 100;
  var startTime = Date.now();
  var durationMs = CROSSFADE_LEAD_SECONDS * 1000;
  var faderEl = document.getElementById('dj-crossfader');

  activeAutoFade = {
    fromKey: fromKey,
    toKey: toKey,
    intervalId: setInterval(function () {
      var t = Math.min(1, (Date.now() - startTime) / durationMs);
      crossfaderValue = Math.round(startFader + (targetFader - startFader) * t);
      if (faderEl) faderEl.value = crossfaderValue;
      applyCrossfaderVolumes();
      if (t >= 1) {
        clearInterval(activeAutoFade.intervalId);
        activeAutoFade = null;
        try { from.player.pauseVideo(); } catch (e) {}
        from.song = null;
        from.queue = [];
        from.index = -1;
        from.isPlaying = false;
        cancelPitchGlide(fromKey);
        if (from.rate !== 1) setDeckPitch(fromKey, 1);
        updateDeckInfoUI(fromKey);
        maybePreloadNext(toKey);
      }
    }, 100)
  };
}

/* Bricht der Button lautlos ab (kein Song im Ziel-Player, oder gerade schon
   ein Fade aktiv), sieht das wie ein Button aus, der nicht reagiert -- kurz
   rot aufblitzen lassen + Tooltip, damit klar ist WARUM nichts passiert. */
function flashFadeBtnBlocked(btn, reason) {
  btn.classList.add('blocked');
  var prevTitle = btn.title;
  btn.title = reason;
  setTimeout(function () {
    btn.classList.remove('blocked');
    btn.title = prevTitle;
  }, 1400);
}

function triggerManualFade(btn) {
  if (activeAutoFade || manualFadeCountdownId) {
    flashFadeBtnBlocked(btn, 'Läuft schon ein Überblenden -- kurz warten.');
    return;
  }
  /* fromKey = das Deck, das GERADE SPIELT (nicht nur die Crossfader-
     Position -- die kann vom tatsaechlichen Wiedergabestatus abweichen,
     z.B. wenn beide Decks pausiert sind oder der Regler von einem
     frueheren Uebergang noch woanders steht). Nur wenn isPlaying keine
     eindeutige Antwort gibt (keins oder beide spielen), zaehlt die
     Reglerposition als Notloesung. */
  var fromKey;
  if (DECKS.A.isPlaying && !DECKS.B.isPlaying) fromKey = 'A';
  else if (DECKS.B.isPlaying && !DECKS.A.isPlaying) fromKey = 'B';
  else fromKey = crossfaderValue <= 50 ? 'A' : 'B';
  var toKey = fromKey === 'A' ? 'B' : 'A';
  var to = DECKS[toKey];
  if (!to.song) {
    flashFadeBtnBlocked(btn, 'Kein Song in Deck ' + toKey + ' geladen -- erst einen Song dorthin ziehen.');
    return;
  }
  if (!to.player) {
    flashFadeBtnBlocked(btn, 'Deck ' + toKey + ' lädt noch -- gleich nochmal versuchen.');
    return;
  }

  var remaining = 5;
  var originalLabel = btn.innerHTML;
  btn.disabled = true;
  btn.textContent = String(remaining);
  manualFadeCountdownId = setInterval(function () {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(manualFadeCountdownId);
      manualFadeCountdownId = null;
      btn.disabled = false;
      btn.innerHTML = originalLabel;
      startManualFadeSweep(fromKey, toKey);
    } else {
      btn.textContent = String(remaining);
    }
  }, 1000);
}

/* Greift der Nutzer waehrend eines laufenden Auto-Crossfades manuell ein
   (neuen Song laden, Deck pausieren), wird der automatische Übergang
   abgebrochen statt im Hintergrund weiterzulaufen und den Crossfader gegen
   die manuelle Aktion zu ziehen. */
function cancelActiveAutoFade(key) {
  if (!activeAutoFade) return;
  if (activeAutoFade.fromKey !== key && activeAutoFade.toKey !== key) return;
  clearInterval(activeAutoFade.intervalId);
  [activeAutoFade.fromKey, activeAutoFade.toKey].forEach(cancelPitchGlide);
  activeAutoFade = null;
}

function finishAutoCrossfade() {
  if (!activeAutoFade) return;
  var fromKey = activeAutoFade.fromKey;
  var toKey = activeAutoFade.toKey;
  clearInterval(activeAutoFade.intervalId);
  activeAutoFade = null;

  /* Falls das Lied frueher endet (ENDED-Event) als die geschaetzte
     Crossfade-Dauer verstrichen ist, wuerde der Uebergang sonst mitten
     drin haengen bleiben: Crossfader auf Zielwert erzwingen und
     Lautstaerken final anwenden, bevor der From-Deck geleert wird. */
  crossfaderValue = (toKey === 'A') ? 0 : 100;
  var faderEl = document.getElementById('dj-crossfader');
  if (faderEl) faderEl.value = crossfaderValue;
  applyCrossfaderVolumes();

  var from = DECKS[fromKey];
  try { from.player.pauseVideo(); } catch (e) {}
  from.song = null;
  from.queue = [];
  from.index = -1;
  from.isPlaying = false;
  updateDeckInfoUI(fromKey);
  if (Math.round(((from.rate || 1) - 1) * 100) !== 0) glideDeckPitch(fromKey, 0, 400);

  maybePreloadNext(toKey);
}

/* Wellenform-Fortschrittsanzeige zwischen Vinyl und Pitch-Regler. YouTube
   liefert keine echte Audio-Wellenform -- stattdessen wird pro Song ein
   fest generiertes, aber SONG-SPEZIFISCHES Muster gezeichnet (Seed aus
   songId(), daher bei jedem Laden desselben Songs immer gleich, nicht
   zufaellig neu). Gespielter Bereich wird in Akzentfarbe eingefaerbt,
   Intro-/Outro-Skip-Zonen (siehe introSkipFor/outroSkipFor) etwas
   abgedunkelt -- so ist auch optisch sichtbar, welchen Teil des Videos
   der Player als "eigentlichen Song" behandelt. Klick/Zug ruft direkt
   player.seekTo() auf, siehe wireWaveformSeek(). */
var WAVEFORM_BAR_COUNT = 48;

function hashStr(str) {
  var h = 0;
  for (var i = 0; i < str.length; i++) { h = (Math.imul(31, h) + str.charCodeAt(i)) | 0; }
  return h >>> 0;
}
function seededRandom(seed) {
  var s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) | 0;
    var t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function buildWaveformBars(song) {
  var rand = seededRandom(hashStr(songId(song)));
  var bars = [];
  for (var i = 0; i < WAVEFORM_BAR_COUNT; i++) {
    var t = i / (WAVEFORM_BAR_COUNT - 1);
    /* sanfte Grundform: leiser am Anfang/Ende, voller in der Mitte --
       typische Songstruktur (Intro/Outro leiser als Refrain), plus
       Rauschen pro Balken fuer die "Zackigkeit" einer echten Wellenform. */
    var envelope = 0.32 + 0.68 * Math.sin(Math.PI * t);
    var noise = 0.5 + rand() * 0.5;
    bars.push(Math.max(0.1, Math.min(1, envelope * noise)));
  }
  return bars;
}
function ensureWaveformBars(key) {
  var deck = DECKS[key];
  if (!deck.song) { deck.waveformBars = null; deck.waveformSongId = null; return; }
  var sid = songId(deck.song);
  if (deck.waveformSongId === sid && deck.waveformBars) return;
  deck.waveformSongId = sid;
  deck.waveformBars = buildWaveformBars(deck.song);
}
var waveformAccentCache = null;
function waveformAccentColor() {
  /* Pro Dekaden-Seite unterschiedliche Akzentfarbe (siehe applyPalette) --
     einmal pro Zeichnen aus den CSS-Custom-Properties auflösen, damit die
     Wellenform automatisch zum jeweiligen Seiten-Theme passt. */
  try {
    return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#7c5cff';
  } catch (e) { return '#7c5cff'; }
}
function drawWaveform(key) {
  var deck = DECKS[key];
  var canvas = document.getElementById('deck-' + key + '-waveform-canvas');
  if (!canvas) return;
  ensureWaveformBars(key);
  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var cssW = canvas.clientWidth, cssH = canvas.clientHeight;
  if (!cssW || !cssH) return;
  if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  var bars = deck.waveformBars;
  if (!bars) return;

  var dur = 0, cur = 0;
  if (deck.player && deck.player.getDuration) {
    try { dur = deck.player.getDuration() || 0; cur = deck.player.getCurrentTime() || 0; } catch (e) {}
  }
  var progress = dur > 0 ? Math.max(0, Math.min(1, cur / dur)) : 0;
  var introFrac = dur > 0 ? introSkipFor(deck.song) / dur : 0;
  var outroFrac = dur > 0 ? 1 - (outroSkipFor(deck.song) / dur) : 1;

  var gap = 2;
  var barW = (cssW - gap * (bars.length - 1)) / bars.length;
  var midY = cssH / 2;
  var accent = waveformAccentColor();
  var playedUntilIdx = progress * bars.length;

  for (var i = 0; i < bars.length; i++) {
    var barH = Math.max(2, bars[i] * cssH);
    var x = i * (barW + gap);
    var y = midY - barH / 2;
    var barT = i / (bars.length - 1);
    var inSkipZone = barT < introFrac || barT > outroFrac;
    var played = i < playedUntilIdx;
    var alpha = inSkipZone ? (played ? 0.45 : 0.22) : (played ? 1 : 0.4);
    ctx.fillStyle = played
      ? hexToRgba(accent, alpha)
      : 'rgba(255,255,255,' + (alpha * 0.5) + ')';
    ctx.fillRect(x, y, Math.max(1, barW), barH);
  }
}
function hexToRgba(hex, alpha) {
  hex = (hex || '').trim();
  var m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return 'rgba(124,92,255,' + alpha + ')';
  var n = parseInt(m[1], 16);
  return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + alpha + ')';
}

/* Klick/Zug auf die Wellenform springt direkt an die entsprechende Stelle
   im Song -- waehrend des Ziehens (deck.seeking) ueberschreibt das 500ms-
   Polling (updateRemainingTime) die Anzeige nicht, sonst "kaempft" die
   gezeichnete Position mit der Maus. */
function wireWaveformSeek(key) {
  var el = document.getElementById('deck-' + key + '-waveform');
  if (!el) return;
  var deck = DECKS[key];
  function fractionFromEvent(ev) {
    var rect = el.getBoundingClientRect();
    var x = (ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left;
    return Math.max(0, Math.min(1, x / rect.width));
  }
  function seekToFraction(frac) {
    if (!deck.player || !deck.player.getDuration || !deck.player.seekTo) return;
    try {
      var dur = deck.player.getDuration();
      if (dur > 0) { deck.player.seekTo(dur * frac, true); drawWaveform(key); }
    } catch (e) {}
  }
  var dragging = false;
  el.addEventListener('pointerdown', function (ev) {
    if (!deck.song) return;
    dragging = true;
    deck.seeking = true;
    seekToFraction(fractionFromEvent(ev));
  });
  window.addEventListener('pointermove', function (ev) {
    if (!dragging) return;
    seekToFraction(fractionFromEvent(ev));
  });
  window.addEventListener('pointerup', function () {
    if (!dragging) return;
    dragging = false;
    deck.seeking = false;
  });
  el.addEventListener('keydown', function (ev) {
    if (!deck.player || !deck.player.getDuration) return;
    var step = 5;
    try {
      var dur = deck.player.getDuration();
      var cur = deck.player.getCurrentTime();
      if (ev.key === 'ArrowLeft') { deck.player.seekTo(Math.max(0, cur - step), true); drawWaveform(key); }
      else if (ev.key === 'ArrowRight') { deck.player.seekTo(Math.min(dur, cur + step), true); drawWaveform(key); }
    } catch (e) {}
  });
}
window.addEventListener('resize', function () { drawWaveform('A'); drawWaveform('B'); });

/* Digitales Display (Titel/Interpret/Restzeit/BPM): per Klick durchschaltbar
   zwischen 4 Farben, siehe .dj-deck-info in decades.css. Wahl bleibt pro
   Deck im Browser erhalten (localStorage), nicht seitenweit synchronisiert
   -- jedes Deck hat seine eigene Anzeige. */
var DIGITAL_DISPLAY_COLORS = ['green', 'blue', 'yellow', 'orange'];
function wireDigitalDisplay(key) {
  var el = document.getElementById('deck-' + key + '-info');
  if (!el) return;
  var storageKey = 'driftware-digital-color-' + key;
  function setColor(color, persist) {
    el.dataset.digital = color;
    var swatches = el.querySelectorAll('.dj-digital-swatch');
    swatches.forEach(function (sw) { sw.classList.toggle('active', sw.dataset.color === color); });
    if (persist) { try { localStorage.setItem(storageKey, color); } catch (e) {} }
  }
  var saved = null;
  try { saved = localStorage.getItem(storageKey); } catch (e) {}
  setColor(DIGITAL_DISPLAY_COLORS.indexOf(saved) !== -1 ? saved : 'green', false);

  var swatchWrap = el.querySelector('.dj-digital-swatches');
  if (swatchWrap) {
    swatchWrap.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.dj-digital-swatch');
      if (!btn) return;
      ev.stopPropagation();
      setColor(btn.dataset.color, true);
    });
  }
  /* Zusaetzlich zu den Punkten: Klick irgendwo sonst auf die Anzeige
     schaltet weiter zur naechsten Farbe (Punkte-Klick stoppt oben per
     stopPropagation, landet also nicht hier). */
  el.title = 'Klicken zum Farbwechsel';
  el.addEventListener('click', function () {
    var idx = DIGITAL_DISPLAY_COLORS.indexOf(el.dataset.digital);
    var next = DIGITAL_DISPLAY_COLORS[(idx + 1) % DIGITAL_DISPLAY_COLORS.length];
    setColor(next, true);
  });
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
    if (deck.player && deck.player.getDuration) {
      try {
        var dur = deck.player.getDuration();
        var cur = deck.player.getCurrentTime();
        if (dur > 0) {
          if (deck.isPlaying) {
            el.textContent = formatRemaining(dur - cur);
            /* Uebergang so timen, als wuerde der Song outroSkipFor()
               Sekunden frueher enden -- viele Songs klingen gegen Ende
               schon aus/werden leise, ohne diesen Vorlauf wuerde der
               Crossfade erst mitten in dieser bereits leisen Passage
               "greifen". */
            maybeStartAutoCrossfade(key, (dur - outroSkipFor(deck.song)) - cur);
          }
          /* Waehrend der Nutzer selbst an der Wellenform zieht (deck.seeking)
             nicht ueberschreiben -- sonst "kaempft" die Anzeige mit der Maus
             und springt beim Ziehen staendig zurueck. */
          if (!deck.seeking) drawWaveform(key);
          if (deck.isPlaying) return;
        }
      } catch (e) {}
    }
    if (deck.isPlaying) el.textContent = '';
  });
}
setInterval(updateRemainingTime, 500);
setInterval(maybeAutoRevertSoloPitch, 500);

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
  /* preloadedFor merkt sich, welcher Song stumm fuer eine automatische
     Weiterschaltung vorbereitet wurde (siehe maybePreloadNext). Wird das
     Deck jetzt mit einem ANDEREN Song befuellt (z.B. per Drag&Drop, nicht
     ueber die Warteschlangen-Fortsetzung), stimmt diese Markierung nicht
     mehr -- ohne diese Zeile haelt maybeStartAutoCrossfade sie trotzdem
     noch fuer gueltig und startet irgendwann unerwartet ein automatisches
     Überblenden zu einem ganz anderen Song, als der Nutzer gerade manuell
     geladen hat (und activeAutoFade blockiert dann auch "Fade jetzt"). */
  if (deck.preloadedFor !== songId(song)) deck.preloadedFor = null;
  updateDeckInfoUI(key);
  var bar = ensureDjPlayer();

  /* Neuer Song -- laufender Ziehvorgang auf der alten Wellenform beenden. */
  deck.seeking = false;

  /* Kein YouTube-Video fuer diesen Song gefunden — statt den Ladevorgang
     abzulehnen (frueher: alert()), wird der Song trotzdem als "geladen"
     angezeigt (Titel/Artist/BPM, ⏮/⏭ funktionieren weiter durch die
     Liste), nur die Vinyl-Scheibe zeigt statt eines Players unser Logo. */
  if (!song.yt) {
    if (deck.player) { try { deck.player.destroy(); } catch (e) {} deck.player = null; }
    var mount = document.getElementById('deck-' + key + '-mount');
    if (mount) mount.innerHTML = '<div class="dj-vinyl-video-logo">' + DRIFTWARE_LOGO_SVG + '</div>';
    deck.isPlaying = false;
    updateDeckInfoUI(key);
    return;
  }

  function start() {
    if (deck.player && deck.player.loadVideoById) {
      if (autoplay) {
        deck.player.loadVideoById(song.yt, introSkipFor(song));
      } else {
        deck.player.cueVideoById(song.yt, introSkipFor(song));
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
        playerVars: { rel: 0, playsinline: 1, autoplay: autoplay ? 1 : 0, start: introSkipFor(song) },
        events: {
          onReady: function (e) {
            try { e.target.setPlaybackRate(deck.rate || 1); } catch (err) {}
            if (autoplay) { e.target.playVideo(); }
            applyCrossfaderVolumes();
          },
          onStateChange: onDeckStateChange(key),
          onError: function () {
            deckErrorStreak[key] = (deckErrorStreak[key] || 0) + 1;
            if (deckErrorStreak[key] > 5) {
              /* Sicherheitsbremse: 5+ kaputte Videos in Folge -- nicht
                 weiter durch die Liste hetzen, sondern anhalten. Deck
                 bleibt auf dem zuletzt geladenen (fehlerhaften) Song
                 stehen, Titel/BPM/Skip-Buttons funktionieren weiter, nur
                 das automatische Weiterspringen stoppt. */
              try { console.warn('driftware: ' + deckErrorStreak[key] + ' Videofehler in Folge auf Deck ' + key + ' -- Auto-Skip gestoppt.'); } catch (err) {}
              return;
            }
            deckStep(key, 1, true);
          }
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
  if (!song) return;
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
  if (deck.isPlaying) {
    cancelActiveAutoFade(key);
    deck.player.pauseVideo();
  } else {
    /* Ein per maybePreloadNext() vorgeladenes Deck steht stumm da
       (setVolume(0), siehe dort) -- wird es NICHT ueber Gapless-Handoff
       oder Autofade aktiv, sondern der Nutzer druecht hier direkt Play,
       blieb der Player bisher lautlos, weil applyCrossfaderVolumes() nur
       in den anderen Uebergangs-Pfaden aufgerufen wurde. */
    deck.player.playVideo();
    applyCrossfaderVolumes();
  }
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

/* Cloudflare-Worker-Proxy, siehe shared/manualadd.js -- schreibt serverseitig
   (per gehaltenem GitHub-Token) in queue/fehlende-lieder.json. Die taegliche
   GitHub Action (tools/process_missing_queue.py) erkennt einen Eintrag mit
   g+y zu einem Song, der in der Ziel-songs.json bereits existiert (meist im
   Bucket "Ohne"), und verschiebt ihn nur in den gewaehlten Bucket -- keine
   erneute Discogs-/YouTube-Suche noetig, alle vorhandenen Song-Daten
   (Cover, YouTube-Link etc.) bleiben erhalten. */
var GENRE_FIX_PROXY_URL = 'https://driftware-warteliste-proxy.welove80sde.workers.dev/';

function submitGenreFix(song, genreKey, statusEl, selectEl, saveBtn) {
  statusEl.textContent = 'Wird gespeichert …';
  saveBtn.disabled = true;
  selectEl.disabled = true;
  fetch(GENRE_FIX_PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ a: song.a, t: song.t, g: genreKey, y: song.y })
  })
    .then(function (r) { if (!r.ok) throw new Error('write-failed'); return r; })
    .then(function () {
      statusEl.textContent = 'Gespeichert ✓ -- erscheint in Kürze (spätestens am nächsten Tag) im gewählten Genre.';
      song._bucket = genreKey; /* verhindert doppeltes Absenden, solange das Modal offen bleibt */
      saveBtn.textContent = 'Gespeichert';
    })
    .catch(function () {
      statusEl.textContent = 'Fehlgeschlagen -- bitte später erneut versuchen.';
      saveBtn.disabled = false;
      selectEl.disabled = false;
    });
}

/* Baut/verdrahtet den "Genre bearbeiten"-Bereich im Song-Modal. Nur
   sichtbar, wenn der Song aktuell im Bucket "Ohne" dieser Dekaden-Seite
   steckt (song._bucket, siehe refresh()) UND die Seite ein eigenes
   Genre-Set hat (activeDecadeThemes) -- Suchergebnisse/Mix haben keinen
   bekannten Bucket und zeigen den Button daher nicht. */
function setupGenreEditUI(song) {
  var toggleBtn = document.getElementById('song-modal-edit-genre-toggle');
  var editBox = document.getElementById('song-modal-genre-edit');
  var selectEl = document.getElementById('song-modal-genre-select');
  var saveBtn = document.getElementById('song-modal-genre-save');
  var statusEl = document.getElementById('song-modal-genre-status');
  if (!toggleBtn || !editBox || !selectEl || !saveBtn || !statusEl) return;

  editBox.hidden = true;
  statusEl.textContent = '';
  saveBtn.disabled = false;
  saveBtn.textContent = 'Speichern';
  selectEl.disabled = false;

  var canEdit = song._bucket === 'Ohne' && activeDecadeThemes && activeDecadeThemes.length;
  toggleBtn.hidden = !canEdit;
  if (!canEdit) return;

  selectEl.innerHTML = activeDecadeThemes
    .filter(function (t) { return t.key !== 'Ohne'; })
    .map(function (t) { return '<option value="' + t.key + '">' + escapeHtml(t.label) + '</option>'; })
    .join('');

  toggleBtn.onclick = function () { editBox.hidden = !editBox.hidden; };
  saveBtn.onclick = function () {
    if (!selectEl.value) return;
    submitGenreFix(song, selectEl.value, statusEl, selectEl, saveBtn);
  };
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
    /* Kein YouTube-Video, aber ein VK-Link wurde manuell hinterlegt (siehe
       shared/manualadd.js) -- dann statt "Kein Video gefunden" einen Link
       zum Anschauen auf VK anbieten. Kein automatisches Einbetten (VK bietet
       keine Fernsteuerung wie die YouTube-IFrame-API), nur Verlinkung. */
    if (song.yt) {
      playBtn.disabled = false;
      playBtn.innerHTML = PLAY_SVG + ' Song abspielen';
      playBtn.onclick = function () { playSongInContext(song, lastGridSongs); };
    } else if (song.vk) {
      playBtn.disabled = false;
      playBtn.innerHTML = EXTERNAL_LINK_SVG + ' Auf VK ansehen';
      playBtn.onclick = function () { window.open(song.vk, '_blank', 'noopener'); };
    } else {
      playBtn.disabled = true;
      playBtn.innerHTML = PLAY_SVG + ' Kein Video gefunden';
      playBtn.onclick = null;
    }
  }

  setupGenreEditUI(song);

  document.getElementById('song-modal-streaming').innerHTML = streamingLinksHTML(song);

  var link = document.getElementById('song-modal-link');
  if (song.u) { link.href = song.u; link.style.display = ''; } else { link.style.display = 'none'; }

  var vkLink = document.getElementById('song-modal-vk-link');
  if (vkLink) {
    if (song.vk) { vkLink.href = song.vk; vkLink.style.display = ''; } else { vkLink.style.display = 'none'; }
  }

  overlay.classList.add('open');
}

/* Kleine Schallplatte als Drag-Bild (statt der ganzen Song-Kachel) --
   ein einzelnes wiederverwendetes Element off-screen, dessen Cover-Bild
   pro dragstart aktualisiert wird (siehe renderSongGrid). Groesse und
   Optik lehnen sich an .dj-vinyl-disc im Player an (siehe decades.css). */
var DRAG_GHOST_SIZE = 150;
var dragGhostEl = null;
function ensureDragGhost(song) {
  if (!dragGhostEl) {
    dragGhostEl = document.createElement('div');
    dragGhostEl.className = 'drag-vinyl-ghost';
    dragGhostEl.innerHTML = '<div class="drag-vinyl-ghost-label"><img id="drag-vinyl-ghost-img" alt=""></div>';
    document.body.appendChild(dragGhostEl);
  }
  var img = dragGhostEl.querySelector('#drag-vinyl-ghost-img');
  img.src = song.th || song.cv || '';
  return dragGhostEl;
}

/* Song-Liste: eine Zeile pro Song, Titel zuerst und fett, Interpret
   darunter/daneben klein. Icons (Info/Play/Haken) sind eine normale
   Reihe am rechten Rand statt Overlays auf einem großen Cover. */
/* Obergrenze fuer gleichzeitig gerenderte Song-Kacheln. Jede Kachel bekommt
   mehrere addEventListener() (Info, Play, Klick, Drag) -- ein sehr breites
   Suchergebnis (z.B. ein kurzer/haeufiger Suchbegriff ueber ALLE Dekaden
   hinweg, das kann leicht mehrere tausend Treffer geben) hat den Tab sonst
   beim synchronen Aufbau tausender DOM-Knoten in einem Rutsch spuerbar
   ausgebremst bis hin zum Haengenbleiben. Playlist-Laden/Export (currentSongs())
   ist davon NICHT betroffen -- nur die sichtbare Kachel-Darstellung wird
   gekappt, die volle Liste bleibt fuer Deck/CSV etc. erhalten (lastGridSongs
   haelt trotzdem die volle, ungekuerzte Liste, siehe playSongInContext). */
var MAX_RENDERED_TILES = 500;

function renderSongGrid(container, songs) {
  lastGridSongs = songs;
  container.innerHTML = '';
  var truncated = songs.length > MAX_RENDERED_TILES;
  var visible = truncated ? songs.slice(0, MAX_RENDERED_TILES) : songs;
  visible.forEach(function (song) {
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
    var hasVkFallback = !song.yt && !!song.vk;
    play.className = 'song-tile-play' + ((song.yt || hasVkFallback) ? '' : ' disabled') + (hasVkFallback ? ' song-tile-play-vk' : '');
    play.innerHTML = hasVkFallback ? EXTERNAL_LINK_SVG : PLAY_SVG;
    play.setAttribute('role', 'button');
    play.setAttribute('tabindex', (song.yt || hasVkFallback) ? '0' : '-1');
    play.setAttribute('aria-label', song.yt ? ('Abspielen: ' + song.a + ' – ' + song.t) : (hasVkFallback ? ('Auf VK ansehen: ' + song.a + ' – ' + song.t) : 'Kein Video gefunden'));
    if (song.yt) {
      play.addEventListener('click', function (e) { e.stopPropagation(); playSongInContext(song, songs); });
      play.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); playSongInContext(song, songs); }
      });
    } else if (hasVkFallback) {
      play.addEventListener('click', function (e) { e.stopPropagation(); window.open(song.vk, '_blank', 'noopener'); });
      play.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); window.open(song.vk, '_blank', 'noopener'); }
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

    /* Auch ohne Video ziehbar (zeigt dann unser Logo auf dem Deck statt
       eines Players, siehe playDeckSong) — nur der Klick-Play-Button
       bleibt bei fehlendem Video deaktiviert. Als Drag-Bild NICHT die
       ganze Kachel (Browser-Standard) verwenden, sondern eine kleine
       Schallplatte in Deck-Groesse (siehe ensureDragGhost) -- so sieht
       das Ziehen aus wie das Auflegen einer Platte, nicht wie das
       Verschieben einer großen Karte. */
    tile.draggable = true;
    tile.addEventListener('dragstart', function (e) {
      /* setData zuerst und fuer sich allein -- das ist die einzige Zeile, die
         fuer den Drop wirklich zaehlt (siehe dropzone.addEventListener('drop')
         weiter unten). Das Schallplatten-Drag-Bild ist nur Optik: wenn das aus
         irgendeinem Grund fehlschlaegt (aeltere/eigenwillige Browser), soll das
         NIEMALS den Drop selbst verhindern -- deshalb in einem eigenen try/catch. */
      try {
        e.dataTransfer.setData('application/json', JSON.stringify(song));
        e.dataTransfer.effectAllowed = 'copy';
      } catch (err) {}
      try {
        if (typeof e.dataTransfer.setDragImage === 'function') {
          var ghost = ensureDragGhost(song);
          e.dataTransfer.setDragImage(ghost, DRAG_GHOST_SIZE / 2, DRAG_GHOST_SIZE / 2);
        }
      } catch (err) {}
      tile.classList.add('dragging');
      /* Ist in einem Deck bereits ein Video geladen, liegt dessen iframe
         optisch ueber dem Drop-Bereich. pointer-events: none auf dem iframe
         reicht in der Praxis nicht zuverlaessig, um dragover/drop beim
         echten OS-Drag durchzulassen -- das Deck "schluckt" den Drop dann
         stillschweigend (nur beim leeren Deck, ohne iframe, klappte es).
         Waehrend eines Drags legt sich deshalb ein transparentes Shield
         (siehe .dj-vinyl-dragshield) ueber JEDES Deck, das die drop-Events
         zuverlaessig selbst empfaengt und an den Dropzone-Handler weiterreicht. */
      document.body.classList.add('dnd-dragging');
    });
    tile.addEventListener('dragend', function () {
      tile.classList.remove('dragging');
      document.body.classList.remove('dnd-dragging');
    });

    container.appendChild(tile);
  });
  if (truncated) {
    var notice = document.createElement('div');
    notice.className = 'song-grid-truncated-notice';
    notice.textContent = 'Zeige die ersten ' + MAX_RENDERED_TILES + ' von ' + songs.length + ' Treffern — bitte genauer suchen oder filtern, um den Rest zu sehen.';
    container.appendChild(notice);
  }
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
  UKBassGrimeDrill: 'bass', Soul: 'vinyl', NeoSoul: 'vinyl', AcidJazz: 'horn', SmoothJazz: 'cocktail', NDW: 'synth'
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
  activeDecadeThemes = config.themes || null;
  var data = null;
  var currentTheme = null;
  var mixSongsCache = null;
  var genreSongsCache = null; /* {theme, songs} -- BPM-geglaettete Reihenfolge fuer die aktuell gewaehlte Genre-Kachel, siehe currentSongs() */
  var allSongsFlat = null;
  var searchDebounceHandle = null;
  var searchToken = 0;
  var ownDecadeKey = config.csvPrefix || null;
  var ownDecadeLabel = (DECADE_REGISTRY.filter(function (d) { return d.key === ownDecadeKey; })[0] || {}).label || 'dieser Dekade';
  var neighborDecades = neighborDecadesOf(ownDecadeKey);

  /* "Dekade verbinden": blendet die Playlist mit einer direkt angrenzenden
     Dekade (siehe neighborDecadesOf) -- fuer den aktuell gewaehlten Mix/Genre
     werden die Songs beider Dekaden zusammengefuehrt und einmal gemeinsam
     gemischt (linkedComboCache), damit Grid/CSV/Deck-Laden konsistent
     bleiben, bis Dekade oder Auswahl gewechselt wird (siehe computeLinkedCombo). */
  var linkedDecadeKey = null;
  var linkedRawData = null;
  var linkedComboCache = null;

  function computeLinkedCombo() {
    if (!linkedDecadeKey || !linkedRawData || !currentTheme) { linkedComboCache = null; return; }
    var ownList = currentTheme === MIX_KEY ? buildMixSongs() : (data[currentTheme] || []);
    var otherList = currentTheme === MIX_KEY ? buildMixSongsFrom(linkedRawData) : (linkedRawData[currentTheme] || []);
    if (!otherList.length) { linkedComboCache = { theme: currentTheme, songs: ownList }; return; }
    /* Herkunft markieren -- renderSongGrid zeigt dafuer automatisch ein
       Dekaden-Badge (dieselbe Markierung wie bei dekadenuebergreifenden
       Suchtreffern, siehe searchAllDecades). */
    otherList.forEach(function (s) { s._decade = linkedDecadeKey; });
    var seen = {};
    var combined = [];
    ownList.forEach(function (s) { var id = songId(s); if (seen[id]) return; seen[id] = true; combined.push(s); });
    otherList.forEach(function (s) { var id = songId(s); if (seen[id]) return; seen[id] = true; combined.push(s); });
    linkedComboCache = { theme: currentTheme, songs: bpmSmooth(shuffled(combined)) };
  }

  function updateLinkChipsUI() {
    mountRoot.querySelectorAll('.decade-link-chip').forEach(function (c) {
      var active = c.dataset.key === linkedDecadeKey;
      c.classList.toggle('active', active);
      c.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function toggleLinkedDecade(key) {
    manualShuffleTheme = null;
    manualShuffleSongs = null;
    if (linkedDecadeKey === key) {
      linkedDecadeKey = null;
      linkedRawData = null;
      linkedComboCache = null;
      updateLinkChipsUI();
      refresh();
      return;
    }
    linkedDecadeKey = key;
    linkedRawData = null;
    linkedComboCache = null;
    updateLinkChipsUI();
    refresh(); // zeigt sofort die eigene Dekade, waehrend die Nachbar-Daten laden
    fetchRawDecadeData(key).then(function (json) {
      if (linkedDecadeKey !== key) return; // in der Zwischenzeit abgewaehlt/gewechselt
      linkedRawData = json;
      computeLinkedCombo();
      refresh();
    });
  }

  /* Mix-Button: aus JEDER Kategorie die 5 beliebtesten Songs (Discogs-'have'-
     Zahl als Popularitäts-Proxy, dieselbe Kennzahl wie im README erklärt). */
  function buildMixSongs() {
    return buildMixSongsFrom(data);
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
    if (manualShuffleTheme === currentTheme && manualShuffleSongs) return manualShuffleSongs;
    if (linkedDecadeKey && linkedComboCache && linkedComboCache.theme === currentTheme) {
      return linkedComboCache.songs;
    }
    if (currentTheme === MIX_KEY) {
      if (!mixSongsCache) mixSongsCache = bpmSmooth(shuffled(buildMixSongs()));
      return mixSongsCache;
    }
    if (!currentTheme) return [];
    if (!genreSongsCache || genreSongsCache.theme !== currentTheme) {
      genreSongsCache = { theme: currentTheme, songs: bpmSmooth(data[currentTheme] || []) };
    }
    return genreSongsCache.songs;
  }

  /* Manuelles Neu-Mischen ueber den "Playlist neu mischen"-Button --
     merkt sich die gemischte Reihenfolge nur fuer die aktuell gewaehlte
     Kategorie (wie mixSongsCache fuer den Mix), damit Grid, CSV-Export
     und "Playlist auf Deck laden" konsistent bleiben, bis neu gemischt
     oder das Genre gewechselt wird. */
  var manualShuffleTheme = null;
  var manualShuffleSongs = null;

  function reshuffleCurrentPlaylist() {
    if (!currentTheme) return;
    manualShuffleTheme = currentTheme;
    manualShuffleSongs = bpmSmooth(shuffled(currentSongs()));
    refresh();
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
    var songs = currentSongs();
    if (currentTheme && currentTheme !== MIX_KEY) {
      songs.forEach(function (s) { s._bucket = currentTheme; });
    }
    var countLabel = songs.length + ' Songs';
    if (linkedDecadeKey) {
      var linkedEntry = DECADE_REGISTRY.filter(function (d) { return d.key === linkedDecadeKey; })[0];
      var linkedLabel = linkedEntry ? linkedEntry.label.replace(' Music', '') : linkedDecadeKey;
      countLabel += linkedRawData ? (' · verbunden mit ' + linkedLabel) : (' · lade ' + linkedLabel + ' …');
    }
    document.getElementById('gen-count').textContent = countLabel;
    renderSongGrid(document.getElementById('gen-grid'), songs);
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
    manualShuffleTheme = null;
    manualShuffleSongs = null;
    linkedComboCache = null;
    clearSearchUI();
    mountRoot.querySelectorAll('.theme-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.key === key);
    });
    document.getElementById('gen-actions').classList.add('visible');
    loadData().then(function () {
      if (linkedDecadeKey && linkedRawData) computeLinkedCombo();
      refresh();
    });
    /* Zuletzt gewaehltes Genre pro Dekade/Seite merken (siehe weiter unten,
       initialer Aufruf) -- beim naechsten Besuch (auch per Dekaden-Wechsel-
       Zeile) landet man wieder dort, statt immer beim ersten Genre. */
    if (ownDecadeKey) {
      try { localStorage.setItem('driftware-last-genre-' + ownDecadeKey, key); } catch (e) {}
    }
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
    '<p class="sub">Songs anklicken für einen grünen Haken, ⓘ zeigt alle Song-Infos. Auswahl direkt an deinen Streaming-Dienst senden.</p>' +
    '<div class="generator-search">' +
    '  <div class="search-box">' +
    '    <span class="search-box-icon">' + SEARCH_SVG + '</span>' +
    '    <input type="search" id="gen-search" class="search-input" placeholder="Song, Künstler oder Genre suchen — alle Dekaden …" autocomplete="off">' +
    '  </div>' +
    '  <p class="search-hint" id="gen-search-hint" hidden></p>' +
    '</div>' +
    switchRowHTML() +
    (neighborDecades.length ? (
      '<div class="decade-link-row">' +
      '  <span class="decade-link-label">' + LINK_SVG + ' Dekade verbinden:</span>' +
      neighborDecades.map(function (n) {
        return '<button class="decade-link-chip" type="button" data-key="' + n.key + '" aria-pressed="false">' + escapeHtml(n.label.replace(' Music', '')) + '</button>';
      }).join('') +
      '</div>'
    ) : '') +
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
    '  <button id="gen-shuffle" type="button" title="Reihenfolge neu mischen">' + SHUFFLE_SVG + ' Playlist neu mischen</button>' +
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

  wireSwitchRow(section);

  var linkRow = section.querySelector('.decade-link-row');
  if (linkRow) {
    linkRow.addEventListener('click', function (e) {
      var chip = e.target.closest('.decade-link-chip');
      if (!chip) return;
      toggleLinkedDecade(chip.dataset.key);
    });
  }

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
  restoreDjState();
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
  section.querySelector('#gen-shuffle').addEventListener('click', function () {
    reshuffleCurrentPlaylist();
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
    /* Nicht immer stur das erste Genre -- zuletzt gewaehltes Genre fuer
       DIESE Dekade wiederherstellen (siehe selectTheme), sonst Mix als
       sinnvollerer Standard-Einstieg als ein zufaelliges erstes Genre. */
    var lastGenre = null;
    if (ownDecadeKey) {
      try { lastGenre = localStorage.getItem('driftware-last-genre-' + ownDecadeKey); } catch (e) {}
    }
    var validKeys = [MIX_KEY].concat(config.themes.map(function (t) { return t.key; }));
    var initialTheme = (lastGenre && validKeys.indexOf(lastGenre) !== -1) ? lastGenre : MIX_KEY;
    selectTheme(initialTheme);
  } else {
    showEmptyState();
  }

  try {
    var incomingQuery = new URLSearchParams(location.search).get('q');
    if (incomingQuery) { searchInput.value = incomingQuery; runSearch(incomingQuery); }
  } catch (e) {}
}
