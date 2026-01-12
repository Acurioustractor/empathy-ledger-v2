-- Migration: Fix organization_invitations RLS (P0 BLOCKER)
-- Date: 2026-01-12
-- Issue: RLS enabled but 0 policies = can't invite users
-- Impact: Organization invitation system broken

-- RLS is already enabled on this table, we just need to add policies

-- Policy 1: Users can view invitations sent to their email
CREATE POLICY "Users can view own invitations"
  ON organization_invitations
  FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR invited_by = auth.uid()
  );

-- Policy 2: Organization admins/elders can create invitations
CREATE POLICY "Org admins can invite"
  ON organization_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE profile_id = auth.uid()
        AND role IN ('admin', 'elder', 'cultural_advisor')
    )
  );

-- Policy 3: Organization admins can view all org invitations
CREATE POLICY "Org admins can view org invitations"
  ON organization_invitations
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

-- Policy 4: Users can update their own invitations (accept/decline)
CREATE POLICY "Users can respond to invitations"
  ON organization_invitations
  FOR UPDATE
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Policy 5: Admins can delete/cancel invitations
CREATE POLICY "Admins can cancel invitations"
  ON organization_invitations
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE profile_id = auth.uid()
        AND role IN ('admin', 'elder')
    )
    OR invited_by = auth.uid()
  );

-- Policy 6: Super admins have full access
CREATE POLICY "Super admins full access to invitations"
  ON organization_invitations
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

-- Policy 7: Service role has full access
CREATE POLICY "Service role manages invitations"
  ON organization_invitations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add helpful comment
COMMENT ON TABLE organization_invitations IS
  'Organization invitations with RLS. Users see invitations to their email, admins manage org invitations.';
