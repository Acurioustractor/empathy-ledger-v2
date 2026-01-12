-- Project Context for AI Analysis Seeding
-- Two models: Quick (simple text) and Full (comprehensive theory of change)

-- ============================================================================
-- MODEL 1: QUICK SETUP - Simple project description
-- ============================================================================

ALTER TABLE projects ADD COLUMN IF NOT EXISTS context_model TEXT DEFAULT 'none' CHECK (context_model IN ('none', 'quick', 'full'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS context_description TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS context_updated_at TIMESTAMPTZ;

COMMENT ON COLUMN projects.context_model IS 'Type of context: none, quick (simple text), full (seed interview)';
COMMENT ON COLUMN projects.context_description IS 'Quick setup: Free-text project description for AI context';

-- ============================================================================
-- MODEL 2: FULL SETUP - Comprehensive seed interview
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_seed_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE UNIQUE,

  -- Raw Interview Data
  interview_transcript TEXT, -- Full transcript of seed conversation
  interview_audio_url TEXT, -- Optional: Link to audio/video recording
  interview_date TIMESTAMPTZ DEFAULT NOW(),
  interviewed_by TEXT, -- Name of person who conducted interview

  -- Extracted Context (AI-generated from interview)
  extracted_context JSONB, -- Full AI extraction result

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Profile extracted from seed interview
CREATE TABLE IF NOT EXISTS project_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE UNIQUE,

  -- Core Purpose
  mission TEXT,
  primary_goals TEXT[],
  target_population TEXT,

  -- Origin Story
  origin_story TEXT,
  community_need TEXT,
  who_initiated TEXT,

  -- How It Works
  program_model TEXT,
  key_activities TEXT[],
  cultural_approaches TEXT[],
  cultural_protocols TEXT[],

  -- Expected Outcomes (categorized)
  outcome_categories JSONB[], -- [{category, examples[], keywords[]}]
  short_term_outcomes TEXT[], -- 0-6 months
  medium_term_outcomes TEXT[], -- 6-24 months
  long_term_outcomes TEXT[], -- 2+ years

  -- Community-Defined Success
  success_indicators JSONB[], -- [{name, description, why_matters}]
  positive_language TEXT[], -- Words/phrases indicating success
  challenge_language TEXT[], -- Words/phrases about obstacles
  transformation_markers TEXT[], -- Signs of change

  -- Impact Domains
  individual_impact TEXT[],
  family_impact TEXT[],
  community_impact TEXT[],
  systems_impact TEXT[],

  -- Cultural Context
  cultural_values TEXT[],
  indigenous_frameworks TEXT[],
  community_wisdom TEXT[],

  -- Metadata
  completeness_score INTEGER, -- 0-100, how complete is the profile
  last_reviewed_at TIMESTAMPTZ,
  approved_by TEXT, -- Name of person who approved

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_projects_context_model ON projects(context_model) WHERE context_model != 'none';
CREATE INDEX IF NOT EXISTS idx_seed_interviews_project ON project_seed_interviews(project_id);
CREATE INDEX IF NOT EXISTS idx_project_profiles_project ON project_profiles(project_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================

ALTER TABLE project_seed_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read/write for projects in their organization
DROP POLICY IF EXISTS project_seed_interviews_org_access ON project_seed_interviews;
CREATE POLICY project_seed_interviews_org_access ON project_seed_interviews
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN profile_organizations po ON po.organization_id = p.organization_id
      WHERE p.id = project_seed_interviews.project_id
        AND po.profile_id = auth.uid()
        AND po.is_active = true
    )
  );

DROP POLICY IF EXISTS project_profiles_org_access ON project_profiles;
CREATE POLICY project_profiles_org_access ON project_profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN profile_organizations po ON po.organization_id = p.organization_id
      WHERE p.id = project_profiles.project_id
        AND po.profile_id = auth.uid()
        AND po.is_active = true
    )
  );

-- Service role full access
DROP POLICY IF EXISTS project_seed_interviews_service ON project_seed_interviews;
CREATE POLICY project_seed_interviews_service ON project_seed_interviews
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

DROP POLICY IF EXISTS project_profiles_service ON project_profiles;
CREATE POLICY project_profiles_service ON project_profiles
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- Updated At Triggers
-- ============================================================================

CREATE OR REPLACE FUNCTION update_project_seed_interviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_project_seed_interviews_updated_at ON project_seed_interviews;
CREATE TRIGGER update_project_seed_interviews_updated_at
  BEFORE UPDATE ON project_seed_interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_project_seed_interviews_updated_at();

CREATE OR REPLACE FUNCTION update_project_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_project_profiles_updated_at ON project_profiles;
CREATE TRIGGER update_project_profiles_updated_at
  BEFORE UPDATE ON project_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_project_profiles_updated_at();

-- ============================================================================
-- Helper Function: Get Project Context for AI
-- ============================================================================

CREATE OR REPLACE FUNCTION get_project_context(p_project_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_context_model TEXT;
  v_result JSONB;
BEGIN
  -- Get context model type
  SELECT context_model INTO v_context_model
  FROM projects
  WHERE id = p_project_id;

  IF v_context_model = 'quick' THEN
    -- Return simple description
    SELECT jsonb_build_object(
      'model', 'quick',
      'description', context_description
    ) INTO v_result
    FROM projects
    WHERE id = p_project_id;

  ELSIF v_context_model = 'full' THEN
    -- Return full profile
    SELECT jsonb_build_object(
      'model', 'full',
      'mission', pp.mission,
      'primary_goals', pp.primary_goals,
      'key_activities', pp.key_activities,
      'outcome_categories', pp.outcome_categories,
      'success_indicators', pp.success_indicators,
      'positive_language', pp.positive_language,
      'cultural_values', pp.cultural_values,
      'cultural_approaches', pp.cultural_approaches
    ) INTO v_result
    FROM project_profiles pp
    WHERE pp.project_id = p_project_id;

  ELSE
    -- No context
    v_result := jsonb_build_object('model', 'none');
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE project_seed_interviews IS 'Seed interview transcripts for full project context setup';
COMMENT ON TABLE project_profiles IS 'Extracted project profiles for AI-guided analysis';
COMMENT ON FUNCTION get_project_context IS 'Returns project context in format suitable for AI analysis';
