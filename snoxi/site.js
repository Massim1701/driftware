/* Snoxi — Top-Leiste, Einblenden, sanftes Scrollen, Poster je Sprache */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Top-Leiste bekommt Hintergrund beim Scrollen */
  var bar = document.querySelector(".topbar");
  function onScroll() { if (bar) bar.classList.toggle("scrolled", window.scrollY > 12); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* App-Store-Bilder: deutsch für de, englisch für alle anderen Sprachen */
  function swapPosters() {
    var lang = document.documentElement.lang === "de" ? "de" : "en";
    var imgs = document.querySelectorAll("img[data-poster]");
    for (var i = 0; i < imgs.length; i++) {
      var want = "img/" + lang + "-" + imgs[i].getAttribute("data-poster") + ".jpg";
      if (imgs[i].getAttribute("src") !== want) imgs[i].setAttribute("src", want);
    }
  }
  swapPosters();
  new MutationObserver(swapPosters).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  if (reduce) return;

  /* Einblenden: nur mit IntersectionObserver, ohne Bibliothek */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && items.length) {
    document.documentElement.classList.add("anim");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
    /* Sicherheitsnetz: falls etwas nicht auslöst, nach 4 s alles zeigen */
    setTimeout(function () { items.forEach(function (el) { el.classList.add("in"); }); }, 4000);
  }

  /* Sanftes Scrollen + leichte Tiefe bei den Postern */
  if (window.Lenis) {
    var lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
  }
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    var p1 = document.querySelector(".hero-art .p1"), p2 = document.querySelector(".hero-art .p2");
    if (p1 && p2) {
      gsap.to(p1, { y: -40, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to(p2, { y: 70, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    }
    document.querySelectorAll(".show-poster figure").forEach(function (f) {
      gsap.fromTo(f, { y: 36 }, { y: -36, ease: "none", scrollTrigger: { trigger: f, start: "top bottom", end: "bottom top", scrub: true } });
    });
  }
})();
