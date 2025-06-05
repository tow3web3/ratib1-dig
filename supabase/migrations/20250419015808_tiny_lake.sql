/*
  # Add Live Feed Suggestions and Voting

  1. New Tables
    - `live_feed_suggestions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `keyword` (text)
      - `created_at` (timestamp)
    - `live_feed_votes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `suggestion_id` (uuid, references live_feed_suggestions)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create live feed suggestions table
CREATE TABLE IF NOT EXISTS live_feed_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  keyword text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS live_feed_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  suggestion_id uuid REFERENCES live_feed_suggestions ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, suggestion_id)
);

-- Enable RLS
ALTER TABLE live_feed_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_feed_votes ENABLE ROW LEVEL SECURITY;

-- Live feed suggestion policies
CREATE POLICY "Live feed suggestions are viewable by everyone"
  ON live_feed_suggestions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create one live feed suggestion"
  ON live_feed_suggestions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    NOT EXISTS (
      SELECT 1 FROM live_feed_suggestions
      WHERE user_id = auth.uid()
    )
  );

-- Vote policies
CREATE POLICY "Votes are viewable by everyone"
  ON live_feed_votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can vote"
  ON live_feed_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their votes"
  ON live_feed_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);