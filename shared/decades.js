/* Gemeinsame Render-Logik fuer alle Dekaden-Seiten (80er, 90er, 2000er, ...).
   Jede Dekaden-Seite definiert nur ein DECADE-Konfigurationsobjekt und ruft
   eine der drei render*-Funktionen unten auf. So bleibt jede neue Dekade
   ein kleines Config-File statt kopiertem HTML/CSS/JS. */

/* Club-Console-Themes (Nutzerwunsch 9.10.: "fuer jedes Jahrzehnt den Style
   anpassen, auch fuer die verschiedenen Stimmungen"). Schluessel = Ordner-
   name ohne "-music" (aus der URL, siehe pageThemeKey -- bei AJAX-Navigation
   ist die URL bereits per pushState umgestellt, bevor dieser Code laeuft).
   Ueberschreibt die Farben aus dem cfg.colors der jeweiligen Seite; a/b
   sind die beiden Deck-Farben. Schrift + Hintergrund-Effekte je Theme
   stehen in decades.css unter [data-theme="..."]. */
var CC_THEMES = {
  '70er':        ['#120c07', '#1d140c', '#e08a2c', '#f5b82e', '#fbefdc', '#b39b7d', '#f5b82e', '#e4572e'],
  '80er':        ['#0b0618', '#160c2b', '#ff2e93', '#22d3ee', '#fdf2ff', '#a78bcb', '#22d3ee', '#ff2e93'],
  '90er':        ['#0b0d08', '#151a0f', '#84cc16', '#c084fc', '#f1f5e8', '#9aa58a', '#a3e635', '#c084fc'],
  '2000er':      ['#060a12', '#0f1828', '#38bdf8', '#d4d4d8', '#eef6ff', '#8ea3c0', '#38bdf8', '#e5e7eb'],
  '2010er':      ['#0e0a0d', '#1a1319', '#fb7185', '#fbbf24', '#fff4f6', '#b3949b', '#fb7185', '#fbbf24'],
  '2020er':      ['#050505', '#111111', '#bef264', '#f0abfc', '#fafafa', '#a1a1aa', '#bef264', '#f0abfc'],
  'afterwork':   ['#100b06', '#1c140c', '#f59e0b', '#d97757', '#fdf3e3', '#b8a184', '#f59e0b', '#d97757'],
  'chillhouse':  ['#071211', '#0f1f1e', '#14b8a6', '#f97316', '#ecfdfa', '#93b5b0', '#2dd4bf', '#fb923c'],
  'christmas':   ['#06120c', '#0f2018', '#dc2626', '#facc15', '#fffaf0', '#a7b8a5', '#ef4444', '#facc15'],
  'cozy':        ['#0b0f15', '#151c26', '#6fa3d8', '#c08a5a', '#eef3f8', '#9aa7b6', '#7fb2e5', '#d4a373'],
  'dinnerparty': ['#10081a', '#1d0f2b', '#c026d3', '#f472b6', '#fbefff', '#b39ac4', '#e879f9', '#f472b6'],
  'focuswork':   ['#060b18', '#0e1628', '#3b82f6', '#a78bfa', '#eef4ff', '#8fa2c4', '#60a5fa', '#a78bfa'],
  'gaming':      ['#07051a', '#120d2b', '#8b5cf6', '#22d3ee', '#f1edff', '#a49cc8', '#22d3ee', '#a855f7'],
  'grill':       ['#120b06', '#20140b', '#ff6a2b', '#7bbf3a', '#fff2e8', '#b9a08a', '#ff8a3d', '#8bd34a'],
  'haushalt':    ['#061212', '#0e1f1f', '#1fb5a8', '#f5c542', '#ebfffd', '#93b8b4', '#2dd4bf', '#f5c542'],
  'karaoke':     ['#13060d', '#22101a', '#ff3d81', '#ffd23f', '#fff0f6', '#c49aae', '#ff3d81', '#ffd23f'],
  'latenight':   ['#05051a', '#0d0d2a', '#6366f1', '#c084fc', '#eef0ff', '#9496c7', '#818cf8', '#c084fc'],
  'morning':     ['#110d06', '#1f180c', '#fbbf24', '#fb7185', '#fff8e8', '#bfae8c', '#fbbf24', '#fb7185'],
  'nostalgie':   ['#120d07', '#20170e', '#f2994a', '#9b51e0', '#fdf1e6', '#b9a186', '#f2994a', '#b77cf0'],
  'partyhits':   ['#0f0614', '#1c0d26', '#ff2ea6', '#ff8a00', '#fff7ed', '#c4a3c9', '#ff8a00', '#ff2ea6'],
  'roadtrip':    ['#0b0d12', '#161a22', '#f97316', '#0ea5e9', '#f4f7fb', '#9aa4b4', '#f97316', '#38bdf8'],
  'romantic':    ['#12060b', '#211019', '#e0446b', '#f9a8d4', '#fff0f4', '#c39aa8', '#fb7185', '#f9a8d4'],
  'summer':      ['#061114', '#0e1f24', '#ff9e2c', '#15b8c9', '#effbfc', '#93b2b8', '#ffb547', '#22d3ee'],
  'workout':     ['#120606', '#211010', '#ef4444', '#f97316', '#fff1f1', '#c19b9b', '#f87171', '#fb923c'],
  'yoga':        ['#0b1312', '#13211f', '#7fc8a9', '#a5b4fc', '#effaf5', '#9db8ae', '#7fc8a9', '#a5b4fc']
};
function pageThemeKey() {
  var m = /\/([^\/]+)-music\//.exec(location.pathname);
  return m && CC_THEMES[m[1]] ? m[1] : null;
}
function applyPalette(colors) {
  var root = document.documentElement.style;
  var key = pageThemeKey();
  var t = key ? CC_THEMES[key] : null;
  if (t) {
    colors = { bg: t[0], panel: t[1], accent: t[2], accent2: t[3], text: t[4], muted: t[5] };
    root.setProperty('--deck-a', t[6]);
    root.setProperty('--deck-b', t[7]);
    document.documentElement.setAttribute('data-theme', key);
  } else {
    root.setProperty('--deck-a', (colors && colors.accent) || '#7c5cff');
    root.setProperty('--deck-b', (colors && colors.accent2) || '#2dd4bf');
    document.documentElement.removeAttribute('data-theme');
  }
  Object.keys(colors || {}).forEach(function (key) {
    root.setProperty('--' + key, colors[key]);
  });
  if (typeof drawWaveform === 'function' && document.getElementById('dj-player')) { drawWaveform('A'); drawWaveform('B'); }
}

/* Geraete-Typ-Check: setzt data-device="phone|tablet|desktop" auf <html>,
   damit CSS/JS bei Bedarf gezielt nach Geraetekategorie statt nur nach
   roher Fensterbreite unterscheiden kann (z.B. ein Handy im Querformat mit
   ~800px Breite soll trotzdem als "phone" gelten, nicht wie ein iPad
   behandelt werden). Rein additiv/informativ -- das eigentliche Layout
   laeuft weiterhin ueber CSS-Breakpoints (Fensterbreite ist fuer die
   Platzfrage relevanter als die Geraeteklasse); dieses Attribut ist dazu
   da, kuenftige Layout-Entscheidungen ausdruecklich nach "Handy" vs.
   "iPad/Web" trennen zu koennen, statt es aus der Pixelzahl zu erraten.
   iPadOS meldet sich seit iOS 13 standardmaessig als Desktop-Safari (UA
   enthaelt "Macintosh") -- deshalb zusaetzlich ueber Touch-Support +
   maxTouchPoints erkannt. */
function detectDeviceType() {
  try {
    var ua = navigator.userAgent || '';
    var isIPadUA = /iPad/.test(ua) ||
      (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    var isPhoneUA = /iPhone|iPod/.test(ua) ||
      (/Android/.test(ua) && /Mobile/.test(ua)) ||
      /Windows Phone/.test(ua);
    var isAndroidTabletUA = /Android/.test(ua) && !/Mobile/.test(ua);
    var coarsePointer = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    var minSide = Math.min(window.screen.width || 0, window.screen.height || 0);

    var type;
    if (isPhoneUA) {
      type = 'phone';
    } else if (isIPadUA || isAndroidTabletUA) {
      type = 'tablet';
    } else if (coarsePointer && minSide > 0 && minSide < 600) {
      // Touch-Geraet ohne eindeutige UA-Kennung, aber schmale kurze
      // Bildschirmseite -- eher Handy als Tablet.
      type = 'phone';
    } else if (coarsePointer && minSide >= 600) {
      type = 'tablet';
    } else {
      type = 'desktop';
    }
    document.documentElement.setAttribute('data-device', type);
  } catch (e) {
    // Erkennung ist informativ, nie kritisch -- bei Fehler einfach nichts
    // setzen statt die Seite zu blockieren.
  }
}
detectDeviceType();

var HOME_SVG = '<svg viewBox="0 0 24 24" fill="#f5cb7a" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.5 1.5 11h3V21h6v-6h3v6h6V11h3L12 2.5z"/></svg>';
var MAIL_SVG = '<svg viewBox="0 0 24 24" fill="#bfe0ff" xmlns="http://www.w3.org/2000/svg"><path d="M2 5h20v14H2V5zm2 2v.4l8 5.4 8-5.4V7H4zm16 2.9-8 5.4-8-5.4V17h16V9.9z"/></svg>';
var LOCK_SVG = '<svg viewBox="0 0 24 24" fill="#d6cbfa" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z"/></svg>';
var GRID_SVG = '<svg viewBox="0 0 24 24" fill="#8fe3c7" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6"/></svg>';

/* Player-Bediensymbole: dezente Linien-/Flaechen-Icons statt Emoji, gleicher
   Grund wie bei den Genre-Kacheln (siehe THEME_ICON_PATHS weiter unten). */
var PLAY_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
/* Warteschlange-Icon (9.9., Nutzerwunsch: Klick auf die Song-Kachel soll den
   Song in die Warteschlange legen statt sofort ein Deck zu belegen -- Icon
   entsprechend von "Play" auf "Hinzufuegen" getauscht, siehe renderSongGrid). */
var QUEUE_ADD_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
var EXTERNAL_LINK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>';
var PAUSE_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
var PREV_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h2v14H6z"/><path d="M20 5v14l-11-7z"/></svg>';
var NEXT_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 5h2v14h-2z"/><path d="M4 5v14l11-7z"/></svg>';
var SEARCH_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-5-5"/></svg>';
var REFRESH_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 0 1 14-5.3M20 4v5h-5"/><path d="M20 12a8 8 0 0 1-14 5.3M4 20v-5h5"/></svg>';
/* Einheitliche Linien-Icons fuer die Bibliotheks-Toolbar (9.10., statt Emojis). */
function ccIcon(paths) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>'; }
var CC_ICON = {
  lib: ccIcon('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'),
  dice: ccIcon('<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1" fill="currentColor"/>'),
  cal: ccIcon('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
  heart: ccIcon('<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/>'),
  flame: ccIcon('<path d="M12 2c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>')
};
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
  { slug: '70er', folder: '70er-music', label: '70er', group: 'Dekades', color: '#c9762f' },
  { slug: '80er', folder: '80er-music', label: '80er', group: 'Dekades', color: '#ff2fb3' },
  { slug: '90er', folder: '90er-music', label: '90er', group: 'Dekades', color: '#29e2ff' },
  { slug: '2000er', folder: '2000er-music', label: '2000er', group: 'Dekades', color: '#4a90d9' },
  { slug: '2010er', folder: '2010er-music', label: '2010er', group: 'Dekades', color: '#8b5cf6' },
  { slug: '2020er', folder: '2020er-music', label: '2020er', group: 'Dekades', color: '#8bc34a' },
  { slug: 'afterwork', folder: 'afterwork-music', label: 'Afterwork', group: 'Stimmungen', color: '#d98c1f' },
  { slug: 'chillhouse', folder: 'chillhouse-music', label: 'Chill House', group: 'Stimmungen', color: '#1c8f6f' },
  { slug: 'christmas', folder: 'christmas-music', label: 'Christmas', group: 'Stimmungen', color: '#e0453f' },
  { slug: 'dinnerparty', folder: 'dinnerparty-music', label: 'Dinner Party', group: 'Stimmungen', color: '#d9527c' },
  { slug: 'focuswork', folder: 'focuswork-music', label: 'Focus & Work', group: 'Stimmungen', color: '#4ecdc4' },
  { slug: 'gaming', folder: 'gaming-music', label: 'Gaming', group: 'Stimmungen', color: '#8b5cf6' },
  { slug: 'grill', folder: 'grill-music', label: 'Grill & Garten', group: 'Stimmungen', color: '#ff6a2b' },
  { slug: 'haushalt', folder: 'haushalt-music', label: 'Haushalt & Putzen', group: 'Stimmungen', color: '#1fb5a8' },
  { slug: 'karaoke', folder: 'karaoke-music', label: 'Karaoke', group: 'Stimmungen', color: '#ff3d81' },
  { slug: 'latenight', folder: 'latenight-music', label: 'Late Night', group: 'Stimmungen', color: '#6a5acd' },
  { slug: 'morning', folder: 'morning-music', label: 'Morning', group: 'Stimmungen', color: '#f2b705' },
  { slug: 'nostalgie', folder: 'nostalgie-music', label: 'Nostalgie', group: 'Stimmungen', color: '#f2994a' },
  { slug: 'cozy', folder: 'cozy-music', label: 'Rainy Day & Cozy', group: 'Stimmungen', color: '#6fa3d8' },
  { slug: 'roadtrip', folder: 'roadtrip-music', label: 'Road Trip', group: 'Stimmungen', color: '#e8712f' },
  { slug: 'romantic', folder: 'romantic-music', label: 'Romantic', group: 'Stimmungen', color: '#e0446b' },
  { slug: 'summer', folder: 'summer-music', label: 'Summer & Beach', group: 'Stimmungen', color: '#ff9e2c' },
  { slug: 'workout', folder: 'workout-music', label: 'Workout & Running', group: 'Stimmungen', color: '#e2472d' },
  { slug: 'yoga', folder: 'yoga-music', label: 'Yoga & Meditation', group: 'Stimmungen', color: '#7fc8a9' }
];

function currentPageFolder() {
  var m = location.pathname.match(/\/([a-z0-9]+-music)\/?/i);
  return m ? m[1] : null;
}

/* Eigenes Dropdown-Widget (Button + Liste) statt <select>: native Popups
   lassen sich vor allem auf macOS/Safari GAR NICHT stylen (immer weiss,
   immer so lang wie die Liste, unabhaengig vom CSS) -- deshalb hier
   komplett selbst gebaut: begrenzte Hoehe (scrollt bei vielen Eintraegen),
   dunkler Hintergrund passend zum Rest der Seite. Wird fuer den Dekaden-/
   Stimmungen-Wechsel UND fuer die Genre-Auswahl im Playlist-Generator
   benutzt (siehe renderPlaylistGenerator). */
var openDropdowns = [];
function closeAllDropdowns() {
  openDropdowns.forEach(function (fn) { fn(); });
  openDropdowns = [];
}
document.addEventListener('click', closeAllDropdowns);

function ddItemsHTML(items, selectedValue) {
  return items.map(function (it) {
    var active = it.value === selectedValue;
    var style = it.color ? ' style="--item-color:' + it.color + '"' : '';
    var title = it.title ? ' title="' + escapeHtml(it.title) + '"' : '';
    return '<li role="option" class="gen-dd-item' + (active ? ' active' : '') + '" data-value="' + escapeHtml(it.value) + '"' + style + title + ' aria-selected="' + (active ? 'true' : 'false') + '">' + escapeHtml(it.text) + '</li>';
  }).join('');
}

/* config: {ddId, extraClass, label, placeholder, items: [{value,text,color}], selectedValue} */
function ddHTML(config) {
  var selected = config.items.filter(function (it) { return it.value === config.selectedValue; })[0];
  var valueText = selected ? selected.text : config.placeholder;
  /* Fallback var(--accent) statt var(--border): Items ohne eigene Farbe
     (z.B. Genres, siehe renderPlaylistGenerator) wirkten sonst bei
     Auswahl grau/"ausgegraut" statt erkennbar hervorgehoben. */
  var accent = selected ? (selected.color || 'var(--accent)') : 'var(--border)';
  return '' +
    '<div class="gen-dd' + (config.extraClass ? ' ' + config.extraClass : '') + '" id="' + config.ddId + '" data-placeholder="' + escapeHtml(config.placeholder) + '" style="--item-color:' + accent + '">' +
    '  <button type="button" class="gen-dd-trigger" aria-haspopup="listbox" aria-expanded="false">' +
    '    <span class="gen-dd-label">' + escapeHtml(config.label) + '</span>' +
    '    <span class="gen-dd-value' + (selected ? '' : ' placeholder') + '">' + escapeHtml(valueText) + '</span>' +
    '  </button>' +
    (config.stepper ? '  <button type="button" class="gen-dd-step gen-dd-prev" aria-label="Vorherige Auswahl" title="Vorherige">\u25C0</button>' +
                      '  <button type="button" class="gen-dd-step gen-dd-next" aria-label="N\u00e4chste Auswahl" title="N\u00e4chste">\u25B6</button>' : '') +
    '  <ul class="gen-dd-list" role="listbox" aria-label="' + escapeHtml(config.label) + '" hidden>' + ddItemsHTML(config.items, config.selectedValue) + '</ul>' +
    '</div>';
}

/* Nach dem Einfuegen ins DOM aufrufen -- onSelect(value) wird bei Klick auf
   einen Eintrag aufgerufen, NICHT bei rein programmatischem ddSetValue(). */
function wireDropdown(ddEl, onSelect) {
  var trigger = ddEl.querySelector('.gen-dd-trigger');
  var list = ddEl.querySelector('.gen-dd-list');
  function closeDD() {
    list.hidden = true;
    ddEl.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  }
  function openDD() {
    closeAllDropdowns();
    list.hidden = false;
    ddEl.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
    openDropdowns.push(closeDD);
  }
  trigger.addEventListener('click', function (e) {
    e.stopPropagation();
    if (list.hidden) openDD(); else closeDD();
  });
  list.addEventListener('click', function (e) {
    e.stopPropagation();
    var item = e.target.closest('.gen-dd-item');
    if (!item) return;
    ddSetValue(ddEl, item.dataset.value);
    closeDD();
    onSelect(item.dataset.value);
  });
  ddEl.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeDD(); trigger.focus(); }
  });
  /* LED-Pfeile: schalten die Auswahl per Klick auf den Nachbar-Eintrag weiter
     (laufen damit ueber dieselbe Logik wie ein normaler Klick in der Liste). */
  ddEl.querySelectorAll('.gen-dd-step').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var items = Array.prototype.slice.call(list.querySelectorAll('.gen-dd-item'));
      if (!items.length) return;
      var cur = -1;
      items.forEach(function (li, i) { if (li.classList.contains('active')) cur = i; });
      var dir = btn.classList.contains('gen-dd-prev') ? -1 : 1;
      var next = cur < 0 ? (dir > 0 ? 0 : items.length - 1) : (cur + dir + items.length) % items.length;
      items[next].click();
    });
  });
}

/* Anzeige (Beschriftung, Farbe, aktiver Eintrag) programmatisch setzen --
   fuer Faelle, in denen sich die Auswahl NICHT per Klick auf einen
   Dropdown-Eintrag aendert (z.B. Genre-Wechsel ueber selectTheme() beim
   Seitenstart, oder Zuruecksetzen auf den Platzhalter waehrend einer
   Suche, siehe runSearch). Loest KEIN onSelect aus. */
