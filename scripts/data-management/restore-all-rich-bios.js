#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const { generateText } = require('ai');
const { openai } = require('@ai-sdk/openai');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function generateRichBio(storyteller, transcriptContent, currentBio) {
  const prompt = `Create a rich, detailed bio for ${storyteller.display_name} based on their transcript content.

The bio should be 3-5 sentences that capture their essence, background, and unique contribution.

Transcript content: ${transcriptContent.substring(0, 2500)}

Current short bio: ${currentBio}

Style guidelines:
- Start with their name and a compelling descriptor
- Include their background/origin if mentioned in transcripts
- Highlight what makes them unique and their impact
- Use vivid, respectful, authentic language
- NO generic phrases like "storyteller from Katherine" or "Through the Deadly Hearts project"
- NO [SHORT_BIO] markup
- Make it personal and based on their actual story from transcripts
- Include specific details from their life/work mentioned in transcripts

Example quality: "Benjamin Knight is a visionary technologist and advocate, dedicated to empowering Indigenous communities through his innovative work on the Empathy Ledger platform. Deeply inspired by conversations with elders, he integrates ancient cultural protocols with modern technology, ensuring that each community maintains control over its narratives."

Rich bio for ${storyteller.display_name}:`;

  const { text: richBio } = await generateText({
    model: openai('gpt-4o'),
    prompt,
    maxTokens: 250
  });

  return richBio?.trim();
}

async function restoreAllRichBios() {
  try {
    console.log('🔄 Restoring beautiful, rich bios for ALL storytellers...\n');

    // Get all profiles that need rich bios restored (those with short bios)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, bio')
      .not('bio', 'is', null)
      .order('display_name');

    console.log(`Found ${profiles?.length || 0} profiles to restore...\n`);

    let processed = 0;
    let updated = 0;
    let skipped = 0;

    for (const profile of profiles || []) {
      processed++;
      console.log(`📝 [${processed}/${profiles.length}] Processing: ${profile.display_name}`);

      // Skip if bio is already long and rich (>300 chars)
      if (profile.bio && profile.bio.length > 300) {
        console.log(`   ⏭️ Already has rich bio (${profile.bio.length} chars), skipping`);
        skipped++;
        continue;
      }

      // Get their transcripts
      const { data: transcripts } = await supabase
        .from('transcripts')
        .select('title, transcript_content, text, formatted_text')
        .eq('storyteller_id', profile.id)
        .limit(5); // Get more transcripts for richer content

      if (!transcripts || transcripts.length === 0) {
        console.log(`   ⏭️ No transcripts found - keeping current bio`);
        skipped++;
        continue;
      }

      // Combine transcript content
      const transcriptContent = transcripts.map(t => {
        const content = t.transcript_content || t.text || t.formatted_text || '';
        return `${t.title}: ${content}`;
      }).join('\n\n');

      if (transcriptContent.length < 200) {
        console.log(`   ⏭️ Insufficient transcript content (${transcriptContent.length} chars)`);
        skipped++;
        continue;
      }

      try {
        // Generate rich bio
        const richBio = await generateRichBio(profile, transcriptContent, profile.bio);

        if (richBio && richBio.length > 100) {
          const { error } = await supabase
            .from('profiles')
            .update({ bio: richBio })
            .eq('id', profile.id);

          if (!error) {
            console.log(`   ✅ Updated with rich bio (${richBio.length} chars)`);
            console.log(`   📄 Preview: "${richBio.substring(0, 120)}..."`);
            updated++;
          } else {
            console.log(`   ❌ Database error: ${error.message}`);
          }
        } else {
          console.log(`   ⚠️ Generated bio too short or invalid: ${richBio?.length || 0} chars`);
          skipped++;
        }
      } catch (aiError) {
        console.log(`   ❌ AI generation error: ${aiError.message}`);
        skipped++;
      }

      // Delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('');

      // Progress checkpoint every 10
      if (processed % 10 === 0) {
        console.log(`📊 Progress: ${processed}/${profiles.length} processed, ${updated} updated, ${skipped} skipped\n`);
      }
    }

    console.log('🎉 Bio restoration complete!');
    console.log(`📊 Final stats: ${processed} processed, ${updated} updated, ${skipped} skipped`);

  } catch (error) {
    console.error('❌ Error restoring bios:', error);
  }
}

restoreAllRichBios();