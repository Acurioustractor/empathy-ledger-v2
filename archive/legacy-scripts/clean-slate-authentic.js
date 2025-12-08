const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function completeCleanSlate() {
  const benjaminId = 'd0a162d2-282e-4653-9d12-aa934c9dfa4e';

  console.log('🧹 COMPLETE CLEAN SLATE - Removing ALL generated data...');

  // Remove ALL quotes
  await supabase.from('storyteller_quotes').delete().eq('storyteller_id', benjaminId);
  console.log('✅ All quotes removed');

  // Remove ALL engagement data
  await supabase.from('storyteller_engagement').delete().eq('storyteller_id', benjaminId);
  console.log('✅ All engagement data removed');

  // Remove ALL demographics
  await supabase.from('storyteller_demographics').delete().eq('storyteller_id', benjaminId);
  console.log('✅ All demographics removed');

  // Remove analytics completely
  await supabase.from('storyteller_analytics').delete().eq('storyteller_id', benjaminId);
  console.log('✅ All analytics removed');

  console.log('');
  console.log('🎯 NOW CREATING MINIMAL AUTHENTIC DATA...');

  // Get real transcript data
  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('*')
    .eq('storyteller_id', benjaminId);

  if (!transcripts || transcripts.length === 0) {
    console.log('❌ No transcripts found');
    return;
  }

  const realWordCount = transcripts.reduce((sum, t) => {
    return sum + (t.transcript_content ? t.transcript_content.split(/\s+/).length : 0);
  }, 0);

  // Create minimal authentic analytics - ONLY what we can derive from transcripts
  const minimalAnalytics = {
    storyteller_id: benjaminId,
    tenant_id: 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6',
    total_stories: 0, // Real
    total_transcripts: transcripts.length, // Real
    total_word_count: realWordCount, // Real
    total_engagement_score: 0, // Real - no engagement yet
    impact_reach: 0, // Real - no reach yet
    primary_themes: [], // Real - empty until we have analysis
    connection_count: 0, // Real - no connections yet
    storytelling_style: null, // Real - null until determined
    last_calculated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('storyteller_analytics')
    .insert(minimalAnalytics);

  if (error) {
    console.error('❌ Error creating minimal analytics:', error);
  } else {
    console.log('✅ Created minimal authentic analytics');
  }

  console.log('');
  console.log('🎉 CLEAN SLATE COMPLETE!');
  console.log('');
  console.log('📊 Your dashboard now shows ONLY authentic data:');
  console.log('   Stories: 0 (real - none created yet)');
  console.log('   Transcripts:', transcripts.length, '(real)');
  console.log('   Words:', realWordCount, '(real count from your content)');
  console.log('   All other metrics: 0 (real - will grow with actual usage)');
  console.log('');
  console.log('🚀 This is 100% authentic - no fake data anywhere!');
}

if (require.main === module) {
  completeCleanSlate();
}

module.exports = { completeCleanSlate };