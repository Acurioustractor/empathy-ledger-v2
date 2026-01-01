-- AI Enhancement System Database Schema
-- Empathy Ledger - Cultural Safety Compliant AI System
-- Created: 2025-01-05

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- AI Content Enhancement Results
CREATE TABLE IF NOT EXISTS content_enhancement_results (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Enhancement results by type
    themes_analysis jsonb,
    metadata_analysis jsonb,
    cultural_analysis jsonb,
    seo_enhancement jsonb,
    accessibility_analysis jsonb,
    
    -- Cultural safety and approval status
    cultural_safety_approved boolean DEFAULT false,
    requires_elder_review boolean DEFAULT false,
    elder_review_completed boolean DEFAULT false,
    elder_approved_by uuid REFERENCES profiles(id),
    elder_approval_date timestamptz,
    
    -- Processing metadata
    enhancement_types text[] DEFAULT '{}',
    processing_notes text[] DEFAULT '{}',
    ai_model_used text,
    processing_duration_ms integer,
    
    -- Timestamps
    created_at timestamptz DEFAULT now() NOT NULL,
    enhanced_at timestamptz NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    
    -- Constraints
    UNIQUE(story_id, enhanced_at)
);

-- AI Moderation Results
CREATE TABLE IF NOT EXISTS moderation_results (
    id text PRIMARY KEY,
    content_id uuid NOT NULL,
    content_type text NOT NULL CHECK (content_type IN ('story', 'profile', 'media', 'comment', 'gallery')),
    
    -- Moderation decision
    status text NOT NULL CHECK (status IN ('approved', 'flagged', 'blocked', 'elder_review_required')),
    moderation_details jsonb NOT NULL,
    confidence_level real CHECK (confidence_level >= 0 AND confidence_level <= 1),
    
    -- Elder review assignment
    elder_assignment jsonb,
    review_deadline timestamptz,
    appeals_available boolean DEFAULT true,
    
    -- Processing metadata
    moderated_by text NOT NULL, -- 'ai_system' or elder ID
    moderated_at timestamptz DEFAULT now() NOT NULL,
    
    -- Cultural context
    cultural_issues_detected integer DEFAULT 0,
    community_oversight_needed boolean DEFAULT false,
    
    -- Audit trail
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Elder Review Queue
CREATE TABLE IF NOT EXISTS elder_review_queue (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id uuid NOT NULL,
    content_type text NOT NULL CHECK (content_type IN ('story', 'profile', 'media', 'comment', 'gallery')),
    
    -- Review details
    cultural_issues jsonb DEFAULT '[]',
    priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    cultural_sensitivity_level text CHECK (cultural_sensitivity_level IN ('low', 'medium', 'high', 'sacred')),
    
    -- Assignment
    assigned_elder_id uuid REFERENCES profiles(id),
    assigned_at timestamptz,
    due_date timestamptz NOT NULL,
    
    -- Review status and results
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'needs_consultation')),
    reviewed_by uuid REFERENCES profiles(id),
    reviewed_at timestamptz,
    review_notes text,
    review_conditions text[] DEFAULT '{}',
    
    -- Community input
    community_input_required boolean DEFAULT false,
    community_feedback jsonb DEFAULT '[]',
    
    -- Metadata
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- AI Safety and Operation Logs
CREATE TABLE IF NOT EXISTS ai_safety_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Operation details
    operation text NOT NULL CHECK (operation IN ('analyze', 'generate', 'enhance', 'recommend', 'moderate')),
    context_type text NOT NULL CHECK (context_type IN ('story', 'profile', 'media', 'search', 'connection')),
    content_preview text,
    
    -- Safety analysis results
    safety_result jsonb NOT NULL,
    cultural_safety_approved boolean NOT NULL,
    elder_review_required boolean DEFAULT false,
    detected_concerns text[] DEFAULT '{}',
    
    -- AI model and processing info
    ai_model_used text,
    processing_time_ms integer,
    token_usage jsonb,
    
    -- Timestamps
    timestamp timestamptz DEFAULT now() NOT NULL
);

-- AI Recommendation Logs
CREATE TABLE IF NOT EXISTS ai_recommendation_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Recommendation details
    recommendation_type text NOT NULL CHECK (recommendation_type IN ('personalized', 'similar', 'seasonal', 'custom')),
    story_id uuid REFERENCES stories(id), -- for similar recommendations
    season text,
    
    -- Request and response
    custom_context jsonb,
    custom_preferences jsonb,
    results_count integer DEFAULT 0,
    cultural_context text[] DEFAULT '{}',
    
    -- Timestamps
    requested_at timestamptz DEFAULT now() NOT NULL
);

