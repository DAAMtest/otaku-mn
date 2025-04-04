-- Enable Row Level Security on all tables
ALTER TABLE anime ENABLE ROW LEVEL SECURITY;
ALTER TABLE anime_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE anime_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_anime_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- Public access policies for anime, genres, episodes (read-only)
DROP POLICY IF EXISTS "Public anime access" ON anime;
CREATE POLICY "Public anime access"
ON anime FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Public genres access" ON genres;
CREATE POLICY "Public genres access"
ON genres FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Public anime_genres access" ON anime_genres;
CREATE POLICY "Public anime_genres access"
ON anime_genres FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Public episodes access" ON episodes;
CREATE POLICY "Public episodes access"
ON episodes FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Public anime_relations access" ON anime_relations;
CREATE POLICY "Public anime_relations access"
ON anime_relations FOR SELECT
USING (true);

-- User-specific policies for user_anime_lists
DROP POLICY IF EXISTS "Users can view their own lists" ON user_anime_lists;
CREATE POLICY "Users can view their own lists"
ON user_anime_lists FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert to their own lists" ON user_anime_lists;
CREATE POLICY "Users can insert to their own lists"
ON user_anime_lists FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own lists" ON user_anime_lists;
CREATE POLICY "Users can update their own lists"
ON user_anime_lists FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete from their own lists" ON user_anime_lists;
CREATE POLICY "Users can delete from their own lists"
ON user_anime_lists FOR DELETE
USING (auth.uid() = user_id);

-- User-specific policies for watch_history
DROP POLICY IF EXISTS "Users can view their own watch history" ON watch_history;
CREATE POLICY "Users can view their own watch history"
ON watch_history FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert to their own watch history" ON watch_history;
CREATE POLICY "Users can insert to their own watch history"
ON watch_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own watch history" ON watch_history;
CREATE POLICY "Users can update their own watch history"
ON watch_history FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete from their own watch history" ON watch_history;
CREATE POLICY "Users can delete from their own watch history"
ON watch_history FOR DELETE
USING (auth.uid() = user_id);

-- User profile policies
DROP POLICY IF EXISTS "Users can view any profile" ON users;
CREATE POLICY "Users can view any profile"
ON users FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Enable realtime for relevant tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'user_anime_lists'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_anime_lists;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'watch_history'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE watch_history;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'users'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE users;
  END IF;
END
$$;