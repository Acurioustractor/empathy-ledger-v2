const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function findLawaGallery() {
  console.log('🔍 Searching for "Lawa students" gallery...\n')

  // Search in galleries table
  const { data: galleries1 } = await supabase
    .from('galleries')
    .select('*')
    .ilike('title', '%lawa%')

  console.log(`Found ${galleries1?.length || 0} matches in "galleries" table:`)
  galleries1?.forEach(g => {
    console.log(`  - ${g.title} (${g.id})`)
  })

  // Search in photo_galleries table
  const { data: galleries2 } = await supabase
    .from('photo_galleries')
    .select('*')
    .ilike('title', '%lawa%')

  console.log(`\nFound ${galleries2?.length || 0} matches in "photo_galleries" table:`)
  galleries2?.forEach(g => {
    console.log(`  - ${g.title} (${g.id})`)
    console.log(`    Organization: ${g.organization_id}`)
    console.log(`    Photo count: ${g.photo_count}`)
    console.log(`    Created: ${new Date(g.created_at).toLocaleString()}`)
  })

  // Check all photo_galleries for Oonchiumpa
  const { data: allPhotoGalleries } = await supabase
    .from('photo_galleries')
    .select('*')
    .eq('organization_id', 'c53077e1-98de-4216-9149-6268891ff62e')
    .order('created_at', { ascending: false })

  console.log(`\n\n📸 All photo_galleries for Oonchiumpa:`)
  if (allPhotoGalleries && allPhotoGalleries.length > 0) {
    allPhotoGalleries.forEach(g => {
      console.log(`\n  📁 ${g.title}`)
      console.log(`     ID: ${g.id}`)
      console.log(`     Photos: ${g.photo_count || 0}`)
      console.log(`     Created: ${new Date(g.created_at).toLocaleString()}`)
    })
  } else {
    console.log('  No galleries found')
  }
}

findLawaGallery().then(() => process.exit(0))
