require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function linkPhotosToOrganizations() {
  console.log('🚀 Linking existing photos to organizations...')
  
  try {
    // Get Benjamin Knight's profile ID (the uploader)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'benjamin@act.place')
      .single()
    
    if (profileError || !profile) {
      console.error('❌ Could not find Benjamin Knight profile:', profileError?.message)
      return
    }
    
    const benjaminId = profile.id
    console.log('✅ Found Benjamin Knight profile:', benjaminId)
    
    // Get Snow Foundation and Deadly Hearts organization IDs
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .in('name', ['Snow Foundation', 'Deadly Hearts'])
    
    if (orgError) {
      console.error('❌ Error fetching organizations:', orgError.message)
      return
    }
    
    const snowFoundation = organizations?.find(org => org.name === 'Snow Foundation')
    const deadlyHearts = organizations?.find(org => org.name === 'Deadly Hearts')
    
    console.log('Organizations found:')
    console.log('  Snow Foundation:', snowFoundation?.id)
    console.log('  Deadly Hearts:', deadlyHearts?.id)
    
    // Get all media assets (your 121 photos)
    const { data: mediaAssets, error: mediaError } = await supabase
      .from('media_assets')
      .select('id, original_filename, uploader_id, tenant_id, created_at, cdn_url')
      .order('created_at', { ascending: true })
    
    if (mediaError) {
      console.error('❌ Error fetching media assets:', mediaError.message)
      return
    }
    
    console.log(`\n📊 Found ${mediaAssets?.length} media assets`)
    
    // Create galleries for each organization
    const galleries = []
    
    if (snowFoundation) {
      console.log('\n🎨 Creating Snow Foundation gallery...')
      const { data: snowGallery, error: snowGalleryError } = await supabase
        .from('galleries')
        .insert({
          title: 'Snow Foundation Photos',
          slug: 'snow-foundation-photos',
          description: 'Photo collection from Snow Foundation activities and events',
          created_by: benjaminId,
          organization_id: snowFoundation.id,
          cultural_theme: 'community',
          visibility: 'community',
          status: 'active'
        })
        .select()
        .single()
      
      if (snowGalleryError) {
        console.log('Snow Foundation gallery may already exist:', snowGalleryError.message)
        // Try to get existing gallery
        const { data: existing } = await supabase
          .from('galleries')
          .select('*')
          .eq('slug', 'snow-foundation-photos')
          .single()
        if (existing) {
          galleries.push({ ...existing, orgName: 'Snow Foundation' })
        }
      } else {
        galleries.push({ ...snowGallery, orgName: 'Snow Foundation' })
      }
    }
    
    if (deadlyHearts) {
      console.log('🎨 Creating Deadly Hearts Trek gallery...')
      const { data: deadlyGallery, error: deadlyGalleryError } = await supabase
        .from('galleries')
        .insert({
          title: 'Deadly Hearts Trek Photos',
          slug: 'deadly-hearts-trek-photos', 
          description: 'Photo collection from Deadly Hearts Trek project and activities',
          created_by: benjaminId,
          organization_id: deadlyHearts.id,
          cultural_theme: 'community',
          visibility: 'community',
          status: 'active'
        })
        .select()
        .single()
      
      if (deadlyGalleryError) {
        console.log('Deadly Hearts gallery may already exist:', deadlyGalleryError.message)
        // Try to get existing gallery
        const { data: existing } = await supabase
          .from('galleries')
          .select('*')
          .eq('slug', 'deadly-hearts-trek-photos')
          .single()
        if (existing) {
          galleries.push({ ...existing, orgName: 'Deadly Hearts Trek' })
        }
      } else {
        galleries.push({ ...deadlyGallery, orgName: 'Deadly Hearts Trek' })
      }
    }
    
    console.log(`\n✅ Created/found ${galleries.length} galleries`)
    
    // Split photos between galleries (60/40 split approximately)
    const totalPhotos = mediaAssets.length
    const snowPhotosCount = Math.floor(totalPhotos * 0.6) // 60% to Snow Foundation
    const deadlyPhotosCount = totalPhotos - snowPhotosCount // 40% to Deadly Hearts Trek
    
    console.log(`\n📸 Distributing photos:`)
    console.log(`  Snow Foundation: ${snowPhotosCount} photos`)
    console.log(`  Deadly Hearts Trek: ${deadlyPhotosCount} photos`)
    
    let associationsCreated = 0
    
    // Link photos to Snow Foundation gallery
    if (galleries.find(g => g.orgName === 'Snow Foundation')) {
      const snowGallery = galleries.find(g => g.orgName === 'Snow Foundation')
      const snowPhotos = mediaAssets.slice(0, snowPhotosCount)
      
      console.log(`\n🔗 Linking ${snowPhotos.length} photos to Snow Foundation gallery...`)
      
      for (let i = 0; i < snowPhotos.length; i++) {
        const photo = snowPhotos[i]
        const { error: linkError } = await supabase
          .from('gallery_media_associations')
          .insert({
            gallery_id: snowGallery.id,
            media_asset_id: photo.id,
            sort_order: i,
            caption: `Photo ${i + 1} from Snow Foundation activities`,
            cultural_context: 'Community engagement and cultural activities'
          })
        
        if (!linkError) {
          associationsCreated++
        } else if (!linkError.message.includes('duplicate')) {
          console.log(`Error linking photo ${i + 1}:`, linkError.message)
        }
        
        // Progress indicator
        if ((i + 1) % 10 === 0) {
          console.log(`  📎 Linked ${i + 1}/${snowPhotos.length} photos to Snow Foundation`)
        }
      }
    }
    
    // Link photos to Deadly Hearts Trek gallery
    if (galleries.find(g => g.orgName === 'Deadly Hearts Trek')) {
      const deadlyGallery = galleries.find(g => g.orgName === 'Deadly Hearts Trek')
      const deadlyPhotos = mediaAssets.slice(snowPhotosCount)
      
      console.log(`\n🔗 Linking ${deadlyPhotos.length} photos to Deadly Hearts Trek gallery...`)
      
      for (let i = 0; i < deadlyPhotos.length; i++) {
        const photo = deadlyPhotos[i]
        const { error: linkError } = await supabase
          .from('gallery_media_associations')
          .insert({
            gallery_id: deadlyGallery.id,
            media_asset_id: photo.id,
            sort_order: i,
            caption: `Photo ${i + 1} from Deadly Hearts Trek project`,
            cultural_context: 'Project activities and community involvement'
          })
        
        if (!linkError) {
          associationsCreated++
        } else if (!linkError.message.includes('duplicate')) {
          console.log(`Error linking photo ${i + 1}:`, linkError.message)
        }
        
        // Progress indicator
        if ((i + 1) % 10 === 0) {
          console.log(`  📎 Linked ${i + 1}/${deadlyPhotos.length} photos to Deadly Hearts Trek`)
        }
      }
    }
    
    console.log(`\n📊 Summary:`)
    console.log(`  Total photos: ${totalPhotos}`)
    console.log(`  Galleries created: ${galleries.length}`)
    console.log(`  Photo associations created: ${associationsCreated}`)
    
    // Verify the linking
    console.log(`\n🔍 Verifying photo links...`)
    
    for (const gallery of galleries) {
      const { data: linkedPhotos, error: countError } = await supabase
        .from('gallery_media_associations')
        .select('id')
        .eq('gallery_id', gallery.id)
      
      if (countError) {
        console.log(`❌ Error counting photos for ${gallery.orgName}:`, countError.message)
      } else {
        console.log(`✅ ${gallery.orgName}: ${linkedPhotos?.length || 0} photos linked`)
      }
    }
    
    console.log('\n🎉 Photo linking completed!')
    console.log('\n📱 You can now view your galleries at:')
    console.log('  http://localhost:3003/galleries')
    console.log('  Admin media management: http://localhost:3003/admin (Media tab)')
    
  } catch (error) {
    console.error('💥 Error linking photos:', error)
  }
}

linkPhotosToOrganizations()