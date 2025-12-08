const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verify() {
  console.log('🔍 Looking for Pollyanna Knight...\n');

  // Find profile
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .ilike('display_name', '%pollyanna%')
    .order('created_at', { ascending: false });

  if (profileError) {
    console.error('❌ Profile error:', profileError.message);
    return;
  }

  console.log(`✅ Found ${profiles.length} Pollyanna profile(s)\n`);

  for (const profile of profiles) {
    console.log('━'.repeat(60));
    console.log('Profile:');
    console.log('  ID:', profile.id);
    console.log('  Display Name:', profile.display_name);
    console.log('  Full Name:', profile.full_name);
    console.log('  Tenant ID:', profile.tenant_id);
    console.log('  Is Storyteller:', profile.is_storyteller);
    console.log('  Tenant Roles:', profile.tenant_roles);
    console.log('  Created At:', profile.created_at);
    console.log('');

    // Find transcript
    const { data: transcripts } = await supabase
      .from('transcripts')
      .select('id, title, text, storyteller_id, tenant_id, created_at')
      .eq('storyteller_id', profile.id);

    console.log('📝 Transcripts:', transcripts?.length || 0);
    if (transcripts && transcripts.length > 0) {
      transcripts.forEach(t => {
        console.log('  - Title:', t.title);
        console.log('    Text length:', t.text?.length || 0, 'characters');
        console.log('    Created:', t.created_at);
        console.log('    ✓ Storyteller ID matches:', t.storyteller_id === profile.id);
        console.log('    ✓ Tenant ID matches:', t.tenant_id === profile.tenant_id);
      });
    }
    console.log('');

    // Check organization association
    const { data: org } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (org) {
      console.log('🏢 Organization:', org.name);
      console.log('  Organization ID:', org.id);
    }
    console.log('');
  }

  console.log('━'.repeat(60));
  console.log('✅ Verification complete!');
}

verify();
