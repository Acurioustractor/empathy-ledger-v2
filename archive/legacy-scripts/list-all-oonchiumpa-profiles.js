const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function listAllProfiles() {
  try {
    console.log('\n📋 All Profiles in Oonchiumpa Tenant\n')

    // Get Oonchiumpa org
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, tenant_id')
      .eq('name', 'Oonchiumpa')
      .single()

    if (orgError) {
      console.error('❌ Error finding Oonchiumpa:', orgError)
      return
    }

    console.log('Organization:', org.name)
    console.log('Tenant ID:', org.tenant_id)
    console.log('Org ID:', org.id)

    // Get all profiles with this tenant_id
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('tenant_id', org.tenant_id)
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError)
      return
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`Total Profiles: ${profiles.length}`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.display_name || profile.full_name || 'Unnamed'}`)
      console.log(`   ID: ${profile.id}`)
      console.log(`   User ID: ${profile.user_id || 'N/A'}`)
      console.log(`   Email: ${profile.email || 'N/A'}`)
      console.log(`   Display Name: ${profile.display_name || 'N/A'}`)
      console.log(`   Full Name: ${profile.full_name || 'N/A'}`)
      console.log(`   Tenant Roles: ${JSON.stringify(profile.tenant_roles || [])}`)
      console.log(`   Avatar: ${profile.avatar_url ? '✅' : '❌'}`)
      console.log(`   Bio: ${profile.bio ? `${profile.bio.substring(0, 50)}...` : 'N/A'}`)
      console.log(`   Created: ${profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}`)

      // Check if has storyteller role
      const isStoryteller = profile.tenant_roles?.includes('storyteller')
      console.log(`   Status: ${isStoryteller ? '✅ ACTIVE STORYTELLER' : '⚪ Not a storyteller'}`)
      console.log(`   ─────────────────────────────────────────────────\n`)
    })

    // Summary
    const storytellers = profiles.filter(p => p.tenant_roles?.includes('storyteller'))
    const nonStorytellers = profiles.filter(p => !p.tenant_roles?.includes('storyteller'))

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`SUMMARY:`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`✅ Active Storytellers: ${storytellers.length}`)
    storytellers.forEach(p => {
      console.log(`   - ${p.display_name || p.full_name}`)
    })

    console.log(`\n⚪ Non-Storytellers: ${nonStorytellers.length}`)
    nonStorytellers.forEach(p => {
      console.log(`   - ${p.display_name || p.full_name || p.email || 'Unnamed'}`)
    })
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

listAllProfiles()
