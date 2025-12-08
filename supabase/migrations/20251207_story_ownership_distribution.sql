-- Story Ownership, Distribution & Revocation System
-- Phase 1: Foundation Database Schema
-- Implements: Distribution tracking, embed tokens, audit logs, GDPR compliance

-- ============================================================================
-- STORY TABLE EXTENSIONS
-- Add ownership, distribution control, and GDPR fields to existing stories table
-- ============================================================================

-- Soft delete / archive support
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES auth.users(id);
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS archive_reason TEXT;

-- Distribution control
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS embeds_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS sharing_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS allowed_embed_domains TEXT[];

-- Consent withdrawal tracking
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS consent_withdrawn_at TIMESTAMPTZ;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS consent_withdrawal_reason TEXT;

-- GDPR anonymization
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS anonymization_status TEXT CHECK (anonymization_status IN ('none', 'pending', 'partial', 'full'));
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS anonymization_requested_at TIMESTAMPTZ;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS anonymized_fields JSONB;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS original_author_display TEXT;

-- Provenance tracking (database-only, blockchain deferred)
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS ownership_status TEXT DEFAULT 'owned' CHECK (ownership_status IN ('owned', 'transferred', 'shared', 'disputed'));
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS original_author_id UUID REFERENCES auth.users(id);
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS ownership_transferred_at TIMESTAMPTZ;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS provenance_chain JSONB DEFAULT '[]';

-- ============================================================================
-- STORY DISTRIBUTIONS TABLE
-- Track where stories have been shared/embedded externally
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.story_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,

  -- Distribution details
  platform TEXT NOT NULL CHECK (platform IN ('embed', 'twitter', 'facebook', 'linkedin', 'website', 'blog', 'api', 'rss', 'newsletter', 'custom')),
  platform_post_id TEXT,                    -- External platform's post ID for API takedowns
  distribution_url TEXT,                     -- Where the story was shared
  embed_domain TEXT,                         -- For embeds: the domain hosting the embed

  -- Status tracking
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired', 'pending', 'failed')),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users(id),
  revocation_reason TEXT,

  -- Analytics
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  click_count INTEGER DEFAULT 0,

  -- Consent tracking (snapshot at distribution time)
  consent_version TEXT,
  consent_snapshot JSONB,

  -- Webhook integration for revocation notifications
  webhook_url TEXT,
  webhook_secret TEXT,
  webhook_notified_at TIMESTAMPTZ,
  webhook_response JSONB,
  webhook_retry_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',

  -- Distribution notes (for manual tracking)
  notes TEXT,

  -- Expiration support
  expires_at TIMESTAMPTZ
);

-- Indexes for story_distributions
CREATE INDEX IF NOT EXISTS idx_story_distributions_story_id ON public.story_distributions(story_id);
CREATE INDEX IF NOT EXISTS idx_story_distributions_tenant_id ON public.story_distributions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_story_distributions_status ON public.story_distributions(status);
CREATE INDEX IF NOT EXISTS idx_story_distributions_platform ON public.story_distributions(platform);
CREATE INDEX IF NOT EXISTS idx_story_distributions_embed_domain ON public.story_distributions(embed_domain);
CREATE INDEX IF NOT EXISTS idx_story_distributions_created_at ON public.story_distributions(created_at DESC);

-- ============================================================================
-- EMBED TOKENS TABLE
-- Secure tokens for embed API access with domain restrictions
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.embed_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,

  -- Token details
  token TEXT UNIQUE NOT NULL,
  token_hash TEXT NOT NULL,                  -- For secure lookups (SHA-256)

  -- Access control
  allowed_domains TEXT[],                    -- Domains that can use this embed
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  expires_at TIMESTAMPTZ,

  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  last_used_domain TEXT,
  last_used_ip INET,

  -- Revocation
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users(id),
  revocation_reason TEXT,

  -- Settings
  allow_analytics BOOLEAN DEFAULT true,
  show_attribution BOOLEAN DEFAULT true,
  custom_styles JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- Link to distribution record
  distribution_id UUID REFERENCES public.story_distributions(id) ON DELETE SET NULL
);

-- Indexes for embed_tokens
CREATE INDEX IF NOT EXISTS idx_embed_tokens_story_id ON public.embed_tokens(story_id);
CREATE INDEX IF NOT EXISTS idx_embed_tokens_token_hash ON public.embed_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_embed_tokens_status ON public.embed_tokens(status);
CREATE INDEX IF NOT EXISTS idx_embed_tokens_tenant_id ON public.embed_tokens(tenant_id);

