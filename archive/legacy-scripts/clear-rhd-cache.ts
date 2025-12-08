import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const projectId = '96ded48f-db6e-4962-abab-33c88a123fa9'

async function clearCache() {
  console.log('🗑️  Clearing RHD project analysis cache...\n')

  const { error } = await supabase
    .from('project_analyses')
    .delete()
    .eq('project_id', projectId)

  if (error) {
    console.log(`Error: ${error.message}`)
  } else {
    console.log('✅ Cache cleared!')
  }

  console.log('\n🎯 RHD Project is ready!')
  console.log(`   URL: http://localhost:3030/projects/${projectId}/analysis`)
  console.log('   Outcomes: 3 (Early Diagnosis, Community Education, Reduced Deaths)')
  console.log('\n📝 When you visit the analysis page, it will:')
  console.log('   1. Extract quotes from transcripts')
  console.log('   2. Tag quotes with RHD outcome matches')
  console.log('   3. Show outcomes tracker with evidence')
}

clearCache().then(() => process.exit(0))
