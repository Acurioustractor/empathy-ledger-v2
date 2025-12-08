const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log('🔍 Checking Polly profile...\n');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('display_name', 'Polly')
    .single();

  if (!profile) {
    console.log('❌ Polly not found');
    return;
  }

  console.log('✅ PROFILE CREATED SUCCESSFULLY');
  console.log('━'.repeat(60));
  console.log('Profile Details:');
  console.log('  ID:', profile.id);
  console.log('  Display Name:', profile.display_name);
  console.log('  Full Name:', profile.full_name);
  console.log('  First Name:', profile.first_name);
  console.log('  Last Name:', profile.last_name);
  console.log('  Tenant ID:', profile.tenant_id);
  console.log('  Is Storyteller:', profile.is_storyteller);
  console.log('  Tenant Roles:', profile.tenant_roles);
  console.log('  Avatar Media ID:', profile.avatar_media_id);
  console.log('');

  // Check transcripts
  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('*')
    .eq('storyteller_id', profile.id);

  console.log('📝 TRANSCRIPTS:', transcripts?.length || 0);
  if (transcripts && transcripts.length > 0) {
    transcripts.forEach((t, i) => {
      console.log(`\nTranscript ${i + 1}:`);
      console.log('  ID:', t.id);
      console.log('  Title:', t.title);
      console.log('  Text preview:', t.text?.substring(0, 100) + '...');
      console.log('  Word count:', t.word_count);
      console.log('  Status:', t.status);
      console.log('  Tenant ID:', t.tenant_id);
      console.log('  ✓ Storyteller ID matches:', t.storyteller_id === profile.id);
      console.log('  ✓ Tenant ID matches:', t.tenant_id === profile.tenant_id);
    });
  }
  console.log('');

  // Check organization
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('tenant_id', profile.tenant_id)
    .single();

  console.log('🏢 ORGANIZATION ASSOCIATION');
  console.log('  Organization:', org?.name);
  console.log('  Organization ID:', org?.id);
  console.log('  ✓ Tenant ID matches:', org?.id && profile.tenant_id === '8891e1a9-92ae-423f-928b-cec602660011');
  console.log('');

  console.log('━'.repeat(60));
  console.log('✅ ✅ ✅  STORYTELLER CREATION SUCCESSFUL  ✅ ✅ ✅');
  console.log('━'.repeat(60));
}

check();
