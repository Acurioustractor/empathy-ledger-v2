-- ACT Multi-Site Ecosystem: Story Sharing with Consent
-- Migration: 20251224000003_act_multi_site_ecosystem

-- ============================================================================
-- 1. SITES REGISTRY
-- ============================================================================

CREATE TYPE site_status AS ENUM ('active', 'maintenance', 'archived');

CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_key TEXT UNIQUE NOT NULL,  -- 'act-main', 'youth-stories', 'land-rights'
  site_name TEXT NOT NULL,
  site_url TEXT NOT NULL,
  site_description TEXT,

  -- Design theme
  theme_config JSONB DEFAULT '{}'::jsonb,

  -- API access
  api_key_hash TEXT,
  api_enabled BOOLEAN DEFAULT true,
  rate_limit INTEGER DEFAULT 1000,  -- requests per hour

  -- Settings
  allow_story_requests BOOLEAN DEFAULT true,
  auto_approve_stories BOOLEAN DEFAULT false,  -- Require manual approval

  -- Contact
  admin_email TEXT,
  webhook_url TEXT,

  -- Status
  status site_status DEFAULT 'active',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  CHECK (site_url ~ '^https?://'),
  CHECK (site_key ~ '^[a-z0-9-]+$')
);

COMMENT ON TABLE sites IS 'Registry of ACT ecosystem sites that can display stories';
COMMENT ON COLUMN sites.site_key IS 'URL-safe identifier for the site';
COMMENT ON COLUMN sites.theme_config IS 'JSON configuration for Empathy Ledger theme customization';
COMMENT ON COLUMN sites.api_key_hash IS 'Hashed API key for secure access';

-- ============================================================================
-- 2. STORY SITE VISIBILITY (Cross-site sharing with consent)
-- ============================================================================

CREATE TYPE visibility_level AS ENUM ('public', 'unlisted', 'private');

CREATE TABLE IF NOT EXISTS story_site_visibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

  -- Consent tracking
  storyteller_consent BOOLEAN DEFAULT false,
  consent_granted_at TIMESTAMPTZ,
  consent_granted_by UUID REFERENCES profiles(id),  -- Who granted (storyteller or admin)
  consent_expires_at TIMESTAMPTZ,  -- Optional expiration
  consent_revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,

  -- Visibility settings
  visibility visibility_level DEFAULT 'public',
  show_on_homepage BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,

  -- Project tagging (which projects this story belongs to on this site)
  project_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Display overrides (optional site-specific customization)
  custom_title TEXT,
  custom_description TEXT,

  -- Analytics
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,

  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id),

  -- Constraints
  UNIQUE(story_id, site_id),
  CHECK (consent_granted_at IS NULL OR storyteller_consent = true),
  CHECK (consent_expires_at IS NULL OR consent_expires_at > consent_granted_at)
);

CREATE INDEX idx_story_site_visibility_story ON story_site_visibility(story_id);
CREATE INDEX idx_story_site_visibility_site ON story_site_visibility(site_id);
CREATE INDEX idx_story_site_visibility_consent ON story_site_visibility(storyteller_consent) WHERE storyteller_consent = true;
CREATE INDEX idx_story_site_visibility_featured ON story_site_visibility(site_id, featured) WHERE featured = true;
CREATE INDEX idx_story_site_visibility_tags ON story_site_visibility USING gin(project_tags);

COMMENT ON TABLE story_site_visibility IS 'Controls which stories appear on which ACT sites, with storyteller consent';
COMMENT ON COLUMN story_site_visibility.storyteller_consent IS 'Storyteller has explicitly consented to share on this site';
COMMENT ON COLUMN story_site_visibility.project_tags IS 'Project categories for filtering (e.g. youth, land-rights)';

-- ============================================================================
-- 3. STORYTELLER CONSENT SETTINGS (Global preferences)
-- ============================================================================

CREATE TABLE IF NOT EXISTS storyteller_consent_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Global sharing preferences
  allow_cross_site_sharing BOOLEAN DEFAULT false,
  allow_api_access BOOLEAN DEFAULT false,
  allow_downloads BOOLEAN DEFAULT false,
  allow_embedding BOOLEAN DEFAULT false,

  -- Approved/blocked sites
  approved_sites UUID[] DEFAULT ARRAY[]::UUID[],
  blocked_sites UUID[] DEFAULT ARRAY[]::UUID[],

  -- Default consent duration
  default_consent_duration INTERVAL DEFAULT '1 year',
  require_consent_renewal BOOLEAN DEFAULT true,

  -- Attribution requirements
  require_attribution BOOLEAN DEFAULT true,
  attribution_text TEXT,

  -- Notification preferences
  notify_on_share BOOLEAN DEFAULT true,
  notify_on_api_access BOOLEAN DEFAULT false,
  notify_on_consent_expiring BOOLEAN DEFAULT true,
  notification_days_before_expiry INTEGER DEFAULT 30,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_storyteller_consent_storyteller ON storyteller_consent_settings(storyteller_id);

