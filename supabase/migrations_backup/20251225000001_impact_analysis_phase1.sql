-- ============================================================================
-- EMPATHY LEDGER - IMPACT ANALYSIS PHASE 1
-- Database schema for comprehensive impact measurement and visualization
-- ============================================================================

-- ============================================================================
-- 1. NARRATIVE ANALYSIS TABLES
-- ============================================================================

-- Story narrative arcs (emotional trajectory)
CREATE TABLE IF NOT EXISTS story_narrative_arcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,

  -- Arc classification
  arc_type VARCHAR(50) NOT NULL, -- 'rags_to_riches', 'tragedy', 'man_in_hole', 'icarus', 'cinderella', 'oedipus', 'cyclical', 'linear'
  arc_confidence FLOAT CHECK (arc_confidence >= 0 AND arc_confidence <= 1),

  -- Emotional trajectory data (time-series)
  trajectory_data JSONB NOT NULL, -- [{time: 0.1, valence: 0.45, arousal: 0.6}, ...]

  -- Narrative segments
  segments JSONB, -- [{start: 0, end: 0.3, label: 'struggle', emotion: 'sadness'}, ...]

  -- Metrics
  emotional_range FLOAT, -- max - min valence
  volatility FLOAT, -- standard deviation of valence
  transformation_score FLOAT, -- beginning vs. end delta
  peak_moment FLOAT, -- time of highest valence (0.0-1.0)
  valley_moment FLOAT, -- time of lowest valence (0.0-1.0)

  -- Analysis metadata
  analyzed_at TIMESTAMPTZ DEFAULT now(),
  analysis_version VARCHAR(20) DEFAULT 'v1.0',
  analysis_method VARCHAR(50) DEFAULT 'openai_gpt4', -- 'openai_gpt4', 'lexicon', 'manual'

  -- Community override (allow storyteller to correct AI)
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

  -- Time period
  time_period VARCHAR(20) NOT NULL, -- 'Q1_2024', 'Winter_2024', 'Jan_2024', etc.
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Prevalence metrics
  story_count INTEGER DEFAULT 0,
  prominence_avg FLOAT, -- Average prominence score across stories
  prominence_median FLOAT,
  prominence_total FLOAT,

  -- Growth indicators
  is_emerging BOOLEAN DEFAULT false, -- Newly appeared theme
  is_declining BOOLEAN DEFAULT false,
  growth_rate FLOAT, -- Percentage change from previous period

  -- Co-occurrence with other themes
  connected_themes JSONB, -- [{theme_id: '...', co_occurrence_count: 15, correlation: 0.65}, ...]

  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(theme_id, time_period)
);

CREATE INDEX idx_theme_evolution_theme ON theme_evolution(theme_id);
CREATE INDEX idx_theme_evolution_period ON theme_evolution(time_period);
CREATE INDEX idx_theme_evolution_emerging ON theme_evolution(is_emerging) WHERE is_emerging = true;

-- Theme concept evolution (semantic shift tracking)
CREATE TABLE IF NOT EXISTS theme_concept_evolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  time_period VARCHAR(20) NOT NULL,

  -- Semantic shift tracking
  representative_quotes TEXT[], -- Top quotes representing this theme in this period
  key_concepts TEXT[], -- ['sovereignty', 'land rights', 'self-determination']
  sentiment_avg FLOAT, -- Average sentiment about this theme
  sentiment_shift FLOAT, -- Change from previous period

  -- Context
  primary_storytellers UUID[], -- Most prominent storytellers discussing this theme
  geographic_concentration VARCHAR(100), -- Where this theme is most discussed

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_theme_concepts_theme ON theme_concept_evolution(theme_id);
CREATE INDEX idx_theme_concepts_period ON theme_concept_evolution(time_period);

-- ============================================================================
-- 2. VOICE & AUDIO ANALYSIS TABLES
-- ============================================================================

