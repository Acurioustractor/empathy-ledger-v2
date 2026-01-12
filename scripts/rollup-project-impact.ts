/**
 * Rollup Job: Storyteller → Project Impact Analysis
 *
 * Aggregates storyteller_master_analysis into project_impact_analysis
 * Tracks LCAA rhythm, Beautiful Obsolescence, and community value return
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

async function rollupProjectImpact() {
  console.log('🔄 Rolling up storyteller analyses to project impact...\n');

  // Step 1: Get all projects with storytellers
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      organization_id,
      tenant_id,
      created_at
    `);

  if (projectsError) {
    console.error('❌ Error fetching projects:', projectsError);
    process.exit(1);
  }

  console.log(`📊 Processing ${projects?.length || 0} projects...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const project of projects || []) {
    try {
      // Get storytellers for this project
      const { data: projectStorytellers } = await supabase
        .from('project_storytellers')
        .select('storyteller_id')
        .eq('project_id', project.id);

      const storytellerIds = projectStorytellers?.map(ps => ps.storyteller_id) || [];

      if (storytellerIds.length === 0) {
        console.log(`   ⏭️  Skipping ${project.name} (no storytellers)`);
        continue;
      }

      // Get analyses for these storytellers
      const { data: storytellerAnalyses } = await supabase
        .from('storyteller_master_analysis')
        .select('*')
        .in('storyteller_id', storytellerIds);

      if (!storytellerAnalyses || storytellerAnalyses.length === 0) {
        console.log(`   ⏭️  Skipping ${project.name} (no analyses yet)`);
        continue;
      }

      // Aggregate LCAA rhythm
      const lcaaRhythm = aggregateLCAARhythm(storytellerAnalyses);

      // Aggregate Beautiful Obsolescence
      const beautifulObsolescence = calculateBeautifulObsolescence(project, storytellerAnalyses);

      // Aggregate conservation impact
      const conservationImpact = aggregateConservationImpact(storytellerAnalyses);

      // Aggregate community value return
      const communityValueReturn = aggregateCommunityValue(storytellerAnalyses);

      // Check for existing record
      const { data: existing } = await supabase
        .from('project_impact_analysis')
        .select('id')
        .eq('project_id', project.id)
        .single();

      const payload = {
        project_id: project.id,
        organization_id: project.organization_id,
        tenant_id: project.tenant_id,
        privacy_level: 'organization', // Projects default to org level
        lcaa_rhythm_analysis: lcaaRhythm,
        beautiful_obsolescence_tracking: beautifulObsolescence,
        conservation_impact: conservationImpact,
        community_value_return: communityValueReturn,
        storyteller_count: storytellerIds.length,
        analysis_count: storytellerAnalyses.length,
        last_rollup_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (existing) {
        const { error: updateError } = await supabase
          .from('project_impact_analysis')
          .update(payload)
          .eq('id', existing.id);

        if (updateError) {
          console.error(`   ❌ Error updating ${project.name}:`, updateError.message);
          errorCount++;
        } else {
          console.log(`   ✅ Updated ${project.name} (${storytellerAnalyses.length} analyses)`);
          successCount++;
        }
      } else {
        const { error: insertError } = await supabase
          .from('project_impact_analysis')
          .insert(payload);

        if (insertError) {
          console.error(`   ❌ Error inserting ${project.name}:`, insertError.message);
          errorCount++;
        } else {
          console.log(`   ✅ Created ${project.name} (${storytellerAnalyses.length} analyses)`);
          successCount++;
        }
      }
    } catch (err) {
      console.error(`   ❌ Error processing ${project.name}:`, err);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 PROJECT ROLLUP COMPLETE');
  console.log('='.repeat(70));
  console.log(`✅ Success: ${successCount} projects`);
  console.log(`❌ Errors: ${errorCount} projects`);
}

function aggregateLCAARhythm(analyses: any[]): any {
  // Aggregate across all storyteller analyses
  const allListenPhases = analyses.map(a => a.lcaa_rhythm_analysis?.listen_phase).filter(Boolean);
  const allCuriosityPhases = analyses.map(a => a.lcaa_rhythm_analysis?.curiosity_phase).filter(Boolean);
  const allActionPhases = analyses.map(a => a.lcaa_rhythm_analysis?.action_phase).filter(Boolean);
  const allArtPhases = analyses.map(a => a.lcaa_rhythm_analysis?.art_phase).filter(Boolean);

  return {
    listen_phase: {
      depth_achieved: 'deep', // Aggregated assessment
      total_participants: analyses.length,
      total_insights: allListenPhases.reduce((sum, p) => sum + (p.insights_captured || 0), 0),
      total_duration_minutes: allListenPhases.reduce((sum, p) => sum + (p.duration_minutes || 0), 0)
    },
    curiosity_phase: {
      questions_explored: allCuriosityPhases.flatMap(p => p.questions_explored || []),
      connections_made: allCuriosityPhases.reduce((sum, p) => sum + (p.connections_made || 0), 0),
      themes_emerged: allCuriosityPhases.reduce((sum, p) => sum + (p.themes_emerged || 0), 0)
    },
    action_phase: {
      pathways_opened: allActionPhases.flatMap(p => p.pathways_opened || []),
      barriers_identified: allActionPhases.flatMap(p => p.barriers_identified || []),
      barriers_removed: allActionPhases.flatMap(p => p.barriers_removed || [])
    },
    art_phase: {
      stories_created: analyses.length,
      returns_to_listen: allArtPhases.some(p => p.returns_to_listen),
      seasonal_completion: false // Project-level assessment
    }
  };
}

function calculateBeautifulObsolescence(project: any, analyses: any[]): any {
  // Beautiful Obsolescence: Readiness for handover
  const projectAgeMonths = Math.floor(
    (Date.now() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  // Heuristics for handover readiness
  const documentationComplete = analyses.length >= 3 ? 0.70 : 0.30; // More stories = better docs
  const dependencyReduced = Math.min(0.50, projectAgeMonths * 0.05); // 5% per month, max 50%
  const steppingBackTimeline = projectAgeMonths >= 12 ? '6_months' : '12_months';

  return {
    documentation_complete: documentationComplete,
    dependency_reduced: dependencyReduced,
    stepping_back_timeline: steppingBackTimeline,
    community_capacity_built: analyses.length >= 5,
    handover_plan_exists: false, // Manual assessment required
    knowledge_transferred: analyses.some(a =>
      a.alma_signals?.option_value?.handover_potential === 'can_train_others'
    )
  };
}

function aggregateConservationImpact(analyses: any[]): any {
  const allTopics = analyses.flatMap(a => a.conservation_impact?.topics_discussed || []);
  const uniqueTopics = [...new Set(allTopics)];

  const traditionalKnowledge = analyses.filter(a =>
    a.conservation_impact?.traditional_knowledge_shared
  ).length;

  const allPractices = analyses.flatMap(a => a.conservation_impact?.land_care_practices || []);
  const uniquePractices = [...new Set(allPractices)];

  return {
    topics_covered: uniqueTopics,
    traditional_knowledge_instances: traditionalKnowledge,
    land_care_practices: uniquePractices,
    storyteller_contributions: analyses.length
  };
}

function aggregateCommunityValue(analyses: any[]): any {
  // Track community value return at project level
  const fairValueEnforced = analyses.every(a =>
    a.alma_signals?.community_value_return?.fair_value_protection
  );

  const capacityBuilding = analyses.flatMap(a =>
    a.alma_signals?.community_value_return?.capacity_building || []
  );

  return {
    fair_value_protection_rate: fairValueEnforced ? 1.0 : 0.0,
    capacity_building_activities: capacityBuilding,
    storytellers_benefited: analyses.length
  };
}

rollupProjectImpact().catch(console.error);
