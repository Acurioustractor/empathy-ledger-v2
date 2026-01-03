import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkProfileDetails() {
  const profileId = 'd113d379-46f6-4113-9ad6-be7f76463c20'

  console.log(`🔍 Checking profile: ${profileId}\n`)

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single()

  if (error) {
    console.error('❌ Error fetching profile:', error.message)
    return
  }

  if (!profile) {
    console.log('⚠️  Profile not found')
    return
  }

  console.log('✅ Profile found:\n')
  console.log('Basic Info:')
  console.log(`  - ID: ${profile.id}`)
  console.log(`  - Display Name: ${profile.display_name || 'Not set'}`)
  console.log(`  - Full Name: ${profile.full_name || 'Not set'}`)
  console.log(`  - Email: ${profile.email || 'Not set'}`)
  console.log(`  - Bio: ${profile.bio ? profile.bio.substring(0, 100) + '...' : 'Not set'}`)

  console.log('\nPrivacy Settings:')
  console.log(`  - Default Story Visibility: ${profile.default_story_visibility || 'Not set'}`)
  console.log(`  - Contact Permissions: ${JSON.stringify(profile.contact_permissions) || 'Not set'}`)

  console.log('\nALMA Settings:')
  console.log(`  - Consent Preferences: ${profile.consent_preferences ? JSON.stringify(profile.consent_preferences, null, 2) : 'Not set'}`)
  console.log(`  - Cultural Permissions: ${profile.cultural_permissions ? JSON.stringify(profile.cultural_permissions, null, 2) : 'Not set'}`)

  console.log('\nTimestamps:')
  console.log(`  - Created: ${profile.created_at}`)
  console.log(`  - Updated: ${profile.updated_at}`)

  // Check if profile has auth user
  console.log('\n🔐 Checking auth user...')
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profileId)

  if (authError) {
    console.log(`  ⚠️  No auth user found: ${authError.message}`)
    console.log('  Note: This profile exists but has no associated auth user.')
    console.log('  You may need to be logged in to access it, or it may be a data-only profile.')
  } else {
    console.log(`  ✅ Auth user found: ${authUser.user.email}`)
  }
}

checkProfileDetails()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })
