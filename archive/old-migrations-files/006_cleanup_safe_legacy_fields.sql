-- Migration: Cleanup Safe Legacy Fields (Conservative)
-- Date: 2025-09-30
-- Description: Drop only fields that are 100% confirmed unused

-- ============================================================================
-- SAFE TO DROP (0% usage)
-- ============================================================================

-- 1. avatar_url: 0/235 profiles use this (all use profile_image_url)
ALTER TABLE profiles DROP COLUMN IF EXISTS avatar_url;

-- 2. location_data: 0/235 profiles use this JSONB field
ALTER TABLE profiles DROP COLUMN IF EXISTS location_data;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Count remaining columns
SELECT COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles';

-- Expected result: 114 columns (was 116, dropped 2)

-- ============================================================================
-- FIELDS TO REVIEW LATER (NOT dropping in this migration)
-- ============================================================================

-- legacy_location_id: 100/235 profiles (43%) still have values
--   Decision: Keep for now - may be historical data needed for reporting
--   Review with business team before dropping

-- legacy_organization_id: 99/235 profiles (42%) still have values
--   Decision: Keep for now - may be historical data needed for reporting
--   Review with business team before dropping

-- tenant_id: 235/235 profiles (100%) still have values
--   Decision: Keep for now - still referenced in some code
--   Requires full code audit before dropping

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
-- ALTER TABLE profiles ADD COLUMN location_data JSONB;