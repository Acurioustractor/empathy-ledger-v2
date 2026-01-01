const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yvnuayzslukamizrlhwb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const goodsProjectId = '6bd47c8a-e676-456f-aa25-ddcbb5a31047';

async function debugQuery() {
  console.log('🔍 Debugging transcript query...\n');

  // Test 1: Simple query with just project_id
  console.log('Test 1: Simple query with project_id filter');
  const { data: test1, error: error1 } = await supabase
    .from('transcripts')
    .select('id, title, project_id')
    .eq('project_id', goodsProjectId);

  if (error1) {
    console.error('❌ Error:', error1);
  } else {
    console.log(`✅ Found ${test1.length} transcripts\n`);
  }

  // Test 2: Query with storyteller join
  console.log('Test 2: Query with storyteller join (like API)');
  const { data: test2, error: error2 } = await supabase
    .from('transcripts')
    .select(`
      id,
      title,
      status,
      created_at,
      word_count,
      character_count,
      storyteller:profiles!transcripts_storyteller_id_fkey(
        id,
        display_name,
        full_name,
        profile_image_url,
        avatar_media_id
      )
    `)
    .eq('project_id', goodsProjectId);

  if (error2) {
    console.error('❌ Error:', error2);
  } else {
    console.log(`✅ Found ${test2.length} transcripts`);
    test2.forEach(t => {
      console.log(`  - ${t.title || 'Untitled'}`);
      console.log(`    Storyteller: ${t.storyteller?.display_name || 'Unknown'}`);
    });
  }

  console.log('\n🔍 Checking if avatar_media_id column exists...');
  const { data: test3, error: error3 } = await supabase
    .from('profiles')
    .select('id, avatar_media_id')
    .limit(1);

  if (error3) {
    console.error('❌ avatar_media_id column might not exist:', error3.message);
  } else {
    console.log('✅ avatar_media_id column exists');
  }
}

debugQuery();
