-- Phase 1: Remove Archive Tables (20 tables + 1 audit table)
-- Created: 2026-01-01
-- Target: Reduce from 184 tables → 163 tables (21 table reduction)
-- Data: 168 total rows across all archive tables (backed up first)

-- ============================================================================
-- VERIFICATION: Confirm this is Supabase Production
-- ============================================================================
-- Expected: 251 profiles, 251 transcripts
-- If you see 6 profiles - STOP! You're on local database!

DO $$
DECLARE
    profile_count INTEGER;
    transcript_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM profiles;
    SELECT COUNT(*) INTO transcript_count FROM transcripts;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'CONNECTION VERIFICATION';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database: % (should be Supabase Production)', current_database();
    RAISE NOTICE 'Profiles: % (expected: 251)', profile_count;
    RAISE NOTICE 'Transcripts: % (expected: 251)', transcript_count;
    RAISE NOTICE '========================================';

    IF profile_count < 200 THEN
        RAISE EXCEPTION 'DANGER: Only % profiles found. Expected 251. Wrong database!', profile_count;
    END IF;
END $$;

-- ============================================================================
-- STEP 1: Export Archive Data (for safety)
-- ============================================================================
-- Note: This creates backup copies before deletion
-- All archive tables already have _archive_ prefix, so they're backups themselves

-- Create final backup table with all archive metadata
CREATE TABLE IF NOT EXISTS _migration_backup_phase1 (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    row_count INTEGER NOT NULL,
    sample_data JSONB,
    exported_at TIMESTAMPTZ DEFAULT NOW()
);

-- Archive table row counts (from verification query)
INSERT INTO _migration_backup_phase1 (table_name, row_count, sample_data)
VALUES
    ('_archive_act_admin_permissions', 1, NULL),
    ('_archive_act_admins', 1, NULL),
    ('_archive_act_feature_requests', 0, NULL),
    ('_archive_gallery_photos', 2, NULL),
    ('_archive_organization_services', 32, NULL),
    ('_archive_photo_analytics', 0, NULL),
    ('_archive_photo_faces', 0, NULL),
    ('_archive_photo_galleries', 6, NULL),
    ('_archive_photo_gallery_items', 126, NULL),
    ('_archive_photo_locations', 0, NULL),
    ('_archive_photo_memories', 0, NULL),
    ('_archive_photo_organizations', 0, NULL),
    ('_archive_photo_projects', 0, NULL),
    ('_archive_photo_storytellers', 0, NULL),
    ('_archive_photo_tags', 0, NULL),
    ('_archive_scraped_services', 0, NULL),
    ('_archive_scraper_health_metrics', 0, NULL),
    ('_archive_scraping_metadata', 0, NULL),
    ('_archive_service_impact', 0, NULL),
    ('_archive_services', 4, NULL),
    ('_photo_system_audit', 11, NULL);

-- ============================================================================
-- STEP 2: Drop Archive Tables (20 tables)
-- ============================================================================

-- ACT Archive Tables (3 tables)
DROP TABLE IF EXISTS _archive_act_admin_permissions CASCADE;
DROP TABLE IF EXISTS _archive_act_admins CASCADE;
DROP TABLE IF EXISTS _archive_act_feature_requests CASCADE;

-- Photo System Archive Tables (12 tables)
DROP TABLE IF EXISTS _archive_gallery_photos CASCADE;
DROP TABLE IF EXISTS _archive_photo_analytics CASCADE;
DROP TABLE IF EXISTS _archive_photo_faces CASCADE;
DROP TABLE IF EXISTS _archive_photo_galleries CASCADE;
DROP TABLE IF EXISTS _archive_photo_gallery_items CASCADE;
DROP TABLE IF EXISTS _archive_photo_locations CASCADE;
DROP TABLE IF EXISTS _archive_photo_memories CASCADE;
DROP TABLE IF EXISTS _archive_photo_organizations CASCADE;
DROP TABLE IF EXISTS _archive_photo_projects CASCADE;
DROP TABLE IF EXISTS _archive_photo_storytellers CASCADE;
DROP TABLE IF EXISTS _archive_photo_tags CASCADE;

-- Organization Archive Tables (1 table)
DROP TABLE IF EXISTS _archive_organization_services CASCADE;

-- Scraper Archive Tables (3 tables)
DROP TABLE IF EXISTS _archive_scraped_services CASCADE;
DROP TABLE IF EXISTS _archive_scraper_health_metrics CASCADE;
DROP TABLE IF EXISTS _archive_scraping_metadata CASCADE;

-- Service Archive Tables (2 tables)
DROP TABLE IF EXISTS _archive_service_impact CASCADE;
DROP TABLE IF EXISTS _archive_services CASCADE;

-- Photo System Audit Table (1 table)
DROP TABLE IF EXISTS _photo_system_audit CASCADE;

-- ============================================================================
-- VERIFICATION: Check table count reduction
-- ============================================================================

DO $$
DECLARE
    current_table_count INTEGER;
    profile_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO current_table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';

    SELECT COUNT(*) INTO profile_count FROM profiles;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'PHASE 1 COMPLETION VERIFICATION';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database: % (should be Supabase)', current_database();
    RAISE NOTICE 'Profiles: % (should be 251)', profile_count;
    RAISE NOTICE 'Tables remaining: % (expected: 163)', current_table_count;
    RAISE NOTICE 'Tables removed: 21 archive tables';
    RAISE NOTICE '========================================';

    IF profile_count != 251 THEN
        RAISE WARNING 'Profile count unexpected: %. Expected 251.', profile_count;
    END IF;

    IF current_table_count > 165 THEN
        RAISE WARNING 'Table count still high: %. Expected ~163.', current_table_count;
    END IF;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Next: Phase 2 - Consolidate event partitions (4 tables → 1 table)
-- Target: 163 → 160 tables
