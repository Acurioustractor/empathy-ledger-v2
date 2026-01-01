const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function cleanup() {
  const badProfileId = '197c6c02-da4f-43df-a376-f9242249c297';
  const goodProfileId = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0';

  console.log('=== CLEANING UP KRISTY PROFILE MESS ===\n');

  // 1. Delete fake transcripts from Profile 2
  console.log('1. Deleting fake transcripts from contaminated profile...');
  const { data: badTranscripts } = await supabase
    .from('transcripts')
    .delete()
    .eq('storyteller_id', badProfileId)
    .select('id, title');

  if (badTranscripts) {
    console.log(`   ✓ Deleted ${badTranscripts.length} transcripts:`);
    badTranscripts.forEach(t => console.log(`     - ${t.title}`));
  }

  // 2. Delete Cheryl stories from Profile 2
  console.log('\n2. Deleting contaminated stories from Profile 2...');
  const { data: badStories } = await supabase
    .from('stories')
    .delete()
    .eq('author_id', badProfileId)
    .select('id, title');

  if (badStories) {
    console.log(`   ✓ Deleted ${badStories.length} stories:`);
    badStories.forEach(s => console.log(`     - ${s.title}`));
  }

  // 3. Delete the contaminated profile itself
  console.log('\n3. Deleting contaminated Profile 2...');
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', badProfileId);

  if (profileError) {
    console.log(`   ✗ Error: ${profileError.message}`);
  } else {
    console.log(`   ✓ Deleted profile ${badProfileId}`);
  }

  // 4. Verify the good profile is intact
  console.log('\n4. Verifying correct profile is intact...');
  const { data: goodProfile } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('id', goodProfileId)
    .single();

  console.log(`   ✓ Profile: ${goodProfile?.display_name} (${goodProfile?.id})`);

  const { data: goodTranscripts } = await supabase
    .from('transcripts')
    .select('id, title')
    .eq('storyteller_id', goodProfileId);

  console.log(`   ✓ Transcripts: ${goodTranscripts?.length}`);
  goodTranscripts?.forEach(t => console.log(`     - ${t.title}`));

  const { data: goodStories } = await supabase
    .from('stories')
    .select('id, title')
    .eq('author_id', goodProfileId);

  console.log(`   ✓ Stories: ${goodStories?.length}`);
  goodStories?.forEach(s => console.log(`     - ${s.title}`));

  console.log('\n=== CLEANUP COMPLETE ===');
  console.log(`\n✓ Correct Kristy profile ID: ${goodProfileId}`);
  console.log('✓ Use this URL: http://localhost:3030/storytellers/' + goodProfileId);
}

cleanup();
