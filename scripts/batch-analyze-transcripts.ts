/**
 * Batch Analyze All Transcripts with ALMA Signal Extraction
 *
 * Processes all transcripts without analysis results, triggering Inngest jobs
 * to analyze them with the enhanced Claude Sonnet 4.5 analyzer.
 *
 * Features:
 * - Processes in batches of 10 to avoid overwhelming the system
 * - Monitors progress and logs errors
 * - Provides detailed status reporting
 * - Estimates completion time and costs
 *
 * Usage:
 *   npx tsx scripts/batch-analyze-transcripts.ts
 */

import { createClient } from '@supabase/supabase-js'
import { inngest } from '../src/lib/inngest/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface BatchStats {
  total_transcripts: number
  already_analyzed: number
  pending_analysis: number
  batch_size: number
  estimated_time_hours: number
  estimated_cost_usd: number
}

interface ProcessingResult {
  transcript_id: string
  title: string
  storyteller_name: string
  success: boolean
  error?: string
  triggered_at: string
}

async function getBatchStats(): Promise<BatchStats> {
  // Get total transcripts
  const { count: totalCount, error: totalError } = await supabase
    .from('transcripts')
    .select('id', { count: 'exact', head: true })
    .not('transcript_content', 'is', null)

  if (totalError) throw totalError

  // Get already analyzed transcripts
  const { count: analyzedCount, error: analyzedError } = await supabase
    .from('transcript_analysis_results')
    .select('transcript_id', { count: 'exact', head: true })

  if (analyzedError) throw analyzedError

  const total = totalCount || 0
  const analyzed = analyzedCount || 0
  const pending = total - analyzed
  const batchSize = 10
  const avgTimePerTranscript = 50 // seconds (from Phase 3 testing)
  const estimatedTimeHours = (pending * avgTimePerTranscript) / 3600
  const costPerTranscript = 0.03 // USD
  const estimatedCost = pending * costPerTranscript

  return {
    total_transcripts: total,
    already_analyzed: analyzed,
    pending_analysis: pending,
    batch_size: batchSize,
    estimated_time_hours: estimatedTimeHours,
    estimated_cost_usd: estimatedCost
  }
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
      storytellers!inner(display_name)
    `)
    .not('transcript_content', 'is', null)

  if (transcriptsError) throw transcriptsError

  // Filter out already analyzed
  const unanalyzed = (transcripts || []).filter(
    t => !analyzedIds.has(t.id)
  )

  return unanalyzed
}

async function triggerAnalysisJob(
  transcriptId: string,
  storytellerId: string
): Promise<void> {
  // Trigger Inngest job for transcript analysis
  await inngest.send({
    name: 'transcript/analyze',
    data: {
      transcriptId,
      storytellerId
    }
  })
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

    console.log(`\n[${i + 1}/${transcripts.length}] 🔄 Triggering analysis:`)
    console.log(`   Transcript: ${transcript.title || 'Untitled'}`)
    console.log(`   Storyteller: ${storytellerName}`)
    console.log(`   ID: ${transcript.id}`)

    try {
      await triggerAnalysisJob(transcript.id, transcript.storyteller_id)

      results.push({
        transcript_id: transcript.id,
        title: transcript.title || 'Untitled',
        storyteller_name: storytellerName,
        success: true,
        triggered_at: new Date().toISOString()
      })

      console.log(`   ✅ Job triggered successfully`)

      // Small delay to avoid overwhelming Inngest
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      results.push({
        transcript_id: transcript.id,
        title: transcript.title || 'Untitled',
        storyteller_name: storytellerName,
        success: false,
        error: errorMessage,
        triggered_at: new Date().toISOString()
      })

      console.log(`   ❌ Failed to trigger job: ${errorMessage}`)
    }
  }

  return results
}

async function batchAnalyzeAllTranscripts() {
  console.log('📊 Batch Transcript Analysis - ALMA Signal Extraction')
  console.log('=' .repeat(80))
  console.log()

  // Get statistics
  console.log('📈 Gathering statistics...')
  const stats = await getBatchStats()

  console.log(`\n📊 BATCH ANALYSIS STATISTICS`)
  console.log(`${'─'.repeat(80)}`)
  console.log(`Total Transcripts:       ${stats.total_transcripts}`)
  console.log(`Already Analyzed:        ${stats.already_analyzed}`)
  console.log(`Pending Analysis:        ${stats.pending_analysis}`)
  console.log(`Batch Size:              ${stats.batch_size}`)
  console.log(`Estimated Time:          ${stats.estimated_time_hours.toFixed(1)} hours`)
  console.log(`Estimated Cost:          $${stats.estimated_cost_usd.toFixed(2)} USD`)
  console.log(`${'─'.repeat(80)}`)

  if (stats.pending_analysis === 0) {
    console.log('\n✅ All transcripts have already been analyzed!')
    console.log('Nothing to do. 🎉')
    return
  }

  // Get unanalyzed transcripts
  console.log('\n🔍 Fetching unanalyzed transcripts...')
  const unanalyzed = await getUnanalyzedTranscripts()

  console.log(`✅ Found ${unanalyzed.length} transcripts to analyze\n`)

  // Process in batches
  const batchSize = stats.batch_size
  const batches: any[][] = []

  for (let i = 0; i < unanalyzed.length; i += batchSize) {
    batches.push(unanalyzed.slice(i, i + batchSize))
  }

  console.log(`📦 Processing ${batches.length} batches of up to ${batchSize} transcripts\n`)

  // Confirmation prompt
  console.log('⚠️  WARNING: This will trigger Inngest jobs for all unanalyzed transcripts.')
  console.log(`   Estimated cost: $${stats.estimated_cost_usd.toFixed(2)} USD`)
  console.log(`   Estimated time: ${stats.estimated_time_hours.toFixed(1)} hours`)
  console.log()
  console.log('Press Ctrl+C to cancel, or the script will continue in 5 seconds...')

  await new Promise(resolve => setTimeout(resolve, 5000))

  console.log('\n🚀 Starting batch processing...\n')

  const allResults: ProcessingResult[] = []
  const startTime = Date.now()

  for (let i = 0; i < batches.length; i++) {
    const batchResults = await processBatch(batches[i], i + 1, batches.length)
    allResults.push(...batchResults)

    // Delay between batches to spread load
    if (i < batches.length - 1) {
      console.log(`\n⏸️  Waiting 10 seconds before next batch...\n`)
      await new Promise(resolve => setTimeout(resolve, 10000))
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

  console.log(`\nTotal Jobs Triggered:    ${allResults.length}`)
  console.log(`Successful:              ${successful} ✅`)
  console.log(`Failed:                  ${failed} ${failed > 0 ? '❌' : ''}`)
  console.log(`Success Rate:            ${((successful / allResults.length) * 100).toFixed(1)}%`)
  console.log(`Processing Time:         ${totalTimeSeconds.toFixed(1)}s`)

  if (failed > 0) {
    console.log(`\n❌ FAILED JOBS:`)
    console.log(`${'─'.repeat(80)}`)
    allResults
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`\n📄 ${r.title}`)
        console.log(`   Storyteller: ${r.storyteller_name}`)
        console.log(`   ID: ${r.transcript_id}`)
        console.log(`   Error: ${r.error}`)
      })
  }

  console.log(`\n${'━'.repeat(80)}`)
  console.log(`\n✅ Batch processing complete!`)
  console.log(`\nNext Steps:`)
  console.log(`1. Monitor Inngest dashboard for job progress`)
  console.log(`2. Check transcript_analysis_results table for completed analyses`)
  console.log(`3. Verify ALMA signals are being extracted correctly`)
  console.log(`4. Run: npx tsx scripts/verify-alma-extraction.ts`)
  console.log(`\nExpected completion: ${stats.estimated_time_hours.toFixed(1)} hours from now`)
  console.log(`${'━'.repeat(80)}\n`)
}

// Run the batch analysis
batchAnalyzeAllTranscripts().catch(error => {
  console.error('\n❌ Batch processing failed:', error)
  process.exit(1)
})
