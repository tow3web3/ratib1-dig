/*
  # Fix profile schema and relationships

  1. Changes
    - Add missing relationships between tables
    - Add creator_id to tokens
    - Update user_profiles schema
    - Add default achievements

  2. Security
    - Update RLS policies
*/

-- Add creator_id to tokens if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tokens' AND column_name = 'creator_id'
  ) THEN
    ALTER TABLE tokens ADD COLUMN creator_id uuid REFERENCES auth.users;
  END IF;
END $$;

-- Create function to generate referral code if it doesn't exist
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
DECLARE
  code text;
BEGIN
  code := substr(md5(random()::text), 1, 8);
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Ensure user_profiles has all required fields
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE DEFAULT generate_referral_code(),
ADD COLUMN IF NOT EXISTS wallets text[] DEFAULT ARRAY[]::text[];

-- Add foreign key from tokens to user_profiles
ALTER TABLE tokens
DROP CONSTRAINT IF EXISTS tokens_creator_id_fkey,
ADD CONSTRAINT tokens_creator_id_fkey 
  FOREIGN KEY (creator_id) 
  REFERENCES auth.users(id);

-- Create user_achievements if it doesn't exist
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  achievement_id uuid REFERENCES achievements NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS on user_achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and recreate it
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "User achievements are viewable by everyone" ON user_achievements;
  CREATE POLICY "User achievements are viewable by everyone"
    ON user_achievements FOR SELECT
    USING (true);
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Insert default achievements if they don't exist
INSERT INTO achievements (name, description, image_url, criteria)
SELECT 'Early Adopter', 'One of the first users to join the platform', 'https://i.imgur.com/early_adopter.png', '{"type": "join_date", "before": "2025-05-01"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE name = 'Early Adopter');

INSERT INTO achievements (name, description, image_url, criteria)
SELECT 'Token Creator', 'Created your first token', 'https://i.imgur.com/token_creator.png', '{"type": "tokens_created", "count": 1}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE name = 'Token Creator');

-- Add trigger for new user achievement
CREATE OR REPLACE FUNCTION award_early_adopter_achievement()
RETURNS trigger AS $$
BEGIN
  -- Award Early Adopter achievement to new users who join before May 1st, 2025
  IF NEW.created_at < '2025-05-01'::timestamptz THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT NEW.user_id, achievements.id
    FROM achievements
    WHERE achievements.name = 'Early Adopter'
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for early adopter achievement
DROP TRIGGER IF EXISTS on_profile_created_achievement ON user_profiles;
CREATE TRIGGER on_profile_created_achievement
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION award_early_adopter_achievement();