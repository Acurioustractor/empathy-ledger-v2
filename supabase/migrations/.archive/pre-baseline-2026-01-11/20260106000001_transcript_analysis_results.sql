-- Migration: Add transcript_analysis_results table for Sprint 3
-- Date: January 6, 2026
-- Purpose: Store versioned AI analysis results with quality metrics

-- Create transcript_analysis_results table
CREATE TABLE IF NOT EXISTS public.transcript_analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transcript_id UUID REFERENCES public.transcripts(id) ON DELETE CASCADE,
  analyzer_version TEXT NOT NULL,
  themes JSONB NOT NULL,
  quotes JSONB,
  impact_assessment JSONB,
  cultural_flags JSONB,
  quality_metrics JSONB,
  processing_cost NUMERIC(10,4),
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure we only keep one analysis per version per transcript
  CONSTRAINT unique_latest_analysis UNIQUE (transcript_id, analyzer_version)
);

-- Create indexes for performance
CREATE INDEX idx_analysis_transcript ON public.transcript_analysis_results(transcript_id);
CREATE INDEX idx_analysis_version ON public.transcript_analysis_results(analyzer_version);
CREATE INDEX idx_analysis_created ON public.transcript_analysis_results(created_at);

-- Add RLS policies
ALTER TABLE public.transcript_analysis_results ENABLE ROW LEVEL SECURITY;

-- Users can view analysis results for transcripts they have access to
CREATE POLICY "transcript_analysis_results_select" ON public.transcript_analysis_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.transcripts
      WHERE transcripts.id = transcript_analysis_results.transcript_id
      AND (
        -- Transcript belongs to user's tenant
        transcripts.tenant_id IN (
          SELECT tenant_id FROM public.profile_organizations
          WHERE profile_id = auth.uid()
        )
        OR
        -- User is the storyteller
        transcripts.storyteller_id = auth.uid()
      )
    )
  );

-- Service role can insert analysis results
CREATE POLICY "transcript_analysis_results_insert" ON public.transcript_analysis_results
  FOR INSERT WITH CHECK (true);

-- Service role can update analysis results
CREATE POLICY "transcript_analysis_results_update" ON public.transcript_analysis_results
  FOR UPDATE USING (true);

-- Admins and Elders can delete analysis results
CREATE POLICY "transcript_analysis_results_delete" ON public.transcript_analysis_results
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profile_organizations
      WHERE profile_organizations.profile_id = auth.uid()
      AND profile_organizations.role IN ('admin', 'elder')
    )
  );

-- Function to get latest analysis for a transcript
CREATE OR REPLACE FUNCTION public.get_latest_analysis(p_transcript_id UUID)
RETURNS public.transcript_analysis_results AS $$
  SELECT * FROM public.transcript_analysis_results
  WHERE transcript_id = p_transcript_id
  ORDER BY created_at DESC
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Function to get analysis by version
CREATE OR REPLACE FUNCTION public.get_analysis_by_version(
  p_transcript_id UUID,
  p_version TEXT
)
RETURNS public.transcript_analysis_results AS $$
  SELECT * FROM public.transcript_analysis_results
  WHERE transcript_id = p_transcript_id
  AND analyzer_version = p_version
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_analysis_updated_at_trigger
  BEFORE UPDATE ON public.transcript_analysis_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_analysis_updated_at();

-- Add audit logging trigger
CREATE TRIGGER transcript_analysis_results_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.transcript_analysis_results
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger_function();

-- Comments for documentation
COMMENT ON TABLE public.transcript_analysis_results IS 'Stores versioned AI analysis results for transcripts with quality metrics';
COMMENT ON COLUMN public.transcript_analysis_results.analyzer_version IS 'Version identifier (e.g., v3-claude-sonnet-4.5)';
COMMENT ON COLUMN public.transcript_analysis_results.themes IS 'Extracted themes with confidence scores';
COMMENT ON COLUMN public.transcript_analysis_results.quotes IS 'Extracted quotes with quality scores';
COMMENT ON COLUMN public.transcript_analysis_results.impact_assessment IS 'Indigenous impact analysis with depth indicators';
COMMENT ON COLUMN public.transcript_analysis_results.cultural_flags IS 'Cultural sensitivity markers and Elder review flags';
COMMENT ON COLUMN public.transcript_analysis_results.quality_metrics IS 'Analysis quality metrics (accuracy, confidence)';
COMMENT ON COLUMN public.transcript_analysis_results.processing_cost IS 'AI processing cost in USD';
COMMENT ON COLUMN public.transcript_analysis_results.processing_time_ms IS 'Processing time in milliseconds';
