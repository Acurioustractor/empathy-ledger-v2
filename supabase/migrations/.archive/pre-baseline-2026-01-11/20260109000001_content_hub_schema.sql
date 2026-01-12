-- Migration: Content Hub Schema
-- Date: 2026-01-09
-- Purpose: Enable Empathy Ledger as the central content hub for ACT ecosystem
--
-- New Tables:
-- 1. media_ai_analysis - Smart photo/video tagging with AI (consent-gated)
-- 2. media_person_recognition - Face recognition with two-party consent
-- 3. media_narrative_themes - Link media to themes and stories
-- 4. articles - Blog/article content for ecosystem syndication
-- 5. content_syndication - Track content distribution across platforms
--
-- Philosophy: Storyteller ownership, community control, consent-first

BEGIN;

-- ============================================
-- ENABLE REQUIRED EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- TABLE 1: Media AI Analysis
-- Smart photo/video tagging with consent gates
-- ============================================

CREATE TABLE IF NOT EXISTS public.media_ai_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Relationships
  media_asset_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
  storyteller_id UUID REFERENCES public.storytellers(id) ON DELETE SET NULL,
  
  -- Consent (REQUIRED before any AI processing)
  ai_consent_granted BOOLEAN NOT NULL DEFAULT FALSE,
  consent_granted_at TIMESTAMPTZ,
  consent_granted_by UUID REFERENCES public.storytellers(id),
  
  -- AI Detection Results (only populated if consent granted)
  detected_objects JSONB DEFAULT '[]',        -- [{label, confidence, bounding_box}]
  scene_classification TEXT,                   -- e.g., "outdoor landscape", "ceremony", "portrait"
  scene_confidence DECIMAL(3,2),               -- 0.00-1.00
  auto_tags TEXT[] DEFAULT '{}',               -- AI-suggested tags
  verified_tags TEXT[] DEFAULT '{}',           -- Human-verified tags
  
  -- Embedding for semantic search
  content_embedding vector(1536),              -- For finding similar media
  
  -- Cultural Protocol Flags
  cultural_review_required BOOLEAN DEFAULT FALSE,
  cultural_review_status TEXT DEFAULT 'not_required'
    CHECK (cultural_review_status IN ('not_required', 'pending', 'approved', 'restricted', 'sacred')),
  cultural_reviewer_id UUID REFERENCES public.storytellers(id),
  cultural_review_notes TEXT,
  
  -- Processing Status
  processing_status TEXT DEFAULT 'pending'
    CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed', 'blocked_no_consent')),
  processed_at TIMESTAMPTZ,
  processing_error TEXT,
  
  -- Model versioning
  ai_model_version TEXT,
  
  CONSTRAINT unique_media_analysis UNIQUE (media_asset_id)
);

