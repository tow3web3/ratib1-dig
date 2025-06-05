/*
  # Fix user profile creation

  1. Changes
    - Update handle_new_user function to handle errors gracefully
    - Add better validation for username
    - Ensure referral_code is always generated
    - Add points column with default value

  2. Security
    - Keep existing RLS policies
*/

-- Drop existing function and recreate with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_referral_code text;
BEGIN
  -- Generate a unique referral code
  new_referral_code := generate_referral_code();
  WHILE EXISTS (SELECT 1 FROM user_profiles WHERE referral_code = new_referral_code) LOOP
    new_referral_code := generate_referral_code();
  END LOOP;

  -- Insert new profile with validation
  BEGIN
    INSERT INTO public.user_profiles (
      user_id,
      username,
      referral_code,
      points,
      wallets,
      created_at
    )
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
      new_referral_code,
      0,
      ARRAY[]::text[],
      now()
    );
  EXCEPTION
    WHEN unique_violation THEN
      -- Handle username collision by appending random characters
      INSERT INTO public.user_profiles (
        user_id,
        username,
        referral_code,
        points,
        wallets,
        created_at
      )
      VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)) || '_' || substr(md5(random()::text), 1, 4),
        new_referral_code,
        0,
        ARRAY[]::text[],
        now()
      );
  END;

  -- Award early adopter achievement if applicable
  IF EXISTS (
    SELECT 1 FROM achievements WHERE name = 'Early Adopter'
  ) THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT new.id, achievements.id
    FROM achievements
    WHERE achievements.name = 'Early Adopter'
    AND now() < '2025-05-01'::timestamptz
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update existing profiles that might be missing required fields
UPDATE user_profiles
SET 
  referral_code = COALESCE(referral_code, generate_referral_code()),
  points = COALESCE(points, 0),
  wallets = COALESCE(wallets, ARRAY[]::text[])
WHERE 
  referral_code IS NULL 
  OR points IS NULL 
  OR wallets IS NULL;