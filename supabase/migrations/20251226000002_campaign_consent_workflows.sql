-- Migration: Campaign Consent Workflow System
-- Description: Track storytellers through campaign consent and story capture stages
-- Phase: 3 - Workflow & Consent Enhancements
-- Date: 2025-12-26

-- ============================================================================
-- CAMPAIGN CONSENT WORKFLOW TABLE
-- ============================================================================
-- Tracks each storyteller's journey through a campaign from invitation to publication
-- Provides visual pipeline for campaign coordinators to manage consent and story capture

CREATE TABLE IF NOT EXISTS campaign_consent_workflows (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenant isolation
  tenant_id UUID NOT NULL,

  -- Relationships
  campaign_id UUID,  -- NULL initially, will link to campaigns table in Phase 4
  storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,

  -- Workflow stage tracking
  stage TEXT NOT NULL CHECK (
    stage IN ('invited', 'interested', 'consented', 'recorded', 'reviewed', 'published', 'withdrawn')
  ) DEFAULT 'invited',
  stage_changed_at TIMESTAMPTZ DEFAULT NOW(),
  previous_stage TEXT,

  -- Contact and outreach tracking
  invitation_sent_at TIMESTAMPTZ,
  invitation_method TEXT CHECK (
    invitation_method IS NULL OR
    invitation_method IN ('email', 'phone', 'in_person', 'social_media', 'postal_mail', 'other')
  ),
  first_response_at TIMESTAMPTZ,

  -- Consent tracking
  consent_granted_at TIMESTAMPTZ,
  consent_form_url TEXT,  -- Link to signed consent document
  consent_verified_by UUID REFERENCES auth.users(id),

  -- Story capture tracking
  story_recorded_at TIMESTAMPTZ,
  recording_location TEXT,
  recording_method TEXT CHECK (
    recording_method IS NULL OR
    recording_method IN ('audio', 'video', 'written', 'interview', 'self_recorded')
  ),

  -- Review and publication
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  elder_review_required BOOLEAN DEFAULT FALSE,
  elder_reviewed_at TIMESTAMPTZ,
  elder_reviewed_by UUID REFERENCES profiles(id),
  published_at TIMESTAMPTZ,

  -- Withdrawal tracking
  withdrawn_at TIMESTAMPTZ,
  withdrawal_reason TEXT,
  withdrawal_handled_by UUID REFERENCES auth.users(id),

  -- Metadata and notes
  notes TEXT,
  metadata JSONB DEFAULT '{}',

  -- Follow-up tracking
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  follow_up_notes TEXT,

  -- Audit fields
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT check_consent_before_recording CHECK (
    stage != 'recorded' OR consent_granted_at IS NOT NULL
  ),
  CONSTRAINT check_reviewed_before_published CHECK (
    stage != 'published' OR reviewed_at IS NOT NULL
  )
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Primary lookup indexes
CREATE INDEX idx_campaign_workflows_campaign ON campaign_consent_workflows(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX idx_campaign_workflows_storyteller ON campaign_consent_workflows(storyteller_id);
CREATE INDEX idx_campaign_workflows_story ON campaign_consent_workflows(story_id) WHERE story_id IS NOT NULL;

-- Stage and status indexes
CREATE INDEX idx_campaign_workflows_stage ON campaign_consent_workflows(stage);
CREATE INDEX idx_campaign_workflows_tenant_stage ON campaign_consent_workflows(tenant_id, stage);

-- Date-based indexes for querying by timeline
CREATE INDEX idx_campaign_workflows_invitation_sent ON campaign_consent_workflows(invitation_sent_at) WHERE invitation_sent_at IS NOT NULL;
CREATE INDEX idx_campaign_workflows_consent_granted ON campaign_consent_workflows(consent_granted_at) WHERE consent_granted_at IS NOT NULL;
CREATE INDEX idx_campaign_workflows_published ON campaign_consent_workflows(published_at) WHERE published_at IS NOT NULL;

-- Follow-up index
CREATE INDEX idx_campaign_workflows_follow_up ON campaign_consent_workflows(follow_up_date)
WHERE follow_up_required = TRUE AND follow_up_date IS NOT NULL;

-- Elder review queue index
CREATE INDEX idx_campaign_workflows_elder_review ON campaign_consent_workflows(elder_review_required, elder_reviewed_at)
WHERE elder_review_required = TRUE AND elder_reviewed_at IS NULL;

-- Composite index for dashboard queries
CREATE INDEX idx_campaign_workflows_campaign_stage_created ON campaign_consent_workflows(campaign_id, stage, created_at DESC)
WHERE campaign_id IS NOT NULL;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE campaign_consent_workflows IS
'Tracks storyteller journey through campaign from invitation to publication with consent verification';

COMMENT ON COLUMN campaign_consent_workflows.stage IS
'Current stage: invited → interested → consented → recorded → reviewed → published (or withdrawn)';

COMMENT ON COLUMN campaign_consent_workflows.campaign_id IS
'Links to campaigns table (Phase 4). NULL for non-campaign workflows';

COMMENT ON COLUMN campaign_consent_workflows.consent_form_url IS
'URL to signed consent document (stored in secure storage)';

COMMENT ON COLUMN campaign_consent_workflows.elder_review_required IS
'True if cultural protocols require Elder review before publication';

COMMENT ON COLUMN campaign_consent_workflows.metadata IS
'Flexible JSON for campaign-specific data: preferred_interview_date, language_preference, accessibility_needs, etc.';

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_campaign_workflow_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();

  -- Track stage changes
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    NEW.stage_changed_at = NOW();
    NEW.previous_stage = OLD.stage;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_campaign_workflow_timestamp
BEFORE UPDATE ON campaign_consent_workflows
FOR EACH ROW
EXECUTE FUNCTION update_campaign_workflow_timestamp();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE campaign_consent_workflows ENABLE ROW LEVEL SECURITY;

-- View: Users can see workflows in their tenant
DROP POLICY IF EXISTS "campaign_workflows_tenant_read" ON campaign_consent_workflows;
CREATE POLICY "campaign_workflows_tenant_read" ON campaign_consent_workflows
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

-- Insert: Project leaders, admins, elders, and community representatives can create workflows
DROP POLICY IF EXISTS "campaign_workflows_create" ON campaign_consent_workflows;
CREATE POLICY "campaign_workflows_create" ON campaign_consent_workflows
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()) AND
  (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'elder', 'project_leader') OR
    (SELECT is_community_representative FROM profiles WHERE id = auth.uid()) = TRUE
  )
);

