-- Migration: Flatten Multi-Tenant Architecture - Phase 3 (Corrected)
-- Ensure all data tables use organization_id consistently

-- Stories: Add organization_id column and populate it
ALTER TABLE stories
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Populate stories.organization_id from tenant_id
UPDATE stories s
SET organization_id = (
  SELECT o.id
  FROM organizations o
  WHERE o.tenant_id = s.tenant_id
  LIMIT 1
)
WHERE organization_id IS NULL
  AND tenant_id IS NOT NULL;

-- Projects: Ensure organization_id is populated (already has column)
UPDATE projects p
SET organization_id = (
  SELECT o.id
  FROM organizations o
  WHERE o.tenant_id = p.tenant_id
  LIMIT 1
)
WHERE organization_id IS NULL
  AND tenant_id IS NOT NULL;

-- Media assets: Ensure organization_id is populated (already has column)
UPDATE media_assets m
SET organization_id = (
  SELECT o.id
  FROM organizations o
  WHERE o.tenant_id = m.tenant_id
  LIMIT 1
)
WHERE organization_id IS NULL
  AND tenant_id IS NOT NULL;

-- Photo galleries: Ensure organization_id is populated (already has column)
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
  stories_total INTEGER;
  stories_with_org INTEGER;
  projects_total INTEGER;
  projects_with_org INTEGER;
  media_total INTEGER;
  media_with_org INTEGER;
  galleries_total INTEGER;
  galleries_with_org INTEGER;
BEGIN
  -- Stories
  SELECT COUNT(*) INTO stories_total FROM stories;
  SELECT COUNT(*) INTO stories_with_org FROM stories WHERE organization_id IS NOT NULL;

  -- Projects
  SELECT COUNT(*) INTO projects_total FROM projects;
  SELECT COUNT(*) INTO projects_with_org FROM projects WHERE organization_id IS NOT NULL;

  -- Media
  SELECT COUNT(*) INTO media_total FROM media_assets;
  SELECT COUNT(*) INTO media_with_org FROM media_assets WHERE organization_id IS NOT NULL;

  -- Galleries
  SELECT COUNT(*) INTO galleries_total FROM photo_galleries;
  SELECT COUNT(*) INTO galleries_with_org FROM photo_galleries WHERE organization_id IS NOT NULL;

  RAISE NOTICE 'Phase 3 Complete:';
  RAISE NOTICE '  Stories: %/% have organization_id', stories_with_org, stories_total;
  RAISE NOTICE '  Projects: %/% have organization_id', projects_with_org, projects_total;
  RAISE NOTICE '  Media assets: %/% have organization_id', media_with_org, media_total;
  RAISE NOTICE '  Galleries: %/% have organization_id', galleries_with_org, galleries_total;

  IF stories_with_org < stories_total OR projects_with_org < projects_total OR
     media_with_org < media_total OR galleries_with_org < galleries_total THEN
    RAISE WARNING 'Some records still missing organization_id!';
  ELSE
    RAISE NOTICE 'All data successfully migrated!';
  END IF;
END $$;