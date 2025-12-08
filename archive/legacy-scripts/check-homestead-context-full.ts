import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function checkHomesteadContext() {
  const supabase = createServiceRoleClient()
  const projectId = 'd10daf41-02ae-45e4-9e9b-1c96e56ee820'

  const { data: context, error } = await supabase
    .from('project_contexts')
    .select('*')
    .eq('project_id', projectId)
    .single()

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log('📊 Full Context Data:\n')
  console.log('Purpose:', context.purpose)
  console.log('\nContext:', context.context)
  console.log('\nTarget Population:', context.target_population)
  console.log('\nTimeframe:', context.timeframe)
  console.log('\nProgram Model:', context.program_model?.substring(0, 200) + '...')
  console.log('\nExpected Outcomes:', JSON.stringify(context.expected_outcomes, null, 2))
  console.log('\nSuccess Criteria:', JSON.stringify(context.success_criteria, null, 2))
  console.log('\nCultural Approaches:', JSON.stringify(context.cultural_approaches, null, 2))
  console.log('\nKey Activities:', JSON.stringify(context.key_activities, null, 2))
  console.log('\nAI Extracted:', context.ai_extracted)
  console.log('Extraction Quality Score:', context.extraction_quality_score)
  console.log('AI Model Used:', context.ai_model_used)
}

checkHomesteadContext().catch(console.error)
