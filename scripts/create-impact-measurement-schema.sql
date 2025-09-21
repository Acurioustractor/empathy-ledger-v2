-- COMPREHENSIVE IMPACT MEASUREMENT SCHEMA
-- Supports multi-level aggregation: Individual → Organization → Site-wide

-- 1. ENHANCE PROFILES TABLE WITH IMPACT METRICS
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_impact_insights INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_impact_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS impact_confidence_score DECIMAL(3,2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cultural_protocol_score DECIMAL(3,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS community_leadership_score DECIMAL(3,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS knowledge_transmission_score DECIMAL(3,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS healing_integration_score DECIMAL(3,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS relationship_building_score DECIMAL(3,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS system_navigation_score DECIMAL(3,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_impact_analysis TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS impact_badges TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS storyteller_ranking INTEGER;

-- 2. CREATE COMMUNITY IMPACT INSIGHTS TABLE
CREATE TABLE IF NOT EXISTS community_impact_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
    storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- INDIGENOUS SUCCESS INDICATOR TYPE
    impact_type TEXT NOT NULL CHECK (impact_type IN (
        'cultural_protocol', 'community_leadership', 'knowledge_transmission',
        'healing_integration', 'relationship_building', 'system_navigation',
        'collective_mobilization', 'intergenerational_connection'
    )),

    -- EVIDENCE FROM COMMUNITY VOICE
    quote_text TEXT NOT NULL,
    context_text TEXT NOT NULL,
    speaker_role TEXT,
    confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),

    -- INDIGENOUS IMPACT DIMENSIONS (community-defined success)
    relationship_strengthening DECIMAL(3,2) DEFAULT 0,
    cultural_continuity DECIMAL(3,2) DEFAULT 0,
    community_empowerment DECIMAL(3,2) DEFAULT 0,
    system_transformation DECIMAL(3,2) DEFAULT 0,
    healing_progression DECIMAL(3,2) DEFAULT 0,
    knowledge_preservation DECIMAL(3,2) DEFAULT 0,

    -- COMMUNITY SOVEREIGNTY MARKERS
    community_led_decision_making BOOLEAN DEFAULT FALSE,
    cultural_protocols_respected BOOLEAN DEFAULT FALSE,
    external_systems_responding BOOLEAN DEFAULT FALSE,
    resource_control_increasing BOOLEAN DEFAULT FALSE,

    -- TRANSFORMATION EVIDENCE
    transformation_evidence TEXT[] DEFAULT '{}',

    -- CULTURAL SAFETY & CONSENT
    cultural_sensitivity_level TEXT DEFAULT 'standard' CHECK (cultural_sensitivity_level IN ('standard', 'medium', 'high', 'restricted')),
    elder_review_required BOOLEAN DEFAULT FALSE,
    elder_reviewed_by UUID REFERENCES profiles(id),
    elder_reviewed_at TIMESTAMPTZ,
    community_consent_verified BOOLEAN DEFAULT TRUE,

    -- METADATA
    ai_model_version TEXT,
    extraction_metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE COMMUNITY IMPACT METRICS TABLE (Organization-level aggregations)
CREATE TABLE IF NOT EXISTS community_impact_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    reporting_period_start TIMESTAMPTZ NOT NULL,
    reporting_period_end TIMESTAMPTZ NOT NULL,
    reporting_period_type TEXT NOT NULL CHECK (reporting_period_type IN ('monthly', 'quarterly', 'annual', 'custom')),

    -- AGGREGATED IMPACT COUNTS
    total_insights INTEGER DEFAULT 0,
    cultural_protocol_insights INTEGER DEFAULT 0,
    community_leadership_insights INTEGER DEFAULT 0,
    knowledge_transmission_insights INTEGER DEFAULT 0,
    healing_integration_insights INTEGER DEFAULT 0,
    relationship_building_insights INTEGER DEFAULT 0,
    system_navigation_insights INTEGER DEFAULT 0,
    collective_mobilization_insights INTEGER DEFAULT 0,
    intergenerational_connection_insights INTEGER DEFAULT 0,

    -- SOVEREIGNTY PROGRESS INDICATORS
    community_led_decisions_count INTEGER DEFAULT 0,
    cultural_protocols_respected_count INTEGER DEFAULT 0,
    external_systems_responding_count INTEGER DEFAULT 0,
    resource_control_increasing_count INTEGER DEFAULT 0,

    -- STRONGEST IMPACT DIMENSIONS (community-defined success areas)
    top_impact_area_1 TEXT,
    top_impact_area_1_score DECIMAL(3,2),
    top_impact_area_2 TEXT,
    top_impact_area_2_score DECIMAL(3,2),
    top_impact_area_3 TEXT,
    top_impact_area_3_score DECIMAL(3,2),

    -- AVERAGE IMPACT DIMENSION SCORES
    avg_relationship_strengthening DECIMAL(3,2) DEFAULT 0,
    avg_cultural_continuity DECIMAL(3,2) DEFAULT 0,
    avg_community_empowerment DECIMAL(3,2) DEFAULT 0,
    avg_system_transformation DECIMAL(3,2) DEFAULT 0,
    avg_healing_progression DECIMAL(3,2) DEFAULT 0,
    avg_knowledge_preservation DECIMAL(3,2) DEFAULT 0,

    -- COMMUNITY VOICE INDICATORS
    unique_storytellers_count INTEGER DEFAULT 0,
    elder_voices_count INTEGER DEFAULT 0,
    youth_voices_count INTEGER DEFAULT 0,
    total_stories_analyzed INTEGER DEFAULT 0,

    -- QUALITY INDICATORS
    avg_confidence_score DECIMAL(3,2) DEFAULT 0,
    elder_reviewed_insights_count INTEGER DEFAULT 0,
    high_confidence_insights_count INTEGER DEFAULT 0,

    -- METADATA
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    generation_method TEXT DEFAULT 'automated' CHECK (generation_method IN ('automated', 'manual', 'hybrid')),
    ai_model_version TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- UNIQUE CONSTRAINT for organization + period
    UNIQUE(organization_id, reporting_period_type, reporting_period_start)
);

-- 4. CREATE SITE-WIDE IMPACT METRICS TABLE (Global aggregations)
CREATE TABLE IF NOT EXISTS site_impact_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporting_period_start TIMESTAMPTZ NOT NULL,
    reporting_period_end TIMESTAMPTZ NOT NULL,
    reporting_period_type TEXT NOT NULL CHECK (reporting_period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'annual')),

    -- GLOBAL TOTALS
    total_insights INTEGER DEFAULT 0,
    total_organizations INTEGER DEFAULT 0,
    total_storytellers INTEGER DEFAULT 0,
    total_transcripts_analyzed INTEGER DEFAULT 0,

    -- GLOBAL IMPACT TYPE DISTRIBUTION
    cultural_protocol_insights INTEGER DEFAULT 0,
    community_leadership_insights INTEGER DEFAULT 0,
    knowledge_transmission_insights INTEGER DEFAULT 0,
    healing_integration_insights INTEGER DEFAULT 0,
    relationship_building_insights INTEGER DEFAULT 0,
    system_navigation_insights INTEGER DEFAULT 0,
    collective_mobilization_insights INTEGER DEFAULT 0,
    intergenerational_connection_insights INTEGER DEFAULT 0,

    -- GLOBAL SOVEREIGNTY INDICATORS
    total_community_led_decisions INTEGER DEFAULT 0,
    total_cultural_protocols_respected INTEGER DEFAULT 0,
    total_external_systems_responding INTEGER DEFAULT 0,
    total_resource_control_increasing INTEGER DEFAULT 0,

    -- GLOBAL AVERAGES
    global_avg_confidence_score DECIMAL(3,2) DEFAULT 0,
    global_avg_relationship_strengthening DECIMAL(3,2) DEFAULT 0,
    global_avg_cultural_continuity DECIMAL(3,2) DEFAULT 0,
    global_avg_community_empowerment DECIMAL(3,2) DEFAULT 0,
    global_avg_system_transformation DECIMAL(3,2) DEFAULT 0,
    global_avg_healing_progression DECIMAL(3,2) DEFAULT 0,
    global_avg_knowledge_preservation DECIMAL(3,2) DEFAULT 0,

    -- GLOBAL COMMUNITY DEMOGRAPHICS
    elder_storytellers_count INTEGER DEFAULT 0,
    youth_storytellers_count INTEGER DEFAULT 0,
    indigenous_organizations_count INTEGER DEFAULT 0,
    high_impact_organizations_count INTEGER DEFAULT 0,

    -- TRENDING DATA
    trending_impact_types TEXT[] DEFAULT '{}',
    fastest_growing_organizations UUID[] DEFAULT '{}',
    top_performing_storytellers UUID[] DEFAULT '{}',

    -- METADATA
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    generation_method TEXT DEFAULT 'automated',
    ai_model_version TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- UNIQUE CONSTRAINT for period
    UNIQUE(reporting_period_type, reporting_period_start)
);

-- 5. CREATE STORYTELLER IMPACT SUMMARY VIEW (for easy querying)
CREATE OR REPLACE VIEW storyteller_impact_summary AS
SELECT
    p.id,
    p.display_name,
    p.organization_id,
    p.total_impact_insights,
    p.primary_impact_type,
    p.impact_confidence_score,
    p.cultural_protocol_score,
    p.community_leadership_score,
    p.knowledge_transmission_score,
    p.impact_badges,
    p.storyteller_ranking,

    -- Recent insights count (last 30 days)
    COUNT(CASE WHEN cii.created_at > NOW() - INTERVAL '30 days' THEN 1 END) as recent_insights_count,

    -- Most common impact type
    MODE() WITHIN GROUP (ORDER BY cii.impact_type) as most_common_impact_type,

    -- Average confidence of recent insights
    AVG(CASE WHEN cii.created_at > NOW() - INTERVAL '30 days' THEN cii.confidence_score END) as recent_avg_confidence,

    -- Cultural sensitivity distribution
    ARRAY_AGG(DISTINCT cii.cultural_sensitivity_level) as cultural_sensitivity_levels,

    -- Sovereignty indicators summary
    COUNT(CASE WHEN cii.community_led_decision_making = true THEN 1 END) as community_led_decisions,
    COUNT(CASE WHEN cii.cultural_protocols_respected = true THEN 1 END) as cultural_protocols_respected,

    p.last_impact_analysis,
    p.created_at,
    p.updated_at

FROM profiles p
LEFT JOIN community_impact_insights cii ON p.id = cii.storyteller_id
WHERE p.is_storyteller = true
GROUP BY p.id, p.display_name, p.organization_id, p.total_impact_insights,
         p.primary_impact_type, p.impact_confidence_score, p.cultural_protocol_score,
         p.community_leadership_score, p.knowledge_transmission_score, p.impact_badges,
         p.storyteller_ranking, p.last_impact_analysis, p.created_at, p.updated_at;

-- 6. CREATE ORGANIZATION IMPACT RANKING VIEW
CREATE OR REPLACE VIEW organization_impact_ranking AS
SELECT
    o.id,
    o.name,
    o.type,
    cim.total_insights,
    cim.unique_storytellers_count,
    cim.avg_confidence_score,
    cim.top_impact_area_1,
    cim.top_impact_area_1_score,

    -- Calculate impact score for ranking
    (cim.total_insights * 0.3 +
     cim.unique_storytellers_count * 0.3 +
     cim.avg_confidence_score * 100 * 0.4) as impact_score,

    -- Rank within each organization type
    ROW_NUMBER() OVER (PARTITION BY o.type ORDER BY
        (cim.total_insights * 0.3 +
         cim.unique_storytellers_count * 0.3 +
         cim.avg_confidence_score * 100 * 0.4) DESC
    ) as type_ranking,

    -- Global ranking
    ROW_NUMBER() OVER (ORDER BY
        (cim.total_insights * 0.3 +
         cim.unique_storytellers_count * 0.3 +
         cim.avg_confidence_score * 100 * 0.4) DESC
    ) as global_ranking,

    cim.generated_at,
    cim.last_updated_at

FROM organizations o
LEFT JOIN community_impact_metrics cim ON o.id = cim.organization_id
    AND cim.reporting_period_type = 'monthly'
    AND cim.reporting_period_start = date_trunc('month', NOW() - INTERVAL '1 month')
WHERE cim.id IS NOT NULL  -- Only organizations with metrics
ORDER BY impact_score DESC;

-- 7. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_community_impact_insights_transcript_id ON community_impact_insights(transcript_id);
CREATE INDEX IF NOT EXISTS idx_community_impact_insights_storyteller_id ON community_impact_insights(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_community_impact_insights_organization_id ON community_impact_insights(organization_id);
CREATE INDEX IF NOT EXISTS idx_community_impact_insights_impact_type ON community_impact_insights(impact_type);
CREATE INDEX IF NOT EXISTS idx_community_impact_insights_created_at ON community_impact_insights(created_at);
CREATE INDEX IF NOT EXISTS idx_community_impact_insights_confidence_score ON community_impact_insights(confidence_score);

CREATE INDEX IF NOT EXISTS idx_community_impact_metrics_organization_id ON community_impact_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_community_impact_metrics_period ON community_impact_metrics(reporting_period_type, reporting_period_start);

CREATE INDEX IF NOT EXISTS idx_site_impact_metrics_period ON site_impact_metrics(reporting_period_type, reporting_period_start);

CREATE INDEX IF NOT EXISTS idx_profiles_storyteller_ranking ON profiles(storyteller_ranking) WHERE is_storyteller = true;
CREATE INDEX IF NOT EXISTS idx_profiles_impact_confidence ON profiles(impact_confidence_score) WHERE is_storyteller = true;

-- 8. CREATE TRIGGERS FOR AUTO-UPDATING METRICS

-- Function to update profile metrics when insights are added
CREATE OR REPLACE FUNCTION update_profile_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the storyteller's profile metrics
    UPDATE profiles SET
        total_impact_insights = (
            SELECT COUNT(*) FROM community_impact_insights
            WHERE storyteller_id = NEW.storyteller_id
        ),
        impact_confidence_score = (
            SELECT AVG(confidence_score) FROM community_impact_insights
            WHERE storyteller_id = NEW.storyteller_id
        ),
        primary_impact_type = (
            SELECT impact_type
            FROM community_impact_insights
            WHERE storyteller_id = NEW.storyteller_id
            GROUP BY impact_type
            ORDER BY COUNT(*) DESC
            LIMIT 1
        ),
        last_impact_analysis = NOW(),
        updated_at = NOW()
    WHERE id = NEW.storyteller_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_profile_metrics ON community_impact_insights;
CREATE TRIGGER trigger_update_profile_metrics
    AFTER INSERT ON community_impact_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_metrics();

-- 9. CREATE ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on new tables
ALTER TABLE community_impact_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_impact_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_impact_metrics ENABLE ROW LEVEL SECURITY;

-- Policies for community_impact_insights
CREATE POLICY "Users can view insights for their tenant" ON community_impact_insights
    FOR SELECT USING (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert insights for their tenant" ON community_impact_insights
    FOR INSERT WITH CHECK (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    ));

-- Policies for community_impact_metrics
CREATE POLICY "Users can view metrics for their tenant" ON community_impact_metrics
    FOR SELECT USING (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    ));

-- Site-wide metrics are viewable by all authenticated users
CREATE POLICY "All users can view site metrics" ON site_impact_metrics
    FOR SELECT USING (auth.role() = 'authenticated');

-- 10. CREATE SAMPLE DATA INSERTION FUNCTION (for testing)
CREATE OR REPLACE FUNCTION create_sample_impact_insight(
    p_transcript_id UUID,
    p_storyteller_id UUID,
    p_organization_id UUID,
    p_tenant_id UUID,
    p_impact_type TEXT,
    p_quote_text TEXT,
    p_confidence_score DECIMAL
)
RETURNS UUID AS $$
DECLARE
    insight_id UUID;
BEGIN
    INSERT INTO community_impact_insights (
        transcript_id,
        storyteller_id,
        organization_id,
        tenant_id,
        impact_type,
        quote_text,
        context_text,
        confidence_score,
        relationship_strengthening,
        cultural_continuity,
        community_empowerment,
        community_led_decision_making,
        cultural_protocols_respected
    ) VALUES (
        p_transcript_id,
        p_storyteller_id,
        p_organization_id,
        p_tenant_id,
        p_impact_type,
        p_quote_text,
        p_quote_text, -- Using quote as context for simplicity
        p_confidence_score,
        RANDOM() * 0.5 + 0.5, -- Random score between 0.5-1.0
        RANDOM() * 0.5 + 0.5,
        RANDOM() * 0.5 + 0.5,
        RANDOM() > 0.5, -- Random boolean
        RANDOM() > 0.3  -- Random boolean with higher probability
    ) RETURNING id INTO insight_id;

    RETURN insight_id;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE community_impact_insights IS 'Individual insights extracted from Indigenous community stories using AI analysis';
COMMENT ON TABLE community_impact_metrics IS 'Aggregated impact metrics at organization level for reporting and dashboards';
COMMENT ON TABLE site_impact_metrics IS 'Site-wide impact metrics showing global community transformation patterns';
COMMENT ON VIEW storyteller_impact_summary IS 'Comprehensive view of individual storyteller impact metrics and rankings';
COMMENT ON VIEW organization_impact_ranking IS 'Ranking and comparison view for organization impact performance';