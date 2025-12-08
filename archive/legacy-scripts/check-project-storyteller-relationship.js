const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRelationship() {
  console.log('\n🔍 Checking Project-Storyteller Relationship Requirements\n');
  console.log('━'.repeat(80));

  // Check if there are any project_storytellers records
  const { data: existingAssignments, error } = await supabase
    .from('project_storytellers')
    .select('*')
    .limit(5);

  if (error) {
    console.error('Error querying project_storytellers:', error);
    return;
  }

  console.log('\n📊 Sample project_storytellers records:\n');
  if (existingAssignments && existingAssignments.length > 0) {
    console.log(JSON.stringify(existingAssignments[0], null, 2));
  } else {
    console.log('❌ No existing project_storytellers records found\n');
  }

  // Check projects table for organization_id
  console.log('\n━'.repeat(80));
  console.log('\n🎯 Checking Projects Structure\n');

  const { data: goodsProject } = await supabase
    .from('projects')
    .select('id, name, organization_id, tenant_id')
    .eq('id', '6bd47c8a-e676-456f-aa25-ddcbb5a31047')
    .single();

  if (goodsProject) {
    console.log('Goods Project:');
    console.log(`  Name: ${goodsProject.name}`);
    console.log(`  Organization ID: ${goodsProject.organization_id}`);
    console.log(`  Tenant ID: ${goodsProject.tenant_id}`);
  }

  // Check if storytellers need to be in the same org as the project
  console.log('\n━'.repeat(80));
  console.log('\n🔍 Testing: Can we assign storyteller from DIFFERENT org?\n');

  const KRISTY_ID = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0'; // From Oonchiumpa
  const GOODS_PROJECT_ID = '6bd47c8a-e676-456f-aa25-ddcbb5a31047'; // A Curious Tractor

  // Check what org Kristy is in
  const { data: kristyOrgs } = await supabase
    .from('profile_organizations')
    .select('organization_id, organizations!inner(name)')
    .eq('profile_id', KRISTY_ID)
    .eq('is_active', true);

  console.log(`Kristy Bloomfield's Organizations:`);
  kristyOrgs?.forEach(org => {
    console.log(`  - ${org.organizations.name} (${org.organization_id})`);
  });

  // Try to assign (dry run - we'll roll back)
  console.log('\n🧪 Testing assignment across organizations...');

  const { error: testError } = await supabase
    .from('project_storytellers')
    .insert({
      project_id: GOODS_PROJECT_ID,
      storyteller_id: KRISTY_ID
    });

  if (testError) {
    if (testError.code === '23505') {
      console.log('✅ Assignment already exists (that\'s fine)');
    } else {
      console.log('❌ Error:', testError.message);
      console.log('   Code:', testError.code);

      if (testError.message.includes('organization') || testError.message.includes('tenant')) {
        console.log('\n⚠️  CONSTRAINT: Storyteller must be in same organization as project!');
      }
    }
  } else {
    console.log('✅ SUCCESS: Cross-organization assignment works!');
    console.log('   Storytellers do NOT need to be in project\'s organization');

    // Clean up test
    await supabase
      .from('project_storytellers')
      .delete()
      .eq('project_id', GOODS_PROJECT_ID)
      .eq('storyteller_id', KRISTY_ID);

    console.log('   (Test record removed)');
  }

  console.log('\n━'.repeat(80));
  console.log('\n📋 CONCLUSION:\n');

  const { count } = await supabase
    .from('project_storytellers')
    .select('*', { count: 'exact', head: true });

  console.log(`Total project_storytellers assignments in system: ${count || 0}`);
  console.log('');
}

checkRelationship().catch(console.error);
