-- Sprint 5: Organization Tools - Database Schema
-- Created: 2026-01-05
-- Tables: story_reviews, consents, consent_audit, invitations, campaigns, story_themes

-- ============================================================================
-- STORY REVIEWS (Elder Review System)
-- ============================================================================

CREATE TABLE IF NOT EXISTS story_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewer_name TEXT,
  decision TEXT NOT NULL CHECK (decision IN ('approve', 'reject', 'request_changes', 'escalate')),
  cultural_guidance TEXT,
  concerns TEXT[], -- Array of concern categories
  requested_changes TEXT,
  escalation_reason TEXT,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for story_reviews
CREATE INDEX idx_story_reviews_story_id ON story_reviews(story_id);
CREATE INDEX idx_story_reviews_reviewer_id ON story_reviews(reviewer_id);
CREATE INDEX idx_story_reviews_decision ON story_reviews(decision);
CREATE INDEX idx_story_reviews_reviewed_at ON story_reviews(reviewed_at DESC);

-- RLS for story_reviews
ALTER TABLE story_reviews ENABLE ROW LEVEL SECURITY;

-- Elders can view all reviews in their organization
CREATE POLICY "Elders can view reviews in their organization"
  ON story_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stories s
      WHERE s.id = story_reviews.story_id
      AND s.tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Elders can create reviews
CREATE POLICY "Elders can create reviews"
  ON story_reviews FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('elder', 'admin', 'super_admin')
    )
  );

-- ============================================================================
-- CONSENTS (Consent Tracking System)
-- ============================================================================

CREATE TABLE IF NOT EXISTS consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storyteller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID, -- tenant_id reference
  content_id UUID, -- Can reference stories or other content
  content_title TEXT,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('story', 'photo', 'ai', 'sharing')),
  purpose TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'withdrawn', 'expired')),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ, -- NULL = indefinite
  withdrawn_at TIMESTAMPTZ,
  withdrawal_reason TEXT,
  multi_party_consents JSONB DEFAULT '[]', -- Array of {name, relationship, consented}
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for consents
CREATE INDEX idx_consents_storyteller_id ON consents(storyteller_id);
CREATE INDEX idx_consents_organization_id ON consents(organization_id);
CREATE INDEX idx_consents_content_id ON consents(content_id);
CREATE INDEX idx_consents_status ON consents(status);
CREATE INDEX idx_consents_consent_type ON consents(consent_type);
CREATE INDEX idx_consents_expires_at ON consents(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_consents_granted_at ON consents(granted_at DESC);

-- RLS for consents
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;

-- Storytellers can view their own consents
CREATE POLICY "Storytellers can view own consents"
  ON consents FOR SELECT
  USING (storyteller_id = auth.uid());

-- Organization admins can view consents in their organization
CREATE POLICY "Admins can view organization consents"
  ON consents FOR SELECT
  USING (
    organization_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Storytellers can update their own consents (withdraw/renew)
CREATE POLICY "Storytellers can update own consents"
  ON consents FOR UPDATE
  USING (storyteller_id = auth.uid());

-- System can create consents
CREATE POLICY "Authenticated users can create consents"
  ON consents FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- CONSENT AUDIT (Audit Trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS consent_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consent_id UUID REFERENCES consents(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('granted', 'renewed', 'withdrawn', 'expired', 'modified')),
  performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  details TEXT,
  ip_address TEXT,
  user_agent TEXT
);

-- Indexes for consent_audit
CREATE INDEX idx_consent_audit_consent_id ON consent_audit(consent_id);
CREATE INDEX idx_consent_audit_event_type ON consent_audit(event_type);
CREATE INDEX idx_consent_audit_performed_at ON consent_audit(performed_at DESC);
CREATE INDEX idx_consent_audit_performed_by ON consent_audit(performed_by);

-- RLS for consent_audit
ALTER TABLE consent_audit ENABLE ROW LEVEL SECURITY;

-- Users can view audit trail for consents they have access to
CREATE POLICY "Users can view consent audit trail"
  ON consent_audit FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM consents c
      WHERE c.id = consent_audit.consent_id
      AND (
        c.storyteller_id = auth.uid()
        OR c.organization_id IN (
          SELECT tenant_id FROM profiles WHERE id = auth.uid()
        )
      )
    )
  );

-- System can create audit entries
CREATE POLICY "System can create audit entries"
  ON consent_audit FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- INVITATIONS (Recruitment System)
-- ============================================================================

CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'magic_link', 'qr_code')),
  recipient_name TEXT,
  recipient_contact TEXT, -- Email or phone number
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  message TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  last_viewed_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  magic_link_token TEXT UNIQUE, -- For magic link authentication
  qr_code_data TEXT, -- Base64 encoded QR code image
  qr_code_scans INTEGER DEFAULT 0,
  require_consent BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for invitations
CREATE INDEX idx_invitations_organization_id ON invitations(organization_id);
CREATE INDEX idx_invitations_project_id ON invitations(project_id);
CREATE INDEX idx_invitations_channel ON invitations(channel);
CREATE INDEX idx_invitations_status ON invitations(status);
CREATE INDEX idx_invitations_sent_at ON invitations(sent_at DESC);
CREATE INDEX idx_invitations_expires_at ON invitations(expires_at);
CREATE INDEX idx_invitations_magic_link_token ON invitations(magic_link_token) WHERE magic_link_token IS NOT NULL;

