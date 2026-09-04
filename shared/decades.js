/* Gemeinsame Render-Logik fuer alle Dekaden-Seiten (80er, 90er, 2000er, ...).
   Jede Dekaden-Seite definiert nur ein DECADE-Konfigurationsobjekt und ruft
   eine der drei render*-Funktionen unten auf. So bleibt jede neue Dekade
   ein kleines Config-File statt kopiertem HTML/CSS/JS. */

function applyPalette(colors) {
  var root = document.documentElement.style;
  Object.keys(colors || {}).forEach(function (key) {
    root.setProperty('--' + key, colors[key]);
  });
}

var HOME_SVG = '<svg viewBox="0 0 24 24" fill="#f5cb7a" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.5 1.5 11h3V21h6v-6h3v6h6V11h3L12 2.5z"/></svg>';
var MAIL_SVG = '<svg viewBox="0 0 24 24" fill="#bfe0ff" xmlns="http://www.w3.org/2000/svg"><path d="M2 5h20v14H2V5zm2 2v.4l8 5.4 8-5.4V7H4zm16 2.9-8 5.4-8-5.4V17h16V9.9z"/></svg>';
var LOCK_SVG = '<svg viewBox="0 0 24 24" fill="#d6cbfa" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z"/></svg>';

function utilityBlockHTML(mailHref) {
  return '' +
    '<div class="utility-block">' +
    '  <a class="utility-tile" href="/" aria-label="Zurück zur Driftware Startseite">' +
    '    <div class="utility-icon" style="background:#d98c1f">' + HOME_SVG + '</div>' +
    '    <span class="utility-label">Home</span>' +
    '  </a>' +
    '  <a class="utility-tile" href="' + mailHref + '">' +
    '    <div class="utility-icon" style="background:#4a90d9">' + MAIL_SVG + '</div>' +
    '    <span class="utility-label">Mail</span>' +
    '  </a>' +
    '  <a class="utility-tile" href="privacy.html">' +
    '    <div class="utility-icon" style="background:#6a5acd">' + LOCK_SVG + '</div>' +
    '    <span class="utility-label">Datenschutz</span>' +
    '  </a>' +
    '</div>';
}

function contactFormHTML(subject) {
  return '' +
    '<form class="contact-form" method="POST" action="https://formsubmit.co/0b4cb7348b4cff5d1891bf8d99f1e757">' +
    '  <input type="hidden" name="_subject" value="' + subject + '">' +
    '  <input type="hidden" name="_template" value="table">' +
    '  <input type="text" name="_honey" class="contact-honey" tabindex="-1" autocomplete="off">' +
    '  <label><span>Name</span><input type="text" name="name" required></label>' +
    '  <label><span>Deine E-Mail-Adresse</span><input type="email" name="email" required></label>' +
    '  <label><span>Nachricht</span><textarea name="message" required></textarea></label>' +
    '  <button type="submit">Senden</button>' +
    '</form>';
}

/* ---------- Startseite der Dekade (index.html) ---------- */
function renderDecadeIndex(cfg) {
  applyPalette(cfg.colors);
  document.title = cfg.name + ' — ' + cfg.years + ' nach Stimmung sortiert';
  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', cfg.name + ': ' + cfg.tagline);

  document.body.insertAdjacentHTML('afterbegin', utilityBlockHTML('privacy.html#kontakt'));

  var featuresHTML = (cfg.features || []).map(function (f) {
    return '<div class="feature"><h3>' + f.emoji + ' ' + f.title + '</h3><p>' + f.desc + '</p></div>';
  }).join('');

  var main = document.getElementById('decade-root');
  main.insertAdjacentHTML('beforeend', '' +
    '<header class="decade-header">' +
    '  <div class="app-icon-hero" style="background:' + cfg.iconBg + '">' + cfg.icon + '</div>' +
    '  <p class="decade-logo">' + cfg.name + '</p>' +
    '  <p class="decade-years">' + cfg.years + '</p>' +
    '  <p class="decade-tagline">' + cfg.tagline + '</p>' +
    '  <div class="badges"><span class="badge">' + cfg.badgeText + '</span></div>' +
    '</header>' +
    '<main class="decade-main">' +
    '  <div class="features">' + featuresHTML + '</div>' +
    '  <div class="info-note"><strong>Woher kommen die Songs?</strong> ' + cfg.sourceNote + '</div>' +
    '</main>' +
    '<footer class="decade-footer">' +
    '  <span>&copy; 2026 Massimo — ' + cfg.name + '</span>' +
    '  <div class="links"><a href="impressum.html">Impressum</a></div>' +
    '</footer>'
  );
}

