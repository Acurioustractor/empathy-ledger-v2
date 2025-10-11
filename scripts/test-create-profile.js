const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function testCreateProfile() {
  const testData = {
    full_name: 'Test Phone Only User',
    display_name: 'Test Phone',
    email: null,
    phone_number: '0400123456',
    bio: 'Test bio',
    tenant_id: '8891e1a9-92ae-423f-928b-cec602660011',
    tenant_roles: ['storyteller'],
    is_storyteller: true,
    profile_status: 'pending',
    onboarding_completed: false
  };

  console.log('Attempting to create profile with:');
  console.log(JSON.stringify(testData, null, 2));
  console.log('');

  const { data, error } = await supabase
    .from('profiles')
    .insert(testData)
    .select()
    .single();

  if (error) {
    console.log('❌ Error:', error);
    console.log('Code:', error.code);
    console.log('Details:', error.details);
    console.log('Hint:', error.hint);
    console.log('Message:', error.message);
  } else {
    console.log('✅ Success! Created profile:');
    console.log(data);

    // Clean up - delete the test profile
    await supabase.from('profiles').delete().eq('id', data.id);
    console.log('\n✅ Test profile deleted');
  }
}

testCreateProfile();
