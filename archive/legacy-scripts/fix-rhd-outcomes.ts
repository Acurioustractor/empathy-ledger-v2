import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const projectId = '96ded48f-db6e-4962-abab-33c88a123fa9'

// RHD outcomes with PROPER keywords for matching
const fixed_outcomes = [
  {
    category: "Early Diagnosis",
    description: "People can access penicillin treatment for early diagnosis of RHD.",
    indicators: ["diagnosis", "penicillin", "treatment", "rheumatic", "heart", "rhd", "early", "screening", "test", "medical", "doctor", "health"],
    timeframe: "short_term"
  },
  {
    category: "Community Education",
    description: "Increased community education about RHD prevention and symptoms.",
    indicators: ["education", "learn", "awareness", "prevention", "symptoms", "knowledge", "teach", "understand", "community", "school", "information"],
    timeframe: "medium_term"
  },
  {
    category: "Reduced Deaths",
    description: "Reduced RHD deaths (currently 2 young people per week).",
    indicators: ["deaths", "mortality", "dying", "lives", "hospitalizations", "hospital", "sick", "illness", "health outcomes", "survival", "living"],
    timeframe: "long_term"
  }
]

async function fixRHD() {
  console.log('🔧 FIXING RHD OUTCOMES\n')
  console.log('='*60 + '\n')

  // Update with proper keywords
  const { data, error } = await supabase
    .from('project_contexts')
    .update({
      expected_outcomes: fixed_outcomes,
      updated_at: new Date().toISOString()
    })
    .eq('project_id', projectId)
    .select()
    .single()

  if (error) {
    console.log(`❌ Error: ${error.message}`)
    process.exit(1)
  }

  console.log('✅ RHD outcomes updated with keywords!\n')
  console.log('Outcomes:')
  fixed_outcomes.forEach((o, i) => {
    console.log(`  ${i+1}. ${o.category}`)
    console.log(`     Keywords: ${o.indicators.slice(0, 5).join(', ')}...`)
  })

  console.log('\n🗑️  Now clearing analysis cache...')

  await supabase
    .from('project_analyses')
    .delete()
    .eq('project_id', projectId)

  console.log('✅ Cache cleared!')
  console.log('\n🎯 Ready! Visit the analysis page to regenerate with proper matching.')
  console.log(`   http://localhost:3030/projects/${projectId}/analysis`)
}

fixRHD().then(() => process.exit(0))
