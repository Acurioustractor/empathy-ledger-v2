const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkJoeOrganizationRoles() {
  console.log('=== CHECKING JOE KWON ORGANIZATION ROLES ===');
  console.log('');

  const confitOrgId = 'f7f70fd6-bb60-4004-a910-bafbeb594caf';
  const joeKwonId = 'af4f90cc-e528-4c78-ae9f-e9dd0bde27de';

  // Check organization_roles table
  const { data: orgRoles } = await supabase
    .from('organization_roles')
    .select('*')
    .eq('user_id', joeKwonId);

  console.log(`Joe Kwon organization_roles entries: ${orgRoles?.length || 0}`);
  if (orgRoles) {
    orgRoles.forEach(r => {
      console.log(`  Org: ${r.organization_id}, Role: ${r.role}, Status: ${r.status}`);
    });
  }

  // Check profile_organizations table
  const { data: profileOrgs } = await supabase
    .from('profile_organizations')
    .select('*')
    .eq('profile_id', joeKwonId);

  console.log('');
  console.log(`Joe Kwon profile_organizations entries: ${profileOrgs?.length || 0}`);
  if (profileOrgs) {
    profileOrgs.forEach(po => {
      console.log(`  Org: ${po.organization_id}, Role: ${po.role}, Active: ${po.is_active}`);
    });
  }

  // Check if Joe needs organization_roles entry
  const confitProfileOrg = profileOrgs?.find(po => po.organization_id === confitOrgId);
  const confitOrgRole = orgRoles?.find(r => r.organization_id === confitOrgId);

  if (confitProfileOrg && !confitOrgRole) {
    console.log('');
    console.log('⚠️  Joe has profile_organizations entry but no organization_roles entry for Confit Pathways');
    console.log('Creating organization_roles entry...');

    const { error } = await supabase
      .from('organization_roles')
      .insert({
        user_id: joeKwonId,
        organization_id: confitOrgId,
        role: 'admin',
        status: 'active',
        invited_by: joeKwonId,
        invited_at: new Date().toISOString()
      });

    if (error) {
      console.log(`❌ Failed to create organization role: ${error.message}`);
    } else {
      console.log('✅ Created organization role for Joe Kwon');
    }
  } else if (confitOrgRole) {
    console.log('');
    console.log('✅ Joe already has organization_roles entry for Confit Pathways');
  } else {
    console.log('');
    console.log('⚠️  Joe has no connections to Confit Pathways organization');
  }
}

checkJoeOrganizationRoles().catch(console.error);