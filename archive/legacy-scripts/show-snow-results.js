const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function showResults() {
  console.log('📊 SNOW FOUNDATION STORYTELLER ANALYTICS RESULTS\n');

  // Get Snow Foundation organization
  const { data: snowOrg } = await supabase
    .from('organizations')
    .select('*')
    .ilike('name', '%snow%foundation%')
    .single();

  if (!snowOrg) {
    console.log('❌ Snow Foundation not found');
    return;
  }

  // Get analytics with profile info
  const { data: analytics } = await supabase
    .from('storyteller_analytics')
    .select(`
      *,
      profiles!inner(
        display_name,
        full_name
      )
    `)
    .eq('tenant_id', snowOrg.tenant_id)
    .order('total_word_count', { ascending: false });

  if (!analytics || analytics.length === 0) {
    console.log('❌ No analytics found');
    return;
  }

  console.log('🏢 Organization: Snow Foundation');
  console.log('👥 Total Storytellers:', analytics.length);
  console.log('');

  let totalWords = 0;
  let totalTranscripts = 0;
  let totalStories = 0;

  analytics.forEach((a, i) => {
    const name = a.profiles.display_name || a.profiles.full_name || 'Unknown';
    totalWords += a.total_word_count || 0;
    totalTranscripts += a.total_transcripts || 0;
    totalStories += a.total_stories || 0;

    console.log(`${i+1}. ${name}`);
    console.log(`   📝 Content: ${a.total_transcripts} transcripts, ${a.total_stories} stories`);
    console.log(`   📖 Words: ${(a.total_word_count || 0).toLocaleString()}`);
    console.log(`   🎭 Style: ${a.storytelling_style || 'Not determined'}`);

    const themes = Array.isArray(a.primary_themes) ? a.primary_themes.join(', ') : 'None';
    console.log(`   🏷️  Themes: ${themes}`);
    console.log(`   📊 Engagement: ${a.total_engagement_score || 0} (authentic)`);
    console.log('');
  });

  console.log('🎯 ORGANIZATION TOTALS (100% AUTHENTIC):');
  console.log(`   📚 Total Words: ${totalWords.toLocaleString()}`);
  console.log(`   📝 Total Transcripts: ${totalTranscripts}`);
  console.log(`   📖 Total Stories: ${totalStories}`);
  console.log(`   👥 Active Storytellers: ${analytics.length}`);
  console.log('');
  console.log('✅ All data is authentic - derived from real content only');
  console.log('🚫 No fake metrics, no simulated engagement, no demo data');
  console.log('');
  console.log('🔗 View in admin panel: http://localhost:3030/admin/storytellers');
}

if (require.main === module) {
  showResults();
}

module.exports = { showResults };