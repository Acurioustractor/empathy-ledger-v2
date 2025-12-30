-- Migration: Campaign Management System
-- Description: Create campaigns as first-class entities with multi-tenant support
-- Phase: 4 - Campaign Management System
-- Date: 2025-12-26

-- ============================================================================
-- CAMPAIGNS TABLE
-- ============================================================================
-- Campaigns are coordinated storytelling initiatives with specific goals,
-- timelines, and communities. Examples: World Tour stops, community outreach,
-- partnership campaigns, collection drives, exhibitions.

CREATE TABLE IF NOT EXISTS campaigns (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenant isolation
  organization_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,

  -- Campaign identity
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  tagline TEXT,

  -- Status
  status TEXT NOT NULL CHECK (
    status IN ('draft', 'active', 'paused', 'completed', 'archived')
  ) DEFAULT 'draft',

  -- Campaign type
  campaign_type TEXT CHECK (
    campaign_type IN ('tour_stop', 'community_outreach', 'partnership', 'collection_drive', 'exhibition', 'other')
  ),

  -- Dates
  start_date DATE,
  end_date DATE,

  -- Location (physical campaigns)
  location_text TEXT,
  city TEXT,
  state_province TEXT,
  country TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Targets and goals
  storyteller_target INTEGER,
  story_target INTEGER,
  engagement_target INTEGER,

  -- Current metrics (updated via triggers)
  participant_count INTEGER DEFAULT 0,
  story_count INTEGER DEFAULT 0,
  workflow_count INTEGER DEFAULT 0,

  -- Visual identity
  cover_image_url TEXT,
  logo_url TEXT,
  theme_color TEXT,

  -- Partnership
  partner_organization_ids UUID[],  -- Array of organization IDs
  dream_organization_ids UUID[],     -- Links to dream_organizations table

  -- Engagement metrics (JSON for flexibility)
  engagement_metrics JSONB DEFAULT '{}',

  -- Workflow configuration
  requires_consent_workflow BOOLEAN DEFAULT TRUE,
  requires_elder_review BOOLEAN DEFAULT FALSE,
  consent_template_url TEXT,

  -- Cultural protocols
  cultural_protocols TEXT,
  traditional_territory TEXT,
  acknowledgment_text TEXT,

  -- Settings
  is_public BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  allow_self_registration BOOLEAN DEFAULT FALSE,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Audit fields
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT check_dates CHECK (end_date IS NULL OR end_date >= start_date),
  CONSTRAINT check_targets CHECK (
    storyteller_target IS NULL OR storyteller_target > 0
  )
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Primary lookups
CREATE INDEX idx_campaigns_tenant ON campaigns(tenant_id);
CREATE INDEX idx_campaigns_organization ON campaigns(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_campaigns_slug ON campaigns(slug);

-- Status and type filtering
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_type ON campaigns(campaign_type) WHERE campaign_type IS NOT NULL;

-- Date-based queries
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date) WHERE start_date IS NOT NULL;
CREATE INDEX idx_campaigns_active ON campaigns(status, start_date, end_date)
WHERE status = 'active';

-- Featured and public campaigns
CREATE INDEX idx_campaigns_featured ON campaigns(is_featured, is_public)
WHERE is_featured = TRUE AND is_public = TRUE;

-- Location-based queries
CREATE INDEX idx_campaigns_location ON campaigns(latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Composite for dashboard
CREATE INDEX idx_campaigns_tenant_status_created ON campaigns(tenant_id, status, created_at DESC);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE campaigns IS
'Coordinated storytelling initiatives: tour stops, outreach, partnerships, exhibitions';

COMMENT ON COLUMN campaigns.slug IS
'URL-friendly identifier, globally unique';

COMMENT ON COLUMN campaigns.campaign_type IS
'Type: tour_stop, community_outreach, partnership, collection_drive, exhibition, other';

COMMENT ON COLUMN campaigns.status IS
'Status: draft, active, paused, completed, archived';

COMMENT ON COLUMN campaigns.engagement_metrics IS
'Flexible JSON: views, shares, applications, registrations, event_attendance, etc.';

COMMENT ON COLUMN campaigns.metadata IS
'Campaign-specific data: tags, custom_fields, integrations, etc.';

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_campaign_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_campaign_timestamp
BEFORE UPDATE ON campaigns
FOR EACH ROW
EXECUTE FUNCTION update_campaign_timestamp();

-- ============================================================================
-- METRICS UPDATE TRIGGERS
-- ============================================================================

-- Update campaign participant count when workflow added/removed
CREATE OR REPLACE FUNCTION update_campaign_workflow_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.campaign_id IS NOT NULL THEN
    UPDATE campaigns
    SET workflow_count = workflow_count + 1
    WHERE id = NEW.campaign_id;
  ELSIF TG_OP = 'DELETE' AND OLD.campaign_id IS NOT NULL THEN
    UPDATE campaigns
    SET workflow_count = GREATEST(0, workflow_count - 1)
    WHERE id = OLD.campaign_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.campaign_id IS DISTINCT FROM NEW.campaign_id THEN
    -- Moved between campaigns
    IF OLD.campaign_id IS NOT NULL THEN
      UPDATE campaigns
      SET workflow_count = GREATEST(0, workflow_count - 1)
      WHERE id = OLD.campaign_id;
    END IF;
    IF NEW.campaign_id IS NOT NULL THEN
      UPDATE campaigns
      SET workflow_count = workflow_count + 1
      WHERE id = NEW.campaign_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trigger_campaign_workflow_count
AFTER INSERT OR UPDATE OR DELETE ON campaign_consent_workflows
FOR EACH ROW
EXECUTE FUNCTION update_campaign_workflow_count();

-- Update campaign story count when story linked to campaign
CREATE OR REPLACE FUNCTION update_campaign_story_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.campaign_id IS NOT NULL THEN
    UPDATE campaigns
    SET story_count = story_count + 1
    WHERE id = NEW.campaign_id;
  ELSIF TG_OP = 'DELETE' AND OLD.campaign_id IS NOT NULL THEN
    UPDATE campaigns
    SET story_count = GREATEST(0, story_count - 1)
    WHERE id = OLD.campaign_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.campaign_id IS DISTINCT FROM NEW.campaign_id THEN
    IF OLD.campaign_id IS NOT NULL THEN
      UPDATE campaigns
      SET story_count = GREATEST(0, story_count - 1)
      WHERE id = OLD.campaign_id;
    END IF;
    IF NEW.campaign_id IS NOT NULL THEN
      UPDATE campaigns
      SET story_count = story_count + 1
      WHERE id = NEW.campaign_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trigger_campaign_story_count
AFTER INSERT OR UPDATE OR DELETE ON stories
FOR EACH ROW
EXECUTE FUNCTION update_campaign_story_count();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Public campaigns visible to all
DROP POLICY IF EXISTS "campaigns_public_read" ON campaigns;
CREATE POLICY "campaigns_public_read" ON campaigns
FOR SELECT
USING (is_public = TRUE);

-- Tenant members can see all campaigns in their tenant
DROP POLICY IF EXISTS "campaigns_tenant_read" ON campaigns;
CREATE POLICY "campaigns_tenant_read" ON campaigns
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

-- Only admins, project leaders, and community reps can create campaigns
DROP POLICY IF EXISTS "campaigns_create" ON campaigns;
CREATE POLICY "campaigns_create" ON campaigns
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()) AND
  (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'project_leader') OR
    (SELECT is_community_representative FROM profiles WHERE id = auth.uid()) = TRUE
  )
);

