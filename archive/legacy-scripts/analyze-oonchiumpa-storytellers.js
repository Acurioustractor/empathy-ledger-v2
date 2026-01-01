const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const OONCHIUMPA_ORG_ID = 'c53077e1-98de-4216-9149-6268891ff62e';

async function analyzeStorytellers() {
  console.log('\n🔍 Analyzing Oonchiumpa storytellers...\n');

  // Get storytellers via profile_organizations join
  const { data: storytellerProfiles, error: profileError } = await supabase
    .from('profile_organizations')
    .select(`
      profile_id,
      profiles!inner(
        id,
        display_name,
        full_name,
        bio,
        cultural_background,
        tenant_roles
      )
    `)
    .eq('organization_id', OONCHIUMPA_ORG_ID)
    .eq('is_active', true);

  if (profileError) {
    console.error('❌ Error fetching profiles:', profileError);
    return;
  }

  console.log(`📊 Found ${storytellerProfiles.length} active members\n`);

  const storytellers = storytellerProfiles
    .filter(sp => sp.profiles?.tenant_roles?.includes('storyteller'))
    .map(sp => sp.profiles);

  console.log(`👥 Storytellers: ${storytellers.length}\n`);

  // Analyze each storyteller
  for (const profile of storytellers) {
    console.log('━'.repeat(80));
    console.log(`👤 ${profile.display_name || profile.full_name || 'Unknown'}`);
    console.log(`   ID: ${profile.id}`);

    // Check profile completeness
    console.log(`\n   📋 Profile Completeness:`);
    console.log(`   📝 Bio: ${profile.bio?.length ? `✅ ${profile.bio.length} chars` : '❌ Missing'}`);
    console.log(`   🌏 Cultural Background: ${profile.cultural_background ? '✅ ' + profile.cultural_background : '❌ Missing'}`);

    // Get transcripts
    const { data: transcripts, error: transcriptError } = await supabase
      .from('transcripts')
      .select('id, title, status, ai_summary, themes, key_quotes')
      .eq('storyteller_id', profile.id)
      .order('created_at', { ascending: false });

    if (transcriptError) {
      console.log(`\n   ⚠️  Error fetching transcripts: ${transcriptError.message}`);
    } else {
      console.log(`\n   📄 Transcripts: ${transcripts.length}`);

      if (transcripts.length > 0) {
        transcripts.forEach((t, idx) => {
          const hasAnalysis = t.ai_summary || t.themes || t.key_quotes;
          console.log(`\n      ${idx + 1}. "${t.title || 'Untitled'}"`);
          console.log(`         Status: ${t.status || 'unknown'}`);
          console.log(`         AI Summary: ${t.ai_summary ? '✅' : '❌ Missing'}`);
          console.log(`         Themes: ${t.themes?.length ? `✅ ${t.themes.length} themes` : '❌ Missing'}`);
          console.log(`         Key Quotes: ${t.key_quotes?.length ? `✅ ${t.key_quotes.length} quotes` : '❌ Missing'}`);
        });
      }
    }

    // Get stories
    const { data: stories, error: storyError } = await supabase
      .from('stories')
      .select('id, title, status')
      .eq('storyteller_id', profile.id);

    if (!storyError && stories.length > 0) {
      console.log(`\n   📖 Stories: ${stories.length}`);
      stories.forEach((s, idx) => {
        console.log(`      ${idx + 1}. "${s.title || 'Untitled'}" - ${s.status || 'unknown'}`);
      });
    }

    // Get project assignments
    const { data: projectAssignments, error: projectError } = await supabase
      .from('project_storytellers')
      .select(`
        project_id,
        projects!inner(
          id,
          name,
          status
        )
      `)
      .eq('storyteller_id', profile.id);

    if (!projectError && projectAssignments.length > 0) {
      console.log(`\n   🎯 Project Assignments: ${projectAssignments.length}`);
      projectAssignments.forEach((pa, idx) => {
        console.log(`      ${idx + 1}. "${pa.projects.name}" - ${pa.projects.status}`);
      });
    } else if (projectError) {
      console.log(`\n   ⚠️  Error fetching projects: ${projectError.message}`);
    }

    console.log('');
  }

  // Summary
  console.log('━'.repeat(80));
  console.log('\n📊 SUMMARY:\n');

  const withBio = storytellers.filter(p => p.bio?.length > 0).length;
  const withCulturalBg = storytellers.filter(p => p.cultural_background).length;

  console.log(`Profile Completeness:`);
  console.log(`   ✅ With Bio: ${withBio}/${storytellers.length}`);
  console.log(`   ✅ With Cultural Background: ${withCulturalBg}/${storytellers.length}`);
  console.log(`   ❌ Missing Bio: ${storytellers.length - withBio}`);
  console.log(`   ❌ Missing Cultural Background: ${storytellers.length - withCulturalBg}`);
  console.log('');

  // Count transcripts needing analysis
  let totalTranscripts = 0;
  let transcriptsWithSummary = 0;
  let transcriptsWithThemes = 0;

  for (const profile of storytellers) {
    const { data: transcripts } = await supabase
      .from('transcripts')
      .select('ai_summary, themes, key_quotes')
      .eq('storyteller_id', profile.id);

    if (transcripts) {
      totalTranscripts += transcripts.length;
      transcriptsWithSummary += transcripts.filter(t => t.ai_summary).length;
      transcriptsWithThemes += transcripts.filter(t => t.themes?.length > 0).length;
    }
  }

  console.log(`Transcript Analysis:`);
  console.log(`   📄 Total Transcripts: ${totalTranscripts}`);
  console.log(`   ✅ With AI Summary: ${transcriptsWithSummary}/${totalTranscripts}`);
  console.log(`   ✅ With Themes: ${transcriptsWithThemes}/${totalTranscripts}`);
  console.log(`   ❌ Need Analysis: ${totalTranscripts - transcriptsWithSummary}`);
  console.log('');
}

analyzeStorytellers().catch(console.error);
