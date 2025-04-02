-- Create watch_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS watch_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anime_id UUID NOT NULL REFERENCES anime(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, episode_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS watch_history_user_id_idx ON watch_history(user_id);
CREATE INDEX IF NOT EXISTS watch_history_anime_id_idx ON watch_history(anime_id);

-- Enable row level security
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own watch history" ON watch_history;
CREATE POLICY "Users can view their own watch history"
  ON watch_history FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own watch history" ON watch_history;
CREATE POLICY "Users can insert their own watch history"
  ON watch_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own watch history" ON watch_history;
CREATE POLICY "Users can update their own watch history"
  ON watch_history FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own watch history" ON watch_history;
CREATE POLICY "Users can delete their own watch history"
  ON watch_history FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime
alter publication supabase_realtime add table watch_history;
