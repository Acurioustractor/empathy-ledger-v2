const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const GOODS_PROJECT_ID = '6bd47c8a-e676-456f-aa25-ddcbb5a31047';

async function verifyAssignments() {
  console.log('\n🎯 Goods Project - Assigned Storytellers\n');
  console.log('━'.repeat(80));

  // Get all assignments from project_storytellers table
  const { data: assignments, error } = await supabase
    .from('project_storytellers')
    .select(`
      id,
      storyteller_id,
      role,
      status,
      created_at,
      profiles!inner(
        display_name,
        email,
        bio
      )
    `)
    .eq('project_id', GOODS_PROJECT_ID)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!assignments || assignments.length === 0) {
    console.log('❌ No storytellers assigned to Goods project\n');
    return;
  }

  console.log(`✅ Found ${assignments.length} assigned storyteller(s):\n`);

  assignments.forEach((a, idx) => {
    console.log(`${idx + 1}. ${a.profiles.display_name}`);
    console.log(`   ID: ${a.storyteller_id}`);
    console.log(`   Email: ${a.profiles.email || 'Not set'}`);
    console.log(`   Role: ${a.role}`);
    console.log(`   Status: ${a.status}`);
    console.log(`   Assigned: ${new Date(a.created_at).toLocaleString()}`);
    console.log(`   Bio: ${a.profiles.bio?.substring(0, 100)}...`);
    console.log('');
  });

  console.log('━'.repeat(80));
  console.log('\n📍 To view in UI:');
  console.log('   Go to: Admin → Projects → Goods → Storytellers tab');
  console.log('   URL: http://localhost:3030/admin/projects/6bd47c8a-e676-456f-aa25-ddcbb5a31047/storytellers\n');
}

verifyAssignments().catch(console.error);
