-- Frontier Max: multiple viewer profiles per account, with per-profile
-- watch progress ("continue watching" and history) and a watchlist.
-- Safe to run more than once.

-- The first accounts migration made one profile per login and tracked progress
-- per login. Replace both; no rows exist yet because the site had no sign-in.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'display_name'
  ) then
    drop trigger if exists on_auth_user_created on auth.users;
    drop function if exists public.handle_new_user();
    drop table if exists public.watch_progress;
    drop table public.profiles;
  end if;
end;
$$;

-- Viewer profiles. One login (auth.users row) can have up to 5.
create table if not exists public.profiles (
  id           uuid primary key default gen_random_uuid(),
  account_id   uuid not null references auth.users (id) on delete cascade,
  name         text not null check (char_length(trim(name)) between 1 and 40),
  avatar_color text not null default 'navy'
               check (avatar_color in ('navy', 'brass', 'green', 'rose', 'slate')),
  created_at   timestamptz not null default now()
);
create index if not exists profiles_account_id_idx on public.profiles (account_id);

create or replace function public.enforce_profile_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.profiles where account_id = new.account_id) >= 5 then
    raise exception 'An account can have at most 5 profiles';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_limit on public.profiles;
create trigger profiles_limit
  before insert on public.profiles
  for each row execute function public.enforce_profile_limit();

-- Every new account starts with one profile, named from the sign-up form.
create or replace function public.handle_new_account()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (account_id, name)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1)), 40)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_account();

-- True when the signed-in account owns this profile. Used by the policies below.
create or replace function public.owns_profile(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p where p.id = target and p.account_id = (select auth.uid())
  );
$$;

-- Where each profile stopped in each movie or episode. The most recently
-- updated rows double as watch history; unfinished ones feed "Continue watching".
create table if not exists public.watch_progress (
  id               bigint generated always as identity primary key,
  profile_id       uuid not null references public.profiles (id) on delete cascade,
  title_id         bigint not null references public.titles (id) on delete cascade,
  episode_id       bigint references public.episodes (id) on delete cascade,
  position_seconds int not null default 0 check (position_seconds >= 0),
  duration_seconds int check (duration_seconds > 0),
  completed        boolean not null default false,
  updated_at       timestamptz not null default now(),
  unique nulls not distinct (profile_id, title_id, episode_id)
);
create index if not exists watch_progress_profile_recent_idx
  on public.watch_progress (profile_id, updated_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists watch_progress_touch_updated_at on public.watch_progress;
create trigger watch_progress_touch_updated_at
  before update on public.watch_progress
  for each row execute function public.touch_updated_at();

-- Titles a profile saved for later.
create table if not exists public.watchlist (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  title_id   bigint not null references public.titles (id) on delete cascade,
  added_at   timestamptz not null default now(),
  primary key (profile_id, title_id)
);
create index if not exists watchlist_profile_recent_idx on public.watchlist (profile_id, added_at desc);

-- Access rules: an account sees and changes only its own profiles and their data.
alter table public.profiles       enable row level security;
alter table public.watch_progress enable row level security;
alter table public.watchlist      enable row level security;

drop policy if exists "Own profiles" on public.profiles;
create policy "Own profiles" on public.profiles
  for all to authenticated
  using ((select auth.uid()) = account_id)
  with check ((select auth.uid()) = account_id);

drop policy if exists "Own progress" on public.watch_progress;
create policy "Own progress" on public.watch_progress
  for all to authenticated
  using (public.owns_profile(profile_id))
  with check (public.owns_profile(profile_id));

drop policy if exists "Own watchlist" on public.watchlist;
create policy "Own watchlist" on public.watchlist
  for all to authenticated
  using (public.owns_profile(profile_id))
  with check (public.owns_profile(profile_id));