-- Update: Same roles can update, plus storytellers can update their own workflow
DROP POLICY IF EXISTS "campaign_workflows_update" ON campaign_consent_workflows;
CREATE POLICY "campaign_workflows_update" ON campaign_consent_workflows
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND
  tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()) AND
  (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'elder', 'project_leader') OR
    (SELECT is_community_representative FROM profiles WHERE id = auth.uid()) = TRUE OR
    storyteller_id = auth.uid()
  )
);

-- Delete: Only admins can delete workflows
DROP POLICY IF EXISTS "campaign_workflows_delete" ON campaign_consent_workflows;
CREATE POLICY "campaign_workflows_delete" ON campaign_consent_workflows
FOR DELETE
USING (
  auth.uid() IS NOT NULL AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Get workflow summary for a campaign
CREATE OR REPLACE FUNCTION get_campaign_workflow_summary(
  p_campaign_id UUID DEFAULT NULL,
  p_tenant_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tenant_id UUID;
  v_result JSON;
BEGIN
  -- Get user's tenant
  v_tenant_id := COALESCE(p_tenant_id, (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

  SELECT json_build_object(
    'total', COUNT(*),
    'by_stage', json_object_agg(stage, count),
    'invited', COUNT(*) FILTER (WHERE stage = 'invited'),
    'interested', COUNT(*) FILTER (WHERE stage = 'interested'),
    'consented', COUNT(*) FILTER (WHERE stage = 'consented'),
    'recorded', COUNT(*) FILTER (WHERE stage = 'recorded'),
    'reviewed', COUNT(*) FILTER (WHERE stage = 'reviewed'),
    'published', COUNT(*) FILTER (WHERE stage = 'published'),
    'withdrawn', COUNT(*) FILTER (WHERE stage = 'withdrawn'),
    'conversion_rate', ROUND(
      (COUNT(*) FILTER (WHERE stage = 'published')::DECIMAL /
       NULLIF(COUNT(*), 0) * 100), 2
    ),
    'pending_elder_review', COUNT(*) FILTER (WHERE elder_review_required = TRUE AND elder_reviewed_at IS NULL),
    'follow_ups_needed', COUNT(*) FILTER (WHERE follow_up_required = TRUE AND follow_up_date <= CURRENT_DATE)
  )
  INTO v_result
  FROM campaign_consent_workflows
  WHERE tenant_id = v_tenant_id
    AND (p_campaign_id IS NULL OR campaign_id = p_campaign_id);

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION get_campaign_workflow_summary IS
'Get workflow statistics by stage with conversion rates and pending items';

-- Function: Advance workflow stage
CREATE OR REPLACE FUNCTION advance_workflow_stage(
  p_workflow_id UUID,
  p_new_stage TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS campaign_consent_workflows
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_workflow campaign_consent_workflows;
  v_current_stage TEXT;
BEGIN
  -- Get current workflow
  SELECT * INTO v_workflow FROM campaign_consent_workflows WHERE id = p_workflow_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Workflow not found';
  END IF;

  -- Verify tenant access
  IF v_workflow.tenant_id != (SELECT tenant_id FROM profiles WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  v_current_stage := v_workflow.stage;

  -- Update workflow with new stage
  UPDATE campaign_consent_workflows
  SET
    stage = p_new_stage,
    notes = COALESCE(p_notes, notes),
    -- Set timestamps based on stage
    consent_granted_at = CASE WHEN p_new_stage = 'consented' THEN NOW() ELSE consent_granted_at END,
    story_recorded_at = CASE WHEN p_new_stage = 'recorded' THEN NOW() ELSE story_recorded_at END,
    reviewed_at = CASE WHEN p_new_stage = 'reviewed' THEN NOW() ELSE reviewed_at END,
    reviewed_by = CASE WHEN p_new_stage = 'reviewed' THEN auth.uid() ELSE reviewed_by END,
    published_at = CASE WHEN p_new_stage = 'published' THEN NOW() ELSE published_at END,
    withdrawn_at = CASE WHEN p_new_stage = 'withdrawn' THEN NOW() ELSE withdrawn_at END
  WHERE id = p_workflow_id
  RETURNING * INTO v_workflow;

  RETURN v_workflow;
END;
$$;

COMMENT ON FUNCTION advance_workflow_stage IS
'Advance a workflow to a new stage with automatic timestamp updates';

-- Function: Bulk advance workflows
CREATE OR REPLACE FUNCTION bulk_advance_workflows(
  p_workflow_ids UUID[],
  p_new_stage TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS SETOF campaign_consent_workflows
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  v_tenant_id := (SELECT tenant_id FROM profiles WHERE id = auth.uid());

  RETURN QUERY
  UPDATE campaign_consent_workflows
  SET
    stage = p_new_stage,
    notes = COALESCE(p_notes, notes),
    consent_granted_at = CASE WHEN p_new_stage = 'consented' THEN NOW() ELSE consent_granted_at END,
    story_recorded_at = CASE WHEN p_new_stage = 'recorded' THEN NOW() ELSE story_recorded_at END,
    reviewed_at = CASE WHEN p_new_stage = 'reviewed' THEN NOW() ELSE reviewed_at END,
    reviewed_by = CASE WHEN p_new_stage = 'reviewed' THEN auth.uid() ELSE reviewed_by END,
    published_at = CASE WHEN p_new_stage = 'published' THEN NOW() ELSE published_at END
  WHERE id = ANY(p_workflow_ids)
    AND tenant_id = v_tenant_id
  RETURNING *;
END;
$$;

COMMENT ON FUNCTION bulk_advance_workflows IS
'Advance multiple workflows to a new stage simultaneously';

-- Function: Get pending consent queue
CREATE OR REPLACE FUNCTION get_pending_consent_queue(
  p_campaign_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  workflow_id UUID,
  storyteller_id UUID,
  storyteller_name TEXT,
  storyteller_email TEXT,
  story_id UUID,
  story_title TEXT,
  stage TEXT,
  consent_granted_at TIMESTAMPTZ,
  story_recorded_at TIMESTAMPTZ,
  elder_review_required BOOLEAN,
  days_in_stage INT,
  priority_score INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  v_tenant_id := (SELECT tenant_id FROM profiles WHERE id = auth.uid());

  RETURN QUERY
  SELECT
    w.id as workflow_id,
    w.storyteller_id,
    p.display_name as storyteller_name,
    p.email as storyteller_email,
    w.story_id,
    s.title as story_title,
    w.stage,
    w.consent_granted_at,
    w.story_recorded_at,
    w.elder_review_required,
    EXTRACT(DAY FROM NOW() - w.stage_changed_at)::INT as days_in_stage,
    -- Priority score: higher = more urgent
    (
      CASE w.stage
        WHEN 'recorded' THEN 100  -- Recorded stories need review
        WHEN 'reviewed' THEN 90   -- Reviewed stories ready to publish
        WHEN 'consented' THEN 70  -- Consented storytellers ready to record
        WHEN 'interested' THEN 50 -- Interested storytellers need follow-up
        ELSE 30
      END +
      CASE WHEN w.elder_review_required AND w.elder_reviewed_at IS NULL THEN 50 ELSE 0 END +
      CASE WHEN EXTRACT(DAY FROM NOW() - w.stage_changed_at) > 7 THEN 30 ELSE 0 END
    )::INT as priority_score
  FROM campaign_consent_workflows w
  LEFT JOIN profiles p ON p.id = w.storyteller_id
  LEFT JOIN stories s ON s.id = w.story_id
  WHERE w.tenant_id = v_tenant_id
    AND w.stage NOT IN ('published', 'withdrawn')
    AND (p_campaign_id IS NULL OR w.campaign_id = p_campaign_id)
  ORDER BY priority_score DESC, w.stage_changed_at ASC
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION get_pending_consent_queue IS
'Get prioritized queue of workflows needing attention, sorted by urgency';

-- ============================================================================
-- AUDIT LOGGING
-- ============================================================================

CREATE OR REPLACE FUNCTION log_workflow_stage_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    INSERT INTO audit_log (
      entity_type,
      entity_id,
      action,
      changes,
      performed_by,
      tenant_id,
      created_at
    ) VALUES (
      'campaign_consent_workflow',
      NEW.id,
      'stage_changed',
      jsonb_build_object(
        'old_stage', OLD.stage,
        'new_stage', NEW.stage,
        'storyteller_id', NEW.storyteller_id,
        'campaign_id', NEW.campaign_id,
        'story_id', NEW.story_id
      ),
      auth.uid(),
      NEW.tenant_id,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_log_workflow_stage_change ON campaign_consent_workflows;

CREATE TRIGGER trigger_log_workflow_stage_change
AFTER UPDATE ON campaign_consent_workflows
FOR EACH ROW
WHEN (OLD.stage IS DISTINCT FROM NEW.stage)
EXECUTE FUNCTION log_workflow_stage_change();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Workflow dashboard summary
CREATE OR REPLACE VIEW campaign_workflow_dashboard AS
SELECT
  w.id,
  w.campaign_id,
  w.stage,
  w.stage_changed_at,
  EXTRACT(DAY FROM NOW() - w.stage_changed_at)::INT as days_in_current_stage,
  p.id as storyteller_id,
  p.display_name as storyteller_name,
  p.email as storyteller_email,
  p.avatar_url as storyteller_avatar,
  s.id as story_id,
  s.title as story_title,
  w.elder_review_required,
  w.elder_reviewed_at,
  w.follow_up_required,
  w.follow_up_date,
  w.tenant_id,
  w.created_at,
  w.updated_at
FROM campaign_consent_workflows w
LEFT JOIN profiles p ON p.id = w.storyteller_id
LEFT JOIN stories s ON s.id = w.story_id
WHERE w.stage NOT IN ('published', 'withdrawn');

COMMENT ON VIEW campaign_workflow_dashboard IS
'Dashboard view of active workflows with storyteller and story details';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'campaign_consent_workflows'
  ) THEN
    RAISE EXCEPTION 'Migration failed: campaign_consent_workflows table not created';
  END IF;

  RAISE NOTICE 'Campaign consent workflow migration completed successfully';
END $$;
