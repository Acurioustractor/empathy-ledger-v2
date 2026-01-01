-- Fix stories organization mapping
-- Stories are mapped to tenants, but not all tenants have organizations
-- Map via author's primary_organization_id instead

-- Update stories organization_id via author's primary organization
UPDATE stories s
SET organization_id = (
  SELECT p.primary_organization_id
  FROM profiles p
  WHERE p.id = s.author_id
  LIMIT 1
)
WHERE organization_id IS NULL
  AND author_id IS NOT NULL;

-- For stories without author, try to find the default org for their tenant
-- (In case the tenant does have an org, just wasn't matched before)
UPDATE stories s
SET organization_id = (
  SELECT o.id
  FROM organizations o
  WHERE o.tenant_id = s.tenant_id
  LIMIT 1
)
WHERE organization_id IS NULL
  AND tenant_id IS NOT NULL;

-- Verify
DO $$
DECLARE
  stories_total INTEGER;
  stories_with_org INTEGER;
BEGIN
  SELECT COUNT(*) INTO stories_total FROM stories;
  SELECT COUNT(*) INTO stories_with_org FROM stories WHERE organization_id IS NOT NULL;

  RAISE NOTICE 'Stories with organization_id: %/%', stories_with_org, stories_total;

  IF stories_with_org < stories_total THEN
    RAISE WARNING '% stories still missing organization_id - may belong to tenants without organizations', stories_total - stories_with_org;
  ELSE
    RAISE NOTICE 'All stories successfully mapped!';
  END IF;
END $$;