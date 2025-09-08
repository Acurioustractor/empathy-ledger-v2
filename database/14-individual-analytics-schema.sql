-- Individual Transcript Analysis System Database Schema
-- Supporting personalized insights, professional development, and career guidance

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Personal insights storage for each profile
CREATE TABLE IF NOT EXISTS personal_insights (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Core narrative insights
    narrative_themes text[],
    core_values text[],
    life_philosophy text,
    personal_strengths text[],
    growth_areas text[],
    
    -- Cultural context
    cultural_identity_markers text[],
    traditional_knowledge_areas text[],
    community_connections text[],
    
    -- Analysis metadata
    transcript_count integer DEFAULT 0,
    confidence_score numeric(3,2) DEFAULT 0.0,
    last_analyzed_at timestamptz DEFAULT NOW(),
    
    -- Timestamps
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW()
);

-- Professional competencies extracted from transcripts
CREATE TABLE IF NOT EXISTS professional_competencies (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Skill details
    skill_name text NOT NULL,
    skill_category text, -- 'technical', 'leadership', 'communication', 'cultural', 'analytical'
    competency_level integer CHECK (competency_level >= 1 AND competency_level <= 10),
    market_value_score integer CHECK (market_value_score >= 1 AND market_value_score <= 10),
    
    -- Evidence and context
    evidence_from_transcript text,
    real_world_applications text[],
    transferable_contexts text[],
    
    -- Professional development
    development_opportunities text[],
    skill_gap_analysis text,
    
    -- Timestamps
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW(),
    
    UNIQUE(profile_id, skill_name)
);

-- Impact stories suitable for professional use
CREATE TABLE IF NOT EXISTS impact_stories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Story details
    title text NOT NULL,
    narrative text NOT NULL,
    context text,
    timeframe text, -- 'recent', '1-2_years', '3-5_years', 'historical'
    
    -- Impact measurement
    measurable_outcomes text[],
    beneficiaries text[],
    scale_of_impact text, -- 'individual', 'family', 'community', 'regional', 'national'
    
    -- Professional applications
    suitable_for text[], -- 'resume', 'grant_application', 'interview', 'portfolio', 'networking'
    professional_summary text, -- Formatted for professional use
    key_achievements text[],
    
    -- Cultural considerations
    cultural_significance text,
    traditional_knowledge_involved boolean DEFAULT false,
    community_approval_required boolean DEFAULT false,
    
    -- Timestamps
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW()
);

-- Career and grant recommendations
CREATE TABLE IF NOT EXISTS opportunity_recommendations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Opportunity details
    opportunity_type text CHECK (opportunity_type IN ('career', 'grant', 'education', 'volunteer')),
    title text NOT NULL,
    organization text,
    description text,
    
    -- Matching analysis
    match_score integer CHECK (match_score >= 0 AND match_score <= 100),
    matching_skills text[],
    skill_gaps text[],
    
    -- Application guidance
    application_strategy text,
    suggested_approach text,
    cultural_fit_analysis text,
    
    -- Opportunity metadata
    funding_amount text, -- For grants
    salary_range text, -- For careers
    application_deadline date,
    url text,
    
    -- Cultural considerations
    cultural_focus boolean DEFAULT false,
    community_impact_potential text,
    
    -- Timestamps
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW()
);

-- Personal development plans
CREATE TABLE IF NOT EXISTS development_plans (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Goals and objectives
    short_term_goals text[],
    long_term_goals text[],
    skill_development_priorities text[],
    
    -- Development pathways
    recommended_courses text[],
    networking_opportunities text[],
    mentorship_suggestions text[],
    
    -- Cultural integration
    cultural_preservation_activities text[],
    community_engagement_opportunities text[],
    traditional_knowledge_development text[],
    
    -- Progress tracking
    milestones jsonb, -- Structured milestone data
    progress_indicators text[],
    success_metrics text[],
    
    -- Timeline
    plan_duration text, -- '6_months', '1_year', '2_years', '5_years'
    next_review_date date,
    
    -- Timestamps
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW()
);

-- Analysis job queue for managing AI processing
CREATE TABLE IF NOT EXISTS analysis_jobs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Job details
    job_type text CHECK (job_type IN ('full_analysis', 'skills_extraction', 'impact_stories', 'recommendations')),
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    
    -- Processing metadata
    transcript_ids uuid[],
    ai_model_used text,
    processing_time_seconds integer,
    
    -- Results
    results_data jsonb,
    error_message text,
    
    -- Timestamps
    started_at timestamptz,
    completed_at timestamptz,
    created_at timestamptz DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_personal_insights_profile ON personal_insights(profile_id);
