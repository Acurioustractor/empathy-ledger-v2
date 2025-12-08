const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ALFRED_ID = 'f31388c5-61e6-4f77-a211-930d4da09447';
const GOODS_PROJECT_ID = '6bd47c8a-e676-456f-aa25-ddcbb5a31047';

async function checkAssignment() {
  console.log('\n🔍 Checking Alfred Johnson Assignment Issue\n');
  console.log('━'.repeat(80));

  // Check if assignment exists in database
  const { data: assignment, error: assignError } = await supabase
    .from('project_storytellers')
    .select('*')
    .eq('project_id', GOODS_PROJECT_ID)
    .eq('storyteller_id', ALFRED_ID);

  console.log('\n📊 Current Assignment Status:\n');
  if (assignment && assignment.length > 0) {
    console.log('✅ FOUND in database:');
    console.log(JSON.stringify(assignment[0], null, 2));
  } else {
    console.log('❌ NOT FOUND in database');
    if (assignError) {
      console.log('Error:', assignError);
    }
  }

  // Check all assignments for Goods project
  console.log('\n━'.repeat(80));
  console.log('\n📋 All Goods Project Assignments:\n');

  const { data: allAssignments } = await supabase
    .from('project_storytellers')
    .select(`
      id,
      storyteller_id,
      status,
      created_at,
      profiles!inner(display_name)
    `)
    .eq('project_id', GOODS_PROJECT_ID);

  if (allAssignments && allAssignments.length > 0) {
    console.log(`Found ${allAssignments.length} assignments:`);
    allAssignments.forEach((a, idx) => {
      console.log(`${idx + 1}. ${a.profiles.display_name} - Status: ${a.status} - Created: ${a.created_at}`);
    });
  } else {
    console.log('No assignments found for Goods project');
  }

  // Check Alfred's profile and tenant
  console.log('\n━'.repeat(80));
  console.log('\n👤 Alfred Johnson Profile Check:\n');

  const { data: alfred } = await supabase
    .from('profiles')
    .select('id, display_name, tenant_id, tenant_roles')
    .eq('id', ALFRED_ID)
    .single();

  if (alfred) {
    console.log('Profile:');
    console.log(`  Name: ${alfred.display_name}`);
    console.log(`  Tenant ID: ${alfred.tenant_id}`);
    console.log(`  Roles: ${alfred.tenant_roles?.join(', ')}`);
  }

  // Check Goods project tenant
  console.log('\n🎯 Goods Project Check:\n');

  const { data: goods } = await supabase
    .from('projects')
    .select('id, name, tenant_id, organization_id')
    .eq('id', GOODS_PROJECT_ID)
    .single();

  if (goods) {
    console.log('Project:');
    console.log(`  Name: ${goods.name}`);
    console.log(`  Tenant ID: ${goods.tenant_id}`);
    console.log(`  Organization ID: ${goods.organization_id}`);
  }

  // Check if there's a tenant mismatch
  console.log('\n━'.repeat(80));
  console.log('\n⚠️ TENANT CHECK:\n');

  if (alfred && goods) {
    if (alfred.tenant_id === goods.tenant_id) {
      console.log('✅ Same tenant - should work fine');
    } else {
      console.log('❌ DIFFERENT TENANTS - This might be the issue!');
      console.log(`   Alfred's tenant: ${alfred.tenant_id}`);
      console.log(`   Goods tenant: ${goods.tenant_id}`);
    }
  }

  // Try to create assignment with error details
  console.log('\n━'.repeat(80));
  console.log('\n🧪 Testing Assignment Creation:\n');

  const { data: newAssignment, error: createError } = await supabase
    .from('project_storytellers')
    .insert({
      project_id: GOODS_PROJECT_ID,
      storyteller_id: ALFRED_ID,
      status: 'active',
      role: 'participant'
    })
    .select();

  if (createError) {
    console.log('❌ Error creating assignment:');
    console.log('   Code:', createError.code);
    console.log('   Message:', createError.message);
    console.log('   Details:', createError.details);
    console.log('   Hint:', createError.hint);
  } else {
    console.log('✅ Assignment created successfully!');
    console.log(JSON.stringify(newAssignment, null, 2));
  }

  console.log('\n━'.repeat(80));
}

checkAssignment().catch(console.error);