-- Prosodic analysis (pitch, intonation, rhythm)
CREATE TABLE IF NOT EXISTS audio_prosodic_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_id UUID NOT NULL, -- References media_assets(id) or storyteller_media_library(id)
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,

  -- Pitch metrics
  pitch_mean_hz FLOAT,
  pitch_std_hz FLOAT,
  pitch_range_hz FLOAT,
  pitch_contour JSONB, -- [{time: 0.5, pitch: 180.2}, ...]

  -- Intensity metrics
  intensity_mean_db FLOAT,
  intensity_std_db FLOAT,
  intensity_contour JSONB, -- [{time: 0.5, intensity: 65.3}, ...]

  -- Speaking rate
  duration_seconds FLOAT,
  syllable_rate FLOAT, -- syllables per second
  speaking_rate_category VARCHAR(20), -- 'slow', 'moderate', 'fast'

  -- Pauses
  pause_count INTEGER,
  avg_pause_duration_sec FLOAT,
  pause_locations JSONB, -- [{time: 23.4, duration: 1.2}, ...]

  -- Voice quality
  harmonics_to_noise_ratio FLOAT, -- HNR in dB
  jitter FLOAT, -- Pitch variation (voice quality)
  shimmer FLOAT, -- Amplitude variation (voice quality)

  -- Cultural linguistic markers
  tonal_variation_pattern VARCHAR(50), -- For tonal languages
  ceremonial_prosody BOOLEAN DEFAULT false, -- Detected formal/ceremonial speech patterns
  code_switching_detected BOOLEAN DEFAULT false,

  -- Analysis metadata
  analyzed_at TIMESTAMPTZ DEFAULT now(),
  analysis_tool VARCHAR(50) DEFAULT 'praat', -- 'praat', 'parselmouth', 'opensmile'
  analysis_version VARCHAR(20),

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audio_prosody_audio ON audio_prosodic_analysis(audio_id);
CREATE INDEX idx_audio_prosody_story ON audio_prosodic_analysis(story_id);

-- Speech emotion recognition
CREATE TABLE IF NOT EXISTS audio_emotion_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_id UUID NOT NULL, -- References media_assets(id) or storyteller_media_library(id)
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,

  -- Emotion detection (overall)
  primary_emotion VARCHAR(20), -- 'joy', 'sadness', 'neutral', 'anger', 'fear', 'surprise'
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),

  -- All emotion probabilities
  emotion_joy FLOAT,
  emotion_sadness FLOAT,
  emotion_anger FLOAT,
  emotion_fear FLOAT,
  emotion_surprise FLOAT,
  emotion_neutral FLOAT,

  -- Temporal emotion data (emotion over time)
  emotion_timeline JSONB, -- [{time: 5.2, emotion: 'joy', confidence: 0.82, valence: 0.7, arousal: 0.6}, ...]

  -- Arousal and valence (2D emotion model)
  arousal_level FLOAT, -- High energy vs. low energy (-1 to 1)
  valence FLOAT, -- Positive vs. negative (-1 to 1)

  -- Analysis metadata
  analyzed_at TIMESTAMPTZ DEFAULT now(),
  analysis_model VARCHAR(50) DEFAULT 'paralinguistic', -- 'paralinguistic', 'openai_whisper', 'custom'

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audio_emotion_audio ON audio_emotion_analysis(audio_id);
CREATE INDEX idx_audio_emotion_story ON audio_emotion_analysis(story_id);
CREATE INDEX idx_audio_emotion_primary ON audio_emotion_analysis(primary_emotion);

-- Cultural speech patterns
CREATE TABLE IF NOT EXISTS cultural_speech_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  language_code VARCHAR(10), -- ISO code or custom for Indigenous languages

  -- Code-switching
  code_switching_detected BOOLEAN DEFAULT false,
  primary_language VARCHAR(50),
  secondary_languages TEXT[],
  switching_points JSONB, -- [{time: 34.2, from: 'Cree', to: 'English', context: '...'}, ...]

  -- Traditional formulae
  storytelling_formulae TEXT[], -- Detected opening/closing phrases
  ceremonial_markers BOOLEAN DEFAULT false,
  traditional_opening TEXT,
  traditional_closing TEXT,

  -- Oral poetry
  repetition_patterns JSONB,
  rhythmic_structure VARCHAR(50),
  call_and_response BOOLEAN DEFAULT false,

  -- Community validation (Indigenous language experts)
  validated_by UUID REFERENCES profiles(id),
  validation_date TIMESTAMPTZ,
  cultural_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cultural_speech_story ON cultural_speech_patterns(story_id);
