-- Migration: Fix stories.storyteller_id Foreign Key
-- Date: 2026-01-07
-- Purpose: Change stories.storyteller_id to reference storytellers(id) instead of profiles(id)
--
-- CRITICAL ARCHITECTURE FIX:
-- Currently: stories.storyteller_id → profiles.id (WRONG)
-- Target:    stories.storyteller_id → storytellers.id (CORRECT)
--
-- This migration preserves ALL data and provides full rollback capability.

BEGIN;

-- ============================================
-- STEP 1: Add temporary column for new FK
-- ============================================

ALTER TABLE stories
ADD COLUMN IF NOT EXISTS storyteller_id_new UUID;

COMMENT ON COLUMN stories.storyteller_id_new IS
  'Temporary column for FK migration. Will replace storyteller_id.';

-- ============================================
-- STEP 2: Populate new column from storytellers table
-- ============================================

-- Map old profile_id references to new storyteller.id references
UPDATE stories s
SET storyteller_id_new = st.id
FROM storytellers st
WHERE s.storyteller_id = st.profile_id
  AND s.storyteller_id IS NOT NULL;

-- Log results
DO $$
DECLARE
  total_stories INTEGER;
  mapped_stories INTEGER;
  null_stories INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_stories FROM stories;
  SELECT COUNT(*) INTO mapped_stories FROM stories WHERE storyteller_id_new IS NOT NULL;
  SELECT COUNT(*) INTO null_stories FROM stories WHERE storyteller_id IS NOT NULL AND storyteller_id_new IS NULL;

  RAISE NOTICE '=== FK Migration Mapping Results ===';
  RAISE NOTICE 'Total stories: %', total_stories;
  RAISE NOTICE 'Successfully mapped: %', mapped_stories;
  RAISE NOTICE 'Unmapped (potential data loss): %', null_stories;
END $$;

-- ============================================
-- STEP 3: Verify 100% coverage (CRITICAL)
-- ============================================

DO $$
DECLARE
  unmapped_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unmapped_count
  FROM stories
  WHERE storyteller_id IS NOT NULL
    AND storyteller_id_new IS NULL;

  IF unmapped_count > 0 THEN
    RAISE EXCEPTION 'MIGRATION HALTED: Found % stories with storyteller_id that could not be mapped to storytellers table. Data integrity check failed.', unmapped_count;
  END IF;

  RAISE NOTICE '✅ Verification passed: All storyteller_id values successfully mapped';
END $$;

-- ============================================
-- STEP 4: Drop old FK constraint
-- ============================================

-- Find the actual constraint name
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'stories'::regclass
    AND contype = 'f'
    AND confrelid = 'profiles'::regclass
    AND conkey = (SELECT array_agg(attnum) FROM pg_attribute WHERE attrelid = 'stories'::regclass AND attname = 'storyteller_id');

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE stories DROP CONSTRAINT %I', constraint_name);
    RAISE NOTICE 'Dropped old FK constraint: %', constraint_name;
  ELSE
    RAISE NOTICE 'No FK constraint found pointing to profiles table';
  END IF;
END $$;

-- ============================================
-- STEP 5: Rename columns (swap)
-- ============================================

-- Preserve old column as legacy backup
ALTER TABLE stories
RENAME COLUMN storyteller_id TO storyteller_id_legacy;

-- Promote new column to primary
ALTER TABLE stories
RENAME COLUMN storyteller_id_new TO storyteller_id;

COMMENT ON COLUMN stories.storyteller_id_legacy IS
  'LEGACY COLUMN (2026-01-07): Old FK to profiles.id. Kept for 30 days for rollback safety. Will be removed 2026-02-07.';

COMMENT ON COLUMN stories.storyteller_id IS
  'Foreign key to storytellers.id (corrected 2026-01-07). Previously pointed to profiles.id (incorrect).';

-- ============================================
-- STEP 6: Add new FK constraint
-- ============================================

ALTER TABLE stories
ADD CONSTRAINT stories_storyteller_id_fkey
  FOREIGN KEY (storyteller_id)
  REFERENCES storytellers(id)
  ON DELETE CASCADE;

-- ============================================
-- STEP 7: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_stories_storyteller_id
ON stories(storyteller_id)
WHERE storyteller_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_stories_storyteller_id_legacy
ON stories(storyteller_id_legacy)
WHERE storyteller_id_legacy IS NOT NULL;

