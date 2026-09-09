/* Baut EINE persistente Verlauf/Warteschlange-Tabelle (".dj-queue-panel"),
   die genau wie der Player (#dj-player) direkt an document.body haengt und
   damit den Wechsel zwischen Dekaden-/Ambient-Seiten ueberlebt (die AJAX-
   Navigation in decades.js tauscht nur den Inhalt von #decade-root aus).
   Vorher hat diese Datei stattdessen die pro-Seite neu erzeugte
   ".gen-history"-Box (aus decades.js) gekapert und musste sich deshalb bei
   JEDEM Seitenwechsel per window.reinitNextUp() neu anhaengen. Die native
   Box existiert weiterhin (decades.js erzeugt/befuellt sie unveraendert),
   ist per CSS aber ausgeblendet (siehe .gen-history{display:none} in
   decades.css) -- kein doppeltes Element, keine Luecke.

   Reihenfolge von oben nach unten: bis zu 5 kommende Songs (am weitesten
   entfernter zuerst, naechster direkt ueber dem Highlight), dann der
   aktuelle Song hervorgehoben, dann bis zu 5 zuletzt gespielte Songs
   (zuletzt gespielter direkt darunter, aeltere weiter unten). Die
   Hervorhebung bleibt also immer an derselben Stelle in der Liste, die
   Liste selbst "rutscht" mit jedem neuen Song um eine Position weiter.

   Interaktion: jede Zeile ausser der aktuell hervorgehobenen hat ein "×"
   zum Entfernen -- bei "Warteschlange" wird der Song direkt aus
   deck.queue entfernt (spielt dann nicht mehr), bei "Verlauf" nur aus der
   Anzeige-Liste (playHistory) geloescht. Kommende Songs lassen sich
   zusaetzlich per Drag & Drop innerhalb der Tabelle umsortieren.

   Eigenstaendige Datei (wie midi.js/continuity.js) -- liest/aendert nur
   die globalen DECKS/playHistory aus decades.js per Polling, keine
   Aenderung an decades.js noetig ausser der reinen DOM-Platzierung des
   Players (siehe ensureDjPlayer in decades.js). */

