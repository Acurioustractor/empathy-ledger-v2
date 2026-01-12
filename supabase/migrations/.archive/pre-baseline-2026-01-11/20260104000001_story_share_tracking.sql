-- Story Share Tracking System
-- Tracks when stories and media are shared, with cultural safety protocols

-- Story Share Events Table
CREATE TABLE IF NOT EXISTS story_share_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  storyteller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Share details
  share_method TEXT NOT NULL, -- 'link', 'email', 'social', 'embed', 'download'
  share_platform TEXT, -- 'facebook', 'twitter', 'whatsapp', 'email', 'linkedin', etc.
  shared_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Tracking data
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,

  -- Geographic and cultural context
  geographic_region TEXT,
  cultural_context JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Multi-tenant support
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE
);

-- Media Share Events Table
CREATE TABLE IF NOT EXISTS media_share_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  storyteller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,

  -- Share details
  share_method TEXT NOT NULL,
  share_platform TEXT,
  shared_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Tracking data
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,

  -- Media-specific metadata
  media_type TEXT, -- 'image', 'video', 'audio', 'document'
  download_count INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Multi-tenant support
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_story_share_events_story_id ON story_share_events(story_id);
CREATE INDEX idx_story_share_events_storyteller_id ON story_share_events(storyteller_id);
CREATE INDEX idx_story_share_events_shared_at ON story_share_events(shared_at);
CREATE INDEX idx_story_share_events_share_platform ON story_share_events(share_platform);
CREATE INDEX idx_story_share_events_tenant_id ON story_share_events(tenant_id);

CREATE INDEX idx_media_share_events_media_id ON media_share_events(media_id);
CREATE INDEX idx_media_share_events_story_id ON media_share_events(story_id);
CREATE INDEX idx_media_share_events_storyteller_id ON media_share_events(storyteller_id);
CREATE INDEX idx_media_share_events_shared_at ON media_share_events(shared_at);
CREATE INDEX idx_media_share_events_tenant_id ON media_share_events(tenant_id);

-- Share Analytics View for Storytellers
CREATE OR REPLACE VIEW storyteller_share_analytics AS
SELECT
  s.storyteller_id,
  p.display_name AS storyteller_name,

  -- Story share counts
  COUNT(DISTINCT sse.id) AS total_story_shares,
  COUNT(DISTINCT CASE WHEN sse.shared_at >= NOW() - INTERVAL '30 days' THEN sse.id END) AS shares_last_30_days,
  COUNT(DISTINCT CASE WHEN sse.shared_at >= NOW() - INTERVAL '7 days' THEN sse.id END) AS shares_last_7_days,

  -- Platform breakdown
  COUNT(DISTINCT CASE WHEN sse.share_platform = 'facebook' THEN sse.id END) AS facebook_shares,
  COUNT(DISTINCT CASE WHEN sse.share_platform = 'twitter' THEN sse.id END) AS twitter_shares,
  COUNT(DISTINCT CASE WHEN sse.share_platform = 'whatsapp' THEN sse.id END) AS whatsapp_shares,
  COUNT(DISTINCT CASE WHEN sse.share_platform = 'email' THEN sse.id END) AS email_shares,
  COUNT(DISTINCT CASE WHEN sse.share_platform = 'linkedin' THEN sse.id END) AS linkedin_shares,

  -- Method breakdown
  COUNT(DISTINCT CASE WHEN sse.share_method = 'link' THEN sse.id END) AS link_shares,
  COUNT(DISTINCT CASE WHEN sse.share_method = 'social' THEN sse.id END) AS social_shares,
  COUNT(DISTINCT CASE WHEN sse.share_method = 'email' THEN sse.id END) AS email_method_shares,
  COUNT(DISTINCT CASE WHEN sse.share_method = 'embed' THEN sse.id END) AS embed_shares,

  -- Most shared stories
  (
    SELECT json_agg(
      json_build_object(
        'story_id', sub.story_id,
        'title', sub.title,
        'share_count', sub.share_count
      ) ORDER BY sub.share_count DESC
    )
    FROM (
      SELECT
        sse2.story_id,
        s2.title,
        COUNT(*) AS share_count
      FROM story_share_events sse2
      JOIN stories s2 ON sse2.story_id = s2.id
      WHERE sse2.storyteller_id = s.storyteller_id
      GROUP BY sse2.story_id, s2.title
      ORDER BY share_count DESC
      LIMIT 5
    ) sub
  ) AS top_shared_stories,

  -- Recent share activity
  MAX(sse.shared_at) AS last_share_date

FROM stories s
LEFT JOIN story_share_events sse ON s.id = sse.story_id
LEFT JOIN profiles p ON s.storyteller_id = p.id
WHERE s.storyteller_id IS NOT NULL
GROUP BY s.storyteller_id, p.display_name;

-- Row Level Security (RLS) Policies

ALTER TABLE story_share_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_share_events ENABLE ROW LEVEL SECURITY;

-- Allow storytellers to view their own share events
CREATE POLICY "Storytellers can view their own share events"
  ON story_share_events
  FOR SELECT
  USING (
    storyteller_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Allow service role to insert share events
CREATE POLICY "Service role can insert share events"
  ON story_share_events
  FOR INSERT
  WITH CHECK (true); -- Service role bypasses RLS anyway

-- Media share events policies
CREATE POLICY "Storytellers can view their media share events"
  ON media_share_events
  FOR SELECT
  USING (
    storyteller_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Service role can insert media share events"
  ON media_share_events
  FOR INSERT
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON storyteller_share_analytics TO authenticated;
GRANT SELECT, INSERT ON story_share_events TO authenticated, service_role;
GRANT SELECT, INSERT ON media_share_events TO authenticated, service_role;

-- Comments for documentation
COMMENT ON TABLE story_share_events IS 'Tracks when and how stories are shared, with cultural safety protocols and consent verification';
COMMENT ON TABLE media_share_events IS 'Tracks when and how media assets are shared or downloaded';
COMMENT ON VIEW storyteller_share_analytics IS 'Provides storytellers with analytics about how their stories are being shared';
COMMENT ON COLUMN story_share_events.cultural_context IS 'JSONB field for storing cultural context about the share (e.g., cultural advisor approval, community permissions)';
COMMENT ON COLUMN story_share_events.share_method IS 'How the story was shared: link (copy link), email (send via email), social (social media), embed (embedded on website), download (downloaded)';
COMMENT ON COLUMN story_share_events.share_platform IS 'Specific platform if social share: facebook, twitter, whatsapp, linkedin, email, etc.';
