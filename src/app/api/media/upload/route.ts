import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export const maxDuration = 300 // 5 minutes for large file uploads

export async function POST(request: NextRequest) {
  try {
    // Extract auth token from headers
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Create a client with the user's auth token to verify identity
    const authClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    })

    // Check authentication with user's token
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create a service client to bypass RLS for admin operations
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const storyId = formData.get('storyId') as string | null
    const title = formData.get('title') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Get user's storyteller profile (or create a default one for development)
    const { data: fetchedProfile, error: profileError } = await supabase
      .from('storytellers')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .maybeSingle()

    // In development, use user ID directly if no storyteller profile exists
    const isDevelopment = process.env.NODE_ENV === 'development'
    let profileId = ''
    let tenantId = ''

    if (fetchedProfile && !profileError) {
      profileId = fetchedProfile.id as string
      tenantId = fetchedProfile.tenant_id as string
      console.log('✅ Found storyteller profile:', { profileId, tenantId })
    } else if (isDevelopment) {
      profileId = user.id
      tenantId = process.env.DEFAULT_TENANT_ID || 'default-tenant'
      console.log('📝 Using development default storyteller profile:', { userId: user.id, tenantId, error: profileError })
    } else {
      console.error('❌ No storyteller profile found:', { userId: user.id, profileError })
      return NextResponse.json(
        { error: 'Storyteller profile not found. Please complete onboarding first.' },
        { status: 404 }
      )
    }

    // Determine media type
    let mediaType: 'image' | 'audio' | 'video' | 'document' = 'document'
    if (file.type.startsWith('image/')) mediaType = 'image'
    else if (file.type.startsWith('audio/')) mediaType = 'audio'
    else if (file.type.startsWith('video/')) mediaType = 'video'

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${tenantId}/${profileId}/${timestamp}-${sanitizedName}`

    // Upload to Supabase Storage
    console.log('📤 Uploading file to storage:', { filePath, fileType: file.type, fileSize: file.size })
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file', details: uploadError.message },
        { status: 500 }
      )
    }

    console.log('✅ File uploaded successfully:', { filePath })

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)

    console.log('🔗 Public URL generated:', { publicUrl })

    // Create media asset record
    console.log('💾 Creating media asset record in database:', { profileId, mediaType })
    const mediaAssetPayload: any = {
      uploaded_by: user.id,  // Use the authenticated user ID, not profile ID
      url: publicUrl,
      file_path: filePath,
      filename: file.name,
      file_size: file.size,
      mime_type: file.type,
      media_type: mediaType,
      status: 'active',
      alt_text: `Image: ${file.name}` // Required for accessibility - images must have alt text
    }

    const { data: mediaAsset, error: dbError } = await supabase
      .from('media_assets')
      .insert(mediaAssetPayload)
      .select('*')
      .maybeSingle()

    if (dbError) {
      console.error('❌ Database error:', dbError)
      // Clean up uploaded file
      await supabase.storage.from('media').remove([filePath])
      return NextResponse.json(
        { error: 'Failed to create media record', details: dbError.message },
        { status: 500 }
      )
    }

    if (!mediaAsset) {
      console.error('❌ No asset returned after insert')
      return NextResponse.json(
        { error: 'Media asset creation succeeded but no data returned' },
        { status: 500 }
      )
    }

    console.log('✅ Media asset created:', { assetId: mediaAsset.id })

    // Link to story if provided
    if (storyId) {
      await supabase.from('story_media').insert({
        story_id: storyId,
        media_asset_id: mediaAsset.id,
        display_order: 0
      })
    }

    // Check if transcription is needed
    const needsTranscription = mediaType === 'audio' || mediaType === 'video'

    return NextResponse.json({
      media: {
        ...mediaAsset,
        needsTranscription
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('💥 Error in POST /api/media/upload:', {
      message: error?.message,
      stack: error?.stack,
      code: error?.code
    })
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    )
  }
}