function ddSetValue(ddEl, value) {
  var valueEl = ddEl.querySelector('.gen-dd-value');
  var matched = null;
  ddEl.querySelectorAll('.gen-dd-item').forEach(function (li) {
    var active = li.dataset.value === value;
    li.classList.toggle('active', active);
    li.setAttribute('aria-selected', active ? 'true' : 'false');
    if (active) matched = li;
  });
  if (matched) {
    valueEl.textContent = matched.textContent;
    valueEl.classList.remove('placeholder');
    var color = matched.style.getPropertyValue('--item-color');
    ddEl.style.setProperty('--item-color', color || 'var(--accent)');
  } else {
    valueEl.textContent = ddEl.dataset.placeholder || '';
    valueEl.classList.add('placeholder');
    ddEl.style.setProperty('--item-color', 'var(--border)');
  }
}

/* Dekaden-Schnellzugriff als feste, chronologisch sortierte Button-Reihe
   (70er -> 2020er, immer sichtbar) statt Dropdown -- ein Dropdown versteckt
   die Reihenfolge hinter einem Klick und zeigt immer nur die AKTUELLE
   Dekade an, was wiederholt als verwirrend/"Reihenfolge kaputt" empfunden
   wurde. Gleiches Chip-Aussehen wie die "Dekade verbinden"-Zeile, aber
   eigene Klasse (decade-nav-*), weil die dortige Klick-Logik (Verbinden)
   nicht mit reiner Navigation kollidieren darf. Wechselt per AJAX (siehe
   navigateToPage), der Player laeuft beim Klick ungestoert weiter. */
function decadeNavRowHTML() {
  var current = currentPageFolder();
  var items = SITE_PAGES.filter(function (p) { return p.group === 'Dekades'; });
  return '' +
    '<div class="decade-nav-row" id="decade-nav-row">' +
    '  <span class="decade-link-label">' + GRID_SVG + ' Dekaden:</span>' +
    items.map(function (p) {
      var active = p.folder === current;
      return '<button class="decade-nav-chip' + (active ? ' decade-nav-active' : '') + '" type="button" data-folder="' + p.folder + '"' +
        (active ? ' aria-current="page" disabled' : '') + '>' + escapeHtml(p.label) + '</button>';
    }).join('') +
    '</div>';
}

function wireDecadeNavRow(root) {
  var row = root.querySelector('#decade-nav-row');
  if (!row) return;
  row.addEventListener('click', function (e) {
    var btn = e.target.closest('.decade-nav-chip');
    if (!btn || btn.disabled) return;
    navigateToPage(btn.dataset.folder);
  });
}

/* Stimmungen bleiben als Dropdown (deutlich mehr Eintraege als Dekaden --
   als feste Reihe wuerde das den Kopfbereich sprengen). Wechselt per AJAX
   (siehe navigateToPage), der Player laeuft beim Klick ungestoert weiter. */
function switchRowHTML() {
  var current = currentPageFolder();
  var items = SITE_PAGES.filter(function (p) { return p.group === 'Stimmungen'; })
    .map(function (p) { return { value: p.folder, text: p.label, color: p.color }; });
  var activeItem = items.filter(function (it) { return it.value === current; })[0];
  return '' +
    '<div class="gen-switch-rows" id="gen-switch-row">' +
    ddHTML({
      ddId: 'gen-switch-dd-stimmungen',
      label: 'Ambient/Mood',
      placeholder: 'w\u00e4hlen',
      stepper: true,
      items: items,
      selectedValue: activeItem ? activeItem.value : null
    }) +
    '</div>';
}

function wireSwitchRow(root) {
  var row = root.querySelector('#gen-switch-row');
  if (!row) return;
  row.querySelectorAll('.gen-dd').forEach(function (ddEl) {
    wireDropdown(ddEl, function (value) { navigateToPage(value); });
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
  ccWireUtilityReveal();
}

/* Navigations-Kacheln (Home/Dekaden/Mail/Datenschutz) sind ausgeblendet
   und erscheinen nur, wenn die Maus oben in die Naehe kommt (Nutzerwunsch
   9.10.) -- so bleibt die Club-Console oben frei. Ohne Maus (Tablet) gibt
   es einen kleinen Griff, der die Kacheln per Tipp fuer ein paar Sekunden
   einblendet. Listener nur einmal anlegen (Block wird bei AJAX-
   Navigation neu eingefuegt, die Klasse haengt deshalb am <html>). */
var ccUtilityWired = false;
function ccWireUtilityReveal() {
  if (!document.getElementById('cc-nav-handle')) {
    document.body.insertAdjacentHTML('afterbegin', '<button type="button" class="cc-nav-handle" id="cc-nav-handle" aria-label="Navigation einblenden"><span></span></button>');
  }
  if (ccUtilityWired) return;
  ccUtilityWired = true;
  var root = document.documentElement, hideTimer = null;
  function show(ms) {
    root.classList.add('cc-nav-open');
    clearTimeout(hideTimer);
    if (ms) hideTimer = setTimeout(hide, ms);
  }
  function hide() { root.classList.remove('cc-nav-open'); }
  document.addEventListener('mousemove', function (e) {
    var near = e.clientY < 96 && Math.abs(e.clientX - window.innerWidth / 2) < 260;
    var overBlock = e.target.closest && e.target.closest('.utility-block');
    if (near || overBlock) show(0);
    else if (root.classList.contains('cc-nav-open') && !hideTimer) hideTimer = setTimeout(function () { hideTimer = null; hide(); }, 400);
    if (near || overBlock) { clearTimeout(hideTimer); hideTimer = null; }
  }, { passive: true });
  document.addEventListener('mouseleave', function () { hide(); });
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('#cc-nav-handle')) show(4000);
  });
  document.addEventListener('focusin', function (e) {
    if (e.target.closest && e.target.closest('.utility-block')) show(4000);
  });
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
    /* Der grosse Hero-Block (Icon/Name/Jahre/Tagline/Badge) ist auf
       Nutzerwunsch komplett entfernt -- direkt unter der Warteschlangen-
       Tabelle kommt jetzt sofort der Playlist-Generator, kein Leerraum
       mehr dazwischen. document.title/meta-description oben bleiben
       unveraendert (SEO/Tab-Titel, unabhaengig vom sichtbaren Hero). */
    '<main class="decade-main">' +
    '  <div class="info-note"><strong>Woher kommen die Songs?</strong> ' + cfg.sourceNote + '</div>' +
    '</main>' +
    '<footer class="decade-footer">' +
    '  <span>&copy; 2026 Massimo — ' + cfg.name + '</span>' +
    '  <div class="links"><a href="/impressum.html">Impressum</a></div>' +
    '</footer>'
  );
}

/* ---------- Impressum (impressum.html) ----------
   Zentralisiert (Massimo, 21.09.): das Impressum ist jetzt EIN einziges,
   auf /impressum.html gepflegtes Dokument statt 15x identisch dupliziert
   ueber alle Dekaden-/Stimmungs-Ordner -- diese Funktion leitet nur noch
   dorthin weiter, statt den Text hier erneut zu rendern. Kein Bestandteil
   von SITE_PAGES/der AJAX-Seitennavigation (siehe swapDecadePage-Kommentar
   oben), ein normaler window.location-Redirect ist hier deshalb sicher. */
function renderDecadeImpressum(cfg) {
  window.location.replace('/impressum.html');
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
    '  <div class="song-modal-remove-box">' +
    '    <button type="button" class="song-modal-remove-btn" id="song-modal-remove-btn">Song endgültig entfernen</button>' +
    '    <div class="song-modal-remove-confirm" id="song-modal-remove-confirm" hidden>' +
    '      <span>Song wirklich unwiderruflich aus dem Katalog entfernen?</span>' +
    '      <button type="button" class="song-modal-remove-confirm-yes" id="song-modal-remove-confirm-yes">Ja, entfernen</button>' +
    '      <button type="button" class="song-modal-remove-confirm-no" id="song-modal-remove-confirm-no">Abbrechen</button>' +
    '    </div>' +
    '    <p class="song-modal-remove-status" id="song-modal-remove-status"></p>' +
    '  </div>' +
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
  var queueBtn = document.getElementById('gen-send-queue');
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
  if (queueBtn) {
    queueBtn.disabled = count === 0;
    queueBtn.textContent = count === 0
      ? 'In Warteschlange senden'
      : count + (count === 1 ? ' Song in Warteschlange senden' : ' Songs in Warteschlange senden');
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

/* Nutzerwunsch (11.9.): "ich gehe die Liste durch was mir gefaellt, dann
   unten ein Button der die in die Playliste sendet" -- haengt die per
   gruenem Haken markierten Songs an die Warteschlange des aktiven Decks
   an (dieselbe Logik wie "Playlist auf Warteschlange laden", nur mit der
   Auswahl statt der ganzen Genre-Liste als Quelle), statt sie extern bei
   einem Streaming-Dienst zu oeffnen. Auswahl senden (externer Dienst)
   bleibt zusaetzlich bestehen, siehe sendSelection(). */
function sendSelectionToQueue() {
  var songs = Object.keys(selectedSongs).map(function (id) { return selectedSongs[id]; });
  if (!songs.length) return;
  playAllCurrent(songs);
  clearSelection();
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
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? DECADE_REGISTRY[idx - 1] : null,
    next: idx < DECADE_REGISTRY.length - 1 ? DECADE_REGISTRY[idx + 1] : null
  };
}

/* Liefert den Dekaden-Schluessel des Songs, der GERADE tatsaechlich zu
   hoeren ist -- fuer die farbliche Hervorhebung in "Dekade verbinden"
   (siehe renderPlaylistGenerator). Bevorzugt das eine spielende Deck; bei
   zwei gleichzeitig spielenden Decks (kurz waehrend des Ueberblendens) wird
   -- wie bei currentSyncRoles() -- die Crossfader-Position als Notloesung
   herangezogen. Songs ohne eigenes _decade-Feld (siehe computeLinkedCombo)
   gehoeren zur eigenen Dekade der Seite. */
function currentPlayingDecadeKey(ownDecadeKey) {
  var a = DECKS.A, b = DECKS.B;
  var key;
  if (a.isPlaying && !b.isPlaying) key = 'A';
  else if (b.isPlaying && !a.isPlaying) key = 'B';
  else if (a.isPlaying && b.isPlaying) key = crossfaderValue <= 50 ? 'A' : 'B';
  else return ownDecadeKey;
  var deck = DECKS[key];
  return (deck.song && deck.song._decade) || ownDecadeKey;
}

/* Registrierte Callbacks, die bei jeder relevanten Deck-Aenderung (siehe
   updateDeckInfoUI) neu pruefen sollen, welche Dekade gerade spielt --
   z.B. um die "Dekade verbinden"-Chips farblich nachzuziehen. */
var decadeChipRefreshers = [];

/* Aus JEDER Kategorie eines beliebigen Song-Datensatzes (eigene Dekade ODER
   verlinkte Nachbar-Dekade) die MIX_PER_CATEGORY beliebtesten Songs -- Basis
   sowohl fuer den normalen "Mix"-Button (siehe buildMixSongs in
   renderPlaylistGenerator) als auch fuer den Nachbar-Anteil beim Verbinden. */
/* Wirklich ALLE Songs (ungekuerzt, alle Genres zusammen) -- Gegenstueck zu
   buildMixSongsFrom (die nur MIX_PER_CATEGORY pro Genre nimmt). Ohne diese
   Option gab es keinen Weg, die komplette Songliste einer Seite auf einen
   Blick zu sehen, nur den kleinen Mix-Ausschnitt oder ein einzelnes Genre --
   das sorgte wiederholt fuer Verwirrung ("wo sind die restlichen Songs?"). */
function buildAllSongsFrom(dataObj) {
  if (!dataObj) return [];
  var out = [];
  var seen = {};
  Object.keys(dataObj).forEach(function (cat) {
    (dataObj[cat] || []).forEach(function (s) {
      var id = songId(s);
      if (seen[id]) return;
      seen[id] = true;
      out.push(s);
    });
  });
  return out;
}

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

/* Datenschutz (EU/DSGVO): Das YouTube-Skript wird erst nach ausdruecklicher
   Zustimmung geladen. Die Zustimmung wird im Browser gemerkt (localStorage,
   Schluessel dw_yt_consent) und kann auf /privacy.html widerrufen werden.
   Ohne Zustimmung findet KEINE Verbindung zu YouTube/Google statt. */
var YT_CONSENT_KEY = 'dw_yt_consent';
var ytConsentPending = [];
var ytConsentModalOpen = false;
function ytConsentGiven() {
  try { return localStorage.getItem(YT_CONSENT_KEY) === '1'; } catch (e) { return window.__dwYtConsent === true; }
}
function askYouTubeConsent(onYes) {
  ytConsentPending.push(onYes);
  if (ytConsentModalOpen) return;
  ytConsentModalOpen = true;
  var wrap = document.createElement('div');
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');
  wrap.setAttribute('aria-label', 'YouTube-Einwilligung');
  wrap.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(5,6,10,0.72);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);';
  wrap.innerHTML = '<div style="max-width:440px;width:100%;background:var(--panel,#16171d);color:var(--text,#f3f3f6);border:1px solid var(--border,rgba(255,255,255,0.14));border-radius:16px;padding:22px 22px 18px;box-shadow:0 24px 60px rgba(0,0,0,0.55);font:14px/1.5 Inter,system-ui,sans-serif;">' +
    '<div style="font:700 17px Sora,Inter,system-ui,sans-serif;margin-bottom:8px;">Video von YouTube abspielen?</div>' +
    '<p style="margin:0 0 10px;color:var(--muted,#a8a9b3);">Zum Abspielen laden wir den Player von YouTube (Google). Dabei wird deine IP-Adresse an Google übertragen, und es können Cookies bzw. Browser-Speicher von YouTube genutzt werden. Ohne dein Okay wird nichts geladen.</p>' +
    '<p style="margin:0 0 16px;font-size:12.5px;color:var(--muted,#a8a9b3);">Deine Entscheidung wird in deinem Browser gespeichert und lässt sich in der <a href="/privacy.html#youtube" style="color:var(--accent,#8b9bff);">Datenschutzerklärung</a> widerrufen.</p>' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end;">' +
    '<button type="button" data-yt="no" style="cursor:pointer;background:transparent;color:inherit;border:1px solid var(--border,rgba(255,255,255,0.22));border-radius:10px;padding:10px 16px;font:600 14px Inter,system-ui,sans-serif;">Abbrechen</button>' +
    '<button type="button" data-yt="yes" style="cursor:pointer;background:var(--accent,#7c5cff);color:#fff;border:0;border-radius:10px;padding:10px 18px;font:700 14px Inter,system-ui,sans-serif;">Einverstanden &amp; abspielen</button>' +
    '</div></div>';
  function close() { ytConsentModalOpen = false; if (wrap.parentNode) wrap.parentNode.removeChild(wrap); document.removeEventListener('keydown', onKey); }
  function onKey(e) { if (e.key === 'Escape') { ytConsentPending = []; close(); } }
  wrap.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-yt]') : null;
    if (e.target === wrap) { ytConsentPending = []; close(); return; }
    if (!t) return;
    if (t.getAttribute('data-yt') === 'yes') {
      window.__dwYtConsent = true;
      try { localStorage.setItem(YT_CONSENT_KEY, '1'); } catch (err) {}
      var cbs = ytConsentPending; ytConsentPending = []; close();
      cbs.forEach(function (cb) { loadYouTubeAPI(cb); });
    } else { ytConsentPending = []; close(); }
  });
  document.addEventListener('keydown', onKey);
  document.body.appendChild(wrap);
  var yes = wrap.querySelector('[data-yt="yes"]'); if (yes) yes.focus();
}

function loadYouTubeAPI(onReady) {
  if (!ytConsentGiven() && window.__dwYtConsent !== true) { askYouTubeConsent(onReady); return; }
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
  /* _decade NICHT weglassen: fehlte bisher hier, obwohl ein per "Dekade
     verbinden" geladener Song aus einer FREMDEN Dekade stammen kann (siehe
     computeLinkedCombo) -- ohne dieses Feld "vergass" ein wiederhergestellter
     Song nach einem Reload, aus welcher Dekade er kommt (Badge, farbliche
     Now-Playing-Markierung des Verbinden-Chips), siehe auch
     driftware-linked-decade-<key> weiter unten fuer den Verbindungs-Status
     selbst. */
  return { a: s.a, t: s.t, u: s.u || null, yt: s.yt || null, bpm: s.bpm || null, g: s.g, y: s.y, s: s.s, _decade: s._decade || null };
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
  /* Club-Console-Layout (9.10.): LCD-Kopf, breite Wellenform, darunter
     Plattenteller + Pads. Alle IDs, an denen die Logik haengt, sind
     unveraendert (siehe Kommentar zu .dj-vinyl-video weiter unten). */
  var cues = '';
  for (var c = 0; c < 4; c++) {
    cues += '<button type="button" class="cc-pad cc-cue" data-cue="' + c + '" aria-label="Deck ' + key + ': Hot-Cue ' + (c + 1) + ' (Klick setzt/springt, Rechtsklick löscht)"><small>' + (c + 1) + '</small><span>' + CC_CUE_NAMES[c] + '</span></button>';
  }
  return '' +
    '<div class="dj-deck" id="deck-' + key + '">' +
    '  <i class="cc-screw" style="left:6px;top:6px"></i><i class="cc-screw" style="right:6px;top:6px"></i>' +
    '  <div class="dj-deck-head">' +
    '    <div class="dj-deck-label">' + key + '</div>' +
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
    '    <div class="cc-time" title="Restzeit / Gesamtlänge"><b id="deck-' + key + '-elapsed">−0:00</b><small id="deck-' + key + '-rem2">0:00</small></div>' +
    '    <div class="cc-bpm"><b id="deck-' + key + '-bpmbig">—</b><small><span class="cc-beat" id="deck-' + key + '-beat"><i></i><i></i><i></i><i></i></span>BPM</small></div>' +
    '  </div>' +
    '  <div class="dj-deck-mid">' +
    '    <div class="dj-waveform" id="deck-' + key + '-waveform" role="slider" tabindex="0" ' +
    '      aria-label="Deck ' + key + ': Songposition" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
    '      <canvas id="deck-' + key + '-waveform-canvas"></canvas>' +
    '    </div>' +
    '  </div>' +
    '  <div class="dj-deck-top">' +
    '    <div class="dj-vinyl" id="deck-' + key + '-drop">' +
    '      <svg class="cc-ring" viewBox="0 0 100 100" aria-hidden="true"><circle class="bg" cx="50" cy="50" r="48"/><circle class="fg" id="deck-' + key + '-ring" cx="50" cy="50" r="48" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/></svg>' +
    '      <div class="cc-platter" aria-hidden="true"><div class="cc-strobe"></div></div>' +
    '      <div class="dj-vinyl-disc" id="deck-' + key + '-disc">' +
    /* WICHTIG: ".dj-vinyl-video" sitzt auf einem STABILEN Aussen-Div, das
       Groesse/Rundung/Clipping via CSS traegt -- der eigentliche Mount-
       Knoten fuer YT.Player() ist ein einfaches inneres Div OHNE eigene
       Klasse. Grund: new YT.Player('deck-X-mount', ...) ERSETZT den
       referenzierten Knoten komplett durch ein <iframe> mit gleicher ID,
       aber OHNE dessen Klassen zu uebernehmen. Sass die Klasse frueher
       direkt auf dem Mount-Div, verschwand ".dj-vinyl-video" beim ersten
       Player-Aufbau spurlos aus dem DOM -- das CSS-Selektor ".dj-vinyl-
       video iframe" (Skalierung/Zentrierung des Videobilds, siehe
       decades.css) griff dann nie, das Video landete winzig und
       unzentriert in der Ecke der Plattenteller-Scheibe. Mit dem stabilen
       Aussen-Div bleibt die Klasse erhalten, egal was YT.Player() mit dem
       inneren Mount-Knoten macht. */
    '        <div class="dj-vinyl-video"><div id="deck-' + key + '-mount"></div></div>' +
    '        <div class="dj-vinyl-ring" aria-hidden="true"><span class="dj-vinyl-dot"></span></div>' +
    '      </div>' +
    '      <div class="dj-vinyl-hint">Song hierher ziehen</div>' +
    '      <div class="dj-vinyl-dragshield" id="deck-' + key + '-dragshield" aria-hidden="true"></div>' +
    '    </div>' +
    '    <div class="cc-pads">' +
    '      <div class="dj-deck-controls">' +
    '        <button type="button" class="cc-pad cc-cuebtn" id="deck-' + key + '-cue" aria-label="Deck ' + key + ': zum Songanfang">CUE</button>' +
    '        <button type="button" class="cc-pad cc-play" id="deck-' + key + '-toggle" aria-label="Deck ' + key + ': abspielen/pause">' + PLAY_SVG + '</button>' +
    '        <button type="button" class="cc-pad cc-small" id="deck-' + key + '-prev" aria-label="Deck ' + key + ': voriger Song">' + PREV_SVG + '</button>' +
    '        <button type="button" class="cc-pad cc-small" id="deck-' + key + '-next" aria-label="Deck ' + key + ': nächster Song">' + NEXT_SVG + '</button>' +
    '      </div>' +
    '      <div class="cc-cues">' + cues + '</div>' +
    '      <div class="dj-pitch">' +
    '        <span class="cc-label">TEMPO</span>' +
    '        <div class="dj-knob-wrap">' +
    '          <div class="dj-knob" id="deck-' + key + '-pitch-knob" role="slider" tabindex="0" ' +
    '            aria-label="Deck ' + key + ': Pitch" aria-valuemin="-50" aria-valuemax="50" aria-valuenow="0" data-value="0">' +
    '            <div class="dj-knob-ticks" aria-hidden="true"><span></span><span></span><span class="mid"></span><span></span><span></span></div>' +
    '            <div class="dj-knob-dial" id="deck-' + key + '-pitch-dial"><div class="dj-knob-pointer"></div></div>' +
    '          </div>' +
    '        </div>' +
    '        <div class="dj-pitch-display" id="deck-' + key + '-pitch-display">0,00</div>' +
    '      </div>' +
    '    </div>' +
    '  </div>' +
    '</div>';
}

