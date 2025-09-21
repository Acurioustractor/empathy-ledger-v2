const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testDeleteAPI() {
  console.log('=== TESTING TRANSCRIPT DELETE API ===');
  console.log('');

  // Test deleting the 'tets' transcript (one of the smaller test ones)
  const transcriptId = '8328db1c-f4fd-42bc-847a-3d5be3132db2'; // 'tets' transcript

  console.log(`Testing deletion of transcript: tets (ID: ${transcriptId})`);
  console.log('');

  // First verify the transcript exists
  const { data: transcript, error: fetchError } = await supabase
    .from('transcripts')
    .select('id, title, storyteller_id')
    .eq('id', transcriptId)
    .single();

  if (fetchError || !transcript) {
    console.log('❌ Transcript not found or already deleted');
    return;
  }

  console.log(`✅ Transcript found: "${transcript.title}"`);
  console.log(`   Owner: ${transcript.storyteller_id}`);
  console.log('');

  // Test the delete operation
  console.log('🗑️ Deleting transcript...');
  const { error: deleteError } = await supabase
    .from('transcripts')
    .delete()
    .eq('id', transcriptId);

  if (deleteError) {
    console.log(`❌ Delete failed: ${deleteError.message}`);
  } else {
    console.log('✅ Transcript deleted successfully!');
    console.log('');
    console.log('Verification - checking if transcript still exists...');

    const { data: checkTranscript } = await supabase
      .from('transcripts')
      .select('id')
      .eq('id', transcriptId)
      .single();

    if (checkTranscript) {
      console.log('❌ Transcript still exists - deletion may have failed');
    } else {
      console.log('✅ Transcript successfully removed from database');
    }
  }

  // Show remaining transcripts
  console.log('');
  console.log('REMAINING JOE KWON TRANSCRIPTS:');
  const { data: remaining } = await supabase
    .from('transcripts')
    .select('id, title, status, word_count')
    .eq('storyteller_id', 'af4f90cc-e528-4c78-ae9f-e9dd0bde27de')
    .order('created_at', { ascending: false });

  if (remaining && remaining.length > 0) {
    remaining.forEach((t, index) => {
      console.log(`  ${index + 1}. ${t.title || 'Untitled'} (${t.word_count} words)`);
    });
  } else {
    console.log('  No transcripts remaining');
  }
}

testDeleteAPI().catch(console.error);