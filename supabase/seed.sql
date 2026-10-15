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

-- Episodes, from each show's official YouTube channel. Each row finds its series by name.
-- The Chosen posts Season 1 as four videos with two episodes each, so each row covers a pair.
insert into public.episodes (title_id, season_number, episode_number, name, video_url)
select t.id, v.season_number, v.episode_number, v.name, v.video_url
from (values
  ('The Promised Land', 1, 1, 'Pilot',    'https://www.youtube.com/watch?v=HSI04-1oLwg'),
  ('The Promised Land', 1, 2, 'Sinai',    'https://www.youtube.com/watch?v=vSosv_ZfYk4'),
  ('The Promised Land', 1, 3, 'Pitfalls', 'https://www.youtube.com/watch?v=0Fi2IuYAr2A'),
  ('The Promised Land', 1, 4, 'Offering', 'https://www.youtube.com/watch?v=dtQ3vAf62JI'),
  ('The Promised Land', 1, 5, 'Bones',    'https://www.youtube.com/watch?v=Iqjh7fzOQPU'),
  ('The Promised Land', 1, 6, 'Presence', 'https://www.youtube.com/watch?v=Wx0hFYWxYRA'),
  ('The Chosen', 1, 1, 'Episodes 1 & 2: I Have Called You by Name / Shabbat',
   'https://www.youtube.com/watch?v=0E-8-NcL7tc'),
  ('The Chosen', 1, 3, 'Episodes 3 & 4: Jesus Loves the Little Children / The Rock on Which It Is Built',
   'https://www.youtube.com/watch?v=0DPzq53O4DI'),
  ('The Chosen', 1, 5, 'Episodes 5 & 6: The Wedding Gift / Indescribable Compassion',
   'https://www.youtube.com/watch?v=LB3QWkTBvr4'),
  ('The Chosen', 1, 7, 'Episodes 7 & 8: Invitations / I Am He',
   'https://www.youtube.com/watch?v=UwiURke07Ck')
) as v (series, season_number, episode_number, name, video_url)
join public.titles t on t.name = v.series and t.type = 'series'
where not exists (
  select 1 from public.episodes e
  where e.title_id = t.id and e.season_number = v.season_number and e.episode_number = v.episode_number
);

