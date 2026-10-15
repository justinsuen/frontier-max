-- Placeholder catalog: movies whose video_url is the official or studio trailer on YouTube.
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
   'A VeggieTales spoof of The Lord of the Rings about a young hero who is handed a magic bean and learns to use his gifts to help others.'),
  ('The Chronicles of Narnia: The Lion, the Witch and the Wardrobe', 2005,
   'https://image.tmdb.org/t/p/w500/iREd0rNCjYdf5Ar0vfaW32yrkm.jpg',
   'https://www.youtube.com/watch?v=usEkWtuNn-w',
   'Four siblings step through a wardrobe and find Narnia, a land frozen in endless winter by the White Witch, and join the great lion Aslan to set it free.'),
  ('The Chronicles of Narnia: Prince Caspian', 2008,
   'https://image.tmdb.org/t/p/w500/qxz3WIyjZiSKUhaTIEJ3c1GcC9z.jpg',
   'https://www.youtube.com/watch?v=oZRZ-2et2uY',
   'The Pevensie children return to Narnia centuries later to help the exiled Prince Caspian win back his throne from his tyrant uncle.'),
  ('The Chronicles of Narnia: The Voyage of the Dawn Treader', 2010,
   'https://image.tmdb.org/t/p/w500/pP27zlm9yeKrCeDZLFLP2HKELot.jpg',
   'https://www.youtube.com/watch?v=AON1-Ox-Llc',
   'Edmund, Lucy and their cousin Eustace sail with King Caspian toward the edge of the world on a quest to find seven lost lords of Narnia.'),
  ('The Lord of the Rings: The Fellowship of the Ring', 2001,
   'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
   'https://www.youtube.com/watch?v=V75dMMIW2B4',
   'The hobbit Frodo inherits a ring of terrible power and sets out with eight companions to destroy it before the Dark Lord Sauron can reclaim it.'),
  ('The Lord of the Rings: The Two Towers', 2002,
   'https://image.tmdb.org/t/p/w500/5VTN0pR8gcqV3EPUHHfMGnJYN9L.jpg',
   'https://www.youtube.com/watch?v=LbfMDwc4azU',
   'With the fellowship broken, Frodo and Sam press on toward Mordor guided by Gollum, while their friends rally the kingdom of Rohan against Saruman''s army.'),
  ('The Lord of the Rings: The Return of the King', 2003,
   'https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg',
   'https://www.youtube.com/watch?v=r5X-hFf6Bwo',
   'As the armies of Middle-earth make a final stand against Sauron, Frodo and Sam struggle up Mount Doom to destroy the One Ring.')
) as v (name, release_year, poster_url, video_url, description)
where not exists (select 1 from public.titles t where t.name = v.name);

-- TV series. Until real episodes are added to public.episodes, video_url holds the series trailer.
insert into public.titles (type, name, release_year, poster_url, video_url, description)
select 'series', v.name, v.release_year, v.poster_url, v.video_url, v.description
from (values
  ('The Chosen', 2019,
   'https://image.tmdb.org/t/p/w500/nr0r7YTn1l84KLG1iCSO5ofHTvO.jpg',
   'https://www.youtube.com/watch?v=K1-FoFj8Jbo',
   'A multi-season drama about the life of Jesus, told through the eyes of the fishermen, tax collectors and outcasts who met him and chose to follow.'),
  ('The Promised Land', 2024,
   'https://image.tmdb.org/t/p/w500/jIlNISf8GhenOBudlQQwzQzTVxV.jpg',
   'https://www.youtube.com/watch?v=MN54fod_YzQ',
   'Moses and his family lead the Israelites out of Egypt and find that the hardest part of the journey to the promised land is the people themselves.'),
  ('House of David', 2025,
   'https://image.tmdb.org/t/p/w500/i4eskPIEI5sK0IibHhWqBU9Ts0k.jpg',
   'https://www.youtube.com/watch?v=GrGfIHBIVL4',
   'A young shepherd named David rises from obscurity as King Saul''s reign begins to crumble, setting him on the path to becoming Israel''s most celebrated king.')
) as v (name, release_year, poster_url, video_url, description)
where not exists (select 1 from public.titles t where t.name = v.name);
