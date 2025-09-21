const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function analyzeMigrationNeeds() {
  console.log('=== MIGRATION ANALYSIS ===\n');

  // Get current state
  const { data: profiles } = await supabase.from('profiles').select('id, display_name, current_organization, tenant_id');
  const { data: connections } = await supabase.from('profile_organizations').select('*');
  const { data: orgs } = await supabase.from('organizations').select('*');

  const confitTenantId = 'c22fcf84-5a09-4893-a8ef-758c781e88a8';
  const joeKwonId = 'af4f90cc-e528-4c78-ae9f-e9dd0bde27de';
  const confitProfiles = profiles.filter(p => p.tenant_id === confitTenantId);

  console.log('PROFILES TO MIGRATE FROM CONFIT PATHWAYS:');
  console.log(`Total in tenant: ${confitProfiles.length}`);
  console.log('Keep (Joe Kwon): 1');
  console.log(`Need to relocate: ${confitProfiles.length - 1}\n`);

  // Analyze by current_organization field
  const orgGroups = {};
  confitProfiles.forEach(profile => {
    if (profile.id === joeKwonId) return; // Skip Joe Kwon

    const org = profile.current_organization || 'None';
    if (!orgGroups[org]) orgGroups[org] = [];
    orgGroups[org].push(profile);
  });

  console.log('GROUPS BY current_organization FIELD:');
  Object.keys(orgGroups).sort((a, b) => orgGroups[b].length - orgGroups[a].length).forEach(org => {
    const count = orgGroups[org].length;
    const connected = orgGroups[org].filter(p => connections.some(c => c.profile_id === p.id)).length;
    const existingOrg = orgs.find(o => o.name === org);

    console.log(`  ${org}: ${count} profiles (${connected} connected) ${existingOrg ? '✓ org exists' : '✗ need new org'}`);
  });

  console.log('\nSTRATEGY:');
  console.log('1. Create missing organizations first');
  console.log('2. Create new tenants for each organization');
  console.log('3. Move profiles to correct tenants in batches');
  console.log('4. Update related transcripts and content');
  console.log('5. Validate all relationships preserved');

  return { orgGroups, connections, orgs };
}

analyzeMigrationNeeds().catch(console.error);