CREATE INDEX idx_cultural_speech_language ON cultural_speech_patterns(language_code);

-- ============================================================================
-- 3. SOCIAL IMPACT MEASUREMENT (SROI)
-- ============================================================================

-- SROI inputs (investments)
CREATE TABLE IF NOT EXISTS sroi_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Financial inputs
  total_investment DECIMAL(12,2) NOT NULL,
  funding_sources JSONB, -- [{source: 'Grant ABC', amount: 50000, funder: 'Foundation XYZ'}, ...]

  -- Resource inputs
  staff_hours FLOAT,
  staff_cost_per_hour DECIMAL(10,2),
  volunteer_hours FLOAT,
  volunteer_value_per_hour DECIMAL(10,2) DEFAULT 30.00, -- Standard volunteer value

  -- In-kind contributions
  in_kind_contributions JSONB, -- [{type: 'equipment', description: 'Recording gear', value: 5000}, ...]

  -- Time period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Metadata
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sroi_inputs_project ON sroi_inputs(project_id);

-- SROI outcomes (social value created)
CREATE TABLE IF NOT EXISTS sroi_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  input_id UUID REFERENCES sroi_inputs(id) ON DELETE CASCADE,

  -- Outcome description
  outcome_type VARCHAR(50) NOT NULL, -- 'cultural_preservation', 'community_healing', 'youth_engagement', 'policy_influence', 'knowledge_transfer'
  outcome_description TEXT NOT NULL,
  outcome_category VARCHAR(50), -- 'individual', 'community', 'systemic'

  -- Beneficiaries
  stakeholder_group VARCHAR(50) NOT NULL, -- 'storytellers', 'youth', 'elders', 'community', 'researchers', 'policymakers'
  beneficiary_count INTEGER NOT NULL,

  -- Quantification
  quantity FLOAT NOT NULL, -- How much change occurred (e.g., 50 youth gained cultural pride)
  unit_of_measurement VARCHAR(50), -- 'people', 'stories', 'events', 'policy_changes'

  -- Financial proxy (assigning dollar value to social outcome)
  financial_proxy DECIMAL(12,2) NOT NULL, -- Dollar value per unit
  financial_proxy_source VARCHAR(100), -- Where this value comes from
  financial_proxy_rationale TEXT, -- Why this value was chosen

  -- Attribution factors (discounting)
  deadweight FLOAT DEFAULT 0.0 CHECK (deadweight >= 0 AND deadweight <= 1), -- What would have happened anyway
  attribution FLOAT DEFAULT 1.0 CHECK (attribution >= 0 AND attribution <= 1), -- Our contribution vs. others
  drop_off FLOAT DEFAULT 0.0 CHECK (drop_off >= 0 AND drop_off <= 1), -- Decline over time
  displacement FLOAT DEFAULT 0.0 CHECK (displacement >= 0 AND displacement <= 1), -- Negative effects elsewhere

  -- Duration
  duration_years FLOAT NOT NULL, -- How long impact lasts

  -- Evidence
  evidence_sources JSONB, -- [{type: 'survey', description: 'Community survey N=45', confidence: 'high'}, ...]
  evidence_quality VARCHAR(20), -- 'low', 'medium', 'high'

  -- Calculated value (auto-computed)
  gross_value DECIMAL(12,2), -- quantity × financial_proxy
  net_value DECIMAL(12,2), -- After discounting factors
  total_value DECIMAL(12,2), -- Present value over duration

  -- Metadata
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sroi_outcomes_project ON sroi_outcomes(project_id);
CREATE INDEX idx_sroi_outcomes_type ON sroi_outcomes(outcome_type);
CREATE INDEX idx_sroi_outcomes_stakeholder ON sroi_outcomes(stakeholder_group);

