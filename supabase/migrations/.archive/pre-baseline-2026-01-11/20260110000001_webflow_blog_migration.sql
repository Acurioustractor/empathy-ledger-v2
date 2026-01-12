-- Webflow Blog Migration Schema
-- Extends articles table to support importing content from external platforms (Webflow, WordPress, Medium, etc.)
-- This allows tracking provenance and preventing duplicate imports

-- Add source tracking columns to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS source_platform TEXT DEFAULT 'empathy_ledger'
  CHECK (source_platform IN ('empathy_ledger', 'webflow', 'wordpress', 'medium', 'ghost', 'substack'));

ALTER TABLE articles ADD COLUMN IF NOT EXISTS source_id TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS imported_at TIMESTAMPTZ;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS import_metadata JSONB DEFAULT '{}'::jsonb;

-- Prevent duplicate imports from same source
-- Only applies when source_id is not null (i.e., imported content)
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_source_unique
  ON articles(source_platform, source_id)
  WHERE source_id IS NOT NULL;

-- Indexes for querying imported content
CREATE INDEX IF NOT EXISTS idx_articles_source_platform ON articles(source_platform);
CREATE INDEX IF NOT EXISTS idx_articles_imported_at ON articles(imported_at) WHERE imported_at IS NOT NULL;

-- Add helpful comments for documentation
COMMENT ON COLUMN articles.source_platform IS 'Platform where content originated (empathy_ledger for native content, webflow/wordpress/medium for imports)';
COMMENT ON COLUMN articles.source_id IS 'Original ID in source platform - prevents re-importing duplicates';
COMMENT ON COLUMN articles.source_url IS 'Original URL where content lived before import';
COMMENT ON COLUMN articles.imported_at IS 'Timestamp when content was imported into Empathy Ledger';
COMMENT ON COLUMN articles.import_metadata IS 'Additional import data: original_author, original_publish_date, original_tags, conversion_notes, etc.';

-- Example import_metadata structure:
-- {
--   "original_author": "John Doe",
--   "original_publish_date": "2024-01-15T10:30:00Z",
--   "original_tags": ["technology", "storytelling"],
--   "original_slug": "my-blog-post",
--   "webflow_collection_id": "abc123",
--   "conversion_notes": "Images uploaded to media_assets, HTML converted to markdown",
--   "import_batch_id": "uuid"
-- }
