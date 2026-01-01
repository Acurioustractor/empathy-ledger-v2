/**
 * Test Seed Interview API for Deadly Hearts Trek Project
 */

const PROJECT_ID = '96ded48f-db6e-4962-abab-33c88a123fa9' // Deadly Hearts Trek
const API_URL = 'http://localhost:3030'

// Seed interview responses based on project documentation
const SEED_RESPONSES = [
  {
    question_id: 'project_overview',
    question: 'What is this project trying to achieve?',
    answer: 'Prevent and stop rheumatic heart disease (RHD) in First Nations communities through culturally-safe, community-led health interventions. Combining traditional Indigenous knowledge with modern medical expertise to diagnose, treat, and educate communities about RHD prevention.'
  },
  {
    question_id: 'community_need',
    question: 'What community need or opportunity does this project address?',
    answer: 'Aboriginal communities face devastating RHD rates - two young Aboriginal people die almost every week, two-thirds are female. Non-Indigenous Australians rarely get RHD because they have medical access on their doorstep. Aboriginal communities lack health equity and access to medical experts. This project addresses that gap while respecting cultural protocols and ensuring community leadership.'
  },
  {
    question_id: 'target_population',
    question: 'Who are you working with?',
    answer: 'First Nations communities across Northern Territory and remote Australia. Working with elders, families, schools, RHD champions, and community members. Partnering with local cultural guides and medical experts as a multidisciplinary team.'
  },
  {
    question_id: 'expected_outcomes',
    question: 'What specific outcomes do you expect to see?',
    answer: 'Early diagnosis of RHD so people can access penicillin treatment. Increased community education about RHD prevention and symptoms. Reduced RHD deaths (currently 2 young people per week). Families staying healthier through early intervention. Communities leading their own health education. Cultural safety maintained throughout medical interventions. Two-way learning between Indigenous and non-Indigenous health approaches.'
  },
  {
    question_id: 'success_indicators',
    question: 'How will you know if the project is successful?',
    answer: 'Reduction in RHD deaths and diagnoses. Increased school and community participation in health screenings. More people diagnosed early and on penicillin treatment. Community members becoming RHD champions. Families reporting better health outcomes. Cultural protocols respected in all interactions. Stories showing improved health equity. Two-way learning happening between medical experts and community.'
  },
  {
    question_id: 'timeframe',
    question: 'What is the timeframe for this project?',
    answer: 'Ongoing program with annual Trek events. Short-term: Immediate diagnoses and treatment during each Trek (weeks). Medium-term: Community RHD champions trained and active (1-2 years). Long-term: Generational health transformation, RHD elimination as a health threat (5-10 years). Treatment requires up to a decade of penicillin injections for diagnosed individuals.'
  },
  {
    question_id: 'program_model',
    question: 'How does the project work?',
    answer: 'Multidisciplinary medical team travels to remote communities with cultural guides. Team receives cultural briefings from elders about protocols and two-way learning. Visit schools to educate, diagnose, and treat RHD. Work with families in their homes, providing care while respecting cultural practices. Community-led decision making ensures cultural safety. Medical experts provide diagnosis and treatment (including penicillin injections). Local RHD champions trained to continue education and support after team leaves.'
  },
  {
    question_id: 'cultural_approaches',
    question: 'Are there specific cultural practices or approaches you use?',
    answer: 'Two-way learning - understanding both Indigenous and non-Indigenous worlds. Cultural briefings before every community visit led by local elders. Community invitation-only model (never imposed). Cultural guides travel with medical team. RHD champions from community lead education efforts. Constant learning and iteration based on elder feedback. Recognition that Aboriginal ways are fundamentally different and must be understood and respected. Culturally safe program design at every level.'
  },
  {
    question_id: 'key_activities',
    question: 'What are the main activities or services you provide?',
    answer: 'School visits for RHD education, diagnosis, and treatment. Home visits with families affected by RHD. Cultural briefings with elders. Training RHD champions from community. Medical screenings and diagnosis. Penicillin injection treatment. Two-way learning sessions. Documentation of stories and community voice. Partnership with other initiatives (like Goods project for healthy living conditions).'
  },
  {
    question_id: 'community_involvement',
    question: 'How are community members involved in decision-making and leadership?',
    answer: 'Community invitation required - never imposed on communities. Elders lead cultural briefings and protocols. Local RHD champions lead education and support. Families decide how care is provided. Community determines what culturally safe means for them. Program constantly iterates based on community feedback. Aboriginal people leading their own health transformation, not being "helped" by outsiders.'
  },
  {
    question_id: 'unique_aspects',
    question: 'What makes this project unique?',
    answer: 'Combines traditional Indigenous knowledge with modern medical expertise through two-way learning. Culturally safe at every level, not just token acknowledgment. Led by community with medical support, not medical professionals imposing treatment. Stories center community voice and lived experience. Addresses systemic health inequity while respecting cultural difference. Links to holistic wellbeing (partnering with Goods project for healthy homes). Focuses on prevention and education, not just treatment.'
  },
  {
    question_id: 'challenges',
    question: 'What are the main challenges you face?',
    answer: 'Distance to remote communities. Medical system access inequity. Constant need for education and cultural understanding among medical professionals. Load on elders to constantly teach white people Aboriginal ways. Government and public awareness about RHD crisis. Long treatment duration (up to decade of injections). Addressing systemic racism in healthcare. Balancing medical intervention with cultural respect.'
  },
  {
    question_id: 'support_needed',
    question: 'What support or resources would help this project succeed?',
    answer: 'Government investment in Indigenous health equity. Public awareness and empathy for RHD crisis. Sustainable funding for ongoing Treks and community support. More Indigenous health professionals. Transportation to remote communities. Cultural competency training resources. Policy change addressing health equity. Community voices heard by decision makers.'
  },
  {
    question_id: 'long_term_vision',
    question: 'What is your long-term vision?',
    answer: 'Healthy, thriving Aboriginal communities free from RHD devastation. Strong, culturally grounded health education embedded in communities. RHD champions in every community sustaining prevention work. Two-way learning standard practice in all Indigenous health programs. Health equity achieved - Aboriginal people having same medical access as non-Indigenous Australians. Stories of transformation replacing stories of loss. Future generations growing up without fear of RHD. Communities educated, healthy, and self-determined in their health choices.'
  }
]

async function testDeadlyHeartsSeedInterview() {
  console.log('🏥 Testing Deadly Hearts Trek Seed Interview\n')

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
    console.log(`   Cultural Approaches: ${result.extracted?.cultural_approaches?.length || 0}`)
    console.log(`   Quality Score: ${result.extracted?.extraction_quality_score}/100`)
    console.log(`   Message: ${result.message}\n`)

    console.log('🗂️  Context saved to database:')
    console.log(`   ID: ${result.context?.id}`)
    console.log(`   Project ID: ${result.context?.project_id}`)
    console.log(`   Context Type: ${result.context?.context_type}`)
    console.log(`   AI Model: ${result.context?.ai_model_used}\n`)

    if (result.extracted?.expected_outcomes) {
      console.log('🎯 Extracted Outcomes:')
      result.extracted.expected_outcomes.forEach((outcome: any, i: number) => {
        console.log(`   ${i + 1}. ${outcome.category}`)
        console.log(`      ${outcome.description}`)
      })
    }

  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
  }
}

testDeadlyHeartsSeedInterview()
