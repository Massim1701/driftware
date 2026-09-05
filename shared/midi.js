/* MIDI-Controller-Anbindung fuer den DJ-Player (shared/decades.js).
   Eigenstaendige Datei, damit sie unabhaengig von Aenderungen an decades.js
   eingebunden/aktualisiert werden kann. Nutzt die Web MIDI API (nur
   Chrome/Edge unterstuetzen sie -- Safari/Firefox bekommen ein deaktiviertes
   Klickfeld mit Hinweis).

   Prinzip "MIDI-Learn": es gibt KEINEN einheitlichen MIDI-Standard zwischen
   DJ-Controllern (Pioneer, Denon, Traktor, Rane senden alle unterschiedliche
   CC-/Note-Nummern). Statt fester Profile pro Hersteller lernt die Seite
   selbst, welches MIDI-Signal zu welchem Regler gehoert: Nutzer klickt
   "Lernen", bewegt/drueckt den echten Regler einmal, fertig. Die Zuordnung
   wird pro Browser in localStorage gespeichert (gilt seitenuebergreifend auf
   driftware.online, da gleiche Origin) und ist fuer JEDEN Controller exakt
   derselbe Code-Pfad -- keine Hersteller-Fallunterscheidung. */

(function () {
  var STORAGE_KEY = 'driftware-midi-map-v1';
  var TARGETS = [
    { key: 'crossfader', label: 'Crossfader', kind: 'fader' },
    { key: 'master', label: 'Master-Volume', kind: 'fader' },
    { key: 'pitchA', label: 'Deck A: Pitch', kind: 'fader' },
    { key: 'pitchB', label: 'Deck B: Pitch', kind: 'fader' },
    { key: 'playA', label: 'Deck A: Play/Pause', kind: 'button' },
    { key: 'playB', label: 'Deck B: Play/Pause', kind: 'button' },
  ];

  var map = {};
  var midiAccess = null;
  var learningKey = null;
  var panelEl = null;
  var statusEls = {};

  function loadMap() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      map = raw ? JSON.parse(raw) : {};
    } catch (e) {
      map = {};
    }
  }

  function saveMap() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch (e) {}
  }

  function formatMapping(m) {
    if (!m) return 'nicht zugeordnet';
    var type = (m.status & 0xf0) === 0x90 ? 'Note' : 'CC';
    return type + ' ' + m.data1 + ' (Kanal ' + ((m.status & 0x0f) + 1) + ')';
  }

  function dispatch(targetKey, value) {
    switch (targetKey) {
      case 'crossfader': {
        var pct = Math.round((value / 127) * 100);
        var fader = document.getElementById('dj-crossfader');
        if (fader) fader.value = pct;
        if (typeof window.crossfaderValue !== 'undefined') window.crossfaderValue = pct;
        if (typeof window.applyCrossfaderVolumes === 'function') window.applyCrossfaderVolumes();
        break;
      }
      case 'master': {
        var mpct = Math.round((value / 127) * 100);
        var vol = document.getElementById('dj-master-volume');
        if (vol) vol.value = mpct;
        if (typeof window.masterVolume !== 'undefined') window.masterVolume = mpct;
        if (typeof window.applyCrossfaderVolumes === 'function') window.applyCrossfaderVolumes();
        break;
      }
      case 'pitchA':
      case 'pitchB': {
        var deckKey = targetKey === 'pitchA' ? 'A' : 'B';
        var pitchPct = Math.round((value / 127) * 100) - 50;
        if (typeof window.setDeckPitch === 'function') window.setDeckPitch(deckKey, 1 + pitchPct / 100);
        break;
      }
      case 'playA':
      case 'playB': {
        if (value <= 0) return; // nur auf Tastendruck reagieren, nicht auf Loslassen
        var pdKey = targetKey === 'playA' ? 'A' : 'B';
        if (typeof window.deckTogglePlay === 'function') window.deckTogglePlay(pdKey);
        break;
      }
    }
  }

  function onMIDIMessage(e) {
    var data = e.data;
    if (!data || data.length < 2) return;
    var status = data[0];
    var data1 = data[1];
    var data2 = data.length > 2 ? data[2] : 0;

    // Note-off wird oft als 0x80 ODER als Note-On mit velocity 0 gesendet --
    // fuer Buttons behandeln wir beides als "losgelassen" (siehe dispatch).
    if (learningKey) {
      map[learningKey] = { status: status, data1: data1 };
      saveMap();
      updateStatusUI(learningKey);
      learningKey = null;
      updateLearnButtons();
      return;
    }

    for (var key in map) {
      var m = map[key];
      if (m.status === status && m.data1 === data1) {
        dispatch(key, data2);
      }
      // Button-Loslassen: Note-On mit velocity 0 traegt denselben data1, aber
      // Note-Off (0x80er-Statusbyte) wird ignoriert -- kein Loslass-Handling
      // noetig, da deckTogglePlay nur auf Druck reagieren soll.
    }
  }

  function connectAllInputs() {
    if (!midiAccess) return;
    midiAccess.inputs.forEach(function (input) {
      input.onmidimessage = onMIDIMessage;
    });
  }

  function disconnectAll() {
    if (midiAccess) {
      try {
        midiAccess.inputs.forEach(function (input) {
          input.onmidimessage = null;
        });
        midiAccess.onstatechange = null;
      } catch (e) {}
    }
    midiAccess = null;
    learningKey = null;
    if (panelEl) updateLearnButtons();
  }

  function updateStatusUI(key) {
    if (statusEls[key]) statusEls[key].textContent = formatMapping(map[key]);
  }

  function updateLearnButtons() {
    TARGETS.forEach(function (t) {
      var btn = panelEl.querySelector('[data-learn="' + t.key + '"]');
      if (!btn) return;
      var active = learningKey === t.key;
      btn.textContent = active ? 'Bewege/drücke jetzt den Regler…' : 'Lernen';
      btn.classList.toggle('midi-learning', active);
    });
  }

  function buildPanel() {
    var panel = document.createElement('div');
    panel.className = 'dj-midi-panel';
    panel.innerHTML =
      '<button type="button" class="dj-midi-toggle" id="dj-midi-toggle">🎛️ MIDI-Controller</button>' +
      '<div class="dj-midi-body" id="dj-midi-body" hidden>' +
      '  <p class="dj-midi-hint">Verbinde einen DJ-Controller per USB, dann pro Regler auf "Lernen" klicken und den echten Regler einmal bewegen/drücken.</p>' +
      '  <div class="dj-midi-rows">' +
      TARGETS.map(function (t) {
        return (
          '<div class="dj-midi-row">' +
          '<span class="dj-midi-label">' + t.label + '</span>' +
          '<span class="dj-midi-status" data-status="' + t.key + '">nicht zugeordnet</span>' +
          '<button type="button" class="dj-midi-learn" data-learn="' + t.key + '">Lernen</button>' +
          '</div>'
        );
      }).join('') +
      '  </div>' +
      '  <button type="button" class="dj-midi-disconnect" id="dj-midi-disconnect">MIDI trennen</button>' +
      '</div>';
    return panel;
  }

  function injectStyles() {
    var style = document.createElement('style');
    style.textContent =
      '.dj-midi-panel{position:fixed;right:16px;bottom:16px;z-index:9999;font-family:inherit;font-size:13px;}' +
      '.dj-midi-toggle{background:#1c1c24;color:#f0e9ff;border:1px solid #4a4460;border-radius:8px;padding:8px 12px;cursor:pointer;}' +
      '.dj-midi-toggle:disabled{opacity:.5;cursor:not-allowed;}' +
      '.dj-midi-body{margin-top:8px;background:#1c1c24;border:1px solid #4a4460;border-radius:10px;padding:12px;width:280px;color:#e6e0f5;box-shadow:0 8px 24px rgba(0,0,0,.4);}' +
      '.dj-midi-hint{margin:0 0 10px;font-size:12px;opacity:.8;line-height:1.4;}' +
      '.dj-midi-row{display:flex;align-items:center;gap:6px;padding:4px 0;border-top:1px solid rgba(255,255,255,.08);}' +
      '.dj-midi-row:first-child{border-top:none;}' +
      '.dj-midi-label{flex:1 1 auto;}' +
      '.dj-midi-status{font-size:11px;opacity:.7;white-space:nowrap;}' +
      '.dj-midi-learn{background:#332f47;color:#fff;border:1px solid #5a527a;border-radius:6px;padding:3px 8px;cursor:pointer;font-size:11px;}' +
      '.dj-midi-learn.midi-learning{background:#e63946;border-color:#e63946;}' +
      '.dj-midi-disconnect{margin-top:10px;width:100%;background:transparent;color:#ff8a8a;border:1px solid #7a3a3a;border-radius:6px;padding:6px 10px;cursor:pointer;font-size:12px;}' +
      '.dj-midi-disconnect:hover{background:rgba(230,57,70,.15);}' +
      '.dj-midi-unsupported{font-size:12px;opacity:.75;padding:8px 12px;}';
    document.head.appendChild(style);
  }

  function init() {
    var host = document.getElementById('dj-player');
    if (!host) {
      // Player ist noch nicht gerendert (Timing der renderDecadeIndex-
      // Ausfuehrung) -- kurz erneut versuchen statt Feature stillschweigend
      // wegzulassen.
      window.setTimeout(init, 500);
      return;
    }
    if (document.querySelector('.dj-midi-panel')) return; // schon initialisiert

    injectStyles();
    loadMap();

    panelEl = document.createElement('div');
    panelEl.className = 'dj-midi-panel';

    if (!navigator.requestMIDIAccess) {
      panelEl.innerHTML =
        '<button type="button" class="dj-midi-toggle" disabled>🎛️ MIDI-Controller (nicht unterstützt)</button>' +
        '<div class="dj-midi-unsupported" hidden></div>';
      panelEl.title = 'Web MIDI wird nur von Chrome/Edge unterstützt, nicht von diesem Browser.';
      document.body.appendChild(panelEl);
      return;
    }

    panelEl.appendChild(buildPanel());
    document.body.appendChild(panelEl);

    TARGETS.forEach(function (t) {
      statusEls[t.key] = panelEl.querySelector('[data-status="' + t.key + '"]');
      updateStatusUI(t.key);
    });

    var toggleBtn = panelEl.querySelector('#dj-midi-toggle');
    var body = panelEl.querySelector('#dj-midi-body');
    toggleBtn.addEventListener('click', function () {
      if (!midiAccess) {
        toggleBtn.textContent = 'Verbinde…';
        navigator.requestMIDIAccess().then(function (access) {
          midiAccess = access;
          connectAllInputs();
          midiAccess.onstatechange = connectAllInputs;
          toggleBtn.textContent = '🎛️ MIDI verbunden';
          body.hidden = false;
        }, function () {
          toggleBtn.textContent = '🎛️ MIDI-Zugriff verweigert';
        });
      } else {
        body.hidden = !body.hidden;
      }
    });

    panelEl.querySelectorAll('[data-learn]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        learningKey = btn.dataset.learn;
        updateLearnButtons();
      });
    });

    var disconnectBtn = panelEl.querySelector('#dj-midi-disconnect');
    disconnectBtn.addEventListener('click', function () {
      disconnectAll();
      toggleBtn.textContent = '🎛️ MIDI-Controller';
      body.hidden = true;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
