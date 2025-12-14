-- Project Contexts Table
-- Stores project-specific context: purpose, expected outcomes, success criteria
-- Enables project-specific outcomes tracking instead of generic metrics
-- Can inherit from organization context or be fully customized

CREATE TABLE IF NOT EXISTS project_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),

  -- What & Why
  purpose TEXT, -- What this project is trying to achieve
  context TEXT, -- Why this project exists (community need, opportunity)
  target_population TEXT, -- Who we're working with

  -- Expected Outcomes (structured for AI analysis)
  expected_outcomes JSONB,
  -- Example structure:
  -- [
  --   {
  --     "category": "Sleep Quality",
  --     "description": "Improved sleep and dignity for families",
  --     "indicators": ["Fewer people sleeping on floors", "Reduced health issues"],
  --     "timeframe": "short_term"
  --   }
  -- ]

  success_criteria TEXT[], -- How we'll know we succeeded
  timeframe TEXT, -- Project duration/phases

  -- Methodology
  program_model TEXT, -- How the project works
  cultural_approaches TEXT[], -- Specific cultural practices/protocols
  key_activities TEXT[], -- What we do

  -- Raw Source Data
  seed_interview_text TEXT, -- Original seed interview responses
  existing_documents TEXT, -- Pasted theory of change, logic models, etc.

  -- Processing State
  context_type VARCHAR(20) CHECK (context_type IN ('quick', 'full', 'imported', 'manual')),
  ai_extracted BOOLEAN DEFAULT FALSE,
  extraction_quality_score INTEGER CHECK (extraction_quality_score >= 0 AND extraction_quality_score <= 100),
  ai_model_used VARCHAR(50),

  -- Inheritance & Relationship
  inherits_from_org BOOLEAN DEFAULT TRUE, -- Use org context as base
  custom_fields JSONB, -- Additional project-specific fields

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  last_updated_by UUID REFERENCES profiles(id),

  -- Constraints
  UNIQUE(project_id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_contexts_project_id ON project_contexts(project_id);
CREATE INDEX IF NOT EXISTS idx_project_contexts_org_id ON project_contexts(organization_id);
CREATE INDEX IF NOT EXISTS idx_project_contexts_inherits ON project_contexts(organization_id) WHERE inherits_from_org = TRUE;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_project_contexts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS project_contexts_updated_at ON project_contexts;
CREATE TRIGGER project_contexts_updated_at
  BEFORE UPDATE ON project_contexts
  FOR EACH ROW
  EXECUTE FUNCTION update_project_contexts_updated_at();

-- Enable RLS
ALTER TABLE project_contexts ENABLE ROW LEVEL SECURITY;

-- Policies: Organization members can view project contexts
CREATE POLICY "Organization members can view project contexts"
  ON project_contexts
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM profile_organizations
      WHERE profile_id = auth.uid()
        AND is_active = true
    )
  );

-- Policies: Project admins can manage contexts
CREATE POLICY "Project admins can manage contexts"
  ON project_contexts
  FOR ALL
  USING (
    organization_id IN (
      SELECT po.organization_id
      FROM profile_organizations po
      WHERE po.profile_id = auth.uid()
        AND po.is_active = true
        AND po.role IN ('admin', 'project_manager')
    )
  );

-- Add helpful comments
COMMENT ON TABLE project_contexts IS 'Self-service context management for projects. Enables project-specific outcomes tracking instead of generic metrics.';

COMMENT ON COLUMN project_contexts.expected_outcomes IS 'Structured JSONB array of project outcomes with categories, descriptions, indicators, and timeframes for AI analysis';
COMMENT ON COLUMN project_contexts.inherits_from_org IS 'If TRUE, project inherits cultural frameworks and values from organization context';
COMMENT ON COLUMN project_contexts.context_type IS 'How context was created: quick (basic), full (seed interview), imported (from docs), manual (hand-entered)';

-- Migration Note: Migrate existing project context data
-- Update this to backfill from existing projects table context fields
DO $$
BEGIN
  -- Check if projects table has existing context fields to migrate
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'projects'
      AND column_name IN ('context_description', 'context_model')
  ) THEN
    -- Migrate existing quick context to new table
    INSERT INTO project_contexts (
      project_id,
      organization_id,
      purpose,
      context_type,
      seed_interview_text,
      ai_extracted,
      created_at
    )
    SELECT
      p.id,
      p.organization_id,
      LEFT(p.context_description, 500), -- First 500 chars as purpose
      COALESCE(p.context_model, 'quick'),
      p.context_description,
      TRUE,
      p.context_updated_at
    FROM projects p
    WHERE p.context_description IS NOT NULL
      AND p.context_description != ''
      AND NOT EXISTS (
        SELECT 1 FROM project_contexts pc WHERE pc.project_id = p.id
      );

    RAISE NOTICE 'Migrated % existing project contexts', (
      SELECT COUNT(*) FROM project_contexts WHERE context_type = 'quick'
    );
  END IF;
END $$;
