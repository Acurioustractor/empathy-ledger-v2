#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeDeadlyHeartTrek() {
  const deadlyProjectId = '96ded48f-db6e-4962-abab-33c88a123fa9';
  const snowTenantId = '96197009-c7bb-4408-89de-cd04085cdf44';

  console.log('🎯 Analyzing Deadly Heart Trek project content...\n');

  // Get all stories in this project
  const { data: stories } = await supabase
    .from('stories')
    .select('id, title, storyteller_id, tenant_id')
    .eq('project_id', deadlyProjectId);

  // Get all transcripts in this project
  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('id, title, storyteller_id, tenant_id')
    .eq('project_id', deadlyProjectId);

  console.log(`📖 Stories in Deadly Heart Trek: ${stories?.length || 0}`);
  console.log(`📝 Transcripts in Deadly Heart Trek: ${transcripts?.length || 0}`);

  const allContent = [...(stories || []), ...(transcripts || [])];
  const storytellerIds = [...new Set(allContent.map(c => c.storyteller_id).filter(id => id))];

  console.log(`\n👥 Unique storytellers involved: ${storytellerIds.length}`);

  if (storytellerIds.length > 0) {
    console.log('\n📋 Storytellers in Deadly Heart Trek:');

    for (const storytellerId of storytellerIds) {
      const { data: storyteller } = await supabase
        .from('profiles')
        .select('id, display_name, email, tenant_id')
        .eq('id', storytellerId)
        .single();

      if (storyteller) {
        const isInSnowTenant = storyteller.tenant_id === snowTenantId;
        const contentItems = allContent.filter(c => c.storyteller_id === storytellerId && c.title);

        console.log(`   - ${storyteller.display_name || 'No name'} (${storyteller.email || 'No email'})`);
        console.log(`     ID: ${storyteller.id}`);
        console.log(`     Tenant: ${storyteller.tenant_id} ${isInSnowTenant ? '✅ Snow Foundation' : '❌ Different tenant'}`);
        console.log(`     Content: ${contentItems.length} items`);

        if (contentItems.length > 0) {
          contentItems.forEach(s => console.log(`       - ${s.title}`));
        }
        console.log('');
      }
    }
  }

  // Check for orphaned content (no storyteller assigned)
  const orphanedContent = allContent.filter(c => !c.storyteller_id);
  if (orphanedContent.length > 0) {
    console.log(`\n👻 Orphaned content (no storyteller): ${orphanedContent.length}`);
    orphanedContent.forEach(c => console.log(`   - ${c.title}`));
  }

  // List all content for debugging
  console.log('\n📄 All content in Deadly Heart Trek:');
  allContent.forEach(c => {
    console.log(`   - ${c.title} (storyteller: ${c.storyteller_id || 'none'})`);
  });

  // Summary recommendations
  console.log('\n📊 ANALYSIS SUMMARY:');
  const wrongTenantStorytellerIds = storytellerIds.filter(id => {
    const content = allContent.find(c => c.storyteller_id === id);
    return content && content.tenant_id !== snowTenantId;
  });

  console.log(`- Total storytellers: ${storytellerIds.length}`);
  console.log(`- In wrong tenant: ${wrongTenantStorytellerIds.length}`);
  console.log(`- Orphaned content: ${orphanedContent.length}`);

  if (wrongTenantStorytellerIds.length > 0) {
    console.log('\n🔧 STORYTELLERS TO MOVE TO SNOW FOUNDATION:');
    for (const id of wrongTenantStorytellerIds) {
      const { data: storyteller } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', id)
        .single();
      console.log(`   - ${storyteller?.display_name || 'No name'} (${storyteller?.email || 'No email'}) [ID: ${id}]`);
    }
  }
}

analyzeDeadlyHeartTrek();