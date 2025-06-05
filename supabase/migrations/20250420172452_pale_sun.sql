/*
  # Fix user profile and achievements setup

  1. Changes
    - Add missing columns to user_profiles
    - Create missing achievements
    - Add trigger for referral points
*/

-- Ensure user_profiles has all required columns
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE DEFAULT generate_referral_code(),
ADD COLUMN IF NOT EXISTS wallets text[] DEFAULT ARRAY[]::text[];

-- Create achievements if they don't exist
INSERT INTO achievements (name, description, image_url, criteria)
SELECT 'First Token Creator', 'Created your first token on the platform', 'https://i.imgur.com/first_token.png', '{"type": "token_created", "count": 1}'
WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE name = 'First Token Creator');

INSERT INTO achievements (name, description, image_url, criteria)
SELECT 'Viral Success', 'One of your tokens reached 100+ holders', 'https://i.imgur.com/viral_token.png', '{"type": "token_holders", "count": 100}'
WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE name = 'Viral Success');

INSERT INTO achievements (name, description, image_url, criteria)
SELECT 'Trending Pioneer', 'First to tokenize a trending topic', 'https://i.imgur.com/trend_pioneer.png', '{"type": "first_trend_token", "trend_id": null}'
WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE name = 'Trending Pioneer');

INSERT INTO achievements (name, description, image_url, criteria)
SELECT 'Community Favorite', 'Received 1000+ likes across all your tokens', 'https://i.imgur.com/community_favorite.png', '{"type": "total_likes", "count": 1000}'
WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE name = 'Community Favorite');

-- Create function to handle referral points
CREATE OR REPLACE FUNCTION handle_referral_points()
RETURNS trigger AS $$
BEGIN
  -- Add points to referrer when a new user signs up using their code
  IF NEW.referral_code IS NOT NULL THEN
    UPDATE user_profiles
    SET points = points + 100  -- Adjust point value as needed
    WHERE referral_code = NEW.referral_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for referral points
DROP TRIGGER IF EXISTS on_user_referred ON user_profiles;
CREATE TRIGGER on_user_referred
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_referral_points();

-- Update existing users with referral codes if they don't have one
UPDATE user_profiles
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL;