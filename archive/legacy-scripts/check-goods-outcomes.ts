import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false }
  }
)

async function checkGoodsOutcomes() {
  const projectId = '6bd47c8a-e676-456f-aa25-ddcbb5a31047'

  console.log('🔍 Checking GOODS project context...\n')

  const { data: context, error } = await supabase
    .from('project_contexts')
    .select('*')
    .eq('project_id', projectId)
    .single()

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  if (!context) {
    console.log('❌ No context found for GOODS project')
    return
  }

  console.log('✅ Context found')
  console.log(`   Created: ${context.created_at}`)
  console.log(`   Updated: ${context.updated_at}`)

  const outcomes = context.outcome_categories || []
  console.log(`\n📊 Outcome Categories: ${outcomes.length}`)

  if (outcomes.length > 0) {
    outcomes.forEach((outcome: any, i: number) => {
      console.log(`\n${i + 1}. ${typeof outcome === 'string' ? outcome : outcome.category}`)
      if (typeof outcome === 'object') {
        console.log(`   Description: ${outcome.description || 'N/A'}`)
        console.log(`   Indicators: ${outcome.indicators?.length || 0}`)
        console.log(`   Keywords: ${outcome.keywords?.length || 0}`)
      }
    })
  } else {
    console.log('   ⚠️  NO OUTCOMES FOUND!')
  }

  console.log(`\n💬 Positive Language: ${context.positive_language?.length || 0} phrases`)
  console.log(`🌏 Cultural Values: ${context.cultural_values?.length || 0} values`)
}

checkGoodsOutcomes()
