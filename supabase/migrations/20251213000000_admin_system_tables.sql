-- Migration: Admin System Tables
-- Adds tables for activity tracking, messaging, and admin features

-- ============================================
-- 0. ENSURE SUPER_ADMIN COLUMN EXISTS
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'super_admin'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN super_admin BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- ============================================
-- 1. ACTIVITY LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Who did it
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT, -- Cached for display
  user_role TEXT, -- admin, storyteller, elder, system

  -- What happened
  action TEXT NOT NULL, -- created, updated, deleted, approved, rejected, uploaded, etc.
  action_category TEXT NOT NULL, -- story, transcript, media, consent, user, organization, system

  -- What was affected
  entity_type TEXT NOT NULL, -- story, transcript, media_asset, profile, organization, etc.
  entity_id UUID,
  entity_title TEXT, -- Cached for display

  -- Details
  details JSONB DEFAULT '{}', -- Additional context
  changes JSONB DEFAULT '{}', -- Before/after for updates

  -- Organization context
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,

  -- Flags
  is_system_action BOOLEAN DEFAULT FALSE,
  requires_attention BOOLEAN DEFAULT FALSE,
  attention_resolved_at TIMESTAMPTZ,
  attention_resolved_by UUID REFERENCES auth.users(id)
);

-- Indexes for activity log
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action_category ON public.activity_log(action_category);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON public.activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_attention ON public.activity_log(requires_attention) WHERE requires_attention = TRUE;
CREATE INDEX IF NOT EXISTS idx_activity_log_organization ON public.activity_log(organization_id);

-- ============================================
-- 2. ADMIN MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Sender
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_name TEXT,

  -- Message content
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'announcement', -- announcement, update_request, recognition, action_required

  -- Targeting
  target_type TEXT NOT NULL, -- all, organization, project, individual, custom
  target_organization_id UUID REFERENCES public.organizations(id),
  target_project_id UUID,
  target_user_ids UUID[], -- For individual or custom targeting
  target_filter JSONB, -- Custom filter criteria

  -- Delivery
  channels TEXT[] DEFAULT ARRAY['in_app'], -- in_app, email, sms
  scheduled_at TIMESTAMPTZ, -- NULL = send immediately
  sent_at TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'draft', -- draft, scheduled, sending, sent, failed
  recipient_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,

  -- Template variables
  template_vars JSONB DEFAULT '{}'
);