/* Hot-Cues: 4 Sprungmarken pro Song, im Browser gespeichert (pro Song,
   nicht pro Deck -- derselbe Song hat auf A und B dieselben Cues).
   Klick auf leeres Pad = Marke an aktueller Position setzen, Klick auf
   gesetztes Pad = dorthin springen, Rechtsklick (bzw. langes Druecken)
   = Marke loeschen. Laeuft komplett ueber seekTo() der YouTube-API. */
var CC_CUE_NAMES = ['INTRO', 'DROP', 'BREAK', 'OUTRO'];
var CC_CUE_COLORS = ['#f43f5e', '#f59e0b', '#22d3ee', '#a3e635'];
function ccCueStore(song) { return 'driftware-hotcues-' + songId(song); }
function ccGetCues(song) {
  if (!song) return [];
  try { return JSON.parse(localStorage.getItem(ccCueStore(song)) || '[]') || []; } catch (e) { return []; }
}
function ccSetCues(song, cues) {
  try { localStorage.setItem(ccCueStore(song), JSON.stringify(cues)); } catch (e) {}
}
function ccRefreshCues(key) {
  var deck = DECKS[key];
  var cues = ccGetCues(deck.song);
  document.querySelectorAll('#deck-' + key + ' .cc-cue').forEach(function (btn) {
    var i = +btn.dataset.cue;
    var set = cues[i] != null;
    btn.classList.toggle('lit', set);
    btn.style.setProperty('--pc', CC_CUE_COLORS[i]);
    btn.disabled = !deck.song;
  });
}
function ccWireDeckPads(bar, key) {
  var deck = DECKS[key];
  bar.querySelectorAll('#deck-' + key + ' .cc-cue').forEach(function (btn) {
    var i = +btn.dataset.cue, pressTimer = null, longPressed = false;
    function clearCue() {
      var cues = ccGetCues(deck.song); cues[i] = null; ccSetCues(deck.song, cues);
      ccRefreshCues(key); drawWaveform(key);
    }
    btn.addEventListener('click', function () {
      if (longPressed) { longPressed = false; return; }
      if (!deck.song || !deck.player || !deck.player.getCurrentTime) return;
      var cues = ccGetCues(deck.song);
      try {
        if (cues[i] == null) { cues[i] = deck.player.getCurrentTime(); ccSetCues(deck.song, cues); }
        else { deck.player.seekTo(cues[i], true); }
      } catch (e) {}
      ccRefreshCues(key); drawWaveform(key);
    });
    btn.addEventListener('contextmenu', function (e) { e.preventDefault(); if (deck.song) clearCue(); });
    btn.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'touch') return;
      pressTimer = setTimeout(function () { longPressed = true; if (deck.song) clearCue(); }, 600);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { btn.addEventListener(ev, function () { clearTimeout(pressTimer); }); });
  });
  var cueBtn = bar.querySelector('#deck-' + key + '-cue');
  if (cueBtn) cueBtn.addEventListener('click', function () {
    if (!deck.song || !deck.player || !deck.player.seekTo) return;
    try { deck.player.seekTo(introSkipFor(deck.song), true); drawWaveform(key); } catch (e) {}
  });
}

/* Song aus der Warteschlange (nextup.js) direkt auf ein Deck ziehen
   (Nutzerwunsch 9.10.). Wie im DJ-Alltag:
   - auf das Deck, das die Warteschlange gerade spielt: Song kommt sofort
     dran (wird direkt hinter den aktuellen Song gesetzt und angesprungen)
   - auf das andere Deck: Song wird dort vorbereitet und der Rest der
     Warteschlange wandert mit -- nach dem Ueberblenden laeuft die Liste
     auf dem neuen Deck nahtlos weiter.
   Ein kommender Song verlaesst dabei die Warteschlange (kein Doppel), ein
   bereits gelaufener wird als Kopie verwendet. */
/* Platte "flippt" einmal um die eigene Achse, wenn ein Song auf dem Deck
   landet (Nutzerwunsch 9.10.). */
