import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkColumns() {
  // Try to insert a minimal record and see what error we get
  const testInsert = {
    transcript_id: '00000000-0000-0000-0000-000000000001', // fake UUID
    analyzer_version: 'test-v1',
    themes: ['test'],
    quotes: [],
    impact_assessment: {},
    cultural_flags: {},
    quality_metrics: {},
    processing_time_ms: 100
  }

  console.log('Attempting test insert with:', JSON.stringify(testInsert, null, 2))

  const { data, error } = await supabase
    .from('transcript_analysis_results')
    .insert(testInsert)
    .select()

  if (error) {
    console.log('\n❌ Insert failed with error:')
    console.log('Message:', error.message)
    console.log('Code:', error.code)
    console.log('Details:', error.details)
    console.log('Hint:', error.hint)
  } else {
    console.log('\n✅ Insert succeeded!')
    console.log('Data:', data)

    // Clean up
    if (data && data[0]) {
      await supabase
        .from('transcript_analysis_results')
        .delete()
        .eq('id', data[0].id)
      console.log('✅ Test record cleaned up')
    }
  }
}

checkColumns()
