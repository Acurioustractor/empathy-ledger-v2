-- Phase 1: Remove Unused Tables (Zero Impact)
-- Impact: Remove 9 tables with ZERO code references
-- Risk: NONE (no code uses these tables)
-- Time: ~15 minutes
-- Date: 2026-01-02

-- ============================================================================
-- SERVICE SCRAPER SYSTEM (6 tables - completely unused)
-- ============================================================================
--
-- Analysis: These tables were built for scraping external service providers.
-- Code search shows ZERO references to any of these tables.
-- No migrations create data, no API routes query them, no components use them.
--
-- Safe to remove: YES ✅

-- Backup first (optional - comment out if not needed)
CREATE TABLE IF NOT EXISTS _archive_scraped_services AS SELECT * FROM scraped_services;
CREATE TABLE IF NOT EXISTS _archive_scraper_health_metrics AS SELECT * FROM scraper_health_metrics;
CREATE TABLE IF NOT EXISTS _archive_scraping_metadata AS SELECT * FROM scraping_metadata;
CREATE TABLE IF NOT EXISTS _archive_service_impact AS SELECT * FROM service_impact;
CREATE TABLE IF NOT EXISTS _archive_services AS SELECT * FROM services;
CREATE TABLE IF NOT EXISTS _archive_organization_services AS SELECT * FROM organization_services;

-- Drop tables
DROP TABLE IF EXISTS scraped_services CASCADE;
DROP TABLE IF EXISTS scraper_health_metrics CASCADE;
DROP TABLE IF EXISTS scraping_metadata CASCADE;
DROP TABLE IF EXISTS service_impact CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS organization_services CASCADE;

COMMENT ON TABLE _archive_scraped_services IS 'Archived 2026-01-02 - No code references found';

-- ============================================================================
-- LEGACY ACT PLATFORM (3 tables - legacy feature)
-- ============================================================================
--
-- Analysis: ACT (Aboriginal Community Training) platform tables.
-- Only 1 table still in use: act_projects (25 active projects)
-- These admin/permission tables have ZERO references
--
-- Safe to remove: YES ✅

-- Backup first
CREATE TABLE IF NOT EXISTS _archive_act_admin_permissions AS SELECT * FROM act_admin_permissions;
CREATE TABLE IF NOT EXISTS _archive_act_admins AS SELECT * FROM act_admins;
CREATE TABLE IF NOT EXISTS _archive_act_feature_requests AS SELECT * FROM act_feature_requests;

-- Drop tables
DROP TABLE IF EXISTS act_admin_permissions CASCADE;
DROP TABLE IF EXISTS act_admins CASCADE;
DROP TABLE IF EXISTS act_feature_requests CASCADE;

COMMENT ON TABLE _archive_act_admins IS 'Archived 2026-01-02 - ACT admin feature deprecated, core act_projects table still active';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Count remaining tables
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT count(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND table_name NOT LIKE '_archive_%';

  RAISE NOTICE 'Active tables remaining: %', table_count;
  RAISE NOTICE 'Expected: ~172 tables (was 181, removed 9)';
END $$;

-- List archived tables (for verification)
SELECT
  table_name,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS size
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '_archive_%'
ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;

-- ============================================================================
-- ROLLBACK PROCEDURE (if needed)
-- ============================================================================

-- If you need to restore tables, run:
-- DROP TABLE scraped_services; CREATE TABLE scraped_services AS SELECT * FROM _archive_scraped_services;
-- (Repeat for each table)

-- To clean up archive tables after verifying (30 days later):
-- DROP TABLE _archive_scraped_services;
-- DROP TABLE _archive_scraper_health_metrics;
-- ... etc
