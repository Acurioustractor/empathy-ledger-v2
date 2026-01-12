import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function checkRollupTables() {
  console.log('═'.repeat(60));
  console.log('📊 ROLLUP TABLES STATUS');
  console.log('═'.repeat(60));

  // Check each tier
  const tables = [
    { name: 'transcript_analysis_results', tier: 'Tier 1 (Source)' },
    { name: 'storyteller_master_analysis', tier: 'Tier 2 (Storyteller)' },
    { name: 'project_impact_analysis', tier: 'Tier 3 (Project)' },
    { name: 'organization_impact_intelligence', tier: 'Tier 4 (Organization)' },
    { name: 'global_impact_intelligence', tier: 'Tier 5 (Global)' },
  ];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table.name)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`\n${table.tier}: ${table.name}`);
      console.log(`   ❌ Error: ${error.message}`);
    } else {
      console.log(`\n${table.tier}: ${table.name}`);
      console.log(`   Count: ${count}`);
    }
  }

  // Get sample of transcript_analysis_results to see schema
  console.log('\n' + '─'.repeat(60));
  console.log('Sample transcript_analysis_results columns:');
  const { data: sample } = await supabase
    .from('transcript_analysis_results')
    .select('*')
    .limit(1);

  if (sample && sample[0]) {
    console.log(Object.keys(sample[0]).join(', '));
  }

  console.log('\n' + '═'.repeat(60));
}

checkRollupTables().catch(console.error);
