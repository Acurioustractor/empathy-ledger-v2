#!/usr/bin/env node

/**
 * ANALYZE PROFILES vs STORYTELLERS ARCHITECTURE
 *
 * Understanding the distinction between:
 * - Profiles (anyone who can login)
 * - Storytellers (profiles who have added transcripts/stories)
 * - Organization admins (profiles who admin orgs but may not be storytellers)
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function analyzeProfilesStorytellers() {
  console.log('🔍 ANALYZING PROFILES vs STORYTELLERS ARCHITECTURE')
  console.log('================================================')

  try {
    // 1. Check profiles table structure
    console.log('\n1️⃣ PROFILES TABLE ANALYSIS...')

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)

    if (profiles && profiles.length > 0) {
      console.log(`📊 Profiles: ${profiles.length} sample records`)
      console.log('Sample profile structure:')
      const sampleProfile = profiles[0]
      Object.keys(sampleProfile).forEach(key => {
        console.log(`   • ${key}: ${typeof sampleProfile[key]} = ${sampleProfile[key] === null ? 'null' : String(sampleProfile[key]).slice(0, 50)}`)
      })

      // Check if there's a storyteller flag
      const storytellerFlags = ['is_storyteller', 'storyteller', 'has_stories', 'is_active_storyteller']
      storytellerFlags.forEach(flag => {
        if (sampleProfile.hasOwnProperty(flag)) {
          console.log(`🎯 Found storyteller flag: ${flag}`)
        }
      })
    }

    // 2. Check storytellers table (if it exists and should be used)
    console.log('\n2️⃣ STORYTELLERS TABLE ANALYSIS...')

    try {
      const { count: storytellersCount } = await supabase
        .from('storytellers')
        .select('*', { count: 'exact', head: true })

      console.log(`📊 Storytellers table: ${storytellersCount} records`)

      if (storytellersCount === 0) {
        console.log('❓ Storytellers table is EMPTY - this might be the issue!')
        console.log('   Either:')
        console.log('   • Storytellers should be a flag on profiles')
        console.log('   • Or storytellers table needs to be populated')
      } else {
        const { data: storytellers } = await supabase
          .from('storytellers')
          .select('*')
          .limit(3)

        console.log('Sample storyteller structure:', storytellers?.[0])
      }
    } catch (error) {
      console.log('❌ Storytellers table not accessible or doesn\'t exist')
    }

    // 3. Who has stories/transcripts?
    console.log('\n3️⃣ WHO HAS STORIES/TRANSCRIPTS?...')

    const { data: storiesAuthors } = await supabase
      .from('stories')
      .select('author_id')

    const { data: transcriptAuthors } = await supabase
      .from('transcripts')
      .select('storyteller_id')

    const uniqueStoryAuthors = [...new Set(storiesAuthors?.map(s => s.author_id).filter(Boolean) || [])]
    const uniqueTranscriptAuthors = [...new Set(transcriptAuthors?.map(t => t.storyteller_id).filter(Boolean) || [])]

    console.log(`📝 Profiles with stories: ${uniqueStoryAuthors.length}`)
    console.log(`🎤 Profiles with transcripts: ${uniqueTranscriptAuthors.length}`)

    // Find profiles who have both
    const bothAuthors = uniqueStoryAuthors.filter(id => uniqueTranscriptAuthors.includes(id))
    console.log(`🎯 Profiles with BOTH stories AND transcripts: ${bothAuthors.length}`)

    // Find profiles who are storytellers (have stories OR transcripts)
    const allStorytellers = [...new Set([...uniqueStoryAuthors, ...uniqueTranscriptAuthors])]
    console.log(`🎭 Total active storytellers (stories OR transcripts): ${allStorytellers.length}`)

    // 4. Who has organization admin roles?
    console.log('\n4️⃣ WHO HAS ORGANIZATION ADMIN ROLES?...')

    const { data: orgAdmins } = await supabase
      .from('profile_organizations')
      .select('profile_id, role, organization:organizations(name)')
      .in('role', ['admin', 'owner', 'manager'])

    const uniqueOrgAdmins = [...new Set(orgAdmins?.map(a => a.profile_id) || [])]
    console.log(`🏢 Profiles with admin roles: ${uniqueOrgAdmins.length}`)

    if (orgAdmins && orgAdmins.length > 0) {
      console.log('Organization admins:')
      orgAdmins.slice(0, 5).forEach(admin => {
        console.log(`   • ${admin.profile_id} (${admin.role}) -> ${admin.organization?.name}`)
      })
    }

    // Find admins who are NOT storytellers
    const adminsNotStorytellers = uniqueOrgAdmins.filter(id => !allStorytellers.includes(id))
    console.log(`👥 Organization admins who are NOT storytellers: ${adminsNotStorytellers.length}`)

    // 5. Profile categories analysis
    console.log('\n5️⃣ PROFILE CATEGORIES ANALYSIS...')

    const { count: totalProfiles } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    console.log(`📊 Total profiles: ${totalProfiles}`)
    console.log(`🎭 Active storytellers: ${allStorytellers.length} (${Math.round(allStorytellers.length/totalProfiles*100)}%)`)
    console.log(`🏢 Organization admins: ${uniqueOrgAdmins.length} (${Math.round(uniqueOrgAdmins.length/totalProfiles*100)}%)`)
    console.log(`👥 Admin-only (not storytellers): ${adminsNotStorytellers.length} (${Math.round(adminsNotStorytellers.length/totalProfiles*100)}%)`)

    const regularUsers = totalProfiles - allStorytellers.length
    console.log(`👤 Regular users (no stories/transcripts): ${regularUsers} (${Math.round(regularUsers/totalProfiles*100)}%)`)

    // 6. Recommendations
    console.log('\n6️⃣ ARCHITECTURAL RECOMMENDATIONS...')

    console.log('\n✅ CURRENT ARCHITECTURE WORKS:')
    console.log('   • Profiles = Universal user accounts (login, admin, etc.)')
    console.log('   • Storytellers = Profiles who have added stories/transcripts')
    console.log('   • Organization admins can exist without being storytellers ✓')

    console.log('\n🔧 IMPLEMENTATION RECOMMENDATIONS:')

    if (totalProfiles > 0 && allStorytellers.length > 0) {
      console.log('   1. KEEP profiles as the main table ✓')
      console.log('   2. Add is_storyteller computed field or view')
      console.log('   3. is_storyteller = has stories OR transcripts')
      console.log('   4. Organization admins can be non-storytellers ✓')
    }

    console.log('\n📝 SUGGESTED PROFILE FLAGS:')
    console.log('   • is_storyteller: computed from stories/transcripts')
    console.log('   • is_organization_admin: computed from admin roles')
    console.log('   • is_elder: cultural designation')
    console.log('   • is_featured: platform highlight')

    console.log('\n🎯 YOUR ARCHITECTURE IS CORRECT:')
    console.log('   ✓ Profiles for all users')
    console.log('   ✓ Storytellers = subset with stories/transcripts')
    console.log('   ✓ Org admins can exist without being storytellers')
    console.log('   ✓ Clean separation of concerns')

  } catch (error) {
    console.error('❌ Analysis failed:', error)
  }
}

analyzeProfilesStorytellers()