-- Story Engagement Tracking
-- Tracks views, reads, shares across all platforms
-- Enables value attribution back to storytellers
-- Created: 2025-12-10

-- Engagement events table
CREATE TABLE IF NOT EXISTS story_engagement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Story reference
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  storyteller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Platform that displayed the story
  platform_id UUID REFERENCES external_applications(id) ON DELETE SET NULL,
  platform_name TEXT NOT NULL DEFAULT 'empathy_ledger',

  -- Event details
  event_type TEXT NOT NULL CHECK (event_type IN (
    'view',           -- Story was displayed
    'read',           -- Significant engagement (>30s or 50% scroll)
    'share',          -- Story was shared
    'click',          -- Link clicked within story
    'action'          -- Conversion action (donate, signup, etc.)
  )),

  -- Engagement metrics
  read_time_seconds INTEGER,  -- How long they engaged
  scroll_depth INTEGER,       -- Percentage scrolled (0-100)

  -- Source tracking
  referrer TEXT,              -- Where they came from
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Geographic data (anonymized)
  country_code TEXT,
  region TEXT,
  city TEXT,

  -- Device info
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'unknown')),
  browser TEXT,

  -- Session tracking (anonymous)
  session_id TEXT,            -- For deduplication

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_engagement_story_id ON story_engagement_events(story_id);
CREATE INDEX idx_engagement_storyteller_id ON story_engagement_events(storyteller_id) WHERE storyteller_id IS NOT NULL;
CREATE INDEX idx_engagement_platform ON story_engagement_events(platform_name);
CREATE INDEX idx_engagement_event_type ON story_engagement_events(event_type);
CREATE INDEX idx_engagement_created_at ON story_engagement_events(created_at);
CREATE INDEX idx_engagement_session ON story_engagement_events(session_id) WHERE session_id IS NOT NULL;

-- Composite index for dashboard queries
CREATE INDEX idx_engagement_story_date ON story_engagement_events(story_id, created_at DESC);
CREATE INDEX idx_engagement_storyteller_date ON story_engagement_events(storyteller_id, created_at DESC) WHERE storyteller_id IS NOT NULL;

-- Aggregated daily stats (materialized for performance)
CREATE TABLE IF NOT EXISTS story_engagement_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  storyteller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  platform_name TEXT NOT NULL,
  date DATE NOT NULL,

  -- Aggregated metrics
  view_count INTEGER NOT NULL DEFAULT 0,
  read_count INTEGER NOT NULL DEFAULT 0,
  share_count INTEGER NOT NULL DEFAULT 0,
  action_count INTEGER NOT NULL DEFAULT 0,

  -- Engagement quality
  total_read_time_seconds INTEGER NOT NULL DEFAULT 0,
  avg_scroll_depth INTEGER,

  -- Geographic summary (top 3 countries)
  top_countries JSONB,

  -- Device breakdown
  mobile_percent INTEGER,
  desktop_percent INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(story_id, platform_name, date)
);

-- Indexes for daily stats
CREATE INDEX idx_daily_story_date ON story_engagement_daily(story_id, date DESC);
CREATE INDEX idx_daily_storyteller_date ON story_engagement_daily(storyteller_id, date DESC) WHERE storyteller_id IS NOT NULL;

-- Function to aggregate daily stats
CREATE OR REPLACE FUNCTION aggregate_daily_engagement()
RETURNS void AS $$
BEGIN
  -- Aggregate yesterday's events into daily table
  INSERT INTO story_engagement_daily (
    story_id,
    storyteller_id,
    platform_name,
    date,
    view_count,
    read_count,
    share_count,
    action_count,
    total_read_time_seconds,
    avg_scroll_depth,
    top_countries,
    mobile_percent,
    desktop_percent
  )
  SELECT
    story_id,
    storyteller_id,
    platform_name,
    DATE(created_at) as date,
    COUNT(*) FILTER (WHERE event_type = 'view') as view_count,
    COUNT(*) FILTER (WHERE event_type = 'read') as read_count,
    COUNT(*) FILTER (WHERE event_type = 'share') as share_count,
    COUNT(*) FILTER (WHERE event_type = 'action') as action_count,
    COALESCE(SUM(read_time_seconds), 0) as total_read_time_seconds,
    AVG(scroll_depth)::INTEGER as avg_scroll_depth,
    (
      SELECT jsonb_agg(jsonb_build_object('country', country_code, 'count', cnt))
      FROM (
        SELECT country_code, COUNT(*) as cnt
        FROM story_engagement_events e2
        WHERE e2.story_id = story_engagement_events.story_id
          AND DATE(e2.created_at) = DATE(story_engagement_events.created_at)
          AND e2.country_code IS NOT NULL
        GROUP BY country_code
        ORDER BY cnt DESC
        LIMIT 3
      ) top
    ) as top_countries,
    (COUNT(*) FILTER (WHERE device_type = 'mobile') * 100 / NULLIF(COUNT(*), 0))::INTEGER as mobile_percent,
    (COUNT(*) FILTER (WHERE device_type = 'desktop') * 100 / NULLIF(COUNT(*), 0))::INTEGER as desktop_percent
  FROM story_engagement_events
  WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
  GROUP BY story_id, storyteller_id, platform_name, DATE(created_at)
  ON CONFLICT (story_id, platform_name, date)
  DO UPDATE SET
    view_count = EXCLUDED.view_count,
    read_count = EXCLUDED.read_count,
    share_count = EXCLUDED.share_count,
    action_count = EXCLUDED.action_count,
    total_read_time_seconds = EXCLUDED.total_read_time_seconds,
    avg_scroll_depth = EXCLUDED.avg_scroll_depth,
    top_countries = EXCLUDED.top_countries,
    mobile_percent = EXCLUDED.mobile_percent,
    desktop_percent = EXCLUDED.desktop_percent,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE story_engagement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_engagement_daily ENABLE ROW LEVEL SECURITY;

-- Service role can insert events (from tracking API)
CREATE POLICY "Service role can insert events"
  ON story_engagement_events
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Storytellers can view their own engagement
CREATE POLICY "Storytellers can view their engagement"
  ON story_engagement_events
  FOR SELECT
  USING (storyteller_id = auth.uid());

CREATE POLICY "Storytellers can view their daily stats"
  ON story_engagement_daily
  FOR SELECT
  USING (storyteller_id = auth.uid());

-- Story authors can view engagement
CREATE POLICY "Story authors can view engagement"
  ON story_engagement_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_engagement_events.story_id
      AND stories.author_id = auth.uid()
    )
  );

CREATE POLICY "Story authors can view daily stats"
  ON story_engagement_daily
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_engagement_daily.story_id
      AND stories.author_id = auth.uid()
    )
  );

-- Comments
COMMENT ON TABLE story_engagement_events IS 'Raw engagement events from all platforms displaying stories';
COMMENT ON TABLE story_engagement_daily IS 'Aggregated daily engagement stats for dashboard performance';
COMMENT ON COLUMN story_engagement_events.platform_name IS 'Platform that displayed the story (justicehub, act_place, empathy_ledger, etc.)';
COMMENT ON COLUMN story_engagement_events.session_id IS 'Anonymous session ID for deduplication (not user-identifying)';
