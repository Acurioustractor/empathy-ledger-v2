-- Migration: Phase 2 RLS - Project Association Tables
-- Date: 2026-01-12
-- Purpose: Secure project association tables
-- Tables: project_media, project_organizations, project_participants,
--         project_storytellers, project_updates, storyteller_projects

-- ============================================================================
-- PART 1: PROJECT_MEDIA (Enable RLS + Add Policies)
-- ============================================================================

ALTER TABLE project_media ENABLE ROW LEVEL SECURITY;

-- Policy 1: Project members can view project media
CREATE POLICY "Project members can view project media"
  ON project_media
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id
      FROM profile_projects
      WHERE profile_id = auth.uid()
    )
  );

-- Policy 2: Project admins can manage project media
CREATE POLICY "Project admins can manage project media"
  ON project_media
  FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT pp.project_id
      FROM profile_projects pp
      WHERE pp.profile_id = auth.uid()
        AND pp.role IN ('admin', 'lead', 'coordinator')
    )
  );

-- Policy 3: Service role bypass
CREATE POLICY "Service role full access to project media"
  ON project_media
  FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- PART 2: PROJECT_ORGANIZATIONS (Enable RLS + Add Policies)
-- ============================================================================

ALTER TABLE project_organizations ENABLE ROW LEVEL SECURITY;

-- Policy 1: Org members can view projects linked to their org
CREATE POLICY "Org members can view org projects"
  ON project_organizations
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE profile_id = auth.uid()
    )
  );

-- Policy 2: Project members can view project orgs
CREATE POLICY "Project members can view project orgs"
  ON project_organizations
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id
      FROM profile_projects
      WHERE profile_id = auth.uid()
    )
  );

-- Policy 3: Project/org admins can manage linkages
CREATE POLICY "Admins can manage project-org links"
  ON project_organizations
  FOR ALL
  TO authenticated
  USING (
    -- Either project admin
    project_id IN (
      SELECT pp.project_id
      FROM profile_projects pp
      WHERE pp.profile_id = auth.uid()
        AND pp.role IN ('admin', 'lead')
    )
    OR
    -- Or org admin
    organization_id IN (
      SELECT om.organization_id
      FROM organization_members om
      WHERE om.profile_id = auth.uid()
        AND om.role IN ('admin', 'elder', 'cultural_advisor')
    )
  );

-- Policy 4: Service role bypass
CREATE POLICY "Service role full access to project orgs"
  ON project_organizations
  FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- PART 3: PROJECT_PARTICIPANTS (Enable RLS + Add Policies)
-- ============================================================================

ALTER TABLE project_participants ENABLE ROW LEVEL SECURITY;

-- Policy 1: Participants can view their own participation
CREATE POLICY "Participants can view own participation"
  ON project_participants
  FOR SELECT
  TO authenticated
  USING (
    storyteller_id IN (
      SELECT id FROM storytellers WHERE profile_id = auth.uid()
    )
  );

-- Policy 2: Project members can view all participants
CREATE POLICY "Project members can view participants"
  ON project_participants
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id
      FROM profile_projects
      WHERE profile_id = auth.uid()
    )
  );

-- Policy 3: Project admins can manage participants
CREATE POLICY "Project admins can manage participants"
  ON project_participants
  FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT pp.project_id
      FROM profile_projects pp
      WHERE pp.profile_id = auth.uid()
        AND pp.role IN ('admin', 'lead', 'coordinator')
    )
  );

-- Policy 4: Service role bypass
CREATE POLICY "Service role full access to participants"
  ON project_participants
  FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- PART 4: PROJECT_STORYTELLERS (Enable RLS + Add Policies)
-- ============================================================================

ALTER TABLE project_storytellers ENABLE ROW LEVEL SECURITY;

-- Policy 1: Storytellers can view their own project links
CREATE POLICY "Storytellers can view own project links"
  ON project_storytellers
  FOR SELECT
  TO authenticated
  USING (
    storyteller_id IN (
      SELECT id FROM storytellers WHERE profile_id = auth.uid()
    )
  );

-- Policy 2: Project members can view project storytellers
CREATE POLICY "Project members can view project storytellers"
  ON project_storytellers
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id
      FROM profile_projects
      WHERE profile_id = auth.uid()
    )
  );

-- Policy 3: Project admins can manage storyteller links
CREATE POLICY "Project admins can manage storytellers"
  ON project_storytellers
  FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT pp.project_id
      FROM profile_projects pp
      WHERE pp.profile_id = auth.uid()
        AND pp.role IN ('admin', 'lead', 'coordinator')
    )
  );

