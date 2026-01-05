#!/usr/bin/env tsx

/**
 * Knowledge Base Processing Script
 *
 * Scans all documentation, extracts metadata, creates semantic chunks,
 * generates embeddings, and stores in PostgreSQL for RAG system.
 *
 * Usage:
 *   npm run kb:process
 *   npm run kb:stats
 */

import { processAllDocumentation, extractAllQA, exportTrainingData } from '../src/lib/services/knowledge-base-service';
import { createClient } from '@supabase/supabase-js';
import { writeFile } from 'fs/promises';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =============================================================================
// COMMANDS
// =============================================================================

async function processKnowledgeBase() {
  console.log('🚀 Starting knowledge base processing...\n');

  const startTime = Date.now();

  try {
    await processAllDocumentation();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\n✅ Knowledge base processing complete in ${duration}s`);
    console.log('\nRun `npm run kb:stats` to see statistics');
  } catch (error) {
    console.error('\n❌ Knowledge base processing failed:', error);
    process.exit(1);
  }
}

async function showStats() {
  console.log('📊 Knowledge Base Statistics\n');

  try {
    // Call RPC function
    const { data, error } = await supabase.rpc('get_knowledge_base_stats');

    if (error) throw error;

    console.log('Total Documents:', data[0].total_documents);
    console.log('Total Chunks:', data[0].total_chunks);
    console.log('Total Extractions:', data[0].total_extractions);
    console.log('Total Relationships:', data[0].total_relationships);
    console.log('\nDocuments by Category:');
    Object.entries(data[0].documents_by_category || {}).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });
    console.log(`\nAverage Extraction Confidence: ${(data[0].average_confidence * 100).toFixed(1)}%`);
    console.log(`Cultural Safety Coverage: ${data[0].cultural_safety_coverage?.toFixed(1) || 0}%`);
  } catch (error) {
    console.error('❌ Failed to fetch stats:', error);
    process.exit(1);
  }
}

async function testRAG(query: string) {
  console.log(`🔍 Testing RAG query: "${query}"\n`);

  try {
    // Generate embedding for query
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    const queryEmbedding = response.data[0].embedding;

    // Search knowledge base (use lower threshold for now - 0.3 during initial testing)
    const { data, error } = await supabase.rpc('search_knowledge', {
      query_embedding: queryEmbedding,
      match_threshold: 0.3,
      match_count: 5,
    });

    if (error) throw error;

    console.log(`Found ${data.length} matching chunks:\n`);

    data.forEach((result: any, i: number) => {
      console.log(`${i + 1}. ${result.document_title}`);
      console.log(`   Category: ${result.document_category}`);
      console.log(`   Similarity: ${(result.similarity * 100).toFixed(1)}%`);
      console.log(`   Path: ${result.section_path?.join(' > ') || 'N/A'}`);
      console.log(`   Content: ${result.chunk_content.substring(0, 150)}...`);
      console.log();
    });
  } catch (error) {
    console.error('❌ RAG query failed:', error);
    process.exit(1);
  }
}

async function clearKnowledgeBase() {
  console.log('⚠️  WARNING: This will delete ALL knowledge base data!\n');

  // Ask for confirmation (in production, use a proper prompt library)
  const confirm = process.argv.includes('--confirm');

  if (!confirm) {
    console.log('Run with --confirm flag to proceed:');
    console.log('  npm run kb:clear -- --confirm');
    process.exit(0);
  }

  try {
    // Delete in reverse order due to foreign key constraints
    await supabase.from('knowledge_graph').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('knowledge_extractions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('knowledge_chunks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('knowledge_documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('✅ Knowledge base cleared');
  } catch (error) {
    console.error('❌ Failed to clear knowledge base:', error);
    process.exit(1);
  }
}

async function extractQA() {
  console.log('🧠 Starting Q&A extraction for SLM training...\n');

  const startTime = Date.now();

  // Parse options
  const limitArg = process.argv.find(arg => arg.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 500;

  const batchArg = process.argv.find(arg => arg.startsWith('--batch='));
  const batchSize = batchArg ? parseInt(batchArg.split('=')[1]) : 10;

  try {
    const result = await extractAllQA({
      limit,
      batchSize,
      minTokens: 50,
      skipExisting: true,
      delayMs: 1000,
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\n✅ Q&A extraction complete in ${duration}s`);
    console.log(`   Chunks processed: ${result.total}`);
    console.log(`   Extractions created: ${result.extracted}`);
    console.log(`   Failed: ${result.failed}`);
    console.log('\nRun `npm run kb:stats` to see updated statistics');
  } catch (error) {
    console.error('\n❌ Q&A extraction failed:', error);
    process.exit(1);
  }
}

async function exportData() {
  console.log('📦 Exporting training data...\n');

  // Parse options
  const formatArg = process.argv.find(arg => arg.startsWith('--format='));
  const format = (formatArg?.split('=')[1] as 'jsonl' | 'csv' | 'json') || 'jsonl';

  const outputArg = process.argv.find(arg => arg.startsWith('--output='));
  const output = outputArg?.split('=')[1] || `training-data.${format}`;

  try {
    const data = await exportTrainingData({
      format,
      minConfidence: 0.6,
      onlyCulturallySafe: true,
    });

    if (!data) {
      console.log('No training data to export');
      process.exit(0);
    }

    await writeFile(output, data);

    const lines = data.split('\n').length;
    console.log(`✅ Exported ${lines} training examples to ${output}`);
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

// =============================================================================
// CLI
// =============================================================================

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'process':
      await processKnowledgeBase();
      break;

    case 'stats':
      await showStats();
      break;

    case 'test':
      const query = process.argv[3];
      if (!query) {
        console.error('Usage: npm run kb:test "your query here"');
        process.exit(1);
      }
      await testRAG(query);
      break;

    case 'clear':
      await clearKnowledgeBase();
      break;

    case 'extract':
      await extractQA();
      break;

    case 'export':
      await exportData();
      break;

    default:
      console.log('Knowledge Base CLI\n');
      console.log('Commands:');
      console.log('  npm run kb:process  - Process all documentation');
      console.log('  npm run kb:stats    - Show knowledge base statistics');
      console.log('  npm run kb:test "query" - Test RAG search');
      console.log('  npm run kb:extract  - Extract Q&A pairs for SLM training');
      console.log('    Options: --limit=500 --batch=10');
      console.log('  npm run kb:export   - Export training data');
      console.log('    Options: --format=jsonl|csv|json --output=filename');
      console.log('  npm run kb:clear --confirm - Clear all knowledge base data');
      process.exit(0);
  }
}

main();
