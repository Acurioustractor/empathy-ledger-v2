const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function testProfileSchema() {
  // Get one profile to see what fields actually exist
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('Profile fields:');
    console.log(Object.keys(profile).sort());
    console.log('\nSample profile:');
    console.log(JSON.stringify(profile, null, 2));
  }
}

testProfileSchema();
