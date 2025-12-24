// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'



const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface DetailedTranscript {
  id: string
  title: string
  content: string
  wordCount: number
  characterCount: number
  hasVideo: boolean
  videoUrl?: string
  videoPlatform?: string
  videoThumbnail?: string
  status: string
  createdAt: string
  metadata: any
}

interface DetailedStory {
  id: string
  title: string
  content?: string
  summary?: string
  status: string
  hasVideo: boolean
  videoEmbedCode?: string
  themes: string[]
  createdAt: string
  publishedAt?: string
  metadata: any
}

interface PhotoAsset {
  id: string
  filename: string
  title?: string
  url: string
  description?: string
  createdAt: string
  fileSize: number
  width?: number
  height?: number
  metadata: any
}

interface StorytellerDetail {
  id: string
  fullName: string
  displayName: string
  bio?: string
  avatarUrl?: string
  email?: string
  culturalBackground?: string
  location?: string
  transcripts: DetailedTranscript[]
  stories: DetailedStory[]
  photos: PhotoAsset[]
  stats: {
    totalTranscripts: number
    totalStories: number
    totalVideos: number
    totalPhotos: number
    totalCharacters: number
    draftStories: number
    publishedStories: number
    pendingTranscripts: number
  }
  organizationContext?: {
    id: string
    name: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storytellerId } = await params
    const url = new URL(request.url)
    const organizationId = url.searchParams.get('org')

    console.log('🔍 Fetching storyteller dashboard:', storytellerId, 'Org context:', organizationId)

    // Handle development mode with fake user
    if (process.env.NODE_ENV === 'development' && storytellerId === 'dev-super-admin') {
      console.log('🔧 Development mode: Creating fake dashboard for dev-super-admin')

      const fakeStorytellerDetail: StorytellerDetail = {
        id: 'dev-super-admin',
        fullName: 'Development Super Admin',
        displayName: 'Development Super Admin',
        bio: 'This is a development-only user for testing purposes.',
        avatarUrl: undefined,
        email: 'benjamin@act.place',
        culturalBackground: 'Development',
        location: 'Development Environment',
        transcripts: [],
        stories: [],
        photos: [],
        stats: {
          totalTranscripts: 0,
          totalStories: 0,
          totalVideos: 0,
          totalPhotos: 0,
          totalCharacters: 0,
          draftStories: 0,
          publishedStories: 0,
          pendingTranscripts: 0
        },
        organizationContext: organizationId ? {
          id: organizationId,
          name: 'Development Organization'
        } : undefined
      }

      return NextResponse.json({
        success: true,
        storyteller: fakeStorytellerDetail
      })
    }