-- Episodes we can list but not play here: names and stills from The Movie Database,
-- with watch_url pointing to where each one streams. Needs the 20261015020000 migration.
insert into public.episodes (title_id, season_number, episode_number, name, thumbnail_url, watch_url)
select t.id, v.season_number, v.episode_number, v.name, v.thumbnail_url, v.watch_url
from (values
  ('House of David', 1, 1, 'A Shepherd and a King',
   'https://image.tmdb.org/t/p/w500/wK6eZdcsZHkmvXrntkkmCXmkTrW.jpg',
   'https://www.primevideo.com/detail/House-of-David/0FDRQYNQWZ8H8H1YL6G9P4N0G9'),
  ('House of David', 1, 2, 'Deep Calls to Deep',
   'https://image.tmdb.org/t/p/w500/tmfTsIvDIKdQ1YQzFLcohPFvMbM.jpg',
   'https://www.primevideo.com/detail/House-of-David/0FDRQYNQWZ8H8H1YL6G9P4N0G9'),
  ('House of David', 1, 3, 'The Anointing',
   'https://image.tmdb.org/t/p/w500/8GVoGJzPB77qt5jOxotXQYNEmyt.jpg',
   'https://www.primevideo.com/detail/House-of-David/0FDRQYNQWZ8H8H1YL6G9P4N0G9'),
  ('House of David', 1, 4, 'The Song of Moses',
   'https://image.tmdb.org/t/p/w500/f0baVYJNmcdwLi7Tl0Fdo2xSgP7.jpg',
   'https://www.primevideo.com/detail/House-of-David/0FDRQYNQWZ8H8H1YL6G9P4N0G9'),
  ('House of David', 1, 5, 'The Wolf and the Lion',
   'https://image.tmdb.org/t/p/w500/A5dxgA5odSiS1ad2JwIW29NqKPw.jpg',
   'https://www.primevideo.com/detail/House-of-David/0FDRQYNQWZ8H8H1YL6G9P4N0G9'),
  ('House of David', 1, 6, 'Giants Awakened',
   'https://image.tmdb.org/t/p/w500/6AGjwlp08kPgr3lDLoahvZ9ZkSV.jpg',
   'https://www.primevideo.com/detail/House-of-David/0FDRQYNQWZ8H8H1YL6G9P4N0G9'),
  ('House of David', 1, 7, 'David and Goliath (1)',
   'https://image.tmdb.org/t/p/w500/3WDJCKby8eiXxYHIjINzrtOn5xK.jpg',
   'https://www.primevideo.com/detail/House-of-David/0FDRQYNQWZ8H8H1YL6G9P4N0G9'),
  ('House of David', 1, 8, 'David and Goliath (2)',
   'https://image.tmdb.org/t/p/w500/udPfaAUmwWq9qsKvPzOfWEggNqT.jpg',
   'https://www.primevideo.com/detail/House-of-David/0FDRQYNQWZ8H8H1YL6G9P4N0G9'),
  ('House of David', 2, 1, 'A Tale of Two Swords',
   'https://image.tmdb.org/t/p/w500/ujcDC7heYVkfZQeVDFji1Die1Gf.jpg',
   'https://www.primevideo.com/detail/House-of-David/0FOT2IDMBS1WKUD3OA2QVHI004'),
  ('House of David', 2, 2, 'A Journey Home',
   'https://image.tmdb.org/t/p/w500/aVDKSvwPxijPz4r73IDVOsDwaXm.jpg',
   'https://www.primevideo.com/detail/House-of-David/0FOT2IDMBS1WKUD3OA2QVHI004'),
  ('House of David', 2, 3, 'The Middle Path',
   'https://image.tmdb.org/t/p/w500/4A8aBMeWMl9mqiPTstRRP3xHKEK.jpg',
   'https://www.primevideo.com/detail/House-of-David/0FOT2IDMBS1WKUD3OA2QVHI004'),
  ('House of David', 2, 4, 'Road to Atonement',
   'https://image.tmdb.org/t/p/w500/iodxOU5SrSn40OuAIXG9EOdFNJC.jpg',
   'https://www.primevideo.com/detail/House-of-David/0FOT2IDMBS1WKUD3OA2QVHI004'),
  ('House of David', 2, 5, 'God of Swords',
   'https://image.tmdb.org/t/p/w500/4qHL4nKf0SkCChtJIJ9eQIf76KU.jpg',
   'https://www.primevideo.com/detail/House-of-David/0FOT2IDMBS1WKUD3OA2QVHI004'),
  ('House of David', 2, 6, 'Forged in Fire',
   'https://image.tmdb.org/t/p/w500/2Ernzv98sMufj0H0DqUs9bneTsf.jpg',
   'https://www.primevideo.com/detail/House-of-David/0FOT2IDMBS1WKUD3OA2QVHI004'),
  ('House of David', 2, 7, 'A Royal Wedding',
   'https://image.tmdb.org/t/p/w500/eQethU8a1X4RQTaB1yvbPb1NB8q.jpg',
   'https://www.primevideo.com/detail/House-of-David/0FOT2IDMBS1WKUD3OA2QVHI004'),
  ('House of David', 2, 8, 'The Truth Revealed',
   'https://image.tmdb.org/t/p/w500/eJBqDF1nlcGyxqd2n2GdpphnMHC.jpg',
   'https://www.primevideo.com/detail/House-of-David/0FOT2IDMBS1WKUD3OA2QVHI004'),
  ('The Chosen', 2, 1, 'Thunder',
   'https://image.tmdb.org/t/p/w500/veYGGZcBkrrJ73WFtfjPVxmlm3t.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 2, 2, 'I Saw You',
   'https://image.tmdb.org/t/p/w500/97LTcBNO5myOVy5tmtO2eXOLBgs.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 2, 3, 'Matthew 4:24',
   'https://image.tmdb.org/t/p/w500/xZzug3qFNJdz5vo8YnQdRe8V7cs.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 2, 4, 'The Perfect Opportunity',
   'https://image.tmdb.org/t/p/w500/bGfgX3nX5xgWOWzmvHcItyCXbtX.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 2, 5, 'Spirit',
   'https://image.tmdb.org/t/p/w500/qglp6jovceCGncL6vPfF1d4Dvei.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 2, 6, 'Unlawful',
   'https://image.tmdb.org/t/p/w500/zsdnjukB2Qm52odGXE8DcrYqwOK.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 2, 7, 'Reckoning',
   'https://image.tmdb.org/t/p/w500/r3tZUs2inkBLofPHh6Da8JKQ6yt.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 2, 8, 'Beyond Mountains',
   'https://image.tmdb.org/t/p/w500/oXVWhQzhrbnFnotQfn4xNPRUyym.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 3, 1, 'Homecoming',
   'https://image.tmdb.org/t/p/w500/gPCVrcf8wBKfezwkYZp2hIUmDDn.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 3, 2, 'Two by Two',
   'https://image.tmdb.org/t/p/w500/ttoqt6Ts7NyKCHkAdm8K3VO7Ufe.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 3, 3, 'Physician, Heal Yourself',
   'https://image.tmdb.org/t/p/w500/lim4Tl18XCoZeiR5zaI9NrjxQe5.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 3, 4, 'Clean, Part 1',
   'https://image.tmdb.org/t/p/w500/k4TrC009oraGH4Zd9g8s4V2iBss.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 3, 5, 'Clean, Part 2',
   'https://image.tmdb.org/t/p/w500/h3qxCDzr3qSsESqzBGlQCo6juil.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 3, 6, 'Intensity in Tent City',
   'https://image.tmdb.org/t/p/w500/ufrR1poHcwU1qmnjUvVqEnANgcL.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 3, 7, 'Ears to Hear',
   'https://image.tmdb.org/t/p/w500/nt5MxG1bUgkzMHzHqeFqyJxN6dI.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 3, 8, 'Sustenance',
   'https://image.tmdb.org/t/p/w500/sdJTheOxBFS31IyAe0Mt9ofqn6g.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 4, 1, 'Promises',
   'https://image.tmdb.org/t/p/w500/eC8TSh6RYeyLsK46Io18mt5WxAG.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 4, 2, 'Confessions',
   'https://image.tmdb.org/t/p/w500/kmo0nnMDlrROFZLXqvSzRxv1E0T.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 4, 3, 'Moon to Blood',
   'https://image.tmdb.org/t/p/w500/pDa77WHKOOHukEnnC0rV2jQfK2n.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 4, 4, 'Calm Before',
   'https://image.tmdb.org/t/p/w500/aG2NU3SPnEk7Zeu97lbtB7I3dDQ.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 4, 5, 'Sitting, Serving, Scheming',
   'https://image.tmdb.org/t/p/w500/uN87wMUu6IQkjU3wI9JZYDQhOdQ.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 4, 6, 'Dedication',
   'https://image.tmdb.org/t/p/w500/uVNQ7ZHTJA8gmO04Gqf43E4bnli.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 4, 7, 'The Last Sign',
   'https://image.tmdb.org/t/p/w500/hj6EAD9qfrLxsUB3LKwGqVI2Eph.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 4, 8, 'Humble',
   'https://image.tmdb.org/t/p/w500/2NLo4oCIxy3tRYu69ivm4viVDfQ.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 5, 1, 'Entry',
   'https://image.tmdb.org/t/p/w500/pNA0JpayFCJD0ErmUvPTwu0oMqH.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 5, 2, 'House of Cards',
   'https://image.tmdb.org/t/p/w500/hmMZe6BQK6NSqC0l9hcCMrpw8As.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 5, 3, 'Woes',
   'https://image.tmdb.org/t/p/w500/qE1nvR8iZ4gV9hbvXdbDwJ52rM0.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 5, 4, 'The Same Coin',
   'https://image.tmdb.org/t/p/w500/svlixBgJjfCRZH1LsGimkyqU5vE.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 5, 5, 'Because of Me',
   'https://image.tmdb.org/t/p/w500/qtF0JRqbwp2BckK0QLD4mn6OBkA.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 5, 6, 'Reunions',
   'https://image.tmdb.org/t/p/w500/pkPQN73QggcKyA8nGlr4DHmjjs7.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 5, 7, 'The Upper Room (1)',
   'https://image.tmdb.org/t/p/w500/z6mnUJL8vjMgQe3GgtcuWlLEvx4.jpg',
   'https://watch.thechosen.tv/'),
  ('The Chosen', 5, 8, 'The Upper Room (2)',
   'https://image.tmdb.org/t/p/w500/lafv8JbwffijVKk9twFcp4tI5Wb.jpg',
   'https://watch.thechosen.tv/')
) as v (series, season_number, episode_number, name, thumbnail_url, watch_url)
join public.titles t on t.name = v.series and t.type = 'series'
where not exists (
  select 1 from public.episodes e
  where e.title_id = t.id and e.season_number = v.season_number and e.episode_number = v.episode_number
);

