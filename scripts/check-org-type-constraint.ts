import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function checkConstraint() {
  const supabase = createServiceRoleClient()

  console.log('🔍 Checking organization type constraint...\n')

  // Get sample organizations to see what types exist
  const { data: orgs, error } = await supabase
    .from('organizations')
    .select('id, name, type')
    .limit(10)

  if (error) {
    console.error('Error querying organizations:', error)
    return
  }

  console.log('Sample organization types in database:')
  const types = new Set<string>()
  orgs?.forEach(org => {
    if (org.type) {
      types.add(org.type)
      console.log(`  - ${org.name}: "${org.type}"`)
    }
  })

  console.log('\nUnique types found:', Array.from(types))
}

checkConstraint()
