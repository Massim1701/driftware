-- Gemeinsame Zeitkorrektur fuer den Karaoke-Text (Supabase-Projekt driftware-analytics).
-- Besucher stellen Versatz (+/-) und Tempo (JETZT-Taste) pro YouTube-Video ein; nach 15 s ohne weitere
-- Aenderung geht anonym eine "Stimme" raus. Der Median der letzten 25 Stimmen gilt dann fuer alle
-- (im Player erst ab 2 Stimmen). Gespeichert wird nur: Video-ID, Versatz in Sekunden, Tempo-Faktor, Zeit.
-- Kein Nutzerbezug, keine IP -- gleiches Muster wie flag_song/song_flags (Tabelle gesperrt, Zugriff nur ueber Funktionen).
--
-- Ausfuehren: Supabase -> SQL Editor (oder per Migration). Solange das nicht passiert ist, laeuft der
-- Player ganz normal weiter, nur ohne gemeinsame Werte (Abfragen scheitern still).

create table if not exists public.lyrics_sync_votes (
  id bigint generated always as identity primary key,
  video_id text not null,
  offset_s real not null,
  scale real not null default 1,
  created_at timestamptz not null default now()
);
create index if not exists lyrics_sync_votes_video_idx on public.lyrics_sync_votes (video_id, id desc);
alter table public.lyrics_sync_votes enable row level security;  -- bewusst keine Policies

create or replace function public.lyrics_sync_vote(p_video text, p_offset real, p_scale real default 1)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if p_video is null or p_video !~ '^[A-Za-z0-9_-]{6,20}$'
     or p_offset is null or p_offset <> p_offset or p_offset < -60 or p_offset > 60
     or p_scale is null or p_scale <> p_scale or p_scale < 0.9 or p_scale > 1.1 then
    return;
  end if;
  insert into public.lyrics_sync_votes(video_id, offset_s, scale)
  values (p_video, round(p_offset::numeric, 1)::real, round(p_scale::numeric, 4)::real);
  -- pro Video nur die neuesten 25 Stimmen behalten
  delete from public.lyrics_sync_votes
   where video_id = p_video
     and id not in (select id from public.lyrics_sync_votes where video_id = p_video order by id desc limit 25);
end;
$$;

create or replace function public.lyrics_sync_get(p_video text)
returns table(median_offset real, median_scale real, n integer)
language sql
stable
security definer
set search_path to 'public'
as $$
  select (percentile_cont(0.5) within group (order by offset_s))::real,
         (percentile_cont(0.5) within group (order by scale))::real,
         count(*)::integer
    from public.lyrics_sync_votes
   where video_id = p_video and p_video ~ '^[A-Za-z0-9_-]{6,20}$'
  having count(*) > 0;
$$;

revoke all on function public.lyrics_sync_vote(text, real, real) from public;
revoke all on function public.lyrics_sync_get(text) from public;
grant execute on function public.lyrics_sync_vote(text, real, real) to anon, authenticated;
grant execute on function public.lyrics_sync_get(text) to anon, authenticated;
