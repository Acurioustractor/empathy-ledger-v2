import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    console.log('🔍 Fetching galleries for organisation:', organizationId)

    // 1. Get photo galleries for the organisation
    const { data: photoGalleries, error: galleriesError } = await supabase
      .from('photo_galleries')
      .select(`
        *,
        projects(id, name, description),
        profiles!photo_galleries_storyteller_id_fkey(id, full_name, avatar_url)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (galleriesError) {
      console.error('❌ Error fetching photo galleries:', galleriesError)
      throw galleriesError
    }

    console.log('✅ Found photo galleries:', photoGalleries?.length || 0)

    // 2. For each gallery, get the photos
    const galleriesWithPhotos = await Promise.all(
      (photoGalleries || []).map(async (gallery) => {
        console.log(`📸 Fetching photos for gallery: ${gallery.title}`)
        
        // Step 1: Get photo_gallery_items
        console.log(`🔍 Fetching photo items for gallery ID: ${gallery.id}`)
        const { data: photoItems, error: itemsError } = await supabase
          .from('photo_gallery_items')
          .select('*')
          .eq('gallery_id', gallery.id)
          .order('display_order', { ascending: true })

        if (itemsError) {
          console.error(`❌ Error fetching photo items for ${gallery.title}:`, itemsError)
          return {
            ...gallery,
            photos: []
          }
        }

        console.log(`✅ Found ${photoItems?.length || 0} photo items for ${gallery.title}`)

        let galleryItems = []

        if (photoItems && photoItems.length > 0) {
          // Step 2: Get media_assets for these photo items
          const mediaIds = photoItems.map(item => item.media_asset_id)
          
          const { data: mediaAssets, error: mediaError } = await supabase
            .from('media_assets')
            .select(`
              id,
              filename,
              original_filename,
              file_type,
              title,
              description,
              cdn_url,
              url,
              file_size,
              mime_type,
              created_at,
              uploader_id
            `)
            .in('id', mediaIds)

          if (mediaError) {
            console.error(`❌ Error fetching media assets for ${gallery.title}:`, mediaError)
            return {
              ...gallery,
              photos: []
            }
          }

          // Step 3: Combine photo items with media assets
          galleryItems = photoItems.map(photoItem => {
            const mediaAsset = mediaAssets?.find(ma => ma.id === photoItem.media_asset_id)
            return {
              ...photoItem,
              media_assets: mediaAsset
            }
          }).filter(item => item.media_assets) // Remove items where media asset wasn't found
        }

        console.log(`✅ Found ${galleryItems?.length || 0} photos for ${gallery.title}`)

        // Transform the data for frontend consumption
        const photos = (galleryItems || []).map(item => ({
          id: item.media_assets.id,
          filename: item.media_assets.filename,
          originalFilename: item.media_assets.original_filename,
          type: item.media_assets.file_type === 'image' ? 'image' : item.media_assets.file_type,
          url: item.media_assets.cdn_url || item.media_assets.url,
          title: item.media_assets.title || item.media_assets.filename,
          description: item.media_assets.description || '',
          size: item.media_assets.file_size || 0,
          mimeType: item.media_assets.mime_type,
          createdAt: item.media_assets.created_at,
          addedAt: item.added_at,
          uploader: {
            id: item.media_assets.uploader_id,
            name: 'Unknown User', // TODO: Fetch profiles separately if needed
            avatarUrl: null
          },
          tags: [`gallery-${gallery.id.substring(0, 8)}`, gallery.gallery_type || 'organisation'],
          galleryItemId: item.id
        }))

        return {
          id: gallery.id,
          title: gallery.title,
          description: gallery.description || '',
          galleryType: gallery.gallery_type,
          photoCount: gallery.photo_count || photos.length,
          totalSizeBytes: gallery.total_size_bytes || 0,
          privacyLevel: gallery.privacy_level,
          culturalSensitivityLevel: gallery.cultural_sensitivity_level,
          requiresElderApproval: gallery.requires_elder_approval,
          autoOrganizeEnabled: gallery.auto_organize_enabled,
          faceGroupingEnabled: gallery.face_grouping_enabled,
          locationGroupingEnabled: gallery.location_grouping_enabled,
          coverPhotoId: gallery.cover_photo_id,
          createdAt: gallery.created_at,
          updatedAt: gallery.updated_at,
          lastUpdatedAt: gallery.last_updated_at,
          project: gallery.projects ? {
            id: gallery.projects.id,
            name: gallery.projects.name,
            description: gallery.projects.description
          } : null,
          storyteller: gallery.profiles ? {
            id: gallery.profiles.id,
            name: gallery.profiles.full_name,
            avatarUrl: gallery.profiles.avatar_url
          } : null,
          photos,
          stats: {
            totalPhotos: photos.length,
            images: photos.filter(p => p.type === 'image').length,
            videos: photos.filter(p => p.type === 'video').length,
            totalSize: photos.reduce((sum, p) => sum + (p.size || 0), 0)
          }
        }
      })
    )

    // 3. Fetch content videos (transcripts & stories) for this organisation
    console.log('🎬 Fetching content videos (transcripts & stories) for organisation:', organizationId)

    // Get organisation's tenant_id
    const { data: org, error: orgError } = await supabase
      .from('organisations')
      .select('tenant_id')
      .eq('id', organizationId)
      .single()

    let storytellerVideos = []
    if (org && !orgError) {
      console.log(`🔍 Looking for content videos in tenant: ${org.tenant_id}`)

      // First, get storytellers in this organisation
      const { data: storytellers, error: storytellersError } = await supabase
        .from('profiles')
        .select('id, display_name, full_name, profile_image_url, avatar_url')
        .eq('tenant_id', org.tenant_id)
        .contains('tenant_roles', ['storyteller'])

      if (storytellers && !storytellersError) {
        console.log(`👥 Found ${storytellers.length} storytellers in organisation`)

        const storytellerIds = storytellers.map(s => s.id)

        // Fetch transcripts with videos
        const { data: transcriptsWithVideos, error: transcriptsError } = await supabase
          .from('transcripts')
          .select(`
            id,
            title,
            source_video_url,
            source_video_platform,
            created_at,
            profile_id
          `)
          .in('profile_id', storytellerIds)
          .or('source_video_url.not.is.null,source_video_platform.not.is.null')

        console.log(`📄 Found ${transcriptsWithVideos?.length || 0} transcripts with videos`)

        // Fetch stories with videos
        const { data: storiesWithVideos, error: storiesError } = await supabase
          .from('stories')
          .select(`
            id,
            title,
            video_embed_code,
            created_at,
            author_id
          `)
          .in('author_id', storytellerIds)
          .not('video_embed_code', 'is', null)

        console.log(`📖 Found ${storiesWithVideos?.length || 0} stories with videos`)

        // Convert transcripts to video items
        if (transcriptsWithVideos && !transcriptsError) {
          transcriptsWithVideos.forEach(transcript => {
            const storyteller = storytellers.find(s => s.id === transcript.profile_id)
            if (storyteller && transcript.source_video_url) {
              const storytellerName = storyteller.display_name || storyteller.full_name || 'Unknown Storyteller'

              console.log(`📹 Adding transcript video: ${transcript.title} by ${storytellerName}`)
              storytellerVideos.push({
                id: `transcript-${transcript.id}`,
                filename: `${transcript.title || 'Untitled Transcript'}`,
                originalFilename: `transcript_${transcript.id}.mp4`,
                type: 'video',
                url: transcript.source_video_url,
                title: transcript.title || 'Untitled Transcript',
                description: `Transcript video by ${storytellerName}`,
                size: 0,
                mimeType: 'video/mp4',
                createdAt: transcript.created_at,
                addedAt: transcript.created_at,
                uploader: {
                  id: storyteller.id,
                  name: storytellerName,
                  avatarUrl: storyteller.profile_image_url || storyteller.avatar_url
                },
                tags: ['content-video', 'transcript', storytellerName.toLowerCase().replace(/\s+/g, '-')],
                galleryItemId: `transcript-${transcript.id}`,
                videoType: 'transcript',
                storytellerId: storyteller.id,
                contentType: 'transcript',
                platform: transcript.source_video_platform
              })
            }
          })
        }

        // Convert stories to video items
        if (storiesWithVideos && !storiesError) {
          storiesWithVideos.forEach(story => {
            const storyteller = storytellers.find(s => s.id === story.author_id)
            if (storyteller && story.video_embed_code) {
              const storytellerName = storyteller.display_name || storyteller.full_name || 'Unknown Storyteller'

              // Extract URL from embed code (basic extraction for common formats)
              let videoUrl = story.video_embed_code
              const srcMatch = story.video_embed_code.match(/src=["']([^"']+)["']/)
              if (srcMatch) {
                videoUrl = srcMatch[1]
              }

              console.log(`📹 Adding story video: ${story.title} by ${storytellerName}`)
              storytellerVideos.push({
                id: `story-${story.id}`,
                filename: `${story.title || 'Untitled Story'}`,
                originalFilename: `story_${story.id}.mp4`,
                type: 'video',
                url: videoUrl,
                title: story.title || 'Untitled Story',
                description: `Story video by ${storytellerName}`,
                size: 0,
                mimeType: 'video/mp4',
                createdAt: story.created_at,
                addedAt: story.created_at,
                uploader: {
                  id: storyteller.id,
                  name: storytellerName,
                  avatarUrl: storyteller.profile_image_url || storyteller.avatar_url
                },
                tags: ['content-video', 'story', storytellerName.toLowerCase().replace(/\s+/g, '-')],
                galleryItemId: `story-${story.id}`,
                videoType: 'story',
                storytellerId: storyteller.id,
                contentType: 'story',
                embedCode: story.video_embed_code
              })
            }
          })
        }
      }
    }

    // 4. Return storyteller videos as individual items (for top-level display)
    console.log(`📺 Found ${storytellerVideos.length} storyteller videos to display as individual items`)

    // 5. Calculate overall stats
    const allPhotos = galleriesWithPhotos.flatMap(g => g.photos)
    const stats = {
      totalGalleries: galleriesWithPhotos.length,
      totalPhotos: allPhotos.length,
      totalImages: allPhotos.filter(p => p.type === 'image').length,
      totalVideos: allPhotos.filter(p => p.type === 'video').length,
      totalSize: allPhotos.reduce((sum, p) => sum + (p.size || 0), 0),
      totalViews: Math.floor(Math.random() * 1000) + 100 // Mock for now
    }

    console.log('📊 Gallery stats:', stats)

    return NextResponse.json({
      success: true,
      galleries: galleriesWithPhotos,
      storytellerVideos: storytellerVideos,
      stats
    })

  } catch (error) {
    console.error('❌ Error in galleries API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch galleries',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}