function ccFlipDeck(key) {
  var v = document.getElementById('deck-' + key + '-drop');
  if (!v || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  v.classList.remove('cc-flip');
  void v.offsetWidth;
  v.classList.add('cc-flip');
  setTimeout(function () { v.classList.remove('cc-flip'); }, 900);
}
/* Welches Deck "fuehrt" gerade die Warteschlange? (Bugfix 9.10., Nutzer:
   "die Warteliste verschwindet staendig"). Frueher hiess es: spielendes
   Deck, sonst einfach Deck A, sobald dort irgendein Song lag. Liegt auf A
   aber nur der still VORGELADENE naechste Song (maybePreloadNext setzt
   song, aber keine eigene Warteschlange) und B wird kurz pausiert, sprang
   die Anzeige auf A -- "On Air" = vorgeladener Song, darunter nichts, die
   Warteschlange schien weg. Jetzt zaehlt nur ein Deck mit ECHTER
   Warteschlange (index > -1); bei Gleichstand bleibt es beim zuletzt
   gewaehlten Deck, damit nichts hin- und herspringt. */
var ccLastOwner = null;
function ccQueueOwnerKey() {
  function owns(k) { var d = DECKS[k]; return !!(d && d.song && d.queue && d.queue.length && d.index > -1 && d.index < d.queue.length); }
  var a = owns('A'), b = owns('B'), pick = null;
  if (a && b) {
    if (DECKS.A.isPlaying !== DECKS.B.isPlaying) pick = DECKS.A.isPlaying ? 'A' : 'B';
    else pick = ccLastOwner && owns(ccLastOwner) ? ccLastOwner
      : ((DECKS.A.queue.length - DECKS.A.index) >= (DECKS.B.queue.length - DECKS.B.index) ? 'A' : 'B');
  } else if (a || b) {
    pick = a ? 'A' : 'B';
  } else {
    if (DECKS.A.isPlaying) pick = 'A';
    else if (DECKS.B.isPlaying) pick = 'B';
    else if (ccLastOwner && DECKS[ccLastOwner].song) pick = ccLastOwner;
    else pick = DECKS.A.song ? 'A' : (DECKS.B.song ? 'B' : null);
  }
  ccLastOwner = pick;
  return pick;
}
window.ccQueueOwnerKey = ccQueueOwnerKey;
function ccDropQueueSongOnDeck(song, key, info) {
  var ownerKey = ccQueueOwnerKey();
  var owner = ownerKey ? DECKS[ownerKey] : null;
  if (!owner || owner.index < 0 || !owner.queue) {
    loadSongToDeck(song, key, [song], false);
    window.dispatchEvent(new Event('driftware-queue-changed'));
    return;
  }
  if (info && info.kind === 'upcoming') {
    var i = info.idx;
    if (!(owner.queue[i] && songId(owner.queue[i]) === songId(song))) {
      i = -1;
      for (var k = owner.index + 1; k < owner.queue.length; k++) { if (songId(owner.queue[k]) === songId(song)) { i = k; break; } }
    }
    if (i > owner.index) owner.queue.splice(i, 1);
  }
  /* Song wird in jedem Fall der naechste in der Warteschlange -- die
     Anzeige bleibt dadurch stimmig ("On Air", direkt darunter der
     gezogene Song, dann der Rest). */
  owner.queue.splice(owner.index + 1, 0, song);
  if (ownerKey === key) {
    deckStep(key, 1, !!owner.isPlaying);
  } else {
    var target = DECKS[key];
    if (target.isPlaying) {
      /* Zieldeck spielt gerade selbst (z.B. mitten im Ueberblenden) --
         dann einfach dort laden, ohne die Warteschlange umzubauen. */
      owner.queue.splice(owner.index + 1, 1);
      loadSongToDeck(song, key, [song], false);
    } else {
      /* Auf dem anderen Deck als "naechsten Song" vorladen -- derselbe Weg
         wie das automatische Vorladen (maybePreloadNext), damit Autofade
         und Uebergabe der Warteschlange unveraendert funktionieren. */
      target.song = null;
      target.preloadedFor = null;
      maybePreloadNext(ownerKey);
    }
  }
  window.dispatchEvent(new Event('driftware-queue-changed'));
}

/* Kanal-Fader pro Deck (zusaetzlich zu Crossfader + Master), 0-100. */
var deckGain = { A: 100, B: 100 };
function ccChannelHTML(key) {
  var seg = '';
  for (var i = 0; i < 12; i++) seg += '<i class="' + (i >= 10 ? 'r' : i >= 7 ? 'y' : '') + '"></i>';
  return '<div class="cc-ch cc-ch-' + key.toLowerCase() + '">' +
    '<div class="cc-vu" id="cc-vu-' + key + '" aria-hidden="true">' + seg + '</div>' +
    '<div class="cc-fader"><input type="range" id="dj-gain-' + key + '" min="0" max="100" value="100" aria-label="Deck ' + key + ': Kanal-Lautstärke"></div>' +
    '<span class="cc-label">' + key + '</span></div>';
}

/* Anzeige-Schleife fuer alles, was fluessig laufen soll (Zeit, Ring,
   Beat-LEDs, Pegel) -- ~20x pro Sekunde, nur solange der Tab sichtbar
   ist (requestAnimationFrame pausiert im Hintergrund von selbst). Der
   500ms-Takt von updateRemainingTime bleibt fuer Logik (Autofade). */
function ccFormatTime(t) {
  if (!isFinite(t) || t < 0) t = 0;
  var m = Math.floor(t / 60), s = Math.floor(t % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}
var ccLastFrame = 0;
function ccVisualLoop(now) {
  requestAnimationFrame(ccVisualLoop);
  if (now - ccLastFrame < 50) return;
  ccLastFrame = now;
  var masterBpm = null;
  ['A', 'B'].forEach(function (key) {
    var deck = DECKS[key];
    var el = document.getElementById('deck-' + key + '-elapsed');
    if (!el) return;
    var dur = 0, cur = 0;
    if (deck.song && deck.player && deck.player.getDuration) {
      try { dur = deck.player.getDuration() || 0; cur = deck.player.getCurrentTime() || 0; } catch (e) {}
    }
    /* Wie am CDJ (Nutzerwunsch 9.10.): oben gross die Restzeit, darunter
       klein die Gesamtlaenge. Letzte 30 s blinkt die Restzeit. */
    el.textContent = '−' + ccFormatTime(dur - cur);
    el.classList.toggle('cc-ending', !!(deck.isPlaying && dur > 0 && dur - cur <= 30));
    var rem = document.getElementById('deck-' + key + '-rem2');
    if (rem) rem.textContent = dur > 0 ? ccFormatTime(dur) : '0:00';
    var ring = document.getElementById('deck-' + key + '-ring');
    if (ring) ring.style.strokeDashoffset = dur > 0 ? (100 - cur / dur * 100) : 100;
    var bpm = effectiveBpm(key);
    var beat = document.getElementById('deck-' + key + '-beat');
    var beatIdx = (bpm && deck.isPlaying) ? Math.floor(cur * bpm / 60) % 4 : -1;
    if (beat) beat.querySelectorAll('i').forEach(function (b, i) { b.classList.toggle('on', i === beatIdx); });
    if (deck.isPlaying && bpm && masterBpm == null) masterBpm = bpm;
    var vol = key === 'A' ? (100 - crossfaderValue) : crossfaderValue;
    var level = deck.isPlaying ? (vol / 100) * (masterVolume / 100) * (deckGain[key] / 100) : 0;
    if (level > 0) {
      var phase = bpm ? (cur * bpm / 60) % 1 : Math.random();
      level = Math.min(1, level * (0.62 + 0.38 * Math.exp(-phase * 5)) + Math.random() * 0.05);
    }
    var vu = document.getElementById('cc-vu-' + key);
    if (vu) { var n = Math.round(level * 12); vu.querySelectorAll('i').forEach(function (s, i) { s.classList.toggle('on', i < n); }); }
  });
  var mb = document.getElementById('cc-master-bpm');
  if (mb) mb.textContent = masterBpm ? masterBpm.toFixed(1) : '—';
}

/* Suche + Player sind jetzt untrennbar: die Suche lebt oben in dieser
   fest-positionierten Leiste (statt weiter oben im Seiteninhalt), damit
   sie beim Nutzen des Players immer erreichbar bleibt. Die Leiste ist
   von Anfang an sichtbar (kein Ein-/Ausblenden mehr, kein X zum
   Schließen) — Suche muss jederzeit zugaenglich sein. */
/* Der Player steht auf breiten Screens (>1100px) als FIXIERTE Spalte
   rechts -- dafuer braucht die Seite rechts Platz, der hier reserviert
   wird (padding-right kommt aus der Basis-CSS-Regel, hier nur noch
   paddingBottom fuer den Fixed-Fall zuruecksetzen). Unter 1100px ist der
   Player seit dem Ueberdeckungs-Bug (siehe Kommentar bei .dj-player im
   1100px-Media-Query in decades.css) NICHT mehr fixiert, sondern normaler
   Seiteninhalt -- dort ist kein zusaetzliches padding-bottom noetig oder
   sinnvoll (der Player braucht ja bereits echten Platz im Fluss). */
function syncPlayerSpacing() {
  document.body.style.paddingBottom = '';
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

/* Kompaktes Handy-Deck: Nur auf Geraeten, die detectDeviceType() als "phone"
   erkennt (data-device="phone"). Die beiden grossen Decks bleiben im DOM
   (nur aus dem Blickfeld geschoben, damit die YouTube-Player weiterlaufen),
   unten klebt eine Mini-Leiste mit Cover, Titel, Zurueck/Play/Weiter. */
function setupPhoneMini(bar) {
  if (document.documentElement.getAttribute('data-device') !== 'phone') return;
  if (document.getElementById('dj-mini')) return;
  bar.classList.add('dj-phone');
  var tgl = document.createElement('button');
  tgl.type = 'button'; tgl.className = 'dj-phone-toggle'; tgl.id = 'dj-phone-toggle';
  tgl.textContent = '\u25BE DJ-Decks anzeigen';
  tgl.setAttribute('aria-expanded', 'false');
  tgl.addEventListener('click', function () {
    var ex = bar.classList.toggle('dj-expanded');
    tgl.textContent = ex ? '\u25B4 DJ-Decks ausblenden' : '\u25BE DJ-Decks anzeigen';
    tgl.setAttribute('aria-expanded', ex ? 'true' : 'false');
  });
  bar.insertBefore(tgl, bar.firstChild);

  var mini = document.createElement('div');
  mini.id = 'dj-mini'; mini.className = 'dj-mini'; mini.hidden = true;
  mini.innerHTML = '' +
    '<img class="dj-mini-cover" id="dj-mini-cover" alt="">' +
    '<div class="dj-mini-text"><div class="dj-mini-title" id="dj-mini-title"></div><div class="dj-mini-artist" id="dj-mini-artist"></div></div>' +
    '<button type="button" class="dj-mini-btn" id="dj-mini-prev" aria-label="Vorheriger Song">\u23EE</button>' +
    '<button type="button" class="dj-mini-btn dj-mini-play" id="dj-mini-play" aria-label="Abspielen/Pause">\u25B6</button>' +
    '<button type="button" class="dj-mini-btn" id="dj-mini-next" aria-label="N\u00e4chster Song">\u23ED</button>';
  document.body.appendChild(mini);
  document.body.classList.add('has-dj-mini');
  function key() { return msDeckKey(); }
  mini.querySelector('#dj-mini-play').addEventListener('click', function () { var k = key(); if (k) deckTogglePlay(k); });
  mini.querySelector('#dj-mini-prev').addEventListener('click', function () { var k = key(); if (k) deckStep(k, -1); });
  mini.querySelector('#dj-mini-next').addEventListener('click', function () { var k = key(); if (k) deckStep(k, 1); });
  window.__djMiniUpdate = function () {
    var k = key();
    var song = k && DECKS[k].song;
    mini.hidden = !song;
    if (!song) return;
    mini.querySelector('#dj-mini-title').textContent = song.t || '';
    mini.querySelector('#dj-mini-artist').textContent = song.a || '';
    var img = mini.querySelector('#dj-mini-cover'), src = song.th || song.cv || '';
    if (img.getAttribute('src') !== src) { if (src) img.src = src; else img.removeAttribute('src'); }
    mini.querySelector('#dj-mini-play').textContent = DECKS[k].isPlaying ? '\u275A\u275A' : '\u25B6';
  };
  window.__djMiniUpdate();
}

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
    '  <i class="cc-screw" style="left:6px;top:6px"></i><i class="cc-screw" style="right:6px;top:6px"></i>' +
    '  <div class="cc-mixhead"><b>MIXER</b><span class="cc-master"><em>MASTER</em><b id="cc-master-bpm">—</b></span></div>' +
    '  <div class="cc-channels">' + ccChannelHTML('A') + ccChannelHTML('B') + '</div>' +
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
    '    <button type="button" id="dj-sleep-timer" class="dj-manual-fade-btn dj-sleep-btn" title="Sleep-Timer: Musik nach 15/30/60 Minuten pausieren">\u263E Timer</button>' +
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
    '</div>' +
    ccLyricsHTML();
  /* Konsolen-Layout (9.9.): Player ist keine fixe Sidebar mehr, sondern
     eine normale Kopfzeile im Seitenfluss -- die DOM-Position ist jetzt
     wichtig (frueher bei position:fixed egal). Muss VOR #decade-root
     stehen, sonst rutscht die Konsole unter den Seiteninhalt statt
     darueber. */
  var decadeRoot = document.getElementById('decade-root');
  if (decadeRoot) document.body.insertBefore(bar, decadeRoot);
  else document.body.insertBefore(bar, document.body.firstChild);

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
  /* War ein eigenes, fixiert positioniertes Panel neben der Sidebar --
     jetzt normaler Bestandteil der Master-Spalte (siehe .dj-tools-panel
     in decades.css), direkt unter Crossfader/Autofade eingehaengt. */
  var masterCol = bar.querySelector('.dj-master');
  if (masterCol) masterCol.appendChild(toolsPanel);
  else document.body.insertBefore(toolsPanel, bar.nextSibling);
  var bpmSyncBtn = toolsPanel.querySelector('#dj-bpm-sync-btn');
  if (bpmSyncBtn) bpmSyncBtn.addEventListener('click', syncIdleDeckToPlaying);
  updateBpmSync();
  setupPhoneMini(bar);
  requestAnimationFrame(ccVisualLoop);
  ccLyricsInit(bar);
  /* Hoehe der fest oben stehenden Konsole als CSS-Variable, damit Song-
     Liste und Warteschlange darunter genau den freien Platz fuellen. */
  if (window.ResizeObserver) {
    new ResizeObserver(function () {
      document.documentElement.style.setProperty('--cc-console-h', bar.offsetHeight + 'px');
    }).observe(bar);
  }
  /* Tooltips: jeder Knopf/Regler im Player bekommt seinen Beschreibungstext
     auch als title (erscheint nach kurzem Verweilen mit der Maus). */
  bar.querySelectorAll('[aria-label]:not([title])').forEach(function (el) { el.title = el.getAttribute('aria-label'); });

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
    ccWireDeckPads(bar, key);
    ccRefreshCues(key);
    var gainEl = bar.querySelector('#dj-gain-' + key);
    if (gainEl) gainEl.addEventListener('input', function () { deckGain[key] = +gainEl.value; applyCrossfaderVolumes(); });
    var dropzone = bar.querySelector('#deck-' + key + '-drop');
    dropzone.addEventListener('dragover', function (e) { e.preventDefault(); dropzone.classList.add('drag-over'); });
    dropzone.addEventListener('dragleave', function () { dropzone.classList.remove('drag-over'); });
    dropzone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      var raw = e.dataTransfer.getData('application/json');
      if (!raw) return;
      var qInfo = null;
      try { qInfo = JSON.parse(e.dataTransfer.getData('application/x-dw-queue') || 'null'); } catch (err) {}
      try {
        var song = JSON.parse(raw);
        if (qInfo) ccDropQueueSongOnDeck(song, key, qInfo);
        else loadSongToDeck(song, key, lastGridSongs, false);
        ccFlipDeck(key);
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

  var sleepBtn = bar.querySelector('#dj-sleep-timer');
  if (sleepBtn) { sleepBtn.addEventListener('click', sleepCycle); sleepRefreshBtn(); }
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
  var volA = Math.round((100 - crossfaderValue) * scale * (deckGain.A / 100));
  var volB = Math.round(crossfaderValue * scale * (deckGain.B / 100));
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
  var bpmBig = document.getElementById('deck-' + key + '-bpmbig');
  if (bpmBig) { var eb = effectiveBpm(key); bpmBig.textContent = eb ? eb.toFixed(1) : '—'; }
  updateBpmSync();
}

function updateDeckInfoUI(key) {
  if (window.__djMiniUpdate) setTimeout(window.__djMiniUpdate, 0);
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
  var bpmBig = document.getElementById('deck-' + key + '-bpmbig');
  if (bpmBig) { var eb = effectiveBpm(key); bpmBig.textContent = eb ? eb.toFixed(1) : '—'; }
  ccRefreshCues(key);
  ensureWaveformBars(key);
  drawWaveform(key);
  queuePlayerSpacing();
  refreshMixableHighlight();
  updateBpmSync();
  scheduleDjStateSave();
  decadeChipRefreshers.forEach(function (fn) { fn(); });
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

/* Medientasten / Sperrbildschirm (Media Session API) */
var msLastKey = null;
function msDeckKey() {
  if (DECKS.A.isPlaying) return 'A';
  if (DECKS.B.isPlaying) return 'B';
  if (msLastKey && DECKS[msLastKey].song) return msLastKey;
  return DECKS.A.song ? 'A' : (DECKS.B.song ? 'B' : null);
}
function updateMediaSession(key) {
  if (!('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
  var song = DECKS[key] && DECKS[key].song;
  if (!song) return;
  msLastKey = key;
  try {
    var art = song.th || song.cv;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.t || '', artist: song.a || '', album: 'driftware.online',
      artwork: art ? [{ src: art, sizes: '480x360', type: 'image/jpeg' }] : []
    });
  } catch (e) {}
}
(function setupMediaSessionHandlers() {
  if (!('mediaSession' in navigator)) return;
  function set(action, fn) { try { navigator.mediaSession.setActionHandler(action, fn); } catch (e) {} }
  set('play', function () { var k = msDeckKey(); if (k && DECKS[k].player && DECKS[k].player.playVideo) DECKS[k].player.playVideo(); });
  set('pause', function () { var k = msDeckKey(); if (k && DECKS[k].player && DECKS[k].player.pauseVideo) DECKS[k].player.pauseVideo(); });
  set('nexttrack', function () {
    var k = msDeckKey();
    if (!k) return;
    var d = DECKS[k];
    if (d.index + 1 >= d.queue.length) return;
    if (d.player && d.player.pauseVideo) d.player.pauseVideo();
    advanceAlternating(k);
  });
})();

/* Sleep-Timer: Aus -> 15 -> 30 -> 60 Minuten -> Aus. Beim Ablauf werden beide Decks pausiert. */
var SLEEP_STEPS = [0, 15, 30, 60];
var sleepStepIdx = 0, sleepEndsAt = 0, sleepTimeout = null, sleepTick = null;
function sleepLabel() {
  if (!sleepEndsAt) return '\u263E Timer';
  return '\u263E ' + Math.max(1, Math.ceil((sleepEndsAt - Date.now()) / 60000)) + ' Min';
}
function sleepRefreshBtn() {
  var b = document.getElementById('dj-sleep-timer');
  if (!b) return;
  b.textContent = sleepLabel();
  b.classList.toggle('active', !!sleepEndsAt);
}
function sleepCycle() {
  clearTimeout(sleepTimeout); clearInterval(sleepTick);
  sleepStepIdx = (sleepStepIdx + 1) % SLEEP_STEPS.length;
  var min = SLEEP_STEPS[sleepStepIdx];
  if (!min) { sleepEndsAt = 0; sleepRefreshBtn(); return; }
  sleepEndsAt = Date.now() + min * 60000;
  sleepTimeout = setTimeout(function () {
    ['A', 'B'].forEach(function (k) { var p = DECKS[k].player; if (p && p.pauseVideo) { try { p.pauseVideo(); } catch (e) {} } });
    sleepEndsAt = 0; sleepStepIdx = 0; clearInterval(sleepTick); sleepRefreshBtn();
  }, min * 60000);
  sleepTick = setInterval(sleepRefreshBtn, 20000);
  sleepRefreshBtn();
}

function onDeckStateChange(key) {
  return function (e) {
    var deck = DECKS[key];
    if (e.data === YT.PlayerState.PLAYING) {
      deck.isPlaying = true;
      deckErrorStreak[key] = 0;
      if (!deck.historyLogged) { logPlayHistory(deck.song); deck.historyLogged = true; }
      maybePreloadNext(key);
      updateMediaSession(key);
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
      try { other.player.cueVideoById(videoIdFor(nextSong), introSkipFor(nextSong)); } catch (e) {}
    } else if (!other.player) {
      other.player = new YT.Player('deck-' + otherKey + '-mount', {
        width: '100%',
        height: '100%',
        videoId: videoIdFor(nextSong),
        host: 'https://www.youtube-nocookie.com',
      playerVars: { rel: 0, playsinline: 1, autoplay: 0, start: introSkipFor(nextSong) },
        events: {
          onReady: function (e) {
            /* Wurde waehrend des Vorladens (siehe deckTogglePlay) bereits ein
               Play gewuenscht, jetzt nachholen statt stumm zu bleiben. */
            if (other.pendingPlay) {
              other.pendingPlay = false;
              try { e.target.playVideo(); } catch (err) {}
              applyCrossfaderVolumes();
            } else {
              try { e.target.setVolume(0); } catch (err) {}
            }
          },
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
var WAVEFORM_BAR_COUNT = 220;

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

  /* Club-Console-Look: gespiegelte Wellenform in drei Lagen (Bass in
     Deckfarbe, Mitten halbtransparent weiss, Hoehen weiss) wie bei
     Rekordbox, Beat-Raster aus den BPM, Hot-Cue-Marker und leuchtender
     Abspielkopf. Die Form selbst ist berechnet (YouTube liefert keine
     Audiodaten), Fortschritt/Cues/Raster sind echt. */
  var accent = getComputedStyle(document.documentElement).getPropertyValue('--deck-' + key.toLowerCase()).trim() || waveformAccentColor();
  var midY = cssH / 2;
  var n = bars.length;
  var colW = cssW / n;
  var playedX = progress * cssW;
  var bpm = deck.song && deck.song.bpm;
  if (bpm && dur > 0) {
    var beatLen = 60 / bpm;
    for (var bt = 0, k = 0; bt < dur; bt += beatLen, k++) {
      var bx = Math.round(bt / dur * cssW);
      ctx.fillStyle = k % 16 === 0 ? 'rgba(255,255,255,0.20)' : k % 4 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)';
      ctx.fillRect(bx, 0, 1, cssH);
    }
  }
  for (var i = 0; i < n; i++) {
    var x = i * colW;
    var barT = i / (n - 1);
    var inSkipZone = barT < introFrac || barT > outroFrac;
    var played = x < playedX;
    var amp = bars[i] * (cssH / 2 - 2);
    var midAmp = amp * (0.55 + 0.25 * Math.abs(Math.sin(i * 1.7)));
    var hiAmp = amp * (0.22 + 0.2 * Math.abs(Math.sin(i * 3.1 + 1)));
    var dim = inSkipZone ? 0.45 : 1;
    var w = Math.max(1, colW - 1);
    ctx.fillStyle = hexToRgba(accent, (played ? 0.45 : 1) * dim);
    ctx.fillRect(x, midY - amp, w, amp * 2);
    ctx.fillStyle = 'rgba(255,255,255,' + ((played ? 0.25 : 0.5) * dim) + ')';
    ctx.fillRect(x, midY - midAmp, w, midAmp * 2);
    ctx.fillStyle = 'rgba(255,255,255,' + ((played ? 0.4 : 0.95) * dim) + ')';
    ctx.fillRect(x, midY - hiAmp, w, hiAmp * 2);
  }
  if (dur > 0) {
    ccGetCues(deck.song).forEach(function (t, ci) {
      if (t == null) return;
      var cx = t / dur * cssW;
      ctx.fillStyle = CC_CUE_COLORS[ci];
      ctx.fillRect(cx, 0, 2, cssH);
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx + 11, 0); ctx.lineTo(cx + 11, 9); ctx.lineTo(cx, 12); ctx.fill();
      ctx.fillStyle = '#000'; ctx.font = '700 8px sans-serif'; ctx.fillText(String(ci + 1), cx + 3, 8);
    });
  }
  if (dur > 0) {
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#fff'; ctx.shadowBlur = 8;
    ctx.fillRect(Math.round(playedX) - 1, 0, 2, cssH);
    ctx.shadowBlur = 0;
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

  function freshMount() {
    /* Baut den Mount-Knoten IMMER frisch auf, statt sich auf das durch
       'deck-<key>-mount' referenzierte Element zu verlassen: YT.Player()
       ersetzt dieses Element beim ersten Aufbau durch ein <iframe> mit
       gleicher ID, und genau dieses Iframe kann durch spaetere Zustaende
       (z.B. der "kein YouTube-Video"-Zweig oben, der mount.innerHTML
       ueberschreibt) verwaist oder ungueltig werden. Ein garantiert neuer,
       leerer Container verhindert, dass YT.Player() an einem kaputten
       Knoten haengt.
       BUGFIX (10.9., Nutzerwunsch: "der weisse Punkt rotiert auch nicht
       mehr auf dem aktiven Player"): .innerHTML hier ersetzte bisher den
       KOMPLETTEN Inhalt von .dj-vinyl-disc -- inkl. ".dj-vinyl-ring" samt
       rotierendem Punkt, der urspruenglich nur beim ALLERERSTEN Aufbau der
       Deck-Leiste (siehe ensureDjPlayer weiter oben) mit eingefuegt wird.
       Sobald ein zweiter Song auf dasselbe Deck geladen wurde, fehlte der
       Ring danach dauerhaft -- kein Element mehr da, das haette rotieren
       koennen. Ring+Punkt hier deshalb IMMER mit neu aufbauen. */
    var discEl = document.getElementById('deck-' + key + '-disc');
    if (discEl) discEl.innerHTML = '<div class="dj-vinyl-video"><div id="deck-' + key + '-mount"></div></div>' +
      '<div class="dj-vinyl-ring" aria-hidden="true"><span class="dj-vinyl-dot"></span></div>';
  }

  function buildPlayer() {
    freshMount();
    deck.player = new YT.Player('deck-' + key + '-mount', {
      width: '100%',
      height: '100%',
      videoId: videoIdFor(song),
      host: 'https://www.youtube-nocookie.com',
      playerVars: { rel: 0, playsinline: 1, autoplay: autoplay ? 1 : 0, start: introSkipFor(song) },
      events: {
        onReady: function (e) {
          try { e.target.setPlaybackRate(deck.rate || 1); } catch (err) {}
          /* siehe deckTogglePlay: Play-Klick kam evtl. schon rein, bevor
             der Player bereit war -- jetzt nachholen. */
          if (autoplay || deck.pendingPlay) { e.target.playVideo(); }
          deck.pendingPlay = false;
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

  function start() {
    var mountEl = document.getElementById('deck-' + key + '-mount');
    var reused = false;
    if (deck.player && deck.player.loadVideoById && mountEl && mountEl.isConnected) {
      reused = true;
      try {
        if (autoplay) {
          deck.player.loadVideoById(videoIdFor(song), introSkipFor(song));
        } else {
          deck.player.cueVideoById(videoIdFor(song), introSkipFor(song));
        }
        deck.player.setPlaybackRate(deck.rate || 1);
      } catch (e) {
        reused = false;
      }
      // Ein wiederverwendeter Player kann von einem frueheren Vorladen
      // (maybePreloadNext) noch stumm geschaltet sein (setVolume(0)) --
      // ohne diesen Reset bliebe das Deck lautlos, bis der Nutzer zufaellig
      // den Crossfader/die Lautstaerke anfasst und dadurch applyCrossfaderVolumes()
      // erneut auslaest.
      applyCrossfaderVolumes();
    }
    if (!reused) {
      buildPlayer();
      return;
    }

    /* FREEZE-FIX (9.9.): nach Dekaden-Wechsel + Playlist-Laden kam es vor,
       dass cueVideoById()/loadVideoById() auf einem wiederverwendeten
       Player-Objekt STUMM NICHTS bewirkte -- das Iframe blieb auf dem
       alten Video stehen, DECKS.<key>.song/.queue/.index zeigten aber
       schon den neuen Song. Fuer den Nutzer sah das aus wie "Player
       startet nicht mehr". Deshalb kurz nach dem Umschaltversuch pruefen,
       ob es wirklich beim neuen Video angekommen ist -- wenn nicht, den
       alten Player verwerfen und frisch aufbauen statt das Deck tot
       stehen zu lassen. */
    var expectedId = videoIdFor(song);
    setTimeout(function () {
      if (!deck.player || deck.song !== song) return; // zwischenzeitlich schon wieder was anderes geladen
      var actual = null;
      try { actual = deck.player.getVideoData && deck.player.getVideoData().video_id; } catch (e) {}
      if (actual && actual !== expectedId) {
        try { deck.player.destroy(); } catch (e) {}
        deck.player = null;
        buildPlayer();
      }
    }, 900);
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
  if (!deck.player) {
    /* Player existiert noch gar nicht -- typischerweise beim allerersten
       Song der Seite, waehrend die YouTube-IFrame-API noch laedt
       (loadYouTubeAPI): playDeckSong hat schon einen Song gesetzt, aber
       "new YT.Player(...)" laeuft erst, sobald das API-Script fertig ist.
       Klickt der Nutzer JETZT auf Play, ging der Wunsch bisher komplett
       verloren (kein pendingPlay gesetzt, da die Funktion einfach
       zurueckkehrte) -- der Song blieb dann stumm gecued stehen, bis man
       zufaellig noch mal klickte. Play-Wunsch deshalb genau wie im
       Halb-fertig-Fall unten vormerken; playDeckSong holt ihn beim
       fertigen Aufbau nach (siehe onReady dort). */
    if (!deck.isPlaying) deck.pendingPlay = true;
    return;
  }
  /* deck.player existiert schon direkt nach "new YT.Player(...)"
     (playDeckSong/maybePreloadNext), die eigentlichen Steuer-Methoden
     (playVideo/pauseVideo) haengt die YouTube-IFrame-API aber erst beim
     onReady-Event ein -- ein Klick auf Play in diesem kurzen Fenster
     (v.a. auf einem gerade erst vorgeladenen Deck) fuehrte bisher zu
     "deck.player.playVideo is not a function" und blieb dann tot (siehe
     driftware-error-log-v1 vom 9.9.). Play-Wunsch stattdessen vormerken
     und automatisch nachholen, sobald der Player wirklich bereit ist
     (siehe onReady in playDeckSong und maybePreloadNext). */
  if (typeof deck.player.playVideo !== 'function' || typeof deck.player.pauseVideo !== 'function') {
    if (!deck.isPlaying) deck.pendingPlay = true;
    return;
  }
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
    watchdogPlayStart(key);
  }
}

/* FREEZE-FIX (9.9.): manchmal reagiert ein laenger wiederverwendeter
   Player-Objekt nicht mehr richtig auf playVideo() -- der Zustand bleibt
   haengen (z.B. CUED oder UNSTARTED), statt zu PLAYING/BUFFERING zu
   wechseln (beobachtet u.a. nach mehrfachem Dekaden-Wechsel + erneutem
   Playlist-Laden). Fuer den Nutzer sieht das aus wie "Player startet
   nicht mehr". Nach einem Play-Klick deshalb kurz pruefen, ob es
   tatsaechlich losgegangen ist -- wenn nicht, den haengenden Player
   verwerfen, frisch aufbauen und den Song mit Autoplay neu laden statt
   das Deck tot stehen zu lassen. */
function watchdogPlayStart(key) {
  var deck = DECKS[key];
  var song = deck.song;
  setTimeout(function () {
    if (!deck.player || deck.song !== song || deck.isPlaying) return; // inzwischen alles gut oder was anderes geladen
    var state = null;
    try { state = deck.player.getPlayerState(); } catch (e) {}
    if (state === 1 || state === 3) return; // spielt oder puffert schon, alles gut
    try { deck.player.destroy(); } catch (e) {}
    deck.player = null;
    playDeckSong(key, song, true);
  }, 1200);
}

function deckPause(key) {
  var deck = DECKS[key];
  cancelActiveAutoFade(key);
  if (deck.player && deck.player.pauseVideo) { try { deck.player.pauseVideo(); } catch (e) {} }
}

/* Nutzerwunsch (25.9.): "Beide leeren" (shared/nextup.js) leerte bisher
   NUR die Warteschlangen -- der aktuell im Player geladene/laufende Song
   blieb bewusst erhalten (siehe clearBothQueues()-Kommentar dort). Das
   fuehrte dazu, dass beim "kompletten Neuanfang" trotzdem noch ein Song
   im Deck haengen blieb und den Player blockierte ("einer drin bleibt
   und blockiert"). stopAndClearDeck() raeumt jetzt EIN Deck wirklich
   komplett leer: laufendes Auto-Fade/Pitch-Gleiten abbrechen, YouTube-
   Player zerstoeren (wie beim Songende in tryGaplessHandoff/
   advanceAlternating), Mount auf das Logo zuruecksetzen (wie im
   "kein YouTube-Video gefunden"-Zweig von playDeckSong) und alle
   Deck-Felder (song/queue/index/isPlaying) zuruecksetzen. Wird global
   (window.stopAndClearDeck) bereitgestellt, damit shared/nextup.js sie
   nutzen kann, ohne decades.js' interne Struktur zu duplizieren. */
function stopAndClearDeck(key) {
  var deck = DECKS[key];
  if (!deck) return;
  cancelActiveAutoFade(key);
  cancelPitchGlide(key);
  if (deck.player) { try { deck.player.destroy(); } catch (e) {} deck.player = null; }
  var mount = document.getElementById('deck-' + key + '-mount');
  if (mount) mount.innerHTML = '<div class="dj-vinyl-video-logo">' + DRIFTWARE_LOGO_SVG + '</div>';
  deck.song = null;
  deck.queue = [];
  deck.index = -1;
  deck.isPlaying = false;
  deck.historyLogged = false;
  deck.preloadedFor = null;
  if (deck.rate && deck.rate !== 1) setDeckPitch(key, 1);
  updateDeckInfoUI(key);
}
window.stopAndClearDeck = stopAndClearDeck;

/* Welches Deck die Warteschlange erhaelt, wenn per Klick auf eine
   Song-Kachel ein einzelner Song hinzugefuegt wird -- dieselbe Auswahl-
   Logik wie in shared/nextup.js' pickActiveDeck() (dort nicht direkt
   wiederverwendbar, eigenstaendige Datei), bewusst dupliziert statt eine
   Modul-Grenze dafuer aufzubrechen. */
function activeDeckForQueue() {
  if (DECKS.A && DECKS.A.isPlaying) return DECKS.A;
  if (DECKS.B && DECKS.B.isPlaying) return DECKS.B;
  if (DECKS.A && DECKS.A.song) return DECKS.A;
  if (DECKS.B && DECKS.B.song) return DECKS.B;
  return null;
}

/* Song-Kachel-Klick (9.9., Nutzerwunsch: "einzeln Songs auswaehlen, nicht
   nur die komplette Liste"): haengt NUR diesen einen Song ans Ende der
   Warteschlange des aktiven Decks, ohne den restlichen Kontext (Genre-
   Liste) reinzuladen und ohne zu unterbrechen, was gerade laeuft -- fuer
   das froeher courrant Verhalten (ganze sichtbare Liste ab hier laden)
   siehe weiterhin playAllCurrent(). Kein aktives Deck? Dann frisch auf
   das naechste freie Deck laden, ohne Autoplay (wie ein Drag&Drop-Drop
   auf eine leere Deck-Dropzone). */
function queueSongFromTile(song) {
  var deck = activeDeckForQueue();
  if (deck && deck.queue && deck.index > -1) {
    deck.queue.push(song);
  } else {
    loadSongToDeck(song, nextLoadDeck, [song], false);
  }
}

/* YouTube-Button in der Song-Kachel (Nutzerwunsch 19.9.: "Button der das
   Lied direkt im Player abspielt, soll aussehen wie das YouTube Logo") --
   anders als queueSongFromTile (haengt nur hinten an die Warteschlange an)
   laedt dieser Button den Song SOFORT auf das naechste freie/abwechselnde
   Deck (wie ein Drag&Drop) und startet die Wiedergabe direkt (autoplay),
   statt nur zu laden und auf den manuellen Play-Klick am Deck zu warten. */
function playSongDirectlyFromTile(song) {
  /* Ist schon eine Warteschlange da (aktives Deck mit Song), wird der Song
     DORT als naechster Eintrag eingefuegt und sofort gespielt -- die
     Warteschlange bleibt erhalten und laeuft danach weiter. Frueher wurde
     er allein auf das andere Deck geladen (Warteschlange nur [dieser Song]);
     die Anzeige folgt dem spielenden Deck, die eigentliche Playlist
     "verschwand" und das freie Deck lud nichts vor. */
  var deck = activeDeckForQueue();
  if (deck && deck.song && deck.queue && deck.queue.length && deck.index > -1) {
    var key = (deck === DECKS.A) ? 'A' : 'B';
    var pos = deck.isPlaying ? deck.index + 1 : deck.index;
    var sid = songId(song);
    /* Duplikat direkt dahinter vermeiden (z.B. Song stand schon als naechster in der Liste) */
    if (deck.queue[pos] && songId(deck.queue[pos]) === sid) {
      deck.queue.splice(pos, 1);
    }
    deck.queue.splice(pos, 0, song);
    deck.index = pos;
    playDeckSong(key, song, true);
    window.dispatchEvent(new Event('driftware-queue-changed'));
    return;
  }
  loadSongToDeck(song, nextLoadDeck, [song], true);
}

/* Einzelnen Song laden, im Kontext der aktuell sichtbaren Liste (Genre
   oder Suchergebnis) — landet abwechselnd auf Deck A/B. Startet nicht
   automatisch (siehe playDeckSong). Wird nicht mehr vom Song-Kachel-Klick
   aufgerufen (siehe queueSongFromTile), bleibt aber fuer evtl. andere
   Aufrufer bestehen. */
function playSongInContext(song, contextSongs) {
  loadSongToDeck(song, nextLoadDeck, contextSongs);
}

/* Ganze aktuelle Auswahl (Genre-Playlist) in die Warteschlange (9.9.,
   Nutzerwunsch: "Playlist auf Warteschlange laden muss noch gefixt
   werden" -- vorher wurde hier die GESAMTE Deck-Warteschlange ersetzt,
   genau wie beim alten Kachel-Klick, siehe queueSongFromTile). Aktives
   Deck vorhanden? Dann alle Songs ans Ende von dessen Warteschlange
   anhaengen, laufende Wiedergabe bleibt unangetastet. Kein aktives Deck?
   Dann wie bisher frisch auf das naechste freie Deck laden (erster Song
   wird aktueller Song, Rest die Warteschlange), ohne Autoplay. */
function playAllCurrent(songs) {
  var withVideo = (songs || []).filter(function (s) { return !!s.yt; });
  if (!withVideo.length) { alert('Für diese Auswahl wurde noch kein passendes YouTube-Video gefunden.'); return; }
  var deck = activeDeckForQueue();
  if (deck && deck.queue && deck.index > -1) {
    deck.queue = deck.queue.concat(withVideo);
  } else {
    loadSongToDeck(withVideo[0], nextLoadDeck, withVideo, false);
  }
  /* Bug-Fix (12.9., Nutzerbericht "Wechsel der Playlisten geht nicht,
     Playlisten werden gekickt"): anders als jede andere Queue-Aenderung
     in nextup.js hatte playAllCurrent() bisher KEIN sofortiges
     Neuzeichnen der Warteschlangen-Anzeige ausgeloest -- nextup.js ist
     eine eigenstaendige Datei (siehe Kommentar oben dort) und pollt nur
     alle 1000ms, was in der Praxis (Tab im Hintergrund/gedrosselt, oder
     einfach ungluecklicher Timing) dazu fuehren konnte, dass die Liste
     auf dem Bildschirm veraltet aussah, obwohl die eigentliche
     Warteschlange (deck.queue) schon korrekt war. Custom Event statt
     direktem Funktionsaufruf, da decades.js und nextup.js getrennte
     Scopes sind. */
  window.dispatchEvent(new Event('driftware-queue-changed'));
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

/* Nutzerwunsch (13.9.): "in den Playlisten sind auch fragwuerdige Dinger
   drin ... Videos die keinen Bezug zum Song haben, irgendwelche Werbung,
   die moechte ich per Hand aus der JSON loeschen koennen." -- nutzt
   denselben Proxy/dieselbe Warteliste wie die Genre-Korrektur (kein neuer
   Worker noetig), markiert per Sentinel-Wert im "g"-Feld aber eine
   Loesch- statt einer Verschiebe-Anfrage (siehe
   tools/process_missing_queue.py REMOVE_SENTINEL). Muss exakt mit dem
   dortigen Python-String uebereinstimmen. */
var REMOVE_SENTINEL = '__REMOVE__';

function submitSongRemoval(song, statusEl, btn) {
  statusEl.textContent = 'Wird gemeldet …';
  btn.disabled = true;
  fetch(GENRE_FIX_PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ a: song.a, t: song.t, g: REMOVE_SENTINEL, y: song.y })
  })
    .then(function (r) { if (!r.ok) throw new Error('write-failed'); return r; })
    .then(function () {
      statusEl.textContent = 'Gemeldet ✓ -- wird in Kürze (spätestens am nächsten Tag) endgültig aus dem Katalog entfernt.';
    })
    .catch(function () {
      statusEl.textContent = 'Fehlgeschlagen -- bitte später erneut versuchen.';
      btn.disabled = false;
    });
}

/* Verdrahtet den "Song endgültig entfernen"-Bereich im Song-Modal: erst
   Bestaetigung einblenden (irreversibel, siehe submitSongRemoval), erst
   nach Klick auf "Ja, entfernen" tatsaechlich melden. */
function setupRemoveUI(song) {
  var btn = document.getElementById('song-modal-remove-btn');
  var confirmBox = document.getElementById('song-modal-remove-confirm');
  var yesBtn = document.getElementById('song-modal-remove-confirm-yes');
  var noBtn = document.getElementById('song-modal-remove-confirm-no');
  var statusEl = document.getElementById('song-modal-remove-status');
  if (!btn || !confirmBox || !yesBtn || !noBtn || !statusEl) return;

  confirmBox.hidden = true;
  statusEl.textContent = '';
  btn.hidden = false;
  btn.disabled = false;

  btn.onclick = function () { confirmBox.hidden = false; btn.hidden = true; };
  noBtn.onclick = function () { confirmBox.hidden = true; btn.hidden = false; };
  yesBtn.onclick = function () {
    confirmBox.hidden = true;
    var pw = window.prompt('Zum Löschen bitte Passwort eingeben:');
    if (pw === null) {
      btn.hidden = false;
      return;
    }
    if (pw !== 'Master1701') {
      statusEl.textContent = 'Falsches Passwort -- nicht gelöscht.';
      btn.hidden = false;
      return;
    }
    submitSongRemoval(song, statusEl, btn);
    btn.hidden = false;
  };
}

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
  setupRemoveUI(song);

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
/* Ab wie vielen Songs die Liste in "Most Wanted" (oben) + "Weitere" (unten)
   aufgeteilt wird. Frueher wurde ab hier hart auf MAX_RENDERED_TILES
   abgeschnitten (Performance-Grund: viele addEventListener() pro Kachel,
   siehe Historie) -- das sorgte aber dafuer, dass bei grossen Dekaden
   (z.B. 80er mit 6000+ Songs in der "Alle"-Ansicht) ein Grossteil der
   Bibliothek unsichtbar blieb, ohne erkennbaren Grund welche Songs es
   waren (Nutzerfrage 20.9.: "6471 Songs, werden aber nicht alle angezeigt").
   Jetzt wird stattdessen nach Beliebtheit (sortByPopularity) die MENGE der
   Top-POPULARITY_SPLIT-Songs bestimmt, ALLES gerendert -- die ersten als
   klar markierter "Most Wanted"-Block, der Rest darunter unter einer
   zweiten Ueberschrift. Die REIHENFOLGE innerhalb jedes Blocks kommt aber
   von der uebergebenen `songs`-Liste selbst (siehe renderSongGrid), nicht
   von einer erneuten Popularitaets-Sortierung -- sonst ueberschrieb das
   den "Playlist neu mischen"-Button jedesmal wieder (Nutzerfrage 20.9.:
   "Button play neu mischen funktioniert nicht"): reshuffleCurrentPlaylist()
   mischt currentSongs() durch, aber renderSongGrid sortierte beim Rendern
   sofort wieder streng nach Popularitaet zurueck -- die Kacheln sprangen
   optisch in dieselbe Reihenfolge zurueck, obwohl die Playlist im
   Hintergrund (lastGridSongs) tatsaechlich neu gemischt war. Jetzt bleibt
   die MITGLIEDSCHAFT im "Most Wanted"-Block (welche 500 das sind) stabil
   nach Popularitaet, aber ihre Reihenfolge folgt dem Mix-Ergebnis --
   "neu mischen" mischt sichtbar innerhalb der 500 (und im "Weitere"-Block). */
var POPULARITY_SPLIT = 500;

/* Beliebtheits-Score pro Song: echte YouTube-Aufrufzahl ('vc', befuellt vom
   taeglichen fetch-youtube-viewcounts.yml-Workflow) wenn vorhanden, sonst
   Discogs-"Have"-Zahl ('hv', Sammler-Anzahl) als Uebergangs-Naeherung, bis
   die YouTube-Zahlen fuer den Song abgerufen wurden. Direktes Mischen beider
   Skalen in einer Sortierung ist bewusst in Kauf genommen: vc liegt ueblicherweise
   in Zehn-/Hunderttausenden bis Millionen, hv nur im niedrigen Tausenderbereich --
   Songs mit echten Aufrufzahlen sortieren sich dadurch praktisch immer vor
   noch unbefuellten, was fuer die Uebergangszeit ein sinnvolles Verhalten ist
   und sich nach dem ersten vollstaendigen Durchlauf der Pipeline von selbst
   erledigt (siehe tools/fetch_youtube_viewcounts.py). */
function popularityScore(song) {
  if (song && typeof song.vc === 'number') return song.vc;
  return (song && song.hv) || 0;
}
function sortByPopularity(songs) {
  return (songs || []).slice().sort(function (a, b) { return popularityScore(b) - popularityScore(a); });
}

/* Favoriten: Herz pro Song, seitenuebergreifend im Browser (localStorage).
   Gespeichert wird nur das Noetigste (siehe songForStorage). */
var FAV_KEY = 'dw_favs_v1';
var favCache = null;
function favLoad() {
  if (favCache) return favCache;
  favCache = {};
  try { var raw = localStorage.getItem(FAV_KEY); if (raw) favCache = JSON.parse(raw) || {}; } catch (e) { favCache = {}; }
  return favCache;
}
function favSave() { try { localStorage.setItem(FAV_KEY, JSON.stringify(favLoad())); } catch (e) {} }
function isFav(song) { return Object.prototype.hasOwnProperty.call(favLoad(), songId(song)); }
function favList() { var m = favLoad(); return Object.keys(m).map(function (k) { return m[k]; }); }
function toggleFav(song) {
  var m = favLoad(), id = songId(song);
  if (m[id]) { delete m[id]; } else { var o = songForStorage(song); o.th = song.th || null; o.cv = song.cv || null; o.favAt = Date.now(); m[id] = o; }
  favSave();
  try { document.dispatchEvent(new CustomEvent('dw-favs-changed')); } catch (e) {}
  return !!m[id];
}

/* "Passt nicht": meldet einen Song anonym als unpassend fuer diese Seite/Stimmung.
   Es wird nur beim Klick gesendet: Song-Kennung, Seite, Genre, Titel, Interpret
   -- keine IP-Speicherung, kein Nutzerbezug. Der Song verschwindet danach fuer
   diesen Browser (localStorage). Entfernt wird nichts automatisch, die
   Meldungen werden manuell geprueft. */
var FLAG_KEY = 'dw_flagged_v1';
var FLAG_URL = 'https://viyfqufxwmdpggirmbjd.supabase.co/rest/v1/rpc/flag_song';
var FLAG_ANON = 'sb_publishable_GG54x-4VLnTtRHVc1alK8w__dUpqxUt';
var flagCache = null;
function flagLoad() {
  if (flagCache) return flagCache;
  flagCache = {};
  try { var r = localStorage.getItem(FLAG_KEY); if (r) flagCache = JSON.parse(r) || {}; } catch (e) { flagCache = {}; }
  return flagCache;
}
function flagPage() { return currentPageFolder() || 'unbekannt'; }
function flagKey(song) { return (song.yt || songId(song)) + '|' + flagPage(); }
function isFlagged(song) { return Object.prototype.hasOwnProperty.call(flagLoad(), flagKey(song)); }
function flagSong(song) {
  var m = flagLoad(), k = flagKey(song);
  if (m[k]) return;
  m[k] = 1;
  try { localStorage.setItem(FLAG_KEY, JSON.stringify(m)); } catch (e) {}
  try {
    fetch(FLAG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': FLAG_ANON, 'Authorization': 'Bearer ' + FLAG_ANON },
      body: JSON.stringify({ p_key: String(song.yt || songId(song)).slice(0, 200), p_page: flagPage(), p_genre: String(song._bucket || song.g || ''), p_artist: String(song.a || ''), p_title: String(song.t || '') }),
      keepalive: true
    }).catch(function () {});
  } catch (e) {}
}

/* Cover-Fallback: fehlt das Bild oder laedt nicht, zeigt die Kachel einen
   farbigen Platzhalter mit den Initialen des Interpreten (Farbe aus dem Namen). */
function coverFallback(media, song) {
  var name = (song && song.a) || '?';
  name = name.replace(/\s*\(\d+\)\s*/g, ' ').replace(/\*/g, '').trim() || '?';
  var h = 0;
  for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  var words = name.replace(/[^A-Za-z\u00C0-\u024F0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  if (words.length > 1 && /^(the|die|der|das|les|los|el|la)$/i.test(words[0])) words.shift();
  var ini = ((words[0] || '?').charAt(0) + (words.length > 1 ? words[1].charAt(0) : '')).toUpperCase();
  media.innerHTML = '';
  media.classList.add('cover-fallback');
  media.style.background = 'linear-gradient(135deg, hsl(' + h + ',55%,38%), hsl(' + ((h + 40) % 360) + ',60%,24%))';
  var t = document.createElement('span');
  t.className = 'cover-fallback-ini';
  t.textContent = ini;
  media.appendChild(t);
}

function renderSongGrid(container, songs) {
  songs = songs.filter(function (s) { return !isFlagged(s); });
  container.innerHTML = '';
  var showMostWanted = songs.length > POPULARITY_SPLIT;
  var visible = songs;
  if (showMostWanted) {
    /* Mitgliedschaft im Most-Wanted-Block per Popularitaet bestimmen, aber
       die Reihenfolge INNERHALB jedes Blocks aus der uebergebenen `songs`-
       Liste uebernehmen (z.B. das Ergebnis von "Playlist neu mischen"),
       statt die ganze Liste hart nach Popularitaet neu zu sortieren. */
    var mostWantedIds = {};
    sortByPopularity(songs).slice(0, POPULARITY_SPLIT).forEach(function (s) {
      mostWantedIds[songId(s)] = true;
    });
    var mwGroup = [];
    var restGroup = [];
    songs.forEach(function (s) {
      (mostWantedIds[songId(s)] ? mwGroup : restGroup).push(s);
    });
    visible = mwGroup.concat(restGroup);
  }
  lastGridSongs = visible;
  if (showMostWanted) {
    var mwHeading = document.createElement('div');
    mwHeading.className = 'song-grid-section-heading song-grid-section-heading-mostwanted';
    mwHeading.innerHTML = CC_ICON.flame + ' <strong>Most Wanted</strong> — die ' + POPULARITY_SPLIT + ' meistgespielten Songs (nach YouTube-Aufrufen)';
    container.appendChild(mwHeading);
  }
  function ccBuildTile(song, songIdx) {
    if (showMostWanted && songIdx === POPULARITY_SPLIT) {
      var restHeading = document.createElement('div');
      restHeading.className = 'song-grid-section-heading';
      restHeading.textContent = 'Weitere ' + (visible.length - POPULARITY_SPLIT) + ' Songs';
      container.appendChild(restHeading);
    }
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
    img.addEventListener('error', function () { coverFallback(media, song); });
    media.appendChild(img);
    if (!img.getAttribute('src')) coverFallback(media, song);
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

    var heart = document.createElement('span');
    heart.className = 'song-tile-fav' + (isFav(song) ? ' on' : '');
    heart.textContent = isFav(song) ? '\u2665' : '\u2661';
    heart.setAttribute('role', 'button');
    heart.setAttribute('tabindex', '0');
    heart.setAttribute('aria-label', 'Favorit: ' + song.a + ' \u2013 ' + song.t);
    heart.setAttribute('aria-pressed', isFav(song) ? 'true' : 'false');
    function doFav(e) {
      e.stopPropagation();
      var on = toggleFav(song);
      heart.classList.toggle('on', on);
      heart.textContent = on ? '\u2665' : '\u2661';
      heart.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    heart.addEventListener('click', doFav);
    heart.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doFav(e); } });
    icons.appendChild(heart);

    var nofit = document.createElement('span');
    nofit.className = 'song-tile-nofit';
    nofit.textContent = '\u2298';
    nofit.title = 'Passt nicht in diese Stimmung';
    nofit.setAttribute('role', 'button');
    nofit.setAttribute('tabindex', '0');
    nofit.setAttribute('aria-label', 'Passt nicht in diese Stimmung: ' + song.a + ' \u2013 ' + song.t);
    function doFlag(e) {
      e.stopPropagation();
      flagSong(song);
      tile.classList.add('flagged-out');
      setTimeout(function () { if (tile.parentNode) tile.parentNode.removeChild(tile); }, 250);
    }
    nofit.addEventListener('click', doFlag);
    nofit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doFlag(e); } });
    icons.appendChild(nofit);

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
    play.innerHTML = hasVkFallback ? EXTERNAL_LINK_SVG : QUEUE_ADD_SVG;
    play.setAttribute('role', 'button');
    play.setAttribute('tabindex', (song.yt || hasVkFallback) ? '0' : '-1');
    play.setAttribute('aria-label', song.yt ? ('Zur Warteschlange hinzufügen: ' + song.a + ' – ' + song.t) : (hasVkFallback ? ('Auf VK ansehen: ' + song.a + ' – ' + song.t) : 'Kein Video gefunden'));
    if (song.yt) {
      play.addEventListener('click', function (e) { e.stopPropagation(); queueSongFromTile(song); });
      play.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); queueSongFromTile(song); }
      });
    } else if (hasVkFallback) {
      play.addEventListener('click', function (e) { e.stopPropagation(); window.open(song.vk, '_blank', 'noopener'); });
      play.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); window.open(song.vk, '_blank', 'noopener'); }
      });
    }
    icons.appendChild(play);

    var ytPlay = document.createElement('span');
    ytPlay.className = 'song-tile-youtube' + (song.yt ? '' : ' disabled');
    ytPlay.innerHTML = PLAY_SVG;
    ytPlay.setAttribute('role', 'button');
    ytPlay.setAttribute('tabindex', song.yt ? '0' : '-1');
    ytPlay.setAttribute('aria-label', song.yt ? ('Direkt im Player abspielen: ' + song.a + ' – ' + song.t) : 'Kein Video gefunden');
    if (song.yt) {
      ytPlay.addEventListener('click', function (e) { e.stopPropagation(); playSongDirectlyFromTile(song); });
      ytPlay.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); playSongDirectlyFromTile(song); }
      });
    }
    icons.appendChild(ytPlay);

    var check = document.createElement('span');
    check.className = 'song-tile-check';
    check.textContent = '✓';
    check.setAttribute('aria-hidden', 'true');
    icons.appendChild(check);

    heart.title = 'Zu Favoriten hinzufügen / entfernen';
    info.title = 'Song-Details und Streaming-Links';
    play.title = song.yt ? 'Zur Warteschlange hinzufügen' : (hasVkFallback ? 'Auf VK ansehen' : 'Kein Video gefunden');
    ytPlay.title = song.yt ? 'Jetzt im Player abspielen' : 'Kein Video gefunden';
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
  }

  /* Stueckweise aufbauen (Bugfix 9.10., Nutzer: "das Wechseln der Dekaden
     erzeugt eine kleine Unterbrechung"): bis zu 7000 Zeilen mit je ~10
     Elementen + Handlern am Stueck blockierten den Browser spuerbar --
     Konsole/Wellenform froren ein, je nach Rechner stockte der Ton. Jetzt
     kommen die ersten Zeilen sofort, der Rest in kleinen Paketen pro
     Frame. Ein neuer Aufruf (anderes Genre, Suche, Dekade) bricht einen
     noch laufenden Aufbau ab. */
  var token = (container.__ccRenderToken || 0) + 1;
  container.__ccRenderToken = token;
  var pos = 0;
  function renderChunk(n) {
    if (container.__ccRenderToken !== token) return;
    var end = Math.min(visible.length, pos + n);
    for (; pos < end; pos++) ccBuildTile(visible[pos], pos);
    refreshMixableHighlight();
    if (pos < visible.length) requestAnimationFrame(function () { renderChunk(250); });
  }
  renderChunk(120);
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
var ALL_KEY = '__all__';
var MIX_PER_CATEGORY = 5;

