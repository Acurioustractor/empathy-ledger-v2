-- Add Sprint 2 Media Assets Fields
-- This migration adds fields needed for Sprint 2 Media components

-- Add missing media asset fields
ALTER TABLE public.media_assets
  ADD COLUMN IF NOT EXISTS caption TEXT, -- Different from description, used for display
  ADD COLUMN IF NOT EXISTS cultural_tags TEXT[] DEFAULT '{}', -- Replaces generic tags for cultural context
  ADD COLUMN IF NOT EXISTS culturally_sensitive BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS requires_attribution BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS attribution_text TEXT;

-- Rename description to match component expectations (keep both for backward compatibility)
-- Note: description already exists, caption is the display version

-- Add indexes for cultural filtering
CREATE INDEX IF NOT EXISTS idx_media_assets_cultural_tags ON public.media_assets USING gin(cultural_tags);
CREATE INDEX IF NOT EXISTS idx_media_assets_culturally_sensitive ON public.media_assets(culturally_sensitive) WHERE culturally_sensitive = true;

-- Add RLS policies
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Allow users to read media assets associated with published stories
DROP POLICY IF EXISTS "media_assets_read_published" ON public.media_assets;
CREATE POLICY "media_assets_read_published" ON public.media_assets
  FOR SELECT USING (
    status = 'active'
    AND (
      visibility = 'public'
      OR EXISTS (
        SELECT 1 FROM public.stories
        WHERE stories.id = media_assets.story_id
        AND stories.status = 'published'
      )
    )
  );

-- Allow users to read their own media assets
DROP POLICY IF EXISTS "media_assets_read_own" ON public.media_assets;
CREATE POLICY "media_assets_read_own" ON public.media_assets
  FOR SELECT USING (
    auth.uid() = uploaded_by
  );

-- Allow users to insert their own media assets
DROP POLICY IF EXISTS "media_assets_insert_own" ON public.media_assets;
CREATE POLICY "media_assets_insert_own" ON public.media_assets
  FOR INSERT WITH CHECK (
    auth.uid() = uploaded_by
  );

-- Allow users to update their own media assets
DROP POLICY IF EXISTS "media_assets_update_own" ON public.media_assets;
CREATE POLICY "media_assets_update_own" ON public.media_assets
  FOR UPDATE USING (
    auth.uid() = uploaded_by
  );

-- Allow users to delete their own media assets
DROP POLICY IF EXISTS "media_assets_delete_own" ON public.media_assets;
CREATE POLICY "media_assets_delete_own" ON public.media_assets
  FOR DELETE USING (
    auth.uid() = uploaded_by
  );

-- Add trigger to enforce alt_text requirement for accessibility
CREATE OR REPLACE FUNCTION public.require_alt_text_for_images()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.media_type = 'image' AND (NEW.alt_text IS NULL OR trim(NEW.alt_text) = '') THEN
    RAISE EXCEPTION 'Alt text is required for images (accessibility requirement)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS require_alt_text_trigger ON public.media_assets;
CREATE TRIGGER require_alt_text_trigger
  BEFORE INSERT OR UPDATE ON public.media_assets
  FOR EACH ROW
  WHEN (NEW.media_type = 'image')
  EXECUTE FUNCTION public.require_alt_text_for_images();

-- Add comments
COMMENT ON COLUMN public.media_assets.caption IS 'Caption for display with the media (optional)';
COMMENT ON COLUMN public.media_assets.cultural_tags IS 'Tags for cultural categorization (e.g., ceremony, traditional dress, sacred site)';
COMMENT ON COLUMN public.media_assets.culturally_sensitive IS 'Whether media requires cultural context or has special protocols';
COMMENT ON COLUMN public.media_assets.requires_attribution IS 'Whether to display attribution when media is shown';
COMMENT ON COLUMN public.media_assets.attribution_text IS 'Text to display for attribution (e.g., "Photo by Jane Doe")';
COMMENT ON COLUMN public.media_assets.alt_text IS 'Required alt text for accessibility (screen readers)';
