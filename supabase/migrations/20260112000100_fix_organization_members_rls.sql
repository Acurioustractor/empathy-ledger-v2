-- Migration: Fix organization_members RLS (P0 BLOCKER)
-- Date: 2026-01-12
-- Issue: RLS enabled but 0 policies = complete lockout
-- Impact: Organization features broken, users can't access membership data

-- RLS is already enabled on this table, we just need to add policies

-- Policy 1: Members can view their own membership records
CREATE POLICY "Members can view own membership"
  ON organization_members
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- Policy 2: Members can view other members in same organization
CREATE POLICY "Members can view org members"
  ON organization_members
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE profile_id = auth.uid()
    )
  );

-- Policy 3: Organization admins/elders can manage membership
CREATE POLICY "Admins can manage membership"
  ON organization_members
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE profile_id = auth.uid()
        AND role IN ('admin', 'elder', 'cultural_advisor')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE profile_id = auth.uid()
        AND role IN ('admin', 'elder', 'cultural_advisor')
    )
  );

-- Policy 4: Super admins have full access
CREATE POLICY "Super admins full access to members"
  ON organization_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM super_admin_permissions
      WHERE profile_id = auth.uid()
        AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM super_admin_permissions
      WHERE profile_id = auth.uid()
        AND is_active = true
    )
  );

-- Policy 5: Service role has full access (for system operations)
CREATE POLICY "Service role manages members"
  ON organization_members
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add helpful comment
COMMENT ON TABLE organization_members IS
  'Organization membership with RLS. Members can view org members, admins can manage membership.';