function renderPlaylistGenerator(mountRoot, config) {
  activeDecadeThemes = config.themes || null;
  var data = null;
  var currentTheme = null;
  var mixSongsCache = null;
  var allSongsCache = null;
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
    var ownList = currentTheme === MIX_KEY ? buildMixSongs() : currentTheme === ALL_KEY ? buildAllSongsFrom(data) : (data[currentTheme] || []);
    var otherList = currentTheme === MIX_KEY ? buildMixSongsFrom(linkedRawData) : currentTheme === ALL_KEY ? buildAllSongsFrom(linkedRawData) : (linkedRawData[currentTheme] || []);
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

  /* "linked" (Umriss) markiert eine per Klick VERBUNDENE Nachbar-Dekade;
     "now-playing" (kraeftige Farbe) markiert, welche Dekade GERADE
     tatsaechlich zu hoeren ist -- siehe currentPlayingDecadeKey(). Die
     eigene Dekade hat kein "linked", sie ist immer die Basis. */
  function updateLinkChipsUI() {
    var playingKey = currentPlayingDecadeKey(ownDecadeKey);
    mountRoot.querySelectorAll('.decade-link-chip').forEach(function (c) {
      var key = c.dataset.key;
      var isOwn = key === ownDecadeKey;
      var linked = !isOwn && key === linkedDecadeKey;
      c.classList.toggle('linked', linked);
      c.classList.toggle('now-playing', key === playingKey);
      c.setAttribute('aria-pressed', (isOwn ? !linkedDecadeKey : linked) ? 'true' : 'false');
    });
  }
  decadeChipRefreshers.push(updateLinkChipsUI);

  /* Verbindungs-Status wird pro eigener Dekade gemerkt (localStorage) --
     vorher gab es das NICHT: nach einem Reload zeigte "Dekade verbinden"
     wieder "getrennt", waehrend das Deck (ueber saveDjState/restoreDjState)
     trotzdem noch die VOLLE verbundene Warteschlange weiterspielte. Grid,
     Genre-Zaehler und Chip-Farbe wichen dadurch vom tatsaechlich
     spielenden Song ab ("Struktur wirkt gestoert", siehe auch
     currentPlayingDecadeKey()/_decade in songForStorage). Jetzt wird die
     Verbindung beim Laden aktiv wiederhergestellt (siehe Aufruf weiter
     unten), damit beides wieder zusammenpasst. */
  function linkStorageKey() { return 'driftware-linked-decade-' + ownDecadeKey; }

  function linkDecade(key) {
    linkedDecadeKey = key;
    linkedRawData = null;
    linkedComboCache = null;
    updateLinkChipsUI();
    refresh(); // zeigt sofort die eigene Dekade, waehrend die Nachbar-Daten laden
    try { localStorage.setItem(linkStorageKey(), key); } catch (e) {}
    fetchRawDecadeData(key).then(function (json) {
      if (linkedDecadeKey !== key) return; // in der Zwischenzeit abgewaehlt/gewechselt
      linkedRawData = json;
      computeLinkedCombo();
      refresh();
    });
  }

  function unlinkDecade() {
    if (!linkedDecadeKey) return;
    linkedDecadeKey = null;
    linkedRawData = null;
    linkedComboCache = null;
    updateLinkChipsUI();
    refresh();
    try { localStorage.removeItem(linkStorageKey()); } catch (e) {}
  }

  function toggleLinkedDecade(key) {
    manualShuffleTheme = null;
    manualShuffleSongs = null;
    if (linkedDecadeKey === key) { unlinkDecade(); return; }
    linkDecade(key);
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
    if (currentTheme === ALL_KEY) {
      if (!allSongsCache) allSongsCache = bpmSmooth(shuffled(buildAllSongsFrom(data)));
      return allSongsCache;
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

  var favMode = false;
  function updateFavBtn() {
    var n = favList().length, el = document.getElementById('gen-favs-n'), b = document.getElementById('gen-favs');
    if (el) el.textContent = n ? '(' + n + ')' : '';
    if (b) b.classList.toggle('active', favMode);
  }
  function refresh() {
    updateFavBtn();
    if (favMode) {
      var fl = favList().sort(function (a, b) { return (b.favAt || 0) - (a.favAt || 0); });
      document.getElementById('gen-count').textContent = fl.length + (fl.length === 1 ? ' Favorit' : ' Favoriten') + (fl.length ? '' : ' \u2013 tippe auf das Herz bei einem Song');
      renderSongGrid(document.getElementById('gen-grid'), fl);
      return;
    }
    var songs = currentSongs();
    if (currentTheme && currentTheme !== MIX_KEY && currentTheme !== ALL_KEY) {
      songs.forEach(function (s) { s._bucket = currentTheme; });
    }
    var countLabel = songs.length + ' Songs';
    /* Mix zeigt bewusst nur eine kleine Vorschau (MIX_PER_CATEGORY pro
       Genre) -- ohne Hinweis wirkt "25 Songs" wie die GESAMTE Bibliothek
       und sorgt wiederholt fuer Verwirrung/Sorge ("wo sind die restlichen
       Songs?"), siehe Nutzer-Rueckmeldungen. Deshalb hier zusaetzlich die
       echte Gesamtzahl aus allen Genres der geladenen Bibliothek anzeigen. */
    if (currentTheme === MIX_KEY && data) {
      var totalAll = 0;
      for (var gk in data) { if (data.hasOwnProperty(gk)) totalAll += (data[gk] || []).length; }
      if (totalAll > songs.length) {
        countLabel += ' (Mix-Vorschau von ' + totalAll + ' insgesamt)';
      }
    }
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
    favMode = false;
    currentTheme = key;
    if (key === MIX_KEY) mixSongsCache = null;
    if (key === ALL_KEY) allSongsCache = null;
    manualShuffleTheme = null;
    manualShuffleSongs = null;
    linkedComboCache = null;
    clearSearchUI();
    var genreDd = mountRoot.querySelector('#gen-genre-dd');
    if (genreDd) ddSetValue(genreDd, key);
    document.getElementById('gen-actions').classList.add('visible');
    loadData().then(function () {
      if (linkedDecadeKey && linkedRawData) computeLinkedCombo();
      refresh();
    });
  }

  function runSearch(query) {
    var hintEl = document.getElementById('gen-search-hint');
    var countEl = document.getElementById('gen-count');
    var gridEl = document.getElementById('gen-grid');
    var myToken = ++searchToken;
    if (query) favMode = false;

    if (!query) {
      hintEl.hidden = true;
      hintEl.innerHTML = '';
      if (config.themes && config.themes.length) { refresh(); } else { showEmptyState(); }
      return;
    }

    var genreDd = mountRoot.querySelector('#gen-genre-dd');
    if (genreDd) ddSetValue(genreDd, null);
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

  var genreRowHTML = (config.themes && config.themes.length ? (
      '<div class="gen-genre-row">' +
      ddHTML({
        ddId: 'gen-genre-dd',
        extraClass: 'gen-genre-dd',
        label: 'Genre',
        placeholder: 'w\u00e4hlen',
        stepper: true,
        items: [
          { value: ALL_KEY, text: 'Alle Songs', color: null, title: 'Wirklich alle Songs aus allen Genres, ungekuerzt' },
          { value: MIX_KEY, text: 'Mix – Best-of aller Genres', color: null, title: 'Die ' + MIX_PER_CATEGORY + ' beliebtesten Songs aus jedem Genre' }
        ].concat(
          config.themes.map(function (t) { return { value: t.key, text: t.label, color: null }; })
        ),
        selectedValue: null
      }) +
      '</div>'
    ) : '');

  var section = document.createElement('section');
  section.className = 'generator';
  section.innerHTML = '' +
    '<h2>' + CC_ICON.lib + ' Playlist-Generator</h2>' +
    '<p class="sub">Songs anklicken für einen grünen Haken, ⓘ zeigt alle Song-Infos. Auswahl direkt an deinen Streaming-Dienst senden.</p>' +
    '<div class="generator-search">' +
    '  <div class="search-box">' +
    '    <span class="search-box-icon">' + SEARCH_SVG + '</span>' +
    '    <input type="search" id="gen-search" class="search-input" placeholder="Song, Künstler oder Genre suchen — alle Dekaden …" autocomplete="off">' +
    '  </div>' +
    '  <p class="search-hint" id="gen-search-hint" hidden></p>' +
    '</div>' +
    decadeNavRowHTML() +
    '<div class="gen-selectors">' + switchRowHTML() + genreRowHTML + '</div>' +
    ((neighborDecades.prev || neighborDecades.next) ? (
      '<div class="decade-link-row">' +
      '  <span class="decade-link-label">' + LINK_SVG + ' Verbinden</span>' +
      /* Chronologische Reihenfolge, eigene Dekade in der Mitte (siehe
         Nutzeranforderung): [vorherige] [eigene] [naechste]. */
      [neighborDecades.prev, { key: ownDecadeKey, label: ownDecadeLabel, own: true }, neighborDecades.next]
        .filter(Boolean)
        .map(function (n) {
          var cls = 'decade-link-chip' + (n.own ? ' decade-own-chip' : '');
          return '<button class="' + cls + '" type="button" data-key="' + n.key + '" aria-pressed="false">' + escapeHtml(n.label.replace(' Music', '')) + '</button>';
        }).join('') +
      '</div>'
    ) : '') +
    '<div class="send-panel">' +
    '  <span class="send-panel-label">Dienst</span>' +
    '  <div class="provider-picker" id="gen-provider-picker"></div>' +
    '  <button class="send-btn" id="gen-send" type="button" disabled>Auswahl senden</button>' +
    '  <button class="send-btn send-btn-queue" id="gen-send-queue" type="button" disabled>In Warteschlange senden</button>' +
    '  <button class="send-clear" id="gen-send-clear" type="button" hidden>Auswahl leeren</button>' +
    '</div>' +
    '<div class="generator-actions" id="gen-actions">' +
    '  <span class="generator-count" id="gen-count"></span>' +
    '  <button id="gen-play-all" type="button" title="Die ganze aktuelle Playlist an die Warteschlange anhängen">' + PLUS_SVG + ' Alle in Warteschlange</button>' +
    '  <button id="gen-surprise" type="button" title="Zufallsmix quer durch alle Dekaden und Stimmungen">' + CC_ICON.dice + ' \u00dcberrasch mich</button>' +
    '  <button id="gen-onthisday" type="button" title="UK-Top-3-Hits rund um das heutige Datum aus fr\u00fcheren Jahren">' + CC_ICON.cal + ' Heute vor X Jahren</button>' +
    '  <button id="gen-favs" type="button" title="Meine Favoriten anzeigen">' + CC_ICON.heart + ' Favoriten <span id="gen-favs-n"></span></button>' +
    '  <button id="gen-shuffle" type="button" title="Reihenfolge der Playlist neu mischen">' + SHUFFLE_SVG + ' Mischen</button>' +
    '  <button id="gen-copy" type="button" title="Liste als Text kopieren (Interpret - Titel)">' + COPY_SVG + ' Kopieren</button>' +
    '  <a id="gen-download" download title="Liste als CSV herunterladen (für Soundiiz/TuneMyMusic)">' + DOWNLOAD_SVG + ' CSV</a>' +
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

  wireDecadeNavRow(section);
  wireSwitchRow(section);

  var linkRow = section.querySelector('.decade-link-row');
  if (linkRow) {
    linkRow.addEventListener('click', function (e) {
      var chip = e.target.closest('.decade-link-chip');
      if (!chip) return;
      if (chip.classList.contains('decade-own-chip')) { unlinkDecade(); return; }
      toggleLinkedDecade(chip.dataset.key);
    });
  }

  var genreDd = section.querySelector('#gen-genre-dd');
  if (genreDd) {
    wireDropdown(genreDd, function (value) { selectTheme(value); });
  }

  var target = mountRoot.querySelector(config.mountBefore);
  mountRoot.insertBefore(section, target || null);

  /* ERST ab hier ist .decade-link-row wirklich im mountRoot -- ein Aufruf
     von updateLinkChipsUI() vor diesem insertBefore faende ueber
     mountRoot.querySelectorAll() noch keine Chips (section haengt dann noch
     nicht im DOM) und wuerde die "now-playing"-Markierung der eigenen
     Dekade beim initialen Laden stillschweigend auslassen. */
  updateLinkChipsUI();

  renderProviderPicker(section.querySelector('#gen-provider-picker'));
  section.querySelector('#gen-send').addEventListener('click', sendSelection);
  var sendQueueBtn = section.querySelector('#gen-send-queue');
  if (sendQueueBtn) sendQueueBtn.addEventListener('click', sendSelectionToQueue);
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
  section.querySelector('#gen-surprise').addEventListener('click', function (e) {
    var btn = e.currentTarget;
    if (btn.disabled) return;
    btn.disabled = true;
    var pages = SITE_PAGES.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 3);
    Promise.all(pages.map(function (pg) {
      return fetch('/' + pg.folder + '/songs.json').then(function (r) { return r.json(); }).then(function (json) {
        var top = sortByPopularity(flattenSongs(json).filter(function (x) { return !!x.yt; })).slice(0, 400);
        top.sort(function () { return Math.random() - 0.5; });
        return top.slice(0, 12).map(function (x) { x._decade = pg.label; return x; });
      }).catch(function () { return []; });
    })).then(function (lists) {
      var seen = {}, mix = [];
      lists.forEach(function (l) { l.forEach(function (x) { if (!seen[x.yt]) { seen[x.yt] = 1; mix.push(x); } }); });
      mix.sort(function () { return Math.random() - 0.5; });
      btn.disabled = false;
      if (!mix.length) return;
      favMode = false; clearSearchUI();
      document.getElementById('gen-actions').classList.add('visible');
      document.getElementById('gen-count').textContent = mix.length + ' Songs \u2013 \u00dcberraschungsmix aus ' + pages.map(function (x) { return x.label; }).join(', ');
      renderSongGrid(document.getElementById('gen-grid'), mix);
      playAllCurrent(mix);
    }).catch(function () { btn.disabled = false; });
  });
  section.querySelector('#gen-onthisday').addEventListener('click', function (e) {
    var btn = e.currentTarget;
    if (btn.disabled) return;
    btn.disabled = true;
    fetch('/shared/chartdays.json').then(function (r) { return r.json(); }).then(function (all) {
      var now = new Date(), thisYear = now.getFullYear();
      var todayDoy = Math.floor((Date.UTC(2001, now.getMonth(), now.getDate()) - Date.UTC(2001, 0, 1)) / 86400000);
      var best = {};
      all.forEach(function (x) {
        var y = +x.d.slice(0, 4), mo = +x.d.slice(4, 6) - 1, da = +x.d.slice(6, 8);
        if (y >= thisYear) return;
        var doy = Math.floor((Date.UTC(2001, mo, da) - Date.UTC(2001, 0, 1)) / 86400000);
        var diff = Math.abs(doy - todayDoy); diff = Math.min(diff, 365 - diff);
        if (diff > 3) return;
        var cur = best[x.yt];
        if (!cur || x.p < cur.p) best[x.yt] = { p: x.p, y: y, a: x.a, t: x.t, yt: x.yt, rel: x.y, th: x.th };
      });
      var mix = Object.keys(best).map(function (k) {
        var b = best[k];
        return { a: b.a, t: b.t, y: b.rel || b.y, yt: b.yt, th: b.th || '', _decade: 'vor ' + (thisYear - b.y) + ' J.', _ago: thisYear - b.y };
      }).sort(function (a, b) { return a._ago - b._ago; });
      btn.disabled = false;
      favMode = false; clearSearchUI();
      document.getElementById('gen-actions').classList.add('visible');
      document.getElementById('gen-count').textContent = mix.length
        ? mix.length + ' Songs \u2013 UK-Top-3 rund um den ' + now.getDate() + '.' + (now.getMonth() + 1) + '. in fr\u00fcheren Jahren'
        : 'Keine Treffer f\u00fcr dieses Datum.';
      renderSongGrid(document.getElementById('gen-grid'), mix);
    }).catch(function () { btn.disabled = false; });
  });
  section.querySelector('#gen-favs').addEventListener('click', function () {
    favMode = !favMode;
    if (favMode) { clearSearchUI(); document.getElementById('gen-actions').classList.add('visible'); }
    refresh();
  });
  document.addEventListener('dw-favs-changed', function () { if (!section.isConnected) return; if (favMode) refresh(); else updateFavBtn(); });
  section.querySelector('#gen-shuffle').addEventListener('click', function () {
    reshuffleCurrentPlaylist();
  });
  section.querySelector('#gen-copy').addEventListener('click', function (e) {
    var btn = e.currentTarget;
    navigator.clipboard.writeText(asLines()).then(function () {
      btn.innerHTML = CHECK_SVG + ' Kopiert!';
      setTimeout(function () { btn.innerHTML = COPY_SVG + ' Kopieren'; }, 1500);
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

  /* Verbundene Nachbar-Dekade wiederherstellen, BEVOR das Genre gewaehlt
     wird (siehe linkDecade() oben) -- nur wenn der gespeicherte Schluessel
     tatsaechlich noch einer der beiden echten Nachbarn ist. */
  if (ownDecadeKey && (neighborDecades.prev || neighborDecades.next)) {
    var savedLinkedKey = null;
    try { savedLinkedKey = localStorage.getItem(linkStorageKey()); } catch (e) {}
    var validNeighborKeys = [neighborDecades.prev, neighborDecades.next].filter(Boolean).map(function (d) { return d.key; });
    if (savedLinkedKey && validNeighborKeys.indexOf(savedLinkedKey) !== -1) {
      linkDecade(savedLinkedKey);
    }
  }

  if (config.themes && config.themes.length) {
    /* Immer "Alle Songs" als Start, unabhaengig von einem frueher
       gewaehlten Genre -- das gemerkte letzte Genre (ueber Seitenaufrufe
       hinweg) sorgte dafuer, dass die Seite mal so, mal so startete, je
       nachdem was zuletzt angeklickt wurde. "Alle Songs" ist der
       verlaessliche, immer gleiche Einstieg (siehe Nutzeranforderung). */
    selectTheme(ALL_KEY);
  } else {
    showEmptyState();
  }

  try {
    var incomingQuery = new URLSearchParams(location.search).get('q');
    if (incomingQuery) { searchInput.value = incomingQuery; runSearch(incomingQuery); }
  } catch (e) {}
}

/* Diagnose-Protokoll fuer den Player (Ursachensuche "Warteschlange verschwindet /
   naechster Song wird nicht vorgeladen"). Haelt die letzten 300 Ereignisse mit
   dem Zustand beider Decks im Speicher (nichts wird gesendet oder gespeichert).
   Tastenkombi Strg+Umschalt+D kopiert das Protokoll in die Zwischenablage. */
(function () {
  var LOG = [];
  var T0 = Date.now();
  function snap() {
    return ['A', 'B'].map(function (k) {
      var d = DECKS[k], ps = '?';
      try { ps = d.player && d.player.getPlayerState ? d.player.getPlayerState() : '-'; } catch (e) {}
      return k + ':' + (d.song ? String(d.song.t).slice(0, 14) : '-') + (d.isPlaying ? '>' : '|') +
        ' q' + (d.queue ? d.queue.length : '?') + '/' + d.index + (d.preloadedFor ? ' pre' : '') + ' ps' + ps;
    }).join(' || ');
  }
  function log(ev) {
    LOG.push(((Date.now() - T0) / 1000).toFixed(1) + 's ' + ev + '  ' + snap());
    if (LOG.length > 300) LOG.shift();
  }
  window.djLog = log;
  window.djDump = function () {
    return 'driftware Player-Diagnose ' + new Date().toISOString() + '\n' + navigator.userAgent + '\n' + location.href + '\n\n' + LOG.join('\n');
  };
  ['playDeckSong', 'advanceAlternating', 'tryGaplessHandoff', 'maybePreloadNext', 'startAutoCrossfade',
   'finishAutoCrossfade', 'deckStep', 'loadSongToDeck', 'playAllCurrent', 'deckTogglePlay'].forEach(function (name) {
    var orig = window[name];
    if (typeof orig !== 'function') return;
    window[name] = function () {
      var a = arguments, label = name;
      if (typeof a[0] === 'string') label += '(' + a[0] + (typeof a[1] === 'number' ? ',' + a[1] : '') + ')';
      log('>' + label);
      var r;
      try { r = orig.apply(this, a); } catch (e) { log('!' + name + ' FEHLER ' + (e && e.message)); throw e; }
      log('<' + name + (r === undefined ? '' : ' =' + r));
      return r;
    };
  });
  var origOSC = window.onDeckStateChange;
  if (typeof origOSC === 'function') {
    window.onDeckStateChange = function (key) {
      var h = origOSC(key);
      return function (e) { log('YT ' + key + ' state=' + (e && e.data)); return h(e); };
    };
  }
  window.addEventListener('error', function (e) { log('JS-FEHLER ' + (e && e.message)); });
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
      e.preventDefault();
      var txt = window.djDump();
      var done = function (msg) {
        var t = document.createElement('div');
        t.textContent = msg;
        t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:99999;background:#16171d;color:#f3f3f6;border:1px solid rgba(255,255,255,.2);border-radius:10px;padding:10px 16px;font:600 14px Inter,system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.5)';
        document.body.appendChild(t);
        setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2600);
      };
      try {
        navigator.clipboard.writeText(txt).then(function () { done('Diagnose kopiert – jetzt im Chat einfügen'); }, function () { done('Kopieren nicht möglich'); });
      } catch (err) { done('Kopieren nicht möglich'); }
    }
  });
  log('Start');
})();

/* =====================================================================
   KARAOKE-LEISTE (Nutzerwunsch 9.10.): unter dem Deck, das gerade
   hoerbar ist, laufen die Liedtexte mit, ein huepfender Ball zeigt das
   aktuelle Wort. Texte werden NICHT im Repo gespeichert, sondern zur
   Laufzeit von LRCLIB (lrclib.net, freie Datenbank mit Zeitstempeln pro
   Zeile) geholt. Wort-Zeitpunkte gibt es dort nicht -- sie werden
   innerhalb einer Zeile nach Wortlaenge verteilt.
   Ball-Ablauf pro Zeile: neuer Ball faellt von links oben aufs erste
   Wort, springt im Bogen von Wort zu Wort, huepft nach dem letzten Wort
   aus dem Bild. Ohne Text (Intro, Instrumental-Teil, kein Text gefunden)
   huepft er auf der Stelle ueber einem Notensymbol, im Songtakt.
   Weil YouTube-Videos oft ein laengeres Intro haben als die Studio-
   fassung, laesst sich der Text per -/+ verschieben (pro Song gemerkt).
   ===================================================================== */
var CC_LYRICS_CACHE = {};
var CC_LYRICS_OFFSET_KEY = 'driftware-lyrics-offset-v1';
var CC_LYRICS_ON_KEY = 'driftware-lyrics-on-v1';
var CC_BALL = 9; /* Balldurchmesser in px, muss zu .cc-lyrics-ball passen */
var ccLyrics = { songKey: null, lines: null, msg: '', view: null, wordEls: [], deckKey: null, clock: null };

function ccLyricsHTML() {
  return '<div class="cc-lyrics" id="cc-lyrics">' +
    '<div class="cc-lyrics-stage" id="cc-lyrics-stage">' +
    '  <div class="cc-lyrics-prev" id="cc-lyrics-prev"></div>' +
    '  <div class="cc-lyrics-line" id="cc-lyrics-line"><span class="cc-lyrics-ball" id="cc-lyrics-ball"></span><span class="cc-lyrics-words" id="cc-lyrics-words"></span></div>' +
    '  <div class="cc-lyrics-next" id="cc-lyrics-next"></div>' +
    '</div>' +
    '<div class="cc-lyrics-ctrl">' +
    '  <button type="button" class="cc-pad cc-lyrics-toggle" id="cc-lyrics-toggle" aria-pressed="true" title="Karaoke-Leiste ein-/ausschalten">KARAOKE AN</button>' +
    '  <div class="cc-lyrics-tools">' +
    '    <button type="button" class="cc-pad cc-small" id="cc-lyrics-earlier" aria-label="Text früher (−0,5 s)">−</button>' +
    '    <span class="cc-lyrics-offset" id="cc-lyrics-offset" title="Versatz des Textes zum Video">0,0 s</span>' +
    '    <button type="button" class="cc-pad cc-small" id="cc-lyrics-later" aria-label="Text später (+0,5 s)">+</button>' +
    '    <button type="button" class="cc-pad cc-lyrics-tap" id="cc-lyrics-tap" aria-label="Jetzt: nächste Zeile wird gerade gesungen">JETZT</button>' +
    '  </div>' +
    '</div>' +
    '</div>';
}

function ccLyricsSongKey(song) { return song ? (song.a + '|' + song.t) : null; }

/* Karaoke-Fassungen (Nutzerwunsch 10.10.): Musikvideos haben oft andere
   Intros/Pausen als die Studioaufnahme, auf die LRCLIB stempelt -- der
   Text lief deshalb selten synchron. tools/fetch_karaoke_videos.py sucht
   pro Song das von YouTube erzeugte Studio-Audio ("Interpret - Topic")
   und legt es in karaoke/videos.json ab ({"a|t": {yk, d}}). Ist Karaoke
   an und gibt es eine solche Fassung, laden die Decks sie statt des
   Musikvideos (videoIdFor); beim Umschalten wechselt das Deck an der
   gleichen Stelle die Fassung (ccKaraokeSwitchDecks). */
var CC_KARAOKE_VIDEOS = null;
function ccKaraokeLoad() {
  if (CC_KARAOKE_VIDEOS) return;
  CC_KARAOKE_VIDEOS = {};
  fetch('/karaoke/videos.json').then(function (r) { return r.ok ? r.json() : {}; }).then(function (m) {
    CC_KARAOKE_VIDEOS = m || {};
    ccKaraokeSwitchDecks();
  }).catch(function () {});
}
function karaokeVideoFor(song) {
  var hit = song && CC_KARAOKE_VIDEOS && CC_KARAOKE_VIDEOS[ccLyricsSongKey(song)];
  return hit && hit.yk ? hit.yk : null;
}
function videoIdFor(song) {
  if (!song) return null;
  return (ccLyricsIsOn() && karaokeVideoFor(song)) || song.yt;
}
function ccKaraokeSwitchDecks() {
  ['A', 'B'].forEach(function (k) {
    var d = DECKS[k];
    if (!d || !d.song || !d.player || !d.player.getVideoData) return;
    var want = videoIdFor(d.song), cur = null, t = 0;
    try { cur = d.player.getVideoData().video_id; } catch (e) {}
    if (!cur || !want || cur === want) return;
    try { t = d.player.getCurrentTime() || 0; } catch (e) {}
    try {
      if (d.isPlaying) d.player.loadVideoById(want, t);
      else d.player.cueVideoById(want, Math.max(t, introSkipFor(d.song)));
    } catch (e) {}
    /* andere Fassung = andere Laenge -> Text neu passend auswaehlen */
    var key = ccLyricsSongKey(d.song);
    delete CC_LYRICS_CACHE[key];
    delete ccLyricsSeenAt[key];
    if (ccLyrics.songKey === key) ccLyrics.songKey = null;
  });
}
/* frueh laden, damit schon der erste Song die Karaoke-Fassung bekommt */
if (ccLyricsIsOn()) ccKaraokeLoad();

function ccLyricsOffsets() {
  try { return JSON.parse(localStorage.getItem(CC_LYRICS_OFFSET_KEY)) || {}; } catch (e) { return {}; }
}
function ccLyricsGetOffset(key) { return ccLyricsOffsets()[key] || 0; }
function ccLyricsSetOffset(key, val) {
  try {
    var o = ccLyricsOffsets();
    if (Math.abs(val) < 0.01) delete o[key]; else o[key] = Math.round(val * 10) / 10;
    localStorage.setItem(CC_LYRICS_OFFSET_KEY, JSON.stringify(o));
  } catch (e) {}
}
function ccLyricsFormatOffset(v) { return (v > 0 ? '+' : '') + v.toFixed(1).replace('.', ',') + ' s'; }

/* Standard AUS (Nutzerwunsch 10.10.): mit Karaoke laeuft die Studiofassung
   statt des Musikvideos -- das soll nur bekommen, wer Karaoke selbst einschaltet. */
function ccLyricsIsOn() {
  try { return localStorage.getItem(CC_LYRICS_ON_KEY) === '1'; } catch (e) { return false; }
}

/* Titel fuer die Suche saeubern: "(Remix)", "[Live]", "- 2011 Remaster",
   "feat. ..." verhindern sonst jeden Treffer. */
function ccLyricsClean(str) {
  return String(str || '')
    .replace(/\s*[\(\[][^\)\]]*[\)\]]/g, '')
    .replace(/\s+-\s+.*$/, '')
    .replace(/\s+(feat\.?|ft\.?|featuring)\s+.*$/i, '')
    .trim();
}

