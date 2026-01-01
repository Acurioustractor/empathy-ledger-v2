/**
 * Direct Batch Processing (No Inngest Required)
 *
 * Processes transcripts directly without Inngest queue.
 * Use this for immediate results or when Inngest isn't configured.
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { claudeTranscriptAnalyzer } from '../src/lib/ai/transcript-analyzer-v3-claude'

config({ path: '.env.local' })

const LIMIT = parseInt(process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '10')
const DRY_RUN = process.argv.includes('--dry-run')

async function main() {
  console.log('🚀 Direct Batch Processing (No Inngest)')
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`)
  console.log(`Limit: ${LIMIT}`)
  console.log('')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch transcripts
  const { data: transcripts, error } = await supabase
    .from('transcripts')
    .select('id, title, storyteller_id, transcript_content, ai_processing_consent, profile:profiles!storyteller_id(display_name, cultural_background)')
    .eq('ai_processing_consent', true)
    .or('ai_summary.is.null,ai_summary.eq.')
    .order('created_at', { ascending: false })
    .limit(LIMIT)

  if (error || !transcripts) {
    console.error('❌ Error fetching transcripts:', error)
    return
  }

  console.log(`Found ${transcripts.length} transcripts to process\n`)

  if (DRY_RUN) {
    console.log('DRY RUN - would process:')
    transcripts.forEach((t, i) => console.log(`  ${i + 1}. ${t.title || 'Untitled'}`))
    return
  }

  let processed = 0
  let failed = 0

  for (const transcript of transcripts) {
    console.log(`\n[${processed + failed + 1}/${transcripts.length}] Processing: ${transcript.title || 'Untitled'}`)

    try {
      const content = transcript.transcript_content
      if (!content || content.length < 100) {
        console.log('  ⏭️  Skipped: Content too short')
        failed++
        continue
      }

      // Run analysis
      const analysis = await claudeTranscriptAnalyzer.analyzeTranscript(content, {
        title: transcript.title,
        storyteller_name: transcript.profile?.display_name,
        cultural_context: transcript.profile?.cultural_background
      })

      // Store results
      await supabase
        .from('transcripts')
        .update({
          ai_summary: analysis.summary,
          themes: analysis.themes,
          key_quotes: analysis.key_quotes.map(q => q.text),
          ai_processing_status: 'completed',
          metadata: {
            ai_analysis: {
              model: 'claude-sonnet-4-5',
              emotional_tone: analysis.emotional_tone,
              cultural_sensitivity_level: analysis.cultural_sensitivity_level,
              requires_elder_review: analysis.requires_elder_review,
              key_insights: analysis.key_insights,
              related_topics: analysis.related_topics,
              processing_time_ms: analysis.processing_time_ms,
              verification_stats: analysis.verification_stats,
              analyzed_at: new Date().toISOString()
            }
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', transcript.id)

      console.log(`  ✅ Processed: ${analysis.themes.length} themes, ${analysis.key_quotes.length} quotes`)
      processed++

      // Rate limit (1 per 3 seconds to avoid overwhelming Claude API)
      await new Promise(resolve => setTimeout(resolve, 3000))

    } catch (error: any) {
      console.error(`  ❌ Failed: ${error.message}`)
      failed++
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 Processing Complete')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Processed: ${processed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`Total: ${transcripts.length}`)
}

main().catch(console.error)
