-- Migration: Enable RLS on internal/system tables (MINIMAL - only existing tables)
-- Created: 2026-01-12
-- Author: Database Production Readiness Review
-- Priority: BLOCKING - System tables exposed

BEGIN;

-- ====================
-- PROCESSING JOBS (exists)
-- ====================

ALTER TABLE IF EXISTS public.processing_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all processing jobs"
  ON public.processing_jobs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_permissions
      WHERE profile_id = auth.uid() AND is_active = TRUE
    )
  );

-- ====================
-- SUPER ADMIN PERMISSIONS (exists)
-- ====================

ALTER TABLE IF EXISTS public.super_admin_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view all permissions"
  ON public.super_admin_permissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_permissions sap
      WHERE sap.profile_id = auth.uid() AND sap.is_active = TRUE
    )
  );

CREATE POLICY "Users can view own super admin status"
  ON public.super_admin_permissions
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- ====================
-- SUPER ADMIN AUDIT LOG (exists)
-- ====================

ALTER TABLE IF EXISTS public.super_admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view audit log"
  ON public.super_admin_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_permissions
      WHERE profile_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Super admins can insert audit entries"
  ON public.super_admin_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM super_admin_permissions
      WHERE profile_id = auth.uid() AND is_active = TRUE
    )
  );

-- ====================
-- VERIFICATION
-- ====================

DO $$
DECLARE
  tables_secured INTEGER := 0;
BEGIN
  -- Count how many of our target tables are secured
  SELECT COUNT(*) INTO tables_secured
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN ('processing_jobs', 'super_admin_permissions', 'super_admin_audit_log')
    AND rowsecurity = TRUE;

  RAISE NOTICE 'Internal/system tables secured: %', tables_secured;

  IF tables_secured >= 3 THEN
    RAISE NOTICE 'SUCCESS: Critical internal tables have RLS enabled';
  ELSE
    RAISE WARNING 'Some internal tables missing RLS (may not exist)';
  END IF;
END $$;

COMMIT;
