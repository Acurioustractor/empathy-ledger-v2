/**
 * Test Inngest Integration
 *
 * Sends a test event to process one transcript via Inngest
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { Inngest } from 'inngest'

config({ path: '.env.local' })

async function main() {
  console.log('🧪 Testing Inngest Integration\n')

  // Create Inngest client
  const inngest = new Inngest({
    id: 'empathy-ledger',
    eventKey: process.env.INNGEST_EVENT_KEY
  })

  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch one transcript with consent
  console.log('📖 Fetching test transcript...')
  const { data: transcript, error } = await supabase
    .from('transcripts')
    .select('id, title, storyteller_id')
    .eq('ai_processing_consent', true)
    .or('ai_summary.is.null,ai_summary.eq.')
    .limit(1)
    .single()

  if (error || !transcript) {
    console.error('❌ Failed to fetch transcript:', error)
    process.exit(1)
  }

  console.log(`✅ Found: "${transcript.title || 'Untitled'}" (ID: ${transcript.id})\n`)

  // Send Inngest event
  console.log('📤 Sending event to Inngest...')
  try {
    await inngest.send({
      name: 'transcript/process',
      data: {
        transcriptId: transcript.id,
        storytellerId: transcript.storyteller_id
      }
    })

    console.log('✅ Event sent successfully!\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Next Steps:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('1. Go to https://app.inngest.com')
    console.log('2. Navigate to "Runs" tab')
    console.log('3. Look for "process-transcript" function run')
    console.log('4. Monitor progress (should complete in ~10-30 seconds)')
    console.log('5. Check for success ✅ or error ❌')
    console.log('')
    console.log('6. Verify in database:')
    console.log(`   npx tsx scripts/check-ai-processing-status.sh | grep ${transcript.id}`)
    console.log('')

  } catch (error: any) {
    console.error('❌ Failed to send event:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

main().catch(console.error)
