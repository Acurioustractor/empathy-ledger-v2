import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCounts() {
  console.log('=== DATABASE TABLE COUNTS ===\n')

  const tables = [
    'profiles',
    'storytellers',
    'stories',
    'transcripts',
    'narrative_themes',
    'story_themes'
  ]

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.log(`${table}: ERROR - ${error.message}`)
    } else {
      console.log(`${table}: ${count}`)
    }
  }

  // Check storytellers with profiles
  console.log('\n=== RELATIONSHIP CHECKS ===\n')

  const { count: storytellersWithProfiles } = await supabase
    .from('storytellers')
    .select('*', { count: 'exact', head: true })
    .not('profile_id', 'is', null)

  console.log(`Storytellers with profile_id: ${storytellersWithProfiles}`)

  const { count: profilesAsStorytellers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_storyteller', true)

  console.log(`Profiles marked as storytellers: ${profilesAsStorytellers}`)
}

checkCounts().then(() => process.exit(0)).catch(console.error)
