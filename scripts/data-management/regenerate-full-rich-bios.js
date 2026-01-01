#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const { generateText } = require('ai');
const { openai } = require('@ai-sdk/openai');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function generateRichBio(storyteller, transcriptContent, shortBio) {
  const prompt = `Create a rich, detailed bio for ${storyteller.display_name} based on their transcript content.

The bio should be 3-4 sentences that capture their essence, background, and unique contribution.

Transcript content: ${transcriptContent.substring(0, 2000)}

Short summary: ${shortBio}

Style guidelines:
- Start with their name and a key descriptor
- Include their background/origin if mentioned
- Highlight what makes them unique
- Show their impact or role in community
- Use vivid, respectful language
- NO generic phrases like "storyteller from Katherine"
- NO project names unless specifically relevant
- Make it personal and authentic

Example style: "Benjamin Knight is a passionate advocate for Indigenous youth, uniquely framing them not as problems to be fixed, but as valuable consultants whose insights can transform their communities. Through his work in technology and storytelling, he builds bridges between traditional wisdom and modern innovation, empowering communities to preserve and share their stories with dignity and cultural integrity."

Rich bio for ${storyteller.display_name}:`;

  const { text: richBio } = await generateText({
    model: openai('gpt-4o'),
    prompt,
    maxTokens: 200
  });

  return richBio?.trim();
}

async function regenerateRichBios() {
  try {
    console.log('🔄 Regenerating rich, detailed bios from transcript content...\n');

    // Get a sample of profiles that had their bios shortened
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, bio')
      .not('bio', 'is', null)
      .limit(50); // Start with 50 to test

    console.log(`Processing ${profiles?.length || 0} profiles...\n`);

    for (const profile of profiles?.slice(0, 10) || []) { // Start with just 10 for testing
      console.log(`📝 Regenerating bio for: ${profile.display_name}`);

      // Get their transcripts
      const { data: transcripts } = await supabase
        .from('transcripts')
        .select('title, transcript_content, text, formatted_text')
        .eq('storyteller_id', profile.id)
        .limit(3);

      if (!transcripts || transcripts.length === 0) {
        console.log(`   ⏭️ No transcripts found`);
        continue;
      }

      // Combine transcript content
      const transcriptContent = transcripts.map(t => {
        const content = t.transcript_content || t.text || t.formatted_text || '';
        return `${t.title}: ${content}`;
      }).join('\n\n');

      if (transcriptContent.length < 100) {
        console.log(`   ⏭️ Insufficient content`);
        continue;
      }

      // Generate rich bio
      const richBio = await generateRichBio(profile, transcriptContent, profile.bio);

      if (richBio && richBio.length > 50) {
        const { error } = await supabase
          .from('profiles')
          .update({ bio: richBio })
          .eq('id', profile.id);

        if (!error) {
          console.log(`   ✅ Updated with rich bio (${richBio.length} chars)`);
          console.log(`   📄 "${richBio}"`);
        } else {
          console.log(`   ❌ Error: ${error.message}`);
        }
      } else {
        console.log(`   ⚠️ Generated bio too short or invalid`);
      }

      // Delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('');
    }

    console.log('🎉 Rich bio regeneration complete!');

  } catch (error) {
    console.error('❌ Error regenerating bios:', error);
  }
}

regenerateRichBios();