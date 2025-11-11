// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'



const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    const galleryData = await request.json()

    console.log('🎨 Creating gallery for organization (FIXED):', organizationId, galleryData)

    // Get organization and validate
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, tenant_id')
      .eq('id', organizationId)
      .single()

    if (orgError || !organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Validate required fields
    if (!galleryData.title) {
      return NextResponse.json({ error: 'Gallery title is required' }, { status: 400 })
    }

    // Validate project exists if specified
    if (galleryData.projectId) {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id, name')
        .eq('id', galleryData.projectId)
        .eq('organization_id', organizationId)
        .single()

      if (projectError || !project) {
        return NextResponse.json({ error: 'Selected project not found or not accessible' }, { status: 400 })
      }
    }

    // Handle storyteller IDs - support both single storytellerId (backward compatibility) and multiple storytellerIds
    const storytellerIds = galleryData.storytellerIds || (galleryData.storytellerId ? [galleryData.storytellerId] : [])
    const primaryStorytellerId = storytellerIds.length > 0 ? storytellerIds[0] : null

    // Validate storytellers exist if specified
    if (storytellerIds.length > 0) {
      const { data: storytellers, error: storytellersError } = await supabase
        .from('profiles')
        .select('id, display_name, full_name')
        .in('id', storytellerIds)
        .eq('tenant_id', organization.tenant_id)

      if (storytellersError || !storytellers || storytellers.length !== storytellerIds.length) {
        return NextResponse.json({ error: 'One or more selected storytellers not found or not accessible' }, { status: 400 })
      }
    }

    // Create gallery using standard galleries table
    const { data: newGallery, error: galleryError } = await supabase
      .from('galleries')
      .insert([{
        title: galleryData.title,
        description: galleryData.description || '',
        visibility: galleryData.privacyLevel || 'organisation',
        cultural_sensitivity_level: galleryData.culturalSensitivityLevel || 'low',
        organization_id: organizationId,
        project_id: galleryData.projectId || null,
        storyteller_id: primaryStorytellerId,
        tenant_id: organization.tenant_id,
        created_by: primaryStorytellerId || 'system',
        status: 'active',
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (galleryError) {
      console.error('❌ Error creating gallery:', galleryError)
      return NextResponse.json({
        error: 'Failed to create gallery',
        details: galleryError.message,
        code: galleryError.code
      }, { status: 500 })
    }

    console.log('✅ Gallery created successfully:', {
      galleryId: newGallery.id,
      title: newGallery.title,
      organizationId: organizationId,
      visibility: newGallery.visibility
    })

    // Return formatted gallery with organization context
    const formattedGallery = {
      id: newGallery.id,
      title: newGallery.title,
      description: newGallery.description,
      galleryType: 'organization',
      photoCount: 0,
      totalSizeBytes: 0,
      privacyLevel: newGallery.visibility,
      culturalSensitivityLevel: newGallery.cultural_sensitivity_level,
      requiresElderApproval: galleryData.requiresElderApproval || false,
      autoOrganizeEnabled: galleryData.autoOrganizeEnabled || true,
      faceGroupingEnabled: galleryData.faceGroupingEnabled || false,
      locationGroupingEnabled: galleryData.locationGroupingEnabled || false,
      coverPhotoId: newGallery.cover_image_id || null,
      createdAt: newGallery.created_at,
      updatedAt: newGallery.updated_at,
      lastUpdatedAt: newGallery.updated_at,
      organization: {
        id: organization.id,
        name: organization.name
      },
      project: galleryData.projectId ? { id: galleryData.projectId } : null,
      storyteller: primaryStorytellerId ? { id: primaryStorytellerId } : null,
      storytellers: storytellerIds.map(id => ({ id })),
      photos: [],
      stats: {
        totalPhotos: 0,
        images: 0,
        videos: 0,
        totalSize: 0
      },
      // Auto-organization tags
      organizationTags: [
        `org-${organization.name.toLowerCase().replace(/\s+/g, '-')}`,
        `tenant-${organization.tenant_id.substring(0, 8)}`,
        galleryData.projectId ? `project-${galleryData.projectId.substring(0, 8)}` : null,
        ...storytellerIds.map(id => `storyteller-${id.substring(0, 8)}`)
      ].filter(Boolean)
    }

    const storytellerText = storytellerIds.length > 0
      ? ` and tagged with ${storytellerIds.length} selected storyteller${storytellerIds.length === 1 ? '' : 's'}`
      : ''

    return NextResponse.json({
      success: true,
      gallery: formattedGallery,
      message: `Gallery created successfully. All photos added to this gallery will be automatically tagged with your organization${storytellerText}.`
    })

  } catch (error) {
    console.error('Create gallery error:', error)
    return NextResponse.json({ error: 'Failed to create gallery' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    console.log('🔍 Fetching galleries for organisation:', organizationId)

    // 1. Get organization and its tenant info
    const { data: organization } = await supabase
      .from('organizations')
      .select('id, tenant_id')
      .eq('id', organizationId)
      .single()

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // 2. Get galleries that belong to this organization's tenant
    console.log(`🔍 Organization: ${organizationId} (tenant: ${organization.tenant_id})`)

    // Get all users in this organization's tenant
    const { data: orgUsers } = await supabase
      .from('profiles')
      .select('id')
      .eq('tenant_id', organization.tenant_id)

    const userIds = orgUsers?.map(u => u.id) || []
    console.log(`👥 Found ${orgUsers?.length || 0} users in tenant`)

    // Get galleries for this organization (from standard galleries table)
    const { data: galleries, error: galleriesError } = await supabase
      .from('galleries')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (galleriesError) {
      console.error('❌ Error fetching galleries:', galleriesError)
      throw galleriesError
    }

    console.log(`✅ Found ${galleries?.length || 0} galleries for organization ${organizationId}`)
    if (galleries && galleries.length > 0) {
      console.log('🔍 Gallery details:', galleries.map(g => ({
        id: g.id,
        title: g.title,
        org_id: g.organization_id,
        created_by: g.created_by
      })))
    }

    // 2. For each gallery, get the photos
    const galleriesWithPhotos = await Promise.all(
      (galleries || []).map(async (gallery) => {
        console.log(`📸 Fetching photos for gallery: ${gallery.title}`)

        // Step 1: Get gallery_media_associations
        console.log(`🔍 Fetching media associations for gallery ID: ${gallery.id}`)
        const { data: mediaAssociations, error: associationsError } = await supabase
          .from('gallery_media_associations')
          .select('*')
          .eq('gallery_id', gallery.id)
          .order('sort_order', { ascending: true })

        if (associationsError) {
          console.error(`❌ Error fetching media associations for ${gallery.title}:`, associationsError)
          return {
            ...gallery,
            photos: []
          }
        }

        console.log(`✅ Found ${mediaAssociations?.length || 0} media associations for ${gallery.title}`)

        let galleryItems = []

        if (mediaAssociations && mediaAssociations.length > 0) {
          // Step 2: Get media_assets for these associations
          const mediaIds = mediaAssociations.map(assoc => assoc.media_asset_id)

          const { data: mediaAssets, error: mediaError } = await supabase
            .from('media_assets')
            .select(`
              id,
              filename,
              file_type,
              title,
              description,
              storage_path,
              thumbnail_url,
              file_size,
              mime_type,
              created_at,
              uploaded_by
            `)
            .in('id', mediaIds)

          if (mediaError) {
            console.error(`❌ Error fetching media assets for ${gallery.title}:`, mediaError)
            return {
              ...gallery,
              photos: []
            }
          }

          // Step 3: Combine media associations with media assets
          galleryItems = mediaAssociations.map(association => {
            const mediaAsset = mediaAssets?.find(ma => ma.id === association.media_asset_id)
            return {
              ...association,
              media_assets: mediaAsset
            }
          }).filter(item => item.media_assets) // Remove items where media asset wasn't found
        }

        console.log(`✅ Found ${galleryItems?.length || 0} photos for ${gallery.title}`)

        // Transform the data for frontend consumption
        const photos = (galleryItems || []).map(item => ({
          id: item.media_assets.id,
          filename: item.media_assets.filename,
          originalFilename: item.media_assets.filename,
          type: item.media_assets.file_type === 'image' ? 'image' : item.media_assets.file_type,
          url: item.media_assets.thumbnail_url ||
                (item.media_assets.storage_path
                  ? `https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/${item.media_assets.storage_path}`
                  : `https://via.placeholder.com/400x300/6366f1/ffffff?text=${encodeURIComponent(item.media_assets.title || item.media_assets.filename || 'Photo')}`),
          title: item.media_assets.title || item.media_assets.filename,
          description: item.media_assets.description || '',
          size: item.media_assets.file_size || 0,
          mimeType: item.media_assets.mime_type,
          createdAt: item.media_assets.created_at,
          addedAt: item.created_at,
          uploader: {
            id: item.media_assets.uploaded_by,
            name: 'Unknown User', // TODO: Fetch profiles separately if needed
            avatarUrl: null
          },
          tags: [`gallery-${gallery.id.substring(0, 8)}`, 'gallery'],
          galleryItemId: item.id
        }))

        return {
          id: gallery.id,
          title: gallery.title,
          description: gallery.description || '',
          galleryType: 'organization',
          photoCount: photos.length,
          totalSizeBytes: photos.reduce((sum, p) => sum + (p.size || 0), 0),
          privacyLevel: gallery.visibility || 'organisation',
          culturalSensitivityLevel: gallery.cultural_sensitivity_level || 'low',
          requiresElderApproval: false,
          autoOrganizeEnabled: false,
          faceGroupingEnabled: false,
          locationGroupingEnabled: false,
          coverPhotoId: gallery.cover_image_id || null,
          createdAt: gallery.created_at,
          updatedAt: gallery.updated_at,
          lastUpdatedAt: gallery.updated_at,
          project: gallery.project_id ? {
            id: gallery.project_id,
            name: 'Unknown Project'
          } : null,
          storyteller: gallery.storyteller_id ? {
            id: gallery.storyteller_id,
            name: 'Unknown Storyteller',
            avatarUrl: null
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
      .from('organizations')
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