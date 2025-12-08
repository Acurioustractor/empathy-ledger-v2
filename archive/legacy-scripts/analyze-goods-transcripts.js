const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yvnuayzslukamizrlhwb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const goodsProjectId = '6bd47c8a-e676-456f-aa25-ddcbb5a31047';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3030';

async function analyzeGoodsTranscripts() {
  console.log('🔬 Starting AI Analysis for Goods Project Transcripts...\n');

  // Get all transcripts that need analysis
  const { data: transcripts, error } = await supabase
    .from('transcripts')
    .select(`
      id,
      title,
      ai_summary,
      themes,
      key_quotes,
      storyteller_id,
      profiles:storyteller_id(display_name)
    `)
    .eq('project_id', goodsProjectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching transcripts:', error);
    return;
  }

  console.log(`Found ${transcripts.length} transcripts\n`);

  // Filter to only those needing analysis
  const needsAnalysis = transcripts.filter(t =>
    !t.ai_summary || !t.themes || !t.key_quotes ||
    t.themes?.length === 0 || t.key_quotes?.length === 0
  );

  console.log(`${needsAnalysis.length} transcripts need analysis\n`);

  if (needsAnalysis.length === 0) {
    console.log('✅ All transcripts already analyzed!');
    return;
  }

  console.log(`⏱️  Estimated time: ${Math.ceil(needsAnalysis.length * 3)} minutes\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let queued = 0;
  let alreadyProcessing = 0;
  let failed = 0;

  for (let i = 0; i < needsAnalysis.length; i++) {
    const transcript = needsAnalysis[i];
    const storytellerName = transcript.profiles?.display_name || 'Unknown';
    const transcriptTitle = transcript.title || 'Untitled';

    console.log(`[${i + 1}/${needsAnalysis.length}] ${storytellerName}: ${transcriptTitle}`);

    try {
      const analyzeUrl = `${appUrl}/api/transcripts/${transcript.id}/analyze`;

      const response = await fetch(analyzeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.success) {
        console.log(`   ✅ Queued for analysis`);
        queued++;
      } else if (result.message && result.message.includes('already')) {
        console.log(`   ⚠️  Already processing`);
        alreadyProcessing++;
      } else {
        console.log(`   ❌ Failed: ${result.error || result.message}`);
        failed++;
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      failed++;
    }

    // Small delay to avoid overwhelming the API
    if (i < needsAnalysis.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 Summary:');
  console.log(`   ✅ Queued: ${queued}`);
  console.log(`   ⚠️  Already Processing: ${alreadyProcessing}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`\n⏱️  Analysis will take approximately ${Math.ceil((queued + alreadyProcessing) * 3)} minutes`);
  console.log(`\n💡 Monitor progress by running:`);
  console.log(`   node scripts/review-goods-analysis-status.js`);
  console.log(`\n   Or check the database directly for ai_processing_status updates`);
}

analyzeGoodsTranscripts();
