const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function findAndAssignPalmIslandStorytellers() {
  console.log('=== FINDING STORYTELLERS TO ADD TO PALM ISLAND ===');
  console.log('');

  const palmIslandOrgId = '084f851c-72e0-41fb-b5ba-f3088f44862d';
  const palmTenantId = '9eb91d66-2286-4810-a04a-311d4cdb4631';

  // 1. Find storytellers in Palm Island tenant
  console.log('1. STORYTELLERS IN PALM ISLAND TENANT:');
  const { data: palmTenantStorytellers } = await supabase
    .from('profiles')
    .select('id, display_name, email')
    .eq('tenant_id', palmTenantId)
    .eq('is_storyteller', true);

  console.log('   Found', palmTenantStorytellers?.length || 0, 'storytellers in Palm Island tenant');

  if (palmTenantStorytellers && palmTenantStorytellers.length > 0) {
    // Check which ones are already members
    const storytellerIds = palmTenantStorytellers.map(s => s.id);

    const { data: existingMembers } = await supabase
      .from('profile_organizations')
      .select('profile_id')
      .eq('organization_id', palmIslandOrgId)
      .in('profile_id', storytellerIds);

    const existingMemberIds = new Set(existingMembers?.map(m => m.profile_id) || []);
    const toAdd = palmTenantStorytellers.filter(s => !existingMemberIds.has(s.id));

    console.log('   Already members:', existingMemberIds.size);
    console.log('   To add:', toAdd.length);

    if (toAdd.length > 0) {
      console.log('');
      console.log('2. ADDING STORYTELLERS TO PALM ISLAND:');

      for (const storyteller of toAdd) {
        const { error } = await supabase
          .from('profile_organizations')
          .insert({
            profile_id: storyteller.id,
            organization_id: palmIslandOrgId,
            role: 'storyteller',
            is_active: true,
            joined_at: new Date().toISOString()
          });

        if (error) {
          console.log('   ❌ Failed to add', storyteller.display_name || storyteller.email, ':', error.message);
        } else {
          console.log('   ✅ Added', storyteller.display_name || storyteller.email || storyteller.id);
        }
      }
    }
  }

  // 2. Find any storytellers with Indigenous/Torres Strait Islander background
  console.log('');
  console.log('3. INDIGENOUS/TORRES STRAIT ISLANDER STORYTELLERS:');

  const { data: indigenousStorytellers } = await supabase
    .from('profiles')
    .select('id, display_name, email, cultural_background')
    .eq('is_storyteller', true)
    .or('cultural_background.ilike.%indigenous%, cultural_background.ilike.%torres%strait%, cultural_background.ilike.%aboriginal%');

  console.log('   Found', indigenousStorytellers?.length || 0, 'Indigenous storytellers');

  if (indigenousStorytellers && indigenousStorytellers.length > 0) {
    // Check which ones are not yet members
    const { data: existingMembers } = await supabase
      .from('profile_organizations')
      .select('profile_id')
      .eq('organization_id', palmIslandOrgId);

    const existingMemberIds = new Set(existingMembers?.map(m => m.profile_id) || []);
    const toAdd = indigenousStorytellers.filter(s => !existingMemberIds.has(s.id));

    if (toAdd.length > 0) {
      console.log('   Adding', toAdd.length, 'Indigenous storytellers to Palm Island');

      for (const storyteller of toAdd) {
        const { error } = await supabase
          .from('profile_organizations')
          .insert({
            profile_id: storyteller.id,
            organization_id: palmIslandOrgId,
            role: 'storyteller',
            is_active: true,
            joined_at: new Date().toISOString()
          });

        if (error) {
          console.log('   ❌ Failed to add', storyteller.display_name || storyteller.email, ':', error.message);
        } else {
          console.log('   ✅ Added', storyteller.display_name || storyteller.email, '(', storyteller.cultural_background, ')');
        }
      }
    }
  }

  // 3. Find unassigned storytellers and add a reasonable subset
  console.log('');
  console.log('4. UNASSIGNED STORYTELLERS:');

  const { data: allStorytellers } = await supabase
    .from('profiles')
    .select('id, display_name, email')
    .eq('is_storyteller', true);

  const { data: assignedStorytellers } = await supabase
    .from('profile_organizations')
    .select('profile_id');

  const assignedIds = new Set(assignedStorytellers?.map(s => s.profile_id) || []);
  const unassigned = allStorytellers?.filter(s => !assignedIds.has(s.id)) || [];

  console.log('   Found', unassigned.length, 'unassigned storytellers');

  if (unassigned.length > 0) {
    // Add first 10 unassigned storytellers to Palm Island
    const toAdd = unassigned.slice(0, 10);
    console.log('   Adding first', toAdd.length, 'unassigned storytellers to Palm Island');

    for (const storyteller of toAdd) {
      const { error } = await supabase
        .from('profile_organizations')
        .insert({
          profile_id: storyteller.id,
          organization_id: palmIslandOrgId,
          role: 'storyteller',
          is_active: true,
          joined_at: new Date().toISOString()
        });

      if (error) {
        console.log('   ❌ Failed to add', storyteller.display_name || storyteller.email, ':', error.message);
      } else {
        console.log('   ✅ Added', storyteller.display_name || storyteller.email || storyteller.id);
      }
    }
  }

  // 4. Final count
  console.log('');
  console.log('5. FINAL VERIFICATION:');

  const { count: finalCount } = await supabase
    .from('profile_organizations')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', palmIslandOrgId);

  console.log('   Total members in Palm Island organization:', finalCount || 0);

  // Show breakdown by role
  const { data: allMembers } = await supabase
    .from('profile_organizations')
    .select('role')
    .eq('organization_id', palmIslandOrgId);

  const roleCounts = {};
  allMembers?.forEach(m => {
    roleCounts[m.role] = (roleCounts[m.role] || 0) + 1;
  });

  console.log('   Breakdown by role:');
  Object.entries(roleCounts).forEach(([role, count]) => {
    console.log('     • ' + role + ':', count);
  });

  console.log('');
  console.log('🎉 PALM ISLAND ORGANIZATION UPDATE COMPLETE!');
}

findAndAssignPalmIslandStorytellers().catch(console.error);