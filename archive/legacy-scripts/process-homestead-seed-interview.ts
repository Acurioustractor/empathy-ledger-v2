import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function processHomesteadSeedInterview() {
  const supabase = createServiceRoleClient()
  const projectId = 'd10daf41-02ae-45e4-9e9b-1c96e56ee820' // The Homestead
  const organizationId = 'c53077e1-98de-4216-9149-6268891ff62e' // Oonchiumpa

  console.log('🔄 Processing seed interview to extract structured fields...\n')

  // Get the saved interview text
  const { data: context, error: contextError } = await supabase
    .from('project_contexts')
    .select('seed_interview_text')
    .eq('project_id', projectId)
    .single()

  if (contextError || !context?.seed_interview_text) {
    console.error('❌ Could not find seed interview text:', contextError)
    return
  }

  console.log('✅ Found seed interview text')
  console.log(`📝 Length: ${context.seed_interview_text.length} characters\n`)

  // Call the API endpoint to process it
  const response = await fetch(`http://localhost:3030/api/projects/${projectId}/context/seed-interview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      responses: {
        interview_transcript: context.seed_interview_text
      },
      from_recording: true
    })
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('❌ API request failed:', response.status, error)
    return
  }

  const result = await response.json()

  console.log('✅ Successfully processed seed interview!\n')
  console.log('📊 Extracted Context:')
  console.log('- Purpose:', result.extracted.purpose?.substring(0, 100) + '...')
  console.log('- Target Population:', result.extracted.target_population?.substring(0, 100) + '...')
  console.log('- Expected Outcomes:', result.extracted.expected_outcomes?.length, 'outcomes')
  console.log('- Success Criteria:', result.extracted.success_criteria?.length, 'criteria')
  console.log('- Cultural Approaches:', result.extracted.cultural_approaches?.length, 'approaches')
  console.log('- Key Activities:', result.extracted.key_activities?.length, 'activities')
  console.log('- Extraction Quality Score:', result.extracted.extraction_quality_score)

  console.log('\n✨ Context now fully populated!')
  console.log('🌐 View at: http://localhost:3030/organisations/c53077e1-98de-4216-9149-6268891ff62e/projects/d10daf41-02ae-45e4-9e9b-1c96e56ee820/manage')
}

processHomesteadSeedInterview().catch(console.error)
