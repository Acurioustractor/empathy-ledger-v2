/**
 * Manually Fix GOODS Success Criteria
 * Replace meta-level evaluation criteria with LIVED EXPERIENCE indicators
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
)

async function fixSuccessCriteria() {
  console.log('🔧 Fixing GOODS success criteria...\n')

  // CORRECT success criteria: LIVED EXPERIENCES that storytellers talk about
  const correctSuccessCriteria = [
    "Better sleep and less floor sleeping after bed delivery",
    "Improved hygiene and dignity from reliable washing machines",
    "Reduced household stress and immediate morale lift",
    "Reduced respiratory and skin infections",
    "Increased household wellbeing and safety, especially for women and girls",
    "Growing community capability in manufacturing, repair, and design",
    "Sustained local employment and income from community-owned production",
    "Community requests for more products signal trust and fit-for-purpose design"
  ]

  console.log('✅ NEW SUCCESS CRITERIA (what Claude will look for):')
  correctSuccessCriteria.forEach((criteria, i) => {
    console.log(`   ${i + 1}. ${criteria}`)
  })

  console.log('\n🗑️  REMOVING old meta-level criteria:')
  console.log('   ❌ "Community-defined indicators via Empathy Ledger stories"')
  console.log('   ❌ "Health signals from local services"')
  console.log('   ❌ "Product lifecycle data"')
  console.log('   ❌ "Demand signals and community requests"')

  console.log('\n📝 Updating database...')

  const { data, error } = await supabase
    .from('project_contexts')
    .update({
      success_criteria: correctSuccessCriteria
    })
    .eq('project_id', '6bd47c8a-e676-456f-aa25-ddcbb5a31047')
    .select()
    .single()

  if (error) {
    throw error
  }

  console.log('✅ Success criteria updated!')
  console.log('\n📋 VERIFICATION:')
  console.log('   Primary Outcomes:', data.expected_outcomes.map((o: any) => o.category))
  console.log('   Success Criteria Count:', data.success_criteria.length)

  console.log('\n🎯 NOW Claude V2 will extract quotes about:')
  console.log('   • Beds, sleep, floor sleeping')
  console.log('   • Washing machines, hygiene, dignity')
  console.log('   • Household stress, morale, wellbeing')
  console.log('   • Infections, health improvements')
  console.log('   • Community manufacturing, repair, employment')

  console.log('\n✅ Fix complete! Run analysis to test.')
  console.log('📖 Open: http://localhost:3030/projects/6bd47c8a-e676-456f-aa25-ddcbb5a31047/analysis')
}

fixSuccessCriteria()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })
