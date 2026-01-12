import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testInsert() {
  console.log('1. Getting a real transcript ID...')

  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('id, title, tenant_id')
    .not('transcript_content', 'is', null)
    .limit(1)

  if (!transcripts || transcripts.length === 0) {
    throw new Error('No transcripts found')
  }

  const transcriptId = transcripts[0].id
  const tenantId = transcripts[0].tenant_id
  console.log('  Using transcript:', transcripts[0].title, '(', transcriptId, ')')
  console.log('  Tenant ID:', tenantId)

  console.log('\n2. Attempting to insert analysis result...')

  const testData = {
    transcript_id: transcriptId,
    tenant_id: tenantId,
    analyzer_version: 'test-schema-fix',
    themes: ['test theme 1', 'test theme 2'],
    quotes: [{
      text: "This is a test quote",
      theme: "testing",
      context: "Testing the database insert",
      impact_score: 3,
      speaker_insight: "This is a test",
      category: "wisdom",
      emotional_tone: "neutral",
      confidence_score: 50
    }],
    impact_assessment: { test: true },
    cultural_flags: { test: true },
    quality_metrics: {
      accuracy: 0.8,
      confidence: 0.7,
      processing_time_ms: 1000
    },
    processing_time_ms: 1000
  }

  console.log('  Data:', JSON.stringify(testData, null, 2))

  const { data, error } = await supabase
    .from('transcript_analysis_results')
    .insert(testData)
    .select()

  if (error) {
    console.log('\n❌ INSERT FAILED')
    console.log('Error message:', error.message)
    console.log('Error code:', error.code)
    console.log('Error details:', error.details)
    console.log('Error hint:', error.hint)
    process.exit(1)
  }

  console.log('\n✅ INSERT SUCCESSFUL!')
  console.log('  Inserted ID:', data[0].id)

  // Verify
  const { count } = await supabase
    .from('transcript_analysis_results')
    .select('*', { count: 'exact', head: true })

  console.log('  Total records:', count)

  // Clean up
  console.log('\n3. Cleaning up test record...')
  await supabase
    .from('transcript_analysis_results')
    .delete()
    .eq('id', data[0].id)

  console.log('✅ TEST COMPLETE - Schema fix works!')
}

testInsert()
