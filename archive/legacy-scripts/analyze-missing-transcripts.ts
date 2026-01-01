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

const TRANSCRIPTS_TO_ANALYZE = [
  '24c0a11b-24b8-420a-950c-23d1ad33faef', // Caterpillar Dreaming
  'dd245985-b65c-4d69-9c65-b7f38bbdfdd1', // Sitdown interview #1
];

async function analyzeTranscript(transcriptId: string) {
  console.log(`\n🔍 Analyzing transcript ${transcriptId}...`);

  // Get transcript
  const { data: transcript, error: fetchError } = await supabase
    .from('transcripts')
    .select('id, title, text, storyteller_id')
    .eq('id', transcriptId)
    .single();

  if (fetchError || !transcript) {
    console.error(`❌ Error fetching transcript: ${fetchError?.message}`);
    return;
  }

  console.log(`📄 Title: ${transcript.title}`);
  console.log(`📝 Text Length: ${transcript.text?.length || 0} chars`);

  if (!transcript.text || transcript.text.length < 100) {
    console.log('⚠️  Transcript text too short, skipping...');
    return;
  }

  // Get storyteller info for context
  const { data: storyteller } = await supabase
    .from('profiles')
    .select('display_name, cultural_background, bio')
    .eq('id', transcript.storyteller_id)
    .single();

  console.log(`👤 Storyteller: ${storyteller?.display_name}`);

  // Generate AI analysis
  try {
    console.log('🤖 Generating AI analysis...');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert at analyzing oral history transcripts, particularly Indigenous Australian storytelling.
Your task is to extract:
1. A comprehensive summary (2-3 paragraphs)
2. Key themes (5-7 themes)
3. Significant quotes (4-6 impactful quotes with context)

Storyteller Context:
- Name: ${storyteller?.display_name || 'Unknown'}
- Cultural Background: ${storyteller?.cultural_background || 'Not specified'}
- Bio: ${storyteller?.bio?.substring(0, 300) || 'Not available'}

Be respectful, culturally sensitive, and focus on the storyteller's perspective and voice.`,
        },
        {
          role: 'user',
          content: `Please analyze this transcript titled "${transcript.title}":

${transcript.text}

Provide your analysis in JSON format:
{
  "summary": "2-3 paragraph summary",
  "themes": ["theme1", "theme2", ...],
  "key_quotes": ["quote1 with context", "quote2 with context", ...]
}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');

    console.log('✅ Analysis generated');
    console.log(`   Summary: ${analysis.summary?.length || 0} chars`);
    console.log(`   Themes: ${analysis.themes?.length || 0}`);
    console.log(`   Quotes: ${analysis.key_quotes?.length || 0}`);

    // Update transcript with analysis
    const { error: updateError } = await supabase
      .from('transcripts')
      .update({
        ai_summary: analysis.summary,
        themes: analysis.themes || [],
        key_quotes: analysis.key_quotes || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', transcriptId);

    if (updateError) {
      console.error(`❌ Error updating transcript: ${updateError.message}`);
    } else {
      console.log('💾 Database updated successfully');
    }

    return analysis;
  } catch (error: any) {
    console.error(`❌ Error during AI analysis: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Starting AI Analysis for Missing Transcripts\n');
  console.log(`📊 Processing ${TRANSCRIPTS_TO_ANALYZE.length} transcripts\n`);

  for (const transcriptId of TRANSCRIPTS_TO_ANALYZE) {
    await analyzeTranscript(transcriptId);
  }

  console.log('\n✨ Analysis complete!');
}

main().catch(console.error);