-- Campaign creators, admins, and project leaders can update
DROP POLICY IF EXISTS "campaigns_update" ON campaigns;
CREATE POLICY "campaigns_update" ON campaigns
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND
  tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()) AND
  (
    created_by = auth.uid() OR
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'project_leader')
  )
);

-- Only admins can delete campaigns
DROP POLICY IF EXISTS "campaigns_delete" ON campaigns;
CREATE POLICY "campaigns_delete" ON campaigns
FOR DELETE
USING (
  auth.uid() IS NOT NULL AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Get campaign with full details
CREATE OR REPLACE FUNCTION get_campaign_details(p_campaign_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'campaign', row_to_json(c.*),
    'workflow_summary', (
      SELECT json_build_object(
        'total', COUNT(*),
        'by_stage', json_object_agg(stage, count)
      )
      FROM (
        SELECT stage, COUNT(*) as count
        FROM campaign_consent_workflows
        WHERE campaign_id = p_campaign_id
        GROUP BY stage
      ) s
    ),
    'story_themes', (
      SELECT json_agg(DISTINCT theme)
      FROM stories
      WHERE campaign_id = p_campaign_id AND theme IS NOT NULL
    ),
    'storyteller_count', (
      SELECT COUNT(DISTINCT storyteller_id)
      FROM campaign_consent_workflows
      WHERE campaign_id = p_campaign_id
    ),
    'completion_rate', (
      SELECT CASE
        WHEN c.storyteller_target > 0
        THEN ROUND((c.participant_count::DECIMAL / c.storyteller_target * 100), 2)
        ELSE NULL
      END
    )
  ) INTO v_result
  FROM campaigns c
  WHERE c.id = p_campaign_id;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION get_campaign_details IS
'Get comprehensive campaign details including workflow summary and metrics';

-- Function: Get active campaigns
CREATE OR REPLACE FUNCTION get_active_campaigns(
  p_tenant_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 10
)
RETURNS SETOF campaigns
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT c.*
  FROM campaigns c
  WHERE
    c.status = 'active'
    AND (p_tenant_id IS NULL OR c.tenant_id = p_tenant_id)
    AND (c.is_public = TRUE OR c.tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()))
  ORDER BY c.start_date DESC NULLS LAST, c.created_at DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION get_active_campaigns IS
