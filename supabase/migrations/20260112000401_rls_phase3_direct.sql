-- Migration: Phase 3 RLS - Direct Infrastructure Security
-- Date: 2026-01-12
-- Purpose: Directly secure all remaining infrastructure tables
-- Note: Using direct statements instead of dynamic SQL due to connection pooler issues

-- ============================================================================
-- INFRASTRUCTURE TABLES - SERVICE ROLE ONLY
-- ============================================================================

-- Backup/Migration tables
ALTER TABLE _migration_backup_phase1 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON _migration_backup_phase1 FOR ALL TO service_role USING (true);

-- AI/Processing tables
ALTER TABLE ai_processing_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON ai_processing_logs FOR ALL TO service_role USING (true);

ALTER TABLE analysis_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON analysis_jobs FOR ALL TO service_role USING (true);

-- Content/Article tables
ALTER TABLE article_ctas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON article_ctas FOR ALL TO service_role USING (true);

ALTER TABLE article_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON article_reviews FOR ALL TO service_role USING (true);

ALTER TABLE article_type_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON article_type_config FOR ALL TO service_role USING (true);

ALTER TABLE author_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON author_permissions FOR ALL TO service_role USING (true);

-- Cache/Sync tables
ALTER TABLE content_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON content_cache FOR ALL TO service_role USING (true);

ALTER TABLE empathy_sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON empathy_sync_log FOR ALL TO service_role USING (true);

-- Syndication/Templates
ALTER TABLE content_syndication ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON content_syndication FOR ALL TO service_role USING (true);

ALTER TABLE cta_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON cta_templates FOR ALL TO service_role USING (true);

ALTER TABLE partner_message_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON partner_message_templates FOR ALL TO service_role USING (true);

-- Tags/Taxonomies
ALTER TABLE cultural_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON cultural_tags FOR ALL TO service_role USING (true);

-- Data Quality/Monitoring
ALTER TABLE data_quality_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON data_quality_metrics FOR ALL TO service_role USING (true);

ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON data_sources FOR ALL TO service_role USING (true);

-- Documents/Outcomes
ALTER TABLE document_outcomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON document_outcomes FOR ALL TO service_role USING (true);

-- Legacy Event tables (will be archived)
ALTER TABLE events_2024_01 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON events_2024_01 FOR ALL TO service_role USING (true);

ALTER TABLE events_2025_08 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON events_2025_08 FOR ALL TO service_role USING (true);

ALTER TABLE events_2025_09 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON events_2025_09 FOR ALL TO service_role USING (true);

-- Gallery/Media associations
ALTER TABLE gallery_media_associations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON gallery_media_associations FOR ALL TO service_role USING (true);

-- Legacy content tables
ALTER TABLE impact_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON impact_stories FOR ALL TO service_role USING (true);

-- Media/Theme associations
ALTER TABLE media_narrative_themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON media_narrative_themes FOR ALL TO service_role USING (true);

ALTER TABLE theme_associations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON theme_associations FOR ALL TO service_role USING (true);

ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON themes FOR ALL TO service_role USING (true);

-- Recommendations/Opportunities
ALTER TABLE opportunity_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON opportunity_recommendations FOR ALL TO service_role USING (true);

-- Admin/Internal
ALTER TABLE organization_duplicates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON organization_duplicates FOR ALL TO service_role USING (true);

ALTER TABLE professional_competencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON professional_competencies FOR ALL TO service_role USING (true);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  total_tables INTEGER;
  secured_tables INTEGER;
  exposed_tables INTEGER;
  coverage_pct NUMERIC;
BEGIN
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE rowsecurity = TRUE),
    COUNT(*) FILTER (WHERE rowsecurity = FALSE)
  INTO total_tables, secured_tables, exposed_tables
  FROM pg_tables
  WHERE schemaname = 'public';

  coverage_pct := ROUND(100.0 * secured_tables / total_tables, 1);

  RAISE NOTICE 'FINAL RLS COVERAGE';
  RAISE NOTICE 'Total tables: %', total_tables;
  RAISE NOTICE 'Secured: % (%.1f%%)', secured_tables, coverage_pct;
  RAISE NOTICE 'Exposed: %', exposed_tables;

  IF coverage_pct >= 90.0 THEN
    RAISE NOTICE 'TARGET ACHIEVED: 90%+ RLS coverage';
  ELSIF coverage_pct >= 85.0 THEN
    RAISE NOTICE 'GOOD: 85%+ RLS coverage';
  ELSE
    RAISE WARNING 'Coverage below 85 percent';
  END IF;
END $$;

-- List any remaining exposed tables
DO $$
DECLARE
  exposed_list TEXT;
BEGIN
  SELECT string_agg(tablename, ', ' ORDER BY tablename)
  INTO exposed_list
  FROM pg_tables
  WHERE schemaname = 'public'
    AND rowsecurity = FALSE;

  IF exposed_list IS NOT NULL THEN
    RAISE NOTICE 'Remaining exposed tables: %', exposed_list;
  ELSE
    RAISE NOTICE 'ALL TABLES SECURED!';
  END IF;
END $$;
