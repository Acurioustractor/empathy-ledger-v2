import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkProfiles() {
  console.log('🔍 Checking existing storyteller profiles...\n')

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, display_name, email, full_name')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('❌ Error fetching profiles:', error.message)
    return
  }

  if (!profiles || profiles.length === 0) {
    console.log('⚠️  No profiles found in database')
    console.log('\nYou can create test profiles using scripts/seed-sprint1-test-profiles.ts')
    return
  }

  console.log(`✅ Found ${profiles.length} profile(s):\n`)
  profiles.forEach((p, i) => {
    console.log(`${i + 1}. ${p.display_name || p.full_name || 'Unnamed'}`)
    console.log(`   ID: ${p.id}`)
    console.log(`   Email: ${p.email || 'No email'}`)
    console.log(`   Dashboard: http://localhost:3030/storytellers/${p.id}/dashboard`)
    console.log(`   Profile: http://localhost:3030/storytellers/${p.id}\n`)
  })
}

checkProfiles()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })
