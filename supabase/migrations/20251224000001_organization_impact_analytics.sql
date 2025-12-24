-- ============================================================================
-- Organization Impact Analytics System
-- Migration: 20251224000001
-- Purpose: Enable organizations to gather insights from connected storytellers
--          and transcripts, with comprehensive impact measurement
-- ============================================================================

-- 1. Organization Impact Metrics (Aggregated Analytics)
-- Stores calculated metrics for organization impact dashboard
CREATE TABLE IF NOT EXISTS organization_impact_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Storyteller Metrics
  total_storytellers INTEGER DEFAULT 0,
  active_storytellers INTEGER DEFAULT 0,
  featured_storytellers INTEGER DEFAULT 0,
  elder_storytellers INTEGER DEFAULT 0,

  -- Content Metrics
  total_transcripts INTEGER DEFAULT 0,
  analyzed_transcripts INTEGER DEFAULT 0,
  total_stories INTEGER DEFAULT 0,
  published_stories INTEGER DEFAULT 0,

  -- Theme Analysis
  primary_themes TEXT[] DEFAULT '{}',
  cultural_themes TEXT[] DEFAULT '{}',
  theme_diversity_score DECIMAL(3,2) DEFAULT 0, -- 0-1 score

  -- Quote Analysis
  total_quotes INTEGER DEFAULT 0,
  high_impact_quotes INTEGER DEFAULT 0,
  most_powerful_quotes JSONB DEFAULT '[]', -- Top 10 quotes with metadata

  -- Network Metrics
  storyteller_connection_density DECIMAL(3,2) DEFAULT 0,
  cross_cultural_connections INTEGER DEFAULT 0,

  -- Impact Scores (0-100 scale)
  overall_impact_score DECIMAL(5,2) DEFAULT 0,
  cultural_preservation_score DECIMAL(5,2) DEFAULT 0,
  community_engagement_score DECIMAL(5,2) DEFAULT 0,
  knowledge_transmission_score DECIMAL(5,2) DEFAULT 0,

  -- Metadata
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  calculation_version TEXT DEFAULT 'v1',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_org_metrics UNIQUE(organization_id)
);

CREATE INDEX idx_org_impact_org ON organization_impact_metrics(organization_id);
CREATE INDEX idx_org_impact_tenant ON organization_impact_metrics(tenant_id);
CREATE INDEX idx_org_impact_score ON organization_impact_metrics(overall_impact_score DESC);

COMMENT ON TABLE organization_impact_metrics IS 'Aggregated impact metrics for organizations derived from storyteller transcripts and stories';


-- 2. Organization Theme Analytics (Time-Series Theme Evolution)
-- Tracks theme usage, trends, and evolution within an organization
CREATE TABLE IF NOT EXISTS organization_theme_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  theme TEXT NOT NULL,
  theme_category TEXT CHECK (theme_category IN ('cultural', 'family', 'land', 'resilience', 'knowledge', 'other')),

  -- Occurrence Metrics
  total_occurrences INTEGER DEFAULT 0,
  transcript_count INTEGER DEFAULT 0,
  story_count INTEGER DEFAULT 0,
  storyteller_count INTEGER DEFAULT 0,

  -- Time-Series Data
  first_occurrence_date TIMESTAMPTZ,
  last_occurrence_date TIMESTAMPTZ,
  monthly_trend JSONB DEFAULT '[]', -- [{month: '2025-01', count: 15}, ...]

  -- Impact Metrics
  average_confidence_score DECIMAL(3,2) DEFAULT 0,
  cultural_relevance TEXT DEFAULT 'medium' CHECK (cultural_relevance IN ('low', 'medium', 'high', 'sacred')),

  -- Related Data (for dashboard drill-down)
  representative_quotes TEXT[] DEFAULT '{}',
  key_storytellers UUID[] DEFAULT '{}',
  related_themes TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_org_theme UNIQUE(organization_id, theme)
);

CREATE INDEX idx_org_theme_org ON organization_theme_analytics(organization_id);
CREATE INDEX idx_org_theme_theme ON organization_theme_analytics(theme);
CREATE INDEX idx_org_theme_category ON organization_theme_analytics(theme_category);
CREATE INDEX idx_org_theme_occurrences ON organization_theme_analytics(total_occurrences DESC);
CREATE INDEX idx_org_theme_cultural ON organization_theme_analytics(cultural_relevance) WHERE cultural_relevance IN ('high', 'sacred');

COMMENT ON TABLE organization_theme_analytics IS 'Theme analytics and evolution tracking for organizations';


