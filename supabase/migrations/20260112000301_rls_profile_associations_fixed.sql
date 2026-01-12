-- Migration: Phase 2 RLS - Profile Association Tables (CORRECTED)
-- Date: 2026-01-12
-- Purpose: Secure actual profile association tables in production
-- Tables: profile_locations, profile_galleries, profile_projects, profile_organizations

-- ============================================================================
-- PART 1: PROFILE_LOCATIONS (Enable RLS + Add Policies)
-- ============================================================================

-- Enable RLS
ALTER TABLE profile_locations ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own location associations
CREATE POLICY "Users can view own locations"
  ON profile_locations
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- Policy 2: Users can manage their own location associations
CREATE POLICY "Users can manage own locations"
  ON profile_locations
  FOR ALL
  TO authenticated
  USING (profile_id = auth.uid());

-- Policy 3: Org admins can view member locations (for contact/coordination)
CREATE POLICY "Org admins can view member locations"
  ON profile_locations
  FOR SELECT
  TO authenticated
  USING (
    profile_id IN (
      SELECT om.profile_id
      FROM organization_members om
      WHERE om.organization_id IN (
        SELECT organization_id
        FROM organization_members
        WHERE profile_id = auth.uid()
          AND role IN ('admin', 'elder', 'cultural_advisor')
      )
    )
  );

-- Policy 4: Service role bypass
CREATE POLICY "Service role full access to locations"
  ON profile_locations
  FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- PART 2: PROFILE_GALLERIES (Enable RLS + Add Policies)
-- ============================================================================

-- Enable RLS if not already
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = 'profile_galleries'
      AND rowsecurity = TRUE
  ) THEN
    ALTER TABLE profile_galleries ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Policy 1: Users can view their own galleries
CREATE POLICY "Users can view own galleries"
  ON profile_galleries
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- Policy 2: Users can manage their own galleries
CREATE POLICY "Users can manage own galleries"
  ON profile_galleries
  FOR ALL
  TO authenticated
  USING (profile_id = auth.uid());

-- Policy 3: Service role bypass
CREATE POLICY "Service role full access to galleries"
  ON profile_galleries
  FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- PART 3: PROFILE_PROJECTS (Enable RLS + Add Policies)
-- ============================================================================

-- Enable RLS if not already
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = 'profile_projects'
      AND rowsecurity = TRUE
  ) THEN
    ALTER TABLE profile_projects ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Policy 1: Users can view their own project associations
CREATE POLICY "Users can view own project associations"
  ON profile_projects
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- Policy 2: Users can manage their own project associations
CREATE POLICY "Users can manage own project associations"
  ON profile_projects
  FOR ALL
  TO authenticated
  USING (profile_id = auth.uid());

-- Policy 3: Project members can view project participants
CREATE POLICY "Project members can view participants"
  ON profile_projects
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id
      FROM profile_projects
      WHERE profile_id = auth.uid()
    )
  );

-- Policy 4: Service role bypass
CREATE POLICY "Service role full access to project associations"
  ON profile_projects
  FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- PART 4: PROFILE_ORGANIZATIONS (Add Missing Policies)
-- ============================================================================
-- Note: RLS already enabled, only has 1 policy, needs more

-- Policy 2: Users can update their own metadata
CREATE POLICY "Users can update own org membership metadata"
  ON profile_organizations
  FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Policy 3: Org admins can view all org memberships
CREATE POLICY "Org admins can view org memberships"
  ON profile_organizations
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE profile_id = auth.uid()
        AND role IN ('admin', 'elder', 'cultural_advisor')
    )
  );

-- Policy 4: Org admins can manage org memberships
CREATE POLICY "Org admins can manage org memberships"
  ON profile_organizations
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE profile_id = auth.uid()
        AND role IN ('admin', 'elder', 'cultural_advisor')
    )
  );

-- Policy 5: Service role bypass
CREATE POLICY "Service role full access to org memberships"
  ON profile_organizations
  FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify all 4 tables now have RLS enabled
DO $$
DECLARE
  missing_rls TEXT[];
BEGIN
  SELECT ARRAY_AGG(tablename) INTO missing_rls
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN ('profile_locations', 'profile_galleries',
                      'profile_projects', 'profile_organizations')
    AND rowsecurity = FALSE;

  IF missing_rls IS NOT NULL THEN
    RAISE WARNING 'Tables still missing RLS: %', missing_rls;
  ELSE
    RAISE NOTICE '✓ All 4 profile association tables have RLS enabled';
  END IF;
END $$;

-- Verify all tables have policies
DO $$
DECLARE
  table_name TEXT;
  policy_count INTEGER;
BEGIN
  FOR table_name IN
    SELECT unnest(ARRAY['profile_locations', 'profile_galleries',
                        'profile_projects', 'profile_organizations'])
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
COMMENT ON TABLE profile_locations IS
  'Profile location associations. RLS: Owner + org admins can view, owner can manage.';

COMMENT ON TABLE profile_galleries IS
  'Profile media galleries. RLS: Owner can manage, public can view published galleries.';

COMMENT ON TABLE profile_projects IS
  'Profile project associations. RLS: Owner + project members can view, owner can manage.';

COMMENT ON TABLE profile_organizations IS
  'Profile organization memberships. RLS: Owner + org admins can view/manage.';
