/**
 * GET /api/projects/[id]/impact-analysis
 *
 * Returns LCAA rhythm outcomes + Beautiful Obsolescence tracking
 * ACT Framework: Project-level accountability
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
      .from('project_impact_analysis')
      .select(`
        *,
        project:projects!project_id (
          id,
          name,
          description,
          created_at
        )
      `)
      .eq('project_id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'No analysis found for this project' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Calculate project age for context
    const projectAgeMonths = Math.floor(
      (Date.now() - new Date(analysis.project.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    // Format response
    const response = {
      project_id: params.id,
      project_name: analysis.project.name,
      project_description: analysis.project.description,
      project_age_months: projectAgeMonths,

      // LCAA Rhythm Outcomes
      lcaa_outcomes: {
        listen_phase: {
          depth_achieved: analysis.lcaa_rhythm_analysis?.listen_phase?.depth_achieved || 'conversational',
          total_participants: analysis.lcaa_rhythm_analysis?.listen_phase?.total_participants || 0,
          total_insights: analysis.lcaa_rhythm_analysis?.listen_phase?.total_insights || 0,
          total_duration_hours: Math.round((analysis.lcaa_rhythm_analysis?.listen_phase?.total_duration_minutes || 0) / 60)
        },
        curiosity_phase: {
          questions_explored: analysis.lcaa_rhythm_analysis?.curiosity_phase?.questions_explored || [],
          connections_made: analysis.lcaa_rhythm_analysis?.curiosity_phase?.connections_made || 0,
          themes_emerged: analysis.lcaa_rhythm_analysis?.curiosity_phase?.themes_emerged || 0
        },
        action_phase: {
          pathways_opened: analysis.lcaa_rhythm_analysis?.action_phase?.pathways_opened || [],
          barriers_identified: analysis.lcaa_rhythm_analysis?.action_phase?.barriers_identified || [],
          barriers_removed: analysis.lcaa_rhythm_analysis?.action_phase?.barriers_removed || []
        },
        art_phase: {
          stories_created: analysis.lcaa_rhythm_analysis?.art_phase?.stories_created || 0,
          returns_to_listen: analysis.lcaa_rhythm_analysis?.art_phase?.returns_to_listen || false,
          seasonal_completion: analysis.lcaa_rhythm_analysis?.art_phase?.seasonal_completion || false
        }
      },

      // Beautiful Obsolescence Tracking
      beautiful_obsolescence: {
        handover_readiness: {
          documentation_complete: analysis.beautiful_obsolescence_tracking?.documentation_complete || 0,
          dependency_reduced: analysis.beautiful_obsolescence_tracking?.dependency_reduced || 0,
          stepping_back_timeline: analysis.beautiful_obsolescence_tracking?.stepping_back_timeline || '12_months',
          community_capacity_built: analysis.beautiful_obsolescence_tracking?.community_capacity_built || false,
          handover_plan_exists: analysis.beautiful_obsolescence_tracking?.handover_plan_exists || false,
          knowledge_transferred: analysis.beautiful_obsolescence_tracking?.knowledge_transferred || false
        },
        readiness_score: calculateReadinessScore(analysis.beautiful_obsolescence_tracking),
        recommendation: getHandoverRecommendation(
          analysis.beautiful_obsolescence_tracking,
          projectAgeMonths
        )
      },

      // Conservation Impact
      conservation_impact: {
        topics_covered: analysis.conservation_impact?.topics_covered || [],
        traditional_knowledge_instances: analysis.conservation_impact?.traditional_knowledge_instances || 0,
        land_care_practices: analysis.conservation_impact?.land_care_practices || [],
        storyteller_contributions: analysis.conservation_impact?.storyteller_contributions || 0
      },

      // Community Value Return
      community_value_return: {
        fair_value_protection_rate: analysis.community_value_return?.fair_value_protection_rate || 0,
        capacity_building_activities: analysis.community_value_return?.capacity_building_activities || [],
        storytellers_benefited: analysis.community_value_return?.storytellers_benefited || 0
      },

      // Metadata
      metadata: {
        privacy_level: analysis.privacy_level,
        storyteller_count: analysis.storyteller_count || 0,
        analysis_count: analysis.analysis_count || 0,
        last_rollup_date: analysis.last_rollup_date,
        last_updated: analysis.updated_at
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching project impact analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}

/**
 * Calculate Beautiful Obsolescence readiness score (0-1)
 */
function calculateReadinessScore(tracking: any): number {
  if (!tracking) return 0;

  const weights = {
    documentation_complete: 0.25,
    dependency_reduced: 0.25,
    community_capacity_built: 0.30,
    knowledge_transferred: 0.20
  };

  let score = 0;
  score += (tracking.documentation_complete || 0) * weights.documentation_complete;
  score += (tracking.dependency_reduced || 0) * weights.dependency_reduced;
  score += (tracking.community_capacity_built ? 1 : 0) * weights.community_capacity_built;
  score += (tracking.knowledge_transferred ? 1 : 0) * weights.knowledge_transferred;

  return Math.round(score * 100) / 100;
}

/**
 * Get handover recommendation based on readiness
 */
function getHandoverRecommendation(tracking: any, projectAgeMonths: number): string {
  const readinessScore = calculateReadinessScore(tracking);

  if (readinessScore >= 0.80) {
    return 'Ready for handover - community capacity is strong';
  } else if (readinessScore >= 0.60) {
    return 'Approaching readiness - focus on documentation and knowledge transfer';
  } else if (readinessScore >= 0.40) {
    return 'Building capacity - continue investing in community skills';
  } else if (projectAgeMonths < 6) {
    return 'Early stage - focus on building relationships and capacity';
  } else {
    return 'Review dependency - may need to accelerate knowledge transfer';
  }
}
