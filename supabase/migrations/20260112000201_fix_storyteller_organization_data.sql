-- Migration: Fix storyteller_organizations data before FK change
-- Date: 2026-01-12
-- Issue: 21 records have storyteller_id pointing to profiles table instead of storytellers table
-- Fix: Convert profile_ids to storyteller_ids, create missing storytellers

-- Step 1: Create missing storyteller records for profiles that don't have them
INSERT INTO storytellers (profile_id, display_name, is_active)
SELECT
  p.id as profile_id,
  COALESCE(p.display_name, p.full_name, 'Unknown') as display_name,
  true as is_active
FROM profiles p
WHERE p.id IN (
  -- Profiles referenced by storyteller_organizations but have no storyteller record
  SELECT so.storyteller_id
  FROM storyteller_organizations so
  WHERE NOT EXISTS (SELECT 1 FROM storytellers WHERE id = so.storyteller_id)
    AND NOT EXISTS (SELECT 1 FROM storytellers WHERE profile_id = so.storyteller_id)
)
ON CONFLICT (profile_id) DO NOTHING;

-- Step 2: Update storyteller_organizations to point to storyteller IDs (not profile IDs)
UPDATE storyteller_organizations so
SET storyteller_id = s.id
FROM storytellers s
WHERE s.profile_id = so.storyteller_id  -- Currently pointing to profile
  AND NOT EXISTS (  -- Make sure it's not already pointing to storyteller
    SELECT 1 FROM storytellers WHERE id = so.storyteller_id
  );

-- Step 3: Report what was fixed
DO $$
DECLARE
  fixed_count integer;
  orphaned_count integer;
BEGIN
  -- Check if all records now have valid storytellers
  SELECT COUNT(*) INTO orphaned_count
  FROM storyteller_organizations so
  LEFT JOIN storytellers s ON s.id = so.storyteller_id
  WHERE s.id IS NULL;

  IF orphaned_count > 0 THEN
    RAISE WARNING 'Still have % orphaned storyteller_organizations records after fix', orphaned_count;
  ELSE
    RAISE NOTICE '✓ All storyteller_organizations records now point to valid storytellers';
  END IF;
END $$;
