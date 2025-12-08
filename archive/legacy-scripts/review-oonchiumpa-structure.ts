import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function reviewOonchiumpaStructure() {
  console.log('🔍 Reviewing Oonchiumpa Organization Structure\n')

  const supabase = createServiceRoleClient()

  // 1. Get Oonchiumpa organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, tenant_id')
    .ilike('name', '%oonchiumpa%')
    .single()

  if (orgError || !org) {
    console.error('❌ Failed to find Oonchiumpa:', orgError)
    return
  }

  console.log('📍 Organization:', org.name)
  console.log('   ID:', org.id)
  console.log('   Tenant ID:', org.tenant_id)

  // 2. Get all projects in this organization
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, name, description, status')
    .eq('organization_id', org.id)

  console.log('\n📁 Projects in Organization:', projects?.length || 0)
  projects?.forEach(project => {
    console.log(`   - ${project.name} (${project.id})`)
    console.log(`     Status: ${project.status}`)
  })

  // 3. Get all storytellers in this organization (via tenant_id)
  const { data: storytellers, error: storytellersError } = await supabase
    .from('profiles')
    .select('id, full_name, email, is_storyteller, tenant_roles')
    .eq('tenant_id', org.tenant_id)
    .eq('is_storyteller', true)

  console.log('\n👥 Storytellers in Organization:', storytellers?.length || 0)
  storytellers?.forEach(storyteller => {
    console.log(`   - ${storyteller.full_name} (${storyteller.id})`)
    console.log(`     Email: ${storyteller.email}`)
    console.log(`     Roles: ${storyteller.tenant_roles?.join(', ') || 'none'}`)
  })

  // 4. Get profile_organizations links
  const { data: profileOrgs, error: profileOrgsError } = await supabase
    .from('profile_organizations')
    .select('profile_id, organization_id, role, is_active')
    .eq('organization_id', org.id)

  console.log('\n🔗 Profile-Organization Links:', profileOrgs?.length || 0)
  profileOrgs?.forEach(link => {
    const storyteller = storytellers?.find(s => s.id === link.profile_id)
    console.log(`   - ${storyteller?.full_name || link.profile_id}`)
    console.log(`     Role: ${link.role}, Active: ${link.is_active}`)
  })

  // 5. Get all transcripts in this organization
  const { data: transcripts, error: transcriptsError } = await supabase
    .from('transcripts')
    .select(`
      id,
      title,
      storyteller_id,
      project_id,
      organization_id,
      status,
      created_at,
      profiles:storyteller_id (full_name)
    `)
    .eq('organization_id', org.id)

  console.log('\n📝 Transcripts in Organization:', transcripts?.length || 0)
  transcripts?.forEach(transcript => {
    const storyteller = transcript.profiles as any
    console.log(`   - ${transcript.title}`)
    console.log(`     Storyteller: ${storyteller?.full_name || 'Unknown'}`)
    console.log(`     Project: ${transcript.project_id || 'None'}`)
    console.log(`     Status: ${transcript.status}`)
  })

  // 6. For each project, get the storytellers linked to it
  console.log('\n📊 Project-Storyteller Relationships:')
  for (const project of projects || []) {
    const { data: projectStorytellers, error: psError } = await supabase
      .from('project_storytellers')
      .select(`
        storyteller_id,
        profiles:storyteller_id (full_name, email)
      `)
      .eq('project_id', project.id)

    console.log(`\n   Project: ${project.name}`)
    console.log(`   Storytellers: ${projectStorytellers?.length || 0}`)
    projectStorytellers?.forEach(ps => {
      const profile = ps.profiles as any
      console.log(`     - ${profile?.full_name || 'Unknown'} (${profile?.email || 'no email'})`)
    })

    // Get transcripts for this project
    const projectTranscripts = transcripts?.filter(t => t.project_id === project.id) || []
    console.log(`   Transcripts: ${projectTranscripts.length}`)
    projectTranscripts.forEach(t => {
      const storyteller = t.profiles as any
      console.log(`     - ${t.title} by ${storyteller?.full_name || 'Unknown'}`)
    })
  }

  // 7. Orphaned transcripts (no project)
  const orphanedTranscripts = transcripts?.filter(t => !t.project_id) || []
  if (orphanedTranscripts.length > 0) {
    console.log('\n⚠️  Orphaned Transcripts (no project assigned):', orphanedTranscripts.length)
    orphanedTranscripts.forEach(t => {
      const storyteller = t.profiles as any
      console.log(`   - ${t.title} by ${storyteller?.full_name || 'Unknown'}`)
    })
  }

  // 8. Stories in organization
  const { data: stories, error: storiesError } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      storyteller_id,
      project_id,
      status,
      profiles:storyteller_id (full_name)
    `)
    .eq('organization_id', org.id)

  console.log('\n📖 Stories in Organization:', stories?.length || 0)
  stories?.forEach(story => {
    const storyteller = story.profiles as any
    console.log(`   - ${story.title}`)
    console.log(`     Storyteller: ${storyteller?.full_name || 'Unknown'}`)
    console.log(`     Project: ${story.project_id || 'None'}`)
    console.log(`     Status: ${story.status}`)
  })
}

reviewOonchiumpaStructure().catch(console.error)
