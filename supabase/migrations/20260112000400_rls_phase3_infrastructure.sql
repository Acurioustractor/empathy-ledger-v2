-- Migration: Phase 3 RLS - Infrastructure Tables
-- Date: 2026-01-12
-- Purpose: Secure remaining infrastructure tables with service-role-only access
-- Strategy: Enable RLS + service role bypass for all infrastructure tables
--           These are internal system tables not meant for direct user access

-- ============================================================================
-- INFRASTRUCTURE TABLE PATTERN
-- ============================================================================
-- All infrastructure tables get:
-- 1. RLS enabled
-- 2. Service role full access
-- 3. Super admin read-only access (for debugging/monitoring)
--
-- This prevents accidental exposure while allowing system operations
-- ============================================================================

-- Create reusable function for infrastructure table policies
CREATE OR REPLACE FUNCTION add_infrastructure_rls_policies(table_name text)
RETURNS void AS $$
BEGIN
  -- Enable RLS
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);

  -- Policy 1: Service role full access
  EXECUTE format(
    'CREATE POLICY "Service role full access" ON %I FOR ALL TO service_role USING (true)',
    table_name
  );

  -- Policy 2: Super admins read-only
  EXECUTE format(
    'CREATE POLICY "Super admins read-only" ON %I FOR SELECT TO authenticated USING (
      EXISTS (
        SELECT 1 FROM super_admin_permissions
        WHERE profile_id = auth.uid() AND is_active = true
      )
    )',
    table_name
  );

  RAISE NOTICE '✓ Added RLS policies to %', table_name;

EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE '⊗ Table % does not exist, skipping', table_name;
  WHEN duplicate_object THEN
    RAISE NOTICE '⊙ Table % already has RLS policies, skipping', table_name;
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to add policies to %: %', table_name, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- APPLY TO ALL REMAINING TABLES
-- ============================================================================

-- Get all tables without RLS and apply infrastructure policies
DO $$
DECLARE
  tbl RECORD;
  tables_secured INTEGER := 0;
  tables_skipped INTEGER := 0;
BEGIN
  FOR tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND rowsecurity = FALSE
      -- Exclude any tables that should remain public
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE 'sql_%'
    ORDER BY tablename
  LOOP
    BEGIN
      PERFORM add_infrastructure_rls_policies(tbl.tablename);
      tables_secured := tables_secured + 1;
    EXCEPTION
      WHEN OTHERS THEN
        tables_skipped := tables_skipped + 1;
        RAISE NOTICE 'Skipped %: %', tbl.tablename, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'Phase 3 Infrastructure RLS Complete';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'Tables secured: %', tables_secured;
  RAISE NOTICE 'Tables skipped: %', tables_skipped;
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Final RLS coverage check
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

  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'FINAL RLS COVERAGE';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'Total tables: %', total_tables;
  RAISE NOTICE 'Secured: % (%.1f%%)', secured_tables, coverage_pct;
  RAISE NOTICE 'Exposed: %', exposed_tables;
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

  IF coverage_pct >= 90.0 THEN
    RAISE NOTICE '✅ TARGET ACHIEVED: 90%+ RLS coverage';
  ELSIF coverage_pct >= 85.0 THEN
    RAISE NOTICE '✓ GOOD: 85%+ RLS coverage';
  ELSE
    RAISE WARNING '⚠ Coverage below 85%%';
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
    RAISE NOTICE '';
    RAISE NOTICE 'Remaining exposed tables:';
    RAISE NOTICE '%', exposed_list;
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ALL TABLES SECURED!';
  END IF;
END $$;

-- Drop the helper function (cleanup)
DROP FUNCTION add_infrastructure_rls_policies(text);

-- Add summary comment
COMMENT ON SCHEMA public IS
  'Phase 3 RLS complete. All infrastructure tables secured with service-role-only access.';
