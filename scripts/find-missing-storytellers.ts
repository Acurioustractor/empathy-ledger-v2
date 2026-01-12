import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function findMissingStorytellers() {
  console.log('=== STORYTELLER INVESTIGATION ===\n')

  // 1. Check profiles marked as storytellers
  const { data: profilesAsStorytellers, count: profileStorytellerCount } = await supabase
    .from('profiles')
    .select('id, full_name, display_name, is_storyteller, legacy_storyteller_id', { count: 'exact' })
    .eq('is_storyteller', true)

  console.log(`✅ Profiles with is_storyteller=true: ${profileStorytellerCount}`)

  // 2. Check storytellers table
  const { count: storytellersCount } = await supabase
    .from('storytellers')
    .select('*', { count: 'exact', head: true })

  console.log(`✅ Records in storytellers table: ${storytellersCount}`)

  // 3. Find profiles that are storytellers but NOT in storytellers table
  const { data: missingFromStorytellers } = await supabase
    .from('profiles')
    .select('id, full_name, display_name, is_storyteller, legacy_storyteller_id')
    .eq('is_storyteller', true)

  if (missingFromStorytellers) {
    const storytellerIds = new Set<string>()
    const { data: allStorytellers } = await supabase
      .from('storytellers')
      .select('profile_id')

    allStorytellers?.forEach(st => storytellerIds.add(st.profile_id))

    const missing = missingFromStorytellers.filter(p => !storytellerIds.has(p.id))

    console.log(`\n❌ Profiles marked as storytellers but NOT in storytellers table: ${missing.length}`)
    if (missing.length > 0) {
      console.log('\nMissing profiles:')
      missing.slice(0, 5).forEach(p => {
        console.log(`  - ${p.full_name || p.display_name || 'No name'} (ID: ${p.id})`)
      })
      if (missing.length > 5) {
        console.log(`  ... and ${missing.length - 5} more`)
      }
    }
  }

  // 4. Check if there are storytellers WITHOUT profiles
  const { data: storytellersWithProfiles } = await supabase
    .from('storytellers')
    .select('id, profile_id, display_name')

  if (storytellersWithProfiles) {
    const profileIds = new Set<string>()
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('id')

    allProfiles?.forEach(p => profileIds.add(p.id))

    const orphaned = storytellersWithProfiles.filter(st => !profileIds.has(st.profile_id))

    console.log(`\n⚠️  Storytellers WITHOUT matching profiles: ${orphaned.length}`)
    if (orphaned.length > 0) {
      console.log('\nOrphaned storytellers:')
      orphaned.slice(0, 5).forEach(st => {
        console.log(`  - ${st.display_name || 'No name'} (profile_id: ${st.profile_id})`)
      })
      if (orphaned.length > 5) {
        console.log(`  ... and ${orphaned.length - 5} more`)
      }
    }
  }

  // 5. Check stories pointing to storytellers
  const { count: storiesCount } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .not('storyteller_id', 'is', null)

  console.log(`\n📖 Stories with storyteller_id: ${storiesCount}`)

  // 6. Check transcripts pointing to storytellers
  const { count: transcriptsCount } = await supabase
    .from('transcripts')
    .select('*', { count: 'exact', head: true })
    .not('storyteller_id', 'is', null)

  console.log(`📝 Transcripts with storyteller_id: ${transcriptsCount}`)

  // 7. Historical check - look for legacy_storyteller_id
  const { count: legacyCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .not('legacy_storyteller_id', 'is', null)

  console.log(`\n🕰️  Profiles with legacy_storyteller_id: ${legacyCount}`)

  console.log('\n=== SUMMARY ===')
  console.log(`Total profiles: 251`)
  console.log(`Profiles marked is_storyteller=true: ${profileStorytellerCount}`)
  console.log(`Storytellers table count: ${storytellersCount}`)
  console.log(`Gap: ${(profileStorytellerCount || 0) - (storytellersCount || 0)} storytellers not in storytellers table`)
}

findMissingStorytellers().then(() => process.exit(0)).catch(console.error)
