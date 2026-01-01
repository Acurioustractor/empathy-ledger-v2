const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkMemberStatus() {
  const oonchiumpaId = 'c53077e1-98de-4216-9149-6268891ff62e'

  console.log('🔍 Checking Oonchiumpa member status...\n')

  // Check all profile_organizations records
  const { data: allMembers } = await supabase
    .from('profile_organizations')
    .select('profile_id, role, is_active, joined_at')
    .eq('organization_id', oonchiumpaId)

  console.log(`Total profile_organizations records: ${allMembers?.length || 0}\n`)

  for (const member of allMembers || []) {
    // Get profile name
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, full_name')
      .eq('id', member.profile_id)
      .single()

    console.log(`👤 ${profile?.display_name || profile?.full_name || 'Unknown'}`)
    console.log(`   ID: ${member.profile_id}`)
    console.log(`   Role: ${member.role}`)
    console.log(`   is_active: ${member.is_active}`)
    console.log(`   joined_at: ${member.joined_at}`)
    console.log('')
  }

  // Now check with the exact query from the page
  const { data: activeMembers, error } = await supabase
    .from('profile_organizations')
    .select(`
      profile_id,
      role,
      is_active,
      joined_at,
      profiles (
        id,
        display_name,
        full_name
      )
    `)
    .eq('organization_id', oonchiumpaId)
    .eq('is_active', true)

  console.log('\n📋 Query with is_active = true:')
  console.log(`   Found: ${activeMembers?.length || 0} members`)
  if (error) {
    console.log('   Error:', error)
  }
  if (activeMembers) {
    activeMembers.forEach(m => {
      console.log(`   - ${m.profiles?.display_name || m.profiles?.full_name}`)
    })
  }
}

checkMemberStatus().then(() => process.exit(0))