-- Indexes for media_ai_analysis
CREATE INDEX IF NOT EXISTS idx_media_ai_analysis_media_id 
  ON media_ai_analysis(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_media_ai_analysis_storyteller 
  ON media_ai_analysis(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_media_ai_analysis_auto_tags 
  ON media_ai_analysis USING gin(auto_tags);
CREATE INDEX IF NOT EXISTS idx_media_ai_analysis_verified_tags 
  ON media_ai_analysis USING gin(verified_tags);
CREATE INDEX IF NOT EXISTS idx_media_ai_analysis_consent 
  ON media_ai_analysis(ai_consent_granted) WHERE ai_consent_granted = true;
CREATE INDEX IF NOT EXISTS idx_media_ai_analysis_cultural_review 
  ON media_ai_analysis(cultural_review_status) WHERE cultural_review_required = true;

-- Vector index for semantic search
CREATE INDEX IF NOT EXISTS idx_media_ai_analysis_embedding 
  ON media_ai_analysis USING ivfflat (content_embedding vector_cosine_ops) WITH (lists = 100);

COMMENT ON TABLE media_ai_analysis IS 
  'AI analysis results for media assets. All analysis requires explicit consent.';
COMMENT ON COLUMN media_ai_analysis.ai_consent_granted IS 
  'REQUIRED: Must be TRUE before any AI processing occurs. Consent can be revoked.';
COMMENT ON COLUMN media_ai_analysis.detected_objects IS 
  'Array of objects detected in the image/video with confidence scores and bounding boxes';
COMMENT ON COLUMN media_ai_analysis.cultural_review_required IS 
  'Set TRUE if AI detects potentially sensitive cultural content requiring elder review';

-- ============================================
-- TABLE 2: Media Person Recognition
-- Face recognition with two-party consent
-- ============================================

CREATE TABLE IF NOT EXISTS public.media_person_recognition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Relationships
  media_asset_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
  
  -- Face location in image
  face_location JSONB NOT NULL,               -- {x, y, width, height, confidence}
  face_encoding vector(512),                   -- Face embedding for recognition
  
  -- Linked person (only set if both consents granted)
  linked_storyteller_id UUID REFERENCES public.storytellers(id) ON DELETE SET NULL,
  
  -- TWO-PARTY CONSENT SYSTEM
  -- Party 1: Media uploader/owner
  uploader_consent_granted BOOLEAN NOT NULL DEFAULT FALSE,
  uploader_consent_at TIMESTAMPTZ,
  uploader_consent_by UUID REFERENCES public.storytellers(id),
  
  -- Party 2: Person in photo (required to link identity)
  person_consent_granted BOOLEAN NOT NULL DEFAULT FALSE,
  person_consent_at TIMESTAMPTZ,
  person_consent_by UUID REFERENCES public.storytellers(id),
  
  -- Combined consent status (computed)
  recognition_consent_granted BOOLEAN GENERATED ALWAYS AS (
    uploader_consent_granted AND person_consent_granted
  ) STORED,
  
  -- Visibility Controls
  can_be_public BOOLEAN DEFAULT FALSE,         -- Can this recognition be shown publicly?
  blur_requested BOOLEAN DEFAULT FALSE,        -- Person requested their face be blurred
  
  -- Verification
  manually_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES public.storytellers(id),
  verified_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'detected'
    CHECK (status IN ('detected', 'pending_consent', 'linked', 'rejected', 'blurred'))
);

-- Indexes for media_person_recognition
CREATE INDEX IF NOT EXISTS idx_media_person_recognition_media 
  ON media_person_recognition(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_media_person_recognition_storyteller 
  ON media_person_recognition(linked_storyteller_id);
CREATE INDEX IF NOT EXISTS idx_media_person_recognition_consent 
  ON media_person_recognition(recognition_consent_granted) WHERE recognition_consent_granted = true;
CREATE INDEX IF NOT EXISTS idx_media_person_recognition_encoding 
  ON media_person_recognition USING ivfflat (face_encoding vector_cosine_ops) WITH (lists = 100);

COMMENT ON TABLE media_person_recognition IS 
  'Face detection and recognition. Requires TWO-PARTY consent: uploader AND person in photo.';
COMMENT ON COLUMN media_person_recognition.face_encoding IS 
  'Face embedding vector for matching. Only stored if uploader consent granted.';
COMMENT ON COLUMN media_person_recognition.recognition_consent_granted IS 
  'Computed: TRUE only when BOTH uploader AND person have consented.';

-- ============================================
-- TABLE 3: Media Narrative Themes
-- Connect media to stories and themes
-- ============================================

CREATE TABLE IF NOT EXISTS public.media_narrative_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Relationships
  media_asset_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
  
  -- Theme classification
  primary_theme TEXT,                          -- Main narrative theme
  secondary_themes TEXT[] DEFAULT '{}',        -- Additional themes
  theme_confidence DECIMAL(3,2),               -- AI confidence in theme assignment
  
  -- Story connections
  related_story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
  story_relevance_score DECIMAL(3,2),          -- How relevant media is to story
  
  -- ALMA integration (for intervention tracking)
  alma_intervention_id UUID,                   -- Link to ALMA intervention
  alma_evidence_type TEXT,                     -- Type of evidence this provides
  
  -- Emotional/narrative analysis
  emotional_tone TEXT,                         -- e.g., "hopeful", "reflective", "celebratory"
  narrative_role TEXT,                         -- e.g., "establishing", "climax", "resolution"
  
  -- Keywords for search
  keywords TEXT[] DEFAULT '{}',
  
  -- Verification
  ai_generated BOOLEAN DEFAULT TRUE,
  human_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES public.storytellers(id),
  
  CONSTRAINT unique_media_themes UNIQUE (media_asset_id)
);

-- Indexes for media_narrative_themes
CREATE INDEX IF NOT EXISTS idx_media_narrative_themes_media 
  ON media_narrative_themes(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_media_narrative_themes_primary 
  ON media_narrative_themes(primary_theme);
CREATE INDEX IF NOT EXISTS idx_media_narrative_themes_secondary 
  ON media_narrative_themes USING gin(secondary_themes);
CREATE INDEX IF NOT EXISTS idx_media_narrative_themes_story 
  ON media_narrative_themes(related_story_id);
CREATE INDEX IF NOT EXISTS idx_media_narrative_themes_keywords 
  ON media_narrative_themes USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_media_narrative_themes_emotional 
  ON media_narrative_themes(emotional_tone);

COMMENT ON TABLE media_narrative_themes IS 
  'Connects media to narrative themes, stories, and ALMA interventions.';
COMMENT ON COLUMN media_narrative_themes.alma_intervention_id IS 
  'Links media to ALMA intervention for evidence/impact tracking.';

-- ============================================
-- TABLE 4: Articles
-- Blog/article content for ecosystem syndication
-- ============================================

CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Author information
  author_type TEXT NOT NULL DEFAULT 'storyteller'
    CHECK (author_type IN ('storyteller', 'staff', 'organization', 'ai_generated', 'anonymous')),
  author_storyteller_id UUID REFERENCES public.storytellers(id) ON DELETE SET NULL,
  author_name TEXT,                            -- Display name (may differ from storyteller name)
  author_bio TEXT,
  
  -- Content
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subtitle TEXT,
  content TEXT,                                -- Main article body (markdown supported)
  excerpt TEXT,                                -- Short summary for cards/previews
  
  -- Media
  featured_image_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
  gallery_ids UUID[] DEFAULT '{}',             -- Associated galleries
  
  -- Classification
  article_type TEXT NOT NULL DEFAULT 'story_feature'
    CHECK (article_type IN (
      'story_feature',      -- Featured storyteller story
      'program_spotlight',  -- ACT program highlight
      'research_summary',   -- Research/evidence piece
      'community_news',     -- Community updates
      'editorial',          -- Opinion/editorial
      'impact_report',      -- Impact narrative
      'project_update',     -- Project milestone
      'tutorial'            -- How-to/guide
    )),
  
  -- ACT Ecosystem Integration
  primary_project TEXT,                        -- e.g., 'empathy-ledger', 'justicehub', 'act-farm'
  related_projects TEXT[] DEFAULT '{}',
  
  -- Tags and themes
  tags TEXT[] DEFAULT '{}',
  themes TEXT[] DEFAULT '{}',                  -- Links to narrative_themes
  
  -- Editorial workflow
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'in_review', 'elder_review', 'approved', 'published', 'archived')),
  requires_elder_review BOOLEAN DEFAULT FALSE,
  elder_reviewer_id UUID REFERENCES public.storytellers(id),
  elder_review_notes TEXT,
  
  -- Publishing
  published_at TIMESTAMPTZ,
  scheduled_publish_at TIMESTAMPTZ,
  
  -- Visibility (three-tier model)
  visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'community', 'public')),
  
  -- Syndication controls
  syndication_enabled BOOLEAN DEFAULT TRUE,
  syndication_destinations TEXT[] DEFAULT '{}', -- Which platforms to syndicate to
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  
  -- Engagement
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  
  -- Search
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(subtitle, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'C')
  ) STORED
);