/* LRC -> nur gesungene Zeilen. Leere LRC-Zeilen markieren nur das Ende
   der vorigen Zeile. singEnd: bis wann der Ball ueber die Zeile springt
   (bei langer Pause danach hoechstens ~0,45 s pro Wort). */
function ccLyricsParse(lrc) {
  var raw = [];
  String(lrc || '').split(/\r?\n/).forEach(function (row) {
    var m, re = /\[(\d+):(\d+(?:\.\d+)?)\]/g, times = [], last = 0;
    while ((m = re.exec(row))) { times.push(parseInt(m[1], 10) * 60 + parseFloat(m[2])); last = re.lastIndex; }
    var text = row.slice(last).trim();
    times.forEach(function (t) { raw.push({ t: t, text: text }); });
  });
  raw.sort(function (a, b) { return a.t - b.t; });
  var out = [];
  for (var i = 0; i < raw.length; i++) {
    if (!raw[i].text) continue;
    var end = i + 1 < raw.length ? raw[i + 1].t : raw[i].t + 5;
    var words = raw[i].text.split(/\s+/);
    var weights = words.map(function (w) { return Math.max(2, w.replace(/[^\p{L}\p{N}]/gu, '').length) + 1; });
    out.push({
      t: raw[i].t, text: raw[i].text, words: words, weights: weights,
      total: weights.reduce(function (s, w) { return s + w; }, 0),
      singEnd: Math.max(raw[i].t + 0.3, Math.min(end - 0.1, raw[i].t + words.length * 0.45 + 0.6))
    });
  }
  /* Aus-/Einflug: der Ball springt schon in der zweiten Haelfte des
     letzten Wortes aus dem Bild (bei Zeilen ohne Pause dazwischen bliebe
     sonst keine Zeit dafuer); Ausflug und Einflug des naechsten Balls
     teilen sich das Fenster bis zur naechsten Zeile. */
  for (var j = 0; j < out.length; j++) {
    var L = out[j];
    var lastW = L.weights[L.weights.length - 1];
    L.lastStart = L.t + (L.total - lastW) / L.total * (L.singEnd - L.t);
    L.exitStart = Math.max(L.lastStart + 0.15, L.lastStart + 0.5 * (L.singEnd - L.lastStart));
    var nextT = j + 1 < out.length ? out[j + 1].t : Infinity;
    var win = Math.max(0.2, nextT - L.exitStart);
    L.exitEnd = L.exitStart + Math.min(0.6, win * 0.55);
    if (j + 1 < out.length) out[j + 1].entryStart = nextT - Math.max(0.1, Math.min(0.5, nextT - L.exitEnd));
  }
  if (out.length) out[0].entryStart = out[0].t - 0.5;
  return out;
}

