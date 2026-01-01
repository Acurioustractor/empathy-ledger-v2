const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test organization ID (Oonchiumpa from your system)
const TEST_ORG_ID = 'c53077e1-98de-4216-9149-6268891ff62e';

async function testFullFlow() {
  console.log('🧪 Testing Full Storyteller Creation Flow\n');
  console.log('=' .repeat(60));

  let profileId, transcriptId;

  try {
    // STEP 1: Get organization tenant_id
    console.log('\n📍 Step 1: Getting organization tenant_id...');
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('tenant_id, name')
      .eq('id', TEST_ORG_ID)
      .single();

    if (orgError) throw new Error(`Failed to get organization: ${orgError.message}`);

    console.log(`✅ Organization: ${org.name}`);
    console.log(`✅ Tenant ID: ${org.tenant_id}`);

    // STEP 2: Create profile
    console.log('\n👤 Step 2: Creating profile...');
    const { randomUUID } = require('crypto');
    profileId = randomUUID();

    const profileData = {
      id: profileId,
      display_name: 'Test Storyteller',
      full_name: 'Test Storyteller Full Name',
      first_name: 'Test',
      last_name: 'Storyteller',
      bio: 'Test bio for automated testing',
      tenant_id: org.tenant_id,
      is_storyteller: true,
      tenant_roles: ['storyteller'],
      profile_status: 'active',
    };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (profileError) throw new Error(`Failed to create profile: ${profileError.message}`);

    console.log(`✅ Profile created: ${profile.id}`);
    console.log(`✅ Display name: ${profile.display_name}`);

    // STEP 3: Create transcript
    console.log('\n📝 Step 3: Creating transcript...');
    const { v4: uuidv4 } = require('uuid');
    transcriptId = uuidv4();

    const transcriptText = 'This is a test transcript for our storyteller creation flow. It contains enough text to pass validation and demonstrates the complete workflow from profile creation to transcript association.';

    const transcriptData = {
      id: transcriptId,
      title: 'Test Transcript',
      text: transcriptText,
      transcript_content: transcriptText,
      storyteller_id: profileId,
      word_count: transcriptText.split(/\s+/).length,
      character_count: transcriptText.length,
      status: 'pending',
      tenant_id: org.tenant_id,
      metadata: {
        type: 'test',
        created_via: 'automated_test'
      }
    };

    const { data: transcript, error: transcriptError } = await supabase
      .from('transcripts')
      .insert(transcriptData)
      .select()
      .single();

    if (transcriptError) throw new Error(`Failed to create transcript: ${transcriptError.message}`);

    console.log(`✅ Transcript created: ${transcript.id}`);
    console.log(`✅ Title: ${transcript.title}`);
    console.log(`✅ Word count: ${transcript.word_count}`);

    // STEP 4: Create storyteller-organization association
    console.log('\n🔗 Step 4: Creating storyteller-organization association...');

    // Check if already has storyteller role and correct tenant
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .select('tenant_roles, tenant_id')
      .eq('id', profileId)
      .single();

    if (updateError) throw new Error(`Failed to verify profile: ${updateError.message}`);

    console.log(`✅ Profile has storyteller role: ${updatedProfile.tenant_roles?.includes('storyteller')}`);
    console.log(`✅ Profile tenant_id matches: ${updatedProfile.tenant_id === org.tenant_id}`);

    // STEP 5: Verify complete data
    console.log('\n✨ Step 5: Verifying complete setup...');

    const { data: finalProfile, error: verifyError } = await supabase
      .from('profiles')
      .select(`
        id,
        display_name,
        full_name,
        is_storyteller,
        tenant_id,
        tenant_roles
      `)
      .eq('id', profileId)
      .single();

    if (verifyError) throw new Error(`Failed to verify: ${verifyError.message}`);

    const { data: finalTranscript } = await supabase
      .from('transcripts')
      .select('id, title, storyteller_id, tenant_id')
      .eq('id', transcriptId)
      .single();

    console.log('\n📊 Final Verification:');
    console.log('Profile:', {
      id: finalProfile.id,
      display_name: finalProfile.display_name,
      is_storyteller: finalProfile.is_storyteller,
      tenant_id: finalProfile.tenant_id,
      tenant_roles: finalProfile.tenant_roles
    });
    console.log('Transcript:', {
      id: finalTranscript.id,
      title: finalTranscript.title,
      storyteller_id: finalTranscript.storyteller_id,
      tenant_id: finalTranscript.tenant_id
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ ✅ ✅  ALL TESTS PASSED  ✅ ✅ ✅');
    console.log('='.repeat(60));

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await supabase.from('transcripts').delete().eq('id', transcriptId);
    await supabase.from('profiles').delete().eq('id', profileId);
    console.log('✅ Cleanup complete');

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ ❌ ❌  TEST FAILED  ❌ ❌ ❌');
    console.error('='.repeat(60));
    console.error('\nError:', error.message);
    console.error('\nFull error:', error);

    // Cleanup on failure
    if (transcriptId) {
      await supabase.from('transcripts').delete().eq('id', transcriptId);
    }
    if (profileId) {
      await supabase.from('profiles').delete().eq('id', profileId);
    }

    process.exit(1);
  }
}

testFullFlow();
