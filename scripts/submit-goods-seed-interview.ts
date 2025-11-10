/**
 * Submit GOODS Seed Interview to set Project Context
 */

const seedInterview = {
  responses: [
    {
      question_id: "project_overview",
      question: "What is this project and why does it exist?",
      answer: "GOODS is a community-owned initiative to design, make, and maintain essential household goods — the 'Toyota Troopy' of beds, washing machines, and fridges — built for remote conditions. It exists to close urgent cost-of-living and access gaps that drive overcrowding, poor sleep, infections, and dignity harms. The project builds local capacity so communities own production, data, and value over time."
    },
    {
      question_id: "target_population",
      question: "Who is this project for?",
      answer: "Primarily First Nations communities in remote and regional Australia, including Tennant Creek, Palm Island, Mount Isa, Kalgoorlie, and Central Desert communities. Beneficiaries are predominantly Indigenous, with strong focus on women and girls and households experiencing overcrowding and inadequate housing standards."
    },
    {
      question_id: "community_involvement",
      question: "How did the community help shape this project?",
      answer: "Traditional Custodians and local community leaders co-design products, set priorities, and guide prototyping cycles. Design principles follow cultural protocols and local wisdom — 'read the river, walk the walk, talk the talk then create our story' — and manufacturing is intentionally transitioned to community ownership with training and on-country facilities."
    },
    {
      question_id: "key_activities",
      question: "What does the project actually do?",
      answer: "Delivers and installs durable, repairable essential goods. Runs iterative '4×3×3' prototyping across multiple communities and product types. Establishes local manufacturing and repair capability, with skills transfer and training. Tracks product lifecycle and outcomes, blending community storytelling with data to improve designs and operations."
    },
    {
      question_id: "cultural_approaches",
      question: "How is culture woven into your approach?",
      answer: "Products are co-designed with Traditional Custodians, using Indigenous protocols and locally relevant practices. Story, language, and community authority shape decisions, timelines, and evaluation. The aim is sovereignty over production, data, and enterprise, not external delivery."
    },
    {
      question_id: "program_model",
      question: "What's your theory of how this works?",
      answer: "If households have durable, repairable beds and whitegoods designed for local conditions, then sleep, hygiene, and household dignity improve immediately. These immediate improvements reduce infections and stress, free up caregiver time (especially for women and girls), and create stability. Coupled with local training and manufacturing, the project shifts power and income locally, reinforcing health and economic benefits over time."
    },
    {
      question_id: "immediate_outcomes",
      question: "What changes do you see right away?",
      answer: "Better sleep and less floor sleeping after bed delivery. Improved hygiene and dignity from reliable washing. Immediate morale lift and reduced household stress due to functional, fit-for-purpose goods."
    },
    {
      question_id: "medium_term_outcomes",
      question: "What deeper changes happen over time?",
      answer: "Reduced respiratory and skin infections and RHD risk factors as hygiene and sleeping conditions stabilise. Increased household wellbeing and safety, especially for women and girls. Growing community capability in manufacturing, repair, and design, leading to sustained local employment and income."
    },
    {
      question_id: "long_term_impact",
      question: "What's your vision for long-term impact?",
      answer: "Communities independently produce and maintain essential goods, with circular, repair-first economies that keep value local. First Nations leadership sets standards for sustainable product design in remote Australia. Systemic shift from extractive purchasing to community-owned enterprises and knowledge-led innovation."
    },
    {
      question_id: "success_stories",
      question: "Can you share a story of when this project made a difference?",
      answer: "After early pilots, Palm Island asked for 100 additional beds based on community experience with improved sleep, dignity, and household functioning — a strong signal of fit-for-purpose design and trust in the model."
    },
    {
      question_id: "success_measures",
      question: "How do you know when this project is working?",
      answer: "Community-defined indicators via Empathy Ledger stories and feedback. Health signals from local services, such as reduced infections and better sleep patterns. Product lifecycle data on durability, repairs, and modifications. Demand signals and community requests for scale or new products. Evidence of local training completion and community-run production facilities."
    },
    {
      question_id: "timeframe",
      question: "What's the timeline for this project?",
      answer: "Active now, with the next 12-month goals to manufacture and install 300 beds and 40 washing machines, establish community-owned facilities in Tennant Creek and Palm Island, and prototype modular refrigeration. Overall intent is ongoing, with staged transfer to community ownership as capabilities and enterprises mature."
    }
  ]
}

async function submitSeedInterview() {
  console.log('🌱 Submitting GOODS Seed Interview to set project context...\n')

  try {
    const response = await fetch('http://localhost:3030/api/projects/6bd47c8a-e676-456f-aa25-ddcbb5a31047/context/seed-interview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(seedInterview)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const result = await response.json()

    console.log('✅ Seed Interview Submitted Successfully!\n')
    console.log('📋 Project Context Created:')
    console.log(`   - Project: ${result.context?.project_name || 'GOODS'}`)
    console.log(`   - Model: ${result.context?.context_model || 'quick'}`)
    console.log(`   - Description length: ${result.context?.context_description?.length || 0} characters`)
    console.log('')
    console.log('🎯 Primary Outcomes Extracted:')
    if (result.structured_context?.outcome_categories) {
      result.structured_context.outcome_categories.forEach((outcome: string, i: number) => {
        console.log(`   ${i + 1}. ${outcome}`)
      })
    }
    console.log('')
    console.log('✨ Extract Quotes That Demonstrate:')
    if (result.structured_context?.positive_language) {
      result.structured_context.positive_language.forEach((lang: string, i: number) => {
        console.log(`   ${i + 1}. ${lang}`)
      })
    }
    console.log('')
    console.log('🚀 Ready for Claude V2 Analysis!')
    console.log('   Next: Clear cache and run analysis with proper project context')

  } catch (error: any) {
    console.error('❌ Error submitting seed interview:', error.message)
    throw error
  }
}

submitSeedInterview()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error)
    process.exit(1)
  })
