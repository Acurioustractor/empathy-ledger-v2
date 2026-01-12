-- Migration: Add justicehub_featured field to stories table
-- Purpose: Enable curated story featuring on JusticeHub homepage
-- Date: 2026-01-06

-- Add column
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS justicehub_featured boolean DEFAULT false;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_stories_justicehub_featured
ON stories(justicehub_featured)
WHERE justicehub_featured = true AND status = 'published';

-- Add documentation
COMMENT ON COLUMN stories.justicehub_featured IS
  'Story is featured on JusticeHub homepage. Requires syndication consent, cultural safety approval, and quality standards.';

-- Create validation function
CREATE OR REPLACE FUNCTION validate_justicehub_featured()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.justicehub_featured = true THEN
    -- Check all requirements
    IF NEW.status != 'published' THEN
      RAISE EXCEPTION 'Story must be published to be featured on JusticeHub';
    END IF;

    IF NEW.is_public != true THEN
      RAISE EXCEPTION 'Story must be public to be featured on JusticeHub';
    END IF;

    IF NEW.syndication_enabled != true THEN
      RAISE EXCEPTION 'Story must have syndication enabled for JusticeHub';
    END IF;

    IF NEW.has_explicit_consent != true THEN
      RAISE EXCEPTION 'Story must have explicit consent for JusticeHub featuring';
    END IF;

    IF NEW.requires_elder_review = true AND (NEW.elder_reviewed IS NULL OR NEW.elder_reviewed != true) THEN
      RAISE EXCEPTION 'Story requires elder review before JusticeHub featuring';
    END IF;

    IF NEW.title IS NULL OR NEW.title = '' THEN
      RAISE EXCEPTION 'Featured stories must have a title';
    END IF;

    IF NEW.excerpt IS NULL OR NEW.excerpt = '' THEN
      RAISE EXCEPTION 'Featured stories must have an excerpt';
    END IF;

    IF NEW.storyteller_id IS NULL THEN
      RAISE EXCEPTION 'Featured stories must have a storyteller';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
DROP TRIGGER IF EXISTS check_justicehub_featured ON stories;
CREATE TRIGGER check_justicehub_featured
  BEFORE INSERT OR UPDATE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION validate_justicehub_featured();

-- Verify installation
SELECT
  'Migration Complete' as status,
  EXISTS(
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'stories'
      AND column_name = 'justicehub_featured'
  ) as column_exists,
  EXISTS(
    SELECT 1
    FROM pg_indexes
    WHERE indexname = 'idx_stories_justicehub_featured'
  ) as index_exists,
  EXISTS(
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'check_justicehub_featured'
  ) as trigger_exists;
