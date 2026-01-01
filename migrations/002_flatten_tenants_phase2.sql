-- Migration: Flatten Multi-Tenant Architecture - Phase 2
-- Update profiles to reference organization_id instead of tenant_id

-- Add primary_organization_id to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS primary_organization_id UUID REFERENCES organizations(id);

-- Create index for lookups
CREATE INDEX IF NOT EXISTS idx_profiles_primary_org ON profiles(primary_organization_id);

-- Strategy 1: Use active membership from profile_organizations junction
UPDATE profiles p
SET primary_organization_id = (
  SELECT po.organization_id
  FROM profile_organizations po
  WHERE po.profile_id = p.id
    AND po.is_active = true
  ORDER BY po.joined_at ASC  -- Use earliest joined org as primary
  LIMIT 1
)
WHERE primary_organization_id IS NULL;

-- Strategy 2: For profiles without org membership, map via tenant_id
UPDATE profiles p
SET primary_organization_id = (
  SELECT o.id
  FROM organizations o
  WHERE o.tenant_id = p.tenant_id
  LIMIT 1
)
WHERE primary_organization_id IS NULL
  AND tenant_id IS NOT NULL;

-- Verify migration
DO $$
DECLARE
  total_profiles INTEGER;
  profiles_with_org INTEGER;
  profiles_without_org INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_profiles FROM profiles;

  SELECT COUNT(*) INTO profiles_with_org
  FROM profiles
  WHERE primary_organization_id IS NOT NULL;

  profiles_without_org := total_profiles - profiles_with_org;

  RAISE NOTICE 'Phase 2 Complete:';
  RAISE NOTICE '  Total profiles: %', total_profiles;
  RAISE NOTICE '  Profiles with organization: %', profiles_with_org;
  RAISE NOTICE '  Profiles without organization: %', profiles_without_org;

  IF profiles_without_org > 0 THEN
    RAISE WARNING 'Some profiles do not have primary_organization_id set!';
  END IF;
END $$;

-- Show profiles without organization for manual review
SELECT
  id,
  email,
  display_name,
  tenant_id,
  created_at
FROM profiles
WHERE primary_organization_id IS NULL
LIMIT 10;