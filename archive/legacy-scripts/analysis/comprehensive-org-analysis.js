const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function comprehensiveOrganizationProfileAnalysis() {
  console.log('=== COMPREHENSIVE ORGANIZATION-PROFILE RELATIONSHIP ANALYSIS ===');
  console.log('');

  // 1. Get all organizations
  const { data: allOrgs } = await supabase
    .from('organizations')
    .select('id, name, tenant_id, type')
    .order('name');

  console.log('1. ALL ORGANIZATIONS (' + (allOrgs?.length || 0) + '):');
  allOrgs?.forEach((org, i) => {
    console.log('  ' + (i + 1) + '. ' + org.name + ' (' + org.type + ')');
    console.log('     ID: ' + org.id);
    console.log('     Tenant: ' + org.tenant_id);
  });

  console.log('');

  // 2. Get profile-organization connections
  const { data: connections } = await supabase
    .from('profile_organizations')
    .select('organization_id, profile_id, role, profiles(display_name, email), organizations(name)');

  console.log('2. PROFILE-ORGANIZATION CONNECTIONS (' + (connections?.length || 0) + '):');

  // Group by organization
  const orgConnections = {};
  connections?.forEach(conn => {
    const orgName = conn.organizations?.name || 'Unknown';
    if (!orgConnections[orgName]) orgConnections[orgName] = [];
    orgConnections[orgName].push(conn);
  });

  Object.keys(orgConnections).forEach(orgName => {
    const conns = orgConnections[orgName];
    console.log('  • ' + orgName + ': ' + conns.length + ' members');
    conns.forEach(c => {
      const name = c.profiles?.display_name || c.profiles?.email || c.profile_id;
      console.log('    - ' + name + ' (' + c.role + ')');
    });
  });

  console.log('');

  // 3. Find unconnected profiles
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, display_name, email, current_organization, is_storyteller')
    .eq('is_storyteller', true);

  const connectedIds = new Set(connections?.map(c => c.profile_id) || []);
  const unconnected = allProfiles?.filter(p => !connectedIds.has(p.id)) || [];

  console.log('3. UNCONNECTED STORYTELLERS (' + unconnected.length + '):');
  unconnected.slice(0, 15).forEach(p => {
    console.log('  • ' + (p.display_name || p.email || p.id));
    if (p.current_organization) {
      console.log('    Claims org: ' + p.current_organization);
    }
  });
  if (unconnected.length > 15) {
    console.log('  ... and ' + (unconnected.length - 15) + ' more');
  }

  console.log('');

  // 4. Analyze by current_organization field
  console.log('4. PROFILES BY current_organization FIELD:');
  const orgClaims = {};
  allProfiles?.forEach(p => {
    const org = p.current_organization || 'None';
    if (!orgClaims[org]) orgClaims[org] = [];
    orgClaims[org].push(p);
  });

  Object.keys(orgClaims).sort((a, b) => orgClaims[b].length - orgClaims[a].length).forEach(org => {
    const profiles = orgClaims[org];
    const connected = profiles.filter(p => connectedIds.has(p.id)).length;
    console.log('  • ' + org + ': ' + profiles.length + ' profiles (' + connected + ' connected, ' + (profiles.length - connected) + ' unconnected)');
  });

  console.log('');

  // 5. Find organizations with no members
  const orgsWithMembers = new Set(connections?.map(c => c.organization_id) || []);
  const emptyOrgs = allOrgs?.filter(org => !orgsWithMembers.has(org.id)) || [];

  console.log('5. ORGANIZATIONS WITH NO MEMBERS (' + emptyOrgs.length + '):');
  emptyOrgs.forEach(org => {
    console.log('  • ' + org.name + ' (' + org.type + ')');
  });

  console.log('');

  // 6. Check projects associations
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, organization_id, organizations(name)');

  console.log('6. PROJECTS BY ORGANIZATION (' + (projects?.length || 0) + ' total):');
  const projByOrg = {};
  projects?.forEach(p => {
    const orgName = p.organizations?.name || 'Unknown';
    if (!projByOrg[orgName]) projByOrg[orgName] = [];
    projByOrg[orgName].push(p);
  });

  Object.keys(projByOrg).forEach(orgName => {
    console.log('  • ' + orgName + ': ' + projByOrg[orgName].length + ' projects');
    projByOrg[orgName].slice(0, 3).forEach(p => {
      console.log('    - ' + p.name);
    });
    if (projByOrg[orgName].length > 3) {
      console.log('    ... and ' + (projByOrg[orgName].length - 3) + ' more');
    }
  });
}

comprehensiveOrganizationProfileAnalysis().catch(console.error);