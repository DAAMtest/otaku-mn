-- Create downloads table if it doesn't exist
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anime_id UUID NOT NULL REFERENCES anime(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_path TEXT,
  file_size INTEGER,
  is_completed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, episode_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS downloads_user_id_idx ON downloads(user_id);
CREATE INDEX IF NOT EXISTS downloads_anime_id_idx ON downloads(anime_id);

-- Enable row level security
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own downloads" ON downloads;
CREATE POLICY "Users can view their own downloads"
  ON downloads FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own downloads" ON downloads;
CREATE POLICY "Users can insert their own downloads"
  ON downloads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own downloads" ON downloads;
CREATE POLICY "Users can update their own downloads"
  ON downloads FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own downloads" ON downloads;
CREATE POLICY "Users can delete their own downloads"
  ON downloads FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime
alter publication supabase_realtime add table downloads;
