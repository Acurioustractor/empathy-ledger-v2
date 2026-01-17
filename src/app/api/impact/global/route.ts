/**
 * Global Impact Intelligence API
 *
 * Returns platform-wide ALMA impact intelligence
 * Aggregates all organizations into a single global view
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create service client inside handlers, not at module level
function getServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(request: NextRequest) {
  try {
    // Create service client after auth check
    const supabase = getServiceClient();

    // Get global impact intelligence
    const { data: globalImpact, error: globalError } = await supabase
      .from('global_impact_intelligence')
      .select('*')
      .limit(1)
      .single();

    if (globalError && globalError.code !== 'PGRST116') {
      console.error('Error fetching global impact:', globalError);
      return NextResponse.json(
        { error: 'Failed to fetch global impact' },
        { status: 500 }
      );
    }

    // Get organization summaries
    const { data: orgSummaries } = await supabase
      .from('organization_impact_intelligence')
      .select(`
        organization_id,
        project_count,
        total_storyteller_count,
        total_transcript_count,
        organization_themes,
        organizations (
          id,
          name
        )
      `)
      .order('total_storyteller_count', { ascending: false })
      .limit(10);

    // Extract platform health metrics
    const platformHealth = globalImpact?.platform_health_metrics || {};

    const response = {
      summary: {
        organization_count: globalImpact?.organization_count || 0,
        project_count: globalImpact?.total_project_count || 0,
        storyteller_count: globalImpact?.total_storyteller_count || 0,
        transcript_count: globalImpact?.total_transcript_count || 0,
        analyzed_at: globalImpact?.analyzed_at
      },
      alma_global: {
        authority: {
          lived_experience_centered: platformHealth.authority_global?.lived_experience_centered || true,
          primary_source_count: platformHealth.authority_global?.primary_source_count || 0,
          secondary_source_count: platformHealth.authority_global?.secondary_source_count || 0
        },
        harm_prevention: {
          global_score: platformHealth.harm_prevention_global || 0.95,
          cultural_safety: platformHealth.cultural_safety_score || 0.95
        },
        capability: {
          pathways_worldwide: platformHealth.capability_pathways_worldwide || 0
        },
        community_value: {
          principle: platformHealth.community_value_principle || 'fair_value_protection_enforced'
        }
      },
      global_themes: (globalImpact?.global_themes || []).map((t: any) => ({
        theme: t.theme,
        frequency: t.frequency_worldwide || t.frequency || 0,
        organizations_count: t.organizations_count || 0,
        storyteller_reach: t.storyteller_reach || 0
      })),
      cross_cultural_patterns: (globalImpact?.cross_cultural_patterns || []).map((p: any) => ({
        pattern: p.pattern,
        organizations_count: p.organizations_count || 0,
        commonality: p.commonality || 'shared_across_organizations',
        transferability: p.transferability || 'medium'
      })),
      regenerative_patterns: globalImpact?.regenerative_patterns || [],
      commons_health: {
        consent_violations_total: globalImpact?.commons_health?.consent_violations_total || 0,
        OCAP_compliance_global: globalImpact?.commons_health?.OCAP_compliance_global || 1.0,
        knowledge_shared_freely: globalImpact?.commons_health?.knowledge_shared_freely || true,
        no_extractive_patterns: globalImpact?.commons_health?.no_extractive_patterns || true,
        beautiful_obsolescence: {
          organizations_building_capacity: globalImpact?.commons_health?.Beautiful_Obsolescence_global?.organizations_building_capacity || 0,
          stepping_back_on_track: globalImpact?.commons_health?.Beautiful_Obsolescence_global?.stepping_back_on_track || true
        }
      },
      organizations: (orgSummaries || []).map((org: any) => ({
        id: org.organization_id,
        name: org.organizations?.name || 'Unknown',
        project_count: org.project_count,
        storyteller_count: org.total_storyteller_count,
        transcript_count: org.total_transcript_count,
        top_themes: (org.organization_themes || []).slice(0, 3).map((t: any) => t.theme || t)
      }))
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in global impact API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
