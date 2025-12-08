-- SNOW FOUNDATION SCHEMA FIX
-- Adds missing columns needed for the complete setup
-- ================================

-- 1. Fix galleries table
ALTER TABLE public.galleries 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

ALTER TABLE public.galleries 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

ALTER TABLE public.galleries 
ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- 2. Fix media_assets table
ALTER TABLE public.media_assets 
ADD COLUMN IF NOT EXISTS original_filename TEXT;

-- Update existing records to have original_filename from filename
UPDATE public.media_assets 
SET original_filename = COALESCE(filename, 'unknown.file')
WHERE original_filename IS NULL;

-- Make it not null after updating
ALTER TABLE public.media_assets 
ALTER COLUMN original_filename SET NOT NULL;

-- 3. Fix stories table
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS has_explicit_consent BOOLEAN DEFAULT true;

ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS consent_details JSONB;

ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS cultural_sensitivity_level TEXT DEFAULT 'general';

-- 4. Create organization_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  permissions TEXT[],
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Enable RLS
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Create policies for organization_members
CREATE POLICY "Organization members are viewable by everyone" 
  ON public.organization_members FOR SELECT 
  USING (true);

CREATE POLICY "Organization admins can manage members" 
  ON public.organization_members FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND (
        profiles.tenant_roles && ARRAY['admin']::text[] 
        OR profiles.email IN ('benjamin@act.place')
      )
    )
  );

-- 5. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_galleries_organization_id ON public.galleries(organization_id);
CREATE INDEX IF NOT EXISTS idx_galleries_is_public ON public.galleries(is_public);
CREATE INDEX IF NOT EXISTS idx_stories_organization_id ON public.stories(organization_id);
CREATE INDEX IF NOT EXISTS idx_stories_is_public ON public.stories(is_public);
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON public.organization_members(user_id);

-- Verify the changes
SELECT 
  'Galleries' as table_name,
  COUNT(*) as count,
  array_agg(column_name) FILTER (WHERE column_name IN ('is_public', 'featured', 'cover_image')) as new_columns
FROM information_schema.columns 
WHERE table_name = 'galleries'
UNION ALL
SELECT 
  'Media Assets' as table_name,
  COUNT(*) as count,
  array_agg(column_name) FILTER (WHERE column_name = 'original_filename') as new_columns
FROM information_schema.columns 
WHERE table_name = 'media_assets'
UNION ALL
SELECT 
  'Stories' as table_name,
  COUNT(*) as count,
  array_agg(column_name) FILTER (WHERE column_name IN ('has_explicit_consent', 'consent_details', 'cultural_sensitivity_level')) as new_columns
FROM information_schema.columns 
WHERE table_name = 'stories';