/**
 * Batch Process Transcripts with AI
 *
 * Processes all consented transcripts through AI analysis pipeline.
 * Respects consent flags and rate limits.
 *
 * Usage:
 *   npx tsx scripts/batch-process-transcripts.ts [--limit 10] [--dry-run]
 *
 * @see https://github.com/Acurioustractor/empathy-ledger-v2/issues/130
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { Inngest } from 'inngest'

// Load .env.local
config({ path: '.env.local' })

const DRY_RUN = process.argv.includes('--dry-run')
const LIMIT = parseInt(process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '0') || undefined
const RATE_LIMIT_MS = 500 // 500ms between Inngest event sends

interface Transcript {
  id: string
  title: string
  ai_processing_consent: boolean
  ai_processing_status: string | null
  ai_summary: string | null
  themes: string[] | null
  key_quotes: string[] | null
  storyteller_id: string
}

async function main() {
  console.log('🚀 Batch Processing Transcripts')
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE'}`)
  console.log(`Limit: ${LIMIT || 'ALL'}`)
  console.log('')

  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Create Inngest client
  const inngest = new Inngest({ id: 'empathy-ledger-batch-processor' })

  // Step 1: Find consented transcripts without summaries
  console.log('1️⃣ Finding consented transcripts without AI summaries...')

  let query = supabase
    .from('transcripts')
    .select('id, title, ai_processing_consent, ai_processing_status, ai_summary, themes, key_quotes, storyteller_id')
    .eq('ai_processing_consent', true)
    .or('ai_summary.is.null,ai_summary.eq.')
    .order('created_at', { ascending: false })

  if (LIMIT) {
    query = query.limit(LIMIT)
  }

  const { data: transcripts, error } = await query

  if (error) {
    console.error('❌ Failed to fetch transcripts:', error)
    process.exit(1)
  }

  if (!transcripts || transcripts.length === 0) {
    console.log('✅ No transcripts need processing! All done.')
    process.exit(0)
  }

  console.log(`Found ${transcripts.length} transcripts to process`)
  console.log('')

  // Step 2: Analyze current state
  const stats = {
    total: transcripts.length,
    with_consent: 0,
    without_summary: 0,
    with_themes: 0,
    with_quotes: 0,
    processing_status: {} as Record<string, number>
  }

  transcripts.forEach((t: Transcript) => {
    if (t.ai_processing_consent) stats.with_consent++
    if (!t.ai_summary || t.ai_summary.trim() === '') stats.without_summary++
    if (t.themes && t.themes.length > 0) stats.with_themes++
    if (t.key_quotes && t.key_quotes.length > 0) stats.with_quotes++

    const status = t.ai_processing_status || 'null'
    stats.processing_status[status] = (stats.processing_status[status] || 0) + 1
  })

  console.log('📊 Current State:')
  console.log(`  Total transcripts: ${stats.total}`)
  console.log(`  With consent: ${stats.with_consent}`)
  console.log(`  Without summary: ${stats.without_summary}`)
  console.log(`  With themes: ${stats.with_themes}`)
  console.log(`  With quotes: ${stats.with_quotes}`)
  console.log(`  Processing status breakdown:`)
  Object.entries(stats.processing_status).forEach(([status, count]) => {
    console.log(`    ${status}: ${count}`)
  })
  console.log('')

  if (DRY_RUN) {
    console.log('🏁 DRY RUN complete - no changes made')
    console.log('')
    console.log('Sample transcripts that would be processed:')
    transcripts.slice(0, 5).forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.title} (${t.id})`)
    })
    console.log('')
    console.log('To process for real, run:')
    console.log('  npx tsx scripts/batch-process-transcripts.ts')
    console.log('')
    console.log('To process just 10 for testing:')
    console.log('  npx tsx scripts/batch-process-transcripts.ts --limit=10')
    process.exit(0)
  }

  // Step 3: Process each transcript
  console.log('3️⃣ Queueing transcripts for processing...')
  console.log('')

  let processed = 0
  let failed = 0
  let skipped = 0

  for (const transcript of transcripts) {
    const index = processed + failed + skipped + 1

    console.log(`[${index}/${transcripts.length}] Queueing: ${transcript.title}`)
    console.log(`  ID: ${transcript.id}`)
    console.log(`  Consent: ${transcript.ai_processing_consent ? '✅' : '❌'}`)
    console.log(`  Current status: ${transcript.ai_processing_status || 'null'}`)

    // Skip if no consent
    if (!transcript.ai_processing_consent) {
      console.log('  ⏭️  SKIPPED: No consent')
      skipped++
      console.log('')
      continue
    }

    try {
      // Update status to queued
      await supabase
        .from('transcripts')
        .update({
          ai_processing_status: 'queued',
          updated_at: new Date().toISOString()
        })
        .eq('id', transcript.id)

      // Send to Inngest queue
      await inngest.send({
        name: 'transcript/process',
        data: {
          transcriptId: transcript.id
        }
      })

      console.log(`  ✅ QUEUED for processing`)
      processed++

      // Rate limit to avoid overwhelming Inngest
      if (index < transcripts.length) {
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS))
      }

    } catch (error) {
      console.error(`  ❌ FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`)
      failed++
    }

    console.log('')
  }

  // Step 4: Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 Batch Processing Complete')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Total transcripts: ${transcripts.length}`)
  console.log(`✅ Successfully queued: ${processed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`⏭️  Skipped (no consent): ${skipped}`)
  console.log('')
  console.log('⏳ Processing will complete in background (2-5 minutes per transcript)')
  console.log('')
  console.log('📋 Next Steps:')
  console.log('  1. Monitor Inngest dashboard: https://app.inngest.com')
  console.log('  2. Check processing status with:')
  console.log('     ./scripts/check-ai-processing-status.sh')
  console.log('  3. Verify summaries after ~30 minutes:')
  console.log('     ./scripts/psql-supabase.sh -c "SELECT COUNT(*) FROM transcripts WHERE ai_summary IS NOT NULL;"')
  console.log('')
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
