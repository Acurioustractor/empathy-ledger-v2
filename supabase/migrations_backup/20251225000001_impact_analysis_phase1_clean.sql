-- EMPATHY LEDGER - IMPACT ANALYSIS PHASE 1
-- Database schema for comprehensive impact measurement and visualization

-- 1. NARRATIVE ANALYSIS TABLES

-- Story narrative arcs (emotional trajectory)
CREATE TABLE IF NOT EXISTS story_narrative_arcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  arc_type VARCHAR(50) NOT NULL,
  arc_confidence FLOAT CHECK (arc_confidence >= 0 AND arc_confidence <= 1),
  trajectory_data JSONB NOT NULL,
  segments JSONB,
  emotional_range FLOAT,
  volatility FLOAT,
  transformation_score FLOAT,
  peak_moment FLOAT,
  valley_moment FLOAT,
  analyzed_at TIMESTAMPTZ DEFAULT now(),
  analysis_version VARCHAR(20) DEFAULT 'v1.0',
  analysis_method VARCHAR(50) DEFAULT 'openai_gpt4',
  community_validated BOOLEAN DEFAULT false,
  validated_by UUID REFERENCES profiles(id),
  validation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(story_id)
);

CREATE INDEX idx_story_arcs_story_id ON story_narrative_arcs(story_id);
CREATE INDEX idx_story_arcs_type ON story_narrative_arcs(arc_type);
CREATE INDEX idx_story_arcs_analyzed_at ON story_narrative_arcs(analyzed_at DESC);

-- Theme evolution tracking
CREATE TABLE IF NOT EXISTS theme_evolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  time_period_start DATE NOT NULL,
  time_period_end DATE NOT NULL,
  story_count INTEGER DEFAULT 0,
  prominence_score FLOAT CHECK (prominence_score >= 0 AND prominence_score <= 1),
  current_status VARCHAR(20) DEFAULT 'stable',
  peak_moment TIMESTAMPTZ,
  valley_moment TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_theme_evolution_theme ON theme_evolution(theme_id);
CREATE INDEX idx_theme_evolution_period ON theme_evolution(time_period_start, time_period_end);

-- Theme concept evolution (semantic shift)
CREATE TABLE IF NOT EXISTS theme_concept_evolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  original_concept TEXT NOT NULL,
  evolved_concept TEXT,
  semantic_shift FLOAT,
  evidence_quotes TEXT[],
  evolution_narrative TEXT,
  detected_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_theme_concept_theme ON theme_concept_evolution(theme_id);

-- 2. VOICE & AUDIO ANALYSIS TABLES

-- Prosodic analysis (pitch, intonation, rhythm)
CREATE TABLE IF NOT EXISTS audio_prosodic_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_id UUID NOT NULL,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  mean_pitch_hz FLOAT,
  pitch_range_hz FLOAT,
  pitch_std_hz FLOAT,
  pitch_range_semitones FLOAT,
  mean_intensity_db FLOAT,
  intensity_range_db FLOAT,
  intensity_std_db FLOAT,
  speech_rate_sps FLOAT,
  articulation_rate_sps FLOAT,
  pause_count INTEGER,
  mean_pause_duration_s FLOAT,
  speaking_time_s FLOAT,
  total_duration_s FLOAT,
  voiced_fraction FLOAT,
  jitter FLOAT,
  shimmer FLOAT,
  hnr_db FLOAT,
  analysis_method VARCHAR(50) DEFAULT 'praat',
  analysis_version VARCHAR(20) DEFAULT 'v1.0',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audio_prosody_audio ON audio_prosodic_analysis(audio_id);
CREATE INDEX idx_audio_prosody_story ON audio_prosodic_analysis(story_id);

-- Speech emotion recognition
CREATE TABLE IF NOT EXISTS audio_emotion_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_id UUID NOT NULL,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  emotion_label VARCHAR(20),
  arousal FLOAT CHECK (arousal >= 0 AND arousal <= 1),
  valence FLOAT CHECK (valence >= -1 AND valence <= 1),
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  temporal_segments JSONB,
  analysis_method VARCHAR(50) DEFAULT 'openai_whisper',
  model_version VARCHAR(20),
  culturally_validated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audio_emotion_audio ON audio_emotion_analysis(audio_id);
CREATE INDEX idx_audio_emotion_story ON audio_emotion_analysis(story_id);
CREATE INDEX idx_audio_emotion_primary ON audio_emotion_analysis(emotion_label);

-- Cultural speech patterns
CREATE TABLE IF NOT EXISTS cultural_speech_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_id UUID NOT NULL,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  pattern_type VARCHAR(50),
  time_start FLOAT,
  time_end FLOAT,
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  description TEXT,
  cultural_context TEXT,
  detected_by VARCHAR(50),
  validated_by_community BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cultural_patterns_audio ON cultural_speech_patterns(audio_id);
