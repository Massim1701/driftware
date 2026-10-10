# MusicBrainz-Singles 1970–1999

Quelle: [MusicBrainz](https://musicbrainz.org) (MetaBrainz Foundation), Suche
`release-group` mit `primarytype:single AND firstreleasedate:<Jahr>`.
Die verwendeten Kerndaten stehen unter **CC0** (Public Domain).

- `<jahr>.csv`: `jahr, erstveroeffentlichung, interpret, titel, mbid`
  (`mbid` = MusicBrainz Release-Group-ID, `https://musicbrainz.org/release-group/<mbid>`)
- `fortschritt/`: Zwischenstand eines abgebrochenen Laufs (wird nach vollständigem Jahr gelöscht)
- `angereichert-<dekade>.json`: Discogs-Abgleich der neuen Songs (Zwischenschritt für `merge_into_json.py`)

Erzeugt von `tools/fetch_musicbrainz.py` und `tools/merge_into_json.py`.
