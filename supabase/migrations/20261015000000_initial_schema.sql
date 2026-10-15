-- Frontier Max: initial schema
-- A hand-maintained catalog of movies and TV series, each pointing at video links.

-- Every movie or series in the catalog.
create table public.titles (
  id           bigint generated always as identity primary key,
  type         text not null check (type in ('movie', 'series')),
  name         text not null,
  description  text,
  release_year int,
  poster_url   text,
  -- Movies play from this link; series leave it empty and use episodes instead.
  video_url    text,
  created_at   timestamptz not null default now()
);

-- Episodes belong to a series.
create table public.episodes (
  id             bigint generated always as identity primary key,
  title_id       bigint not null references public.titles (id) on delete cascade,
  season_number  int not null default 1,
  episode_number int not null,
  name           text,
  video_url      text not null,
  created_at     timestamptz not null default now(),
  unique (title_id, season_number, episode_number)
);

-- Genres such as Action, Comedy, Drama.
create table public.genres (
  id   bigint generated always as identity primary key,
  name text not null unique
);

-- Links titles to genres (a title can have several genres).
create table public.title_genres (
  title_id bigint not null references public.titles (id) on delete cascade,
  genre_id bigint not null references public.genres (id) on delete cascade,
  primary key (title_id, genre_id)
);

create index episodes_title_id_idx on public.episodes (title_id);
create index title_genres_genre_id_idx on public.title_genres (genre_id);

-- Anyone visiting the site can read the catalog. Nobody can change it through
-- the website; you add and edit rows yourself in the Supabase dashboard.
alter table public.titles       enable row level security;
alter table public.episodes     enable row level security;
alter table public.genres       enable row level security;
alter table public.title_genres enable row level security;

create policy "Public read" on public.titles       for select using (true);
create policy "Public read" on public.episodes     for select using (true);
create policy "Public read" on public.genres       for select using (true);
create policy "Public read" on public.title_genres for select using (true);
