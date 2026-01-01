-- 🌟 Combined Storyteller Analytics Migrations
-- Apply this entire script in Supabase SQL Editor

-- Enable extensions first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "vector"; -- Uncomment if vector extension is available


-- ============================================================================
-- FOUNDATION MIGRATION
-- ============================================================================

-- 🌟 Storyteller Analytics Foundation Migration
-- Creates the core tables for storyteller-centered analytics ecosystem

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "vector"; -- Only enable if vector extension is available

-- ============================================================================
-- 1. STORYTELLER ANALYTICS HUB - Central metrics for each storyteller
-- ============================================================================

CREATE TABLE IF NOT EXISTS storyteller_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,

    -- Core Metrics
    total_stories INTEGER DEFAULT 0,
    total_transcripts INTEGER DEFAULT 0,
    total_word_count INTEGER DEFAULT 0,
    total_engagement_score DECIMAL(10,2) DEFAULT 0.0,
    impact_reach INTEGER DEFAULT 0,

    -- Theme Analytics
    primary_themes TEXT[] DEFAULT '{}',
    theme_distribution JSONB DEFAULT '{}', -- {"health": 45, "community": 30, "family": 25}
    theme_evolution JSONB DEFAULT '{}', -- Track theme changes over time

    -- Narrative Intelligence
    storytelling_style VARCHAR(50), -- 'inspirational', 'reflective', 'educational', etc.
    emotional_tone_profile JSONB DEFAULT '{}',
    cultural_elements_frequency JSONB DEFAULT '{}',

    -- Network Metrics
    connection_count INTEGER DEFAULT 0,
    shared_narrative_count INTEGER DEFAULT 0,
    collaboration_score DECIMAL(5,2) DEFAULT 0.0,

    -- Engagement & Impact
    story_view_count INTEGER DEFAULT 0,
    story_share_count INTEGER DEFAULT 0,
    quote_citation_count INTEGER DEFAULT 0,
    inspiration_impact_score DECIMAL(10,2) DEFAULT 0.0,

    -- Timestamps
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one analytics record per storyteller
    UNIQUE(storyteller_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_storyteller_analytics_storyteller_id ON storyteller_analytics(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_storyteller_analytics_tenant_id ON storyteller_analytics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_storyteller_analytics_impact_score ON storyteller_analytics(impact_reach DESC);
CREATE INDEX IF NOT EXISTS idx_storyteller_analytics_engagement ON storyteller_analytics(total_engagement_score DESC);

-- ============================================================================
-- 2. NARRATIVE THEMES INTELLIGENCE - AI-extracted themes with rich metadata
-- ============================================================================

CREATE TABLE IF NOT EXISTS narrative_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,

    -- Theme Definition
    theme_name VARCHAR(100) NOT NULL,
    theme_category VARCHAR(50), -- 'personal', 'cultural', 'professional', 'community', 'health', 'family'
    theme_description TEXT,

    -- AI Analysis
    ai_confidence_score DECIMAL(3,2) DEFAULT 0.0 CHECK (ai_confidence_score >= 0.0 AND ai_confidence_score <= 1.0),
    related_themes TEXT[] DEFAULT '{}',
    sentiment_score DECIMAL(3,2) DEFAULT 0.0 CHECK (sentiment_score >= -1.0 AND sentiment_score <= 1.0),

    -- Usage Statistics
    usage_count INTEGER DEFAULT 0,
    storyteller_count INTEGER DEFAULT 0,
    first_detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Semantic Embeddings (for AI similarity)
    -- theme_embedding VECTOR(1536), -- OpenAI embeddings -- Uncomment when vector extension is available

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure unique themes per tenant
    UNIQUE(tenant_id, theme_name)
);

-- Indexes for performance and search
CREATE INDEX IF NOT EXISTS idx_narrative_themes_tenant ON narrative_themes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_narrative_themes_category ON narrative_themes(theme_category);
CREATE INDEX IF NOT EXISTS idx_narrative_themes_usage ON narrative_themes(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_narrative_themes_confidence ON narrative_themes(ai_confidence_score DESC);
-- Vector similarity index will be created when vector extension is properly set up
-- CREATE INDEX IF NOT EXISTS idx_narrative_themes_embedding ON narrative_themes USING ivfflat (theme_embedding vector_cosine_ops);

-- ============================================================================
-- 3. STORYTELLER THEME CONNECTIONS - Many-to-many with strength scoring
-- ============================================================================

CREATE TABLE IF NOT EXISTS storyteller_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    theme_id UUID NOT NULL REFERENCES narrative_themes(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,

    -- Connection Strength
    prominence_score DECIMAL(5,2) DEFAULT 0.0 CHECK (prominence_score >= 0.0),
    frequency_count INTEGER DEFAULT 0,
    first_occurrence TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_occurrence TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Context & Evidence
    source_stories UUID[] DEFAULT '{}', -- Which stories contain this theme
    source_transcripts UUID[] DEFAULT '{}', -- Which transcripts contain this theme
    key_quotes TEXT[] DEFAULT '{}', -- Representative quotes for this theme
    context_examples JSONB DEFAULT '{}', -- Specific examples where theme appears

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure unique theme per storyteller
    UNIQUE(storyteller_id, theme_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_storyteller_themes_storyteller ON storyteller_themes(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_storyteller_themes_theme ON storyteller_themes(theme_id);
CREATE INDEX IF NOT EXISTS idx_storyteller_themes_prominence ON storyteller_themes(prominence_score DESC);
CREATE INDEX IF NOT EXISTS idx_storyteller_themes_frequency ON storyteller_themes(frequency_count DESC);

-- ============================================================================
-- 4. POWERFUL QUOTES DATABASE - Extracting and cataloging impactful quotes
-- ============================================================================

CREATE TABLE IF NOT EXISTS storyteller_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,

    -- Quote Content
    quote_text TEXT NOT NULL CHECK (length(quote_text) > 0),
    context_before TEXT, -- 100 chars before for context
    context_after TEXT,  -- 100 chars after for context

    -- Source Information
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('transcript', 'story', 'interview', 'media')),
    source_id UUID NOT NULL,
    source_title VARCHAR(200),
    timestamp_in_source INTEGER, -- For transcripts with timestamps
    page_or_section VARCHAR(100), -- For longer content

    -- AI Analysis Scores
    emotional_impact_score DECIMAL(3,2) DEFAULT 0.0 CHECK (emotional_impact_score >= 0.0 AND emotional_impact_score <= 1.0),
    wisdom_score DECIMAL(3,2) DEFAULT 0.0 CHECK (wisdom_score >= 0.0 AND wisdom_score <= 1.0),
    quotability_score DECIMAL(3,2) DEFAULT 0.0 CHECK (quotability_score >= 0.0 AND quotability_score <= 1.0),
    inspiration_score DECIMAL(3,2) DEFAULT 0.0 CHECK (inspiration_score >= 0.0 AND inspiration_score <= 1.0),

    -- Categorization
    themes TEXT[] DEFAULT '{}',
    sentiment_score DECIMAL(3,2) DEFAULT 0.0 CHECK (sentiment_score >= -1.0 AND sentiment_score <= 1.0),
    quote_category VARCHAR(50), -- 'wisdom', 'inspiration', 'cultural', 'personal', 'professional'

    -- Usage & Impact Tracking
    citation_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    inspiration_rating DECIMAL(3,2) DEFAULT 0.0,

    -- Semantic Search Support
    -- quote_embedding VECTOR(1536), -- For semantic search -- Uncomment when vector extension is available

    -- Privacy & Approval
    is_public BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance and search
CREATE INDEX IF NOT EXISTS idx_storyteller_quotes_storyteller ON storyteller_quotes(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_storyteller_quotes_source ON storyteller_quotes(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_storyteller_quotes_quotability ON storyteller_quotes(quotability_score DESC);
CREATE INDEX IF NOT EXISTS idx_storyteller_quotes_themes ON storyteller_quotes USING gin(themes);
CREATE INDEX IF NOT EXISTS idx_storyteller_quotes_public ON storyteller_quotes(is_public, requires_approval);
CREATE INDEX IF NOT EXISTS idx_storyteller_quotes_category ON storyteller_quotes(quote_category);
-- Vector similarity index for semantic search
-- CREATE INDEX IF NOT EXISTS idx_storyteller_quotes_embedding ON storyteller_quotes USING ivfflat (quote_embedding vector_cosine_ops);

-- ============================================================================
-- 5. ENHANCED PROFILE FEATURES - Add analytics preferences to existing profiles
-- ============================================================================

-- Add analytics and network discovery columns to existing profiles table
DO $$
BEGIN
    -- Analytics preferences for personalized dashboards
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'analytics_preferences') THEN
        ALTER TABLE profiles ADD COLUMN analytics_preferences JSONB DEFAULT '{
            "dashboard_themes": ["impact", "network", "themes", "quotes"],
            "privacy_level": "public",
            "show_metrics": true,
            "show_recommendations": true
        }';
    END IF;

    -- Network visibility settings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'network_visibility') THEN
        ALTER TABLE profiles ADD COLUMN network_visibility VARCHAR(20) DEFAULT 'public'
        CHECK (network_visibility IN ('public', 'network', 'private'));
    END IF;

    -- Recommendation opt-in
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'recommendation_opt_in') THEN
        ALTER TABLE profiles ADD COLUMN recommendation_opt_in BOOLEAN DEFAULT true;
    END IF;

    -- Calculated impact score
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'impact_score') THEN
        ALTER TABLE profiles ADD COLUMN impact_score DECIMAL(5,2) DEFAULT 0.0;
    END IF;

    -- Primary narrative themes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'narrative_themes') THEN
        ALTER TABLE profiles ADD COLUMN narrative_themes TEXT[] DEFAULT '{}';
    END IF;

    -- Network connection strength scores
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'connection_strength_scores') THEN
        ALTER TABLE profiles ADD COLUMN connection_strength_scores JSONB DEFAULT '{}';
    END IF;
