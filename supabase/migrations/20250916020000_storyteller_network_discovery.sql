-- 🌐 Storyteller Network Discovery Migration
-- Creates advanced network discovery and recommendation systems

-- ============================================================================
-- 1. STORYTELLER NETWORK CONNECTIONS - AI-discovered connections
-- ============================================================================

CREATE TABLE IF NOT EXISTS storyteller_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyteller_a_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    storyteller_b_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,

    -- Connection Strength & Type
    connection_strength DECIMAL(3,2) DEFAULT 0.0 CHECK (connection_strength >= 0.0 AND connection_strength <= 1.0),
    connection_type VARCHAR(50) NOT NULL CHECK (connection_type IN (
        'narrative_similarity', 'geographic', 'thematic', 'cultural',
        'professional', 'generational', 'experiential', 'collaborative'
    )),

    -- Similarity Factors (all 0.0-1.0 scale)
    shared_themes TEXT[] DEFAULT '{}',
    theme_similarity_score DECIMAL(3,2) DEFAULT 0.0,
    geographic_proximity_score DECIMAL(3,2) DEFAULT 0.0,
    cultural_similarity_score DECIMAL(3,2) DEFAULT 0.0,
    narrative_style_similarity DECIMAL(3,2) DEFAULT 0.0,
    life_experience_similarity DECIMAL(3,2) DEFAULT 0.0,
    professional_alignment_score DECIMAL(3,2) DEFAULT 0.0,

    -- Connection Evidence & Context
    shared_locations TEXT[] DEFAULT '{}',
    similar_experiences TEXT[] DEFAULT '{}',
    complementary_skills TEXT[] DEFAULT '{}',
    potential_collaboration_areas TEXT[] DEFAULT '{}',
    mutual_themes_count INTEGER DEFAULT 0,

    -- Supporting Data
    matching_quotes UUID[] DEFAULT '{}', -- References to similar quotes
    evidence_examples JSONB DEFAULT '{}', -- Specific examples of similarity
    ai_reasoning TEXT, -- Why AI suggested this connection

    -- AI Analysis Metadata
    ai_confidence DECIMAL(3,2) DEFAULT 0.0 CHECK (ai_confidence >= 0.0 AND ai_confidence <= 1.0),
    ai_model_version VARCHAR(50),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Connection Status & Management
    status VARCHAR(20) DEFAULT 'suggested' CHECK (status IN (
        'suggested', 'viewed', 'connected', 'declined', 'hidden', 'blocked'
    )),
    suggested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    viewed_at TIMESTAMP WITH TIME ZONE,
    connected_at TIMESTAMP WITH TIME ZONE,
    declined_at TIMESTAMP WITH TIME ZONE,

    -- Connection initiated by whom
    initiated_by UUID REFERENCES profiles(id),

    -- Mutual connection (both accepted)
    is_mutual BOOLEAN DEFAULT false,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(storyteller_a_id, storyteller_b_id),
    CHECK (storyteller_a_id != storyteller_b_id)
);

-- Indexes for network discovery performance
CREATE INDEX IF NOT EXISTS idx_storyteller_connections_a ON storyteller_connections(storyteller_a_id);
CREATE INDEX IF NOT EXISTS idx_storyteller_connections_b ON storyteller_connections(storyteller_b_id);
CREATE INDEX IF NOT EXISTS idx_storyteller_connections_strength ON storyteller_connections(connection_strength DESC);
CREATE INDEX IF NOT EXISTS idx_storyteller_connections_type ON storyteller_connections(connection_type);
CREATE INDEX IF NOT EXISTS idx_storyteller_connections_status ON storyteller_connections(status);
CREATE INDEX IF NOT EXISTS idx_storyteller_connections_mutual ON storyteller_connections(is_mutual) WHERE is_mutual = true;
CREATE INDEX IF NOT EXISTS idx_storyteller_connections_suggested ON storyteller_connections(suggested_at DESC) WHERE status = 'suggested';

-- ============================================================================
-- 2. STORYTELLER DEMOGRAPHICS - Rich demographic and geographic data
-- ============================================================================

