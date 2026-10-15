-- Frontier Max: a wide (16:9) image per title for the landscape cards on the home page.
alter table public.titles add column if not exists backdrop_url text;
