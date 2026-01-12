-- Don't drop articles table yet (keep for rollback safety)
-- Instead, rename it and document deprecation

-- First, check if we need to copy articles to stories
-- Add a content column to stories if it doesn't exist (articles use 'content', stories use 'story_copy')
ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS content TEXT;

-- Copy articles into stories (if not already copied)
INSERT INTO public.stories (
  title,
  slug,
  story_copy,  -- Map content → story_copy
  content,     -- Also set content field for article-type stories
  excerpt,
  status,
  cultural_permission_level,  -- Map visibility → cultural_permission_level
  featured,
  published_at,
  created_at,
  updated_at,
  article_type,
  primary_project,
  related_projects,
  tags,
  themes,
  featured_image_id,
  featured_image_url,
  syndication_destinations,
  import_metadata,
  source_url,
  meta_title,
  meta_description,
  author_name,
  author_storyteller_id,
  syndication_enabled,
  organization_id,
  author_id
)
SELECT
  a.title,
  a.slug,
  a.content AS story_copy,  -- Map content to story_copy
  a.content,                 -- Also keep as content for compatibility
  a.excerpt,
  CASE
    WHEN a.status = 'published' THEN 'published'
    WHEN a.status = 'draft' THEN 'draft'
    ELSE 'draft'
  END AS status,
  CASE
    WHEN a.visibility = 'public' THEN 'public'
    WHEN a.visibility = 'community' THEN 'community'
    WHEN a.visibility = 'private' THEN 'restricted'
    ELSE 'public'
  END AS cultural_permission_level,
  FALSE AS featured,  -- Default to not featured
  a.published_at,
  a.created_at,
  a.updated_at,
  a.article_type,
  a.primary_project,
  a.related_projects,
  a.tags,
  a.themes,
  a.featured_image_id,
  NULL AS featured_image_url,  -- Will be fetched from media_assets
  a.syndication_destinations,
  '{}'::jsonb AS import_metadata,  -- Default empty
  a.canonical_url AS source_url,
  a.meta_title,
  a.meta_description,
  a.author_name,
  a.author_storyteller_id,
  a.syndication_enabled,
  NULL AS organization_id,  -- Need to set based on author_storyteller_id
  NULL AS author_id  -- Need to map from author_storyteller_id
FROM public.articles a
WHERE NOT EXISTS (
  SELECT 1 FROM public.stories s
  WHERE s.slug = a.slug
)
ON CONFLICT (slug) DO NOTHING;

-- Update search_vector for newly inserted stories
UPDATE public.stories
SET search_vector =
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(story_copy, '')), 'C')
WHERE search_vector IS NULL AND article_type IS NOT NULL;

-- Now rename articles table
ALTER TABLE IF EXISTS public.articles RENAME TO articles_deprecated_20260110;

COMMENT ON TABLE public.articles_deprecated_20260110 IS
  'DEPRECATED: All content now lives in stories table.
   This table preserved for 30 days as backup before deletion.
   Migration: 20260110000100_merge_articles_into_stories.sql';

-- Create view for backward compatibility during transition
CREATE OR REPLACE VIEW public.articles AS
  SELECT
    id,
    title,
    slug,
    excerpt,
    content,  -- Now exists in stories
    story_copy AS summary,
    status,
    cultural_permission_level AS visibility,
    published_at,
    created_at,
    updated_at,
    article_type,
    primary_project,
    related_projects,
    tags,
    themes,
    featured_image_id,
    featured_image_url,
    syndication_destinations,
    import_metadata,
    source_url,
    meta_title,
    meta_description,
    author_name,
    author_storyteller_id,
    COALESCE((SELECT COUNT(*) FROM story_distributions WHERE story_id = stories.id), 0)::integer AS views_count,
    0 AS likes_count,
    0 AS shares_count,
    organization_id,
    author_id,
    syndication_enabled,
    FALSE AS requires_elder_review,
    NULL::uuid AS elder_reviewer_id,
    NULL::text AS elder_review_notes,
    NULL::timestamp with time zone AS scheduled_publish_at,
    NULL::text AS canonical_url,
    '{}'::uuid[] AS gallery_ids,
    'storyteller'::text AS author_type,
    NULL::text AS author_bio
  FROM public.stories
  WHERE article_type IS NOT NULL;  -- Only show article-type stories

COMMENT ON VIEW public.articles IS 'Compatibility view - queries stories table';
