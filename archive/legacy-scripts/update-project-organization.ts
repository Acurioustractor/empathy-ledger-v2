import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function updateProjectOrganization(
  projectId: string,
  newOrganizationId: string | null
) {
  console.log('📝 UPDATING PROJECT ORGANIZATION\n')
  console.log('='*60 + '\n')

  // Update project organization
  const { data, error } = await supabase
    .from('projects')
    .update({
      organization_id: newOrganizationId,
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId)
    .select(`
      id,
      name,
      organization_id,
      organizations (
        id,
        name
      )
    `)
    .single()

  if (error) {
    console.log(`❌ Error: ${error.message}`)
    process.exit(1)
  }

  console.log('✅ Project updated!\n')
  console.log(`Project: ${data.name}`)
  console.log(`Organization: ${(data.organizations as any)?.name || 'No organization'}`)
  console.log(`Organization ID: ${data.organization_id || 'null'}`)
}

// EXAMPLE USAGE:
// Change A Curious Tractor to different organization
// const projectId = 'project-id-here'
// const newOrgId = 'org-id-here' // or null to remove organization

// updateProjectOrganization(projectId, newOrgId).then(() => process.exit(0))

console.log('To use this script:')
console.log('1. Uncomment the lines at the bottom')
console.log('2. Replace projectId and newOrgId with actual values')
console.log('3. Run: npx tsx scripts/update-project-organization.ts')
