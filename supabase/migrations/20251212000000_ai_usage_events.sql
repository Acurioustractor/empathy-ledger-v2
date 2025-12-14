-- AI Usage Events Schema
-- Tracks all AI agent invocations for billing, observability, and cost control
-- Part of the Cost Steward agent infrastructure

-- ============================================================================
-- AI Usage Events Table
-- ============================================================================
-- Core telemetry table for tracking AI agent usage across the platform

CREATE TABLE IF NOT EXISTS ai_usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Context
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Agent identification
  agent_name TEXT NOT NULL,
  agent_version TEXT DEFAULT '1.0.0',

  -- Request details
  request_id UUID DEFAULT gen_random_uuid(),
  parent_request_id UUID, -- For nested agent calls

  -- Model usage
  model TEXT NOT NULL, -- e.g., 'gpt-4', 'claude-3-opus', 'whisper-1'
  model_provider TEXT NOT NULL, -- e.g., 'openai', 'anthropic', 'deepgram'

  -- Token metrics
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER GENERATED ALWAYS AS (prompt_tokens + completion_tokens) STORED,

  -- Cost tracking
  cost_usd_est DECIMAL(10, 6) DEFAULT 0, -- Estimated cost in USD

  -- Performance metrics
  duration_ms INTEGER, -- Total request duration
  time_to_first_token_ms INTEGER, -- For streaming responses

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  error_code TEXT,
  error_message TEXT,

  -- Safety tracking (links to Governance Sentinel)
  safety_status TEXT DEFAULT 'unchecked' CHECK (safety_status IN ('unchecked', 'safe', 'flagged', 'blocked')),
  safety_flags JSONB DEFAULT '[]'::jsonb,

  -- Context for debugging/audit
  input_preview TEXT, -- First 500 chars of input (no PII)
  output_preview TEXT, -- First 500 chars of output (no PII)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Indexes for common queries
  CONSTRAINT valid_duration CHECK (duration_ms IS NULL OR duration_ms >= 0),
  CONSTRAINT valid_tokens CHECK (prompt_tokens >= 0 AND completion_tokens >= 0)
);

-- Create indexes for efficient querying
CREATE INDEX idx_ai_usage_tenant ON ai_usage_events(tenant_id, created_at DESC);
CREATE INDEX idx_ai_usage_org ON ai_usage_events(organization_id, created_at DESC);
CREATE INDEX idx_ai_usage_agent ON ai_usage_events(agent_name, created_at DESC);
CREATE INDEX idx_ai_usage_model ON ai_usage_events(model, created_at DESC);
CREATE INDEX idx_ai_usage_status ON ai_usage_events(status, created_at DESC);
CREATE INDEX idx_ai_usage_request ON ai_usage_events(request_id);
CREATE INDEX idx_ai_usage_parent ON ai_usage_events(parent_request_id) WHERE parent_request_id IS NOT NULL;
-- Note: Date-based index removed because DATE() function is not immutable with timestamptz

-- ============================================================================
-- Tenant AI Policy Configuration
-- ============================================================================
-- Per-tenant configuration for AI usage limits and model access

CREATE TABLE IF NOT EXISTS tenant_ai_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Budget controls
  monthly_budget_usd DECIMAL(10, 2) DEFAULT 100.00,
  daily_budget_usd DECIMAL(10, 2) DEFAULT 10.00,
  per_request_max_usd DECIMAL(10, 4) DEFAULT 1.00,

  -- Usage tracking (updated by triggers)
  current_month_usage_usd DECIMAL(10, 2) DEFAULT 0,
  current_day_usage_usd DECIMAL(10, 2) DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,

  -- Model access controls
  allowed_models TEXT[] DEFAULT ARRAY['gpt-4o-mini', 'claude-3-haiku', 'whisper-1'],
  blocked_models TEXT[] DEFAULT ARRAY[]::TEXT[],
  default_model TEXT DEFAULT 'gpt-4o-mini',

  -- Auto-downgrade settings
  auto_downgrade_enabled BOOLEAN DEFAULT true,
  downgrade_threshold_pct INTEGER DEFAULT 80, -- Downgrade at 80% of budget
  downgrade_model TEXT DEFAULT 'gpt-4o-mini',

  -- Rate limiting
  requests_per_minute INTEGER DEFAULT 60,
  requests_per_hour INTEGER DEFAULT 500,

  -- Feature flags
  allow_streaming BOOLEAN DEFAULT true,
  allow_function_calling BOOLEAN DEFAULT true,
  allow_vision BOOLEAN DEFAULT false,

  -- Safety overrides
  require_safety_check BOOLEAN DEFAULT true,
  block_on_safety_flag BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id)
);

