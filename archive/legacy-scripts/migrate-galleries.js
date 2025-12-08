const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrateGalleries() {
  console.log('🔄 Migrating galleries from photo_galleries to galleries table...\n')

  // Get all galleries from photo_galleries for Oonchiumpa
  const { data: photoGalleries, error: fetchError } = await supabase
    .from('photo_galleries')
    .select('*')
    .eq('organization_id', 'c53077e1-98de-4216-9149-6268891ff62e')

  if (fetchError) {
    console.error('❌ Error fetching galleries:', fetchError)
    return
  }

  console.log(`Found ${photoGalleries?.length || 0} galleries to migrate\n`)

  for (const pg of photoGalleries || []) {
    // Check if already exists in galleries table
    const { data: existing } = await supabase
      .from('galleries')
      .select('id')
      .eq('id', pg.id)
      .single()

    if (existing) {
      console.log(`⏭️  Skipping "${pg.title}" - already exists in galleries table`)
      continue
    }

    // Generate slug from title
    const slug = pg.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Map sensitivity levels to allowed values
    const sensitivityMap = {
      'low': 'low',
      'standard': 'low',
      'medium': 'medium',
      'high': 'high',
      'restricted': 'high'
    }
    const sensitivity = sensitivityMap[pg.cultural_sensitivity_level] || 'low'

    // Insert into galleries table (only fields that exist)
    const { error: insertError } = await supabase
      .from('galleries')
      .insert({
        id: pg.id, // Keep same ID
        title: pg.title,
        slug: slug,
        description: pg.description,
        visibility: pg.privacy_level || 'organisation',
        cultural_sensitivity_level: sensitivity,
        organization_id: pg.organization_id,
        created_by: pg.created_by || 'system',
        status: 'active',
        featured: false,
        cover_image_id: pg.cover_photo_id,
        photo_count: pg.photo_count || 0,
        created_at: pg.created_at,
        updated_at: pg.updated_at || pg.created_at
      })

    if (insertError) {
      console.error(`❌ Error migrating "${pg.title}":`, insertError.message)
    } else {
      console.log(`✅ Migrated "${pg.title}" (${pg.photo_count || 0} photos)`)
    }
  }

  console.log('\n🎉 Migration complete!')
}

migrateGalleries().then(() => process.exit(0))