-- SROI calculations (final ratios)
CREATE TABLE IF NOT EXISTS sroi_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  calculation_date TIMESTAMPTZ DEFAULT now(),

  -- Input reference
  input_id UUID REFERENCES sroi_inputs(id),

  -- Calculation
  total_investment DECIMAL(12,2) NOT NULL,
  total_social_value DECIMAL(12,2) NOT NULL,
  net_social_value DECIMAL(12,2), -- total_social_value - total_investment
  sroi_ratio FLOAT NOT NULL, -- total_social_value / total_investment

  -- Sensitivity analysis
  conservative_ratio FLOAT, -- With pessimistic assumptions
  optimistic_ratio FLOAT, -- With optimistic assumptions
  discount_rate FLOAT DEFAULT 0.035, -- Standard 3.5%

  -- Report metadata
  methodology_notes TEXT,
  assumptions JSONB, -- [{assumption: 'Youth cultural pride valued at $500', rationale: '...'}]
  limitations TEXT,
  stakeholder_validation JSONB, -- [{stakeholder: 'Community Elder Council', validated: true, date: '...'}]

  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'reviewed', 'approved', 'published'
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,

  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sroi_calc_project ON sroi_calculations(project_id);
CREATE INDEX idx_sroi_calc_status ON sroi_calculations(status);

-- ============================================================================
-- 4. RIPPLE EFFECT MAPPING
-- ============================================================================

CREATE TABLE IF NOT EXISTS ripple_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- Effect description
  effect_description TEXT NOT NULL,
  effect_type VARCHAR(50), -- 'healing', 'awareness', 'policy', 'action', 'connection', 'learning'

  -- Ripple level (concentric circles)
  ripple_level INTEGER NOT NULL CHECK (ripple_level >= 1 AND ripple_level <= 5),
  ripple_label VARCHAR(50), -- 'storyteller', 'family', 'community', 'other_communities', 'policy_systems'

  -- Reach
  people_affected INTEGER,
  communities_affected INTEGER,
  geographic_reach VARCHAR(50), -- 'local', 'regional', 'national', 'international'

  -- Timing
  occurred_at TIMESTAMPTZ,
  time_lag_days INTEGER, -- Days after story was shared

  -- Evidence
  evidence_type VARCHAR(50), -- 'interview', 'survey', 'observation', 'document', 'testimony'
  evidence_source TEXT,
  evidence_quality VARCHAR(20), -- 'anecdotal', 'documented', 'verified'

  -- Chain of effects (ripples triggering ripples)
  triggered_by UUID REFERENCES ripple_effects(id) ON DELETE SET NULL,

  -- Reporting
  reported_by UUID REFERENCES profiles(id),
  reported_at TIMESTAMPTZ DEFAULT now(),

  -- Community validation
  validated BOOLEAN DEFAULT false,
  validated_by UUID REFERENCES profiles(id),
  validation_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ripple_effects_story ON ripple_effects(story_id);
CREATE INDEX idx_ripple_effects_project ON ripple_effects(project_id);
CREATE INDEX idx_ripple_effects_level ON ripple_effects(ripple_level);
CREATE INDEX idx_ripple_effects_type ON ripple_effects(effect_type);
CREATE INDEX idx_ripple_effects_triggered ON ripple_effects(triggered_by);

-- ============================================================================
-- 5. OUTCOME HARVESTING
-- ============================================================================