END $$;

-- ============================================================================
-- 6. ANALYTICS PROCESSING JOBS - Track background analytics processing
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,

    -- Job Details
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN (
        'theme_analysis', 'quote_extraction', 'connection_discovery',
        'insights_generation', 'analytics_calculation', 'embedding_generation'
    )),
    job_status VARCHAR(20) DEFAULT 'pending' CHECK (job_status IN (
        'pending', 'running', 'completed', 'failed', 'cancelled'
    )),

    -- Processing Scope
    storyteller_id UUID REFERENCES profiles(id), -- For individual storyteller jobs
    entity_ids UUID[] DEFAULT '{}', -- Stories, transcripts, etc. to process
    entity_types VARCHAR(50)[] DEFAULT '{}', -- Types of entities being processed

    -- Progress Tracking
    total_items INTEGER DEFAULT 0,
    processed_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    success_rate DECIMAL(3,2) GENERATED ALWAYS AS (
        CASE
            WHEN total_items > 0 THEN (processed_items::DECIMAL / total_items::DECIMAL)
            ELSE 0.0
        END
    ) STORED,

    -- Results & Output
    results_summary JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    error_details TEXT,
    warnings TEXT[],

    -- Performance Metrics
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    processing_time_seconds INTEGER GENERATED ALWAYS AS (
        CASE
            WHEN started_at IS NOT NULL AND completed_at IS NOT NULL
            THEN EXTRACT(EPOCH FROM (completed_at - started_at))::INTEGER
            ELSE NULL
        END
    ) STORED,

    -- AI Model Information
    ai_model_used VARCHAR(100),
    ai_model_version VARCHAR(50),
    ai_processing_cost DECIMAL(8,4), -- Track AI processing costs

    -- Priority & Scheduling
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for job processing and monitoring
CREATE INDEX IF NOT EXISTS idx_analytics_jobs_status ON analytics_processing_jobs(job_status);
CREATE INDEX IF NOT EXISTS idx_analytics_jobs_type ON analytics_processing_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_analytics_jobs_priority ON analytics_processing_jobs(priority DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_analytics_jobs_storyteller ON analytics_processing_jobs(storyteller_id) WHERE storyteller_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_jobs_scheduled ON analytics_processing_jobs(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_jobs_tenant ON analytics_processing_jobs(tenant_id);

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE storyteller_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE narrative_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyteller_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyteller_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_processing_jobs ENABLE ROW LEVEL SECURITY;

-- Storyteller Analytics Policies
CREATE POLICY "Storytellers can view their own analytics" ON storyteller_analytics
    FOR SELECT USING (
        storyteller_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.tenant_roles @> ARRAY['admin'] OR p.tenant_roles @> ARRAY['super_admin'])
        )
    );

