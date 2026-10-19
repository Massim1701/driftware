#!/usr/bin/env python3
"""Erzeugt sitemap.xml aus den vorhandenen Seiten (Datum der letzten Aenderung aus Git).

Aufgenommen: Startseite, Rechtliches, Ueber mich, Dekaden-Uebersicht, alle *-music/-Playlist-Seiten und
die Projektseiten, die schon in der alten Sitemap standen (Snoxi, Kitchen King, Orakel).
Ausgeschlossen: Seiten mit noindex, in robots.txt gesperrte Bereiche (collectview, kitchen-king/admin.html).
Bei den Playlist-Seiten zaehlt auch die songs.json fuer das Datum.
  python3 tools/build_sitemap.py
"""
import glob
import os
import subprocess

BASE = "https://driftware.online"


def lastmod(*paths):
    best = ""
    for p in paths:
        if not os.path.exists(p):
            continue
        out = subprocess.run(["git", "log", "-1", "--format=%cs", "--", p], capture_output=True, text=True).stdout.strip()
        best = max(best, out)
    return best


def noindex(path):
    try:
        return "noindex" in open(path, encoding="utf-8", errors="ignore").read().lower()
    except OSError:
        return True


def main():
    entries = [("/", ["index.html"])]
    for page in ("ueber-mich/index.html", "impressum.html", "privacy.html", "terms.html"):
        if os.path.exists(page):
            url = "/" + page.replace("index.html", "")
            entries.append((url, [page]))
    entries.append(("/dekaden/", ["dekaden/index.html"]))
    for f in sorted(glob.glob("*-music/index.html")):
        d = f.split("/")[0]
        if not noindex(f):
            entries.append((f"/{d}/", [f, f"{d}/songs.json"]))
    for page in ("snoxi/index.html", "snoxi/anleitung.html", "snoxi/privacy.html", "snoxi/impressum.html",
                 "kitchen-king/index.html", "kitchen-king/anleitung.html", "kitchen-king/privacy.html",
                 "orakel/index.html", "orakel/anleitung.html", "orakel/privacy.html"):
        if os.path.exists(page) and not noindex(page):
            entries.append(("/" + page.replace("index.html", ""), [page]))
    out = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url, files in entries:
        out.append("  <url>")
        out.append(f"    <loc>{BASE}{url}</loc>")
        lm = lastmod(*files)
        if lm:
            out.append(f"    <lastmod>{lm}</lastmod>")
        out.append("  </url>")
    out.append("</urlset>")
    open("sitemap.xml", "w", encoding="utf-8").write("\n".join(out) + "\n")
    print(len(entries), "URLs in sitemap.xml")


if __name__ == "__main__":
    main()
