/* Song-Fortsetzung ueber Seitenwechsel hinweg (z.B. beim Wechsel der Dekade
   ueber die Hub-Uebersicht /dekaden/). Jede Dekaden-/Ambient-Seite ist ein
   eigenes, vollstaendig getrenntes HTML-Dokument -- ein Klick auf "Zurueck
   zur Uebersicht" oder eine andere Dekaden-Kachel ist ein echter
   Seiten-Reload, der den kompletten JS-Zustand (inkl. YouTube-Player)
   zerstoert. Es gibt keine Moeglichkeit, Audio ueber einen echten Reload
   hinweg technisch am Laufen zu halten.

   Stattdessen: kurz bevor die Seite verlassen wird, merken wir uns den
   gerade laufenden Song + Abspielposition in localStorage. Auf der naechsten
   Seite (jede Dekaden-/Ambient-Seite mit Player) wird das beim Laden erkannt
   und der Song macht dort automatisch an derselben Stelle weiter. Dazwischen
   liegt eine kurze Stille (Sekundenbruchteile bis ~1s fuer den eigentlichen
   Seitenwechsel + Video-Neuaufbau) -- kein echtes gapless Handover, aber ohne
   Risiko fuer Layout/Player-Code, da eigenstaendige Datei (siehe midi.js). */

(function () {
  var STORAGE_KEY = 'driftware-resume-v1';
  var MAX_AGE_MS = 20000; // 20s -- alles aeltere gilt als "kommt von woanders", kein Auto-Resume
  var RESUME_DECK = 'A';

  function saveState() {
    if (typeof window.DECKS === 'undefined') return;
    var key = null;
    if (window.DECKS.A && window.DECKS.A.isPlaying) key = 'A';
    else if (window.DECKS.B && window.DECKS.B.isPlaying) key = 'B';
    if (!key) return; // nichts spielt gerade -- nichts zu merken

    var deck = window.DECKS[key];
    var song = deck.song;
    if (!song || !song.yt) return;

    var elapsed = 0;
    try {
      if (deck.player && typeof deck.player.getCurrentTime === 'function') {
        elapsed = deck.player.getCurrentTime() || 0;
      }
    } catch (e) {}

    var state = {
      a: song.a, t: song.t, yt: song.yt, bpm: song.bpm || null,
      elapsed: elapsed, ts: Date.now(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function tryResume() {
    var raw;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return;
    }
    if (!raw) return;

    var state;
    try {
      state = JSON.parse(raw);
    } catch (e) {
      return;
    }
    // Verbraucht -- unabhaengig davon, ob wir es jetzt nutzen, nicht noch
    // einmal auf einer weiteren Seite (z.B. bei "zurueck") wiederverwenden.
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}

    if (!state || !state.yt || !state.ts) return;
    if (Date.now() - state.ts > MAX_AGE_MS) return; // zu alt, kein Zusammenhang mehr
    if (typeof window.playDeckSong !== 'function' || typeof window.DECKS === 'undefined') return;

    var song = { a: state.a, t: state.t, yt: state.yt, bpm: state.bpm };
    window.DECKS[RESUME_DECK].queue = [song];
    window.DECKS[RESUME_DECK].index = 0;
    window.playDeckSong(RESUME_DECK, song, true);

    if (state.elapsed > 2) {
      var attempts = 0;
      var seekTimer = setInterval(function () {
        attempts++;
        var deck = window.DECKS[RESUME_DECK];
        if (deck.player && typeof deck.player.seekTo === 'function') {
          try { deck.player.seekTo(state.elapsed, true); } catch (e) {}
          clearInterval(seekTimer);
        } else if (attempts > 20) { // ~6s Timeout, dann aufgeben (spielt trotzdem ab, nur von vorn)
          clearInterval(seekTimer);
        }
      }, 300);
    }
  }

  function init() {
    if (typeof window.DECKS === 'undefined') {
      window.setTimeout(init, 500); // decades.js/renderDecadeIndex noch nicht fertig
      return;
    }
    tryResume();
    window.addEventListener('pagehide', saveState);
    window.addEventListener('beforeunload', saveState);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
