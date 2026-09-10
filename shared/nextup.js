/* Ersetzt den Inhalt der bestehenden "Zuletzt gespielt"-Box (".gen-history",
   aus decades.js) durch die Warteschlange (kein Verlauf mehr, Nutzerwunsch
   9.9.: "Verlauf brauchen wir nicht mehr ... nur Warteschlange") -- an
   genau derselben Stelle/Groesse, keine zweite Box, keine Luecke.
   Reihenfolge von oben nach unten (Nutzerwunsch 9.9.: "On Air an 1. Stelle,
   die Lieder die danach kommen da drunter"): zuerst der aktuelle Song
   hervorgehoben, darunter bis zu 10 kommende Songs in natuerlicher
   Reihenfolge (naechster direkt darunter, Nutzerwunsch: "10 Lieder
   sichtbar"). Kein Verlauf mehr.

   Interaktion: Songs aus der Song-Kachel-Liste lassen sich per Drag & Drop
   auf die Box ziehen, um sie ans Ende der Warteschlange zu haengen; kommende
   Zeilen lassen sich zusaetzlich untereinander per Drag & Drop umsortieren.
   Jede kommende Zeile hat ausserdem ein "×" zum direkten Entfernen aus
   deck.queue.

   Technisch: die urspruengliche Liste (ID "gen-history-list") wird durch
   eine eigene ID ersetzt -- decades.js' renderPlayHistory() findet sein
   Element dann nicht mehr (hat bereits einen Null-Check eingebaut) und
   schreibt einfach nichts mehr dort hinein, kein Konflikt. Eigenstaendige
   Datei (wie midi.js/continuity.js) -- liest/aendert nur die globalen
   DECKS aus decades.js per Polling, keine Aenderung an decades.js/.css
   noetig. */

