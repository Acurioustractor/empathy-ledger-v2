-- Enhanced Storyteller Profile Properties Migration
-- Adds comprehensive storyteller properties for impact tracking and community insights

-- Add new columns to profiles table for enhanced storyteller functionality
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS impact_focus_areas text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expertise_areas text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS collaboration_preferences jsonb DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS storytelling_methods text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS community_roles text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS change_maker_type text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS geographic_scope text DEFAULT 'local';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS years_of_community_work integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mentor_availability boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS speaking_availability boolean DEFAULT false;

-- Add indexes for performance on commonly queried fields
CREATE INDEX IF NOT EXISTS idx_profiles_impact_focus_areas ON profiles USING GIN (impact_focus_areas);
CREATE INDEX IF NOT EXISTS idx_profiles_expertise_areas ON profiles USING GIN (expertise_areas);
CREATE INDEX IF NOT EXISTS idx_profiles_community_roles ON profiles USING GIN (community_roles);
CREATE INDEX IF NOT EXISTS idx_profiles_storytelling_methods ON profiles USING GIN (storytelling_methods);
CREATE INDEX IF NOT EXISTS idx_profiles_change_maker_type ON profiles (change_maker_type);
CREATE INDEX IF NOT EXISTS idx_profiles_geographic_scope ON profiles (geographic_scope);
CREATE INDEX IF NOT EXISTS idx_profiles_mentor_availability ON profiles (mentor_availability) WHERE mentor_availability = true;
CREATE INDEX IF NOT EXISTS idx_profiles_speaking_availability ON profiles (speaking_availability) WHERE speaking_availability = true;

-- Add comments for documentation
COMMENT ON COLUMN profiles.impact_focus_areas IS 'Community sectors this storyteller focuses on (e.g., education, health, housing, justice)';
COMMENT ON COLUMN profiles.expertise_areas IS 'Professional/community knowledge areas (e.g., traditional healing, youth mentorship, policy advocacy)';
COMMENT ON COLUMN profiles.collaboration_preferences IS 'How they prefer to work with others (meeting styles, communication preferences, etc.)';
COMMENT ON COLUMN profiles.storytelling_methods IS 'Preferred storytelling formats (video, audio, written, art, performance, etc.)';
COMMENT ON COLUMN profiles.community_roles IS 'Roles in community (elder, advocate, educator, healer, bridge-builder, etc.)';
COMMENT ON COLUMN profiles.change_maker_type IS 'Type of change maker (system navigator, culture keeper, bridge builder, etc.)';
COMMENT ON COLUMN profiles.geographic_scope IS 'Geographic scope of impact (local, regional, national, international)';
COMMENT ON COLUMN profiles.years_of_community_work IS 'Years of experience in community impact work';
COMMENT ON COLUMN profiles.mentor_availability IS 'Whether this storyteller is available to mentor others';
COMMENT ON COLUMN profiles.speaking_availability IS 'Whether this storyteller is available for speaking engagements';

-- Create storyteller impact metrics table for tracking community impact over time
CREATE TABLE IF NOT EXISTS storyteller_impact_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    storyteller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL,

    -- Impact scoring (0-100 scale)
    community_engagement_score integer DEFAULT 0,
    cultural_preservation_score integer DEFAULT 0,
    system_change_influence_score integer DEFAULT 0,
    mentorship_impact_score integer DEFAULT 0,
    cross_sector_collaboration_score integer DEFAULT 0,

    -- Quantified metrics
    stories_created_count integer DEFAULT 0,
    transcripts_analyzed_count integer DEFAULT 0,
    communities_reached_count integer DEFAULT 0,
    organizations_collaborated_count integer DEFAULT 0,
    mentees_supported_count integer DEFAULT 0,
    speaking_engagements_count integer DEFAULT 0,

    -- Impact evidence and outcomes
    documented_outcomes text[] DEFAULT '{}',
    policy_influences text[] DEFAULT '{}',
    community_feedback jsonb DEFAULT '{}',

    -- Tracking metadata
    measurement_period_start date NOT NULL,
    measurement_period_end date NOT NULL,
    calculated_at timestamp with time zone DEFAULT now(),
    calculation_method text,

    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),

    UNIQUE(storyteller_id, measurement_period_start, measurement_period_end)
);

-- Create cross-sector insights table for tracking connections between different impact areas
CREATE TABLE IF NOT EXISTS cross_sector_insights (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL,

    -- Sector information
    primary_sector text NOT NULL,
    secondary_sector text NOT NULL,

    -- Connection analysis
    storyteller_connections jsonb DEFAULT '{}', -- Array of storyteller IDs and connection strengths
    shared_themes text[] DEFAULT '{}',
    collaboration_opportunities text[] DEFAULT '{}',

    -- Impact analysis
    combined_impact_potential integer DEFAULT 0, -- 0-100 scale
    resource_sharing_opportunities text[] DEFAULT '{}',
    policy_change_potential text[] DEFAULT '{}',

    -- Evidence and insights
    supporting_stories text[] DEFAULT '{}', -- Story IDs that support this insight
    ai_confidence_score decimal DEFAULT 0.0,
    human_verified boolean DEFAULT false,
    verification_notes text,

    -- Geographic context
    geographic_regions text[] DEFAULT '{}',

    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),

    UNIQUE(tenant_id, primary_sector, secondary_sector)
);

