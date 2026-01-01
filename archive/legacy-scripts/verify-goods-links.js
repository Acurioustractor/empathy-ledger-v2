const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yvnuayzslukamizrlhwb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const goodsProjectId = '6bd47c8a-e676-456f-aa25-ddcbb5a31047';

async function verifyLinks() {
  console.log('🔍 Verifying transcript links...\n');

  // Get all transcripts linked to Goods project
  const { data: transcripts, error } = await supabase
    .from('transcripts')
    .select(`
      id,
      title,
      project_id,
      storyteller_id,
      storyteller:profiles!transcripts_storyteller_id_fkey(display_name)
    `)
    .eq('project_id', goodsProjectId);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`Found ${transcripts.length} transcripts linked to Goods project:\n`);
  transcripts.forEach(t => {
    console.log(`  - ${t.title || 'Untitled'}`);
    console.log(`    Storyteller: ${t.storyteller?.display_name || 'Unknown'}`);
    console.log(`    Project ID: ${t.project_id}`);
    console.log('');
  });

  // Also check the project page query
  console.log('\n📄 Testing project page query...\n');

  const { data: projectTranscripts, error: projError } = await supabase
    .from('transcripts')
    .select(`
      id,
      title,
      status,
      created_at,
      word_count,
      character_count,
      storyteller_id,
      storyteller:profiles!transcripts_storyteller_id_fkey(
        id,
        display_name,
        full_name,
        profile_image_url,
        avatar_media:media_assets!profiles_avatar_media_id_fkey(cdn_url)
      )
    `)
    .eq('project_id', goodsProjectId)
    .order('created_at', { ascending: false });

  if (projError) {
    console.error('❌ Project query error:', projError);
    return;
  }

  console.log(`Project page query returned ${projectTranscripts.length} transcripts:`);
  projectTranscripts.forEach(t => {
    console.log(`  - ${t.title || 'Untitled'} (${t.storyteller?.display_name})`);
  });
}

verifyLinks();
