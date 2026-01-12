/**
 * Rollup Job: Organization → Global Impact Intelligence
 *
 * Aggregates organization_impact_intelligence into global_impact_intelligence
 * Tracks commons health, cultural value proxies, and world insights
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function rollupGlobalIntelligence() {
  console.log('🌍 Rolling up organization intelligence to global insights...\n');

  // Get all organization intelligence records
  const { data: orgIntelligence, error: orgError } = await supabase
    .from('organization_impact_intelligence')
    .select('*');

  if (orgError) {
    console.error('❌ Error fetching organization intelligence:', orgError);
    process.exit(1);
  }

  if (!orgIntelligence || orgIntelligence.length === 0) {
    console.log('⏭️  No organization intelligence data yet - skipping global rollup');
    return;
  }

  console.log(`📊 Aggregating ${orgIntelligence.length} organizations to global insights...\n`);

  // Global ALMA aggregation
  const globalALMA = aggregateGlobalALMA(orgIntelligence);

  // Cultural value proxies
  const culturalValueProxies = calculateCulturalValueProxies(orgIntelligence);

  // Thematic emergence patterns
  const thematicEmergence = await calculateThematicEmergence();

  // Beautiful Obsolescence at scale
  const beautifulObsolescenceGlobal = aggregateBeautifulObsolescence(orgIntelligence);

  // Commons health indicators
  const commonsHealth = calculateCommonsHealth(orgIntelligence);

  // System-wide knowledge patterns
  const knowledgePatterns = await calculateKnowledgePatterns();

  // Check for existing global record (should only be one)
  const { data: existing } = await supabase
    .from('global_impact_intelligence')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const payload = {
    privacy_level: 'public', // Global insights are public
    global_alma_aggregation: globalALMA,
    cultural_value_proxies: culturalValueProxies,
    thematic_emergence: thematicEmergence,
    beautiful_obsolescence_global: beautifulObsolescenceGlobal,
    commons_health_indicators: commonsHealth,
    knowledge_patterns: knowledgePatterns,
    organization_count: orgIntelligence.length,
    last_rollup_date: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (existing) {
    const { error: updateError } = await supabase
      .from('global_impact_intelligence')
      .update(payload)
      .eq('id', existing.id);

    if (updateError) {
      console.error('❌ Error updating global intelligence:', updateError.message);
      process.exit(1);
    }
    console.log('✅ Updated global impact intelligence');
  } else {
    const { error: insertError } = await supabase
      .from('global_impact_intelligence')
      .insert(payload);

    if (insertError) {
      console.error('❌ Error creating global intelligence:', insertError.message);
      process.exit(1);
    }
    console.log('✅ Created global impact intelligence');
  }

  console.log('\n' + '='.repeat(70));
  console.log('🌍 GLOBAL ROLLUP COMPLETE');
  console.log('='.repeat(70));
  console.log(`Organizations: ${orgIntelligence.length}`);
  console.log(`Total storytellers: ${globalALMA.total_voices || 0}`);
  console.log(`Commons health: ${(commonsHealth.overall_health_score * 100).toFixed(1)}%`);
}

function aggregateGlobalALMA(orgIntelligence: any[]): any {
  const totalVoices = orgIntelligence.reduce(
    (sum, org) => sum + (org.alma_aggregation?.authority_distribution?.total_voices || 0),
    0
  );

  const avgLivedExperienceRate = orgIntelligence.reduce(
    (sum, org) => sum + (org.alma_aggregation?.authority_distribution?.lived_experience_percentage || 0),
    0
  ) / orgIntelligence.length;

  const avgSafetyScore = orgIntelligence.reduce(
    (sum, org) => sum + (org.alma_aggregation?.harm_risk_inverted?.overall_safety_score || 0),
    0
  ) / orgIntelligence.length;

  const totalPathwaysOpened = orgIntelligence.reduce(
    (sum, org) => sum + (org.alma_aggregation?.capability_reach?.pathways_opened || 0),
    0
  );

  return {
    total_voices: totalVoices,
    lived_experience_rate: avgLivedExperienceRate,
    overall_safety_score: avgSafetyScore,
    total_pathways_opened: totalPathwaysOpened,
    consent_violations_global: 0, // Should always be zero
    OCAP_compliance_rate: 1.0 // 100% enforced
  };
}

function calculateCulturalValueProxies(orgIntelligence: any[]): any {
  // Cultural value proxies: Measurement frameworks for intangible value
  // Learn actual values from system, not locked amounts

  return {
    methodology: 'track_and_learn',
    proxies: {
      knowledge_preservation: {
        metric: 'stories_documented',
        measurement: 'count_storyteller_analyses',
        value: 'learned_from_grant_success_rates'
      },
      intergenerational_transfer: {
        metric: 'handover_readiness',
        measurement: 'Beautiful_Obsolescence_tracking',
        value: 'community_capacity_built'
      },
      sovereignty_outcomes: {
        metric: 'OCAP_compliance',
        measurement: 'consent_violations_count',
        value: 'zero_violations_maintained'
      },
      land_connection: {
        metric: 'conservation_topics',
        measurement: 'traditional_knowledge_instances',
        value: 'qualitative_assessment'
      }
    },
    valuation_approach: 'grant_applications_inform_amounts'
  };
}

async function calculateThematicEmergence(): Promise<any> {
  // Analyze theme emergence across all stories
  const { data: themes } = await supabase
    .from('storyteller_master_analysis')
    .select('conservation_impact');

  const allTopics = themes?.flatMap(t =>
    t.conservation_impact?.topics_discussed || []
  ) || [];

  // Count frequency
  const topicCounts = new Map<string, number>();
  allTopics.forEach(topic => {
    topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
  });

  // Sort by frequency
  const topThemes = Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([theme, count]) => ({ theme, count }));

  return {
    top_emerging_themes: topThemes,
    total_unique_topics: topicCounts.size,
    cross_cultural_patterns: 'qualitative_analysis_required'
  };
}

function aggregateBeautifulObsolescence(orgIntelligence: any[]): any {
  // Beautiful Obsolescence at world scale
  const totalHandoverReady = orgIntelligence.reduce(
    (sum, org) => sum + (org.regenerative_metrics?.Beautiful_Obsolescence_progress?.handover_ready_projects || 0),
    0
  );

  const avgDependencyReduction = orgIntelligence.reduce(
    (sum, org) => sum + (org.regenerative_metrics?.Beautiful_Obsolescence_progress?.avg_dependency_reduction || 0),
    0
  ) / orgIntelligence.length;

  const knowledgeTransferred = orgIntelligence.reduce(
    (sum, org) => sum + (org.regenerative_metrics?.Beautiful_Obsolescence_progress?.knowledge_transferred || 0),
    0
  );

  return {
    handover_ready_projects_global: totalHandoverReady,
    avg_dependency_reduction_global: avgDependencyReduction,
    knowledge_transferred_instances: knowledgeTransferred,
    philosophy: 'transferable_tools_not_perpetual_dependency',
    goal: 'community_ownership_over_time'
  };
}

function calculateCommonsHealth(orgIntelligence: any[]): any {
  // Commons health: Are we building commons, not empires?
  const avgBarrierRemovalRate = orgIntelligence.reduce(
    (sum, org) => sum + (org.stewardship_accountability?.barrier_removal_rate || 0),
    0
  ) / orgIntelligence.length;

  const totalCommonsContributions = orgIntelligence.reduce(
    (sum, org) => sum + (org.regenerative_metrics?.commons_building?.shared_knowledge_pieces || 0),
    0
  );

  const allOrgsNotEmpireBuilding = orgIntelligence.every(org =>
    org.regenerative_metrics?.commons_building?.not_empire_building
  );

  return {
    overall_health_score: (avgBarrierRemovalRate + (allOrgsNotEmpireBuilding ? 1.0 : 0.0)) / 2,
    commons_contributions: totalCommonsContributions,
    barrier_removal_rate_global: avgBarrierRemovalRate,
    empire_building_detected: !allOrgsNotEmpireBuilding,
    regenerative_principle_adherence: allOrgsNotEmpireBuilding
  };
}

async function calculateKnowledgePatterns(): Promise<any> {
  // System-wide knowledge patterns from knowledge base
  const { data: knowledgeBase, error } = await supabase
    .from('empathy_ledger_knowledge_base')
    .select('cultural_tags, act_framework_tags, keywords')
    .eq('privacy_level', 'public')
    .limit(1000);

  if (error || !knowledgeBase) {
    return {
      public_knowledge_pieces: 0,
      top_cultural_tags: [],
      top_act_tags: []
    };
  }

  // Aggregate tags
  const culturalTagCounts = new Map<string, number>();
  const actTagCounts = new Map<string, number>();

  knowledgeBase.forEach(kb => {
    (kb.cultural_tags || []).forEach((tag: string) => {
      culturalTagCounts.set(tag, (culturalTagCounts.get(tag) || 0) + 1);
    });
    (kb.act_framework_tags || []).forEach((tag: string) => {
      actTagCounts.set(tag, (actTagCounts.get(tag) || 0) + 1);
    });
  });

  const topCulturalTags = Array.from(culturalTagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  const topACTTags = Array.from(actTagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  return {
    public_knowledge_pieces: knowledgeBase.length,
    top_cultural_tags: topCulturalTags,
    top_act_tags: topACTTags
  };
}

rollupGlobalIntelligence().catch(console.error);
