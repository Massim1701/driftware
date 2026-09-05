/* Button "Song nicht gefunden" neben dem MIDI-Button. Oeffnet ein kleines
   Formular: Interpret + Titel eintragen, per Klick eine YouTube-Suche in
   neuem Tab oeffnen, den gefundenen Link zurueck einfuegen -> Song wird
   sofort auf Deck geladen/abspielbar UND in einer eigenen kleinen Liste
   "Manuell hinzugefuegt (Ohne Genre)" gesammelt (localStorage, pro Seite).

   Kein Backend auf einer GitHub-Pages-Seite moeglich -- ABER: per File
   System Access API (Chrome/Edge) kann der Nutzer EINMALIG eine lokale
   Datei auswaehlen ("Automatisch speichern"); danach schreibt JEDER neue
   Song automatisch (ohne weiteren Klick/Export) in diese Datei, seitenweit
   ueber alle Dekaden-/Ambient-Seiten hinweg (Berechtigung wird per
   IndexedDB gemerkt, kein erneuter Dialog noetig, sofern der Browser die
   Berechtigung noch kennt). Diese Datei kann direkt aus dem Projektordner
   heraus dauerhaft per Merge-Skript in die jeweilige songs.json uebernommen
   werden -- kein manuelles Kopieren/Einfuegen mehr.

   Fallback fuer Browser ohne File System Access API (Safari/Firefox):
   Button "Als JSON kopieren" wie bisher (Zwischenablage).

   Eigenstaendige Datei (wie midi.js/continuity.js/nextup.js) -- liest nur
   window.playDeckSong etc. aus decades.js, keine Aenderung dort noetig. */

