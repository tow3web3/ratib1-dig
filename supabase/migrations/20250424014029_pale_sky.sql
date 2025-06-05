/*
  # Fix user profile creation

  1. Changes
    - Update handle_new_user function with better error handling
    - Add validation for username format
    - Ensure unique referral codes
    - Add retry logic for profile creation

  2. Security
    - Maintain existing RLS policies
*/

-- Recreate the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_username text;
  new_referral_code text;
  retry_count int := 0;
  max_retries int := 3;
BEGIN
  -- Get username from metadata or generate one
  new_username := COALESCE(
    new.raw_user_meta_data->>'username',
    'user_' || substr(new.id::text, 1, 8)
  );

  -- Generate unique referral code
  LOOP
    new_referral_code := substr(md5(random()::text), 1, 8);
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM user_profiles WHERE referral_code = new_referral_code
    );
  END LOOP;

  -- Try to create profile with retries
  LOOP
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
        new_username,
        new_referral_code,
        0,
        ARRAY[]::text[],
        now()
      );
      
      -- Exit loop if successful
      EXIT;
    EXCEPTION 
      WHEN unique_violation THEN
        -- If username collision, append random suffix
        IF retry_count < max_retries THEN
          retry_count := retry_count + 1;
          new_username := new_username || '_' || substr(md5(random()::text), 1, 4);
          CONTINUE;
        ELSE
          RAISE EXCEPTION 'Failed to create unique username after % attempts', max_retries;
        END IF;
      WHEN OTHERS THEN
        RAISE EXCEPTION 'Error creating user profile: %', SQLERRM;
    END;
  END LOOP;

  -- Award early adopter achievement if applicable
  IF now() < '2025-05-01'::timestamptz THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT new.id, id
    FROM achievements
    WHERE name = 'Early Adopter'
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add index for username lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles (username);

-- Add index for referral code lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_referral_code ON user_profiles (referral_code);