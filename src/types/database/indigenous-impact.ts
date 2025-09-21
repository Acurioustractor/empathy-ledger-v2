import { Json } from './base'

// DATABASE SCHEMA FOR INDIGENOUS COMMUNITY IMPACT INSIGHTS
// Built from analysis of real community stories in your system

export interface IndigenousImpactTables {

  // COMMUNITY IMPACT INSIGHTS - Individual story moments of transformation
  community_impact_insights: {
    Row: {
      id: string
      transcript_id: string
      storyteller_id: string
      organization_id: string | null
      project_id: string | null
      tenant_id: string

      // INDIGENOUS SUCCESS INDICATOR TYPE
      impact_type: 'cultural_protocol' | 'community_leadership' | 'knowledge_transmission' |
                   'healing_integration' | 'relationship_building' | 'system_navigation' |
                   'collective_mobilization' | 'intergenerational_connection'

      // EVIDENCE FROM COMMUNITY VOICE
      quote_text: string                    // Exact words from community member
      context_text: string                  // Surrounding context
      speaker_role: string | null           // Elder, community leader, etc.
      confidence_score: number              // AI confidence (0-1)

      // INDIGENOUS IMPACT DIMENSIONS (community-defined success)
      relationship_strengthening: number    // Building trust, connections
      cultural_continuity: number          // Traditions being maintained/revitalized
      community_empowerment: number        // Collective power and self-determination
      system_transformation: number        // Changing institutions to be more responsive
      healing_progression: number          // Individual and collective healing
      knowledge_preservation: number       // Traditional knowledge being passed on

      // COMMUNITY SOVEREIGNTY MARKERS
      community_led_decision_making: boolean  // Community making their own choices
      cultural_protocols_respected: boolean   // Traditional ways being honoured
      external_systems_responding: boolean    // Institutions changing to meet community needs
      resource_control_increasing: boolean    // Community gaining control over resources

      // TRANSFORMATION EVIDENCE
      transformation_evidence: string[]       // Specific examples of change happening

      // CULTURAL SAFETY & CONSENT
      cultural_sensitivity_level: 'standard' | 'medium' | 'high' | 'restricted'
      elder_review_required: boolean
      elder_reviewed_by: string | null
      elder_reviewed_at: string | null
      community_consent_verified: boolean

      // METADATA
      ai_model_version: string | null
      extraction_metadata: Json | null
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      transcript_id: string
      storyteller_id: string
      organization_id?: string | null
      project_id?: string | null
      tenant_id: string
      impact_type: 'cultural_protocol' | 'community_leadership' | 'knowledge_transmission' |
                   'healing_integration' | 'relationship_building' | 'system_navigation' |
                   'collective_mobilization' | 'intergenerational_connection'
      quote_text: string
      context_text: string
      speaker_role?: string | null
      confidence_score: number
      relationship_strengthening: number
      cultural_continuity: number
      community_empowerment: number
      system_transformation: number
      healing_progression: number
      knowledge_preservation: number
      community_led_decision_making: boolean
      cultural_protocols_respected: boolean
      external_systems_responding: boolean
      resource_control_increasing: boolean
      transformation_evidence: string[]
      cultural_sensitivity_level?: 'standard' | 'medium' | 'high' | 'restricted'
      elder_review_required?: boolean
      elder_reviewed_by?: string | null
      elder_reviewed_at?: string | null
      community_consent_verified?: boolean
      ai_model_version?: string | null
      extraction_metadata?: Json | null
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      transcript_id?: string
      storyteller_id?: string
      organization_id?: string | null
      project_id?: string | null
      tenant_id?: string
      impact_type?: 'cultural_protocol' | 'community_leadership' | 'knowledge_transmission' |
                    'healing_integration' | 'relationship_building' | 'system_navigation' |
                    'collective_mobilization' | 'intergenerational_connection'
      quote_text?: string
      context_text?: string
      speaker_role?: string | null
      confidence_score?: number
      relationship_strengthening?: number
      cultural_continuity?: number
      community_empowerment?: number
      system_transformation?: number
      healing_progression?: number
      knowledge_preservation?: number
      community_led_decision_making?: boolean
      cultural_protocols_respected?: boolean
      external_systems_responding?: boolean
      resource_control_increasing?: boolean
      transformation_evidence?: string[]
      cultural_sensitivity_level?: 'standard' | 'medium' | 'high' | 'restricted'
      elder_review_required?: boolean
      elder_reviewed_by?: string | null
      elder_reviewed_at?: string | null
      community_consent_verified?: boolean
      ai_model_version?: string | null
      extraction_metadata?: Json | null
      created_at?: string
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: "community_impact_insights_transcript_id_fkey"
        columns: ["transcript_id"]
        isOneToOne: false
        referencedRelation: "transcripts"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "community_impact_insights_storyteller_id_fkey"
        columns: ["storyteller_id"]
        isOneToOne: false
        referencedRelation: "profiles"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "community_impact_insights_organization_id_fkey"
        columns: ["organization_id"]
        isOneToOne: false
        referencedRelation: "organisations"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "community_impact_insights_tenant_id_fkey"
        columns: ["tenant_id"]
        isOneToOne: false
        referencedRelation: "tenants"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "community_impact_insights_elder_reviewed_by_fkey"
        columns: ["elder_reviewed_by"]
        isOneToOne: false
        referencedRelation: "profiles"
        referencedColumns: ["id"]
      }
    ]
  }

  // COMMUNITY IMPACT METRICS - Aggregated community-level insights
  community_impact_metrics: {
    Row: {
      id: string
      organization_id: string
      tenant_id: string
      reporting_period_start: string
      reporting_period_end: string
      reporting_period_type: 'monthly' | 'quarterly' | 'annual' | 'custom'

      // AGGREGATED IMPACT COUNTS
      total_insights: number
      cultural_protocol_insights: number
      community_leadership_insights: number
      knowledge_transmission_insights: number
      healing_integration_insights: number
      relationship_building_insights: number
      system_navigation_insights: number
      collective_mobilization_insights: number
      intergenerational_connection_insights: number

      // SOVEREIGNTY PROGRESS INDICATORS
      community_led_decisions_count: number
      cultural_protocols_respected_count: number
      external_systems_responding_count: number
      resource_control_increasing_count: number

      // STRONGEST IMPACT DIMENSIONS (community-defined success areas)
      top_impact_area_1: string
      top_impact_area_1_score: number
      top_impact_area_2: string
      top_impact_area_2_score: number
      top_impact_area_3: string
      top_impact_area_3_score: number

      // AVERAGE IMPACT DIMENSION SCORES
      avg_relationship_strengthening: number
      avg_cultural_continuity: number
      avg_community_empowerment: number
      avg_system_transformation: number
      avg_healing_progression: number
      avg_knowledge_preservation: number

      // COMMUNITY VOICE INDICATORS
      unique_storytellers_count: number
      elder_voices_count: number
      youth_voices_count: number
      total_stories_analyzed: number

      // QUALITY INDICATORS
      avg_confidence_score: number
      elder_reviewed_insights_count: number
      high_confidence_insights_count: number

      // METADATA
      generated_at: string
      last_updated_at: string
      generation_method: 'automated' | 'manual' | 'hybrid'
      ai_model_version: string | null

      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      organization_id: string
      tenant_id: string
      reporting_period_start: string
      reporting_period_end: string
      reporting_period_type: 'monthly' | 'quarterly' | 'annual' | 'custom'
      total_insights: number
      cultural_protocol_insights: number
      community_leadership_insights: number
      knowledge_transmission_insights: number
      healing_integration_insights: number
      relationship_building_insights: number
      system_navigation_insights: number
      collective_mobilization_insights: number
      intergenerational_connection_insights: number
      community_led_decisions_count: number
      cultural_protocols_respected_count: number
      external_systems_responding_count: number
      resource_control_increasing_count: number
      top_impact_area_1: string
      top_impact_area_1_score: number
      top_impact_area_2: string
      top_impact_area_2_score: number
      top_impact_area_3: string
      top_impact_area_3_score: number
      avg_relationship_strengthening: number
      avg_cultural_continuity: number
      avg_community_empowerment: number
      avg_system_transformation: number
      avg_healing_progression: number
      avg_knowledge_preservation: number
      unique_storytellers_count: number
      elder_voices_count: number
      youth_voices_count: number
      total_stories_analyzed: number
      avg_confidence_score: number
      elder_reviewed_insights_count: number
      high_confidence_insights_count: number
      generated_at: string
      last_updated_at: string
      generation_method: 'automated' | 'manual' | 'hybrid'
      ai_model_version?: string | null
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      organization_id?: string
      tenant_id?: string
      reporting_period_start?: string
      reporting_period_end?: string
      reporting_period_type?: 'monthly' | 'quarterly' | 'annual' | 'custom'
      total_insights?: number
      cultural_protocol_insights?: number
      community_leadership_insights?: number
      knowledge_transmission_insights?: number
      healing_integration_insights?: number
      relationship_building_insights?: number
      system_navigation_insights?: number
      collective_mobilization_insights?: number
      intergenerational_connection_insights?: number
      community_led_decisions_count?: number
      cultural_protocols_respected_count?: number
      external_systems_responding_count?: number
      resource_control_increasing_count?: number
      top_impact_area_1?: string
      top_impact_area_1_score?: number
      top_impact_area_2?: string
      top_impact_area_2_score?: number
      top_impact_area_3?: string
      top_impact_area_3_score?: number
      avg_relationship_strengthening?: number
      avg_cultural_continuity?: number
      avg_community_empowerment?: number
      avg_system_transformation?: number
      avg_healing_progression?: number
      avg_knowledge_preservation?: number
      unique_storytellers_count?: number
      elder_voices_count?: number
      youth_voices_count?: number
      total_stories_analyzed?: number
      avg_confidence_score?: number
      elder_reviewed_insights_count?: number
      high_confidence_insights_count?: number
      generated_at?: string
      last_updated_at?: string
      generation_method?: 'automated' | 'manual' | 'hybrid'
      ai_model_version?: string | null
      created_at?: string
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: "community_impact_metrics_organization_id_fkey"
        columns: ["organization_id"]
        isOneToOne: false
        referencedRelation: "organisations"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "community_impact_metrics_tenant_id_fkey"
        columns: ["tenant_id"]
        isOneToOne: false
        referencedRelation: "tenants"
        referencedColumns: ["id"]
      }
    ]
  }

  // LIVE COMMUNITY NARRATIVES - Auto-generated impact stories
  live_community_narratives: {
    Row: {
      id: string
      organization_id: string
      tenant_id: string
      narrative_type: 'impact_summary' | 'community_voices' | 'strength_showcase' |
                      'transformation_story' | 'annual_report_section'

      // GENERATED CONTENT
      title: string
      narrative_content: string           // Auto-generated community story
      featured_quotes: Json               // Key community voices
      impact_highlights: Json             // Major transformation moments

      // COMMUNITY VOICE DATA
      storyteller_count: number
      elder_voices_included: number
      youth_voices_included: number
      insights_synthesized: number

      // NARRATIVE METADATA
      confidence_score: number           // Overall narrative confidence
      cultural_sensitivity_level: 'standard' | 'medium' | 'high' | 'restricted'
      community_reviewed: boolean
      elder_approved: boolean
      community_consent_verified: boolean

      // SHARING CONTROLS
      visibility: 'community_only' | 'trusted_allies' | 'public' | 'funders_only'
      sharing_permissions: Json

      // GENERATION DETAILS
      ai_model_version: string | null
      generation_prompt: string | null
      source_insights_count: number
      generation_metadata: Json | null

      // AUTO-UPDATE SETTINGS
      auto_update_enabled: boolean
      last_auto_update: string | null
      update_frequency: 'daily' | 'weekly' | 'monthly' | 'manual'

      created_at: string
      updated_at: string
      generated_at: string
    }
    Insert: {
      id?: string
      organization_id: string
      tenant_id: string
      narrative_type: 'impact_summary' | 'community_voices' | 'strength_showcase' |
                      'transformation_story' | 'annual_report_section'
      title: string
      narrative_content: string
      featured_quotes: Json
      impact_highlights: Json
      storyteller_count: number
      elder_voices_included: number
      youth_voices_included: number
      insights_synthesized: number
      confidence_score: number
      cultural_sensitivity_level: 'standard' | 'medium' | 'high' | 'restricted'
      community_reviewed?: boolean
      elder_approved?: boolean
      community_consent_verified?: boolean
      visibility: 'community_only' | 'trusted_allies' | 'public' | 'funders_only'
      sharing_permissions: Json
      ai_model_version?: string | null
      generation_prompt?: string | null
      source_insights_count: number
      generation_metadata?: Json | null
      auto_update_enabled?: boolean
      last_auto_update?: string | null
      update_frequency?: 'daily' | 'weekly' | 'monthly' | 'manual'
      created_at?: string
      updated_at?: string
      generated_at?: string
    }
    Update: {
      id?: string
      organization_id?: string
      tenant_id?: string
      narrative_type?: 'impact_summary' | 'community_voices' | 'strength_showcase' |
                       'transformation_story' | 'annual_report_section'
      title?: string
      narrative_content?: string
      featured_quotes?: Json
      impact_highlights?: Json
      storyteller_count?: number
      elder_voices_included?: number
      youth_voices_included?: number
      insights_synthesized?: number
      confidence_score?: number
      cultural_sensitivity_level?: 'standard' | 'medium' | 'high' | 'restricted'
      community_reviewed?: boolean
      elder_approved?: boolean
      community_consent_verified?: boolean
      visibility?: 'community_only' | 'trusted_allies' | 'public' | 'funders_only'
      sharing_permissions?: Json
      ai_model_version?: string | null
      generation_prompt?: string | null
      source_insights_count?: number
      generation_metadata?: Json | null
      auto_update_enabled?: boolean
      last_auto_update?: string | null
      update_frequency?: 'daily' | 'weekly' | 'monthly' | 'manual'
      created_at?: string
      updated_at?: string
      generated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: "live_community_narratives_organization_id_fkey"
        columns: ["organization_id"]
        isOneToOne: false
        referencedRelation: "organisations"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "live_community_narratives_tenant_id_fkey"
        columns: ["tenant_id"]
        isOneToOne: false
        referencedRelation: "tenants"
        referencedColumns: ["id"]
      }
    ]
  }
}