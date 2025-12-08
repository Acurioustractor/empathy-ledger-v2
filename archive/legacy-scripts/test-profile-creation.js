const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProfileCreation() {
  console.log('🧪 Testing profile creation...\n');

  const testData = {
    display_name: 'Test Storyteller',
    full_name: 'Test Storyteller Full',
    first_name: 'Test',
    last_name: 'Storyteller',
    bio: 'Test bio',
    avatar_media_id: null,
    cover_media_id: null,
    email: 'test@example.com',
    phone_number: null,
    tenant_id: null,
    is_storyteller: true,
    tenant_roles: ['storyteller'],
    profile_status: 'pending_activation',
  };

  console.log('📝 Attempting to create profile with data:');
  console.log(JSON.stringify(testData, null, 2));
  console.log('');

  const { data, error } = await supabase
    .from('profiles')
    .insert(testData)
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating profile:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Details:', error.details);
    console.error('Hint:', error.hint);
    console.error('\nFull error:', JSON.stringify(error, null, 2));
    process.exit(1);
  }

  console.log('✅ Profile created successfully!');
  console.log('Profile ID:', data.id);
  console.log('\nFull profile data:');
  console.log(JSON.stringify(data, null, 2));

  // Cleanup
  console.log('\n🧹 Cleaning up test profile...');
  await supabase.from('profiles').delete().eq('id', data.id);
  console.log('✅ Cleanup complete');
}

testProfileCreation().catch(console.error);
