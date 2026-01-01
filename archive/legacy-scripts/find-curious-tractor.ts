import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function findCuriousTractor() {
  console.log('🔍 SEARCHING FOR "A CURIOUS TRACTOR" PROJECT\n')
  console.log('='*60 + '\n')

  // Search for the project
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      description,
      status,
      created_at,
      organization_id,
      organizations (
        id,
        name
      )
    `)
    .ilike('name', '%curious%tractor%')

  if (error) {
    console.log(`❌ Error: ${error.message}`)
    return
  }

  if (!projects || projects.length === 0) {
    console.log('❌ No project found with "Curious Tractor" in name\n')

    // Try broader search
    console.log('🔍 Trying broader search for "tractor"...\n')
    const { data: tractorProjects } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        description,
        status,
        created_at,
        organization_id,
        organizations (
          id,
          name
        )
      `)
      .ilike('name', '%tractor%')

    if (tractorProjects && tractorProjects.length > 0) {
      console.log('✅ Found projects with "tractor":\n')
      tractorProjects.forEach(p => {
        console.log(`📁 ${p.name}`)
        console.log(`   ID: ${p.id}`)
        console.log(`   Organization: ${(p.organizations as any)?.name || 'Unknown'}`)
        console.log(`   Status: ${p.status}`)
        console.log(`   Created: ${new Date(p.created_at).toLocaleDateString('en-AU')}`)
        console.log()
      })
    } else {
      console.log('❌ No projects found with "tractor" in name\n')
    }
    return
  }

  console.log(`✅ FOUND ${projects.length} project(s):\n`)

  projects.forEach(p => {
    console.log(`📁 ${p.name}`)
    console.log(`   ID: ${p.id}`)
    console.log(`   Organization: ${(p.organizations as any)?.name || 'Unknown'}`)
    console.log(`   Org ID: ${p.organization_id}`)
    console.log(`   Status: ${p.status}`)
    console.log(`   Created: ${new Date(p.created_at).toLocaleDateString('en-AU')}`)
    console.log(`   Description: ${p.description || 'No description'}`)
    console.log()
  })

  // Now check Snow Foundation
  console.log('🏢 CHECKING SNOW FOUNDATION...\n')
  const { data: snowOrg } = await supabase
    .from('organizations')
    .select('id, name')
    .ilike('name', '%snow%')

  if (snowOrg && snowOrg.length > 0) {
    console.log(`✅ Found ${snowOrg.length} organization(s) with "snow":\n`)
    snowOrg.forEach(o => {
      console.log(`   • ${o.name} (${o.id})`)
    })
    console.log()

    // Check projects for Snow Foundation
    const { data: snowProjects } = await supabase
      .from('projects')
      .select('id, name, status, created_at')
      .eq('organization_id', snowOrg[0].id)

    console.log(`📁 SNOW FOUNDATION PROJECTS:\n`)
    if (snowProjects && snowProjects.length > 0) {
      snowProjects.forEach(p => {
        console.log(`   • ${p.name} (${p.status})`)
        console.log(`     ID: ${p.id}`)
        console.log(`     Created: ${new Date(p.created_at).toLocaleDateString('en-AU')}`)
        console.log()
      })
    } else {
      console.log('   No projects found for Snow Foundation\n')
    }
  } else {
    console.log('❌ No organization found with "snow" in name\n')
  }

  // Also check GOODS for comparison
  console.log('🔍 CHECKING GOODS PROJECT...\n')
  const { data: goodsProject } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      organization_id,
      organizations (
        id,
        name
      )
    `)
    .eq('id', '6bd47c8a-e676-456f-aa25-ddcbb5a31047')
    .single()

  if (goodsProject) {
    console.log(`✅ GOODS Project:`)
    console.log(`   Name: ${goodsProject.name}`)
    console.log(`   Organization: ${(goodsProject.organizations as any)?.name}`)
    console.log(`   Org ID: ${goodsProject.organization_id}`)
  }
}

findCuriousTractor().then(() => process.exit(0))
