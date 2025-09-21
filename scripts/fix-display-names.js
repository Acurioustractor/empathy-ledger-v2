require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Map of storyteller IDs to their proper display names
const displayNameMapping = {
  'ebc60718-e377-4dc0-982e-251110017550': 'Cissy Johns',
  'b0ce4598-05d3-4773-92c0-8ba30ed65751': 'Heather Mundo',
  '90b2c00b-24a0-41d2-997c-adda7baa33b5': 'Profile User', // Multiple transcripts, need to identify
  '99a2d1de-2cad-4e03-a828-bf6617b36ef1': 'Aunty Diganbal May Rose',
  '7380ee75-512c-41b6-9f17-416e3dbba302': 'Aunty Vicky Wade'
}

async function fixDisplayNames() {
  console.log('🔍 Starting display name fix process...')

  try {
    // First, let's check current profiles with temp emails
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, display_name')
      .like('email', '%empathyledger.temp')

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError)
      return
    }

    console.log(`📋 Found ${profiles.length} profiles with temp emails:`)
    profiles.forEach(profile => {
      console.log(`  - ID: ${profile.id}`)
      console.log(`    Email: ${profile.email}`)
      console.log(`    Current display_name: ${profile.display_name}`)
      console.log(`    Suggested name: ${displayNameMapping[profile.id] || 'NEEDS MANUAL MAPPING'}`)
      console.log('')
    })

    // Update profiles with proper display names
    console.log('🔧 Updating display names...')

    for (const [profileId, displayName] of Object.entries(displayNameMapping)) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', profileId)

      if (updateError) {
        console.error(`❌ Error updating ${profileId}:`, updateError)
      } else {
        console.log(`✅ Updated ${profileId} to "${displayName}"`)
      }
    }

    // Verify the changes
    console.log('\n🔍 Verifying updates...')
    const { data: updatedProfiles, error: verifyError } = await supabase
      .from('profiles')
      .select('id, email, display_name')
      .in('id', Object.keys(displayNameMapping))

    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError)
      return
    }

    console.log('📋 Updated profiles:')
    updatedProfiles.forEach(profile => {
      console.log(`  - ${profile.display_name} (${profile.id})`)
    })

    console.log('\n✅ Display name fix completed!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Handle the user who has multiple transcripts (90b2c00b-24a0-41d2-997c-adda7baa33b5)
async function identifyMultiTranscriptUser() {
  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('title, storyteller_id')
    .eq('storyteller_id', '90b2c00b-24a0-41d2-997c-adda7baa33b5')

  console.log('📝 Transcripts for user 90b2c00b-24a0-41d2-997c-adda7baa33b5:')
  transcripts?.forEach(t => console.log(`  - ${t.title}`))

  // Based on the titles, this appears to be related to "Dr Boe Remenyi" content
  // Let's use "Community Storyteller" as a generic name for now
}

if (require.main === module) {
  identifyMultiTranscriptUser().then(() => {
    fixDisplayNames()
  })
}