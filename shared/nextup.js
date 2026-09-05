/* "Als nächstes"-Anzeige neben "Zuletzt gespielt" im Playlist-Generator.
   Reine Anzeige (keine Klicks/Interaktion), zeigt bis zu 10 kommende Songs
   aus der Warteschlange des aktuell aktiven Decks. Eigenstaendige Datei
   (wie midi.js/continuity.js) -- liest nur die globalen DECKS aus
   decades.js per Polling, keine Aenderung an decades.js/.css noetig. */

(function () {
  var MAX_ITEMS = 10;
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

  function render() {
    if (!listEl) return;
    var deck = pickActiveDeck();
    var upcoming = [];
    if (deck && deck.queue && deck.index > -1) {
      upcoming = deck.queue.slice(deck.index + 1, deck.index + 1 + MAX_ITEMS);
    }

    var signature = upcoming.map(function (s) { return s.a + '|' + s.t; }).join(',');
    if (signature === lastSignature) return; // nichts geaendert, kein unnoetiges Neuzeichnen
    lastSignature = signature;

    if (!upcoming.length) {
      listEl.innerHTML = '<li class="gen-nextup-empty">Nichts in der Warteschlange.</li>';
      return;
    }
    listEl.innerHTML = upcoming.map(function (s, i) {
      return '<li><span class="gen-nextup-num">' + (i + 1) + '</span>' +
        '<span class="gen-nextup-text"><strong>' + escapeHtml(s.t) + '</strong><span>' + escapeHtml(s.a) + '</span></span></li>';
    }).join('');
  }

  function injectStyles() {
    var style = document.createElement('style');
    style.textContent =
      '.gen-nextup{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:12px 14px;flex:1 1 220px;max-width:280px;}' +
      '.gen-nextup h3{margin:0 0 8px;font-size:14px;display:flex;align-items:center;gap:6px;}' +
      '.gen-nextup h3 svg{width:16px;height:16px;}' +
      '.gen-nextup ul{list-style:none;margin:0;padding:0;max-height:260px;overflow-y:auto;}' +
      '.gen-nextup li{display:flex;align-items:baseline;gap:8px;padding:5px 0;border-top:1px solid rgba(255,255,255,.06);font-size:12px;}' +
      '.gen-nextup li:first-child{border-top:none;}' +
      '.gen-nextup-num{opacity:.5;flex:0 0 auto;min-width:14px;}' +
      '.gen-nextup-text{display:flex;flex-direction:column;overflow:hidden;}' +
      '.gen-nextup-text strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
      '.gen-nextup-text span{opacity:.65;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
      '.gen-nextup-empty{opacity:.6;font-size:12px;padding:4px 0;}';
    document.head.appendChild(style);
  }

  function init() {
    var history = document.querySelector('.gen-history');
    if (!history) {
      window.setTimeout(init, 500); // Generator noch nicht gerendert
      return;
    }
    if (document.querySelector('.gen-nextup')) return; // schon initialisiert

    injectStyles();

    var nextIconSvg = (typeof window.NEXT_SVG === 'string')
      ? window.NEXT_SVG
      : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 5v14l11-7z"/></svg>';

    var aside = document.createElement('aside');
    aside.className = 'gen-nextup';
    aside.innerHTML =
      '<h3>' + nextIconSvg + ' Als nächstes</h3>' +
      '<ul id="gen-nextup-list"><li class="gen-nextup-empty">Nichts in der Warteschlange.</li></ul>';
    history.insertAdjacentElement('afterend', aside);

    listEl = document.getElementById('gen-nextup-list');
    render();
    setInterval(render, POLL_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
