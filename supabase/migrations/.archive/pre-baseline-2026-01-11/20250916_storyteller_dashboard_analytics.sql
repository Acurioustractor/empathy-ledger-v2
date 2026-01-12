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
            AND (p.tenant_roles ? 'admin' OR p.tenant_roles ? 'super_admin')
        )
    );

-- Platform Analytics Policies (Admin only for detailed data)
CREATE POLICY "Admins can view platform analytics" ON platform_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.tenant_roles ? 'admin' OR p.tenant_roles ? 'super_admin')
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
            AND (p.tenant_roles ? 'admin' OR p.tenant_roles ? 'super_admin')
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
            AND (p.tenant_roles ? 'admin' OR p.tenant_roles ? 'super_admin')
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