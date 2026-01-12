-- JusticeHub Integration
-- Add columns to profiles, organizations, and projects tables to enable JusticeHub display control

-- ============================================================================
-- PROFILES TABLE - Add JusticeHub columns
-- ============================================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS justicehub_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS justicehub_role TEXT CHECK (justicehub_role IN (
  'founder',
  'leader',
  'advocate',
  'practitioner',
  'researcher',
  'lived-experience',
  'community-member'
)),
ADD COLUMN IF NOT EXISTS justicehub_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS justicehub_synced_at TIMESTAMPTZ;

COMMENT ON COLUMN profiles.justicehub_enabled IS 'Controls if profile appears on JusticeHub platform';
COMMENT ON COLUMN profiles.justicehub_role IS 'User role on JusticeHub (founder, leader, advocate, practitioner, researcher, lived-experience, community-member)';
COMMENT ON COLUMN profiles.justicehub_featured IS 'Show prominently on JusticeHub homepage';
COMMENT ON COLUMN profiles.justicehub_synced_at IS 'When profile was last synced to JusticeHub';

-- Create index for JusticeHub enabled profiles
CREATE INDEX IF NOT EXISTS idx_profiles_justicehub_enabled
  ON profiles(justicehub_enabled)
  WHERE justicehub_enabled = true;

-- ============================================================================
-- ORGANIZATIONS TABLE - Add JusticeHub columns
-- ============================================================================

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS justicehub_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS justicehub_synced_at TIMESTAMPTZ;

COMMENT ON COLUMN organizations.justicehub_enabled IS 'Controls if organization appears on JusticeHub';
COMMENT ON COLUMN organizations.justicehub_synced_at IS 'When organization was last synced to JusticeHub';

-- Create index for JusticeHub enabled organizations
CREATE INDEX IF NOT EXISTS idx_organizations_justicehub_enabled
  ON organizations(justicehub_enabled)
  WHERE justicehub_enabled = true;

-- ============================================================================
-- PROJECTS TABLE - Add JusticeHub columns
-- ============================================================================

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS justicehub_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS justicehub_program_type TEXT CHECK (justicehub_program_type IN (
  'Diversion Program',
  'Mentoring Program',
  'Cultural Program',
  'Education Support',
  'Arts Program',
  'Sports Program',
  'Family Support',
  'Employment Program',
  'Counseling Service',
  'Legal Support',
  'Advocacy Initiative',
  'Research Project',
  'Community Development',
  'Other'
)),
ADD COLUMN IF NOT EXISTS justicehub_synced_at TIMESTAMPTZ;

COMMENT ON COLUMN projects.justicehub_enabled IS 'Controls if project appears on JusticeHub as community program';
COMMENT ON COLUMN projects.justicehub_program_type IS 'Type of community program for JusticeHub categorization';
COMMENT ON COLUMN projects.justicehub_synced_at IS 'When project was last synced to JusticeHub';

-- Create index for JusticeHub enabled projects
CREATE INDEX IF NOT EXISTS idx_projects_justicehub_enabled
  ON projects(justicehub_enabled)
  WHERE justicehub_enabled = true;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get all JusticeHub-enabled profiles
CREATE OR REPLACE FUNCTION get_justicehub_profiles()
RETURNS TABLE (
  id UUID,
  email TEXT,
  display_name TEXT,
  full_name TEXT,
  bio TEXT,
  profile_image_url TEXT,
  cultural_background TEXT,
  justicehub_role TEXT,
  justicehub_featured BOOLEAN,
  justicehub_synced_at TIMESTAMPTZ,
  is_elder BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.email,
    p.display_name,
    p.full_name,
    p.bio,
    p.profile_image_url,
    p.cultural_background,
    p.justicehub_role,
    p.justicehub_featured,
    p.justicehub_synced_at,
    p.is_elder
  FROM profiles p
  WHERE p.justicehub_enabled = true
  ORDER BY p.justicehub_featured DESC, p.display_name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all JusticeHub-enabled organizations
CREATE OR REPLACE FUNCTION get_justicehub_organizations()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  type TEXT,
  justicehub_synced_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.name,
    o.slug,
    o.type,
    o.justicehub_synced_at
  FROM organizations o
  WHERE o.justicehub_enabled = true
  ORDER BY o.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all JusticeHub-enabled projects
CREATE OR REPLACE FUNCTION get_justicehub_projects()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  organization_id UUID,
  justicehub_program_type TEXT,
  justicehub_synced_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    p.description,
    p.organization_id,
    p.justicehub_program_type,
    p.justicehub_synced_at
  FROM projects p
  WHERE p.justicehub_enabled = true
  ORDER BY p.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANTS (if needed for specific roles)
-- ============================================================================

-- Grant execute permissions on functions (adjust role names as needed)
-- GRANT EXECUTE ON FUNCTION get_justicehub_profiles() TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_justicehub_organizations() TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_justicehub_projects() TO authenticated;
