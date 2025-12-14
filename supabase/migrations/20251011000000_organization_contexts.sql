-- Organization Contexts Table
-- Stores organization-level context: mission, values, impact methodology
-- Enables organizations to self-manage their own context without developer intervention

CREATE TABLE IF NOT EXISTS organization_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Core Identity
  mission TEXT,
  vision TEXT,
  values TEXT[], -- Array of value statements

  -- Approach & Methodology
  approach_description TEXT,
  cultural_frameworks TEXT[], -- e.g., ["Dadirri", "Two-way learning", "OCAP principles"]
  key_principles TEXT[], -- Operating principles

  -- Impact Framework
  impact_philosophy TEXT, -- Organization's theory of change
  impact_domains JSONB, -- What areas they focus on
  -- Example: {"individual": ["healing", "wellbeing"], "community": ["development", "leadership"]}
  measurement_approach TEXT, -- How they know they're making a difference

  -- Links & Resources
  website TEXT,
  theory_of_change_url TEXT,
  impact_report_urls TEXT[],

  -- Source Data
  seed_interview_responses JSONB, -- Original seed interview answers
  imported_document_text TEXT, -- If imported from existing doc

  -- Processing Metadata
  context_type VARCHAR(20) CHECK (context_type IN ('seed_interview', 'imported', 'manual')),
  extraction_quality_score INTEGER CHECK (extraction_quality_score >= 0 AND extraction_quality_score <= 100),
  ai_model_used VARCHAR(50), -- Which model extracted (for tracking)

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  last_updated_by UUID REFERENCES profiles(id),

  -- Constraints
  UNIQUE(organization_id)
);

-- Create index for lookups
CREATE INDEX IF NOT EXISTS idx_org_contexts_org_id ON organization_contexts(organization_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_organization_contexts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS organization_contexts_updated_at ON organization_contexts;
CREATE TRIGGER organization_contexts_updated_at
  BEFORE UPDATE ON organization_contexts
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_contexts_updated_at();

-- Enable RLS
ALTER TABLE organization_contexts ENABLE ROW LEVEL SECURITY;

-- Policies: Organization members can read their org context
CREATE POLICY "Organization members can view context"
  ON organization_contexts
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM profile_organizations
      WHERE profile_id = auth.uid()
        AND is_active = true
    )
  );

-- Policies: Organization admins can manage context
CREATE POLICY "Organization admins can manage context"
  ON organization_contexts
  FOR ALL
  USING (
    organization_id IN (
      SELECT po.organization_id
      FROM profile_organizations po
      WHERE po.profile_id = auth.uid()
        AND po.is_active = true
        AND po.role = 'admin'
    )
  );

-- Add helpful comment
COMMENT ON TABLE organization_contexts IS 'Self-service context management for organizations. Stores mission, values, impact methodology used for AI analysis.';

COMMENT ON COLUMN organization_contexts.impact_domains IS 'JSONB structure organizing impact areas by level (individual, family, community, systems)';
COMMENT ON COLUMN organization_contexts.seed_interview_responses IS 'Original Q&A from seed interview for reference and re-processing';
COMMENT ON COLUMN organization_contexts.extraction_quality_score IS 'AI confidence in extraction quality (0-100). Helps identify contexts needing human review.';
