-- Migration: Cleanup Legacy Profile Fields
-- Date: 2025-09-30
-- Description: Remove unused/legacy fields from profiles table
--
-- IMPORTANT: This migration should be run AFTER verifying:
-- 1. All code references to these fields have been removed
-- 2. Data has been migrated if needed
-- 3. Backup of database has been taken

-- ============================================================================
-- PHASE 1: DROP UNUSED IMAGE FIELD
-- ============================================================================
-- avatar_url: 0 profiles use this (all use profile_image_url instead)

-- Check current usage (should be 0)
DO $$
DECLARE
  avatar_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO avatar_count
  FROM profiles
  WHERE avatar_url IS NOT NULL;

  RAISE NOTICE 'Profiles with avatar_url: %', avatar_count;

  IF avatar_count > 0 THEN
    RAISE WARNING 'Found % profiles with avatar_url - migration to profile_image_url needed first!', avatar_count;
  ELSE
    RAISE NOTICE 'Safe to drop avatar_url column';
  END IF;
END $$;

-- Drop avatar_url column
-- Uncomment after verification:
-- ALTER TABLE profiles DROP COLUMN IF EXISTS avatar_url;


-- ============================================================================
-- PHASE 2: DROP LEGACY LOCATION FIELDS
-- ============================================================================
-- legacy_location_id: Check if any profiles use this

DO $$
DECLARE
  legacy_loc_count INTEGER;
  location_data_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO legacy_loc_count
  FROM profiles
  WHERE legacy_location_id IS NOT NULL;

  SELECT COUNT(*) INTO location_data_count
  FROM profiles
  WHERE location_data IS NOT NULL;

  RAISE NOTICE 'Profiles with legacy_location_id: %', legacy_loc_count;
  RAISE NOTICE 'Profiles with location_data: %', location_data_count;

  IF legacy_loc_count > 0 THEN
    RAISE WARNING 'Found % profiles with legacy_location_id - needs migration!', legacy_loc_count;
  END IF;

  IF location_data_count > 0 THEN
    RAISE WARNING 'Found % profiles with location_data - review before dropping!', location_data_count;
  END IF;
END $$;

-- Drop legacy location fields
-- Uncomment after verification:
-- ALTER TABLE profiles DROP COLUMN IF EXISTS legacy_location_id;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS location_data;


-- ============================================================================
-- PHASE 3: DROP LEGACY ORGANIZATION FIELDS
-- ============================================================================
-- legacy_organization_id: Check usage

DO $$
DECLARE
  legacy_org_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO legacy_org_count
  FROM profiles
  WHERE legacy_organization_id IS NOT NULL;

  RAISE NOTICE 'Profiles with legacy_organization_id: %', legacy_org_count;

  IF legacy_org_count > 0 THEN
    RAISE WARNING 'Found % profiles with legacy_organization_id - needs migration!', legacy_org_count;
  END IF;
END $$;

-- Drop legacy organization field
-- Uncomment after verification:
-- ALTER TABLE profiles DROP COLUMN IF EXISTS legacy_organization_id;


-- ============================================================================
-- PHASE 4: PLAN TENANT_ID DEPRECATION
-- ============================================================================
-- tenant_id: Still in use (235 profiles), but primary_organization_id is preferred
--
-- Strategy:
-- 1. Ensure 100% of profiles have primary_organization_id populated
-- 2. Update all queries to use primary_organization_id instead of tenant_id
-- 3. After code audit, drop tenant_id column
--
-- DO NOT drop yet - code still references it

DO $$
DECLARE
  tenant_count INTEGER;
  primary_org_count INTEGER;
  profiles_total INTEGER;
BEGIN
  SELECT COUNT(*) INTO profiles_total FROM profiles;

  SELECT COUNT(*) INTO tenant_count
  FROM profiles
  WHERE tenant_id IS NOT NULL;

  SELECT COUNT(*) INTO primary_org_count
  FROM profiles
  WHERE primary_organization_id IS NOT NULL;

  RAISE NOTICE 'Total profiles: %', profiles_total;
  RAISE NOTICE 'Profiles with tenant_id: % (% %%)', tenant_count, ROUND((tenant_count::DECIMAL / profiles_total) * 100, 1);
  RAISE NOTICE 'Profiles with primary_organization_id: % (% %%)', primary_org_count, ROUND((primary_org_count::DECIMAL / profiles_total) * 100, 1);

  IF tenant_count = profiles_total AND primary_org_count = profiles_total THEN
    RAISE NOTICE 'Both fields fully populated - can plan tenant_id deprecation';
  ELSIF primary_org_count < profiles_total THEN
    RAISE WARNING 'primary_organization_id not fully populated - migration needed first';
  END IF;
END $$;

-- Uncomment ONLY after full code audit:
-- ALTER TABLE profiles DROP COLUMN IF EXISTS tenant_id;


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check profiles table size before and after
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE tablename = 'profiles';

-- Count current columns
SELECT COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles';

-- ============================================================================
-- ROLLBACK PLAN (if needed)
-- ============================================================================

-- If you need to restore any dropped columns, use:
--
-- ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
-- ALTER TABLE profiles ADD COLUMN legacy_location_id UUID;
-- ALTER TABLE profiles ADD COLUMN location_data JSONB;
-- ALTER TABLE profiles ADD COLUMN legacy_organization_id UUID;
-- ALTER TABLE profiles ADD COLUMN tenant_id UUID;
--
-- Then restore data from backup


-- ============================================================================
-- EXPECTED IMPACT
-- ============================================================================
--
-- Before:
--   - profiles table: 116 columns
--   - Size: ~X MB
--
-- After Phase 1-3:
--   - profiles table: 113 columns (dropped avatar_url, legacy_location_id, location_data, legacy_organization_id)
--   - Size: slightly smaller
--
-- After Phase 4 (future):
--   - profiles table: 112 columns (dropped tenant_id)
--   - Cleaner data model
--
-- Note: AI/analytics fields (10 fields) and visibility fields (11 fields)
-- could be moved to separate tables in future optimization (not in this migration)