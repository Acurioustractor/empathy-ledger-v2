-- Syndication System Schema Migration
-- Created: January 2, 2026
-- Purpose: Enable storytellers to share content across ACT ecosystem sites with full sovereignty
-- Philosophy: OCAP principles, storyteller control, cultural safety, immediate revocation

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Table 1: syndication_sites
-- Purpose: Registry of approved external sites that can request syndicated content
-- ============================================================================

CREATE TABLE IF NOT EXISTS syndication_sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier (e.g., 'justicehub')
  name TEXT NOT NULL, -- Display name (e.g., 'JusticeHub')
  description TEXT NOT NULL, -- What this site is about
  purpose TEXT NOT NULL, -- Why storytellers should share here
  audience TEXT NOT NULL, -- Who will see the content

  -- Contact & Technical
  contact_email TEXT NOT NULL,
  contact_name TEXT,
  webhook_url TEXT, -- Where to send revocation/update notifications
  api_base_url TEXT, -- For verification checks

  -- Authentication
  api_key_hash TEXT NOT NULL, -- Hashed API key for authentication
  oauth_client_id TEXT, -- If using OAuth
  oauth_client_secret TEXT, -- Encrypted OAuth secret

  -- Configuration
  allowed_domains TEXT[] DEFAULT ARRAY[]::TEXT[], -- CORS whitelist
  rate_limit_per_hour INTEGER DEFAULT 1000,
  max_stories_per_request INTEGER DEFAULT 50,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'revoked')),
  suspended_reason TEXT,
  suspended_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID -- No auth schema,

  -- Tenant isolation
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_syndication_sites_tenant ON syndication_sites(organization_id);
CREATE INDEX idx_syndication_sites_status ON syndication_sites(status);
CREATE INDEX idx_syndication_sites_slug ON syndication_sites(slug);

-- ============================================================================
-- Table 2: syndication_consent
-- Purpose: Tracks storyteller approval for sharing content on specific sites
-- Philosophy: Per-story, per-site consent (not blanket approval)
-- ============================================================================

CREATE TABLE IF NOT EXISTS syndication_consent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES syndication_sites(id) ON DELETE CASCADE,
  storyteller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Consent Details
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'revoked', 'expired')),
  approved_at TIMESTAMPTZ,
  denied_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ, -- Optional expiration date

  -- Permissions (what the site can do)
  allow_full_content BOOLEAN DEFAULT true,
  allow_excerpt_only BOOLEAN DEFAULT false,
  allow_media_assets BOOLEAN DEFAULT true,
  allow_comments BOOLEAN DEFAULT false,
  allow_analytics BOOLEAN DEFAULT true,

  -- Revenue Share (future use)
  revenue_share_percentage DECIMAL(5,2) DEFAULT 15.00, -- Storyteller's % of attributed revenue

  -- Cultural Safety
  requires_elder_approval BOOLEAN DEFAULT false,
  elder_approved BOOLEAN DEFAULT false,
  elder_approved_by UUID -- No auth schema,
  elder_approved_at TIMESTAMPTZ,
  cultural_permission_level TEXT CHECK (cultural_permission_level IN ('public', 'community', 'restricted', 'sacred')),

  -- Request Context
  request_reason TEXT, -- Why the site wants this story
  requested_by UUID -- No auth schema, -- Who made the request
  requested_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique consent per story-site pair
  UNIQUE(story_id, site_id)
);

-- Indexes
CREATE INDEX idx_syndication_consent_story ON syndication_consent(story_id);
CREATE INDEX idx_syndication_consent_site ON syndication_consent(site_id);
CREATE INDEX idx_syndication_consent_storyteller ON syndication_consent(storyteller_id);
CREATE INDEX idx_syndication_consent_status ON syndication_consent(status);
CREATE INDEX idx_syndication_consent_tenant ON syndication_consent(organization_id);

-- ============================================================================
-- Table 3: embed_tokens
-- Purpose: Secure access tokens for external sites to fetch content
-- Philosophy: Time-limited, revocable, domain-restricted
-- ============================================================================

CREATE TABLE IF NOT EXISTS embed_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Token
  token TEXT UNIQUE NOT NULL, -- The actual token (UUID or JWT)
  token_type TEXT NOT NULL DEFAULT 'bearer' CHECK (token_type IN ('bearer', 'jwt')),

  -- Relationships
  consent_id UUID NOT NULL REFERENCES syndication_consent(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES syndication_sites(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Restrictions
  allowed_domains TEXT[] DEFAULT ARRAY[]::TEXT[], -- CORS whitelist
  allowed_ip_addresses TEXT[], -- Optional IP whitelist
  max_requests INTEGER DEFAULT 10000, -- Request limit
  requests_used INTEGER DEFAULT 0,

  -- Expiration
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),

  -- Status
  is_revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,

  -- Check expiration
  CONSTRAINT valid_expiration CHECK (expires_at > created_at)
);

-- Indexes
CREATE INDEX idx_embed_tokens_token ON embed_tokens(token);
CREATE INDEX idx_embed_tokens_consent ON embed_tokens(consent_id);
CREATE INDEX idx_embed_tokens_story ON embed_tokens(story_id);
CREATE INDEX idx_embed_tokens_site ON embed_tokens(site_id);
CREATE INDEX idx_embed_tokens_revoked ON embed_tokens(is_revoked);
CREATE INDEX idx_embed_tokens_expires ON embed_tokens(expires_at);

-- ============================================================================
-- Table 4: story_distributions
-- Purpose: Tracks where content is currently live (active distributions)
-- Philosophy: Real-time view of where stories are shared
-- ============================================================================

CREATE TABLE IF NOT EXISTS story_distributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES syndication_sites(id) ON DELETE CASCADE,
  consent_id UUID NOT NULL REFERENCES syndication_consent(id) ON DELETE CASCADE,
  embed_token_id UUID REFERENCES embed_tokens(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Distribution Details
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_removal', 'removed', 'failed')),
  distributed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at TIMESTAMPTZ,

  -- External URL (where the story lives on the external site)
  external_url TEXT,
  external_id TEXT, -- Site's internal ID for this story

  -- Engagement Metrics (aggregated from events)
  total_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,

  -- Verification
  last_verified_at TIMESTAMPTZ,
  verification_status TEXT CHECK (verification_status IN ('verified', 'unverified', 'failed')),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique distribution per story-site
  UNIQUE(story_id, site_id)
);

-- Indexes
CREATE INDEX idx_story_distributions_story ON story_distributions(story_id);
CREATE INDEX idx_story_distributions_site ON story_distributions(site_id);
CREATE INDEX idx_story_distributions_status ON story_distributions(status);
CREATE INDEX idx_story_distributions_tenant ON story_distributions(organization_id);

-- ============================================================================
-- Table 5: syndication_engagement_events
-- Purpose: Track individual engagement events from external sites
-- Philosophy: Transparency - storytellers see every view/click/share
-- ============================================================================

CREATE TABLE IF NOT EXISTS syndication_engagement_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES syndication_sites(id) ON DELETE CASCADE,
  distribution_id UUID REFERENCES story_distributions(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Event Details
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'share', 'comment', 'reaction')),
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Session Tracking (anonymized)
  session_id TEXT, -- Anonymized session identifier
  visitor_hash TEXT, -- Hash of IP + user agent (for unique visitor counting)

  -- Technical Context
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  country_code TEXT,

  -- Metadata
  metadata JSONB, -- Additional event-specific data

  -- Partitioning hint
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_engagement_events_story ON syndication_engagement_events(story_id);
CREATE INDEX idx_engagement_events_site ON syndication_engagement_events(site_id);
CREATE INDEX idx_engagement_events_type ON syndication_engagement_events(event_type);
CREATE INDEX idx_engagement_events_timestamp ON syndication_engagement_events(event_timestamp);
CREATE INDEX idx_engagement_events_created ON syndication_engagement_events(created_at);

-- ============================================================================
-- Table 6: syndication_webhook_events
-- Purpose: Log all webhook deliveries for debugging and compliance verification
-- Philosophy: Audit trail for revocation compliance
-- ============================================================================

CREATE TABLE IF NOT EXISTS syndication_webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  site_id UUID NOT NULL REFERENCES syndication_sites(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Event Details
  event_type TEXT NOT NULL CHECK (event_type IN ('content_revoked', 'content_updated', 'consent_approved', 'consent_denied')),
  webhook_url TEXT NOT NULL,

  -- Payload
  payload JSONB NOT NULL,
  signature TEXT NOT NULL, -- HMAC signature for verification

  -- Delivery Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed', 'retrying')),
  http_status_code INTEGER,
  response_body TEXT,
  error_message TEXT,

  -- Retry Logic
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 5,
  next_retry_at TIMESTAMPTZ,

  -- Timing
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_webhook_events_site ON syndication_webhook_events(site_id);
CREATE INDEX idx_webhook_events_story ON syndication_webhook_events(story_id);
CREATE INDEX idx_webhook_events_status ON syndication_webhook_events(status);
CREATE INDEX idx_webhook_events_next_retry ON syndication_webhook_events(next_retry_at) WHERE status = 'retrying';

-- ============================================================================
-- Table 7: revenue_attributions
-- Purpose: Track revenue attributed to syndicated stories (future feature)
-- Philosophy: Transparent revenue sharing with storytellers
-- ============================================================================

CREATE TABLE IF NOT EXISTS revenue_attributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  site_id UUID NOT NULL REFERENCES syndication_sites(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Revenue Source
  revenue_source TEXT NOT NULL, -- 'grant', 'donation', 'sponsorship'
  revenue_amount DECIMAL(10,2) NOT NULL,
  revenue_date DATE NOT NULL,
  revenue_description TEXT,

  -- Attribution Method
  attribution_method TEXT NOT NULL CHECK (attribution_method IN ('utm', 'referrer', 'ai_analysis', 'self_reported')),
  attribution_confidence DECIMAL(3,2) DEFAULT 0.50, -- 0.0 to 1.0

  -- Supporting Evidence
  utm_codes JSONB,
  referrer_data JSONB,
  ai_analysis_data JSONB,
  supporting_documents TEXT[], -- URLs to grant applications, receipts, etc.

  -- Story Breakdown
  attributed_stories JSONB NOT NULL, -- Array of {story_id, weight, storyteller_id}

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'disputed', 'paid')),
  verified_at TIMESTAMPTZ,
  verified_by UUID -- No auth schema,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_revenue_attributions_site ON revenue_attributions(site_id);
CREATE INDEX idx_revenue_attributions_tenant ON revenue_attributions(organization_id);
CREATE INDEX idx_revenue_attributions_status ON revenue_attributions(status);
CREATE INDEX idx_revenue_attributions_date ON revenue_attributions(revenue_date);

-- ============================================================================
-- Table 8: storyteller_payouts
-- Purpose: Track payments to storytellers from syndication revenue
-- Philosophy: Monthly payouts, full transparency, minimum threshold
-- ============================================================================

CREATE TABLE IF NOT EXISTS storyteller_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  storyteller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Payout Period
  payout_period_start DATE NOT NULL,
  payout_period_end DATE NOT NULL,

  -- Amounts
  total_revenue_earned DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  platform_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  net_payout_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,

  -- Breakdown
  revenue_breakdown JSONB, -- {story_id, site_id, amount}[]

  -- Stripe Integration
  stripe_connect_account_id TEXT,
  stripe_transfer_id TEXT,
  stripe_payout_id TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,

  -- Tax Compliance
  tax_form_type TEXT, -- 'W-9', 'W-8BEN', etc.
  tax_form_received BOOLEAN DEFAULT false,
  tax_withholding_amount DECIMAL(10,2) DEFAULT 0.00,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique payout per storyteller per period
  UNIQUE(storyteller_id, payout_period_start, payout_period_end)
);

-- Indexes
CREATE INDEX idx_storyteller_payouts_storyteller ON storyteller_payouts(storyteller_id);
CREATE INDEX idx_storyteller_payouts_tenant ON storyteller_payouts(organization_id);
CREATE INDEX idx_storyteller_payouts_status ON storyteller_payouts(status);
CREATE INDEX idx_storyteller_payouts_period ON storyteller_payouts(payout_period_start, payout_period_end);

-- ============================================================================
-- Table 9: media_vision_analysis
-- Purpose: Store AI vision analysis results for photos/videos
-- Philosophy: Hybrid OpenAI + Claude, cultural sensitivity focus
-- ============================================================================

CREATE TABLE IF NOT EXISTS media_vision_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  media_asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- OpenAI GPT-4o Vision Analysis (Initial Scan)
  openai_analysis_completed BOOLEAN DEFAULT false,
  openai_analysis_at TIMESTAMPTZ,
  openai_faces_detected INTEGER DEFAULT 0,
  openai_objects_detected TEXT[],
  openai_scene_description TEXT,
  openai_cultural_markers TEXT[],
  openai_content_flags TEXT[],
  openai_confidence_score DECIMAL(3,2),
  openai_cost_usd DECIMAL(10,4),

  -- Claude Sonnet 4.5 Vision Analysis (Cultural Review - only if flagged)
  claude_analysis_completed BOOLEAN DEFAULT false,
  claude_analysis_at TIMESTAMPTZ,
  claude_cultural_sensitivity_score DECIMAL(3,2),
  claude_sacred_content_detected BOOLEAN DEFAULT false,
  claude_cultural_protocols TEXT[],
  claude_recommended_restrictions TEXT,
  claude_elder_review_required BOOLEAN DEFAULT false,
  claude_cost_usd DECIMAL(10,4),

  -- Face Matching (detected faces → storyteller profiles)
  detected_people JSONB, -- [{face_index, confidence, matched_profile_id, confirmed}]
  face_matching_completed BOOLEAN DEFAULT false,
  face_matching_consent_required_from UUID[], -- Profile IDs needing consent

  -- Overall Assessment
  requires_elder_approval BOOLEAN DEFAULT false,
  approved_for_syndication BOOLEAN DEFAULT false,
  cultural_permission_level TEXT CHECK (cultural_permission_level IN ('public', 'community', 'restricted', 'sacred')),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one analysis per media asset
  UNIQUE(media_asset_id)
);

-- Indexes
CREATE INDEX idx_media_vision_analysis_media ON media_vision_analysis(media_asset_id);
CREATE INDEX idx_media_vision_analysis_sacred ON media_vision_analysis(claude_sacred_content_detected);
CREATE INDEX idx_media_vision_analysis_elder ON media_vision_analysis(requires_elder_approval);

-- ============================================================================
-- Column Additions to Existing Tables
-- ============================================================================

-- stories table: Add syndication tracking columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'syndication_enabled') THEN
    ALTER TABLE stories ADD COLUMN syndication_enabled BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'syndication_excerpt') THEN
    ALTER TABLE stories ADD COLUMN syndication_excerpt TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'total_syndication_revenue') THEN
    ALTER TABLE stories ADD COLUMN total_syndication_revenue DECIMAL(10,2) DEFAULT 0.00;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'cultural_permission_level') THEN
    ALTER TABLE stories ADD COLUMN cultural_permission_level TEXT DEFAULT 'public' CHECK (cultural_permission_level IN ('public', 'community', 'restricted', 'sacred'));
  END IF;
END $$;

-- media_assets table: Add vision analysis tracking
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_assets' AND column_name = 'vision_analysis_completed') THEN
    ALTER TABLE media_assets ADD COLUMN vision_analysis_completed BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_assets' AND column_name = 'detected_people_ids') THEN
    ALTER TABLE media_assets ADD COLUMN detected_people_ids UUID[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_assets' AND column_name = 'requires_consent_from') THEN
    ALTER TABLE media_assets ADD COLUMN requires_consent_from UUID[];
  END IF;
END $$;

-- profiles table: Add Stripe Connect + revenue tracking
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'stripe_connect_account_id') THEN
    ALTER TABLE profiles ADD COLUMN stripe_connect_account_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_earned_revenue') THEN
    ALTER TABLE profiles ADD COLUMN total_earned_revenue DECIMAL(10,2) DEFAULT 0.00;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'payout_preference') THEN
    ALTER TABLE profiles ADD COLUMN payout_preference TEXT DEFAULT 'monthly' CHECK (payout_preference IN ('monthly', 'quarterly', 'annual', 'manual'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'minimum_payout_threshold') THEN
    ALTER TABLE profiles ADD COLUMN minimum_payout_threshold DECIMAL(10,2) DEFAULT 50.00;
  END IF;
END $$;

-- ============================================================================
-- Row Level Security (RLS) Policies
-- Philosophy: Storyteller sovereignty, cultural safety, data privacy
-- ============================================================================

-- Enable RLS on all tables
-- ALTER TABLE syndication_sites ENABLE ROW LEVEL SECURITY; (may already be enabled)
-- ALTER TABLE syndication_consent ENABLE ROW LEVEL SECURITY; (may already be enabled)
-- ALTER TABLE embed_tokens ENABLE ROW LEVEL SECURITY; (may already be enabled)
-- ALTER TABLE story_distributions ENABLE ROW LEVEL SECURITY; (may already be enabled)
-- ALTER TABLE syndication_engagement_events ENABLE ROW LEVEL SECURITY; (may already be enabled)
-- ALTER TABLE syndication_webhook_events ENABLE ROW LEVEL SECURITY; (may already be enabled)
-- ALTER TABLE revenue_attributions ENABLE ROW LEVEL SECURITY; (may already be enabled)
-- ALTER TABLE storyteller_payouts ENABLE ROW LEVEL SECURITY; (may already be enabled)
-- ALTER TABLE media_vision_analysis ENABLE ROW LEVEL SECURITY; (may already be enabled)

-- syndication_sites: Tenant admins can manage, storytellers can view active sites
CREATE POLICY "Tenant admins manage syndication sites"
  ON syndication_sites
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Storytellers view active syndication sites"
  ON syndication_sites
  FOR SELECT
  USING (
    status = 'active' AND
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- syndication_consent: Storytellers control their own consent
CREATE POLICY "Storytellers manage their own consent"
  ON syndication_consent
  FOR ALL
  USING (storyteller_id = auth.uid());

CREATE POLICY "Tenant admins view all consent in their tenant"
  ON syndication_consent
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- embed_tokens: Service role only (external sites use API key)
CREATE POLICY "Service role manages embed tokens"
  ON embed_tokens
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- story_distributions: Storytellers see their distributions
CREATE POLICY "Storytellers view their story distributions"
  ON story_distributions
  FOR SELECT
  USING (
    story_id IN (
      SELECT id FROM stories WHERE storyteller_id = auth.uid()
    )
  );

CREATE POLICY "Tenant admins view all distributions"
  ON story_distributions
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- syndication_engagement_events: Storytellers see events for their stories
CREATE POLICY "Storytellers view engagement on their stories"
  ON syndication_engagement_events
  FOR SELECT
  USING (
    story_id IN (
      SELECT id FROM stories WHERE storyteller_id = auth.uid()
    )
  );

-- syndication_webhook_events: Tenant admins only
CREATE POLICY "Tenant admins view webhook events"
  ON syndication_webhook_events
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- revenue_attributions: Storytellers see attributions involving their stories
CREATE POLICY "Storytellers view revenue attributions for their stories"
  ON revenue_attributions
  FOR SELECT
  USING (
    id IN (
      SELECT ra.id FROM revenue_attributions ra
      CROSS JOIN LATERAL jsonb_array_elements(ra.attributed_stories) AS story
      WHERE (story->>'storyteller_id')::uuid = auth.uid()
    )
  );

-- storyteller_payouts: Storytellers see only their own payouts
CREATE POLICY "Storytellers view their own payouts"
  ON storyteller_payouts
  FOR SELECT
  USING (storyteller_id = auth.uid());

-- media_vision_analysis: Storytellers see analysis for their media
CREATE POLICY "Storytellers view vision analysis for their media"
  ON media_vision_analysis
  FOR SELECT
  USING (
    media_asset_id IN (
      SELECT ma.id FROM media_assets ma
      JOIN stories s ON ma.story_id = s.id
      WHERE s.storyteller_id = auth.uid()
    )
  );

-- ============================================================================
-- Functions and Triggers
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_syndication_sites_updated_at BEFORE UPDATE ON syndication_sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_syndication_consent_updated_at BEFORE UPDATE ON syndication_consent
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_story_distributions_updated_at BEFORE UPDATE ON story_distributions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_syndication_webhook_events_updated_at BEFORE UPDATE ON syndication_webhook_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenue_attributions_updated_at BEFORE UPDATE ON revenue_attributions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storyteller_payouts_updated_at BEFORE UPDATE ON storyteller_payouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_vision_analysis_updated_at BEFORE UPDATE ON media_vision_analysis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Grants
-- ============================================================================

-- Grant necessary permissions to authenticated users
-- GRANT SELECT, INSERT, UPDATE ON syndication_consent TO authenticated; (no auth roles)
-- GRANT SELECT ON syndication_sites TO authenticated; (no auth roles)
-- GRANT SELECT ON story_distributions TO authenticated; (no auth roles)
-- GRANT SELECT ON syndication_engagement_events TO authenticated; (no auth roles)
-- GRANT SELECT ON storyteller_payouts TO authenticated; (no auth roles)
-- GRANT SELECT ON media_vision_analysis TO authenticated; (no auth roles)

-- Service role gets full access (for API endpoints)
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role; (no auth roles)

-- ============================================================================
-- Comments (Documentation)
-- ============================================================================

COMMENT ON TABLE syndication_sites IS 'Registry of approved external ACT sites that can request syndicated content';
COMMENT ON TABLE syndication_consent IS 'Per-story, per-site consent from storytellers (OCAP principle: storyteller control)';
COMMENT ON TABLE embed_tokens IS 'Secure, time-limited, revocable access tokens for external sites';
COMMENT ON TABLE story_distributions IS 'Real-time tracking of where stories are currently live';
COMMENT ON TABLE syndication_engagement_events IS 'Individual engagement events (views, clicks, shares) for transparency';
COMMENT ON TABLE syndication_webhook_events IS 'Audit log of all webhook deliveries for compliance verification';
COMMENT ON TABLE revenue_attributions IS 'Revenue attributed to syndicated stories (future feature)';
COMMENT ON TABLE storyteller_payouts IS 'Monthly payments to storytellers from syndication revenue';
COMMENT ON TABLE media_vision_analysis IS 'AI vision analysis results (OpenAI + Claude) for cultural safety';

-- ============================================================================
-- Migration Complete
-- ============================================================================