CREATE POLICY "System can manage analytics" ON storyteller_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.tenant_roles @> ARRAY['admin'] OR p.tenant_roles @> ARRAY['super_admin'])
        )
    );

-- Narrative Themes Policies (Public themes, admin management)
CREATE POLICY "Public themes are viewable" ON narrative_themes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage themes" ON narrative_themes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.tenant_roles @> ARRAY['admin'] OR p.tenant_roles @> ARRAY['super_admin'])
        )
    );

-- Storyteller Themes Policies
CREATE POLICY "Storytellers can view their own themes" ON storyteller_themes
    FOR SELECT USING (
        storyteller_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.tenant_roles @> ARRAY['admin'] OR p.tenant_roles @> ARRAY['super_admin'])
        )
    );

-- Quotes Policies (Respect privacy settings)
CREATE POLICY "Public quotes are viewable" ON storyteller_quotes
    FOR SELECT USING (
        (is_public = true AND (requires_approval = false OR approved_at IS NOT NULL)) OR
        storyteller_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.tenant_roles @> ARRAY['admin'] OR p.tenant_roles @> ARRAY['super_admin'])
        )
    );

-- Analytics Jobs Policies
CREATE POLICY "Users can view relevant jobs" ON analytics_processing_jobs
    FOR SELECT USING (
        storyteller_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.tenant_roles @> ARRAY['admin'] OR p.tenant_roles @> ARRAY['super_admin'])
        )
    );

-- ============================================================================
-- 8. HELPFUL FUNCTIONS
-- ============================================================================

