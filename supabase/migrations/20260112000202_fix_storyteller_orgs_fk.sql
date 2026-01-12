-- Migration: Fix storyteller_organizations FK to point to storytellers (not profiles)
-- Date: 2026-01-12
-- Current state: FK points to profiles (wrong)
-- Target state: FK points to storytellers (correct)

-- Step 1: Drop the existing FK constraint
ALTER TABLE storyteller_organizations
  DROP CONSTRAINT IF EXISTS storyteller_organizations_storyteller_id_fkey;

-- Step 2: Create missing storyteller records for profiles without them
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
  WHERE NOT EXISTS (SELECT 1 FROM storytellers WHERE profile_id = so.storyteller_id)
)
ON CONFLICT (profile_id) DO NOTHING;

-- Step 3: Update storyteller_organizations to use storyteller IDs (not profile IDs)
UPDATE storyteller_organizations so
SET storyteller_id = s.id
FROM storytellers s
WHERE s.profile_id = so.storyteller_id  -- Currently has profile ID
  AND so.storyteller_id != s.id;  -- Only update if different

-- Step 4: Add the correct FK constraint pointing to storytellers
ALTER TABLE storyteller_organizations
  ADD CONSTRAINT storyteller_organizations_storyteller_id_fkey
  FOREIGN KEY (storyteller_id) REFERENCES storytellers(id) ON DELETE CASCADE;

-- Step 5: Verify success
DO $$
DECLARE
  orphaned_count integer;
BEGIN
  SELECT COUNT(*) INTO orphaned_count
  FROM storyteller_organizations so
  LEFT JOIN storytellers s ON s.id = so.storyteller_id
  WHERE s.id IS NULL;

  IF orphaned_count > 0 THEN
    RAISE WARNING 'Found % orphaned storyteller_organizations records', orphaned_count;
  ELSE
    RAISE NOTICE '✓ All storyteller_organizations records now correctly reference storytellers table';
  END IF;
END $$;

-- Add helpful comment
COMMENT ON CONSTRAINT storyteller_organizations_storyteller_id_fkey ON storyteller_organizations IS
  'FK to storytellers.id (not profiles.id). Fixed 2026-01-12 to point to correct table.';