(function () {
  var STORAGE_PREFIX = 'driftware-manualadd-';
  var pageKey = (function () {
    var m = location.pathname.match(/\/([a-z0-9]+)-music\//i);
    return m ? m[1] : 'unbekannt';
  })();
  var STORAGE_KEY = STORAGE_PREFIX + pageKey;
  var HAS_FS_ACCESS = typeof window.showSaveFilePicker === 'function';

  var panelEl = null;
  var listEl = null;
  var autosaveStatusEl = null;
  var fileHandle = null; /* seitenweite Auto-Speicher-Datei, sobald gewaehlt/wiederhergestellt */

  function loadEntries() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveEntries(entries) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {}
  }

  function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

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

  /* ---- IndexedDB: FileSystemFileHandle seitenweit (originweit) merken,
     damit die Auto-Speicherung nur EINMAL pro Browser eingerichtet werden
     muss, nicht pro Dekaden-Seite. ---- */
  var DB_NAME = 'driftware-manualadd-db';
  var STORE_NAME = 'handles';
  var HANDLE_KEY = 'autosave-file';

  function openDb() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        req.result.createObjectStore(STORE_NAME);
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  function idbGet(key) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE_NAME, 'readonly');
        var req = tx.objectStore(STORE_NAME).get(key);
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  function idbSet(key, value) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(value, key);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function setAutosaveStatus(text) {
    if (autosaveStatusEl) autosaveStatusEl.textContent = text;
  }

  /* Schreibt ALLE bisher (auf JEDER Dekaden-Seite) manuell hinzugefuegten
     Songs gesammelt in die eine gewaehlte Autosave-Datei -- Format:
     { "80er": [...], "ballermann": [...], ... } je Seiten-Key. So landet
     alles in EINER Datei, unabhaengig davon, auf welcher Seite gerade
     etwas hinzugefuegt wird. */
  function writeAutosaveFile() {
    if (!fileHandle) return Promise.resolve();
    return fileHandle.queryPermission({ mode: 'readwrite' }).then(function (perm) {
      if (perm !== 'granted') throw new Error('no-permission');
      return fileHandle.getFile();
    }).then(function (file) {
      return file.text().catch(function () { return '{}'; });
    }).then(function (text) {
      var all;
      try { all = JSON.parse(text); } catch (e) { all = {}; }
      if (!all || typeof all !== 'object') all = {};
      all[pageKey] = loadEntries().map(function (e) {
        return { a: e.a, t: e.t, yt: e.yt };
      });
      return fileHandle.createWritable().then(function (writable) {
        return writable.write(JSON.stringify(all, null, 2)).then(function () {
          return writable.close();
        });
      });
    }).then(function () {
      setAutosaveStatus('Automatisch gespeichert ✓');
    }).catch(function (err) {
      if (err && err.message === 'no-permission') {
        setAutosaveStatus('Zugriff auf Autosave-Datei fehlt -- bitte neu einrichten.');
        fileHandle = null;
      } else {
        setAutosaveStatus('Autosave fehlgeschlagen (Datei verschoben/gelöscht?).');
      }
    });
  }

  function restoreAutosaveHandle() {
    if (!HAS_FS_ACCESS) return;
    idbGet(HANDLE_KEY).then(function (handle) {
      if (!handle) return;
      return handle.queryPermission({ mode: 'readwrite' }).then(function (perm) {
        if (perm === 'granted') {
          fileHandle = handle;
          setAutosaveStatus('Automatische Speicherung aktiv (' + (handle.name || 'Datei') + ').');
        } else {
          setAutosaveStatus('Automatische Speicherung eingerichtet -- Klick auf "Autosave" bestätigt den Zugriff erneut.');
        }
      });
    }).catch(function () {});
  }

  function setupAutosave() {
    if (!HAS_FS_ACCESS) return;
    window.showSaveFilePicker({
      suggestedName: 'driftware-manuelle-songs.json',
      types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
    }).then(function (handle) {
      fileHandle = handle;
      idbSet(HANDLE_KEY, handle);
      setAutosaveStatus('Automatische Speicherung aktiv (' + (handle.name || 'Datei') + ').');
      return writeAutosaveFile();
    }).catch(function (err) {
      if (err && err.name !== 'AbortError') setAutosaveStatus('Einrichtung abgebrochen/fehlgeschlagen.');
    });
  }

  function renderList() {
    var entries = loadEntries();
    if (!listEl) return;
    if (!entries.length) {
      listEl.innerHTML = '<li class="manualadd-empty">Noch nichts hinzugefügt.</li>';
      return;
    }
    listEl.innerHTML = entries.map(function (e, i) {
      return '<li class="manualadd-item">' +
        '<span class="manualadd-text"><strong>' + escapeHtml(e.t) + '</strong><span>' + escapeHtml(e.a) + '</span></span>' +
        '<button type="button" class="manualadd-play" data-i="' + i + '" title="Abspielen">▶</button>' +
        '<button type="button" class="manualadd-remove" data-i="' + i + '" title="Entfernen">✕</button>' +
        '</li>';
    }).join('');
  }

  function addEntry(a, t, ytId) {
    var entries = loadEntries();
    entries.push({ a: a, t: t, yt: ytId, g: 'Ohne', addedAt: Date.now() });
    saveEntries(entries);
    renderList();
    if (fileHandle) writeAutosaveFile();
  }

  function removeEntry(i) {
    var entries = loadEntries();
    entries.splice(i, 1);
    saveEntries(entries);
    renderList();
    if (fileHandle) writeAutosaveFile();
  }

  function playEntry(i) {
    var entries = loadEntries();
    var e = entries[i];
    if (!e || typeof window.playDeckSong !== 'function') return;
    var deckKey = (window.DECKS && window.DECKS.A && window.DECKS.A.isPlaying) ? 'B' : 'A';
    var song = { a: e.a, t: e.t, yt: e.yt };
    if (window.DECKS && window.DECKS[deckKey]) {
      window.DECKS[deckKey].queue = [song];
      window.DECKS[deckKey].index = 0;
    }
    window.playDeckSong(deckKey, song, true);
  }

  /* Fallback fuer Browser ohne File System Access API (Safari/Firefox). */
  function exportEntriesToClipboard() {
    var entries = loadEntries();
    var json = JSON.stringify(entries.map(function (e) {
      return { a: e.a, t: e.t, yt: e.yt };
    }), null, 2);
    var ta = document.createElement('textarea');
    ta.value = json;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    setAutosaveStatus(entries.length + ' Song(s) als JSON in die Zwischenablage kopiert.');
    window.setTimeout(function () { setAutosaveStatus(''); }, 4000);
  }

  function buildPanel() {
    var panel = document.createElement('div');
    panel.className = 'manualadd-panel';
    panel.innerHTML = '<button type="button" class="manualadd-toggle" id="manualadd-toggle">🔍 Song nicht gefunden?</button>';
    return panel;
  }

  function buildModal() {
    var autosaveBtnHtml = HAS_FS_ACCESS
      ? '<button type="button" class="manualadd-autosave" id="manualadd-autosave">📁 Autosave einrichten</button>'
      : '<button type="button" class="manualadd-export" id="manualadd-export">Als JSON kopieren</button>';
    var backdrop = document.createElement('div');
    backdrop.className = 'manualadd-backdrop';
    backdrop.id = 'manualadd-backdrop';
    backdrop.hidden = true;
    backdrop.innerHTML =
      '<div class="manualadd-modal" role="dialog" aria-modal="true">' +
      '  <button type="button" class="manualadd-close" id="manualadd-close" aria-label="Schließen">✕</button>' +
      '  <h3>Song nicht gefunden</h3>' +
      '  <p class="manualadd-hint">Interpret + Titel eintragen, auf YouTube suchen, den Link des richtigen Videos hier einfügen.</p>' +
      '  <input type="text" class="manualadd-input" id="manualadd-artist" placeholder="Interpret">' +
      '  <input type="text" class="manualadd-input" id="manualadd-title" placeholder="Titel">' +
      '  <button type="button" class="manualadd-search" id="manualadd-search">Auf YouTube suchen</button>' +
      '  <input type="text" class="manualadd-input" id="manualadd-link" placeholder="YouTube-Link oder Video-ID">' +
      '  <button type="button" class="manualadd-add" id="manualadd-add">Zur Liste hinzufügen</button>' +
      '  <p class="manualadd-error" id="manualadd-error" hidden></p>' +
      '  <h4>Manuell hinzugefügt (Ohne Genre, dieser Browser)</h4>' +
      '  <ul class="manualadd-list" id="manualadd-list"></ul>' +
      '  ' + autosaveBtnHtml +
      '  <p class="manualadd-autosave-status"></p>' +
      '</div>';
    return backdrop;
  }

  function injectStyles() {
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
      '.manualadd-search{width:100%;margin-bottom:10px;background:#332f47;color:#fff;border:1px solid #5a527a;border-radius:6px;padding:6px 8px;cursor:pointer;font-size:12px;}' +
      '.manualadd-add{width:100%;margin-bottom:4px;background:#22c55e;color:#0c1a10;border:none;border-radius:6px;padding:7px 8px;cursor:pointer;font-size:12px;font-weight:600;}' +
      '.manualadd-error{color:#ff8a8a;font-size:11px;margin:4px 0;}' +
      '.manualadd-modal h4{font-size:11px;opacity:.7;margin:12px 0 6px;font-weight:600;}' +
      '.manualadd-list{list-style:none;margin:0 0 8px;padding:0;max-height:160px;overflow-y:auto;}' +
      '.manualadd-empty{opacity:.6;font-size:12px;padding:4px 0;}' +
      '.manualadd-item{display:flex;align-items:center;gap:6px;padding:4px 0;border-top:1px solid rgba(255,255,255,.08);}' +
      '.manualadd-item:first-child{border-top:none;}' +
      '.manualadd-text{flex:1 1 auto;display:flex;flex-direction:column;overflow:hidden;}' +
      '.manualadd-text strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;}' +
      '.manualadd-text span{opacity:.65;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;}' +
      '.manualadd-play,.manualadd-remove{background:transparent;border:1px solid #5a527a;border-radius:5px;color:#e6e0f5;cursor:pointer;font-size:11px;padding:2px 6px;flex:0 0 auto;}' +
      '.manualadd-autosave,.manualadd-export{width:100%;background:transparent;color:#b3a5c2;border:1px solid #5a527a;border-radius:6px;padding:6px 8px;cursor:pointer;font-size:11px;}' +
      '.manualadd-autosave-status{font-size:11px;opacity:.75;margin:6px 0 0;min-height:14px;}';
    document.head.appendChild(style);
  }

  function init() {
    /* Haengt sich direkt HINTER das MIDI-Panel (falls vorhanden), sonst wie
       midi.js selbst hinter die Playlist-Generator-Beschreibung. */
    var anchor = document.querySelector('.dj-midi-panel') || document.querySelector('.generator .sub');
    if (!anchor) {
      window.setTimeout(init, 500);
      return;
    }
    if (document.querySelector('.manualadd-panel')) return;

    injectStyles();

    panelEl = buildPanel();
    anchor.insertAdjacentElement('afterend', panelEl);

    var modalEl = buildModal();
    document.body.appendChild(modalEl);

    listEl = modalEl.querySelector('#manualadd-list');
    autosaveStatusEl = modalEl.querySelector('.manualadd-autosave-status');
    renderList();
    restoreAutosaveHandle();

    var toggleBtn = panelEl.querySelector('#manualadd-toggle');
    function openModal() { modalEl.hidden = false; }
    function closeModal() { modalEl.hidden = true; }
    toggleBtn.addEventListener('click', openModal);
    modalEl.querySelector('#manualadd-close').addEventListener('click', closeModal);
    modalEl.addEventListener('click', function (ev) {
      if (ev.target === modalEl) closeModal(); /* Klick auf Backdrop, nicht aufs Modal selbst */
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !modalEl.hidden) closeModal();
    });

    modalEl.querySelector('#manualadd-search').addEventListener('click', function () {
      var a = modalEl.querySelector('#manualadd-artist').value.trim();
      var t = modalEl.querySelector('#manualadd-title').value.trim();
      if (!a && !t) return;
      var q = encodeURIComponent((a + ' ' + t).trim());
      window.open('https://www.youtube.com/results?search_query=' + q, 'driftware-yt-search', 'noopener,width=480,height=640,left=200,top=100');
    });

    modalEl.querySelector('#manualadd-add').addEventListener('click', function () {
      var errorEl = modalEl.querySelector('#manualadd-error');
      errorEl.hidden = true;
      var a = modalEl.querySelector('#manualadd-artist').value.trim();
      var t = modalEl.querySelector('#manualadd-title').value.trim();
      var link = modalEl.querySelector('#manualadd-link').value.trim();
      var ytId = extractYoutubeId(link);
      if (!a || !t) {
        errorEl.textContent = 'Bitte Interpret und Titel eintragen.';
        errorEl.hidden = false;
        return;
      }
      if (!ytId) {
        errorEl.textContent = 'Kein gültiger YouTube-Link/ID erkannt.';
        errorEl.hidden = false;
        return;
      }
      addEntry(a, t, ytId);
      modalEl.querySelector('#manualadd-artist').value = '';
      modalEl.querySelector('#manualadd-title').value = '';
      modalEl.querySelector('#manualadd-link').value = '';
    });

    listEl.addEventListener('click', function (ev) {
      var playBtn = ev.target.closest('.manualadd-play');
      var removeBtn = ev.target.closest('.manualadd-remove');
      if (playBtn) playEntry(parseInt(playBtn.dataset.i, 10));
      else if (removeBtn) removeEntry(parseInt(removeBtn.dataset.i, 10));
    });

    var autosaveBtn = modalEl.querySelector('#manualadd-autosave');
    if (autosaveBtn) autosaveBtn.addEventListener('click', function () {
      if (fileHandle) {
        fileHandle.requestPermission({ mode: 'readwrite' }).then(function (perm) {
          if (perm === 'granted') writeAutosaveFile();
        });
      } else {
        setupAutosave();
      }
    });
    var exportBtn = modalEl.querySelector('#manualadd-export');
    if (exportBtn) exportBtn.addEventListener('click', exportEntriesToClipboard);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
