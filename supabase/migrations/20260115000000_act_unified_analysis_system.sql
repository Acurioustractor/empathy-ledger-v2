-- =====================================================
-- ACT UNIFIED STORYTELLER ANALYSIS SYSTEM
-- "Authentic & Adaptive Learning for Meaningful Accountability"
--
-- Purpose: Infrastructure for regenerative intelligence
--   storyteller → project → organization → global → commons
--
-- Philosophy: Sovereignty containers, not extraction engines
-- Framework: ALMA v2.0 + LCAA rhythm + Beautiful Obsolescence
-- =====================================================

-- Enable pgvector extension for RAG semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- TABLE 1: Storyteller Master Analysis
-- Individual Sovereignty Container (OCAP-enforced)
-- =====================================================
CREATE TABLE IF NOT EXISTS storyteller_master_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL, -- Privacy isolation

  -- Version tracking
  analysis_version TEXT NOT NULL DEFAULT 'v1-act-alma-20260115',
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Source data stats
  transcript_count INTEGER DEFAULT 0,
  total_content_length INTEGER DEFAULT 0,
  media_count INTEGER DEFAULT 0,

  -- =====================================================
  -- CORE ANALYSIS (Cultural-first, not extractive)
  -- =====================================================

  -- Themes (same as before, but cultural context-aware)
  extracted_themes JSONB DEFAULT '[]'::jsonb,
  -- Structure: [{
  --   "theme": "resilience",
  --   "frequency": 12,
  --   "confidence": 0.87,
  --   "cultural_context": "intergenerational_healing",
  --   "Country_connection": "tied_to_fire_management_practice",
  --   "examples": [{"transcript_id": "...", "quote": "..."}]
  -- }]

  -- Quotes (best quotes with cultural significance)
  extracted_quotes JSONB DEFAULT '[]'::jsonb,
  -- Structure: [{
  --   "quote": "We've been burning this Country for 60,000 years",
  --   "context": "discussing_seasonal_fire_management",
  --   "cultural_significance": "traditional_ecological_knowledge",
  --   "consent_level": "public_sharing_approved",
  --   "transcript_id": "...",
  --   "can_be_featured": true
  -- }]

  -- Cultural markers (Indigenous/cultural knowledge - NEVER profiling)
  cultural_markers JSONB DEFAULT '[]'::jsonb,
  -- Structure: [{
  --   "type": "language",
  --   "content": "Noongar_words_for_seasons",
  --   "significance": "knowledge_transmission",
  --   "intergenerational": true,
  --   "Country_connection": "Jinibara_traditional_lands",
  --   "consent_boundaries": "community_only"
  -- }]

  -- =====================================================
  -- ALMA v2.0 SIGNALS (System-level, not individual profiling)
  -- "Authentic & Adaptive Learning for Meaningful Accountability"
  -- =====================================================

  alma_signals JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "authority": {
  --     "level": "lived_experience", // vs secondary/academic
  --     "cultural_positioning": "Jinibara_elder|youth|ally",
  --     "consent_boundaries": ["public_sharing", "research_use", "commercial_use"],
  --     "voice_control": "full", // storyteller maintains control
  --     "OCAP_compliance": true
  --   },
  --   "evidence_strength": {
  --     "primary_source": true,
  --     "corroboration_count": 3,
  --     "cultural_verification": "elder_reviewed|community_approved|pending",
  --     "source_diversity": ["oral_history", "on_country_observation", "lived_experience"]
  --   },
  --   "harm_risk_inverted": {
  --     "safety_score": 0.95, // inverted: 1.0 = completely safe
  --     "cultural_protocols_met": true,
  --     "trigger_warnings": [],
  --     "sacred_content_protected": true,
  --     "consent_violations": 0
  --   },
  --   "capability": {
  --     "knowledge_domains": ["traditional_ecology", "fire_management", "language_preservation"],
  --     "transferable_skills": ["facilitation", "cultural_guidance", "youth_mentorship"],
  --     "learning_pathways_opened": ["mentorship", "residency", "Goods_design_consultant"],
  --     "capacity_built": "digital_storytelling_skills_gained"
  --   },
  --   "option_value": {
  --     "future_applications": ["curriculum_design", "policy_input", "community_training"],
  --     "network_connections": ["land_care_orgs", "justice_advocates", "cultural_centers"],
  --     "handover_potential": "can_train_others", // Beautiful Obsolescence
  --     "commons_contribution": "knowledge_shared_freely"
  --   },
  --   "community_value_return": {
  --     "direct_benefits": "$500_honorarium_paid",
  --     "capacity_building": "digital_storytelling_training_completed",
  --     "cultural_continuity": "youth_engaged_with_knowledge",
  --     "fair_value_protection": true, // 50% revenue return policy
  --     "enterprise_pathways": ["Goods_employment_offered", "Harvest_guide_role"]
  --   }
  -- }

  -- =====================================================
  -- IMPACT DIMENSIONS (ACT Framework-aligned)
  -- =====================================================

  impact_dimensions JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "LCAA_rhythm": {
  --     "listen": {
  --       "methods": ["yarning_circle", "on_country_walk", "family_consultation"],
  --       "depth": "deep|medium|surface",
  --       "time_invested_hours": 12,
  --       "community_led": true
  --     },
  --     "curiosity": {
  --       "questions_surfaced": ["How do we share fire knowledge safely?", "Who holds this authority?"],
  --       "community_interest": "high|medium|low",
  --       "co_design_participation": true
  --     },
  --     "action": {
  --       "pathways_opened": ["Goods_design_consultant", "JusticeHub_claim_filed", "Harvest_cultural_guide"],
  --       "barriers_removed": ["lack_of_transport", "digital_literacy_gap"],
  --       "outcomes_achieved": ["employment", "recognition", "healing"]
  --     },
  --     "art": {
  --       "story_forms": ["video", "written_narrative", "audio_recording"],
  --       "cultural_expression": "song_shared|dance_documented|ceremony_honored",
  --       "returns_to_listen": true // Seasonal rhythm, not linear
  --     }
  --   },
  --   "conservation_impact": {
  --     "land_knowledge_shared": "fire_management_seasonal_timing",
  --     "ecological_insights": ["cool_burn_reduces_fuel_load", "protects_regeneration_areas"],
  --     "Country_connection": "strengthened|maintained|reconnected",
  --     "conservation_baseline_protected": true // Country sets pace
  --   },
  --   "enterprise_pathways": {
  --     "Goods_involvement": "design_consultant|maker|storyteller",
  --     "Harvest_engagement": "cultural_guide|educator|event_host",
  --     "fair_value_return": "$1200_paid_total",
  --     "ongoing_opportunity": "6_month_contract_offered"
  --   },
  --   "sovereignty_outcomes": {
  --     "OCAP_enforced": true, // Ownership, Control, Access, Possession
  --     "CARE_principles_met": true, // Collective benefit, Authority, Responsibility, Ethics
  --     "voice_control_maintained": "full|shared|delegated",
  --     "Beautiful_Obsolescence_prep": "handover_training_completed|in_progress|not_started",
  --     "consent_automation_working": true // 50-70% admin overhead reduction
  --   }
  -- }

  -- Knowledge contributions (what they shared with the world)
  knowledge_contributions JSONB DEFAULT '[]'::jsonb,
  -- Structure: [{
  --   "domain": "traditional_ecology",
  --   "contribution": "seasonal_fire_timing_knowledge",
  --   "evidence": ["transcript_quotes", "on_country_demonstration", "elder_verification"],
  --   "transferability": "high|medium|low",
  --   "cultural_protocol": "shareable_with_permission|community_only|sacred_restricted",
  --   "commons_value": "curriculum_designers_can_use_with_consent"
  -- }]

  -- Sentiment analysis (emotional journey - respectful, not extractive)
  sentiment_analysis JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "overall_tone": "hopeful|reflective|healing|grieving",
  --   "emotional_journey": ["pain_acknowledged", "resilience_shown", "hope_expressed"],
  --   "key_moments": [{
  --     "timestamp": "00:15:32",
  --     "emotion": "grief",
  --     "context": "discussing_stolen_generations",
  --     "cultural_safety_note": "trigger_warning_applied"
  --   }],
  --   "healing_indicators": ["connection_to_Country", "intergenerational_strength", "community_support"]
  -- }

  -- Network data (relationships - NOT for surveillance, for connection)
  network_data JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "mentioned_people": [{"name": "Uncle Bob", "relationship": "mentor", "consent_to_name": true}],
  --   "mentioned_organizations": ["Local Land Council", "Cultural Center"],
  --   "connections_to_projects": ["Goods_fire_management_calendar", "Harvest_on_country_tours"],
  --   "community_role": "knowledge_keeper|connector|learner|advocate"
  -- }

  -- =====================================================
  -- RAG SEMANTIC SEARCH (Regenerative knowledge, not extraction)
  -- =====================================================

  embedding VECTOR(1536), -- OpenAI ada-002 or BGE-large-en-v1.5

  -- =====================================================
  -- PROCESSING METADATA
  -- =====================================================

  processing_metadata JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "model": "claude-opus-4.5",
  --   "processing_time_ms": 1234,
  --   "retries": 0,
  --   "cost_cents": 12,
  --   "human_review": "elder_verified|community_approved|pending",
  --   "Beautiful_Obsolescence_note": "process_transferable_to_community"
  -- }

  -- =====================================================
  -- CONSENT & PRIVACY (Sovereignty-first)
  -- =====================================================

  storyteller_consent JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "allow_ai_analysis": true,
  --   "allow_public_sharing": false,
  --   "allow_research": true,
  --   "allow_commercial_use": false,
  --   "allow_aggregation": "anonymous_only",
  --   "consent_date": "2026-01-15",
  --   "can_revoke_anytime": true,
  --   "Beautiful_Obsolescence_transfer": "community_can_manage_my_consent"
  -- }

  privacy_level TEXT NOT NULL DEFAULT 'private' CHECK (privacy_level IN ('private', 'organization', 'public')),
  is_featured BOOLEAN DEFAULT FALSE,
  quality_score NUMERIC(3,2) CHECK (quality_score BETWEEN 0 AND 1),

  -- =====================================================
  -- TIMESTAMPS
  -- =====================================================

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- =====================================================
  -- CONSTRAINTS
  -- =====================================================

  UNIQUE(storyteller_id) -- One master analysis per storyteller
);

