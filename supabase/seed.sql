-- Placeholder catalog: nine movies whose video_url is the official or studio trailer on YouTube.
-- Paste into Supabase → SQL Editor and click Run. Safe to run more than once:
-- a movie is skipped if a title with the same name already exists.
-- Posters are from The Movie Database (themoviedb.org).

insert into public.titles (type, name, release_year, poster_url, video_url, description)
select 'movie', v.name, v.release_year, v.poster_url, v.video_url, v.description
from (values
  ('Hacksaw Ridge', 2016,
   'https://image.tmdb.org/t/p/w500/fnOMP6mjmOmZwmlC1n0K7ivrzt1.jpg',
   'https://www.youtube.com/watch?v=s2-1hz1juBI',
   'The true story of Desmond Doss, an Army medic who refused to carry a weapon in World War II and rescued dozens of wounded soldiers during the Battle of Okinawa.'),
  ('The Ultimate Gift', 2007,
   'https://image.tmdb.org/t/p/w500/8BdVk1u110lwHFELTEO9HrPrIDa.jpg',
   'https://www.youtube.com/watch?v=FQvo7X2mY2A',
   'A spoiled heir must complete a series of tasks left by his late grandfather before he can receive his inheritance, and learns what really matters along the way.'),
  ('End of the Spear', 2005,
   'https://image.tmdb.org/t/p/w500/2jMM1cuF1FcxdPPdEJy8gquDmES.jpg',
   'https://www.youtube.com/watch?v=YS_RFrmFgyg',
   'The true story of five missionaries killed in the Ecuadorian jungle in 1956, and of the Waodani people whose lives were changed when the missionaries'' families returned.'),
  ('Unbroken', 2014,
   'https://image.tmdb.org/t/p/w500/vAlHUjHwLWMV5mg4epGR9WSIfiy.jpg',
   'https://www.youtube.com/watch?v=kk1M_HwmFMM',
   'Olympic runner Louis Zamperini survives a bomber crash, weeks adrift at sea and years in Japanese prisoner-of-war camps during World War II.'),
  ('The Best Christmas Pageant Ever', 2024,
   'https://image.tmdb.org/t/p/w500/6XjvhydAlXbQodoWbIf77H0Dd9R.jpg',
   'https://www.youtube.com/watch?v=cT7x4HpCICc',
   'When the most unruly kids in town take over the church Christmas pageant, everyone ends up seeing the Christmas story in a new way.'),
  ('Klaus', 2019,
   'https://image.tmdb.org/t/p/w500/q125RHUDgR4gjwh1QkfYuJLYkL.jpg',
   'https://www.youtube.com/watch?v=taE3PwurhYM',
   'A self-centered postman sent to a frozen island town teams up with a reclusive toymaker, and their deliveries start the legend of Santa Claus.'),
  ('Jonah: A VeggieTales Movie', 2002,
   'https://image.tmdb.org/t/p/w500/xJ6ImpQIqZxBh4eE2813ljQ0TQ3.jpg',
   'https://www.youtube.com/watch?v=N5LkB6uKDg4',
   'The VeggieTales gang retell the story of Jonah, the prophet who ran from God''s call and learned about compassion and mercy.'),
  ('The Pirates Who Don''t Do Anything: A VeggieTales Movie', 2008,
   'https://image.tmdb.org/t/p/w500/hwawxSwOkjeld4eQLSkIyyYNnqO.jpg',
   'https://www.youtube.com/watch?v=8qa9ABJiXIA',
   'Three misfit dinner-theater workers are pulled back to the 17th century and have to become the heroes they have only ever pretended to be.'),
  ('VeggieTales: Lord of the Beans', 2005,
   'https://image.tmdb.org/t/p/w500/yOVOirMvCe74fy3l0WjrL9ABCYw.jpg',
   'https://www.youtube.com/watch?v=oOpsRvwIW-I',
   'A VeggieTales spoof of The Lord of the Rings about a young hero who is handed a magic bean and learns to use his gifts to help others.')
) as v (name, release_year, poster_url, video_url, description)
where not exists (select 1 from public.titles t where t.name = v.name);
