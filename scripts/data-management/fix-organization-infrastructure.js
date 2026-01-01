const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function fixOrganizationInfrastructure() {
  console.log('=== FIXING ORGANIZATION INFRASTRUCTURE ===');
  console.log('');

  // Step 1: Connect unconnected profiles to organizations based on current_organization field
  console.log('1. CONNECTING PROFILES TO ORGANIZATIONS BY current_organization FIELD:');

  const { data: unconnectedProfiles } = await supabase
    .from('profiles')
    .select('id, display_name, email, current_organization, is_storyteller')
    .eq('is_storyteller', true)
    .not('current_organization', 'is', null)
    .neq('current_organization', 'None');

  // Get existing connections
  const { data: existingConnections } = await supabase
    .from('profile_organizations')
    .select('profile_id');

  const connectedIds = new Set(existingConnections?.map(c => c.profile_id) || []);
  const toConnect = unconnectedProfiles?.filter(p => !connectedIds.has(p.id)) || [];

  console.log('   Profiles claiming organizations but not connected:', toConnect.length);

  // Get all organizations for mapping
  const { data: allOrgs } = await supabase
    .from('organizations')
    .select('id, name');

  const orgMap = {};
  allOrgs?.forEach(org => {
    orgMap[org.name] = org.id;
  });

  let connected = 0;
  let errors = 0;

  for (const profile of toConnect) {
    const orgId = orgMap[profile.current_organization];

    if (orgId) {
      const { error } = await supabase
        .from('profile_organizations')
        .insert({
          profile_id: profile.id,
          organization_id: orgId,
          role: 'storyteller',
          is_active: true,
          joined_at: new Date().toISOString()
        });

      if (error) {
        console.log('   ❌ Failed to connect', profile.display_name || profile.email, 'to', profile.current_organization);
        errors++;
      } else {
        connected++;
        if (connected % 10 === 0) {
          console.log('   ✅ Connected', connected, 'profiles so far...');
        }
      }
    }
  }

  console.log('   Final: Connected', connected, 'profiles,', errors, 'errors');
  console.log('');

  // Step 2: Move profiles to correct tenants
  console.log('2. MOVING PROFILES TO CORRECT ORGANIZATION TENANTS:');

  const { data: allConnections } = await supabase
    .from('profile_organizations')
    .select('profile_id, organization_id, organizations(tenant_id, name)');

  let moved = 0;
  let moveErrors = 0;

  for (const connection of allConnections || []) {
    const correctTenantId = connection.organizations?.tenant_id;

    if (correctTenantId) {
      // Get current profile tenant
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', connection.profile_id)
        .single();

      if (profile && profile.tenant_id !== correctTenantId) {
        const { error } = await supabase
          .from('profiles')
          .update({ tenant_id: correctTenantId })
          .eq('id', connection.profile_id);

        if (error) {
          moveErrors++;
        } else {
          moved++;
          if (moved % 20 === 0) {
            console.log('   ✅ Moved', moved, 'profiles to correct tenants...');
          }
        }
      }
    }
  }

  console.log('   Final: Moved', moved, 'profiles to correct tenants,', moveErrors, 'errors');
  console.log('');

  // Step 3: Connect remaining unconnected profiles to Independent Storytellers
  console.log('3. CONNECTING REMAINING PROFILES TO INDEPENDENT STORYTELLERS:');

  const independentOrgId = '0a1bd4a5-5e01-470f-83f6-f55f86c0aa83';
  const independentTenantId = '109f5ad5-8806-4944-838b-b7e1a910aea2';

  // Get current connections after step 1
  const { data: currentConnections } = await supabase
    .from('profile_organizations')
    .select('profile_id');

  const currentConnectedIds = new Set(currentConnections?.map(c => c.profile_id) || []);

  const { data: stillUnconnected } = await supabase
    .from('profiles')
    .select('id, display_name, email')
    .eq('is_storyteller', true);

  const toConnectToIndependent = stillUnconnected?.filter(p => !currentConnectedIds.has(p.id)) || [];

  console.log('   Connecting', toConnectToIndependent.length, 'profiles to Independent Storytellers...');

  let independentConnected = 0;
  let independentErrors = 0;

  for (const profile of toConnectToIndependent) {
    // Connect to Independent Storytellers organization
    const { error: connectError } = await supabase
      .from('profile_organizations')
      .insert({
        profile_id: profile.id,
        organization_id: independentOrgId,
        role: 'storyteller',
        is_active: true,
        joined_at: new Date().toISOString()
      });

    if (connectError) {
      independentErrors++;
      continue;
    }

    // Move to Independent Storytellers tenant
    const { error: moveError } = await supabase
      .from('profiles')
      .update({
        tenant_id: independentTenantId,
        current_organization: 'Independent Storytellers'
      })
      .eq('id', profile.id);

    if (moveError) {
      independentErrors++;
    } else {
      independentConnected++;
      if (independentConnected % 10 === 0) {
        console.log('   ✅ Connected', independentConnected, 'to Independent Storytellers...');
      }
    }
  }

  console.log('   Final: Connected', independentConnected, 'to Independent Storytellers,', independentErrors, 'errors');
  console.log('');

  // Step 4: Final verification
  console.log('4. FINAL VERIFICATION:');

  const { data: finalProfiles } = await supabase
    .from('profiles')
    .select('id')
    .eq('is_storyteller', true);

  const { data: finalConnections } = await supabase
    .from('profile_organizations')
    .select('profile_id');

  const finalConnectedIds = new Set(finalConnections?.map(c => c.profile_id) || []);
  const finalUnconnected = finalProfiles?.filter(p => !finalConnectedIds.has(p.id)) || [];

  console.log('   Total storytellers:', finalProfiles?.length || 0);
  console.log('   Connected:', finalConnectedIds.size);
  console.log('   Still unconnected:', finalUnconnected.length);

  if (finalUnconnected.length === 0) {
    console.log('   🎉 ALL STORYTELLERS NOW CONNECTED TO ORGANIZATIONS!');
  }

  // Organization summary
  const { data: orgSummary } = await supabase
    .from('profile_organizations')
    .select('organization_id, organizations(name)');

  const orgCounts = {};
  orgSummary?.forEach(conn => {
    const orgName = conn.organizations?.name || 'Unknown';
    orgCounts[orgName] = (orgCounts[orgName] || 0) + 1;
  });

  console.log('');
  console.log('5. ORGANIZATION MEMBER COUNTS:');
  Object.keys(orgCounts).sort((a, b) => orgCounts[b] - orgCounts[a]).forEach(orgName => {
    console.log('   • ' + orgName + ': ' + orgCounts[orgName] + ' members');
  });

  console.log('');
  console.log('🎉 ORGANIZATION INFRASTRUCTURE FIX COMPLETE!');
}

fixOrganizationInfrastructure().catch(console.error);