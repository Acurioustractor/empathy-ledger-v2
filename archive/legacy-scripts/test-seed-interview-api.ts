/**
 * Test Full Setup Seed Interview API
 */

const PROJECT_ID = '6bd47c8a-e676-456f-aa25-ddcbb5a31047' // Goods project
const API_URL = 'http://localhost:3030'

const SEED_INTERVIEW = `
1) What is this project trying to achieve?
Build durable, repairable household goods with and by First Nations communities, so ownership, skills, and value stay on-country while meeting urgent needs for beds, washing machines, and fridges.

2) What does success look like for your community?
Community-owned manufacturing and maintenance facilities running locally.
People sleeping better with sturdy beds, washing reliably with indestructible machines, and storing food safely.
Local teams trained and making decisions without external dependency.
Revenue circulating through community enterprises rather than leaving Country.

3) What outcomes are you hoping to see in people's lives?
Fewer people sleeping on floors and improved sleep quality.
Better hygiene, dignity, and reduced infections including RHD-related risks.
Local jobs, skills transfer, and pride in making and maintaining their own goods.
Faster, cheaper repairs and longer product lifespans that reduce waste.

4) What values guide your approach?
First Nations leadership and self-determination.
Community invitation over top‑down scaling.
Circular economy design: repairable, recyclable, and locally maintainable.
Story‑guided accountability through community voice and lived experience.
Transition toward financial sovereignty beyond philanthropy.

5) How will you know when you've made a difference?
Community-defined indicators and stories show improved sleep, hygiene, and dignity.
Local health data reflects reductions in infections and RHD risk factors.
Lifecycle and repair records demonstrate durability and maintainability.
Facilities, training, and decision-making are owned locally, with outside support no longer required.
`.trim()

async function testSeedInterview() {
  console.log('🧪 Testing Seed Interview API\n')

  try {
    const response = await fetch(
      `${API_URL}/api/projects/${PROJECT_ID}/context/seed-interview`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interview_transcript: SEED_INTERVIEW,
          interviewed_by: 'Claude'
        })
      }
    )

    console.log(`📊 Response status: ${response.status} ${response.statusText}\n`)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ Error response body:')
      console.log(errorText)
      console.log('\n')
      return
    }

    const result = await response.json()

    console.log('✅ Success!\n')
    console.log('📋 Profile extracted:')
    console.log(`   Mission: ${result.profile?.mission?.substring(0, 100)}...`)
    console.log(`   Primary Goals: ${result.profile?.primary_goals?.length || 0}`)
    console.log(`   Outcome Categories: ${result.profile?.outcome_categories?.length || 0}`)
    console.log(`   Success Indicators: ${result.profile?.success_indicators?.length || 0}`)
    console.log(`   Completeness Score: ${result.profile?.completeness_score}/100\n`)

  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
  }
}

testSeedInterview()
