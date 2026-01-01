#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findDeadlyHeartsStorytellersMissingFromSnow() {
  const snowTenantId = '96197009-c7bb-4408-89de-cd04085cdf44';
  const deadlyProjectId = '96ded48f-db6e-4962-abab-33c88a123fa9';

  console.log('🔍 Finding Deadly Hearts storytellers who should be in Snow Foundation...\n');

  // We already know these transcripts are linked to the project:
  const { data: deadlyTranscripts } = await supabase
    .from('transcripts')
    .select('storyteller_id, title')
    .eq('project_id', deadlyProjectId)
    .not('storyteller_id', 'is', null);

  console.log(`📝 Found ${deadlyTranscripts?.length || 0} transcripts in Deadly Hearts project:`);

  if (deadlyTranscripts && deadlyTranscripts.length > 0) {
    // Get storyteller details
    const storytellerIds = [...new Set(deadlyTranscripts.map(t => t.storyteller_id))];

    const storytellersToMove = [];

    for (const storytellerId of storytellerIds) {
      const { data: storyteller } = await supabase
        .from('profiles')
        .select('id, display_name, email, tenant_id')
        .eq('id', storytellerId)
        .single();

      if (storyteller) {
        const isInSnow = storyteller.tenant_id === snowTenantId;
        const transcriptTitles = deadlyTranscripts
          .filter(t => t.storyteller_id === storytellerId)
          .map(t => t.title);

        console.log(`\n👤 ${storyteller.display_name || 'No name'} (${storyteller.email || 'No email'})`);
        console.log(`   Current tenant: ${storyteller.tenant_id}`);
        console.log(`   In Snow Foundation: ${isInSnow ? '✅ Already there' : '❌ Missing'}`);
        console.log(`   Transcripts (${transcriptTitles.length}):`);
        transcriptTitles.forEach(title => {
          console.log(`     - ${title}`);
        });

        if (!isInSnow) {
          console.log(`   🔄 SHOULD MOVE TO SNOW FOUNDATION`);
          storytellersToMove.push(storyteller);
        }
      }
    }

    // Get current Snow Foundation members
    const { data: currentSnowMembers } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('tenant_id', snowTenantId);

    console.log(`\n👥 Current Snow Foundation members: ${currentSnowMembers?.length || 0}`);
    currentSnowMembers?.forEach(m => console.log(`   - ${m.display_name}`));

    console.log(`\n📊 SUMMARY:`);
    console.log(`   Current Snow Foundation members: ${currentSnowMembers?.length || 0}`);
    console.log(`   Deadly Hearts storytellers: ${storytellerIds.length}`);
    console.log(`   Need to move to Snow: ${storytellersToMove.length}`);

    if (storytellersToMove.length > 0) {
      console.log(`\n🔄 Storytellers to move:`);
      storytellersToMove.forEach(s => {
        console.log(`   - ${s.display_name} (ID: ${s.id})`);
      });

      // Move them to Snow Foundation
      console.log('\n🔄 Moving storytellers to Snow Foundation...');

      for (const storyteller of storytellersToMove) {
        const { error: moveError } = await supabase
          .from('profiles')
          .update({ tenant_id: snowTenantId })
          .eq('id', storyteller.id);

        if (moveError) {
          console.log(`   ❌ Error moving ${storyteller.display_name}: ${moveError.message}`);
        } else {
          console.log(`   ✅ Moved ${storyteller.display_name} to Snow Foundation`);
        }
      }

      // Check final count
      const { data: finalSnowMembers } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('tenant_id', snowTenantId);

      console.log(`\n🎉 Snow Foundation now has ${finalSnowMembers?.length || 0} members:`);
      finalSnowMembers?.forEach(m => console.log(`   - ${m.display_name}`));
    }
  }
}

findDeadlyHeartsStorytellersMissingFromSnow();