CREATE TABLE IF NOT EXISTS harvested_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,

  -- Outcome description
  change_description TEXT NOT NULL,
  who_changed VARCHAR(50) NOT NULL, -- 'individual', 'family', 'community', 'organization', 'policy'
  when_occurred DATE,

  -- Behavior change specifics
  behavior_before TEXT,
  behavior_after TEXT,
  change_significance VARCHAR(50), -- 'minor', 'moderate', 'significant', 'transformative'

  -- Evidence
  evidence_description TEXT NOT NULL,
  evidence_sources JSONB, -- [{type: 'observation', source: 'Community meeting notes', date: '...'}]

  -- Project contribution
  contribution_description TEXT,
  contribution_assessment VARCHAR(20), -- 'direct', 'indirect', 'enabling', 'catalyzing'
  contribution_percentage INTEGER CHECK (contribution_percentage >= 0 AND contribution_percentage <= 100),

  -- Verification
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES profiles(id),
  verification_date TIMESTAMPTZ,
  verification_notes TEXT,

  -- Significance (Most Significant Change method)
  significance_level VARCHAR(20), -- 'low', 'medium', 'high', 'transformative'
  significance_rationale TEXT,
  significance_votes INTEGER DEFAULT 0, -- Community voting on most significant

  -- Reporting
  reported_by UUID REFERENCES profiles(id),
  reported_at TIMESTAMPTZ DEFAULT now(),

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_harvested_outcomes_project ON harvested_outcomes(project_id);
CREATE INDEX idx_harvested_outcomes_story ON harvested_outcomes(story_id);
CREATE INDEX idx_harvested_outcomes_significance ON harvested_outcomes(significance_level);
CREATE INDEX idx_harvested_outcomes_who ON harvested_outcomes(who_changed);

-- ============================================================================
-- 6. PARTICIPATORY EVALUATION
-- ============================================================================

-- Community interpretation sessions
CREATE TABLE IF NOT EXISTS community_interpretation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Session details
  session_date DATE NOT NULL,
  location VARCHAR(100),
  session_type VARCHAR(50), -- 'storytelling_circle', 'focus_group', 'community_meeting', 'workshop'
  facilitator_id UUID REFERENCES profiles(id),

  -- Participants
  participant_ids UUID[], -- Array of profile IDs
  participant_count INTEGER NOT NULL,
  participant_demographics JSONB, -- Aggregate only: {elders: 5, youth: 3, women: 6, etc.}

  -- Data reviewed
  stories_reviewed UUID[],
  themes_discussed UUID[],
  data_reviewed TEXT, -- What analytics/reports were discussed

  -- Collective interpretation
  key_findings TEXT[] NOT NULL,
  community_insights TEXT[],
  recommended_actions TEXT[],

  -- Quotes and stories shared
  shared_narratives JSONB, -- [{speaker: 'Elder (anonymous)', story: '...', theme: '...'}]

  -- Documentation
  recording_url TEXT,
  notes TEXT,
  documentation_type VARCHAR(50), -- 'full_transcript', 'summary', 'notes_only'

  -- Consent
  recording_permitted BOOLEAN DEFAULT false,
  public_sharing_permitted BOOLEAN DEFAULT false,

  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_community_sessions_project ON community_interpretation_sessions(project_id);
CREATE INDEX idx_community_sessions_date ON community_interpretation_sessions(session_date DESC);

-- Storytelling circle evaluations
CREATE TABLE IF NOT EXISTS storytelling_circle_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  session_id UUID REFERENCES community_interpretation_sessions(id) ON DELETE CASCADE,

  -- Circle protocol
  opening_protocol TEXT,
  closing_protocol TEXT,
  cultural_protocols_observed TEXT[],

  -- Guiding prompts used
  prompts_used TEXT[],

  -- Emergent themes from circle
  emergent_themes TEXT[],
  significant_moments TEXT[],

  -- Metaphors and cultural expressions
  metaphors JSONB, -- [{metaphor: 'river journey', interpretation: 'project progress', speaker: '...'}]
  cultural_references TEXT[],

  -- Reflections on evaluation process itself
  process_reflections TEXT,
  what_worked_well TEXT,
  what_to_improve TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_circle_eval_project ON storytelling_circle_evaluations(project_id);
CREATE INDEX idx_circle_eval_session ON storytelling_circle_evaluations(session_id);