-- Search Analytics
CREATE TABLE IF NOT EXISTS search_analytics (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Search details
    query text NOT NULL,
    content_types text[] DEFAULT '{"story"}',
    filters_applied jsonb DEFAULT '{}',
    search_context jsonb DEFAULT '{}',
    
    -- Results
    results_count integer DEFAULT 0,
    cultural_context text[] DEFAULT '{}',
    themes text[] DEFAULT '{}',
    advanced_search boolean DEFAULT false,
    
    -- Timestamps
    searched_at timestamptz DEFAULT now() NOT NULL
);

-- Story Connection Analysis Logs
CREATE TABLE IF NOT EXISTS ai_connection_analysis_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Analysis details
    focal_story_id uuid REFERENCES stories(id),
    analysis_type text NOT NULL CHECK (analysis_type IN ('comprehensive', 'thematic', 'cultural', 'healing_journey', 'community_journey', 'batch_analysis')),
    
    -- Journey creation details
    journey_type text CHECK (journey_type IN ('healing', 'learning', 'cultural_connection', 'personal_growth', 'community_building')),
    starting_story_id uuid REFERENCES stories(id),
    user_goals text[] DEFAULT '{}',
    journey_steps integer,
    
    -- Batch processing
    batch_story_ids uuid[] DEFAULT '{}',
    successful_analyses integer DEFAULT 0,
    failed_analyses integer DEFAULT 0,
    
    -- Results
    connections_found integer DEFAULT 0,
    thematic_clusters integer DEFAULT 0,
    narrative_threads integer DEFAULT 0,
    cultural_patterns integer DEFAULT 0,
    cultural_context text[] DEFAULT '{}',
    
    -- Timestamps
    analyzed_at timestamptz DEFAULT now() NOT NULL
);

-- AI Enhancement Processing Logs (for monitoring and debugging)
CREATE TABLE IF NOT EXISTS ai_enhancement_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id uuid REFERENCES stories(id),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Enhancement details
    enhancement_types text[] DEFAULT '{}',
    batch_request boolean DEFAULT false,
    story_ids uuid[] DEFAULT '{}', -- for batch requests
    
    -- Results
    results_generated integer DEFAULT 0,
    cultural_safety_approved boolean DEFAULT false,
    elder_review_required boolean DEFAULT false,
    
    -- Processing info
    processing_time_ms integer,
    ai_model_used text,
    
    -- Cultural context
    cultural_context jsonb DEFAULT '{}',
    
    -- Timestamps
    enhanced_at timestamptz DEFAULT now() NOT NULL
);

-- Moderation Appeals
CREATE TABLE IF NOT EXISTS moderation_appeals (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    moderation_request_id text NOT NULL REFERENCES moderation_results(id),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Appeal details
    appeal_reason text NOT NULL,
    additional_context text,
    appeal_status text DEFAULT 'pending' CHECK (appeal_status IN ('pending', 'under_review', 'approved', 'denied')),
    
    -- Review
    reviewed_by uuid REFERENCES profiles(id),
    review_decision text,
    review_notes text,
    
    -- Timestamps
    submitted_at timestamptz DEFAULT now() NOT NULL,
    reviewed_at timestamptz
);