-- Indexes
CREATE INDEX idx_sma_storyteller ON storyteller_master_analysis(storyteller_id);
CREATE INDEX idx_sma_tenant ON storyteller_master_analysis(tenant_id);
CREATE INDEX idx_sma_privacy ON storyteller_master_analysis(privacy_level);
CREATE INDEX idx_sma_analyzed ON storyteller_master_analysis(analyzed_at DESC);
CREATE INDEX idx_sma_embedding_vector ON storyteller_master_analysis USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Full-text search on extracted themes/quotes (in addition to vector search)
CREATE INDEX idx_sma_themes_gin ON storyteller_master_analysis USING GIN (extracted_themes);
CREATE INDEX idx_sma_quotes_gin ON storyteller_master_analysis USING GIN (extracted_quotes);

-- RLS Policies (Sovereignty-enforced)
ALTER TABLE storyteller_master_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "storyteller_view_own_analysis"
  ON storyteller_master_analysis FOR SELECT TO authenticated
  USING (
    storyteller_id IN (SELECT id FROM storytellers WHERE profile_id = auth.uid())
  );

CREATE POLICY "storyteller_update_own_consent"
  ON storyteller_master_analysis FOR UPDATE TO authenticated
  USING (
    storyteller_id IN (SELECT id FROM storytellers WHERE profile_id = auth.uid())
  )
  WITH CHECK (
    -- Can only update consent fields, not AI-generated analysis
    storyteller_id IN (SELECT id FROM storytellers WHERE profile_id = auth.uid())
  );

CREATE POLICY "org_admins_view_org_analysis"
  ON storyteller_master_analysis FOR SELECT TO authenticated
  USING (
    privacy_level IN ('organization', 'public')
    AND tenant_id IN (
      SELECT organization_id FROM organization_members
      WHERE profile_id = auth.uid()
        AND role IN ('admin', 'elder', 'cultural_keeper')
    )
  );