-- Function to calculate storyteller analytics
CREATE OR REPLACE FUNCTION calculate_storyteller_analytics(p_storyteller_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO storyteller_analytics (storyteller_id, tenant_id, total_stories, total_transcripts, last_calculated_at)
    SELECT
        p_storyteller_id,
        p.tenant_id,
        COALESCE((SELECT COUNT(*) FROM stories WHERE storyteller_id = p_storyteller_id), 0),
        COALESCE((SELECT COUNT(*) FROM transcripts WHERE storyteller_id = p_storyteller_id), 0),
        NOW()
    FROM profiles p
    WHERE p.id = p_storyteller_id
    ON CONFLICT (storyteller_id) DO UPDATE SET
        total_stories = EXCLUDED.total_stories,
        total_transcripts = EXCLUDED.total_transcripts,
        last_calculated_at = EXCLUDED.last_calculated_at,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get top themes for a storyteller
CREATE OR REPLACE FUNCTION get_storyteller_top_themes(p_storyteller_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE(theme_name TEXT, prominence_score DECIMAL, frequency_count INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT
        nt.theme_name,
        st.prominence_score,
        st.frequency_count
    FROM storyteller_themes st
    JOIN narrative_themes nt ON st.theme_id = nt.id
    WHERE st.storyteller_id = p_storyteller_id
    ORDER BY st.prominence_score DESC, st.frequency_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. INITIAL DATA SETUP
-- ============================================================================

-- Insert some common narrative themes to get started
INSERT INTO narrative_themes (tenant_id, theme_name, theme_category, theme_description) VALUES
    -- Universal themes that work across all storytellers
    ('00000000-0000-0000-0000-000000000000', 'Personal Growth', 'personal', 'Stories of learning, development, and self-improvement'),
    ('00000000-0000-0000-0000-000000000000', 'Family Heritage', 'family', 'Stories about family traditions, ancestry, and generational wisdom'),
    ('00000000-0000-0000-0000-000000000000', 'Community Leadership', 'community', 'Stories of leading and serving communities'),
    ('00000000-0000-0000-0000-000000000000', 'Health & Healing', 'health', 'Stories related to physical, mental, and spiritual health'),
    ('00000000-0000-0000-0000-000000000000', 'Cultural Preservation', 'cultural', 'Stories about maintaining and sharing cultural practices'),
    ('00000000-0000-0000-0000-000000000000', 'Professional Journey', 'professional', 'Career development and professional achievements'),
    ('00000000-0000-0000-0000-000000000000', 'Overcoming Challenges', 'personal', 'Stories of resilience and overcoming obstacles'),
    ('00000000-0000-0000-0000-000000000000', 'Education & Learning', 'educational', 'Stories about teaching, learning, and knowledge sharing'),
    ('00000000-0000-0000-0000-000000000000', 'Social Impact', 'community', 'Stories of making positive change in society'),
    ('00000000-0000-0000-0000-000000000000', 'Youth Empowerment', 'community', 'Stories of inspiring and mentoring young people')
ON CONFLICT (tenant_id, theme_name) DO NOTHING;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Add helpful comment
COMMENT ON TABLE storyteller_analytics IS 'Central hub for all storyteller metrics and analytics data';
COMMENT ON TABLE narrative_themes IS 'AI-extracted and manually curated themes from storytelling content';
COMMENT ON TABLE storyteller_themes IS 'Connection between storytellers and their prominent narrative themes';
COMMENT ON TABLE storyteller_quotes IS 'Powerful, quotable moments extracted from storyteller content';
COMMENT ON TABLE analytics_processing_jobs IS 'Background job tracking for analytics processing and AI analysis';

-- Log completion
DO $$
BEGIN
    RAISE NOTICE '🌟 Storyteller Analytics Foundation Migration completed successfully!';
    RAISE NOTICE '📊 Created tables: storyteller_analytics, narrative_themes, storyteller_themes, storyteller_quotes, analytics_processing_jobs';
    RAISE NOTICE '🔐 Applied Row Level Security policies for data protection';
    RAISE NOTICE '🚀 Ready for beautiful storyteller-centered analytics!';
END $$;


-- ============================================================================
-- NETWORK DISCOVERY MIGRATION
-- ============================================================================

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

-- Storyteller Connections Policies
CREATE POLICY "Users can view their own connections" ON storyteller_connections
    FOR SELECT USING (
        storyteller_a_id = auth.uid() OR
        storyteller_b_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.tenant_roles @> ARRAY['admin'] OR p.tenant_roles @> ARRAY['super_admin'])
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
            AND (p.tenant_roles @> ARRAY['admin'] OR p.tenant_roles @> ARRAY['super_admin'])
        )
    );

-- Recommendations Policies
CREATE POLICY "Users can view their own recommendations" ON storyteller_recommendations
    FOR SELECT USING (
        storyteller_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.tenant_roles @> ARRAY['admin'] OR p.tenant_roles @> ARRAY['super_admin'])
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
            AND (p.tenant_roles @> ARRAY['admin'] OR p.tenant_roles @> ARRAY['super_admin'])
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


-- ============================================================================
-- DASHBOARD ANALYTICS MIGRATION
-- ============================================================================

-- 📊 Storyteller Dashboard Analytics Migration
-- Creates tables and systems for beautiful storyteller-centered dashboard analytics

-- ============================================================================
-- 1. STORYTELLER ENGAGEMENT METRICS - Track platform engagement over time
-- ============================================================================

CREATE TABLE IF NOT EXISTS storyteller_engagement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,

    -- Time Period Definition
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly')),

    -- Content Creation Activity
    stories_created INTEGER DEFAULT 0,
    transcripts_processed INTEGER DEFAULT 0,
    quotes_shared INTEGER DEFAULT 0,
    themes_explored INTEGER DEFAULT 0,
    media_items_uploaded INTEGER DEFAULT 0,

    -- Network & Social Activity
    connections_made INTEGER DEFAULT 0,
    connections_accepted INTEGER DEFAULT 0,
    recommendations_viewed INTEGER DEFAULT 0,
    recommendations_acted_upon INTEGER DEFAULT 0,

    -- Content Interaction Metrics
    profile_views INTEGER DEFAULT 0,
    story_views INTEGER DEFAULT 0,
    story_shares INTEGER DEFAULT 0,
    quote_citations INTEGER DEFAULT 0,
    comments_received INTEGER DEFAULT 0,
    comments_given INTEGER DEFAULT 0,

    -- Platform Engagement
    login_days INTEGER DEFAULT 0,
    active_minutes INTEGER DEFAULT 0,
    features_used TEXT[] DEFAULT '{}', -- Track which features were used
    page_views INTEGER DEFAULT 0,

    -- Content Quality & Impact
    average_story_rating DECIMAL(3,2) DEFAULT 0.0,
    story_completion_rate DECIMAL(3,2) DEFAULT 0.0, -- % of started stories completed
    ai_analysis_requests INTEGER DEFAULT 0,
    high_impact_content_count INTEGER DEFAULT 0, -- Stories/quotes with high impact scores

    -- Learning & Growth Indicators
    new_themes_discovered INTEGER DEFAULT 0,
    skill_development_activities INTEGER DEFAULT 0,
    tutorial_completions INTEGER DEFAULT 0,

    -- Collaboration & Community
    collaborative_projects INTEGER DEFAULT 0,
    community_contributions INTEGER DEFAULT 0,
    mentoring_activities INTEGER DEFAULT 0,

    -- Calculated Scores
    engagement_score DECIMAL(5,2) DEFAULT 0.0, -- Overall engagement score
    growth_score DECIMAL(5,2) DEFAULT 0.0, -- Personal growth/learning score
    impact_score DECIMAL(5,2) DEFAULT 0.0, -- Community impact score
    consistency_score DECIMAL(5,2) DEFAULT 0.0, -- How consistent their engagement is

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for engagement analytics
CREATE INDEX IF NOT EXISTS idx_storyteller_engagement_storyteller ON storyteller_engagement(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_storyteller_engagement_period ON storyteller_engagement(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_storyteller_engagement_type ON storyteller_engagement(period_type);
CREATE INDEX IF NOT EXISTS idx_storyteller_engagement_scores ON storyteller_engagement(engagement_score DESC, impact_score DESC);

-- ============================================================================
-- 2. PLATFORM ANALYTICS SUMMARY - High-level platform metrics
-- ============================================================================

CREATE TABLE IF NOT EXISTS platform_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,

    -- Time Period
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),

    -- Storyteller Metrics
    total_storytellers INTEGER DEFAULT 0,
    active_storytellers INTEGER DEFAULT 0, -- Active in this period
    new_storytellers INTEGER DEFAULT 0,
    returning_storytellers INTEGER DEFAULT 0,

    -- Content Metrics
    total_stories INTEGER DEFAULT 0,
    stories_created INTEGER DEFAULT 0,
    total_transcripts INTEGER DEFAULT 0,
    transcripts_processed INTEGER DEFAULT 0,
    total_quotes INTEGER DEFAULT 0,
    quotes_extracted INTEGER DEFAULT 0,

    -- Theme & Content Analytics
    total_themes INTEGER DEFAULT 0,
    new_themes_discovered INTEGER DEFAULT 0,
    top_themes JSONB DEFAULT '{}', -- {"theme_name": count, ...}
    theme_distribution JSONB DEFAULT '{}', -- {"category": percentage, ...}
    trending_themes TEXT[] DEFAULT '{}',

    -- Network & Connection Analytics
    total_connections INTEGER DEFAULT 0,
    new_connections INTEGER DEFAULT 0,
    connection_success_rate DECIMAL(3,2) DEFAULT 0.0,
    average_connections_per_storyteller DECIMAL(5,2) DEFAULT 0.0,

    -- Quality & Impact Metrics
    average_story_quality DECIMAL(3,2) DEFAULT 0.0,
    average_ai_confidence DECIMAL(3,2) DEFAULT 0.0,
    high_impact_stories_count INTEGER DEFAULT 0,
    viral_content_count INTEGER DEFAULT 0, -- Highly shared content

    -- Geographic & Demographic Distribution
    storyteller_locations JSONB DEFAULT '{}', -- {"city": count, "state": count, ...}
    demographic_distribution JSONB DEFAULT '{}',
    geographic_diversity_score DECIMAL(3,2) DEFAULT 0.0,
    cultural_diversity_score DECIMAL(3,2) DEFAULT 0.0,

    -- Platform Health Indicators
    user_retention_rate DECIMAL(3,2) DEFAULT 0.0,
    content_creation_velocity DECIMAL(5,2) DEFAULT 0.0, -- Content per day
    community_health_score DECIMAL(3,2) DEFAULT 0.0,
    system_performance_score DECIMAL(3,2) DEFAULT 0.0,

    -- AI & Processing Metrics
    ai_jobs_completed INTEGER DEFAULT 0,
    ai_processing_success_rate DECIMAL(3,2) DEFAULT 0.0,
    average_ai_processing_time DECIMAL(6,2) DEFAULT 0.0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for platform analytics
CREATE INDEX IF NOT EXISTS idx_platform_analytics_tenant ON platform_analytics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_period ON platform_analytics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_type ON platform_analytics(period_type);

-- ============================================================================
-- 3. STORYTELLER IMPACT METRICS - Measure storyteller influence and reach
-- ============================================================================

CREATE TABLE IF NOT EXISTS storyteller_impact_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,

    -- Content Reach & Visibility
    total_content_views INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    content_shares INTEGER DEFAULT 0,
    content_bookmarks INTEGER DEFAULT 0,

    -- Inspiration & Influence Metrics
    quotes_cited_by_others INTEGER DEFAULT 0,
    stories_that_inspired_others INTEGER DEFAULT 0,
    mentorship_connections INTEGER DEFAULT 0,
    people_directly_impacted INTEGER DEFAULT 0,

    -- Cultural & Community Impact
    cultural_preservation_contributions INTEGER DEFAULT 0,
    community_initiatives_started INTEGER DEFAULT 0,
    cross_cultural_connections INTEGER DEFAULT 0,
    intergenerational_bridges INTEGER DEFAULT 0,

    -- Professional & Educational Impact
    professional_opportunities_created INTEGER DEFAULT 0,
    learning_resources_contributed INTEGER DEFAULT 0,
    skills_taught_or_shared INTEGER DEFAULT 0,
    career_guidance_provided INTEGER DEFAULT 0,

    -- Network Effect Metrics
    network_size INTEGER DEFAULT 0,
    network_diversity_score DECIMAL(3,2) DEFAULT 0.0,
    connection_quality_score DECIMAL(3,2) DEFAULT 0.0,
    network_growth_rate DECIMAL(3,2) DEFAULT 0.0,

    -- Content Quality Indicators
    average_content_rating DECIMAL(3,2) DEFAULT 0.0,
    content_completion_rate DECIMAL(3,2) DEFAULT 0.0,
    repeat_audience_percentage DECIMAL(3,2) DEFAULT 0.0,
    content_longevity_score DECIMAL(3,2) DEFAULT 0.0, -- How long content stays relevant

    -- Calculated Impact Scores
    overall_impact_score DECIMAL(5,2) DEFAULT 0.0,
    cultural_impact_score DECIMAL(5,2) DEFAULT 0.0,
    community_impact_score DECIMAL(5,2) DEFAULT 0.0,
    inspirational_impact_score DECIMAL(5,2) DEFAULT 0.0,

    -- Time-based Tracking
    first_impact_date TIMESTAMP WITH TIME ZONE,
    peak_impact_date TIMESTAMP WITH TIME ZONE,
    last_significant_impact TIMESTAMP WITH TIME ZONE,

    -- Growth & Trend Indicators
    impact_velocity DECIMAL(5,2) DEFAULT 0.0, -- Rate of impact growth
    impact_consistency DECIMAL(3,2) DEFAULT 0.0, -- How consistent their impact is
    impact_trend VARCHAR(20) DEFAULT 'stable' CHECK (impact_trend IN (
        'growing', 'stable', 'declining', 'emerging', 'peak'
    )),

    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one impact record per storyteller
    UNIQUE(storyteller_id)
);

-- Indexes for impact analytics
CREATE INDEX IF NOT EXISTS idx_storyteller_impact_storyteller ON storyteller_impact_metrics(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_storyteller_impact_overall_score ON storyteller_impact_metrics(overall_impact_score DESC);
CREATE INDEX IF NOT EXISTS idx_storyteller_impact_cultural_score ON storyteller_impact_metrics(cultural_impact_score DESC);
CREATE INDEX IF NOT EXISTS idx_storyteller_impact_trend ON storyteller_impact_metrics(impact_trend);
CREATE INDEX IF NOT EXISTS idx_storyteller_impact_velocity ON storyteller_impact_metrics(impact_velocity DESC);

-- ============================================================================
-- 4. DASHBOARD WIDGETS CONFIGURATION - Customizable dashboard layouts
-- ============================================================================

CREATE TABLE IF NOT EXISTS storyteller_dashboard_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,

    -- Dashboard Layout Configuration
    dashboard_layout VARCHAR(50) DEFAULT 'default' CHECK (dashboard_layout IN (
        'default', 'minimal', 'comprehensive', 'focus', 'network', 'analytics'
    )),

    -- Widget Preferences
    enabled_widgets JSONB DEFAULT '{
        "impact_overview": true,
        "theme_analysis": true,
        "network_connections": true,
        "quote_gallery": true,
        "story_metrics": true,
        "recommendations": true,
        "recent_activity": true,
        "growth_trends": true
    }',

    widget_positions JSONB DEFAULT '{}', -- Widget positioning data
    widget_sizes JSONB DEFAULT '{}', -- Widget size preferences

    -- Display Preferences
    theme_preferences JSONB DEFAULT '{
        "color_scheme": "default",
        "chart_style": "modern",
        "density": "comfortable"
    }',

    -- Privacy & Sharing Settings
    public_dashboard BOOLEAN DEFAULT false,
    shared_with_network BOOLEAN DEFAULT true,
    analytics_sharing_level VARCHAR(20) DEFAULT 'summary' CHECK (analytics_sharing_level IN (
        'private', 'summary', 'detailed', 'full'
    )),

    -- Notification Preferences
    notification_preferences JSONB DEFAULT '{
        "new_connections": true,
        "quote_citations": true,
        "story_milestones": true,
        "weekly_summary": true,
        "monthly_report": true
    }',

    -- Data Refresh Settings
    auto_refresh_enabled BOOLEAN DEFAULT true,
    refresh_interval_minutes INTEGER DEFAULT 60,
    last_refreshed_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one config per storyteller
    UNIQUE(storyteller_id)
);

