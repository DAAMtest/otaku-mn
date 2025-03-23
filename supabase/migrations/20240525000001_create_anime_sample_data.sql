-- Create sample anime data

-- Insert genres
INSERT INTO genres (id, name, created_at)
VALUES 
  (gen_random_uuid(), 'Action', NOW()),
  (gen_random_uuid(), 'Adventure', NOW()),
  (gen_random_uuid(), 'Comedy', NOW()),
  (gen_random_uuid(), 'Drama', NOW()),
  (gen_random_uuid(), 'Fantasy', NOW()),
  (gen_random_uuid(), 'Horror', NOW()),
  (gen_random_uuid(), 'Mystery', NOW()),
  (gen_random_uuid(), 'Romance', NOW()),
  (gen_random_uuid(), 'Sci-Fi', NOW()),
  (gen_random_uuid(), 'Slice of Life', NOW()),
  (gen_random_uuid(), 'Sports', NOW()),
  (gen_random_uuid(), 'Supernatural', NOW()),
  (gen_random_uuid(), 'Thriller', NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert sample anime
INSERT INTO anime (id, title, alternative_titles, description, image_url, cover_image_url, release_date, release_year, season, status, rating, popularity, created_at)
VALUES
  (
    gen_random_uuid(),
    'Cosmic Odyssey',
    ARRAY['宇宙の旅', 'Voyage Cosmique'],
    'A thrilling space adventure that follows the crew of the starship Nebula as they explore uncharted galaxies and encounter mysterious alien civilizations.',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80',
    'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1200&q=80',
    '2023-04-15',
    2023,
    'Spring',
    'Ongoing',
    4.8,
    95,
    NOW()
  ),
  (
    gen_random_uuid(),
    'Samurai Spirit',
    ARRAY['侍の魂', 'Esprit du Samouraï'],
    'Set in feudal Japan, this historical drama follows a masterless samurai seeking redemption while protecting a small village from ruthless bandits.',
    'https://images.unsplash.com/photo-1611457194403-d3aca4cf9d11?w=800&q=80',
    'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=1200&q=80',
    '2022-10-10',
    2022,
    'Fall',
    'Completed',
    4.9,
    98,
    NOW()
  ),
  (
    gen_random_uuid(),
    'Digital Dreamers',
    ARRAY['デジタルドリーマーズ', 'Rêveurs Numériques'],
    'In a near-future world where virtual reality has become indistinguishable from reality, a group of hackers discovers a conspiracy that threatens to blur the lines between the digital and physical worlds forever.',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&q=80',
    '2023-01-20',
    2023,
    'Winter',
    'Ongoing',
    4.6,
    92,
    NOW()
  ),
  (
    gen_random_uuid(),
    'Magical Academy',
    ARRAY['魔法学園', 'Académie Magique'],
    'When an ordinary teenager discovers they possess extraordinary magical abilities, they are invited to attend an elite school for young mages where they must learn to control their powers while uncovering dark secrets about the magical world.',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
    'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=1200&q=80',
    '2022-07-05',
    2022,
    'Summer',
    'Completed',
    4.7,
    94,
    NOW()
  ),
  (
    gen_random_uuid(),
    'Culinary Battles',
    ARRAY['料理バトル', 'Batailles Culinaires'],
    'In the high-stakes world of competitive cooking, aspiring chefs from around the world compete in increasingly challenging culinary contests to be crowned the ultimate food master.',
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80',
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=80',
    '2023-07-15',
    2023,
    'Summer',
    'Ongoing',
    4.5,
    90,
    NOW()
  );

-- Link anime to genres
WITH 
  anime_data AS (
    SELECT id FROM anime WHERE title = 'Cosmic Odyssey' LIMIT 1
  ),
  genre_data AS (
    SELECT id FROM genres WHERE name IN ('Sci-Fi', 'Adventure', 'Action') 
  )
INSERT INTO anime_genres (anime_id, genre_id)
SELECT anime_data.id, genre_data.id 
FROM anime_data, genre_data;

WITH 
  anime_data AS (
    SELECT id FROM anime WHERE title = 'Samurai Spirit' LIMIT 1
  ),
  genre_data AS (
    SELECT id FROM genres WHERE name IN ('Action', 'Drama', 'Historical') 
  )
INSERT INTO anime_genres (anime_id, genre_id)
SELECT anime_data.id, genre_data.id 
FROM anime_data, genre_data;

WITH 
  anime_data AS (
    SELECT id FROM anime WHERE title = 'Digital Dreamers' LIMIT 1
  ),
  genre_data AS (
    SELECT id FROM genres WHERE name IN ('Sci-Fi', 'Thriller', 'Mystery') 
  )
INSERT INTO anime_genres (anime_id, genre_id)
SELECT anime_data.id, genre_data.id 
FROM anime_data, genre_data;

WITH 
  anime_data AS (
    SELECT id FROM anime WHERE title = 'Magical Academy' LIMIT 1
  ),
  genre_data AS (
    SELECT id FROM genres WHERE name IN ('Fantasy', 'Adventure', 'Supernatural') 
  )
INSERT INTO anime_genres (anime_id, genre_id)
SELECT anime_data.id, genre_data.id 
FROM anime_data, genre_data;

WITH 
  anime_data AS (
    SELECT id FROM anime WHERE title = 'Culinary Battles' LIMIT 1
  ),
  genre_data AS (
    SELECT id FROM genres WHERE name IN ('Comedy', 'Slice of Life') 
  )
INSERT INTO anime_genres (anime_id, genre_id)
SELECT anime_data.id, genre_data.id 
FROM anime_data, genre_data;

-- Create episodes for each anime
WITH anime_ids AS (
  SELECT id FROM anime ORDER BY created_at DESC LIMIT 5
)
INSERT INTO episodes (id, anime_id, title, description, thumbnail_url, video_url, duration, episode_number, created_at)
SELECT 
  gen_random_uuid(),
  id,
  'Episode ' || episode_num || ': ' || 
    CASE 
      WHEN episode_num = 1 THEN 'The Beginning'
      WHEN episode_num = 2 THEN 'New Challenges'
      WHEN episode_num = 3 THEN 'Unexpected Allies'
      WHEN episode_num = 4 THEN 'The Revelation'
      ELSE 'The Journey Continues'
    END,
  CASE 
    WHEN episode_num = 1 THEN 'The adventure begins as our heroes set out on their journey.'
    WHEN episode_num = 2 THEN 'The team faces their first major obstacle and must work together to overcome it.'
    WHEN episode_num = 3 THEN 'Unexpected help arrives just when all seems lost.'
    WHEN episode_num = 4 THEN 'A shocking truth is revealed that changes everything.'
    ELSE 'The journey continues with new discoveries and challenges.'
  END,
  'https://images.unsplash.com/photo-' || (1550000000 + episode_num * 10000000) || '-' || (100000000 + episode_num * 1000000) || '?w=800&q=80',
  'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
  (20 + episode_num) || ':' || (CASE WHEN episode_num < 3 THEN '0' ELSE '' END) || (episode_num * 10),
  episode_num,
  NOW() - INTERVAL '1 day' * episode_num
FROM anime_ids, generate_series(1, 5) AS episode_num;

-- Create anime relations
WITH anime_list AS (
  SELECT id, title FROM anime ORDER BY created_at DESC LIMIT 5
)
INSERT INTO anime_relations (anime_id, related_anime_id, relation_type)
SELECT 
  a1.id,
  a2.id,
  CASE 
    WHEN a1.title < a2.title THEN 'sequel'
    ELSE 'prequel'
  END
FROM anime_list a1
JOIN anime_list a2 ON a1.id <> a2.id
WHERE a1.title <> a2.title
LIMIT 10;