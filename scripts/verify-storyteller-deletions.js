const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyDeletions() {
  try {
    console.log('\n🔍 Verifying Storyteller Deletions for Oonchiumpa\n')

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

    console.log('✅ Found Oonchiumpa:', org.name, '| ID:', org.id)
    console.log('   Tenant ID:', org.tenant_id)

    // Get the 3 remaining storytellers
    const remainingNames = ['Kristy Bloomfield', 'Patricia Ann Miller', 'Tanya Turner']

    console.log('\n📋 Checking remaining storytellers:')
    for (const name of remainingNames) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, display_name, full_name, tenant_id, tenant_roles')
        .or(`display_name.ilike.%${name}%,full_name.ilike.%${name}%`)
        .single()

      if (error) {
        console.log(`  ❌ ${name}: Not found`)
        continue
      }

      console.log(`  ✅ ${name}:`)
      console.log(`     ID: ${profile.id}`)
      console.log(`     Tenant ID: ${profile.tenant_id}`)
      console.log(`     Tenant Roles: ${JSON.stringify(profile.tenant_roles)}`)

      // Check if they have storyteller role
      const hasStorytellerRole = profile.tenant_roles?.includes('storyteller')
      console.log(`     Has storyteller role: ${hasStorytellerRole ? '✅' : '❌'}`)
    }

    // Get all profiles with Oonchiumpa tenant_id
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('id, display_name, full_name, tenant_roles')
      .eq('tenant_id', org.tenant_id)

    if (allError) {
      console.error('\n❌ Error fetching all profiles:', allError)
      return
    }

    console.log(`\n📊 All profiles with Oonchiumpa tenant (${org.tenant_id}):`)
    console.log(`   Total: ${allProfiles.length}`)

    const withStorytellerRole = allProfiles.filter(p => p.tenant_roles?.includes('storyteller'))
    const withoutStorytellerRole = allProfiles.filter(p => !p.tenant_roles?.includes('storyteller'))

    console.log(`   With storyteller role: ${withStorytellerRole.length}`)
    withStorytellerRole.forEach(p => {
      console.log(`     - ${p.display_name || p.full_name} (roles: ${JSON.stringify(p.tenant_roles)})`)
    })

    if (withoutStorytellerRole.length > 0) {
      console.log(`\n   Without storyteller role: ${withoutStorytellerRole.length}`)
      withoutStorytellerRole.forEach(p => {
        console.log(`     - ${p.display_name || p.full_name} (roles: ${JSON.stringify(p.tenant_roles)})`)
      })
    }

    // Check profile_organizations relationships
    const { data: orgRelations, error: relError } = await supabase
      .from('profile_organizations')
      .select('profile_id, organization_id, role, is_active, profiles(display_name, full_name)')
      .eq('organization_id', org.id)

    if (relError) {
      console.log('\n⚠️  profile_organizations table check failed:', relError.message)
    } else {
      console.log(`\n🔗 Profile-Organization Relationships:`)
      console.log(`   Total: ${orgRelations.length}`)

      const active = orgRelations.filter(r => r.is_active)
      const inactive = orgRelations.filter(r => !r.is_active)

      console.log(`   Active: ${active.length}`)
      active.forEach(r => {
        const name = r.profiles?.display_name || r.profiles?.full_name || 'Unknown'
        console.log(`     - ${name} (role: ${r.role})`)
      })

      if (inactive.length > 0) {
        console.log(`   Inactive (deleted): ${inactive.length}`)
        inactive.forEach(r => {
          const name = r.profiles?.display_name || r.profiles?.full_name || 'Unknown'
          console.log(`     - ${name} (role: ${r.role})`)
        })
      }
    }

    console.log('\n✅ Verification Complete!\n')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

verifyDeletions()
