/*
  # Add social features and achievements

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `username` (text, unique)
      - `bio` (text)
      - `avatar_url` (text)
      - `created_at` (timestamp)
    
    - `tokens`
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references auth.users)
      - `name` (text)
      - `symbol` (text)
      - `description` (text)
      - `image_url` (text)
      - `contract_address` (text)
      - `created_at` (timestamp)
      - `likes_count` (integer)
      - `holders_count` (integer)
      - `volume_24h` (numeric)
    
    - `token_likes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `token_id` (uuid, references tokens)
      - `created_at` (timestamp)
    
    - `token_comments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `token_id` (uuid, references tokens)
      - `content` (text)
      - `created_at` (timestamp)
    
    - `achievements`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `image_url` (text)
      - `criteria` (jsonb)
      - `created_at` (timestamp)
    
    - `user_achievements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `achievement_id` (uuid, references achievements)
      - `earned_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
  username text UNIQUE NOT NULL,
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Create tokens table
CREATE TABLE IF NOT EXISTS tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  symbol text NOT NULL,
  description text,
  image_url text,
  contract_address text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  likes_count integer DEFAULT 0,
  holders_count integer DEFAULT 0,
  volume_24h numeric DEFAULT 0,
  CONSTRAINT symbol_format CHECK (symbol ~ '^[A-Z0-9]+$')
);

-- Create token_likes table
CREATE TABLE IF NOT EXISTS token_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  token_id uuid REFERENCES tokens NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, token_id)
);

-- Create token_comments table
CREATE TABLE IF NOT EXISTS token_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  token_id uuid REFERENCES tokens NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  criteria jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  achievement_id uuid REFERENCES achievements NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tokens policies
CREATE POLICY "Tokens are viewable by everyone"
  ON tokens FOR SELECT
  USING (true);

CREATE POLICY "Users can create tokens"
  ON tokens FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

-- Token likes policies
CREATE POLICY "Token likes are viewable by everyone"
  ON token_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like tokens"
  ON token_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike tokens"
  ON token_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Token comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON token_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON token_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON token_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Achievements are viewable by everyone"
  ON achievements FOR SELECT
  USING (true);

-- User achievements policies
CREATE POLICY "User achievements are viewable by everyone"
  ON user_achievements FOR SELECT
  USING (true);

-- Insert default achievements
INSERT INTO achievements (name, description, image_url, criteria) VALUES
  (
    'First Token Creator',
    'Created your first token on the platform',
    'https://i.imgur.com/first_token.png',
    '{"type": "token_created", "count": 1}'
  ),
  (
    'Viral Success',
    'One of your tokens reached 100+ holders',
    'https://i.imgur.com/viral_token.png',
    '{"type": "token_holders", "count": 100}'
  ),
  (
    'Trending Pioneer',
    'First to tokenize a trending topic',
    'https://i.imgur.com/trend_pioneer.png',
    '{"type": "first_trend_token", "trend_id": null}'
  ),
  (
    'Community Favorite',
    'Received 1000+ likes across all your tokens',
    'https://i.imgur.com/community_favorite.png',
    '{"type": "total_likes", "count": 1000}'
  );

-- Create function to update token likes count
CREATE OR REPLACE FUNCTION update_token_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tokens 
    SET likes_count = likes_count + 1
    WHERE id = NEW.token_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tokens 
    SET likes_count = likes_count - 1
    WHERE id = OLD.token_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for token likes
CREATE TRIGGER update_token_likes_count_trigger
AFTER INSERT OR DELETE ON token_likes
FOR EACH ROW
EXECUTE FUNCTION update_token_likes_count();