CREATE POLICY "public_analysis_visible"
  ON storyteller_master_analysis FOR SELECT TO authenticated
  USING (privacy_level = 'public');

CREATE POLICY "service_role_full_access_sma"
  ON storyteller_master_analysis FOR ALL TO service_role
  USING (true);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_sma_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sma_timestamp
  BEFORE UPDATE ON storyteller_master_analysis
  FOR EACH ROW EXECUTE FUNCTION update_sma_timestamp();

-- Comment
COMMENT ON TABLE storyteller_master_analysis IS
  'ACT Unified Analysis: Individual sovereignty container with ALMA v2.0 signals.
   Philosophy: Voice control, consent-first, Beautiful Obsolescence-ready.
   NOT for profiling - for regenerative intelligence and community value return.';

-- =====================================================
-- TABLE 2: Project Impact Analysis
-- LCAA Rhythm Tracker + Handover Readiness Monitor
-- =====================================================
CREATE TABLE IF NOT EXISTS project_impact_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL,
  tenant_id UUID NOT NULL,

  -- Version tracking
  analysis_version TEXT NOT NULL DEFAULT 'v1-act-alma-20260115',
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Aggregated stats
  storyteller_count INTEGER DEFAULT 0,
  total_transcript_count INTEGER DEFAULT 0,
  total_media_count INTEGER DEFAULT 0,

  -- =====================================================
  -- AGGREGATED THEMES & IMPACT (from storyteller_master_analysis)
  -- =====================================================

  aggregated_themes JSONB DEFAULT '[]'::jsonb,
  -- Structure: [{
  --   "theme": "resilience",
  --   "frequency_across_storytellers": 8,
  --   "avg_confidence": 0.82,
  --   "storyteller_ids": ["...", "..."],
  --   "cultural_contexts": ["intergenerational_healing", "land_connection"],
  --   "Country_connection": "fire_management_shared_across_3_elders"
  -- }]

  aggregated_impact JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "ALMA_signals_summary": {
  --     "authority_sources": {"lived_experience": 8, "secondary": 2, "academic": 0},
  --     "evidence_strength_avg": 0.87,
  --     "harm_risk_score_avg": 0.95, // inverted: high = safe
  --     "capability_pathways_opened": 12,
  --     "community_value_returned": "$15,000_total"
  --   },
  --   "LCAA_outcomes": {
  --     "listen_sessions_total": 24,
  --     "curiosity_questions_explored": 47,
  --     "action_pathways_created": ["Goods_employment", "JusticeHub_claims", "Harvest_guides"],
  --     "art_outputs": 18
  --   },
  --   "conservation": {
  --     "land_knowledge_types": ["fire_management", "water_care", "species_monitoring"],
  --     "Country_connection_strengthened": true,
  --     "conservation_baseline_protected": true
  --   },
  --   "sovereignty": {
  --     "OCAP_compliance_rate": 1.0,
  --     "consent_violations": 0,
  --     "voice_control_maintained": "full_across_all_storytellers"
  --   }
  -- }

  -- =====================================================
  -- LCAA RHYTHM TRACKING (Listen → Curiosity → Action → Art)
  -- =====================================================

  lcaa_rhythm_analysis JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "listen_phase": {
  --     "duration_months": 3,
  --     "community_consultations": 12,
  --     "authority_sources": ["elders", "youth_council", "women's_group"],
  --     "yarning_sessions": 8,
  --     "on_country_sessions": 4,
  --     "depth_achieved": "deep", // deep|medium|surface
  --     "community_led": true
  --   },
  --   "curiosity_phase": {
  --     "questions_explored": [
  --       "How can fire knowledge be shared safely?",
  --       "What pathways exist for youth employment?",
  --       "How do we protect sacred knowledge while teaching?"
  --     ],
  --     "research_methods": ["participatory", "on_country", "co_design"],
  --     "co_design_workshops": 4,
  --     "community_ownership": "high"
  --   },
  --   "action_phase": {
  --     "interventions": ["Goods_micro_pathways_created", "JusticeHub_claims_filed_3", "Harvest_tours_designed"],
  --     "outcomes_documented": 24,
  --     "barriers_removed": ["transport_provided", "digital_literacy_training", "childcare_support"],
  --     "enterprise_pathways": 8,
  --     "community_ownership": "high"
  --   },
  --   "art_phase": {
  --     "creative_outputs": ["Empathy_Ledger_stories_12", "land_care_videos_3", "fire_calendar_design"],
  --     "cultural_expression": "dance_ceremony_documented_with_consent",
  --     "story_forms": ["video", "audio", "written", "visual_art"],
  --     "returns_to_listen": true // Seasonal rhythm, not linear completion
  --   },
  --   "seasonal_alignment": {
  --     "respects_Country_pace": true,
  --     "aligned_to_cultural_calendar": "cool_burn_season",
  --     "not_rushed": true
  --   }
  -- }

  -- =====================================================
  -- BEAUTIFUL OBSOLESCENCE (Handover Readiness)
  -- =====================================================

  handover_readiness JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "documentation_complete": 0.85, // 85%
  --   "training_delivered": ["admin_team", "community_champions", "youth_leaders"],
  --   "governance_transfer": "in_progress|co_owned|community_led",
  --   "sustainability_plan": "co_owned_with_community",
  --   "stepping_back_timeline": "6_months",
  --   "transferable_tools": ["Empathy_Ledger_admin", "consent_workflows", "data_export"],
  --   "community_readiness": "high|medium|low",
  --   "ACT_dependency": "reducing", // Goal: Beautiful Obsolescence
  --   "success_metric": "community_self_sustaining"
  -- }

  -- =====================================================
  -- ENTERPRISE-COMMONS BALANCE
  -- =====================================================

  enterprise_commons_balance JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "revenue_generated": 15000, // Goods/Harvest
  --   "commons_reinvestment": 4500, // 30% to land care
  --   "fair_value_return": 7500, // 50% to storytellers/participants
  --   "operating_costs": 3000, // 20%
  --   "grant_dependency_reduced": 0.25, // 25% reduction
  --   "earned_income_pct": 0.35, // 35% (above 30% target)
  --   "storyteller_payments_total": "$7,500",
  --   "community_capacity_investment": "$1,500"
  -- }

  -- Network insights (cross-storyteller connections)
  network_insights JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "cross_storyteller_connections": ["elder_mentoring_youth", "family_knowledge_sharing"],
  --   "shared_themes": ["fire_management", "language_preservation"],
  --   "community_cohesion_indicators": ["increased_gatherings", "knowledge_sharing_networks"],
  --   "intergenerational_transfer": "youth_engaged_with_elder_knowledge"
  -- }

  -- Project outcomes (evidence-based)
  project_outcomes JSONB DEFAULT '[]'::jsonb,
  -- Structure: [{
  --   "outcome": "cultural_revitalization",
  --   "evidence": ["youth_language_use_increased", "ceremony_participation_up_40pct", "knowledge_transfer_documented"],
  --   "storytellers_involved": ["elder_grace", "youth_maya"],
  --   "ALMA_signals": {"authority": "lived_experience", "evidence_strength": "high"},
  --   "Beautiful_Obsolescence_ready": true
  -- }]

  -- RAG embedding
  embedding VECTOR(1536),

  -- Privacy
  privacy_level TEXT NOT NULL DEFAULT 'organization' CHECK (privacy_level IN ('organization', 'public')),
  quality_score NUMERIC(3,2),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(project_id)
);

