-- RLS Coverage Verification Script
-- Run this after applying Phase 1 migrations to verify 100% RLS coverage
-- Expected: All tables in 'public' schema should have RLS enabled

-- ====================
-- 1. TABLES WITHOUT RLS
-- ====================

SELECT
  '🚨 CRITICAL: Tables WITHOUT RLS' AS status,
  schemaname,
  tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = FALSE
ORDER BY tablename;

-- Expected: 0 rows (all tables should have RLS)

-- ====================
-- 2. RLS COVERAGE SUMMARY
-- ====================

SELECT
  '📊 RLS Coverage Summary' AS report,
  COUNT(*) AS total_tables,
  COUNT(*) FILTER (WHERE rowsecurity = TRUE) AS tables_with_rls,
  COUNT(*) FILTER (WHERE rowsecurity = FALSE) AS tables_without_rls,
  ROUND(100.0 * COUNT(*) FILTER (WHERE rowsecurity = TRUE) / COUNT(*), 1) AS rls_coverage_pct
FROM pg_tables
WHERE schemaname = 'public';

-- Expected: 100.0% coverage

-- ====================
-- 3. POLICY COUNT PER TABLE
-- ====================

SELECT
  '📋 Policy Coverage' AS report,
  schemaname,
  tablename,
  COUNT(policyname) AS policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY policy_count DESC, tablename
LIMIT 20;

-- Shows tables with the most policies (good indicator of comprehensive protection)

-- ====================
-- 4. TABLES WITH RLS BUT NO POLICIES (BLOCKS ALL ACCESS)
-- ====================

SELECT
  '⚠️  WARNING: RLS enabled but NO policies (blocks all access)' AS status,
  t.schemaname,
  t.tablename
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.rowsecurity = TRUE
  AND NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = t.schemaname
      AND p.tablename = t.tablename
  )
ORDER BY t.tablename;

-- Expected: 0 rows (all tables with RLS should have at least one policy)

-- ====================
-- 5. CRITICAL TABLES VERIFICATION
-- ====================

-- Verify the most critical tables explicitly
SELECT
  '🔒 Critical Tables Protection Status' AS report,
  tablename,
  CASE
    WHEN rowsecurity = TRUE THEN '✅ Protected'
    ELSE '🚨 EXPOSED'
  END AS protection_status,
  (
    SELECT COUNT(*)
    FROM pg_policies
    WHERE schemaname = 'public'
      AND pg_policies.tablename = pg_tables.tablename
  ) AS policy_count
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles',
    'personal_insights',
    'storyteller_payouts',
    'privacy_changes',
    'super_admin_permissions',
    'super_admin_audit_log',
    'organization_analytics',
    'storyteller_analytics'
  )
ORDER BY tablename;

-- Expected: All should show '✅ Protected' with policy_count > 0

-- ====================
-- 6. TENANT ISOLATION VERIFICATION
-- ====================

-- Check tables with tenant_id have proper tenant isolation policies
SELECT
  '🏢 Tenant Isolation Check' AS report,
  t.tablename,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_policies p
      WHERE p.schemaname = 'public'
        AND p.tablename = t.tablename
        AND p.qual::text LIKE '%tenant_id%'
    ) THEN '✅ Has tenant isolation'
    ELSE '⚠️  Missing tenant isolation'
  END AS tenant_policy_status
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND EXISTS (
    SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = t.tablename
      AND c.column_name = 'tenant_id'
  )
ORDER BY t.tablename;

-- ====================
-- 7. FINAL PRODUCTION READINESS CHECK
-- ====================

DO $$
DECLARE
  total_tables INTEGER;
  tables_with_rls INTEGER;
  tables_without_rls INTEGER;
  critical_exposed INTEGER;
BEGIN
  -- Count all tables
  SELECT COUNT(*) INTO total_tables
  FROM pg_tables
  WHERE schemaname = 'public';

  -- Count tables with RLS
  SELECT COUNT(*) INTO tables_with_rls
  FROM pg_tables
  WHERE schemaname = 'public'
    AND rowsecurity = TRUE;

  -- Count tables without RLS
  SELECT COUNT(*) INTO tables_without_rls
  FROM pg_tables
  WHERE schemaname = 'public'
    AND rowsecurity = FALSE;

  -- Count critical tables without RLS
  SELECT COUNT(*) INTO critical_exposed
  FROM pg_tables
  WHERE schemaname = 'public'
    AND rowsecurity = FALSE
    AND tablename IN (
      'profiles', 'personal_insights', 'storyteller_payouts',
      'privacy_changes', 'super_admin_permissions'
    );

  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '  PRODUCTION READINESS CHECK - PHASE 1 RLS SECURITY';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Total tables in public schema: %', total_tables;
  RAISE NOTICE 'Tables WITH RLS: %', tables_with_rls;
  RAISE NOTICE 'Tables WITHOUT RLS: %', tables_without_rls;
  RAISE NOTICE 'RLS Coverage: %%%', ROUND(100.0 * tables_with_rls / total_tables, 1);
  RAISE NOTICE '';

  IF critical_exposed > 0 THEN
    RAISE NOTICE '🚨 CRITICAL: % critical tables still EXPOSED!', critical_exposed;
    RAISE NOTICE '';
    RAISE NOTICE '❌ PRODUCTION READINESS: FAILED';
    RAISE NOTICE '   Cannot deploy to production with exposed PII tables!';
    RAISE EXCEPTION 'BLOCKING: Critical tables without RLS protection';
  END IF;

  IF tables_without_rls > 0 THEN
    RAISE NOTICE '⚠️  WARNING: % non-critical tables without RLS', tables_without_rls;
    RAISE NOTICE '   These may be acceptable (system tables, junctions, etc.)';
    RAISE NOTICE '';
  END IF;

  IF tables_without_rls = 0 THEN
    RAISE NOTICE '✅ EXCELLENT: 100%% RLS coverage achieved!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ PRODUCTION READINESS: PHASE 1 COMPLETE';
    RAISE NOTICE '   Database is now safe for production deployment.';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  - Review Phase 2 (schema cleanup) plan';
    RAISE NOTICE '  - Test with all user roles';
    RAISE NOTICE '  - Monitor trigger execution logs';
  ELSIF critical_exposed = 0 THEN
    RAISE NOTICE '✅ PRODUCTION READINESS: MINIMALLY VIABLE';
    RAISE NOTICE '   Critical PII tables are secured.';
    RAISE NOTICE '   Recommend securing remaining % tables before production.', tables_without_rls;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;