-- 3. Organization Cross-Transcript Insights (Cached AI Analysis)
-- Stores AI-generated insights from analyzing transcripts together
CREATE TABLE IF NOT EXISTS organization_cross_transcript_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'dominant_pattern',
    'emerging_theme',
    'cultural_marker',
    'community_strength',
    'knowledge_gap',
    'connection_opportunity',
    'impact_highlight'
  )),
  insight_title TEXT NOT NULL,
  insight_description TEXT,

  -- Supporting Data
  supporting_transcripts UUID[] DEFAULT '{}',
  supporting_quotes JSONB DEFAULT '[]', -- [{text, storyteller_id, transcript_id}, ...]
  related_themes TEXT[] DEFAULT '{}',

  -- Metrics
  confidence_score DECIMAL(3,2) DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  storyteller_coverage INTEGER DEFAULT 0, -- How many storytellers this applies to
  significance TEXT DEFAULT 'medium' CHECK (significance IN ('low', 'medium', 'high', 'critical')),

  -- AI Metadata
  generated_by TEXT, -- 'hybrid-analyzer', 'claude', 'pattern-matching'
  generated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Visibility
  is_featured BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_org_insights_org ON organization_cross_transcript_insights(organization_id);
CREATE INDEX idx_org_insights_type ON organization_cross_transcript_insights(insight_type);
CREATE INDEX idx_org_insights_featured ON organization_cross_transcript_insights(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_org_insights_significance ON organization_cross_transcript_insights(significance) WHERE significance IN ('high', 'critical');
CREATE INDEX idx_org_insights_confidence ON organization_cross_transcript_insights(confidence_score DESC);

COMMENT ON TABLE organization_cross_transcript_insights IS 'AI-generated insights from analyzing organization transcripts collectively';


-- 4. Organization Storyteller Network (Connection Graph)
-- Maps connections between storytellers based on themes, projects, culture
CREATE TABLE IF NOT EXISTS organization_storyteller_network (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  storyteller_a_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  storyteller_b_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  connection_type TEXT NOT NULL CHECK (connection_type IN (
    'theme_overlap',
    'geographic',
    'cultural_affiliation',
    'project_collaboration',
    'mentor_mentee',
    'knowledge_exchange'
  )),
  connection_strength DECIMAL(3,2) DEFAULT 0 CHECK (connection_strength >= 0 AND connection_strength <= 1),

  -- Connection Details
  shared_themes TEXT[] DEFAULT '{}',
  shared_projects UUID[] DEFAULT '{}',
  shared_cultural_background TEXT,
  geographic_proximity TEXT,

  -- Metrics
  theme_overlap_count INTEGER DEFAULT 0,
  collaboration_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints: Ensure no duplicate connections (bidirectional)
  CONSTRAINT unique_storyteller_pair UNIQUE(storyteller_a_id, storyteller_b_id),
  CONSTRAINT different_storytellers CHECK (storyteller_a_id != storyteller_b_id),
  CONSTRAINT ordered_storytellers CHECK (storyteller_a_id < storyteller_b_id)
);

CREATE INDEX idx_org_network_org ON organization_storyteller_network(organization_id);
CREATE INDEX idx_org_network_storyteller_a ON organization_storyteller_network(storyteller_a_id);
CREATE INDEX idx_org_network_storyteller_b ON organization_storyteller_network(storyteller_b_id);
CREATE INDEX idx_org_network_strength ON organization_storyteller_network(connection_strength DESC);
CREATE INDEX idx_org_network_type ON organization_storyteller_network(connection_type);

COMMENT ON TABLE organization_storyteller_network IS 'Network graph of storyteller connections within organizations';


-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE organization_impact_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_theme_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_cross_transcript_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_storyteller_network ENABLE ROW LEVEL SECURITY;

-- Organization Impact Metrics Policies
CREATE POLICY "Organization members can view impact metrics"
  ON organization_impact_metrics FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can update impact metrics"
  ON organization_impact_metrics FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE profile_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Organization Theme Analytics Policies
CREATE POLICY "Organization members can view theme analytics"
  ON organization_theme_analytics FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE profile_id = auth.uid()
    )
  );

-- Organization Insights Policies
CREATE POLICY "Organization members can view insights"
  ON organization_cross_transcript_insights FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Public insights are visible to all"
  ON organization_cross_transcript_insights FOR SELECT
  USING (is_public = TRUE);