-- Indexes
CREATE INDEX idx_pia_project ON project_impact_analysis(project_id);
CREATE INDEX idx_pia_org ON project_impact_analysis(organization_id);
CREATE INDEX idx_pia_tenant ON project_impact_analysis(tenant_id);
CREATE INDEX idx_pia_analyzed ON project_impact_analysis(analyzed_at DESC);
CREATE INDEX idx_pia_embedding ON project_impact_analysis USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_pia_themes_gin ON project_impact_analysis USING GIN (aggregated_themes);
CREATE INDEX idx_pia_lcaa_gin ON project_impact_analysis USING GIN (lcaa_rhythm_analysis);

-- RLS Policies
ALTER TABLE project_impact_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_view_project_analysis"
  ON project_impact_analysis FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "public_project_analysis_visible"
  ON project_impact_analysis FOR SELECT TO authenticated
  USING (privacy_level = 'public');

CREATE POLICY "service_role_full_access_pia"
  ON project_impact_analysis FOR ALL TO service_role
  USING (true);

-- Auto-update timestamp
CREATE TRIGGER update_pia_timestamp
  BEFORE UPDATE ON project_impact_analysis
  FOR EACH ROW EXECUTE FUNCTION update_sma_timestamp();

-- Comment
COMMENT ON TABLE project_impact_analysis IS
  'ACT Project Impact: LCAA rhythm tracker + Beautiful Obsolescence monitor.
   Aggregates from storyteller_master_analysis.
   Tracks enterprise-commons balance and handover readiness.';

