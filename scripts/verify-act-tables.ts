/**
 * Verify ACT Unified Analysis System tables were created successfully
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyTables() {
  console.log('🔍 Verifying ACT Unified Analysis System deployment...\n');

  const tables = [
    'storyteller_master_analysis',
    'project_impact_analysis',
    'organization_impact_intelligence',
    'global_impact_intelligence',
    'empathy_ledger_knowledge_base'
  ];

  let allTablesExist = true;

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: NOT FOUND`);
        console.log(`   Error: ${error.message}`);
        allTablesExist = false;
      } else {
        console.log(`✅ ${table}: EXISTS (${count} records)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ERROR`);
      console.log(`   ${err}`);
      allTablesExist = false;
    }
  }

  // Check summary view
  console.log('\n📊 Checking summary view...\n');
  try {
    const { data, error } = await supabase
      .from('act_unified_analysis_summary')
      .select('*');

    if (error) {
      console.log('❌ act_unified_analysis_summary view: NOT FOUND');
      console.log(`   Error: ${error.message}`);
    } else {
      console.log('✅ act_unified_analysis_summary view: EXISTS');
      console.table(data);
    }
  } catch (err) {
    console.log('❌ Summary view check failed:', err);
  }

  console.log('\n' + '='.repeat(70));
  if (allTablesExist) {
    console.log('✅ ACT UNIFIED ANALYSIS SYSTEM - DEPLOYMENT VERIFIED');
    console.log('Next steps:');
    console.log('  1. Run backfill script to populate storyteller_master_analysis');
    console.log('  2. Create rollup jobs (storyteller → project → org → global)');
    console.log('  3. Populate knowledge_base from stories/transcripts');
    console.log('  4. Test ALMA integrity: npm run verify:alma-integrity');
  } else {
    console.log('❌ DEPLOYMENT INCOMPLETE - Some tables missing');
    process.exit(1);
  }
  console.log('='.repeat(70));
}

verifyTables().catch(console.error);
