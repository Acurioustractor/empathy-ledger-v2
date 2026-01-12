-- Migration: Phase 3 - Theme System Build-Out
-- Date: 2026-01-08
-- Purpose: Complete theme system with embeddings and analytics support
--
-- Current State (GOOD):
-- - narrative_themes: 393 themes across 7 categories
-- - story_themes: Junction table exists but not synced
-- - stories.cultural_themes: 23 stories with TEXT[] themes
--
-- This Migration:
-- 1. Sync story_themes junction with stories.cultural_themes
-- 2. Add embedding column to narrative_themes for vector search
-- 3. Create helper functions for theme analytics

BEGIN;

-- ============================================
-- STEP 1: Sync story_themes junction table
-- ============================================

DO $$
DECLARE
  sync_count INTEGER;
BEGIN
  RAISE NOTICE '=== Syncing story_themes Junction Table ===';

  -- Insert story-theme associations from cultural_themes arrays
  INSERT INTO story_themes (story_id, theme, ai_suggested)
  SELECT DISTINCT
    s.id as story_id,
    unnest(s.cultural_themes) as theme,
    true as ai_suggested  -- These came from AI analysis
  FROM stories s
  WHERE s.cultural_themes IS NOT NULL
    AND array_length(s.cultural_themes, 1) > 0
  ON CONFLICT (story_id, theme) DO NOTHING;

  GET DIAGNOSTICS sync_count = ROW_COUNT;

  RAISE NOTICE 'Synced % theme associations to story_themes junction', sync_count;
END $$;

-- Verify sync
DO $$
DECLARE
  stories_with_array INTEGER;
  stories_with_junction INTEGER;
BEGIN
  SELECT COUNT(*) INTO stories_with_array
  FROM stories
  WHERE cultural_themes IS NOT NULL
    AND array_length(cultural_themes, 1) > 0;

  SELECT COUNT(DISTINCT story_id) INTO stories_with_junction
  FROM story_themes;

  RAISE NOTICE '=== Sync Verification ===';
  RAISE NOTICE 'Stories with cultural_themes array: %', stories_with_array;
  RAISE NOTICE 'Stories with story_themes entries: %', stories_with_junction;

  IF stories_with_junction < stories_with_array THEN
    RAISE WARNING 'Sync incomplete: % stories missing junction entries',
      stories_with_array - stories_with_junction;
  ELSE
    RAISE NOTICE '✅ Sync complete: All stories with themes have junction entries';
  END IF;
END $$;

-- ============================================
-- STEP 2: Add embedding column for vector search
-- ============================================

-- Enable vector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column (1536 dimensions for OpenAI text-embedding-3-small)
ALTER TABLE narrative_themes
ADD COLUMN IF NOT EXISTS embedding vector(1536);

COMMENT ON COLUMN narrative_themes.embedding IS
  'Vector embedding for semantic theme search using OpenAI text-embedding-3-small (1536 dimensions)';

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_narrative_themes_embedding
ON narrative_themes
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

DO $$ BEGIN
  RAISE NOTICE '✅ Added embedding column and vector index to narrative_themes';
END $$;

-- ============================================
-- STEP 3: Create theme matching function
-- ============================================