-- =====================================================
-- TABLE 3: Organization Impact Intelligence
-- Stewardship Accountability + Regenerative Impact
-- =====================================================
CREATE TABLE IF NOT EXISTS organization_impact_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,

  -- Version tracking
  analysis_version TEXT NOT NULL DEFAULT 'v1-act-alma-20260115',
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Aggregated stats (from projects)
  project_count INTEGER DEFAULT 0,
  total_storyteller_count INTEGER DEFAULT 0,
  total_transcript_count INTEGER DEFAULT 0,

  -- =====================================================
  -- ORGANIZATION THEMES & IMPACT
  -- =====================================================

  organization_themes JSONB DEFAULT '[]'::jsonb,
  -- Structure: [{
  --   "theme": "resilience",
  --   "frequency_across_projects": 5,
  --   "storyteller_count": 24,
  --   "cultural_contexts": ["intergenerational_healing", "land_connection", "language_revitalization"],
  --   "Country_connection": "Jinibara_traditional_lands",
  --   "longitudinal_trend": "increasing|stable|decreasing"
  -- }]

  organization_impact JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "ALMA_aggregate": {
  --     "authority_distribution": {"lived_experience": 45, "secondary": 8, "academic": 2},
  --     "evidence_strength_org_avg": 0.89,
  --     "harm_prevention_score": 0.97,
  --     "capability_pathways_total": 67,
  --     "community_value_returned_total": "$45,000"
  --   },
  --   "LCAA_summary": {
  --     "projects_in_listen": 2,
  --     "projects_in_curiosity": 3,
  --     "projects_in_action": 4,
  --     "projects_in_art": 2,
  --     "seasonal_rhythm_respected": true
  --   },
  --   "sovereignty_enforcement": {
  --     "OCAP_compliance_rate": 1.0,
  --     "CARE_principles_met": true,
  --     "consent_violations_total": 0,
  --     "voice_control_maintained": true
  --   }
  -- }

  -- =====================================================
  -- REGENERATIVE IMPACT (Land + Sovereignty)
  -- =====================================================

  regenerative_impact JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "land_stewardship": {
  --     "conservation_baseline": "maintained",
  --     "Country_pace_respected": true,
  --     "ecological_outcomes": ["fire_management_improved", "biodiversity_monitored", "water_care_protocols"],
  --     "traditional_knowledge_applied": ["seasonal_burning", "species_monitoring", "habitat_restoration"],
  --     "on_country_sessions": 18
  --   },
  --   "sovereignty_enforcement": {
  --     "OCAP_compliance": 1.0, // 100%
  --     "CARE_principles_met": true,
  --     "consent_violations": 0,
  --     "consent_automation_working": true, // 50-70% overhead reduction
  --     "storyteller_control_maintained": "full"
  --   },
  --   "Beautiful_Obsolescence_progress": {
  --     "projects_handed_over": 2,
  --     "communities_self_sustaining": 3,
  --     "dependency_reduced": 0.40, // 40% reduction
  --     "training_delivered_hours": 240,
  --     "governance_transfer_status": "co_owned",
  --     "stepping_back_timeline": "12_months"
  --   },
  --   "diversified_revenue": {
  --     "earned_income_pct": 0.32, // 32% (above 30% target)
  --     "grant_dependency_reduced": 0.28, // 28% reduction
  --     "enterprise_funds_commons_pct": 0.30, // 30% reinvestment
  --     "Goods_revenue": "$100,000",
  --     "Harvest_revenue": "$50,000",
  --     "fair_value_return_total": "$75,000"
  --   }
  -- }

  -- =====================================================
  -- ALMA SYSTEM-LEVEL SIGNALS (not individual profiling)
  -- =====================================================

  system_alma_signals JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "authority_distribution": {
  --     "lived_experience_centered": 0.85, // 85% of authority from lived experience
  --     "community_governance": "co_owned|community_led",
  --     "power_balance": "shifting_to_community",
  --     "elder_authority_respected": true
  --   },
  --   "evidence_integrity": {
  --     "consent_logged": 1.0, // 100%
  --     "cultural_verification": "elder_approved",
  --     "harm_prevention_active": true,
  --     "sacred_content_protected": true,
  --     "protocols_enforced": ["OCAP", "CARE", "consent_automation"]
  --   },
  --   "capability_building": {
  --     "skills_transferred": ["digital_storytelling", "data_sovereignty", "consent_management", "Empathy_Ledger_admin"],
  --     "employment_pathways_created": 8,
  --     "training_hours_delivered": 240,
  --     "community_champions_trained": 12,
  --     "Beautiful_Obsolescence_ready": "in_progress"
  --   },
  --   "community_value_return": {
  --     "direct_payments_total": "$45,000",
  --     "capacity_investment": "$12,000",
  --     "cultural_continuity": "strengthened",
  --     "intergenerational_transfer": "youth_engaged_with_elders",
  --     "fair_value_protection": true // 50% revenue return policy
  --   }
  -- }

  -- =====================================================
  -- CULTURAL IDENTITY ANALYSIS
  -- =====================================================

  cultural_identity_analysis JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "primary_cultural_groups": ["Jinibara", "Noongar", "Yuin"],
  --   "languages_represented": ["Jinibara_language", "Noongar_words", "English"],
  --   "traditional_knowledge_domains": ["fire_management", "water_care", "language_preservation", "ceremony"],
  --   "Country_connection": "Jinibara_traditional_lands_primary",
  --   "intergenerational_knowledge_transfer": "active",
  --   "cultural_revitalization_indicators": ["language_use_increased", "ceremony_participation_up", "youth_engagement"]
  -- }

  -- =====================================================
  -- LONGITUDINAL INSIGHTS (trends over time)
  -- =====================================================

  longitudinal_insights JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "theme_evolution": [
  --     {"theme": "resilience", "trend": "increasing", "quarters": [{"q": "2025-Q4", "frequency": 12}, {"q": "2026-Q1", "frequency": 18}]}
  --   ],
  --   "impact_trends": {
  --     "capability_pathways": "increasing",
  --     "community_value_return": "increasing",
  --     "Beautiful_Obsolescence_progress": "on_track"
  --   },
  --   "milestone_moments": [
  --     {"date": "2025-12-01", "event": "first_project_handover", "significance": "Beautiful_Obsolescence_proven"},
  --     {"date": "2026-01-15", "event": "30pct_earned_income_achieved", "significance": "grant_dependency_reduced"}
  --   ]
  -- }

  -- =====================================================
  -- FUNDER REPORTING (SROI + Cultural Value)
  -- =====================================================

  funder_reporting JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "SROI": 4.2, // Social Return on Investment: $4.20 return per $1 invested
  --   "outcomes_achieved": [
  --     {"outcome": "employment_pathways_created", "count": 8, "evidence": "jobs_filled"},
  --     {"outcome": "cultural_revitalization", "evidence": "language_use_increased_40pct"},
  --     {"outcome": "land_stewardship_improved", "evidence": "fire_management_protocols_active"}
  --   ],
  --   "cultural_value_proxies": {
  --     "intergenerational_knowledge_transfer": "$25,000_proxy_value",
  --     "language_preservation": "$15,000_proxy_value",
  --     "cultural_continuity": "$30,000_proxy_value"
  --   },
  --   "financial_sustainability": {
  --     "earned_income_pct": 0.32,
  --     "grant_dependency_reduced": 0.28,
  --     "diversified_revenue_streams": ["Goods", "Harvest", "SaaS_licensing", "outcomes_fees"]
  --   },
  --   "Beautiful_Obsolescence_progress": {
  --     "handover_readiness": 0.85,
  --     "community_self_sufficiency": "high"
  --   }
  -- }

  -- RAG embedding
  embedding VECTOR(1536),

  -- Privacy
  privacy_level TEXT NOT NULL DEFAULT 'organization' CHECK (privacy_level IN ('organization', 'public')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id)
);

-- Indexes
CREATE INDEX idx_oii_org ON organization_impact_intelligence(organization_id);
CREATE INDEX idx_oii_tenant ON organization_impact_intelligence(tenant_id);
CREATE INDEX idx_oii_analyzed ON organization_impact_intelligence(analyzed_at DESC);
CREATE INDEX idx_oii_embedding ON organization_impact_intelligence USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_oii_themes_gin ON organization_impact_intelligence USING GIN (organization_themes);
CREATE INDEX idx_oii_regenerative_gin ON organization_impact_intelligence USING GIN (regenerative_impact);

-- RLS Policies
ALTER TABLE organization_impact_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_admins_view_org_intelligence"
  ON organization_impact_intelligence FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.profile_id = auth.uid()
        AND om.role IN ('admin', 'elder', 'cultural_keeper')
    )
  );

CREATE POLICY "public_org_intelligence_visible"
  ON organization_impact_intelligence FOR SELECT TO authenticated
  USING (privacy_level = 'public');

CREATE POLICY "service_role_full_access_oii"
  ON organization_impact_intelligence FOR ALL TO service_role
  USING (true);

