const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yvnuayzslukamizrlhwb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const goodsProjectId = '6bd47c8a-e676-456f-aa25-ddcbb5a31047';

async function reviewGoodsAnalysisStatus() {
  console.log('📊 Reviewing Goods Project Analysis Status...\n');

  // Get all transcripts for Goods project with storyteller info
  const { data: transcripts, error } = await supabase
    .from('transcripts')
    .select(`
      id,
      title,
      storyteller_id,
      ai_summary,
      themes,
      key_quotes,
      ai_processing_status,
      word_count,
      character_count,
      status,
      created_at,
      profiles:storyteller_id(
        id,
        display_name,
        full_name,
        bio,
        cultural_background,
        expertise_areas,
        community_roles
      )
    `)
    .eq('project_id', goodsProjectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching transcripts:', error);
    return;
  }

  console.log(`Found ${transcripts.length} transcripts in Goods project\n`);

  // Group by storyteller
  const storytellerMap = new Map();

  transcripts.forEach(t => {
    const storytellerId = t.storyteller_id;
    const storytellerName = t.profiles?.display_name || t.profiles?.full_name || 'Unknown';

    if (!storytellerMap.has(storytellerId)) {
      storytellerMap.set(storytellerId, {
        name: storytellerName,
        profile: t.profiles,
        transcripts: []
      });
    }

    storytellerMap.get(storytellerId).transcripts.push(t);
  });

  console.log(`📊 Analysis Status by Storyteller:\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let totalTranscripts = 0;
  let completedAnalysis = 0;
  let missingAnalysis = 0;
  let needsAnalysis = [];

  for (const [storytellerId, data] of storytellerMap.entries()) {
    console.log(`👤 ${data.name}`);

    // Profile status
    const bio = data.profile?.bio || '';
    const bioLength = bio.length;
    const hasCulturalBg = !!data.profile?.cultural_background;
    const hasExpertise = data.profile?.expertise_areas?.length > 0;
    const hasCommunityRoles = data.profile?.community_roles?.length > 0;

    console.log(`   Profile:`);
    console.log(`     Bio: ${bioLength > 0 ? `${bioLength} chars` : '❌ MISSING'}`);
    console.log(`     Cultural Background: ${hasCulturalBg ? '✅' : '❌ MISSING'}`);
    console.log(`     Expertise Areas: ${hasExpertise ? `✅ (${data.profile.expertise_areas.length})` : '❌ MISSING'}`);
    console.log(`     Community Roles: ${hasCommunityRoles ? `✅ (${data.profile.community_roles.length})` : '❌ MISSING'}`);

    console.log(`   Transcripts (${data.transcripts.length}):`);

    data.transcripts.forEach(t => {
      totalTranscripts++;
      const hasSummary = !!t.ai_summary && t.ai_summary.length > 0;
      const hasThemes = !!t.themes && Array.isArray(t.themes) && t.themes.length > 0;
      const hasQuotes = !!t.key_quotes && Array.isArray(t.key_quotes) && t.key_quotes.length > 0;
      const processingStatus = t.ai_processing_status || 'not_started';

      const analysisComplete = hasSummary && hasThemes && hasQuotes;

      if (analysisComplete) {
        completedAnalysis++;
      } else {
        missingAnalysis++;
        needsAnalysis.push({
          id: t.id,
          title: t.title || 'Untitled',
          storyteller: data.name
        });
      }

      const status = analysisComplete ? '✅ Complete' : '❌ Incomplete';
      console.log(`     - ${t.title || 'Untitled'}: ${status}`);
      console.log(`       ${hasSummary ? '✓' : '✗'} Summary  ${hasThemes ? '✓' : '✗'} Themes  ${hasQuotes ? '✓' : '✗'} Quotes`);
      console.log(`       Status: ${processingStatus}`);
      console.log(`       Words: ${t.word_count || 0} | Chars: ${t.character_count || 0}`);
    });

    console.log('');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📈 Summary:');
  console.log(`   Total Storytellers: ${storytellerMap.size}`);
  console.log(`   Total Transcripts: ${totalTranscripts}`);
  console.log(`   ✅ Analysis Complete: ${completedAnalysis}`);
  console.log(`   ❌ Analysis Incomplete: ${missingAnalysis}`);
  console.log(`   📊 Completion Rate: ${Math.round((completedAnalysis / totalTranscripts) * 100)}%`);

  if (needsAnalysis.length > 0) {
    console.log(`\n⚠️  Transcripts Needing Analysis:\n`);
    needsAnalysis.forEach((t, i) => {
      console.log(`   ${i + 1}. [${t.storyteller}] ${t.title}`);
      console.log(`      ID: ${t.id}`);
    });

    console.log(`\n💡 Next Steps:`);
    console.log(`   1. Run: node scripts/analyze-goods-transcripts.js`);
    console.log(`   2. Wait for analysis to complete (2-5 min per transcript)`);
    console.log(`   3. Then run project-level analysis`);
  } else {
    console.log(`\n🎉 All transcripts have been analyzed!`);
    console.log(`   Ready for project-level analysis.`);
  }
}

reviewGoodsAnalysisStatus();