-- ============================================================================
-- Agent Registry
-- ============================================================================
-- Registry of available AI agents and their configurations

CREATE TABLE IF NOT EXISTS ai_agent_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Agent identification
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0.0',

  -- Classification
  agent_type TEXT NOT NULL CHECK (agent_type IN (
    'intake',      -- Consent Intake Agent
    'analyzer',    -- Interview Analyzer
    'synthesizer', -- Insight Synthesizer
    'composer',    -- Playbook Composer
    'escalation',  -- De-escalator
    'governance',  -- Governance Sentinel
    'cost'         -- Cost Steward
  )),

  -- Default model configuration
  default_model TEXT DEFAULT 'gpt-4o-mini',
  fallback_model TEXT DEFAULT 'gpt-4o-mini',
  max_tokens INTEGER DEFAULT 4096,
  temperature DECIMAL(3, 2) DEFAULT 0.7,

  -- Cost estimation
  avg_prompt_tokens INTEGER DEFAULT 500,
  avg_completion_tokens INTEGER DEFAULT 500,
  avg_cost_usd DECIMAL(10, 6) DEFAULT 0.01,

  -- Safety requirements
  requires_safety_check BOOLEAN DEFAULT true,
  requires_elder_review BOOLEAN DEFAULT false,
  cultural_sensitivity_level TEXT DEFAULT 'medium' CHECK (cultural_sensitivity_level IN ('low', 'medium', 'high', 'sacred')),

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_beta BOOLEAN DEFAULT false,

  -- Metadata
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the 7 agent recipes from the system-of-agents doc
INSERT INTO ai_agent_registry (name, display_name, description, agent_type, default_model, requires_safety_check, requires_elder_review, cultural_sensitivity_level) VALUES
  ('consent-intake', 'Consent Intake Agent', 'Handles storyteller consent collection with PII tokenization and magic link generation', 'intake', 'gpt-4o-mini', true, false, 'medium'),
  ('interview-analyzer', 'Interview Analyzer', 'Analyzes interview transcripts for themes, emotions, and key insights', 'analyzer', 'gpt-4o', true, false, 'high'),
  ('de-escalator', 'De-escalation Agent', 'Drafts empathetic responses to upset storytellers with culturally appropriate tone', 'escalation', 'gpt-4o', true, true, 'high'),
  ('insight-synthesizer', 'Insight Synthesizer', 'Aggregates cross-storyteller insights and theme clustering', 'synthesizer', 'gpt-4o', true, false, 'medium'),
  ('playbook-composer', 'Playbook Composer', 'Generates outreach playbooks and campaign recommendations', 'composer', 'gpt-4o-mini', true, false, 'low'),
  ('governance-sentinel', 'Governance Sentinel', 'Validates cultural safety, consent status, and routes to elder review', 'governance', 'gpt-4o', true, true, 'sacred'),
  ('cost-steward', 'Cost Steward', 'Monitors usage, enforces budgets, and manages model routing', 'cost', 'gpt-4o-mini', false, false, 'low')
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ============================================================================
-- Daily Usage Aggregates (for dashboards)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_usage_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  agent_name TEXT NOT NULL,
  model TEXT NOT NULL,

  -- Aggregated metrics
  request_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,

  total_prompt_tokens BIGINT DEFAULT 0,
  total_completion_tokens BIGINT DEFAULT 0,
  total_tokens BIGINT DEFAULT 0,

  total_cost_usd DECIMAL(10, 4) DEFAULT 0,
  total_duration_ms BIGINT DEFAULT 0,

  avg_duration_ms INTEGER,
  p95_duration_ms INTEGER,

  -- Safety stats
  flagged_count INTEGER DEFAULT 0,
  blocked_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(date, tenant_id, organization_id, agent_name, model)
);

