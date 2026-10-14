-- Einmaliger Umzug der Supabase-Daten (Stand 14.10.2026). Mehrfach ausfuehrbar: Zaehler nur hoch, Meldungen nur neu.
UPDATE site_stats SET total_views = max(total_views, 977) WHERE id = 'total';
INSERT OR IGNORE INTO song_flags (song_key, page, genre, artist, title, votes, updated_at) VALUES
  ('kcPc18SG6uA', '80er-music', 'Electronic', 'Sade', 'The Sweetest Taboo', 1, '2026-10-06 14:20:23'),
  ('Ud6sU3AclT4', '80er-music', 'Electronic', 'Taylor Dayne', 'Tell It To My Heart (House Of Hearts-Remix)', 1, '2026-10-06 14:20:46'),
  ('p3j2NYZ8FKs', '80er-music', 'Electronic, Funk / Soul', 'Pet Shop Boys', 'West End Girls (Extended Mix)', 1, '2026-10-06 14:44:42');
