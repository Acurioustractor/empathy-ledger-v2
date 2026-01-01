#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function linkSnowFoundationStorytellers() {
  const snowTenantId = '96197009-c7bb-4408-89de-cd04085cdf44';
  const deadlyProjectId = '96ded48f-db6e-4962-abab-33c88a123fa9';

  console.log('🌟 LINKING STORYTELLERS TO SNOW FOUNDATION\n');

  // 1. Find all transcripts that should be linked to Deadly Hearts Trek project
  console.log('🔍 Step 1: Finding relevant storytellers...\n');

  // Get storytellers with Indigenous/cultural content
  const { data: culturalTranscripts } = await supabase
    .from('transcripts')
    .select('id, title, storyteller_id, project_id, profiles(id, display_name, tenant_id)')
    .or('title.ilike.%aunty%,title.ilike.%uncle%,title.ilike.%elder%,title.ilike.%community%,title.ilike.%cultural%,title.ilike.%deadly%,title.ilike.%heart%')
    .not('storyteller_id', 'is', null);

  console.log(`📝 Found ${culturalTranscripts?.length || 0} transcripts with cultural/community content:`);

  const storytellersToMove = new Set();
  const transcriptsToLink = [];

  culturalTranscripts?.forEach(transcript => {
    console.log(`   - "${transcript.title}"`);
    console.log(`     Storyteller: ${transcript.profiles?.display_name}`);
    console.log(`     Current tenant: ${transcript.profiles?.tenant_id}`);
    console.log(`     Current project: ${transcript.project_id || 'None'}`);

    // Mark storyteller for moving to Snow Foundation if not already there
    if (transcript.profiles?.tenant_id !== snowTenantId) {
      storytellersToMove.add({
        id: transcript.storyteller_id,
        name: transcript.profiles?.display_name,
        currentTenant: transcript.profiles?.tenant_id
      });
    }

    // Mark transcript for linking to Deadly Hearts Trek if culturally relevant
    if (transcript.title.toLowerCase().includes('aunty') ||
        transcript.title.toLowerCase().includes('uncle') ||
        transcript.title.toLowerCase().includes('elder') ||
        transcript.title.toLowerCase().includes('deadly') ||
        transcript.title.toLowerCase().includes('heart')) {
      transcriptsToLink.push({
        id: transcript.id,
        title: transcript.title,
        storytellerId: transcript.storyteller_id,
        currentProject: transcript.project_id
      });
    }
    console.log('');
  });

  // 2. Move storytellers to Snow Foundation
  console.log(`\n🔄 Step 2: Moving ${storytellersToMove.size} storytellers to Snow Foundation...\n`);

  for (const storyteller of storytellersToMove) {
    console.log(`Moving ${storyteller.name} to Snow Foundation...`);

    const { error } = await supabase
      .from('profiles')
      .update({ tenant_id: snowTenantId })
      .eq('id', storyteller.id);

    if (error) {
      console.log(`❌ Error moving ${storyteller.name}: ${error.message}`);
    } else {
      console.log(`✅ Moved ${storyteller.name} to Snow Foundation`);
    }
  }

  // 3. Link transcripts to Deadly Hearts Trek project
  console.log(`\n🔗 Step 3: Linking ${transcriptsToLink.length} transcripts to Deadly Hearts Trek project...\n`);

  for (const transcript of transcriptsToLink) {
    if (transcript.currentProject !== deadlyProjectId) {
      console.log(`Linking "${transcript.title}" to Deadly Hearts Trek...`);

      const { error } = await supabase
        .from('transcripts')
        .update({ project_id: deadlyProjectId })
        .eq('id', transcript.id);

      if (error) {
        console.log(`❌ Error linking transcript: ${error.message}`);
      } else {
        console.log(`✅ Linked "${transcript.title}" to Deadly Hearts Trek`);
      }
    } else {
      console.log(`✅ "${transcript.title}" already linked to Deadly Hearts Trek`);
    }
  }

  // 4. Final summary
  console.log('\n📊 FINAL SNOW FOUNDATION SUMMARY:\n');

  const { data: finalMembers } = await supabase
    .from('profiles')
    .select('display_name, email')
    .eq('tenant_id', snowTenantId);

  console.log(`👥 Snow Foundation members (${finalMembers?.length || 0}):`);
  finalMembers?.forEach(member => {
    console.log(`   - ${member.display_name} (${member.email})`);
  });

  const { data: projectTranscripts } = await supabase
    .from('transcripts')
    .select('title, profiles(display_name)')
    .eq('project_id', deadlyProjectId);

  console.log(`\n📖 Deadly Hearts Trek project transcripts (${projectTranscripts?.length || 0}):`);
  projectTranscripts?.forEach(transcript => {
    console.log(`   - "${transcript.title}" by ${transcript.profiles?.display_name}`);
  });

  console.log('\n✨ Snow Foundation storyteller structure is now aligned!');
  console.log('🏢 Members: People with organizational roles/functions');
  console.log('📖 Storytellers: People whose stories contribute to Snow Foundation impact');
}

linkSnowFoundationStorytellers();