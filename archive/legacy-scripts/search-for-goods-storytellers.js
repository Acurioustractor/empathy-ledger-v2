const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function searchForGoods() {
  console.log('\n🔍 Comprehensive Search for Goods-Related Storytellers\n');
  console.log('━'.repeat(80));

  // 1. Search profiles mentioning "goods" in bio or name
  console.log('\n📝 Searching profiles for "goods" mentions...\n');

  const { data: profilesWithGoods } = await supabase
    .from('profiles')
    .select('id, display_name, full_name, email, bio, cultural_background, tenant_roles')
    .or('bio.ilike.%goods%,display_name.ilike.%goods%,full_name.ilike.%goods%');

  if (profilesWithGoods && profilesWithGoods.length > 0) {
    console.log(`✅ Found ${profilesWithGoods.length} profiles mentioning "goods":\n`);
    profilesWithGoods.forEach((p, idx) => {
      console.log(`${idx + 1}. ${p.display_name || p.full_name}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Email: ${p.email || 'Not set'}`);
      console.log(`   Roles: ${p.tenant_roles?.join(', ') || 'None'}`);
      console.log(`   Is Storyteller: ${p.tenant_roles?.includes('storyteller') ? '✅ YES' : '❌ No'}`);
      console.log(`   Bio preview: ${p.bio?.substring(0, 100)}...`);
      console.log('');
    });
  } else {
    console.log('❌ No profiles found mentioning "goods"\n');
  }

  // 2. Search transcripts mentioning "goods"
  console.log('━'.repeat(80));
  console.log('\n📄 Searching transcripts for "goods" mentions...\n');

  const { data: transcriptsWithGoods } = await supabase
    .from('transcripts')
    .select('id, title, storyteller_id, project_id, text')
    .or('title.ilike.%goods%,text.ilike.%goods%')
    .limit(10);

  if (transcriptsWithGoods && transcriptsWithGoods.length > 0) {
    console.log(`✅ Found ${transcriptsWithGoods.length} transcripts mentioning "goods":\n`);

    for (const t of transcriptsWithGoods) {
      // Get storyteller info
      const { data: storyteller } = await supabase
        .from('profiles')
        .select('display_name, tenant_roles')
        .eq('id', t.storyteller_id)
        .single();

      console.log(`📄 "${t.title}"`);
      console.log(`   Storyteller: ${storyteller?.display_name || 'Unknown'}`);
      console.log(`   Is Storyteller: ${storyteller?.tenant_roles?.includes('storyteller') ? '✅ YES' : '❌ No'}`);
      console.log(`   Transcript ID: ${t.id}`);
      console.log(`   Project ID: ${t.project_id || 'Not assigned'}`);
      console.log('');
    }
  } else {
    console.log('❌ No transcripts found mentioning "goods"\n');
  }

  // 3. Check all A Curious Tractor members again with full detail
  console.log('━'.repeat(80));
  console.log('\n👥 A Curious Tractor - Detailed Member Review\n');

  const ACT_ORG_ID = 'db0de7bd-eb10-446b-99e9-0f3b7c199b8a';

  const { data: actMembers } = await supabase
    .from('profile_organizations')
    .select(`
      profile_id,
      role,
      profiles!inner(
        id,
        display_name,
        full_name,
        email,
        bio,
        cultural_background,
        tenant_roles
      )
    `)
    .eq('organization_id', ACT_ORG_ID)
    .eq('is_active', true);

  console.log(`Total Members: ${actMembers?.length || 0}\n`);

  actMembers?.forEach((member, idx) => {
    const p = member.profiles;
    const isStoryteller = p.tenant_roles?.includes('storyteller');

    console.log(`${idx + 1}. ${p.display_name || p.full_name}`);
    console.log(`   ID: ${p.id}`);
    console.log(`   Email: ${p.email || 'Not set'}`);
    console.log(`   Is Storyteller: ${isStoryteller ? '✅ YES' : '❌ No'}`);
    console.log(`   Tenant Roles: ${p.tenant_roles?.join(', ') || 'None'}`);
    console.log(`   Bio: ${p.bio ? `${p.bio.substring(0, 150)}...` : '❌ Missing'}`);
    console.log(`   Cultural Background: ${p.cultural_background || '❌ Missing'}`);
    console.log('');
  });

  // 4. Check for any storytellers across ALL organizations that might be related
  console.log('━'.repeat(80));
  console.log('\n🌍 All Storytellers in System (for reference)\n');

  const { data: allStorytellers } = await supabase
    .from('profiles')
    .select('id, display_name, email, bio, cultural_background')
    .contains('tenant_roles', ['storyteller'])
    .order('display_name');

  console.log(`Total Storytellers in System: ${allStorytellers?.length || 0}\n`);

  allStorytellers?.forEach((s, idx) => {
    console.log(`${idx + 1}. ${s.display_name}`);
    console.log(`   ID: ${s.id}`);
    console.log(`   Email: ${s.email || 'Not set'}`);
    console.log(`   Bio preview: ${s.bio?.substring(0, 100)}...`);
    console.log('');
  });

  // Summary
  console.log('━'.repeat(80));
  console.log('\n📊 SUMMARY\n');
  console.log(`Profiles mentioning "goods": ${profilesWithGoods?.length || 0}`);
  console.log(`Transcripts mentioning "goods": ${transcriptsWithGoods?.length || 0}`);
  console.log(`A Curious Tractor members: ${actMembers?.length || 0}`);
  console.log(`A Curious Tractor storytellers: ${actMembers?.filter(m => m.profiles.tenant_roles?.includes('storyteller')).length || 0}`);
  console.log(`Total storytellers in system: ${allStorytellers?.length || 0}`);
  console.log('');
}

searchForGoods().catch(console.error);
