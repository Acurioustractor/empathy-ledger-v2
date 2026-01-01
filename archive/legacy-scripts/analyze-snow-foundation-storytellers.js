/**
 * Analyze all storytellers from Snow Foundation organization
 * Generate authentic analytics based on their real transcripts and stories
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to extract themes from content
function extractThemesFromContent(content) {
  if (!content) return [];

  const themes = new Set();
  const text = content.toLowerCase();

  // Indigenous and cultural themes
  if (text.includes('indigenous') || text.includes('native') || text.includes('traditional')) {
    themes.add('Indigenous Heritage');
  }
  if (text.includes('community') || text.includes('together') || text.includes('family')) {
    themes.add('Community Connection');
  }
  if (text.includes('land') || text.includes('nature') || text.includes('environment')) {
    themes.add('Connection to Land');
  }
  if (text.includes('story') || text.includes('tell') || text.includes('share')) {
    themes.add('Oral Tradition');
  }
  if (text.includes('culture') || text.includes('heritage') || text.includes('ancestor')) {
    themes.add('Cultural Preservation');
  }
  if (text.includes('elder') || text.includes('wisdom') || text.includes('teaching')) {
    themes.add('Elder Wisdom');
  }
  if (text.includes('youth') || text.includes('young') || text.includes('children')) {
    themes.add('Youth Engagement');
  }
  if (text.includes('healing') || text.includes('ceremony') || text.includes('spiritual')) {
    themes.add('Spiritual Practice');
  }

  return Array.from(themes);
}

// Function to determine storytelling style
function determineStorytellingStyle(content, transcripts, stories) {
  if (!content) return 'Conversational';

  const text = content.toLowerCase();
  const hasTranscripts = transcripts && transcripts.length > 0;
  const hasStories = stories && stories.length > 0;

  if (text.includes('ceremony') || text.includes('spiritual') || text.includes('sacred')) {
    return 'Ceremonial Narrative';
  }
  if (text.includes('teach') || text.includes('learn') || text.includes('wisdom')) {
    return 'Educational Storytelling';
  }
  if (text.includes('personal') || text.includes('my') || text.includes('experience')) {
    return 'Personal Narrative';
  }
  if (hasTranscripts && !hasStories) {
    return 'Oral Storytelling';
  }
  if (hasStories && stories.some(s => s.content && s.content.length > 500)) {
    return 'Literary Narrative';
  }

  return 'Community Storytelling';
}

async function analyzeSnowFoundationStorytellers() {
  console.log('🔍 Analyzing Snow Foundation storytellers...\n');

  try {
    // First, find the Snow Foundation organization
    const { data: snowOrg, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .ilike('name', '%snow%foundation%')
      .single();

    if (orgError || !snowOrg) {
      console.error('❌ Snow Foundation not found:', orgError?.message);
      return;
    }

    console.log('🏢 Found organization:', snowOrg.name, '(' + snowOrg.id + ')');

    // Get all storytellers associated with Snow Foundation via relationship table
    const { data: storytellerRelations, error: relationError } = await supabase
      .from('profile_organizations')
      .select(`
        profile_id,
        role,
        profiles!inner(
          id,
          display_name,
          full_name,
          email,
          is_storyteller
        )
      `)
      .eq('organization_id', snowOrg.id)
      .eq('profiles.is_storyteller', true);

    if (relationError) {
      console.log('❌ Relationship error, trying storyteller_organizations table...');

      const { data: storytellerOrgRelations, error: storytellersError } = await supabase
        .from('storyteller_organizations')
        .select(`
          storyteller_id,
          role,
          profiles!inner(
            id,
            display_name,
            full_name,
            email,
            is_storyteller
          )
        `)
        .eq('organization_id', snowOrg.id)
        .eq('is_active', true);

      if (storytellersError) {
        console.error('❌ Error with storyteller_organizations:', storytellersError);
        return;
      }

      var storytellers = storytellerOrgRelations?.map(r => r.profiles) || [];
    } else {
      var storytellers = storytellerRelations?.map(r => r.profiles) || [];
    }

    console.log('👥 Found', storytellers?.length || 0, 'storytellers in Snow Foundation');

    if (!storytellers || storytellers.length === 0) {
      console.log('ℹ️  No storytellers found for Snow Foundation');
      return;
    }

    // Analyze each storyteller
    for (const storyteller of storytellers) {
      console.log(`\n📊 Analyzing ${storyteller.display_name || storyteller.full_name}...`);

      // Get transcripts
      const { data: transcripts } = await supabase
        .from('transcripts')
        .select('*')
        .eq('storyteller_id', storyteller.id);

      // Get stories
      const { data: stories } = await supabase
        .from('stories')
        .select('*')
        .or(`storyteller_id.eq.${storyteller.id},author_id.eq.${storyteller.id}`);

      // Calculate real metrics
      const totalTranscripts = transcripts?.length || 0;
      const totalStories = stories?.length || 0;

      let totalWordCount = 0;
      let allContent = '';

      // Count words from transcripts
      if (transcripts) {
        transcripts.forEach(t => {
          if (t.transcript_content) {
            const words = t.transcript_content.split(/\s+/).length;
            totalWordCount += words;
            allContent += ' ' + t.transcript_content;
          }
        });
      }

      // Count words from stories
      if (stories) {
        stories.forEach(s => {
          if (s.content) {
            const words = s.content.split(/\s+/).length;
            totalWordCount += words;
            allContent += ' ' + s.content;
          }
        });
      }

      // Extract authentic themes and style
      const themes = extractThemesFromContent(allContent);
      const style = determineStorytellingStyle(allContent, transcripts, stories);

      console.log('  📝 Content:', totalTranscripts, 'transcripts,', totalStories, 'stories');
      console.log('  📖 Words:', totalWordCount.toLocaleString());
      console.log('  🎭 Style:', style);
      console.log('  🏷️  Themes:', themes.join(', ') || 'None identified');

      // Create or update authentic analytics
      const analyticsData = {
        storyteller_id: storyteller.id,
        tenant_id: snowOrg.tenant_id || snowOrg.id,
        total_stories: totalStories,
        total_transcripts: totalTranscripts,
        total_word_count: totalWordCount,
        total_engagement_score: 0, // Real - no engagement tracking yet
        impact_reach: 0, // Real - no reach tracking yet
        primary_themes: themes,
        connection_count: 0, // Real - no connections tracked yet
        storytelling_style: style,
        last_calculated_at: new Date().toISOString()
      };

      // Clean slate first - remove any fake data
      await supabase
        .from('storyteller_analytics')
        .delete()
        .eq('storyteller_id', storyteller.id);

      // Insert authentic analytics
      const { error: analyticsError } = await supabase
        .from('storyteller_analytics')
        .insert(analyticsData);

      if (analyticsError) {
        console.log('  ❌ Analytics error:', analyticsError.message);
      } else {
        console.log('  ✅ Created authentic analytics');
      }
    }

    // Summary
    console.log('\n🎉 ANALYSIS COMPLETE!');
    console.log('\n📊 Summary for Snow Foundation:');
    console.log('   Organization:', snowOrg.name);
    console.log('   Storytellers analyzed:', storytellers.length);
    console.log('   All analytics are now 100% authentic');
    console.log('   Based on real transcripts and stories only');
    console.log('\n🔍 You can now view these storytellers in the admin panel to see their authentic analytics!');

  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

if (require.main === module) {
  analyzeSnowFoundationStorytellers();
}

module.exports = { analyzeSnowFoundationStorytellers };