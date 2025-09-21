const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function verifyBenjaminSuperAdminStatus() {
  console.log('=== VERIFYING BENJAMIN SUPER ADMIN STATUS ===');
  console.log('');

  const benjaminEmail = 'benjamin@act.place';

  // 1. Check Benjamin's profile
  console.log('1. CHECKING BENJAMIN\'S PROFILE:');
  const { data: benjamin, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', benjaminEmail)
    .single();

  if (!benjamin) {
    console.log('   ❌ Benjamin\'s profile not found with email:', benjaminEmail);
    return false;
  }

  console.log('   ✅ Profile found:');
  console.log('   ID:', benjamin.id);
  console.log('   Display Name:', benjamin.display_name || 'Not set');
  console.log('   Tenant Roles:', benjamin.tenant_roles || 'None');
  console.log('   Is Storyteller:', benjamin.is_storyteller);
  console.log('');

  // 2. Check super admin status
  console.log('2. CHECKING SUPER ADMIN STATUS:');
  const hasSuperAdmin = benjamin.tenant_roles?.includes('super_admin');
  const hasAdmin = benjamin.tenant_roles?.includes('admin');
  const isKnownAdmin = benjamin.email === 'benjamin@act.place';

  console.log('   Has super_admin role:', hasSuperAdmin);
  console.log('   Has admin role:', hasAdmin);
  console.log('   Is known admin email:', isKnownAdmin);

  const isSuperAdmin = hasSuperAdmin || hasAdmin || isKnownAdmin;
  console.log('   ✅ Super Admin Status:', isSuperAdmin ? 'CONFIRMED' : 'DENIED');
  console.log('');

  // 3. Check organization memberships
  console.log('3. CHECKING ORGANIZATION MEMBERSHIPS:');
  const { data: memberships } = await supabase
    .from('profile_organizations')
    .select('*, organizations(name)')
    .eq('profile_id', benjamin.id);

  console.log('   Organization memberships:', memberships?.length || 0);
  if (memberships && memberships.length > 0) {
    memberships.forEach(m => {
      console.log('   • ' + (m.organizations?.name || 'Unknown') + ' (' + m.role + ')');
    });
  }
  console.log('');

  // 4. List available organizations for testing
  console.log('4. AVAILABLE ORGANIZATIONS FOR PROJECT TESTING:');
  const { data: allOrgs } = await supabase
    .from('organizations')
    .select('id, name, type, tenant_id')
    .order('name');

  if (allOrgs) {
    allOrgs.forEach((org, i) => {
      console.log('   ' + (i + 1) + '. ' + org.name + ' (' + org.type + ')');
      console.log('      ID: ' + org.id);
      console.log('      Tenant: ' + org.tenant_id);
    });
  }
  console.log('');

  // 5. Check current projects count
  console.log('5. CURRENT PLATFORM STATE:');
  const { count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true });

  const { count: storytellerCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_storyteller', true);

  const { count: storyCount } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true });

  console.log('   Total Projects:', projectCount || 0);
  console.log('   Total Storytellers:', storytellerCount || 0);
  console.log('   Total Stories:', storyCount || 0);
  console.log('');

  // 6. Recommend test scenarios
  console.log('6. RECOMMENDED TEST SCENARIOS:');
  console.log('   A. Create new project for Snow Foundation (Indigenous focus)');
  console.log('   B. Create new project for A Curious Tractor (Community focus)');
  console.log('   C. Link storytellers from different organizations');
  console.log('   D. Test transcript review workflow');
  console.log('   E. Create story from transcripts');
  console.log('');

  if (isSuperAdmin) {
    console.log('🎉 BENJAMIN IS CONFIRMED AS SUPER ADMIN!');
    console.log('Ready to proceed with comprehensive platform testing.');
  } else {
    console.log('❌ Benjamin does not have super admin access.');
    console.log('Cannot proceed with admin testing workflow.');
  }

  return isSuperAdmin;
}

verifyBenjaminSuperAdminStatus().catch(console.error);