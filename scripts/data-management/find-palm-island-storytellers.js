const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function findAndAddPalmIslandStorytellers() {
  console.log('=== FINDING AND ADDING PALM ISLAND STORYTELLERS ===');
  console.log('');

  // 1. Find Palm Island organization
  const { data: palmIslandOrg } = await supabase
    .from('organizations')
    .select('*')
    .ilike('name', '%palm%island%')
    .single();

  if (!palmIslandOrg) {
    console.log('❌ Palm Island organization not found');

    // Try alternative names
    const { data: allOrgs } = await supabase
      .from('organizations')
      .select('id, name');

    console.log('Available organizations:');
    allOrgs?.forEach(org => {
      console.log('  •', org.name);
    });
    return;
  }

  console.log('1. PALM ISLAND ORGANIZATION FOUND:');
  console.log('   ID:', palmIslandOrg.id);
  console.log('   Name:', palmIslandOrg.name);
  console.log('   Tenant ID:', palmIslandOrg.tenant_id);
  console.log('');

  // 2. Find all projects for Palm Island
  const { data: palmIslandProjects } = await supabase
    .from('projects')
    .select('*')
    .eq('organization_id', palmIslandOrg.id);

  console.log('2. PALM ISLAND PROJECTS:');
  if (palmIslandProjects && palmIslandProjects.length > 0) {
    palmIslandProjects.forEach(project => {
      console.log('   •', project.name, '(ID:', project.id + ')');
    });
  } else {
    console.log('   No projects found for Palm Island');
  }
  console.log('');

  // 3. Find storytellers through project associations
  const storytellersToAdd = new Set();

  console.log('3. FINDING STORYTELLERS THROUGH PROJECT ASSOCIATIONS:');

  if (palmIslandProjects && palmIslandProjects.length > 0) {
    const projectIds = palmIslandProjects.map(p => p.id);

    const { data: projectStorytellers } = await supabase
      .from('project_storytellers')
      .select('storyteller_id, project_id, role')
      .in('project_id', projectIds);

    if (projectStorytellers && projectStorytellers.length > 0) {
      console.log('   Found', projectStorytellers.length, 'project-storyteller associations');
      projectStorytellers.forEach(ps => storytellersToAdd.add(ps.storyteller_id));
    }
  }

  // 4. Find storytellers by location/cultural background
  console.log('');
  console.log('4. SEARCHING FOR STORYTELLERS BY PALM ISLAND REFERENCES:');

  const { data: locationBasedStorytellers } = await supabase
    .from('profiles')
    .select('id, display_name, email')
    .or('location.ilike.%palm%island%, cultural_background.ilike.%palm%island%, bio.ilike.%palm%island%')
    .eq('is_storyteller', true);

  if (locationBasedStorytellers && locationBasedStorytellers.length > 0) {
    console.log('   Found', locationBasedStorytellers.length, 'storytellers with Palm Island references');
    locationBasedStorytellers.forEach(s => storytellersToAdd.add(s.id));
  }

  // 5. Find storytellers through transcripts
  console.log('');
  console.log('5. CHECKING TRANSCRIPTS FOR PALM ISLAND MENTIONS:');

  const { data: palmIslandTranscripts } = await supabase
    .from('transcripts')
    .select('storyteller_id, title')
    .or('title.ilike.%palm%island%, content.ilike.%palm%island%, location.ilike.%palm%island%')
    .limit(50);

  if (palmIslandTranscripts && palmIslandTranscripts.length > 0) {
    const validIds = palmIslandTranscripts
      .map(t => t.storyteller_id)
      .filter(id => id && id !== 'null');
    console.log('   Found', palmIslandTranscripts.length, 'transcripts mentioning Palm Island');
    validIds.forEach(id => storytellersToAdd.add(id));
  }

  // 6. Get storyteller details and check current membership
  const storytellerIds = Array.from(storytellersToAdd);

  if (storytellerIds.length === 0) {
    console.log('');
    console.log('❌ No storytellers found to add to Palm Island');
    return;
  }

  console.log('');
  console.log('6. STORYTELLERS TO PROCESS:', storytellerIds.length);

  // Get storyteller details
  const { data: storytellers } = await supabase
    .from('profiles')
    .select('id, display_name, email')
    .in('id', storytellerIds);

  // Check existing memberships
  const { data: existingMemberships } = await supabase
    .from('profile_organizations')
    .select('profile_id')
    .eq('organization_id', palmIslandOrg.id)
    .in('profile_id', storytellerIds);

  const existingMemberIds = new Set(existingMemberships?.map(m => m.profile_id) || []);
  const newStorytellers = storytellers?.filter(s => !existingMemberIds.has(s.id)) || [];

  console.log('   Already members:', existingMemberIds.size);
  console.log('   New to add:', newStorytellers.length);

  if (newStorytellers.length === 0) {
    console.log('');
    console.log('✅ All relevant storytellers are already members of Palm Island');
    return;
  }

  // 7. Add new storytellers to Palm Island organization
  console.log('');
  console.log('7. ADDING NEW STORYTELLERS TO PALM ISLAND:');

  for (const storyteller of newStorytellers) {
    const { error } = await supabase
      .from('profile_organizations')
      .insert({
        profile_id: storyteller.id,
        organization_id: palmIslandOrg.id,
        role: 'storyteller',
        is_active: true,
        joined_at: new Date().toISOString()
      });

    if (error) {
      console.log('   ❌ Failed to add', storyteller.display_name || storyteller.email, ':', error.message);
    } else {
      console.log('   ✅ Added', storyteller.display_name || storyteller.email || 'Unknown');
    }
  }

  // 8. Final verification
  console.log('');
  console.log('8. FINAL VERIFICATION:');

  const { count: finalCount } = await supabase
    .from('profile_organizations')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', palmIslandOrg.id);

  console.log('   Total members in Palm Island organization:', finalCount || 0);

  // Show all current members
  const { data: allMembers } = await supabase
    .from('profile_organizations')
    .select('profile_id, role, profiles(display_name, email)')
    .eq('organization_id', palmIslandOrg.id);

  console.log('');
  console.log('   CURRENT PALM ISLAND MEMBERS:');
  allMembers?.forEach(member => {
    const profile = member.profiles;
    console.log('     •', profile?.display_name || profile?.email || 'Unknown', '-', member.role);
  });

  console.log('');
  console.log('🎉 PALM ISLAND ORGANIZATION UPDATE COMPLETE!');
}

findAndAddPalmIslandStorytellers().catch(console.error);