CREATE INDEX idx_cultural_patterns_type ON cultural_speech_patterns(pattern_type);

-- 3. SOCIAL IMPACT MEASUREMENT (SROI)

-- SROI inputs
CREATE TABLE IF NOT EXISTS sroi_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  total_investment DECIMAL(12,2) NOT NULL,
  funding_sources JSONB,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  discount_rate FLOAT DEFAULT 0.035,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sroi_inputs_project ON sroi_inputs(project_id);
CREATE INDEX idx_sroi_inputs_org ON sroi_inputs(organization_id);

-- SROI outcomes
CREATE TABLE IF NOT EXISTS sroi_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sroi_input_id UUID NOT NULL REFERENCES sroi_inputs(id) ON DELETE CASCADE,
  outcome_type VARCHAR(50) NOT NULL,
  outcome_description TEXT NOT NULL,
  stakeholder_group VARCHAR(50) NOT NULL,
  beneficiary_count INTEGER,
  unit_of_measurement VARCHAR(50),
  quantity DECIMAL(12,2),
  financial_proxy DECIMAL(12,2),
  deadweight FLOAT DEFAULT 0,
  attribution FLOAT DEFAULT 1.0,
  drop_off FLOAT DEFAULT 0,
  displacement FLOAT DEFAULT 0,
  duration_years INTEGER DEFAULT 1,
  total_value DECIMAL(12,2),
  evidence_source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sroi_outcomes_input ON sroi_outcomes(sroi_input_id);
CREATE INDEX idx_sroi_outcomes_stakeholder ON sroi_outcomes(stakeholder_group);

-- SROI calculations
CREATE TABLE IF NOT EXISTS sroi_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sroi_input_id UUID NOT NULL REFERENCES sroi_inputs(id) ON DELETE CASCADE,
  total_investment DECIMAL(12,2) NOT NULL,
  total_social_value DECIMAL(12,2) NOT NULL,
  net_social_value DECIMAL(12,2),
  sroi_ratio DECIMAL(10,2) NOT NULL,
  sensitivity_conservative DECIMAL(10,2),
  sensitivity_optimistic DECIMAL(10,2),
  calculation_date TIMESTAMPTZ DEFAULT now(),
  calculated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sroi_calc_input ON sroi_calculations(sroi_input_id);

-- 4. RIPPLE EFFECTS

-- Ripple effects (spreading impact)
CREATE TABLE IF NOT EXISTS ripple_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  ripple_level INTEGER CHECK (ripple_level >= 1 AND ripple_level <= 5),
  ripple_label VARCHAR(50),
  effect_description TEXT NOT NULL,
  people_affected INTEGER,
  geographic_scope VARCHAR(100),
  time_lag_days INTEGER,
  triggered_by UUID REFERENCES ripple_effects(id),
  evidence TEXT,
  reported_by UUID REFERENCES profiles(id),
  reported_date TIMESTAMPTZ DEFAULT now(),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ripple_story ON ripple_effects(story_id);
CREATE INDEX idx_ripple_level ON ripple_effects(ripple_level);

-- 5. OUTCOME HARVESTING

-- Harvested outcomes
CREATE TABLE IF NOT EXISTS harvested_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id),
  outcome_description TEXT NOT NULL,
  change_type VARCHAR(50),
  significance_level VARCHAR(20),
  who_changed TEXT,
  what_changed TEXT,
  how_much_changed TEXT,
  contribution_narrative TEXT,
  evidence_source TEXT,
  evidence_quotes TEXT[],
  is_unexpected BOOLEAN DEFAULT false,
  harvested_by UUID REFERENCES profiles(id),
  harvested_date DATE,
  community_validated BOOLEAN DEFAULT false,
  validated_by UUID REFERENCES profiles(id),
  validated_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_harvested_project ON harvested_outcomes(project_id);
CREATE INDEX idx_harvested_type ON harvested_outcomes(change_type);

-- 6. PARTICIPATORY EVALUATION

-- Community interpretation sessions
CREATE TABLE IF NOT EXISTS community_interpretation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id),
  theme_id UUID REFERENCES themes(id),
  session_date DATE NOT NULL,
  participant_count INTEGER,
  interpretation_type VARCHAR(50),
  session_notes TEXT,
  key_interpretations TEXT[],
  consensus_points TEXT[],
  divergent_views TEXT[],
  cultural_context TEXT,
  recommendations TEXT[],
  facilitator_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_interp_story ON community_interpretation_sessions(story_id);
CREATE INDEX idx_interp_date ON community_interpretation_sessions(session_date DESC);

