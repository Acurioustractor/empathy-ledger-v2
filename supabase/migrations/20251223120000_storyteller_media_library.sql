-- Storyteller Media Library System
-- Enables storytellers to build personal collections of photos, videos, transcripts
-- and drafts for crafting rich multimedia stories

-- ============================================================================
-- 1. STORYTELLER MEDIA LIBRARY
-- ============================================================================

CREATE TABLE IF NOT EXISTS storyteller_media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,

  -- Media Details
  media_type TEXT NOT NULL CHECK (media_type IN (
    'photo',
    'video',
    'audio',
    'document',
    'transcript'
  )),
  file_url TEXT NOT NULL,           -- Supabase storage URL
  thumbnail_url TEXT,                -- Thumbnail for preview

  -- Metadata
  title TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  alt_text TEXT,                     -- Accessibility

  -- Original Context
  captured_date DATE,
  location TEXT,
  people TEXT[] DEFAULT '{}',        -- Who's in it?
  cultural_context TEXT,             -- Cultural significance

  -- Technical
  file_size BIGINT,                  -- Bytes
  mime_type TEXT,
  duration_seconds INTEGER,          -- For video/audio
  width INTEGER,                     -- For images/video
  height INTEGER,

  -- Organization
  folder TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,

  -- Usage tracking
  used_in_stories UUID[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_media_per_storyteller UNIQUE(storyteller_id, file_url)
);

COMMENT ON TABLE storyteller_media_library IS 'Personal media library for each storyteller';
COMMENT ON COLUMN storyteller_media_library.used_in_stories IS 'Array of story IDs where this media is used';
COMMENT ON COLUMN storyteller_media_library.cultural_context IS 'Cultural significance or protocols for this media';

CREATE INDEX idx_media_library_storyteller ON storyteller_media_library(storyteller_id);
CREATE INDEX idx_media_library_type ON storyteller_media_library(media_type);
CREATE INDEX idx_media_library_tags ON storyteller_media_library USING gin(tags);
CREATE INDEX idx_media_library_featured ON storyteller_media_library(is_featured) WHERE is_featured = true;
CREATE INDEX idx_media_library_folder ON storyteller_media_library(folder) WHERE folder IS NOT NULL;

-- ============================================================================
-- 2. STORYTELLER TRANSCRIPTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS storyteller_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,

  -- Content
  title TEXT NOT NULL,
  raw_transcript TEXT,               -- Original with timecodes
  cleaned_transcript TEXT,           -- AI-cleaned version
  summary TEXT,                      -- AI-generated summary

  -- Source
  source_type TEXT CHECK (source_type IN ('audio', 'video', 'written', 'interview')),
  source_media_id UUID REFERENCES storyteller_media_library(id),
  interviewer TEXT,
  interview_date DATE,

  -- Extracted Data (AI-powered)
  themes TEXT[] DEFAULT '{}',
  key_quotes TEXT[] DEFAULT '{}',
  people_mentioned TEXT[] DEFAULT '{}',
  places_mentioned TEXT[] DEFAULT '{}',

  -- Processing
  is_processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  word_count INTEGER,

  -- Usage
  used_in_stories UUID[] DEFAULT '{}',
  story_ideas TEXT[] DEFAULT '{}',   -- Potential story angles

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE storyteller_transcripts IS 'Interview transcripts with AI-powered extraction';
COMMENT ON COLUMN storyteller_transcripts.cleaned_transcript IS 'Transcript with timecodes and speaker labels removed';
COMMENT ON COLUMN storyteller_transcripts.themes IS 'AI-extracted themes from transcript';

CREATE INDEX idx_transcripts_storyteller ON storyteller_transcripts(storyteller_id);
CREATE INDEX idx_transcripts_themes ON storyteller_transcripts USING gin(themes);
CREATE INDEX idx_transcripts_processed ON storyteller_transcripts(is_processed);
CREATE INDEX idx_transcripts_source_media ON storyteller_transcripts(source_media_id);