CREATE INDEX idx_ai_usage_daily_tenant ON ai_usage_daily(tenant_id, date DESC);
CREATE INDEX idx_ai_usage_daily_org ON ai_usage_daily(organization_id, date DESC);

-- ============================================================================
-- Functions and Triggers
-- ============================================================================

-- Function to update daily aggregates
CREATE OR REPLACE FUNCTION update_ai_usage_daily()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ai_usage_daily (
    date, tenant_id, organization_id, agent_name, model,
    request_count, success_count, failure_count,
    total_prompt_tokens, total_completion_tokens, total_tokens,
    total_cost_usd, total_duration_ms,
    flagged_count, blocked_count
  ) VALUES (
    DATE(NEW.created_at),
    NEW.tenant_id,
    NEW.organization_id,
    NEW.agent_name,
    NEW.model,
    1,
    CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
    COALESCE(NEW.prompt_tokens, 0),
    COALESCE(NEW.completion_tokens, 0),
    COALESCE(NEW.prompt_tokens, 0) + COALESCE(NEW.completion_tokens, 0),
    COALESCE(NEW.cost_usd_est, 0),
    COALESCE(NEW.duration_ms, 0),
    CASE WHEN NEW.safety_status = 'flagged' THEN 1 ELSE 0 END,
    CASE WHEN NEW.safety_status = 'blocked' THEN 1 ELSE 0 END
  )
  ON CONFLICT (date, tenant_id, organization_id, agent_name, model)
  DO UPDATE SET
    request_count = ai_usage_daily.request_count + 1,
    success_count = ai_usage_daily.success_count + CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
    failure_count = ai_usage_daily.failure_count + CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
    total_prompt_tokens = ai_usage_daily.total_prompt_tokens + COALESCE(NEW.prompt_tokens, 0),
    total_completion_tokens = ai_usage_daily.total_completion_tokens + COALESCE(NEW.completion_tokens, 0),
    total_tokens = ai_usage_daily.total_tokens + COALESCE(NEW.prompt_tokens, 0) + COALESCE(NEW.completion_tokens, 0),
    total_cost_usd = ai_usage_daily.total_cost_usd + COALESCE(NEW.cost_usd_est, 0),
    total_duration_ms = ai_usage_daily.total_duration_ms + COALESCE(NEW.duration_ms, 0),
    flagged_count = ai_usage_daily.flagged_count + CASE WHEN NEW.safety_status = 'flagged' THEN 1 ELSE 0 END,
    blocked_count = ai_usage_daily.blocked_count + CASE WHEN NEW.safety_status = 'blocked' THEN 1 ELSE 0 END,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update daily aggregates on insert
DROP TRIGGER IF EXISTS trigger_update_ai_usage_daily ON ai_usage_events;
CREATE TRIGGER trigger_update_ai_usage_daily
AFTER INSERT ON ai_usage_events
FOR EACH ROW
EXECUTE FUNCTION update_ai_usage_daily();

-- Function to update tenant policy usage
CREATE OR REPLACE FUNCTION update_tenant_ai_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Reset daily usage if new day
  UPDATE tenant_ai_policies
  SET
    current_day_usage_usd = CASE
      WHEN last_reset_date < CURRENT_DATE THEN COALESCE(NEW.cost_usd_est, 0)
      ELSE current_day_usage_usd + COALESCE(NEW.cost_usd_est, 0)
    END,
    current_month_usage_usd = CASE
      WHEN DATE_TRUNC('month', last_reset_date) < DATE_TRUNC('month', CURRENT_DATE) THEN COALESCE(NEW.cost_usd_est, 0)
      ELSE current_month_usage_usd + COALESCE(NEW.cost_usd_est, 0)
    END,
    last_reset_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE tenant_id = NEW.tenant_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update tenant usage on completed events
DROP TRIGGER IF EXISTS trigger_update_tenant_ai_usage ON ai_usage_events;
CREATE TRIGGER trigger_update_tenant_ai_usage
AFTER INSERT ON ai_usage_events
FOR EACH ROW
WHEN (NEW.status = 'completed' AND NEW.tenant_id IS NOT NULL)
EXECUTE FUNCTION update_tenant_ai_usage();

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE ai_usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_ai_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_daily ENABLE ROW LEVEL SECURITY;

