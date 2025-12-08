const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function deleteTestProfiles() {
  try {
    console.log('\n🗑️  Permanently Deleting Test Profiles from Oonchiumpa\n')

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

    // Get all profiles for this tenant
    const { data: allProfiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, display_name, full_name, tenant_roles')
      .eq('tenant_id', org.tenant_id)

    // Filter out those with storyteller role
    const testProfiles = allProfiles ? allProfiles.filter(p => !p.tenant_roles?.includes('storyteller')) : []

    if (fetchError) {
      console.error('❌ Error fetching test profiles:', fetchError)
      return
    }

    console.log(`\n📋 Found ${testProfiles.length} test profiles to delete:\n`)
    testProfiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.display_name || profile.full_name}`)
      console.log(`   ID: ${profile.id}`)
      console.log(`   Roles: ${JSON.stringify(profile.tenant_roles)}`)
    })

    console.log('\n⚠️  These profiles will be PERMANENTLY deleted from the database.')
    console.log('Starting deletion in 2 seconds...\n')

    await new Promise(resolve => setTimeout(resolve, 2000))

    // Delete each profile
    let successCount = 0
    let errorCount = 0

    for (const profile of testProfiles) {
      const name = profile.display_name || profile.full_name || 'Unnamed'
      console.log(`Deleting: ${name}...`)

      try {
        // First, delete any related data (profile_organizations, etc.)
        const { error: orgRelError } = await supabase
          .from('profile_organizations')
          .delete()
          .eq('profile_id', profile.id)

        if (orgRelError) {
          console.log(`  ⚠️  Warning: Could not delete profile_organizations: ${orgRelError.message}`)
        } else {
          console.log(`  ✅ Deleted profile_organizations relationships`)
        }

        // Delete any profile_locations
        const { error: locError } = await supabase
          .from('profile_locations')
          .delete()
          .eq('profile_id', profile.id)

        if (locError) {
          console.log(`  ⚠️  Warning: Could not delete profile_locations: ${locError.message}`)
        }

        // Delete any storyteller_projects
        const { error: projError } = await supabase
          .from('storyteller_projects')
          .delete()
          .eq('profile_id', profile.id)

        if (projError) {
          console.log(`  ⚠️  Warning: Could not delete storyteller_projects: ${projError.message}`)
        }

        // Finally, delete the profile itself
        const { error: deleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', profile.id)

        if (deleteError) {
          console.log(`  ❌ Error deleting profile: ${deleteError.message}`)
          errorCount++
        } else {
          console.log(`  ✅ Successfully deleted ${name}`)
          successCount++
        }

      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`)
        errorCount++
      }

      console.log('')
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('DELETION SUMMARY:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`✅ Successfully deleted: ${successCount}`)
    console.log(`❌ Failed to delete: ${errorCount}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Verify remaining profiles
    const { data: remaining, error: verifyError } = await supabase
      .from('profiles')
      .select('id, display_name, full_name, tenant_roles')
      .eq('tenant_id', org.tenant_id)

    if (verifyError) {
      console.error('❌ Error verifying remaining profiles:', verifyError)
    } else {
      console.log(`📊 Remaining profiles in Oonchiumpa: ${remaining.length}`)
      remaining.forEach(p => {
        const isStoryteller = p.tenant_roles?.includes('storyteller')
        console.log(`   ${isStoryteller ? '✅' : '⚪'} ${p.display_name || p.full_name}`)
      })
    }

    console.log('\n✅ Cleanup Complete!\n')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

deleteTestProfiles()