CREATE OR REPLACE FUNCTION match_themes(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  theme_id uuid,
  theme_name varchar(100),
  theme_category varchar(50),
  usage_count int,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    nt.id as theme_id,
    nt.theme_name,
    nt.theme_category,
    nt.usage_count,
    1 - (nt.embedding <=> query_embedding) as similarity
  FROM narrative_themes nt
  WHERE nt.embedding IS NOT NULL
    AND 1 - (nt.embedding <=> query_embedding) > match_threshold
  ORDER BY nt.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION match_themes IS
  'Find themes similar to a query embedding using cosine similarity';

-- ============================================
-- STEP 4: Create theme analytics views
-- ============================================

-- Top themes by usage
CREATE OR REPLACE VIEW theme_analytics_top AS
SELECT
  nt.id,
  nt.theme_name,
  nt.theme_category,
  nt.usage_count,
  nt.storyteller_count,
  nt.ai_confidence_score,
  nt.sentiment_score,
  COUNT(DISTINCT st.story_id) as story_count
FROM narrative_themes nt
LEFT JOIN story_themes st ON st.theme = nt.theme_name
WHERE nt.usage_count > 0
GROUP BY nt.id, nt.theme_name, nt.theme_category, nt.usage_count,
         nt.storyteller_count, nt.ai_confidence_score, nt.sentiment_score
ORDER BY nt.usage_count DESC;

COMMENT ON VIEW theme_analytics_top IS
  'Top themes ranked by usage with story counts';

-- Themes by category
CREATE OR REPLACE VIEW theme_analytics_by_category AS
SELECT
  theme_category,
  COUNT(*) as theme_count,
  SUM(usage_count) as total_usage,
  AVG(ai_confidence_score) as avg_confidence,
  AVG(sentiment_score) as avg_sentiment,
  array_agg(theme_name ORDER BY usage_count DESC) FILTER (WHERE usage_count > 5) as top_themes
FROM narrative_themes
WHERE theme_category IS NOT NULL
GROUP BY theme_category
ORDER BY total_usage DESC;

COMMENT ON VIEW theme_analytics_by_category IS
  'Theme statistics grouped by category';

-- ============================================
-- STEP 5: Create function to update theme usage counts
-- ============================================

CREATE OR REPLACE FUNCTION update_theme_usage_counts()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update usage_count based on story_themes junction
  UPDATE narrative_themes nt
  SET
    usage_count = COALESCE(theme_counts.count, 0),
    storyteller_count = COALESCE(storyteller_counts.count, 0),
    updated_at = NOW()
  FROM (
    SELECT theme, COUNT(*) as count
    FROM story_themes
    GROUP BY theme
  ) as theme_counts
  LEFT JOIN (
    SELECT st.theme, COUNT(DISTINCT s.storyteller_id) as count
    FROM story_themes st
    JOIN stories s ON s.id = st.story_id
    WHERE s.storyteller_id IS NOT NULL
    GROUP BY st.theme
  ) as storyteller_counts ON storyteller_counts.theme = theme_counts.theme
  WHERE nt.theme_name = theme_counts.theme;

  RAISE NOTICE 'Updated usage counts for narrative_themes';
END;
$$;

COMMENT ON FUNCTION update_theme_usage_counts IS
  'Recalculate usage_count and storyteller_count from story_themes junction table';

-- Run initial count update
SELECT update_theme_usage_counts();

-- ============================================
-- STEP 6: Create trigger to keep junction synced
-- ============================================

CREATE OR REPLACE FUNCTION sync_story_themes_on_story_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- When cultural_themes array is updated, sync to story_themes junction
  IF NEW.cultural_themes IS DISTINCT FROM OLD.cultural_themes THEN
    -- Remove old themes that are no longer in the array
    DELETE FROM story_themes
    WHERE story_id = NEW.id
      AND ai_suggested = true
      AND theme NOT IN (SELECT unnest(NEW.cultural_themes));

    -- Add new themes from the array
    INSERT INTO story_themes (story_id, theme, ai_suggested)
    SELECT
      NEW.id,
      unnest(NEW.cultural_themes),
      true
    ON CONFLICT (story_id, theme) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_story_themes_trigger ON stories;
CREATE TRIGGER sync_story_themes_trigger
  AFTER UPDATE OF cultural_themes ON stories
  FOR EACH ROW
  WHEN (NEW.cultural_themes IS NOT NULL)
  EXECUTE FUNCTION sync_story_themes_on_story_update();

COMMENT ON FUNCTION sync_story_themes_on_story_update IS
  'Automatically sync story_themes junction when stories.cultural_themes is updated';

-- ============================================
-- STEP 7: Statistics and verification
-- ============================================

DO $$
DECLARE
  total_themes INTEGER;
  themes_with_embeddings INTEGER;
  total_associations INTEGER;
  stories_with_themes INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_themes FROM narrative_themes;
  SELECT COUNT(*) INTO themes_with_embeddings FROM narrative_themes WHERE embedding IS NOT NULL;
  SELECT COUNT(*) INTO total_associations FROM story_themes;
  SELECT COUNT(DISTINCT story_id) INTO stories_with_themes FROM story_themes;

  RAISE NOTICE '';
  RAISE NOTICE '=================================';
  RAISE NOTICE '✅ PHASE 3 MIGRATION COMPLETE';
  RAISE NOTICE '=================================';
  RAISE NOTICE 'Total themes in registry: %', total_themes;
  RAISE NOTICE 'Themes with embeddings: % (%.1f%%)',
    themes_with_embeddings,
    (themes_with_embeddings::float / NULLIF(total_themes, 0) * 100);
  RAISE NOTICE 'Total theme associations: %', total_associations;
  RAISE NOTICE 'Stories with themes: %', stories_with_themes;
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Generate embeddings for % themes', total_themes - themes_with_embeddings;
  RAISE NOTICE '2. Build theme analytics API';
  RAISE NOTICE '3. Test semantic theme search';
  RAISE NOTICE '';
END $$;

COMMIT;