COMMENT ON TABLE storyteller_consent_settings IS 'Global consent and sharing preferences for storytellers';
COMMENT ON COLUMN storyteller_consent_settings.default_consent_duration IS 'Default duration for new consent grants';

-- ============================================================================
-- 4. STORY API ACCESS LOG (Audit trail)
-- ============================================================================

CREATE TYPE api_request_type AS ENUM ('read', 'embed', 'download', 'search');

CREATE TABLE IF NOT EXISTS story_api_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
  storyteller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Request details
  accessed_at TIMESTAMPTZ DEFAULT now(),
  api_key_hash TEXT,
  request_type api_request_type NOT NULL,
  endpoint TEXT,

  -- Network details
  ip_address INET,
  user_agent TEXT,
  referer TEXT,

  -- Response
  status_code INTEGER,
  response_time_ms INTEGER,

  -- Partitioning key for performance
  access_month DATE DEFAULT date_trunc('month', now())
);

CREATE INDEX idx_story_api_log_story ON story_api_access_log(story_id, accessed_at DESC);
CREATE INDEX idx_story_api_log_site ON story_api_access_log(site_id, accessed_at DESC);
CREATE INDEX idx_story_api_log_month ON story_api_access_log(access_month);

COMMENT ON TABLE story_api_access_log IS 'Audit log of all story API access across ACT sites';

-- ============================================================================
-- 5. HELPER FUNCTIONS
-- ============================================================================