-- Indexes for articles
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_storyteller_id);
CREATE INDEX IF NOT EXISTS idx_articles_type ON articles(article_type);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_visibility ON articles(visibility);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_articles_project ON articles(primary_project);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_articles_themes ON articles USING gin(themes);
CREATE INDEX IF NOT EXISTS idx_articles_search ON articles USING gin(search_vector);

COMMENT ON TABLE articles IS 
  'Blog/article content for ACT ecosystem syndication. Supports three-tier visibility and elder review.';
COMMENT ON COLUMN articles.visibility IS 
  'Three-tier visibility: private (author only), community (ACT ecosystem), public (anyone)';
COMMENT ON COLUMN articles.syndication_enabled IS 
  'Whether this article can be syndicated to other ACT projects via API';

-- ============================================
-- TABLE 5: Content Syndication
-- Track content distribution across platforms
-- ============================================

CREATE TABLE IF NOT EXISTS public.content_syndication (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Source content
  content_type TEXT NOT NULL
    CHECK (content_type IN ('article', 'story', 'media_asset', 'gallery')),
  content_id UUID NOT NULL,                    -- ID of the source content
  
  -- Destination
  destination_type TEXT NOT NULL
    CHECK (destination_type IN (
      -- ACT Projects
      'justicehub', 'act_farm', 'harvest', 'goods', 'placemat', 'studio',
      -- Social Media
      'linkedin_company', 'linkedin_personal', 'youtube', 'bluesky', 'google_business',
      -- External
      'external_partner', 'news_outlet', 'academic'
    )),
  destination_url TEXT,                        -- URL where content was published
  destination_id TEXT,                         -- ID in destination system
  
  -- Consent
  syndication_consent_granted BOOLEAN NOT NULL DEFAULT FALSE,
  consent_granted_at TIMESTAMPTZ,
  consent_granted_by UUID REFERENCES public.storytellers(id),
  
  -- Attribution
  attribution_text TEXT NOT NULL,              -- Required credit text
  attribution_link TEXT,                       -- Link back to source
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'published', 'failed', 'revoked')),
  
  -- Publishing details
  published_at TIMESTAMPTZ,
  publish_error TEXT,
  
  -- Revenue sharing (for external syndication)
  revenue_share_enabled BOOLEAN DEFAULT FALSE,
  revenue_share_percentage DECIMAL(5,2),
  
  -- Audit
  syndication_request_by UUID REFERENCES public.storytellers(id),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES public.storytellers(id),
  revocation_reason TEXT,
  
  -- Prevent duplicate syndication
  CONSTRAINT unique_content_destination UNIQUE (content_type, content_id, destination_type)
);

