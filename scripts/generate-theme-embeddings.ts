/**
 * Generate Theme Embeddings Script
 *
 * Generates OpenAI embeddings for all themes in the narrative_themes table
 * that don't already have embeddings.
 *
 * Usage:
 *   npx tsx scripts/generate-theme-embeddings.ts
 *
 * Requirements:
 *   - OPENAI_API_KEY in environment
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment
 *
 * Cost Estimate:
 *   - text-embedding-3-small: $0.00002 per 1K tokens
 *   - ~479 themes * ~10 tokens each = ~4,790 tokens
 *   - Estimated cost: $0.10
 */

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Configuration
const BATCH_SIZE = 100  // Process 100 themes at a time
const DELAY_MS = 1000    // 1 second delay between batches (rate limiting)

// Initialize clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL')
  console.error('  SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface Theme {
  id: string
  theme_name: string
  theme_category: string | null
  theme_description: string | null
}

/**
 * Generate embedding for a theme
 */
async function generateEmbedding(theme: Theme): Promise<number[]> {
  // Create rich text for embedding
  const text = [
    `Category: ${theme.theme_category || 'general'}`,
    `Theme: ${theme.theme_name}`,
    theme.theme_description ? `Description: ${theme.theme_description}` : null
  ]
    .filter(Boolean)
    .join('. ')

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    dimensions: 1536
  })

  return response.data[0].embedding
}

/**
 * Update theme with embedding
 */
async function updateThemeEmbedding(themeId: string, embedding: number[]) {
  const { error } = await supabase
    .from('narrative_themes')
    .update({ embedding })
    .eq('id', themeId)

  if (error) {
    throw new Error(`Failed to update theme ${themeId}: ${error.message}`)
  }
}

/**
 * Sleep for delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Theme Embedding Generation Started\n')

  // Fetch themes without embeddings
  const { data: themes, error } = await supabase
    .from('narrative_themes')
    .select('id, theme_name, theme_category, theme_description')
    .is('embedding', null)
    .order('usage_count', { ascending: false })  // Process most-used themes first

  if (error) {
    throw new Error(`Failed to fetch themes: ${error.message}`)
  }

  if (!themes || themes.length === 0) {
    console.log('✅ All themes already have embeddings!')
    return
  }

  console.log(`📊 Found ${themes.length} themes without embeddings\n`)
  console.log(`⚙️  Processing in batches of ${BATCH_SIZE}`)
  console.log(`⏱️  Rate limit delay: ${DELAY_MS}ms between batches\n`)

  let successCount = 0
  let errorCount = 0
  const totalBatches = Math.ceil(themes.length / BATCH_SIZE)

  // Process in batches
  for (let i = 0; i < themes.length; i += BATCH_SIZE) {
    const batch = themes.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1

    console.log(`\n📦 Processing Batch ${batchNum}/${totalBatches} (${batch.length} themes)`)

    for (const theme of batch) {
      try {
        const embedding = await generateEmbedding(theme)
        await updateThemeEmbedding(theme.id, embedding)
        successCount++

        process.stdout.write(`✓ ${theme.theme_name.padEnd(40)} (${successCount}/${themes.length})\r`)
      } catch (error) {
        errorCount++
        console.error(`\n❌ Error processing "${theme.theme_name}":`, error)
      }
    }

    // Rate limiting delay between batches (except last batch)
    if (i + BATCH_SIZE < themes.length) {
      process.stdout.write(`\n⏳ Waiting ${DELAY_MS}ms before next batch...`)
      await sleep(DELAY_MS)
    }
  }

  console.log('\n\n' + '='.repeat(60))
  console.log('📊 Embedding Generation Complete!')
  console.log('='.repeat(60))
  console.log(`✅ Success: ${successCount}/${themes.length}`)
  console.log(`❌ Errors:  ${errorCount}/${themes.length}`)

  if (errorCount > 0) {
    console.log('\n⚠️  Some themes failed to process. Re-run the script to retry.')
  } else {
    console.log('\n🎉 All themes now have embeddings!')
  }

  // Verify results
  const { count } = await supabase
    .from('narrative_themes')
    .select('*', { count: 'exact', head: true })
    .not('embedding', 'is', null)

  console.log(`\n📈 Total themes with embeddings: ${count}`)
}

// Run
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n💥 Fatal Error:', error)
    process.exit(1)
  })