-- ============================================
-- STEP 8: Verify data integrity
-- ============================================

DO $$
DECLARE
  total_stories INTEGER;
  with_storyteller INTEGER;
  with_legacy INTEGER;
  orphaned INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_stories FROM stories;
  SELECT COUNT(*) INTO with_storyteller FROM stories WHERE storyteller_id IS NOT NULL;
  SELECT COUNT(*) INTO with_legacy FROM stories WHERE storyteller_id_legacy IS NOT NULL;

  -- Check for orphaned stories (storyteller_id points to non-existent storyteller)
  SELECT COUNT(*) INTO orphaned
  FROM stories s
  LEFT JOIN storytellers st ON s.storyteller_id = st.id
  WHERE s.storyteller_id IS NOT NULL AND st.id IS NULL;

  RAISE NOTICE '=== Data Integrity Verification ===';
  RAISE NOTICE 'Total stories: %', total_stories;
  RAISE NOTICE 'With storyteller (new FK): %', with_storyteller;
  RAISE NOTICE 'With legacy profile_id: %', with_legacy;
  RAISE NOTICE 'Orphaned stories: %', orphaned;

  IF orphaned > 0 THEN
    RAISE WARNING 'Found % orphaned stories! FK constraint may be violated.', orphaned;
  ELSE
    RAISE NOTICE '✅ No orphaned stories - data integrity verified';
  END IF;
END $$;

-- ============================================
-- STEP 9: Update RLS policies if needed
-- ============================================

-- Note: RLS policies may need updating if they reference storyteller_id
-- Check existing policies:
DO $$
DECLARE
  policy_rec RECORD;
BEGIN
  RAISE NOTICE '=== Checking RLS Policies ===';

  FOR policy_rec IN
    SELECT policyname, pg_get_expr(qual, polrelid) as qual_expression
    FROM pg_policy
    WHERE polrelid = 'stories'::regclass
  LOOP
    RAISE NOTICE 'Policy: % - Expression: %', policy_rec.policyname, policy_rec.qual_expression;

    IF policy_rec.qual_expression LIKE '%storyteller_id%' THEN
      RAISE NOTICE '  ⚠️ This policy uses storyteller_id - verify it still works correctly';
    END IF;
  END LOOP;
END $$;

-- ============================================
-- FINAL VERIFICATION
-- ============================================

DO $$
BEGIN
  -- Verify FK constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'stories'::regclass
      AND conname = 'stories_storyteller_id_fkey'
      AND confrelid = 'storytellers'::regclass
  ) THEN
    RAISE EXCEPTION 'MIGRATION FAILED: New FK constraint not found!';
  END IF;

  -- Verify old FK is gone
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'stories'::regclass
      AND contype = 'f'
      AND confrelid = 'profiles'::regclass
      AND conkey = (SELECT array_agg(attnum) FROM pg_attribute WHERE attrelid = 'stories'::regclass AND attname = 'storyteller_id')
  ) THEN
    RAISE EXCEPTION 'MIGRATION FAILED: Old FK constraint still exists!';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '=================================';
  RAISE NOTICE '✅ MIGRATION SUCCESSFUL';
  RAISE NOTICE '=================================';
  RAISE NOTICE 'stories.storyteller_id now references storytellers.id';
  RAISE NOTICE 'Old column preserved as storyteller_id_legacy';
  RAISE NOTICE 'Rollback available for 30 days';
  RAISE NOTICE '';
END $$;

COMMIT;

-- ============================================
-- ROLLBACK SCRIPT (Save separately if needed)
-- ============================================

/*
-- ROLLBACK (Only run if migration needs to be reversed within 30 days)

BEGIN;

-- Drop new FK constraint
ALTER TABLE stories
DROP CONSTRAINT IF EXISTS stories_storyteller_id_fkey;

-- Restore old column names
ALTER TABLE stories
RENAME COLUMN storyteller_id TO storyteller_id_new;

ALTER TABLE stories
RENAME COLUMN storyteller_id_legacy TO storyteller_id;

-- Restore old FK constraint
ALTER TABLE stories
ADD CONSTRAINT stories_storyteller_id_fkey
  FOREIGN KEY (storyteller_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- Drop new column
ALTER TABLE stories
DROP COLUMN IF EXISTS storyteller_id_new;

RAISE NOTICE 'Rollback complete - reverted to profiles FK';

COMMIT;
*/