-- Index for dashboard configurations
CREATE INDEX IF NOT EXISTS idx_storyteller_dashboard_config_storyteller ON storyteller_dashboard_config(storyteller_id);

-- ============================================================================
-- 5. STORYTELLER MILESTONE TRACKING - Track achievements and milestones
-- ============================================================================

CREATE TABLE IF NOT EXISTS storyteller_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,

    -- Milestone Definition
    milestone_type VARCHAR(50) NOT NULL CHECK (milestone_type IN (
        'first_story', 'story_count', 'connection_count', 'quote_citation',
        'theme_mastery', 'network_influencer', 'cultural_contributor',
        'community_leader', 'mentor_recognition', 'impact_achievement'
    )),

    milestone_title VARCHAR(200) NOT NULL,
    milestone_description TEXT,

    -- Achievement Details
    achievement_value INTEGER, -- Numeric value if applicable
    achievement_threshold INTEGER, -- What value was needed to achieve
    progress_percentage DECIMAL(3,2) DEFAULT 0.0,

    -- Status & Recognition
    status VARCHAR(20) DEFAULT 'achieved' CHECK (status IN (
        'achieved', 'in_progress', 'pending_verification', 'expired'
    )),
    achieved_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE,

    -- Context & Evidence
    supporting_data JSONB DEFAULT '{}',
    evidence_items UUID[] DEFAULT '{}', -- References to stories, quotes, etc.

    -- Visibility & Celebration
    is_public BOOLEAN DEFAULT true,
    celebration_shared BOOLEAN DEFAULT false,
    badge_earned VARCHAR(100), -- Badge identifier

    -- Impact & Recognition
    peer_congratulations INTEGER DEFAULT 0,
    mentor_recognition BOOLEAN DEFAULT false,
    featured_milestone BOOLEAN DEFAULT false,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for milestone tracking
