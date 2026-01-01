// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'



export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createSupabaseServerClient()
    const { id: projectId } = await params
    
    console.log('Getting media for project:', projectId)

    // Get project details first to verify access
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, tenant_id, organization_id')
      .eq('id', projectId)
      .single()

    if (projectError) {
      console.error('Project not found:', projectError)
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get all media assets associated with this project
    const { data: mediaAssets, error: mediaError } = await supabase
      .from('media_assets')
      .select(`
        id,
        display_name,
        original_filename,
        file_type,
        file_size,
        cdn_url,
        thumbnail_url,
        medium_url,
        description,
        alt_text,
        width,
        height,
        uploaded_at,
        uploader_id,
        cultural_sensitivity_level,
        privacy_level
      `)
      .eq('project_id', projectId)
      .order('uploaded_at', { ascending: false })

    if (mediaError) {
      console.error('Error fetching media assets:', mediaError)
      return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
    }

    // Transform data for frontend
    const media = (mediaAssets || []).map(asset => ({
      id: asset.id,
      name: asset.display_name || asset.original_filename,
      filename: asset.original_filename,
      type: asset.file_type,
      size: asset.file_size,
      url: asset.cdn_url,
      thumbnail: asset.thumbnail_url,
      medium: asset.medium_url,
      description: asset.description,
      altText: asset.alt_text,
      dimensions: asset.width && asset.height ? { width: asset.width, height: asset.height } : null,
      uploadedAt: asset.uploaded_at,
      uploaderId: asset.uploader_id,
      culturalSensitivity: asset.cultural_sensitivity_level || 'standard',
      privacy: asset.privacy_level || 'organisation'
    }))

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        tenantId: project.tenant_id,
        organizationId: project.organization_id
      },
      media,
      total: media.length,
      stats: {
        totalFiles: media.length,
        totalSize: media.reduce((sum, m) => sum + (m.size || 0), 0),
        images: media.filter(m => m.type?.startsWith('image/')).length,
        videos: media.filter(m => m.type?.startsWith('video/')).length,
        audio: media.filter(m => m.type?.startsWith('audio/')).length,
        documents: media.filter(m => !m.type?.match(/^(image|video|audio)\//)).length
      }
    })

  } catch (error) {
    console.error('Project media API error:', error)
    return NextResponse.json({ error: 'Failed to fetch project media' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createSupabaseServerClient()
    const { id: projectId } = await params
    
    console.log('Uploading media to project:', projectId)

    // Get project details and verify access
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, tenant_id, organization_id')
      .eq('id', projectId)
      .single()

    if (projectError) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const description = formData.get('description') as string
    const altText = formData.get('altText') as string
    const culturalSensitivity = formData.get('culturalSensitivity') as string || 'standard'
    const privacy = formData.get('privacy') as string || 'organisation'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type and size
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 })
    }

    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/avif',
      'video/mp4', 'video/webm', 'video/quicktime',
      'audio/mp3', 'audio/wav', 'audio/ogg',
      'application/pdf', 'text/plain'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `projects/${projectId}/media/${timestamp}_${sanitizedName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(storagePath)

    // Create media asset record
    const { data: mediaAsset, error: mediaError } = await supabase
      .from('media_assets')
      .insert({
        cdn_url: publicUrl
      } as any)
      .select()
      .single()

    if (mediaError) {
      console.error('Error creating media asset record:', mediaError)
      // Clean up uploaded file
      await supabase.storage.from('media').remove([storagePath])
      return NextResponse.json({ error: 'Failed to save media record' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Media uploaded successfully',
      media: {
        id: mediaAsset.id,
        name: mediaAsset.display_name,
        filename: mediaAsset.original_filename,
        type: mediaAsset.file_type,
        size: mediaAsset.file_size,
        url: mediaAsset.cdn_url,
        description: mediaAsset.description,
        altText: mediaAsset.alt_text
      }
    })

  } catch (error) {
    console.error('Upload media to project error:', error)
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createSupabaseServerClient()
    const { id: projectId } = await params
    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('mediaId')

    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 })
    }

    // Get media asset details
    const { data: mediaAsset, error: fetchError } = await supabase
      .from('media_assets')
      .select('id, storage_path, project_id')
      .eq('id', mediaId)
      .eq('project_id', projectId)
      .single()

    if (fetchError || !mediaAsset) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // Delete from storage
    if (mediaAsset.storage_path) {
      await supabase.storage
        .from('media')
        .remove([mediaAsset.storage_path])
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('media_assets')
      .delete()
      .eq('id', mediaId)

    if (deleteError) {
      console.error('Error deleting media asset:', deleteError)
      return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Media deleted successfully' })

  } catch (error) {
    console.error('Delete project media error:', error)
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 })
  }
}