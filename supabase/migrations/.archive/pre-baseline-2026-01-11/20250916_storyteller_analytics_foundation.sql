-- 🌟 Storyteller Analytics Foundation Migration
-- Creates the core tables for storyteller-centered analytics ecosystem

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

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
    theme_embedding VECTOR(1536), -- OpenAI embeddings

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
    quote_embedding VECTOR(1536), -- For semantic search

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
DROP POLICY IF EXISTS "Storytellers can view their own analytics" ON storyteller_analytics;
CREATE POLICY "Storytellers can view their own analytics" ON storyteller_analytics
    FOR SELECT USING (
        storyteller_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND ('admin' = ANY(p.tenant_roles) OR 'super_admin' = ANY(p.tenant_roles))
        )
    );

DROP POLICY IF EXISTS "System can manage analytics" ON storyteller_analytics;
CREATE POLICY "System can manage analytics" ON storyteller_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND ('admin' = ANY(p.tenant_roles) OR 'super_admin' = ANY(p.tenant_roles))
        )
    );

-- Narrative Themes Policies (Public themes, admin management)
DROP POLICY IF EXISTS "Public themes are viewable" ON narrative_themes;
CREATE POLICY "Public themes are viewable" ON narrative_themes
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage themes" ON narrative_themes;
CREATE POLICY "Admins can manage themes" ON narrative_themes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND ('admin' = ANY(p.tenant_roles) OR 'super_admin' = ANY(p.tenant_roles))
        )
    );

-- Storyteller Themes Policies
DROP POLICY IF EXISTS "Storytellers can view their own themes" ON storyteller_themes;
CREATE POLICY "Storytellers can view their own themes" ON storyteller_themes
    FOR SELECT USING (
        storyteller_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND ('admin' = ANY(p.tenant_roles) OR 'super_admin' = ANY(p.tenant_roles))
        )
    );

-- Quotes Policies (Respect privacy settings)
DROP POLICY IF EXISTS "Public quotes are viewable" ON storyteller_quotes;
CREATE POLICY "Public quotes are viewable" ON storyteller_quotes
    FOR SELECT USING (
        (is_public = true AND (requires_approval = false OR approved_at IS NOT NULL)) OR
        storyteller_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND ('admin' = ANY(p.tenant_roles) OR 'super_admin' = ANY(p.tenant_roles))
        )
    );

-- Analytics Jobs Policies
DROP POLICY IF EXISTS "Users can view relevant jobs" ON analytics_processing_jobs;
CREATE POLICY "Users can view relevant jobs" ON analytics_processing_jobs
    FOR SELECT USING (
        storyteller_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND ('admin' = ANY(p.tenant_roles) OR 'super_admin' = ANY(p.tenant_roles))
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