-- Function: Check if storyteller has consented for a specific site
CREATE OR REPLACE FUNCTION has_story_consent(
  p_story_id UUID,
  p_site_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_consent BOOLEAN;
  v_consent_expires TIMESTAMPTZ;
BEGIN
  SELECT
    storyteller_consent,
    consent_expires_at
  INTO v_has_consent, v_consent_expires
  FROM story_site_visibility
  WHERE story_id = p_story_id
    AND site_id = p_site_id;

  -- No visibility record = no consent
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Check consent is active and not expired
  IF NOT v_has_consent THEN
    RETURN false;
  END IF;

  IF v_consent_expires IS NOT NULL AND v_consent_expires < now() THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION has_story_consent IS 'Check if storyteller has active consent for story on specific site';

-- Function: Grant consent for story to appear on site
CREATE OR REPLACE FUNCTION grant_story_consent(
  p_story_id UUID,
  p_site_id UUID,
  p_granted_by UUID,
  p_visibility visibility_level DEFAULT 'public',
  p_duration_days INTEGER DEFAULT 365,
  p_featured BOOLEAN DEFAULT false,
  p_project_tags TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS UUID AS $$
DECLARE
  v_visibility_id UUID;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Calculate expiration
  IF p_duration_days IS NOT NULL THEN
    v_expires_at := now() + (p_duration_days || ' days')::interval;
  END IF;

  -- Insert or update visibility record
  INSERT INTO story_site_visibility (
    story_id,
    site_id,
    storyteller_consent,
    consent_granted_at,
    consent_granted_by,
    consent_expires_at,
    visibility,
    featured,
    project_tags,
    created_by
  ) VALUES (
    p_story_id,
    p_site_id,
    true,
    now(),
    p_granted_by,
    v_expires_at,
    p_visibility,
    p_featured,
    p_project_tags,
    p_granted_by
  )
  ON CONFLICT (story_id, site_id)
  DO UPDATE SET
    storyteller_consent = true,
    consent_granted_at = now(),
    consent_granted_by = p_granted_by,
    consent_expires_at = v_expires_at,
    consent_revoked_at = NULL,
    revocation_reason = NULL,
    visibility = p_visibility,
    featured = p_featured,
    project_tags = p_project_tags,
    updated_at = now()
  RETURNING id INTO v_visibility_id;

  RETURN v_visibility_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION grant_story_consent IS 'Grant storyteller consent for story to appear on a specific site';

-- Function: Revoke consent for story on site
CREATE OR REPLACE FUNCTION revoke_story_consent(
  p_story_id UUID,
  p_site_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated BOOLEAN;
BEGIN
  UPDATE story_site_visibility
  SET
    storyteller_consent = false,
    consent_revoked_at = now(),
    revocation_reason = p_reason,
    updated_at = now()
  WHERE story_id = p_story_id
    AND site_id = p_site_id
    AND storyteller_consent = true;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION revoke_story_consent IS 'Revoke storyteller consent - story will no longer appear on site';

-- Function: Get stories for a specific site (with consent check)
CREATE OR REPLACE FUNCTION get_site_stories(
  p_site_id UUID,
  p_visibility visibility_level DEFAULT 'public',
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  story_id UUID,
  title TEXT,
  storyteller_id UUID,
  storyteller_name TEXT,
  created_at TIMESTAMPTZ,
  project_tags TEXT[],
  featured BOOLEAN,
  view_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.title,
    s.storyteller_id,
    p.display_name,
    s.created_at,
    ssv.project_tags,
    ssv.featured,
    ssv.view_count
  FROM stories s
  JOIN profiles p ON p.id = s.storyteller_id
  JOIN story_site_visibility ssv ON ssv.story_id = s.id
  WHERE ssv.site_id = p_site_id
    AND ssv.storyteller_consent = true
    AND ssv.visibility = p_visibility
    AND (ssv.consent_expires_at IS NULL OR ssv.consent_expires_at > now())
    AND s.status = 'published'
  ORDER BY
    ssv.featured DESC,
    ssv.display_order,
    s.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_site_stories IS 'Get all stories visible on a specific site with active consent';

-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================

-- Sites table
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sites are viewable by everyone"
  ON sites FOR SELECT
  USING (status = 'active');

CREATE POLICY "Sites are manageable by admins"
  ON sites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Story site visibility
ALTER TABLE story_site_visibility ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Story visibility is viewable by site admins and storytellers"
  ON story_site_visibility FOR SELECT
  USING (
    auth.uid() IN (
      SELECT storyteller_id FROM stories WHERE id = story_id
      UNION
      SELECT id FROM profiles WHERE role IN ('admin', 'site_admin')
    )
  );

CREATE POLICY "Story visibility is manageable by storytellers for their stories"
  ON story_site_visibility FOR ALL
  USING (
    auth.uid() IN (
      SELECT storyteller_id FROM stories WHERE id = story_id
    )
  );

CREATE POLICY "Story visibility is manageable by admins"
  ON story_site_visibility FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'site_admin')
    )
  );

-- Storyteller consent settings
ALTER TABLE storyteller_consent_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consent settings viewable by storyteller"
  ON storyteller_consent_settings FOR SELECT
  USING (storyteller_id = auth.uid());

CREATE POLICY "Consent settings manageable by storyteller"
  ON storyteller_consent_settings FOR ALL
  USING (storyteller_id = auth.uid());

-- API access log
ALTER TABLE story_api_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "API logs viewable by admins and story owners"
  ON story_api_access_log FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
      UNION
      SELECT storyteller_id FROM stories WHERE id = story_id
    )
  );

-- ============================================================================
-- 7. TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_story_site_visibility_updated_at BEFORE UPDATE ON story_site_visibility
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storyteller_consent_settings_updated_at BEFORE UPDATE ON storyteller_consent_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. SEED DATA FOR TESTING
-- ============================================================================

-- Insert ACT sites
INSERT INTO sites (id, site_key, site_name, site_url, site_description, theme_config, status) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'act-main',
    'A Curious Tractor',
    'https://acurioustractor.org',
    'Main ACT portal showcasing stories across all projects',
    '{"accent": "#E07A5F", "variant": "warmth"}'::jsonb,
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'youth-stories',
    'Youth Voices',
    'https://youth.acurioustractor.org',
    'Platform for youth storytellers and climate action narratives',
    '{"accent": "#06B6D4", "variant": "vibrant"}'::jsonb,
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'land-rights',
    'Land & Territory',
    'https://land.acurioustractor.org',
    'Archive of land rights, territory, and environmental justice stories',
    '{"accent": "#059669", "variant": "heritage"}'::jsonb,
    'active'
  )
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE sites IS 'ACT ecosystem sites registry - enables multi-site story sharing';
COMMENT ON TABLE story_site_visibility IS 'Cross-site visibility with storyteller consent';
COMMENT ON TABLE storyteller_consent_settings IS 'Storyteller sharing preferences and consent management';
COMMENT ON TABLE story_api_access_log IS 'Audit trail for story API access across sites';
