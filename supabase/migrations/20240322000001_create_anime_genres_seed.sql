-- Create genres if they don't exist yet
INSERT INTO public.genres (name) VALUES
('Action'),
('Adventure'),
('Comedy'),
('Drama'),
('Fantasy'),
('Horror'),
('Mecha'),
('Romance'),
('Sci-Fi'),
('Slice of Life'),
('Sports')
ON CONFLICT (name) DO NOTHING;

-- Enable realtime for all tables
alter publication supabase_realtime add table anime;
alter publication supabase_realtime add table anime_genres;
alter publication supabase_realtime add table genres;
alter publication supabase_realtime add table user_anime_lists;
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table watch_history;