-- Indexes for content_syndication
CREATE INDEX IF NOT EXISTS idx_content_syndication_content 
  ON content_syndication(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_syndication_destination 
  ON content_syndication(destination_type);
CREATE INDEX IF NOT EXISTS idx_content_syndication_status 
  ON content_syndication(status);
CREATE INDEX IF NOT EXISTS idx_content_syndication_consent 
  ON content_syndication(syndication_consent_granted);
CREATE INDEX IF NOT EXISTS idx_content_syndication_published 
  ON content_syndication(published_at DESC) WHERE status = 'published';

COMMENT ON TABLE content_syndication IS 
  'Tracks content distribution across ACT ecosystem and external platforms. Requires explicit consent.';
COMMENT ON COLUMN content_syndication.attribution_text IS 
  'Required attribution text that MUST be displayed when content is syndicated.';

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function: Check if media has AI consent
CREATE OR REPLACE FUNCTION public.media_has_ai_consent(p_media_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM media_ai_analysis
    WHERE media_asset_id = p_media_id
    AND ai_consent_granted = TRUE
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Check if person recognition is consented
CREATE OR REPLACE FUNCTION public.recognition_has_consent(p_recognition_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM media_person_recognition
    WHERE id = p_recognition_id
    AND recognition_consent_granted = TRUE
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get articles for syndication
CREATE OR REPLACE FUNCTION public.get_syndication_articles(
  p_project TEXT DEFAULT NULL,
  p_visibility TEXT DEFAULT 'public',
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  content TEXT,
  author_name TEXT,
  published_at TIMESTAMPTZ,
  featured_image_url TEXT,
  tags TEXT[],
  themes TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.slug,
    a.excerpt,
    a.content,
    COALESCE(a.author_name, s.name) as author_name,
    a.published_at,
    m.url as featured_image_url,
    a.tags,
    a.themes
  FROM articles a
  LEFT JOIN storytellers s ON a.author_storyteller_id = s.id
  LEFT JOIN media_assets m ON a.featured_image_id = m.id
  WHERE a.status = 'published'
    AND a.syndication_enabled = TRUE
    AND a.visibility = p_visibility
    AND (p_project IS NULL OR a.primary_project = p_project OR p_project = ANY(a.related_projects))
  ORDER BY a.published_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Match faces across media
CREATE OR REPLACE FUNCTION public.find_similar_faces(
  p_face_encoding vector(512),
  p_threshold FLOAT DEFAULT 0.6,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  recognition_id UUID,
  media_asset_id UUID,
  linked_storyteller_id UUID,
  similarity FLOAT
) AS $$
BEGIN
  -- Only return faces where both consents are granted
  RETURN QUERY
  SELECT 
    mpr.id as recognition_id,
    mpr.media_asset_id,
    mpr.linked_storyteller_id,
    1 - (mpr.face_encoding <=> p_face_encoding) as similarity
  FROM media_person_recognition mpr
  WHERE mpr.recognition_consent_granted = TRUE
    AND mpr.face_encoding IS NOT NULL
    AND (1 - (mpr.face_encoding <=> p_face_encoding)) >= p_threshold
  ORDER BY mpr.face_encoding <=> p_face_encoding
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get media by theme
CREATE OR REPLACE FUNCTION public.get_media_by_theme(
  p_theme TEXT,
  p_visibility TEXT DEFAULT 'public',
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  media_id UUID,
  url TEXT,
  title TEXT,
  alt_text TEXT,
  primary_theme TEXT,
  emotional_tone TEXT,
  storyteller_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ma.id as media_id,
    ma.url,
    ma.title,
    ma.alt_text,
    mnt.primary_theme,
    mnt.emotional_tone,
    st.name as storyteller_name
  FROM media_assets ma
  JOIN media_narrative_themes mnt ON ma.id = mnt.media_asset_id
  LEFT JOIN storytellers st ON ma.uploader_id = st.id
  WHERE (mnt.primary_theme = p_theme OR p_theme = ANY(mnt.secondary_themes))
    AND ma.visibility = p_visibility
    AND ma.status = 'active'
  ORDER BY mnt.theme_confidence DESC NULLS LAST
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE media_ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_person_recognition ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_narrative_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_syndication ENABLE ROW LEVEL SECURITY;

-- media_ai_analysis policies
CREATE POLICY "media_ai_analysis_select_public" ON media_ai_analysis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM media_assets ma
      WHERE ma.id = media_asset_id
      AND ma.visibility = 'public'
    )
  );

CREATE POLICY "media_ai_analysis_select_own" ON media_ai_analysis
  FOR SELECT USING (
    storyteller_id IN (SELECT id FROM storytellers WHERE user_id = auth.uid())
  );

CREATE POLICY "media_ai_analysis_insert_own" ON media_ai_analysis
  FOR INSERT WITH CHECK (
    storyteller_id IN (SELECT id FROM storytellers WHERE user_id = auth.uid())
  );

CREATE POLICY "media_ai_analysis_update_own" ON media_ai_analysis
  FOR UPDATE USING (
    storyteller_id IN (SELECT id FROM storytellers WHERE user_id = auth.uid())
  );

-- media_person_recognition policies
CREATE POLICY "media_person_recognition_select_consented" ON media_person_recognition
  FOR SELECT USING (
    recognition_consent_granted = TRUE
    OR linked_storyteller_id IN (SELECT id FROM storytellers WHERE user_id = auth.uid())
    OR uploader_consent_by IN (SELECT id FROM storytellers WHERE user_id = auth.uid())
  );

-- articles policies
CREATE POLICY "articles_select_public" ON articles
  FOR SELECT USING (
    status = 'published' AND visibility = 'public'
  );

CREATE POLICY "articles_select_community" ON articles
  FOR SELECT USING (
    status = 'published' 
    AND visibility IN ('public', 'community')
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "articles_select_own" ON articles
  FOR SELECT USING (
    author_storyteller_id IN (SELECT id FROM storytellers WHERE user_id = auth.uid())
  );

CREATE POLICY "articles_insert_authenticated" ON articles
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "articles_update_own" ON articles
  FOR UPDATE USING (
    author_storyteller_id IN (SELECT id FROM storytellers WHERE user_id = auth.uid())
  );

-- content_syndication policies
CREATE POLICY "content_syndication_select_own" ON content_syndication
  FOR SELECT USING (
    consent_granted_by IN (SELECT id FROM storytellers WHERE user_id = auth.uid())
    OR syndication_request_by IN (SELECT id FROM storytellers WHERE user_id = auth.uid())
  );

CREATE POLICY "content_syndication_insert_authenticated" ON content_syndication
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_media_ai_analysis_updated_at
  BEFORE UPDATE ON media_ai_analysis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_media_person_recognition_updated_at
  BEFORE UPDATE ON media_person_recognition
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_media_narrative_themes_updated_at
  BEFORE UPDATE ON media_narrative_themes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_content_syndication_updated_at
  BEFORE UPDATE ON content_syndication
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Consent gate trigger - prevent AI analysis without consent
CREATE OR REPLACE FUNCTION enforce_ai_consent()
RETURNS TRIGGER AS $$
BEGIN
  -- If attempting to set AI results without consent, block
  IF NEW.ai_consent_granted = FALSE AND (
    NEW.detected_objects IS NOT NULL AND NEW.detected_objects != '[]'::jsonb
    OR NEW.scene_classification IS NOT NULL
    OR NEW.auto_tags IS NOT NULL AND array_length(NEW.auto_tags, 1) > 0
    OR NEW.content_embedding IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Cannot store AI analysis results without consent. Set ai_consent_granted = TRUE first.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_ai_consent_trigger
  BEFORE INSERT OR UPDATE ON media_ai_analysis
  FOR EACH ROW EXECUTE FUNCTION enforce_ai_consent();

-- Article slug generation
CREATE OR REPLACE FUNCTION generate_article_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug = regexp_replace(NEW.slug, '^-|-$', '', 'g');
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM articles WHERE slug = NEW.slug AND id != COALESCE(NEW.id, gen_random_uuid())) LOOP
      NEW.slug = NEW.slug || '-' || substring(gen_random_uuid()::text, 1, 8);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_article_slug_trigger
  BEFORE INSERT ON articles
  FOR EACH ROW EXECUTE FUNCTION generate_article_slug();

-- ============================================
-- SEED DATA: Article Types Configuration
-- ============================================

-- Create article_types configuration table
CREATE TABLE IF NOT EXISTS public.article_type_config (
  type_key TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  description TEXT,
  default_visibility TEXT DEFAULT 'public',
  requires_elder_review BOOLEAN DEFAULT FALSE,
  icon TEXT,
  color TEXT
);

INSERT INTO article_type_config (type_key, display_name, description, requires_elder_review, icon, color) VALUES
  ('story_feature', 'Story Feature', 'Featured storyteller narratives', TRUE, 'book-open', 'purple'),
  ('program_spotlight', 'Program Spotlight', 'ACT program highlights and updates', FALSE, 'star', 'blue'),
  ('research_summary', 'Research Summary', 'Research findings and evidence', FALSE, 'chart-bar', 'green'),
  ('community_news', 'Community News', 'Community updates and events', FALSE, 'newspaper', 'orange'),
  ('editorial', 'Editorial', 'Opinion and analysis pieces', FALSE, 'pencil', 'gray'),
  ('impact_report', 'Impact Report', 'Impact narratives and outcomes', TRUE, 'trending-up', 'teal'),
  ('project_update', 'Project Update', 'Project milestones and progress', FALSE, 'code', 'indigo'),
  ('tutorial', 'Tutorial', 'How-to guides and tutorials', FALSE, 'academic-cap', 'yellow')
ON CONFLICT (type_key) DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'media_ai_analysis',
      'media_person_recognition',
      'media_narrative_themes',
      'articles',
      'content_syndication'
    );

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Content Hub Schema Migration Complete';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables created: %/5', table_count;
  
  IF table_count = 5 THEN
    RAISE NOTICE '✅ All content hub tables created successfully';
  ELSE
    RAISE WARNING '⚠️ Some tables may not have been created';
  END IF;
END $$;

COMMIT;
