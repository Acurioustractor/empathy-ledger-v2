-- Unify content into stories table (articles -> stories)

-- 1) Add needed columns to stories
ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS excerpt TEXT,
  ADD COLUMN IF NOT EXISTS article_type TEXT DEFAULT 'story_feature'
    CHECK (article_type IN (
      'story_feature',
      'program_spotlight',
      'research_summary',
      'community_news',
      'editorial',
      'impact_report',
      'project_update',
      'tutorial'
    )),
  ADD COLUMN IF NOT EXISTS primary_project TEXT,
  ADD COLUMN IF NOT EXISTS related_projects TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS themes TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS featured_image_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS featured_image_url TEXT,
  ADD COLUMN IF NOT EXISTS syndication_destinations TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS import_metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS author_name TEXT,
  ADD COLUMN IF NOT EXISTS author_storyteller_id UUID REFERENCES public.storytellers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2) Backfill slug for existing stories (if null)
UPDATE public.stories
SET slug = COALESCE(
  slug,
  regexp_replace(lower(coalesce(title, 'story')), '[^a-z0-9\\s-]', '', 'g')
    |> replace(' ', '-')
    || '-' || substr(id::text, 1, 8)
)
WHERE slug IS NULL;

-- 3) Populate search_vector
UPDATE public.stories
SET search_vector =
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(content, '')), 'C');

-- 4) Enforce slug uniqueness / not null and add helpful indexes
ALTER TABLE public.stories
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_stories_slug_unique ON public.stories(slug);
CREATE INDEX IF NOT EXISTS idx_stories_primary_project ON public.stories(primary_project);
CREATE INDEX IF NOT EXISTS idx_stories_tags ON public.stories USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_stories_themes ON public.stories USING gin(themes);
CREATE INDEX IF NOT EXISTS idx_stories_syndication ON public.stories USING gin(syndication_destinations);
CREATE INDEX IF NOT EXISTS idx_stories_search ON public.stories USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_stories_article_type ON public.stories(article_type);

-- 5) Copy articles into stories (skip if slug already exists)
INSERT INTO public.stories (
  title,
  slug,
  content,
  excerpt,
  summary,
  status,
  visibility,
  published_at,
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
  created_at,
  updated_at,
  search_vector,
  article_type,
  view_count
)
SELECT
  a.title,
  a.slug,
  a.content,
  a.excerpt,
  a.excerpt,
  CASE WHEN a.status = 'published' THEN 'published' ELSE 'draft' END AS status,
  a.visibility,
  a.published_at,
  a.primary_project,
  a.related_projects,
  a.tags,
  a.themes,
  a.featured_image_id,
  COALESCE(m.url, a.import_metadata->>'featuredImageUrl') AS featured_image_url,
  a.syndication_destinations,
  a.import_metadata,
  a.source_url,
  a.meta_title,
  a.meta_description,
  COALESCE(a.author_name, a.import_metadata->>'original_author'),
  a.author_storyteller_id,
  COALESCE(a.created_at, NOW()),
  COALESCE(a.updated_at, NOW()),
  setweight(to_tsvector('english', coalesce(a.title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(a.excerpt, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(a.content, '')), 'C'),
  a.article_type,
  a.views_count
FROM public.articles a
LEFT JOIN public.media_assets m ON m.id = a.featured_image_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.stories s WHERE s.slug = a.slug
);

-- 6) Refresh search_vector for any new rows
UPDATE public.stories
SET search_vector =
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(content, '')), 'C')
WHERE updated_at > NOW() - INTERVAL '1 hour';
