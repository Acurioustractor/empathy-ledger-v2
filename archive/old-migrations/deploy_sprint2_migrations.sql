-- Sprint 2 Migrations Deployment Script
-- This script deploys ONLY the Sprint 2 migrations
-- Execute this in Supabase Dashboard SQL Editor

-- ============================================================================
-- Migration 1: Stories Sprint 2 Fields
-- ============================================================================

-- Add missing story fields
ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS excerpt TEXT,
  ADD COLUMN IF NOT EXISTS story_type TEXT DEFAULT 'text' CHECK (story_type IN ('text', 'video', 'mixed_media')),
  ADD COLUMN IF NOT EXISTS video_link TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cultural_sensitivity_level TEXT DEFAULT 'none' CHECK (cultural_sensitivity_level IN ('none', 'moderate', 'high', 'sacred')),
  ADD COLUMN IF NOT EXISTS requires_elder_review BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS elder_reviewed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS elder_reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS elder_review_notes TEXT,
  ADD COLUMN IF NOT EXISTS elder_review_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reading_time INTEGER,
  ADD COLUMN IF NOT EXISTS word_count INTEGER,
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS enable_ai_processing BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_community BOOLEAN DEFAULT true;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_stories_cultural_sensitivity ON public.stories(cultural_sensitivity_level);
CREATE INDEX IF NOT EXISTS idx_stories_requires_elder_review ON public.stories(requires_elder_review) WHERE requires_elder_review = true;
CREATE INDEX IF NOT EXISTS idx_stories_tags ON public.stories USING gin(tags);

-- Auto-require Elder review for sacred content
CREATE OR REPLACE FUNCTION public.auto_require_elder_review()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cultural_sensitivity_level = 'sacred' THEN
    NEW.requires_elder_review = true;
    NEW.enable_ai_processing = false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_require_elder_review_trigger ON public.stories;
CREATE TRIGGER auto_require_elder_review_trigger
  BEFORE INSERT OR UPDATE ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_require_elder_review();

-- Auto-calculate word count and reading time
CREATE OR REPLACE FUNCTION public.calculate_story_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content IS NOT NULL THEN
    NEW.word_count = array_length(regexp_split_to_array(trim(NEW.content), '\s+'), 1);
    NEW.reading_time = GREATEST(1, CEIL(NEW.word_count::float / 200));
  ELSE
    NEW.word_count = 0;
    NEW.reading_time = 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_story_metrics_trigger ON public.stories;
CREATE TRIGGER calculate_story_metrics_trigger
  BEFORE INSERT OR UPDATE OF content ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_story_metrics();

-- Update RLS policies
DROP POLICY IF EXISTS "stories_read_published" ON public.stories;
CREATE POLICY "stories_read_published" ON public.stories
  FOR SELECT USING (
    status = 'published'
    AND (
      requires_elder_review = false
      OR (requires_elder_review = true AND elder_reviewed = true)
    )
  );

DROP POLICY IF EXISTS "stories_read_own" ON public.stories;
CREATE POLICY "stories_read_own" ON public.stories
  FOR SELECT USING (
    auth.uid() = storyteller_id OR auth.uid() = author_id
  );

DROP POLICY IF EXISTS "stories_insert_own" ON public.stories;
CREATE POLICY "stories_insert_own" ON public.stories
  FOR INSERT WITH CHECK (
    auth.uid() = storyteller_id OR auth.uid() = author_id
  );

DROP POLICY IF EXISTS "stories_update_own_draft" ON public.stories;
CREATE POLICY "stories_update_own_draft" ON public.stories
  FOR UPDATE USING (
    (auth.uid() = storyteller_id OR auth.uid() = author_id)
    AND status = 'draft'
  );

DROP POLICY IF EXISTS "stories_elder_review" ON public.stories;
CREATE POLICY "stories_elder_review" ON public.stories
  FOR UPDATE USING (
    requires_elder_review = true
    AND EXISTS (
      SELECT 1 FROM public.profile_organizations
      WHERE profile_organizations.profile_id = auth.uid()
      AND profile_organizations.role IN ('elder', 'admin')
    )
  );

-- ============================================================================
-- Migration 2: Media Assets Sprint 2 Fields
-- ============================================================================

-- Add missing media asset fields
ALTER TABLE public.media_assets
  ADD COLUMN IF NOT EXISTS caption TEXT,
  ADD COLUMN IF NOT EXISTS cultural_tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS culturally_sensitive BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS requires_attribution BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS attribution_text TEXT;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_media_assets_cultural_tags ON public.media_assets USING gin(cultural_tags);
CREATE INDEX IF NOT EXISTS idx_media_assets_culturally_sensitive ON public.media_assets(culturally_sensitive) WHERE culturally_sensitive = true;

-- Add RLS policies (if table doesn't have RLS enabled yet)
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Read policies
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

DROP POLICY IF EXISTS "media_assets_read_own" ON public.media_assets;
CREATE POLICY "media_assets_read_own" ON public.media_assets
  FOR SELECT USING (
    auth.uid() = uploaded_by
  );

-- Write policies
DROP POLICY IF EXISTS "media_assets_insert_own" ON public.media_assets;
CREATE POLICY "media_assets_insert_own" ON public.media_assets
  FOR INSERT WITH CHECK (
    auth.uid() = uploaded_by
  );

DROP POLICY IF EXISTS "media_assets_update_own" ON public.media_assets;
CREATE POLICY "media_assets_update_own" ON public.media_assets
  FOR UPDATE USING (
    auth.uid() = uploaded_by
  );

DROP POLICY IF EXISTS "media_assets_delete_own" ON public.media_assets;
CREATE POLICY "media_assets_delete_own" ON public.media_assets
  FOR DELETE USING (
    auth.uid() = uploaded_by
  );

-- Require alt text for images (accessibility)
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

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Verify stories table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'stories'
AND column_name IN ('excerpt', 'story_type', 'cultural_sensitivity_level', 'requires_elder_review', 'word_count', 'reading_time')
ORDER BY column_name;

-- Verify media_assets table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'media_assets'
AND column_name IN ('caption', 'cultural_tags', 'culturally_sensitive', 'requires_attribution')
ORDER BY column_name;

-- SUCCESS! Sprint 2 migrations deployed.