CREATE TABLE IF NOT EXISTS storyteller_demographics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,

    -- Geographic Data
    current_location JSONB, -- {"city": "Katherine", "state": "NT", "country": "Australia", "coordinates": [lat, lng]}
    location_history JSONB[] DEFAULT '{}', -- Array of historical locations
    places_of_significance TEXT[] DEFAULT '{}', -- Important places mentioned in stories
    geographic_region VARCHAR(100), -- Broader regional classification

    -- Cultural Background
    cultural_background TEXT[] DEFAULT '{}',
    languages_spoken TEXT[] DEFAULT '{}',
    cultural_protocols_followed TEXT[] DEFAULT '{}',
    traditional_knowledge_areas TEXT[] DEFAULT '{}',

    -- Professional/Interest Areas
    professional_background TEXT[] DEFAULT '{}',
    areas_of_expertise TEXT[] DEFAULT '{}',
    interests_and_passions TEXT[] DEFAULT '{}',
    skills_and_talents TEXT[] DEFAULT '{}',

    -- Life Experiences & Journey
    significant_life_events TEXT[] DEFAULT '{}',
    challenges_overcome TEXT[] DEFAULT '{}',
    achievements_and_milestones TEXT[] DEFAULT '{}',
    life_transitions TEXT[] DEFAULT '{}',

    -- Community & Social Involvement
    organizations_involved TEXT[] DEFAULT '{}',
    causes_supported TEXT[] DEFAULT '{}',
    volunteer_work TEXT[] DEFAULT '{}',
    community_roles TEXT[] DEFAULT '{}',

    -- Generational & Family Context
    generation_category VARCHAR(50), -- 'elder', 'middle-aged', 'young-adult', 'youth'
    family_roles TEXT[] DEFAULT '{}', -- 'parent', 'grandparent', 'caregiver', etc.
    mentorship_roles TEXT[] DEFAULT '{}', -- 'mentor', 'mentee', 'peer-supporter'

    -- Privacy & Sharing Settings
    location_sharing_level VARCHAR(20) DEFAULT 'city' CHECK (location_sharing_level IN (
        'exact', 'city', 'state', 'country', 'region', 'hidden'
    )),
    demographic_sharing_level VARCHAR(20) DEFAULT 'public' CHECK (demographic_sharing_level IN (
        'public', 'network', 'connections', 'private'
    )),
    cultural_info_sharing VARCHAR(20) DEFAULT 'public' CHECK (cultural_info_sharing IN (
        'public', 'cultural-community', 'connections', 'private'
    )),

    -- Data Sources & Confidence
    data_sources JSONB DEFAULT '{}', -- Track where demographic info came from
    ai_extracted_confidence DECIMAL(3,2) DEFAULT 0.0,
    manually_verified BOOLEAN DEFAULT false,
    last_updated_by UUID REFERENCES profiles(id),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one demographic record per storyteller
    UNIQUE(storyteller_id)
);

