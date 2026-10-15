-- Frontier Max: user accounts and "continue watching"
-- Sign-up and login are handled by Supabase Auth (auth.users). These tables
-- hang app-specific data off each account.

-- One profile per account, created automatically when someone signs up.
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at   timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Where each user stopped in each movie or episode.
-- Movies leave episode_id empty; series episodes fill it in.
create table public.watch_progress (
  id               bigint generated always as identity primary key,
  user_id          uuid not null references auth.users (id) on delete cascade,
  title_id         bigint not null references public.titles (id) on delete cascade,
  episode_id       bigint references public.episodes (id) on delete cascade,
  position_seconds int not null default 0,
  duration_seconds int,
  completed        boolean not null default false,
  updated_at       timestamptz not null default now(),
  unique nulls not distinct (user_id, title_id, episode_id)
);

-- "Continue watching" lists a user's most recently watched items first.
create index watch_progress_user_recent_idx
  on public.watch_progress (user_id, updated_at desc);

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger watch_progress_touch_updated_at
  before update on public.watch_progress
  for each row execute function public.touch_updated_at();

-- Each user can see and change only their own profile and progress.
alter table public.profiles       enable row level security;
alter table public.watch_progress enable row level security;

create policy "Read own profile" on public.profiles
  for select using ((select auth.uid()) = id);
create policy "Update own profile" on public.profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Read own progress" on public.watch_progress
  for select using ((select auth.uid()) = user_id);
create policy "Add own progress" on public.watch_progress
  for insert with check ((select auth.uid()) = user_id);
create policy "Update own progress" on public.watch_progress
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own progress" on public.watch_progress
  for delete using ((select auth.uid()) = user_id);
