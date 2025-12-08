-- SNOW FOUNDATION SCHEMA FIX V2
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

-- 3. Fix stories table
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS has_explicit_consent BOOLEAN DEFAULT true;

ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS consent_details JSONB;

ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS cultural_sensitivity_level TEXT DEFAULT 'general';

-- 4. Check what columns exist in organizations table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'organizations'
ORDER BY ordinal_position;

-- 5. Check what columns exist in profiles table  
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 6. Only create organization_members if we have the right columns
-- Skip this for now since we need to check the schema first

-- 7. Verify galleries columns
SELECT 
  'Galleries' as table_name,
  COUNT(*) as total_columns,
  COUNT(*) FILTER (WHERE column_name IN ('is_public', 'featured', 'cover_image')) as new_columns_added
FROM information_schema.columns 
WHERE table_name = 'galleries';

-- 8. Verify media_assets columns
SELECT 
  'Media Assets' as table_name,
  COUNT(*) as total_columns,
  COUNT(*) FILTER (WHERE column_name = 'original_filename') as new_columns_added
FROM information_schema.columns 
WHERE table_name = 'media_assets';

-- 9. Verify stories columns
SELECT 
  'Stories' as table_name,
  COUNT(*) as total_columns,
  COUNT(*) FILTER (WHERE column_name IN ('has_explicit_consent', 'consent_details', 'cultural_sensitivity_level')) as new_columns_added
FROM information_schema.columns 
WHERE table_name = 'stories';