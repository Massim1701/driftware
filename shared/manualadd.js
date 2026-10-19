/* Button "Song nicht gefunden" neben dem MIDI-Button. Oeffnet ein kleines
   Formular: Interpret + Titel eintragen, per Klick eine YouTube-Suche in
   neuem Tab oeffnen, den gefundenen Link zurueck einfuegen -> der Song geht
   ueber den Worker (POST /v1/queue) in die Online-Warteliste
   (queue/fehlende-lieder.json im Repo). Eine taegliche GitHub-Action baut
   die Eintraege in die songs.json ein und nimmt sie dabei aus der Warteliste.

   Die Liste im Fenster zeigt den ECHTEN Stand dieser Warteliste (wird beim
   Oeffnen und alle 30 s neu gelesen): was eingebaut wurde, verschwindet von
   selbst. Es gibt keine lokale Sicherungsdatei mehr (frueher "Autosave",
   File System Access API) -- das war eine Notloesung fuer den ausgefallenen
   Online-Speicher und loeste das macOS-Fenster "Datei ersetzen?" aus.

   Postausgang: Ein Song, der nicht rausging (offline, Worker-Fehler), bleibt
   im localStorage (driftware-outbox-v1) und wird automatisch erneut gesendet.

   Eigenstaendige Datei (wie midi.js/continuity.js/nextup.js) -- liest nur
   window.playDeckSong etc. aus decades.js, keine Aenderung dort noetig. */

