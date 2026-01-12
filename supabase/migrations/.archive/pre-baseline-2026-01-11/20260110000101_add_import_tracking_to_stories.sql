-- Add import tracking columns to stories (not articles!)
ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS source_platform TEXT DEFAULT 'empathy_ledger'
    CHECK (source_platform IN ('empathy_ledger', 'webflow', 'wordpress', 'medium')),
  ADD COLUMN IF NOT EXISTS source_id TEXT,
  ADD COLUMN IF NOT EXISTS imported_at TIMESTAMPTZ;

-- Note: source_url, import_metadata already added in merge migration

-- Prevent duplicate imports
CREATE UNIQUE INDEX IF NOT EXISTS idx_stories_source_unique
  ON public.stories(source_platform, source_id)
  WHERE source_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_stories_source_platform ON public.stories(source_platform);
CREATE INDEX IF NOT EXISTS idx_stories_imported_at ON public.stories(imported_at) WHERE imported_at IS NOT NULL;

COMMENT ON COLUMN stories.source_platform IS 'Platform where content originated';
COMMENT ON COLUMN stories.source_id IS 'Original ID in source platform (prevents duplicates)';
