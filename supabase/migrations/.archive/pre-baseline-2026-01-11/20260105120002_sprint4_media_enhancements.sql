-- Sprint 4: Media Assets Enhancements
-- Add fields for upload tracking and usage management

-- Add new columns if they don't exist
DO $$ 
BEGIN
  -- Uploader tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'media_assets' AND column_name = 'uploader_id') THEN
    ALTER TABLE media_assets ADD COLUMN uploader_id UUID REFERENCES storytellers(id);
  END IF;

  -- Upload status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'media_assets' AND column_name = 'upload_status') THEN
    ALTER TABLE media_assets ADD COLUMN upload_status TEXT DEFAULT 'ready' 
      CHECK (upload_status IN ('uploading', 'processing', 'ready', 'failed'));
  END IF;

  -- File metadata
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'media_assets' AND column_name = 'file_size') THEN
    ALTER TABLE media_assets ADD COLUMN file_size BIGINT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'media_assets' AND column_name = 'mime_type') THEN
    ALTER TABLE media_assets ADD COLUMN mime_type TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'media_assets' AND column_name = 'duration') THEN
    ALTER TABLE media_assets ADD COLUMN duration INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'media_assets' AND column_name = 'width') THEN
    ALTER TABLE media_assets ADD COLUMN width INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'media_assets' AND column_name = 'height') THEN
    ALTER TABLE media_assets ADD COLUMN height INTEGER;
  END IF;

  -- Cultural metadata
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'media_assets' AND column_name = 'cultural_sensitivity') THEN
    ALTER TABLE media_assets ADD COLUMN cultural_sensitivity TEXT DEFAULT 'public'
      CHECK (cultural_sensitivity IN ('public', 'sensitive', 'sacred'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'media_assets' AND column_name = 'cultural_tags') THEN
    ALTER TABLE media_assets ADD COLUMN cultural_tags TEXT[];
  END IF;

  -- Usage tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'media_assets' AND column_name = 'usage_count') THEN
    ALTER TABLE media_assets ADD COLUMN usage_count INTEGER DEFAULT 0;
  END IF;

  -- Storage path
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'media_assets' AND column_name = 'storage_path') THEN
    ALTER TABLE media_assets ADD COLUMN storage_path TEXT;
  END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_media_assets_uploader_id ON media_assets(uploader_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_upload_status ON media_assets(upload_status);
CREATE INDEX IF NOT EXISTS idx_media_assets_cultural_sensitivity ON media_assets(cultural_sensitivity);

-- Function to update usage count
CREATE OR REPLACE FUNCTION update_media_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE media_assets 
    SET usage_count = usage_count + 1 
    WHERE id = NEW.media_asset_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE media_assets 
    SET usage_count = GREATEST(0, usage_count - 1) 
    WHERE id = OLD.media_asset_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update usage count when media is linked/unlinked from stories
DROP TRIGGER IF EXISTS media_usage_count_trigger ON story_media;
CREATE TRIGGER media_usage_count_trigger
  AFTER INSERT OR DELETE ON story_media
  FOR EACH ROW
  EXECUTE FUNCTION update_media_usage_count();

-- Update RLS policies for media_assets if needed
DROP POLICY IF EXISTS "Users can view their own media" ON media_assets;
CREATE POLICY "Users can view their own media"
  ON media_assets FOR SELECT
  USING (
    uploader_id IN (SELECT id FROM storytellers WHERE user_id = auth.uid())
    OR tenant_id IN (SELECT tenant_id FROM storytellers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can upload media" ON media_assets;
CREATE POLICY "Users can upload media"
  ON media_assets FOR INSERT
  WITH CHECK (
    uploader_id IN (SELECT id FROM storytellers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update their own media" ON media_assets;
CREATE POLICY "Users can update their own media"
  ON media_assets FOR UPDATE
  USING (
    uploader_id IN (SELECT id FROM storytellers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete their own media" ON media_assets;
CREATE POLICY "Users can delete their own media"
  ON media_assets FOR DELETE
  USING (
    uploader_id IN (SELECT id FROM storytellers WHERE user_id = auth.uid())
  );

-- Comments
COMMENT ON COLUMN media_assets.uploader_id IS 'Storyteller who uploaded this media';
COMMENT ON COLUMN media_assets.upload_status IS 'Current upload/processing status';
COMMENT ON COLUMN media_assets.file_size IS 'File size in bytes';
COMMENT ON COLUMN media_assets.duration IS 'Duration in seconds for audio/video';
COMMENT ON COLUMN media_assets.cultural_sensitivity IS 'Cultural sensitivity level: public, sensitive, or sacred';
COMMENT ON COLUMN media_assets.cultural_tags IS 'Array of cultural theme tags';
COMMENT ON COLUMN media_assets.usage_count IS 'Number of stories using this media';
COMMENT ON COLUMN media_assets.storage_path IS 'Path in Supabase Storage';
