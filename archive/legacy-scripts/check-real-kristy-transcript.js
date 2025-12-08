const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function checkRealTranscript() {
  const { data, error } = await supabase
    .from('transcripts')
    .select('*')
    .eq('id', 'f5e322b9-7009-4e41-88e6-2f154448ffd0')
    .single();

  console.log('=== REAL KRISTY TRANSCRIPT ===\n');

  if (error) {
    console.log('Error:', error.message);
    return;
  }

  console.log('ID:', data.id);
  console.log('Title:', data.title);
  console.log('Storyteller ID:', data.storyteller_id);
  console.log('Status:', data.status || data.processing_status);
  console.log('Created:', data.created_at);
  console.log('\nContent:');
  console.log(data.transcript_content || data.content);

  // Now check if this storyteller_id matches Kristy
  console.log('\n=== CHECKING PROFILE MATCH ===');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('id', data.storyteller_id)
    .single();

  if (profile) {
    console.log('Profile Name:', profile.display_name);
    console.log('Is this Kristy Bloomfield?', profile.display_name === 'Kristy Bloomfield' ? 'YES ✓' : 'NO ✗');
  }

  // Check for all OTHER transcripts with the same storyteller_id
  const { data: allTranscripts } = await supabase
    .from('transcripts')
    .select('id, title, created_at')
    .eq('storyteller_id', data.storyteller_id)
    .order('created_at', { ascending: false });

  console.log('\n=== ALL TRANSCRIPTS FOR THIS PROFILE ===');
  allTranscripts?.forEach((t, i) => {
    const isCurrent = t.id === data.id;
    console.log(`${i + 1}. ${t.title} ${isCurrent ? '← THIS ONE' : ''}`);
    console.log(`   Created: ${t.created_at}`);
  });
}

checkRealTranscript();
