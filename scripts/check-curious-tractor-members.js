const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ACT_ORG_ID = 'db0de7bd-eb10-446b-99e9-0f3b7c199b8a';

async function checkMembers() {
  console.log('\n👥 A Curious Tractor - All Members Analysis\n');

  const { data: members, error } = await supabase
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

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`📊 Total Active Members: ${members.length}\n`);
  console.log('━'.repeat(80));

  members.forEach((member, idx) => {
    const profile = member.profiles;
    console.log(`\n${idx + 1}. ${profile.display_name || profile.full_name || 'Unknown'}`);
    console.log(`   ID: ${profile.id}`);
    console.log(`   Email: ${profile.email || 'Not set'}`);
    console.log(`   Organization Role: ${member.role || 'member'}`);
    console.log(`   Tenant Roles: ${profile.tenant_roles?.join(', ') || 'None'}`);
    console.log(`   Bio: ${profile.bio ? `✅ ${profile.bio.length} chars` : '❌ Missing'}`);
    console.log(`   Cultural Background: ${profile.cultural_background || '❌ Missing'}`);
  });

  console.log('\n━'.repeat(80));
  console.log('\n📋 ROLE BREAKDOWN:\n');

  const storytellers = members.filter(m => m.profiles.tenant_roles?.includes('storyteller'));
  const admins = members.filter(m => m.profiles.tenant_roles?.includes('admin'));
  const orgAdmins = members.filter(m => m.role === 'admin');

  console.log(`Storytellers: ${storytellers.length}`);
  storytellers.forEach(s => console.log(`   - ${s.profiles.display_name}`));

  console.log(`\nOrganization Admins: ${orgAdmins.length}`);
  orgAdmins.forEach(a => console.log(`   - ${a.profiles.display_name}`));

  console.log(`\nSystem Admins: ${admins.length}`);
  admins.forEach(a => console.log(`   - ${a.profiles.display_name}`));

  console.log('\n');
}

checkMembers().catch(console.error);