    // Get storyteller profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        display_name,
        bio,
        avatar_url,
        email,
        cultural_background,
        location_data
      `)
      .eq('id', storytellerId)
      .single()

    if (profileError || !profile) {
      console.error('❌ Storyteller not found:', profileError?.message)
      return NextResponse.json(
        { success: false, error: 'Storyteller not found' },
        { status: 404 }
      )
    }

    console.log('✅ Storyteller found:', profile.full_name || profile.display_name)

    // Get organisation context if provided
    let organizationContext
    if (organizationId) {
      const { data: org } = await supabase
        .from('organisations')
        .select('id, name')
        .eq('id', organizationId)
        .single()
      
      if (org) {
        organizationContext = org
      }
    }

    // Get detailed transcripts (both with media assets and text-only)
    const { data: transcripts, error: transcriptsError } = await supabase
      .from('transcripts')
      .select(`
        id,
        title,
        transcript_content,
        word_count,
        status,
        created_at,
        created_by,
        metadata,
        media_assets (
          id,
          original_filename,
          cdn_url,
          storage_path,
          file_type,
          title,
          uploader_id
        )
      `)
      .eq('storyteller_id', storytellerId)
      .order('created_at', { ascending: false })

    if (transcriptsError) {
      console.error('❌ Error fetching transcripts:', transcriptsError)
      throw transcriptsError
    }

    // Get photo assets directly uploaded by user (using same query as admin API)
    const { data: photos, error: photosError } = await supabase
      .from('media_assets')
      .select('*')
      .eq('uploader_id', storytellerId)
      .like('file_type', 'image%')
      .order('created_at', { ascending: false })

    if (photosError) {
      console.error('❌ Error fetching photos:', photosError)
      throw photosError
    }

    console.log('📷 Photo assets fetched:', photos?.length || 0, 'photos for user', storytellerId)

    // Get detailed stories (check both storyteller_id and author_id)
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        content,
        summary,
        status,
        video_embed_code,
        themes,
        created_at,
        published_at,
        media_metadata
      `)
      .or(`storyteller_id.eq.${storytellerId},author_id.eq.${storytellerId}`)
      .order('created_at', { ascending: false })

    if (storiesError) {
      console.error('❌ Error fetching stories:', storiesError)
      throw storiesError
    }

    // Process transcripts (both with media and text-only)
    const detailedTranscripts: DetailedTranscript[] = (transcripts || []).map(t => ({
      id: t.id,
      title: t.title || t.media_assets?.title || t.media_assets?.original_filename || 'Untitled Transcript',
      content: t.transcript_content || '',
      wordCount: t.word_count || 0,
      characterCount: (t.transcript_content || '').length,
      hasVideo: t.media_assets?.file_type?.startsWith('video') || false,
      videoUrl: t.media_assets?.file_type?.startsWith('video') ? (t.media_assets.cdn_url || t.media_assets.storage_path) : undefined,
      videoPlatform: t.media_assets?.file_type?.startsWith('video') ? 'uploaded' : undefined,
      videoThumbnail: undefined,
      status: t.status || 'pending',
      createdAt: t.created_at,
      metadata: t.metadata || {}
    }))

    // Process stories
    const detailedStories: DetailedStory[] = (stories || []).map(s => ({
      id: s.id,
      title: s.title || 'Untitled Story',
      content: s.content,
      summary: s.summary,
      status: s.status || 'draft',
      hasVideo: !!s.video_embed_code,
      videoEmbedCode: s.video_embed_code,
      themes: s.themes || [],
      createdAt: s.created_at,
      publishedAt: s.published_at,
      metadata: s.media_metadata || {}
    }))

    // Process photos with proper URL generation
    const photoAssets: PhotoAsset[] = (photos || []).map(p => {
      let photoUrl = ''
      
      // Try CDN URL first
      if (p.cdn_url) {
        photoUrl = p.cdn_url
      } 
      // If no CDN URL, construct Supabase storage URL from storage_path
      else if (p.storage_path) {
        // Remove leading slash if present and construct full Supabase storage URL
        const cleanPath = p.storage_path.startsWith('/') ? p.storage_path.slice(1) : p.storage_path
        photoUrl = `${supabaseUrl}/storage/v1/object/public/media/${cleanPath}`
      }
      
      return {
        id: p.id,
        filename: p.original_filename || p.title || `photo-${p.id}`,
        title: p.title || p.original_filename || 'Untitled Photo',
        url: photoUrl,
        description: p.description,
        createdAt: p.created_at,
        fileSize: p.file_size || 0,
        width: p.width,
        height: p.height,
        metadata: p.metadata || {}
      }
    })

    // Calculate stats
    const stats = {
      totalTranscripts: detailedTranscripts.length,
      totalStories: detailedStories.length,
      totalVideos: detailedTranscripts.filter(t => t.hasVideo).length + detailedStories.filter(s => s.hasVideo).length,
      totalPhotos: photoAssets.length,
      totalCharacters: detailedTranscripts.reduce((sum, t) => sum + t.characterCount, 0),
      draftStories: detailedStories.filter(s => s.status === 'draft').length,
      publishedStories: detailedStories.filter(s => s.status === 'published').length,
      pendingTranscripts: detailedTranscripts.filter(t => t.status === 'pending').length
    }

    const storytellerDetail: StorytellerDetail = {
      id: profile.id,
      fullName: profile.full_name || '',
      displayName: profile.display_name || '',
      bio: profile.bio,
      avatarUrl: profile.avatar_url,
      email: profile.email,
      culturalBackground: profile.cultural_background,
      location: profile.location_data?.city || profile.location_data?.country,
      transcripts: detailedTranscripts,
      stories: detailedStories,
      photos: photoAssets,
      stats,
      organizationContext
    }

    console.log('✅ Storyteller dashboard data prepared:', {
      transcripts: stats.totalTranscripts,
      stories: stats.totalStories,
      videos: stats.totalVideos,
      photos: stats.totalPhotos
    })
    // Force recompile - updated for photo access

    return NextResponse.json({
      success: true,
      storyteller: storytellerDetail
    })

  } catch (error) {
    console.error('❌ Error in storyteller dashboard API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch storyteller dashboard',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