-- Create geographic impact patterns table for location-based insights
CREATE TABLE IF NOT EXISTS geographic_impact_patterns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL,

    -- Geographic information
    location_id uuid REFERENCES locations(id),
    geographic_scope text NOT NULL, -- local, regional, state, national
    region_name text NOT NULL,

    -- Impact patterns
    primary_themes text[] DEFAULT '{}',
    storyteller_density integer DEFAULT 0,
    community_engagement_level text, -- high, medium, low

    -- Change indicators
    emerging_issues text[] DEFAULT '{}',
    success_patterns text[] DEFAULT '{}',
    resource_needs text[] DEFAULT '{}',
    collaboration_networks jsonb DEFAULT '{}',

    -- Trend analysis
    theme_evolution_data jsonb DEFAULT '{}', -- Historical theme changes
    impact_trajectory text, -- improving, stable, concerning

    -- Supporting evidence
    supporting_storytellers uuid[] DEFAULT '{}',
    key_stories text[] DEFAULT '{}',
    ai_analysis_confidence decimal DEFAULT 0.0,

    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),

    UNIQUE(tenant_id, location_id, geographic_scope)
);

-- Create theme evolution tracking table
CREATE TABLE IF NOT EXISTS theme_evolution_tracking (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL,

    -- Theme information
    theme_name text NOT NULL,
    theme_category text, -- cultural, social, economic, environmental, etc.

    -- Evolution data
    first_appearance date NOT NULL,
    peak_prominence_date date,
    current_frequency_score decimal DEFAULT 0.0,
    trend_direction text, -- emerging, stable, declining

    -- Context and connections
    related_themes text[] DEFAULT '{}',
    storyteller_contributors uuid[] DEFAULT '{}',
    geographic_distribution jsonb DEFAULT '{}',

    -- Impact tracking
    community_response_indicators text[] DEFAULT '{}',
    policy_influence_events text[] DEFAULT '{}',
    resource_mobilization_evidence text[] DEFAULT '{}',

    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),

    UNIQUE(tenant_id, theme_name)
);

-- Add Row Level Security (RLS) policies
ALTER TABLE storyteller_impact_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_sector_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE geographic_impact_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_evolution_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenant isolation
CREATE POLICY storyteller_impact_metrics_tenant_isolation ON storyteller_impact_metrics
    FOR ALL USING (tenant_id = auth.jwt() ->> 'tenant_id');

CREATE POLICY cross_sector_insights_tenant_isolation ON cross_sector_insights
    FOR ALL USING (tenant_id = auth.jwt() ->> 'tenant_id');

CREATE POLICY geographic_impact_patterns_tenant_isolation ON geographic_impact_patterns
    FOR ALL USING (tenant_id = auth.jwt() ->> 'tenant_id');

CREATE POLICY theme_evolution_tracking_tenant_isolation ON theme_evolution_tracking
    FOR ALL USING (tenant_id = auth.jwt() ->> 'tenant_id');

-- Create indexes for performance
CREATE INDEX idx_storyteller_impact_metrics_storyteller_id ON storyteller_impact_metrics(storyteller_id);
CREATE INDEX idx_storyteller_impact_metrics_tenant_id ON storyteller_impact_metrics(tenant_id);
CREATE INDEX idx_storyteller_impact_metrics_period ON storyteller_impact_metrics(measurement_period_start, measurement_period_end);

CREATE INDEX idx_cross_sector_insights_tenant_id ON cross_sector_insights(tenant_id);
CREATE INDEX idx_cross_sector_insights_sectors ON cross_sector_insights(primary_sector, secondary_sector);
CREATE INDEX idx_cross_sector_insights_themes ON cross_sector_insights USING GIN (shared_themes);

CREATE INDEX idx_geographic_impact_patterns_tenant_id ON geographic_impact_patterns(tenant_id);
CREATE INDEX idx_geographic_impact_patterns_location ON geographic_impact_patterns(location_id);
CREATE INDEX idx_geographic_impact_patterns_scope ON geographic_impact_patterns(geographic_scope);
CREATE INDEX idx_geographic_impact_patterns_themes ON geographic_impact_patterns USING GIN (primary_themes);

CREATE INDEX idx_theme_evolution_tracking_tenant_id ON theme_evolution_tracking(tenant_id);
CREATE INDEX idx_theme_evolution_tracking_theme ON theme_evolution_tracking(theme_name);
CREATE INDEX idx_theme_evolution_tracking_category ON theme_evolution_tracking(theme_category);
CREATE INDEX idx_theme_evolution_tracking_trend ON theme_evolution_tracking(trend_direction);