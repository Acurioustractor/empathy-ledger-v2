-- Migration: Enable RLS on content tables
-- Created: 2026-01-12
-- Author: Database Production Readiness Review
-- Priority: BLOCKING - Content and media analysis data exposed

-- These tables contain articles, galleries, media analysis, and other
-- content that should respect privacy and organization boundaries.

BEGIN;

-- ====================
-- ARTICLES (being migrated to stories)
-- ====================

-- articles: Blog posts and articles
ALTER TABLE IF EXISTS public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published articles"
  ON public.articles
  FOR SELECT
  TO authenticated
  USING (status = 'published' AND visibility = 'public');

CREATE POLICY "Authors can manage own articles"
  ON public.articles
  FOR ALL
  TO authenticated
  USING (auth.uid() = author_storyteller_id);

CREATE POLICY "Super admins can manage all articles"
  ON public.articles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_permissions
      WHERE profile_id = auth.uid() AND is_active = TRUE
    )
  );

-- ====================
-- GALLERIES
-- ====================

-- galleries: Media collections
ALTER TABLE IF EXISTS public.galleries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view public galleries"
  ON public.galleries
  FOR SELECT
  TO authenticated
  USING (visibility = 'public');

CREATE POLICY "Gallery owners can manage own galleries"
  ON public.galleries
  FOR ALL
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Org members can view org galleries"
  ON public.galleries
  FOR SELECT
  TO authenticated
  USING (
    organization_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- ====================
-- MEDIA AI ANALYSIS
-- ====================

-- media_ai_analysis: AI analysis results for media
ALTER TABLE IF EXISTS public.media_ai_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media owners can view analysis of their media"
  ON public.media_ai_analysis
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM media_assets ma
      WHERE ma.id = media_ai_analysis.media_asset_id
        AND ma.uploader_id = auth.uid()
    )
  );

CREATE POLICY "Org admins can view media analysis in their org"
  ON public.media_ai_analysis
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM media_assets ma
      JOIN organization_members om ON om.organization_id = ma.organization_id
      WHERE ma.id = media_ai_analysis.media_asset_id
        AND om.profile_id = auth.uid()
        AND om.role IN ('admin', 'elder', 'cultural_advisor', 'board_member')
    )
  );

-- ====================
-- BLOG POSTS (being merged with articles)
-- ====================

-- blog_posts: Blog content (separate from articles)
ALTER TABLE IF EXISTS public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published blog posts"
  ON public.blog_posts
  FOR SELECT
  TO authenticated
  USING (published_at IS NOT NULL);

CREATE POLICY "Authors can manage own blog posts"
  ON public.blog_posts
  FOR ALL
  TO authenticated
  USING (auth.uid() = storyteller_id);

CREATE POLICY "Super admins can manage all blog posts"
  ON public.blog_posts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_permissions
      WHERE profile_id = auth.uid() AND is_active = TRUE
    )
  );

-- ====================
-- DEVELOPMENT PLANS (sensitive future roadmap data)
-- ====================

-- development_plans: Personal development plans for storytellers
ALTER TABLE IF EXISTS public.development_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own development plan"
  ON public.development_plans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own development plan"
  ON public.development_plans
  FOR ALL
  TO authenticated
  USING (auth.uid() = profile_id);

CREATE POLICY "Super admins can view all dev plans"
  ON public.development_plans
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_permissions
      WHERE profile_id = auth.uid() AND is_active = TRUE
    )
  );

-- ====================
-- PRIVACY CHANGES (audit log of privacy changes)
-- ====================

-- privacy_changes: Audit trail of privacy setting changes
ALTER TABLE IF EXISTS public.privacy_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own privacy changes"
  ON public.privacy_changes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all privacy changes"
  ON public.privacy_changes
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
        'articles',
        'galleries',
        'media_ai_analysis',
        'blog_posts',
        'development_plans',
        'privacy_changes'
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

  RAISE NOTICE 'Content tables secured: % of %', tables_secured, tables_checked;

  IF tables_secured < tables_checked THEN
    RAISE EXCEPTION 'CRITICAL: Not all content tables have RLS enabled!';
  END IF;
END $$;

COMMIT;

-- Down Migration (for rollback)
--
-- BEGIN;
-- DROP POLICY IF EXISTS "Public can view published articles" ON public.articles;
-- DROP POLICY IF EXISTS "Authors can manage own articles" ON public.articles;
-- DROP POLICY IF EXISTS "Org members can view org articles" ON public.articles;
-- DROP POLICY IF EXISTS "Super admins can manage all articles" ON public.articles;
-- ALTER TABLE IF EXISTS public.articles DISABLE ROW LEVEL SECURITY;
--
-- ... (repeat for all tables)
-- COMMIT;
