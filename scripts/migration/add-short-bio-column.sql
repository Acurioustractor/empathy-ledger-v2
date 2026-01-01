-- Add short_bio column to profiles table for card display
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS short_bio TEXT;

-- Add a comment to describe the column
COMMENT ON COLUMN profiles.short_bio IS 'Short 2-sentence bio for profile cards, max 120 characters';