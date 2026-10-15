-- Frontier Max: a transparent title logo per title, laid over the landscape cards.
-- Titles without one show their name in text instead.
alter table public.titles add column if not exists logo_url text;
