#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixDeadlyHeartsLinkages() {
  const deadlyProjectId = '96ded48f-db6e-4962-abab-33c88a123fa9';
  const snowTenantId = '96197009-c7bb-4408-89de-cd04085cdf44';
  const snowOrgId = '4a1c31e8-89b7-476d-a74b-0c8b37efc850';

  console.log('🔧 Fixing Deadly Hearts linkages...\n');

  // Find Deadly Hearts transcripts that should be linked to the project
  const deadlyTranscripts = [
    'Deadly Hearts Trek',
    'Heather Mundo - Deadly Hearts Community Story',
    'Cissy Johns - Deadly Hearts Community Story'
  ];

  for (const title of deadlyTranscripts) {
    console.log(`🔗 Linking: ${title}`);

    const { data: transcript, error: findError } = await supabase
      .from('transcripts')
      .select('id, storyteller_id, tenant_id')
      .eq('title', title)
      .single();

    if (findError || !transcript) {
      console.log(`   ❌ Not found or error: ${findError?.message}`);
      continue;
    }

    // Update the transcript to link it to the project
    const { error: updateError } = await supabase
      .from('transcripts')
      .update({
        project_id: deadlyProjectId,
        tenant_id: snowTenantId // Ensure it's in the right tenant
      })
      .eq('id', transcript.id);

    if (updateError) {
      console.log(`   ❌ Error linking: ${updateError.message}`);
    } else {
      console.log('   ✅ Successfully linked to Deadly Hearts project');

      // Check if storyteller needs to be moved to Snow Foundation tenant
      if (transcript.storyteller_id && transcript.tenant_id !== snowTenantId) {
        console.log('   👤 Moving storyteller to Snow Foundation tenant...');

        const { data: storyteller } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('id', transcript.storyteller_id)
          .single();

        const { error: moveError } = await supabase
          .from('profiles')
          .update({ tenant_id: snowTenantId })
          .eq('id', transcript.storyteller_id);

        if (moveError) {
          console.log(`   ❌ Error moving storyteller: ${moveError.message}`);
        } else {
          console.log(`   ✅ Moved storyteller to Snow Foundation: ${storyteller?.display_name || 'Unknown'}`);

          // Create organization role for the storyteller
          const { error: roleError } = await supabase
            .from('organization_roles')
            .insert({
              organization_id: snowOrgId,
              profile_id: transcript.storyteller_id,
              role: 'member',
              tenant_id: snowTenantId
            });

          if (roleError && !roleError.message.includes('duplicate')) {
            console.log(`   ⚠️  Could not create org role: ${roleError.message}`);
          } else {
            console.log('   ✅ Created organization membership');
          }
        }
      }
    }
  }

  // Verify the project now has content
  const { data: verifyStories } = await supabase
    .from('stories')
    .select('id, title')
    .eq('project_id', deadlyProjectId);

  const { data: verifyTranscripts } = await supabase
    .from('transcripts')
    .select('id, title')
    .eq('project_id', deadlyProjectId);

  console.log('\n✅ Deadly Hearts project now has:');
  console.log(`   Stories: ${verifyStories?.length || 0}`);
  console.log(`   Transcripts: ${verifyTranscripts?.length || 0}`);

  if (verifyTranscripts && verifyTranscripts.length > 0) {
    console.log('\n📝 Linked transcripts:');
    verifyTranscripts.forEach(t => console.log(`   - ${t.title}`));
  }

  // Check Snow Foundation member count
  const { count: memberCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', snowTenantId);

  console.log(`\n👥 Snow Foundation now has ${memberCount} members`);
}

fixDeadlyHeartsLinkages();