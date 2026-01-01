const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testStorytellerAPI() {
  console.log('🔍 Testing storytellers API for Kristy...\n')

  // Check what the storytellers API would return
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, display_name, full_name, email, tenant_roles')
    .contains('tenant_roles', ['storyteller'])
    .order('display_name', { ascending: true })
    .limit(100)

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`Found ${profiles?.length || 0} storytellers:\n`)

  // Look for Kristy and Tanya
  const kristy = profiles?.find(p =>
    (p.display_name || '').toLowerCase().includes('kristy') ||
    (p.full_name || '').toLowerCase().includes('kristy')
  )

  const tanya = profiles?.find(p =>
    (p.display_name || '').toLowerCase().includes('tanya') ||
    (p.full_name || '').toLowerCase().includes('tanya')
  )

  if (kristy) {
    console.log('✅ Found Kristy Bloomfield:')
    console.log('   ID:', kristy.id)
    console.log('   display_name:', kristy.display_name)
    console.log('   full_name:', kristy.full_name)
    console.log('   email:', kristy.email)
    console.log('   tenant_roles:', kristy.tenant_roles)
    console.log('')
  } else {
    console.log('❌ Kristy NOT found in storytellers')
  }

  if (tanya) {
    console.log('✅ Found Tanya Turner:')
    console.log('   ID:', tanya.id)
    console.log('   display_name:', tanya.display_name)
    console.log('   full_name:', tanya.full_name)
    console.log('   email:', tanya.email)
    console.log('   tenant_roles:', tanya.tenant_roles)
    console.log('')
  } else {
    console.log('❌ Tanya NOT found in storytellers')
  }

  // Show all storyteller names that start with K
  const kNames = profiles?.filter(p =>
    (p.display_name || p.full_name || '').toLowerCase().startsWith('k')
  )

  console.log('\n📋 All storytellers starting with "K":')
  kNames?.forEach(p => {
    console.log(`   - ${p.display_name || p.full_name} (${p.id})`)
  })
}

testStorytellerAPI().then(() => process.exit(0))
