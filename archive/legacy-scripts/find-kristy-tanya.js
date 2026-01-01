const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function findKristyAndTanya() {
  console.log('🔍 Searching for Kristy and Tanya...\n')

  // Search without tenant_roles filter
  const { data: allProfiles, error } = await supabase
    .from('profiles')
    .select('id, display_name, full_name, email, tenant_roles, tenant_id')
    .or('display_name.ilike.%kristy%,full_name.ilike.%kristy%,display_name.ilike.%tanya%,full_name.ilike.%tanya%')

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`Found ${allProfiles?.length || 0} profiles:\n`)

  allProfiles?.forEach(p => {
    console.log(`📋 ${p.display_name || p.full_name}`)
    console.log(`   ID: ${p.id}`)
    console.log(`   display_name: ${p.display_name}`)
    console.log(`   full_name: ${p.full_name}`)
    console.log(`   email: ${p.email}`)
    console.log(`   tenant_id: ${p.tenant_id}`)
    console.log(`   tenant_roles: ${JSON.stringify(p.tenant_roles)}`)
    console.log('')
  })

  // Also check if they're in profile_organizations for Oonchiumpa
  const oonchiumpaId = 'c53077e1-98de-4216-9149-6268891ff62e'

  const { data: orgMembers } = await supabase
    .from('profile_organizations')
    .select('profile_id, role')
    .eq('organization_id', oonchiumpaId)

  console.log(`\n👥 Oonchiumpa organization members (${orgMembers?.length || 0}):`)

  for (const member of orgMembers || []) {
    const profile = allProfiles?.find(p => p.id === member.profile_id)
    if (profile) {
      console.log(`   - ${profile.display_name || profile.full_name} (${member.role})`)
    }
  }
}

findKristyAndTanya().then(() => process.exit(0))