function ccLyricsFetch(song, durationHint) {
  var key = ccLyricsSongKey(song);
  if (CC_LYRICS_CACHE[key]) return CC_LYRICS_CACHE[key];
  var artist = ccLyricsClean(String(song.a || '').split(/,|&| x | und /i)[0]);
  var title = ccLyricsClean(song.t);
  var url = 'https://lrclib.net/api/search?track_name=' + encodeURIComponent(title) + '&artist_name=' + encodeURIComponent(artist);
  CC_LYRICS_CACHE[key] = fetch(url).then(function (r) { return r.ok ? r.json() : []; }).then(function (list) {
    var synced = (list || []).filter(function (x) { return x && x.syncedLyrics && !x.instrumental; });
    if (!synced.length) return (list || []).some(function (x) { return x && x.instrumental; }) ? 'instrumental' : null;
    if (durationHint) synced.sort(function (a, b) { return Math.abs(a.duration - durationHint) - Math.abs(b.duration - durationHint); });
    var lines = ccLyricsParse(synced[0].syncedLyrics);
    lines.dur = synced[0].duration || 0; /* fuer den "nicht synchron"-Hinweis */
    return lines.length ? lines : null;
  }).catch(function () { delete CC_LYRICS_CACHE[key]; ccLyricsRetryAt[key] = performance.now() + 30000; return 'error'; });
  return CC_LYRICS_CACHE[key];
}

