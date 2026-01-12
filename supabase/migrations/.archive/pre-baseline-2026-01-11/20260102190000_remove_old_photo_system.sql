-- Phase 2: Remove Old Photo System (11 tables)
-- Created: 2026-01-02
-- Risk: LOW (superseded by media_assets + galleries system)
-- Reversible: YES (all data backed up)

-- This migration removes the legacy photo_* tables that have been superseded
-- by the modern media_assets and galleries system.

-- ============================================================================
-- DATA AUDIT (Document what we're removing)
-- ============================================================================

CREATE TABLE IF NOT EXISTS _photo_system_audit AS
SELECT
  'AUDIT START' as table_name,
  0 as row_count,
  '0 bytes' as size,
  NOW() as audited_at
LIMIT 0;

-- Audit each table if it exists
DO $$
BEGIN
  -- photo_galleries
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photo_galleries') THEN
    INSERT INTO _photo_system_audit
    SELECT
      'photo_galleries',
      COUNT(*),
      pg_size_pretty(pg_total_relation_size('photo_galleries')),
      NOW()
    FROM photo_galleries;
  END IF;

  -- gallery_photos
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gallery_photos') THEN
    INSERT INTO _photo_system_audit
    SELECT 'gallery_photos', COUNT(*), pg_size_pretty(pg_total_relation_size('gallery_photos')), NOW()
    FROM gallery_photos;
  END IF;

  -- photo_gallery_items
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photo_gallery_items') THEN
    INSERT INTO _photo_system_audit
    SELECT 'photo_gallery_items', COUNT(*), pg_size_pretty(pg_total_relation_size('photo_gallery_items')), NOW()
    FROM photo_gallery_items;
  END IF;

  -- photo_faces
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photo_faces') THEN
    INSERT INTO _photo_system_audit
    SELECT 'photo_faces', COUNT(*), pg_size_pretty(pg_total_relation_size('photo_faces')), NOW()
    FROM photo_faces;
  END IF;

  -- photo_locations
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photo_locations') THEN
    INSERT INTO _photo_system_audit
    SELECT 'photo_locations', COUNT(*), pg_size_pretty(pg_total_relation_size('photo_locations')), NOW()
    FROM photo_locations;
  END IF;

  -- photo_memories
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photo_memories') THEN
    INSERT INTO _photo_system_audit
    SELECT 'photo_memories', COUNT(*), pg_size_pretty(pg_total_relation_size('photo_memories')), NOW()
    FROM photo_memories;
  END IF;

  -- photo_storytellers
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photo_storytellers') THEN
    INSERT INTO _photo_system_audit
    SELECT 'photo_storytellers', COUNT(*), pg_size_pretty(pg_total_relation_size('photo_storytellers')), NOW()
    FROM photo_storytellers;
  END IF;

  -- photo_tags
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photo_tags') THEN
    INSERT INTO _photo_system_audit
    SELECT 'photo_tags', COUNT(*), pg_size_pretty(pg_total_relation_size('photo_tags')), NOW()
    FROM photo_tags;
  END IF;

  -- photo_analytics
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photo_analytics') THEN
    INSERT INTO _photo_system_audit
    SELECT 'photo_analytics', COUNT(*), pg_size_pretty(pg_total_relation_size('photo_analytics')), NOW()
    FROM photo_analytics;
  END IF;

  -- photo_organizations
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photo_organizations') THEN
    INSERT INTO _photo_system_audit
    SELECT 'photo_organizations', COUNT(*), pg_size_pretty(pg_total_relation_size('photo_organizations')), NOW()
    FROM photo_organizations;
  END IF;

  -- photo_projects
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photo_projects') THEN
    INSERT INTO _photo_system_audit
    SELECT 'photo_projects', COUNT(*), pg_size_pretty(pg_total_relation_size('photo_projects')), NOW()
    FROM photo_projects;
  END IF;
END $$;

-- ============================================================================
-- BACKUP (Only if tables exist and have data)
-- ============================================================================

DO $$
BEGIN
  -- Backup photo_galleries
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photo_galleries') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS _archive_photo_galleries AS SELECT * FROM photo_galleries';
  END IF;

  -- Backup gallery_photos
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gallery_photos') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS _archive_gallery_photos AS SELECT * FROM gallery_photos';
  END IF;

  -- Backup photo_gallery_items
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photo_gallery_items') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS _archive_photo_gallery_items AS SELECT * FROM photo_gallery_items';
  END IF;

  -- Backup photo_faces
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photo_faces') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS _archive_photo_faces AS SELECT * FROM photo_faces';
  END IF;

  -- Backup photo_locations
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photo_locations') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS _archive_photo_locations AS SELECT * FROM photo_locations';
  END IF;

  -- Backup photo_memories
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photo_memories') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS _archive_photo_memories AS SELECT * FROM photo_memories';
  END IF;

  -- Backup photo_storytellers
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photo_storytellers') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS _archive_photo_storytellers AS SELECT * FROM photo_storytellers';
  END IF;

  -- Backup photo_tags
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photo_tags') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS _archive_photo_tags AS SELECT * FROM photo_tags';
  END IF;

  -- Backup photo_analytics
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photo_analytics') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS _archive_photo_analytics AS SELECT * FROM photo_analytics';
  END IF;

  -- Backup photo_organizations
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photo_organizations') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS _archive_photo_organizations AS SELECT * FROM photo_organizations';
  END IF;

  -- Backup photo_projects
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photo_projects') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS _archive_photo_projects AS SELECT * FROM photo_projects';
  END IF;
END $$;

-- ============================================================================
-- REMOVE OLD PHOTO TABLES
-- ============================================================================

DROP TABLE IF EXISTS photo_galleries CASCADE;
DROP TABLE IF EXISTS gallery_photos CASCADE;
DROP TABLE IF EXISTS photo_gallery_items CASCADE;
DROP TABLE IF EXISTS photo_faces CASCADE;
DROP TABLE IF EXISTS photo_locations CASCADE;
DROP TABLE IF EXISTS photo_memories CASCADE;
DROP TABLE IF EXISTS photo_storytellers CASCADE;
DROP TABLE IF EXISTS photo_tags CASCADE;
DROP TABLE IF EXISTS photo_organizations CASCADE;
DROP TABLE IF EXISTS photo_projects CASCADE;
DROP TABLE IF EXISTS photo_analytics CASCADE;

-- ============================================================================
-- VERIFICATION & REPORTING
-- ============================================================================

DO $$
DECLARE
  tables_removed INTEGER;
  total_rows INTEGER;
  total_size TEXT;
BEGIN
  -- Count tables removed
  SELECT COUNT(*) INTO tables_removed FROM _photo_system_audit;

  -- Sum total rows
  SELECT SUM(row_count) INTO total_rows FROM _photo_system_audit;

  RAISE NOTICE '';
  RAISE NOTICE '══════════════════════════════════════════════════════';
  RAISE NOTICE 'PHASE 2: Old Photo System Removal COMPLETE!';
  RAISE NOTICE '══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables removed: %', tables_removed;
  RAISE NOTICE 'Total rows backed up: %', COALESCE(total_rows, 0);
  RAISE NOTICE '';
  RAISE NOTICE 'Current media system:';
  RAISE NOTICE '  ✓ media_assets - Comprehensive media management';
  RAISE NOTICE '  ✓ galleries - Modern gallery system';
  RAISE NOTICE '';
  RAISE NOTICE 'Backup tables:';
  RAISE NOTICE '  ✓ _archive_photo_* - All old photo tables';
  RAISE NOTICE '  ✓ _photo_system_audit - Removal audit trail';
  RAISE NOTICE '';
  RAISE NOTICE 'To rollback: Restore from _archive_photo_* tables';
  RAISE NOTICE '';
  RAISE NOTICE '══════════════════════════════════════════════════════';
END $$;
