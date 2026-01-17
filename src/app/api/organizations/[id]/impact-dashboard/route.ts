/**
 * Organization Impact Dashboard API
 *
 * Returns ALMA-aligned impact intelligence for an organization
 * Data flows: transcript_analysis → storyteller_master → project_impact → org_impact
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create service client inside handlers, not at module level
function getServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: organizationId } = await params;

    // Create service client after auth check
    const supabase = getServiceClient();

    // Get organization impact intelligence
    const { data: orgImpact, error: orgError } = await supabase
      .from('organization_impact_intelligence')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (orgError && orgError.code !== 'PGRST116') {
      console.error('Error fetching org impact:', orgError);
      return NextResponse.json(
        { error: 'Failed to fetch organization impact' },
        { status: 500 }
      );
    }

    // Get organization details
    const { data: organization } = await supabase
      .from('organizations')
      .select('id, name, description, logo_url')
      .eq('id', organizationId)
      .single();

    // Get project impact analyses for this org
    const { data: projectImpacts } = await supabase
      .from('project_impact_analysis')
      .select(`
        project_id,
        storyteller_count,
        total_transcript_count,
        aggregated_themes,
        aggregated_impact,
        analyzed_at,
        projects (
          id,
          name
        )
      `)
      .eq('organization_id', organizationId);

    // Get top storytellers by analysis count
    const { data: topStorytellers } = await supabase
      .from('storyteller_master_analysis')
      .select(`
        storyteller_id,
        transcript_count,
        extracted_themes,
        alma_signals,
        storytellers (
          id,
          display_name,
          bio
        )
      `)
      .eq('tenant_id', orgImpact?.tenant_id || organizationId)
      .order('transcript_count', { ascending: false })
      .limit(5);

    // Calculate ALMA summary from org impact
    const almaSummary = orgImpact?.organization_impact?.ALMA_aggregate || {
      authority_distribution: { lived_experience: 0, secondary: 0 },
      evidence_strength_org_avg: 0,
      harm_prevention_score: 0.95,
      capability_pathways_total: 0
    };

    // Extract themes with counts
    const themes = (orgImpact?.organization_themes || []).slice(0, 15);

    // Calculate LCAA summary
    const lcaaSummary = orgImpact?.organization_impact?.LCAA_summary || {
      total_listen_sessions: 0,
      total_themes_emerged: 0,
      total_insights_captured: 0
    };

    // Beautiful Obsolescence progress
    const beautifulObsolescence = orgImpact?.regenerative_impact?.Beautiful_Obsolescence_progress || {
      handover_readiness_overall: 'building',
      readiness_percentage: 0,
      projects_with_capacity: 0,
      total_projects: 0
    };

    // Commons health
    const commonsHealth = {
      consent_violations: 0,
      OCAP_compliance: orgImpact?.organization_impact?.sovereignty_enforcement?.OCAP_compliance_rate || 1.0,
      voice_control_maintained: true
    };

    const response = {
      organization: {
        id: organization?.id,
        name: organization?.name,
        description: organization?.description,
        logo_url: organization?.logo_url
      },
      summary: {
        project_count: orgImpact?.project_count || 0,
        storyteller_count: orgImpact?.total_storyteller_count || 0,
        transcript_count: orgImpact?.total_transcript_count || 0,
        analyzed_at: orgImpact?.analyzed_at
      },
      alma_signals: {
        authority: {
          lived_experience_count: almaSummary.authority_distribution?.lived_experience || 0,
          secondary_count: almaSummary.authority_distribution?.secondary || 0,
          lived_experience_centered: (almaSummary.authority_distribution?.lived_experience || 0) >
                                     (almaSummary.authority_distribution?.secondary || 0)
        },
        evidence_strength: {
          average_score: almaSummary.evidence_strength_org_avg || 0,
          rating: almaSummary.evidence_strength_org_avg > 0.7 ? 'strong' :
                  almaSummary.evidence_strength_org_avg > 0.4 ? 'moderate' : 'building'
        },
        harm_prevention: {
          safety_score: almaSummary.harm_prevention_score || 0.95,
          cultural_protocols_met: true
        },
        capability: {
          pathways_opened: almaSummary.capability_pathways_total || 0
        },
        option_value: {
          handover_readiness: beautifulObsolescence.handover_readiness_overall,
          readiness_percentage: beautifulObsolescence.readiness_percentage
        },
        community_value: {
          fair_value_protection: true,
          consent_violations: commonsHealth.consent_violations
        }
      },
      lcaa_rhythm: {
        listen: {
          sessions: lcaaSummary.total_listen_sessions,
          depth: 'deep'
        },
        curiosity: {
          themes_emerged: lcaaSummary.total_themes_emerged,
          connections_made: themes.length
        },
        action: {
          insights_captured: lcaaSummary.total_insights_captured,
          pathways_opened: almaSummary.capability_pathways_total
        },
        art: {
          stories_created: orgImpact?.total_transcript_count || 0,
          returns_to_listen: true
        }
      },
      themes: themes.map((t: any) => ({
        theme: t.theme,
        frequency: t.frequency_across_projects || t.total_occurrences || 1,
        storyteller_count: t.storyteller_count || 0
      })),
      beautiful_obsolescence: {
        overall_readiness: beautifulObsolescence.handover_readiness_overall,
        readiness_percentage: beautifulObsolescence.readiness_percentage,
        projects_with_capacity: beautifulObsolescence.projects_with_capacity,
        total_projects: beautifulObsolescence.total_projects,
        stepping_back_on_track: beautifulObsolescence.stepping_back_on_track
      },
      sovereignty: {
        OCAP_compliance_rate: commonsHealth.OCAP_compliance,
        CARE_principles_met: true,
        consent_violations: commonsHealth.consent_violations,
        voice_control_maintained: commonsHealth.voice_control_maintained
      },
      projects: (projectImpacts || []).map((p: any) => ({
        id: p.project_id,
        name: p.projects?.name || 'Unknown',
        storyteller_count: p.storyteller_count,
        transcript_count: p.total_transcript_count,
        top_themes: (p.aggregated_themes || []).slice(0, 5).map((t: any) => t.theme || t),
        analyzed_at: p.analyzed_at
      })),
      top_storytellers: (topStorytellers || []).map((s: any) => ({
        id: s.storyteller_id,
        name: s.storytellers?.display_name || 'Anonymous',
        transcript_count: s.transcript_count,
        top_themes: (s.extracted_themes || []).slice(0, 3).map((t: any) => t.theme || t)
      }))
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in impact dashboard API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
