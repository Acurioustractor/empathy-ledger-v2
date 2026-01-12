-- Add boolean columns to storytellers table for featured/elder/justicehub status
-- These columns allow direct status management without joining to profiles table

-- Add is_featured column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'storytellers' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE storytellers ADD COLUMN is_featured boolean DEFAULT false;
  END IF;
END $$;

-- Add is_elder column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'storytellers' AND column_name = 'is_elder'
  ) THEN
    ALTER TABLE storytellers ADD COLUMN is_elder boolean DEFAULT false;
  END IF;
END $$;

-- Add is_justicehub_featured column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'storytellers' AND column_name = 'is_justicehub_featured'
  ) THEN
    ALTER TABLE storytellers ADD COLUMN is_justicehub_featured boolean DEFAULT false;
  END IF;
END $$;

-- Add email column if it doesn't exist (for direct storyteller records)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'storytellers' AND column_name = 'email'
  ) THEN
    ALTER TABLE storytellers ADD COLUMN email text;
  END IF;
END $$;

-- Add location column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'storytellers' AND column_name = 'location'
  ) THEN
    ALTER TABLE storytellers ADD COLUMN location text;
  END IF;
END $$;

-- Add avatar_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'storytellers' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE storytellers ADD COLUMN avatar_url text;
  END IF;
END $$;

-- Create indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS idx_storytellers_is_featured ON storytellers(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_storytellers_is_elder ON storytellers(is_elder) WHERE is_elder = true;
CREATE INDEX IF NOT EXISTS idx_storytellers_is_justicehub_featured ON storytellers(is_justicehub_featured) WHERE is_justicehub_featured = true;

-- Sync featured/elder status from profiles table to storytellers for existing records
UPDATE storytellers s
SET
  is_featured = COALESCE(p.is_featured, false),
  is_elder = COALESCE(p.is_elder, false)
FROM profiles p
WHERE s.profile_id = p.id
AND s.profile_id IS NOT NULL
AND (s.is_featured IS NULL OR s.is_elder IS NULL);

-- Add comments for documentation
COMMENT ON COLUMN storytellers.is_featured IS 'Whether storyteller is featured on the platform homepage';
COMMENT ON COLUMN storytellers.is_elder IS 'Whether storyteller has Elder status (cultural wisdom keeper)';
COMMENT ON COLUMN storytellers.is_justicehub_featured IS 'Whether storyteller is featured on JusticeHub integration';
