/**
 * Re-submit GOODS Seed Interview with Fixed Extraction Logic
 * This will extract LIVED EXPERIENCE success criteria instead of meta-level evaluation methods
 */

const seedInterview = {
  responses: [
    {
      question_id: "project_overview",
      question: "What is this project trying to achieve? What are the main goals?",
      answer: "GOODS is a community-owned initiative to design, make, and maintain essential household goods — the 'Toyota Troopy' of beds, washing machines, and fridges — built for remote conditions. It exists to close urgent cost-of-living and access gaps that drive overcrowding, poor sleep, infections, and dignity harms. The project builds local capacity so communities own production, data, and value over time."
    },
    {
      question_id: "community_need",
      question: "What community need or opportunity does this project address?",
      answer: "Primarily First Nations communities in remote and regional Australia, including Tennant Creek, Palm Island, Mount Isa, Kalgoorlie, and Central Desert communities. Beneficiaries are predominantly Indigenous, with strong focus on women and girls and households experiencing overcrowding and inadequate housing standards."
    },
    {
      question_id: "target_population",
      question: "Who are you working with? Describe the communities and individuals involved.",
      answer: "Traditional Custodians and local community leaders co-design products, set priorities, and guide prototyping cycles. Design principles follow cultural protocols and local wisdom — 'read the river, walk the walk, talk the talk then create our story' — and manufacturing is intentionally transitioned to community ownership with training and on-country facilities."
    },
    {
      question_id: "expected_outcomes",
      question: "What specific outcomes do you expect to see?",
      answer: "IMMEDIATE: Better sleep and less floor sleeping after bed delivery. Improved hygiene and dignity from reliable washing. Immediate morale lift and reduced household stress due to functional, fit-for-purpose goods. MEDIUM-TERM: Reduced respiratory and skin infections and RHD risk factors as hygiene and sleeping conditions stabilise. Increased household wellbeing and safety, especially for women and girls. Growing community capability in manufacturing, repair, and design, leading to sustained local employment and income. LONG-TERM: Communities independently produce and maintain essential goods, with circular, repair-first economies that keep value local."
    },
    {
      question_id: "success_indicators",
      question: "How will you know if the project is successful? What will you see or hear?",
      answer: "We'll hear stories about better sleep, less floor sleeping, improved dignity and morale. We'll see reduced infections, better hygiene, and increased household functioning. We'll observe growing community manufacturing capability, local employment, and sustained repair enterprises. Community requests for more products (like Palm Island asking for 100 additional beds) signal trust and fit-for-purpose design."
    },
    {
      question_id: "timeframe",
      question: "What is the timeframe for this project?",
      answer: "Active now, with the next 12-month goals to manufacture and install 300 beds and 40 washing machines, establish community-owned facilities in Tennant Creek and Palm Island, and prototype modular refrigeration. Overall intent is ongoing, with staged transfer to community ownership as capabilities and enterprises mature."
    },
    {
      question_id: "program_model",
      question: "How does the project work? What is your approach or methodology?",
      answer: "If households have durable, repairable beds and whitegoods designed for local conditions, then sleep, hygiene, and household dignity improve immediately. These immediate improvements reduce infections and stress, free up caregiver time (especially for women and girls), and create stability. Coupled with local training and manufacturing, the project shifts power and income locally, reinforcing health and economic benefits over time."
    },
    {
      question_id: "cultural_approaches",
      question: "Are there specific cultural practices, protocols, or approaches you use?",
      answer: "Products are co-designed with Traditional Custodians, using Indigenous protocols and locally relevant practices. Story, language, and community authority shape decisions, timelines, and evaluation. The aim is sovereignty over production, data, and enterprise, not external delivery."
    },
    {
      question_id: "key_activities",
      question: "What are the main activities or services you provide?",
      answer: "Delivers and installs durable, repairable essential goods. Runs iterative '4×3×3' prototyping across multiple communities and product types. Establishes local manufacturing and repair capability, with skills transfer and training. Tracks product lifecycle and outcomes, blending community storytelling with data to improve designs and operations."
    },
    {
      question_id: "community_involvement",
      question: "How are community members involved in decision-making and leadership?",
      answer: "Traditional Custodians and local community leaders co-design products, set priorities, and guide prototyping cycles. Manufacturing is intentionally transitioned to community ownership with training and on-country facilities."
    },
    {
      question_id: "unique_aspects",
      question: "What makes this project unique or different from other similar initiatives?",
      answer: "The 'Toyota Troopy' approach: durable, repairable goods built specifically for remote conditions. Community-owned manufacturing rather than external delivery. Integration of storytelling (Empathy Ledger) with product lifecycle data. Circular, repair-first economies that keep value local."
    },
    {
      question_id: "long_term_vision",
      question: "What is your long-term vision?",
      answer: "Communities independently produce and maintain essential goods, with circular, repair-first economies that keep value local. First Nations leadership sets standards for sustainable product design in remote Australia. Systemic shift from extractive purchasing to community-owned enterprises and knowledge-led innovation."
    }
  ]
}

async function resubmitSeedInterview() {
  console.log('🔄 Re-submitting GOODS seed interview with FIXED extraction logic...\n')

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

    console.log('✅ Seed interview re-processed successfully!\n')
    console.log('📊 Extraction Quality:', result.extracted.extraction_quality_score + '/100')
    console.log('\n🎯 EXPECTED OUTCOMES:')
    console.log(JSON.stringify(result.extracted.expected_outcomes, null, 2))
    console.log('\n✅ SUCCESS CRITERIA (what Claude will look for in quotes):')
    console.log(JSON.stringify(result.extracted.success_criteria, null, 2))
    console.log('\n🌏 CULTURAL APPROACHES:')
    console.log(JSON.stringify(result.extracted.cultural_approaches, null, 2))

    console.log('\n📋 VERIFICATION:')
    console.log('Check that success_criteria contains LIVED EXPERIENCES like:')
    console.log('  ✅ "Better sleep after bed delivery"')
    console.log('  ✅ "Reduced infections"')
    console.log('  ✅ "Improved dignity and morale"')
    console.log('  ❌ NOT "Community-defined indicators via Empathy Ledger"')
    console.log('  ❌ NOT "Health signals from local services"')

  } catch (error: any) {
    console.error('❌ Error re-submitting seed interview:', error.message)
    throw error
  }
}

resubmitSeedInterview()
  .then(() => {
    console.log('\n✅ Done! Now run analysis to see if Claude V2 extracts GOODS-specific quotes')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error)
    process.exit(1)
  })
