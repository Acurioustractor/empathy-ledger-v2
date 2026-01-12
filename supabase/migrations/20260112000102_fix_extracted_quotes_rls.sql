-- Migration: Fix extracted_quotes RLS (P0 HIGH RISK - PRIVACY VIOLATION)
-- Date: 2026-01-12
-- Issue: NO RLS at all - 71 storyteller quotes completely exposed
-- Impact: Privacy violation, anyone with DB access can read all quotes

-- Enable RLS on extracted_quotes table
ALTER TABLE extracted_quotes ENABLE ROW LEVEL SECURITY;

-- Policy 1: Quote authors can view their own quotes
CREATE POLICY "Authors can view own quotes"
  ON extracted_quotes
  FOR SELECT
  TO authenticated
  USING (
    author_id = auth.uid()
  );

-- Policy 2: Public quotes are viewable by everyone (respects storyteller choice)
CREATE POLICY "Public quotes are visible"
  ON extracted_quotes
  FOR SELECT
  TO authenticated
  USING (
    -- Check if quote is marked as public (we'll need to add this column later)
    -- For now, assume quotes are organization-scoped
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE profile_id = auth.uid()
    )
  );

-- Policy 3: Organization members can view quotes from their organization
CREATE POLICY "Org members can view org quotes"
  ON extracted_quotes
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE profile_id = auth.uid()
    )
  );

-- Policy 4: Project members can view project quotes
CREATE POLICY "Project members can view project quotes"
  ON extracted_quotes
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT p.id
      FROM projects p
      JOIN organization_members om ON om.organization_id = p.organization_id
      WHERE om.profile_id = auth.uid()
    )
  );

-- Policy 5: Service role can insert quotes (from AI analysis)
CREATE POLICY "Service role can manage quotes"
  ON extracted_quotes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 6: Quote authors can update their own quotes
CREATE POLICY "Authors can update own quotes"
  ON extracted_quotes
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Policy 7: Quote authors can delete their own quotes
CREATE POLICY "Authors can delete own quotes"
  ON extracted_quotes
  FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Policy 8: Organization admins can manage org quotes
CREATE POLICY "Org admins can manage org quotes"
  ON extracted_quotes
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

-- Policy 9: Super admins have full access
CREATE POLICY "Super admins full access to quotes"
  ON extracted_quotes
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

-- Add helpful comment
COMMENT ON TABLE extracted_quotes IS
  'Storyteller quotes with RLS. Authors own their quotes, org members can view org quotes.
   Privacy-first: quotes are organization-scoped by default.';

-- Note: We may want to add a privacy_level column later for finer control:
-- ALTER TABLE extracted_quotes ADD COLUMN privacy_level text DEFAULT 'organization'
--   CHECK (privacy_level IN ('private', 'organization', 'public'));
