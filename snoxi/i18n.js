/* Snoxi i18n — translations + apply logic + language switcher */
(function () {
  "use strict";

  var CONTACT_EMAIL = "welove80sde@gmail.com";
  // FormSubmit-ID statt nackter E-Mail-Adresse im Formular-action, damit Bots die Adresse nicht
  // aus dem Quelltext scrapen können (CONTACT_EMAIL bleibt für die sichtbare mailto-Zeile).
  var FORMSUBMIT_ID = "0b4cb7348b4cff5d1891bf8d99f1e757";

  var SUPPORTED_LANGUAGES = ["de","en","es","fr","it","pt","nl","tr","pl","ru","ja","zh"];
  var LANG_NAMES = {
    de: "Deutsch", en: "English", es: "Español", fr: "Français", it: "Italiano",
    pt: "Português", nl: "Nederlands", tr: "Türkçe", pl: "Polski", ru: "Русский",
    ja: "日本語", zh: "中文"
  };

  var translations = {};

  translations.de = {
common: {
          lang_label: "Sprache",
          contact_heading: "Kontakt aufnehmen",
          contact_name_label: "Name",
          contact_form_email_label: "Deine E-Mail-Adresse",
          contact_message_label: "Nachricht",
          contact_send: "Senden",
          contact_success: "Danke für deine Nachricht! Wir melden uns so schnell wie möglich bei dir.",
          contact_alt_note: "Du kannst uns auch direkt über den E-Mail-Link oben erreichen.",
          contact_email_prefix: "E-Mail erstellen",
          contact_address_note: "Vollständiger Name und ladungsfähige Anschrift werden auf Anfrage über das Kontaktformular unten mitgeteilt."
        },
    home: {
      title: "Snoxi — Foto- & Video-Editor",
      description: "Snoxi: schneller, unkomplizierter Foto- und Video-Editor. Filter, Sticker, Wasserzeichen, Gesichter unkenntlich machen und eine Kamera mit Live-Vorschau — alles lokal auf deinem Gerät.",
      tagline: "Filter, Sticker, Wasserzeichen & Gesichter unkenntlich machen — ganz einfach, komplett auf deinem Gerät.",
      badge_appstore: "🍎 App Store — bald verfügbar",
      badge_googleplay: "▶ Google Play — bald verfügbar",
      feature_camera_title: "📷 Kamera",
      feature_camera_desc: "Fotos und Videos direkt in der App aufnehmen — Emojis und Wasserzeichen schon live in der Vorschau.",
      feature_filter_title: "🎨 Filter",
      feature_filter_desc: "Mehrere Stimmungs-Presets für Fotos und Videos.",
      feature_crop_title: "✂️ Zuschneiden",
      feature_crop_desc: "Original, 1:1, 4:5, 16:9.",
      feature_sticker_title: "😀 Sticker",
      feature_sticker_desc: "Eigene Emojis frei platzieren und in der Größe anpassen.",
      feature_watermark_title: "💧 Wasserzeichen",
      feature_watermark_desc: "Eigener Text, 5 Schriftarten, 5 Farben, Größe & Transparenz frei einstellbar.",
      feature_face_title: "🙈 Gesicht unkenntlich",
      feature_face_desc: "Echte Weichzeichnung statt Störbalken, frei platzier- und skalierbar.",
      feature_privacy_title: "🔒 100 % privat",
      feature_privacy_desc: "Keine Cloud, kein Konto, kein Tracking — deine Fotos und Videos verlassen nie dein Gerät.",
      feature_whysnoxi_title: "🛡️ Warum Snoxi?",
      feature_whysnoxi_desc: "KI-Tools sind großartig — aber deine Fotos landen dafür oft auf einem fremden Server. Wer sichergehen will, dass nichts hochgeladen wird, ist mit Snoxi einfacher und günstiger unterwegs.",
      badge_nosub: "♾️ Kein Abo — einmal kaufen, für immer nutzen.",
      privacy_note_html: "<strong>Alles bleibt bei dir.</strong> Snoxi verarbeitet Fotos und Videos komplett lokal auf deinem Gerät — kein Konto, kein Hochladen, kein Tracking. Mehr dazu in der <a href=\"privacy.html\" style=\"color:var(--accent)\">Datenschutzerklärung</a>.",
      sysreq_note_html: "<strong>Systemvoraussetzungen:</strong> iOS 15.1+ oder Android 8.0+. Alle Details und die Schritt-für-Schritt-Anleitung findest du in der <a href=\"anleitung.html\" style=\"color:var(--accent)\">Bedienungsanleitung</a>.",
      footer_copyright: "© 2026 Massimo — Snoxi",
      footer_link_guide: "Anleitung",
      footer_link_privacy: "Datenschutzerklärung",
      footer_link_impressum: "Impressum",
      footer_link_contact: "Support"
    },
    guide: {
      title: "Bedienungsanleitung — Snoxi",
      description: "So funktioniert Snoxi: Fotos und Videos importieren oder aufnehmen, Filter, Wasserzeichen, Sticker, Gesichter unkenntlich machen und exportieren.",
      back: "Zurück zu Snoxi",
      h1: "Bedienungsanleitung",
      tagline: "So bearbeitest du Fotos und Videos mit Snoxi — Schritt für Schritt.",
      req_title: "Systemvoraussetzungen",
      req_ios_html: "<strong>iOS:</strong> iOS 15.1 oder neuer (iPhone)",
      req_android_html: "<strong>Android:</strong> Android 8.0 (Oreo) oder neuer",
      step1_title: "Foto oder Video auswählen",
      step1_body: "Auf dem Startbildschirm ein vorhandenes Foto oder Video aus deiner Galerie importieren — oder direkt über das Kamera-Symbol ein neues aufnehmen (siehe Schritt 7).",
      step2_title: "Filter anwenden",
      step2_body: "Aus mehreren Stimmungs-Presets wählen, die live auf dem Foto oder Video angezeigt werden. Ein Tipp auf \"Original\" entfernt den Filter wieder.",
      step3_title: "Zuschneiden",
      step3_body: "Zwischen Original, 1:1 (quadratisch), 4:5 (Hochformat) und 16:9 (Breitbild) wählen.",
      step4_title: "Wasserzeichen hinzufügen",
      step4_intro: "Eigenen Text eingeben und frei auf dem Bild platzieren. Einstellbar sind:",
      step4_li1: "5 Schriftarten",
      step4_li2: "5 Farben",
      step4_li3: "Größe (durch Ziehen an den Ecken)",
      step4_li4: "Transparenz",
      step4_note: "Die Einstellungen werden gemerkt und beim nächsten Mal automatisch vorgeschlagen.",
      step5_title: "Sticker platzieren",
      step5_body: "Beliebige Emojis auswählen, frei auf dem Bild verschieben und in der Größe anpassen. Mehrere Sticker gleichzeitig sind möglich.",
      step6_title: "Gesicht unkenntlich machen",
      step6_pro: "nur Fotos",
      step6_body: "Einen Weichzeichner-Kreis über ein Gesicht (oder einen beliebigen Bereich) legen, verschieben und skalieren, um es unkenntlich zu machen.",
      step7_title: "Direkt mit der Kamera aufnehmen",
      step7_body: "Über das Kamera-Symbol startet zunächst ein Einrichtungs-Bildschirm: dort Emojis und Wasserzeichen schon vorab auswählen und platzieren. Mit \"Weiter zur Kamera\" startet die Live-Ansicht, in der Sticker und Wasserzeichen schon in der Vorschau zu sehen sind. Foto oder Video aufnehmen — danach geht es direkt weiter zur Bearbeitung (Schritte 2–6).",
      step8_title: "Speichern & Teilen",
      step8_body: "Das fertige Foto oder Video in Originalauflösung in der Galerie speichern oder direkt aus der App teilen. Alle Filter, Wasserzeichen und Sticker werden dabei fest ins Bild bzw. Video eingebrannt.",
      pro_title: "Hinweis zu PRO-Funktionen",
      pro_li1_html: "Snoxi ist ein einmaliger Kauf (5,99&nbsp;€) — kein Abo, keine versteckten Kosten.",
      pro_li2: "Nach dem Kauf sind alle Funktionen dauerhaft freigeschaltet, inklusive Speichern und Teilen ohne Wasserzeichen-Einschränkung.",
      pro_li3: "🔒 100 % offline: Deine Fotos und Videos bleiben immer auf deinem Gerät.",
      footer_copyright: "© 2026 Massimo — Snoxi",
      footer_link_home: "Start",
      footer_link_privacy: "Datenschutzerklärung",
      footer_link_impressum: "Impressum",
      footer_link_contact: "Support"
    },
    privacy: {
      title: "Datenschutzerklärung — Snoxi",
      back: "Zurück",
      h1: "Datenschutzerklärung – Snoxi",
      stand: "Stand: August 2026",
      h2_1: "1. Verantwortlicher",
      p1: "Massimo",
      h2_2: "2. Worum es bei Snoxi geht",
      p2: "Snoxi ist eine App zur Bearbeitung von Fotos und Videos (Filter, Zuschneiden, Sticker, Wasserzeichen, Gesichter unkenntlich machen, Kamera-Aufnahme mit Live-Vorschau). Alle Bearbeitungen finden ausschließlich lokal auf deinem Gerät statt. Es werden keine Fotos, Videos oder sonstigen Inhalte an uns oder an Dritte übertragen.",
      h2_3: "3. Zugriffsberechtigungen und warum wir sie brauchen",
      li3_1: "Fotomediathek (Lesen): um ein Foto oder Video auszuwählen, das du bearbeiten möchtest.",
      li3_2: "Kamera und Mikrofon: um direkt in der App Fotos und Videos (mit Ton) aufzunehmen.",
      li3_3: "Fotomediathek (Schreiben/Speichern): um das bearbeitete Ergebnis in deiner Mediathek zu speichern.",
      p3_2: "Diese Berechtigungen werden ausschließlich lokal auf deinem Gerät verwendet. Es findet zu keinem Zeitpunkt ein Hochladen deiner Fotos, Videos oder Kamera-/Mikrofondaten auf einen Server statt.",
      h2_4: "4. Keine Erhebung personenbezogener Daten",
      p4: "Snoxi verwendet kein Nutzerkonto, kein Tracking und keine Analyse- oder Werbe-SDKs. Es werden keine Gerätekennungen, Standortdaten oder Nutzungsstatistiken erhoben, gespeichert oder übertragen. Die App erkennt automatisch die Sprache deines Geräts, um die Oberfläche entsprechend anzuzeigen — das geschieht rein lokal, ohne Datenübertragung.",
      h2_5: "5. In-App-Käufe",
      p5: "Die Premium-Freischaltung („Snoxi Pro“) ist ein einmaliger In-App-Kauf. Der gesamte Zahlungsvorgang läuft über den App Store (Apple) bzw. Google Play ab, ohne zusätzlichen Drittanbieter-Dienst. Zahlungsdaten wie Kreditkarteninformationen erhalten wir zu keinem Zeitpunkt — diese verbleiben vollständig bei Apple bzw. Google.",
      h2_6: "6. Kinder",
      p6: "Snoxi richtet sich nicht gezielt an Kinder unter 16 Jahren. Da die App ohnehin keine personenbezogenen Daten erhebt, werden auch keine Daten von Kindern gesammelt.",
      h2_7: "7. Deine Rechte",
      p7_text: "Da Snoxi keine personenbezogenen Daten erhebt, speichert oder überträgt, bestehen unsererseits keine Datenbestände, auf die sich Auskunfts-, Berichtigungs- oder Löschungsansprüche beziehen könnten. Bei Fragen erreichst du uns jederzeit über die Kontaktmöglichkeit am Ende dieser Seite.",
      h2_8: "8. Änderungen dieser Erklärung",
      p8: "Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen, etwa wenn neue Funktionen hinzukommen. Die jeweils aktuelle Version ist unter dieser Seite abrufbar."
    },
    impressum: {
      title: "Impressum — Snoxi",
      back: "Zurück",
      h1: "Impressum",
      h2_1: "Angaben gemäß § 5 TMG",
      p1: "Massimo",
      h2_kontakt: "Kontakt",
      h2_verantwortlich: "Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV",
      p_verantwortlich: "Massimo",
      h2_hinweis: "Hinweis",
      p_hinweis: "Dieses Impressum wurde als Entwurf für eine Einzelperson (kein Gewerbe) erstellt und ersetzt keine Rechtsberatung. Bei Unsicherheiten zur Impressumspflicht empfiehlt sich eine kurze Prüfung durch einen Anwalt oder einen Generator wie eRecht24."
    }
  };

  translations.en = {
common: {
          lang_label: "Language",
          contact_heading: "Get in Touch",
          contact_name_label: "Name",
          contact_form_email_label: "Your Email Address",
          contact_message_label: "Message",
          contact_send: "Send",
          contact_success: "Thank you for your message! We’ll get back to you as soon as possible.",
          contact_alt_note: "You can also reach us directly via the email link above.",
          contact_email_prefix: "Create Email",
          contact_address_note: "Full name and a postal address for service of process will be provided on request via the contact form below."
        },
    home: {
      title: "Snoxi — Photo & Video Editor",
      description: "Snoxi: a fast, effortless photo and video editor. Filters, stickers, watermarks, face blurring, and a camera with live preview — all on your device.",
      tagline: "Filters, stickers, watermarks & face blurring — simple, and entirely on your device.",
      badge_appstore: "🍎 App Store — coming soon",
      badge_googleplay: "▶ Google Play — coming soon",
      feature_camera_title: "📷 Camera",
      feature_camera_desc: "Capture photos and videos right in the app — with emojis and watermarks already visible live in the preview.",
      feature_filter_title: "🎨 Filters",
      feature_filter_desc: "Multiple mood presets for photos and videos.",
      feature_crop_title: "✂️ Crop",
      feature_crop_desc: "Original, 1:1, 4:5, 16:9.",
      feature_sticker_title: "😀 Stickers",
      feature_sticker_desc: "Freely place and resize your own emojis.",
      feature_watermark_title: "💧 Watermark",
      feature_watermark_desc: "Custom text, 5 fonts, 5 colors, adjustable size & transparency.",
      feature_face_title: "🙈 Face blur",
      feature_face_desc: "Real blurring instead of a censor bar — freely placeable and scalable.",
      feature_privacy_title: "🔒 100% private",
      feature_privacy_desc: "No cloud, no account, no tracking — your photos and videos never leave your device.",
      feature_whysnoxi_title: "🛡️ Why Snoxi?",
      feature_whysnoxi_desc: "AI tools are great — but your photos often end up on someone else's server. If you want to be sure nothing gets uploaded, Snoxi is the simpler, more affordable way to go.",
      badge_nosub: "♾️ No subscription — buy once, keep it forever.",
      privacy_note_html: "<strong>Everything stays with you.</strong> Snoxi processes photos and videos entirely on your device — no account, no uploads, no tracking. Learn more in the <a href=\"privacy.html\" style=\"color:var(--accent)\">privacy policy</a>.",
      sysreq_note_html: "<strong>System requirements:</strong> iOS 15.1+ or Android 8.0+. You'll find all the details and a step-by-step guide in the <a href=\"anleitung.html\" style=\"color:var(--accent)\">user guide</a>.",
      footer_copyright: "© 2026 Massimo — Snoxi",
      footer_link_guide: "Guide",
      footer_link_privacy: "Privacy Policy",
      footer_link_impressum: "Legal Notice",
      footer_link_contact: "Support"
    },
    guide: {
      title: "User Guide — Snoxi",
      description: "How Snoxi works: import or capture photos and videos, apply filters, watermarks, stickers, blur faces, and export.",
      back: "Back to Snoxi",
      h1: "User Guide",
      tagline: "How to edit photos and videos with Snoxi — step by step.",
      req_title: "System Requirements",
      req_ios_html: "<strong>iOS:</strong> iOS 15.1 or later (iPhone)",
      req_android_html: "<strong>Android:</strong> Android 8.0 (Oreo) or later",
      step1_title: "Choose a photo or video",
      step1_body: "On the home screen, import an existing photo or video from your gallery — or tap the camera icon to capture a new one (see Step 7).",
      step2_title: "Apply a filter",
      step2_body: "Choose from several mood presets, shown live on your photo or video. Tap \"Original\" to remove the filter again.",
      step3_title: "Crop",
      step3_body: "Choose between Original, 1:1 (square), 4:5 (portrait), and 16:9 (widescreen).",
      step4_title: "Add a watermark",
      step4_intro: "Enter your own text and place it freely on the image. You can adjust:",
      step4_li1: "5 fonts",
      step4_li2: "5 colors",
      step4_li3: "Size (drag the corners)",
      step4_li4: "Transparency",
      step4_note: "Your settings are remembered and suggested automatically next time.",
      step5_title: "Place stickers",
      step5_body: "Choose any emoji, move it freely on the image, and resize it. Multiple stickers at once are supported.",
      step6_title: "Blur a face",
      step6_pro: "photos only",
      step6_body: "Place a blur circle over a face (or any area), then move and scale it to make it unrecognizable.",
      step7_title: "Capture directly with the camera",
      step7_body: "Tapping the camera icon first opens a setup screen, where you can already choose and place emojis and watermarks. \"Continue to camera\" starts the live view, where stickers and watermarks already appear in the preview. Capture a photo or video — you'll then move straight into editing (Steps 2–6).",
      step8_title: "Save & Share",
      step8_body: "Save the finished photo or video at full resolution to your gallery, or share it directly from the app. All filters, watermarks, and stickers are permanently baked into the image or video.",
      pro_title: "About PRO features",
      pro_li1_html: "Snoxi is a one-time purchase (€5.99) — no subscription, no hidden costs.",
      pro_li2: "After purchase, all features are unlocked permanently, including saving and sharing without the watermark restriction.",
      pro_li3: "🔒 100% offline: your photos and videos always stay on your device.",
      footer_copyright: "© 2026 Massimo — Snoxi",
      footer_link_home: "Home",
      footer_link_privacy: "Privacy Policy",
      footer_link_impressum: "Legal Notice",
      footer_link_contact: "Support"
    },
    privacy: {
      title: "Privacy Policy — Snoxi",
      back: "Back",
      h1: "Privacy Policy – Snoxi",
      stand: "Last updated: August 2026",
      h2_1: "1. Data Controller",
      p1: "Massimo",
      h2_2: "2. What Snoxi is about",
      p2: "Snoxi is an app for editing photos and videos (filters, cropping, stickers, watermarks, face blurring, camera capture with live preview). All editing happens exclusively on your device. No photos, videos, or other content are ever transmitted to us or any third party.",
      h2_3: "3. Permissions and why we need them",
      li3_1: "Photo library (read): to select a photo or video you want to edit.",
      li3_2: "Camera and microphone: to capture photos and videos (with sound) directly in the app.",
      li3_3: "Photo library (write/save): to save the edited result to your library.",
      p3_2: "These permissions are used exclusively on your device. Your photos, videos, or camera/microphone data are never uploaded to a server.",
      h2_4: "4. No collection of personal data",
      p4: "Snoxi does not use a user account, tracking, or any analytics or advertising SDKs. No device identifiers, location data, or usage statistics are collected, stored, or transmitted. The app automatically detects your device's language to display the interface accordingly — this happens entirely on your device, without any data transfer.",
      h2_5: "5. In-app purchases",
      p5: "The premium unlock (\"Snoxi Pro\") is a one-time in-app purchase. The entire payment process runs through the App Store (Apple) or Google Play, with no additional third-party service. We never receive payment data such as credit card information — it remains entirely with Apple or Google.",
      h2_6: "6. Children",
      p6: "Snoxi is not specifically directed at children under 16. Since the app does not collect personal data in the first place, no data from children is collected either.",
      h2_7: "7. Your rights",
      p7_text: "Since Snoxi does not collect, store, or transmit personal data, we hold no data on which access, correction, or deletion requests could be based. If you have questions, you can reach us anytime via the contact option at the end of this page.",
      h2_8: "8. Changes to this policy",
      p8: "We reserve the right to update this privacy policy as needed, for example when new features are added. The current version is always available on this page."
    },
    impressum: {
      title: "Legal Notice — Snoxi",
      back: "Back",
      h1: "Legal Notice",
      h2_1: "Information pursuant to § 5 TMG",
      p1: "Massimo",
      h2_kontakt: "Contact",
      h2_verantwortlich: "Responsible for content pursuant to § 55 (2) RStV",
      p_verantwortlich: "Massimo",
      h2_hinweis: "Note",
      p_hinweis: "This legal notice was drafted for a private individual (not a business) and does not constitute legal advice. If you are unsure about legal notice requirements, we recommend a brief review by a lawyer or a generator such as eRecht24."
    }
  };

  translations.es = {
common: {
          lang_label: "Idioma",
          contact_heading: "Contáctanos",
          contact_name_label: "Nombre",
          contact_form_email_label: "Tu dirección de correo electrónico",
          contact_message_label: "Mensaje",
          contact_send: "Enviar",
          contact_success: "¡Gracias por tu mensaje! Te responderemos lo antes posible.",
          contact_alt_note: "También puedes contactarnos directamente a través del enlace de correo electrónico indicado arriba.",
          contact_email_prefix: "Crear correo",
          contact_address_note: "El nombre completo y una dirección postal válida se facilitarán previa solicitud a través del formulario de contacto que aparece más abajo."
        },
    home: {
      title: "Snoxi — Editor de fotos y vídeos",
      description: "Snoxi: un editor de fotos y vídeos rápido y sencillo. Filtros, pegatinas, marcas de agua, difuminado de rostros y una cámara con vista previa en directo — todo en tu dispositivo.",
      tagline: "Filtros, pegatinas, marcas de agua y difuminado de rostros — de forma sencilla, todo en tu dispositivo.",
      badge_appstore: "🍎 App Store — próximamente",
      badge_googleplay: "▶ Google Play — próximamente",
      feature_camera_title: "📷 Cámara",
      feature_camera_desc: "Captura fotos y vídeos directamente en la app — con emojis y marcas de agua ya visibles en la vista previa en directo.",
      feature_filter_title: "🎨 Filtros",
      feature_filter_desc: "Varios ajustes de ambiente para fotos y vídeos.",
      feature_crop_title: "✂️ Recortar",
      feature_crop_desc: "Original, 1:1, 4:5, 16:9.",
      feature_sticker_title: "😀 Pegatinas",
      feature_sticker_desc: "Coloca y ajusta el tamaño de tus propios emojis con total libertad.",
      feature_watermark_title: "💧 Marca de agua",
      feature_watermark_desc: "Texto personalizado, 5 tipografías, 5 colores, tamaño y transparencia ajustables.",
      feature_face_title: "🙈 Difuminar rostro",
      feature_face_desc: "Difuminado real en lugar de una barra de censura, colocable y ajustable libremente.",
      feature_privacy_title: "🔒 100 % privado",
      feature_privacy_desc: "Sin nube, sin cuenta, sin rastreo — tus fotos y vídeos nunca salen de tu dispositivo.",
      feature_whysnoxi_title: "🛡️ ¿Por qué Snoxi?",
      feature_whysnoxi_desc: "Las herramientas de IA son geniales, pero tus fotos suelen acabar en un servidor ajeno. Si quieres tener la certeza de que nada se sube, Snoxi es la opción más sencilla y económica.",
      badge_nosub: "♾️ Sin suscripción — compra única, tuya para siempre.",
      privacy_note_html: "<strong>Todo se queda contigo.</strong> Snoxi procesa fotos y vídeos completamente en tu dispositivo — sin cuenta, sin subidas, sin rastreo. Más información en la <a href=\"privacy.html\" style=\"color:var(--accent)\">política de privacidad</a>.",
      sysreq_note_html: "<strong>Requisitos del sistema:</strong> iOS 15.1+ o Android 8.0+. Encontrarás todos los detalles y la guía paso a paso en las <a href=\"anleitung.html\" style=\"color:var(--accent)\">instrucciones de uso</a>.",
      footer_copyright: "© 2026 Massimo — Snoxi",
      footer_link_guide: "Instrucciones",
      footer_link_privacy: "Política de privacidad",
      footer_link_impressum: "Aviso legal",
      footer_link_contact: "Soporte"
    },
    guide: {
      title: "Instrucciones de uso — Snoxi",
      description: "Cómo funciona Snoxi: importa o captura fotos y vídeos, aplica filtros, marcas de agua, pegatinas, difumina rostros y exporta.",
      back: "Volver a Snoxi",
      h1: "Instrucciones de uso",
      tagline: "Cómo editar fotos y vídeos con Snoxi — paso a paso.",
      req_title: "Requisitos del sistema",
      req_ios_html: "<strong>iOS:</strong> iOS 15.1 o superior (iPhone)",
      req_android_html: "<strong>Android:</strong> Android 8.0 (Oreo) o superior",
      step1_title: "Elegir una foto o vídeo",
      step1_body: "En la pantalla de inicio, importa una foto o vídeo existente de tu galería — o toca el icono de la cámara para capturar uno nuevo (ver paso 7).",
      step2_title: "Aplicar un filtro",
      step2_body: "Elige entre varios ajustes de ambiente, que se muestran en directo sobre tu foto o vídeo. Toca \"Original\" para quitar el filtro de nuevo.",
      step3_title: "Recortar",
      step3_body: "Elige entre Original, 1:1 (cuadrado), 4:5 (vertical) y 16:9 (panorámico).",
      step4_title: "Añadir una marca de agua",
      step4_intro: "Introduce tu propio texto y colócalo libremente sobre la imagen. Puedes ajustar:",
      step4_li1: "5 tipografías",
      step4_li2: "5 colores",
      step4_li3: "Tamaño (arrastrando las esquinas)",
      step4_li4: "Transparencia",
      step4_note: "Los ajustes se recuerdan y se proponen automáticamente la próxima vez.",
      step5_title: "Colocar pegatinas",
      step5_body: "Elige cualquier emoji, muévelo libremente sobre la imagen y ajusta su tamaño. Es posible colocar varias pegatinas a la vez.",
      step6_title: "Difuminar un rostro",
      step6_pro: "solo fotos",
      step6_body: "Coloca un círculo de difuminado sobre un rostro (o cualquier zona), y muévelo y ajústalo para hacerlo irreconocible.",
      step7_title: "Capturar directamente con la cámara",
      step7_body: "Al tocar el icono de la cámara se abre primero una pantalla de configuración: allí puedes elegir y colocar emojis y marcas de agua de antemano. Con \"Continuar a la cámara\" se inicia la vista en directo, donde las pegatinas y marcas de agua ya se ven en la vista previa. Captura una foto o vídeo — a continuación pasarás directamente a la edición (pasos 2 a 6).",
      step8_title: "Guardar y compartir",
      step8_body: "Guarda la foto o el vídeo terminado en resolución original en tu galería o compártelo directamente desde la app. Todos los filtros, marcas de agua y pegatinas quedan grabados de forma permanente en la imagen o el vídeo.",
      pro_title: "Sobre las funciones PRO",
      pro_li1_html: "Snoxi es una compra única (5,99&nbsp;€) — sin suscripción, sin costes ocultos.",
      pro_li2: "Tras la compra, todas las funciones quedan desbloqueadas de forma permanente, incluido guardar y compartir sin la restricción de la marca de agua.",
      pro_li3: "🔒 100 % offline: tus fotos y vídeos siempre permanecen en tu dispositivo.",
      footer_copyright: "© 2026 Massimo — Snoxi",
      footer_link_home: "Inicio",
      footer_link_privacy: "Política de privacidad",
      footer_link_impressum: "Aviso legal",
      footer_link_contact: "Soporte"
    },
    privacy: {
      title: "Política de privacidad — Snoxi",
      back: "Volver",
      h1: "Política de privacidad – Snoxi",
      stand: "Última actualización: agosto de 2026",
      h2_1: "1. Responsable",
      p1: "Massimo",
      h2_2: "2. De qué trata Snoxi",
      p2: "Snoxi es una app para editar fotos y vídeos (filtros, recorte, pegatinas, marcas de agua, difuminado de rostros, captura con cámara y vista previa en directo). Todas las ediciones se realizan exclusivamente en tu dispositivo. No se transmiten fotos, vídeos ni ningún otro contenido a nosotros ni a terceros.",
      h2_3: "3. Permisos de acceso y por qué los necesitamos",
      li3_1: "Fototeca (lectura): para seleccionar una foto o vídeo que quieras editar.",
      li3_2: "Cámara y micrófono: para capturar fotos y vídeos (con sonido) directamente en la app.",
      li3_3: "Fototeca (escritura/guardado): para guardar el resultado editado en tu fototeca.",
      p3_2: "Estos permisos se utilizan exclusivamente en tu dispositivo. En ningún momento se suben tus fotos, vídeos o datos de cámara/micrófono a un servidor.",
      h2_4: "4. Sin recopilación de datos personales",
      p4: "Snoxi no utiliza cuenta de usuario, ni rastreo, ni SDKs de análisis o publicidad. No se recopilan, almacenan ni transmiten identificadores de dispositivo, datos de ubicación ni estadísticas de uso. La app detecta automáticamente el idioma de tu dispositivo para mostrar la interfaz correspondiente — esto ocurre íntegramente en local, sin transmisión de datos.",
      h2_5: "5. Compras dentro de la app",
      p5: "El desbloqueo premium (\"Snoxi Pro\") es una compra única dentro de la app. Todo el proceso de pago se realiza a través de la App Store (Apple) o Google Play, sin ningún servicio adicional de terceros. Nunca recibimos datos de pago como información de tarjetas de crédito — estos permanecen íntegramente en manos de Apple o Google.",
      h2_6: "6. Menores",
      p6: "Snoxi no está dirigida específicamente a menores de 16 años. Dado que la app no recopila datos personales en ningún caso, tampoco se recopilan datos de menores.",
      h2_7: "7. Tus derechos",
      p7_text: "Dado que Snoxi no recopila, almacena ni transmite datos personales, no disponemos de ningún registro de datos sobre el que puedan basarse solicitudes de acceso, rectificación o supresión. Si tienes alguna pregunta, puedes contactarnos en cualquier momento a través de la opción de contacto al final de esta página.",
      h2_8: "8. Cambios en esta política",
      p8: "Nos reservamos el derecho de adaptar esta política de privacidad cuando sea necesario, por ejemplo al añadir nuevas funciones. La versión vigente en cada momento está disponible en esta página."
    },
    impressum: {
      title: "Aviso legal — Snoxi",
      back: "Volver",
      h1: "Aviso legal",
      h2_1: "Información conforme al § 5 TMG",
      p1: "Massimo",
      h2_kontakt: "Contacto",
      h2_verantwortlich: "Responsable del contenido conforme al § 55 párr. 2 RStV",
      p_verantwortlich: "Massimo",
      h2_hinweis: "Nota",
      p_hinweis: "Este aviso legal se ha redactado como borrador para una persona particular (sin actividad comercial) y no sustituye el asesoramiento jurídico. Si tienes dudas sobre la obligación de aviso legal, se recomienda una breve revisión por parte de un abogado o de un generador como eRecht24."
    }
  };

  translations.fr = {
common: {
          lang_label: "Langue",
          contact_heading: "Nous contacter",
          contact_name_label: "Nom",
          contact_form_email_label: "Votre adresse e-mail",
          contact_message_label: "Message",
          contact_send: "Envoyer",
          contact_success: "Merci pour votre message ! Nous vous répondrons dès que possible.",
          contact_alt_note: "Vous pouvez également nous contacter directement via le lien e-mail indiqué ci-dessus.",
          contact_email_prefix: "Créer un e-mail",
          contact_address_note: "Le nom complet et une adresse postale valable pour la signification seront communiqués sur demande via le formulaire de contact ci-dessous."
        },
    home: {
      title: "Snoxi — Éditeur photo et vidéo",
      description: "Snoxi : un éditeur photo et vidéo rapide et simple. Filtres, autocollants, filigranes, floutage de visages et un appareil photo avec aperçu en direct — le tout sur votre appareil.",
      tagline: "Filtres, autocollants, filigranes et floutage de visages — en toute simplicité, entièrement sur votre appareil.",
      badge_appstore: "🍎 App Store — bientôt disponible",
      badge_googleplay: "▶ Google Play — bientôt disponible",
      feature_camera_title: "📷 Appareil photo",
      feature_camera_desc: "Capturez photos et vidéos directement dans l'app — emojis et filigranes déjà visibles en direct dans l'aperçu.",
      feature_filter_title: "🎨 Filtres",
      feature_filter_desc: "Plusieurs ambiances prédéfinies pour photos et vidéos.",
      feature_crop_title: "✂️ Recadrer",
      feature_crop_desc: "Original, 1:1, 4:5, 16:9.",
      feature_sticker_title: "😀 Autocollants",
      feature_sticker_desc: "Placez et redimensionnez librement vos propres emojis.",
      feature_watermark_title: "💧 Filigrane",
      feature_watermark_desc: "Texte personnalisé, 5 polices, 5 couleurs, taille et transparence réglables.",
      feature_face_title: "🙈 Floutage de visage",
      feature_face_desc: "Un vrai flou plutôt qu'une barre de censure, librement positionnable et redimensionnable.",
      feature_privacy_title: "🔒 100 % privé",
      feature_privacy_desc: "Pas de cloud, pas de compte, pas de suivi — vos photos et vidéos ne quittent jamais votre appareil.",
      feature_whysnoxi_title: "🛡️ Pourquoi Snoxi ?",
      feature_whysnoxi_desc: "Les outils d'IA sont formidables, mais vos photos finissent souvent sur un serveur externe. Si vous voulez être sûr que rien n'est envoyé en ligne, Snoxi est la solution la plus simple et économique.",
      badge_nosub: "♾️ Sans abonnement — achetez une fois, gardez-le pour toujours.",
      privacy_note_html: "<strong>Tout reste chez vous.</strong> Snoxi traite les photos et vidéos entièrement sur votre appareil — pas de compte, pas d'envoi, pas de suivi. Plus d'informations dans la <a href=\"privacy.html\" style=\"color:var(--accent)\">politique de confidentialité</a>.",
      sysreq_note_html: "<strong>Configuration requise :</strong> iOS 15.1+ ou Android 8.0+. Retrouvez tous les détails et le guide étape par étape dans le <a href=\"anleitung.html\" style=\"color:var(--accent)\">mode d'emploi</a>.",
      footer_copyright: "© 2026 Massimo — Snoxi",
      footer_link_guide: "Mode d'emploi",
      footer_link_privacy: "Politique de confidentialité",
      footer_link_impressum: "Mentions légales",
      footer_link_contact: "Support"
    },
    guide: {
      title: "Mode d'emploi — Snoxi",
      description: "Comment fonctionne Snoxi : importer ou capturer des photos et vidéos, appliquer des filtres, filigranes, autocollants, flouter des visages et exporter.",
      back: "Retour à Snoxi",
      h1: "Mode d'emploi",
      tagline: "Comment éditer des photos et vidéos avec Snoxi — étape par étape.",
      req_title: "Configuration requise",
      req_ios_html: "<strong>iOS :</strong> iOS 15.1 ou version ultérieure (iPhone)",
      req_android_html: "<strong>Android :</strong> Android 8.0 (Oreo) ou version ultérieure",
      step1_title: "Choisir une photo ou une vidéo",
      step1_body: "Sur l'écran d'accueil, importez une photo ou vidéo existante depuis votre galerie — ou touchez l'icône de l'appareil photo pour en capturer une nouvelle (voir étape 7).",
      step2_title: "Appliquer un filtre",
      step2_body: "Choisissez parmi plusieurs ambiances prédéfinies, affichées en direct sur votre photo ou vidéo. Touchez « Original » pour retirer le filtre.",
      step3_title: "Recadrer",
      step3_body: "Choisissez entre Original, 1:1 (carré), 4:5 (portrait) et 16:9 (grand écran).",
      step4_title: "Ajouter un filigrane",
      step4_intro: "Saisissez votre propre texte et placez-le librement sur l'image. Vous pouvez régler :",
      step4_li1: "5 polices",
      step4_li2: "5 couleurs",
      step4_li3: "La taille (en tirant sur les coins)",
      step4_li4: "La transparence",
      step4_note: "Les réglages sont mémorisés et proposés automatiquement la prochaine fois.",
      step5_title: "Placer des autocollants",
      step5_body: "Choisissez n'importe quel emoji, déplacez-le librement sur l'image et redimensionnez-le. Plusieurs autocollants à la fois sont possibles.",
      step6_title: "Flouter un visage",
      step6_pro: "photos uniquement",
      step6_body: "Placez un cercle de flou sur un visage (ou toute autre zone), déplacez-le et redimensionnez-le pour le rendre méconnaissable.",
      step7_title: "Capturer directement avec l'appareil photo",
      step7_body: "En touchant l'icône de l'appareil photo, un écran de configuration s'ouvre d'abord : vous pouvez y choisir et placer emojis et filigranes à l'avance. « Continuer vers l'appareil photo » lance la vue en direct, où autocollants et filigranes sont déjà visibles dans l'aperçu. Capturez une photo ou une vidéo — vous passez ensuite directement à l'édition (étapes 2 à 6).",
      step8_title: "Enregistrer et partager",
      step8_body: "Enregistrez la photo ou la vidéo finalisée en résolution originale dans votre galerie, ou partagez-la directement depuis l'app. Tous les filtres, filigranes et autocollants sont alors incrustés définitivement dans l'image ou la vidéo.",
      pro_title: "À propos des fonctions PRO",
      pro_li1_html: "Snoxi est un achat unique (5,99&nbsp;€) — pas d'abonnement, pas de frais cachés.",
      pro_li2: "Après l'achat, toutes les fonctions sont débloquées définitivement, y compris l'enregistrement et le partage sans la restriction liée au filigrane.",
      pro_li3: "🔒 100 % hors ligne : vos photos et vidéos restent toujours sur votre appareil.",
      footer_copyright: "© 2026 Massimo — Snoxi",
      footer_link_home: "Accueil",
      footer_link_privacy: "Politique de confidentialité",
      footer_link_impressum: "Mentions légales",
      footer_link_contact: "Support"
    },
    privacy: {
      title: "Politique de confidentialité — Snoxi",
      back: "Retour",
      h1: "Politique de confidentialité – Snoxi",
      stand: "Dernière mise à jour : août 2026",
      h2_1: "1. Responsable du traitement",
      p1: "Massimo",
      h2_2: "2. En quoi consiste Snoxi",
      p2: "Snoxi est une application d'édition de photos et de vidéos (filtres, recadrage, autocollants, filigranes, floutage de visages, capture avec appareil photo et aperçu en direct). Toutes les modifications s'effectuent exclusivement sur votre appareil. Aucune photo, vidéo ou autre contenu n'est jamais transmis à nous-mêmes ou à des tiers.",
      h2_3: "3. Autorisations d'accès et pourquoi nous en avons besoin",
      li3_1: "Photothèque (lecture) : pour sélectionner une photo ou vidéo que vous souhaitez éditer.",
      li3_2: "Appareil photo et microphone : pour capturer des photos et vidéos (avec son) directement dans l'app.",
      li3_3: "Photothèque (écriture/enregistrement) : pour enregistrer le résultat édité dans votre photothèque.",
      p3_2: "Ces autorisations sont utilisées exclusivement sur votre appareil. Vos photos, vidéos ou données d'appareil photo/microphone ne sont jamais envoyées vers un serveur.",
      h2_4: "4. Aucune collecte de données personnelles",
      p4: "Snoxi n'utilise ni compte utilisateur, ni suivi, ni SDK d'analyse ou publicitaire. Aucun identifiant d'appareil, donnée de localisation ou statistique d'utilisation n'est collecté, stocké ou transmis. L'app détecte automatiquement la langue de votre appareil pour afficher l'interface en conséquence — cela se fait entièrement en local, sans transmission de données.",
      h2_5: "5. Achats intégrés",
      p5: "Le déblocage premium (« Snoxi Pro ») est un achat intégré unique. L'ensemble du processus de paiement passe par l'App Store (Apple) ou Google Play, sans service tiers supplémentaire. Nous ne recevons jamais de données de paiement telles que les informations de carte bancaire — elles restent entièrement entre les mains d'Apple ou de Google.",
      h2_6: "6. Enfants",
      p6: "Snoxi ne s'adresse pas spécifiquement aux enfants de moins de 16 ans. Comme l'app ne collecte de toute façon aucune donnée personnelle, aucune donnée d'enfant n'est collectée non plus.",
      h2_7: "7. Vos droits",
      p7_text: "Comme Snoxi ne collecte, ne stocke ni ne transmet de données personnelles, nous ne disposons d'aucun fichier de données pouvant faire l'objet de demandes d'accès, de rectification ou de suppression. Pour toute question, vous pouvez nous contacter à tout moment via l'option de contact à la fin de cette page.",
      h2_8: "8. Modifications de cette politique",
      p8: "Nous nous réservons le droit d'adapter cette politique de confidentialité si nécessaire, par exemple lors de l'ajout de nouvelles fonctions. La version actuelle est toujours disponible sur cette page."
    },
    impressum: {
      title: "Mentions légales — Snoxi",
      back: "Retour",
      h1: "Mentions légales",
      h2_1: "Informations conformément au § 5 TMG",
      p1: "Massimo",
      h2_kontakt: "Contact",
      h2_verantwortlich: "Responsable du contenu conformément au § 55 al. 2 RStV",
      p_verantwortlich: "Massimo",
      h2_hinweis: "Remarque",
      p_hinweis: "Ces mentions légales ont été rédigées comme modèle pour un particulier (sans activité commerciale) et ne remplacent pas un conseil juridique. En cas de doute sur l'obligation de mentions légales, il est recommandé de faire vérifier ce document par un avocat ou un générateur tel qu'eRecht24."
    }
  };

  translations.it = {
common: {
          lang_label: "Lingua",
          contact_heading: "Contattaci",
          contact_name_label: "Nome",
          contact_form_email_label: "La tua e-mail",
          contact_message_label: "Messaggio",
          contact_send: "Invia",
          contact_success: "Grazie per il tuo messaggio! Ti risponderemo il prima possibile.",
          contact_alt_note: "Puoi anche contattarci direttamente tramite il link e-mail indicato sopra.",
          contact_email_prefix: "Crea email",
          contact_address_note: "Il nome completo e un indirizzo postale valido per la notifica saranno forniti su richiesta tramite il modulo di contatto qui sotto."
        },
    home: {
      title: "Snoxi — Editor foto e video",
      description: "Snoxi: un editor di foto e video veloce e semplice. Filtri, sticker, filigrane, sfocatura dei volti e una fotocamera con anteprima live — tutto sul tuo dispositivo.",
      tagline: "Filtri, sticker, filigrane e sfocatura dei volti — semplice, interamente sul tuo dispositivo.",
      badge_appstore: "🍎 App Store — in arrivo",
      badge_googleplay: "▶ Google Play — in arrivo",
      feature_camera_title: "📷 Fotocamera",
      feature_camera_desc: "Scatta foto e riprendi video direttamente nell'app — con emoji e filigrane già visibili in anteprima live.",
      feature_filter_title: "🎨 Filtri",
      feature_filter_desc: "Diversi preset di atmosfera per foto e video.",
      feature_crop_title: "✂️ Ritaglio",
      feature_crop_desc: "Originale, 1:1, 4:5, 16:9.",
      feature_sticker_title: "😀 Sticker",
      feature_sticker_desc: "Posiziona liberamente le tue emoji e regolane la dimensione.",
      feature_watermark_title: "💧 Filigrana",
      feature_watermark_desc: "Testo personalizzato, 5 font, 5 colori, dimensione e trasparenza regolabili.",
      feature_face_title: "🙈 Sfocatura volto",
      feature_face_desc: "Sfocatura reale invece di una barra censura, posizionabile e ridimensionabile liberamente.",
      feature_privacy_title: "🔒 100% privato",
      feature_privacy_desc: "Niente cloud, niente account, nessun tracciamento — le tue foto e i tuoi video non lasciano mai il tuo dispositivo.",
      feature_whysnoxi_title: "🛡️ Perché Snoxi?",
      feature_whysnoxi_desc: "Gli strumenti IA sono fantastici, ma le tue foto spesso finiscono su un server esterno. Se vuoi essere sicuro che nulla venga caricato, Snoxi è la soluzione più semplice ed economica.",
      badge_nosub: "♾️ Nessun abbonamento — acquisti una volta, è tuo per sempre.",
      privacy_note_html: "<strong>Tutto resta con te.</strong> Snoxi elabora foto e video interamente sul tuo dispositivo — nessun account, nessun caricamento, nessun tracciamento. Maggiori informazioni nella <a href=\"privacy.html\" style=\"color:var(--accent)\">informativa sulla privacy</a>.",
      sysreq_note_html: "<strong>Requisiti di sistema:</strong> iOS 15.1+ o Android 8.0+. Tutti i dettagli e la guida passo passo si trovano nelle <a href=\"anleitung.html\" style=\"color:var(--accent)\">istruzioni per l'uso</a>.",
      footer_copyright: "© 2026 Massimo — Snoxi",
      footer_link_guide: "Istruzioni",
      footer_link_privacy: "Informativa sulla privacy",
      footer_link_impressum: "Note legali",
      footer_link_contact: "Supporto"
    },
    guide: {
      title: "Istruzioni per l'uso — Snoxi",
      description: "Come funziona Snoxi: importare o scattare foto e video, applicare filtri, filigrane, sticker, sfocare i volti ed esportare.",
      back: "Torna a Snoxi",
      h1: "Istruzioni per l'uso",
      tagline: "Come modificare foto e video con Snoxi — passo dopo passo.",
      req_title: "Requisiti di sistema",
      req_ios_html: "<strong>iOS:</strong> iOS 15.1 o versioni successive (iPhone)",
      req_android_html: "<strong>Android:</strong> Android 8.0 (Oreo) o versioni successive",
      step1_title: "Scegliere una foto o un video",
      step1_body: "Nella schermata iniziale, importa una foto o un video esistente dalla tua galleria — oppure tocca l'icona della fotocamera per scattarne uno nuovo (vedi passo 7).",
      step2_title: "Applicare un filtro",
      step2_body: "Scegli tra diversi preset di atmosfera, mostrati live sulla tua foto o video. Toccando \"Originale\" il filtro viene rimosso.",
      step3_title: "Ritaglio",
      step3_body: "Scegli tra Originale, 1:1 (quadrato), 4:5 (verticale) e 16:9 (widescreen).",
      step4_title: "Aggiungere una filigrana",
      step4_intro: "Inserisci il tuo testo e posizionalo liberamente sull'immagine. Puoi regolare:",
      step4_li1: "5 font",
      step4_li2: "5 colori",
      step4_li3: "La dimensione (trascinando gli angoli)",
      step4_li4: "La trasparenza",
      step4_note: "Le impostazioni vengono memorizzate e proposte automaticamente la volta successiva.",
      step5_title: "Posizionare gli sticker",
      step5_body: "Scegli qualsiasi emoji, spostala liberamente sull'immagine e regolane la dimensione. È possibile inserire più sticker contemporaneamente.",
      step6_title: "Sfocare un volto",
      step6_pro: "solo foto",
      step6_body: "Posiziona un cerchio di sfocatura su un volto (o su qualsiasi altra area), spostalo e ridimensionalo per renderlo irriconoscibile.",
      step7_title: "Scattare direttamente con la fotocamera",
      step7_body: "Toccando l'icona della fotocamera si apre prima una schermata di configurazione: qui puoi scegliere e posizionare in anticipo emoji e filigrane. Con \"Continua verso la fotocamera\" si avvia la vista live, in cui sticker e filigrane sono già visibili nell'anteprima. Scatta una foto o registra un video — subito dopo passerai direttamente alla modifica (passi 2–6).",
      step8_title: "Salvare e condividere",
      step8_body: "Salva la foto o il video finito in risoluzione originale nella galleria oppure condividilo direttamente dall'app. Tutti i filtri, le filigrane e gli sticker vengono incorporati in modo permanente nell'immagine o nel video.",
      pro_title: "Informazioni sulle funzioni PRO",
      pro_li1_html: "Snoxi è un acquisto una tantum (5,99&nbsp;€) — nessun abbonamento, nessun costo nascosto.",
      pro_li2: "Dopo l'acquisto tutte le funzioni vengono sbloccate in modo permanente, incluso il salvataggio e la condivisione senza la limitazione della filigrana.",
      pro_li3: "🔒 100% offline: le tue foto e i tuoi video restano sempre sul tuo dispositivo.",
      footer_copyright: "© 2026 Massimo — Snoxi",
      footer_link_home: "Home",
      footer_link_privacy: "Informativa sulla privacy",
      footer_link_impressum: "Note legali",
      footer_link_contact: "Supporto"
    },
    privacy: {
      title: "Informativa sulla privacy — Snoxi",
      back: "Indietro",
      h1: "Informativa sulla privacy – Snoxi",
      stand: "Ultimo aggiornamento: agosto 2026",
      h2_1: "1. Titolare del trattamento",
      p1: "Massimo",
      h2_2: "2. Di cosa si occupa Snoxi",
      p2: "Snoxi è un'app per l'editing di foto e video (filtri, ritaglio, sticker, filigrane, sfocatura dei volti, scatto con fotocamera e anteprima live). Tutte le modifiche avvengono esclusivamente sul tuo dispositivo. Nessuna foto, video o altro contenuto viene mai trasmesso a noi o a terzi.",
      h2_3: "3. Autorizzazioni di accesso e perché ci servono",
      li3_1: "Libreria foto (lettura): per selezionare una foto o un video che vuoi modificare.",
      li3_2: "Fotocamera e microfono: per scattare foto e registrare video (con audio) direttamente nell'app.",
      li3_3: "Libreria foto (scrittura/salvataggio): per salvare il risultato modificato nella tua libreria.",
      p3_2: "Queste autorizzazioni vengono utilizzate esclusivamente sul tuo dispositivo. In nessun momento le tue foto, i video o i dati di fotocamera/microfono vengono caricati su un server.",
      h2_4: "4. Nessuna raccolta di dati personali",
      p4: "Snoxi non utilizza alcun account utente, tracciamento o SDK di analisi o pubblicitari. Non vengono raccolti, memorizzati o trasmessi identificatori del dispositivo, dati di posizione o statistiche di utilizzo. L'app rileva automaticamente la lingua del tuo dispositivo per mostrare l'interfaccia di conseguenza — ciò avviene interamente in locale, senza trasmissione di dati.",
      h2_5: "5. Acquisti in-app",
      p5: "Lo sblocco premium (\"Snoxi Pro\") è un acquisto in-app una tantum. L'intero processo di pagamento avviene tramite App Store (Apple) o Google Play, senza ulteriori servizi di terze parti. Non riceviamo mai dati di pagamento come le informazioni della carta di credito — questi rimangono interamente presso Apple o Google.",
      h2_6: "6. Minori",
      p6: "Snoxi non si rivolge specificamente a minori di 16 anni. Poiché l'app non raccoglie comunque dati personali, non vengono raccolti neppure dati di minori.",
      h2_7: "7. I tuoi diritti",
      p7_text: "Poiché Snoxi non raccoglie, memorizza o trasmette dati personali, da parte nostra non esiste alcun archivio di dati a cui possano riferirsi richieste di accesso, rettifica o cancellazione. Per qualsiasi domanda puoi contattarci in qualsiasi momento tramite l'opzione di contatto alla fine di questa pagina.",
      h2_8: "8. Modifiche alla presente informativa",
      p8: "Ci riserviamo il diritto di adattare questa informativa sulla privacy quando necessario, ad esempio in caso di aggiunta di nuove funzioni. La versione attuale è sempre disponibile in questa pagina."
    },
    impressum: {
      title: "Note legali — Snoxi",
      back: "Indietro",
      h1: "Note legali",
      h2_1: "Informazioni ai sensi del § 5 TMG",
      p1: "Massimo",
      h2_kontakt: "Contatto",
      h2_verantwortlich: "Responsabile del contenuto ai sensi del § 55 comma 2 RStV",
      p_verantwortlich: "Massimo",
      h2_hinweis: "Nota",
      p_hinweis: "Queste note legali sono state redatte come bozza per una persona fisica (non un'attività commerciale) e non sostituiscono una consulenza legale. In caso di dubbi sull'obbligo di note legali, si consiglia una breve verifica da parte di un avvocato o di un generatore come eRecht24."
    }
  };

  translations.pt = {
common: {
          lang_label: "Idioma",
          contact_heading: "Fale conosco",
          contact_name_label: "Nome",
          contact_form_email_label: "Seu e-mail",
          contact_message_label: "Mensagem",
          contact_send: "Enviar",
          contact_success: "Obrigado pela sua mensagem! Responderemos o mais rápido possível.",
          contact_alt_note: "Você também pode nos contatar diretamente pelo link de e-mail exibido acima.",
          contact_email_prefix: "Criar e-mail",
          contact_address_note: "O nome completo e um endereço postal válido para notificações serão fornecidos mediante solicitação através do formulário de contato abaixo."
        },
    home: {
      title: "Snoxi — Editor de fotos e vídeos",
      description: "Snoxi: um editor de fotos e vídeos rápido e descomplicado. Filtros, adesivos, marcas d'água, desfoque de rostos e uma câmera com pré-visualização ao vivo — tudo no seu dispositivo.",
      tagline: "Filtros, adesivos, marcas d'água e desfoque de rostos — de forma simples, totalmente no seu dispositivo.",
      badge_appstore: "🍎 App Store — em breve",
      badge_googleplay: "▶ Google Play — em breve",
      feature_camera_title: "📷 Câmera",
      feature_camera_desc: "Capture fotos e vídeos diretamente no app — com emojis e marcas d'água já visíveis ao vivo na pré-visualização.",
      feature_filter_title: "🎨 Filtros",
      feature_filter_desc: "Várias predefinições de estilo para fotos e vídeos.",
      feature_crop_title: "✂️ Cortar",
      feature_crop_desc: "Original, 1:1, 4:5, 16:9.",
      feature_sticker_title: "😀 Adesivos",
      feature_sticker_desc: "Posicione livremente seus próprios emojis e ajuste o tamanho.",
      feature_watermark_title: "💧 Marca d'água",
      feature_watermark_desc: "Texto personalizado, 5 fontes, 5 cores, tamanho e transparência ajustáveis.",
      feature_face_title: "🙈 Desfoque de rosto",
      feature_face_desc: "Desfoque real em vez de uma barra de censura, posicionável e ajustável livremente.",
      feature_privacy_title: "🔒 100% privado",
      feature_privacy_desc: "Sem nuvem, sem conta, sem rastreamento — suas fotos e vídeos nunca saem do seu dispositivo.",
      feature_whysnoxi_title: "🛡️ Por que Snoxi?",
      feature_whysnoxi_desc: "As ferramentas de IA são ótimas, mas suas fotos costumam parar em um servidor de terceiros. Se você quer ter certeza de que nada é enviado, o Snoxi é a opção mais simples e econômica.",
      badge_nosub: "♾️ Sem assinatura — compre uma vez, use para sempre.",
      privacy_note_html: "<strong>Tudo fica com você.</strong> O Snoxi processa fotos e vídeos totalmente no seu dispositivo — sem conta, sem envio para servidores, sem rastreamento. Saiba mais na <a href=\"privacy.html\" style=\"color:var(--accent)\">política de privacidade</a>.",
      sysreq_note_html: "<strong>Requisitos do sistema:</strong> iOS 15.1+ ou Android 8.0+. Todos os detalhes e o guia passo a passo estão nas <a href=\"anleitung.html\" style=\"color:var(--accent)\">instruções de uso</a>.",
      footer_copyright: "© 2026 Massimo — Snoxi",
      footer_link_guide: "Instruções",
      footer_link_privacy: "Política de privacidade",
      footer_link_impressum: "Aviso legal",
      footer_link_contact: "Suporte"
    },
    guide: {
      title: "Instruções de uso — Snoxi",
      description: "Como o Snoxi funciona: importar ou capturar fotos e vídeos, aplicar filtros, marcas d'água, adesivos, desfocar rostos e exportar.",
      back: "Voltar ao Snoxi",
      h1: "Instruções de uso",
      tagline: "Como editar fotos e vídeos com o Snoxi — passo a passo.",
      req_title: "Requisitos do sistema",
      req_ios_html: "<strong>iOS:</strong> iOS 15.1 ou mais recente (iPhone)",
      req_android_html: "<strong>Android:</strong> Android 8.0 (Oreo) ou mais recente",
      step1_title: "Escolher uma foto ou vídeo",
      step1_body: "Na tela inicial, importe uma foto ou vídeo já existente da sua galeria — ou toque no ícone da câmera para capturar um novo (veja o passo 7).",
      step2_title: "Aplicar um filtro",
      step2_body: "Escolha entre várias predefinições de estilo, exibidas ao vivo na sua foto ou vídeo. Toque em \"Original\" para remover o filtro novamente.",
      step3_title: "Cortar",
      step3_body: "Escolha entre Original, 1:1 (quadrado), 4:5 (retrato) e 16:9 (widescreen).",
      step4_title: "Adicionar marca d'água",
      step4_intro: "Digite seu próprio texto e posicione-o livremente na imagem. É possível ajustar:",
      step4_li1: "5 fontes",
      step4_li2: "5 cores",
      step4_li3: "Tamanho (arrastando os cantos)",
      step4_li4: "Transparência",
      step4_note: "As configurações são memorizadas e sugeridas automaticamente na próxima vez.",
      step5_title: "Posicionar adesivos",
      step5_body: "Escolha qualquer emoji, mova-o livremente pela imagem e ajuste o tamanho. É possível usar vários adesivos ao mesmo tempo.",
      step6_title: "Desfocar um rosto",
      step6_pro: "somente fotos",
      step6_body: "Posicione um círculo de desfoque sobre um rosto (ou qualquer área), mova-o e redimensione-o para torná-lo irreconhecível.",
      step7_title: "Capturar diretamente com a câmera",
      step7_body: "Ao tocar no ícone da câmera, uma tela de configuração é aberta primeiro: ali você já pode escolher e posicionar emojis e marcas d'água. Com \"Continuar para a câmera\" inicia-se a visualização ao vivo, na qual adesivos e marcas d'água já aparecem na pré-visualização. Capture uma foto ou vídeo — em seguida você segue direto para a edição (passos 2 a 6).",
      step8_title: "Salvar e compartilhar",
      step8_body: "Salve a foto ou o vídeo finalizado em resolução original na galeria ou compartilhe diretamente pelo app. Todos os filtros, marcas d'água e adesivos ficam gravados permanentemente na imagem ou no vídeo.",
      pro_title: "Sobre os recursos PRO",
      pro_li1_html: "O Snoxi é uma compra única (5,99&nbsp;€) — sem assinatura, sem custos ocultos.",
      pro_li2: "Após a compra, todos os recursos ficam desbloqueados permanentemente, incluindo salvar e compartilhar sem a restrição da marca d'água.",
      pro_li3: "🔒 100% offline: suas fotos e vídeos permanecem sempre no seu dispositivo.",
      footer_copyright: "© 2026 Massimo — Snoxi",
      footer_link_home: "Início",
      footer_link_privacy: "Política de privacidade",
      footer_link_impressum: "Aviso legal",
      footer_link_contact: "Suporte"
    },
    privacy: {
      title: "Política de privacidade — Snoxi",
      back: "Voltar",
      h1: "Política de privacidade – Snoxi",
      stand: "Última atualização: agosto de 2026",
      h2_1: "1. Responsável",
      p1: "Massimo",
      h2_2: "2. Do que se trata o Snoxi",
      p2: "O Snoxi é um app para edição de fotos e vídeos (filtros, corte, adesivos, marcas d'água, desfoque de rostos, captura com câmera e pré-visualização ao vivo). Todas as edições ocorrem exclusivamente no seu dispositivo. Nenhuma foto, vídeo ou outro conteúdo é transmitido a nós ou a terceiros.",
      h2_3: "3. Permissões de acesso e por que precisamos delas",
      li3_1: "Galeria de fotos (leitura): para selecionar uma foto ou vídeo que você deseja editar.",
      li3_2: "Câmera e microfone: para capturar fotos e vídeos (com som) diretamente no app.",
      li3_3: "Galeria de fotos (escrita/salvamento): para salvar o resultado editado na sua galeria.",
      p3_2: "Essas permissões são usadas exclusivamente no seu dispositivo. Em nenhum momento suas fotos, vídeos ou dados de câmera/microfone são enviados a um servidor.",
      h2_4: "4. Nenhuma coleta de dados pessoais",
      p4: "O Snoxi não usa conta de usuário, rastreamento nem SDKs de análise ou publicidade. Nenhum identificador de dispositivo, dado de localização ou estatística de uso é coletado, armazenado ou transmitido. O app detecta automaticamente o idioma do seu dispositivo para exibir a interface correspondente — isso acontece inteiramente de forma local, sem transmissão de dados.",
      h2_5: "5. Compras dentro do app",
      p5: "O desbloqueio premium (\"Snoxi Pro\") é uma compra única dentro do app. Todo o processo de pagamento ocorre pela App Store (Apple) ou Google Play, sem serviço adicional de terceiros. Nunca recebemos dados de pagamento, como informações de cartão de crédito — eles permanecem inteiramente com a Apple ou o Google.",
      h2_6: "6. Crianças",
      p6: "O Snoxi não é direcionado especificamente a crianças menores de 16 anos. Como o app não coleta dados pessoais em nenhuma hipótese, também não são coletados dados de crianças.",
      h2_7: "7. Seus direitos",
      p7_text: "Como o Snoxi não coleta, armazena nem transmite dados pessoais, não mantemos nenhum banco de dados ao qual solicitações de acesso, retificação ou exclusão possam se referir. Em caso de dúvidas, você pode nos contatar a qualquer momento através da opção de contato no final desta página.",
      h2_8: "8. Alterações a esta política",
      p8: "Reservamo-nos o direito de adaptar esta política de privacidade quando necessário, por exemplo ao adicionar novos recursos. A versão atual está sempre disponível nesta página."
    },
    impressum: {
      title: "Aviso legal — Snoxi",
      back: "Voltar",
      h1: "Aviso legal",
      h2_1: "Informações conforme o § 5 TMG",
      p1: "Massimo",
      h2_kontakt: "Contato",
      h2_verantwortlich: "Responsável pelo conteúdo conforme o § 55, parágrafo 2 RStV",
      p_verantwortlich: "Massimo",
      h2_hinweis: "Observação",
      p_hinweis: "Este aviso legal foi elaborado como modelo para uma pessoa física (sem atividade comercial) e não substitui aconselhamento jurídico. Em caso de dúvidas sobre a obrigatoriedade do aviso legal, recomenda-se uma breve verificação por um advogado ou por um gerador como o eRecht24."
    }
  };

  translations.nl = {
common: {
          lang_label: "Taal",
          contact_heading: "Neem contact op",
          contact_name_label: "Naam",
          contact_form_email_label: "Jouw e-mailadres",
          contact_message_label: "Bericht",
          contact_send: "Verzenden",
          contact_success: "Bedankt voor je bericht! We reageren zo snel mogelijk.",
          contact_alt_note: "Je kunt ons ook rechtstreeks bereiken via de hierboven getoonde e-maillink.",
          contact_email_prefix: "E-mail opstellen",
          contact_address_note: "Volledige naam en een correspondentieadres worden op verzoek verstrekt via het contactformulier hieronder."
        },
    home: {
      title: "Snoxi — Foto- en video-editor",
      description: "Snoxi: een snelle, eenvoudige foto- en video-editor. Filters, stickers, watermerken, gezichten onherkenbaar maken en een camera met live-preview — allemaal lokaal op je apparaat.",
      tagline: "Filters, stickers, watermerken & gezichten onherkenbaar maken — heel eenvoudig, volledig op je apparaat.",
      badge_appstore: "🍎 App Store — binnenkort beschikbaar",
      badge_googleplay: "▶ Google Play — binnenkort beschikbaar",
      feature_camera_title: "📷 Camera",
      feature_camera_desc: "Maak foto's en video's rechtstreeks in de app — emoji's en watermerken al live zichtbaar in de preview.",
      feature_filter_title: "🎨 Filters",
      feature_filter_desc: "Meerdere sfeerpresets voor foto's en video's.",
      feature_crop_title: "✂️ Bijsnijden",
      feature_crop_desc: "Origineel, 1:1, 4:5, 16:9.",
      feature_sticker_title: "😀 Stickers",
      feature_sticker_desc: "Plaats je eigen emoji's vrij en pas het formaat aan.",
      feature_watermark_title: "💧 Watermerk",
      feature_watermark_desc: "Eigen tekst, 5 lettertypen, 5 kleuren, grootte & transparantie vrij instelbaar.",
      feature_face_title: "🙈 Gezicht onherkenbaar",
      feature_face_desc: "Echte vervaging in plaats van een censuurbalk, vrij plaatsbaar en schaalbaar.",
      feature_privacy_title: "🔒 100% privé",
      feature_privacy_desc: "Geen cloud, geen account, geen tracking — je foto's en video's verlaten nooit je apparaat.",
      feature_whysnoxi_title: "🛡️ Waarom Snoxi?",
      feature_whysnoxi_desc: "AI-tools zijn geweldig, maar je foto's belanden vaak op een server van een ander. Wil je zeker weten dat er niets wordt geüpload? Dan is Snoxi de eenvoudigste en voordeligste optie.",
      badge_nosub: "♾️ Geen abonnement — eenmalig kopen, voor altijd gebruiken.",
      privacy_note_html: "<strong>Alles blijft bij jou.</strong> Snoxi verwerkt foto's en video's volledig lokaal op je apparaat — geen account, geen uploads, geen tracking. Meer informatie in het <a href=\"privacy.html\" style=\"color:var(--accent)\">privacybeleid</a>.",
      sysreq_note_html: "<strong>Systeemvereisten:</strong> iOS 15.1+ of Android 8.0+. Alle details en de stap-voor-stap-handleiding vind je in de <a href=\"anleitung.html\" style=\"color:var(--accent)\">gebruiksaanwijzing</a>.",
      footer_copyright: "© 2026 Massimo — Snoxi",
      footer_link_guide: "Handleiding",
      footer_link_privacy: "Privacybeleid",
      footer_link_impressum: "Colofon",
      footer_link_contact: "Support"
    },
    guide: {
      title: "Gebruiksaanwijzing — Snoxi",
      description: "Zo werkt Snoxi: foto's en video's importeren of opnemen, filters, watermerken, stickers, gezichten onherkenbaar maken en exporteren.",
      back: "Terug naar Snoxi",
      h1: "Gebruiksaanwijzing",
      tagline: "Zo bewerk je foto's en video's met Snoxi — stap voor stap.",
      req_title: "Systeemvereisten",
      req_ios_html: "<strong>iOS:</strong> iOS 15.1 of nieuwer (iPhone)",
      req_android_html: "<strong>Android:</strong> Android 8.0 (Oreo) of nieuwer",
      step1_title: "Foto of video kiezen",
      step1_body: "Importeer op het startscherm een bestaande foto of video uit je galerij — of tik op het camera-icoon om direct een nieuwe op te nemen (zie stap 7).",
      step2_title: "Filter toepassen",
      step2_body: "Kies uit meerdere sfeerpresets, die live op je foto of video worden weergegeven. Tik op \"Origineel\" om het filter weer te verwijderen.",
      step3_title: "Bijsnijden",
      step3_body: "Kies tussen Origineel, 1:1 (vierkant), 4:5 (staand) en 16:9 (breedbeeld).",
      step4_title: "Watermerk toevoegen",
      step4_intro: "Voer je eigen tekst in en plaats die vrij op de afbeelding. Instelbaar zijn:",
      step4_li1: "5 lettertypen",
      step4_li2: "5 kleuren",
      step4_li3: "Grootte (door aan de hoeken te slepen)",
      step4_li4: "Transparantie",
      step4_note: "De instellingen worden onthouden en de volgende keer automatisch voorgesteld.",
      step5_title: "Stickers plaatsen",
      step5_body: "Kies een willekeurige emoji, verplaats deze vrij op de afbeelding en pas het formaat aan. Meerdere stickers tegelijk zijn mogelijk.",
      step6_title: "Gezicht onherkenbaar maken",
      step6_pro: "alleen foto's",
      step6_body: "Plaats een vervagingscirkel over een gezicht (of een willekeurig gebied), verplaats en schaal deze om het onherkenbaar te maken.",
      step7_title: "Direct opnemen met de camera",
      step7_body: "Via het camera-icoon start eerst een instelscherm: daar kun je emoji's en watermerken alvast kiezen en plaatsen. Met \"Verder naar camera\" start de live-weergave, waarin stickers en watermerken al in de preview te zien zijn. Neem een foto of video op — daarna ga je direct verder naar het bewerken (stappen 2–6).",
      step8_title: "Opslaan & delen",
      step8_body: "Sla de afgeronde foto of video in originele resolutie op in de galerij of deel deze direct vanuit de app. Alle filters, watermerken en stickers worden daarbij permanent in de afbeelding of video verwerkt.",
      pro_title: "Over PRO-functies",
      pro_li1_html: "Snoxi is een eenmalige aankoop (5,99&nbsp;€) — geen abonnement, geen verborgen kosten.",
      pro_li2: "Na aankoop zijn alle functies permanent ontgrendeld, inclusief opslaan en delen zonder de watermerk-beperking.",
      pro_li3: "🔒 100% offline: je foto's en video's blijven altijd op je apparaat.",
      footer_copyright: "© 2026 Massimo — Snoxi",
      footer_link_home: "Start",
      footer_link_privacy: "Privacybeleid",
      footer_link_impressum: "Colofon",
      footer_link_contact: "Support"
    },
    privacy: {
      title: "Privacybeleid — Snoxi",
      back: "Terug",
      h1: "Privacybeleid – Snoxi",
      stand: "Laatst bijgewerkt: augustus 2026",
      h2_1: "1. Verantwoordelijke",
      p1: "Massimo",
      h2_2: "2. Waar Snoxi voor staat",
      p2: "Snoxi is een app voor het bewerken van foto's en video's (filters, bijsnijden, stickers, watermerken, gezichten onherkenbaar maken, camera-opname met live-preview). Alle bewerkingen vinden uitsluitend lokaal op je apparaat plaats. Er worden geen foto's, video's of andere inhoud naar ons of naar derden verzonden.",
      h2_3: "3. Toegangsrechten en waarom we die nodig hebben",
      li3_1: "Fotobibliotheek (lezen): om een foto of video te selecteren die je wilt bewerken.",
      li3_2: "Camera en microfoon: om rechtstreeks in de app foto's en video's (met geluid) op te nemen.",
      li3_3: "Fotobibliotheek (schrijven/opslaan): om het bewerkte resultaat in je bibliotheek op te slaan.",
      p3_2: "Deze rechten worden uitsluitend lokaal op je apparaat gebruikt. Je foto's, video's of camera-/microfoongegevens worden op geen enkel moment naar een server geüpload.",
      h2_4: "4. Geen verzameling van persoonsgegevens",
      p4: "Snoxi gebruikt geen gebruikersaccount, geen tracking en geen analytics- of advertentie-SDK's. Er worden geen apparaat-ID's, locatiegegevens of gebruiksstatistieken verzameld, opgeslagen of verzonden. De app herkent automatisch de taal van je apparaat om de interface dienovereenkomstig weer te geven — dit gebeurt volledig lokaal, zonder gegevensoverdracht.",
      h2_5: "5. In-app-aankopen",
      p5: "De premium-ontgrendeling (\"Snoxi Pro\") is een eenmalige in-app-aankoop. Het gehele betalingsproces verloopt via de App Store (Apple) of Google Play, zonder aanvullende externe dienst. Wij ontvangen op geen enkel moment betaalgegevens zoals creditcardinformatie — deze blijven volledig bij Apple of Google.",
      h2_6: "6. Kinderen",
      p6: "Snoxi richt zich niet specifiek op kinderen jonger dan 16 jaar. Aangezien de app sowieso geen persoonsgegevens verzamelt, worden er ook geen gegevens van kinderen verzameld.",
      h2_7: "7. Jouw rechten",
      p7_text: "Omdat Snoxi geen persoonsgegevens verzamelt, opslaat of verzendt, beschikken wij niet over gegevensbestanden waarop verzoeken tot inzage, rectificatie of verwijdering betrekking zouden kunnen hebben. Bij vragen kun je ons altijd bereiken via de contactmogelijkheid onderaan deze pagina.",
      h2_8: "8. Wijzigingen in dit beleid",
      p8: "Wij behouden ons het recht voor dit privacybeleid indien nodig aan te passen, bijvoorbeeld wanneer er nieuwe functies bijkomen. De actuele versie is altijd op deze pagina beschikbaar."
    },
    impressum: {
      title: "Colofon — Snoxi",
      back: "Terug",
      h1: "Colofon",
      h2_1: "Gegevens conform § 5 TMG",
      p1: "Massimo",
      h2_kontakt: "Contact",
      h2_verantwortlich: "Verantwoordelijk voor de inhoud conform § 55 lid 2 RStV",
      p_verantwortlich: "Massimo",
      h2_hinweis: "Opmerking",
      p_hinweis: "Dit colofon is opgesteld als concept voor een particulier (geen bedrijf) en vervangt geen juridisch advies. Bij twijfel over de colofonverplichting wordt een korte controle door een advocaat of een generator zoals eRecht24 aanbevolen."
    }
  };

  translations.tr = {
common: {
          lang_label: "Dil",
          contact_heading: "Bize Ulaşın",
          contact_name_label: "İsim",
          contact_form_email_label: "E-posta Adresin",
          contact_message_label: "Mesaj",
          contact_send: "Gönder",
          contact_success: "Mesajın için teşekkürler! En kısa sürede sana geri döneceğiz.",
          contact_alt_note: "Bizimle yukarıda gösterilen e-posta bağlantısı üzerinden doğrudan da iletişime geçebilirsin.",
          contact_email_prefix: "E-posta oluştur",
          contact_address_note: "Tam ad ve tebligata elverişli adres, aşağıdaki iletişim formu üzerinden talep üzerine bildirilecektir."
        },
    home: {
      title: "Snoxi — Fotoğraf ve Video Düzenleyici",
      description: "Snoxi: hızlı, kullanımı kolay fotoğraf ve video düzenleyici. Filtreler, çıkartmalar, filigranlar, yüz bulanıklaştırma ve canlı önizlemeli kamera — hepsi cihazında.",
      tagline: "Filtreler, çıkartmalar, filigranlar ve yüz bulanıklaştırma — çok kolay, tamamen cihazında.",
      badge_appstore: "🍎 App Store — yakında",
      badge_googleplay: "▶ Google Play — yakında",
      feature_camera_title: "📷 Kamera",
      feature_camera_desc: "Fotoğraf ve videoları doğrudan uygulama içinde çek — emojiler ve filigranlar önizlemede canlı olarak görünür.",
      feature_filter_title: "🎨 Filtreler",
      feature_filter_desc: "Fotoğraflar ve videolar için birden fazla atmosfer ön ayarı.",
      feature_crop_title: "✂️ Kırpma",
      feature_crop_desc: "Orijinal, 1:1, 4:5, 16:9.",
      feature_sticker_title: "😀 Çıkartmalar",
      feature_sticker_desc: "Kendi emojilerini serbestçe yerleştir ve boyutunu ayarla.",
      feature_watermark_title: "💧 Filigran",
      feature_watermark_desc: "Kendi metnin, 5 yazı tipi, 5 renk, serbestçe ayarlanabilir boyut ve saydamlık.",
      feature_face_title: "🙈 Yüz bulanıklaştırma",
      feature_face_desc: "Sansür çubuğu yerine gerçek bulanıklaştırma, serbestçe yerleştirilebilir ve boyutlandırılabilir.",
      feature_privacy_title: "🔒 %100 gizli",
      feature_privacy_desc: "Bulut yok, hesap yok, takip yok — fotoğrafların ve videoların asla cihazından çıkmaz.",
      feature_whysnoxi_title: "🛡️ Neden Snoxi?",
      feature_whysnoxi_desc: "Yapay zekâ araçları harika, ama fotoğrafların genelde başkasının sunucusunda son buluyor. Hiçbir şeyin yüklenmediğinden emin olmak istiyorsan Snoxi daha basit ve uygun fiyatlı bir seçenek.",
      badge_nosub: "♾️ Abonelik yok — bir kez satın al, sonsuza kadar kullan.",
      privacy_note_html: "<strong>Her şey sende kalır.</strong> Snoxi, fotoğrafları ve videoları tamamen cihazında işler — hesap yok, yükleme yok, takip yok. Ayrıntılar için <a href=\"privacy.html\" style=\"color:var(--accent)\">gizlilik politikasına</a> göz at.",
      sysreq_note_html: "<strong>Sistem gereksinimleri:</strong> iOS 15.1+ veya Android 8.0+. Tüm ayrıntıları ve adım adım rehberi <a href=\"anleitung.html\" style=\"color:var(--accent)\">kullanım kılavuzunda</a> bulabilirsin.",
      footer_copyright: "© 2026 Massimo — Snoxi",
      footer_link_guide: "Kılavuz",
      footer_link_privacy: "Gizlilik Politikası",
      footer_link_impressum: "Yasal Bilgiler",
      footer_link_contact: "Destek"
    },
    guide: {
      title: "Kullanım Kılavuzu — Snoxi",
      description: "Snoxi nasıl çalışır: fotoğraf ve video içe aktarma veya çekme, filtre, filigran, çıkartma uygulama, yüz bulanıklaştırma ve dışa aktarma.",
      back: "Snoxi'ye dön",
      h1: "Kullanım Kılavuzu",
      tagline: "Snoxi ile fotoğraf ve videoları nasıl düzenlersin — adım adım.",
      req_title: "Sistem Gereksinimleri",
      req_ios_html: "<strong>iOS:</strong> iOS 15.1 veya üzeri (iPhone)",
      req_android_html: "<strong>Android:</strong> Android 8.0 (Oreo) veya üzeri",
      step1_title: "Fotoğraf veya video seç",
      step1_body: "Ana ekranda galerinden mevcut bir fotoğraf veya video içe aktar — ya da kamera simgesine dokunarak doğrudan yeni bir tane çek (bkz. Adım 7).",
      step2_title: "Filtre uygula",
      step2_body: "Fotoğraf veya video üzerinde canlı olarak gösterilen birkaç atmosfer ön ayarından birini seç. \"Orijinal\"a dokunmak filtreyi tekrar kaldırır.",
      step3_title: "Kırpma",
      step3_body: "Orijinal, 1:1 (kare), 4:5 (dikey) ve 16:9 (geniş ekran) arasından seç.",
      step4_title: "Filigran ekle",
      step4_intro: "Kendi metnini gir ve görsel üzerinde serbestçe yerleştir. Ayarlanabilenler:",
      step4_li1: "5 yazı tipi",
      step4_li2: "5 renk",
      step4_li3: "Boyut (köşelerden sürükleyerek)",
      step4_li4: "Saydamlık",
      step4_note: "Ayarların hatırlanır ve bir sonraki sefer otomatik olarak önerilir.",
      step5_title: "Çıkartma yerleştir",
      step5_body: "İstediğin herhangi bir emojiyi seç, görsel üzerinde serbestçe taşı ve boyutunu ayarla. Aynı anda birden fazla çıkartma kullanmak mümkündür.",
      step6_title: "Yüzü bulanıklaştır",
      step6_pro: "yalnızca fotoğraflar",
      step6_body: "Bir yüzün (veya herhangi bir alanın) üzerine bulanıklaştırma dairesi yerleştir, tanınmaz hale getirmek için taşı ve ölçeklendir.",
      step7_title: "Doğrudan kamerayla çek",
      step7_body: "Kamera simgesine dokununca önce bir kurulum ekranı açılır: burada emojileri ve filigranları önceden seçip yerleştirebilirsin. \"Kameraya devam et\" ile canlı görünüm başlar; burada çıkartmalar ve filigranlar önizlemede zaten görünür. Fotoğraf veya video çek — ardından doğrudan düzenlemeye geçersin (Adım 2-6).",
      step8_title: "Kaydet ve paylaş",
      step8_body: "Tamamlanan fotoğrafı veya videoyu orijinal çözünürlükte galeriye kaydet ya da doğrudan uygulamadan paylaş. Tüm filtreler, filigranlar ve çıkartmalar bu sırada görsel veya videonun içine kalıcı olarak işlenir.",
      pro_title: "PRO özellikleri hakkında",
      pro_li1_html: "Snoxi tek seferlik bir satın almadır (5,99&nbsp;€) — abonelik yok, gizli ücret yok.",
      pro_li2: "Satın alma sonrasında, filigran kısıtlaması olmadan kaydetme ve paylaşma dahil tüm özellikler kalıcı olarak açılır.",
      pro_li3: "🔒 %100 çevrimdışı: Fotoğrafların ve videoların her zaman cihazında kalır.",
      footer_copyright: "© 2026 Massimo — Snoxi",
      footer_link_home: "Ana Sayfa",
      footer_link_privacy: "Gizlilik Politikası",
      footer_link_impressum: "Yasal Bilgiler",
      footer_link_contact: "Destek"
    },
    privacy: {
      title: "Gizlilik Politikası — Snoxi",
      back: "Geri",
      h1: "Gizlilik Politikası – Snoxi",
      stand: "Son güncelleme: Ağustos 2026",
      h2_1: "1. Veri Sorumlusu",
      p1: "Massimo",
      h2_2: "2. Snoxi ne hakkında",
      p2: "Snoxi, fotoğraf ve video düzenlemeye yönelik bir uygulamadır (filtreler, kırpma, çıkartmalar, filigranlar, yüz bulanıklaştırma, canlı önizlemeli kamera çekimi). Tüm düzenlemeler yalnızca cihazında gerçekleşir. Hiçbir fotoğraf, video veya başka bir içerik bize ya da üçüncü taraflara aktarılmaz.",
      h2_3: "3. Erişim izinleri ve neden ihtiyacımız var",
      li3_1: "Fotoğraf kitaplığı (okuma): düzenlemek istediğin bir fotoğraf veya video seçmek için.",
      li3_2: "Kamera ve mikrofon: uygulama içinde doğrudan fotoğraf ve video (sesli) çekmek için.",
      li3_3: "Fotoğraf kitaplığı (yazma/kaydetme): düzenlenmiş sonucu kitaplığına kaydetmek için.",
      p3_2: "Bu izinler yalnızca cihazında kullanılır. Fotoğrafların, videoların veya kamera/mikrofon verilerin hiçbir zaman bir sunucuya yüklenmez.",
      h2_4: "4. Kişisel veri toplanmaz",
      p4: "Snoxi kullanıcı hesabı, takip veya analiz/reklam SDK'ları kullanmaz. Cihaz kimlikleri, konum verileri veya kullanım istatistikleri toplanmaz, saklanmaz veya aktarılmaz. Uygulama, arayüzü buna göre göstermek için cihazının dilini otomatik olarak algılar — bu tamamen yerel olarak, veri aktarımı olmadan gerçekleşir.",
      h2_5: "5. Uygulama içi satın almalar",
      p5: "Premium açma özelliği (\"Snoxi Pro\"), tek seferlik bir uygulama içi satın almadır. Tüm ödeme süreci, ek bir üçüncü taraf hizmeti olmadan App Store (Apple) veya Google Play üzerinden yürütülür. Kredi kartı bilgileri gibi ödeme verilerini hiçbir zaman almayız — bunlar tamamen Apple veya Google'da kalır.",
      h2_6: "6. Çocuklar",
      p6: "Snoxi, özellikle 16 yaşın altındaki çocuklara yönelik değildir. Uygulama zaten kişisel veri toplamadığından, çocuklara ait veriler de toplanmaz.",
      h2_7: "7. Haklarınız",
      p7_text: "Snoxi kişisel veri toplamadığı, saklamadığı veya aktarmadığı için, erişim, düzeltme veya silme taleplerinin dayanabileceği herhangi bir veri kaydımız bulunmamaktadır. Sorularınız için bize her zaman bu sayfanın altındaki iletişim seçeneği üzerinden ulaşabilirsiniz.",
      h2_8: "8. Bu politikadaki değişiklikler",
      p8: "Örneğin yeni özellikler eklendiğinde, gerekli görüldüğünde bu gizlilik politikasını güncelleme hakkını saklı tutarız. Güncel sürüm her zaman bu sayfada mevcuttur."
    },
    impressum: {
      title: "Yasal Bilgiler — Snoxi",
      back: "Geri",
      h1: "Yasal Bilgiler",
      h2_1: "§ 5 TMG uyarınca bilgiler",
      p1: "Massimo",
      h2_kontakt: "İletişim",
      h2_verantwortlich: "§ 55 Abs. 2 RStV uyarınca içerikten sorumlu kişi",
      p_verantwortlich: "Massimo",
      h2_hinweis: "Not",
      p_hinweis: "Bu yasal bildirim, bir şahıs (ticari işletme değil) için taslak olarak hazırlanmıştır ve hukuki danışmanlığın yerini tutmaz. Yasal bildirim yükümlülüğü konusunda belirsizlik varsa bir avukat veya eRecht24 gibi bir oluşturucu tarafından kısa bir inceleme yapılması önerilir."
    }
  };

  translations.pl = {
common: {
          lang_label: "Język",
          contact_heading: "Skontaktuj się z nami",
          contact_name_label: "Imię",
          contact_form_email_label: "Twój adres e-mail",
          contact_message_label: "Wiadomość",
          contact_send: "Wyślij",
          contact_success: "Dziękujemy za wiadomość! Odpowiemy najszybciej, jak to możliwe.",
          contact_alt_note: "Możesz się z nami skontaktować również bezpośrednio za pomocą linku e-mail podanego powyżej.",
          contact_email_prefix: "Utwórz e-mail",
          contact_address_note: "Pełne imię i nazwisko oraz adres do doręczeń zostaną podane na żądanie za pośrednictwem poniższego formularza kontaktowego."
        },
    home: {
      title: "Snoxi — Edytor zdjęć i wideo",
      description: "Snoxi: szybki, prosty edytor zdjęć i wideo. Filtry, naklejki, znaki wodne, rozmywanie twarzy i aparat z podglądem na żywo — wszystko lokalnie na Twoim urządzeniu.",
      tagline: "Filtry, naklejki, znaki wodne i rozmywanie twarzy — bardzo prosto, w całości na Twoim urządzeniu.",
      badge_appstore: "🍎 App Store — wkrótce",
      badge_googleplay: "▶ Google Play — wkrótce",
      feature_camera_title: "📷 Aparat",
      feature_camera_desc: "Rób zdjęcia i nagrywaj filmy bezpośrednio w aplikacji — emoji i znaki wodne widoczne już na żywo w podglądzie.",
      feature_filter_title: "🎨 Filtry",
      feature_filter_desc: "Kilka gotowych nastrojów dla zdjęć i filmów.",
      feature_crop_title: "✂️ Przycinanie",
      feature_crop_desc: "Oryginał, 1:1, 4:5, 16:9.",
      feature_sticker_title: "😀 Naklejki",
      feature_sticker_desc: "Dowolnie umieszczaj i zmieniaj rozmiar własnych emoji.",
      feature_watermark_title: "💧 Znak wodny",
      feature_watermark_desc: "Własny tekst, 5 czcionek, 5 kolorów, dowolnie regulowany rozmiar i przezroczystość.",
      feature_face_title: "🙈 Rozmycie twarzy",
      feature_face_desc: "Prawdziwe rozmycie zamiast paska cenzury — dowolnie umieszczane i skalowane.",
      feature_privacy_title: "🔒 100% prywatności",
      feature_privacy_desc: "Bez chmury, bez konta, bez śledzenia — Twoje zdjęcia i filmy nigdy nie opuszczają Twojego urządzenia.",
      feature_whysnoxi_title: "🛡️ Dlaczego Snoxi?",
      feature_whysnoxi_desc: "Narzędzia AI są świetne, ale Twoje zdjęcia często trafiają na cudzy serwer. Jeśli chcesz mieć pewność, że nic nie zostanie przesłane, Snoxi to prostsza i tańsza opcja.",
      badge_nosub: "♾️ Bez subskrypcji — kup raz, korzystaj na zawsze.",
      privacy_note_html: "<strong>Wszystko zostaje u Ciebie.</strong> Snoxi przetwarza zdjęcia i filmy wyłącznie lokalnie na Twoim urządzeniu — bez konta, bez przesyłania danych, bez śledzenia. Więcej informacji w <a href=\"privacy.html\" style=\"color:var(--accent)\">polityce prywatności</a>.",
      sysreq_note_html: "<strong>Wymagania systemowe:</strong> iOS 15.1+ lub Android 8.0+. Wszystkie szczegóły oraz instrukcję krok po kroku znajdziesz w <a href=\"anleitung.html\" style=\"color:var(--accent)\">instrukcji obsługi</a>.",
      footer_copyright: "© 2026 Massimo — Snoxi",
      footer_link_guide: "Instrukcja",
      footer_link_privacy: "Polityka prywatności",
      footer_link_impressum: "Nota prawna",
      footer_link_contact: "Wsparcie"
    },
    guide: {
      title: "Instrukcja obsługi — Snoxi",
      description: "Jak działa Snoxi: importowanie lub robienie zdjęć i filmów, filtry, znaki wodne, naklejki, rozmywanie twarzy i eksport.",
      back: "Powrót do Snoxi",
      h1: "Instrukcja obsługi",
      tagline: "Jak edytować zdjęcia i filmy w Snoxi — krok po kroku.",
      req_title: "Wymagania systemowe",
      req_ios_html: "<strong>iOS:</strong> iOS 15.1 lub nowszy (iPhone)",
      req_android_html: "<strong>Android:</strong> Android 8.0 (Oreo) lub nowszy",
      step1_title: "Wybierz zdjęcie lub film",
      step1_body: "Na ekranie głównym zaimportuj istniejące zdjęcie lub film z galerii — albo dotknij ikony aparatu, aby od razu nagrać nowy (patrz krok 7).",
      step2_title: "Zastosuj filtr",
      step2_body: "Wybierz spośród kilku gotowych nastrojów, wyświetlanych na żywo na zdjęciu lub filmie. Dotknięcie „Oryginał” ponownie usuwa filtr.",
      step3_title: "Przycinanie",
      step3_body: "Wybierz spośród: Oryginał, 1:1 (kwadrat), 4:5 (pionowy) i 16:9 (panoramiczny).",
      step4_title: "Dodaj znak wodny",
      step4_intro: "Wpisz własny tekst i umieść go dowolnie na obrazie. Możesz dostosować:",
      step4_li1: "5 czcionek",
      step4_li2: "5 kolorów",
      step4_li3: "Rozmiar (przeciągając za rogi)",
      step4_li4: "Przezroczystość",
      step4_note: "Ustawienia są zapamiętywane i automatycznie proponowane następnym razem.",
      step5_title: "Umieszczanie naklejek",
      step5_body: "Wybierz dowolne emoji, dowolnie przesuwaj je na obrazie i zmieniaj rozmiar. Możliwe jest użycie wielu naklejek jednocześnie.",
      step6_title: "Rozmyj twarz",
      step6_pro: "tylko zdjęcia",
      step6_body: "Umieść okrąg rozmycia na twarzy (lub dowolnym obszarze), przesuń go i przeskaluj, aby stał się nierozpoznawalny.",
      step7_title: "Nagrywaj bezpośrednio aparatem",
      step7_body: "Po dotknięciu ikony aparatu najpierw otwiera się ekran konfiguracji: tam możesz z góry wybrać i umieścić emoji oraz znaki wodne. Przycisk „Dalej do aparatu” uruchamia widok na żywo, w którym naklejki i znaki wodne są już widoczne w podglądzie. Zrób zdjęcie lub nagraj film — następnie przejdziesz od razu do edycji (kroki 2–6).",
      step8_title: "Zapisz i udostępnij",
      step8_body: "Zapisz gotowe zdjęcie lub film w oryginalnej rozdzielczości w galerii lub udostępnij bezpośrednio z aplikacji. Wszystkie filtry, znaki wodne i naklejki zostają trwale wypalone w obrazie lub filmie.",
      pro_title: "O funkcjach PRO",
      pro_li1_html: "Snoxi to jednorazowy zakup (5,99&nbsp;€) — bez subskrypcji, bez ukrytych kosztów.",
      pro_li2: "Po zakupie wszystkie funkcje zostają odblokowane na stałe, w tym zapisywanie i udostępnianie bez ograniczenia znaku wodnego.",
      pro_li3: "🔒 100% offline: Twoje zdjęcia i filmy zawsze pozostają na Twoim urządzeniu.",
      footer_copyright: "© 2026 Massimo — Snoxi",
      footer_link_home: "Start",
      footer_link_privacy: "Polityka prywatności",
      footer_link_impressum: "Nota prawna",
      footer_link_contact: "Wsparcie"
    },
    privacy: {
      title: "Polityka prywatności — Snoxi",
      back: "Wstecz",
      h1: "Polityka prywatności – Snoxi",
      stand: "Ostatnia aktualizacja: sierpień 2026",
      h2_1: "1. Administrator danych",
      p1: "Massimo",
      h2_2: "2. Czym jest Snoxi",
      p2: "Snoxi to aplikacja do edycji zdjęć i filmów (filtry, przycinanie, naklejki, znaki wodne, rozmywanie twarzy, nagrywanie aparatem z podglądem na żywo). Wszystkie edycje odbywają się wyłącznie lokalnie na Twoim urządzeniu. Żadne zdjęcia, filmy ani inne treści nie są przesyłane do nas ani do osób trzecich.",
      h2_3: "3. Uprawnienia dostępu i dlaczego ich potrzebujemy",
      li3_1: "Biblioteka zdjęć (odczyt): aby wybrać zdjęcie lub film, który chcesz edytować.",
      li3_2: "Aparat i mikrofon: aby nagrywać zdjęcia i filmy (z dźwiękiem) bezpośrednio w aplikacji.",
      li3_3: "Biblioteka zdjęć (zapis): aby zapisać edytowany wynik w Twojej bibliotece.",
      p3_2: "Uprawnienia te są wykorzystywane wyłącznie lokalnie na Twoim urządzeniu. W żadnym momencie Twoje zdjęcia, filmy ani dane z aparatu/mikrofonu nie są przesyłane na serwer.",
      h2_4: "4. Brak zbierania danych osobowych",
      p4: "Snoxi nie korzysta z konta użytkownika, śledzenia ani SDK analitycznych czy reklamowych. Nie są zbierane, przechowywane ani przesyłane identyfikatory urządzenia, dane lokalizacyjne ani statystyki użytkowania. Aplikacja automatycznie rozpoznaje język Twojego urządzenia, aby odpowiednio wyświetlić interfejs — odbywa się to całkowicie lokalnie, bez przesyłania danych.",
      h2_5: "5. Zakupy w aplikacji",
      p5: "Odblokowanie wersji premium (\"Snoxi Pro\") to jednorazowy zakup w aplikacji. Cały proces płatności przebiega za pośrednictwem App Store (Apple) lub Google Play, bez dodatkowej usługi zewnętrznej. Nigdy nie otrzymujemy danych płatniczych, takich jak informacje o karcie kredytowej — pozostają one w całości u Apple lub Google.",
      h2_6: "6. Dzieci",
      p6: "Snoxi nie jest skierowana specjalnie do dzieci poniżej 16 roku życia. Ponieważ aplikacja i tak nie zbiera danych osobowych, nie są zbierane również żadne dane dzieci.",
      h2_7: "7. Twoje prawa",
      p7_text: "Ponieważ Snoxi nie zbiera, nie przechowuje ani nie przesyła danych osobowych, nie posiadamy żadnych zbiorów danych, do których mogłyby odnosić się żądania dostępu, sprostowania lub usunięcia. W razie pytań możesz się z nami skontaktować w dowolnym momencie za pośrednictwem opcji kontaktu na końcu tej strony.",
      h2_8: "8. Zmiany niniejszej polityki",
      p8: "Zastrzegamy sobie prawo do dostosowania niniejszej polityki prywatności w razie potrzeby, na przykład przy dodawaniu nowych funkcji. Aktualna wersja jest zawsze dostępna na tej stronie."
    },
    impressum: {
      title: "Nota prawna — Snoxi",
      back: "Wstecz",
      h1: "Nota prawna",
      h2_1: "Informacje zgodnie z § 5 TMG",
      p1: "Massimo",
      h2_kontakt: "Kontakt",
      h2_verantwortlich: "Odpowiedzialny za treść zgodnie z § 55 ust. 2 RStV",
      p_verantwortlich: "Massimo",
      h2_hinweis: "Uwaga",
      p_hinweis: "Niniejsza nota prawna została sporządzona jako projekt dla osoby prywatnej (bez działalności gospodarczej) i nie zastępuje porady prawnej. W razie wątpliwości co do obowiązku publikacji noty prawnej zaleca się krótką weryfikację przez prawnika lub generator taki jak eRecht24."
    }
  };

  translations.ru = {
common: {
          lang_label: "Язык",
          contact_heading: "Связаться с нами",
          contact_name_label: "Имя",
          contact_form_email_label: "Ваш адрес электронной почты",
          contact_message_label: "Сообщение",
          contact_send: "Отправить",
          contact_success: "Спасибо за ваше сообщение! Мы ответим вам как можно скорее.",
          contact_alt_note: "Вы также можете связаться с нами напрямую по ссылке электронной почты выше.",
          contact_email_prefix: "Написать письмо",
          contact_address_note: "Полное имя и почтовый адрес для вручения корреспонденции будут предоставлены по запросу через контактную форму ниже."
        },
    home: {
      title: "Snoxi — Фото- и видеоредактор",
      description: "Snoxi: быстрый, простой фото- и видеоредактор. Фильтры, стикеры, водяные знаки, размытие лиц и камера с живым предпросмотром — всё локально на вашем устройстве.",
      tagline: "Фильтры, стикеры, водяные знаки и размытие лиц — просто и полностью на вашем устройстве.",
      badge_appstore: "🍎 App Store — скоро",
      badge_googleplay: "▶ Google Play — скоро",
      feature_camera_title: "📷 Камера",
      feature_camera_desc: "Снимайте фото и видео прямо в приложении — эмодзи и водяные знаки уже видны в живом предпросмотре.",
      feature_filter_title: "🎨 Фильтры",
      feature_filter_desc: "Несколько готовых настроений для фото и видео.",
      feature_crop_title: "✂️ Обрезка",
      feature_crop_desc: "Оригинал, 1:1, 4:5, 16:9.",
      feature_sticker_title: "😀 Стикеры",
      feature_sticker_desc: "Свободно размещайте собственные эмодзи и меняйте их размер.",
      feature_watermark_title: "💧 Водяной знак",
      feature_watermark_desc: "Свой текст, 5 шрифтов, 5 цветов, свободно настраиваемые размер и прозрачность.",
      feature_face_title: "🙈 Размытие лица",
      feature_face_desc: "Настоящее размытие вместо цензурной полосы — свободно перемещается и масштабируется.",
      feature_privacy_title: "🔒 100% приватность",
      feature_privacy_desc: "Без облака, без аккаунта, без слежения — ваши фото и видео никогда не покидают устройство.",
      feature_whysnoxi_title: "🛡️ Почему Snoxi?",
      feature_whysnoxi_desc: "Инструменты на основе ИИ отличные, но ваши фото часто попадают на чужой сервер. Если вы хотите быть уверены, что ничего не загружается, Snoxi — более простой и доступный вариант.",
      badge_nosub: "♾️ Без подписки — купите один раз, пользуйтесь всегда.",
      privacy_note_html: "<strong>Всё остаётся у вас.</strong> Snoxi обрабатывает фото и видео полностью локально на вашем устройстве — без аккаунта, без загрузки на сервер, без слежения. Подробнее в <a href=\"privacy.html\" style=\"color:var(--accent)\">политике конфиденциальности</a>.",
      sysreq_note_html: "<strong>Системные требования:</strong> iOS 15.1+ или Android 8.0+. Все подробности и пошаговое руководство вы найдёте в <a href=\"anleitung.html\" style=\"color:var(--accent)\">инструкции по использованию</a>.",
      footer_copyright: "© 2026 Massimo — Snoxi",
      footer_link_guide: "Инструкция",
      footer_link_privacy: "Политика конфиденциальности",
      footer_link_impressum: "Выходные данные",
      footer_link_contact: "Поддержка"
    },
    guide: {
      title: "Инструкция по использованию — Snoxi",
      description: "Как работает Snoxi: импорт или съёмка фото и видео, применение фильтров, водяных знаков, стикеров, размытие лиц и экспорт.",
      back: "Назад к Snoxi",
      h1: "Инструкция по использованию",
      tagline: "Как редактировать фото и видео в Snoxi — шаг за шагом.",
      req_title: "Системные требования",
      req_ios_html: "<strong>iOS:</strong> iOS 15.1 или новее (iPhone)",
      req_android_html: "<strong>Android:</strong> Android 8.0 (Oreo) или новее",
      step1_title: "Выбор фото или видео",
      step1_body: "На главном экране импортируйте имеющееся фото или видео из галереи — или нажмите на значок камеры, чтобы сразу снять новое (см. шаг 7).",
      step2_title: "Применение фильтра",
      step2_body: "Выберите один из нескольких готовых настроений, которые отображаются в реальном времени на фото или видео. Нажатие на «Оригинал» снова убирает фильтр.",
      step3_title: "Обрезка",
      step3_body: "Выберите между Оригинал, 1:1 (квадрат), 4:5 (портрет) и 16:9 (широкий формат).",
      step4_title: "Добавление водяного знака",
      step4_intro: "Введите свой текст и свободно разместите его на изображении. Можно настроить:",
      step4_li1: "5 шрифтов",
      step4_li2: "5 цветов",
      step4_li3: "Размер (перетаскиванием за углы)",
      step4_li4: "Прозрачность",
      step4_note: "Настройки запоминаются и автоматически предлагаются в следующий раз.",
      step5_title: "Размещение стикеров",
      step5_body: "Выберите любой эмодзи, свободно перемещайте его по изображению и меняйте размер. Можно разместить несколько стикеров одновременно.",
      step6_title: "Размытие лица",
      step6_pro: "только фото",
      step6_body: "Поместите круг размытия на лицо (или любую другую область), переместите и масштабируйте его, чтобы сделать неузнаваемым.",
      step7_title: "Съёмка прямо с камеры",
      step7_body: "При нажатии на значок камеры сначала открывается экран настройки: там можно заранее выбрать и разместить эмодзи и водяные знаки. Кнопка «Перейти к камере» запускает живой просмотр, в котором стикеры и водяные знаки уже видны в предпросмотре. Сделайте фото или видео — после этого вы сразу переходите к редактированию (шаги 2–6).",
      step8_title: "Сохранение и отправка",
      step8_body: "Сохраните готовое фото или видео в оригинальном разрешении в галерею или отправьте прямо из приложения. Все фильтры, водяные знаки и стикеры при этом навсегда впечатываются в изображение или видео.",
      pro_title: "О функциях PRO",
      pro_li1_html: "Snoxi — это разовая покупка (5,99&nbsp;€) — без подписки, без скрытых платежей.",
      pro_li2: "После покупки все функции разблокируются навсегда, включая сохранение и отправку без ограничения по водяному знаку.",
      pro_li3: "🔒 100% офлайн: ваши фото и видео всегда остаются на вашем устройстве.",
      footer_copyright: "© 2026 Massimo — Snoxi",
      footer_link_home: "Главная",
      footer_link_privacy: "Политика конфиденциальности",
      footer_link_impressum: "Выходные данные",
      footer_link_contact: "Поддержка"
    },
    privacy: {
      title: "Политика конфиденциальности — Snoxi",
      back: "Назад",
      h1: "Политика конфиденциальности – Snoxi",
      stand: "Последнее обновление: август 2026",
      h2_1: "1. Ответственное лицо",
      p1: "Massimo",
      h2_2: "2. О чём Snoxi",
      p2: "Snoxi — приложение для редактирования фото и видео (фильтры, обрезка, стикеры, водяные знаки, размытие лиц, съёмка с камеры с живым предпросмотром). Все правки происходят исключительно локально на вашем устройстве. Никакие фото, видео или другой контент не передаются нам или третьим лицам.",
      h2_3: "3. Разрешения на доступ и зачем они нам нужны",
      li3_1: "Фототека (чтение): для выбора фото или видео, которое вы хотите отредактировать.",
      li3_2: "Камера и микрофон: для съёмки фото и видео (со звуком) прямо в приложении.",
      li3_3: "Фототека (запись/сохранение): для сохранения отредактированного результата в вашей фототеке.",
      p3_2: "Эти разрешения используются исключительно локально на вашем устройстве. Ваши фото, видео или данные камеры/микрофона ни в какой момент не загружаются на сервер.",
      h2_4: "4. Сбор персональных данных не производится",
      p4: "Snoxi не использует учётную запись пользователя, не отслеживает вас и не использует аналитические или рекламные SDK. Идентификаторы устройства, данные о местоположении или статистика использования не собираются, не хранятся и не передаются. Приложение автоматически определяет язык вашего устройства для соответствующего отображения интерфейса — это происходит полностью локально, без передачи данных.",
      h2_5: "5. Покупки в приложении",
      p5: "Разблокировка премиум-версии («Snoxi Pro») — это разовая покупка внутри приложения. Весь процесс оплаты проходит через App Store (Apple) или Google Play, без дополнительных сторонних сервисов. Мы никогда не получаем платёжные данные, такие как информация о банковской карте — они полностью остаются у Apple или Google.",
      h2_6: "6. Дети",
      p6: "Snoxi не ориентировано специально на детей младше 16 лет. Поскольку приложение в принципе не собирает персональные данные, данные детей также не собираются.",
      h2_7: "7. Ваши права",
      p7_text: "Поскольку Snoxi не собирает, не хранит и не передаёт персональные данные, у нас отсутствуют какие-либо базы данных, к которым могли бы относиться запросы на доступ, исправление или удаление. По любым вопросам вы можете связаться с нами в любое время через контактные данные в конце этой страницы.",
      h2_8: "8. Изменения настоящей политики",
      p8: "Мы оставляем за собой право адаптировать настоящую политику конфиденциальности при необходимости, например при добавлении новых функций. Актуальная версия всегда доступна на этой странице."
    },
    impressum: {
      title: "Выходные данные — Snoxi",
      back: "Назад",
      h1: "Выходные данные",
      h2_1: "Сведения согласно § 5 TMG",
      p1: "Massimo",
      h2_kontakt: "Контакты",
      h2_verantwortlich: "Ответственный за содержание согласно § 55 абз. 2 RStV",
      p_verantwortlich: "Massimo",
      h2_hinweis: "Примечание",
      p_hinweis: "Эти выходные данные составлены как черновик для частного лица (не для коммерческой деятельности) и не заменяют юридическую консультацию. При наличии сомнений относительно обязательности выходных данных рекомендуется краткая проверка юристом или таким генератором, как eRecht24."
    }
  };

  translations.ja = {
common: {
          lang_label: "言語",
          contact_heading: "お問い合わせ",
          contact_name_label: "お名前",
          contact_form_email_label: "あなたのメールアドレス",
          contact_message_label: "メッセージ",
          contact_send: "送信",
          contact_success: "メッセージをお送りいただきありがとうございます。できるだけ早くご返信いたします。",
          contact_alt_note: "上記のメールリンクから直接ご連絡いただくことも可能です。",
          contact_email_prefix: "メールを作成",
          contact_address_note: "氏名の詳細および送達可能な住所については、下記のお問い合わせフォームからご請求いただければお伝えします。"
        },
    home: {
      title: "Snoxi — 写真・動画エディター",
      description: "Snoxi：すばやく手軽に使える写真・動画エディター。フィルター、ステッカー、透かし、顔のぼかし、ライブプレビュー付きカメラ — すべて端末内で完結。",
      tagline: "フィルター、ステッカー、透かし、顔のぼかしを、シンプルに、すべて端末内で。",
      badge_appstore: "🍎 App Store — 近日公開",
      badge_googleplay: "▶ Google Play — 近日公開",
      feature_camera_title: "📷 カメラ",
      feature_camera_desc: "アプリ内で直接写真・動画を撮影 — 絵文字や透かしもライブプレビューにすぐ反映。",
      feature_filter_title: "🎨 フィルター",
      feature_filter_desc: "写真・動画向けの複数のムードプリセット。",
      feature_crop_title: "✂️ トリミング",
      feature_crop_desc: "オリジナル、1:1、4:5、16:9。",
      feature_sticker_title: "😀 ステッカー",
      feature_sticker_desc: "好きな絵文字を自由に配置してサイズを調整。",
      feature_watermark_title: "💧 透かし",
      feature_watermark_desc: "自由なテキスト、5種類のフォント、5色、サイズと透明度を自由に調整。",
      feature_face_title: "🙈 顔のぼかし",
      feature_face_desc: "モザイクではなく本物のぼかし処理。自由に配置・拡大縮小可能。",
      feature_privacy_title: "🔒 完全プライベート",
      feature_privacy_desc: "クラウドなし、アカウント不要、トラッキングなし — 写真や動画が端末の外に出ることはありません。",
      feature_whysnoxi_title: "🛡️ Snoxiを選ぶ理由",
      feature_whysnoxi_desc: "AIツールは素晴らしいですが、写真は他人のサーバーに送られることが多いです。何もアップロードされないことを確実にしたいなら、Snoxiがよりシンプルで手頃な選択肢です。",
      badge_nosub: "♾️ サブスクなし — 一度購入すればずっと使える。",
      privacy_note_html: "<strong>すべてあなたの手元に。</strong> Snoxiは写真や動画をすべて端末内で処理します — アカウント登録不要、アップロードなし、トラッキングなし。詳しくは<a href=\"privacy.html\" style=\"color:var(--accent)\">プライバシーポリシー</a>をご覧ください。",
      sysreq_note_html: "<strong>動作環境：</strong> iOS 15.1以降、またはAndroid 8.0以降。詳細とステップバイステップガイドは<a href=\"anleitung.html\" style=\"color:var(--accent)\">使い方ガイド</a>をご覧ください。",
      footer_copyright: "© 2026 Massimo — Snoxi",
      footer_link_guide: "使い方",
      footer_link_privacy: "プライバシーポリシー",
      footer_link_impressum: "運営者情報",
      footer_link_contact: "サポート"
    },
    guide: {
      title: "使い方ガイド — Snoxi",
      description: "Snoxiの使い方：写真・動画のインポートまたは撮影、フィルター、透かし、ステッカーの適用、顔のぼかし、書き出しまで。",
      back: "Snoxiに戻る",
      h1: "使い方ガイド",
      tagline: "Snoxiで写真・動画を編集する方法 — ステップごとに解説。",
      req_title: "動作環境",
      req_ios_html: "<strong>iOS：</strong>iOS 15.1以降（iPhone）",
      req_android_html: "<strong>Android：</strong>Android 8.0（Oreo）以降",
      step1_title: "写真または動画を選ぶ",
      step1_body: "ホーム画面からギャラリー内の既存の写真や動画をインポート、またはカメラアイコンをタップして新しく撮影できます（ステップ7を参照）。",
      step2_title: "フィルターを適用する",
      step2_body: "写真や動画にライブで反映される複数のムードプリセットから選択できます。「オリジナル」をタップするとフィルターが解除されます。",
      step3_title: "トリミング",
      step3_body: "オリジナル、1:1（正方形）、4:5（縦長）、16:9（ワイド）から選択できます。",
      step4_title: "透かしを追加する",
      step4_intro: "自由なテキストを入力し、画像上に自由に配置できます。調整できる項目：",
      step4_li1: "5種類のフォント",
      step4_li2: "5色",
      step4_li3: "サイズ（角をドラッグして調整）",
      step4_li4: "透明度",
      step4_note: "設定内容は記憶され、次回自動的に提案されます。",
      step5_title: "ステッカーを配置する",
      step5_body: "好きな絵文字を選び、画像上で自由に移動・サイズ調整できます。複数のステッカーを同時に配置することも可能です。",
      step6_title: "顔をぼかす",
      step6_pro: "写真のみ",
      step6_body: "顔（または任意の範囲）の上にぼかし円を配置し、移動・拡大縮小して見えなくします。",
      step7_title: "カメラで直接撮影する",
      step7_body: "カメラアイコンをタップすると、まず設定画面が表示されます。ここで絵文字や透かしをあらかじめ選んで配置できます。「カメラに進む」をタップするとライブビューが開始し、ステッカーや透かしがすでにプレビューに表示されます。写真や動画を撮影すると、そのまま編集画面（ステップ2〜6）に進みます。",
      step8_title: "保存＆共有",
      step8_body: "完成した写真や動画を元の解像度でギャラリーに保存するか、アプリから直接共有できます。フィルター、透かし、ステッカーはすべて画像・動画に焼き込まれます。",
      pro_title: "PRO機能について",
      pro_li1_html: "Snoxiは買い切り型（5.99&nbsp;€）です — サブスクリプションなし、隠れた費用なし。",
      pro_li2: "購入後はすべての機能が永続的に解放され、透かし制限のない保存・共有も可能になります。",
      pro_li3: "🔒 完全オフライン：写真や動画は常にあなたの端末内にとどまります。",
      footer_copyright: "© 2026 Massimo — Snoxi",
      footer_link_home: "ホーム",
      footer_link_privacy: "プライバシーポリシー",
      footer_link_impressum: "運営者情報",
      footer_link_contact: "サポート"
    },
    privacy: {
      title: "プライバシーポリシー — Snoxi",
      back: "戻る",
      h1: "プライバシーポリシー – Snoxi",
      stand: "最終更新日：2026年8月",
      h2_1: "1. 管理者",
      p1: "Massimo",
      h2_2: "2. Snoxiについて",
      p2: "Snoxiは写真や動画を編集するアプリです（フィルター、トリミング、ステッカー、透かし、顔のぼかし、ライブプレビュー付きカメラ撮影）。編集はすべて端末内でのみ行われます。写真、動画、その他のコンテンツが当方や第三者に送信されることはありません。",
      h2_3: "3. アクセス許可とその必要性",
      li3_1: "フォトライブラリ（読み取り）：編集したい写真や動画を選択するため。",
      li3_2: "カメラとマイク：アプリ内で直接写真や動画（音声付き）を撮影するため。",
      li3_3: "フォトライブラリ（書き込み／保存）：編集結果をライブラリに保存するため。",
      p3_2: "これらの許可は端末内でのみ使用されます。写真、動画、カメラ・マイクのデータがサーバーにアップロードされることは一切ありません。",
      h2_4: "4. 個人情報の収集なし",
      p4: "Snoxiはユーザーアカウント、トラッキング、分析・広告SDKを一切使用しません。端末識別子、位置情報、利用統計などは収集・保存・送信されません。アプリは端末の言語を自動的に検出してインターフェースに反映しますが、これは完全に端末内で行われ、データ送信は発生しません。",
      h2_5: "5. アプリ内課金",
      p5: "プレミアム機能（「Snoxi Pro」）は買い切り型のアプリ内課金です。決済処理はすべてApp Store（Apple）またはGoogle Playを通じて行われ、追加の第三者サービスは使用されません。クレジットカード情報などの決済データが当方に渡ることは一切なく、すべてAppleまたはGoogleが保持します。",
      h2_6: "6. 子供について",
      p6: "Snoxiは16歳未満の子供を特に対象としたものではありません。アプリはそもそも個人情報を収集しないため、子供のデータも収集されません。",
      h2_7: "7. あなたの権利",
      p7_text: "Snoxiは個人情報を収集・保存・送信しないため、開示・訂正・削除請求の対象となるデータは存在しません。ご質問がある場合は、このページ末尾の連絡先からいつでもご連絡ください。",
      h2_8: "8. 本ポリシーの変更",
      p8: "新機能の追加などに応じて、本プライバシーポリシーを必要に応じて更新する場合があります。最新版は常にこのページでご確認いただけます。"
    },
    impressum: {
      title: "運営者情報 — Snoxi",
      back: "戻る",
      h1: "運営者情報",
      h2_1: "§ 5 TMGに基づく表示",
      p1: "Massimo",
      h2_kontakt: "連絡先",
      h2_verantwortlich: "§ 55 Abs. 2 RStVに基づくコンテンツ責任者",
      p_verantwortlich: "Massimo",
      h2_hinweis: "注記",
      p_hinweis: "この運営者情報は個人（事業者ではない）向けの草案として作成されたものであり、法的助言に代わるものではありません。表示義務について不明な点がある場合は、弁護士またはeRecht24のような生成サービスによる簡単な確認をおすすめします。"
    }
  };

  translations.zh = {
common: {
          lang_label: "语言",
          contact_heading: "联系我们",
          contact_name_label: "姓名",
          contact_form_email_label: "您的电子邮箱",
          contact_message_label: "留言",
          contact_send: "发送",
          contact_success: "感谢您的留言！我们会尽快回复您。",
          contact_alt_note: "您也可以通过上方的邮箱链接直接与我们联系。",
          contact_email_prefix: "创建邮件",
          contact_address_note: "完整姓名及可送达的通信地址将根据下方联系表单的请求提供。"
        },
    home: {
      title: "Snoxi — 照片和视频编辑器",
      description: "Snoxi：快速、简单的照片和视频编辑器。滤镜、贴纸、水印、人脸模糊，以及带实时预览的相机 — 一切都在你的设备本地完成。",
      tagline: "滤镜、贴纸、水印和人脸模糊 — 简单易用，完全在你的设备上完成。",
      badge_appstore: "🍎 App Store — 即将上线",
      badge_googleplay: "▶ Google Play — 即将上线",
      feature_camera_title: "📷 相机",
      feature_camera_desc: "直接在应用内拍摄照片和视频 — 表情符号和水印已在实时预览中显示。",
      feature_filter_title: "🎨 滤镜",
      feature_filter_desc: "为照片和视频提供多种氛围预设。",
      feature_crop_title: "✂️ 裁剪",
      feature_crop_desc: "原图、1:1、4:5、16:9。",
      feature_sticker_title: "😀 贴纸",
      feature_sticker_desc: "自由放置你自己的表情符号并调整大小。",
      feature_watermark_title: "💧 水印",
      feature_watermark_desc: "自定义文字，5种字体，5种颜色，大小和透明度可自由调整。",
      feature_face_title: "🙈 人脸模糊",
      feature_face_desc: "真正的模糊效果，而非马赛克，可自由放置和缩放。",
      feature_privacy_title: "🔒 100% 隐私保护",
      feature_privacy_desc: "无云端、无需账号、无追踪 — 你的照片和视频永远不会离开你的设备。",
      feature_whysnoxi_title: "🛡️ 为什么选择 Snoxi？",
      feature_whysnoxi_desc: "AI 工具很棒，但你的照片通常会上传到别人的服务器。如果你想确保没有任何内容被上传，Snoxi 是更简单、更实惠的选择。",
      badge_nosub: "♾️ 无需订阅 — 一次购买，永久使用。",
      privacy_note_html: "<strong>一切都留在你身边。</strong> Snoxi 完全在你的设备本地处理照片和视频 — 无需账号，不上传，不追踪。更多信息请参阅<a href=\"privacy.html\" style=\"color:var(--accent)\">隐私政策</a>。",
      sysreq_note_html: "<strong>系统要求：</strong>iOS 15.1 及以上，或 Android 8.0 及以上。所有详情及分步指南请参阅<a href=\"anleitung.html\" style=\"color:var(--accent)\">使用说明</a>。",
      footer_copyright: "© 2026 Massimo — Snoxi",
      footer_link_guide: "使用说明",
      footer_link_privacy: "隐私政策",
      footer_link_impressum: "版权信息",
      footer_link_contact: "支持"
    },
    guide: {
      title: "使用说明 — Snoxi",
      description: "Snoxi 使用方法：导入或拍摄照片和视频，应用滤镜、水印、贴纸，进行人脸模糊并导出。",
      back: "返回 Snoxi",
      h1: "使用说明",
      tagline: "如何使用 Snoxi 编辑照片和视频 — 分步讲解。",
      req_title: "系统要求",
      req_ios_html: "<strong>iOS：</strong>iOS 15.1 或更高版本（iPhone）",
      req_android_html: "<strong>Android：</strong>Android 8.0（Oreo）或更高版本",
      step1_title: "选择照片或视频",
      step1_body: "在主屏幕上从相册导入已有的照片或视频 — 或点击相机图标直接拍摄新的内容（参见第7步）。",
      step2_title: "应用滤镜",
      step2_body: "从多种氛围预设中选择，效果会实时显示在照片或视频上。点击“原图”可再次移除滤镜。",
      step3_title: "裁剪",
      step3_body: "可在原图、1:1（正方形）、4:5（竖版）和 16:9（宽屏）之间选择。",
      step4_title: "添加水印",
      step4_intro: "输入你自己的文字，并自由放置在图片上。可调整的内容包括：",
      step4_li1: "5种字体",
      step4_li2: "5种颜色",
      step4_li3: "大小（拖动四角调整）",
      step4_li4: "透明度",
      step4_note: "设置会被记住，下次会自动为你建议。",
      step5_title: "放置贴纸",
      step5_body: "选择任意表情符号，在图片上自由移动并调整大小。支持同时放置多个贴纸。",
      step6_title: "人脸模糊",
      step6_pro: "仅限照片",
      step6_body: "将模糊圆圈覆盖在脸部（或任意区域）上，移动并缩放以使其无法辨认。",
      step7_title: "直接用相机拍摄",
      step7_body: "点击相机图标后，会先打开一个设置界面：你可以在这里预先选择并放置表情符号和水印。点击“继续前往相机”会启动实时视图，此时贴纸和水印已经显示在预览中。拍摄照片或视频后，会直接进入编辑流程（第2至6步）。",
      step8_title: "保存与分享",
      step8_body: "将完成的照片或视频以原始分辨率保存到相册，或直接从应用分享。所有滤镜、水印和贴纸都会永久嵌入到图片或视频中。",
      pro_title: "关于 PRO 功能",
      pro_li1_html: "Snoxi 为一次性购买（5.99&nbsp;欧元）— 无需订阅，没有隐藏费用。",
      pro_li2: "购买后，所有功能将永久解锁，包括不受水印限制的保存与分享。",
      pro_li3: "🔒 100% 离线：你的照片和视频始终保留在你的设备上。",
      footer_copyright: "© 2026 Massimo — Snoxi",
      footer_link_home: "首页",
      footer_link_privacy: "隐私政策",
      footer_link_impressum: "版权信息",
      footer_link_contact: "支持"
    },
    privacy: {
      title: "隐私政策 — Snoxi",
      back: "返回",
      h1: "隐私政策 – Snoxi",
      stand: "更新日期：2026年8月",
      h2_1: "1. 责任方",
      p1: "Massimo",
      h2_2: "2. 关于 Snoxi",
      p2: "Snoxi 是一款用于编辑照片和视频的应用（滤镜、裁剪、贴纸、水印、人脸模糊，以及带实时预览的相机拍摄）。所有编辑操作均仅在你的设备本地完成。我们不会向自己或任何第三方传输任何照片、视频或其他内容。",
      h2_3: "3. 访问权限及其用途",
      li3_1: "照片图库（读取）：用于选择你想要编辑的照片或视频。",
      li3_2: "相机和麦克风：用于直接在应用内拍摄照片和视频（含声音）。",
      li3_3: "照片图库（写入/保存）：用于将编辑结果保存到你的图库中。",
      p3_2: "这些权限仅在你的设备本地使用。你的照片、视频或相机/麦克风数据在任何时候都不会上传到服务器。",
      h2_4: "4. 不收集个人数据",
      p4: "Snoxi 不使用用户账号、不进行追踪，也不使用任何分析或广告 SDK。我们不会收集、存储或传输设备标识符、位置数据或使用统计信息。应用会自动识别你设备的语言以相应显示界面 — 该过程完全在本地完成，不涉及任何数据传输。",
      h2_5: "5. 应用内购买",
      p5: "高级版解锁（\"Snoxi Pro\"）为一次性应用内购买。整个支付流程通过 App Store（Apple）或 Google Play 完成，不涉及其他第三方服务。我们在任何时候都不会获取信用卡等支付信息 — 这些信息完全由 Apple 或 Google 保管。",
      h2_6: "6. 儿童",
      p6: "Snoxi 并非专门面向16岁以下儿童。由于应用本身不收集任何个人数据，因此也不会收集儿童的数据。",
      h2_7: "7. 你的权利",
      p7_text: "由于 Snoxi 不收集、存储或传输个人数据，我们没有任何可供访问、更正或删除请求所依据的数据记录。如有任何疑问，欢迎随时通过本页底部的联系方式与我们联系。",
      h2_8: "8. 本政策的变更",
      p8: "我们保留在必要时（例如新增功能时）调整本隐私政策的权利。最新版本将始终在本页面提供。"
    },
    impressum: {
      title: "版权信息 — Snoxi",
      back: "返回",
      h1: "版权信息",
      h2_1: "根据《德国电信媒体法》第5条（§ 5 TMG）提供的信息",
      p1: "Massimo",
      h2_kontakt: "联系方式",
      h2_verantwortlich: "根据《德国广播州际协议》第55条第2款（§ 55 Abs. 2 RStV）负责内容者",
      p_verantwortlich: "Massimo",
      h2_hinweis: "说明",
      p_hinweis: "本版权信息是为个人（非商业经营者）起草的示例文本，不能替代法律咨询。如对版权信息义务存在疑问，建议咨询律师或使用 eRecht24 等生成工具进行简要核查。"
    }
  };

  window.__SNOXI_I18N__ = { SUPPORTED_LANGUAGES: SUPPORTED_LANGUAGES, LANG_NAMES: LANG_NAMES, translations: translations };

  /* ---------- Apply logic ---------- */

  function detectLanguage() {
    var stored = null;
    try { stored = localStorage.getItem("snoxi_lang"); } catch (e) {}
    if (stored && SUPPORTED_LANGUAGES.indexOf(stored) !== -1) return stored;

    var nav = (navigator.language || navigator.userLanguage || "en").toLowerCase();
    var short = nav.split("-")[0];
    if (SUPPORTED_LANGUAGES.indexOf(short) !== -1) return short;
    return "en";
  }

  function getValue(langData, key) {
    var parts = key.split(".");
    var cur = langData;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function applyTranslations(lang) {
    var langData = translations[lang] || translations.en;
    document.documentElement.lang = lang;

    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute("data-i18n");
      var val = getValue(langData, key);
      if (val === undefined) continue;
      if (el.hasAttribute("data-i18n-html")) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    }

    var metaNodes = document.querySelectorAll("[data-i18n-content]");
    for (var j = 0; j < metaNodes.length; j++) {
      var metaEl = metaNodes[j];
      var metaKey = metaEl.getAttribute("data-i18n-content");
      var metaVal = getValue(langData, metaKey);
      if (metaVal !== undefined) metaEl.setAttribute("content", metaVal);
    }

    var sel = document.getElementById("snoxi-lang-select");
    if (sel && sel.value !== lang) sel.value = lang;
  }

  function setLanguage(lang) {
    if (SUPPORTED_LANGUAGES.indexOf(lang) === -1) lang = "en";
    try { localStorage.setItem("snoxi_lang", lang); } catch (e) {}
    applyTranslations(lang);
  }

  /* ---------- Language switcher UI ---------- */

  function injectSwitcherStyles() {
    if (document.getElementById("snoxi-lang-switcher-style")) return;
    var style = document.createElement("style");
    style.id = "snoxi-lang-switcher-style";
    style.textContent =
      ".snoxi-lang-switcher-wrap{position:fixed;top:14px;right:14px;z-index:1000;}" +
      ".snoxi-lang-select{appearance:none;-webkit-appearance:none;background:var(--panel,#141c33);" +
      "border:1px solid var(--border,rgba(255,255,255,0.08));color:var(--muted,#9aa3c0);" +
      "font-family:inherit;font-size:13px;font-weight:600;padding:8px 30px 8px 12px;border-radius:10px;" +
      "cursor:pointer;outline:none;background-image:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6'><path d='M0 0l5 6 5-6z' fill='%239aa3c0'/></svg>\");" +
      "background-repeat:no-repeat;background-position:right 12px center;}" +
      ".snoxi-lang-select:hover,.snoxi-lang-select:focus{color:var(--text,#f5f7fa);border-color:var(--accent,#3aa8ff);}" +
      ".snoxi-lang-select option{background:var(--panel,#141c33);color:var(--text,#f5f7fa);}" +
      "@media (max-width:480px){.snoxi-lang-switcher-wrap{top:10px;right:10px;}.snoxi-lang-select{font-size:12px;padding:6px 26px 6px 10px;}}";
    document.head.appendChild(style);
  }

  function injectSwitcher(currentLang) {
    if (document.getElementById("snoxi-lang-select")) return;
    injectSwitcherStyles();

    var wrap = document.createElement("div");
    wrap.className = "snoxi-lang-switcher-wrap";

    var select = document.createElement("select");
    select.id = "snoxi-lang-select";
    select.className = "snoxi-lang-select";
    var labelKey = (translations[currentLang] && translations[currentLang].common && translations[currentLang].common.lang_label) || "Language";
    select.setAttribute("aria-label", labelKey);

    for (var i = 0; i < SUPPORTED_LANGUAGES.length; i++) {
      var code = SUPPORTED_LANGUAGES[i];
      var opt = document.createElement("option");
      opt.value = code;
      opt.textContent = LANG_NAMES[code] || code;
      if (code === currentLang) opt.selected = true;
      select.appendChild(opt);
    }

    select.addEventListener("change", function () {
      setLanguage(select.value);
    });

    wrap.appendChild(select);
    document.body.appendChild(wrap);
  }

  function init() {
    var lang = detectLanguage();
    applyTranslations(lang);
    injectSwitcher(lang);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }


  /* ---------- Contact block (mail slot + FormSubmit.co contact form) ---------- */

  function currentLangData() {
    var lang = detectLanguage();
    return translations[lang] || translations.en;
  }

  function injectContactStyles() {
    if (document.getElementById("snoxi-contact-style")) return;
    var style = document.createElement("style");
    style.id = "snoxi-contact-style";
    style.textContent =
      ".snoxi-contact-panel{background:var(--panel,#141c33);border:1px solid var(--border,rgba(255,255,255,.08));border-radius:16px;padding:20px 24px;margin:32px 0;}" +
      ".snoxi-contact-panel h3{margin:0 0 12px;font-size:16px;color:var(--text,#f5f7fa);}" +
      ".snoxi-contact-email-line{margin:0 0 16px;font-size:14px;color:var(--muted,#9aa3c0);}" +
      ".snoxi-contact-email-line a{color:var(--accent,#3aa8ff);}" +
      ".snoxi-contact-success{background:rgba(58,168,255,.12);border:1px solid rgba(58,168,255,.3);color:var(--accent,#3aa8ff);border-radius:10px;padding:12px 16px;margin-bottom:16px;font-size:14px;}" +
      ".snoxi-contact-form{display:flex;flex-direction:column;gap:12px;}" +
      ".snoxi-contact-form label{font-size:13px;color:var(--muted,#9aa3c0);font-weight:600;display:flex;flex-direction:column;gap:6px;}" +
      ".snoxi-contact-form input,.snoxi-contact-form textarea{background:var(--bg,#0c1224);border:1px solid var(--border,rgba(255,255,255,.08));border-radius:10px;padding:10px 12px;color:var(--text,#f5f7fa);font-family:inherit;font-size:14px;}" +
      ".snoxi-contact-form textarea{min-height:100px;resize:vertical;}" +
      ".snoxi-contact-form button{align-self:flex-start;background:var(--accent,#3aa8ff);color:#06223d;border:none;border-radius:10px;padding:10px 22px;font-weight:700;font-size:14px;cursor:pointer;}" +
      ".snoxi-contact-note{margin:14px 0 0;font-size:13px;color:var(--muted,#9aa3c0);}" +
      ".snoxi-contact-honey{position:absolute;left:-9999px;}";
    document.head.appendChild(style);
  }

  function buildEmailLine() {
    var c = currentLangData().common || {};
    var line = document.createElement("p");
    line.className = "snoxi-contact-email-line";
    // Adresse selbst nicht mehr sichtbar anzeigen (nur noch generischer CTA-Link-Text),
    // um Scraping/Spam zu erschweren – der mailto-Link bleibt funktional.
    var link = document.createElement("a");
    link.href = "mailto:" + CONTACT_EMAIL;
    link.setAttribute("data-i18n", "common.contact_email_prefix");
    link.textContent = c.contact_email_prefix || "Create Email";
    line.appendChild(link);
    return line;
  }

  function renderMailSlot(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    injectContactStyles();
    container.innerHTML = "";
    container.appendChild(buildEmailLine());
    applyTranslations(detectLanguage());
  }

  function contactField(labelKey, fallbackLabel, tagName, inputName, inputType) {
    var label = document.createElement("label");
    var span = document.createElement("span");
    span.setAttribute("data-i18n", labelKey);
    span.textContent = fallbackLabel;
    label.appendChild(span);
    var field = document.createElement(tagName);
    if (tagName === "input") field.type = inputType || "text";
    field.name = inputName;
    field.required = true;
    label.appendChild(field);
    return label;
  }

  function renderContactBlock(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    injectContactStyles();
    container.innerHTML = "";
    var c = currentLangData().common || {};

    var panel = document.createElement("div");
    panel.className = "snoxi-contact-panel";

    var heading = document.createElement("h3");
    heading.setAttribute("data-i18n", "common.contact_heading");
    heading.textContent = c.contact_heading || "Contact";
    panel.appendChild(heading);

    panel.appendChild(buildEmailLine());

    if (/[?&]snoxi_contact=success/.test(window.location.search)) {
      var success = document.createElement("div");
      success.className = "snoxi-contact-success";
      success.setAttribute("data-i18n", "common.contact_success");
      success.textContent = c.contact_success || "Thank you for your message!";
      panel.appendChild(success);
    }

    var form = document.createElement("form");
    form.className = "snoxi-contact-form";
    form.method = "POST";
    form.action = "https://formsubmit.co/" + FORMSUBMIT_ID;

    function hidden(name, value) {
      var inp = document.createElement("input");
      inp.type = "hidden";
      inp.name = name;
      inp.value = value;
      form.appendChild(inp);
    }
    hidden("_subject", "Snoxi — neue Kontaktanfrage");
    hidden("_template", "table");
    var nextUrl = window.location.origin + window.location.pathname + "?snoxi_contact=success";
    hidden("_next", nextUrl);

    var honey = document.createElement("input");
    honey.type = "text";
    honey.name = "_honey";
    honey.className = "snoxi-contact-honey";
    honey.tabIndex = -1;
    honey.autocomplete = "off";
    form.appendChild(honey);

    form.appendChild(contactField("common.contact_name_label", c.contact_name_label || "Name", "input", "name", "text"));
    form.appendChild(contactField("common.contact_form_email_label", c.contact_form_email_label || "Your Email Address", "input", "email", "email"));
    form.appendChild(contactField("common.contact_message_label", c.contact_message_label || "Message", "textarea", "message"));

    var btn = document.createElement("button");
    btn.type = "submit";
    btn.setAttribute("data-i18n", "common.contact_send");
    btn.textContent = c.contact_send || "Send";
    form.appendChild(btn);

    panel.appendChild(form);

    var note = document.createElement("p");
    note.className = "snoxi-contact-note";
    note.setAttribute("data-i18n", "common.contact_alt_note");
    note.textContent = c.contact_alt_note || "You can also reach us directly via the email address shown above.";
    panel.appendChild(note);

    container.appendChild(panel);
    applyTranslations(detectLanguage());
  }

  window.renderContactBlock = renderContactBlock;
  window.renderMailSlot = renderMailSlot;

  window.snoxiSetLanguage = setLanguage;
})();
