const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function showKristyTranscripts() {
  const { data } = await supabase
    .from('transcripts')
    .select('*')
    .eq('storyteller_id', '197c6c02-da4f-43df-a376-f9242249c297')
    .neq('title', 'Cherly')  // Exclude the Cheryl one
    .order('created_at', { ascending: false });

  console.log('=== KRISTY\'S 3 TRANSCRIPTS ===\n');

  data?.forEach((t, i) => {
    console.log(`${i + 1}. ${t.title}`);
    console.log(`   Status: ${t.status || t.processing_status}`);
    console.log(`   Created: ${t.created_at}`);
    console.log(`   Content:\n`);
    console.log(t.transcript_content || t.content || 'NO CONTENT');
    console.log('\n' + '='.repeat(80) + '\n');
  });
}

showKristyTranscripts();
