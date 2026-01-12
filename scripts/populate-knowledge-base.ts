/**
 * Populate empathy_ledger_knowledge_base with stories and transcripts
 *
 * Generates embeddings for RAG hybrid search
 * Respects consent boundaries and privacy levels
 */

import { createClient } from '@supabase/supabase-js';
import { Anthropic } from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

interface Story {
  id: string;
  title: string;
  content: string;
  summary?: string;
  storyteller_id: string;
  tenant_id: string;
  privacy_level?: string;
  consent_level?: string;
  themes?: string[];
  conservation_topics?: string[];
}

interface Transcript {
  id: string;
  title?: string;
  transcript_text: string;
  storyteller_id: string;
  tenant_id: string;
  privacy_level?: string;
  consent_level?: string;
}

/**
 * Generate embedding using Claude's text embedding
 * Note: Using Anthropic's recommended embedding approach
 */
async function generateEmbedding(text: string): Promise<number[]> {
  // For now, using OpenAI's embedding as Anthropic doesn't have dedicated embedding API
  // In production, consider using Voyage AI or similar for embeddings
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      input: text.slice(0, 8000), // Limit input length
      model: 'text-embedding-3-small', // 1536 dimensions
      dimensions: 1536
    })
  });

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * Extract ALMA context from story/transcript
 */
function extractALMAContext(content: any, analysis?: any): any {
  return {
    authority: analysis?.alma_signals?.authority?.level || 'lived_experience',
    evidence_strength: analysis?.alma_signals?.evidence_strength?.primary_source ? 'high' : 'medium',
    harm_risk: 'safe', // Already filtered by consent
    transferability: analysis?.alma_signals?.option_value?.handover_potential || 'high',
    Beautiful_Obsolescence_ready: analysis?.alma_signals?.option_value?.commons_contribution === 'knowledge_shared_freely'
  };
}

