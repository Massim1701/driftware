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
  // Nutzerwunsch (10.9.): Box ist jetzt eigenstaendig scrollbar (siehe
  // injectStyles/.gen-history ul) -- deshalb keine Begrenzung mehr auf
  // WINDOW_SIZE Songs, die komplette Warteschlange wird geladen.
  var POLL_MS = 1000;
  var listEl = null;
  var lastSignature = null;
  var pollTimer = null;
  var stylesInjected = false;
  var draggingIdx = null; // != null waehrend ein Warteschlangen-Eintrag zum Umsortieren gezogen wird

  /* Nutzerwunsch (11.9.): "wenn man meint das seine selbsterstellte
     Playlist gut ist, kann man die speichern und beim naechsten mal
     laden ... es gibt Leute die wollen Playlisten je nach dem speichern
     wie sie das wollen" -- mehrere benannte Playlisten (nicht nur ein
     Speicherplatz), Basis ist immer die AKTUELLE WARTESCHLANGE (nicht
     die gruene Haken-Auswahl), persistiert wie schon der bevorzugte
     Streaming-Dienst (PREFERRED_SERVICE_KEY in decades.js) in
     localStorage. */
  var PLAYLISTS_KEY = 'driftware-saved-playlists';

  /* Nutzerwunsch (9.10.): "die Warteschlange soll gespeichert werden
     koennen, auch das was bereits gelaufen ist ... diese Liste soll dann
     exportiert oder nochmal abgespielt werden koennen". Bereits gelaufene
     Songs werden deshalb hier mitgeschrieben -- als VOLLE Song-Objekte
     (inkl. yt), damit sie spaeter wirklich wieder abspielbar sind (der
     alte playHistory in decades.js kennt nur Interpret/Titel). Wechselt
     der "On Air"-Song, wandert der vorige in diese Liste. Bleibt ueber
     Reloads erhalten, bis "Verlauf leeren" gedrueckt wird. */
  var PLAYED_KEY = 'driftware-session-played';
  var PLAYED_MAX = 300;
  var played = [];
  try { played = JSON.parse(window.localStorage.getItem(PLAYED_KEY) || '[]') || []; } catch (err) { played = []; }
  var lastCurrent = null;
  var playedOpen = false;
  function songKey(s) { return s ? (s.yt || s.u || (s.a + '|' + s.t)) : ''; }
  function persistPlayed() {
    try { window.localStorage.setItem(PLAYED_KEY, JSON.stringify(played)); } catch (err) {}
  }
  function trackCurrent(current) {
    if (songKey(current) === songKey(lastCurrent)) return;
    if (lastCurrent && (!played.length || songKey(played[played.length - 1]) !== songKey(lastCurrent))) {
      played.push(lastCurrent);
      if (played.length > PLAYED_MAX) played.splice(0, played.length - PLAYED_MAX);
      persistPlayed();
    }
    lastCurrent = current;
  }
  function sessionSongs() {
    var deck = pickActiveDeck();
    var upcoming = (deck && deck.queue && deck.index > -1) ? deck.queue.slice(deck.index) : [];
    if (!upcoming.length && deck && deck.song) upcoming = [deck.song];
    return played.concat(upcoming);
  }
  function csvFor(songs) {
    var esc = function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; };
    var lines = ['Artist,Title,Year,Genre,Style,YouTube'];
    songs.forEach(function (s) {
      lines.push([esc(s.a), esc(s.t), s.y || '', esc(s.g), esc(s.s), esc(s.yt ? 'https://www.youtube.com/watch?v=' + s.yt : '')].join(','));
    });
    return lines.join('\n');
  }
  function downloadCsv(songs, name) {
    if (!songs.length) return;
    var blob = new Blob(['\ufeff' + csvFor(songs)], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = (name || 'playlist').replace(/[^\w\-äöüÄÖÜß ]+/g, '').trim().replace(/\s+/g, '-') + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }
  function copySongs(songs, btn) {
    if (!songs.length || !navigator.clipboard) return;
    navigator.clipboard.writeText(songs.map(function (s) { return s.a + ' - ' + s.t; }).join('\n')).then(function () {
      if (!btn) return;
      var old = btn.innerHTML; btn.innerHTML = 'Kopiert ✓';
      setTimeout(function () { btn.innerHTML = old; }, 1400);
    });
  }
  function replayPlayed() {
    if (!played.length) return;
    var deck = pickActiveDeck();
    if (deck && deck.song && deck.queue && deck.index > -1) {
      deck.queue = deck.queue.slice(0, deck.index + 1).concat(played.slice(), deck.queue.slice(deck.index + 1));
    } else if (typeof window.loadSongToDeck === 'function') {
      window.loadSongToDeck(played[0], 'A', played.slice(), false);
    }
    lastSignature = null; render();
  }

  function loadSavedPlaylists() {
    try {
      var raw = window.localStorage.getItem(PLAYLISTS_KEY);
      var obj = raw ? JSON.parse(raw) : {};
      return (obj && typeof obj === 'object') ? obj : {};
    } catch (err) {
      return {};
    }
  }

  function persistSavedPlaylists(obj) {
    try { window.localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(obj)); } catch (err) {}
  }

  /* Nutzerwunsch (10.9.): "Klickfeld einbauen um Warteschlange zu
     leeren, damit man eine neue laden kann" -- entfernt alle kommenden
     Songs aus der Warteschlange des aktiven Decks, der aktuell
     spielende Song bleibt geladen (keine Unterbrechung), damit direkt
     danach z.B. "Playlist auf Warteschlange laden" eine frische Liste
     anhaengen kann statt sich mit alten Resten zu vermischen. */
  function clearQueue() {
    var deck = pickActiveDeck();
    if (!deck || !deck.queue) return;
    if (deck.index > -1 && deck.queue[deck.index]) {
      deck.queue = [deck.queue[deck.index]];
      deck.index = 0;
    } else {
      deck.queue = [];
    }
    lastSignature = null; // sofortiges Neuzeichnen erzwingen
    render();
  }

  /* Nutzerwunsch (12.9.): "Button fuer die Player der beide leert" --
     anders als clearQueue() (nur aktives Deck) leert diese Variante
     BEIDE Decks (A und B), z.B. wenn man komplett neu anfangen will und
     nicht sicher ist, auf welchem Deck noch alte Reste liegen. Der
     jeweils aktuell geladene Song pro Deck bleibt (wie bei clearQueue())
     erhalten -- keine Unterbrechung eines laufenden Songs. */
  function clearBothQueues() {
    if (typeof window.DECKS === 'undefined') return;
    /* Nutzerwunsch (25.9.): "Player werden nicht geleert ... weil einer
       drin bleibt und blockiert" -- anders als noch im Kommentar oben
       beschrieben soll "Beide leeren" jetzt NICHT mehr nur die
       Warteschlangen leeren und den geladenen Song stehen lassen,
       sondern beide Decks wirklich komplett stoppen/leeren (Player
       inklusive), fuer einen echten kompletten Neuanfang. Nutzt
       decades.js' stopAndClearDeck() (dort definiert, hier nur
       aufgerufen -- keine Duplikation der Player-Teardown-Logik). */
    ['A', 'B'].forEach(function (key) {
      if (typeof window.stopAndClearDeck === 'function') {
        window.stopAndClearDeck(key);
      } else {
        // Fallback, falls decades.js aus irgendeinem Grund noch nicht
        // geladen ist: wenigstens die Warteschlange leeren wie bisher.
        var deck = window.DECKS[key];
        if (!deck || !deck.queue) return;
        if (deck.index > -1 && deck.queue[deck.index]) {
          deck.queue = [deck.queue[deck.index]];
          deck.index = 0;
        } else {
          deck.queue = [];
        }
      }
    });
    lastSignature = null; // sofortiges Neuzeichnen erzwingen
    render();
  }

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
    else if (kind === 'played') cls += ' gen-queue-played';
    // Der aktuell gespielte Song laesst sich hier nicht entfernen -- er
    // bekommt stattdessen den "On Air"-Hinweis an derselben Stelle (ganz
    // rechts). Kommende Zeilen (Warteschlange) bekommen ein "×".
    var trailing = '';
    if (kind === 'current') {
      trailing = '<span class="gen-queue-onair">' + ON_AIR_SVG + ' On Air</span>';
    } else if (kind === 'played') {
      trailing = '<button type="button" class="gen-queue-requeue" data-idx="' + idx + '" aria-label="Nochmal in die Warteschlange" title="Nochmal in die Warteschlange">↻</button>';
    } else {
      trailing = '<button type="button" class="gen-queue-remove" data-kind="' + kind + '" data-idx="' + idx + '" aria-label="Aus der Liste entfernen" title="Entfernen">&times;</button>';
    }
    // Nur kommende Songs (Warteschlange) lassen sich per Drag & Drop
    // umsortieren -- Verlauf ist Vergangenheit, der aktuelle Song laeuft
    // gerade. data-idx traegt hier den ECHTEN Index in deck.queue (siehe
    // render(): bleibt beim visuellen Umdrehen der Liste an den Objekten
    // haengen), reordering() unten kann ihn also direkt verwenden.
    var draggableAttr = (kind === 'upcoming' || kind === 'played') ? ' draggable="true"' : '';
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
    trackCurrent(current);

    var upcomingEntries = [];
    if (deck && deck.queue && deck.index > -1) {
      upcomingEntries = deck.queue.slice(deck.index + 1)
        .map(function (s, i) { return { song: s, idx: deck.index + 1 + i }; });
    }
    // Nutzerwunsch (9.9.): On Air ganz oben, darunter die Warteschlange in
    // natuerlicher Reihenfolge (naechster Song direkt darunter, danach
    // weiter absteigend) -- kein Umdrehen mehr noetig.

    var signature = upcomingEntries.map(function (e) { return e.song.a + e.song.t; }).join(',') + '||' +
      (current ? current.a + current.t : '') + '||' + played.length + (playedOpen ? 'o' : 'c');
    if (signature === lastSignature) return; // nichts geaendert, kein unnoetiges Neuzeichnen
    lastSignature = signature;

    var html = '';
    if (played.length) {
      html += '<li class="gen-queue-played-head"><button type="button" class="gen-queue-played-toggle" aria-expanded="' + playedOpen + '">' +
        (playedOpen ? '▾' : '▸') + ' Bereits gelaufen <b>' + played.length + '</b></button>' +
        '<button type="button" class="gen-queue-played-replay" title="Alle gelaufenen Songs nochmal in die Warteschlange">↻ Nochmal</button>' +
        '<button type="button" class="gen-queue-played-clear" title="Verlauf leeren">Leeren</button></li>';
      if (playedOpen) html += played.map(function (s, i) { return songLine(s, '✓', 'played', i); }).join('');
    }
    if (!current && !upcomingEntries.length) {
      listEl.innerHTML = html + '<li class="gen-queue-empty">Songs aus der Liste hierher ziehen oder auf + klicken.</li>';
      return;
    }

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
      if (draggingIdx !== null || draggingPlayed !== null) return; // internes Umsortieren laeuft, siehe wireReorder()
      e.preventDefault();
      box.classList.add('gen-queue-drag-over');
    });
    box.addEventListener('dragleave', function () {
      box.classList.remove('gen-queue-drag-over');
    });
    box.addEventListener('drop', function (e) {
      if (draggingIdx !== null || draggingPlayed !== null) return; // internes Umsortieren, siehe wireReorder()
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

  /* Einsortieren per Drag & Drop (Nutzerwunsch 9.10.: "nicht einfach nur
     ablegen sondern auch in der Reihenfolge reinschieben, alle Songs
     sollen verschiebbar sein"). Eine Einfuege-Linie zeigt, wo der Song
     landet (obere/untere Haelfte der Zeile = davor/danach). Quellen:
       - kommender Song (umsortieren, draggingIdx = Index in deck.queue)
       - bereits gelaufener Song (Kopie wird eingefuegt, draggingPlayed)
       - Song-Kachel aus der Liste (application/json, wie bei den Decks)
     Nur der "On Air"-Song bleibt fest. Bei langen Listen scrollt die Box
     am oberen/unteren Rand automatisch mit. */
  var draggingPlayed = null;
  function clearMarkers(list) {
    var stale = list.querySelectorAll('.gen-queue-ins-before, .gen-queue-ins-after, .gen-queue-dragging, .gen-queue-ins-end');
    for (var i = 0; i < stale.length; i++) stale[i].classList.remove('gen-queue-ins-before', 'gen-queue-ins-after', 'gen-queue-dragging', 'gen-queue-ins-end');
  }
  /* Zielposition in deck.queue aus der Mausposition bestimmen. */
  function insertionFor(list, e) {
    var deck = pickActiveDeck();
    if (!deck || !deck.song || !deck.queue || deck.index < 0) return { deck: deck, at: null, li: null };
    var li = e.target.closest ? e.target.closest('.gen-queue-upcoming, .gen-queue-current') : null;
    if (li && li.classList.contains('gen-queue-current')) return { deck: deck, at: deck.index + 1, li: li, after: true };
    if (li) {
      var r = li.getBoundingClientRect();
      var after = (e.clientY - r.top) > r.height / 2;
      var idx = parseInt(li.getAttribute('data-idx'), 10);
      return { deck: deck, at: after ? idx + 1 : idx, li: li, after: after };
    }
    var rows = list.querySelectorAll('.gen-queue-upcoming, .gen-queue-current');
    var last = rows.length ? rows[rows.length - 1] : null;
    return { deck: deck, at: deck.queue.length, li: last, after: true };
  }
  function autoScroll(list, e) {
    var r = list.getBoundingClientRect();
    if (e.clientY < r.top + 40) list.scrollTop -= 14;
    else if (e.clientY > r.bottom - 40) list.scrollTop += 14;
  }
  function wireReorder(list) {
    list.addEventListener('dragstart', function (e) {
      var up = e.target.closest('.gen-queue-upcoming');
      var pl = e.target.closest('.gen-queue-played');
      draggingIdx = null; draggingPlayed = null;
      if (up) draggingIdx = parseInt(up.getAttribute('data-idx'), 10);
      else if (pl) draggingPlayed = parseInt(pl.getAttribute('data-idx'), 10);
      else return;
      var dragSong = null;
      if (up) { var dk = pickActiveDeck(); dragSong = dk && dk.queue ? dk.queue[draggingIdx] : null; }
      else dragSong = played[draggingPlayed];
      try {
        e.dataTransfer.effectAllowed = 'copyMove';
        e.dataTransfer.setData('text/plain', dragSong ? (dragSong.a + ' - ' + dragSong.t) : '');
        /* Gleiche Payload wie die Song-Kacheln -- damit laesst sich der Song
           auch direkt auf ein Deck ziehen (siehe ccDropQueueSongOnDeck in
           decades.js); x-dw-queue sagt dem Deck, woher er kommt. */
        if (dragSong) {
          e.dataTransfer.setData('application/json', JSON.stringify(dragSong));
          e.dataTransfer.setData('application/x-dw-queue', JSON.stringify({ kind: up ? 'upcoming' : 'played', idx: up ? draggingIdx : draggingPlayed }));
          /* Gleiche Schallplatte mit Cover am Mauszeiger wie beim Ziehen aus
             der Song-Liste (ensureDragGhost in decades.js). */
          if (typeof window.ensureDragGhost === 'function' && e.dataTransfer.setDragImage) {
            var ghostSize = window.DRAG_GHOST_SIZE || 150;
            e.dataTransfer.setDragImage(window.ensureDragGhost(dragSong), ghostSize / 2, ghostSize / 2);
          }
        }
      } catch (err) {}
      // Shield ueber den Deck-Videos aktivieren (wie beim Ziehen aus der Liste)
      document.body.classList.add('dnd-dragging', 'dw-queue-drag');
      (up || pl).classList.add('gen-queue-dragging');
    });
    list.addEventListener('dragend', function () {
      draggingIdx = null; draggingPlayed = null;
      document.body.classList.remove('dnd-dragging', 'dw-queue-drag');
      clearMarkers(list);
      lastSignature = null; render();
    });
    list.addEventListener('dragover', function (e) {
      var external = draggingIdx === null && draggingPlayed === null;
      if (external && !document.body.classList.contains('dnd-dragging')) return;
      e.preventDefault();
      e.stopPropagation();
      autoScroll(list, e);
      var ins = insertionFor(list, e);
      clearMarkers(list);
      if (draggingIdx !== null) { var src = list.querySelector('.gen-queue-upcoming[data-idx="' + draggingIdx + '"]'); if (src) src.classList.add('gen-queue-dragging'); }
      if (ins.li) ins.li.classList.add(ins.after ? 'gen-queue-ins-after' : 'gen-queue-ins-before');
      var box = list.closest('.gen-history');
      if (box) box.classList.add('gen-queue-drag-over');
    });
    list.addEventListener('dragleave', function (e) {
      if (e.relatedTarget && list.contains(e.relatedTarget)) return;
      clearMarkers(list);
    });
    list.addEventListener('drop', function (e) {
      var external = draggingIdx === null && draggingPlayed === null;
      var raw = '';
      if (external) { try { raw = e.dataTransfer.getData('application/json'); } catch (err) {} if (!raw) return; }
      e.preventDefault();
      e.stopPropagation();
      var box = list.closest('.gen-history');
      if (box) box.classList.remove('gen-queue-drag-over');
      var ins = insertionFor(list, e);
      var deck = ins.deck;
      var song = null;
      if (draggingPlayed !== null) song = played[draggingPlayed];
      else if (external) { try { song = JSON.parse(raw); } catch (err) { song = null; } }

      if (deck && deck.queue && ins.at != null) {
        if (draggingIdx !== null) {
          var from = draggingIdx, to = ins.at;
          if (from !== to && from + 1 !== to) {
            var item = deck.queue.splice(from, 1)[0];
            if (from < to) to--;
            deck.queue.splice(to, 0, item);
          }
        } else if (song) {
          deck.queue.splice(ins.at, 0, song);
        }
      } else if (song && typeof window.loadSongToDeck === 'function') {
        window.loadSongToDeck(song, 'A', [song], false);
      }
      draggingIdx = null; draggingPlayed = null;
      clearMarkers(list);
      lastSignature = null; // sofortiges Neuzeichnen erzwingen
      render();
    });
  }

  function handleRemoveClick(e) {
    var t = e.target && e.target.closest ? e.target.closest('button') : null;
    if (t && t.classList.contains('gen-queue-played-toggle')) { playedOpen = !playedOpen; lastSignature = null; render(); return; }
    if (t && t.classList.contains('gen-queue-played-replay')) { replayPlayed(); return; }
    if (t && t.classList.contains('gen-queue-played-clear')) {
      if (!window.confirm('Verlauf (' + played.length + ' Songs) wirklich leeren?')) return;
      played = []; persistPlayed(); lastSignature = null; render(); return;
    }
    if (t && t.classList.contains('gen-queue-requeue')) {
      var song = played[parseInt(t.getAttribute('data-idx'), 10)];
      var dk = pickActiveDeck();
      if (song && dk && dk.song && dk.queue && dk.index > -1) dk.queue.push(song);
      else if (song && typeof window.loadSongToDeck === 'function') window.loadSongToDeck(song, 'A', [song], false);
      lastSignature = null; render(); return;
    }
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

  function refreshPlaylistSelect() {
    var select = document.getElementById('gen-queue-pl-select');
    if (!select) return;
    var playlists = loadSavedPlaylists();
    var names = Object.keys(playlists).sort(function (a, b) { return a.localeCompare(b, 'de'); });
    var prevValue = select.value;
    select.innerHTML = '<option value="">Playlist wählen…</option>' +
      names.map(function (name) {
        return '<option value="' + escapeHtml(name) + '">' + escapeHtml(name) + ' (' + playlists[name].length + ')</option>';
      }).join('');
    if (names.indexOf(prevValue) > -1) select.value = prevValue;
  }

  function savePlaylist() {
    /* Speichert die ganze Session: bereits gelaufen + On Air + kommend. */
    var songs = sessionSongs();
    if (!songs.length) {
      window.alert('Noch nichts gelaufen und die Warteschlange ist leer -- nichts zu speichern.');
      return;
    }
    var d = new Date();
    var suggestion = 'Session ' + d.getDate() + '.' + (d.getMonth() + 1) + '. ' + d.getHours() + ':' + ('0' + d.getMinutes()).slice(-2);
    var name = window.prompt('Name für diese Playlist (' + songs.length + ' Songs, inkl. bereits gelaufener):', suggestion);
    if (!name) return;
    name = name.trim();
    if (!name) return;
    var playlists = loadSavedPlaylists();
    if (playlists[name] && !window.confirm('Playlist "' + name + '" existiert schon -- überschreiben?')) return;
    playlists[name] = songs;
    persistSavedPlaylists(playlists);
    refreshPlaylistSelect();
    var select = document.getElementById('gen-queue-pl-select');
    if (select) select.value = name;
  }

  function loadSelectedPlaylist() {
    var select = document.getElementById('gen-queue-pl-select');
    if (!select || !select.value) return;
    var playlists = loadSavedPlaylists();
    var toLoad = playlists[select.value];
    if (!toLoad || !toLoad.length) return;

    var deck = pickActiveDeck();
    if (deck && deck.song && deck.queue && deck.index > -1) {
      /* Nutzerwunsch (11.9.): "wenn man eine neue Playlist laden moechte,
         bleiben die Songs von der alten Playlist drin, das soll verhindert
         werden, die Songs aus dem Player sollen gekickt werden" -- der
         aktuell spielende Song laeuft zu Ende (kein harter Schnitt), aber
         die Warteschlange dahinter wird komplett durch die neue Playlist
         ersetzt statt angehaengt, alte Restsongs fliegen raus. */
      deck.queue = [deck.queue[deck.index]].concat(toLoad);
      deck.index = 0;
    } else if (typeof window.loadSongToDeck === 'function') {
      window.loadSongToDeck(toLoad[0], 'A', toLoad, false);
    } else {
      return;
    }
    lastSignature = null; // sofortiges Neuzeichnen erzwingen
    render();
  }

  function deleteSelectedPlaylist() {
    var select = document.getElementById('gen-queue-pl-select');
    if (!select || !select.value) return;
    var name = select.value;
    if (!window.confirm('Playlist "' + name + '" wirklich löschen?')) return;
    var playlists = loadSavedPlaylists();
    delete playlists[name];
    persistSavedPlaylists(playlists);
    refreshPlaylistSelect();
  }

  function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;
    var style = document.createElement('style');
    style.textContent =
      '.gen-history ul{max-height:480px;overflow-y:auto;padding-right:16px;}' +
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
      '.gen-queue-remove{margin-left:auto;flex:0 0 auto;background:none;border:none;color:inherit;opacity:.35;font-size:16px;line-height:1;cursor:pointer;padding:8px 10px;margin-right:-4px;border-radius:5px;min-width:32px;min-height:32px;display:inline-flex;align-items:center;justify-content:center;}' +
      '.gen-queue-remove:hover{opacity:1;background:rgba(255,255,255,.14);}' +
      '.gen-queue-remove:focus-visible{opacity:1;outline:1px solid currentColor;}' +
      '.gen-queue-item:hover .gen-queue-remove{opacity:.7;}' +
      '.gen-history.gen-queue-drag-over{box-shadow:0 0 0 3px var(--accent);border-radius:12px;}' +
      '.gen-queue-upcoming{cursor:grab;}' +
      '.gen-queue-dragging{opacity:.35;}' +
      '.gen-queue-drop-target{box-shadow:inset 0 2px 0 var(--accent),inset 0 -2px 0 var(--accent);}' +
      '.gen-queue-item{position:relative;}' +
      '.gen-queue-ins-before::before,.gen-queue-ins-after::after{content:"";position:absolute;left:4px;right:4px;height:3px;border-radius:2px;background:var(--deck-b,var(--accent));box-shadow:0 0 10px var(--deck-b,var(--accent));pointer-events:none;z-index:2;}' +
      '.gen-queue-ins-before::before{top:-3px;}' +
      '.gen-queue-ins-after::after{bottom:-3px;}' +
      '.gen-queue-played{cursor:grab;}' +
      '.gen-queue-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 10px;}' +
      '.gen-queue-head h3{margin:0;}' +
      '.gen-queue-head-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap;}' +
      '.gen-queue-clear-btn{flex:0 0 auto;display:inline-flex;align-items:center;gap:5px;background:none;border:1px solid var(--border);color:var(--muted);font-size:11px;padding:4px 9px;border-radius:14px;cursor:pointer;}' +
      '.gen-queue-clear-btn svg{width:13px;height:13px;}' +
      '.gen-queue-clear-btn:hover{color:#f87171;border-color:#f87171;background:rgba(248,113,113,.1);}' +
      '.gen-queue-clear-btn:focus-visible{outline:1px solid currentColor;}' +
      '.gen-queue-playlist-row{display:flex;align-items:center;gap:6px;margin:0 0 10px;flex-wrap:wrap;}' +
      '.gen-queue-pl-btn{flex:0 0 auto;display:inline-flex;align-items:center;gap:5px;background:none;border:1px solid var(--border);color:var(--muted);font-size:11px;padding:4px 9px;border-radius:14px;cursor:pointer;}' +
      '.gen-queue-pl-btn svg{width:13px;height:13px;}' +
      '.gen-queue-pl-btn:hover{color:var(--accent);border-color:var(--accent);background:rgba(34,197,94,.1);}' +
      '.gen-queue-pl-btn:focus-visible{outline:1px solid currentColor;}' +
      '.gen-queue-pl-select{flex:1 1 120px;min-width:100px;background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:14px;font-size:11px;padding:4px 9px;}' +
      '.gen-queue-pl-delete:hover{color:#f87171;border-color:#f87171;background:rgba(248,113,113,.1);}' +
      '.gen-queue-row-label{flex:0 0 74px;font-size:9.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);opacity:.8;}' +
      '.gen-queue-played-head{display:flex;align-items:center;gap:6px;padding:2px 0 4px;}' +
      '.gen-queue-played-toggle{background:none;border:0;color:var(--muted);font-size:11.5px;font-weight:600;cursor:pointer;padding:4px 2px;margin-right:auto;}' +
      '.gen-queue-played-toggle b{color:var(--text);}' +
      '.gen-queue-played-replay,.gen-queue-played-clear{background:none;border:1px solid var(--border);color:var(--muted);font-size:10.5px;padding:3px 8px;border-radius:12px;cursor:pointer;}' +
      '.gen-queue-played-replay:hover{color:var(--accent);border-color:var(--accent);}' +
      '.gen-queue-played-clear:hover{color:#f87171;border-color:#f87171;}' +
      '.gen-queue-played{opacity:.55;}' +
      '.gen-queue-played:hover{opacity:.9;}' +
      '.gen-queue-played .gen-queue-num{color:var(--muted);}' +
      '.gen-queue-requeue{margin-left:auto;flex:0 0 auto;background:none;border:none;color:inherit;opacity:.5;font-size:15px;cursor:pointer;min-width:32px;min-height:28px;border-radius:5px;}' +
      '.gen-queue-requeue:hover{opacity:1;background:rgba(255,255,255,.12);}';
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
    var clearIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>';
    var saveIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/></svg>';
    var dlIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>';
    var copyIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
    var playIconSvg = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    nativeHistory.innerHTML =
      '<div class="gen-queue-head"><h3>' + nextIconSvg + ' Warteschlange</h3>' +
      '<div class="gen-queue-head-actions">' +
      '<button type="button" id="gen-queue-clear" class="gen-queue-clear-btn" title="Warteschlange leeren, damit eine neue geladen werden kann">' + clearIconSvg + ' Leeren</button>' +
      '<button type="button" id="gen-queue-clear-both" class="gen-queue-clear-btn" title="Player A und B komplett stoppen und leeren">' + clearIconSvg + ' Player leeren</button>' +
      '</div></div>' +
      '<div class="gen-queue-playlist-row gen-queue-session-row">' +
      '<span class="gen-queue-row-label">Session</span>' +
      '<button type="button" id="gen-queue-save" class="gen-queue-pl-btn" title="Bereits gelaufene + aktuelle + kommende Songs als Playlist speichern">' + saveIconSvg + ' Speichern</button>' +
      '<button type="button" id="gen-queue-export" class="gen-queue-pl-btn" title="Session als CSV herunterladen (für Spotify/Apple Music über Soundiiz oder TuneMyMusic)">' + dlIconSvg + ' CSV</button>' +
      '<button type="button" id="gen-queue-copy" class="gen-queue-pl-btn" title="Session als Text kopieren (Interpret - Titel)">' + copyIconSvg + ' Kopieren</button>' +
      '</div>' +
      '<div class="gen-queue-playlist-row">' +
      '<span class="gen-queue-row-label">Gespeichert</span>' +
      '<select id="gen-queue-pl-select" class="gen-queue-pl-select"><option value="">Playlist wählen…</option></select>' +
      '<button type="button" id="gen-queue-load" class="gen-queue-pl-btn" title="Ausgewählte Playlist abspielen (ersetzt die kommenden Songs)">' + playIconSvg + ' Abspielen</button>' +
      '<button type="button" id="gen-queue-pl-export" class="gen-queue-pl-btn" title="Ausgewählte Playlist als CSV herunterladen">' + dlIconSvg + '</button>' +
      '<button type="button" id="gen-queue-delete" class="gen-queue-pl-btn gen-queue-pl-delete" title="Ausgewählte Playlist löschen">' + clearIconSvg + '</button>' +
      '</div>' +
      '<ul id="gen-queue-list"><li class="gen-queue-empty">Nichts geladen.</li></ul>';

    listEl = document.getElementById('gen-queue-list');
    listEl.addEventListener('click', handleRemoveClick);
    var clearBtn = document.getElementById('gen-queue-clear');
    if (clearBtn) clearBtn.addEventListener('click', clearQueue);
    var clearBothBtn = document.getElementById('gen-queue-clear-both');
    if (clearBothBtn) clearBothBtn.addEventListener('click', clearBothQueues);
    var saveBtn = document.getElementById('gen-queue-save');
    if (saveBtn) saveBtn.addEventListener('click', savePlaylist);
    var loadBtn = document.getElementById('gen-queue-load');
    if (loadBtn) loadBtn.addEventListener('click', loadSelectedPlaylist);
    var deleteBtn = document.getElementById('gen-queue-delete');
    if (deleteBtn) deleteBtn.addEventListener('click', deleteSelectedPlaylist);
    var exportBtn = document.getElementById('gen-queue-export');
    if (exportBtn) exportBtn.addEventListener('click', function () {
      var songs = sessionSongs();
      if (!songs.length) { window.alert('Noch nichts in der Session.'); return; }
      var d = new Date();
      downloadCsv(songs, 'driftware-session-' + d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate());
    });
    var copyBtn = document.getElementById('gen-queue-copy');
    if (copyBtn) copyBtn.addEventListener('click', function () { copySongs(sessionSongs(), copyBtn); });
    var plExportBtn = document.getElementById('gen-queue-pl-export');
    if (plExportBtn) plExportBtn.addEventListener('click', function () {
      var select = document.getElementById('gen-queue-pl-select');
      if (!select || !select.value) { window.alert('Bitte zuerst eine gespeicherte Playlist wählen.'); return; }
      downloadCsv(loadSavedPlaylists()[select.value] || [], select.value);
    });
    refreshPlaylistSelect();
    wireDropzone(nativeHistory);
    wireReorder(listEl);
    lastSignature = null; // sofortiges Neuzeichnen fuer die neue Box erzwingen
    render();
    if (pollTimer) clearInterval(pollTimer); // keine doppelten Polling-Loops nach einem Wechsel
    pollTimer = setInterval(render, POLL_MS);
  }

  window.reinitNextUp = init;

  /* Bug-Fix (12.9.): Gegenstueck zum 'driftware-queue-changed' Event aus
     decades.js' playAllCurrent() -- dort wurde bisher, anders als bei
     jeder anderen Queue-Aenderung, kein sofortiges Neuzeichnen
     angestossen. Sorgt dafuer, dass die Warteschlangen-Anzeige direkt
     nach "Playlist auf Warteschlange laden" aktuell ist, statt auf den
     naechsten 1000ms-Poll warten zu muessen. */
  window.addEventListener('driftware-queue-changed', function () {
    lastSignature = null;
    render();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
