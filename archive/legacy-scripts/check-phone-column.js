const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function checkPhoneColumn() {
  // Get one profile to see what fields exist
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('Profile fields:');
    const fields = Object.keys(profile).sort();

    // Check for phone-related fields
    const phoneFields = fields.filter(f => f.toLowerCase().includes('phone'));

    console.log('\nPhone-related fields found:');
    if (phoneFields.length > 0) {
      phoneFields.forEach(f => console.log(`  - ${f}`));
    } else {
      console.log('  (none - phone_number column does not exist)');
    }

    console.log('\nAll fields:');
    console.log(fields.join(', '));
  }
}

checkPhoneColumn();