-- Home page sections. Needs the 20261015050000 collections migration.
-- Three broad sections, each wider than one screen. Sections not listed here
-- are removed; re-running updates names and adds any missing titles.
delete from public.collections
where slug not in ('faith-and-courage', 'epic-adventures', 'family-movie-night');

insert into public.collections (slug, name, description, sort_order)
values
  ('faith-and-courage', 'Stories of Faith & Courage', 'True stories and Bible stories of people who stood firm.', 10),
  ('epic-adventures', 'Epic Adventures', 'Quests, battles and other worlds.', 20),
  ('family-movie-night', 'Family Movie Night', 'Easy picks for watching together.', 30)
on conflict (slug) do update
  set name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;

insert into public.collection_titles (collection_id, title_id, position)
select c.id, t.id, v.position
from (values
  ('faith-and-courage', 'The Chosen', 1),
  ('faith-and-courage', 'Hacksaw Ridge', 2),
  ('faith-and-courage', 'House of David', 3),
  ('faith-and-courage', 'Unbroken', 4),
  ('faith-and-courage', 'The Promised Land', 5),
  ('faith-and-courage', 'End of the Spear', 6),
  ('faith-and-courage', 'The Ultimate Gift', 7),
  ('epic-adventures', 'The Lord of the Rings: The Fellowship of the Ring', 1),
  ('epic-adventures', 'The Chronicles of Narnia: The Lion, the Witch and the Wardrobe', 2),
  ('epic-adventures', 'The Lord of the Rings: The Two Towers', 3),
  ('epic-adventures', 'The Chronicles of Narnia: Prince Caspian', 4),
  ('epic-adventures', 'The Lord of the Rings: The Return of the King', 5),
  ('epic-adventures', 'The Chronicles of Narnia: The Voyage of the Dawn Treader', 6),
  ('epic-adventures', 'House of David', 7),
  ('family-movie-night', 'Klaus', 1),
  ('family-movie-night', 'Jonah: A VeggieTales Movie', 2),
  ('family-movie-night', 'The Chronicles of Narnia: The Lion, the Witch and the Wardrobe', 3),
  ('family-movie-night', 'The Best Christmas Pageant Ever', 4),
  ('family-movie-night', 'The Pirates Who Don''t Do Anything: A VeggieTales Movie', 5),
  ('family-movie-night', 'The Chronicles of Narnia: Prince Caspian', 6),
  ('family-movie-night', 'The Ultimate Gift', 7),
  ('family-movie-night', 'VeggieTales: Lord of the Beans', 8),
  ('family-movie-night', 'The Chronicles of Narnia: The Voyage of the Dawn Treader', 9)
) as v (slug, title_name, position)
join public.collections c on c.slug = v.slug
join public.titles t on t.name = v.title_name
on conflict (collection_id, title_id) do update set position = excluded.position;

