// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/client-ssr'

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
    const projectId = searchParams.get('project_id')
    const uploaderSearch = searchParams.get('uploader')
    const search = searchParams.get('search')

    const supabase = createSupabaseServerClient()

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

    // Filter by organization
    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    // Filter by project
    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    // Search by title/filename
    if (search) {
      query = query.or(`title.ilike.%${search}%,original_filename.ilike.%${search}%`)
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
    // Force recompilation - timestamp: 2025-09-25T07:50:00 - FIXED CONSTRAINT VALUE
    // Development mode bypass
    const isDevelopmentMode = process.env.NODE_ENV === 'development'

    if (!isDevelopmentMode) {
      return NextResponse.json({ error: 'Media upload only available in development' }, { status: 403 })
    }

    console.log('🔧 Development mode: Media upload enabled - FIXED VERSION')

    // Use service client for development uploads
    const supabase = createSupabaseServiceClient()

    // Use development user fallback
    const uploadUser = { id: 'd0a162d2-282e-4653-9d12-aa934c9dfa4e' }

    const formData = await request.formData()

    console.log('📤 Media upload request:', {
      isDevelopmentMode,
      uploadUserId: uploadUser.id,
      fileName: (formData.get('file') as File)?.name || 'no-file'
    })
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const culturalContext = formData.get('cultural_context') as string
    const culturalSensitivity = (formData.get('cultural_sensitivity_level') as string) || 'standard'
    const visibility = (formData.get('visibility') as string) || 'private'
    const organizationId = formData.get('organization_id') as string
    const tags = formData.get('tags') as string
    const altText = formData.get('alt_text') as string

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
    const filename = `${uploadUser.id}/${timestamp}_${sanitizedName}`
    const storageBucket = 'media'

    // Upload to Supabase Storage using service client
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

    // Prepare minimal media asset data based on actual database schema
    const assetData: any = {
      tenant_id: organizationId || '5f1314c1-ffe9-4d8f-944b-6cdf02d4b943', // Use provided org or fallback
      original_filename: file.name,
      file_type: fileTypeCategory,
      file_size: file.size,
      storage_bucket: storageBucket,
      storage_path: filename,
      cdn_url: publicUrl,
      uploader_id: uploadUser.id,
      title: title || file.name,
      description: description || '',
      // cultural_sensitivity_level: Let database use its default value to avoid constraint conflicts
      privacy_level: visibility,
      organization_id: organizationId || null,
      processing_status: 'pending'
    }

    // Basic setup for development

    // Create media asset record using service client
    const { data: asset, error } = await supabase
      .from('media_assets')
      .insert(assetData)
      .select('*')
      .single()

    if (error) {
      console.error('Error creating media asset:', error)
      console.error('Asset data was:', JSON.stringify(assetData, null, 2))

      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from(storageBucket)
        .remove([filename])

      return NextResponse.json({ error: 'Failed to create media asset record' }, { status: 500 })
    }

    return NextResponse.json({
      asset,
      mediaId: asset.id, // Add mediaId for compatibility with frontend
      success: true
    }, { status: 201 })
  } catch (error) {
    console.error('Error in media upload:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}