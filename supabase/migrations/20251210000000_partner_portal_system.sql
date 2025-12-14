-- Partner Portal System
-- Enables scalable self-service story syndication for partners like ACT, JusticeHub

-- ============================================
-- PARTNER PROJECTS
-- Collections of stories for specific campaigns/purposes
-- ============================================

CREATE TABLE IF NOT EXISTS partner_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES external_applications(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL,

  -- Configuration
  themes TEXT[] DEFAULT '{}',
  story_types TEXT[] DEFAULT '{}',
  geographic_focus TEXT,

  -- Display preferences
  show_storyteller_names BOOLEAN DEFAULT true,
  show_storyteller_photos BOOLEAN DEFAULT true,
  allow_full_content BOOLEAN DEFAULT true,
  custom_branding JSONB DEFAULT '{}',

  -- Embed settings
  embed_config JSONB DEFAULT '{
    "layout": "grid",
    "columns": 3,
    "theme": "light",
    "showFilters": true,
    "limit": 12
  }',

  -- Status
  is_active BOOLEAN DEFAULT true,
  stories_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(app_id, slug)
);

-- ============================================
-- STORY SYNDICATION REQUESTS
-- Partners request stories, storytellers approve/decline
-- ============================================

CREATE TABLE IF NOT EXISTS story_syndication_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES partner_projects(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES external_applications(id) ON DELETE CASCADE,

  -- Request details
  requested_by UUID REFERENCES auth.users(id),
  request_message TEXT,
  requested_at TIMESTAMPTZ DEFAULT now(),

  -- Response
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'revoked', 'expired')),
  responded_at TIMESTAMPTZ,
  decline_reason TEXT,

  -- Link to consent when approved
  consent_id UUID REFERENCES story_syndication_consent(id),

  -- Expiry for pending requests
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days'),

  UNIQUE(story_id, project_id)
);

-- ============================================
-- PARTNER MESSAGES
-- Secure communication between partners and storytellers
-- ============================================

CREATE TABLE IF NOT EXISTS partner_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Thread tracking
  thread_id UUID NOT NULL DEFAULT gen_random_uuid(),
  parent_message_id UUID REFERENCES partner_messages(id),

  -- Participants
  app_id UUID NOT NULL REFERENCES external_applications(id) ON DELETE CASCADE,
  storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Sender info
  sender_type TEXT NOT NULL CHECK (sender_type IN ('partner', 'storyteller')),
  sender_user_id UUID REFERENCES auth.users(id),

  -- Content
  subject TEXT,
  content TEXT NOT NULL,
  content_html TEXT, -- Optional rich text

  -- Related context
  story_id UUID REFERENCES stories(id),
  project_id UUID REFERENCES partner_projects(id),
  request_id UUID REFERENCES story_syndication_requests(id),

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  is_archived BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Metadata (for templates, etc.)
  metadata JSONB DEFAULT '{}'
);

-- ============================================
-- PARTNER TEAM MEMBERS
-- Multiple users can manage a partner account
-- ============================================

CREATE TABLE IF NOT EXISTS partner_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES external_applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),

  -- Invitation tracking
  invited_by UUID REFERENCES auth.users(id),
  invited_email TEXT,
  invitation_token UUID DEFAULT gen_random_uuid(),
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,

  -- Permissions (granular)
  permissions JSONB DEFAULT '{
    "can_manage_projects": true,
    "can_request_stories": true,
    "can_send_messages": true,
    "can_view_analytics": true,
    "can_manage_team": false,
    "can_manage_settings": false
  }',

  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(app_id, user_id)
);

-- ============================================
-- PARTNER ANALYTICS
-- Daily aggregated metrics per partner/project
-- ============================================

