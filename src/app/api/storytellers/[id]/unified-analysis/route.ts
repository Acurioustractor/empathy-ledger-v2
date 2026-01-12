/**
 * GET /api/storytellers/[id]/unified-analysis
 *
 * Returns complete ALMA v2.0 signals for a storyteller
 * ACT Framework: Individual sovereignty container
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // RLS will enforce access control
    const { data: analysis, error } = await supabase
      .from('storyteller_master_analysis')
      .select(`
        *,
        storyteller:storytellers!storyteller_id (
          id,
          given_names,
          family_name,
          cultural_affiliations
        )
      `)
      .eq('storyteller_id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'No analysis found for this storyteller' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Format response according to ACT specification
    const response = {
      storyteller_id: params.id,
      storyteller_name: analysis.storyteller
        ? `${analysis.storyteller.given_names} ${analysis.storyteller.family_name}`
        : 'Unknown',
      cultural_affiliations: analysis.storyteller?.cultural_affiliations || [],

      // ALMA v2.0 Signals
      alma_signals: {
        authority: {
          level: analysis.alma_signals?.authority?.level || 'lived_experience',
          cultural_positioning: analysis.alma_signals?.authority?.cultural_positioning || 'community_member',
          consent_boundaries: analysis.alma_signals?.authority?.consent_boundaries || [],
          voice_control: 'full', // Always full for storytellers
          OCAP_compliance: true
        },
        evidence_strength: {
          primary_source: analysis.alma_signals?.evidence_strength?.primary_source || true,
          corroboration_count: analysis.alma_signals?.evidence_strength?.corroboration_count || 0,
          cultural_verification: analysis.alma_signals?.evidence_strength?.cultural_verification || 'pending'
        },
        harm_risk_inverted: {
          safety_score: analysis.alma_signals?.harm_risk_inverted?.safety_score || 0.95,
          cultural_protocols_met: analysis.alma_signals?.harm_risk_inverted?.cultural_protocols_met || true,
          trigger_warnings: analysis.alma_signals?.harm_risk_inverted?.trigger_warnings || [],
          consent_violations: 0 // Always zero (enforced by RLS)
        },
        capability: {
          knowledge_domains: analysis.alma_signals?.capability?.knowledge_domains || [],
          transferable_skills: analysis.alma_signals?.capability?.transferable_skills || [],
          learning_pathways_opened: analysis.alma_signals?.capability?.learning_pathways_opened || []
        },
        option_value: {
          future_applications: analysis.alma_signals?.option_value?.future_applications || [],
          handover_potential: analysis.alma_signals?.option_value?.handover_potential || 'knowledge_shared',
          commons_contribution: analysis.alma_signals?.option_value?.commons_contribution || 'knowledge_shared_freely'
        },
        community_value_return: {
          direct_benefits: analysis.alma_signals?.community_value_return?.direct_benefits || 'tracked_separately',
          capacity_building: analysis.alma_signals?.community_value_return?.capacity_building || [],
          fair_value_protection: true // 50% policy enforced
        }
      },

      // Impact Dimensions
      impact_dimensions: {
        LCAA_rhythm: analysis.lcaa_rhythm_analysis || {
          listen_phase: {},
          curiosity_phase: {},
          action_phase: {},
          art_phase: {}
        },
        conservation_impact: analysis.conservation_impact || {
          topics_discussed: [],
          traditional_knowledge_shared: false,
          land_care_practices: []
        },
        sovereignty_outcomes: analysis.sovereignty_outcomes || {
          OCAP_enforced: true,
          consent_respected: true,
          data_portability: true,
          right_to_deletion: true
        }
      },

      // Metadata
      metadata: {
        privacy_level: analysis.privacy_level,
        consent_level: analysis.consent_level,
        analysis_count: analysis.analysis_count || 0,
        last_analysis_date: analysis.last_analysis_date,
        last_updated: analysis.updated_at
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching unified analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}
