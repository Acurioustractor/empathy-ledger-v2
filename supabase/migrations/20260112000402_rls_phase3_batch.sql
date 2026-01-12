-- Migration: Phase 3 RLS - Batch Infrastructure Security
-- Date: 2026-01-12
-- Purpose: Secure remaining 26 infrastructure tables (simplified, no verification)

-- Backup tables
ALTER TABLE _migration_backup_phase1 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON _migration_backup_phase1 FOR ALL TO service_role USING (true);

-- AI/Processing
ALTER TABLE analysis_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON analysis_jobs FOR ALL TO service_role USING (true);

-- Content/Articles
ALTER TABLE article_ctas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON article_ctas FOR ALL TO service_role USING (true);

ALTER TABLE article_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON article_reviews FOR ALL TO service_role USING (true);

ALTER TABLE article_type_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON article_type_config FOR ALL TO service_role USING (true);

ALTER TABLE author_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON author_permissions FOR ALL TO service_role USING (true);

-- Cache/Sync
ALTER TABLE content_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON content_cache FOR ALL TO service_role USING (true);

ALTER TABLE empathy_sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON empathy_sync_log FOR ALL TO service_role USING (true);

-- Syndication/Templates
ALTER TABLE content_syndication ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON content_syndication FOR ALL TO service_role USING (true);

ALTER TABLE cta_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON cta_templates FOR ALL TO service_role USING (true);

ALTER TABLE partner_message_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON partner_message_templates FOR ALL TO service_role USING (true);

-- Tags
ALTER TABLE cultural_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON cultural_tags FOR ALL TO service_role USING (true);

-- Data Quality
ALTER TABLE data_quality_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON data_quality_metrics FOR ALL TO service_role USING (true);

ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON data_sources FOR ALL TO service_role USING (true);

-- Documents
ALTER TABLE document_outcomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON document_outcomes FOR ALL TO service_role USING (true);

-- Legacy Events
ALTER TABLE events_2024_01 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON events_2024_01 FOR ALL TO service_role USING (true);

ALTER TABLE events_2025_08 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON events_2025_08 FOR ALL TO service_role USING (true);

ALTER TABLE events_2025_09 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON events_2025_09 FOR ALL TO service_role USING (true);

-- Gallery/Media
ALTER TABLE gallery_media_associations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON gallery_media_associations FOR ALL TO service_role USING (true);

ALTER TABLE impact_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON impact_stories FOR ALL TO service_role USING (true);

ALTER TABLE media_narrative_themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON media_narrative_themes FOR ALL TO service_role USING (true);

-- Recommendations
ALTER TABLE opportunity_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON opportunity_recommendations FOR ALL TO service_role USING (true);

-- Admin
ALTER TABLE organization_duplicates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON organization_duplicates FOR ALL TO service_role USING (true);

ALTER TABLE professional_competencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON professional_competencies FOR ALL TO service_role USING (true);

-- Themes
ALTER TABLE theme_associations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON theme_associations FOR ALL TO service_role USING (true);

ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc" ON themes FOR ALL TO service_role USING (true);
