-- Add is_featured field to profiles table for featuring storytellers on homepage
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Create an index for faster filtering by featured status
CREATE INDEX IF NOT EXISTS idx_profiles_is_featured ON profiles(is_featured);

-- Update some existing profiles to be featured (those with 3+ stories)
UPDATE profiles
SET is_featured = TRUE
WHERE id IN (
  SELECT author_id 
  FROM stories 
  WHERE status = 'published'
  GROUP BY author_id
  HAVING COUNT(*) >= 3
);