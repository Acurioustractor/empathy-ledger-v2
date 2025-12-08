import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function checkOutcomes() {
  const supabase = createServiceRoleClient()
  const projectId = 'd10daf41-02ae-45e4-9e9b-1c96e56ee820'

  const { data } = await supabase
    .from('project_contexts')
    .select('expected_outcomes')
    .eq('project_id', projectId)
    .single()

  console.log('Expected Outcomes:')
  console.log(JSON.stringify(data?.expected_outcomes, null, 2))
}

checkOutcomes().catch(console.error)