-- AI Model Usage Statistics (for cost and performance monitoring)
CREATE TABLE IF NOT EXISTS ai_model_usage_stats (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    date date NOT NULL,
    
    -- Model usage
    model_name text NOT NULL,
    operation_type text NOT NULL,
    
    -- Usage metrics
    total_requests integer DEFAULT 0,
    successful_requests integer DEFAULT 0,
    failed_requests integer DEFAULT 0,
    total_tokens integer DEFAULT 0,
    total_cost_usd decimal(10,4) DEFAULT 0,
    
    -- Performance
    avg_response_time_ms integer DEFAULT 0,
    cultural_safety_blocks integer DEFAULT 0,
    elder_reviews_triggered integer DEFAULT 0,
    
    -- Timestamps
    created_at timestamptz DEFAULT now() NOT NULL,
    
    -- Unique constraint for daily stats
    UNIQUE(date, model_name, operation_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_enhancement_story_id ON content_enhancement_results(story_id);
CREATE INDEX IF NOT EXISTS idx_content_enhancement_user_id ON content_enhancement_results(user_id);
CREATE INDEX IF NOT EXISTS idx_content_enhancement_enhanced_at ON content_enhancement_results(enhanced_at);
CREATE INDEX IF NOT EXISTS idx_content_enhancement_cultural_safety ON content_enhancement_results(cultural_safety_approved, requires_elder_review);

CREATE INDEX IF NOT EXISTS idx_moderation_results_content_id ON moderation_results(content_id);
CREATE INDEX IF NOT EXISTS idx_moderation_results_content_type ON moderation_results(content_type);
CREATE INDEX IF NOT EXISTS idx_moderation_results_status ON moderation_results(status);
CREATE INDEX IF NOT EXISTS idx_moderation_results_moderated_at ON moderation_results(moderated_at);

CREATE INDEX IF NOT EXISTS idx_elder_review_queue_assigned_elder ON elder_review_queue(assigned_elder_id);
CREATE INDEX IF NOT EXISTS idx_elder_review_queue_status ON elder_review_queue(status);
CREATE INDEX IF NOT EXISTS idx_elder_review_queue_priority ON elder_review_queue(priority);
CREATE INDEX IF NOT EXISTS idx_elder_review_queue_due_date ON elder_review_queue(due_date);

CREATE INDEX IF NOT EXISTS idx_ai_safety_logs_user_id ON ai_safety_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_safety_logs_operation ON ai_safety_logs(operation);
CREATE INDEX IF NOT EXISTS idx_ai_safety_logs_timestamp ON ai_safety_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_safety_logs_cultural_safety ON ai_safety_logs(cultural_safety_approved);

CREATE INDEX IF NOT EXISTS idx_ai_recommendation_logs_user_id ON ai_recommendation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendation_logs_type ON ai_recommendation_logs(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_ai_recommendation_logs_requested_at ON ai_recommendation_logs(requested_at);

CREATE INDEX IF NOT EXISTS idx_search_analytics_user_id ON search_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_searched_at ON search_analytics(searched_at);
CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON search_analytics USING gin(to_tsvector('english', query));

CREATE INDEX IF NOT EXISTS idx_connection_analysis_logs_user_id ON ai_connection_analysis_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_connection_analysis_logs_focal_story ON ai_connection_analysis_logs(focal_story_id);
CREATE INDEX IF NOT EXISTS idx_connection_analysis_logs_analysis_type ON ai_connection_analysis_logs(analysis_type);
CREATE INDEX IF NOT EXISTS idx_connection_analysis_logs_analyzed_at ON ai_connection_analysis_logs(analyzed_at);

-- Enable Row Level Security
ALTER TABLE content_enhancement_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE elder_review_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_safety_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_connection_analysis_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_enhancement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_appeals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content enhancement results
CREATE POLICY "Users can view their own enhancement requests" ON content_enhancement_results
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create enhancement requests" ON content_enhancement_results
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Elders can view all enhancement results" ON content_enhancement_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_elder = true
        )
    );

-- RLS Policies for elder review queue  
CREATE POLICY "Elders can view review queue" ON elder_review_queue
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_elder = true
        )
    );

CREATE POLICY "Elders can update assigned reviews" ON elder_review_queue
    FOR UPDATE USING (
        assigned_elder_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_elder = true
        )
    );

-- RLS Policies for moderation results
CREATE POLICY "Users can view their own moderation results" ON moderation_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stories s 
            WHERE s.id::text = content_id::text AND s.author_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_elder = true
        )
    );

-- RLS Policies for AI logs (privacy-focused)
CREATE POLICY "Users can view their own AI safety logs" ON ai_safety_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create AI safety logs" ON ai_safety_logs
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own recommendation logs" ON ai_recommendation_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create recommendation logs" ON ai_recommendation_logs
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own search analytics" ON search_analytics
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create search analytics" ON search_analytics
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own connection analysis logs" ON ai_connection_analysis_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create connection analysis logs" ON ai_connection_analysis_logs
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Update functions for maintaining timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_content_enhancement_results_updated_at 
    BEFORE UPDATE ON content_enhancement_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_elder_review_queue_updated_at 
    BEFORE UPDATE ON elder_review_queue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE content_enhancement_results IS 'AI-enhanced content analysis results with cultural safety compliance';
COMMENT ON TABLE moderation_results IS 'Cultural safety moderation decisions and elder review assignments';
COMMENT ON TABLE elder_review_queue IS 'Queue of content requiring elder review for cultural appropriateness';
COMMENT ON TABLE ai_safety_logs IS 'Audit trail of all AI operations for transparency and oversight';
COMMENT ON TABLE ai_recommendation_logs IS 'Analytics for AI recommendation system performance and usage';
COMMENT ON TABLE search_analytics IS 'Search behavior analytics for improving cultural content discovery';
COMMENT ON TABLE ai_connection_analysis_logs IS 'Story connection analysis for narrative thread discovery';
COMMENT ON TABLE ai_enhancement_logs IS 'Processing logs for content enhancement operations';
COMMENT ON TABLE moderation_appeals IS 'Appeals process for moderation decisions';
COMMENT ON TABLE ai_model_usage_stats IS 'AI model usage statistics for cost and performance monitoring';