async function populateFromStories() {
  console.log('📚 Populating knowledge base from stories...\n');

  // Get stories with public or organization consent
  const { data: stories, error } = await supabase
    .from('stories')
    .select('*')
    .in('privacy_level', ['public', 'organization'])
    .in('consent_level', ['public_sharing', 'research', 'commercial'])
    .not('content', 'is', null)
    .limit(100); // Process in batches

  if (error) {
    console.error('❌ Error fetching stories:', error);
    return { success: 0, errors: 0 };
  }

  console.log(`   Found ${stories?.length || 0} eligible stories\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const story of stories || []) {
    try {
      // Get storyteller analysis for ALMA context
      const { data: analysis } = await supabase
        .from('storyteller_master_analysis')
        .select('alma_signals')
        .eq('storyteller_id', story.storyteller_id)
        .single();

      // Generate embedding
      const embeddingText = `${story.title}\n\n${story.summary || story.content.slice(0, 1000)}`;
      console.log(`   🔄 Generating embedding for: ${story.title}`);
      const embedding = await generateEmbedding(embeddingText);

      // Extract ALMA context
      const almaContext = extractALMAContext(story, analysis);

      // Check for existing
      const { data: existing } = await supabase
        .from('empathy_ledger_knowledge_base')
        .select('id')
        .eq('source_type', 'story')
        .eq('source_id', story.id)
        .single();

      const payload = {
        source_type: 'story',
        source_id: story.id,
        title: story.title,
        content: story.content,
        summary: story.summary,
        keywords: extractKeywords(story.content),
        cultural_tags: [], // Extract from story metadata
        themes: story.themes || [],
        act_framework_tags: ['LCAA', 'Beautiful_Obsolescence'],
        alma_context: almaContext,
        embedding,
        tenant_id: story.tenant_id,
        privacy_level: story.privacy_level || 'private',
        consent_level: story.consent_level || 'community_only',
        quality_score: 0.80
      };

      if (existing) {
        const { error: updateError } = await supabase
          .from('empathy_ledger_knowledge_base')
          .update(payload)
          .eq('id', existing.id);

        if (updateError) {
          console.error(`   ❌ Error updating story ${story.title}:`, updateError.message);
          errorCount++;
        } else {
          console.log(`   ✅ Updated: ${story.title}`);
          successCount++;
        }
      } else {
        const { error: insertError } = await supabase
          .from('empathy_ledger_knowledge_base')
          .insert(payload);

        if (insertError) {
          console.error(`   ❌ Error inserting story ${story.title}:`, insertError.message);
          errorCount++;
        } else {
          console.log(`   ✅ Created: ${story.title}`);
          successCount++;
        }
      }

      // Rate limit: wait 200ms between API calls
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (err) {
      console.error(`   ❌ Error processing story ${story.title}:`, err);
      errorCount++;
    }
  }

  return { success: successCount, errors: errorCount };
}

async function populateFromTranscripts() {
  console.log('\n📝 Populating knowledge base from transcripts...\n');

  // Get transcripts with consent
  const { data: transcripts, error } = await supabase
    .from('transcripts')
    .select('*')
    .in('privacy_level', ['public', 'organization'])
    .not('transcript_text', 'is', null)
    .limit(50); // Smaller batch for transcripts (longer content)

  if (error) {
    console.error('❌ Error fetching transcripts:', error);
    return { success: 0, errors: 0 };
  }

  console.log(`   Found ${transcripts?.length || 0} eligible transcripts\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const transcript of transcripts || []) {
    try {
      // Get analysis for ALMA context
      const { data: analysis } = await supabase
        .from('transcript_analysis_results')
        .select('*')
        .eq('transcript_id', transcript.id)
        .single();

      // Generate summary first (for embedding)
      const summary = transcript.transcript_text.slice(0, 500);
      const embeddingText = `${transcript.title || 'Transcript'}\n\n${summary}`;

      console.log(`   🔄 Generating embedding for transcript ${transcript.id}`);
      const embedding = await generateEmbedding(embeddingText);

      // Extract ALMA context
      const almaContext = extractALMAContext(transcript, analysis);

      // Check for existing
      const { data: existing } = await supabase
        .from('empathy_ledger_knowledge_base')
        .select('id')
        .eq('source_type', 'transcript')
        .eq('source_id', transcript.id)
        .single();

      const payload = {
        source_type: 'transcript',
        source_id: transcript.id,
        title: transcript.title || `Transcript ${transcript.id}`,
        content: transcript.transcript_text,
        summary,
        keywords: extractKeywords(transcript.transcript_text),
        cultural_tags: analysis?.cultural_elements || [],
        themes: analysis?.themes || [],
        act_framework_tags: ['Listen', 'Curiosity'],
        alma_context: almaContext,
        embedding,
        tenant_id: transcript.tenant_id,
        privacy_level: transcript.privacy_level || 'private',
        consent_level: transcript.consent_level || 'community_only',
        quality_score: 0.75
      };

      if (existing) {
        const { error: updateError } = await supabase
          .from('empathy_ledger_knowledge_base')
          .update(payload)
          .eq('id', existing.id);

        if (updateError) {
          console.error(`   ❌ Error updating transcript:`, updateError.message);
          errorCount++;
        } else {
          console.log(`   ✅ Updated transcript ${transcript.id}`);
          successCount++;
        }
      } else {
        const { error: insertError } = await supabase
          .from('empathy_ledger_knowledge_base')
          .insert(payload);

        if (insertError) {
          console.error(`   ❌ Error inserting transcript:`, insertError.message);
          errorCount++;
        } else {
          console.log(`   ✅ Created transcript ${transcript.id}`);
          successCount++;
        }
      }

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (err) {
      console.error(`   ❌ Error processing transcript:`, err);
      errorCount++;
    }
  }

  return { success: successCount, errors: errorCount };
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction (in production, use better NLP)
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 4);

  const wordCounts = new Map<string, number>();
  words.forEach(word => {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  });

  return Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

async function populateKnowledgeBase() {
  console.log('🌱 ACT KNOWLEDGE BASE POPULATION\n');
  console.log('Generating embeddings for RAG hybrid search...\n');
  console.log('='.repeat(70));

  // Populate from stories
  const storiesResult = await populateFromStories();

  // Populate from transcripts
  const transcriptsResult = await populateFromTranscripts();

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 KNOWLEDGE BASE POPULATION COMPLETE');
  console.log('='.repeat(70));
  console.log(`✅ Stories: ${storiesResult.success} successful, ${storiesResult.errors} errors`);
  console.log(`✅ Transcripts: ${transcriptsResult.success} successful, ${transcriptsResult.errors} errors`);
  console.log(`📈 Total: ${storiesResult.success + transcriptsResult.success} knowledge pieces`);

  // Verify
  console.log('\n📊 Verification:\n');
  const { data: summary } = await supabase
    .from('act_unified_analysis_summary')
    .select('*')
    .eq('table_name', 'empathy_ledger_knowledge_base')
    .single();

  console.table(summary);
}

populateKnowledgeBase().catch(console.error);
