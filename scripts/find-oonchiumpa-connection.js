const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function findOonchiumpaConnection() {
  const orgId = 'c53077e1-98de-4216-9149-6268891ff62e';

  // First get the organization's tenant_id
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, tenant_id')
    .eq('id', orgId)
    .single();

  if (orgError) {
    console.log('Error:', orgError.message);
    return;
  }

  console.log('Organization:', org);
  console.log('\n---\n');

  // Now find profiles by tenant_id with storyteller role
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, display_name, full_name, tenant_id, tenant_roles, is_storyteller')
    .eq('tenant_id', org.tenant_id)
    .contains('tenant_roles', ['storyteller']);

  if (profilesError) {
    console.log('Error:', profilesError.message);
    return;
  }

  console.log(`Found ${profiles.length} profiles with tenant_id=${org.tenant_id} and storyteller role:\n`);
  profiles.forEach(p => {
    console.log(`- ${p.display_name || p.full_name}`);
    console.log(`  ID: ${p.id}`);
    console.log(`  Tenant ID: ${p.tenant_id}`);
    console.log(`  Tenant Roles: ${JSON.stringify(p.tenant_roles)}`);
    console.log(`  Is Storyteller: ${p.is_storyteller}`);
    console.log('');
  });
}

findOonchiumpaConnection();
