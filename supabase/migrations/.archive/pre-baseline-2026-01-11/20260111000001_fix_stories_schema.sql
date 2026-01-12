-- Migration: Fix Stories Schema Inconsistencies
-- Date: January 11, 2026
-- Purpose: Resolve schema mismatches between code and database

-- ============================================
-- 1. ADD MISSING COLUMNS
-- ============================================

-- Add audience column (referenced in create form)
ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS audience TEXT
  CHECK (audience IN ('all_ages', 'children', 'youth', 'adults', 'elders'));

-- Add workflow boolean flags (referenced in create form)
ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS elder_approval_required BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cultural_review_required BOOLEAN DEFAULT FALSE;

-- Add comment count for sorting
ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- ============================================
-- 2. FIX COLUMN INCONSISTENCIES
-- ============================================

-- Standardize view count column name
-- Check if views_count exists and migrate to view_count
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'views_count'
  ) THEN
    -- Copy data to view_count if it doesn't exist
    ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
    UPDATE public.stories SET view_count = views_count WHERE view_count = 0;
    -- Drop old column
    ALTER TABLE public.stories DROP COLUMN views_count;
  END IF;
END $$;

-- Ensure view_count exists
ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- ============================================
-- 3. CREATE STATUS HISTORY TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.story_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Ensure we can track the progression
  CONSTRAINT valid_status CHECK (
    to_status IN ('draft', 'review', 'in_review', 'elder_review', 'approved', 'published', 'scheduled', 'archived')
  )
);

-- ============================================
-- 4. ADD PERFORMANCE INDEXES
-- ============================================

-- Status filtering (most common query)
CREATE INDEX IF NOT EXISTS idx_stories_status
  ON public.stories(status)
  WHERE deleted_at IS NULL;

-- Scheduled publishing queries
CREATE INDEX IF NOT EXISTS idx_stories_scheduled
  ON public.stories(scheduled_publish_at)
  WHERE status = 'scheduled' AND deleted_at IS NULL;

-- Full-text search (uses existing search_vector)
CREATE INDEX IF NOT EXISTS idx_stories_search
  ON public.stories USING gin(search_vector);

-- Theme filtering
CREATE INDEX IF NOT EXISTS idx_stories_themes
  ON public.stories USING gin(themes);

-- Tag filtering
CREATE INDEX IF NOT EXISTS idx_stories_tags
  ON public.stories USING gin(tags);

-- Cultural themes filtering
CREATE INDEX IF NOT EXISTS idx_stories_cultural_themes
  ON public.stories USING gin(cultural_themes);

-- Published stories (most common public query)
CREATE INDEX IF NOT EXISTS idx_stories_published
  ON public.stories(published_at DESC)
  WHERE status = 'published' AND deleted_at IS NULL;

-- View count sorting
CREATE INDEX IF NOT EXISTS idx_stories_view_count
  ON public.stories(view_count DESC)
  WHERE status = 'published' AND deleted_at IS NULL;

-- Status history queries
CREATE INDEX IF NOT EXISTS idx_story_status_history_story
  ON public.story_status_history(story_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_story_status_history_user
  ON public.story_status_history(changed_by, changed_at DESC);

-- ============================================
-- 5. CREATE HELPER FUNCTIONS
-- ============================================

-- Function to update comment count when comments are added/removed
CREATE OR REPLACE FUNCTION update_story_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.stories
    SET comments_count = comments_count + 1
    WHERE id = NEW.story_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.stories
    SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = OLD.story_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update comment counts
DROP TRIGGER IF EXISTS trigger_update_story_comments_count ON public.comments;
CREATE TRIGGER trigger_update_story_comments_count
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION update_story_comments_count();

-- Function to automatically log status changes
CREATE OR REPLACE FUNCTION log_story_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.story_status_history (
      story_id,
      from_status,
      to_status,
      changed_by,
      metadata
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(), -- Current user from auth context
      jsonb_build_object(
        'scheduled_publish_at', NEW.scheduled_publish_at,
        'published_at', NEW.published_at
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically log status changes
DROP TRIGGER IF EXISTS trigger_log_story_status_change ON public.stories;
CREATE TRIGGER trigger_log_story_status_change
  AFTER UPDATE ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION log_story_status_change();

-- ============================================
-- 6. UPDATE SEARCH VECTOR TRIGGER
-- ============================================

-- Ensure search_vector is updated when title/content/excerpt changes
CREATE OR REPLACE FUNCTION update_story_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C') ||
    setweight(to_tsvector('english', array_to_string(COALESCE(NEW.tags, ARRAY[]::TEXT[]), ' ')), 'B') ||
    setweight(to_tsvector('english', array_to_string(COALESCE(NEW.themes, ARRAY[]::TEXT[]), ' ')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_story_search_vector ON public.stories;
CREATE TRIGGER trigger_update_story_search_vector
  BEFORE INSERT OR UPDATE OF title, content, excerpt, tags, themes
  ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION update_story_search_vector();

-- ============================================
-- 7. BACKFILL EXISTING DATA
-- ============================================

-- Update search_vector for existing stories
UPDATE public.stories
SET search_vector =
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(excerpt, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(content, '')), 'C') ||
  setweight(to_tsvector('english', array_to_string(COALESCE(tags, ARRAY[]::TEXT[]), ' ')), 'B') ||
  setweight(to_tsvector('english', array_to_string(COALESCE(themes, ARRAY[]::TEXT[]), ' ')), 'B')
WHERE search_vector IS NULL OR search_vector = ''::tsvector;

-- Initialize comment counts
UPDATE public.stories s
SET comments_count = (
  SELECT COUNT(*)
  FROM public.comments c
  WHERE c.story_id = s.id
)
WHERE comments_count = 0 OR comments_count IS NULL;

-- ============================================
-- 8. ADD HELPFUL COMMENTS
-- ============================================

COMMENT ON COLUMN public.stories.audience IS 'Target audience age group for the story';
COMMENT ON COLUMN public.stories.elder_approval_required IS 'Whether this story requires elder approval before publishing';
COMMENT ON COLUMN public.stories.cultural_review_required IS 'Whether this story requires cultural review';
COMMENT ON COLUMN public.stories.comments_count IS 'Cached count of comments (auto-updated via trigger)';
COMMENT ON COLUMN public.stories.view_count IS 'Number of times this story has been viewed';

COMMENT ON TABLE public.story_status_history IS 'Audit trail of all status changes for stories';

COMMENT ON FUNCTION update_story_comments_count() IS 'Automatically updates story comment count when comments are added/removed';
COMMENT ON FUNCTION log_story_status_change() IS 'Automatically logs status changes to story_status_history table';
COMMENT ON FUNCTION update_story_search_vector() IS 'Automatically updates full-text search vector when story content changes';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Stories schema migration completed successfully';
  RAISE NOTICE 'Added columns: audience, elder_approval_required, cultural_review_required, comments_count';
  RAISE NOTICE 'Fixed column: views_count → view_count';
  RAISE NOTICE 'Created table: story_status_history';
  RAISE NOTICE 'Created indexes: 11 performance indexes';
  RAISE NOTICE 'Created triggers: comment count, status logging, search vector';
END $$;
