import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function verifyHomesteadContext() {
  const supabase = createServiceRoleClient()
  const projectId = 'd10daf41-02ae-45e4-9e9b-1c96e56ee820' // The Homestead

  console.log('🔍 Checking if seed interview was saved...\n')

  const { data: context, error } = await supabase
    .from('project_contexts')
    .select('*')
    .eq('project_id', projectId)
    .single()

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  if (context) {
    console.log('✅ Seed interview found!')
    console.log('\n📊 Context Details:')
    console.log(`- Project ID: ${context.project_id}`)
    console.log(`- Organization ID: ${context.organization_id}`)
    console.log(`- Context Type: ${context.context_type}`)
    console.log(`- AI Extracted: ${context.ai_extracted}`)
    console.log(`- Created: ${context.created_at}`)
    console.log(`- Updated: ${context.updated_at}`)

    if (context.seed_interview_text) {
      console.log(`\n📝 Seed Interview Text Length: ${context.seed_interview_text.length} characters`)
      console.log(`\nFirst 200 characters:`)
      console.log(context.seed_interview_text.substring(0, 200) + '...')
    } else {
      console.log('\n⚠️  No seed_interview_text found')
    }

    console.log('\n\n🌐 Access the project at:')
    console.log('http://localhost:3000/organisations/c53077e1-98de-4216-9149-6268891ff62e/projects/d10daf41-02ae-45e4-9e9b-1c96e56ee820/manage')
    console.log('\n(Navigate to the Context tab once the page loads)')
  } else {
    console.log('❌ No context found for this project')
  }
}

verifyHomesteadContext().catch(console.error)
