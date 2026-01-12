-- Migration: Fix transcripts.storyteller_id Foreign Key
-- Date: 2026-01-07
-- Purpose: Change transcripts.storyteller_id to reference storytellers(id) instead of profiles(id)
--
-- CRITICAL ARCHITECTURE FIX:
-- Currently: transcripts.storyteller_id → profiles.id (WRONG)
-- Target:    transcripts.storyteller_id → storytellers.id (CORRECT)
--
-- This migration preserves ALL data and provides full rollback capability.

BEGIN;

-- ============================================
-- STEP 1: Add temporary column for new FK
-- ============================================

ALTER TABLE transcripts
ADD COLUMN IF NOT EXISTS storyteller_id_new UUID;

COMMENT ON COLUMN transcripts.storyteller_id_new IS
  'Temporary column for FK migration. Will replace storyteller_id.';

-- ============================================
-- STEP 2: Populate new column from storytellers table
-- ============================================

-- Map old profile_id references to new storyteller.id references
UPDATE transcripts t
SET storyteller_id_new = st.id
FROM storytellers st
WHERE t.storyteller_id = st.profile_id
  AND t.storyteller_id IS NOT NULL;

-- Log results
DO $$
DECLARE
  total_transcripts INTEGER;
  mapped_transcripts INTEGER;
  null_transcripts INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_transcripts FROM transcripts;
  SELECT COUNT(*) INTO mapped_transcripts FROM transcripts WHERE storyteller_id_new IS NOT NULL;
  SELECT COUNT(*) INTO null_transcripts FROM transcripts WHERE storyteller_id IS NOT NULL AND storyteller_id_new IS NULL;

  RAISE NOTICE '=== FK Migration Mapping Results ===';
  RAISE NOTICE 'Total transcripts: %', total_transcripts;
  RAISE NOTICE 'Successfully mapped: %', mapped_transcripts;
  RAISE NOTICE 'Unmapped (potential data loss): %', null_transcripts;
END $$;

-- ============================================
-- STEP 3: Verify 100% coverage (CRITICAL)
-- ============================================

DO $$
DECLARE
  unmapped_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unmapped_count
  FROM transcripts
  WHERE storyteller_id IS NOT NULL
    AND storyteller_id_new IS NULL;

  IF unmapped_count > 0 THEN
    RAISE EXCEPTION 'MIGRATION HALTED: Found % transcripts with storyteller_id that could not be mapped to storytellers table. Data integrity check failed.', unmapped_count;
  END IF;

  RAISE NOTICE '✅ Verification passed: All storyteller_id values successfully mapped';
END $$;

-- ============================================
-- STEP 4: Drop old FK constraint
-- ============================================

ALTER TABLE transcripts
DROP CONSTRAINT IF EXISTS transcripts_storyteller_id_fkey;

DO $$ BEGIN
  RAISE NOTICE 'Dropped old FK constraint: transcripts_storyteller_id_fkey';
END $$;

-- ============================================
-- STEP 5: Rename columns (swap)
-- ============================================

-- Preserve old column as legacy backup
ALTER TABLE transcripts
RENAME COLUMN storyteller_id TO storyteller_id_legacy;

-- Promote new column to primary
ALTER TABLE transcripts
RENAME COLUMN storyteller_id_new TO storyteller_id;

COMMENT ON COLUMN transcripts.storyteller_id_legacy IS
  'LEGACY COLUMN (2026-01-07): Old FK to profiles.id. Kept for 30 days for rollback safety. Will be removed 2026-02-07.';

COMMENT ON COLUMN transcripts.storyteller_id IS
  'Foreign key to storytellers.id (corrected 2026-01-07). Previously pointed to profiles.id (incorrect).';

-- ============================================
-- STEP 6: Add new FK constraint
-- ============================================

ALTER TABLE transcripts
ADD CONSTRAINT transcripts_storyteller_id_fkey
  FOREIGN KEY (storyteller_id)
  REFERENCES storytellers(id)
  ON DELETE CASCADE;

DO $$ BEGIN
  RAISE NOTICE 'Added new FK constraint to storytellers table';
END $$;

-- ============================================
-- STEP 7: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_transcripts_storyteller_id
ON transcripts(storyteller_id)
WHERE storyteller_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transcripts_storyteller_id_legacy
ON transcripts(storyteller_id_legacy)
WHERE storyteller_id_legacy IS NOT NULL;

-- ============================================
-- STEP 8: Verify data integrity
-- ============================================

DO $$
DECLARE
  total_transcripts INTEGER;
  with_storyteller INTEGER;
  with_legacy INTEGER;
  orphaned INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_transcripts FROM transcripts;
  SELECT COUNT(*) INTO with_storyteller FROM transcripts WHERE storyteller_id IS NOT NULL;
  SELECT COUNT(*) INTO with_legacy FROM transcripts WHERE storyteller_id_legacy IS NOT NULL;

  -- Check for orphaned transcripts (storyteller_id points to non-existent storyteller)
  SELECT COUNT(*) INTO orphaned
  FROM transcripts t
  LEFT JOIN storytellers st ON t.storyteller_id = st.id
  WHERE t.storyteller_id IS NOT NULL AND st.id IS NULL;

  RAISE NOTICE '=== Data Integrity Verification ===';
  RAISE NOTICE 'Total transcripts: %', total_transcripts;
  RAISE NOTICE 'With storyteller (new FK): %', with_storyteller;
  RAISE NOTICE 'With legacy profile_id: %', with_legacy;
  RAISE NOTICE 'Orphaned transcripts: %', orphaned;

  IF orphaned > 0 THEN
    RAISE WARNING 'Found % orphaned transcripts! FK constraint may be violated.', orphaned;
  ELSE
    RAISE NOTICE '✅ No orphaned transcripts - data integrity verified';
  END IF;
END $$;

-- ============================================
-- STEP 9: RLS policies note
-- ============================================

-- Note: RLS policies should automatically work with the new FK
-- since the column name hasn't changed, only the reference target.
-- Manual verification recommended after deployment.

-- ============================================
-- FINAL VERIFICATION
-- ============================================

DO $$
BEGIN
  -- Verify FK constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'transcripts'::regclass
      AND conname = 'transcripts_storyteller_id_fkey'
      AND confrelid = 'storytellers'::regclass
  ) THEN
    RAISE EXCEPTION 'MIGRATION FAILED: New FK constraint not found!';
  END IF;

  -- Verify old FK is gone
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'transcripts'::regclass
      AND conname = 'transcripts_storyteller_id_fkey'
      AND confrelid = 'profiles'::regclass
  ) THEN
    RAISE EXCEPTION 'MIGRATION FAILED: Old FK constraint still exists!';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '=================================';
  RAISE NOTICE '✅ MIGRATION SUCCESSFUL';
  RAISE NOTICE '=================================';
  RAISE NOTICE 'transcripts.storyteller_id now references storytellers.id';
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
ALTER TABLE transcripts
DROP CONSTRAINT IF EXISTS transcripts_storyteller_id_fkey;

-- Restore old column names
ALTER TABLE transcripts
RENAME COLUMN storyteller_id TO storyteller_id_new;

ALTER TABLE transcripts
RENAME COLUMN storyteller_id_legacy TO storyteller_id;

-- Restore old FK constraint
ALTER TABLE transcripts
ADD CONSTRAINT transcripts_storyteller_id_fkey
  FOREIGN KEY (storyteller_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- Drop new column
ALTER TABLE transcripts
DROP COLUMN IF EXISTS storyteller_id_new;

RAISE NOTICE 'Rollback complete - reverted to profiles FK';

COMMIT;
*/
