-- Project Analysis Cache
-- Stores AI-generated analysis results to avoid regenerating on every page load
-- Only regenerates when transcript content changes

CREATE TABLE IF NOT EXISTS project_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Project being analyzed
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Analysis metadata
  model_used TEXT NOT NULL, -- 'claude', 'gpt-4o', 'gpt-4o-mini', 'legacy'
  analysis_type TEXT NOT NULL, -- 'intelligent_ai' or 'legacy'

  -- Content hash for cache invalidation
  -- Hash of all transcript texts concatenated - if this changes, regenerate
  content_hash TEXT NOT NULL,

  -- Cached analysis data (JSONB for flexibility)
  analysis_data JSONB NOT NULL,

  -- Timestamps
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(project_id, model_used, content_hash)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_project_analyses_project_id ON project_analyses(project_id);
CREATE INDEX IF NOT EXISTS idx_project_analyses_content_hash ON project_analyses(content_hash);
CREATE INDEX IF NOT EXISTS idx_project_analyses_analyzed_at ON project_analyses(analyzed_at DESC);

-- Enable Row Level Security
ALTER TABLE project_analyses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read analysis for projects in their organization
CREATE POLICY project_analyses_read ON project_analyses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN organization_projects op ON op.project_id = p.id
      JOIN profile_organizations po ON po.organization_id = op.organization_id
      WHERE p.id = project_analyses.project_id
        AND po.profile_id = auth.uid()
        AND po.is_active = true
    )
  );

-- Policy: Service role can do everything (for API routes)
CREATE POLICY project_analyses_service ON project_analyses
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_project_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_analyses_updated_at
  BEFORE UPDATE ON project_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_project_analyses_updated_at();

-- Comment
COMMENT ON TABLE project_analyses IS 'Cached AI analysis results for projects to avoid regenerating on every page load';