(function () {
  var panelEl = null;
  var listEl = null;
  var modalEl = null;
  var statusEl = null;
  var stylesInjected = false;
  var globalListenersBound = false;

  /* Akzeptiert volle YouTube-URL (watch?v=, youtu.be/, shorts/) oder direkt
     eine nackte 11-stellige Video-ID. */
  function extractYoutubeId(input) {
    if (!input) return null;
    input = input.trim();
    var m = input.match(/[?&]v=([A-Za-z0-9_-]{11})/) ||
      input.match(/youtu\.be\/([A-Za-z0-9_-]{11})/) ||
      input.match(/\/shorts\/([A-Za-z0-9_-]{11})/) ||
      input.match(/^([A-Za-z0-9_-]{11})$/);
    return m ? m[1] : null;
  }

  /* Faellt YouTube komplett aus (kein Video vorhanden), kann stattdessen ein
     VK-Link (vkvideo.ru/vk.com) eingetragen werden -- wird NICHT eingebettet
     (VK bietet anders als YouTube keine JS-Fernsteuerung fuer das Deck-System),
     sondern nur als "Auf VK ansehen"-Link gespeichert/angezeigt. Akzeptiert
     entweder den kompletten <iframe>-Einbettungscode von VK ("Teilen" ->
     "Einbetten") oder einen direkten Link auf vkvideo.ru/vk.com. */
  function extractVkUrl(input) {
    if (!input) return null;
    input = input.trim();
    var iframeMatch = input.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframeMatch) input = iframeMatch[1];
    var m = input.match(/^(https?:\/\/(?:www\.)?(?:vkvideo\.ru|vk\.com)\/[^\s"']+)/i);
    return m ? m[1] : null;
  }

  /* ---- Postausgang + Online-Warteliste ---- */
  var OUTBOX_KEY = 'driftware-outbox-v1';
  var QUEUE_PROXY_URL = 'https://driftware-api.driftware-api.workers.dev/v1/queue';
  var QUEUE_RAW_URL = 'https://raw.githubusercontent.com/Massim1701/driftware/master/queue/fehlende-lieder.json';
  var queueList = [];
  var queueLoaded = false;
  var sending = false;
  var pollTimer = null;
  var retryTimer = null;

  function loadOutbox() {
    try { return JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]') || []; } catch (e) { return []; }
  }
  function saveOutbox(list) {
    try { localStorage.setItem(OUTBOX_KEY, JSON.stringify(list)); } catch (e) {}
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function payloadOf(e) {
    var p = { a: e.a, t: e.t, yt: e.yt || null };
    if (e.vk) p.vk = e.vk;
    if (e.g) { p.g = e.g; p.y = e.y; }
    return p;
  }

  /* Liest die Online-Warteliste frisch (Zeitstempel im URL umgeht den CDN-Cache). */
  function refreshQueue() {
    return fetch(QUEUE_RAW_URL + '?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('read-failed'); return r.json(); })
      .then(function (list) {
        queueList = Array.isArray(list) ? list : [];
        queueLoaded = true;
        renderList();
      })
      .catch(function () {
        if (!queueLoaded) setStatus('Warteliste konnte nicht geladen werden.');
      });
  }

  /* Sendet den Postausgang nacheinander. Erfolg -> Eintrag raus aus dem Postausgang;
     ungueltig (400) -> verwerfen, wuerde nie klappen; Netz-/Serverfehler/Limit -> bleibt,
     naechster Versuch automatisch. Der Worker ignoriert Dubletten. */
  function sendOutbox() {
    if (sending) return Promise.resolve();
    var box = loadOutbox();
    if (!box.length) return Promise.resolve();
    sending = true;
    setStatus('Wird online gespeichert …');
    var failed = false;
    function next() {
      box = loadOutbox();
      if (!box.length) return Promise.resolve();
      var e = box[0];
      return fetch(QUEUE_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadOf(e))
      }).then(function (r) {
        if (r.ok || r.status === 400) {
          saveOutbox(loadOutbox().filter(function (x) { return x.id !== e.id; }));
          return next();
        }
        failed = true;
      });
    }
    return next().catch(function () { failed = true; }).then(function () {
      sending = false;
      setStatus(failed ? 'Senden hat nicht geklappt – neuer Versuch in 60 Sekunden.' : 'Gesendet ✓');
      renderList();
      return refreshQueue();
    });
  }

  function addEntry(a, t, ytId, vkUrl, manualMeta) {
    var box = loadOutbox();
    box.push({ id: Date.now() + '-' + Math.random().toString(36).slice(2, 7), a: a, t: t, yt: ytId, vk: vkUrl || null,
      g: manualMeta ? manualMeta.g : null, y: manualMeta ? manualMeta.y : null });
    saveOutbox(box);
    renderList();
    sendOutbox();
  }

  function itemsToShow() {
    var items = loadOutbox().map(function (e, i) {
      return { src: 'o', i: i, a: e.a, t: e.t, yt: e.yt, vk: e.vk, state: 'wird gesendet' };
    });
    queueList.forEach(function (e, i) {
      items.push({ src: 'q', i: i, a: e.a, t: e.t, yt: e.yt, vk: e.vk, state: 'wartet auf Einbau' });
    });
    return items;
  }

  function renderList() {
    if (!listEl) return;
    var items = itemsToShow();
    if (!items.length) {
      listEl.innerHTML = '<li class="manualadd-empty">' + (queueLoaded ? 'Die Warteliste ist leer – alles eingebaut ✓' : 'Lade …') + '</li>';
      return;
    }
    listEl.innerHTML = items.map(function (e) {
      return '<li class="manualadd-item">' +
        '<span class="manualadd-text"><strong>' + escapeHtml(e.t) + '</strong><span>' + escapeHtml(e.a) + '</span><span class="manualadd-state">' + e.state + '</span></span>' +
        (e.yt || e.vk ? '<button type="button" class="manualadd-play" data-src="' + e.src + '" data-i="' + e.i + '" title="Abspielen">▶</button>' : '') +
        (e.src === 'o' ? '<button type="button" class="manualadd-remove" data-i="' + e.i + '" title="Aus dem Postausgang entfernen">✕</button>' : '') +
        '</li>';
    }).join('');
  }

  function removeFromOutbox(i) {
    var box = loadOutbox();
    box.splice(i, 1);
    saveOutbox(box);
    renderList();
  }

  function playEntry(src, i) {
    var e = src === 'o' ? loadOutbox()[i] : queueList[i];
    if (!e) return;
    if (!e.yt) {
      /* Kein YouTube-Video -- bei einem hinterlegten VK-Link diesen oeffnen
         (kein Einbetten, siehe extractVkUrl weiter oben), sonst nichts tun. */
      if (e.vk) window.open(e.vk, '_blank', 'noopener');
      return;
    }
    if (typeof window.playDeckSong !== 'function') return;
    var deckKey = (window.DECKS && window.DECKS.A && window.DECKS.A.isPlaying) ? 'B' : 'A';
    var song = { a: e.a, t: e.t, yt: e.yt };
    if (window.DECKS && window.DECKS[deckKey]) {
      window.DECKS[deckKey].queue = [song];
      window.DECKS[deckKey].index = 0;
    }
    window.playDeckSong(deckKey, song, true);
  }

  function startTimers() {
    if (!pollTimer) pollTimer = window.setInterval(function () { sendOutbox(); refreshQueue(); }, 30000);
  }
  function stopPolling() {
    if (pollTimer) { window.clearInterval(pollTimer); pollTimer = null; }
  }
  /* Postausgang auch ohne offenes Fenster nachsenden (nur wenn etwas drinliegt). */
  function startRetry() {
    if (retryTimer) return;
    retryTimer = window.setInterval(function () { if (loadOutbox().length) sendOutbox(); }, 60000);
  }

  /* Bucket-Keys 1:1 wie in den *-music/songs.json (ohne "Ohne", das ist
     immer als Fallback-Option vorhanden). Bei Aenderung an den echten
     Katalog-Dateien nicht zwingend synchron halten -- ein hier gewaehltes
     Genre, das im Katalog noch fehlt, wird beim Verarbeiten einfach als
     neuer Bucket angelegt (tools/process_missing_queue.py), nichts geht
     verloren. */
  var DECADE_GENRES = {
    1970: ['Ballads', 'BluesSouthernRock', 'Boogie', 'ClassicRock', 'Country', 'Disco', 'Europop', 'FolkRock', 'FunkSoul', 'GlamRock', 'HardRockMetal', 'Krautrock', 'NewWavePostPunk', 'PopCharts', 'PopRock', 'ProgRock', 'Punk', 'ReggaeDub', 'Schlager', 'Ska', 'SoftRock'],
    1980: ['Ballads', 'Boogie', 'Country', 'Disco', 'Electro', 'Eurobeat', 'Freestyle', 'FunkSoul', 'HardRockMetal', 'HiNRG', 'House', 'ItaloDisco', 'NDW', 'NewJackSwing', 'NewWave', 'OldSchoolHipHop', 'PopCharts', 'PopRock', 'PostPunkGoth', 'Punk', 'ReggaeDub', 'RockArenaAOR', 'Schlager', 'Ska', 'SoftRock', 'SynthPop'],
    1990: ['AlternativeRock', 'Ballads', 'BigBeat', 'Britpop', 'ContemporaryRnB', 'Country', 'Dancehall', 'DeepProgHouse', 'Downtempo', 'Emo', 'Eurodance', 'Europop', 'GangstaGFunk', 'Grunge', 'HardcoreHappy', 'House', 'IndieRock', 'JungleDnB', 'NewJackSwing', 'NuMetal', 'PopCharts', 'PopPunk', 'PopRock', 'RnBSwing', 'RockClassic', 'SkaPunk', 'Techno', 'Trance', 'TripHop'],
    2000: ['AlternativeRock', 'Ballads', 'ContemporaryRnB', 'Country', 'CrunkTrapSnap', 'DancePop', 'Downtempo', 'DubstepGrime', 'ElectroHouse', 'Emo', 'Eurodance', 'GangstaGFunk', 'IndieRock', 'NuMetalHardcore', 'PopCharts', 'PopPunk', 'PopRap', 'PopRock', 'ProgTechHouse', 'Reggaeton', 'RnBNeoSoul', 'RockClassic', 'SynthPop', 'Trance'],
    2010: ['AlternativePostHardcore', 'AmbientDowntempo', 'ChillwaveVaporwave', 'ContemporaryRnB', 'Country', 'DancePop', 'DeepProgTropicalHouse', 'DubstepFutureBass', 'ElectroHouse', 'Folk', 'GangstaConsciousHipHop', 'IndiePop', 'IndieRock', 'KPop', 'MetalcoreNuMetalHardcore', 'PopCharts', 'PopPunkEmo', 'PopRap', 'PopRock', 'Reggaeton', 'ReggaeDubAfrobeat', 'RnBNeoSoul', 'RockClassic', 'SynthPopSynthwave', 'Trance', 'TrapMoombahton', 'UKBassGrimeDrill'],
    2020: ['AlternativePostPunk', 'AmbientLoFi', 'AsiaPop', 'Ballads', 'CloudEmoRap', 'DancePop', 'DiscoNuDisco', 'DrumNBass', 'DubstepFutureBass', 'Electro', 'FolkCountry', 'HipHopBoomBap', 'House', 'HyperpopVaporwave', 'IndiePop', 'IndieRock', 'LatinReggaeton', 'MetalcoreHardcore', 'PopCharts', 'PopPunkEmo', 'PopRap', 'PopRock', 'ReggaeDubAfro', 'RnBNeoSoul', 'RockClassic', 'SynthPopSynthwave', 'Techno', 'TranceHardDance', 'TrapPhonk', 'UKBassGrimeDrill']
  };

  function decadeStartForYear(year) {
    if (!year || isNaN(year)) return null;
    if (year >= 1970 && year <= 1979) return 1970;
    if (year >= 1980 && year <= 1989) return 1980;
    if (year >= 1990 && year <= 1999) return 1990;
    if (year >= 2000 && year <= 2009) return 2000;
    if (year >= 2010 && year <= 2019) return 2010;
    if (year >= 2020 && year <= 2099) return 2020;
    return null;
  }

  function humanizeGenre(key) {
    return (key || '').replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  }

  function buildPanel() {
    var panel = document.createElement('div');
    panel.className = 'manualadd-panel';
    panel.innerHTML = '<button type="button" class="manualadd-toggle" id="manualadd-toggle">Song nicht gefunden?</button>';
    return panel;
  }

  function buildModal() {
    var backdrop = document.createElement('div');
    backdrop.className = 'manualadd-backdrop';
    backdrop.id = 'manualadd-backdrop';
    backdrop.hidden = true;
    backdrop.innerHTML =
      '<div class="manualadd-modal" role="dialog" aria-modal="true">' +
      '  <button type="button" class="manualadd-close" id="manualadd-close" aria-label="Schließen">✕</button>' +
      '  <h3>Song nicht gefunden</h3>' +
      '  <p class="manualadd-hint">Interpret + Titel eintragen, auf YouTube suchen, den Link des richtigen Videos hier einfügen. Kein YouTube-Video vorhanden? Auf VK suchen und stattdessen den Einbettungs-Link/Code von dort einfügen.</p>' +
      '  <input type="text" class="manualadd-input" id="manualadd-artist" placeholder="Interpret">' +
      '  <input type="text" class="manualadd-input" id="manualadd-title" placeholder="Titel">' +
      '  <div class="manualadd-search-row">' +
      '    <button type="button" class="manualadd-search" id="manualadd-search">Auf YouTube suchen</button>' +
      '    <button type="button" class="manualadd-search manualadd-search-vk" id="manualadd-search-vk">Auf VK suchen</button>' +
      '  </div>' +
      '  <input type="text" class="manualadd-input" id="manualadd-link" placeholder="YouTube-Link/ID oder VK-Link/Einbettungscode">' +
      '  <label class="manualadd-toggle-label"><input type="checkbox" id="manualadd-use-discogs" checked> Automatisch per Discogs zuordnen (Jahr &amp; Genre)</label>' +
      '  <div class="manualadd-manual-fields" id="manualadd-manual-fields" hidden>' +
      '    <input type="number" class="manualadd-input" id="manualadd-year" placeholder="Jahr (z.B. 1986)" min="1950" max="2099">' +
      '    <select class="manualadd-input" id="manualadd-genre" disabled><option value="">Zuerst Jahr eingeben</option></select>' +
      '  </div>' +
      '  <button type="button" class="manualadd-add" id="manualadd-add">Zur Liste hinzufügen</button>' +
      '  <p class="manualadd-error" id="manualadd-error" hidden></p>' +
      '  <h4>Warteliste – wird jede Nacht eingebaut</h4>' +
      '  <ul class="manualadd-list" id="manualadd-list"></ul>' +
      '  <p class="manualadd-status" role="status"></p>' +
      '</div>';
    return backdrop;
  }

  function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;
    var style = document.createElement('style');
    style.textContent =
      '.manualadd-panel{display:inline-block;margin:10px 0 4px 0;font-family:inherit;font-size:13px;vertical-align:top;}' +
      '.manualadd-toggle{background:#1c1c24;color:#f0e9ff;border:1px solid #4a4460;border-radius:8px;padding:8px 12px;cursor:pointer;}' +
      '.manualadd-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;box-sizing:border-box;}' +
      '.manualadd-backdrop[hidden]{display:none;}' +
      '.manualadd-modal{position:relative;background:#1c1c24;border:1px solid #4a4460;border-radius:12px;padding:16px;width:320px;max-width:100%;max-height:85vh;overflow-y:auto;color:#e6e0f5;box-shadow:0 16px 48px rgba(0,0,0,.5);}' +
      '.manualadd-modal h3{margin:0 0 8px;font-size:15px;}' +
      '.manualadd-close{position:absolute;top:10px;right:10px;background:transparent;border:none;color:#b3a5c2;cursor:pointer;font-size:16px;line-height:1;padding:4px;}' +
      '.manualadd-hint{margin:0 0 8px;font-size:12px;opacity:.8;line-height:1.4;}' +
      '.manualadd-input{display:block;width:100%;box-sizing:border-box;margin-bottom:6px;padding:6px 8px;background:#141419;border:1px solid #4a4460;border-radius:6px;color:#f0e9ff;font-size:12px;}' +
      '.manualadd-search-row{display:flex;gap:6px;margin-bottom:10px;}' +
      '.manualadd-search{width:100%;margin-bottom:0;background:#332f47;color:#fff;border:1px solid #5a527a;border-radius:6px;padding:6px 8px;cursor:pointer;font-size:12px;}' +
      '.manualadd-search-vk{background:#28324a;}' +
      '.manualadd-add{width:100%;margin-bottom:4px;background:#22c55e;color:#0c1a10;border:none;border-radius:6px;padding:7px 8px;cursor:pointer;font-size:12px;font-weight:600;}' +
      '.manualadd-toggle-label{display:flex;align-items:center;gap:6px;font-size:11px;opacity:.85;margin:2px 0 8px;cursor:pointer;}' +
      '.manualadd-toggle-label input{margin:0;}' +
      '.manualadd-manual-fields{margin-bottom:8px;}' +
      '.manualadd-manual-fields select{cursor:pointer;}' +
      '.manualadd-error{color:#ff8a8a;font-size:11px;margin:4px 0;}' +
      '.manualadd-modal h4{font-size:11px;opacity:.7;margin:12px 0 6px;font-weight:600;}' +
      '.manualadd-list{list-style:none;margin:0 0 8px;padding:0;max-height:160px;overflow-y:auto;}' +
      '.manualadd-empty{opacity:.6;font-size:12px;padding:4px 0;}' +
      '.manualadd-item{display:flex;align-items:center;gap:6px;padding:4px 0;border-top:1px solid rgba(255,255,255,.08);}' +
      '.manualadd-item:first-child{border-top:none;}' +
      '.manualadd-text{flex:1 1 auto;display:flex;flex-direction:column;overflow:hidden;}' +
      '.manualadd-text strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;}' +
      '.manualadd-text span{opacity:.65;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;}' +
      '.manualadd-text .manualadd-state{font-size:10px;opacity:.5;}' +
      '.manualadd-play,.manualadd-remove{background:transparent;border:1px solid #5a527a;border-radius:5px;color:#e6e0f5;cursor:pointer;font-size:11px;padding:2px 6px;flex:0 0 auto;}' +
      '.manualadd-status{font-size:11px;opacity:.75;margin:6px 0 0;min-height:14px;}';
    document.head.appendChild(style);
  }

  /* init() ist bewusst mehrfach aufrufbar -- die AJAX-Navigation zwischen
     Dekaden-/Ambient-Seiten (siehe navigateToPage in decades.js) baut den
     Playlist-Generator (und damit den Anker fuer .manualadd-panel) bei
     jedem Wechsel neu auf; das Modal selbst haengt direkt am <body> und
     wuerde sonst als Karteileiche mehrfach existieren. decades.js ruft
     nach jedem Wechsel window.reinitManualAdd() explizit auf. */
  function init() {
    var stalePanel = document.querySelector('.manualadd-panel');
    if (stalePanel) stalePanel.remove();
    var staleModal = document.querySelector('.manualadd-backdrop');
    if (staleModal) staleModal.remove();

    /* Haengt sich direkt HINTER das MIDI-Panel (falls vorhanden), sonst wie
       midi.js selbst hinter die Playlist-Generator-Beschreibung. */
    var anchor = document.querySelector('.dj-midi-panel') || document.querySelector('.generator .sub');
    if (!anchor) {
      window.setTimeout(init, 500);
      return;
    }

    injectStyles();

    panelEl = buildPanel();
    anchor.insertAdjacentElement('afterend', panelEl);

    modalEl = buildModal();
    document.body.appendChild(modalEl);

    listEl = modalEl.querySelector('#manualadd-list');
    statusEl = modalEl.querySelector('.manualadd-status');
    renderList();
    sendOutbox();
    startRetry();

    var useDiscogsCb = modalEl.querySelector('#manualadd-use-discogs');
    var manualFieldsEl = modalEl.querySelector('#manualadd-manual-fields');
    var yearInput = modalEl.querySelector('#manualadd-year');
    var genreSelect = modalEl.querySelector('#manualadd-genre');

    function refreshGenreOptions() {
      var decade = decadeStartForYear(parseInt(yearInput.value, 10));
      if (!decade) {
        genreSelect.innerHTML = '<option value="">Zuerst Jahr eingeben</option>';
        genreSelect.disabled = true;
        return;
      }
      var genres = DECADE_GENRES[decade] || [];
      genreSelect.innerHTML = '<option value="">Genre wählen …</option>' +
        genres.map(function (g) { return '<option value="' + g + '">' + humanizeGenre(g) + '</option>'; }).join('') +
        '<option value="Ohne">Ohne (kein bestimmtes Genre)</option>';
      genreSelect.disabled = false;
    }
    yearInput.addEventListener('input', refreshGenreOptions);
    useDiscogsCb.addEventListener('change', function () {
      manualFieldsEl.hidden = useDiscogsCb.checked;
    });

    var toggleBtn = panelEl.querySelector('#manualadd-toggle');
    function openModal() { modalEl.hidden = false; refreshQueue(); sendOutbox(); startTimers(); }
    function closeModal() { modalEl.hidden = true; stopPolling(); }
    toggleBtn.addEventListener('click', openModal);
    modalEl.querySelector('#manualadd-close').addEventListener('click', closeModal);
    modalEl.addEventListener('click', function (ev) {
      if (ev.target === modalEl) closeModal(); /* Klick auf Backdrop, nicht aufs Modal selbst */
    });
    /* Nur EINMAL global binden (nicht bei jedem init()) -- referenziert
       modalEl ueber die Modul-Variable, die bei jedem init() aktualisiert
       wird, damit hier trotzdem immer das aktuell sichtbare Modal gemeint
       ist, ohne bei jedem Dekaden-Wechsel einen weiteren Listener anzuhaengen. */
    if (!globalListenersBound) {
      globalListenersBound = true;
      document.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape' && modalEl && !modalEl.hidden) { modalEl.hidden = true; stopPolling(); }
      });
    }

    modalEl.querySelector('#manualadd-search').addEventListener('click', function () {
      var a = modalEl.querySelector('#manualadd-artist').value.trim();
      var t = modalEl.querySelector('#manualadd-title').value.trim();
      if (!a && !t) return;
      var q = encodeURIComponent((a + ' ' + t).trim());
      window.open('https://www.youtube.com/results?search_query=' + q, 'driftware-yt-search', 'noopener,width=480,height=640,left=200,top=100');
    });

    modalEl.querySelector('#manualadd-search-vk').addEventListener('click', function () {
      var a = modalEl.querySelector('#manualadd-artist').value.trim();
      var t = modalEl.querySelector('#manualadd-title').value.trim();
      if (!a && !t) return;
      /* VK selbst hat keine zuverlaessig dokumentierte direkte Such-URL --
         eine Google-Seitensuche auf vkvideo.ru findet trotzdem oeffentliche,
         einbettbare Videos zuverlaessig. */
      var q = encodeURIComponent('site:vkvideo.ru ' + (a + ' ' + t).trim());
      window.open('https://www.google.com/search?q=' + q, 'driftware-vk-search', 'noopener,width=480,height=640,left=200,top=100');
    });

    modalEl.querySelector('#manualadd-add').addEventListener('click', function () {
      var errorEl = modalEl.querySelector('#manualadd-error');
      errorEl.hidden = true;
      var a = modalEl.querySelector('#manualadd-artist').value.trim();
      var t = modalEl.querySelector('#manualadd-title').value.trim();
      var link = modalEl.querySelector('#manualadd-link').value.trim();
      var ytId = extractYoutubeId(link);
      var vkUrl = ytId ? null : extractVkUrl(link);
      if (!a || !t) {
        errorEl.textContent = 'Bitte Interpret und Titel eintragen.';
        errorEl.hidden = false;
        return;
      }
      if (!ytId && !vkUrl) {
        errorEl.textContent = 'Kein gültiger YouTube- oder VK-Link erkannt.';
        errorEl.hidden = false;
        return;
      }
      var manualMeta = null;
      if (!useDiscogsCb.checked) {
        var year = parseInt(yearInput.value, 10);
        var genre = genreSelect.value;
        if (!decadeStartForYear(year)) {
          errorEl.textContent = 'Bitte ein gültiges Jahr eintragen (1970–2099).';
          errorEl.hidden = false;
          return;
        }
        if (!genre) {
          errorEl.textContent = 'Bitte ein Genre auswählen.';
          errorEl.hidden = false;
          return;
        }
        manualMeta = { g: genre, y: year };
      }
      addEntry(a, t, ytId, vkUrl, manualMeta);
      modalEl.querySelector('#manualadd-artist').value = '';
      modalEl.querySelector('#manualadd-title').value = '';
      modalEl.querySelector('#manualadd-link').value = '';
      yearInput.value = '';
      genreSelect.innerHTML = '<option value="">Zuerst Jahr eingeben</option>';
      genreSelect.disabled = true;
    });

    listEl.addEventListener('click', function (ev) {
      var playBtn = ev.target.closest('.manualadd-play');
      var removeBtn = ev.target.closest('.manualadd-remove');
      if (playBtn) playEntry(playBtn.dataset.src, parseInt(playBtn.dataset.i, 10));
      else if (removeBtn) removeFromOutbox(parseInt(removeBtn.dataset.i, 10));
    });
  }

  window.reinitManualAdd = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