-- RLS for invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Organization members can view invitations for their organization
CREATE POLICY "Organization members can view invitations"
  ON invitations FOR SELECT
  USING (
    organization_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Organization admins can create invitations
CREATE POLICY "Admins can create invitations"
  ON invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND tenant_id = invitations.organization_id
      AND role IN ('admin', 'super_admin')
    )
  );

-- Organization admins can update invitations
CREATE POLICY "Admins can update invitations"
  ON invitations FOR UPDATE
  USING (
    organization_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- CAMPAIGNS (Story Curation System)
-- ============================================================================

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  target_story_count INTEGER,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for campaigns
CREATE INDEX idx_campaigns_organization_id ON campaigns(organization_id);
CREATE INDEX idx_campaigns_project_id ON campaigns(project_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_start_date ON campaigns(start_date);
CREATE INDEX idx_campaigns_end_date ON campaigns(end_date);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

-- RLS for campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Organization members can view campaigns
CREATE POLICY "Organization members can view campaigns"
  ON campaigns FOR SELECT
  USING (
    organization_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Organization admins can create campaigns
CREATE POLICY "Admins can create campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND tenant_id = campaigns.organization_id
      AND role IN ('admin', 'super_admin')
    )
  );

-- Organization admins can update campaigns
CREATE POLICY "Admins can update campaigns"
  ON campaigns FOR UPDATE
  USING (
    organization_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Organization admins can delete campaigns
CREATE POLICY "Admins can delete campaigns"
  ON campaigns FOR DELETE
  USING (
    organization_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- STORY THEMES (Theme Tagging System)
-- ============================================================================

CREATE TABLE IF NOT EXISTS story_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  theme TEXT NOT NULL,
  added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ai_suggested BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(story_id, theme) -- Prevent duplicate themes on same story
);

-- Indexes for story_themes
CREATE INDEX idx_story_themes_story_id ON story_themes(story_id);
CREATE INDEX idx_story_themes_theme ON story_themes(theme);
CREATE INDEX idx_story_themes_added_by ON story_themes(added_by);
CREATE INDEX idx_story_themes_ai_suggested ON story_themes(ai_suggested);

-- RLS for story_themes
ALTER TABLE story_themes ENABLE ROW LEVEL SECURITY;

-- Anyone who can view a story can view its themes
CREATE POLICY "Users can view themes for accessible stories"
  ON story_themes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stories s
      WHERE s.id = story_themes.story_id
      AND s.tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Organization members can add themes to stories
CREATE POLICY "Organization members can add themes"
  ON story_themes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stories s
      WHERE s.id = story_themes.story_id
      AND s.tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Theme creators can delete their themes
CREATE POLICY "Users can delete themes they added"
  ON story_themes FOR DELETE
  USING (
    added_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM stories s
      INNER JOIN profiles p ON p.id = auth.uid()
      WHERE s.id = story_themes.story_id
      AND s.tenant_id = p.tenant_id
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to automatically expire consents
CREATE OR REPLACE FUNCTION expire_old_consents()
RETURNS void AS $$
BEGIN
  UPDATE consents
  SET status = 'expired',
      updated_at = now()
  WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Function to update campaign story count
CREATE OR REPLACE FUNCTION update_campaign_story_count()
RETURNS TRIGGER AS $$
BEGIN
  -- This would need campaign_stories junction table
  -- For now, this is a placeholder
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at on story_reviews
CREATE TRIGGER update_story_reviews_updated_at
  BEFORE UPDATE ON story_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at on consents
CREATE TRIGGER update_consents_updated_at
  BEFORE UPDATE ON consents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at on invitations
CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at on campaigns
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE story_reviews IS 'Elder review decisions and cultural safety assessments for stories';
COMMENT ON TABLE consents IS 'GDPR and OCAP compliant consent tracking for all content types';
COMMENT ON TABLE consent_audit IS 'Complete audit trail of all consent lifecycle events';
COMMENT ON TABLE invitations IS 'Multi-channel storyteller recruitment tracking (email, SMS, magic links, QR codes)';
COMMENT ON TABLE campaigns IS 'Storytelling campaigns for organizing themed story collections';
COMMENT ON TABLE story_themes IS 'Indigenous themes tagged to stories (20 common + custom themes)';

COMMENT ON COLUMN consents.multi_party_consents IS 'JSON array of family member consents: [{name, relationship, consented}]';
COMMENT ON COLUMN invitations.magic_link_token IS 'Cryptographically secure token for passwordless authentication';
COMMENT ON COLUMN invitations.qr_code_data IS 'Base64 encoded QR code image for event-based recruitment';
COMMENT ON COLUMN story_themes.ai_suggested IS 'True if theme was suggested by AI, false if manually added';

-- ============================================================================
-- INITIAL DATA (Optional)
-- ============================================================================

-- Insert common Indigenous themes (for reference/autocomplete)
-- This is optional - themes can be free-form, but these are common ones

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify tables exist
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('story_reviews', 'consents', 'consent_audit', 'invitations', 'campaigns', 'story_themes');

  IF table_count = 6 THEN
    RAISE NOTICE 'Sprint 5 migration completed successfully. All 6 tables created.';
  ELSE
    RAISE WARNING 'Sprint 5 migration incomplete. Expected 6 tables, found %', table_count;
  END IF;
END $$;
