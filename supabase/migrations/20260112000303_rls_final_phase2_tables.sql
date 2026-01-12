-- Migration: Phase 2 RLS - Final Tables (Storyteller & Geographic)
-- Date: 2026-01-12
-- Purpose: Secure remaining storyteller associations and geographic/PII tables
-- Tables: storyteller_media_links, storyteller_organizations, locations, media_person_recognition

-- ============================================================================
-- PART 1: STORYTELLER_MEDIA_LINKS (Enable RLS + Add Policies)
-- ============================================================================

ALTER TABLE storyteller_media_links ENABLE ROW LEVEL SECURITY;

-- Policy 1: Storytellers can view their own media links
CREATE POLICY "Storytellers can view own media links"
  ON storyteller_media_links
  FOR SELECT
  TO authenticated
  USING (
    storyteller_id IN (
      SELECT id FROM storytellers WHERE profile_id = auth.uid()
    )
  );

-- Policy 2: Storytellers can manage their own media links
CREATE POLICY "Storytellers can manage own media links"
  ON storyteller_media_links
  FOR ALL
  TO authenticated
  USING (
    storyteller_id IN (
      SELECT id FROM storytellers WHERE profile_id = auth.uid()
    )
  );

-- Policy 3: Service role bypass
CREATE POLICY "Service role full access to media links"
  ON storyteller_media_links
  FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- PART 2: STORYTELLER_ORGANIZATIONS (Add Missing Policies)
-- ============================================================================
-- Note: RLS enabled but 0 policies (from previous migration)

-- Policy 1: Storytellers can view their own org memberships
CREATE POLICY "Storytellers can view own org memberships"
  ON storyteller_organizations
  FOR SELECT
  TO authenticated
  USING (
    storyteller_id IN (
      SELECT id FROM storytellers WHERE profile_id = auth.uid()
    )
  );

-- Policy 2: Storytellers can manage their own org memberships
CREATE POLICY "Storytellers can manage own org memberships"
  ON storyteller_organizations
  FOR ALL
  TO authenticated
  USING (
    storyteller_id IN (
      SELECT id FROM storytellers WHERE profile_id = auth.uid()
    )
  );

-- Policy 3: Org members can view org storytellers
CREATE POLICY "Org members can view org storytellers"
  ON storyteller_organizations
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE profile_id = auth.uid()
    )
  );

-- Policy 4: Org admins can manage org storytellers
CREATE POLICY "Org admins can manage org storytellers"
  ON storyteller_organizations
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id
      FROM organization_members om
      WHERE om.profile_id = auth.uid()
        AND om.role IN ('admin', 'elder', 'cultural_advisor')
    )
  );

-- Policy 5: Service role bypass
CREATE POLICY "Service role full access to storyteller orgs"
  ON storyteller_organizations
  FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- PART 3: LOCATIONS (Enable RLS + Add Policies)
-- ============================================================================
-- IMPORTANT: Geographic data can be sensitive (home addresses, sacred sites)

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view locations linked to their profile
CREATE POLICY "Users can view linked locations"
  ON locations
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT location_id
      FROM profile_locations
      WHERE profile_id = auth.uid()
    )
  );

-- Policy 2: All authenticated users can create locations
-- (They become linkable via profile_locations)
CREATE POLICY "Authenticated users can create locations"
  ON locations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 3: Service role can manage all locations
CREATE POLICY "Service role full access to locations"
  ON locations
  FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- PART 4: MEDIA_PERSON_RECOGNITION (Enable RLS + Add Policies)
-- ============================================================================
-- CRITICAL: Contains PII (face recognition data)

ALTER TABLE media_person_recognition ENABLE ROW LEVEL SECURITY;

-- Policy 1: Person in photo can view their recognition data
CREATE POLICY "Recognized person can view own data"
  ON media_person_recognition
  FOR SELECT
  TO authenticated
  USING (
    linked_storyteller_id IN (
      SELECT id FROM storytellers WHERE profile_id = auth.uid()
    )
  );

-- Policy 2: Person in photo can manage their recognition data
CREATE POLICY "Recognized person can manage own data"
  ON media_person_recognition
  FOR ALL
  TO authenticated
  USING (
    linked_storyteller_id IN (
      SELECT id FROM storytellers WHERE profile_id = auth.uid()
    )
  );

-- Policy 3: Media owner can view recognition data on their media
CREATE POLICY "Media owner can view recognition on own media"
  ON media_person_recognition
  FOR SELECT
  TO authenticated
  USING (
    media_asset_id IN (
      SELECT id FROM media_assets WHERE uploader_id = auth.uid()
    )
  );

-- Policy 4: Media owner can manage recognition data
CREATE POLICY "Media owner can manage recognition"
  ON media_person_recognition
  FOR ALL
  TO authenticated
  USING (
    media_asset_id IN (
      SELECT id FROM media_assets WHERE uploader_id = auth.uid()
    )
  );

-- Policy 5: Only show publicly consented recognitions to others
CREATE POLICY "Public can view consented recognitions"
  ON media_person_recognition
  FOR SELECT
  TO authenticated
  USING (
    can_be_public = TRUE
    AND uploader_consent_granted = TRUE
    AND person_consent_granted = TRUE
    AND recognition_consent_granted = TRUE
  );

-- Policy 6: Service role bypass
CREATE POLICY "Service role full access to recognition"
  ON media_person_recognition
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
    AND tablename IN ('storyteller_media_links', 'storyteller_organizations',
                      'locations', 'media_person_recognition')
    AND rowsecurity = FALSE;

  IF missing_rls IS NOT NULL THEN
    RAISE WARNING 'Tables still missing RLS: %', missing_rls;
  ELSE
    RAISE NOTICE '✓ All 4 final Phase 2 tables have RLS enabled';
  END IF;
END $$;

-- Verify all tables have policies
DO $$
DECLARE
  table_name TEXT;
  policy_count INTEGER;
BEGIN
  FOR table_name IN
    SELECT unnest(ARRAY['storyteller_media_links', 'storyteller_organizations',
                        'locations', 'media_person_recognition'])
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
COMMENT ON TABLE storyteller_media_links IS
  'Storyteller media associations. RLS: Storytellers + media owners can view/manage their links.';

COMMENT ON TABLE storyteller_organizations IS
  'Storyteller organization memberships. RLS: Storytellers + org members can view, admins manage.';

COMMENT ON TABLE locations IS
  'Geographic locations (can be sensitive). RLS: Creator + linked users can view, public if is_public=true.';

COMMENT ON TABLE media_person_recognition IS
  'Face recognition data (PII). RLS: Recognized person + media owner can manage, public sees only verified+consented.';