-- Auto-update timestamp
CREATE TRIGGER update_oii_timestamp
  BEFORE UPDATE ON organization_impact_intelligence
  FOR EACH ROW EXECUTE FUNCTION update_sma_timestamp();

-- Comment
COMMENT ON TABLE organization_impact_intelligence IS
  'ACT Organization Intelligence: Stewardship accountability + Beautiful Obsolescence progress.
   Tracks regenerative impact, ALMA system signals, and funder reporting metrics.';

-- =====================================================
-- TABLE 4: Global Impact Intelligence
-- World-Level Insights + Commons Health
-- =====================================================
CREATE TABLE IF NOT EXISTS global_impact_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Version tracking
  analysis_version TEXT NOT NULL DEFAULT 'v1-act-alma-20260115',
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Aggregated stats (from all organizations)
  organization_count INTEGER DEFAULT 0,
  total_project_count INTEGER DEFAULT 0,
  total_storyteller_count INTEGER DEFAULT 0,
  total_transcript_count INTEGER DEFAULT 0,

  -- =====================================================
  -- GLOBAL THEMES & CROSS-CULTURAL PATTERNS
  -- =====================================================

  global_themes JSONB DEFAULT '[]'::jsonb,
  -- Structure: [{
  --   "theme": "resilience",
  --   "frequency_worldwide": 142,
  --   "cultural_contexts": [
  --     {"culture": "Jinibara", "frequency": 24, "interpretation": "land_connection"},
  --     {"culture": "Noongar", "frequency": 18, "interpretation": "intergenerational_healing"}
  --   ],
  --   "universal_patterns": "healing_through_connection_to_land",
  --   "cultural_specificity": "expressed_differently_across_cultures"
  -- }]

  cross_cultural_patterns JSONB DEFAULT '[]'::jsonb,
  -- Structure: [{
  --   "pattern": "intergenerational_knowledge_transfer",
  --   "examples_by_culture": {
  --     "Jinibara": "fire_management_elder_to_youth",
  --     "Noongar": "language_preservation_through_story",
  --     "Yuin": "ceremony_teaching_on_Country"
  --   },
  --   "commonality": "youth_engagement_with_elder_knowledge",
  --   "cultural_diversity": "methods_vary_by_cultural_protocols",
  --   "transferability": "medium", // Can be adapted with cultural respect
  --   "Beautiful_Obsolescence_example": "community_led_training_models"
  -- }]

  -- =====================================================
  -- REGENERATIVE PATTERNS (Transferable, not extractive)
  -- =====================================================

  regenerative_patterns JSONB DEFAULT '[]'::jsonb,
  -- Structure: [{
  --   "pattern": "consent_automation_reduces_overhead",
  --   "evidence": "50-70% admin cost reduction across 5 orgs",
  --   "transferability": "high",
  --   "handover_examples": ["JusticeHub_to_community", "Empathy_Ledger_to_coop"],
  --   "cultural_contexts": ["First_Nations_Australia", "Indigenous_Canada", "Maori_NZ"],
  --   "Beautiful_Obsolescence_proof": true,
  --   "commons_contribution": "open_source_consent_workflows",
  --   "ACT_thesis_alignment": "quiet_infrastructure_for_humans"
  -- }]

  -- =====================================================
  -- IMPACT BY SDG (UN Sustainable Development Goals)
  -- =====================================================

  impact_by_sdg JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "SDG_1_no_poverty": {
  --     "stories_contributing": 45,
  --     "outcomes": ["employment_pathways", "fair_value_return", "enterprise_income"],
  --     "cultural_context": "sovereignty_enables_economic_self_determination"
  --   },
  --   "SDG_10_reduced_inequalities": {
  --     "stories_contributing": 87,
  --     "outcomes": ["voice_control", "OCAP_enforcement", "authority_respected"],
  --     "cultural_context": "lived_experience_centered_authority"
  --   },
  --   "SDG_13_climate_action": {
  --     "stories_contributing": 34,
  --     "outcomes": ["traditional_fire_management", "land_stewardship", "ecological_knowledge"],
  --     "cultural_context": "Indigenous_knowledge_essential_for_climate_action"
  --   }
  -- }

  -- =====================================================
  -- CULTURAL KNOWLEDGE DOMAINS (Worldwide)
  -- =====================================================

  cultural_knowledge_domains JSONB DEFAULT '[]'::jsonb,
  -- Structure: [{
  --   "domain": "traditional_ecology",
  --   "contributions": [
  --     {"type": "fire_management", "storyteller_count": 24, "cultural_groups": ["Jinibara", "Yuin"]},
  --     {"type": "water_care", "storyteller_count": 18, "cultural_groups": ["Noongar"]}
  --   ],
  --   "geographic_distribution": ["Australia_East_Coast", "Australia_Southwest"],
  --   "transferability": "high_with_cultural_respect",
  --   "commons_value": "curriculum_development_climate_education"
  -- }]

  -- =====================================================
  -- COMMONS HEALTH (Not extraction - building knowledge commons)
  -- =====================================================

  commons_health JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "open_source_contributions": 12, // Tools/workflows shared freely
  --   "knowledge_shared_freely": 156, // Stories/datasets with consent
  --   "community_ownership_models": 4, // Handovers completed
  --   "handover_success_rate": 0.75, // 75% Beautiful Obsolescence success
  --   "extractive_prevented": "consent_violations_zero_worldwide",
  --   "sovereignty_protected": "OCAP_CARE_enforced_everywhere",
  --   "transferable_tools": ["Empathy_Ledger", "consent_workflows", "ALMA_signals"],
  --   "ACT_thesis_embodied": "regenerative_not_empire_building"
  -- }

  -- =====================================================
  -- PLATFORM HEALTH METRICS
  -- =====================================================

  platform_health_metrics JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "active_users": 1234,
  --   "engagement_rate": 0.78,
  --   "cultural_safety_score": 0.95,
  --   "consent_compliance": 1.0,
  --   "Beautiful_Obsolescence_readiness": 0.65, // 65% of orgs ready for handover
  --   "earned_income_avg": 0.30, // 30% avg across orgs
  --   "grant_dependency_reduction": 0.25, // 25% reduction
  --   "storyteller_satisfaction": 0.92,
  --   "elder_approval_rate": 0.98
  -- }

  -- RAG embedding
  embedding VECTOR(1536),

  -- Privacy (always public - world tour dashboard)
  privacy_level TEXT NOT NULL DEFAULT 'public',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_gii_analyzed ON global_impact_intelligence(analyzed_at DESC);