CREATE INDEX IF NOT EXISTS idx_storyteller_milestones_storyteller ON storyteller_milestones(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_storyteller_milestones_type ON storyteller_milestones(milestone_type);
CREATE INDEX IF NOT EXISTS idx_storyteller_milestones_achieved ON storyteller_milestones(achieved_at DESC) WHERE status = 'achieved';
CREATE INDEX IF NOT EXISTS idx_storyteller_milestones_public ON storyteller_milestones(is_public, featured_milestone);

-- ============================================================================
-- 6. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all dashboard analytics tables
ALTER TABLE storyteller_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyteller_impact_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyteller_dashboard_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyteller_milestones ENABLE ROW LEVEL SECURITY;

-- Storyteller Engagement Policies
CREATE POLICY "Storytellers can view their own engagement" ON storyteller_engagement
    FOR SELECT USING (
        storyteller_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.tenant_roles @> ARRAY['admin'] OR p.tenant_roles @> ARRAY['super_admin'])
        )
    );

-- Platform Analytics Policies (Admin only for detailed data)
CREATE POLICY "Admins can view platform analytics" ON platform_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.tenant_roles @> ARRAY['admin'] OR p.tenant_roles @> ARRAY['super_admin'])
        )
    );

-- Impact Metrics Policies (Respect sharing preferences)
CREATE POLICY "Impact metrics respect sharing settings" ON storyteller_impact_metrics
    FOR SELECT USING (
        storyteller_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM storyteller_dashboard_config sdc
            WHERE sdc.storyteller_id = storyteller_impact_metrics.storyteller_id
            AND (sdc.public_dashboard = true OR
                 (sdc.shared_with_network = true AND EXISTS (
                     SELECT 1 FROM storyteller_connections sc
                     WHERE (sc.storyteller_a_id = auth.uid() AND sc.storyteller_b_id = storyteller_impact_metrics.storyteller_id)
                        OR (sc.storyteller_b_id = auth.uid() AND sc.storyteller_a_id = storyteller_impact_metrics.storyteller_id)
                     AND sc.status = 'connected'
                 )))
        ) OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.tenant_roles @> ARRAY['admin'] OR p.tenant_roles @> ARRAY['super_admin'])
        )
    );

