-- Frontier Max: curated sections on the home page (franchises, "For the Family",
-- "On Mission", ...). A title can sit in several. Safe to run more than once.

create table if not exists public.collections (
  id          bigint generated always as identity primary key,
  slug        text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name        text not null,
  description text,
  -- Lower numbers appear higher on the home page.
  sort_order  int not null default 0
);

create table if not exists public.collection_titles (
  collection_id bigint not null references public.collections (id) on delete cascade,
  title_id      bigint not null references public.titles (id) on delete cascade,
  -- Order within the section, lowest first.
  position      int not null default 0,
  primary key (collection_id, title_id)
);
create index if not exists collection_titles_title_idx on public.collection_titles (title_id);

-- Like the catalog: anyone can read, changes are made in the Supabase dashboard.
alter table public.collections       enable row level security;
alter table public.collection_titles enable row level security;

drop policy if exists "Public read" on public.collections;
create policy "Public read" on public.collections for select using (true);
drop policy if exists "Public read" on public.collection_titles;
create policy "Public read" on public.collection_titles for select using (true);
