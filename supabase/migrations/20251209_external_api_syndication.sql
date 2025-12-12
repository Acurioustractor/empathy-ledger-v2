-- External API Story Syndication Tables
-- Enables external applications (JusticeHub, Curious Tractor, etc.) to access
-- approved stories through proper consent management and audit trails.
-- See: /docs/architecture/stories-as-a-service.md

-- ============================================================================
-- 1. EXTERNAL APPLICATIONS REGISTRY
-- ============================================================================

CREATE TABLE IF NOT EXISTS external_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name TEXT NOT NULL UNIQUE,              -- 'justicehub', 'curious_tractor'
  app_display_name TEXT NOT NULL,             -- 'JusticeHub'
  app_description TEXT,
  api_key_hash TEXT NOT NULL,                 -- API key for authentication
  allowed_story_types TEXT[],                 -- Which story types can access
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE external_applications IS 'Registry of external applications that can consume stories via API';
COMMENT ON COLUMN external_applications.app_name IS 'Unique identifier for the app (lowercase, no spaces)';
COMMENT ON COLUMN external_applications.api_key_hash IS 'API key for authentication - compare directly in simple mode';
COMMENT ON COLUMN external_applications.allowed_story_types IS 'Story types this app can access (e.g., testimony, case_study, advocacy)';

-- Index for active apps lookup
CREATE INDEX IF NOT EXISTS idx_external_applications_active
  ON external_applications(is_active)
  WHERE is_active = true;

-- ============================================================================
-- 2. STORY SYNDICATION CONSENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS story_syndication_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  storyteller_id UUID NOT NULL REFERENCES profiles(id),
  app_id UUID NOT NULL REFERENCES external_applications(id) ON DELETE CASCADE,

  -- Consent details
  consent_granted BOOLEAN DEFAULT false,
  consent_granted_at TIMESTAMPTZ,
  consent_revoked_at TIMESTAMPTZ,
  consent_expires_at TIMESTAMPTZ,             -- Optional expiry

  -- What's shared
  share_full_content BOOLEAN DEFAULT false,
  share_summary_only BOOLEAN DEFAULT true,
  share_media BOOLEAN DEFAULT false,
  share_attribution BOOLEAN DEFAULT true,    -- Show storyteller name
  anonymous_sharing BOOLEAN DEFAULT false,   -- Share without attribution

  -- Cultural protocols
  cultural_restrictions JSONB DEFAULT '{}',
  requires_cultural_approval BOOLEAN DEFAULT false,
  cultural_approval_status TEXT CHECK (cultural_approval_status IN ('pending', 'approved', 'denied')),
  cultural_approver_id UUID REFERENCES profiles(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(story_id, app_id)
);

COMMENT ON TABLE story_syndication_consent IS 'Tracks storyteller consent for sharing stories with external applications';
COMMENT ON COLUMN story_syndication_consent.share_full_content IS 'If true, full story content is shared; otherwise only summary';
COMMENT ON COLUMN story_syndication_consent.anonymous_sharing IS 'If true, story is shared without storyteller attribution';
COMMENT ON COLUMN story_syndication_consent.cultural_restrictions IS 'JSON object with cultural protocol restrictions for this sharing';

-- Indexes for consent lookups
CREATE INDEX IF NOT EXISTS idx_story_syndication_consent_story
  ON story_syndication_consent(story_id);

CREATE INDEX IF NOT EXISTS idx_story_syndication_consent_storyteller
  ON story_syndication_consent(storyteller_id);

CREATE INDEX IF NOT EXISTS idx_story_syndication_consent_app
  ON story_syndication_consent(app_id);

CREATE INDEX IF NOT EXISTS idx_story_syndication_consent_granted
  ON story_syndication_consent(consent_granted)
  WHERE consent_granted = true;

-- ============================================================================
-- 3. STORY ACCESS LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS story_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES external_applications(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'embed', 'export')),
  accessed_at TIMESTAMPTZ DEFAULT now(),
  accessor_ip TEXT,
  accessor_user_agent TEXT,
  access_context JSONB                        -- Additional context
);

COMMENT ON TABLE story_access_log IS 'Audit trail for all external story access';
COMMENT ON COLUMN story_access_log.access_type IS 'Type of access: view, embed, or export';
COMMENT ON COLUMN story_access_log.access_context IS 'Additional context about the access (page URL, etc.)';

-- Indexes for access log queries
CREATE INDEX IF NOT EXISTS idx_story_access_log_story
  ON story_access_log(story_id);

CREATE INDEX IF NOT EXISTS idx_story_access_log_app
  ON story_access_log(app_id);

CREATE INDEX IF NOT EXISTS idx_story_access_log_accessed_at
  ON story_access_log(accessed_at DESC);

-- ============================================================================
-- 4. SYNDICATED STORIES VIEW
-- ============================================================================

CREATE OR REPLACE VIEW syndicated_stories AS
SELECT
  s.id AS story_id,
  s.title,
  CASE
    WHEN ssc.share_full_content THEN s.content
    ELSE s.summary
  END AS content,
  CASE
    WHEN ssc.share_attribution AND NOT ssc.anonymous_sharing THEN p.display_name
    ELSE 'Anonymous Storyteller'
  END AS storyteller_name,
  CASE
    WHEN ssc.share_attribution AND NOT ssc.anonymous_sharing THEN p.id
    ELSE NULL
  END AS storyteller_id,
  s.story_type,
  s.themes,
  s.created_at AS story_date,
  ea.id AS app_id,
  ea.app_name AS requesting_app,
  ssc.cultural_restrictions,
  ssc.share_media,
  ssc.consent_expires_at