-- ============================================================================
-- AUDIT LOGS TABLE
-- Comprehensive audit trail for story ownership, distribution, and revocation
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,

  -- What was affected
  entity_type TEXT NOT NULL CHECK (entity_type IN ('story', 'distribution', 'embed_token', 'consent', 'media', 'profile', 'deletion_request')),
  entity_id UUID NOT NULL,

  -- What happened
  action TEXT NOT NULL CHECK (action IN (
    'create', 'update', 'delete', 'archive', 'restore',
    'share', 'revoke', 'view', 'download', 'embed',
    'consent_grant', 'consent_withdraw', 'consent_update',
    'anonymize', 'export', 'transfer_ownership',
    'token_generate', 'token_revoke', 'token_use',
    'webhook_send', 'webhook_fail',
    'elder_review_request', 'elder_review_complete'
  )),
  action_category TEXT CHECK (action_category IN ('ownership', 'distribution', 'consent', 'access', 'revocation', 'gdpr', 'cultural')),

  -- Who did it
  actor_id UUID REFERENCES auth.users(id),
  actor_type TEXT CHECK (actor_type IN ('user', 'system', 'webhook', 'api', 'cron', 'admin')),
  actor_ip INET,
  actor_user_agent TEXT,

  -- Change details
  previous_state JSONB,
  new_state JSONB,
  change_summary TEXT,
  change_diff JSONB,                         -- Specific fields that changed

  -- Context
  related_entity_type TEXT,
  related_entity_id UUID,
  request_id TEXT,                           -- For correlating related log entries
  session_id TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON public.audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON public.audit_logs(action_category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_request_id ON public.audit_logs(request_id);

-- ============================================================================
-- DELETION REQUESTS TABLE (GDPR Compliance)
-- Track data deletion/anonymization requests
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  tenant_id UUID NOT NULL,

  -- Request details
  request_type TEXT NOT NULL CHECK (request_type IN ('anonymize_story', 'anonymize_profile', 'delete_account', 'export_data', 'delete_specific')),
  scope JSONB,                               -- What to delete/anonymize (story_ids, etc.)
  reason TEXT,

  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'processing', 'completed', 'failed', 'cancelled')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  processing_started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Processing details
  items_total INTEGER DEFAULT 0,
  items_processed INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  processing_log JSONB DEFAULT '[]',
  error_message TEXT,

  -- Verification (email confirmation)
  verification_token TEXT,
  verification_expires_at TIMESTAMPTZ,
  verification_attempts INTEGER DEFAULT 0,

  -- Completion
  completion_report JSONB,                   -- Summary of what was deleted/anonymized
  data_export_url TEXT,                      -- For export requests
  data_export_expires_at TIMESTAMPTZ,

  -- Audit
  processed_by UUID REFERENCES auth.users(id),
  admin_notes TEXT,

  -- Timestamps
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for deletion_requests
CREATE INDEX IF NOT EXISTS idx_deletion_requests_user_id ON public.deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_tenant_id ON public.deletion_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON public.deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_type ON public.deletion_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_created ON public.deletion_requests(requested_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE public.story_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embed_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;

-- Story Distributions Policies
CREATE POLICY "Users can view distributions for their own stories"
  ON public.story_distributions FOR SELECT
  USING (
    story_id IN (
      SELECT id FROM public.stories
      WHERE author_id = auth.uid() OR storyteller_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage distributions for their own stories"
  ON public.story_distributions FOR ALL
  USING (
    story_id IN (
      SELECT id FROM public.stories
      WHERE author_id = auth.uid() OR storyteller_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all distributions"
  ON public.story_distributions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('platform_admin', 'organization_admin')
    )
  );

-- Embed Tokens Policies
CREATE POLICY "Users can view tokens for their own stories"
  ON public.embed_tokens FOR SELECT
  USING (
    story_id IN (
      SELECT id FROM public.stories
      WHERE author_id = auth.uid() OR storyteller_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage tokens for their own stories"
  ON public.embed_tokens FOR ALL
  USING (
    story_id IN (
      SELECT id FROM public.stories
      WHERE author_id = auth.uid() OR storyteller_id = auth.uid()
    )
  );

-- Audit Logs Policies (read-only for users, full for admins)
CREATE POLICY "Users can view audit logs for their own entities"
  ON public.audit_logs FOR SELECT
  USING (
    actor_id = auth.uid() OR
    entity_id IN (
      SELECT id FROM public.stories WHERE author_id = auth.uid() OR storyteller_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('platform_admin', 'organization_admin')
    )
  );

-- Deletion Requests Policies
CREATE POLICY "Users can view their own deletion requests"
  ON public.deletion_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own deletion requests"
  ON public.deletion_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all deletion requests"
  ON public.deletion_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'platform_admin'
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_story_distributions_updated_at
  BEFORE UPDATE ON public.story_distributions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_embed_tokens_updated_at
  BEFORE UPDATE ON public.embed_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deletion_requests_updated_at
  BEFORE UPDATE ON public.deletion_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to increment distribution view count
CREATE OR REPLACE FUNCTION public.increment_distribution_view(distribution_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.story_distributions
  SET
    view_count = view_count + 1,
    last_viewed_at = NOW()
  WHERE id = distribution_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment embed token usage
CREATE OR REPLACE FUNCTION public.increment_embed_usage(p_token_hash TEXT, p_domain TEXT, p_ip INET)
RETURNS UUID AS $$
DECLARE
  v_token_id UUID;
BEGIN
  UPDATE public.embed_tokens
  SET
    usage_count = usage_count + 1,
    last_used_at = NOW(),
    last_used_domain = p_domain,
    last_used_ip = p_ip
  WHERE token_hash = p_token_hash AND status = 'active'
  RETURNING id INTO v_token_id;

  RETURN v_token_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if embed token is valid
CREATE OR REPLACE FUNCTION public.validate_embed_token(p_token_hash TEXT, p_domain TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  story_id UUID,
  token_id UUID,
  error_message TEXT
) AS $$
DECLARE
  v_token RECORD;
BEGIN
  SELECT * INTO v_token
  FROM public.embed_tokens
  WHERE token_hash = p_token_hash;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::UUID, 'Token not found';
    RETURN;
  END IF;

  IF v_token.status != 'active' THEN
    RETURN QUERY SELECT false, v_token.story_id, v_token.id, 'Token is ' || v_token.status;
    RETURN;
  END IF;

  IF v_token.expires_at IS NOT NULL AND v_token.expires_at < NOW() THEN
    RETURN QUERY SELECT false, v_token.story_id, v_token.id, 'Token has expired';
    RETURN;
  END IF;

  IF v_token.allowed_domains IS NOT NULL AND array_length(v_token.allowed_domains, 1) > 0 THEN
    IF NOT (p_domain = ANY(v_token.allowed_domains)) THEN
      RETURN QUERY SELECT false, v_token.story_id, v_token.id, 'Domain not allowed';
      RETURN;
    END IF;
  END IF;

  RETURN QUERY SELECT true, v_token.story_id, v_token.id, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke all distributions for a story
CREATE OR REPLACE FUNCTION public.revoke_all_story_distributions(
  p_story_id UUID,
  p_revoked_by UUID,
  p_reason TEXT DEFAULT 'Story revoked by owner'
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.story_distributions
  SET
    status = 'revoked',
    revoked_at = NOW(),
    revoked_by = p_revoked_by,
    revocation_reason = p_reason
  WHERE story_id = p_story_id AND status = 'active';

  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- Also revoke all embed tokens
  UPDATE public.embed_tokens
  SET
    status = 'revoked',
    revoked_at = NOW(),
    revoked_by = p_revoked_by,
    revocation_reason = p_reason
  WHERE story_id = p_story_id AND status = 'active';

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to archive a story (soft delete)
CREATE OR REPLACE FUNCTION public.archive_story(
  p_story_id UUID,
  p_archived_by UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.stories
  SET
    is_archived = true,
    archived_at = NOW(),
    archived_by = p_archived_by,
    archive_reason = p_reason,
    status = 'archived'
  WHERE id = p_story_id AND (author_id = p_archived_by OR storyteller_id = p_archived_by);

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Revoke all distributions
  PERFORM public.revoke_all_story_distributions(p_story_id, p_archived_by, 'Story archived');

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore an archived story
CREATE OR REPLACE FUNCTION public.restore_story(p_story_id UUID, p_restored_by UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.stories
  SET
    is_archived = false,
    archived_at = NULL,
    archived_by = NULL,
    archive_reason = NULL,
    status = 'draft' -- Return to draft status for review
  WHERE id = p_story_id
    AND is_archived = true
    AND (author_id = p_restored_by OR storyteller_id = p_restored_by);

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.story_distributions IS 'Tracks where stories have been distributed externally (embeds, social media, websites)';
COMMENT ON TABLE public.embed_tokens IS 'Secure tokens for authorizing embed API access with domain restrictions';
COMMENT ON TABLE public.audit_logs IS 'Comprehensive audit trail for all ownership, distribution, and consent actions';
COMMENT ON TABLE public.deletion_requests IS 'GDPR compliance: tracks data deletion and anonymization requests';

COMMENT ON COLUMN public.stories.is_archived IS 'Soft delete flag - archived stories are hidden but not deleted';
COMMENT ON COLUMN public.stories.embeds_enabled IS 'Whether embeds are allowed for this story';
COMMENT ON COLUMN public.stories.allowed_embed_domains IS 'List of domains allowed to embed this story (empty = all allowed)';
COMMENT ON COLUMN public.stories.anonymization_status IS 'GDPR anonymization status: none, pending, partial, full';
COMMENT ON COLUMN public.stories.provenance_chain IS 'JSON array tracking ownership history for audit trail';