/* ---------- Impressum (impressum.html) ---------- */
function renderDecadeImpressum(cfg) {
  applyPalette(cfg.colors);
  document.title = 'Impressum — ' + cfg.name;
  document.body.insertAdjacentHTML('afterbegin', utilityBlockHTML('privacy.html#kontakt'));
  var main = document.getElementById('decade-root');
  main.insertAdjacentHTML('beforeend', '' +
    '<main class="legal-main">' +
    '  <a class="back-link" href="index.html">&larr; Zurück</a>' +
    '  <h1>Impressum</h1>' +
    '  <h2>Angaben gemäß § 5 TMG</h2>' +
    '  <p>Massimo</p>' +
    '  <p>Vollständiger Name und ladungsfähige Anschrift werden auf Anfrage über das Kontaktformular unten mitgeteilt.</p>' +
    '  <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>' +
    '  <p>Massimo</p>' +
    '  <h2>Hinweis</h2>' +
    '  <p>Dieses Impressum wurde als Entwurf für eine Einzelperson (kein Gewerbe) erstellt und ersetzt keine Rechtsberatung. Bei Unsicherheiten zur Impressumspflicht empfiehlt sich eine kurze Prüfung durch einen Anwalt oder einen Generator wie eRecht24.</p>' +
    '  <div class="contact-panel">' +
    '    <h2 style="margin-top:0;border-bottom:none;padding-bottom:0;">Kontaktformular</h2>' +
    contactFormHTML(cfg.name + ' — neue Kontaktanfrage') +
    '  </div>' +
    '</main>'
  );
}

/* ---------- Datenschutz (privacy.html) ---------- */
function renderDecadePrivacy(cfg) {
  applyPalette(cfg.colors);
  document.title = 'Datenschutzerklärung — ' + cfg.name;
  document.body.insertAdjacentHTML('afterbegin', utilityBlockHTML('#kontakt'));
  var main = document.getElementById('decade-root');
  main.insertAdjacentHTML('beforeend', '' +
    '<main class="legal-main">' +
    '  <a class="back-link" href="index.html">&larr; Zurück</a>' +
    '  <h1>Datenschutzerklärung – ' + cfg.name + '</h1>' +
    '  <p class="stand">Stand: September 2026</p>' +
    '  <h2>1. Verantwortlicher</h2>' +
    '  <p>Vollständiger Name und ladungsfähige Anschrift werden auf Anfrage über das Kontaktformular unten mitgeteilt.</p>' +
    '  <h2>2. Worum es hier geht</h2>' +
    '  <p>' + cfg.name + ' ist ein Projekt, das Songs aus ' + cfg.years + ' aus der offenen Musikdatenbank Discogs nach Stimmung/Genre sortiert und als Playlisten für Streaming-Dienste aufbereitet. ' + cfg.sourceNote + '</p>' +
    '  <h2>3. Keine Erhebung personenbezogener Daten</h2>' +
    '  <p>Diese Seite verwendet kein Nutzerkonto, kein Tracking und keine Analyse- oder Werbe-SDKs. Es werden keine Gerätekennungen, Standortdaten oder Nutzungsstatistiken erhoben, gespeichert oder übertragen.</p>' +
    '  <h2>4. Kontaktformular</h2>' +
    '  <p>Wenn du uns über das Kontaktformular schreibst, werden Name, E-Mail-Adresse und Nachricht über den Dienst formsubmit.co an uns weitergeleitet und ausschließlich zur Beantwortung deiner Anfrage genutzt.</p>' +
    '  <h2>5. Kinder</h2>' +
    '  <p>Dieses Angebot richtet sich nicht gezielt an Kinder unter 16 Jahren. Da keine personenbezogenen Daten automatisiert erhoben werden, werden auch keine Daten von Kindern gesammelt.</p>' +
    '  <h2>6. Deine Rechte</h2>' +
    '  <p>Da diese Seite keine personenbezogenen Daten automatisiert erhebt oder speichert, bestehen unsererseits keine Datenbestände, auf die sich Auskunfts-, Berichtigungs- oder Löschungsansprüche beziehen könnten. Bei Fragen erreichst du uns jederzeit über das Kontaktformular unten.</p>' +
    '  <h2>7. Änderungen dieser Erklärung</h2>' +
    '  <p>Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen, etwa wenn neue Funktionen hinzukommen. Die jeweils aktuelle Version ist unter dieser Seite abrufbar.</p>' +
    '  <div class="contact-panel" id="kontakt">' +
    '    <h2 style="margin-top:0;border-bottom:none;padding-bottom:0;">Kontakt</h2>' +
    contactFormHTML(cfg.name + ' — neue Kontaktanfrage') +
    '  </div>' +
    '</main>'
  );
}
