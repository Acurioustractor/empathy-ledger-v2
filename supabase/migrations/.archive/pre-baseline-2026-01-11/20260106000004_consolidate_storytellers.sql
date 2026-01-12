-- Migration: Consolidate all storyteller data and align tables
-- Purpose: Ensure all profiles that should be storytellers are in the storytellers table
--          and all avatar URLs are properly synced

-- Step 1: Insert any missing storytellers (profiles marked as storytellers but not in storytellers table)
INSERT INTO public.storytellers (
  profile_id,
  display_name,
  bio,
  cultural_background,
  language_skills,
  avatar_url,
  is_active,
  created_at,
  updated_at
)
SELECT
  p.id as profile_id,
  COALESCE(p.display_name, p.full_name, 'Anonymous') as display_name,
  p.bio,
  p.cultural_affiliations as cultural_background,
  p.languages_spoken as language_skills,
  COALESCE(p.profile_image_url, p.avatar_url) as avatar_url,
  true as is_active,
  p.created_at,
  p.updated_at
FROM profiles p
LEFT JOIN storytellers st ON p.id = st.profile_id
WHERE st.id IS NULL
  AND p.is_storyteller = true
ON CONFLICT (profile_id) DO NOTHING;

-- Step 2: Update existing storytellers with missing avatar URLs
UPDATE storytellers st
SET
  avatar_url = COALESCE(p.profile_image_url, p.avatar_url),
  updated_at = NOW()
FROM profiles p
WHERE st.profile_id = p.id
  AND (st.avatar_url IS NULL OR st.avatar_url = '')
  AND (p.profile_image_url IS NOT NULL OR p.avatar_url IS NOT NULL);

-- Step 3: Update storytellers with latest profile data (display_name, bio, cultural info)
UPDATE storytellers st
SET
  display_name = COALESCE(p.display_name, p.full_name, st.display_name, 'Anonymous'),
  bio = COALESCE(p.bio, st.bio),
  cultural_background = COALESCE(p.cultural_affiliations, st.cultural_background),
  language_skills = COALESCE(p.languages_spoken, st.language_skills),
  updated_at = NOW()
FROM profiles p
WHERE st.profile_id = p.id;

-- Step 4: Create index on storytellers.profile_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_storytellers_profile_id ON storytellers(profile_id);

-- Step 5: Create index on storytellers.avatar_url for filtering
CREATE INDEX IF NOT EXISTS idx_storytellers_avatar_url ON storytellers(avatar_url) WHERE avatar_url IS NOT NULL;

-- Step 6: Add comment to document the relationship
COMMENT ON TABLE storytellers IS 'Storytellers table - profiles who share stories. Links to profiles table via profile_id. All storyteller-specific data should be stored here.';
COMMENT ON COLUMN storytellers.profile_id IS 'Foreign key to profiles.id - the user profile this storyteller represents';
COMMENT ON COLUMN storytellers.avatar_url IS 'Storyteller avatar image URL - synced from profiles.profile_image_url';

-- Verification queries (run these after migration to check results)
-- SELECT 'Storytellers with avatars', COUNT(*) FROM storytellers WHERE avatar_url IS NOT NULL;
-- SELECT 'Profiles marked as storytellers', COUNT(*) FROM profiles WHERE is_storyteller = true;
-- SELECT 'Storytellers in table', COUNT(*) FROM storytellers;