-- Indexes for demographic-based searches
CREATE INDEX IF NOT EXISTS idx_storyteller_demographics_storyteller ON storyteller_demographics(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_storyteller_demographics_location ON storyteller_demographics USING gin((current_location->'city'));
CREATE INDEX IF NOT EXISTS idx_storyteller_demographics_region ON storyteller_demographics(geographic_region);
CREATE INDEX IF NOT EXISTS idx_storyteller_demographics_cultural ON storyteller_demographics USING gin(cultural_background);
CREATE INDEX IF NOT EXISTS idx_storyteller_demographics_professional ON storyteller_demographics USING gin(professional_background);
CREATE INDEX IF NOT EXISTS idx_storyteller_demographics_generation ON storyteller_demographics(generation_category);

-- ============================================================================
-- 3. STORYTELLER RECOMMENDATIONS - Personalized recommendations
-- ============================================================================

CREATE TABLE IF NOT EXISTS storyteller_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,

    -- Recommendation Details
    recommendation_type VARCHAR(50) NOT NULL CHECK (recommendation_type IN (
        'connection', 'story_idea', 'collaboration', 'theme_exploration',
        'quote_inspiration', 'network_expansion', 'cultural_connection',
        'professional_opportunity', 'learning_opportunity'
    )),
    recommended_entity_type VARCHAR(50) NOT NULL CHECK (recommended_entity_type IN (
        'storyteller', 'theme', 'location', 'project', 'story_template',
        'quote', 'collaboration_opportunity', 'event', 'resource'
    )),
    recommended_entity_id UUID,

    -- Recommendation Content
    title VARCHAR(200) NOT NULL,
    description TEXT,
    reason TEXT, -- Why this is recommended
    potential_impact TEXT, -- What impact this could have
    call_to_action VARCHAR(200), -- What should the storyteller do

    -- Scoring & Confidence
    relevance_score DECIMAL(3,2) DEFAULT 0.0 CHECK (relevance_score >= 0.0 AND relevance_score <= 1.0),
    impact_potential_score DECIMAL(3,2) DEFAULT 0.0 CHECK (impact_potential_score >= 0.0 AND impact_potential_score <= 1.0),
    confidence_score DECIMAL(3,2) DEFAULT 0.0 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    priority_score DECIMAL(3,2) DEFAULT 0.0 CHECK (priority_score >= 0.0 AND priority_score <= 1.0),

    -- Supporting Evidence & Context
    supporting_data JSONB DEFAULT '{}', -- Evidence for the recommendation
    connection_context JSONB DEFAULT '{}', -- How this connects to storyteller's profile
    success_indicators TEXT[] DEFAULT '{}', -- What would indicate success

    -- AI & Model Information
    ai_model_version VARCHAR(50),
    generation_method VARCHAR(50), -- 'collaborative_filtering', 'content_based', 'hybrid', 'manual'

    -- Personalization Context
    based_on_themes TEXT[] DEFAULT '{}',
    based_on_connections UUID[] DEFAULT '{}',
    based_on_activities TEXT[] DEFAULT '{}',

    -- Status & Engagement Tracking
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN (
        'active', 'viewed', 'acted_upon', 'dismissed', 'expired', 'hidden'
    )),
    viewed_at TIMESTAMP WITH TIME ZONE,
    acted_upon_at TIMESTAMP WITH TIME ZONE,
    dismissed_at TIMESTAMP WITH TIME ZONE,
    engagement_score DECIMAL(3,2) DEFAULT 0.0,

    -- Feedback & Learning
    user_feedback VARCHAR(20) CHECK (user_feedback IN ('helpful', 'not_helpful', 'irrelevant', 'offensive')),
    feedback_notes TEXT,
    recommendation_outcome VARCHAR(50), -- Track what happened after recommendation

    -- Timing & Lifecycle
    expires_at TIMESTAMP WITH TIME ZONE,
    optimal_display_time TIMESTAMP WITH TIME ZONE, -- When to show this recommendation

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for recommendation serving and analytics
CREATE INDEX IF NOT EXISTS idx_storyteller_recommendations_storyteller ON storyteller_recommendations(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_storyteller_recommendations_type ON storyteller_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_storyteller_recommendations_priority ON storyteller_recommendations(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_storyteller_recommendations_status ON storyteller_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_storyteller_recommendations_active ON storyteller_recommendations(storyteller_id, status)
    WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_storyteller_recommendations_relevance ON storyteller_recommendations(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_storyteller_recommendations_entity ON storyteller_recommendations(recommended_entity_type, recommended_entity_id);

-- ============================================================================
-- 4. CROSS-NARRATIVE INSIGHTS - Platform-wide storytelling insights
-- ============================================================================

CREATE TABLE IF NOT EXISTS cross_narrative_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,

    -- Insight Classification
    insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN (
        'trend', 'pattern', 'correlation', 'emergence', 'decline',
        'seasonal', 'demographic', 'geographic', 'thematic', 'network'
    )),
    insight_category VARCHAR(50), -- 'community', 'cultural', 'professional', 'generational'

    -- Insight Content
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    significance TEXT, -- Why this insight matters
    implications TEXT, -- What this means for storytellers
    recommendations TEXT, -- What actions to take

    -- Scope & Scale
    affected_storytellers UUID[] DEFAULT '{}',
    storyteller_count INTEGER DEFAULT 0,
    geographic_scope TEXT[] DEFAULT '{}', -- Regions/locations affected
    demographic_scope TEXT[] DEFAULT '{}', -- Demographics affected

    -- Evidence & Supporting Data
    supporting_quotes UUID[] DEFAULT '{}', -- References to storyteller_quotes
    supporting_themes UUID[] DEFAULT '{}', -- References to narrative_themes
    supporting_connections UUID[] DEFAULT '{}', -- References to storyteller_connections
    statistical_evidence JSONB DEFAULT '{}', -- Numbers, percentages, correlations
    data_sources TEXT[] DEFAULT '{}', -- What data this insight is based on

    -- Temporal Context
    time_period_start TIMESTAMP WITH TIME ZONE,
    time_period_end TIMESTAMP WITH TIME ZONE,
    trend_direction VARCHAR(20) CHECK (trend_direction IN (
        'increasing', 'decreasing', 'stable', 'emerging', 'declining', 'cyclical'
    )),
    velocity_score DECIMAL(3,2) DEFAULT 0.0, -- How fast the trend is changing

    -- AI Analysis & Confidence
    confidence_level DECIMAL(3,2) DEFAULT 0.0 CHECK (confidence_level >= 0.0 AND confidence_level <= 1.0),
    ai_model_version VARCHAR(50),
    validation_method VARCHAR(50), -- How the insight was validated
    peer_reviewed BOOLEAN DEFAULT false,

    -- Impact & Actionability
    potential_reach INTEGER DEFAULT 0,
    actionability_score DECIMAL(3,2) DEFAULT 0.0, -- How actionable this insight is
    urgency_level VARCHAR(20) DEFAULT 'medium' CHECK (urgency_level IN (
        'low', 'medium', 'high', 'critical'
    )),

    -- Visibility & Status
    visibility_level VARCHAR(20) DEFAULT 'public' CHECK (visibility_level IN (
        'public', 'network', 'admin', 'private'
    )),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN (
        'draft', 'active', 'archived', 'disputed', 'outdated'
    )),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for insight discovery and serving
CREATE INDEX IF NOT EXISTS idx_cross_narrative_insights_type ON cross_narrative_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_cross_narrative_insights_category ON cross_narrative_insights(insight_category);
CREATE INDEX IF NOT EXISTS idx_cross_narrative_insights_confidence ON cross_narrative_insights(confidence_level DESC);
CREATE INDEX IF NOT EXISTS idx_cross_narrative_insights_reach ON cross_narrative_insights(potential_reach DESC);
CREATE INDEX IF NOT EXISTS idx_cross_narrative_insights_urgency ON cross_narrative_insights(urgency_level, confidence_level DESC);
CREATE INDEX IF NOT EXISTS idx_cross_narrative_insights_time_period ON cross_narrative_insights(time_period_start, time_period_end);
CREATE INDEX IF NOT EXISTS idx_cross_narrative_insights_status ON cross_narrative_insights(status, visibility_level);

-- ============================================================================
-- 5. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all network discovery tables
ALTER TABLE storyteller_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyteller_demographics ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyteller_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_narrative_insights ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (idempotent)
DROP POLICY IF EXISTS "Users can view their own connections" ON storyteller_connections;
DROP POLICY IF EXISTS "Users can manage their own connections" ON storyteller_connections;
DROP POLICY IF EXISTS "Demographics respect privacy settings" ON storyteller_demographics;
DROP POLICY IF EXISTS "Users can view their own recommendations" ON storyteller_recommendations;
DROP POLICY IF EXISTS "Users can update their own recommendations" ON storyteller_recommendations;
DROP POLICY IF EXISTS "Insights respect visibility levels" ON cross_narrative_insights;

-- Storyteller Connections Policies
CREATE POLICY "Users can view their own connections" ON storyteller_connections
    FOR SELECT USING (
        storyteller_a_id = auth.uid() OR
        storyteller_b_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND ('admin' = ANY(p.tenant_roles) OR 'super_admin' = ANY(p.tenant_roles))
        )
    );

