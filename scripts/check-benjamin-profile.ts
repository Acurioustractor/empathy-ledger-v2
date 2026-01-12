import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars: Record<string, string> = {}

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    const value = match[2].trim()
    envVars[key] = value
  }
})

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
)

async function checkBenjamin() {
  try {
    // Find benjamin@act.place profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', 'benjamin@act.place')
      .single()

    if (profileError || !profile) {
      console.log('❌ No profile found for benjamin@act.place')
      return
    }

    console.log('✅ Profile found:')
    console.log(`   ID: ${profile.id}`)
    console.log(`   Email: ${profile.email}`)
    console.log(`   Name: ${profile.full_name}`)

    // Check if storyteller exists
    const { data: storyteller } = await supabase
      .from('storytellers')
      .select('id, display_name')
      .eq('id', profile.id)
      .single()

    if (storyteller) {
      console.log('\n✅ Storyteller profile exists:')
      console.log(`   Display Name: ${storyteller.display_name}`)
    } else {
      console.log('\n⚠️  No storyteller profile found')
      console.log('   Story will be created with author_id only (storyteller_id will be null)')
    }
  } catch (err) {
    console.error('Error:', err)
  }
}

checkBenjamin()
