-- Social Media Integration Schema
-- Created: January 12, 2026
-- Purpose: Enable publishing stories to social media platforms (LinkedIn, Bluesky, etc.)
-- Philosophy: Storyteller control, organization-level connections, scheduled publishing

-- ============================================================================
-- Table 1: social_platforms
-- Purpose: Registry of supported social media platforms
-- ============================================================================

CREATE TABLE IF NOT EXISTS social_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, -- 'linkedin', 'bluesky', 'youtube', 'facebook'
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,

  -- OAuth Configuration
  oauth_authorization_url TEXT,
  oauth_token_url TEXT,
  oauth_scope TEXT, -- Required scopes

  -- API Configuration
  api_base_url TEXT,
  max_content_length INTEGER, -- Character limit for posts
  supports_images BOOLEAN DEFAULT true,
  supports_video BOOLEAN DEFAULT false,
  supports_scheduling BOOLEAN DEFAULT true,

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial platforms
INSERT INTO social_platforms (slug, name, description, max_content_length, supports_images, supports_video, supports_scheduling) VALUES
  ('linkedin', 'LinkedIn', 'Professional networking platform', 3000, true, true, true),
  ('bluesky', 'Bluesky', 'Decentralized social network', 300, true, false, true),
  ('youtube', 'YouTube', 'Video sharing platform', 5000, true, true, true),
  ('facebook', 'Facebook', 'Social networking platform', 63206, true, true, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- Table 2: social_connections
-- Purpose: Store OAuth tokens for organization social media accounts
-- ============================================================================

CREATE TABLE IF NOT EXISTS social_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  platform_id UUID NOT NULL REFERENCES social_platforms(id) ON DELETE CASCADE,

  -- OAuth Tokens (encrypted at rest)
  access_token TEXT NOT NULL, -- Encrypted
  refresh_token TEXT, -- Encrypted
  token_expires_at TIMESTAMPTZ,

  -- Account Info
  platform_user_id TEXT, -- User ID on the platform
  platform_username TEXT, -- Display name/handle
  platform_profile_url TEXT,

  -- Connection Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'error')),
  last_error TEXT,
  last_used_at TIMESTAMPTZ,

  -- Permissions
  can_post BOOLEAN DEFAULT true,
  can_schedule BOOLEAN DEFAULT true,
  can_read_analytics BOOLEAN DEFAULT true,

  -- Metadata
  connected_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(organization_id, platform_id)
);

-- Indexes
CREATE INDEX idx_social_connections_org ON social_connections(organization_id);
CREATE INDEX idx_social_connections_platform ON social_connections(platform_id);
CREATE INDEX idx_social_connections_status ON social_connections(status);

-- ============================================================================
-- Table 3: scheduled_posts
-- Purpose: Queue of posts scheduled for publishing to social platforms
-- ============================================================================

CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content Source
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Target Platform
  connection_id UUID NOT NULL REFERENCES social_connections(id) ON DELETE CASCADE,
  platform_id UUID NOT NULL REFERENCES social_platforms(id),

  -- Post Content
  content TEXT NOT NULL, -- The actual post text
  excerpt TEXT, -- Short version for platforms with limits
  hashtags TEXT[], -- Array of hashtags
  media_urls TEXT[], -- URLs of images/videos to attach
  link_url TEXT, -- Link to the full story

  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'Australia/Sydney',

  -- Status Tracking
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
    'draft', 'scheduled', 'publishing', 'published', 'failed', 'cancelled'
  )),
  published_at TIMESTAMPTZ,
  platform_post_id TEXT, -- ID of the post on the platform
  platform_post_url TEXT, -- URL to the published post

  -- Error Handling
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  last_error TEXT,
  last_attempt_at TIMESTAMPTZ,

  -- Cultural Safety
  requires_elder_approval BOOLEAN DEFAULT false,
  elder_approved BOOLEAN DEFAULT false,
  elder_approved_by UUID REFERENCES profiles(id),
  elder_approved_at TIMESTAMPTZ,

  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_scheduled_posts_story ON scheduled_posts(story_id);
CREATE INDEX idx_scheduled_posts_org ON scheduled_posts(organization_id);
CREATE INDEX idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX idx_scheduled_posts_scheduled_for ON scheduled_posts(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX idx_scheduled_posts_connection ON scheduled_posts(connection_id);

-- ============================================================================
-- Table 4: social_post_analytics
-- Purpose: Track engagement metrics for published social posts
-- ============================================================================

CREATE TABLE IF NOT EXISTS social_post_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  scheduled_post_id UUID NOT NULL REFERENCES scheduled_posts(id) ON DELETE CASCADE,

  -- Engagement Metrics
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,

  -- Platform-specific metrics (JSONB for flexibility)
  platform_metrics JSONB DEFAULT '{}',

  -- Tracking
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX idx_social_post_analytics_post ON social_post_analytics(scheduled_post_id);

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE social_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_analytics ENABLE ROW LEVEL SECURITY;

-- social_platforms: Public read (it's just a list of platforms)
CREATE POLICY "Anyone can view social platforms"
  ON social_platforms FOR SELECT
  USING (true);

-- social_connections: Organization members only
CREATE POLICY "Organization members can view their connections"
  ON social_connections FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profile_organizations
      WHERE profile_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Organization admins can manage connections"
  ON social_connections FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profile_organizations
      WHERE profile_id = auth.uid()
      AND is_active = true
      AND role IN ('admin', 'owner')
    )
  );

-- scheduled_posts: Organization members can view, admins can manage
CREATE POLICY "Organization members can view scheduled posts"
  ON scheduled_posts FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profile_organizations
      WHERE profile_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Organization admins can manage scheduled posts"
  ON scheduled_posts FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profile_organizations
      WHERE profile_id = auth.uid()
      AND is_active = true
      AND role IN ('admin', 'owner', 'editor')
    )
  );

-- social_post_analytics: Same as scheduled_posts
CREATE POLICY "Organization members can view post analytics"
  ON social_post_analytics FOR SELECT
  USING (
    scheduled_post_id IN (
      SELECT id FROM scheduled_posts
      WHERE organization_id IN (
        SELECT organization_id FROM profile_organizations
        WHERE profile_id = auth.uid() AND is_active = true
      )
    )
  );

-- ============================================================================
-- Add social publishing fields to stories table
-- ============================================================================

-- Add social sharing tracking to stories
ALTER TABLE stories ADD COLUMN IF NOT EXISTS social_share_count INTEGER DEFAULT 0;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS last_shared_at TIMESTAMPTZ;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS social_sharing_enabled BOOLEAN DEFAULT true;

-- ============================================================================
-- Updated timestamp triggers
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_social_platforms_updated_at
    BEFORE UPDATE ON social_platforms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_connections_updated_at
    BEFORE UPDATE ON social_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_posts_updated_at
    BEFORE UPDATE ON scheduled_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_post_analytics_updated_at
    BEFORE UPDATE ON social_post_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE social_platforms IS 'Registry of supported social media platforms for content publishing';
COMMENT ON TABLE social_connections IS 'OAuth connections linking organizations to their social media accounts';
COMMENT ON TABLE scheduled_posts IS 'Queue of posts scheduled for publishing to social media platforms';
COMMENT ON TABLE social_post_analytics IS 'Engagement metrics for published social media posts';
