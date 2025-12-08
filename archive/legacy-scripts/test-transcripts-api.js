const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yvnuayzslukamizrlhwb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const goodsProjectId = '6bd47c8a-e676-456f-aa25-ddcbb5a31047';

async function testQuery() {
  console.log('Testing transcript query...\n');

  const { data: transcripts, error } = await supabase
    .from('transcripts')
    .select(`
      id,
      title,
      status,
      created_at,
      word_count,
      character_count,
      project_id,
      storyteller:profiles!transcripts_storyteller_id_fkey(
        id,
        display_name,
        full_name,
        profile_image_url
      )
    `)
    .eq('project_id', goodsProjectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`Found ${transcripts.length} transcripts:\n`);
  transcripts.forEach(t => {
    console.log(`  - ${t.title || 'Untitled'}`);
    console.log(`    Status: ${t.status}`);
    console.log(`    Storyteller: ${t.storyteller?.display_name || 'Unknown'}`);
    console.log(`    Project ID: ${t.project_id}`);
    console.log('');
  });
}

testQuery();
