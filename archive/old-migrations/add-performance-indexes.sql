-- Performance Optimization Indexes for Empathy Ledger v2
-- Add missing indexes identified in database audit
-- Run this script after schema updates to improve query performance

-- Multi-tenant indexes for tenant_id fields
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stories_tenant_id ON stories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_organizations_tenant_id ON organizations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_tenant_id ON media_assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_galleries_tenant_id ON galleries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_tenant_id ON transcripts(tenant_id);

-- Cultural sensitivity and review indexes
CREATE INDEX IF NOT EXISTS idx_stories_cultural_sensitivity ON stories(cultural_sensitivity_level);
CREATE INDEX IF NOT EXISTS idx_stories_elder_approval ON stories(elder_approval);
CREATE INDEX IF NOT EXISTS idx_stories_cultural_review_status ON stories(cultural_review_status);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);

CREATE INDEX IF NOT EXISTS idx_media_assets_cultural_sensitivity ON media_assets(cultural_sensitivity_level);
CREATE INDEX IF NOT EXISTS idx_media_assets_elder_approval ON media_assets(elder_approval);
CREATE INDEX IF NOT EXISTS idx_media_assets_cultural_review_status ON media_assets(cultural_review_status);

-- User role and cultural permission indexes
CREATE INDEX IF NOT EXISTS idx_profiles_is_storyteller ON profiles(is_storyteller);
CREATE INDEX IF NOT EXISTS idx_profiles_is_elder ON profiles(is_elder);
CREATE INDEX IF NOT EXISTS idx_profiles_traditional_knowledge_keeper ON profiles(traditional_knowledge_keeper);

-- Foreign key relationship indexes (if not automatically created)
CREATE INDEX IF NOT EXISTS idx_stories_author_id ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_storyteller_id ON stories(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_uploaded_by ON media_assets(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_assets_uploader_id ON media_assets(uploader_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_organization_id ON media_assets(organization_id);

-- Performance indexes for common queries
CREATE INDEX IF NOT EXISTS idx_stories_featured ON stories(featured);
CREATE INDEX IF NOT EXISTS idx_stories_publication_date ON stories(publication_date);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at);

-- Gallery and media association indexes
CREATE INDEX IF NOT EXISTS idx_gallery_media_associations_gallery_id ON gallery_media_associations(gallery_id);
CREATE INDEX IF NOT EXISTS idx_gallery_media_associations_media_asset_id ON gallery_media_associations(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_galleries_organization_id ON galleries(organization_id);

-- Cultural tags and search indexes
CREATE INDEX IF NOT EXISTS idx_cultural_tags_category ON cultural_tags(category);
CREATE INDEX IF NOT EXISTS idx_cultural_tags_cultural_sensitivity ON cultural_tags(cultural_sensitivity_level);

-- GIN indexes for JSON and array fields (for complex queries)
CREATE INDEX IF NOT EXISTS idx_stories_tags_gin ON stories USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_profiles_cultural_affiliations_gin ON profiles USING GIN(cultural_affiliations);
CREATE INDEX IF NOT EXISTS idx_profiles_languages_spoken_gin ON profiles USING GIN(languages_spoken);
CREATE INDEX IF NOT EXISTS idx_media_assets_cultural_context_gin ON media_assets USING GIN(cultural_context);

-- Composite indexes for common multi-column queries
CREATE INDEX IF NOT EXISTS idx_stories_tenant_status ON stories(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_stories_author_status ON stories(author_id, status);
CREATE INDEX IF NOT EXISTS idx_media_assets_tenant_cultural ON media_assets(tenant_id, cultural_sensitivity_level);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_storyteller ON profiles(tenant_id, is_storyteller);

-- Text search optimization (if using PostgreSQL full-text search)
-- These might need to be adjusted based on actual search implementation
-- CREATE INDEX IF NOT EXISTS idx_stories_content_fts ON stories USING GIN(to_tsvector('english', title || ' ' || content));
-- CREATE INDEX IF NOT EXISTS idx_profiles_search_fts ON profiles USING GIN(to_tsvector('english', coalesce(display_name, '') || ' ' || coalesce(bio, '')));

-- Transcripts performance indexes
CREATE INDEX IF NOT EXISTS idx_transcripts_created_by ON transcripts(created_by);
CREATE INDEX IF NOT EXISTS idx_transcripts_status ON transcripts(status);
CREATE INDEX IF NOT EXISTS idx_transcripts_cultural_sensitivity ON transcripts(cultural_sensitivity_level);
CREATE INDEX IF NOT EXISTS idx_transcripts_elder_approved ON transcripts(elder_approved);

-- Organization member and content counting optimization
CREATE INDEX IF NOT EXISTS idx_profiles_organization_context ON profiles(tenant_id, is_storyteller, is_elder);
CREATE INDEX IF NOT EXISTS idx_stories_organization_published ON stories(tenant_id, status, publication_date);

-- Media processing and access tracking
CREATE INDEX IF NOT EXISTS idx_media_assets_processing_status ON media_assets(processing_status);
CREATE INDEX IF NOT EXISTS idx_media_assets_visibility ON media_assets(visibility);
CREATE INDEX IF NOT EXISTS idx_media_assets_last_accessed ON media_assets(last_accessed_at);

-- Gallery management and display
CREATE INDEX IF NOT EXISTS idx_galleries_status ON galleries(status);
CREATE INDEX IF NOT EXISTS idx_galleries_featured ON galleries(featured);
CREATE INDEX IF NOT EXISTS idx_galleries_cultural_sensitivity ON galleries(cultural_sensitivity_level);

-- Performance note: Monitor query performance after adding these indexes
-- Some indexes may need to be dropped if they're not used and slow down writes
-- Use EXPLAIN ANALYZE to verify index usage in your specific queries

-- Index maintenance commands (run periodically)
-- REINDEX INDEX CONCURRENTLY idx_name; -- for rebuilding specific indexes
-- ANALYZE; -- update table statistics for query planner

COMMENT ON SCHEMA public IS 'Performance indexes added for Empathy Ledger v2 - Cultural storytelling platform with multi-tenant architecture';