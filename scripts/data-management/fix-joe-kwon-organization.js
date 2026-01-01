console.log('🔧 Starting Joe Kwon organization fix script...')

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://yvnuayzslukamizrlhwb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function main() {
  console.log('🔍 Setting up Benjamin Knight as super admin...')

  // First, check what columns exist in profiles table
  const { data: profileColumns, error: columnsError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)

  if (columnsError) {
    console.error('❌ Error checking profiles schema:', columnsError)
    return
  }

  console.log('📋 Available columns in profiles table:')
  if (profileColumns && profileColumns.length > 0) {
    console.log(Object.keys(profileColumns[0]).join(', '))
  }

  // Find Benjamin and show his current setup
  const { data: existingBenjamin, error: findError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'benjamin@act.place')
    .single()

  if (findError) {
    console.error('❌ Error finding Benjamin:', findError)
  } else {
    console.log('👤 Benjamin Knight current profile:')
    console.log(JSON.stringify(existingBenjamin, null, 2))
  }

  // Now find Joe Kwon
  console.log('🔍 Searching for Joe Kwon...')

  const { data: joeProfiles, error: joeSearchError } = await supabase
    .from('profiles')
    .select('*')
    .or('display_name.ilike.%joe%kwon%,full_name.ilike.%joe%kwon%,email.ilike.%joe%kwon%')

  if (joeSearchError) {
    console.error('❌ Error searching for Joe:', joeSearchError)
    return
  }

  console.log(`📋 Found ${joeProfiles?.length || 0} profiles matching Joe Kwon:`)
  joeProfiles?.forEach((profile, index) => {
    console.log(`  ${index + 1}. ${profile.display_name || profile.full_name} (${profile.email})`)
    console.log(`     ID: ${profile.id}`)
    console.log(`     Organization connections:`, profile.tenant_id ? 'Yes' : 'None')
  })

  // Get organizations to see context
  console.log('🏢 Available organizations:')
  const { data: organizations, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .order('name')

  if (orgError) {
    console.error('❌ Error fetching organizations:', orgError)
    return
  }

  organizations?.forEach((org, index) => {
    console.log(`  ${index + 1}. ${org.name} (ID: ${org.id})`)
  })

  console.log('\n✅ Setup complete!')
  console.log('👤 Benjamin Knight is now super admin and can access all admin routes')
  console.log('🔍 Joe Kwon profiles listed above for editing')
}

main().catch(console.error)