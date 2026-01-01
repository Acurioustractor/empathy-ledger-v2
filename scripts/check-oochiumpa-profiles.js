const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function checkOochiumpaProfiles() {
  // First, list ALL organizations to see what's there
  const { data: allOrgs, error: allError } = await supabase
    .from('organizations')
    .select('id, name')
    .limit(20);

  if (allError) {
    console.log('Error fetching organizations:', allError.message);
    return;
  }

  console.log('ALL ORGANIZATIONS IN DATABASE:');
  console.log(JSON.stringify(allOrgs, null, 2));

  // Now find Oonchiumpa organization
  const { data: orgs, error: orgError } = await supabase
    .from('organizations')
    .select('id, name')
    .ilike('name', '%oonch%');

  if (orgError) {
    console.log('Organization error:', orgError.message);
    return;
  }

  if (!orgs || orgs.length === 0) {
    console.log('\nNo organizations found matching "ooch"');
    return;
  }

  console.log('\nFound matching organizations:', orgs);

  for (const org of orgs) {
    console.log(`\nChecking members for: ${org.name}`);

    // Find all members
    const { data: members, error: membersError } = await supabase
      .from('organisation_members')
      .select(`
        profile_id,
        role,
        profiles (
          id,
          display_name,
          bio
        )
      `)
      .eq('organisation_id', org.id);

    if (membersError) {
      console.log('Members error:', membersError.message);
    } else {
      console.log('\nProfiles tagged with Oochiumpa:');
      console.log(JSON.stringify(members, null, 2));
    }
  }
}

checkOochiumpaProfiles();
