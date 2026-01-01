const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkChelsea() {
  try {
    console.log('\n🔍 Checking Chelsea Kenneally Profile\n')

    // Find Chelsea's profile(s)
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .or('display_name.ilike.%Chelsea%,full_name.ilike.%Chelsea%')

    if (profileError) {
      console.error('❌ Error finding Chelsea:', profileError)
      return
    }

    if (!profiles || profiles.length === 0) {
      console.log('❌ No Chelsea profiles found')
      return
    }

    console.log(`Found ${profiles.length} Chelsea profile(s)\n`)

    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i]

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`PROFILE ${i + 1} of ${profiles.length}`)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`ID: ${profile.id}`)
    console.log(`Display Name: ${profile.display_name}`)
    console.log(`Full Name: ${profile.full_name}`)
    console.log(`Email: ${profile.email || 'N/A'}`)
    console.log(`User ID: ${profile.user_id || 'N/A'}`)
    console.log(`Tenant ID: ${profile.tenant_id}`)
    console.log(`Tenant Roles: ${JSON.stringify(profile.tenant_roles)}`)

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('AVATAR / IMAGE')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Avatar URL: ${profile.avatar_url || '❌ NOT SET'}`)

    if (profile.avatar_url) {
      console.log(`\n✅ Avatar URL exists: ${profile.avatar_url}`)

      // Try to fetch the image to verify it's accessible
      try {
        const response = await fetch(profile.avatar_url)
        console.log(`   HTTP Status: ${response.status} ${response.statusText}`)
        console.log(`   Content-Type: ${response.headers.get('content-type')}`)
        console.log(`   Accessible: ${response.ok ? '✅ YES' : '❌ NO'}`)
      } catch (fetchError) {
        console.log(`   ❌ Error fetching image: ${fetchError.message}`)
      }
    } else {
      console.log('❌ No avatar_url set - this is why the image is not showing')
      console.log('\nPossible reasons:')
      console.log('  1. Image was not uploaded during profile creation')
      console.log('  2. Upload failed but profile was still created')
      console.log('  3. Field was not saved properly')
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('PROFILE DETAILS')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Bio: ${profile.bio ? profile.bio.substring(0, 100) + '...' : '❌ NOT SET'}`)
    console.log(`Phone: ${profile.phone || 'N/A'}`)
    console.log(`Location ID: ${profile.location_id || 'N/A'}`)
    console.log(`Traditional Territory: ${profile.traditional_territory || 'N/A'}`)
    console.log(`Cultural Background: ${profile.cultural_background || 'N/A'}`)
    console.log(`Language: ${profile.language || 'N/A'}`)
    console.log(`Elder Status: ${profile.elder_status ? '✅ Yes' : 'No'}`)
    console.log(`Featured: ${profile.featured ? '✅ Yes' : 'No'}`)

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('TIMESTAMPS')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Created: ${profile.created_at ? new Date(profile.created_at).toLocaleString() : 'N/A'}`)
    console.log(`Updated: ${profile.updated_at ? new Date(profile.updated_at).toLocaleString() : 'N/A'}`)

    // Check for associated location
    if (profile.location_id) {
      const { data: location, error: locError } = await supabase
        .from('locations')
        .select('*')
        .eq('id', profile.location_id)
        .single()

      if (!locError && location) {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('LOCATION')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log(`Name: ${location.name}`)
        console.log(`City: ${location.city || 'N/A'}`)
        console.log(`State: ${location.state || 'N/A'}`)
        console.log(`Country: ${location.country || 'N/A'}`)
      }
    }

    // Check organization memberships
    const { data: orgMemberships, error: orgError } = await supabase
      .from('profile_organizations')
      .select('organization_id, role, is_active, organizations(name)')
      .eq('profile_id', profile.id)

    if (!orgError && orgMemberships && orgMemberships.length > 0) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('ORGANIZATION MEMBERSHIPS')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      orgMemberships.forEach(membership => {
        const orgName = membership.organizations?.name || 'Unknown'
        const status = membership.is_active ? '✅ Active' : '❌ Inactive'
        console.log(`  ${orgName} - ${membership.role} (${status})`)
      })
    }

    // Check for profile_locations
    const { data: profileLocations, error: locationsError } = await supabase
      .from('profile_locations')
      .select('*, locations(name, city, state, country)')
      .eq('profile_id', profile.id)

    if (!locationsError && profileLocations && profileLocations.length > 0) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('PROFILE LOCATIONS')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      profileLocations.forEach(pl => {
        const loc = pl.locations
        const locName = loc ? `${loc.name}, ${loc.city || ''}, ${loc.state || ''}`.trim() : 'Unknown'
        console.log(`  ${pl.location_type}: ${locName}`)
      })
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('ISSUES FOUND')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const issues = []

    if (!profile.avatar_url) {
      issues.push('❌ Avatar URL is missing - profile image will not display')
    }
    if (!profile.bio) {
      issues.push('⚠️  Bio is missing')
    }
    if (!profile.location_id && (!profileLocations || profileLocations.length === 0)) {
      issues.push('⚠️  No location set')
    }
    if (!profile.tenant_roles || profile.tenant_roles.length === 0) {
      issues.push('⚠️  No tenant roles assigned')
    }

    if (issues.length === 0) {
      console.log('✅ No major issues found!')
    } else {
      issues.forEach(issue => console.log(issue))
    }

    }

    console.log('\n')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkChelsea()
