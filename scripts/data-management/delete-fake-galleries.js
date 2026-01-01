// Script to delete fake galleries from the database
// Run this in Node.js environment

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wjqydzklqhfqhgjhsvcx.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function deleteFakeGalleries() {
  console.log('🗑️ Starting to delete fake galleries...')

  try {
    // Get all galleries created by Benjamin Knight (these appear to be the fake ones)
    const { data: galleries, error: fetchError } = await supabase
      .from('photo_galleries')
      .select(`
        id,
        title,
        created_by,
        created_at,
        profiles:created_by(display_name, full_name)
      `)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('❌ Error fetching galleries:', fetchError)
      return
    }

    console.log(`📋 Found ${galleries.length} galleries total`)

    // Filter galleries that are likely fake (based on the titles you mentioned)
    const fakeGalleryTitles = [
      'Community Ceremonies',
      'Youth Cultural Activities',
      'Elder Knowledge Keepers',
      'Healing Through Storytelling - Photo Collection'
    ]

    const fakegalleries = galleries.filter(gallery =>
      fakeGalleryTitles.some(title => gallery.title.includes(title)) ||
      (gallery.profiles?.display_name === 'Benjamin Knight' &&
       gallery.created_at >= '2025-09-16') // Recent galleries by Benjamin
    )

    console.log(`🎯 Found ${fakegalleries.length} fake galleries to delete:`)
    fakegalleries.forEach(gallery => {
      console.log(`  - "${gallery.title}" (ID: ${gallery.id}) by ${gallery.profiles?.display_name || 'Unknown'}`)
    })

    if (fakegalleries.length === 0) {
      console.log('✅ No fake galleries found to delete')
      return
    }

    // Confirm deletion
    console.log('\n⚠️  About to delete these galleries. This action cannot be undone!')

    // Delete galleries
    for (const gallery of fakegalleries) {
      console.log(`🗑️ Deleting gallery: "${gallery.title}"...`)

      // First, delete any media associations
      const { error: mediaError } = await supabase
        .from('gallery_media_associations')
        .delete()
        .eq('gallery_id', gallery.id)

      if (mediaError) {
        console.error(`❌ Error deleting media associations for gallery ${gallery.id}:`, mediaError)
        continue
      }

      // Delete the gallery
      const { error: deleteError } = await supabase
        .from('photo_galleries')
        .delete()
        .eq('id', gallery.id)

      if (deleteError) {
        console.error(`❌ Error deleting gallery ${gallery.id}:`, deleteError)
      } else {
        console.log(`✅ Deleted gallery: "${gallery.title}"`)
      }
    }

    console.log('\n🎉 Finished deleting fake galleries!')

    // Show remaining galleries
    const { data: remainingGalleries } = await supabase
      .from('photo_galleries')
      .select('id, title, created_by, profiles:created_by(display_name)')
      .order('created_at', { ascending: false })

    console.log(`\n📊 Remaining galleries: ${remainingGalleries?.length || 0}`)
    if (remainingGalleries && remainingGalleries.length > 0) {
      remainingGalleries.forEach(gallery => {
        console.log(`  - "${gallery.title}" by ${gallery.profiles?.display_name || 'Unknown'}`)
      })
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

// Run the script
deleteFakeGalleries()