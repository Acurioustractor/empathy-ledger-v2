-- Migration: Add Editorial Columns to Stories
-- Date: January 11, 2026
-- Purpose: Add missing columns for SEO, tagging, and editorial workflow

-- ============================================
-- 1. ADD SEO & EDITORIAL COLUMNS
-- ============================================

-- SEO fields
ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Content classification
ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS article_type TEXT
    CHECK (article_type IN (
      'story_feature',
      'program_spotlight',
      'research_summary',
      'community_news',
      'editorial',
      'impact_report',
      'project_update',
      'tutorial',
      'personal_story',
      'oral_history'
    ));

-- Taxonomy
ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS themes TEXT[];

-- Media
ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS featured_image_id UUID;

-- Publishing
ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS syndication_destinations TEXT[];

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

-- Slug for SEO URLs (unique)
CREATE UNIQUE INDEX IF NOT EXISTS idx_stories_slug
  ON public.stories(slug)
  WHERE slug IS NOT NULL AND deleted_at IS NULL;

-- Article type filtering
CREATE INDEX IF NOT EXISTS idx_stories_article_type
  ON public.stories(article_type)
  WHERE article_type IS NOT NULL;

-- Tag searching (GIN for array contains)
CREATE INDEX IF NOT EXISTS idx_stories_tags
  ON public.stories USING gin(tags);

-- Theme searching (GIN for array contains)
CREATE INDEX IF NOT EXISTS idx_stories_themes
  ON public.stories USING gin(themes);

-- Featured image lookup
CREATE INDEX IF NOT EXISTS idx_stories_featured_image
  ON public.stories(featured_image_id)
  WHERE featured_image_id IS NOT NULL;

-- Syndication filtering
CREATE INDEX IF NOT EXISTS idx_stories_syndication
  ON public.stories USING gin(syndication_destinations);

-- ============================================
-- 3. CREATE SLUG GENERATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION generate_story_slug(story_title TEXT, story_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert title to slug format
  base_slug := lower(regexp_replace(
    regexp_replace(story_title, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  ));

  -- Truncate to 100 chars
  base_slug := substring(base_slug from 1 for 100);

  -- Remove trailing hyphens
  base_slug := regexp_replace(base_slug, '-+$', '');

  final_slug := base_slug;

  -- Check for uniqueness, append counter if needed
  WHILE EXISTS (
    SELECT 1 FROM stories
    WHERE slug = final_slug
    AND id != story_id
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. CREATE AUTO-SLUG TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if slug is null and title exists
  IF NEW.slug IS NULL AND NEW.title IS NOT NULL THEN
    NEW.slug := generate_story_slug(NEW.title, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_slug ON public.stories;
CREATE TRIGGER trigger_auto_generate_slug
  BEFORE INSERT OR UPDATE OF title
  ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_slug();

-- ============================================
-- 5. BACKFILL SLUGS FOR EXISTING STORIES
-- ============================================

-- Generate slugs for stories that don't have them
UPDATE public.stories
SET slug = generate_story_slug(title, id)
WHERE slug IS NULL
  AND title IS NOT NULL
  AND title != '';

-- ============================================
-- 6. UPDATE SEARCH VECTOR TO INCLUDE TAGS/THEMES
-- ============================================

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

-- Trigger already exists from previous migration, just update the function

-- ============================================
-- 7. ADD HELPFUL COMMENTS
-- ============================================

COMMENT ON COLUMN stories.slug IS 'SEO-friendly URL slug, auto-generated from title';
COMMENT ON COLUMN stories.meta_title IS 'SEO meta title (override for social/search)';
COMMENT ON COLUMN stories.meta_description IS 'SEO meta description (override for social/search)';
COMMENT ON COLUMN stories.article_type IS 'Content classification for editorial workflows';
COMMENT ON COLUMN stories.tags IS 'Freeform tags for categorization and search';
COMMENT ON COLUMN stories.themes IS 'Controlled theme taxonomy for thematic analysis';
COMMENT ON COLUMN stories.featured_image_id IS 'Primary image for story cards and social sharing';
COMMENT ON COLUMN stories.syndication_destinations IS 'Array of platforms where story is/will be published';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Stories editorial columns migration completed';
  RAISE NOTICE 'Added columns: slug, meta_title, meta_description, article_type, tags, themes, featured_image_id, syndication_destinations';
  RAISE NOTICE 'Created indexes: 6 new indexes for filtering and search';
  RAISE NOTICE 'Created functions: generate_story_slug, auto_generate_slug trigger';
  RAISE NOTICE 'Backfilled: Slugs for % existing stories', (SELECT COUNT(*) FROM stories WHERE slug IS NOT NULL);
END $$;
