import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const projectId = '6bd47c8a-e676-456f-aa25-ddcbb5a31047'

// EXTRACTED DIRECTLY FROM SEED INTERVIEW - Questions 7, 8, 9
const expected_outcomes = [
  {
    category: "Sleep Quality",
    description: "Better sleep and less floor sleeping after bed delivery",
    indicators: ["bed delivery", "sleep", "floor sleeping", "mattress", "comfortable"],
    timeframe: "short_term"
  },
  {
    category: "Hygiene and Dignity",
    description: "Improved hygiene and dignity from reliable washing",
    indicators: ["washing", "hygiene", "dignity", "clean", "washing machine"],
    timeframe: "short_term"
  },
  {
    category: "Household Morale",
    description: "Immediate morale lift and reduced household stress",
    indicators: ["morale", "stress", "household", "functional goods", "fit-for-purpose"],
    timeframe: "short_term"
  },
  {
    category: "Health Improvements",
    description: "Reduced respiratory and skin infections and RHD risk factors",
    indicators: ["infections", "respiratory", "skin", "health", "RHD"],
    timeframe: "medium_term"
  },
  {
    category: "Wellbeing and Safety",
    description: "Increased household wellbeing and safety, especially for women and girls",
    indicators: ["wellbeing", "safety", "women", "girls", "household stability"],
    timeframe: "medium_term"
  },
  {
    category: "Community Capability",
    description: "Growing community capability in manufacturing, repair, and design",
    indicators: ["manufacturing", "repair", "design", "skills", "training", "employment"],
    timeframe: "medium_term"
  },
  {
    category: "Economic Empowerment",
    description: "Sustained local employment and income from community-owned production",
    indicators: ["employment", "income", "local economy", "community-owned"],
    timeframe: "long_term"
  },
  {
    category: "Community Ownership",
    description: "Communities independently produce and maintain essential goods",
    indicators: ["independent production", "maintenance", "community control", "sovereignty"],
    timeframe: "long_term"
  },
  {
    category: "Circular Economy",
    description: "Repair-first economies that keep value local",
    indicators: ["circular economy", "repair", "value local", "sustainable"],
    timeframe: "long_term"
  }
]

const success_criteria = [
  "Better sleep after bed delivery",
  "Less floor sleeping",
  "Improved hygiene from reliable washing",
  "Increased dignity and morale",
  "Reduced household stress",
  "Fewer respiratory infections",
  "Fewer skin infections",
  "Improved wellbeing for women and girls",
  "Community members learning manufacturing skills",
  "Local employment from repair and design work",
  "Community-run production facilities",
  "Demand signals from communities",
  "Community requests for more products"
]

async function saveOutcomes() {
  console.log('💾 Saving GOODS outcomes directly to database...\n')

  const { data, error } = await supabase
    .from('project_contexts')
    .update({
      expected_outcomes,
      success_criteria,
      purpose: "GOODS is a community-owned initiative to design, make, and maintain essential household goods built for remote conditions",
      target_population: "First Nations communities in remote and regional Australia",
      updated_at: new Date().toISOString()
    })
    .eq('project_id', projectId)
    .select()
    .single()

  if (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }

  console.log('✅ Saved successfully!\n')
  console.log(`📊 Outcomes: ${expected_outcomes.length}`)
  console.log(`✅ Success Criteria: ${success_criteria.length}\n`)

  expected_outcomes.forEach((o, i) => {
    console.log(`${i + 1}. ${o.category} (${o.timeframe})`)
    console.log(`   ${o.description}`)
    console.log(`   Indicators: ${o.indicators.join(', ')}\n`)
  })
}

saveOutcomes()
