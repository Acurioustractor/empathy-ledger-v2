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

const PROFILES_MISSING_CULTURAL_BG = [
  '1971d21d-5037-4f7b-90ce-966a4e74d398', // Patricia Ann Miller
  'f8e99ed8-723a-48bc-a346-40f4f7a4032e', // Aunty Bev and Uncle Terry
];

async function extractCulturalBackground(profileId: string) {
  console.log(`\n🔍 Processing profile ${profileId}...`);

  // Get profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name, bio')
    .eq('id', profileId)
    .single();

  if (profileError || !profile) {
    console.error(`❌ Error fetching profile: ${profileError?.message}`);
    return;
  }

  console.log(`👤 ${profile.display_name}`);
  console.log(`📝 Bio length: ${profile.bio?.length || 0} chars`);

  // Get transcripts for this storyteller
  const { data: transcripts, error: transcriptError } = await supabase
    .from('transcripts')
    .select('id, title, text')
    .eq('storyteller_id', profileId);

  if (transcriptError) {
    console.error(`❌ Error fetching transcripts: ${transcriptError.message}`);
    return;
  }

  console.log(`📄 Found ${transcripts?.length || 0} transcripts`);

  if (!profile.bio && (!transcripts || transcripts.length === 0)) {
    console.log('⚠️  No bio or transcripts available, skipping...');
    return;
  }

  // Combine bio and transcript content for analysis
  const contentForAnalysis = `
Bio: ${profile.bio || 'Not available'}

${transcripts?.map((t, idx) => `
Transcript ${idx + 1}: ${t.title}
${t.text?.substring(0, 5000)}
`).join('\n---\n')}
  `.trim();

  try {
    console.log('🤖 Analyzing cultural background...');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert at analyzing Indigenous Australian storytelling and oral histories.
Your task is to identify and extract the storyteller's cultural background based on their bio and transcripts.

Focus on:
- Indigenous nation/people (e.g., "Warlpiri", "Arrernte", "Yolngu")
- Connection to country/place
- Family/clan connections
- Cultural identity statements
- Traditional ownership

Be respectful, accurate, and only include information explicitly stated or strongly implied.
Keep it concise (1-2 sentences maximum).
If unclear, indicate uncertainty rather than guessing.`,
        },
        {
          role: 'user',
          content: `Please identify the cultural background for ${profile.display_name}:

${contentForAnalysis}

Provide your response in JSON format:
{
  "cultural_background": "Brief cultural background statement",
  "confidence": "high|medium|low",
  "source_notes": "Where this information was found"
}`,
        },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');

    console.log('✅ Analysis complete');
    console.log(`   Cultural Background: ${analysis.cultural_background}`);
    console.log(`   Confidence: ${analysis.confidence}`);
    console.log(`   Source: ${analysis.source_notes}`);

    if (analysis.confidence === 'high' || analysis.confidence === 'medium') {
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          cultural_background: analysis.cultural_background,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId);

      if (updateError) {
        console.error(`❌ Error updating profile: ${updateError.message}`);
      } else {
        console.log('💾 Profile updated successfully');
      }
    } else {
      console.log('⚠️  Low confidence - manual review recommended');
      console.log(`   Suggested: ${analysis.cultural_background}`);
    }

    return analysis;
  } catch (error: any) {
    console.error(`❌ Error during analysis: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Extracting Cultural Backgrounds from Transcripts\n');
  console.log(`📊 Processing ${PROFILES_MISSING_CULTURAL_BG.length} profiles\n`);

  for (const profileId of PROFILES_MISSING_CULTURAL_BG) {
    await extractCulturalBackground(profileId);
  }

  console.log('\n✨ Extraction complete!');
}

main().catch(console.error);
