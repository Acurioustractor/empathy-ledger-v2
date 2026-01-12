/**
 * Master Rollup Script: Run all ACT analysis aggregations in sequence
 *
 * Order: Storyteller → Project → Organization → Global
 */

import { execSync } from 'child_process';

const scripts = [
  {
    name: '1. Backfill Storyteller Analysis',
    command: 'npx tsx scripts/backfill-storyteller-analysis.ts',
    description: 'Transform transcript_analysis_results → storyteller_master_analysis (ALMA v2.0)'
  },
  {
    name: '2. Rollup Project Impact',
    command: 'npx tsx scripts/rollup-project-impact.ts',
    description: 'Aggregate storyteller analyses → project_impact_analysis (LCAA + Beautiful Obsolescence)'
  },
  {
    name: '3. Rollup Organization Intelligence',
    command: 'npx tsx scripts/rollup-organization-intelligence.ts',
    description: 'Aggregate project impact → organization_impact_intelligence (Stewardship + Enterprise-Commons)'
  },
  {
    name: '4. Rollup Global Intelligence',
    command: 'npx tsx scripts/rollup-global-intelligence.ts',
    description: 'Aggregate organization intelligence → global_impact_intelligence (Commons Health + World Insights)'
  }
];

async function runAllRollups() {
  console.log('🌱 ACT UNIFIED ANALYSIS SYSTEM - COMPLETE ROLLUP\n');
  console.log('Philosophy: Regenerative intelligence infrastructure, not extraction');
  console.log('Framework: ALMA v2.0 + LCAA Rhythm + Beautiful Obsolescence\n');
  console.log('='.repeat(70));

  for (const script of scripts) {
    console.log(`\n📊 ${script.name}`);
    console.log(`   ${script.description}\n`);
    console.log('─'.repeat(70));

    try {
      execSync(script.command, { stdio: 'inherit' });
      console.log('─'.repeat(70));
      console.log(`✅ ${script.name} - COMPLETE\n`);
    } catch (error) {
      console.error(`❌ ${script.name} - FAILED`);
      console.error(error);
      process.exit(1);
    }
  }

  console.log('='.repeat(70));
  console.log('🎉 ALL ROLLUPS COMPLETE');
  console.log('='.repeat(70));
  console.log('\nNext steps:');
  console.log('  1. Verify summary: npm run act:verify');
  console.log('  2. Check ALMA integrity: npm run verify:alma-integrity');
  console.log('  3. View dashboard: (dashboard endpoints TBD)');
}

runAllRollups().catch(console.error);