(function () {
  var WINDOW_SIZE = 5; // je 5 zurueck und 5 vor dem aktuellen Song
  var POLL_MS = 1000;
  var tbody = null;
  var countEl = null;
  var lastSignature = null;
  var pollTimer = null;
  var draggingIdx = null; // != null waehrend ein Warteschlangen-Eintrag zum Umsortieren gezogen wird

  function pickActiveDeck() {
    if (typeof window.DECKS === 'undefined') return null;
    if (window.DECKS.A && window.DECKS.A.isPlaying) return window.DECKS.A;
    if (window.DECKS.B && window.DECKS.B.isPlaying) return window.DECKS.B;
    // Nichts spielt gerade -- Deck mit geladenem Song bevorzugen (pausiert),
    // damit die Liste nicht bei jeder kurzen Pause komplett leert.
    if (window.DECKS.A && window.DECKS.A.song) return window.DECKS.A;
    if (window.DECKS.B && window.DECKS.B.song) return window.DECKS.B;
    return null;
  }

  function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function songRow(s, marker, kind, idx) {
    // kind: "upcoming" (gruen), "current" (Highlight-Hintergrund), "history" (rot)
    var cls = 'dq-' + kind;
    // Der aktuell gespielte Song laesst sich hier nicht entfernen, nur
    // kommende (Warteschlange) und vergangene (Verlauf) Zeilen.
    var dragCell = kind === 'upcoming' ? '<span aria-hidden="true">⠿</span>' : '';
    var removeCell = kind === 'current'
      ? ''
      : '<button type="button" class="dq-remove" data-kind="' + kind + '" data-idx="' + idx + '" aria-label="Aus der Liste entfernen" title="Entfernen">&times;</button>';
    var draggableAttr = kind === 'upcoming' ? ' draggable="true"' : '';
    return '<tr class="' + cls + '" data-idx="' + idx + '"' + draggableAttr + '>' +
      '<td class="dq-drag">' + dragCell + '</td>' +
      '<td class="dq-num">' + marker + '</td>' +
      '<td class="dq-title"><strong>' + escapeHtml(s.t) + '</strong><span>' + escapeHtml(s.a) + '</span></td>' +
      '<td class="dq-genre">' + escapeHtml(s.g || s.s || '–') + '</td>' +
      '<td class="dq-year">' + (s.y || '–') + '</td>' +
      '<td class="dq-bpm">' + (s.bpm || '–') + '</td>' +
      '<td class="dq-remove-cell">' + removeCell + '</td>' +
      '</tr>';
  }

  function render() {
    if (!tbody) return;
    var deck = pickActiveDeck();
    var current = deck ? deck.song : null;

    // Zuletzt gespielte Songs, neuester zuerst (playHistory aus decades.js ist
    // bereits unshift-basiert = neuester zuerst) -- der zuletzt gespielte
    // Song landet direkt UNTER dem aktuellen, aeltere weiter unten.
    // playHistory[0] ist immer der GERADE gestartete Song selbst (wird beim
    // Start des Abspielens eingetragen, siehe logPlayHistory in decades.js)
    // -- also identisch mit "current". Fuer den Verlauf ab Index 1 lesen,
    // sonst taucht der aktuelle Song doppelt auf (als Highlight UND als
    // erster Verlaufseintrag). idx haelt dabei den echten Index im
    // playHistory-Array fest, damit "Entfernen" das richtige Element trifft.
    var historyEntries = (typeof window.playHistory !== 'undefined' ? window.playHistory : [])
      .slice(1, 1 + WINDOW_SIZE)
      .map(function (s, i) { return { song: s, idx: 1 + i }; });

    var upcomingEntries = [];
    if (deck && deck.queue && deck.index > -1) {
      upcomingEntries = deck.queue.slice(deck.index + 1, deck.index + 1 + WINDOW_SIZE)
        .map(function (s, i) { return { song: s, idx: deck.index + 1 + i }; });
    }
    // Oben in der Liste soll der naechste Song (direkt nach dem aktuellen)
    // am naehesten am Highlight stehen -- also umgekehrte Reihenfolge, der
    // am weitesten entfernte kommende Song ganz oben.
    var upcomingTopDown = upcomingEntries.slice().reverse();

    var signature = upcomingEntries.map(function (e) { return e.song.a + e.song.t; }).join(',') + '||' +
      (current ? current.a + current.t : '') + '||' +
      historyEntries.map(function (e) { return e.song.a + e.song.t; }).join(',');
    if (signature === lastSignature) return; // nichts geaendert, kein unnoetiges Neuzeichnen
    lastSignature = signature;

    if (countEl) countEl.textContent = upcomingEntries.length + ' in der Warteschlange';

    if (!current && !historyEntries.length && !upcomingEntries.length) {
      tbody.innerHTML = '<tr class="dq-empty"><td colspan="7">Nichts geladen.</td></tr>';
      return;
    }

    var html = '';
    html += upcomingTopDown.map(function (e) { return songRow(e.song, '+', 'upcoming', e.idx); }).join('');
    if (current) html += songRow(current, '▶', 'current', null);
    html += historyEntries.map(function (e) { return songRow(e.song, '−', 'history', e.idx); }).join('');
    tbody.innerHTML = html;
  }

  /* Songs lassen sich aus der Song-Kachel-Liste (decades.js, dragstart auf
     ".song-tile") direkt auf dieses Panel ziehen, um sie ans Ende der
     Warteschlange des aktiven Decks zu haengen -- dieselbe
     "application/json"-Payload, die auch die Deck-Dropzones (siehe
     decades.js #deck-A-drop/#deck-B-drop) schon lesen. */
  function wireDropzone(panel) {
    panel.addEventListener('dragover', function (e) {
      if (draggingIdx !== null) return; // internes Umsortieren laeuft, siehe wireReorder()
      e.preventDefault();
      panel.classList.add('dq-drag-over');
    });
    panel.addEventListener('dragleave', function () {
      panel.classList.remove('dq-drag-over');
    });
    panel.addEventListener('drop', function (e) {
      if (draggingIdx !== null) return; // internes Umsortieren, siehe wireReorder()
      e.preventDefault();
      panel.classList.remove('dq-drag-over');
      var raw = e.dataTransfer.getData('application/json');
      if (!raw) return;
      var song;
      try { song = JSON.parse(raw); } catch (err) { return; }
      if (!song) return;

      var deck = pickActiveDeck();
      if (deck && deck.song && deck.queue && deck.index > -1) {
        // Ans Ende der bestehenden Warteschlange haengen, laufende
        // Wiedergabe bleibt unangetastet.
        deck.queue.push(song);
      } else if (typeof window.loadSongToDeck === 'function') {
        // Kein Deck aktiv/geladen -- keine Warteschlange, in die man
        // haengen koennte. Song stattdessen frisch auf Deck A laden (wie
        // ein Klick auf ▶), ohne automatisch zu starten.
        window.loadSongToDeck(song, 'A', [song], false);
      } else {
        return;
      }
      lastSignature = null; // sofortiges Neuzeichnen erzwingen
      render();
    });
  }

  /* Kommende Songs (Warteschlange) per Drag & Drop INNERHALB der Tabelle
     umsortieren -- ziehen und auf eine andere "+"-Zeile fallen lassen,
     tauscht die Position in deck.queue. Verlauf/aktueller Song sind nicht
     betroffen (kein draggable-Attribut, siehe songRow()). Eigene,
     dataTransfer-freie Verfolgung ueber draggingIdx statt
     dataTransfer.getData(), weil dataTransfer beim dragover-Handler
     in manchen Browsern nicht zuverlaessig lesbar ist. */
  function wireReorder(body) {
    body.addEventListener('dragstart', function (e) {
      var tr = e.target.closest('.dq-upcoming');
      if (!tr) { draggingIdx = null; return; }
      draggingIdx = parseInt(tr.getAttribute('data-idx'), 10);
      try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', ''); } catch (err) {}
      tr.classList.add('dq-dragging');
    });
    body.addEventListener('dragend', function () {
      draggingIdx = null;
      var stale = body.querySelectorAll('.dq-dragging, .dq-drop-target');
      for (var i = 0; i < stale.length; i++) stale[i].classList.remove('dq-dragging', 'dq-drop-target');
    });
    body.addEventListener('dragover', function (e) {
      if (draggingIdx === null) return; // kein interner Reorder -- externer Song-Tile-Drop laeuft ueber wireDropzone
      var tr = e.target.closest('.dq-upcoming');
      if (!tr) return;
      e.preventDefault();
      e.stopPropagation();
      var prev = body.querySelector('.dq-drop-target');
      if (prev && prev !== tr) prev.classList.remove('dq-drop-target');
      tr.classList.add('dq-drop-target');
    });
    body.addEventListener('drop', function (e) {
      if (draggingIdx === null) return;
      var tr = e.target.closest('.dq-upcoming');
      if (!tr) return;
      e.preventDefault();
      e.stopPropagation();
      var toIdx = parseInt(tr.getAttribute('data-idx'), 10);
      var deck = pickActiveDeck();
      if (deck && deck.queue && !isNaN(toIdx) && !isNaN(draggingIdx) && draggingIdx !== toIdx) {
        var item = deck.queue.splice(draggingIdx, 1)[0];
        deck.queue.splice(toIdx, 0, item);
      }
      draggingIdx = null;
      lastSignature = null; // sofortiges Neuzeichnen erzwingen
      render();
    });
  }

  function handleRemoveClick(e) {
    var target = e.target;
    if (!target || !target.classList || !target.classList.contains('dq-remove')) return;
    var kind = target.getAttribute('data-kind');
    var idx = parseInt(target.getAttribute('data-idx'), 10);
    if (isNaN(idx)) return;

    if (kind === 'upcoming') {
      var deck = pickActiveDeck();
      if (deck && deck.queue) deck.queue.splice(idx, 1);
    } else if (kind === 'history') {
      if (typeof window.playHistory !== 'undefined') window.playHistory.splice(idx, 1);
    }

    lastSignature = null; // sofortiges Neuzeichnen erzwingen, nicht erst beim naechsten Poll
    render();
  }

  /* init() ist bewusst mehrfach aufrufbar (window.reinitNextUp() ruft es
     nach jeder AJAX-Seiten-Navigation weiterhin auf), baut das Panel aber
     nur EINMAL -- es haengt direkt an document.body (Geschwister von
     #dj-player), genau wie der Player selbst uebersteht es also den
     Inhalts-Austausch von #decade-root unveraendert. Nachfolgende Aufrufe
     sind nur noch ein sofortiges Neuzeichnen (falls sich z.B. das aktive
     Deck durch die Navigation geaendert hat). */
  function init() {
    if (document.getElementById('dj-queue-panel')) {
      lastSignature = null;
      render();
      return;
    }

    var djPlayer = document.getElementById('dj-player');
    if (!djPlayer) {
      window.setTimeout(init, 500); // Player noch nicht aufgebaut (ensureDjPlayer in decades.js)
      return;
    }

    var nextIconSvg = (typeof window.NEXT_SVG === 'string')
      ? window.NEXT_SVG
      : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 5v14l11-7z"/></svg>';

    var panel = document.createElement('div');
    panel.className = 'dj-queue-panel';
    panel.id = 'dj-queue-panel';
    panel.innerHTML =
      '<div class="dj-queue-head">' +
      '<h2>' + nextIconSvg + ' Verlauf &amp; Warteschlange</h2>' +
      '<span class="dj-queue-count" id="dj-queue-count"></span>' +
      '</div>' +
      '<div class="dj-queue-table-wrap">' +
      '<table class="dj-queue-table">' +
      '<thead><tr>' +
      '<th class="dq-drag"></th><th class="dq-num">#</th><th>Titel</th><th class="dq-genre">Genre</th><th class="dq-year">Jahr</th><th class="dq-bpm">BPM</th><th class="dq-remove-cell"></th>' +
      '</tr></thead>' +
      '<tbody id="dj-queue-tbody"><tr class="dq-empty"><td colspan="7">Nichts geladen.</td></tr></tbody>' +
      '</table>' +
      '</div>';

    // Direkt hinter den Player haengen, vor den eigentlichen Seiteninhalt
    // (#decade-root) -- derselbe Platz, an dem ihn auch der Nutzer im
    // BPM-Studio-Vorbild sieht (Player oben, Playliste direkt darunter).
    var decadeRoot = document.getElementById('decade-root');
    if (decadeRoot) decadeRoot.parentNode.insertBefore(panel, decadeRoot);
    else djPlayer.parentNode.insertBefore(panel, djPlayer.nextSibling);

    tbody = document.getElementById('dj-queue-tbody');
    countEl = document.getElementById('dj-queue-count');
    tbody.addEventListener('click', handleRemoveClick);
    wireDropzone(panel);
    wireReorder(tbody);
    lastSignature = null; // sofortiges Neuzeichnen fuer das neue Panel erzwingen
    render();
    if (pollTimer) clearInterval(pollTimer); // keine doppelten Polling-Loops
    pollTimer = setInterval(render, POLL_MS);
  }

  window.reinitNextUp = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
