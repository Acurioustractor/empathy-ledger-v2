import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkStatus() {
  console.log('━'.repeat(80))
  console.log('DATABASE STATUS CHECK')
  console.log('━'.repeat(80))
  console.log('\nConnecting to:', process.env.NEXT_PUBLIC_SUPABASE_URL)

  // Check transcripts table
  const { count: tCount, error: tError } = await supabase
    .from('transcripts')
    .select('*', { count: 'exact', head: true })

  console.log('\n1. TRANSCRIPTS TABLE:', tError ? '❌ ' + tError.message : `✅ Count: ${tCount}`)

  // Check if transcript_analysis_results exists
  const { count: rCount, error: rError } = await supabase
    .from('transcript_analysis_results')
    .select('*', { count: 'exact', head: true })

  console.log('2. TRANSCRIPT_ANALYSIS_RESULTS TABLE:', rError ? '❌ ' + rError.message : `✅ Count: ${rCount}`)

  if (!tError && !rError) {
    // Get unanalyzed count
    const { data: analyzed } = await supabase
      .from('transcript_analysis_results')
      .select('transcript_id')

    const analyzedIds = new Set((analyzed || []).map((a: any) => a.transcript_id))

    const { data: allTranscripts } = await supabase
      .from('transcripts')
      .select('id')
      .not('transcript_content', 'is', null)

    const unanalyzed = (allTranscripts || []).filter((t: any) => !analyzedIds.has(t.id)).length

    console.log('\n3. ANALYSIS STATUS:')
    console.log('   Total with content:', allTranscripts?.length || 0)
    console.log('   Analyzed:', analyzed?.length || 0)
    console.log('   Unanalyzed:', unanalyzed)
  }

  console.log('\n' + '━'.repeat(80))
}

checkStatus()
