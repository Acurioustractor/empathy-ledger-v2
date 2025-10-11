-- Project Analysis Cache - Simplified Version
-- Stores AI-generated analysis results to avoid regenerating on every page load

CREATE TABLE IF NOT EXISTS project_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  model_used TEXT NOT NULL,
  analysis_type TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  analysis_data JSONB NOT NULL,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, model_used, content_hash)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_project_analyses_project_id ON project_analyses(project_id);
CREATE INDEX IF NOT EXISTS idx_project_analyses_content_hash ON project_analyses(content_hash);
CREATE INDEX IF NOT EXISTS idx_project_analyses_analyzed_at ON project_analyses(analyzed_at DESC);

-- Enable Row Level Security
ALTER TABLE project_analyses ENABLE ROW LEVEL SECURITY;

-- Simple policy: Users can read analysis for projects in their organization
DROP POLICY IF EXISTS project_analyses_read ON project_analyses;
CREATE POLICY project_analyses_read ON project_analyses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN profile_organizations po ON po.organization_id = p.organization_id
      WHERE p.id = project_analyses.project_id
        AND po.profile_id = auth.uid()
        AND po.is_active = true
    )
  );

-- Service role can do everything (for API routes)
DROP POLICY IF EXISTS project_analyses_service ON project_analyses;
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

DROP TRIGGER IF EXISTS update_project_analyses_updated_at ON project_analyses;
CREATE TRIGGER update_project_analyses_updated_at
  BEFORE UPDATE ON project_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_project_analyses_updated_at();

-- Comment
COMMENT ON TABLE project_analyses IS 'Cached AI analysis results for projects to avoid regenerating on every page load';