-- ============================================================================
-- 3. STORY DRAFTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS story_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,

  -- Content
  title TEXT,
  content TEXT,
  excerpt TEXT,

  -- Organization
  status TEXT CHECK (status IN ('idea', 'outline', 'draft', 'review', 'ready')) DEFAULT 'idea',
  folder TEXT,

  -- Source Material
  based_on_transcript_id UUID REFERENCES storyteller_transcripts(id),
  linked_media_ids UUID[] DEFAULT '{}',

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  themes TEXT[] DEFAULT '{}',
  notes TEXT,                        -- Internal notes

  -- Publishing
  target_publish_date DATE,
  published_story_id UUID REFERENCES stories(id),

  -- Versioning
  version INTEGER DEFAULT 1,
  last_edited_at TIMESTAMPTZ DEFAULT now(),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE story_drafts IS 'Work-in-progress stories and ideas';
COMMENT ON COLUMN story_drafts.status IS 'Workflow status: idea → outline → draft → review → ready';

CREATE INDEX idx_drafts_storyteller ON story_drafts(storyteller_id);
CREATE INDEX idx_drafts_status ON story_drafts(status);
CREATE INDEX idx_drafts_transcript ON story_drafts(based_on_transcript_id);
CREATE INDEX idx_drafts_published ON story_drafts(published_story_id);

-- ============================================================================
-- 4. STORY MEDIA LINKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS story_media_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES storyteller_media_library(id) ON DELETE CASCADE,

  -- Display
  display_order INTEGER DEFAULT 0,
  caption TEXT,
  display_type TEXT CHECK (display_type IN (
    'inline',                        -- Embedded in content
    'gallery',                       -- Part of gallery
    'header',                        -- Header image
    'featured',                      -- Featured/hero image
    'embed'                          -- Video/audio embed
  )) DEFAULT 'inline',

  -- Layout
  position_in_content INTEGER,       -- Paragraph/section number
  width_percent INTEGER DEFAULT 100, -- Display width
  alignment TEXT CHECK (alignment IN ('left', 'center', 'right', 'full')) DEFAULT 'center',

  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(story_id, media_id, display_order)
);

COMMENT ON TABLE story_media_links IS 'Links stories to media library items with display options';

CREATE INDEX idx_story_media_story ON story_media_links(story_id);
CREATE INDEX idx_story_media_media ON story_media_links(media_id);
CREATE INDEX idx_story_media_type ON story_media_links(display_type);

-- ============================================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE storyteller_media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyteller_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_media_links ENABLE ROW LEVEL SECURITY;

