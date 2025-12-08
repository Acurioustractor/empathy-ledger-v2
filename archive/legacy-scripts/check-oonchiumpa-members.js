const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function checkOonchiumpaMembers() {
  const orgId = 'c53077e1-98de-4216-9149-6268891ff62e';

  // Find all profiles with organization_id
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, display_name, bio')
    .eq('organization_id', orgId);

  if (profilesError) {
    console.log('Profiles error:', profilesError.message);

    // Try storytellers table
    const { data: storytellers, error: storytellersError } = await supabase
      .from('storytellers')
      .select('id, full_name, bio, organization_id')
      .eq('organization_id', orgId);

    if (storytellersError) {
      console.log('Storytellers error:', storytellersError.message);
    } else {
      console.log('\nStorytellers tagged with Oonchiumpa:');
      console.log(JSON.stringify(storytellers, null, 2));
    }
  } else {
    console.log('\nProfiles tagged with Oonchiumpa:');
    console.log(JSON.stringify(profiles, null, 2));
  }
}

checkOonchiumpaMembers();
