// Simple check for existing projects
import { createClient } from '@supabase/supabase-js'

// Use the same credentials that the app uses
const supabaseUrl = 'https://zdmjzkucjqfnwrwgtxmn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkbWp6a3VjanFmbndyd2d0eG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk1MDYzMzAsImV4cCI6MjAzNTA4MjMzMH0.uh18hzMVwwk6lhUJlELmVXD8s5O_9mxS-_o0QUHhBjE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProjects() {
  console.log('🔍 Checking all projects...')

  // Get all projects
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, name, organization_id, status')
    .order('created_at', { ascending: false })
    .limit(20)

  console.log('📋 All projects:', projects)
  console.log('📊 Total projects found:', projects?.length || 0)

  if (projects && projects.length > 0) {
    const deadlyHeartsProject = projects.find(p =>
      p.name.toLowerCase().includes('deadly') ||
      p.name.toLowerCase().includes('hearts')
    )

    if (deadlyHeartsProject) {
      console.log('🎯 Found Deadly Hearts project:', deadlyHeartsProject)

      // Check participants for this project
      const { data: participants } = await supabase
        .from('project_participants')
        .select(`
          id,
          profile_id,
          role,
          profiles:profile_id(display_name, full_name)
        `)
        .eq('project_id', deadlyHeartsProject.id)

      console.log('👥 Participants in Deadly Hearts:', participants)
    } else {
      console.log('❌ No Deadly Hearts project found in:', projects.map(p => p.name))
    }
  }
}

checkProjects().catch(console.error)