CREATE POLICY "Users can manage their own connections" ON storyteller_connections
    FOR UPDATE USING (
        storyteller_a_id = auth.uid() OR storyteller_b_id = auth.uid()
    );

-- Demographics Policies (Respect privacy levels)
CREATE POLICY "Demographics respect privacy settings" ON storyteller_demographics
    FOR SELECT USING (
        storyteller_id = auth.uid() OR
        (demographic_sharing_level = 'public') OR
        (demographic_sharing_level = 'network' AND EXISTS (
            SELECT 1 FROM storyteller_connections sc
            WHERE (sc.storyteller_a_id = auth.uid() AND sc.storyteller_b_id = storyteller_id)
               OR (sc.storyteller_b_id = auth.uid() AND sc.storyteller_a_id = storyteller_id)
            AND sc.status = 'connected'
        )) OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND ('admin' = ANY(p.tenant_roles) OR 'super_admin' = ANY(p.tenant_roles))
        )
    );

-- Recommendations Policies
CREATE POLICY "Users can view their own recommendations" ON storyteller_recommendations
    FOR SELECT USING (
        storyteller_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND ('admin' = ANY(p.tenant_roles) OR 'super_admin' = ANY(p.tenant_roles))
        )
    );

CREATE POLICY "Users can update their own recommendations" ON storyteller_recommendations
    FOR UPDATE USING (storyteller_id = auth.uid());

