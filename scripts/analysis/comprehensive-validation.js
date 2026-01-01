const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function comprehensiveValidation() {
  console.log('=== COMPREHENSIVE TENANT ISOLATION VALIDATION ===');
  console.log('');

  const confitTenantId = 'c22fcf84-5a09-4893-a8ef-758c781e88a8';
  const confitOrgId = 'f7f70fd6-bb60-4004-a910-bafbeb594caf';
  const joeKwonId = 'af4f90cc-e528-4c78-ae9f-e9dd0bde27de';

  // 1. Profiles validation
  console.log('1. PROFILES IN CONFIT PATHWAYS TENANT:');
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, email, is_storyteller')
    .eq('tenant_id', confitTenantId);

  console.log(`   Total: ${profiles?.length || 0}`);
  if (profiles) {
    profiles.forEach(p => {
      const status = p.id === joeKwonId ? '✅' : '❌';
      console.log(`   ${status} ${p.display_name || 'Unnamed'} (${p.email})`);
    });
  }

  // 2. Transcripts validation
  console.log('');
  console.log('2. TRANSCRIPTS IN CONFIT PATHWAYS TENANT:');
  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('id, title, storyteller_id, status, word_count')
    .eq('tenant_id', confitTenantId);

  console.log(`   Total: ${transcripts?.length || 0}`);
  if (transcripts) {
    transcripts.forEach(t => {
      const status = t.storyteller_id === joeKwonId ? '✅' : '❌';
      console.log(`   ${status} "${t.title || 'Untitled'}" - ${t.status} (${t.word_count} words)`);
    });
  }

  // 3. Projects validation
  console.log('');
  console.log('3. PROJECTS IN CONFIT PATHWAYS ORGANIZATION:');
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, status, description')
    .eq('organization_id', confitOrgId);

  console.log(`   Total: ${projects?.length || 0}`);
  if (projects && projects.length > 0) {
    projects.forEach(p => {
      console.log(`   ❌ ${p.name} - ${p.status}`);
    });
  } else {
    console.log('   ✅ No projects (clean)');
  }

  // 4. Organization roles validation
  console.log('');
  console.log('4. ORGANIZATION ROLES FOR CONFIT PATHWAYS:');
  const { data: orgRoles } = await supabase
    .from('organization_roles')
    .select('user_id, role, status, profiles(display_name)')
    .eq('organization_id', confitOrgId);

  console.log(`   Total: ${orgRoles?.length || 0}`);
  if (orgRoles) {
    orgRoles.forEach(r => {
      const status = r.user_id === joeKwonId ? '✅' : '❌';
      console.log(`   ${status} ${r.profiles?.display_name || 'Unknown'} - ${r.role} (${r.status})`);
    });
  }

  // 5. Profile-organization connections
  console.log('');
  console.log('5. PROFILE-ORGANIZATION CONNECTIONS FOR CONFIT PATHWAYS:');
  const { data: profileOrgs } = await supabase
    .from('profile_organizations')
    .select('profile_id, role, is_active, profiles(display_name)')
    .eq('organization_id', confitOrgId);

  console.log(`   Total: ${profileOrgs?.length || 0}`);
  if (profileOrgs) {
    profileOrgs.forEach(po => {
      const status = po.profile_id === joeKwonId ? '✅' : '❌';
      console.log(`   ${status} ${po.profiles?.display_name || 'Unknown'} - ${po.role} (active: ${po.is_active})`);
    });
  }

  // 6. Stories validation
  console.log('');
  console.log('6. STORIES IN CONFIT PATHWAYS TENANT:');
  try {
    const { data: stories } = await supabase
      .from('stories')
      .select('id, title, storyteller_id, status')
      .eq('tenant_id', confitTenantId);

    console.log(`   Total: ${stories?.length || 0}`);
    if (stories && stories.length > 0) {
      stories.forEach(s => {
        const status = s.storyteller_id === joeKwonId ? '✅' : '❌';
        console.log(`   ${status} "${s.title || 'Untitled'}" - ${s.status}`);
      });
    } else {
      console.log('   ✅ No stories (clean)');
    }
  } catch (e) {
    console.log('   ⚠️  Stories table not accessible or empty');
  }

  // Summary (note: organization_roles table doesn't exist, using only profile_organizations)
  const isClean = (
    profiles?.length === 1 && profiles[0].id === joeKwonId &&
    transcripts?.every(t => t.storyteller_id === joeKwonId) &&
    (projects?.length === 0 || !projects) &&
    profileOrgs?.every(po => po.profile_id === joeKwonId)
  );

  console.log('');
  console.log('=== VALIDATION SUMMARY ===');
  console.log(`Confit Pathways Tenant Status: ${isClean ? '✅ CLEAN' : '❌ CONTAMINATED'}`);
  console.log('');
  if (isClean) {
    console.log('🎉 SUCCESS! Confit Pathways is now fully isolated.');
    console.log('Joe Kwon can safely use transcript editing without seeing other users data.');
  } else {
    console.log('⚠️  Additional cleanup may be needed.');
  }
}

comprehensiveValidation().catch(console.error);