FROM stories s
JOIN story_syndication_consent ssc ON s.id = ssc.story_id
JOIN external_applications ea ON ssc.app_id = ea.id
JOIN profiles p ON s.storyteller_id = p.id
WHERE
  ssc.consent_granted = true
  AND (ssc.consent_expires_at IS NULL OR ssc.consent_expires_at > now())
  AND ssc.consent_revoked_at IS NULL
  AND ea.is_active = true
  AND (NOT ssc.requires_cultural_approval OR ssc.cultural_approval_status = 'approved');

COMMENT ON VIEW syndicated_stories IS 'Stories available for external syndication with proper consent';

-- ============================================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE external_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_syndication_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_access_log ENABLE ROW LEVEL SECURITY;

-- External Applications: Only admins can manage, service role can read
CREATE POLICY "Service role can read external_applications"
  ON external_applications
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Authenticated users can view active apps"
  ON external_applications
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Story Syndication Consent: Storytellers manage their own consent
CREATE POLICY "Storytellers can view their consent records"
  ON story_syndication_consent
  FOR SELECT
  TO authenticated
  USING (storyteller_id = auth.uid());

CREATE POLICY "Storytellers can insert consent for their stories"
  ON story_syndication_consent
  FOR INSERT
  TO authenticated
  WITH CHECK (
    storyteller_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_id
      AND stories.storyteller_id = auth.uid()
    )
  );

CREATE POLICY "Storytellers can update their consent"
  ON story_syndication_consent
  FOR UPDATE
  TO authenticated
  USING (storyteller_id = auth.uid())
  WITH CHECK (storyteller_id = auth.uid());

CREATE POLICY "Storytellers can delete their consent"
  ON story_syndication_consent
  FOR DELETE
  TO authenticated
  USING (storyteller_id = auth.uid());

CREATE POLICY "Service role full access to consent"
  ON story_syndication_consent
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Story Access Log: Read-only for storytellers, service role can insert
CREATE POLICY "Storytellers can view access logs for their stories"
  ON story_access_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_id
      AND stories.storyteller_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert access logs"
  ON story_access_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can read access logs"
  ON story_access_log
  FOR SELECT
  TO service_role
  USING (true);

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Function to get stories available for a specific app
CREATE OR REPLACE FUNCTION get_syndicated_stories_for_app(target_app_name TEXT)
RETURNS TABLE (
  story_id UUID,
  title TEXT,
  content TEXT,
  storyteller_name TEXT,
  story_type TEXT,
  themes TEXT[],
  story_date TIMESTAMPTZ,
  cultural_restrictions JSONB,
  share_media BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ss.story_id,
    ss.title,
    ss.content,
    ss.storyteller_name,
    ss.story_type,
    ss.themes,
    ss.story_date,
    ss.cultural_restrictions,
    ss.share_media
  FROM syndicated_stories ss
  WHERE ss.requesting_app = target_app_name
  ORDER BY ss.story_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a story is syndicated to an app
CREATE OR REPLACE FUNCTION is_story_syndicated(p_story_id UUID, p_app_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM syndicated_stories ss
    WHERE ss.story_id = p_story_id
    AND ss.requesting_app = p_app_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get syndication stats for a storyteller
CREATE OR REPLACE FUNCTION get_storyteller_syndication_stats(p_storyteller_id UUID)
RETURNS TABLE (
  app_name TEXT,
  app_display_name TEXT,
  total_stories_shared BIGINT,
  total_views BIGINT,
  last_accessed TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ea.app_name,
    ea.app_display_name,
    COUNT(DISTINCT ssc.story_id)::BIGINT AS total_stories_shared,
    COALESCE(SUM(access_counts.view_count), 0)::BIGINT AS total_views,
    MAX(access_counts.last_access) AS last_accessed
  FROM external_applications ea
  LEFT JOIN story_syndication_consent ssc ON ea.id = ssc.app_id
    AND ssc.storyteller_id = p_storyteller_id
    AND ssc.consent_granted = true
    AND ssc.consent_revoked_at IS NULL
  LEFT JOIN (
    SELECT
      sal.app_id,
      sal.story_id,
      COUNT(*) AS view_count,
      MAX(sal.accessed_at) AS last_access
    FROM story_access_log sal
    JOIN stories s ON sal.story_id = s.id
    WHERE s.storyteller_id = p_storyteller_id
    GROUP BY sal.app_id, sal.story_id
  ) access_counts ON ea.id = access_counts.app_id AND ssc.story_id = access_counts.story_id
  WHERE ea.is_active = true
  GROUP BY ea.app_name, ea.app_display_name
  ORDER BY total_stories_shared DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to external_applications
DROP TRIGGER IF EXISTS update_external_applications_updated_at ON external_applications;
CREATE TRIGGER update_external_applications_updated_at
  BEFORE UPDATE ON external_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to story_syndication_consent
DROP TRIGGER IF EXISTS update_story_syndication_consent_updated_at ON story_syndication_consent;
CREATE TRIGGER update_story_syndication_consent_updated_at
  BEFORE UPDATE ON story_syndication_consent
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. SEED DATA (Example external applications)
-- ============================================================================

-- Insert example external applications (commented out - uncomment to seed)
-- INSERT INTO external_applications (app_name, app_display_name, app_description, api_key_hash, allowed_story_types)
-- VALUES
--   ('justicehub', 'JusticeHub', 'Legal advocacy and justice reinvestment platform', 'GENERATE_SECURE_KEY_HERE', ARRAY['testimony', 'case_study', 'advocacy', 'impact']),
--   ('curious_tractor', 'Curious Tractor', 'Agricultural community stories and knowledge sharing', 'GENERATE_SECURE_KEY_HERE', ARRAY['community', 'knowledge', 'practice', 'culture'])
-- ON CONFLICT (app_name) DO NOTHING;