-- Cross-Narrative Insights Policies
CREATE POLICY "Insights respect visibility levels" ON cross_narrative_insights
    FOR SELECT USING (
        visibility_level = 'public' OR
        (visibility_level = 'network' AND auth.uid() IS NOT NULL) OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND ('admin' = ANY(p.tenant_roles) OR 'super_admin' = ANY(p.tenant_roles))
        )
    );

-- ============================================================================
-- 6. HELPER FUNCTIONS FOR NETWORK DISCOVERY
-- ============================================================================

-- Function to find potential connections for a storyteller
CREATE OR REPLACE FUNCTION find_storyteller_connections(
    p_storyteller_id UUID,
    p_connection_types TEXT[] DEFAULT ARRAY['narrative_similarity', 'thematic', 'geographic']::TEXT[],
    p_min_strength DECIMAL DEFAULT 0.3,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
    connection_id UUID,
    potential_connection_id UUID,
    connection_type VARCHAR,
    strength DECIMAL,
    shared_themes TEXT[],
    reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sc.id,
        CASE
            WHEN sc.storyteller_a_id = p_storyteller_id THEN sc.storyteller_b_id
            ELSE sc.storyteller_a_id
        END,
        sc.connection_type,
        sc.connection_strength,
        sc.shared_themes,
        sc.ai_reasoning
    FROM storyteller_connections sc
    WHERE (sc.storyteller_a_id = p_storyteller_id OR sc.storyteller_b_id = p_storyteller_id)
      AND sc.connection_type = ANY(p_connection_types)
      AND sc.connection_strength >= p_min_strength
      AND sc.status = 'suggested'
    ORDER BY sc.connection_strength DESC, sc.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get storyteller recommendations by type
CREATE OR REPLACE FUNCTION get_storyteller_recommendations(
    p_storyteller_id UUID,
    p_recommendation_types TEXT[] DEFAULT ARRAY['connection', 'story_idea', 'collaboration']::TEXT[],
    p_min_relevance DECIMAL DEFAULT 0.5,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
    recommendation_id UUID,
    rec_type VARCHAR,
    title VARCHAR,
    description TEXT,
    relevance_score DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sr.id,
        sr.recommendation_type,
        sr.title,
        sr.description,
        sr.relevance_score,
        sr.created_at
    FROM storyteller_recommendations sr
    WHERE sr.storyteller_id = p_storyteller_id
      AND sr.recommendation_type = ANY(p_recommendation_types)
      AND sr.relevance_score >= p_min_relevance
      AND sr.status = 'active'
      AND (sr.expires_at IS NULL OR sr.expires_at > NOW())
    ORDER BY sr.priority_score DESC, sr.relevance_score DESC, sr.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate connection strength between two storytellers
CREATE OR REPLACE FUNCTION calculate_connection_strength(
    p_storyteller_a_id UUID,
    p_storyteller_b_id UUID
)
RETURNS DECIMAL AS $$
DECLARE
    theme_similarity DECIMAL := 0.0;
    geographic_similarity DECIMAL := 0.0;
    demographic_similarity DECIMAL := 0.0;
    final_strength DECIMAL := 0.0;
BEGIN
    -- Calculate theme similarity
    SELECT COALESCE(
        (COUNT(DISTINCT sta.theme_id) * 1.0) / GREATEST(
            (SELECT COUNT(DISTINCT theme_id) FROM storyteller_themes WHERE storyteller_id = p_storyteller_a_id),
            (SELECT COUNT(DISTINCT theme_id) FROM storyteller_themes WHERE storyteller_id = p_storyteller_b_id)
        ), 0.0
    ) INTO theme_similarity
    FROM storyteller_themes sta
    INNER JOIN storyteller_themes stb ON sta.theme_id = stb.theme_id
    WHERE sta.storyteller_id = p_storyteller_a_id
      AND stb.storyteller_id = p_storyteller_b_id;

    -- Calculate geographic similarity (simplified)
    SELECT CASE
        WHEN sda.current_location->>'city' = sdb.current_location->>'city' THEN 1.0
        WHEN sda.current_location->>'state' = sdb.current_location->>'state' THEN 0.7
        WHEN sda.current_location->>'country' = sdb.current_location->>'country' THEN 0.4
        ELSE 0.0
    END INTO geographic_similarity
    FROM storyteller_demographics sda, storyteller_demographics sdb
    WHERE sda.storyteller_id = p_storyteller_a_id
      AND sdb.storyteller_id = p_storyteller_b_id;

    -- Calculate weighted final strength
    final_strength := (theme_similarity * 0.5) + (geographic_similarity * 0.3) + (demographic_similarity * 0.2);

    RETURN LEAST(final_strength, 1.0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. INITIAL SETUP AND SAMPLE DATA
-- ============================================================================

-- Create sample connection types and reasons
INSERT INTO narrative_themes (tenant_id, theme_name, theme_category, theme_description, ai_confidence_score) VALUES
    ('00000000-0000-0000-0000-000000000000', 'Mentorship', 'community', 'Stories about mentoring others or being mentored', 0.95),
    ('00000000-0000-0000-0000-000000000000', 'Rural Life', 'geographic', 'Stories about life in rural or remote areas', 0.90),
    ('00000000-0000-0000-0000-000000000000', 'Urban Experience', 'geographic', 'Stories about city living and urban challenges', 0.90),
    ('00000000-0000-0000-0000-000000000000', 'Intergenerational Wisdom', 'cultural', 'Stories bridging different generations', 0.95),
    ('00000000-0000-0000-0000-000000000000', 'Innovation & Change', 'professional', 'Stories about creating change and innovation', 0.90),
    ('00000000-0000-0000-0000-000000000000', 'Spiritual Journey', 'personal', 'Stories of spiritual growth and discovery', 0.85)
ON CONFLICT (tenant_id, theme_name) DO NOTHING;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Add helpful comments
COMMENT ON TABLE storyteller_connections IS 'AI-discovered connections between storytellers based on narrative similarity';
COMMENT ON TABLE storyteller_demographics IS 'Rich demographic and geographic data for network discovery';
COMMENT ON TABLE storyteller_recommendations IS 'Personalized recommendations for storytellers';
COMMENT ON TABLE cross_narrative_insights IS 'Platform-wide insights discovered across multiple storytellers';

-- Log completion
DO $$
BEGIN
    RAISE NOTICE '🌐 Storyteller Network Discovery Migration completed successfully!';
    RAISE NOTICE '🤝 Created network connection discovery system';
    RAISE NOTICE '🎯 Added personalized recommendation engine';
    RAISE NOTICE '🔍 Implemented cross-narrative insights analytics';
    RAISE NOTICE '📊 Ready for beautiful storyteller network visualization!';
END $$;