-- Policy 4: Service role bypass
CREATE POLICY "Service role full access to project storytellers"
  ON project_storytellers
  FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- PART 5: PROJECT_UPDATES (Enable RLS + Add Policies)
-- ============================================================================

ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

-- Policy 1: Project members can view project updates
CREATE POLICY "Project members can view updates"
  ON project_updates
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id
      FROM profile_projects
      WHERE profile_id = auth.uid()
    )
  );

-- Policy 2: Project contributors can create updates
CREATE POLICY "Project contributors can create updates"
  ON project_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT project_id
      FROM profile_projects
      WHERE profile_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Policy 3: Update authors can edit their own updates
CREATE POLICY "Authors can edit own updates"
  ON project_updates
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Policy 4: Project admins can manage all updates
CREATE POLICY "Project admins can manage all updates"
  ON project_updates
  FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT pp.project_id
      FROM profile_projects pp
      WHERE pp.profile_id = auth.uid()
        AND pp.role IN ('admin', 'lead', 'coordinator')
    )
  );

-- Policy 5: Service role bypass
CREATE POLICY "Service role full access to updates"
  ON project_updates
  FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- PART 6: STORYTELLER_PROJECTS (Enable RLS + Add Policies)
-- ============================================================================

ALTER TABLE storyteller_projects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Storytellers can view their own project links
CREATE POLICY "Storytellers can view own projects"
  ON storyteller_projects
  FOR SELECT
  TO authenticated
  USING (
    storyteller_id IN (
      SELECT id FROM storytellers WHERE profile_id = auth.uid()
    )
  );

-- Policy 2: Storytellers can manage their own project links
CREATE POLICY "Storytellers can manage own projects"
  ON storyteller_projects
  FOR ALL
  TO authenticated
  USING (
    storyteller_id IN (
      SELECT id FROM storytellers WHERE profile_id = auth.uid()
    )
  );

-- Policy 3: Project members can view project storytellers
CREATE POLICY "Project members can view storytellers"
  ON storyteller_projects
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id
      FROM profile_projects
      WHERE profile_id = auth.uid()
    )
  );

-- Policy 4: Project admins can manage storyteller links
CREATE POLICY "Project admins can manage links"
  ON storyteller_projects
  FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT pp.project_id
      FROM profile_projects pp
      WHERE pp.profile_id = auth.uid()
        AND pp.role IN ('admin', 'lead', 'coordinator')
    )
  );

-- Policy 5: Service role bypass
CREATE POLICY "Service role full access to storyteller projects"
  ON storyteller_projects
  FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify all 6 tables now have RLS enabled
DO $$
DECLARE
  missing_rls TEXT[];
BEGIN
  SELECT ARRAY_AGG(tablename) INTO missing_rls
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN ('project_media', 'project_organizations',
                      'project_participants', 'project_storytellers',
                      'project_updates', 'storyteller_projects')
    AND rowsecurity = FALSE;

  IF missing_rls IS NOT NULL THEN
    RAISE WARNING 'Tables still missing RLS: %', missing_rls;
  ELSE
    RAISE NOTICE '✓ All 6 project association tables have RLS enabled';
  END IF;
END $$;

-- Verify all tables have policies
DO $$
DECLARE
  table_name TEXT;
  policy_count INTEGER;
BEGIN
  FOR table_name IN
    SELECT unnest(ARRAY['project_media', 'project_organizations',
                        'project_participants', 'project_storytellers',
                        'project_updates', 'storyteller_projects'])
  LOOP
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = table_name;

    IF policy_count = 0 THEN
      RAISE WARNING 'Table % has no policies!', table_name;
    ELSE
      RAISE NOTICE '✓ Table % has % policies', table_name, policy_count;
    END IF;
  END LOOP;
END $$;

-- Add documentation comments
COMMENT ON TABLE project_media IS
  'Project media associations. RLS: Project members can view, admins can manage.';

COMMENT ON TABLE project_organizations IS
  'Project-organization links. RLS: Org/project members can view, admins can manage.';

COMMENT ON TABLE project_participants IS
  'Project participants. RLS: Members can view, participants see own, admins manage.';

COMMENT ON TABLE project_storytellers IS
  'Project storyteller links. RLS: Project members + storytellers can view, admins manage.';

COMMENT ON TABLE project_updates IS
  'Project updates/news. RLS: Members view, contributors create, authors edit own, admins manage all.';

COMMENT ON TABLE storyteller_projects IS
  'Storyteller project links. RLS: Storytellers manage own, project members can view, admins manage.';