-- Genres, used by the genre filter buttons.
insert into public.genres (name)
values ('Adventure'), ('Animation'), ('Biblical'), ('Biography'), ('Comedy'),
       ('Drama'), ('Family'), ('Fantasy'), ('War')
on conflict (name) do nothing;

insert into public.title_genres (title_id, genre_id)
select t.id, g.id
from (values
  ('Hacksaw Ridge', 'War'), ('Hacksaw Ridge', 'Drama'), ('Hacksaw Ridge', 'Biography'),
  ('The Ultimate Gift', 'Drama'), ('The Ultimate Gift', 'Family'),
  ('End of the Spear', 'Drama'), ('End of the Spear', 'Biography'), ('End of the Spear', 'Adventure'),
  ('Unbroken', 'War'), ('Unbroken', 'Drama'), ('Unbroken', 'Biography'),
  ('The Best Christmas Pageant Ever', 'Comedy'), ('The Best Christmas Pageant Ever', 'Family'),
  ('Klaus', 'Animation'), ('Klaus', 'Family'), ('Klaus', 'Comedy'),
  ('Jonah: A VeggieTales Movie', 'Animation'), ('Jonah: A VeggieTales Movie', 'Family'),
  ('Jonah: A VeggieTales Movie', 'Comedy'), ('Jonah: A VeggieTales Movie', 'Biblical'),
  ('The Pirates Who Don''t Do Anything: A VeggieTales Movie', 'Animation'),
  ('The Pirates Who Don''t Do Anything: A VeggieTales Movie', 'Family'),
  ('The Pirates Who Don''t Do Anything: A VeggieTales Movie', 'Comedy'),
  ('The Pirates Who Don''t Do Anything: A VeggieTales Movie', 'Adventure'),
  ('VeggieTales: Lord of the Beans', 'Animation'), ('VeggieTales: Lord of the Beans', 'Family'),
  ('VeggieTales: Lord of the Beans', 'Comedy'),
  ('The Chronicles of Narnia: The Lion, the Witch and the Wardrobe', 'Fantasy'),
  ('The Chronicles of Narnia: The Lion, the Witch and the Wardrobe', 'Adventure'),
  ('The Chronicles of Narnia: The Lion, the Witch and the Wardrobe', 'Family'),
  ('The Chronicles of Narnia: Prince Caspian', 'Fantasy'),
  ('The Chronicles of Narnia: Prince Caspian', 'Adventure'),
  ('The Chronicles of Narnia: Prince Caspian', 'Family'),
  ('The Chronicles of Narnia: The Voyage of the Dawn Treader', 'Fantasy'),
  ('The Chronicles of Narnia: The Voyage of the Dawn Treader', 'Adventure'),
  ('The Chronicles of Narnia: The Voyage of the Dawn Treader', 'Family'),
  ('The Lord of the Rings: The Fellowship of the Ring', 'Fantasy'),
  ('The Lord of the Rings: The Fellowship of the Ring', 'Adventure'),
  ('The Lord of the Rings: The Two Towers', 'Fantasy'),
  ('The Lord of the Rings: The Two Towers', 'Adventure'),
  ('The Lord of the Rings: The Return of the King', 'Fantasy'),
  ('The Lord of the Rings: The Return of the King', 'Adventure'),
  ('The Chosen', 'Drama'), ('The Chosen', 'Biblical'),
  ('The Promised Land', 'Drama'), ('The Promised Land', 'Biblical'),
  ('House of David', 'Drama'), ('House of David', 'Biblical')
) as v (title_name, genre_name)
join public.titles t on t.name = v.title_name
join public.genres g on g.name = v.genre_name
on conflict do nothing;

