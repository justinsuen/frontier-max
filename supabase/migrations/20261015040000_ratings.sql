-- Frontier Max: profiles rate movies, series and episodes as
-- "Not for me", "I liked this" or "I loved this". Safe to run more than once.

-- Lets ratings point at (episode, title) together, so an episode rating
-- can't be filed under the wrong title.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'episodes_id_title_id_key') then
    alter table public.episodes add constraint episodes_id_title_id_key unique (id, title_id);
  end if;
end;
$$;

-- One rating per profile per title (episode_id null) or per episode.
create table if not exists public.ratings (
  id         bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  title_id   bigint not null references public.titles (id) on delete cascade,
  episode_id bigint,
  rating     text not null check (rating in ('not_for_me', 'liked', 'loved')),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (profile_id, title_id, episode_id),
  foreign key (episode_id, title_id) references public.episodes (id, title_id) on delete cascade
);
create index if not exists ratings_title_idx on public.ratings (title_id, episode_id);

drop trigger if exists ratings_touch_updated_at on public.ratings;
create trigger ratings_touch_updated_at
  before update on public.ratings
  for each row execute function public.touch_updated_at();

-- A profile sees and changes only its own ratings...
alter table public.ratings enable row level security;
drop policy if exists "Own ratings" on public.ratings;
create policy "Own ratings" on public.ratings
  for all to authenticated
  using (public.owns_profile(profile_id))
  with check (public.owns_profile(profile_id));

-- ...while everyone, signed in or not, can see the totals for a title and its
-- episodes. Totals only: nobody can see which profile gave which rating.
create or replace function public.rating_summary(target_title bigint)
returns table (episode_id bigint, not_for_me bigint, liked bigint, loved bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select
    r.episode_id,
    count(*) filter (where r.rating = 'not_for_me'),
    count(*) filter (where r.rating = 'liked'),
    count(*) filter (where r.rating = 'loved')
  from public.ratings r
  where r.title_id = target_title
  group by r.episode_id;
$$;

revoke all on function public.rating_summary(bigint) from public;
grant execute on function public.rating_summary(bigint) to anon, authenticated;
