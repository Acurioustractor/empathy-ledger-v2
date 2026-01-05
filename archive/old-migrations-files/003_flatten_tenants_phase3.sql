-- Migration: Flatten Multi-Tenant Architecture - Phase 3
-- Ensure all data tables use organization_id consistently

-- Stories: Ensure organization_id is populated from tenant_id
UPDATE stories s
SET organization_id = (
  SELECT o.id
  FROM organizations o
  WHERE o.tenant_id = s.tenant_id
  LIMIT 1
)
WHERE organization_id IS NULL
  AND tenant_id IS NOT NULL;

-- Projects: Ensure organization_id is populated from tenant_id
UPDATE projects p
SET organization_id = (
  SELECT o.id
  FROM organizations o
  WHERE o.tenant_id = p.tenant_id
  LIMIT 1
)
WHERE organization_id IS NULL
  AND tenant_id IS NOT NULL;

-- Media assets: Ensure organization_id is populated from tenant_id
UPDATE media_assets m
SET organization_id = (
  SELECT o.id
  FROM organizations o
  WHERE o.tenant_id = m.tenant_id
  LIMIT 1
)
WHERE organization_id IS NULL
  AND tenant_id IS NOT NULL;

-- Photo galleries: Ensure organization_id is populated from tenant_id
UPDATE photo_galleries pg
SET organization_id = (
  SELECT o.id
  FROM organizations o
  WHERE o.tenant_id = pg.tenant_id
  LIMIT 1
)
WHERE organization_id IS NULL
  AND tenant_id IS NOT NULL;

-- Add indexes for organization_id lookups (if not exist)
CREATE INDEX IF NOT EXISTS idx_stories_organization ON stories(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_organization ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_organization ON media_assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_photo_galleries_organization ON photo_galleries(organization_id);

-- Verify migration
DO $$
DECLARE
  stories_missing_org INTEGER;
  projects_missing_org INTEGER;
  media_missing_org INTEGER;
  galleries_missing_org INTEGER;
BEGIN
  SELECT COUNT(*) INTO stories_missing_org
  FROM stories WHERE organization_id IS NULL;

  SELECT COUNT(*) INTO projects_missing_org
  FROM projects WHERE organization_id IS NULL;

  SELECT COUNT(*) INTO media_missing_org
  FROM media_assets WHERE organization_id IS NULL;

  SELECT COUNT(*) INTO galleries_missing_org
  FROM photo_galleries WHERE organization_id IS NULL;

  RAISE NOTICE 'Phase 3 Complete:';
  RAISE NOTICE '  Stories without org: %', stories_missing_org;
  RAISE NOTICE '  Projects without org: %', projects_missing_org;
  RAISE NOTICE '  Media assets without org: %', media_missing_org;
  RAISE NOTICE '  Galleries without org: %', galleries_missing_org;

  IF stories_missing_org > 0 OR projects_missing_org > 0 OR
     media_missing_org > 0 OR galleries_missing_org > 0 THEN
    RAISE WARNING 'Some records still missing organization_id!';
  END IF;
END $$;