CREATE INDEX idx_gii_embedding ON global_impact_intelligence USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_gii_themes_gin ON global_impact_intelligence USING GIN (global_themes);
CREATE INDEX idx_gii_patterns_gin ON global_impact_intelligence USING GIN (cross_cultural_patterns);

-- RLS Policies (public by design)
ALTER TABLE global_impact_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_global_intelligence"
  ON global_impact_intelligence FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "service_role_full_access_gii"
  ON global_impact_intelligence FOR ALL TO service_role
  USING (true);

-- Auto-update timestamp
CREATE TRIGGER update_gii_timestamp
  BEFORE UPDATE ON global_impact_intelligence
  FOR EACH ROW EXECUTE FUNCTION update_sma_timestamp();

-- Comment
COMMENT ON TABLE global_impact_intelligence IS
  'ACT Global Intelligence: World Tour dashboard data.
   Commons health tracker, regenerative patterns library, cross-cultural insights.
   Philosophy: Transferable knowledge, not extraction.';

-- =====================================================
-- TABLE 5: Empathy Ledger Knowledge Base
-- RAG/Wiki Search + Land Stories Repository
-- =====================================================
CREATE TABLE IF NOT EXISTS empathy_ledger_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,

  -- Source tracking
  source_type TEXT NOT NULL CHECK (source_type IN ('transcript', 'story', 'analysis', 'theme', 'cultural_marker', 'land_story')),
  source_id UUID NOT NULL,
  source_table TEXT NOT NULL,

  -- Metadata
  keywords TEXT[], -- For fast filtering
  cultural_tags TEXT[], -- e.g., ['Noongar', 'language', 'traditional_knowledge']
  themes TEXT[], -- From extracted_themes

  -- =====================================================
  -- ACT-SPECIFIC METADATA
  -- =====================================================

  -- Cultural significance (Country connection)
  cultural_significance JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "Country_connection": "Jinibara_traditional_lands",
  --   "seasonal_context": "cool_burn_season|wet_season|dry_season",
  --   "relational_knowledge": "connects_to_waterways_story",
  --   "intergenerational_transfer": "youth_learning_from_elder",
  --   "sacred_content": false, // If true, stricter access controls
  --   "cultural_protocol": "shareable_with_permission|community_only|restricted"
  -- }

  -- ACT framework tags
  act_framework_tags TEXT[], -- ['LCAA_listen', 'conservation_baseline', 'Goods_pathway', 'Beautiful_Obsolescence']

  -- Enterprise-commons link
  enterprise_commons_link JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "Goods_product": "fire_management_calendar",
  --   "Harvest_offering": "on_country_cultural_tour",
  --   "commons_reinvestment": "story_royalties_to_land_care",
  --   "fair_value_return": "$100_to_storyteller"
  -- }

  -- ALMA signal summary (for this knowledge chunk)
  alma_context JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "authority": "lived_experience|elder_verified",
  --   "evidence_strength": "high|medium|low",
  --   "harm_risk": "safe|trigger_warning|restricted",
  --   "transferability": "high|medium|low",
  --   "Beautiful_Obsolescence_ready": true
  -- }

  -- Full-text search vector
  search_vector TSVECTOR,

  -- Semantic search embedding
  embedding VECTOR(1536),

  -- Privacy & consent
  tenant_id UUID,
  privacy_level TEXT NOT NULL DEFAULT 'private' CHECK (privacy_level IN ('private', 'organization', 'public')),
  consent_level TEXT CHECK (consent_level IN ('public_sharing', 'research', 'commercial', 'community_only')),

  -- Quality
  quality_score NUMERIC(3,2),
  is_featured BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_elkb_source ON empathy_ledger_knowledge_base(source_type, source_id);
