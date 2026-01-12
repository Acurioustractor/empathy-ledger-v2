-- Migration: Enable RLS on storyteller-related tables
-- Created: 2026-01-12
-- Author: Database Production Readiness Review
-- Priority: BLOCKING - Personal storyteller data exposed

-- These tables contain personal storyteller information, analytics,
-- demographics, and sensitive data that should be protected.

BEGIN;

-- ====================
-- STORYTELLER ANALYTICS & INSIGHTS
-- ====================

-- personal_insights: Private storyteller analytics and insights
ALTER TABLE IF EXISTS public.personal_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Storytellers can view own insights"
  ON public.personal_insights
  FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

CREATE POLICY "Super admins can view all insights"
  ON public.personal_insights
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_permissions
      WHERE profile_id = auth.uid() AND is_active = TRUE
    )
  );

-- storyteller_analytics: Analytics data for storytellers
ALTER TABLE IF EXISTS public.storyteller_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Storytellers can view own analytics"
  ON public.storyteller_analytics
  FOR ALL
  TO authenticated
  USING (auth.uid() = storyteller_id);

CREATE POLICY "Org admins can view storyteller analytics in their org"
  ON public.storyteller_analytics
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Super admins can manage all analytics"
  ON public.storyteller_analytics
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_permissions
      WHERE profile_id = auth.uid() AND is_active = TRUE
    )
  );

-- ====================
-- STORYTELLER DEMOGRAPHICS & PERSONAL DATA
-- ====================

-- storyteller_demographics: Sensitive demographic information
ALTER TABLE IF EXISTS public.storyteller_demographics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Storytellers can view own demographics"
  ON public.storyteller_demographics
  FOR ALL
  TO authenticated
  USING (auth.uid() = storyteller_id);

CREATE POLICY "Super admins can view demographics"
  ON public.storyteller_demographics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_permissions
      WHERE profile_id = auth.uid() AND is_active = TRUE
    )
  );

-- storyteller_locations: Personal location data
ALTER TABLE IF EXISTS public.storyteller_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Storytellers can manage own locations"
  ON public.storyteller_locations
  FOR ALL
  TO authenticated
  USING (auth.uid() = storyteller_id);

CREATE POLICY "Super admins can view locations"
  ON public.storyteller_locations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_permissions
      WHERE profile_id = auth.uid() AND is_active = TRUE
    )
  );

-- ====================
-- STORYTELLER DASHBOARD & CONFIG
-- ====================

-- storyteller_dashboard_config: User preferences and config
ALTER TABLE IF EXISTS public.storyteller_dashboard_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Storytellers can manage own dashboard config"
  ON public.storyteller_dashboard_config
  FOR ALL
  TO authenticated
  USING (auth.uid() = storyteller_id);

-- ====================
-- STORYTELLER ENGAGEMENT & METRICS
-- ====================

-- storyteller_engagement: Engagement tracking
ALTER TABLE IF EXISTS public.storyteller_engagement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Storytellers can view own engagement"
  ON public.storyteller_engagement
  FOR SELECT
  TO authenticated
  USING (auth.uid() = storyteller_id);

CREATE POLICY "Org admins can view engagement in their org"
  ON public.storyteller_engagement
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- storyteller_impact_metrics: Impact measurement data
ALTER TABLE IF EXISTS public.storyteller_impact_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Storytellers can view own impact metrics"
  ON public.storyteller_impact_metrics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = storyteller_id);

CREATE POLICY "Org admins can view impact metrics in their org"
  ON public.storyteller_impact_metrics
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- ====================
-- STORYTELLER MILESTONES & ACHIEVEMENTS
-- ====================

-- storyteller_milestones: Personal milestones
ALTER TABLE IF EXISTS public.storyteller_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Storytellers can manage own milestones"
  ON public.storyteller_milestones
  FOR ALL
  TO authenticated
  USING (auth.uid() = storyteller_id);

-- ====================
-- STORYTELLER QUOTES (being deprecated, but secure for now)
-- ====================

-- storyteller_quotes: Quote storage (being replaced by extracted_quotes)
ALTER TABLE IF EXISTS public.storyteller_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Storytellers can view own quotes"
  ON public.storyteller_quotes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = storyteller_id);

CREATE POLICY "Public can view public quotes"
  ON public.storyteller_quotes
  FOR SELECT
  TO authenticated
  USING (is_public = TRUE);

-- ====================
-- STORYTELLER PAYOUTS (SENSITIVE FINANCIAL DATA)
-- ====================

-- storyteller_payouts: Financial information - HIGHLY SENSITIVE
ALTER TABLE IF EXISTS public.storyteller_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Storytellers can view own payouts"
  ON public.storyteller_payouts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = storyteller_id);

CREATE POLICY "Super admins can manage payouts"
  ON public.storyteller_payouts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_permissions
      WHERE profile_id = auth.uid() AND is_active = TRUE
    )
  );

-- ====================
-- STORYTELLER RECOMMENDATIONS
-- ====================

-- storyteller_recommendations: AI-generated recommendations
ALTER TABLE IF EXISTS public.storyteller_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Storytellers can view own recommendations"
  ON public.storyteller_recommendations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = storyteller_id);

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
        'personal_insights',
        'storyteller_analytics',
        'storyteller_demographics',
        'storyteller_locations',
        'storyteller_dashboard_config',
        'storyteller_engagement',
        'storyteller_impact_metrics',
        'storyteller_milestones',
        'storyteller_quotes',
        'storyteller_payouts',
        'storyteller_recommendations'
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

  RAISE NOTICE 'Storyteller tables secured: % of %', tables_secured, tables_checked;

  IF tables_secured < tables_checked THEN
    RAISE EXCEPTION 'CRITICAL: Not all storyteller tables have RLS enabled!';
  END IF;
END $$;

COMMIT;

-- Down Migration (for rollback)
--
-- BEGIN;
-- DROP POLICY IF EXISTS "Storytellers can view own insights" ON public.personal_insights;
-- DROP POLICY IF EXISTS "Super admins can view all insights" ON public.personal_insights;
-- ALTER TABLE IF EXISTS public.personal_insights DISABLE ROW LEVEL SECURITY;
--
-- DROP POLICY IF EXISTS "Storytellers can view own analytics" ON public.storyteller_analytics;
-- DROP POLICY IF EXISTS "Org admins can view storyteller analytics in their org" ON public.storyteller_analytics;
-- DROP POLICY IF EXISTS "Super admins can manage all analytics" ON public.storyteller_analytics;
-- ALTER TABLE IF EXISTS public.storyteller_analytics DISABLE ROW LEVEL SECURITY;
--
-- ... (repeat for all tables)
-- COMMIT;
