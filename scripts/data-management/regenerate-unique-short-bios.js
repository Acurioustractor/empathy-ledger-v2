#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const { generateText } = require('ai');
const { openai } = require('@ai-sdk/openai');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function generateUniqueShortBio(storyteller, transcriptContent) {
  const prompt = `Create a VERY short bio for ${storyteller.display_name} based on their transcript.

Content: ${transcriptContent.substring(0, 1500)}

CRITICAL: Maximum 80 characters. Be extremely concise.
Focus on what makes them unique from their actual words.
No generic phrases. Make it personal.

Examples:
"Elder sharing traditional knowledge" (34 chars)
"Youth advocate empowering communities" (37 chars)
"Cultural keeper preserving stories" (34 chars)

Bio (max 80 chars):`;

  const { text: shortBio } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt,
    maxTokens: 30
  });

  return shortBio?.trim();
}

async function regenerateShortBios() {
  try {
    console.log('🔄 Regenerating unique short bios from actual transcript content...\n');

    // Get storytellers with generic short bios that need improvement
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, bio')
      .ilike('bio', '%storyteller from Katherine%');

    console.log(`Found ${profiles?.length || 0} profiles with generic bios to improve\n`);

    for (const profile of profiles || []) {
      console.log(`📝 Processing ${profile.display_name}...`);

      // Get their actual transcripts
      const { data: transcripts } = await supabase
        .from('transcripts')
        .select('title, transcript_content, text, formatted_text')
        .eq('storyteller_id', profile.id)
        .limit(3);

      if (!transcripts || transcripts.length === 0) {
        console.log(`   ⏭️ No transcripts found for ${profile.display_name}`);
        continue;
      }

      // Combine transcript content
      const transcriptContent = transcripts.map(t => {
        const content = t.transcript_content || t.text || t.formatted_text || '';
        return `${t.title}: ${content}`;
      }).join('\n\n');

      if (!transcriptContent.trim() || transcriptContent.length < 100) {
        console.log(`   ⏭️ Insufficient transcript content for ${profile.display_name}`);
        continue;
      }

      // Generate new unique short bio
      const newShortBio = await generateUniqueShortBio(profile, transcriptContent);

      if (newShortBio && newShortBio.length > 10 && newShortBio.length <= 100) {
        // Replace the short bio in their existing bio
        let updatedBio = profile.bio;

        // Remove existing short bio marker if it exists
        updatedBio = updatedBio.replace(/\[SHORT_BIO\].*?\[\/SHORT_BIO\]/g, '');

        // Add the new short bio
        const newShortBioMarker = `[SHORT_BIO]${newShortBio}[/SHORT_BIO]`;
        updatedBio = updatedBio.trim() + '\n\n' + newShortBioMarker;

        const { error } = await supabase
          .from('profiles')
          .update({ bio: updatedBio })
          .eq('id', profile.id);

        if (!error) {
          console.log(`   ✅ Updated: "${newShortBio}" (${newShortBio.length} chars)`);
        } else {
          console.log(`   ❌ Error updating ${profile.display_name}:`, error.message);
        }
      } else {
        console.log(`   ⚠️ Generated bio inappropriate length: ${newShortBio?.length || 0} chars`);
      }

      // Brief delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n🎉 Short bio regeneration complete!');

  } catch (error) {
    console.error('❌ Error regenerating short bios:', error);
  }
}

regenerateShortBios();