-- Add Editorial/Article Columns to Stories Table
-- This adds the missing columns that were in the migration but not applied

-- Article/Editorial type field
ALTER TABLE stories ADD COLUMN IF NOT EXISTS article_type TEXT
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

-- URL slug for articles
ALTER TABLE stories ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- SEO meta fields
ALTER TABLE stories ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Featured image reference
ALTER TABLE stories ADD COLUMN IF NOT EXISTS featured_image_id UUID
  REFERENCES media(id) ON DELETE SET NULL;

-- Syndication destinations (array of site slugs)
ALTER TABLE stories ADD COLUMN IF NOT EXISTS syndication_destinations TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Target audience
ALTER TABLE stories ADD COLUMN IF NOT EXISTS audience TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stories_article_type ON stories(article_type) WHERE article_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stories_slug ON stories(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stories_featured_image ON stories(featured_image_id) WHERE featured_image_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stories_syndication ON stories USING GIN(syndication_destinations) WHERE syndication_destinations IS NOT NULL;

-- Add helpful comments
COMMENT ON COLUMN stories.article_type IS 'Type of article/editorial content (story_feature, editorial, etc.)';
COMMENT ON COLUMN stories.slug IS 'URL-friendly slug for article pages';
COMMENT ON COLUMN stories.meta_title IS 'SEO meta title (overrides title if set)';
COMMENT ON COLUMN stories.meta_description IS 'SEO meta description';
COMMENT ON COLUMN stories.featured_image_id IS 'Featured/hero image for article display';
COMMENT ON COLUMN stories.syndication_destinations IS 'Array of site slugs where this content is syndicated';
COMMENT ON COLUMN stories.audience IS 'Target audience for the content';

-- Note: themes column already exists as JSONB, tags already exists as TEXT[]
-- These are good to use as-is
