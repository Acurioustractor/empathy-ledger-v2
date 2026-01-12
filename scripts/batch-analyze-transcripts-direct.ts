/**
 * Batch Analyze All Transcripts with ALMA Signal Extraction (Direct Method)
 *
 * Processes all transcripts without analysis results by calling the
 * Claude analyzer directly (bypasses Inngest).
 *
 * Features:
 * - Processes in batches of 5 to avoid rate limits
 * - Calls analyzer directly for immediate results
 * - Saves results to transcript_analysis_results table
 * - Monitors progress and logs errors
 * - Provides detailed status reporting
 *
 * Usage:
 *   npx tsx scripts/batch-analyze-transcripts-direct.ts
 */

import { createClient } from '@supabase/supabase-js'
import { claudeTranscriptAnalyzer } from '../src/lib/ai/transcript-analyzer-v3-claude'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ProcessingResult {
  transcript_id: string
  title: string
  storyteller_name: string
  success: boolean
  themes_count: number
  has_alma_signals: boolean
  processing_time_ms: number
  error?: string
}

async function getUnanalyzedTranscripts() {
  // Get transcripts that don't have analysis results
  const { data: analyzed, error: analyzedError } = await supabase
    .from('transcript_analysis_results')
    .select('transcript_id')

  if (analyzedError) throw analyzedError

  const analyzedIds = new Set((analyzed || []).map(a => a.transcript_id))

  const { data: transcripts, error: transcriptsError } = await supabase
    .from('transcripts')
    .select(`
      id,
      title,
      transcript_content,
      storyteller_id,
      tenant_id,
      storytellers!inner(display_name, cultural_background)
    `)
    .not('transcript_content', 'is', null)

  if (transcriptsError) throw transcriptsError

  // Filter out already analyzed
  const unanalyzed = (transcripts || []).filter(
    t => !analyzedIds.has(t.id)
  )

  return unanalyzed
}

async function analyzeAndSaveTranscript(transcript: any): Promise<ProcessingResult> {
  const storytellerName = transcript.storytellers.display_name
  const startTime = Date.now()

  try {
    // Run analysis
    const analysis = await claudeTranscriptAnalyzer.analyzeTranscript(
      transcript.transcript_content,
      {
        title: transcript.title,
        storyteller_name: storytellerName,
        cultural_context: transcript.storytellers.cultural_background
      }
    )

    const processingTime = Date.now() - startTime

    // Save to database - map to correct columns
    const { error: saveError } = await supabase
      .from('transcript_analysis_results')
      .insert({
        transcript_id: transcript.id,
        tenant_id: transcript.tenant_id,
        analyzer_version: 'v3-claude-sonnet-4.5',
        themes: analysis.themes || [],
        quotes: analysis.key_quotes || [],
        impact_assessment: analysis.impact_dimensions || {},
        cultural_flags: analysis.cultural_markers || {},
        quality_metrics: {
          verification_rate: analysis.verification_stats?.verification_rate || 0,
          quotes_verified: analysis.verification_stats?.quotes_verified || 0,
          processing_time_ms: processingTime
        },
        processing_time_ms: processingTime,
        created_at: new Date().toISOString()
      })

    if (saveError) {
      throw new Error(`Failed to save: ${saveError.message}`)
    }

    return {
      transcript_id: transcript.id,
      title: transcript.title || 'Untitled',
      storyteller_name: storytellerName,
      success: true,
      themes_count: (analysis.themes?.length || 0) + (analysis.cultural_themes?.length || 0),
      has_alma_signals: !!analysis.alma_signals,
      processing_time_ms: processingTime
    }
  } catch (error) {
    const processingTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)

    return {
      transcript_id: transcript.id,
      title: transcript.title || 'Untitled',
      storyteller_name: storytellerName,
      success: false,
      themes_count: 0,
      has_alma_signals: false,
      processing_time_ms: processingTime,
      error: errorMessage
    }
  }
}