/* Text schon suchen, sobald ein Deck seinen Song fertig geladen hat
   (Videolaenge bekannt -> passendere Textversion), auch auf dem gerade
   nicht hoerbaren Deck -- so ist er beim Wechsel sofort da und der
   Karaoke-Knopf zeigt gleich, ob es Text gibt. Laedt ein Video nicht,
   wird nach 4 s ohne Laengenangabe gesucht. */
var ccLyricsSeenAt = {};
var ccLyricsRetryAt = {}; /* nach Netzfehler erst 30 s spaeter neu suchen */
function ccLyricsPrefetch() {
  ['A', 'B'].forEach(function (k) {
    var d = DECKS[k], key = ccLyricsSongKey(d.song);
    if (!key || CC_LYRICS_CACHE[key]) return;
    if (ccLyricsRetryAt[key] && performance.now() < ccLyricsRetryAt[key]) return;
    var dur = 0;
    try { dur = d.player && d.player.getDuration ? d.player.getDuration() || 0 : 0; } catch (e) {}
    /* Karaoke-Fassung: Laenge steht schon in karaoke/videos.json -- nicht
       erst aufs Video warten (sonst nach 4 s Suche ohne Laenge, falsche Fassung) */
    var kv = CC_KARAOKE_VIDEOS && CC_KARAOKE_VIDEOS[key];
    if (!dur && kv && kv.d && videoIdFor(d.song) === kv.yk) dur = kv.d;
    var now = performance.now();
    if (!ccLyricsSeenAt[key]) ccLyricsSeenAt[key] = now;
    if (dur > 0 || now - ccLyricsSeenAt[key] > 4000) ccLyricsFetch(d.song, dur);
  });
}

/* Welches Deck ist "dran"? Das hoerbare -- bei zwei laufenden Decks
   entscheidet der Crossfader (wie currentPlayingDecadeKey). */
function ccLyricsActiveDeck() {
  var a = DECKS.A, b = DECKS.B;
  if (a.isPlaying && !b.isPlaying) return 'A';
  if (b.isPlaying && !a.isPlaying) return 'B';
  if (a.isPlaying && b.isPlaying) return crossfaderValue <= 50 ? 'A' : 'B';
  if (ccLyrics.deckKey && DECKS[ccLyrics.deckKey].song) return ccLyrics.deckKey;
  return a.song ? 'A' : (b.song ? 'B' : null);
}

/* Geglaettete Spielzeit: getCurrentTime() von YouTube springt in kleinen
   Stufen -- dazwischen laeuft eine eigene Uhr weiter, die nur sanft
   nachgezogen (bzw. bei Sprung/Seek sofort gesetzt) wird. */
function ccLyricsClock(deckKey, deck, songKey) {
  var now = performance.now(), actual = 0, rate = 1;
  try { actual = deck.player.getCurrentTime() || 0; } catch (e) {}
  try { rate = deck.player.getPlaybackRate ? deck.player.getPlaybackRate() || 1 : 1; } catch (e) {}
  var c = ccLyrics.clock;
  if (!c || c.deckKey !== deckKey || c.songKey !== songKey) {
    c = ccLyrics.clock = { deckKey: deckKey, songKey: songKey, t: actual, at: now };
    return actual;
  }
  var pred = c.t + (deck.isPlaying ? (now - c.at) / 1000 * rate : 0);
  if (!deck.isPlaying || Math.abs(actual - pred) > 0.3) pred = deck.isPlaying ? actual : actual;
  else pred += (actual - pred) * 0.06;
  c.t = pred; c.at = now;
  return pred;
}

function ccLyricsEl(id) { return document.getElementById(id); }

/* Hauptzeile setzen (Woerter einzeln, Schrift ggf. verkleinern, damit
   die Zeile in die Deck-Spalte passt). */
function ccLyricsSetMain(words, isWords) {
  var el = ccLyricsEl('cc-lyrics-words');
  el.innerHTML = '';
  el.style.fontSize = '';
  ccLyrics.wordEls = [];
  words.forEach(function (w, i) {
    var span = document.createElement('span');
    span.className = isWords ? 'cc-lyrics-word' : 'cc-lyrics-note';
    span.textContent = w;
    el.appendChild(span);
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    ccLyrics.wordEls.push(span);
  });
  var stage = ccLyricsEl('cc-lyrics-stage');
  var size = 26;
  while (el.scrollWidth > stage.clientWidth - 30 && size > 14) { size -= 2; el.style.fontSize = size + 'px'; }
}

function ccLyricsRender(view, lines, idx) {
  if (ccLyrics.view === view) return;
  ccLyrics.view = view;
  var prev = ccLyricsEl('cc-lyrics-prev'), next = ccLyricsEl('cc-lyrics-next');
  if (view === 'none') {
    ccLyricsSetMain([], false);
    prev.textContent = ''; next.textContent = ccLyrics.msg;
    return;
  }
  if (view === 'msg') {
    ccLyricsSetMain(['♪'], false);
    prev.textContent = ''; next.textContent = ccLyrics.msg;
    return;
  }
  var kind = view.split(':')[0];
  if (kind === 'line') {
    ccLyricsSetMain(lines[idx].words, true);
    prev.textContent = idx > 0 ? lines[idx - 1].text : '';
    next.textContent = idx + 1 < lines.length ? lines[idx + 1].text : '';
  } else { /* 'idle': Pause vor Zeile idx+1 */
    ccLyricsSetMain(['♪'], false);
    prev.textContent = idx >= 0 ? lines[idx].text : '';
    next.textContent = idx + 1 < lines.length ? lines[idx + 1].text : '';
  }
}

function ccLyricsCenter(el) { return el.offsetLeft + el.offsetWidth / 2; }

/* Ball setzen: x = Mitte, y = Hoehe ueber der Ruhelage (positiv = hoch),
   sq = Stauchung beim Aufsetzen (0..1). */
function ccLyricsBall(x, y, opacity, sq) {
  var ball = ccLyricsEl('cc-lyrics-ball');
  if (opacity <= 0) { ball.style.opacity = '0'; return; }
  var s = sq || 0;
  ball.style.opacity = String(opacity);
  ball.style.transform = 'translate(' + (x - CC_BALL / 2).toFixed(1) + 'px,' + (-y).toFixed(1) + 'px) scale(' + (1 + 0.25 * s).toFixed(3) + ',' + (1 - 0.25 * s).toFixed(3) + ')';
}

function ccLyricsArc(u, h) { return 4 * h * u * (1 - u); }
function ccLyricsSquash(u) { var d = Math.min(u, 1 - u); return d < 0.07 ? 1 - d / 0.07 : 0; }

/* Auf der Stelle huepfen (im Takt, falls BPM bekannt) */
function ccLyricsIdleHop(t, deckKey) {
  var el = ccLyrics.wordEls[0];
  if (!el) { ccLyricsBall(0, 0, 0); return; }
  var bpm = effectiveBpm(deckKey);
  var period = bpm ? 60 / bpm : 0.5;
  while (period < 0.4) period *= 2;
  var u = ((t / period) % 1 + 1) % 1;
  ccLyricsBall(ccLyricsCenter(el), ccLyricsArc(u, 11), 1, ccLyricsSquash(u));
}

/* Knopf zeigt, ob es zum Song Karaoke gibt (Nutzerwunsch 9.10.):
   gruen = Text da, grau = kein Text / Suche laeuft / selbst ausgeschaltet.
   Ohne Text klappt die Leiste auf die schmale Zeile zusammen. */
function ccLyricsSetAvail(state) {
  if (ccLyrics.avail === state) return;
  ccLyrics.avail = state;
  var root = ccLyricsEl('cc-lyrics'), btn = ccLyricsEl('cc-lyrics-toggle');
  root.classList.toggle('cc-lyrics-has', state === 'yes' || state === 'unsure');
  root.classList.toggle('cc-lyrics-unsure', state === 'unsure');
  btn.textContent = state === 'off' ? 'KARAOKE AUS' : state === 'yes' ? 'KARAOKE AN' : state === 'unsure' ? 'KARAOKE ?' : state === 'search' ? 'KARAOKE …' : 'KEIN TEXT';
  btn.title = state === 'off' ? 'Karaoke einschalten'
    : state === 'yes' ? 'Liedtext gefunden – Karaoke ausschalten'
    : state === 'unsure' ? 'Die gefundene Textfassung ist anders lang als dieses Video – der Text läuft evtl. nicht synchron. Mit JETZT oder −/+ angleichen. (Klick: Karaoke ausschalten)'
    : state === 'search' ? 'Liedtext wird gesucht …'
    : 'Für diesen Song gibt es keinen synchronen Liedtext – Karaoke ausschalten';
}

function ccLyricsTick() {
  if (!ccLyricsIsOn()) { ccLyricsSetAvail('off'); return; }
  var root = ccLyricsEl('cc-lyrics');
  if (!root) return;
  var deckKey = ccLyricsActiveDeck();
  var deck = deckKey ? DECKS[deckKey] : null;
  var song = deck && deck.song;
  var key = ccLyricsSongKey(song);
  if (deckKey !== ccLyrics.deckKey) {
    ccLyrics.deckKey = deckKey;
    root.classList.toggle('cc-lyrics-on-b', deckKey === 'B');
    ccLyrics.view = null;
  }
  if (key !== ccLyrics.songKey) {
    ccLyrics.songKey = key;
    ccLyrics.lines = null;
    ccLyrics.view = null;
    ccLyricsEl('cc-lyrics-offset').textContent = ccLyricsFormatOffset(key ? ccLyricsGetOffset(key) : 0);
    ccLyrics.attached = false;
    ccLyrics.msg = song ? 'Liedtext wird gesucht …' : 'Song starten – hier läuft der Text zum Mitsingen';
  }
  ccLyricsPrefetch();
  /* Suche fuer den aktuellen Song laeuft (oder ist fertig) -> Ergebnis
     einmal abholen. Gesucht wird in ccLyricsPrefetch, sobald das Deck
     fertig geladen hat. */
  if (song && !ccLyrics.attached && CC_LYRICS_CACHE[key]) {
    ccLyrics.attached = true;
    CC_LYRICS_CACHE[key].then(function (res) {
        if (ccLyrics.songKey !== key) return;
        ccLyrics.view = null;
        if (res === 'instrumental') ccLyrics.msg = 'Instrumental – einfach mitsummen';
        else if (res === 'error') { ccLyrics.songKey = null; ccLyrics.msg = 'Liedtext-Dienst gerade nicht erreichbar'; }
        else if (!res) ccLyrics.msg = 'Für diesen Song gibt es noch keinen synchronen Liedtext';
        else { ccLyrics.lines = res; ccLyrics.msg = ''; }
    });
  }
  var avail = ccLyrics.lines ? 'yes' : (song && ccLyrics.msg === 'Liedtext wird gesucht …') ? 'search' : 'no';
  if (avail === 'yes' && ccLyrics.lines.dur && deck && deck.player && deck.player.getDuration) {
    /* Hinweis (Nutzerwunsch 10.10.): Textfassung > 3 s anders lang als das
       Video -> Text kann nicht von selbst passen */
    var vdur = 0;
    try { vdur = deck.player.getDuration() || 0; } catch (e) {}
    if (vdur > 0 && Math.abs(vdur - ccLyrics.lines.dur) > 3) avail = 'unsure';
  }
  ccLyricsSetAvail(avail);
  if (!song) { ccLyricsRender('none'); ccLyricsBall(0, 0, 0); return; }
  if (!deck.player || !deck.player.getCurrentTime) return;
  var t = ccLyricsClock(deckKey, deck, key) - ccLyricsGetOffset(key);
  var lines = ccLyrics.lines;
  if (!lines) { ccLyricsRender('msg'); ccLyricsIdleHop(t, deckKey); return; }

  /* Aktuelle Zeile = letzte, deren Einflug schon begonnen hat */
  var idx = -1;
  for (var i = 0; i < lines.length; i++) { if (lines[i].entryStart <= t) idx = i; else break; }
  if (idx < 0) { ccLyricsRender('idle:-1', lines, -1); ccLyricsIdleHop(t, deckKey); return; }
  var L = lines[idx];
  var nextEntry = idx + 1 < lines.length ? lines[idx + 1].entryStart : Infinity;
  var exitEnd = L.exitEnd;

  /* Lange Pause nach dem Ausflug: Notensymbol + Huepfen auf der Stelle */
  if (t >= exitEnd && nextEntry - exitEnd > 1.2) {
    ccLyricsRender('idle:' + idx, lines, idx);
    ccLyricsIdleHop(t, deckKey);
    return;
  }
  ccLyricsRender('line:' + idx, lines, idx);
  var els = ccLyrics.wordEls;
  if (!els.length) return;
  var stageW = ccLyricsEl('cc-lyrics-line').offsetWidth;

  if (t < L.t) {
    /* Einflug: neuer Ball faellt von links oben aufs erste Wort */
    var ue = 1 - (L.t - t) / (L.t - L.entryStart);
    var x0 = ccLyricsCenter(els[0]);
    var fx = x0 - 90 + 90 * ue;
    var fy = 46 * (1 - ue * ue);
    els.forEach(function (el) { el.classList.remove('sung', 'now'); });
    ccLyricsBall(fx, fy, Math.min(1, ue * 3), 0);
    return;
  }
  if (t >= exitEnd) { ccLyricsBall(0, 0, 0); return; }
  if (t >= L.exitStart) {
    /* Ausflug: vom letzten Wort im Bogen nach rechts aus dem Bild */
    els.forEach(function (el, k) { el.classList.add('sung'); el.classList.toggle('now', k === els.length - 1 && t < L.singEnd); });
    var ux = Math.min(1, (t - L.exitStart) / (exitEnd - L.exitStart));
    var xl = ccLyricsCenter(els[els.length - 1]);
    var ex = xl + (stageW - xl + 140) * ux;
    var ey = 34 * ux - 110 * ux * ux;
    ccLyricsBall(ex, ey, 1 - Math.max(0, ux - 0.7) / 0.3, 0);
    return;
  }
  /* Gesang: ein Sprung pro Wort -- landet genau, wenn das Wort dran ist */
  var p = (t - L.t) / (L.singEnd - L.t) * L.total;
  var wi = 0, acc = 0;
  while (wi < L.weights.length - 1 && acc + L.weights[wi] <= p) { acc += L.weights[wi]; wi++; }
  var u = Math.min(1, Math.max(0, (p - acc) / L.weights[wi]));
  els.forEach(function (el, k) {
    el.classList.toggle('sung', k < wi);
    el.classList.toggle('now', k === wi);
  });
  var xa = ccLyricsCenter(els[wi]);
  if (wi + 1 < els.length) {
    var xb = ccLyricsCenter(els[wi + 1]);
    var h = Math.max(8, Math.min(18, (xb - xa) * 0.3));
    ccLyricsBall(xa + (xb - xa) * u, ccLyricsArc(u, h), 1, ccLyricsSquash(u));
  } else {
    /* letztes Wort: gerade gelandet, kurz gestaucht, dann Absprung */
    var ul = Math.min(1, (t - L.lastStart) / Math.max(0.05, L.exitStart - L.lastStart));
    ccLyricsBall(xa, 0, 1, Math.max(0, 1 - ul * 3));
  }
}

function ccLyricsApplyOn(on) {
  var root = ccLyricsEl('cc-lyrics');
  var btn = ccLyricsEl('cc-lyrics-toggle');
  root.classList.toggle('cc-lyrics-off', !on);
  btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  ccLyrics.avail = null;
  ccLyricsSetAvail(on ? 'search' : 'off');
  /* Beim Wiedereinschalten Song neu auswerten (Text ggf. erst jetzt holen) */
  ccLyrics.songKey = undefined;
  ccLyrics.lines = null;
  ccLyrics.view = null;
}

function ccLyricsInit(bar) {
  if (!ccLyricsEl('cc-lyrics')) return;
  function nudge(d) {
    if (!ccLyrics.songKey) return;
    ccLyricsSetOffset(ccLyrics.songKey, ccLyricsGetOffset(ccLyrics.songKey) + d);
    ccLyricsEl('cc-lyrics-offset').textContent = ccLyricsFormatOffset(ccLyricsGetOffset(ccLyrics.songKey));
  }
  bar.querySelector('#cc-lyrics-earlier').addEventListener('click', function () { nudge(-0.5); });
  bar.querySelector('#cc-lyrics-later').addEventListener('click', function () { nudge(0.5); });
  bar.querySelector('#cc-lyrics-earlier').title = 'Text kommt zu spät? Früher schieben (−0,5 s)';
  bar.querySelector('#cc-lyrics-later').title = 'Text kommt zu früh? Später schieben (+0,5 s)';
  /* Tap-Sync: Die Zeitstempel bei LRCLIB passen oft zu einer anderen
     Aufnahme als dem YouTube-Video (gleiche Stempel fuer alle Fassungen),
     und das Video-Audio ist im fremden iframe nicht auswertbar. Darum:
     Nutzer drueckt JETZT, wenn die unten angezeigte naechste Zeile
     gesungen wird -> Versatz = Videozeit - Zeilenstart (minus ~0,15 s
     Reaktionszeit), pro Song gespeichert. */
  bar.querySelector('#cc-lyrics-tap').title = 'Drück genau dann, wenn die unten angezeigte nächste Zeile gesungen wird – der Text richtet sich danach aus';
  bar.querySelector('#cc-lyrics-tap').addEventListener('click', function () {
    var key = ccLyrics.songKey, lines = ccLyrics.lines, deck = ccLyrics.deckKey && DECKS[ccLyrics.deckKey];
    if (!key || !lines || !deck || !deck.player || !deck.player.getCurrentTime) return;
    var raw = 0;
    try { raw = deck.player.getCurrentTime() || 0; } catch (e) { return; }
    var shown = raw - ccLyricsGetOffset(key);
    var target = null;
    for (var i = 0; i < lines.length; i++) { if (lines[i].t > shown) { target = lines[i]; break; } }
    if (!target) return;
    ccLyricsSetOffset(key, raw - 0.15 - target.t);
    ccLyricsEl('cc-lyrics-offset').textContent = ccLyricsFormatOffset(ccLyricsGetOffset(key));
    ccLyrics.view = null;
  });
  bar.querySelector('#cc-lyrics-toggle').addEventListener('click', function () {
    var on = !ccLyricsIsOn();
    try { localStorage.setItem(CC_LYRICS_ON_KEY, on ? '1' : '0'); } catch (e) {}
    ccLyricsApplyOn(on);
    if (on) ccKaraokeLoad();
    ccKaraokeSwitchDecks();
  });
  ccLyricsApplyOn(ccLyricsIsOn());
  (function loop() { requestAnimationFrame(loop); try { ccLyricsTick(); } catch (e) {} })();
}
