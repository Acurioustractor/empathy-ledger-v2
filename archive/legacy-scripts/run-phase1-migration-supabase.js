const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yvnuayzslukamizrlhwb.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function runMigration() {
  console.log('🚀 Starting Phase 1 Migration via Supabase API...\n');

  try {
    // Check if columns already exist
    console.log('Checking existing organization structure...');
    const { data: sampleOrg, error: checkError } = await supabase
      .from('organizations')
      .select('*')
      .limit(1);

    if (checkError) {
      throw new Error(`Failed to check organizations: ${checkError.message}`);
    }

    const hasNewColumns = sampleOrg && sampleOrg.length > 0 && 'subscription_tier' in sampleOrg[0];

    if (hasNewColumns) {
      console.log('⚠️  Columns already exist. Checking if data needs updating...\n');
    } else {
      console.log('❌ Cannot add columns via Supabase API.');
      console.log('\n📋 Next Steps:');
      console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/editor');
      console.log('2. Go to SQL Editor');
      console.log('3. Copy and paste the contents of: migrations/001_flatten_tenants_phase1.sql');
      console.log('4. Run the migration');
      console.log('5. Come back and run this script again to verify\n');
      return;
    }

    // Verify current state
    const { data: orgs } = await supabase
      .from('organizations')
      .select('id, name, subscription_tier, subscription_status, domain, tenant_id');

    console.log(`📊 Found ${orgs?.length || 0} organizations\n`);

    if (orgs && orgs.length > 0) {
      const withSubscription = orgs.filter(o => o.subscription_tier).length;
      const withDomain = orgs.filter(o => o.domain).length;

      console.log('Current Status:');
      console.log(`  Organizations with subscription_tier: ${withSubscription}/${orgs.length}`);
      console.log(`  Organizations with domain: ${withDomain}/${orgs.length}`);

      console.log('\n📋 Sample organizations:');
      orgs.slice(0, 3).forEach(org => {
        console.log(`  - ${org.name}`);
        console.log(`    Subscription: ${org.subscription_tier || 'NOT SET'}`);
        console.log(`    Status: ${org.subscription_status || 'NOT SET'}`);
        console.log(`    Domain: ${org.domain || 'NOT SET'}`);
      });

      if (withSubscription === orgs.length) {
        console.log('\n✅ Phase 1 Migration Already Complete!');
      } else {
        console.log('\n⚠️  Some organizations missing data. Please run SQL migration.');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runMigration();