-- Migration: Storyteller Schema Enhancement
-- Date: 2025-10-05
-- Purpose: Add missing fields and tables for full storyteller functionality

-- =============================================
-- STEP 1: Add missing columns to profiles table
-- =============================================
-- STEP 0: Add tenant_id to organizations table
-- =============================================

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Set default tenant_id = organization id for existing orgs
UPDATE organizations
SET tenant_id = id
WHERE tenant_id IS NULL;

-- Add index
CREATE INDEX IF NOT EXISTS idx_organizations_tenant
ON organizations(tenant_id)
WHERE tenant_id IS NOT NULL;

COMMENT ON COLUMN organizations.tenant_id IS 'Tenant identifier for multi-tenant support. Defaults to organization ID.';
-- =============================================

-- Personal Information
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS preferred_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS pronouns TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Multi-tenant Support
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS tenant_id UUID,
ADD COLUMN IF NOT EXISTS tenant_roles TEXT[] DEFAULT '{}';

-- Storyteller Specific
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_storyteller BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_elder BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS traditional_knowledge_keeper BOOLEAN DEFAULT false;

-- Status & Onboarding
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS profile_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Media URLs (legacy support)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS video_introduction_url TEXT,
ADD COLUMN IF NOT EXISTS featured_video_url TEXT;

-- Cultural & Location
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS cultural_background TEXT,
ADD COLUMN IF NOT EXISTS cultural_affiliations TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS languages_spoken TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Storytelling & Impact
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS storytelling_experience TEXT,
ADD COLUMN IF NOT EXISTS impact_focus_areas TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS expertise_areas TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS storytelling_methods TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS change_maker_type TEXT,
ADD COLUMN IF NOT EXISTS geographic_scope TEXT,
ADD COLUMN IF NOT EXISTS years_of_community_work INTEGER;

-- Availability
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS mentor_availability BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS speaking_availability BOOLEAN DEFAULT false;

-- Metadata
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS cultural_permissions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cultural_protocols JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS emergency_contact JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{}';

-- Accessibility
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS dietary_requirements TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS accessibility_needs TEXT[] DEFAULT '{}';

-- Professional
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS occupation TEXT;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS job_title TEXT;  -- changed from current_role (reserved word)

-- Privacy
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'private',
ADD COLUMN IF NOT EXISTS preferred_communication TEXT[] DEFAULT '{}';

-- Interests
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- Update timestamp
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =============================================
-- STEP 2: Create profile_organizations table
-- =============================================

CREATE TABLE IF NOT EXISTS profile_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',

  -- Unique constraint: one profile can only have one active relationship per org
  CONSTRAINT unique_profile_org UNIQUE (profile_id, organization_id)
);

-- Indexes for profile_organizations
CREATE INDEX IF NOT EXISTS idx_profile_organizations_profile ON profile_organizations(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_organizations_org ON profile_organizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_profile_organizations_role ON profile_organizations(role);
CREATE INDEX IF NOT EXISTS idx_profile_organizations_active ON profile_organizations(is_active) WHERE is_active = true;

-- =============================================
-- STEP 3: Create organization_invitations table
-- =============================================

-- Enable pgcrypto extension for random bytes
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS organization_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  invitation_code TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending', -- pending, accepted, expired, cancelled
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',

  CONSTRAINT unique_pending_invitation UNIQUE (organization_id, email, status)
);

-- Indexes for organization_invitations
CREATE INDEX IF NOT EXISTS idx_org_invitations_org ON organization_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_invitations_email ON organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_org_invitations_code ON organization_invitations(invitation_code);
CREATE INDEX IF NOT EXISTS idx_org_invitations_status ON organization_invitations(status);
CREATE INDEX IF NOT EXISTS idx_org_invitations_profile ON organization_invitations(profile_id);

-- =============================================
-- STEP 4: Add indexes to profiles for new columns
-- =============================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone_number) WHERE phone_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON profiles(tenant_id) WHERE tenant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_is_storyteller ON profiles(is_storyteller) WHERE is_storyteller = true;
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON profiles(full_name);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(profile_status);

-- Add GIN index for array searches
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_roles ON profiles USING GIN(tenant_roles);
CREATE INDEX IF NOT EXISTS idx_profiles_cultural_affiliations ON profiles USING GIN(cultural_affiliations);
CREATE INDEX IF NOT EXISTS idx_profiles_languages ON profiles USING GIN(languages_spoken);

-- =============================================
-- STEP 5: Update RPC function
-- =============================================

DROP FUNCTION IF EXISTS create_profile_with_media(TEXT, TEXT, UUID, UUID);

