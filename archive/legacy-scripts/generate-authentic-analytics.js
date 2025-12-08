/**
 * Generate authentic analytics from actual transcript content only
 * No fake/demo data - only real metrics derived from Benjamin's transcripts
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to extract real themes from transcript content
function extractRealThemes(transcripts) {
  const themes = new Set();
  const content = transcripts.map(t => t.transcript_content).join(' ').toLowerCase();

  // Technology-related themes (based on actual content)
  if (content.includes('technology') || content.includes('platform') || content.includes('database')) {
    themes.add('Technology Development');
  }
  if (content.includes('cultural') || content.includes('protocol') || content.includes('elder')) {
    themes.add('Cultural Protocols');
  }
  if (content.includes('community') || content.includes('collaborative')) {
    themes.add('Community Collaboration');
  }
  if (content.includes('ethics') || content.includes('serve') || content.includes('respect')) {
    themes.add('Ethical Technology');
  }
  if (content.includes('empathy') || content.includes('story') || content.includes('narrative')) {
    themes.add('Storytelling Platform');
  }

  return Array.from(themes);
}

// Function to determine storytelling style from content
function determineStorytellingStyle(transcripts) {
  const content = transcripts.map(t => t.transcript_content).join(' ').toLowerCase();

  if (content.includes('technical') || content.includes('database') || content.includes('system')) {
    return 'Technical Narrative';
  }
  if (content.includes('reflect') || content.includes('learn') || content.includes('understand')) {
    return 'Reflective';
  }
  if (content.includes('build') || content.includes('develop') || content.includes('create')) {
    return 'Process Documentation';
  }

  return 'Educational';
}

async function generateAuthenticAnalytics() {
  console.log('🔍 Generating authentic analytics from real transcript content...\n');

  const benjaminId = 'd0a162d2-282e-4653-9d12-aa934c9dfa4e';
  const tenantId = 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6';

  try {
    // Get all transcripts for Benjamin
    const { data: transcripts, error: transcriptError } = await supabase
      .from('transcripts')
      .select('*')
      .eq('storyteller_id', benjaminId);

    if (transcriptError || !transcripts) {
      console.error('❌ Error fetching transcripts:', transcriptError);
      return;
    }

    console.log('📝 Found', transcripts.length, 'transcripts');

    if (transcripts.length === 0) {
      console.log('❌ No transcripts found - cannot generate authentic analytics');
      return;
    }

    // Calculate real metrics from transcript content
    const totalWords = transcripts.reduce((sum, t) => {
      const words = t.transcript_content ? t.transcript_content.split(/\s+/).length : 0;
      return sum + words;
    }, 0);

    const totalCharacters = transcripts.reduce((sum, t) => {
      return sum + (t.transcript_content ? t.transcript_content.length : 0);
    }, 0);

    const realThemes = extractRealThemes(transcripts);
    const storytellingStyle = determineStorytellingStyle(transcripts);

    console.log('📊 Real metrics calculated:');
    console.log('  - Word count:', totalWords);
    console.log('  - Character count:', totalCharacters);
    console.log('  - Themes:', realThemes);
    console.log('  - Style:', storytellingStyle);

    // Create authentic analytics (NO fake metrics)
    const authenticAnalytics = {
      storyteller_id: benjaminId,
      tenant_id: tenantId,
      total_stories: 0, // Real - no stories created yet
      total_transcripts: transcripts.length, // Real
      total_word_count: totalWords, // Real
      total_engagement_score: 0, // Real - no engagement yet
      impact_reach: 0, // Real - no reach yet
      primary_themes: realThemes, // Real - extracted from content
      connection_count: 0, // Real - no connections yet
      storytelling_style: storytellingStyle, // Real - derived from content
      last_calculated_at: new Date().toISOString()
    };

    // Update analytics with authentic data only
    const { error: analyticsError } = await supabase
      .from('storyteller_analytics')
      .upsert(authenticAnalytics);

    if (analyticsError) {
      console.error('❌ Error updating analytics:', analyticsError);
    } else {
      console.log('✅ Updated analytics with authentic data only');
    }

    // Remove any fake quotes - keep only real quotes extracted from transcripts
    console.log('\n🗑️ Removing fake quotes...');
    await supabase
      .from('storyteller_quotes')
      .delete()
      .eq('storyteller_id', benjaminId);

    // Extract real quotes from transcript content
    const realQuotes = [];
    transcripts.forEach(transcript => {
      const content = transcript.transcript_content || '';
      const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);

      // Find impactful sentences (quotes)
      sentences.forEach(sentence => {
        if (sentence.length > 50 && sentence.length < 200) {
          // Look for meaningful quotes
          if (sentence.toLowerCase().includes('protocol') ||
              sentence.toLowerCase().includes('community') ||
              sentence.toLowerCase().includes('technology') ||
              sentence.toLowerCase().includes('serve')) {

            realQuotes.push({
              storyteller_id: benjaminId,
              tenant_id: tenantId,
              source_id: transcript.id,
              source_type: 'transcript',
              source_title: transcript.title,
              quote_text: sentence.trim(),
              emotional_impact_score: 0.0, // Will be calculated from real engagement
              wisdom_score: 0.0, // Will be calculated from real engagement
              quotability_score: 0.0, // Will be calculated from real engagement
              inspiration_score: 0.0, // Will be calculated from real engagement
              themes: realThemes.slice(0, 2), // Use real themes
              quote_category: sentence.toLowerCase().includes('protocol') ? 'wisdom' : 'insight'
            });
          }
        }
      });
    });

    // Add only real extracted quotes
    console.log('💬 Adding', realQuotes.length, 'authentic quotes extracted from transcripts...');
    for (const quote of realQuotes.slice(0, 3)) { // Limit to top 3
      const { error: quoteError } = await supabase
        .from('storyteller_quotes')
        .insert(quote);

      if (quoteError && !quoteError.message.includes('duplicate')) {
        console.error('❌ Error adding real quote:', quoteError);
      } else {
        console.log('✅ Added authentic quote:', quote.quote_text.substring(0, 50) + '...');
      }
    }

    // Remove fake engagement data
    console.log('\n🗑️ Removing fake engagement data...');
    await supabase
      .from('storyteller_engagement')
      .delete()
      .eq('storyteller_id', benjaminId);

    console.log('✅ All fake/demo data removed');

    console.log('\n🎉 Authentic analytics generated successfully!');
    console.log('\n📊 Your analytics now show only real data:');
    console.log('   📝 Transcripts:', transcripts.length, '(real)');
    console.log('   📖 Total words:', totalWords, '(real count from your content)');
    console.log('   🎯 Themes:', realThemes.join(', '), '(extracted from your transcripts)');
    console.log('   📚 Style:', storytellingStyle, '(derived from your writing)');
    console.log('   💬 Quotes:', realQuotes.length, '(extracted from your actual text)');
    console.log('   📊 All metrics: authentic, no simulation');

    console.log('\n🔄 Refresh your dashboard to see purely authentic analytics!');

  } catch (error) {
    console.error('❌ Error generating authentic analytics:', error);
  }
}

if (require.main === module) {
  generateAuthenticAnalytics();
}

module.exports = { generateAuthenticAnalytics };