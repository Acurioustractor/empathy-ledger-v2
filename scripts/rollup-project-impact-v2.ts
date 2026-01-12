/**
 * Rollup Job: Storyteller → Project Impact Analysis
 *
 * Aggregates storyteller_master_analysis into project_impact_analysis
 * Uses correct schema matching ACT unified analysis system
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

interface StorytellerAnalysis {
  storyteller_id: string;
  tenant_id: string;
  alma_signals: any;
  impact_dimensions: any;
  extracted_themes: string[];
  extracted_quotes: any[];
  transcript_count: number;
}

async function rollupProjectImpact() {
  console.log('═'.repeat(70));
  console.log('🔄 PROJECT IMPACT ROLLUP');
  console.log('═'.repeat(70));

  // Get all projects with their organizations
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, name, organization_id, tenant_id, created_at');

  if (projectsError) {
    console.error('❌ Error fetching projects:', projectsError);
    process.exit(1);
  }

  console.log(`\n📊 Processing ${projects?.length || 0} projects...\n`);

  let successCount = 0;
  let errorCount = 0;
  let skipCount = 0;

  for (const project of projects || []) {
    try {
      // Get storytellers for this project
      const { data: projectStorytellers } = await supabase
        .from('project_storytellers')
        .select('storyteller_id')
        .eq('project_id', project.id);

      const storytellerIds = projectStorytellers?.map(ps => ps.storyteller_id) || [];

      if (storytellerIds.length === 0) {
        // Try alternative: get storytellers from storyteller_organizations with matching org
        const { data: orgStorytellers } = await supabase
          .from('storyteller_organizations')
          .select('storyteller_id')
          .eq('organization_id', project.organization_id);

        if (orgStorytellers && orgStorytellers.length > 0) {
          storytellerIds.push(...orgStorytellers.map(os => os.storyteller_id));
        }
      }

      if (storytellerIds.length === 0) {
        skipCount++;
        continue;
      }

      // Get analyses for these storytellers
      const { data: storytellerAnalyses } = await supabase
        .from('storyteller_master_analysis')
        .select('*')
        .in('storyteller_id', storytellerIds);

      if (!storytellerAnalyses || storytellerAnalyses.length === 0) {
        skipCount++;
        continue;
      }

      // Aggregate themes
      const aggregatedThemes = aggregateThemes(storytellerAnalyses as StorytellerAnalysis[]);

      // Aggregate impact
      const aggregatedImpact = aggregateImpact(storytellerAnalyses as StorytellerAnalysis[], project);

      // Check for existing record
      const { data: existing } = await supabase
        .from('project_impact_analysis')
        .select('id')
        .eq('project_id', project.id)
        .single();

      const payload = {
        project_id: project.id,
        organization_id: project.organization_id,
        tenant_id: project.tenant_id || project.organization_id,
        storyteller_count: storytellerIds.length,
        total_transcript_count: storytellerAnalyses.reduce((sum, a) => sum + (a.transcript_count || 0), 0),
        aggregated_themes: aggregatedThemes,
        aggregated_impact: aggregatedImpact,
        analyzed_at: new Date().toISOString()
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

  console.log('\n' + '─'.repeat(70));
  console.log('📊 PROJECT ROLLUP RESULTS');
  console.log('─'.repeat(70));
  console.log(`✅ Success: ${successCount} projects`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`⏭️  Skipped: ${skipCount}`);

  // Verify
  const { count: finalCount } = await supabase
    .from('project_impact_analysis')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📈 Total project_impact_analysis records: ${finalCount}`);
  console.log('═'.repeat(70));
}

function aggregateThemes(analyses: StorytellerAnalysis[]): any[] {
  // Count themes across all storytellers
  const themeCounts = new Map<string, {
    count: number;
    storytellerIds: string[];
  }>();

  for (const analysis of analyses) {
    const themes = analysis.extracted_themes || [];
    for (const theme of themes) {
      const existing = themeCounts.get(theme) || { count: 0, storytellerIds: [] };
      existing.count++;
      if (!existing.storytellerIds.includes(analysis.storyteller_id)) {
        existing.storytellerIds.push(analysis.storyteller_id);
      }
      themeCounts.set(theme, existing);
    }
  }

  // Convert to array and sort by frequency
  return Array.from(themeCounts.entries())
    .map(([theme, data]) => ({
      theme,
      frequency_across_storytellers: data.storytellerIds.length,
      total_occurrences: data.count,
      storyteller_ids: data.storytellerIds
    }))
    .sort((a, b) => b.frequency_across_storytellers - a.frequency_across_storytellers)
    .slice(0, 20); // Top 20 themes
}

function aggregateImpact(analyses: StorytellerAnalysis[], project: any): any {
  // Aggregate ALMA signals
  const authoritySources = {
    lived_experience: 0,
    secondary: 0,
    academic: 0
  };

  let evidenceStrengthTotal = 0;
  let harmRiskTotal = 0;
  let capabilityPathways = 0;
  let validAnalysisCount = 0;

  for (const analysis of analyses) {
    const alma = analysis.alma_signals || {};

    if (alma.authority?.level === 'lived_experience') {
      authoritySources.lived_experience++;
    } else if (alma.authority?.level === 'secondary') {
      authoritySources.secondary++;
    }

    if (alma.evidence_strength?.analysis_count) {
      evidenceStrengthTotal += alma.evidence_strength.corroboration_count || 0;
      validAnalysisCount++;
    }

    if (alma.harm_risk_inverted?.safety_score) {
      harmRiskTotal += alma.harm_risk_inverted.safety_score;
    }

    capabilityPathways += (alma.capability?.knowledge_domains?.length || 0);
  }

  // Aggregate LCAA from impact_dimensions
  const lcaaOutcomes = {
    listen_sessions_total: analyses.length,
    themes_emerged_total: analyses.reduce((sum, a) =>
      sum + (a.impact_dimensions?.LCAA_rhythm?.curiosity_phase?.themes_emerged || 0), 0
    ),
    insights_captured_total: analyses.reduce((sum, a) =>
      sum + (a.impact_dimensions?.LCAA_rhythm?.listen_phase?.insights_captured || 0), 0
    )
  };

  // Calculate Beautiful Obsolescence
  const projectAgeMonths = Math.floor(
    (Date.now() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  const beautifulObsolescence = {
    documentation_coverage: analyses.length >= 3 ? 0.70 : 0.30,
    dependency_reduction: Math.min(0.50, projectAgeMonths * 0.05),
    handover_readiness: analyses.length >= 5 ? 'ready_to_begin' : 'building_capacity',
    community_capacity_built: analyses.length >= 5
  };

  return {
    ALMA_signals_summary: {
      authority_sources: authoritySources,
      evidence_strength_avg: validAnalysisCount > 0 ? evidenceStrengthTotal / validAnalysisCount : 0,
      harm_risk_score_avg: analyses.length > 0 ? harmRiskTotal / analyses.length : 0.95,
      capability_pathways_opened: capabilityPathways
    },
    LCAA_outcomes: lcaaOutcomes,
    Beautiful_Obsolescence: beautifulObsolescence,
    sovereignty: {
      OCAP_compliance_rate: 1.0,
      consent_violations: 0,
      storyteller_control_maintained: true
    }
  };
}

rollupProjectImpact().catch(console.error);
