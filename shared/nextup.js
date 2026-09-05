/* Ersetzt den Inhalt der bestehenden "Zuletzt gespielt"-Box (".gen-history",
   aus decades.js) durch EINE kombinierte Verlauf/Warteschlange-Liste --
   an genau derselben Stelle/Groesse, keine zweite Box, keine Luecke.
   Reine Anzeige (keine Klicks/Interaktion). Reihenfolge von oben nach
   unten: bis zu 5 kommende Songs (am weitesten entfernter zuerst, naechster
   direkt ueber dem Highlight), dann der aktuelle Song hervorgehoben, dann
   bis zu 5 zuletzt gespielte Songs (zuletzt gespielter direkt darunter,
   aeltere weiter unten). Die Hervorhebung bleibt also immer an derselben
   Stelle in der Liste, die Liste selbst "rutscht" mit jedem neuen Song um
   eine Position weiter.

   Technisch: die urspruengliche Liste (ID "gen-history-list") wird durch
   eine eigene ID ersetzt -- decades.js' renderPlayHistory() findet sein
   Element dann nicht mehr (hat bereits einen Null-Check eingebaut) und
   schreibt einfach nichts mehr dort hinein, kein Konflikt. Eigenstaendige
   Datei (wie midi.js/continuity.js) -- liest nur die globalen DECKS/
   playHistory aus decades.js per Polling, keine Aenderung an
   decades.js/.css noetig. */

(function () {
  var WINDOW_SIZE = 5; // je 5 zurueck und 5 vor dem aktuellen Song
  var POLL_MS = 1000;
  var listEl = null;
  var lastSignature = null;

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

  function songLine(s, marker, current) {
    return '<li class="gen-queue-item' + (current ? ' gen-queue-current' : '') + '">' +
      '<span class="gen-queue-num">' + marker + '</span>' +
      '<span class="gen-queue-text"><strong>' + escapeHtml(s.t) + '</strong><span>' + escapeHtml(s.a) + '</span></span></li>';
  }

  function render() {
    if (!listEl) return;
    var deck = pickActiveDeck();
    var current = deck ? deck.song : null;

    // Zuletzt gespielte Songs, neuester zuerst (playHistory aus decades.js ist
    // bereits unshift-basiert = neuester zuerst) -- der zuletzt gespielte
    // Song landet direkt UNTER dem aktuellen, aeltere weiter unten.
    var history = (typeof window.playHistory !== 'undefined' ? window.playHistory : [])
      .slice(0, WINDOW_SIZE);

    var upcoming = [];
    if (deck && deck.queue && deck.index > -1) {
      upcoming = deck.queue.slice(deck.index + 1, deck.index + 1 + WINDOW_SIZE);
    }
    // Oben in der Liste soll der naechste Song (direkt nach dem aktuellen)
    // am naehesten am Highlight stehen -- also umgekehrte Reihenfolge, der
    // am weitesten entfernte kommende Song ganz oben.
    var upcomingTopDown = upcoming.slice().reverse();

    var signature = upcoming.map(function (s) { return s.a + s.t; }).join(',') + '||' +
      (current ? current.a + current.t : '') + '||' +
      history.map(function (s) { return s.a + s.t; }).join(',');
    if (signature === lastSignature) return; // nichts geaendert, kein unnoetiges Neuzeichnen
    lastSignature = signature;

    if (!current && !history.length && !upcoming.length) {
      listEl.innerHTML = '<li class="gen-queue-empty">Nichts geladen.</li>';
      return;
    }

    var html = '';
    html += upcomingTopDown.map(function (s) { return songLine(s, '+', false); }).join('');
    if (current) html += songLine(current, '▶', true);
    html += history.map(function (s) { return songLine(s, '−', false); }).join('');
    listEl.innerHTML = html;
  }

  function injectStyles() {
    var style = document.createElement('style');
    style.textContent =
      '.gen-history ul{max-height:none;}' +
      '.gen-queue-item{display:flex;align-items:baseline;gap:8px;padding:5px 6px;border-radius:6px;}' +
      '.gen-queue-num{opacity:.5;flex:0 0 auto;min-width:16px;text-align:center;}' +
      '.gen-queue-text{display:flex;flex-direction:column;overflow:hidden;}' +
      '.gen-queue-text strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
      '.gen-queue-text span{opacity:.65;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
      '.gen-queue-current{background:rgba(34,197,94,.15);}' +
      '.gen-queue-current .gen-queue-num{opacity:1;color:#22c55e;}' +
      '.gen-queue-current strong{color:#22c55e;}' +
      '.gen-queue-empty{opacity:.6;font-size:12px;padding:4px 6px;}';
    document.head.appendChild(style);
  }

  function init() {
    var nativeHistory = document.querySelector('.gen-history');
    if (!nativeHistory) {
      window.setTimeout(init, 500); // Generator noch nicht gerendert
      return;
    }
    if (document.getElementById('gen-queue-list')) return; // schon initialisiert

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
      '<h3>' + nextIconSvg + ' Verlauf & Warteschlange</h3>' +
      '<ul id="gen-queue-list"><li class="gen-queue-empty">Nichts geladen.</li></ul>';

    listEl = document.getElementById('gen-queue-list');
    render();
    setInterval(render, POLL_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
