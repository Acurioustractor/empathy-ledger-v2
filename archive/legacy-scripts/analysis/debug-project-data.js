// Debug script to check project data
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugProjectData() {
  console.log('🔍 Debugging project data...')

  // 1. Find Deadly Hearts Trek project
  const { data: projects, error: projectError } = await supabase
    .from('projects')
    .select('id, name, organization_id')
    .ilike('name', '%deadly hearts%')

  console.log('📋 Projects found:', projects)

  if (!projects || projects.length === 0) {
    console.log('❌ No Deadly Hearts Trek project found')
    return
  }

  const projectId = projects[0].id
  console.log('🎯 Using project ID:', projectId)

  // 2. Check project_participants table
  const { data: participants, error: participantsError } = await supabase
    .from('project_participants')
    .select(`
      id,
      project_id,
      profile_id,
      role,
      created_at,
      profiles:profile_id(
        id,
        display_name,
        full_name
      )
    `)
    .eq('project_id', projectId)

  console.log('👥 Project participants:', participants)
  console.log('👥 Participant count:', participants?.length || 0)

  // 3. Check if there are any storytellers with projects
  const { data: allParticipants, error: allError } = await supabase
    .from('project_participants')
    .select('project_id, profile_id, profiles:profile_id(display_name)')
    .limit(10)

  console.log('📊 Sample project participants from all projects:', allParticipants)

  // 4. Check storytellers who should be in this project
  const { data: storytellers, error: storytellersError } = await supabase
    .from('profiles')
    .select('id, display_name, full_name')
    .or('display_name.ilike.%heather%,display_name.ilike.%cissy%,full_name.ilike.%heather%,full_name.ilike.%cissy%')

  console.log('🎭 Storytellers (Heather, Cissy):', storytellers)
}

debugProjectData().catch(console.error)