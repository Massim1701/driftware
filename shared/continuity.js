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

    /* Chrome/Edge blockieren unmuted Autoplay, wenn kein frisches User-Gesture
       auf DIESER Seite vorliegt (der Klick war ja auf der VORHERIGEN Seite,
       zaehlt nach einer echten Navigation nicht mehr) -- deshalb blieb der
       Player nach einem Dekaden-/Ambient-Wechsel bisher einfach stumm/stehen.
       Fallback: nach kurzer Wartezeit pruefen, ob wirklich abgespielt wird
       (State 1); falls nicht, stumm schalten + erneut starten (stumme
       Wiedergabe per Skript ist OHNE Gesture erlaubt), und sobald sie laeuft,
       automatisch wieder entstummen (Lautstaerke-/Mute-Aenderung an bereits
       laufendem Video braucht KEIN Gesture mehr). */
    var attempts = 0;
    var seeked = false;
    var mutedFallbackTried = false;
    var pollTimer = setInterval(function () {
      attempts++;
      var deck = window.DECKS[RESUME_DECK];
      var player = deck.player;
      if (player && typeof player.getPlayerState === 'function') {
        if (!seeked && state.elapsed > 2 && typeof player.seekTo === 'function') {
          try { player.seekTo(state.elapsed, true); } catch (e) {}
          seeked = true;
        }
        var pState = player.getPlayerState();
        if (!mutedFallbackTried && attempts >= 4 && pState !== 1 && pState !== 3) {
          mutedFallbackTried = true;
          try { player.mute(); player.playVideo(); } catch (e) {}
        } else if (mutedFallbackTried && pState === 1) {
          try { player.unMute(); } catch (e) {}
          clearInterval(pollTimer);
        } else if (!mutedFallbackTried && pState === 1 && seeked) {
          clearInterval(pollTimer); // normales Autoplay hat funktioniert
        }
      }
      if (attempts > 20) clearInterval(pollTimer); // ~6s Timeout, dann aufgeben
    }, 300);
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
