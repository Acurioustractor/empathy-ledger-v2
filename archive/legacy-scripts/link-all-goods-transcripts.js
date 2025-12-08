const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yvnuayzslukamizrlhwb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const goodsProjectId = '6bd47c8a-e676-456f-aa25-ddcbb5a31047';

async function linkAllTranscripts() {
  console.log('🔗 Linking ALL storyteller transcripts to Goods project...\n');

  // Get all storytellers assigned to the Goods project
  const { data: storytellers, error: storytellersError } = await supabase
    .from('project_storytellers')
    .select('storyteller_id, profiles(display_name)')
    .eq('project_id', goodsProjectId);

  if (storytellersError) {
    console.error('❌ Error fetching storytellers:', storytellersError);
    return;
  }

  console.log(`Found ${storytellers.length} storytellers assigned to Goods project\n`);

  let totalLinked = 0;
  let totalAlreadyLinked = 0;
  let storytellersWithTranscripts = 0;

  for (const st of storytellers) {
    const storytellerName = st.profiles?.display_name || 'Unknown';

    // Get ALL transcripts for this storyteller (with or without project_id)
    const { data: allTranscripts, error: allError } = await supabase
      .from('transcripts')
      .select('id, title, project_id')
      .eq('storyteller_id', st.storyteller_id);

    if (allError) {
      console.error(`   ❌ Error fetching transcripts for ${storytellerName}:`, allError);
      continue;
    }

    if (!allTranscripts || allTranscripts.length === 0) {
      continue;
    }

    const unlinkedTranscripts = allTranscripts.filter(t => t.project_id === null);
    const alreadyLinked = allTranscripts.filter(t => t.project_id === goodsProjectId);

    if (unlinkedTranscripts.length === 0 && alreadyLinked.length === 0) {
      // Has transcripts but linked to OTHER projects
      console.log(`⚠️  ${storytellerName}: ${allTranscripts.length} transcript(s) linked to OTHER projects (skipping)`);
      continue;
    }

    storytellersWithTranscripts++;
    console.log(`📝 ${storytellerName}:`);

    if (alreadyLinked.length > 0) {
      console.log(`   ✅ ${alreadyLinked.length} already linked to Goods`);
      totalAlreadyLinked += alreadyLinked.length;
    }

    if (unlinkedTranscripts.length > 0) {
      console.log(`   🔗 Linking ${unlinkedTranscripts.length} unlinked transcript(s):`);
      unlinkedTranscripts.forEach(t => console.log(`      - ${t.title || 'Untitled'}`));

      // Update transcripts to link them to the Goods project
      const { error: updateError } = await supabase
        .from('transcripts')
        .update({ project_id: goodsProjectId })
        .eq('storyteller_id', st.storyteller_id)
        .is('project_id', null);

      if (updateError) {
        console.error(`   ❌ Error linking transcripts:`, updateError);
      } else {
        console.log(`   ✅ Linked ${unlinkedTranscripts.length} transcript(s)`);
        totalLinked += unlinkedTranscripts.length;
      }
    }

    console.log('');
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✨ Summary:`);
  console.log(`   Storytellers with transcripts: ${storytellersWithTranscripts}`);
  console.log(`   Already linked: ${totalAlreadyLinked}`);
  console.log(`   Newly linked: ${totalLinked}`);
  console.log(`   Total transcripts in Goods: ${totalAlreadyLinked + totalLinked}`);
  console.log(`\n🎉 Visit: http://localhost:3030/projects/${goodsProjectId} to see all transcripts!`);
}

linkAllTranscripts();