-- Media Library: Storytellers manage their own media
DROP POLICY IF EXISTS "Storytellers can view their media" ON storyteller_media_library;
CREATE POLICY "Storytellers can view their media"
  ON storyteller_media_library
  FOR SELECT
  TO authenticated
  USING (storyteller_id = auth.uid() OR tenant_id IN (
    SELECT tenant_id FROM user_tenant_roles WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Storytellers can insert their media" ON storyteller_media_library;
CREATE POLICY "Storytellers can insert their media"
  ON storyteller_media_library
  FOR INSERT
  TO authenticated
  WITH CHECK (storyteller_id = auth.uid());

DROP POLICY IF EXISTS "Storytellers can update their media" ON storyteller_media_library;
CREATE POLICY "Storytellers can update their media"
  ON storyteller_media_library
  FOR UPDATE
  TO authenticated
  USING (storyteller_id = auth.uid())
  WITH CHECK (storyteller_id = auth.uid());

DROP POLICY IF EXISTS "Storytellers can delete their media" ON storyteller_media_library;
CREATE POLICY "Storytellers can delete their media"
  ON storyteller_media_library
  FOR DELETE
  TO authenticated
  USING (storyteller_id = auth.uid());

-- Service role full access
DROP POLICY IF EXISTS "Service role full access to media" ON storyteller_media_library;
CREATE POLICY "Service role full access to media"
  ON storyteller_media_library
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Transcripts: Similar policies
DROP POLICY IF EXISTS "Storytellers can manage transcripts" ON storyteller_transcripts;
CREATE POLICY "Storytellers can manage transcripts"
  ON storyteller_transcripts
  FOR ALL
  TO authenticated
  USING (storyteller_id = auth.uid())
  WITH CHECK (storyteller_id = auth.uid());

DROP POLICY IF EXISTS "Service role full access to transcripts" ON storyteller_transcripts;
CREATE POLICY "Service role full access to transcripts"
  ON storyteller_transcripts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Drafts: Similar policies
DROP POLICY IF EXISTS "Storytellers can manage drafts" ON story_drafts;
CREATE POLICY "Storytellers can manage drafts"
  ON story_drafts
  FOR ALL
  TO authenticated
  USING (storyteller_id = auth.uid())
  WITH CHECK (storyteller_id = auth.uid());

DROP POLICY IF EXISTS "Service role full access to drafts" ON story_drafts;
CREATE POLICY "Service role full access to drafts"
  ON story_drafts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Media Links: Anyone can view, authors can manage
DROP POLICY IF EXISTS "Anyone can view story media" ON story_media_links;
CREATE POLICY "Anyone can view story media"
  ON story_media_links
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Story authors can manage media links" ON story_media_links;
CREATE POLICY "Story authors can manage media links"
  ON story_media_links
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_id
      AND stories.storyteller_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_id
      AND stories.storyteller_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role full access to media links" ON story_media_links;
CREATE POLICY "Service role full access to media links"
  ON story_media_links
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Function to get storyteller's media statistics
CREATE OR REPLACE FUNCTION get_storyteller_media_stats(p_storyteller_id UUID)
RETURNS TABLE (
  total_media BIGINT,
  photos BIGINT,
  videos BIGINT,
  transcripts BIGINT,
  total_storage_mb NUMERIC,
  used_in_stories BIGINT,
  unused_media BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_media,
    COUNT(*) FILTER (WHERE media_type = 'photo')::BIGINT AS photos,
    COUNT(*) FILTER (WHERE media_type = 'video')::BIGINT AS videos,
    COUNT(*) FILTER (WHERE media_type = 'transcript')::BIGINT AS transcripts,
    ROUND(SUM(COALESCE(file_size, 0))::NUMERIC / 1024 / 1024, 2) AS total_storage_mb,
    COUNT(*) FILTER (WHERE array_length(used_in_stories, 1) > 0)::BIGINT AS used_in_stories,
    COUNT(*) FILTER (WHERE array_length(used_in_stories, 1) IS NULL OR array_length(used_in_stories, 1) = 0)::BIGINT AS unused_media
  FROM storyteller_media_library
  WHERE storyteller_id = p_storyteller_id
    AND is_archived = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to link media to story
CREATE OR REPLACE FUNCTION link_media_to_story(
  p_story_id UUID,
  p_media_id UUID,
  p_display_type TEXT DEFAULT 'inline',
  p_caption TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_link_id UUID;
  v_max_order INTEGER;
BEGIN
  -- Get max display order for this story
  SELECT COALESCE(MAX(display_order), 0) INTO v_max_order
  FROM story_media_links
  WHERE story_id = p_story_id;

  -- Create link
  INSERT INTO story_media_links (
    story_id,
    media_id,
    display_type,
    caption,
    display_order
  ) VALUES (
    p_story_id,
    p_media_id,
    p_display_type,
    p_caption,
    v_max_order + 1
  )
  RETURNING id INTO v_link_id;

  -- Update media usage
  UPDATE storyteller_media_library
  SET used_in_stories = array_append(used_in_stories, p_story_id)
  WHERE id = p_media_id
    AND NOT (p_story_id = ANY(used_in_stories));

  RETURN v_link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. TRIGGERS
-- ============================================================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_media_library_updated_at ON storyteller_media_library;
CREATE TRIGGER update_media_library_updated_at
  BEFORE UPDATE ON storyteller_media_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transcripts_updated_at ON storyteller_transcripts;
CREATE TRIGGER update_transcripts_updated_at
  BEFORE UPDATE ON storyteller_transcripts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_drafts_updated_at ON story_drafts;
CREATE TRIGGER update_drafts_updated_at
  BEFORE UPDATE ON story_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update draft last_edited_at
CREATE OR REPLACE FUNCTION update_draft_last_edited()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_edited_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_draft_last_edited_trigger ON story_drafts;
CREATE TRIGGER update_draft_last_edited_trigger
  BEFORE UPDATE ON story_drafts
  FOR EACH ROW
  WHEN (OLD.content IS DISTINCT FROM NEW.content OR OLD.title IS DISTINCT FROM NEW.title)
  EXECUTE FUNCTION update_draft_last_edited();
