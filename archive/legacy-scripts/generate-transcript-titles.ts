import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

async function findUntitledTranscripts() {
  console.log('🔍 Finding untitled transcripts...\n');

  const { data: transcripts, error } = await supabase
    .from('transcripts')
    .select('id, title, text, ai_summary, themes, storyteller_id, profiles!transcripts_storyteller_id_fkey(display_name)')
    .or('title.is.null,title.eq.Untitled');

  if (error) {
    console.error('❌ Error:', error);
    return [];
  }

  return transcripts;
}

async function generateTitle(transcript: any) {
  console.log(`\n📝 Generating title for transcript ${transcript.id}...`);
  console.log(`   Storyteller: ${transcript.profiles?.display_name || 'Unknown'}`);
  console.log(`   Current title: ${transcript.title || 'Untitled'}`);

  if (!transcript.text && !transcript.ai_summary && !transcript.themes) {
    console.log('⚠️  No content available, skipping...');
    return;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert at creating meaningful, respectful titles for Indigenous Australian oral history transcripts.

Guidelines:
- Keep titles concise (3-7 words)
- Reflect the main theme or story
- Be respectful and culturally appropriate
- Avoid generic titles
- Use the storyteller's voice/perspective where possible
- Examples: "Connection to Country", "Grandmother's Teachings", "Journey to Alice Springs"`,
        },
        {
          role: 'user',
          content: `Create a meaningful title for this transcript by ${transcript.profiles?.display_name}:

Summary: ${transcript.ai_summary || 'Not available'}

Themes: ${transcript.themes?.join(', ') || 'Not available'}

Text preview: ${transcript.text?.substring(0, 1000) || 'Not available'}

Provide response in JSON:
{
  "title": "Suggested title",
  "reasoning": "Why this title is appropriate"
}`,
        },
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    console.log(`✅ Generated title: "${result.title}"`);
    console.log(`   Reasoning: ${result.reasoning}`);

    // Update transcript
    const { error: updateError } = await supabase
      .from('transcripts')
      .update({
        title: result.title,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transcript.id);

    if (updateError) {
      console.error(`❌ Error updating: ${updateError.message}`);
    } else {
      console.log('💾 Title updated successfully');
    }

    return result;
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Generating Meaningful Titles for Untitled Transcripts\n');

  const transcripts = await findUntitledTranscripts();

  if (!transcripts || transcripts.length === 0) {
    console.log('✨ No untitled transcripts found!');
    return;
  }

  console.log(`📊 Found ${transcripts.length} untitled transcripts\n`);

  for (const transcript of transcripts) {
    await generateTitle(transcript);
  }

  console.log('\n✨ Title generation complete!');
}

main().catch(console.error);
