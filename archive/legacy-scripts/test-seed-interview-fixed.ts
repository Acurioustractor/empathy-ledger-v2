/**
 * Test Seed Interview API with correct format
 */

const PROJECT_ID = '6bd47c8a-e676-456f-aa25-ddcbb5a31047' // Goods project
const API_URL = 'http://localhost:3030'

// Format the responses as expected by the API
const SEED_RESPONSES = [
  {
    question_id: 'project_overview',
    question: 'What is this project trying to achieve?',
    answer: 'Build durable, repairable household goods with and by First Nations communities, so ownership, skills, and value stay on-country while meeting urgent needs for beds, washing machines, and fridges.'
  },
  {
    question_id: 'community_need',
    question: 'What community need or opportunity does this project address?',
    answer: 'Community-owned manufacturing and maintenance facilities running locally. People sleeping better with sturdy beds, washing reliably with indestructible machines, and storing food safely. Local teams trained and making decisions without external dependency. Revenue circulating through community enterprises rather than leaving Country.'
  },
  {
    question_id: 'target_population',
    question: 'Who are you working with?',
    answer: 'First Nations communities across Australia who need reliable household goods and want to build local manufacturing capacity.'
  },
  {
    question_id: 'expected_outcomes',
    question: 'What specific outcomes do you expect to see?',
    answer: 'Fewer people sleeping on floors and improved sleep quality. Better hygiene, dignity, and reduced infections including RHD-related risks. Local jobs, skills transfer, and pride in making and maintaining their own goods. Faster, cheaper repairs and longer product lifespans that reduce waste.'
  },
  {
    question_id: 'success_indicators',
    question: 'How will you know if the project is successful?',
    answer: 'Community-defined indicators and stories show improved sleep, hygiene, and dignity. Local health data reflects reductions in infections and RHD risk factors. Lifecycle and repair records demonstrate durability and maintainability. Facilities, training, and decision-making are owned locally, with outside support no longer required.'
  },
  {
    question_id: 'timeframe',
    question: 'What is the timeframe for this project?',
    answer: '5-10 years for full community ownership and manufacturing capability. Short-term wins in 6-12 months with first products delivered.'
  },
  {
    question_id: 'program_model',
    question: 'How does the project work?',
    answer: 'Design durable goods that can be manufactured and repaired locally. Train community members in manufacturing, repair, and business operations. Establish local facilities owned by community enterprises. Create circular supply chains where products are made, used, repaired, and recycled on-country.'
  },
  {
    question_id: 'cultural_approaches',
    question: 'Are there specific cultural practices or approaches you use?',
    answer: 'First Nations leadership and self-determination guide all decisions. Community invitation over top-down scaling. Story-guided accountability through community voice and lived experience.'
  },
  {
    question_id: 'key_activities',
    question: 'What are the main activities or services you provide?',
    answer: 'Product design and prototyping. Manufacturing training and capacity building. Establishing local production facilities. Quality control and durability testing. Repair and maintenance training. Business and enterprise development support.'
  },
  {
    question_id: 'unique_aspects',
    question: 'What makes this project unique?',
    answer: 'Circular economy design focused on repairability and local manufacturing. Community ownership from the start. Building manufacturing capacity, not just distributing goods. Integration of cultural values with modern manufacturing.'
  }
]

async function testSeedInterview() {
  console.log('🧪 Testing Seed Interview API (Fixed Format)\n')

  try {
    const response = await fetch(
      `${API_URL}/api/projects/${PROJECT_ID}/context/seed-interview`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: SEED_RESPONSES
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
    console.log('📋 Context extracted:')
    console.log(`   Purpose: ${result.extracted?.purpose?.substring(0, 100)}...`)
    console.log(`   Expected Outcomes: ${result.extracted?.expected_outcomes?.length || 0}`)
    console.log(`   Success Criteria: ${result.extracted?.success_criteria?.length || 0}`)
    console.log(`   Quality Score: ${result.extracted?.extraction_quality_score}/100`)
    console.log(`   Message: ${result.message}\n`)

    console.log('🗂️  Context saved to database:')
    console.log(`   ID: ${result.context?.id}`)
    console.log(`   Project ID: ${result.context?.project_id}`)
    console.log(`   Context Type: ${result.context?.context_type}`)
    console.log(`   AI Model: ${result.context?.ai_model_used}\n`)

  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
  }
}

testSeedInterview()