-- Community responses to stories
CREATE TABLE IF NOT EXISTS community_story_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  respondent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Response
  what_stood_out TEXT,
  personal_connection TEXT,
  inspired_action TEXT,

  -- Relational impact
  changed_perspective BOOLEAN DEFAULT false,
  perspective_change_description TEXT,

  -- Sharing permission
  anonymous BOOLEAN DEFAULT true,
  public_sharing_permitted BOOLEAN DEFAULT false,

  -- Metadata
  response_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_community_responses_story ON community_story_responses(story_id);
CREATE INDEX idx_community_responses_date ON community_story_responses(response_date DESC);

-- ============================================================================
-- 7. STORYTELLER NETWORK
-- ============================================================================

CREATE TABLE IF NOT EXISTS storyteller_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Storytellers
  storyteller_1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  storyteller_2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Connection type
  connection_type VARCHAR(50) NOT NULL, -- 'thematic', 'geographic', 'familial', 'temporal', 'linguistic'

  -- Strength
  connection_strength FLOAT CHECK (connection_strength >= 0 AND connection_strength <= 1),

  -- For thematic connections
  shared_themes UUID[], -- Array of theme IDs
  theme_overlap_score FLOAT, -- Jaccard similarity

  -- For geographic connections
  shared_territory VARCHAR(100),
  distance_km FLOAT,

  -- For relationship connections
  relationship_type VARCHAR(50), -- 'family', 'mentor', 'community_member', 'colleague'
  relationship_description TEXT,

  -- For temporal connections
  time_period_overlap VARCHAR(50),
  temporal_proximity_days INTEGER,

  -- For linguistic connections
  shared_languages TEXT[],

  -- Metadata
  auto_detected BOOLEAN DEFAULT true, -- vs. manually added
  detected_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_connection UNIQUE(storyteller_1_id, storyteller_2_id, connection_type),
  CONSTRAINT different_storytellers CHECK (storyteller_1_id != storyteller_2_id)
);

CREATE INDEX idx_storyteller_conn_st1 ON storyteller_connections(storyteller_1_id);
CREATE INDEX idx_storyteller_conn_st2 ON storyteller_connections(storyteller_2_id);
CREATE INDEX idx_storyteller_conn_type ON storyteller_connections(connection_type);
CREATE INDEX idx_storyteller_conn_strength ON storyteller_connections(connection_strength DESC);

-- ============================================================================
-- 8. THEORY OF CHANGE
-- ============================================================================

