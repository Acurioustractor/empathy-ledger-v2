-- Migration: Fix harvested_outcomes foreign key cascade
-- Description: Add CASCADE DELETE to story_id foreign key to prevent orphaned outcomes
-- Phase: Bug Fix - Data Integrity
-- Date: 2026-01-01

-- ============================================================================
-- PROBLEM
-- ============================================================================
-- harvested_outcomes.story_id has a foreign key to stories(id) but without
-- CASCADE DELETE. This means deleting a story leaves orphaned outcome records.
--
-- Current: FOREIGN KEY (story_id) REFERENCES stories(id)
-- Fixed:   FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE

-- ============================================================================
-- FIX: Add CASCADE DELETE
-- ============================================================================

-- Drop existing constraint
ALTER TABLE harvested_outcomes
DROP CONSTRAINT IF EXISTS harvested_outcomes_story_id_fkey;

-- Add constraint with CASCADE DELETE
ALTER TABLE harvested_outcomes
ADD CONSTRAINT harvested_outcomes_story_id_fkey
FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  v_constraint_def TEXT;
BEGIN
  -- Verify the constraint exists with CASCADE
  SELECT pg_get_constraintdef(oid)
  INTO v_constraint_def
  FROM pg_constraint
  WHERE conname = 'harvested_outcomes_story_id_fkey';

  IF v_constraint_def NOT LIKE '%ON DELETE CASCADE%' THEN
    RAISE EXCEPTION 'Migration failed: CASCADE DELETE not applied to harvested_outcomes_story_id_fkey';
  END IF;

  RAISE NOTICE 'harvested_outcomes foreign key migration completed successfully';
  RAISE NOTICE 'Constraint definition: %', v_constraint_def;
END $$;
