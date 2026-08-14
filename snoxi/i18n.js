/* Snoxi i18n — translations + apply logic + language switcher */
(function () {
  "use strict";

  var CONTACT_EMAIL = "welove80sde@gmail.com";
  // FormSubmit-ID statt nackter E-Mail-Adresse im Formular-action, damit Bots die Adresse nicht
  // aus dem Quelltext scrapen können (CONTACT_EMAIL bleibt für die sichtbare mailto-Zeile).
  var FORMSUBMIT_ID = "0b4cb7348b4cff5d1891bf8d99f1e757";

  var SUPPORTED_LANGUAGES = ["de","en","es","fr"];
  var LANG_NAMES = {
    de: "Deutsch", en: "English", es: "Español", fr: "Français"
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

    container.appendChild(panel);
    applyTranslations(detectLanguage());
  }

  window.renderContactBlock = renderContactBlock;

  window.snoxiSetLanguage = setLanguage;
})();