-- Dashboard Config Policies
CREATE POLICY "Storytellers can manage their own dashboard config" ON storyteller_dashboard_config
    FOR ALL USING (storyteller_id = auth.uid());

-- Milestones Policies (Public milestones are viewable)
CREATE POLICY "Public milestones are viewable" ON storyteller_milestones
    FOR SELECT USING (
        is_public = true OR
        storyteller_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.tenant_roles @> ARRAY['admin'] OR p.tenant_roles @> ARRAY['super_admin'])
        )
    );

-- ============================================================================
-- 7. DASHBOARD ANALYTICS FUNCTIONS
-- ============================================================================

-- Function to calculate storyteller engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(p_storyteller_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    recent_engagement RECORD;
    engagement_score DECIMAL := 0.0;
BEGIN
    -- Get recent engagement data (last 30 days)
    SELECT
        COALESCE(SUM(stories_created), 0) as stories,
        COALESCE(SUM(connections_made), 0) as connections,
        COALESCE(SUM(story_views), 0) as views,
        COALESCE(SUM(active_minutes), 0) as minutes,
        COALESCE(AVG(average_story_rating), 0.0) as rating
    INTO recent_engagement
    FROM storyteller_engagement
    WHERE storyteller_id = p_storyteller_id
      AND period_start >= NOW() - INTERVAL '30 days';

    -- Calculate weighted engagement score
    engagement_score := (
        (recent_engagement.stories * 10.0) +
        (recent_engagement.connections * 5.0) +
        (recent_engagement.views * 0.1) +
        (recent_engagement.minutes * 0.05) +
        (recent_engagement.rating * 20.0)
    );

    RETURN LEAST(engagement_score, 100.0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get storyteller dashboard summary
CREATE OR REPLACE FUNCTION get_storyteller_dashboard_summary(p_storyteller_id UUID)
RETURNS TABLE(
    total_stories INTEGER,
    total_connections INTEGER,
    impact_score DECIMAL,
    top_themes TEXT[],
    recent_activity_count INTEGER,
    pending_recommendations INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH storyteller_stats AS (
        SELECT
            sa.total_stories,
            sa.connection_count,
            sim.overall_impact_score,
            sa.primary_themes
        FROM storyteller_analytics sa
        LEFT JOIN storyteller_impact_metrics sim ON sa.storyteller_id = sim.storyteller_id
        WHERE sa.storyteller_id = p_storyteller_id
    ),
    recent_activity AS (
        SELECT COUNT(*) as activity_count
        FROM storyteller_engagement se
        WHERE se.storyteller_id = p_storyteller_id
          AND se.period_start >= NOW() - INTERVAL '7 days'
    ),
    pending_recs AS (
        SELECT COUNT(*) as rec_count
        FROM storyteller_recommendations sr
        WHERE sr.storyteller_id = p_storyteller_id
          AND sr.status = 'active'
    )
    SELECT
        COALESCE(ss.total_stories, 0),
        COALESCE(ss.connection_count, 0),
        COALESCE(ss.overall_impact_score, 0.0),
        COALESCE(ss.primary_themes, ARRAY[]::TEXT[]),
        COALESCE(ra.activity_count, 0)::INTEGER,
        COALESCE(pr.rec_count, 0)::INTEGER
    FROM storyteller_stats ss
    CROSS JOIN recent_activity ra
    CROSS JOIN pending_recs pr;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create default dashboard configuration
CREATE OR REPLACE FUNCTION create_default_dashboard_config(p_storyteller_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO storyteller_dashboard_config (storyteller_id, tenant_id)
    SELECT p_storyteller_id, tenant_id
    FROM profiles
    WHERE id = p_storyteller_id
    ON CONFLICT (storyteller_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. TRIGGERS FOR AUTOMATED ANALYTICS
-- ============================================================================

-- Trigger to create default dashboard config for new storytellers
CREATE OR REPLACE FUNCTION create_default_dashboard_config_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_storyteller = true AND (OLD.is_storyteller IS NULL OR OLD.is_storyteller = false) THEN
        PERFORM create_default_dashboard_config(NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to profiles table
CREATE TRIGGER trigger_create_dashboard_config
    AFTER UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_default_dashboard_config_trigger();

-- ============================================================================
-- 9. INITIAL MILESTONE TEMPLATES
-- ============================================================================

-- Function to check and award milestones
CREATE OR REPLACE FUNCTION check_storyteller_milestones(p_storyteller_id UUID)
RETURNS VOID AS $$
DECLARE
    story_count INTEGER;
    connection_count INTEGER;
BEGIN
    -- Get current stats
    SELECT total_stories, connection_count INTO story_count, connection_count
    FROM storyteller_analytics
    WHERE storyteller_id = p_storyteller_id;

    -- Award first story milestone
    IF story_count >= 1 THEN
        INSERT INTO storyteller_milestones (storyteller_id, tenant_id, milestone_type, milestone_title, milestone_description, achievement_value, achieved_at)
        SELECT p_storyteller_id, tenant_id, 'first_story', 'First Story Shared', 'Congratulations on sharing your first story!', 1, NOW()
        FROM profiles WHERE id = p_storyteller_id
        ON CONFLICT (storyteller_id, milestone_type) DO NOTHING;
    END IF;

    -- Award connection milestones
    IF connection_count >= 5 THEN
        INSERT INTO storyteller_milestones (storyteller_id, tenant_id, milestone_type, milestone_title, milestone_description, achievement_value, achieved_at)
        SELECT p_storyteller_id, tenant_id, 'connection_count', 'Network Builder', 'You''ve connected with 5 fellow storytellers!', 5, NOW()
        FROM profiles WHERE id = p_storyteller_id
        ON CONFLICT (storyteller_id, milestone_type) DO NOTHING;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Add helpful comments
COMMENT ON TABLE storyteller_engagement IS 'Tracks storyteller engagement metrics over time for analytics dashboards';
COMMENT ON TABLE platform_analytics IS 'High-level platform metrics and KPIs for administrative dashboards';
COMMENT ON TABLE storyteller_impact_metrics IS 'Measures storyteller influence, reach, and community impact';
COMMENT ON TABLE storyteller_dashboard_config IS 'Customizable dashboard configurations for each storyteller';
COMMENT ON TABLE storyteller_milestones IS 'Achievement tracking and milestone recognition system';

-- Log completion
DO $$
BEGIN
    RAISE NOTICE '📊 Storyteller Dashboard Analytics Migration completed successfully!';
    RAISE NOTICE '📈 Created comprehensive engagement tracking system';
    RAISE NOTICE '🎯 Added impact metrics and milestone recognition';
    RAISE NOTICE '⚙️ Implemented customizable dashboard configurations';
    RAISE NOTICE '🏆 Ready for beautiful storyteller analytics dashboards!';
END $$;


-- ============================================================================
-- MIGRATION COMPLETE - STORYTELLER ANALYTICS READY! 🌟
-- ============================================================================