async function processBatch(
  transcripts: any[],
  batchNumber: number,
  totalBatches: number
): Promise<ProcessingResult[]> {
  const results: ProcessingResult[] = []

  console.log(`\n${'━'.repeat(80)}`)
  console.log(`📦 BATCH ${batchNumber}/${totalBatches}`)
  console.log(`${'━'.repeat(80)}`)

  for (let i = 0; i < transcripts.length; i++) {
    const transcript = transcripts[i]
    const storytellerName = transcript.storytellers.display_name

    console.log(`\n[${i + 1}/${transcripts.length}] 🔄 Analyzing:`)
    console.log(`   Transcript: ${transcript.title || 'Untitled'}`)
    console.log(`   Storyteller: ${storytellerName}`)
    console.log(`   ID: ${transcript.id}`)

    const result = await analyzeAndSaveTranscript(transcript)
    results.push(result)

    if (result.success) {
      console.log(`   ✅ Success - ${result.themes_count} themes, ALMA: ${result.has_alma_signals ? 'Yes' : 'No'}, ${(result.processing_time_ms / 1000).toFixed(1)}s`)
    } else {
      console.log(`   ❌ Failed: ${result.error}`)
    }

    // Small delay between transcripts
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return results
}

async function batchAnalyzeAllTranscripts() {
  console.log('📊 Batch Transcript Analysis - Direct Method')
  console.log('=' .repeat(80))
  console.log()

  // Get unanalyzed transcripts
  console.log('🔍 Fetching unanalyzed transcripts...')
  const unanalyzed = await getUnanalyzedTranscripts()

  console.log(`✅ Found ${unanalyzed.length} transcripts to analyze\n`)

  if (unanalyzed.length === 0) {
    console.log('✅ All transcripts have already been analyzed!')
    console.log('Nothing to do. 🎉')
    return
  }

  // Calculate estimates
  const avgTimePerTranscript = 50 // seconds (from Phase 3 testing)
  const batchSize = 5 // Smaller batches for direct processing
  const estimatedTimeHours = (unanalyzed.length * avgTimePerTranscript) / 3600
  const costPerTranscript = 0.03
  const estimatedCost = unanalyzed.length * costPerTranscript

  console.log(`📊 BATCH ANALYSIS ESTIMATES`)
  console.log(`${'─'.repeat(80)}`)
  console.log(`Transcripts to Analyze:  ${unanalyzed.length}`)
  console.log(`Batch Size:              ${batchSize}`)
  console.log(`Estimated Time:          ${estimatedTimeHours.toFixed(1)} hours`)
  console.log(`Estimated Cost:          $${estimatedCost.toFixed(2)} USD`)
  console.log(`${'─'.repeat(80)}\n`)

  // Process in batches
  const batches: any[][] = []
  for (let i = 0; i < unanalyzed.length; i += batchSize) {
    batches.push(unanalyzed.slice(i, i + batchSize))
  }

  console.log(`📦 Processing ${batches.length} batches of up to ${batchSize} transcripts\n`)

  // Confirmation
  console.log('⚠️  WARNING: This will analyze all unanalyzed transcripts directly.')
  console.log(`   Estimated cost: $${estimatedCost.toFixed(2)} USD`)
  console.log(`   Estimated time: ${estimatedTimeHours.toFixed(1)} hours`)
  console.log()
  console.log('Press Ctrl+C to cancel, or the script will continue in 5 seconds...')

  await new Promise(resolve => setTimeout(resolve, 5000))

  console.log('\n🚀 Starting batch processing...\n')

  const allResults: ProcessingResult[] = []
  const startTime = Date.now()

  for (let i = 0; i < batches.length; i++) {
    const batchResults = await processBatch(batches[i], i + 1, batches.length)
    allResults.push(...batchResults)

    // Show progress
    const completed = (i + 1) * batchSize
    const total = unanalyzed.length
    const percent = Math.min(100, (completed / total) * 100)
    const elapsed = (Date.now() - startTime) / 1000
    const rate = completed / elapsed
    const remaining = (total - completed) / rate

    console.log(`\n📊 Progress: ${completed}/${total} (${percent.toFixed(1)}%)`)
    console.log(`   Elapsed: ${(elapsed / 60).toFixed(1)}m, Remaining: ~${(remaining / 60).toFixed(1)}m`)
    console.log(`   Rate: ${rate.toFixed(2)} transcripts/sec`)

    // Delay between batches
    if (i < batches.length - 1) {
      console.log(`\n⏸️  Waiting 5 seconds before next batch...\n`)
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }

  const endTime = Date.now()
  const totalTimeSeconds = (endTime - startTime) / 1000

  // Summary
  console.log(`\n${'━'.repeat(80)}`)
  console.log(`📊 BATCH PROCESSING SUMMARY`)
  console.log(`${'━'.repeat(80)}`)

  const successful = allResults.filter(r => r.success).length
  const failed = allResults.filter(r => !r.success).length
  const withAlma = allResults.filter(r => r.has_alma_signals).length
  const avgThemes = successful > 0
    ? allResults.filter(r => r.success).reduce((sum, r) => sum + r.themes_count, 0) / successful
    : 0
  const avgTime = successful > 0
    ? allResults.filter(r => r.success).reduce((sum, r) => sum + r.processing_time_ms, 0) / successful
    : 0

  console.log(`\nTotal Analyzed:          ${allResults.length}`)
  console.log(`Successful:              ${successful} ✅`)
  console.log(`Failed:                  ${failed} ${failed > 0 ? '❌' : ''}`)
  console.log(`Success Rate:            ${((successful / allResults.length) * 100).toFixed(1)}%`)
  console.log(`With ALMA Signals:       ${withAlma}/${successful} (${successful > 0 ? ((withAlma / successful) * 100).toFixed(1) : 0}%)`)
  console.log(`Avg Themes:              ${avgThemes.toFixed(1)}`)
  console.log(`Avg Processing Time:     ${(avgTime / 1000).toFixed(1)}s`)
  console.log(`Total Time:              ${(totalTimeSeconds / 60).toFixed(1)} minutes`)

  if (failed > 0) {
    console.log(`\n❌ FAILED ANALYSES (showing first 10):`)
    console.log(`${'─'.repeat(80)}`)
    allResults
      .filter(r => !r.success)
      .slice(0, 10)
      .forEach(r => {
        console.log(`\n📄 ${r.title}`)
        console.log(`   Storyteller: ${r.storyteller_name}`)
        console.log(`   ID: ${r.transcript_id}`)
        console.log(`   Error: ${r.error}`)
      })
    if (failed > 10) {
      console.log(`\n   ... and ${failed - 10} more failures`)
    }
  }

  console.log(`\n${'━'.repeat(80)}`)
  console.log(`\n✅ Batch processing complete!`)
  console.log(`\nNext Steps:`)
  console.log(`1. Run verification: npx tsx scripts/verify-alma-extraction.ts`)
  console.log(`2. Review quality report`)
  console.log(`3. Backfill storyteller analysis: npx tsx scripts/backfill-storyteller-analysis.ts`)
  console.log(`4. Run ACT rollup: npm run act:rollup:all`)
  console.log(`${'━'.repeat(80)}\n`)
}

// Run the batch analysis
batchAnalyzeAllTranscripts().catch(error => {
  console.error('\n❌ Batch processing failed:', error)
  process.exit(1)
})