-- Landscape backdrops (from The Movie Database). Needs the 20261015060000 migration.
update public.titles t
set backdrop_url = 'https://image.tmdb.org/t/p/w780/' || v.image
from (values
  ('Hacksaw Ridge', 'vDKRMZGFTKP9nQolzeSB1rB1w6p.jpg'),
  ('The Ultimate Gift', 't6ohjYxnEolUGupwvsIHioWfVxl.jpg'),
  ('End of the Spear', 'ghbiFYjiPGH3s4mEv7O9qRGGcvk.jpg'),
  ('Unbroken', 'wxdtjlapI0d1vsXhNN0LhLMsaGw.jpg'),
  ('The Best Christmas Pageant Ever', '1AIwhOIMktmgesIqNcwUsQWYLl5.jpg'),
  ('Klaus', 'cYQvXNPZLow73lhspVQ7CYlT3Mi.jpg'),
  ('Jonah: A VeggieTales Movie', 'f02gitQgX3QocVeeqgak8U6LZB4.jpg'),
  ('The Pirates Who Don''t Do Anything: A VeggieTales Movie', 'qnrtxlmvWGYzNKxtNnh8sd29j9w.jpg'),
  ('VeggieTales: Lord of the Beans', '5PyYI5tZzGCrZqBEkYWIOADZF5r.jpg'),
  ('The Chronicles of Narnia: The Lion, the Witch and the Wardrobe', 'tuDhEdza074bA497bO9WFEPs6O6.jpg'),
  ('The Chronicles of Narnia: Prince Caspian', '9pBv1BOSloAUgAkF0meJWdnbV4Q.jpg'),
  ('The Chronicles of Narnia: The Voyage of the Dawn Treader', 'oc3be3waruLd0PB9h4bomN7Le3v.jpg'),
  ('The Lord of the Rings: The Fellowship of the Ring', 'oiwc338EoBgS4sEI2ixAny4KQKg.jpg'),
  ('The Lord of the Rings: The Two Towers', '6G73mNyooWAEQTpckPSnFxFoNmc.jpg'),
  ('The Lord of the Rings: The Return of the King', 'ctiw6FZK4N36LmkjSklWEbuvlq9.jpg'),
  ('The Chosen', '3siv3RaQrdr2tQiv9jHq71sLlzo.jpg'),
  ('The Promised Land', 'koJpCFtMQPApmqZ4d3dy3KhlXAA.jpg'),
  ('House of David', 'tWLGlPOYgiqkFgm3S1ub2MeXFGJ.jpg')
) as v (name, image)
where t.name = v.name and t.backdrop_url is null;