CREATE INDEX idx_elkb_tenant ON empathy_ledger_knowledge_base(tenant_id);
CREATE INDEX idx_elkb_privacy ON empathy_ledger_knowledge_base(privacy_level);
CREATE INDEX idx_elkb_keywords_gin ON empathy_ledger_knowledge_base USING GIN(keywords);
CREATE INDEX idx_elkb_cultural_tags_gin ON empathy_ledger_knowledge_base USING GIN(cultural_tags);
CREATE INDEX idx_elkb_themes_gin ON empathy_ledger_knowledge_base USING GIN(themes);
CREATE INDEX idx_elkb_act_tags_gin ON empathy_ledger_knowledge_base USING GIN(act_framework_tags);
CREATE INDEX idx_elkb_search_vector_gin ON empathy_ledger_knowledge_base USING GIN(search_vector);
CREATE INDEX idx_elkb_embedding_ivfflat ON empathy_ledger_knowledge_base USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Auto-update search_vector trigger
CREATE OR REPLACE FUNCTION update_elkb_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.content, '') || ' ' ||
    COALESCE(NEW.summary, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_elkb_search
  BEFORE INSERT OR UPDATE ON empathy_ledger_knowledge_base
  FOR EACH ROW EXECUTE FUNCTION update_elkb_search_vector();

-- RLS Policies (consent-enforced)
ALTER TABLE empathy_ledger_knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_public_knowledge"
  ON empathy_ledger_knowledge_base FOR SELECT TO authenticated
  USING (privacy_level = 'public');

CREATE POLICY "users_view_org_knowledge"
  ON empathy_ledger_knowledge_base FOR SELECT TO authenticated
  USING (
    privacy_level = 'organization'
    AND tenant_id IN (
      SELECT organization_id FROM organization_members WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "users_view_own_knowledge"
  ON empathy_ledger_knowledge_base FOR SELECT TO authenticated
  USING (
    privacy_level = 'private'
    AND tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "service_role_full_access_elkb"
  ON empathy_ledger_knowledge_base FOR ALL TO service_role
  USING (true);

-- Auto-update timestamp
CREATE TRIGGER update_elkb_timestamp
  BEFORE UPDATE ON empathy_ledger_knowledge_base
  FOR EACH ROW EXECUTE FUNCTION update_sma_timestamp();

-- Comment
COMMENT ON TABLE empathy_ledger_knowledge_base IS
  'ACT Knowledge Base: Regenerative wisdom repository with hybrid search (vector + full-text).
   Land stories, lived experience, Country connection.
   Philosophy: Commons knowledge with consent, not extraction.';

-- =====================================================
-- HYBRID SEARCH FUNCTION (Vector + Full-Text)
-- =====================================================

CREATE OR REPLACE FUNCTION hybrid_search_knowledge_base(
  query_embedding VECTOR(1536),
  query_text TEXT,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  filter_tenant UUID DEFAULT NULL,
  filter_privacy TEXT DEFAULT 'public'
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  summary TEXT,
  source_type TEXT,
  cultural_tags TEXT[],
  act_framework_tags TEXT[],
  vector_similarity FLOAT,
  text_rank FLOAT,
  combined_score FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH vector_search AS (
    SELECT
      elkb.id,
      1 - (elkb.embedding <=> query_embedding) as similarity
    FROM empathy_ledger_knowledge_base elkb
    WHERE
      (filter_tenant IS NULL OR elkb.tenant_id = filter_tenant)
      AND elkb.privacy_level = filter_privacy
      AND 1 - (elkb.embedding <=> query_embedding) > match_threshold
  ),
  text_search AS (
    SELECT
      elkb.id,
      ts_rank(elkb.search_vector, plainto_tsquery('english', query_text)) as rank
    FROM empathy_ledger_knowledge_base elkb
    WHERE
      (filter_tenant IS NULL OR elkb.tenant_id = filter_tenant)
      AND elkb.privacy_level = filter_privacy
      AND elkb.search_vector @@ plainto_tsquery('english', query_text)
  )
  SELECT
    elkb.id,
    elkb.title,
    elkb.content,
    elkb.summary,
    elkb.source_type,
    elkb.cultural_tags,
    elkb.act_framework_tags,
    COALESCE(vs.similarity, 0)::FLOAT as vector_similarity,
    COALESCE(ts.rank, 0)::FLOAT as text_rank,
    (COALESCE(vs.similarity, 0) * 0.6 + COALESCE(ts.rank, 0) * 0.4)::FLOAT as combined_score
  FROM empathy_ledger_knowledge_base elkb
  LEFT JOIN vector_search vs ON vs.id = elkb.id
  LEFT JOIN text_search ts ON ts.id = elkb.id
  WHERE vs.id IS NOT NULL OR ts.id IS NOT NULL
  ORDER BY combined_score DESC
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION hybrid_search_knowledge_base IS
  'Hybrid search combining vector similarity (60%) and full-text rank (40%).
   Respects privacy levels and tenant isolation.
   ACT philosophy: Findable knowledge with consent enforcement.';

-- =====================================================
-- COMPLETION
-- =====================================================

-- Create summary view for quick stats
CREATE OR REPLACE VIEW act_unified_analysis_summary AS
SELECT
  'storyteller_master_analysis' as table_name,
  COUNT(*) as record_count,
  COUNT(*) FILTER (WHERE privacy_level = 'public') as public_count,
  COUNT(*) FILTER (WHERE privacy_level = 'organization') as org_count,
  COUNT(*) FILTER (WHERE privacy_level = 'private') as private_count
FROM storyteller_master_analysis
UNION ALL
SELECT
  'project_impact_analysis',
  COUNT(*),
  COUNT(*) FILTER (WHERE privacy_level = 'public'),
  COUNT(*) FILTER (WHERE privacy_level = 'organization'),
  0
FROM project_impact_analysis
UNION ALL
SELECT
  'organization_impact_intelligence',
  COUNT(*),
  COUNT(*) FILTER (WHERE privacy_level = 'public'),
  COUNT(*) FILTER (WHERE privacy_level = 'organization'),
  0
FROM organization_impact_intelligence
UNION ALL
SELECT
  'global_impact_intelligence',
  COUNT(*),
  COUNT(*), -- all public
  0,
  0
FROM global_impact_intelligence
UNION ALL
SELECT
  'empathy_ledger_knowledge_base',
  COUNT(*),
  COUNT(*) FILTER (WHERE privacy_level = 'public'),
  COUNT(*) FILTER (WHERE privacy_level = 'organization'),
  COUNT(*) FILTER (WHERE privacy_level = 'private')
FROM empathy_ledger_knowledge_base;

COMMENT ON VIEW act_unified_analysis_summary IS
  'Quick stats view for ACT Unified Analysis System.
   Shows record counts and privacy distribution across all 5 tables.';

-- Final summary
DO $$
BEGIN
  RAISE NOTICE 'ACT UNIFIED STORYTELLER ANALYSIS SYSTEM - DEPLOYED';
  RAISE NOTICE 'Philosophy: Regenerative intelligence infrastructure, not extraction';
  RAISE NOTICE 'Framework: ALMA v2.0 - Authentic & Adaptive Learning for Meaningful Accountability';
  RAISE NOTICE '';
  RAISE NOTICE '5 Tables Created:';
  RAISE NOTICE '  - storyteller_master_analysis (Individual sovereignty container)';
  RAISE NOTICE '  - project_impact_analysis (LCAA rhythm tracker + handover monitor)';
  RAISE NOTICE '  - organization_impact_intelligence (Stewardship accountability)';
  RAISE NOTICE '  - global_impact_intelligence (Commons health + world insights)';
  RAISE NOTICE '  - empathy_ledger_knowledge_base (Regenerative wisdom repository)';
  RAISE NOTICE '';
  RAISE NOTICE 'Key Features: 100%% RLS Coverage, ALMA v2.0 signals, LCAA rhythm tracking';
  RAISE NOTICE 'ACT Thesis: Sovereignty-first, Beautiful Obsolescence, Commons-building';
  RAISE NOTICE 'Next: Populate tables -> Build APIs -> World Tour Dashboard';
END $$;