CREATE TABLE IF NOT EXISTS partner_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES external_applications(id) ON DELETE CASCADE,
  project_id UUID REFERENCES partner_projects(id),
  date DATE NOT NULL,

  -- Engagement metrics
  total_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  total_read_time_seconds INTEGER DEFAULT 0,
  avg_scroll_depth NUMERIC(5,2),
  shares INTEGER DEFAULT 0,
  clicks_to_empathy_ledger INTEGER DEFAULT 0,

  -- Story metrics
  stories_displayed INTEGER DEFAULT 0,
  stories_with_engagement INTEGER DEFAULT 0,

  -- Top performing
  top_stories JSONB DEFAULT '[]', -- [{id, title, views}]

  -- Geographic data
  top_countries JSONB DEFAULT '[]', -- [{country, views}]
  top_cities JSONB DEFAULT '[]', -- [{city, country, views}]

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create unique index with COALESCE to handle NULL project_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_partner_analytics_daily_unique
ON partner_analytics_daily(app_id, COALESCE(project_id, '00000000-0000-0000-0000-000000000000'::uuid), date);

-- ============================================
-- MESSAGE TEMPLATES
-- Pre-approved templates for common partner requests
-- ============================================

CREATE TABLE IF NOT EXISTS partner_message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'request', 'follow_up', 'thank_you', 'impact')),

  -- Variables that can be substituted
  variables TEXT[] DEFAULT '{}', -- ['storyteller_name', 'story_title', 'project_name']

  -- Usage tracking
  times_used INTEGER DEFAULT 0,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default templates
