/**
 * Check GOODS Project Context Values
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
)

async function checkContext() {
  console.log('🔍 Checking GOODS project context...\n')

  const { data, error } = await supabase
    .from('project_contexts')
    .select('purpose, expected_outcomes, success_criteria, cultural_approaches')
    .eq('project_id', '6bd47c8a-e676-456f-aa25-ddcbb5a31047')
    .single()

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log('📋 PURPOSE:')
  console.log(data.purpose)
  console.log('\n🎯 EXPECTED OUTCOMES:')
  console.log(JSON.stringify(data.expected_outcomes, null, 2))
  console.log('\n✅ SUCCESS CRITERIA:')
  console.log(JSON.stringify(data.success_criteria, null, 2))
  console.log('\n🌏 CULTURAL APPROACHES:')
  console.log(JSON.stringify(data.cultural_approaches, null, 2))

  // Extract what Claude V2 will actually see
  console.log('\n📤 WHAT CLAUDE V2 RECEIVES:\n')

  const outcomeCategories = (data.expected_outcomes || []).map((oc: any) => {
    if (typeof oc === 'string') return oc
    return oc.category || oc.description || ''
  }).filter((cat: string) => cat.length > 0)

  console.log('Primary Outcomes:', outcomeCategories)
  console.log('\nExtract Quotes That Demonstrate:', data.success_criteria)
}

checkContext()
