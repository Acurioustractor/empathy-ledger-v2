import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const tables = [
  'storyteller_master_analysis',
  'project_impact_analysis',
  'organization_impact_intelligence',
  'global_impact_intelligence',
  'empathy_ledger_knowledge_base'
];

console.log('🔍 Verifying ACT Unified Analysis System deployment...\n');

for (const table of tables) {
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.log(`❌ ${table}: ${error.message}`);
  } else {
    console.log(`✅ ${table}: ${count || 0} records`);
  }
}

console.log('\n📊 ACT Unified Analysis Summary View:\n');
const { data, error } = await supabase.from('act_unified_analysis_summary').select('*');

if (error) {
  console.log(`❌ Summary view error: ${error.message}`);
} else {
  console.table(data);
  console.log('\n✅ ACT UNIFIED ANALYSIS SYSTEM - DEPLOYMENT VERIFIED');
  console.log('\nNext steps:');
  console.log('  1. Backfill storyteller_master_analysis from transcript_analysis_results');
  console.log('  2. Create rollup jobs (storyteller → project → org → global)');
  console.log('  3. Populate knowledge_base from stories/transcripts');
  console.log('  4. Run ALMA integrity tests: npm run verify:alma-integrity');
}
