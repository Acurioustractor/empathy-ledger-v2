-- Add Sprint 2 Story Fields
-- This migration adds fields needed for Sprint 2 Story components

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
  ADD COLUMN IF NOT EXISTS reading_time INTEGER, -- in minutes
  ADD COLUMN IF NOT EXISTS word_count INTEGER,
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS enable_ai_processing BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_community BOOLEAN DEFAULT true;

-- Add index for cultural sensitivity filtering
CREATE INDEX IF NOT EXISTS idx_stories_cultural_sensitivity ON public.stories(cultural_sensitivity_level);
CREATE INDEX IF NOT EXISTS idx_stories_requires_elder_review ON public.stories(requires_elder_review) WHERE requires_elder_review = true;
CREATE INDEX IF NOT EXISTS idx_stories_tags ON public.stories USING gin(tags);

-- Add trigger to automatically set requires_elder_review when cultural_sensitivity_level is 'sacred'
CREATE OR REPLACE FUNCTION public.auto_require_elder_review()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cultural_sensitivity_level = 'sacred' THEN
    NEW.requires_elder_review = true;
    -- Disable AI processing for sacred content
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

-- Add trigger to calculate word count and reading time
CREATE OR REPLACE FUNCTION public.calculate_story_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content IS NOT NULL THEN
    -- Calculate word count
    NEW.word_count = array_length(regexp_split_to_array(trim(NEW.content), '\s+'), 1);

    -- Calculate reading time (assuming 200 words per minute)
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

-- Update RLS policies to respect Elder review requirements
DROP POLICY IF EXISTS "stories_read_published" ON public.stories;
CREATE POLICY "stories_read_published" ON public.stories
  FOR SELECT USING (
    status = 'published'
    AND (
      requires_elder_review = false
      OR (requires_elder_review = true AND elder_reviewed = true)
    )
  );

-- Allow storytellers to read their own drafts
DROP POLICY IF EXISTS "stories_read_own" ON public.stories;
CREATE POLICY "stories_read_own" ON public.stories
  FOR SELECT USING (
    auth.uid() = storyteller_id OR auth.uid() = author_id
  );

-- Allow storytellers to insert their own stories
DROP POLICY IF EXISTS "stories_insert_own" ON public.stories;
CREATE POLICY "stories_insert_own" ON public.stories
  FOR INSERT WITH CHECK (
    auth.uid() = storyteller_id OR auth.uid() = author_id
  );

-- Allow storytellers to update their own unpublished stories
DROP POLICY IF EXISTS "stories_update_own_draft" ON public.stories;
CREATE POLICY "stories_update_own_draft" ON public.stories
  FOR UPDATE USING (
    (auth.uid() = storyteller_id OR auth.uid() = author_id)
    AND status = 'draft'
  );

-- Allow Elders to review stories requiring their approval
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

-- Add comments
COMMENT ON COLUMN public.stories.excerpt IS 'Short excerpt/summary for previews (optional)';
COMMENT ON COLUMN public.stories.story_type IS 'Type of story: text, video, or mixed_media';
COMMENT ON COLUMN public.stories.video_link IS 'YouTube or Vimeo link for video stories';
COMMENT ON COLUMN public.stories.location IS 'Geographic location relevant to the story';
COMMENT ON COLUMN public.stories.tags IS 'User-defined tags for categorization';
COMMENT ON COLUMN public.stories.cultural_sensitivity_level IS 'Level of cultural sensitivity: none, moderate, high, sacred';
COMMENT ON COLUMN public.stories.requires_elder_review IS 'Whether story requires Elder approval before publishing';
COMMENT ON COLUMN public.stories.elder_reviewed IS 'Whether an Elder has reviewed and approved the story';
COMMENT ON COLUMN public.stories.reading_time IS 'Estimated reading time in minutes (auto-calculated)';
COMMENT ON COLUMN public.stories.word_count IS 'Word count (auto-calculated from content)';
COMMENT ON COLUMN public.stories.enable_ai_processing IS 'Whether to allow AI theme extraction (disabled for sacred content)';
COMMENT ON COLUMN public.stories.notify_community IS 'Whether to notify community members when published';
