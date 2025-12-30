-- Migration: Community Representative Tracking
-- Description: Add community representative roles and verification to profiles
-- Phase: 2 - Advanced Analytics Components
-- Date: 2025-12-26

-- ============================================================================
-- COMMUNITY REPRESENTATIVE ROLES
-- ============================================================================
-- Community representatives are storytellers who play governance and
-- facilitation roles within their communities. They help coordinate campaigns,
-- verify consent, and ensure cultural protocols are followed.

-- Add community representative fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_community_representative BOOLEAN DEFAULT FALSE;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS representative_role TEXT CHECK (
  representative_role IS NULL OR
  representative_role IN ('facilitator', 'advocate', 'connector', 'cultural_keeper', 'other')
);

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS representative_verified_at TIMESTAMPTZ;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS representative_verified_by UUID REFERENCES auth.users(id);

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS representative_bio TEXT;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS representative_community TEXT;

-- Add representative metadata (JSON for flexible attributes)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS representative_metadata JSONB DEFAULT '{}';

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN profiles.is_community_representative IS
'Indicates if this profile is a community representative with governance roles';

COMMENT ON COLUMN profiles.representative_role IS
'Type of representative role: facilitator, advocate, connector, cultural_keeper, other';

COMMENT ON COLUMN profiles.representative_verified_at IS
'Timestamp when representative status was verified';

COMMENT ON COLUMN profiles.representative_verified_by IS
'User ID of admin who verified representative status';

COMMENT ON COLUMN profiles.representative_bio IS
'Biography or description of representative role and responsibilities';

COMMENT ON COLUMN profiles.representative_community IS
'Name of community or communities this representative serves';

COMMENT ON COLUMN profiles.representative_metadata IS
'Flexible JSON field for additional representative attributes like certifications, languages, specialties';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for finding all community representatives
CREATE INDEX IF NOT EXISTS idx_profiles_community_representative
ON profiles(is_community_representative)
WHERE is_community_representative = TRUE;

-- Index for filtering by representative role
CREATE INDEX IF NOT EXISTS idx_profiles_representative_role
ON profiles(representative_role)
WHERE representative_role IS NOT NULL;

-- Index for representative community
CREATE INDEX IF NOT EXISTS idx_profiles_representative_community
ON profiles(representative_community)
WHERE representative_community IS NOT NULL;

-- Composite index for tenant + representative queries
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_representative
ON profiles(tenant_id, is_community_representative)
WHERE is_community_representative = TRUE;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Community representatives are visible to all authenticated users in their tenant
-- (This helps with campaign coordination and storyteller outreach)

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "profiles_community_reps_visible_in_tenant" ON profiles;

-- Allow viewing community representative profiles within tenant
CREATE POLICY "profiles_community_reps_visible_in_tenant" ON profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  is_community_representative = TRUE AND
  tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

-- Only admins and Elders can update representative status
DROP POLICY IF EXISTS "profiles_update_representative_status_admin_only" ON profiles;

CREATE POLICY "profiles_update_representative_status_admin_only" ON profiles
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND
  (
    -- Admin or Elder can update
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'elder') OR
    -- Or updating own profile (but not representative status fields)
    id = auth.uid()
  )
)
WITH CHECK (
  -- If updating representative fields, must be admin/elder
  (
    is_community_representative IS NOT DISTINCT FROM (SELECT is_community_representative FROM profiles WHERE id = auth.uid()) OR
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'elder')
  )
);

-- ============================================================================
-- HELPER FUNCTION: Get Community Representatives
-- ============================================================================

