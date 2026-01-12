import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { claudeTranscriptAnalyzer } from '../src/lib/ai/transcript-analyzer-v3-claude'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testSingle() {
  console.log('Fetching ONE transcript for testing...')

  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('id, title, transcript_content, storyteller_id, tenant_id, storytellers(display_name, cultural_background)')
    .not('transcript_content', 'is', null)
    .limit(1)

  if (!transcripts || transcripts.length === 0) {
    throw new Error('No transcripts found')
  }

  const transcript = transcripts[0]
  console.log('Testing with:', transcript.title || 'Untitled')

  const startTime = Date.now()
  const analysis = await claudeTranscriptAnalyzer.analyzeTranscript(
    transcript.transcript_content,
    {
      title: transcript.title,
      storyteller_name: transcript.storytellers?.display_name || 'Unknown',
      cultural_context: transcript.storytellers?.cultural_background || null
    }
  )
  const processingTime = Date.now() - startTime

  console.log('\n✅ Analysis complete')
  console.log('Processing time:', processingTime, 'ms')
  console.log('Themes found:', analysis.themes?.length || 0)
  console.log('Quotes found:', analysis.key_quotes?.length || 0)

  console.log('\nAttempting to save to database...')
  const { error: saveError } = await supabase
    .from('transcript_analysis_results')
    .insert({
      transcript_id: transcript.id,
      tenant_id: transcript.tenant_id,
      analyzer_version: 'v3-claude-sonnet-4.5',
      themes: analysis.themes || [],
      quotes: analysis.key_quotes || [],
      impact_assessment: analysis.impact_assessment || {},
      cultural_flags: analysis.cultural_flags || {},
      quality_metrics: {
        accuracy: analysis.accuracy,
        confidence: analysis.confidence,
        processing_time_ms: processingTime
      },
      processing_time_ms: processingTime
    })

  if (saveError) {
    console.error('\n❌ SAVE FAILED:', saveError.message)
    process.exit(1)
  }

  console.log('\n✅ SAVE SUCCESSFUL!')
  console.log('\nVerifying in database...')

  const { count } = await supabase
    .from('transcript_analysis_results')
    .select('*', { count: 'exact', head: true })

  console.log('Database count:', count)
  console.log('\n✅ TEST COMPLETE - Schema fix works!')
}

testSingle()
