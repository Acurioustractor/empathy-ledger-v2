-- CORRECTED DATABASE MIGRATION SCRIPT
-- Based on actual database audit and API route analysis
-- This script adds only the missing columns that API routes actually need
-- Generated: 2025-09-11

-- ========================================
-- ADD MULTI-TENANT ARCHITECTURE COLUMNS
-- ========================================

-- Add tenant_id to profiles for multi-tenant architecture
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Add tenant_id to stories for multi-tenant isolation
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Add tenant_id to media_assets for multi-tenant isolation
ALTER TABLE public.media_assets ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Add tenant_id to organizations (self-referential for hierarchy)
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Add tenant_id to projects for multi-tenant isolation
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Add tenant_id to transcripts for multi-tenant isolation
ALTER TABLE public.transcripts ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- ========================================
-- ADD MISSING PROFILE COLUMNS
-- ========================================

-- Add first_name and last_name that cultural-safety.ts expects
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Add full_name for easier querying (used in some API routes)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add profile_image_url as alternative to avatar_url
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- ========================================
-- ADD MISSING MEDIA COLUMNS
-- ========================================

-- Add uploader_id to media_assets (referenced in API routes)
ALTER TABLE public.media_assets ADD COLUMN IF NOT EXISTS uploader_id UUID;

-- ========================================
-- CREATE MISSING TABLES
-- ========================================

-- Create photo_galleries table (referenced in organization stats API)
CREATE TABLE IF NOT EXISTS public.photo_galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  tenant_id UUID,
  organization_id UUID,
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  cultural_sensitivity_level TEXT CHECK (cultural_sensitivity_level IN ('public', 'community', 'restricted', 'sacred')) DEFAULT 'community'
);

-- Enable RLS on photo_galleries
ALTER TABLE public.photo_galleries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for photo_galleries
CREATE POLICY "Photo galleries viewable by organization members" 
  ON public.photo_galleries FOR SELECT 
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can create galleries in their tenant" 
  ON public.photo_galleries FOR INSERT 
  WITH CHECK (created_by = auth.uid());

-- ========================================
-- ADD FOREIGN KEY CONSTRAINTS
-- ========================================

-- Add foreign key constraints for tenant_id columns
-- Note: We don't add REFERENCES constraints yet as they might cause issues
-- These can be added later once data is properly migrated

-- ========================================
-- CREATE PERFORMANCE INDEXES
-- ========================================

-- Multi-tenant indexes
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stories_tenant_id ON public.stories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_tenant_id ON public.media_assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_projects_tenant_id ON public.projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_tenant_id ON public.transcripts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_photo_galleries_tenant_id ON public.photo_galleries(tenant_id);

-- User relationship indexes
CREATE INDEX IF NOT EXISTS idx_media_assets_uploader_id ON public.media_assets(uploader_id);
CREATE INDEX IF NOT EXISTS idx_profiles_name_search ON public.profiles(first_name, last_name, full_name);

-- Cultural sensitivity indexes
CREATE INDEX IF NOT EXISTS idx_stories_cultural_sensitivity ON public.stories(cultural_sensitivity_level);
CREATE INDEX IF NOT EXISTS idx_photo_galleries_cultural_sensitivity ON public.photo_galleries(cultural_sensitivity_level);

-- ========================================
-- DATA MIGRATION
-- ========================================

-- Update full_name from display_name where available
UPDATE public.profiles 
SET full_name = display_name 
WHERE full_name IS NULL AND display_name IS NOT NULL;

-- Update profile_image_url from avatar_url where available
UPDATE public.profiles 
SET profile_image_url = avatar_url 
WHERE profile_image_url IS NULL AND avatar_url IS NOT NULL;

-- ========================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON COLUMN public.profiles.tenant_id IS 'Multi-tenant isolation - references organization';
COMMENT ON COLUMN public.profiles.first_name IS 'First name for cultural safety anonymization';
COMMENT ON COLUMN public.profiles.last_name IS 'Last name for cultural safety anonymization';
COMMENT ON COLUMN public.profiles.full_name IS 'Combined name for easier querying';
COMMENT ON COLUMN public.profiles.profile_image_url IS 'Alternative column name for avatar_url';

COMMENT ON COLUMN public.stories.tenant_id IS 'Multi-tenant isolation - references organization';
COMMENT ON COLUMN public.media_assets.tenant_id IS 'Multi-tenant isolation - references organization';
COMMENT ON COLUMN public.media_assets.uploader_id IS 'References user who uploaded the media';

COMMENT ON TABLE public.photo_galleries IS 'Photo gallery collections for organizations';

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Verify the migration succeeded
SELECT 
  'profiles' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('tenant_id', 'first_name', 'last_name', 'full_name', 'profile_image_url')

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

UNION ALL

SELECT 
  'photo_galleries' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'photo_galleries' 
  AND column_name IN ('id', 'name', 'tenant_id')

ORDER BY table_name, column_name;

-- Show created indexes
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes 
WHERE tablename IN ('profiles', 'stories', 'media_assets', 'projects', 'transcripts', 'photo_galleries')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;