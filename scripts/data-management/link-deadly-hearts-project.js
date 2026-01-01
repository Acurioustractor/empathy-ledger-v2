#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function linkDeadlyHeartsContent() {
  const projectId = '96ded48f-db6e-4962-abab-33c88a123fa9';

  // Get transcripts with 'Deadly' in title
  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('id, title, storyteller_id')
    .ilike('title', '%deadly%');

  console.log('Found transcripts with Deadly in title:');
  const storytellerIds = new Set();

  for (const t of transcripts || []) {
    console.log('  -', t.title, '(storyteller:', t.storyteller_id, ')');
    if (t.storyteller_id) {
      storytellerIds.add(t.storyteller_id);

      // Update transcript to link to project
      await supabase
        .from('transcripts')
        .update({ project_id: projectId })
        .eq('id', t.id);
    }
  }

  console.log('\nUnique storytellers from transcripts:', storytellerIds.size);

  // Get storyteller names
  if (storytellerIds.size > 0) {
    const { data: storytellers } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', Array.from(storytellerIds));

    console.log('\nStorytellers in Deadly Hearts Trek:');
    storytellers?.forEach(s => console.log('  -', s.display_name));

    // Check if project_storytellers table exists and link them
    try {
      const { data: existingLinks } = await supabase
        .from('project_storytellers')
        .select('*')
        .eq('project_id', projectId);

      // Table exists, add links
      for (const storytellerId of storytellerIds) {
        const existing = existingLinks?.find(l => l.storyteller_id === storytellerId);
        if (!existing) {
          const { error } = await supabase
            .from('project_storytellers')
            .insert({
              project_id: projectId,
              storyteller_id: storytellerId,
              role: 'participant'
            });
          if (error) {
            console.log('Error linking storyteller:', error.message);
          }
        }
      }
      console.log('\nLinked storytellers to project via junction table');
    } catch (e) {
      console.log('Junction table may not exist, skipping direct linking');
    }

    // Also create stories from transcripts if they don't exist
    for (const t of transcripts || []) {
      if (t.storyteller_id) {
        // Check if a story exists for this transcript
        const { data: existingStory } = await supabase
          .from('stories')
          .select('id')
          .eq('source_transcript_id', t.id)
          .single();

        if (!existingStory) {
          // Create a story from the transcript
          const { error } = await supabase
            .from('stories')
            .insert({
              title: t.title,
              author_id: t.storyteller_id,
              project_id: projectId,
              source_transcript_id: t.id,
              content: `Story generated from transcript: ${t.title}`,
              status: 'published'
            });

          if (!error) {
            console.log(`Created story from transcript: ${t.title}`);
          }
        }
      }
    }
  }

  console.log('\nDeadly Hearts Trek project data updated!');
}

linkDeadlyHeartsContent();