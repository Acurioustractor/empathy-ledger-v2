const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTAzMjYxNiwiZXhwIjoyMDQ0NjA4NjE2fQ.IC573GA2V5KuSmoenla5FsdQEMhപരත6PqopqhZFxBI'
);

async function checkStorytellers() {
  console.log('\n🔍 Checking Oonchiumpa storytellers AI analysis status...\n');

  // Get organization and tenant info
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, tenant_id')
    .eq('id', 'c53077e1-98de-4216-9149-6268891ff62e')
    .single();

  if (orgError) {
    console.error('❌ Error fetching organization:', orgError);
    return;
  }

  console.log('📋 Organization:', org.name);
  console.log('🔑 Tenant ID:', org.tenant_id);
  console.log('');

  // Get all storytellers for this organization
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .eq('tenant_id', org.tenant_id)
    .contains('tenant_roles', ['storyteller'])
    .order('display_name');

  if (profilesError) {
    console.error('❌ Error fetching profiles:', profilesError);
    return;
  }

  console.log(`📊 Found ${profiles.length} storytellers\n`);

  // Check each storyteller's AI analysis status
  for (const profile of profiles) {
    console.log('━'.repeat(80));
    console.log(`👤 ${profile.display_name || profile.full_name || 'Unknown'}`);
    console.log(`   ID: ${profile.id.substring(0, 8)}...`);

    // Check bio
    const bioLength = profile.bio?.length || 0;
    console.log(`   📝 Bio: ${bioLength > 0 ? `✅ ${bioLength} chars` : '❌ Missing'}`);

    // Check cultural background
    console.log(`   🌏 Cultural Background: ${profile.cultural_background ? '✅ ' + profile.cultural_background : '❌ Missing'}`);

    // Check other AI-generated fields
    console.log(`   🏠 Location: ${profile.location || '❌ Missing'}`);
    console.log(`   🎂 Age: ${profile.age || '❌ Missing'}`);

    // Check for transcripts
    const { data: transcripts, error: transcriptError } = await supabase
      .from('transcripts')
      .select('id, title, status, ai_analysis_status')
      .eq('profile_id', profile.id);

    if (transcriptError) {
      console.log(`   ⚠️  Error fetching transcripts: ${transcriptError.message}`);
    } else {
      console.log(`   📄 Transcripts: ${transcripts.length}`);

      if (transcripts.length > 0) {
        transcripts.forEach((t, idx) => {
          console.log(`      ${idx + 1}. "${t.title || 'Untitled'}" - Status: ${t.status || 'unknown'}, AI: ${t.ai_analysis_status || 'unknown'}`);
        });
      }
    }

    console.log('');
  }

  console.log('━'.repeat(80));
  console.log('\n📊 Summary:');
  const withBio = profiles.filter(p => p.bio?.length > 0).length;
  const withCulturalBg = profiles.filter(p => p.cultural_background).length;
  console.log(`   ✅ With Bio: ${withBio}/${profiles.length}`);
  console.log(`   ✅ With Cultural Background: ${withCulturalBg}/${profiles.length}`);
  console.log('');
}

checkStorytellers().catch(console.error);
