/*
  # Add social features and achievements

  1. Changes
    - Add points and referral fields to user_profiles
    - Add wallets array to user_profiles
    - Update achievements table with new achievements
    - Add featured_until to tokens table
*/

-- Add new fields to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
ADD COLUMN IF NOT EXISTS wallets text[] DEFAULT ARRAY[]::text[];

-- Add featured_until to tokens
ALTER TABLE tokens
ADD COLUMN IF NOT EXISTS featured_until timestamptz;

-- Insert new achievements
INSERT INTO achievements (name, description, image_url, criteria) VALUES
  (
    'Meme Pioneer',
    'First to launch a token based on a trending X meme',
    'https://i.imgur.com/meme_pioneer.png',
    '{"type": "first_meme_token", "platform": "twitter"}'
  ),
  (
    'Holder Magnet',
    'Token reached 100+ holders',
    'https://i.imgur.com/holder_magnet.png',
    '{"type": "holders_milestone", "count": 100}'
  ),
  (
    'Community Builder',
    'Referred 5 new users who launched tokens',
    'https://i.imgur.com/community_builder.png',
    '{"type": "successful_referrals", "count": 5}'
  ),
  (
    'Launch Streak',
    'Launched tokens 3 days in a row',
    'https://i.imgur.com/launch_streak.png',
    '{"type": "daily_launches", "days": 3}'
  );

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
DECLARE
  chars text[] := ARRAY['A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','S','T','U','V','W','X','Y','Z','2','3','4','5','6','7','8','9'];
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || chars[1 + floor(random() * array_length(chars, 1))];
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Update handle_new_user function to generate referral code
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id,
    username,
    referral_code
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    generate_referral_code()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;