-- FINAL PERFORMANCE INDEXES FOR EMPATHY LEDGER V2
-- Optimized indexes for multi-tenant cultural storytelling platform
-- Generated: 2025-09-11

-- ========================================
-- MULTI-TENANT ARCHITECTURE INDEXES
-- ========================================

-- Core tenant isolation indexes
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stories_tenant_id ON public.stories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_tenant_id ON public.media_assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_projects_tenant_id ON public.projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_tenant_id ON public.transcripts(tenant_id);

-- Organization-based queries
CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON public.projects(organization_id);

-- ========================================
-- USER RELATIONSHIP INDEXES
-- ========================================

-- Profile and storyteller relationships
CREATE INDEX IF NOT EXISTS idx_stories_storyteller_id ON public.stories(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_uploader_id ON public.media_assets(uploader_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_story_id ON public.media_assets(story_id);

-- Transcript relationships
CREATE INDEX IF NOT EXISTS idx_transcripts_media_asset_id ON public.transcripts(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_stories_transcript_id ON public.stories(transcript_id);

-- ========================================
-- CULTURAL SAFETY & SENSITIVITY INDEXES
-- ========================================

-- Cultural sensitivity levels for content filtering
CREATE INDEX IF NOT EXISTS idx_stories_cultural_sensitivity ON public.stories(cultural_sensitivity_level);

-- Elder and cultural protocol indexes for cultural safety
CREATE INDEX IF NOT EXISTS idx_profiles_is_elder ON public.profiles(is_elder);
CREATE INDEX IF NOT EXISTS idx_profiles_is_storyteller ON public.profiles(is_storyteller);

-- ========================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- ========================================

-- Search and listing indexes
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON public.stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_media_assets_filename ON public.media_assets(filename);

-- Status and workflow indexes
CREATE INDEX IF NOT EXISTS idx_transcripts_status ON public.transcripts(status);
CREATE INDEX IF NOT EXISTS idx_stories_status ON public.stories(status) WHERE status IS NOT NULL;

-- Media type filtering
CREATE INDEX IF NOT EXISTS idx_media_assets_media_type ON public.media_assets(media_type);

-- ========================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ========================================

-- Multi-tenant content queries
CREATE INDEX IF NOT EXISTS idx_stories_tenant_created ON public.stories(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_assets_tenant_type ON public.media_assets(tenant_id, media_type);

-- Storyteller dashboard queries
CREATE INDEX IF NOT EXISTS idx_stories_storyteller_status ON public.stories(storyteller_id, status);
CREATE INDEX IF NOT EXISTS idx_media_assets_uploader_created ON public.media_assets(uploader_id, created_at DESC);

-- Organization stats queries
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_storyteller ON public.profiles(tenant_id, is_storyteller);

-- ========================================
-- CULTURAL PROTOCOLS & CONSENT INDEXES
-- ========================================

-- Consent and permissions tracking
CREATE INDEX IF NOT EXISTS idx_profiles_consent_given ON public.profiles(consent_given);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON public.profiles(onboarding_completed);

-- Cultural protocol compliance
CREATE INDEX IF NOT EXISTS idx_profiles_elder_review ON public.profiles(requires_elder_review) WHERE requires_elder_review IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_cultural_protocol ON public.profiles(cultural_protocol_level) WHERE cultural_protocol_level IS NOT NULL;

-- ========================================
-- FULL TEXT SEARCH INDEXES (if needed)
-- ========================================

-- Story content search (can be added later if full text search is implemented)
-- CREATE INDEX IF NOT EXISTS idx_stories_content_gin ON public.stories USING gin(to_tsvector('english', content));
-- CREATE INDEX IF NOT EXISTS idx_transcripts_text_gin ON public.transcripts USING gin(to_tsvector('english', text));

-- ========================================
-- VERIFICATION QUERY
-- ========================================

-- Show all created indexes for verification
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN (
  'profiles', 'stories', 'media_assets', 
  'projects', 'transcripts', 'organizations'
)
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;