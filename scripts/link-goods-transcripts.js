const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yvnuayzslukamizrlhwb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const goodsProjectId = '6bd47c8a-e676-456f-aa25-ddcbb5a31047';

async function linkTranscriptsToProject() {
  console.log('🔗 Linking existing storyteller transcripts to Goods project...\n');

  // Get all storytellers assigned to the Goods project
  const { data: storytellers, error: storytellersError } = await supabase
    .from('project_storytellers')
    .select('storyteller_id, profiles(display_name)')
    .eq('project_id', goodsProjectId);

  if (storytellersError) {
    console.error('❌ Error fetching storytellers:', storytellersError);
    return;
  }

  console.log(`Found ${storytellers.length} storytellers assigned to Goods project:\n`);

  let totalLinked = 0;

  for (const st of storytellers) {
    const storytellerName = st.profiles?.display_name || 'Unknown';
    console.log(`📝 Processing: ${storytellerName}`);

    // Get all transcripts for this storyteller that don't have a project_id
    const { data: transcripts, error: transcriptsError } = await supabase
      .from('transcripts')
      .select('id, title')
      .eq('storyteller_id', st.storyteller_id)
      .is('project_id', null);

    if (transcriptsError) {
      console.error(`   ❌ Error fetching transcripts:`, transcriptsError);
      continue;
    }

    if (!transcripts || transcripts.length === 0) {
      console.log(`   ℹ️  No unlinked transcripts found\n`);
      continue;
    }

    console.log(`   Found ${transcripts.length} unlinked transcript(s):`);
    transcripts.forEach(t => console.log(`      - ${t.title}`));

    // Update all transcripts to link them to the Goods project
    const { error: updateError } = await supabase
      .from('transcripts')
      .update({ project_id: goodsProjectId })
      .eq('storyteller_id', st.storyteller_id)
      .is('project_id', null);

    if (updateError) {
      console.error(`   ❌ Error linking transcripts:`, updateError);
    } else {
      console.log(`   ✅ Linked ${transcripts.length} transcript(s) to Goods project\n`);
      totalLinked += transcripts.length;
    }
  }

  console.log(`\n✨ Complete! Linked ${totalLinked} total transcripts to Goods project.`);
  console.log(`\nVisit: http://localhost:3030/projects/${goodsProjectId} to see the results.`);
}

linkTranscriptsToProject();