(function () {
  var WINDOW_SIZE = 10; // Nutzerwunsch (9.9.): bis zu 10 kommende Songs sichtbar
  var POLL_MS = 1000;
  var listEl = null;
  var lastSignature = null;
  var pollTimer = null;
  var stylesInjected = false;
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

  var ON_AIR_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
    '<circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none"/>' +
    '<path d="M8.5 15a5 5 0 0 1 7 0"/>' +
    '<path d="M5.5 11.5a9.5 9.5 0 0 1 13 0"/></svg>';

  function songLine(s, marker, kind, idx) {
    // kind: "upcoming" (gruen), "current" (Highlight-Hintergrund + On-Air-Chip)
    var cls = 'gen-queue-item';
    if (kind === 'current') cls += ' gen-queue-current';
    else if (kind === 'upcoming') cls += ' gen-queue-upcoming';
    // Der aktuell gespielte Song laesst sich hier nicht entfernen -- er
    // bekommt stattdessen den "On Air"-Hinweis an derselben Stelle (ganz
    // rechts). Kommende Zeilen (Warteschlange) bekommen ein "×".
    var trailing = '';
    if (kind === 'current') {
      trailing = '<span class="gen-queue-onair">' + ON_AIR_SVG + ' On Air</span>';
    } else {
      trailing = '<button type="button" class="gen-queue-remove" data-kind="' + kind + '" data-idx="' + idx + '" aria-label="Aus der Liste entfernen" title="Entfernen">&times;</button>';
    }
    // Nur kommende Songs (Warteschlange) lassen sich per Drag & Drop
    // umsortieren -- Verlauf ist Vergangenheit, der aktuelle Song laeuft
    // gerade. data-idx traegt hier den ECHTEN Index in deck.queue (siehe
    // render(): bleibt beim visuellen Umdrehen der Liste an den Objekten
    // haengen), reordering() unten kann ihn also direkt verwenden.
    var draggableAttr = kind === 'upcoming' ? ' draggable="true"' : '';
    return '<li class="' + cls + '" data-idx="' + idx + '"' + draggableAttr + '>' +
      '<span class="gen-queue-num">' + marker + '</span>' +
      '<span class="gen-queue-text"><strong>' + escapeHtml(s.t) + '</strong><span>' + escapeHtml(s.a) + '</span></span>' +
      trailing +
      '</li>';
  }

  function render() {
    if (!listEl) return;
    var deck = pickActiveDeck();
    var current = deck ? deck.song : null;

    var upcomingEntries = [];
    if (deck && deck.queue && deck.index > -1) {
      upcomingEntries = deck.queue.slice(deck.index + 1, deck.index + 1 + WINDOW_SIZE)
        .map(function (s, i) { return { song: s, idx: deck.index + 1 + i }; });
    }
    // Nutzerwunsch (9.9.): On Air ganz oben, darunter die Warteschlange in
    // natuerlicher Reihenfolge (naechster Song direkt darunter, danach
    // weiter absteigend) -- kein Umdrehen mehr noetig.

    var signature = upcomingEntries.map(function (e) { return e.song.a + e.song.t; }).join(',') + '||' +
      (current ? current.a + current.t : '');
    if (signature === lastSignature) return; // nichts geaendert, kein unnoetiges Neuzeichnen
    lastSignature = signature;

    if (!current && !upcomingEntries.length) {
      listEl.innerHTML = '<li class="gen-queue-empty">Nichts geladen.</li>';
      return;
    }

    var html = '';
    if (current) html += songLine(current, '▶', 'current', null);
    html += upcomingEntries.map(function (e) { return songLine(e.song, '+', 'upcoming', e.idx); }).join('');
    listEl.innerHTML = html;
  }

  /* Songs lassen sich aus der Song-Kachel-Liste (decades.js, dragstart auf
     ".song-tile") direkt auf diese Box ziehen, um sie ans Ende der
     Warteschlange des aktiven Decks zu haengen -- dieselbe
     "application/json"-Payload, die auch die Deck-Dropzones (siehe
     decades.js #deck-A-drop/#deck-B-drop) schon lesen, hier nur ohne
     Dragshield noetig (kein Video-Iframe liegt ueber dieser Box). */
  function wireDropzone(box) {
    box.addEventListener('dragover', function (e) {
      if (draggingIdx !== null) return; // internes Umsortieren laeuft, siehe wireReorder()
      e.preventDefault();
      box.classList.add('gen-queue-drag-over');
    });
    box.addEventListener('dragleave', function () {
      box.classList.remove('gen-queue-drag-over');
    });
    box.addEventListener('drop', function (e) {
      if (draggingIdx !== null) return; // internes Umsortieren, siehe wireReorder()
      e.preventDefault();
      box.classList.remove('gen-queue-drag-over');
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

  /* Kommende Songs (Warteschlange) per Drag & Drop INNERHALB der Liste
     umsortieren -- ziehen und auf eine andere "+"-Zeile fallen lassen,
     tauscht die Position in deck.queue. Verlauf/aktueller Song sind nicht
     betroffen (kein draggable-Attribut, siehe songLine()). Eigene,
     dataTransfer-freie Verfolgung ueber draggingIdx statt
     dataTransfer.getData(), weil dataTransfer beim dragover-Handler
     in manchen Browsern nicht zuverlaessig lesbar ist. */
  function wireReorder(list) {
    list.addEventListener('dragstart', function (e) {
      var li = e.target.closest('.gen-queue-upcoming');
      if (!li) { draggingIdx = null; return; }
      draggingIdx = parseInt(li.getAttribute('data-idx'), 10);
      try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', ''); } catch (err) {}
      li.classList.add('gen-queue-dragging');
    });
    list.addEventListener('dragend', function () {
      draggingIdx = null;
      var stale = list.querySelectorAll('.gen-queue-dragging, .gen-queue-drop-target');
      for (var i = 0; i < stale.length; i++) stale[i].classList.remove('gen-queue-dragging', 'gen-queue-drop-target');
    });
    list.addEventListener('dragover', function (e) {
      if (draggingIdx === null) return; // kein interner Reorder -- externer Song-Tile-Drop laeuft ueber wireDropzone
      var li = e.target.closest('.gen-queue-upcoming');
      if (!li) return;
      e.preventDefault();
      e.stopPropagation();
      var prev = list.querySelector('.gen-queue-drop-target');
      if (prev && prev !== li) prev.classList.remove('gen-queue-drop-target');
      li.classList.add('gen-queue-drop-target');
    });
    list.addEventListener('drop', function (e) {
      if (draggingIdx === null) return;
      var li = e.target.closest('.gen-queue-upcoming');
      if (!li) return;
      e.preventDefault();
      e.stopPropagation();
      var toIdx = parseInt(li.getAttribute('data-idx'), 10);
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
    if (!target || !target.classList || !target.classList.contains('gen-queue-remove')) return;
    var kind = target.getAttribute('data-kind');
    var idx = parseInt(target.getAttribute('data-idx'), 10);
    if (isNaN(idx)) return;

    if (kind === 'upcoming') {
      var deck = pickActiveDeck();
      if (deck && deck.queue) deck.queue.splice(idx, 1);
    }

    lastSignature = null; // sofortiges Neuzeichnen erzwingen, nicht erst beim naechsten Poll
    render();
  }

  function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;
    var style = document.createElement('style');
    style.textContent =
      '.gen-history ul{max-height:none;}' +
      '.gen-queue-item{display:flex;align-items:baseline;gap:8px;padding:5px 6px;border-radius:6px;}' +
      '.gen-queue-num{opacity:.5;flex:0 0 auto;min-width:16px;text-align:center;}' +
      '.gen-queue-text{display:flex;flex-direction:column;overflow:hidden;}' +
      '.gen-queue-text strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
      '.gen-queue-text span{opacity:.65;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
      '.gen-queue-upcoming .gen-queue-num{opacity:1;color:#22c55e;}' +
      '.gen-queue-upcoming strong{color:#22c55e;}' +
      '.gen-queue-current{background:rgba(34,197,94,.14);border:1px solid rgba(34,197,94,.35);}' +
      '.gen-queue-current .gen-queue-num{opacity:1;color:#4ade80;}' +
      '.gen-queue-current strong{color:#fff;}' +
      '.gen-queue-onair{margin-left:auto;align-self:center;display:inline-flex;align-items:center;gap:6px;font-size:15px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#4ade80;background:rgba(34,197,94,.16);border:1px solid rgba(34,197,94,.4);padding:4.5px 12px;border-radius:20px;flex:0 0 auto;white-space:nowrap;}' +
      '.gen-queue-onair svg{width:16.5px;height:16.5px;}' +
      '.gen-queue-empty{opacity:.6;font-size:12px;padding:4px 6px;}' +
      '.gen-queue-remove{margin-left:auto;flex:0 0 auto;background:none;border:none;color:inherit;opacity:.35;font-size:16px;line-height:1;cursor:pointer;padding:2px 6px;border-radius:5px;}' +
      '.gen-queue-remove:hover{opacity:1;background:rgba(255,255,255,.14);}' +
      '.gen-queue-remove:focus-visible{opacity:1;outline:1px solid currentColor;}' +
      '.gen-queue-item:hover .gen-queue-remove{opacity:.7;}' +
      '.gen-history.gen-queue-drag-over{box-shadow:0 0 0 3px var(--accent);border-radius:12px;}' +
      '.gen-queue-upcoming{cursor:grab;}' +
      '.gen-queue-dragging{opacity:.35;}' +
      '.gen-queue-drop-target{box-shadow:inset 0 2px 0 var(--accent),inset 0 -2px 0 var(--accent);}';
    document.head.appendChild(style);
  }

  /* init() ist bewusst mehrfach aufrufbar -- die AJAX-Navigation zwischen
     Dekaden-/Ambient-Seiten (siehe navigateToPage in decades.js) baut die
     ".gen-history"-Box bei jedem Wechsel neu auf (kompletter Austausch von
     #decade-root), ohne dass die Seite selbst neu laedt. decades.js ruft
     danach window.reinitNextUp() explizit auf, damit diese Liste an die
     NEUE Box andockt statt an die alte (aus dem DOM entfernte). */
  function init() {
    var nativeHistory = document.querySelector('.gen-history');
    if (!nativeHistory) {
      window.setTimeout(init, 500); // Generator noch nicht gerendert
      return;
    }

    injectStyles();

    var nextIconSvg = (typeof window.NEXT_SVG === 'string')
      ? window.NEXT_SVG
      : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 5v14l11-7z"/></svg>';

    // Original-Inhalt (Ueberschrift "Zuletzt gespielt" + #gen-history-list)
    // komplett ersetzen -- dieselbe Box, dieselbe Position/Groesse, nur der
    // Inhalt wird zu unserer kombinierten Liste. decades.js' eigene
    // renderPlayHistory() findet "#gen-history-list" danach nicht mehr und
    // tut nichts mehr (hat einen Null-Check), kein Konflikt.
    nativeHistory.innerHTML =
      '<h3>' + nextIconSvg + ' Warteschlange</h3>' +
      '<ul id="gen-queue-list"><li class="gen-queue-empty">Nichts geladen.</li></ul>';

    listEl = document.getElementById('gen-queue-list');
    listEl.addEventListener('click', handleRemoveClick);
    wireDropzone(nativeHistory);
    wireReorder(listEl);
    lastSignature = null; // sofortiges Neuzeichnen fuer die neue Box erzwingen
    render();
    if (pollTimer) clearInterval(pollTimer); // keine doppelten Polling-Loops nach einem Wechsel
    pollTimer = setInterval(render, POLL_MS);
  }

  window.reinitNextUp = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