-- Organization Network Policies
CREATE POLICY "Organization members can view network"
  ON organization_storyteller_network FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE profile_id = auth.uid()
    )
  );

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to calculate organization impact metrics
CREATE OR REPLACE FUNCTION calculate_organization_impact_metrics(org_id UUID)
RETURNS VOID AS $$
DECLARE
  tenant_uuid UUID;
  storyteller_ids UUID[];
  transcript_count INT;
  analyzed_count INT;
  story_count INT;
  published_count INT;
  all_themes TEXT[];
  diversity_score DECIMAL;
BEGIN
  -- Get tenant_id
  SELECT tenant_id INTO tenant_uuid
  FROM organisations WHERE id = org_id;

  -- Get storyteller IDs
  SELECT ARRAY_AGG(profile_id) INTO storyteller_ids
  FROM organization_members
  WHERE organization_id = org_id
    AND profile_id IN (SELECT id FROM profiles WHERE is_storyteller = TRUE);

  -- Count transcripts
  SELECT COUNT(*) INTO transcript_count
  FROM transcripts WHERE storyteller_id = ANY(storyteller_ids);

  SELECT COUNT(*) INTO analyzed_count
  FROM transcripts
  WHERE storyteller_id = ANY(storyteller_ids)
    AND themes IS NOT NULL AND array_length(themes, 1) > 0;

  -- Count stories
  SELECT COUNT(*) INTO story_count
  FROM stories WHERE storyteller_id = ANY(storyteller_ids);

  SELECT COUNT(*) INTO published_count
  FROM stories
  WHERE storyteller_id = ANY(storyteller_ids)
    AND status = 'published';

  -- Extract all themes
  SELECT ARRAY_AGG(DISTINCT theme) INTO all_themes
  FROM (
    SELECT unnest(themes) as theme
    FROM transcripts
    WHERE storyteller_id = ANY(storyteller_ids)
      AND themes IS NOT NULL
  ) t;

  -- Calculate diversity (simple version: unique themes / total transcripts)
  diversity_score := CASE
    WHEN analyzed_count > 0 THEN
      LEAST(1.0, array_length(all_themes, 1)::DECIMAL / analyzed_count::DECIMAL)
    ELSE 0
  END;

  -- Upsert metrics
  INSERT INTO organization_impact_metrics (
    organization_id,
    tenant_id,
    total_transcripts,
    analyzed_transcripts,
    total_stories,
    published_stories,
    primary_themes,
    theme_diversity_score,
    last_calculated_at
  ) VALUES (
    org_id,
    tenant_uuid,
    transcript_count,
    analyzed_count,
    story_count,
    published_count,
    all_themes,
    diversity_score,
    NOW()
  )
  ON CONFLICT (organization_id) DO UPDATE SET
    total_transcripts = EXCLUDED.total_transcripts,
    analyzed_transcripts = EXCLUDED.analyzed_transcripts,
    total_stories = EXCLUDED.total_stories,
    published_stories = EXCLUDED.published_stories,
    primary_themes = EXCLUDED.primary_themes,
    theme_diversity_score = EXCLUDED.theme_diversity_score,
    last_calculated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION calculate_organization_impact_metrics IS 'Recalculate impact metrics for a given organization';

-- ============================================================================
-- Triggers for Automatic Updates
-- ============================================================================

-- Update organization metrics when transcripts are analyzed
CREATE OR REPLACE FUNCTION trigger_update_org_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if analysis status changed to 'completed'
  IF NEW.ai_processing_status = 'completed' AND
     (OLD.ai_processing_status IS NULL OR OLD.ai_processing_status != 'completed') THEN

    -- Find all organizations for this storyteller
    PERFORM calculate_organization_impact_metrics(om.organization_id)
    FROM organization_members om
    WHERE om.profile_id = NEW.storyteller_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_org_metrics_on_transcript_analysis
  AFTER UPDATE ON transcripts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_org_metrics();

COMMENT ON TRIGGER update_org_metrics_on_transcript_analysis ON transcripts
  IS 'Automatically update organization impact metrics when transcripts are analyzed';

-- ============================================================================
-- Initial Data / Seed
-- ============================================================================

-- Create initial impact metrics for existing organizations
INSERT INTO organization_impact_metrics (organization_id, tenant_id)
SELECT id, tenant_id FROM organisations
WHERE id NOT IN (SELECT organization_id FROM organization_impact_metrics)
ON CONFLICT (organization_id) DO NOTHING;

-- ============================================================================
-- Migration Complete
-- ============================================================================

COMMENT ON SCHEMA public IS 'Organization Impact Analytics - Migration 20251224000001 applied';
