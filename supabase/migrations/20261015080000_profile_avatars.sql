-- Frontier Max: profiles can use a character picture as their avatar.
-- Holds an avatar id from lib/avatars.ts (e.g. "aslan"); empty means the coloured initial.
alter table public.profiles add column if not exists avatar text
  check (avatar is null or avatar ~ '^[a-z-]{1,40}$');