'Get active campaigns for a tenant, respecting privacy settings';

-- Function: Generate unique campaign slug
CREATE OR REPLACE FUNCTION generate_campaign_slug(p_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_base_slug TEXT;
  v_slug TEXT;
  v_counter INT := 1;
BEGIN
  -- Convert name to slug format
  v_base_slug := lower(regexp_replace(p_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_base_slug := trim(both '-' from v_base_slug);
  v_slug := v_base_slug;

  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM campaigns WHERE slug = v_slug) LOOP
    v_slug := v_base_slug || '-' || v_counter;
    v_counter := v_counter + 1;
  END LOOP;

  RETURN v_slug;
END;
$$;

COMMENT ON FUNCTION generate_campaign_slug IS
'Generate unique URL-friendly slug from campaign name';

-- ============================================================================
-- LINK EXISTING TOUR STOPS TO CAMPAIGNS
-- ============================================================================

-- Add campaign_id to tour_stops if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tour_stops' AND column_name = 'campaign_id'
  ) THEN
    ALTER TABLE tour_stops ADD COLUMN campaign_id UUID REFERENCES campaigns(id);
    CREATE INDEX idx_tour_stops_campaign ON tour_stops(campaign_id) WHERE campaign_id IS NOT NULL;
  END IF;
END $$;

-- Add campaign_id to stories if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stories' AND column_name = 'campaign_id'
  ) THEN
    ALTER TABLE stories ADD COLUMN campaign_id UUID REFERENCES campaigns(id);
    CREATE INDEX idx_stories_campaign ON stories(campaign_id) WHERE campaign_id IS NOT NULL;
  END IF;
END $$;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Campaign dashboard summary
CREATE OR REPLACE VIEW campaign_dashboard_summary AS
SELECT
  c.id,
  c.name,
  c.slug,
  c.status,
  c.campaign_type,
  c.start_date,
  c.end_date,
  c.storyteller_target,
  c.story_target,
  c.participant_count,
  c.story_count,
  c.workflow_count,
  -- Progress percentages
  CASE
    WHEN c.storyteller_target > 0
    THEN ROUND((c.participant_count::DECIMAL / c.storyteller_target * 100), 2)
    ELSE NULL
  END as storyteller_progress,
  CASE
    WHEN c.story_target > 0
    THEN ROUND((c.story_count::DECIMAL / c.story_target * 100), 2)
    ELSE NULL
  END as story_progress,
  -- Workflow stats
  (
    SELECT COUNT(*)
    FROM campaign_consent_workflows w
    WHERE w.campaign_id = c.id AND w.stage = 'published'
  ) as published_count,
  (
    SELECT COUNT(*)
    FROM campaign_consent_workflows w
    WHERE w.campaign_id = c.id AND w.stage IN ('recorded', 'reviewed')
  ) as pending_publication,
  -- Dates
  CASE
    WHEN c.end_date IS NOT NULL
    THEN c.end_date - CURRENT_DATE
    ELSE NULL
  END as days_remaining,
  c.created_at,
  c.updated_at,
  c.tenant_id
FROM campaigns c;

COMMENT ON VIEW campaign_dashboard_summary IS
'Dashboard view with calculated metrics and progress percentages';

-- ============================================================================
-- AUDIT LOGGING
-- ============================================================================

CREATE OR REPLACE FUNCTION log_campaign_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (
      entity_type,
      entity_id,
      action,
      changes,
      performed_by,
      tenant_id,
      created_at
    ) VALUES (
      'campaign',
      NEW.id,
      'created',
      jsonb_build_object(
        'name', NEW.name,
        'campaign_type', NEW.campaign_type,
        'status', NEW.status
      ),
      auth.uid(),
      NEW.tenant_id,
      NOW()
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log significant changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO audit_log (
        entity_type,
        entity_id,
        action,
        changes,
        performed_by,
        tenant_id,
        created_at
      ) VALUES (
        'campaign',
        NEW.id,
        'status_changed',
        jsonb_build_object(
          'old_status', OLD.status,
          'new_status', NEW.status
        ),
        auth.uid(),
        NEW.tenant_id,
        NOW()
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_log_campaign_changes ON campaigns;

CREATE TRIGGER trigger_log_campaign_changes
AFTER INSERT OR UPDATE ON campaigns
FOR EACH ROW
EXECUTE FUNCTION log_campaign_changes();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'campaigns'
  ) THEN
    RAISE EXCEPTION 'Migration failed: campaigns table not created';
  END IF;

  RAISE NOTICE 'Campaign management system migration completed successfully';
END $$;