CREATE OR REPLACE FUNCTION create_profile_with_media(
  p_display_name TEXT,
  p_full_name TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_avatar_media_id UUID DEFAULT NULL,
  p_cover_media_id UUID DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_phone_number TEXT DEFAULT NULL,
  p_tenant_id UUID DEFAULT NULL,
  p_is_storyteller BOOLEAN DEFAULT false
)
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO profiles (
    display_name,
    full_name,
    bio,
    avatar_media_id,
    cover_media_id,
    email,
    phone_number,
    tenant_id,
    is_storyteller,
    tenant_roles,
    profile_status
  )
  VALUES (
    p_display_name,
    COALESCE(p_full_name, p_display_name),
    p_bio,
    p_avatar_media_id,
    p_cover_media_id,
    p_email,
    p_phone_number,
    p_tenant_id,
    p_is_storyteller,
    CASE WHEN p_is_storyteller THEN ARRAY['storyteller']::TEXT[] ELSE ARRAY[]::TEXT[] END,
    CASE WHEN p_email IS NOT NULL THEN 'pending_activation' ELSE 'active' END
  )
  RETURNING profiles.*;
END;
$$;

-- =============================================
-- STEP 6: Add updated_at triggers
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profile_organizations_updated_at ON profile_organizations;
CREATE TRIGGER update_profile_organizations_updated_at
  BEFORE UPDATE ON profile_organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- STEP 7: Migrate existing data
-- =============================================

-- Update full_name from display_name where missing
UPDATE profiles
SET full_name = display_name
WHERE full_name IS NULL AND display_name IS NOT NULL;

-- Set existing profiles as active
UPDATE profiles
SET profile_status = 'active'
WHERE profile_status IS NULL;

-- =============================================
-- STEP 8: Add comments for documentation
-- =============================================

COMMENT ON TABLE profile_organizations IS 'Junction table linking profiles to organizations with role information. Supports multi-tenant users belonging to multiple organizations.';
COMMENT ON TABLE organization_invitations IS 'Tracks email invitations sent to users to join organizations. Includes invitation codes and expiry dates.';

COMMENT ON COLUMN profiles.tenant_id IS 'Primary tenant/organization this profile belongs to. Can be null for system-wide profiles.';
COMMENT ON COLUMN profiles.tenant_roles IS 'Array of roles within the tenant (e.g., storyteller, admin, member)';
COMMENT ON COLUMN profiles.is_storyteller IS 'Flag indicating if this profile is a storyteller';
COMMENT ON COLUMN profiles.profile_status IS 'Status: active, pending_activation, pending, suspended, deleted';
COMMENT ON COLUMN profiles.email IS 'Email address for the profile. Used for invitations and notifications.';
COMMENT ON COLUMN profiles.phone_number IS 'Phone number for the profile. Alternative to email for some workflows.';

-- =============================================
-- STEP 9: Grant permissions
-- =============================================

-- Enable RLS on new tables
ALTER TABLE profile_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies require auth.uid() which may not be available in all environments
-- These policies are commented out for initial migration and should be added based on your auth setup

-- CREATE POLICY "Users can view their own organization memberships"
--   ON profile_organizations FOR SELECT
--   USING (true);  -- Adjust based on your auth setup
--
-- CREATE POLICY "Admins can manage organization memberships"
--   ON profile_organizations FOR ALL
--   USING (true);  -- Adjust based on your auth setup
--
-- CREATE POLICY "Users can view invitations sent to their email"
--   ON organization_invitations FOR SELECT
--   USING (true);  -- Adjust based on your auth setup
--
-- CREATE POLICY "Admins can manage invitations"
--   ON organization_invitations FOR ALL
--   USING (true);  -- Adjust based on your auth setup

-- =============================================
-- STEP 10: Validation
-- =============================================

-- Verify new columns exist
DO $$
DECLARE
  missing_columns TEXT[];
BEGIN
  SELECT ARRAY_AGG(column_name::TEXT)
  INTO missing_columns
  FROM (
    VALUES
      ('email'), ('phone_number'), ('full_name'), ('tenant_id'),
      ('tenant_roles'), ('is_storyteller'), ('profile_status')
  ) AS required(column_name)
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = required.column_name
  );

  IF missing_columns IS NOT NULL THEN
    RAISE EXCEPTION 'Missing columns in profiles table: %', array_to_string(missing_columns, ', ');
  END IF;

  RAISE NOTICE '✅ All required columns exist in profiles table';
END $$;

-- Verify new tables exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profile_organizations') THEN
    RAISE EXCEPTION 'profile_organizations table not created';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_invitations') THEN
    RAISE EXCEPTION 'organization_invitations table not created';
  END IF;

  RAISE NOTICE '✅ All required tables exist';
  RAISE NOTICE '✅ Migration completed successfully!';
END $$;
