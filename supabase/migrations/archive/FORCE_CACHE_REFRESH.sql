-- ============================================================================
-- FORCE POSTGREST CACHE REFRESH - Run this in Supabase Dashboard SQL Editor
-- ============================================================================
-- Go to: https://app.supabase.com/project/yvnuayzslukamizrlhwb/sql/new
-- Copy/paste this entire file and click "Run"
-- ============================================================================

-- Method: Add and immediately drop a dummy column
-- This forces PostgREST to reload the entire profiles table schema

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS _force_cache_refresh TIMESTAMP DEFAULT NOW();

ALTER TABLE profiles
DROP COLUMN IF EXISTS _force_cache_refresh;

-- Verify all columns are present
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN (
    'avatar_media_id',
    'cover_media_id',
    'email',
    'phone_number',
    'tenant_id',
    'is_storyteller',
    'tenant_roles'
  )
ORDER BY column_name;

-- Expected output: 7 rows showing all these columns exist
