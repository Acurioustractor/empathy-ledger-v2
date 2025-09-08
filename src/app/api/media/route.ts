import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import type { MediaAssetInsert } from '@/types/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const fileType = searchParams.get('file_type')
    const culturalSensitivity = searchParams.get('cultural_sensitivity')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const organizationId = searchParams.get('organization_id')
    const uploaderSearch = searchParams.get('uploader')
    
    const supabase = await createSupabaseServerClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    let query = supabase
      .from('media_assets')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply content filters that exist in our minimal schema
    if (fileType) {
      query = query.eq('file_type', fileType)
    }
    
    if (culturalSensitivity) {
      query = query.eq('cultural_sensitivity_level', culturalSensitivity)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: assets, error } = await query

    if (error) {
      console.error('Error fetching media assets:', error)
      return NextResponse.json({ error: 'Failed to fetch media assets' }, { status: 500 })
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from('media_assets')
      .select('*', { count: 'exact', head: true })
      .eq('processing_status', 'completed')

    return NextResponse.json({
      assets: assets || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error in media assets API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const culturalContext = formData.get('cultural_context') as string
    const culturalSensitivity = formData.get('cultural_sensitivity_level') as string
    const ceremonialContent = formData.get('ceremonial_content') === 'true'
    const traditionalKnowledge = formData.get('traditional_knowledge') === 'true'
    const visibility = formData.get('visibility') as string
    const organizationId = formData.get('organization_id') as string
    const tags = formData.get('tags') as string
    const altText = formData.get('alt_text') as string
    const captureDate = formData.get('capture_date') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Unsupported file type. Please upload JPEG, PNG, WebP, GIF, MP4, or WebM files.' 
      }, { status: 400 })
    }

    // Generate unique filename using timestamp and user ID (more predictable than Math.random)
    const fileExtension = file.name.split('.').pop()
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${user.id}/${timestamp}_${sanitizedName}`
    const storageBucket = 'media-assets'

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(storageBucket)
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(storageBucket)
      .getPublicUrl(filename)

    // Parse tags
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : []

    // Determine file type category
    let fileTypeCategory = 'image'
    if (file.type.startsWith('video/')) {
      fileTypeCategory = 'video'
    } else if (file.type.startsWith('audio/')) {
      fileTypeCategory = 'audio'
    }

    // Prepare media asset data
    const assetData: MediaAssetInsert = {
      filename,
      original_filename: file.name,
      file_type: fileTypeCategory,
      mime_type: file.type,
      file_size: file.size,
      storage_bucket: storageBucket,
      storage_path: filename,
      public_url: publicUrl,
      uploaded_by: user.id,
      title: title || file.name,
      description,
      alt_text: altText,
      cultural_context: culturalContext ? JSON.parse(culturalContext) : {},
      cultural_sensitivity_level: culturalSensitivity as any || 'medium',
      ceremonial_content,
      traditional_knowledge: traditionalKnowledge,
      visibility: visibility as any || 'private',
      tags: parsedTags,
      organization_id: organizationId || null,
      capture_date,
      processing_status: 'completed'
    }

    // Set consent requirements based on cultural sensitivity
    if (culturalSensitivity === 'high' || ceremonialContent || traditionalKnowledge) {
      assetData.consent_status = 'pending'
      assetData.cultural_review_status = 'pending'
    } else {
      assetData.consent_status = 'granted'
    }

    // Create media asset record
    const { data: asset, error } = await supabase
      .from('media_assets')
      .insert(assetData)
      .select(`
        *,
        uploaded_by_profile:profiles!media_assets_uploaded_by_fkey(
          id,
          display_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('Error creating media asset:', error)
      
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from(storageBucket)
        .remove([filename])
        
      return NextResponse.json({ error: 'Failed to create media asset record' }, { status: 500 })
    }

    return NextResponse.json({ asset }, { status: 201 })
  } catch (error) {
    console.error('Error in media upload:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}