-- Usage events: users can see their own org's events
DROP POLICY IF EXISTS "Users can view their organization's AI usage" ON ai_usage_events;
CREATE POLICY "Users can view their organization's AI usage"
  ON ai_usage_events FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profile_organizations
      WHERE profile_id = auth.uid() AND is_active = true
    )
  );

-- Policies: admins can view and update
DROP POLICY IF EXISTS "Org admins can view AI policies" ON tenant_ai_policies;
CREATE POLICY "Org admins can view AI policies"
  ON tenant_ai_policies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profile_organizations po
      WHERE po.profile_id = auth.uid()
      AND po.role IN ('admin', 'owner')
      AND po.is_active = true
    )
  );

-- Agent registry: public read
DROP POLICY IF EXISTS "Anyone can view agent registry" ON ai_agent_registry;
CREATE POLICY "Anyone can view agent registry"
  ON ai_agent_registry FOR SELECT
  USING (is_active = true);

-- Daily aggregates: org members can view
DROP POLICY IF EXISTS "Users can view their organization's daily usage" ON ai_usage_daily;
CREATE POLICY "Users can view their organization's daily usage"
  ON ai_usage_daily FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profile_organizations
      WHERE profile_id = auth.uid() AND is_active = true
    )
  );

-- Service role bypass for all tables
DROP POLICY IF EXISTS "Service role has full access to ai_usage_events" ON ai_usage_events;
CREATE POLICY "Service role has full access to ai_usage_events"
  ON ai_usage_events FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role has full access to tenant_ai_policies" ON tenant_ai_policies;
CREATE POLICY "Service role has full access to tenant_ai_policies"
  ON tenant_ai_policies FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role has full access to ai_agent_registry" ON ai_agent_registry;
CREATE POLICY "Service role has full access to ai_agent_registry"
  ON ai_agent_registry FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role has full access to ai_usage_daily" ON ai_usage_daily;
CREATE POLICY "Service role has full access to ai_usage_daily"
  ON ai_usage_daily FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- Views for Dashboards
-- ============================================================================

-- Current month usage by tenant
CREATE OR REPLACE VIEW v_tenant_ai_usage_summary AS
SELECT
  t.id AS tenant_id,
  t.name AS tenant_name,
  tap.monthly_budget_usd,
  tap.current_month_usage_usd,
  ROUND((tap.current_month_usage_usd / NULLIF(tap.monthly_budget_usd, 0)) * 100, 1) AS budget_used_pct,
  tap.daily_budget_usd,
  tap.current_day_usage_usd,
  tap.allowed_models,
  tap.auto_downgrade_enabled,
  tap.downgrade_threshold_pct
FROM tenants t
LEFT JOIN tenant_ai_policies tap ON tap.tenant_id = t.id;

-- Agent usage statistics
CREATE OR REPLACE VIEW v_agent_usage_stats AS
SELECT
  agent_name,
  DATE_TRUNC('day', created_at) AS day,
  COUNT(*) AS total_requests,
  COUNT(*) FILTER (WHERE status = 'completed') AS successful,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed,
  AVG(duration_ms) AS avg_duration_ms,
  SUM(total_tokens) AS total_tokens,
  SUM(cost_usd_est) AS total_cost_usd,
  COUNT(*) FILTER (WHERE safety_status = 'flagged') AS flagged,
  COUNT(*) FILTER (WHERE safety_status = 'blocked') AS blocked
FROM ai_usage_events
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY agent_name, DATE_TRUNC('day', created_at)
ORDER BY day DESC, agent_name;

COMMENT ON TABLE ai_usage_events IS 'Tracks all AI agent invocations for billing, observability, and cost control';
COMMENT ON TABLE tenant_ai_policies IS 'Per-tenant configuration for AI usage limits and model access';
COMMENT ON TABLE ai_agent_registry IS 'Registry of available AI agents and their configurations';
COMMENT ON TABLE ai_usage_daily IS 'Daily aggregated AI usage metrics for dashboards';