CREATE TABLE IF NOT EXISTS theory_of_change (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Name and description
  name VARCHAR(200),
  description TEXT,

  -- Each stage (JSONB for flexibility)
  inputs JSONB NOT NULL, -- [{type: 'funding', amount: 100000, source: '...'}, {type: 'staff', fte: 2}, ...]
  activities JSONB NOT NULL, -- [{activity: 'Story recording sessions', frequency: 'weekly'}, ...]
  outputs JSONB NOT NULL, -- [{output: 'Stories recorded', target: 50, actual: 32}, ...]
  short_term_outcomes JSONB NOT NULL, -- [{outcome: 'Youth cultural pride', indicator: 'survey', target: '80%'}, ...]
  medium_term_outcomes JSONB NOT NULL,
  long_term_impact JSONB NOT NULL,

  -- Assumptions and risks
  assumptions JSONB, -- [{assumption: 'Elders willing to share', mitigation: 'Build trust first'}]
  external_factors JSONB, -- [{factor: 'Funding availability', impact: 'high', likelihood: 'medium'}]

  -- Evidence and indicators
  indicators JSONB, -- [{stage: 'short_term', indicator: 'Youth survey', measurement: 'quarterly'}]

  -- Visual layout
  layout_data JSONB, -- For storing custom ToC diagram positioning

  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'active', 'archived'
  version INTEGER DEFAULT 1,

  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_toc_project ON theory_of_change(project_id);
CREATE INDEX idx_toc_status ON theory_of_change(status);

-- ============================================================================
-- 9. HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate SROI outcome value
CREATE OR REPLACE FUNCTION calculate_sroi_outcome_value(
  p_outcome_id UUID,
  p_discount_rate FLOAT DEFAULT 0.035
)
RETURNS DECIMAL(12,2)
LANGUAGE plpgsql
AS $$
DECLARE
  v_outcome RECORD;
  v_gross_value DECIMAL(12,2);
  v_net_value DECIMAL(12,2);
  v_total_value DECIMAL(12,2);
  v_yearly_value DECIMAL(12,2);
  v_present_value DECIMAL(12,2);
  v_year INTEGER;
BEGIN
  -- Get outcome data
  SELECT * INTO v_outcome
  FROM sroi_outcomes
  WHERE id = p_outcome_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Calculate gross value
  v_gross_value := v_outcome.quantity * v_outcome.financial_proxy;

  -- Apply discounting factors
  v_net_value := v_gross_value * (1 - v_outcome.deadweight) * v_outcome.attribution * (1 - v_outcome.displacement);

  -- Calculate present value over duration
  v_total_value := 0;

  FOR v_year IN 1..CEIL(v_outcome.duration_years) LOOP
    -- Apply drop-off
    v_yearly_value := v_net_value * POWER(1 - v_outcome.drop_off, v_year - 1);

    -- Discount to present value
    v_present_value := v_yearly_value / POWER(1 + p_discount_rate, v_year);

    v_total_value := v_total_value + v_present_value;
  END LOOP;

  -- Update the outcome record
  UPDATE sroi_outcomes
  SET
    gross_value = v_gross_value,
    net_value = v_net_value,
    total_value = v_total_value,
    updated_at = now()
  WHERE id = p_outcome_id;

  RETURN v_total_value;
END;
$$;

-- Function to auto-detect storyteller connections
CREATE OR REPLACE FUNCTION detect_storyteller_thematic_connections(
  p_min_strength FLOAT DEFAULT 0.3
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_st1 RECORD;
  v_st2 RECORD;
  v_themes1 UUID[];
  v_themes2 UUID[];
  v_intersection UUID[];
  v_union UUID[];
  v_similarity FLOAT;
  v_connections_created INTEGER := 0;
BEGIN
  -- Loop through all pairs of storytellers
  FOR v_st1 IN
    SELECT DISTINCT storyteller_id
    FROM stories
    WHERE status = 'published'
  LOOP
    -- Get themes for storyteller 1
    SELECT array_agg(DISTINCT theme_id) INTO v_themes1
    FROM story_themes
    WHERE story_id IN (
      SELECT id FROM stories WHERE storyteller_id = v_st1.storyteller_id
    );

    FOR v_st2 IN
      SELECT DISTINCT storyteller_id
      FROM stories
      WHERE status = 'published'
        AND storyteller_id > v_st1.storyteller_id -- Avoid duplicates
    LOOP
      -- Get themes for storyteller 2
      SELECT array_agg(DISTINCT theme_id) INTO v_themes2
      FROM story_themes
      WHERE story_id IN (
        SELECT id FROM stories WHERE storyteller_id = v_st2.storyteller_id
      );

      -- Calculate Jaccard similarity
      IF v_themes1 IS NOT NULL AND v_themes2 IS NOT NULL THEN
        -- Intersection
        SELECT array_agg(DISTINCT t)
        INTO v_intersection
        FROM unnest(v_themes1) t
        WHERE t = ANY(v_themes2);

        -- Union
        SELECT array_agg(DISTINCT t)
        INTO v_union
        FROM (
          SELECT unnest(v_themes1) AS t
          UNION
          SELECT unnest(v_themes2) AS t
        ) u;

        v_similarity := COALESCE(array_length(v_intersection, 1), 0)::FLOAT /
                        NULLIF(array_length(v_union, 1), 0)::FLOAT;

        -- Create connection if above threshold
        IF v_similarity >= p_min_strength THEN
          INSERT INTO storyteller_connections (
            storyteller_1_id,
            storyteller_2_id,
            connection_type,
            connection_strength,
            shared_themes,
            theme_overlap_score,
            auto_detected
          ) VALUES (
            v_st1.storyteller_id,
            v_st2.storyteller_id,
            'thematic',
            v_similarity,
            v_intersection,
            v_similarity,
            true
          )
          ON CONFLICT (storyteller_1_id, storyteller_2_id, connection_type)
          DO UPDATE SET
            connection_strength = EXCLUDED.connection_strength,
            shared_themes = EXCLUDED.shared_themes,
            theme_overlap_score = EXCLUDED.theme_overlap_score,
            detected_at = now();

          v_connections_created := v_connections_created + 1;
        END IF;
      END IF;
    END LOOP;
  END LOOP;

  RETURN v_connections_created;
END;
$$;

-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
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
ALTER TABLE storyteller_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE theory_of_change ENABLE ROW LEVEL SECURITY;

-- Story narrative arcs: follow story permissions
CREATE POLICY story_arcs_select ON story_narrative_arcs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stories s
      WHERE s.id = story_id
        AND (s.visibility = 'public' OR s.storyteller_id = auth.uid())
    )
  );