-- Indexes for admin messages
CREATE INDEX IF NOT EXISTS idx_admin_messages_status ON public.admin_messages(status);
CREATE INDEX IF NOT EXISTS idx_admin_messages_scheduled ON public.admin_messages(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admin_messages_sender ON public.admin_messages(sender_id);

-- ============================================
-- 3. MESSAGE RECIPIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.message_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.admin_messages(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Delivery status per channel
  in_app_delivered_at TIMESTAMPTZ,
  in_app_read_at TIMESTAMPTZ,
  email_sent_at TIMESTAMPTZ,
  email_opened_at TIMESTAMPTZ,
  sms_sent_at TIMESTAMPTZ,

  -- Errors
  delivery_error TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(message_id, recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_message_recipients_message ON public.message_recipients(message_id);
CREATE INDEX IF NOT EXISTS idx_message_recipients_recipient ON public.message_recipients(recipient_id);

-- ============================================
-- 4. AI ANALYSIS JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- What to analyze
  job_type TEXT NOT NULL, -- transcript, story, batch_themes, site_refresh, storyteller_bio
  entity_type TEXT,
  entity_id UUID,

  -- Scheduling
  priority INTEGER DEFAULT 5, -- 1 = highest, 10 = lowest
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),

  -- Status
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed, cancelled
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Results
  result JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  -- Context
  triggered_by UUID REFERENCES auth.users(id),
  trigger_reason TEXT -- manual, new_content, scheduled, stale_refresh
);

CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON public.ai_analysis_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_scheduled ON public.ai_analysis_jobs(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_ai_jobs_entity ON public.ai_analysis_jobs(entity_type, entity_id);

-- ============================================
-- 5. PLATFORM STATS CACHE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.platform_stats_cache (
  id TEXT PRIMARY KEY, -- 'global' or organization_id
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Counts
  total_stories INTEGER DEFAULT 0,
  total_storytellers INTEGER DEFAULT 0,
  total_organizations INTEGER DEFAULT 0,
  total_projects INTEGER DEFAULT 0,
  total_transcripts INTEGER DEFAULT 0,
  total_media_assets INTEGER DEFAULT 0,

  -- Recent activity
  stories_last_7_days INTEGER DEFAULT 0,
  stories_last_30_days INTEGER DEFAULT 0,
  active_users_last_7_days INTEGER DEFAULT 0,
  active_users_last_30_days INTEGER DEFAULT 0,

  -- Analysis coverage
  stories_with_analysis INTEGER DEFAULT 0,
  analysis_coverage_percent DECIMAL(5,2) DEFAULT 0,
  stale_analysis_count INTEGER DEFAULT 0,

  -- Storage
  total_storage_bytes BIGINT DEFAULT 0,

  -- Theme trends (top 10)
  theme_trends JSONB DEFAULT '[]',

  -- Pending items
  pending_reviews INTEGER DEFAULT 0,
  pending_elder_reviews INTEGER DEFAULT 0,
  failed_uploads INTEGER DEFAULT 0,

  -- Health indicators
  ai_jobs_pending INTEGER DEFAULT 0,
  ai_jobs_failed_24h INTEGER DEFAULT 0,
  webhook_failures_24h INTEGER DEFAULT 0
);

-- ============================================
-- 6. MEDIA IMPORT SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.media_import_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Who's importing
  user_id UUID NOT NULL REFERENCES auth.users(id),
  organization_id UUID REFERENCES public.organizations(id),

  -- Status
  status TEXT DEFAULT 'pending', -- pending, processing, grouping, ready, completed, cancelled

  -- Files uploaded
  files JSONB DEFAULT '[]', -- Array of {filename, size, type, hash, uploaded_at, media_asset_id}

  -- Auto-grouped stories
  grouped_stories JSONB DEFAULT '[]', -- Array of {title, files[], storyteller_name, suggested_title}

  -- Results
  stories_created INTEGER DEFAULT 0,
  media_linked INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_import_sessions_user ON public.media_import_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_import_sessions_status ON public.media_import_sessions(status);

-- ============================================
-- 7. TITLE SUGGESTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.title_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- What it's for
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  transcript_id UUID,

  -- Suggestions
  suggestions JSONB NOT NULL, -- Array of {title, type, confidence, source_quote}
  selected_title TEXT,
  selected_at TIMESTAMPTZ,
  selected_by UUID REFERENCES auth.users(id),

  -- Status
  status TEXT DEFAULT 'pending' -- pending, selected, dismissed
);

CREATE INDEX IF NOT EXISTS idx_title_suggestions_story ON public.title_suggestions(story_id);

-- ============================================
-- 8. UPDATE PLATFORM STATS FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_platform_stats()
RETURNS void AS $$
BEGIN
  INSERT INTO platform_stats_cache (id, updated_at,
    total_stories, total_storytellers, total_organizations, total_projects,
    stories_last_7_days, stories_last_30_days,
    pending_reviews, pending_elder_reviews)
  VALUES (
    'global',
    NOW(),
    (SELECT COUNT(*) FROM stories WHERE status != 'deleted'),
    (SELECT COUNT(*) FROM profiles WHERE is_storyteller = true),
    (SELECT COUNT(*) FROM organizations WHERE status = 'active'),
    (SELECT COUNT(*) FROM projects WHERE status = 'active'),
    (SELECT COUNT(*) FROM stories WHERE created_at > NOW() - INTERVAL '7 days'),
    (SELECT COUNT(*) FROM stories WHERE created_at > NOW() - INTERVAL '30 days'),
    (SELECT COUNT(*) FROM stories WHERE status = 'review'),
    (SELECT COUNT(*) FROM elder_review_queue WHERE status = 'pending')
  )
  ON CONFLICT (id) DO UPDATE SET
    updated_at = NOW(),
    total_stories = EXCLUDED.total_stories,
    total_storytellers = EXCLUDED.total_storytellers,
    total_organizations = EXCLUDED.total_organizations,
    total_projects = EXCLUDED.total_projects,
    stories_last_7_days = EXCLUDED.stories_last_7_days,
    stories_last_30_days = EXCLUDED.stories_last_30_days,
    pending_reviews = EXCLUDED.pending_reviews,
    pending_elder_reviews = EXCLUDED.pending_elder_reviews;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. LOG ACTIVITY FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_user_name TEXT,
  p_user_role TEXT,
  p_action TEXT,
  p_action_category TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_entity_title TEXT,
  p_details JSONB DEFAULT '{}',
  p_organization_id UUID DEFAULT NULL,
  p_requires_attention BOOLEAN DEFAULT FALSE
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO activity_log (
    user_id, user_name, user_role, action, action_category,
    entity_type, entity_id, entity_title, details, organization_id, requires_attention
  ) VALUES (
    p_user_id, p_user_name, p_user_role, p_action, p_action_category,
    p_entity_type, p_entity_id, p_entity_title, p_details, p_organization_id, p_requires_attention
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. RLS POLICIES
-- ============================================

-- Activity Log - Admins can see all, users see their own
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all activity" ON public.activity_log;
CREATE POLICY "Admins can view all activity" ON public.activity_log
FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND COALESCE(super_admin, false) = true)
);

