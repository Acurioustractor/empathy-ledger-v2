-- Migration: Enable RLS on organization-related tables
-- Created: 2026-01-12
-- Author: Database Production Readiness Review
-- Priority: BLOCKING - Organization analytics and enrichment data exposed

-- These tables contain organization-specific analytics, enrichment data,
-- and network information that should be restricted to organization members.

BEGIN;

-- ====================
-- ORGANIZATION ANALYTICS
-- ====================

-- organization_analytics: Analytics for organizations
ALTER TABLE IF EXISTS public.organization_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view their org analytics"
  ON public.organization_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.profile_id = auth.uid()
        AND om.organization_id = organization_analytics.organization_id
    )
  );

CREATE POLICY "Super admins can view all org analytics"
  ON public.organization_analytics
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_permissions
      WHERE profile_id = auth.uid() AND is_active = TRUE
    )
  );

-- organization_theme_analytics: Theme analysis per org
ALTER TABLE IF EXISTS public.organization_theme_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view their org theme analytics"
  ON public.organization_theme_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.profile_id = auth.uid()
        AND om.organization_id = organization_theme_analytics.organization_id
    )
  );

-- ====================
-- ORGANIZATION ENRICHMENT & METADATA
-- ====================

-- organization_enrichment: Enriched org data (AI analysis, etc.)
ALTER TABLE IF EXISTS public.organization_enrichment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view their org enrichment"
  ON public.organization_enrichment
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.profile_id = auth.uid()
        AND om.organization_id = organization_enrichment.organization_id
    )
  );

CREATE POLICY "Super admins can manage org enrichment"
  ON public.organization_enrichment
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_permissions
      WHERE profile_id = auth.uid() AND is_active = TRUE
    )
  );

-- ====================
-- ORGANIZATION NETWORK DATA
-- ====================

-- organization_storyteller_network: Network relationships
ALTER TABLE IF EXISTS public.organization_storyteller_network ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view their network"
  ON public.organization_storyteller_network
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.profile_id = auth.uid()
        AND om.organization_id = organization_storyteller_network.organization_id
    )
  );

-- ====================
-- PROJECT ANALYTICS
-- ====================

-- project_analytics: Project-level analytics
ALTER TABLE IF EXISTS public.project_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project members can view project analytics"
  ON public.project_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_storytellers ps
      JOIN projects p ON p.id = ps.project_id
      WHERE ps.storyteller_id = auth.uid()
        AND p.id = project_analytics.project_id
    )
  );

CREATE POLICY "Org admins can view their org project analytics"
  ON public.project_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = project_analytics.project_id
        AND om.profile_id = auth.uid()
        AND om.role IN ('admin', 'elder', 'cultural_advisor', 'board_member')
    )
  );

-- ====================
-- PLATFORM ANALYTICS (System-wide)
-- ====================

-- platform_analytics: Platform-wide analytics
ALTER TABLE IF EXISTS public.platform_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view platform analytics"
  ON public.platform_analytics
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_permissions
      WHERE profile_id = auth.uid() AND is_active = TRUE
    )
  );

-- ====================
-- PARTNER ANALYTICS
-- ====================

-- partner_analytics_daily: Daily partner metrics
ALTER TABLE IF EXISTS public.partner_analytics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view their own analytics via project"
  ON public.partner_analytics_daily
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = partner_analytics_daily.project_id
        AND om.profile_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can view all partner analytics"
  ON public.partner_analytics_daily
  FOR SELECT
  TO authenticated
  USING (
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
  table_record RECORD;
  tables_checked INTEGER := 0;
  tables_secured INTEGER := 0;
BEGIN
  FOR table_record IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN (
        'organization_analytics',
        'organization_theme_analytics',
        'organization_enrichment',
        'organization_storyteller_network',
        'project_analytics',
        'platform_analytics',
        'partner_analytics_daily'
      )
  LOOP
    tables_checked := tables_checked + 1;

    IF EXISTS (
      SELECT 1 FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename = table_record.tablename
        AND rowsecurity = TRUE
    ) THEN
      tables_secured := tables_secured + 1;
      RAISE NOTICE 'SUCCESS: RLS enabled on %', table_record.tablename;
    ELSE
      RAISE WARNING 'FAILED: RLS not enabled on %', table_record.tablename;
    END IF;
  END LOOP;

  RAISE NOTICE 'Organization tables secured: % of %', tables_secured, tables_checked;

  IF tables_secured < tables_checked THEN
    RAISE EXCEPTION 'CRITICAL: Not all organization tables have RLS enabled!';
  END IF;
END $$;

COMMIT;

-- Down Migration (for rollback)
--
-- BEGIN;
-- DROP POLICY IF EXISTS "Org members can view their org analytics" ON public.organization_analytics;
-- DROP POLICY IF EXISTS "Super admins can view all org analytics" ON public.organization_analytics;
-- ALTER TABLE IF EXISTS public.organization_analytics DISABLE ROW LEVEL SECURITY;
--
-- ... (repeat for all tables)
-- COMMIT;