CREATE POLICY story_arcs_insert ON story_narrative_arcs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM stories s
      WHERE s.id = story_id
        AND (s.storyteller_id = auth.uid() OR EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')
        ))
    )
  );

-- Community story responses: anyone authenticated can create
CREATE POLICY community_responses_select ON community_story_responses
  FOR SELECT USING (
    NOT anonymous OR respondent_id = auth.uid() OR public_sharing_permitted = true
  );

CREATE POLICY community_responses_insert ON community_story_responses
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- SROI tables: project team + admins
CREATE POLICY sroi_inputs_select ON sroi_inputs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_team pt
      WHERE pt.project_id = sroi_inputs.project_id
        AND pt.member_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')
    )
  );

CREATE POLICY sroi_outcomes_select ON sroi_outcomes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_team pt
      WHERE pt.project_id = sroi_outcomes.project_id
        AND pt.member_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')
    )
  );

-- Ripple effects: anyone can report, but must be validated
CREATE POLICY ripple_effects_select ON ripple_effects
  FOR SELECT USING (validated = true OR reported_by = auth.uid());

CREATE POLICY ripple_effects_insert ON ripple_effects
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- 11. SAMPLE DATA (for testing)
-- ============================================================================

-- Note: Uncomment to insert sample data for development

-- Sample story arc
-- INSERT INTO story_narrative_arcs (story_id, arc_type, arc_confidence, trajectory_data, emotional_range, transformation_score)
-- SELECT
--   id,
--   'man_in_hole',
--   0.85,
--   '[{"time": 0, "valence": 0.5}, {"time": 0.2, "valence": 0.3}, {"time": 0.5, "valence": 0.2}, {"time": 0.8, "valence": 0.6}, {"time": 1.0, "valence": 0.7}]'::jsonb,
--   0.5,
--   0.2
-- FROM stories
-- LIMIT 1;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Validate migration
DO $$
BEGIN
  RAISE NOTICE 'Impact Analysis Phase 1 migration completed successfully';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - story_narrative_arcs';
  RAISE NOTICE '  - theme_evolution';
  RAISE NOTICE '  - theme_concept_evolution';
  RAISE NOTICE '  - audio_prosodic_analysis';
  RAISE NOTICE '  - audio_emotion_analysis';
  RAISE NOTICE '  - cultural_speech_patterns';
  RAISE NOTICE '  - sroi_inputs, sroi_outcomes, sroi_calculations';
  RAISE NOTICE '  - ripple_effects';
  RAISE NOTICE '  - harvested_outcomes';
  RAISE NOTICE '  - community_interpretation_sessions';
  RAISE NOTICE '  - storytelling_circle_evaluations';
  RAISE NOTICE '  - community_story_responses';
  RAISE NOTICE '  - storyteller_connections';
  RAISE NOTICE '  - theory_of_change';
  RAISE NOTICE '';
  RAISE NOTICE 'Helper functions created:';
  RAISE NOTICE '  - calculate_sroi_outcome_value()';
  RAISE NOTICE '  - detect_storyteller_thematic_connections()';
END $$;