DROP POLICY IF EXISTS "Users can view their own activity" ON public.activity_log;
CREATE POLICY "Users can view their own activity" ON public.activity_log
FOR SELECT USING (user_id = auth.uid());

-- Admin Messages - Only admins can create/view
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage messages" ON public.admin_messages;
CREATE POLICY "Admins can manage messages" ON public.admin_messages
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND COALESCE(super_admin, false) = true)
);

-- Message Recipients - Users can see messages sent to them
ALTER TABLE public.message_recipients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their messages" ON public.message_recipients;
CREATE POLICY "Users can view their messages" ON public.message_recipients
FOR SELECT USING (recipient_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage recipients" ON public.message_recipients;
CREATE POLICY "Admins can manage recipients" ON public.message_recipients
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND COALESCE(super_admin, false) = true)
);

-- Platform Stats - Everyone can read
ALTER TABLE public.platform_stats_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read stats" ON public.platform_stats_cache;
CREATE POLICY "Anyone can read stats" ON public.platform_stats_cache
FOR SELECT USING (true);

-- AI Jobs - Admins only
ALTER TABLE public.ai_analysis_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage AI jobs" ON public.ai_analysis_jobs;
CREATE POLICY "Admins can manage AI jobs" ON public.ai_analysis_jobs
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND COALESCE(super_admin, false) = true)
);

-- Import Sessions - Users can see their own
ALTER TABLE public.media_import_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their imports" ON public.media_import_sessions;
CREATE POLICY "Users can manage their imports" ON public.media_import_sessions
FOR ALL USING (user_id = auth.uid());

-- Title Suggestions - Story owners and admins
ALTER TABLE public.title_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Story owners can manage suggestions" ON public.title_suggestions;
CREATE POLICY "Story owners can manage suggestions" ON public.title_suggestions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM stories s
    WHERE s.id = story_id
    AND (s.author_id = auth.uid() OR s.storyteller_id = auth.uid())
  )
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND COALESCE(super_admin, false) = true)
);

-- Grant service role access
GRANT ALL ON public.activity_log TO service_role;
GRANT ALL ON public.admin_messages TO service_role;
GRANT ALL ON public.message_recipients TO service_role;
GRANT ALL ON public.ai_analysis_jobs TO service_role;
GRANT ALL ON public.platform_stats_cache TO service_role;
GRANT ALL ON public.media_import_sessions TO service_role;
GRANT ALL ON public.title_suggestions TO service_role;