CREATE INDEX IF NOT EXISTS idx_personal_insights_analyzed ON personal_insights(last_analyzed_at);

CREATE INDEX IF NOT EXISTS idx_professional_competencies_profile ON professional_competencies(profile_id);
CREATE INDEX IF NOT EXISTS idx_professional_competencies_category ON professional_competencies(skill_category);
CREATE INDEX IF NOT EXISTS idx_professional_competencies_value ON professional_competencies(market_value_score DESC);

CREATE INDEX IF NOT EXISTS idx_impact_stories_profile ON impact_stories(profile_id);
CREATE INDEX IF NOT EXISTS idx_impact_stories_suitable ON impact_stories USING GIN(suitable_for);
CREATE INDEX IF NOT EXISTS idx_impact_stories_timeframe ON impact_stories(timeframe);

CREATE INDEX IF NOT EXISTS idx_opportunity_recommendations_profile ON opportunity_recommendations(profile_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_recommendations_type ON opportunity_recommendations(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_opportunity_recommendations_match ON opportunity_recommendations(match_score DESC);

CREATE INDEX IF NOT EXISTS idx_development_plans_profile ON development_plans(profile_id);
CREATE INDEX IF NOT EXISTS idx_development_plans_review ON development_plans(next_review_date);

CREATE INDEX IF NOT EXISTS idx_analysis_jobs_profile ON analysis_jobs(profile_id);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_status ON analysis_jobs(status);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_type ON analysis_jobs(job_type);

-- Row Level Security policies (will be enabled later)
-- These ensure users can only access their own analysis data

-- personal_insights policies
DROP POLICY IF EXISTS "Users can view own insights" ON personal_insights;
CREATE POLICY "Users can view own insights" ON personal_insights
    FOR SELECT USING (
        profile_id IN (
            SELECT id FROM profiles 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert own insights" ON personal_insights;
CREATE POLICY "Users can insert own insights" ON personal_insights
    FOR INSERT WITH CHECK (
        profile_id IN (
            SELECT id FROM profiles 
            WHERE user_id = auth.uid()
        )
    );

-- professional_competencies policies
DROP POLICY IF EXISTS "Users can view own competencies" ON professional_competencies;
CREATE POLICY "Users can view own competencies" ON professional_competencies
    FOR SELECT USING (
        profile_id IN (
            SELECT id FROM profiles 
            WHERE user_id = auth.uid()
        )
    );

-- impact_stories policies
DROP POLICY IF EXISTS "Users can view own impact stories" ON impact_stories;
CREATE POLICY "Users can view own impact stories" ON impact_stories
    FOR SELECT USING (
        profile_id IN (
            SELECT id FROM profiles 
            WHERE user_id = auth.uid()
        )
    );

-- opportunity_recommendations policies
DROP POLICY IF EXISTS "Users can view own recommendations" ON opportunity_recommendations;
CREATE POLICY "Users can view own recommendations" ON opportunity_recommendations
    FOR SELECT USING (
        profile_id IN (
            SELECT id FROM profiles 
            WHERE user_id = auth.uid()
        )
    );

-- development_plans policies
DROP POLICY IF EXISTS "Users can view own development plans" ON development_plans;
CREATE POLICY "Users can view own development plans" ON development_plans
    FOR SELECT USING (
        profile_id IN (
            SELECT id FROM profiles 
            WHERE user_id = auth.uid()
        )
    );

-- analysis_jobs policies
DROP POLICY IF EXISTS "Users can view own analysis jobs" ON analysis_jobs;
CREATE POLICY "Users can view own analysis jobs" ON analysis_jobs
    FOR SELECT USING (
        profile_id IN (
            SELECT id FROM profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Grant necessary permissions
GRANT ALL ON personal_insights TO postgres, service_role;
GRANT ALL ON professional_competencies TO postgres, service_role;
GRANT ALL ON impact_stories TO postgres, service_role;
GRANT ALL ON opportunity_recommendations TO postgres, service_role;
GRANT ALL ON development_plans TO postgres, service_role;
GRANT ALL ON analysis_jobs TO postgres, service_role;

GRANT SELECT ON personal_insights TO anon, authenticated;
GRANT SELECT ON professional_competencies TO anon, authenticated;
GRANT SELECT ON impact_stories TO anon, authenticated;
GRANT SELECT ON opportunity_recommendations TO anon, authenticated;
GRANT SELECT ON development_plans TO anon, authenticated;
GRANT SELECT ON analysis_jobs TO anon, authenticated;