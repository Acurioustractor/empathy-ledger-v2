const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function checkOonchiumpa() {
  const orgId = 'c53077e1-98de-4216-9149-6268891ff62e';

  // Check community_roles in profiles for organization reference
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, display_name, bio, community_roles')
    .limit(100);

  if (profilesError) {
    console.log('Error:', profilesError.message);
    return;
  }

  console.log('Checking profiles with Oonchiumpa in community_roles...\n');

  const oonchiumpaProfiles = profiles.filter(p => {
    if (!p.community_roles) return false;
    const roles = Array.isArray(p.community_roles) ? p.community_roles : [];
    return roles.some(role =>
      role.organization_id === orgId ||
      role.organisation_id === orgId
    );
  });

  console.log(`Found ${oonchiumpaProfiles.length} profiles tagged with Oonchiumpa:\n`);
  oonchiumpaProfiles.forEach(p => {
    console.log(`- ${p.display_name} (${p.id})`);
    console.log(`  Bio: ${p.bio ? p.bio.substring(0, 100) : 'N/A'}`);
    console.log(`  Roles: ${JSON.stringify(p.community_roles)}`);
    console.log('');
  });
}

checkOonchiumpa();
