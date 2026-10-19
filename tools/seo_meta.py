#!/usr/bin/env python3
"""Setzt (idempotent) die Kopfdaten der Playlist-Seiten *-music/index.html und der Dekaden-Uebersicht:
aussagekraeftiger <title>, Canonical, Favicon-Links, Open-Graph/Twitter-Vorschau (mit Kachelbild) und
eine fuer Screenreader/Suchmaschinen sichtbare <h1> (die Seiten bauen ihren Inhalt per JS auf).

Der Block steht zwischen <!-- seo --> und <!-- /seo -->; erneutes Ausfuehren ersetzt ihn.
Name/Jahre/Tagline kommen aus dem renderDecadeIndex({...})-Aufruf der jeweiligen Seite.
  python3 tools/seo_meta.py
"""
import glob
import html
import os
import re

BASE = "https://driftware.online"
ICONS = ('<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n'
         '<link rel="icon" href="/favicon.ico" sizes="any">\n'
         '<link rel="apple-touch-icon" href="/apple-touch-icon.png">')
H1_STYLE = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap"


def field(t, key):
    m = re.search(rf"^\s*{key}:\s*'((?:[^'\\]|\\.)*)'", t, re.M)
    return m.group(1).replace("\\'", "'") if m else None


def head_block(url, title, desc, image):
    e = html.escape
    return (f"<!-- seo -->\n<title>{e(title)}</title>\n"
            f'<link rel="canonical" href="{url}">\n{ICONS}\n'
            f'<meta property="og:type" content="website">\n<meta property="og:locale" content="de_DE">\n'
            f'<meta property="og:site_name" content="Driftware">\n<meta property="og:title" content="{e(title)}">\n'
            f'<meta property="og:description" content="{e(desc)}">\n<meta property="og:url" content="{url}">\n'
            f'<meta property="og:image" content="{image}">\n<meta name="twitter:card" content="summary_large_image">\n'
            f"<!-- /seo -->")


def apply(path, url, title, desc, image, h1=None):
    t = open(path, encoding="utf-8").read()
    t = re.sub(r"<!-- seo -->.*?<!-- /seo -->\n?", "", t, flags=re.S)
    t = re.sub(r"<title>.*?</title>\n?", "", t, count=1, flags=re.S)
    t = re.sub(r"<link rel=\"canonical\"[^>]*>\n?", "", t)
    block = head_block(url, title, desc, image) + "\n"
    t = t.replace('<meta name="viewport" content="width=device-width, initial-scale=1.0">\n',
                  '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' + block, 1)
    if h1 and "<h1" not in t:
        t = t.replace('<div id="decade-root"></div>',
                      f'<h1 style="{H1_STYLE}">{html.escape(h1)}</h1>\n<div id="decade-root"></div>', 1)
    elif h1:
        t = re.sub(r'<h1 style="position:absolute[^>]*>.*?</h1>', f'<h1 style="{H1_STYLE}">{html.escape(h1)}</h1>', t, count=1, flags=re.S)
    open(path, "w", encoding="utf-8").write(t)


def main():
    n = 0
    for f in sorted(glob.glob("*-music/index.html")):
        d = f.split("/")[0]
        slug = d[:-len("-music")]
        t = open(f, encoding="utf-8").read()
        name, years, tagline = field(t, "name"), field(t, "years"), field(t, "tagline")
        m = re.search(r'<meta name="description" content="([^"]*)"', t)
        desc = html.unescape(m.group(1)) if m else (tagline or name)
        decade = re.fullmatch(r"\d{2,4}er", slug) is not None
        if decade:
            title = f"{name} – Hits {years} als Playlist | Driftware"
            image = f"{BASE}/dekaden/img/{slug}.jpg"
        else:
            title = f"{name} Playlist – Songs aus allen Jahrzehnten | Driftware"
            image = f"{BASE}/dekaden/img/mood/{slug}.jpg"
        apply(f, f"{BASE}/{d}/", title, desc, image, h1=f"{name}: {tagline}" if tagline else name)
        n += 1
    f = "dekaden/index.html"
    t = open(f, encoding="utf-8").read()
    m = re.search(r'<meta name="description" content="([^"]*)"', t)
    apply(f, f"{BASE}/dekaden/", "Ultimate Music Master – Playlists nach Jahrzehnt und Stimmung | Driftware",
          html.unescape(m.group(1)), f"{BASE}/dekaden/img/90er.jpg")
    print(n, "Playlist-Seiten und die Dekaden-Uebersicht aktualisiert")


if __name__ == "__main__":
    main()
