#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findMoreDeadlyHeartsStorytellers() {
  const projectId = '96ded48f-db6e-4962-abab-33c88a123fa9';

  // Find storytellers who mention Deadly Hearts in their bio
  const { data: storytellers } = await supabase
    .from('profiles')
    .select('id, display_name, bio')
    .or('bio.ilike.%deadly hearts%,display_name.ilike.%deadly%');

  console.log('Storytellers mentioning Deadly Hearts in bio or name:');
  const storytellerIds = new Set();

  for (const s of storytellers || []) {
    console.log('  -', s.display_name);
    storytellerIds.add(s.id);
  }

  // Check who's already linked
  const { data: existingLinks } = await supabase
    .from('project_storytellers')
    .select('storyteller_id')
    .eq('project_id', projectId);

  const alreadyLinked = new Set(existingLinks?.map(l => l.storyteller_id) || []);

  // Add missing storytellers
  let added = 0;
  for (const storytellerId of storytellerIds) {
    if (!alreadyLinked.has(storytellerId)) {
      const { error } = await supabase
        .from('project_storytellers')
        .insert({
          project_id: projectId,
          storyteller_id: storytellerId,
          role: 'participant'
        });
      if (!error) {
        added++;
      } else {
        console.log('Error adding storyteller:', error.message);
      }
    }
  }

  console.log('\nAdded', added, 'more storytellers to Deadly Hearts Trek');

  // Final count
  const { data: finalLinks } = await supabase
    .from('project_storytellers')
    .select('*')
    .eq('project_id', projectId);

  console.log('Total storytellers in Deadly Hearts Trek:', finalLinks?.length || 0);

  // Also show their names
  if (finalLinks && finalLinks.length > 0) {
    const storytellerIds = finalLinks.map(l => l.storyteller_id);
    const { data: allStorytellers } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', storytellerIds);

    console.log('\nAll Deadly Hearts Trek storytellers:');
    allStorytellers?.forEach(s => console.log('  -', s.display_name));
  }
}

findMoreDeadlyHeartsStorytellers();