-- Storytelling circle evaluations
CREATE TABLE IF NOT EXISTS storytelling_circle_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  circle_date DATE NOT NULL,
  participant_count INTEGER,
  circle_theme VARCHAR(200),
  protocols_followed TEXT[],
  stories_shared INTEGER,
  collective_insights TEXT[],
  emotional_tone VARCHAR(50),
  safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5),
  facilitator_notes TEXT,
  facilitator_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_circle_project ON storytelling_circle_evaluations(project_id);
CREATE INDEX idx_circle_date ON storytelling_circle_evaluations(circle_date DESC);

-- Community story responses
CREATE TABLE IF NOT EXISTS community_story_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  responder_id UUID REFERENCES profiles(id),
  response_type VARCHAR(50),
  response_text TEXT,
  emotional_reaction VARCHAR(50),
  personal_connection TEXT,
  action_inspired TEXT,
  shared_with_others BOOLEAN DEFAULT false,
  response_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_response_story ON community_story_responses(story_id);
CREATE INDEX idx_response_type ON community_story_responses(response_type);

-- 7. NETWORK ANALYSIS
-- Note: storyteller_connections table may already exist from earlier migrations
-- Skipping creation to avoid conflicts

-- 8. THEORY OF CHANGE

-- Theory of change framework
CREATE TABLE IF NOT EXISTS theory_of_change (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  inputs JSONB,
  activities JSONB,
  outputs JSONB,
  outcomes JSONB,
  impact JSONB,
  assumptions TEXT[],
  external_factors TEXT[],
  indicators JSONB,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_toc_project ON theory_of_change(project_id);

-- HELPER FUNCTIONS

-- Calculate SROI outcome value
CREATE OR REPLACE FUNCTION calculate_sroi_outcome_value(
  p_outcome_id UUID,
  p_discount_rate FLOAT DEFAULT 0.035
)
RETURNS DECIMAL(12,2) AS $$
DECLARE
  v_outcome RECORD;
  v_gross_value DECIMAL(12,2);
  v_net_value DECIMAL(12,2);
  v_total_value DECIMAL(12,2) := 0;
  v_yearly_value DECIMAL(12,2);
  v_discount_factor FLOAT;
  v_year INTEGER;
BEGIN
  SELECT * INTO v_outcome FROM sroi_outcomes WHERE id = p_outcome_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  v_gross_value := v_outcome.quantity * v_outcome.financial_proxy;
  v_net_value := v_gross_value * (1 - v_outcome.deadweight) * v_outcome.attribution * (1 - v_outcome.displacement);

  FOR v_year IN 1..v_outcome.duration_years LOOP
    v_yearly_value := v_net_value * POWER(1 - v_outcome.drop_off, v_year - 1);
    v_discount_factor := POWER(1 + p_discount_rate, v_year);
    v_total_value := v_total_value + (v_yearly_value / v_discount_factor);
  END LOOP;

  UPDATE sroi_outcomes SET total_value = v_total_value WHERE id = p_outcome_id;

  RETURN v_total_value;
END;
$$ LANGUAGE plpgsql;

-- Detect storyteller thematic connections (simplified - manual trigger recommended)
-- This function can be enhanced once we understand the exact schema
-- For now, connections should be created manually or via application code

-- ROW LEVEL SECURITY POLICIES

ALTER TABLE story_narrative_arcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_evolution ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_concept_evolution ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_prosodic_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_emotion_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultural_speech_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sroi_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sroi_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sroi_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ripple_effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvested_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_interpretation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE storytelling_circle_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_story_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE theory_of_change ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (view access)
CREATE POLICY "Public read access" ON story_narrative_arcs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON theme_evolution FOR SELECT USING (true);
CREATE POLICY "Public read access" ON theme_concept_evolution FOR SELECT USING (true);
CREATE POLICY "Public read access" ON audio_prosodic_analysis FOR SELECT USING (true);
CREATE POLICY "Public read access" ON audio_emotion_analysis FOR SELECT USING (true);
CREATE POLICY "Public read access" ON cultural_speech_patterns FOR SELECT USING (true);
CREATE POLICY "Public read access" ON sroi_inputs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON sroi_outcomes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON sroi_calculations FOR SELECT USING (true);
CREATE POLICY "Public read access" ON ripple_effects FOR SELECT USING (true);
CREATE POLICY "Public read access" ON harvested_outcomes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON community_interpretation_sessions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON storytelling_circle_evaluations FOR SELECT USING (true);
CREATE POLICY "Public read access" ON community_story_responses FOR SELECT USING (true);
CREATE POLICY "Public read access" ON theory_of_change FOR SELECT USING (true);

-- Authenticated insert policies
CREATE POLICY "Authenticated insert" ON community_story_responses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON ripple_effects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON harvested_outcomes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert" ON community_interpretation_sessions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
