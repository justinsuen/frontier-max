-- Frontier Max: let episodes be listed even when we can't play them here.

-- An episode without a video_url is shown in the list but isn't playable.
alter table public.episodes alter column video_url drop not null;

-- Image for the episode list. YouTube episodes can leave this empty; the site
-- uses the video's own thumbnail.
alter table public.episodes add column if not exists thumbnail_url text;

-- Where the episode can be watched elsewhere (e.g. Prime Video), shown as a link.
alter table public.episodes add column if not exists watch_url text;

alter table public.episodes add column if not exists description text;
