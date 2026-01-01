const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkGalleries() {
  console.log('🔍 Checking all galleries in database...\n')

  // Get all galleries
  const { data: galleries, error } = await supabase
    .from('galleries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`Found ${galleries?.length || 0} total galleries:\n`)

  galleries?.forEach((g, i) => {
    console.log(`${i + 1}. ${g.title}`)
    console.log(`   ID: ${g.id}`)
    console.log(`   Organization ID: ${g.organization_id || 'none'}`)
    console.log(`   Created by: ${g.created_by}`)
    console.log(`   Visibility: ${g.visibility}`)
    console.log(`   Created: ${new Date(g.created_at).toLocaleString()}`)
    console.log('')
  })

  // Check Oonchiumpa organization
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name')
    .ilike('name', '%oonchiumpa%')

  if (orgs && orgs.length > 0) {
    console.log('\n🏢 Oonchiumpa Organizations:')
    orgs.forEach(org => {
      console.log(`   ${org.name}: ${org.id}`)
    })

    // Check galleries for this org
    const { data: orgGalleries } = await supabase
      .from('galleries')
      .select('*')
      .eq('organization_id', orgs[0].id)

    console.log(`\n📸 Galleries for ${orgs[0].name} (${orgs[0].id}):`)
    if (orgGalleries && orgGalleries.length > 0) {
      orgGalleries.forEach(g => {
        console.log(`   - ${g.title} (${g.id})`)
      })
    } else {
      console.log('   No galleries found for this organization')
    }
  }
}

checkGalleries().then(() => process.exit(0))
