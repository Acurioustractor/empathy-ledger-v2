#!/usr/bin/env npx tsx
/**
 * Test Syndication Webhook System
 *
 * This script triggers a test revocation event to verify:
 * 1. Inngest receives the event
 * 2. processContentRevocation job runs
 * 3. Webhooks are sent to external sites
 * 4. verifyContentRemoval job runs after 1 minute
 */

import { Inngest } from 'inngest'

const inngest = new Inngest({
  id: 'empathy-ledger',
  eventKey: process.env.INNGEST_EVENT_KEY || 'test',
})

async function testRevocationWorkflow() {
  console.log('🧪 Testing Syndication Webhook System\n')
  console.log('════════════════════════════════════════════════════════════════')

  // Test data
  const testStoryId = 'd98c9cb6-96d2-49cf-8202-f3b8af905d18' // From seed data
  const testSiteIds = ['justicehub', 'theharvest'] // Multiple sites

  console.log('\n📋 Test Configuration:')
  console.log(`  Story ID: ${testStoryId}`)
  console.log(`  Sites: ${testSiteIds.join(', ')}`)
  console.log(`  Reason: Test revocation from test script`)

  console.log('\n🚀 Sending revocation event to Inngest...\n')

  try {
    // Send the revocation event
    const result = await inngest.send({
      name: 'syndication/content.revoked',
      data: {
        storyId: testStoryId,
        siteIds: testSiteIds,
        reason: 'Test revocation from test script',
        revokedBy: 'test-script',
        revokedAt: new Date().toISOString(),
      },
    })

    console.log('✅ Event sent successfully!')
    console.log('\n📊 Event Details:')
    console.log(`  Event ID: ${JSON.stringify(result.ids)}`)

    console.log('\n────────────────────────────────────────────────────────────────')
    console.log('\n✨ What happens next:')
    console.log('  1. ⏱️  Immediately: processContentRevocation job starts')
    console.log('  2. 📤 Webhooks sent to JusticeHub and The Harvest')
    console.log('  3. ⏳ After 1 minute: verifyContentRemoval job runs')
    console.log('  4. ✅ Verification checks if sites removed content')
    console.log('\n🌐 View progress in Inngest Dev UI:')
    console.log('  → http://localhost:8288')
    console.log('  → Click on "Events" to see the event')
    console.log('  → Click on "Functions" to see job execution')
    console.log('\n════════════════════════════════════════════════════════════════\n')

  } catch (error) {
    console.error('❌ Error sending event:', error)
    process.exit(1)
  }
}

// Run the test
testRevocationWorkflow()
  .then(() => {
    console.log('✅ Test completed successfully!\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