CREATE OR REPLACE FUNCTION get_community_representatives(
  p_tenant_id UUID DEFAULT NULL,
  p_role TEXT DEFAULT NULL,
  p_community TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  avatar_url TEXT,
  representative_role TEXT,
  representative_bio TEXT,
  representative_community TEXT,
  representative_verified_at TIMESTAMPTZ,
  story_count BIGINT,
  representative_metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.display_name,
    p.avatar_url,
    p.representative_role,
    p.representative_bio,
    p.representative_community,
    p.representative_verified_at,
    COUNT(DISTINCT s.id) as story_count,
    p.representative_metadata
  FROM profiles p
  LEFT JOIN stories s ON s.storyteller_id = p.id
  WHERE
    p.is_community_representative = TRUE
    AND (p_tenant_id IS NULL OR p.tenant_id = p_tenant_id)
    AND (p_role IS NULL OR p.representative_role = p_role)
    AND (p_community IS NULL OR p.representative_community ILIKE '%' || p_community || '%')
    AND p.tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  GROUP BY
    p.id,
    p.display_name,
    p.avatar_url,
    p.representative_role,
    p.representative_bio,
    p.representative_community,
    p.representative_verified_at,
    p.representative_metadata
  ORDER BY p.representative_verified_at DESC NULLS LAST;
END;
$$;

COMMENT ON FUNCTION get_community_representatives IS
'Get list of community representatives with optional filtering by tenant, role, and community';

-- ============================================================================
-- HELPER FUNCTION: Get Representative Analytics
-- ============================================================================

CREATE OR REPLACE FUNCTION get_representative_analytics(
  p_representative_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'representative_id', p_representative_id,
    'stories_facilitated', (
      SELECT COUNT(*)
      FROM stories
      WHERE storyteller_id = p_representative_id
    ),
    'campaigns_involved', (
      -- TODO: When campaigns table exists, count campaign participation
      SELECT 0
    ),
    'storytellers_recruited', (
      -- Track via representative_metadata or campaign participation
      SELECT COALESCE((p.representative_metadata->>'storytellers_recruited')::INT, 0)
      FROM profiles p
      WHERE p.id = p_representative_id
    ),
    'communities_served', (
      SELECT representative_community
      FROM profiles
      WHERE id = p_representative_id
    ),
    'verified_at', (
      SELECT representative_verified_at
      FROM profiles
      WHERE id = p_representative_id
    ),
    'role', (
      SELECT representative_role
      FROM profiles
      WHERE id = p_representative_id
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION get_representative_analytics IS
'Get analytics summary for a community representative including stories facilitated, campaigns, and recruitment metrics';

-- ============================================================================
-- AUDIT LOG
-- ============================================================================

-- Log when representative status changes
CREATE OR REPLACE FUNCTION log_representative_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (OLD.is_community_representative IS DISTINCT FROM NEW.is_community_representative) THEN
    -- Log to audit table (assuming audit_log table exists)
    INSERT INTO audit_log (
      entity_type,
      entity_id,
      action,
      changes,
      performed_by,
      tenant_id,
      created_at
    ) VALUES (
      'profile',
      NEW.id,
      CASE
        WHEN NEW.is_community_representative THEN 'representative_granted'
        ELSE 'representative_revoked'
      END,
      jsonb_build_object(
        'old_status', OLD.is_community_representative,
        'new_status', NEW.is_community_representative,
        'role', NEW.representative_role,
        'verified_by', NEW.representative_verified_by
      ),
      auth.uid(),
      NEW.tenant_id,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for representative status changes
DROP TRIGGER IF EXISTS trigger_log_representative_status_change ON profiles;

CREATE TRIGGER trigger_log_representative_status_change
AFTER UPDATE ON profiles
FOR EACH ROW
WHEN (OLD.is_community_representative IS DISTINCT FROM NEW.is_community_representative)
EXECUTE FUNCTION log_representative_status_change();

-- ============================================================================
-- SAMPLE DATA FOR DEVELOPMENT (Optional - Comment out for production)
-- ============================================================================

-- Example: Mark a few profiles as community representatives (for development/testing)
-- UNCOMMENT ONLY IN DEVELOPMENT ENVIRONMENTS

/*
UPDATE profiles
SET
  is_community_representative = TRUE,
  representative_role = 'facilitator',
  representative_verified_at = NOW(),
  representative_verified_by = (SELECT id FROM auth.users WHERE email = 'admin@empathyledger.com' LIMIT 1),
  representative_bio = 'Community facilitator helping coordinate storytelling events and campaigns.',
  representative_community = 'Local Community Network',
  representative_metadata = jsonb_build_object(
    'storytellers_recruited', 15,
    'campaigns_facilitated', 3,
    'languages', ARRAY['English', 'Spanish'],
    'specialties', ARRAY['Youth Engagement', 'Cultural Protocols']
  )
WHERE email IN ('representative1@example.com', 'representative2@example.com')
AND is_storyteller = TRUE;
*/

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify migration applied successfully
DO $$
BEGIN
  -- Check that columns exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'is_community_representative'
  ) THEN
    RAISE EXCEPTION 'Migration failed: is_community_representative column not created';
  END IF;

  RAISE NOTICE 'Community representative migration completed successfully';
END $$;
