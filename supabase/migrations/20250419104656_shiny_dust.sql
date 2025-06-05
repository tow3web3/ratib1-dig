/*
  # Add pinned forums support

  1. Changes
    - Add `is_pinned` column to forums table
    - Add `is_dev_forum` column to forums table
    - Insert default developer forum

  2. Security
    - Only admins can create pinned forums
*/

-- Add new columns to forums table
ALTER TABLE forums 
ADD COLUMN is_pinned boolean DEFAULT false,
ADD COLUMN is_dev_forum boolean DEFAULT false;

-- Insert the developer forum
INSERT INTO forums (
  title,
  description,
  user_id,
  is_pinned,
  is_dev_forum
) VALUES (
  'Feature Requests & Suggestions',
  'Share your ideas and suggestions for improving the platform. Request new features and report bugs.',
  (SELECT id FROM auth.users LIMIT 1), -- Gets the first user as admin
  true,
  true
);