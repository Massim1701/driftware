-- D1 (SQLite). Anwenden: npx wrangler d1 execute driftware --remote --file schema.sql
CREATE TABLE IF NOT EXISTS site_stats (
  id TEXT PRIMARY KEY,
  total_views INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO site_stats (id, total_views) VALUES ('total', 0);

-- "Passt nicht"-Meldungen (wie bei Supabase: pro Song und Seite ein Eintrag, votes zaehlt hoch)
CREATE TABLE IF NOT EXISTS song_flags (
  song_key TEXT NOT NULL CHECK (length(song_key) BETWEEN 1 AND 200),
  page TEXT NOT NULL CHECK (length(page) BETWEEN 1 AND 60),
  genre TEXT NOT NULL DEFAULT '' CHECK (length(genre) <= 80),
  artist TEXT NOT NULL DEFAULT '' CHECK (length(artist) <= 200),
  title TEXT NOT NULL DEFAULT '' CHECK (length(title) <= 200),
  votes INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (song_key, page)
);

-- Gemeinsame Karaoke-Zeitkorrektur: Stimmen pro YouTube-Video, es gelten die neuesten 25 (Median)
CREATE TABLE IF NOT EXISTS lyrics_sync_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id TEXT NOT NULL,
  offset_s REAL NOT NULL,
  scale REAL NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS lyrics_sync_votes_video_idx ON lyrics_sync_votes (video_id, id DESC);

-- Posteingang der Warteliste: der Worker legt Meldungen hier ab, fornetta holt sie ab (tools/inbox_import.py)
CREATE TABLE IF NOT EXISTS queue_inbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dedup TEXT NOT NULL UNIQUE,
  entry TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS queue_flags (
  name TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
