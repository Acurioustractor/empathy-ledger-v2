import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function diagnoseProjectOrgLink() {
  const supabase = createServiceRoleClient()

  // Get all projects to find "The Homestead"
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, organization_id')
    .ilike('name', '%homestead%')

  console.log('📋 Projects matching "Homestead":')
  console.log(JSON.stringify(projects, null, 2))

  if (!projects || projects.length === 0) {
    console.log('❌ No projects found')
    return
  }

  const project = projects[0]
  console.log('\n📊 Analyzing project:', project.name)
  console.log('Project ID:', project.id)
  console.log('Organization ID:', project.organization_id)

  // Check if organization exists
  if (project.organization_id) {
    const { data: org, error } = await supabase
      .from('organizations')
      .select('id, name, type, tenant_id')
      .eq('id', project.organization_id)
      .single()

    console.log('\n🏢 Organization lookup:')
    if (error) {
      console.log('❌ Error:', error.message)
    } else if (org) {
      console.log('✅ Found:', org)
    } else {
      console.log('❌ Not found')
    }
  }

  // Check project_organizations table
  const { data: linkedOrgs } = await supabase
    .from('project_organizations')
    .select(`
      id,
      project_id,
      organization_id,
      role,
      organizations(id, name, type)
    `)
    .eq('project_id', project.id)

  console.log('\n🔗 Linked organizations (from project_organizations table):')
  console.log(JSON.stringify(linkedOrgs, null, 2))

  // Try the same query as the API
  const { data: apiStyle, error: apiError } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      organization_id,
      organizations:organization_id(
        id,
        name,
        type
      )
    `)
    .eq('id', project.id)
    .single()

  console.log('\n🔍 API-style query result:')
  if (apiError) {
    console.log('❌ Error:', apiError.message)
  } else {
    console.log(JSON.stringify(apiStyle, null, 2))
  }
}

diagnoseProjectOrgLink().catch(console.error)
