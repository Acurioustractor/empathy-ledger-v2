-- Add Missing Database Columns for Schema Alignment
-- This script adds the columns referenced in API routes but missing from the database

-- Add missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES organizations(id);

-- Add missing columns to stories table
ALTER TABLE stories ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES organizations(id);

-- Add missing columns to organizations table (if tenant_id is self-referential)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Add missing columns to media_assets table
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES organizations(id);
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS uploader_id UUID REFERENCES profiles(id);

-- Add missing columns to galleries table
ALTER TABLE galleries ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES organizations(id);

-- Add missing columns to transcripts table (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transcripts') THEN
        ALTER TABLE transcripts ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES organizations(id);
    END IF;
END $$;

-- Update full_name from existing first_name and last_name
UPDATE profiles 
SET full_name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
WHERE full_name IS NULL AND (first_name IS NOT NULL OR last_name IS NOT NULL);

-- Update profile_image_url from avatar_url where needed
UPDATE profiles 
SET profile_image_url = avatar_url 
WHERE profile_image_url IS NULL AND avatar_url IS NOT NULL;

-- Add indexes for the new foreign key columns
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stories_tenant_id ON stories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_tenant_id ON media_assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_uploader_id ON media_assets(uploader_id);
CREATE INDEX IF NOT EXISTS idx_galleries_tenant_id ON galleries(tenant_id);

-- Add comments for documentation
COMMENT ON COLUMN profiles.full_name IS 'Combined first and last name for easier querying';
COMMENT ON COLUMN profiles.profile_image_url IS 'Alternative column name for avatar_url used in some API routes';
COMMENT ON COLUMN profiles.tenant_id IS 'References the organization this profile belongs to for multi-tenant architecture';
COMMENT ON COLUMN stories.tenant_id IS 'References the organization this story belongs to';
COMMENT ON COLUMN media_assets.tenant_id IS 'References the organization this media asset belongs to';
COMMENT ON COLUMN media_assets.uploader_id IS 'References the user who uploaded this media asset';

-- Verify the changes
SELECT 
  'profiles' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('full_name', 'profile_image_url', 'tenant_id')

UNION ALL

SELECT 
  'stories' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'stories' 
  AND column_name = 'tenant_id'

UNION ALL

SELECT 
  'media_assets' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'media_assets' 
  AND column_name IN ('tenant_id', 'uploader_id')

ORDER BY table_name, column_name;