-- Title logos (from The Movie Database). Needs the 20261015070000 migration.
update public.titles t
set logo_url = 'https://image.tmdb.org/t/p/w500/' || v.image
from (values
  ('Hacksaw Ridge', 'gAv138RfAa2oWd7xAQqE9mwt2sU.png'),
  ('The Ultimate Gift', 'c12Bt3Zb73dKvB4cWuoG2EbVjO4.png'),
  ('End of the Spear', 'svU2JD8S8L0gP4oVLL4s3f6KoWV.png'),
  ('Unbroken', 'csVuItTrhq97TfaxZFtvCQPUrUN.png'),
  ('The Best Christmas Pageant Ever', 'd29NHm5Hu85cH6hlhBAVfqIjItZ.png'),
  ('Klaus', '7fqtf9iQCrmF05Nsk2qjZsgxOpu.png'),
  ('Jonah: A VeggieTales Movie', 'mtXBVv6MYF9BFIN7Q7Ef2G3DbTQ.png'),
  ('The Pirates Who Don''t Do Anything: A VeggieTales Movie', 'yRn93aKRCEnE7IzDSmGCMKUqqsP.png'),
  ('The Chronicles of Narnia: The Lion, the Witch and the Wardrobe', '3NiYgbqQVPfTKwG4HWPusfAIPav.png'),
  ('The Chronicles of Narnia: Prince Caspian', 'bXYYTYBZBTj9C9BwyoxG83Ir6S0.png'),
  ('The Chronicles of Narnia: The Voyage of the Dawn Treader', 'oVy4qtKNJRI1q8NHZPpNM02g2FH.png'),
  ('The Lord of the Rings: The Fellowship of the Ring', '87sl6r7n7Qx0fALtLZFxM3mU3KM.png'),
  ('The Lord of the Rings: The Two Towers', 'wQKPueRWijP8kxqVvT4KtkjFHJ0.png'),
  ('The Lord of the Rings: The Return of the King', 'mZtF6SOsVddoK3I3VLi2oTZ5BR2.png'),
  ('The Chosen', '8oywdWTaWK7CZN9NsZWrQkTZTWw.png'),
  ('The Promised Land', 'gPJMSXwpH4yQfWbaTbHfbTQdtZY.png'),
  ('House of David', '16AAtyXLWCIQThpS5LQXvZJY0bd.png')
) as v (name, image)
where t.name = v.name and t.logo_url is null;