INSERT INTO partner_message_templates (name, subject, content, category, variables) VALUES
(
  'Story Feature Request',
  'Request to feature your story: {{story_title}}',
  E'Hi {{storyteller_name}},\n\nWe''d love to feature your story "{{story_title}}" in our {{project_name}} project.\n\nThis would help amplify your voice and reach a wider audience through our platform. You can approve or decline this request directly from your Empathy Ledger dashboard.\n\nThank you for sharing your story with the world.\n\nBest regards,\n{{partner_name}}',
  'request',
  ARRAY['storyteller_name', 'story_title', 'project_name', 'partner_name']
),
(
  'Impact Update',
  'Your story''s impact: {{story_title}}',
  E'Hi {{storyteller_name}},\n\nWe wanted to share some exciting news about your story "{{story_title}}"!\n\nIn the past month, your story has:\n• Been viewed {{view_count}} times on our platform\n• Reached people in {{reach_locations}}\n• Average read time: {{avg_read_time}}\n\nThank you for sharing your story and making a difference.\n\nBest regards,\n{{partner_name}}',
  'impact',
  ARRAY['storyteller_name', 'story_title', 'view_count', 'reach_locations', 'avg_read_time', 'partner_name']
),
(
  'Thank You',
  'Thank you for sharing your story',
  E'Hi {{storyteller_name}},\n\nWe wanted to express our sincere gratitude for allowing us to feature your story "{{story_title}}" on our platform.\n\nStories like yours help create understanding and drive positive change. We''re honored to help amplify your voice.\n\nIf you ever have questions or want to share updates about your story, please don''t hesitate to reach out.\n\nWith gratitude,\n{{partner_name}}',
  'thank_you',
  ARRAY['storyteller_name', 'story_title', 'partner_name']
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_partner_projects_app ON partner_projects(app_id);
CREATE INDEX IF NOT EXISTS idx_partner_projects_active ON partner_projects(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_story_requests_story ON story_syndication_requests(story_id);
CREATE INDEX IF NOT EXISTS idx_story_requests_project ON story_syndication_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_story_requests_app ON story_syndication_requests(app_id);
CREATE INDEX IF NOT EXISTS idx_story_requests_status ON story_syndication_requests(status);
CREATE INDEX IF NOT EXISTS idx_story_requests_pending ON story_syndication_requests(status, expires_at) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_partner_messages_thread ON partner_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_partner_messages_storyteller ON partner_messages(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_partner_messages_app ON partner_messages(app_id);
CREATE INDEX IF NOT EXISTS idx_partner_messages_unread ON partner_messages(storyteller_id, is_read) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_partner_team_user ON partner_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_team_app ON partner_team_members(app_id);
CREATE INDEX IF NOT EXISTS idx_partner_team_invitation ON partner_team_members(invitation_token) WHERE accepted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_partner_analytics_date ON partner_analytics_daily(app_id, date);
CREATE INDEX IF NOT EXISTS idx_partner_analytics_project ON partner_analytics_daily(project_id, date);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE partner_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_syndication_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_analytics_daily ENABLE ROW LEVEL SECURITY;

-- Partners can manage their own projects
DROP POLICY IF EXISTS partner_projects_select ON partner_projects;
CREATE POLICY partner_projects_select ON partner_projects
  FOR SELECT USING (
    app_id IN (SELECT app_id FROM partner_team_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS partner_projects_insert ON partner_projects;
CREATE POLICY partner_projects_insert ON partner_projects
  FOR INSERT WITH CHECK (
    app_id IN (
      SELECT app_id FROM partner_team_members
      WHERE user_id = auth.uid()
      AND (role IN ('owner', 'admin') OR (permissions->>'can_manage_projects')::boolean = true)
    )
  );

DROP POLICY IF EXISTS partner_projects_update ON partner_projects;
CREATE POLICY partner_projects_update ON partner_projects
  FOR UPDATE USING (
    app_id IN (
      SELECT app_id FROM partner_team_members
      WHERE user_id = auth.uid()
      AND (role IN ('owner', 'admin') OR (permissions->>'can_manage_projects')::boolean = true)
    )
  );

-- Story requests: partners and storytellers can see relevant requests
DROP POLICY IF EXISTS story_requests_partner ON story_syndication_requests;
CREATE POLICY story_requests_partner ON story_syndication_requests
  FOR ALL USING (
    app_id IN (SELECT app_id FROM partner_team_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS story_requests_storyteller ON story_syndication_requests;
CREATE POLICY story_requests_storyteller ON story_syndication_requests
  FOR SELECT USING (
    story_id IN (
      SELECT s.id FROM stories s
      WHERE s.storyteller_id = auth.uid() OR s.author_id = auth.uid()
    )
  );

-- Messages: partners and storytellers see their conversations
DROP POLICY IF EXISTS partner_messages_partner ON partner_messages;
CREATE POLICY partner_messages_partner ON partner_messages
  FOR ALL USING (
    app_id IN (SELECT app_id FROM partner_team_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS partner_messages_storyteller ON partner_messages;
CREATE POLICY partner_messages_storyteller ON partner_messages
  FOR ALL USING (
    storyteller_id = auth.uid()
  );

-- Team members can see their team
DROP POLICY IF EXISTS partner_team_select ON partner_team_members;
CREATE POLICY partner_team_select ON partner_team_members
  FOR SELECT USING (
    app_id IN (SELECT app_id FROM partner_team_members WHERE user_id = auth.uid())
    OR user_id = auth.uid()
  );

-- Only owners/admins can manage team
DROP POLICY IF EXISTS partner_team_manage ON partner_team_members;
CREATE POLICY partner_team_manage ON partner_team_members
  FOR ALL USING (
    app_id IN (
      SELECT app_id FROM partner_team_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Analytics: partners see their own data
DROP POLICY IF EXISTS partner_analytics_select ON partner_analytics_daily;
CREATE POLICY partner_analytics_select ON partner_analytics_daily
  FOR SELECT USING (
    app_id IN (SELECT app_id FROM partner_team_members WHERE user_id = auth.uid())
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update stories_count on partner_projects when requests change
CREATE OR REPLACE FUNCTION update_project_stories_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the count for affected project
  UPDATE partner_projects
  SET stories_count = (
    SELECT COUNT(*) FROM story_syndication_requests
    WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
    AND status = 'approved'
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_project_stories_count ON story_syndication_requests;
CREATE TRIGGER trigger_update_project_stories_count
AFTER INSERT OR UPDATE OR DELETE ON story_syndication_requests
FOR EACH ROW EXECUTE FUNCTION update_project_stories_count();

-- Auto-create consent record when request is approved
CREATE OR REPLACE FUNCTION handle_request_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Create consent record
    INSERT INTO story_syndication_consent (
      story_id,
      app_id,
      consent_granted,
      share_full_content,
      share_summary_only,
      consent_granted_at
    ) VALUES (
      NEW.story_id,
      NEW.app_id,
      true,
      (SELECT allow_full_content FROM partner_projects WHERE id = NEW.project_id),
      NOT (SELECT allow_full_content FROM partner_projects WHERE id = NEW.project_id),
      now()
    )
    ON CONFLICT (story_id, app_id) DO UPDATE SET
      consent_granted = true,
      consent_revoked_at = NULL,
      consent_granted_at = now()
    RETURNING id INTO NEW.consent_id;

    NEW.responded_at = now();
  END IF;

  IF NEW.status = 'revoked' AND OLD.status = 'approved' THEN
    -- Update consent record
    UPDATE story_syndication_consent
    SET consent_granted = false,
        consent_revoked_at = now()
    WHERE id = OLD.consent_id;

    NEW.responded_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_handle_request_approval ON story_syndication_requests;
CREATE TRIGGER trigger_handle_request_approval
BEFORE UPDATE ON story_syndication_requests
FOR EACH ROW EXECUTE FUNCTION handle_request_approval();

-- Auto-expire pending requests
CREATE OR REPLACE FUNCTION expire_pending_requests()
RETURNS void AS $$
BEGIN
  UPDATE story_syndication_requests
  SET status = 'expired'
  WHERE status = 'pending'
  AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- EXTENSION TO EXTERNAL_APPLICATIONS
-- Add portal-specific fields
-- ============================================

ALTER TABLE external_applications
ADD COLUMN IF NOT EXISTS portal_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS portal_settings JSONB DEFAULT '{
  "allow_story_requests": true,
  "allow_storyteller_messaging": true,
  "require_approval_for_requests": false,
  "max_pending_requests": 50,
  "branding": {}
}',
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Partner dashboard summary
CREATE OR REPLACE VIEW partner_dashboard_summary AS
SELECT
  ptm.app_id,
  ptm.user_id,
  ea.app_name,
  (SELECT COUNT(*) FROM partner_projects WHERE app_id = ptm.app_id AND is_active = true) as active_projects,
  (SELECT COUNT(*) FROM story_syndication_requests WHERE app_id = ptm.app_id AND status = 'approved') as approved_stories,
  (SELECT COUNT(*) FROM story_syndication_requests WHERE app_id = ptm.app_id AND status = 'pending') as pending_requests,
  (SELECT COUNT(*) FROM partner_messages WHERE app_id = ptm.app_id AND is_read = false AND sender_type = 'storyteller') as unread_messages,
  (SELECT SUM(total_views) FROM partner_analytics_daily WHERE app_id = ptm.app_id AND date >= CURRENT_DATE - interval '30 days') as views_30d
FROM partner_team_members ptm
JOIN external_applications ea ON ea.id = ptm.app_id
WHERE ptm.accepted_at IS NOT NULL;

COMMENT ON TABLE partner_projects IS 'Collections of stories organized by campaign, theme, or purpose for partner organizations';
COMMENT ON TABLE story_syndication_requests IS 'Requests from partners to feature stories, requiring storyteller approval';
COMMENT ON TABLE partner_messages IS 'Secure messaging between partners and storytellers without exposing contact info';
COMMENT ON TABLE partner_team_members IS 'Team members who can manage a partner organization account';
COMMENT ON TABLE partner_analytics_daily IS 'Daily aggregated engagement metrics per partner and project';
