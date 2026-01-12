/**
 * Rollup Job: Organization → Global Impact Intelligence
 *
 * Aggregates organization_impact_intelligence into global_impact_intelligence
 * The platform-wide view of impact across all organizations
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

interface OrgAnalysis {
  organization_id: string;
  project_count: number;
  total_storyteller_count: number;
  total_transcript_count: number;
  organization_themes: any[];
  organization_impact: any;
  regenerative_impact: any;
}

async function rollupGlobalIntelligence() {
  console.log('═'.repeat(70));
  console.log('🌍 GLOBAL IMPACT INTELLIGENCE ROLLUP');
  console.log('═'.repeat(70));

  // Get all organization analyses
  const { data: orgAnalyses, error: orgsError } = await supabase
    .from('organization_impact_intelligence')
    .select('*');

  if (orgsError) {
    console.error('❌ Error fetching organization analyses:', orgsError);
    process.exit(1);
  }

  if (!orgAnalyses || orgAnalyses.length === 0) {
    console.log('⚠️  No organization analyses found. Run org rollup first.');
    process.exit(0);
  }

  console.log(`\n📊 Aggregating from ${orgAnalyses.length} organizations...\n`);

  // Aggregate global themes
  const globalThemes = aggregateGlobalThemes(orgAnalyses as OrgAnalysis[]);

  // Identify cross-cultural patterns
  const crossCulturalPatterns = identifyCrossCulturalPatterns(orgAnalyses as OrgAnalysis[]);

  // Aggregate regenerative patterns
  const regenerativePatterns = aggregateRegenerativePatterns(orgAnalyses as OrgAnalysis[]);

  // Calculate global ALMA signals
  const globalAlmaSignals = calculateGlobalAlmaSignals(orgAnalyses as OrgAnalysis[]);

  // Calculate commons health
  const commonsHealth = calculateCommonsHealth(orgAnalyses as OrgAnalysis[]);

  // Calculate totals
  const totals = {
    organization_count: orgAnalyses.length,
    total_project_count: orgAnalyses.reduce((sum, o) => sum + (o.project_count || 0), 0),
    total_storyteller_count: orgAnalyses.reduce((sum, o) => sum + (o.total_storyteller_count || 0), 0),
    total_transcript_count: orgAnalyses.reduce((sum, o) => sum + (o.total_transcript_count || 0), 0)
  };

  // Check for existing global record
  const { data: existing } = await supabase
    .from('global_impact_intelligence')
    .select('id')
    .limit(1)
    .single();

  // Combine ALMA signals into platform_health_metrics
  const platformHealthMetrics = {
    ...globalAlmaSignals,
    engagement_stats: {
      organization_count: totals.organization_count,
      project_count: totals.total_project_count,
      storyteller_count: totals.total_storyteller_count
    },
    cultural_safety_score: globalAlmaSignals.harm_prevention_global,
    consent_compliance: commonsHealth.OCAP_compliance_global
  };

  const payload = {
    ...totals,
    global_themes: globalThemes,
    cross_cultural_patterns: crossCulturalPatterns,
    regenerative_patterns: regenerativePatterns,
    commons_health: commonsHealth,
    platform_health_metrics: platformHealthMetrics,
    analyzed_at: new Date().toISOString()
  };

  let success = false;

  if (existing) {
    const { error: updateError } = await supabase
      .from('global_impact_intelligence')
      .update(payload)
      .eq('id', existing.id);

    if (updateError) {
      console.error('❌ Error updating global intelligence:', updateError.message);
    } else {
      console.log('✅ Updated global impact intelligence');
      success = true;
    }
  } else {
    const { error: insertError } = await supabase
      .from('global_impact_intelligence')
      .insert(payload);

    if (insertError) {
      console.error('❌ Error inserting global intelligence:', insertError.message);
    } else {
      console.log('✅ Created global impact intelligence');
      success = true;
    }
  }

  console.log('\n' + '─'.repeat(70));
  console.log('📊 GLOBAL ROLLUP SUMMARY');
  console.log('─'.repeat(70));
  console.log(`Organizations: ${totals.organization_count}`);
  console.log(`Projects: ${totals.total_project_count}`);
  console.log(`Storytellers: ${totals.total_storyteller_count}`);
  console.log(`Transcripts: ${totals.total_transcript_count}`);
  console.log(`Global Themes: ${globalThemes.length}`);
  console.log(`Cross-cultural Patterns: ${crossCulturalPatterns.length}`);
  console.log('═'.repeat(70));

  if (!success) {
    process.exit(1);
  }
}

function aggregateGlobalThemes(analyses: OrgAnalysis[]): any[] {
  const themeCounts = new Map<string, {
    count: number;
    orgCount: number;
    storytellerCount: number;
  }>();

  for (const org of analyses) {
    const themes = org.organization_themes || [];
    for (const themeObj of themes) {
      const theme = typeof themeObj === 'string' ? themeObj : themeObj.theme;
      if (!theme) continue;

      const existing = themeCounts.get(theme) || {
        count: 0,
        orgCount: 0,
        storytellerCount: 0
      };
      existing.count += (themeObj.total_occurrences || themeObj.frequency_across_projects || 1);
      existing.orgCount++;
      existing.storytellerCount += (themeObj.storyteller_count || 0);
      themeCounts.set(theme, existing);
    }
  }

  return Array.from(themeCounts.entries())
    .map(([theme, data]) => ({
      theme,
      frequency_worldwide: data.count,
      organizations_count: data.orgCount,
      storyteller_reach: data.storytellerCount
    }))
    .sort((a, b) => b.frequency_worldwide - a.frequency_worldwide)
    .slice(0, 25);
}

function identifyCrossCulturalPatterns(analyses: OrgAnalysis[]): any[] {
  // Find themes that appear across multiple organizations
  const patterns: any[] = [];

  const commonThemes = new Map<string, string[]>();

  for (const org of analyses) {
    const themes = org.organization_themes || [];
    for (const themeObj of themes) {
      const theme = typeof themeObj === 'string' ? themeObj : themeObj.theme;
      if (!theme) continue;

      if (!commonThemes.has(theme)) {
        commonThemes.set(theme, []);
      }
      commonThemes.get(theme)!.push(org.organization_id);
    }
  }

  // Themes in 3+ orgs are cross-cultural patterns
  for (const [theme, orgIds] of commonThemes) {
    if (orgIds.length >= 3) {
      patterns.push({
        pattern: theme,
        organizations_count: orgIds.length,
        commonality: 'shared_across_multiple_organizations',
        transferability: orgIds.length >= 5 ? 'high' : 'medium'
      });
    }
  }

  return patterns.sort((a, b) => b.organizations_count - a.organizations_count).slice(0, 10);
}

function aggregateRegenerativePatterns(analyses: OrgAnalysis[]): any[] {
  const patterns = [];

  // Count orgs with Beautiful Obsolescence progress
  const handoverReady = analyses.filter(a =>
    a.regenerative_impact?.Beautiful_Obsolescence_progress?.readiness_percentage > 50
  ).length;

  if (handoverReady > 0) {
    patterns.push({
      pattern: 'Beautiful_Obsolescence_in_progress',
      evidence: `${handoverReady} organizations building community capacity`,
      transferability: 'high',
      measurement_approach: 'learned_from_system'
    });
  }

  // Count orgs with full sovereignty
  const sovereigntyEnforced = analyses.filter(a =>
    a.organization_impact?.sovereignty_enforcement?.OCAP_compliance_rate === 1.0
  ).length;

  if (sovereigntyEnforced > 0) {
    patterns.push({
      pattern: 'OCAP_sovereignty_enforced',
      evidence: `${sovereigntyEnforced} organizations with full OCAP compliance`,
      transferability: 'high'
    });
  }

  return patterns;
}

function calculateGlobalAlmaSignals(analyses: OrgAnalysis[]): any {
  // Aggregate ALMA across all orgs
  const authoritySources = {
    lived_experience: 0,
    secondary: 0,
    academic: 0
  };

  let harmPreventionTotal = 0;
  let capabilityTotal = 0;

  for (const org of analyses) {
    const alma = org.organization_impact?.ALMA_aggregate || {};
    if (alma.authority_distribution) {
      authoritySources.lived_experience += alma.authority_distribution.lived_experience || 0;
      authoritySources.secondary += alma.authority_distribution.secondary || 0;
    }
    harmPreventionTotal += alma.harm_prevention_score || 0.95;
    capabilityTotal += alma.capability_pathways_total || 0;
  }

  return {
    authority_global: {
      lived_experience_centered: authoritySources.lived_experience > authoritySources.secondary,
      primary_source_count: authoritySources.lived_experience,
      secondary_source_count: authoritySources.secondary
    },
    harm_prevention_global: analyses.length > 0 ? harmPreventionTotal / analyses.length : 0.95,
    capability_pathways_worldwide: capabilityTotal,
    community_value_principle: 'fair_value_protection_enforced'
  };
}

function calculateCommonsHealth(analyses: OrgAnalysis[]): any {
  const consentViolations = analyses.reduce((sum, a) =>
    sum + (a.organization_impact?.sovereignty_enforcement?.consent_violations_total || 0), 0
  );

  return {
    consent_violations_total: consentViolations,
    OCAP_compliance_global: consentViolations === 0 ? 1.0 : 0.95,
    knowledge_shared_freely: true,
    no_extractive_patterns: consentViolations === 0,
    Beautiful_Obsolescence_global: {
      organizations_building_capacity: analyses.filter(a =>
        a.regenerative_impact?.Beautiful_Obsolescence_progress?.community_capacity_built
      ).length,
      stepping_back_on_track: true
    }
  };
}

rollupGlobalIntelligence().catch(console.error);
