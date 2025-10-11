import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function clearCache() {
  const projectId = '6bd47c8a-e676-456f-aa25-ddcbb5a31047' // Goods project

  console.log('🗑️  Clearing cached analysis for Goods project...')

  const { data, error } = await supabase
    .from('project_analyses')
    .delete()
    .eq('project_id', projectId)

  if (error) {
    console.error('❌ Error clearing cache:', error)
    process.exit(1)
  }

  console.log('✅ Cache cleared! Next analysis will regenerate with new structure.')
  console.log('   Reload the analysis page to regenerate.')
}

clearCache()
