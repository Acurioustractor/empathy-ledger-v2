-- 🌟 Storyteller Analytics Migration - Part 1
-- Foundation Tables and Basic Setup

-- Enable extensions first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
    theme_distribution JSONB DEFAULT '{}',
    theme_evolution JSONB DEFAULT '{}',

    -- Narrative Intelligence
    storytelling_style VARCHAR(50),
    emotional_tone_profile JSONB DEFAULT '{}',
    cultural_elements_frequency JSONB DEFAULT '{}',

    -- Network Metrics
    connection_count INTEGER DEFAULT 0,
    shared_narrative_count INTEGER DEFAULT 0,
    collaboration_score DECIMAL(5,2) DEFAULT 0.0,

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

-- Enable RLS
ALTER TABLE storyteller_analytics ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policy
CREATE POLICY "Storytellers can view their own analytics" ON storyteller_analytics
    FOR SELECT USING (
        storyteller_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.tenant_roles @> ARRAY['admin'] OR p.tenant_roles @> ARRAY['super_admin'])
        )
    );

-- Log completion
DO $$
BEGIN
    RAISE NOTICE '✅ Part 1 - Storyteller Analytics table created successfully!';
END $$;