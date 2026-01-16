// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedUser, canAccessStoryteller } from '@/lib/auth/api-auth'



export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storytellerId } = await params

    // Authentication check
    const { user, error: authError } = await getAuthenticatedUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    // Authorization check
    const { allowed, reason } = await canAccessStoryteller(user.id, user.email, storytellerId)
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: reason || 'Forbidden' },
        { status: 403 }
      )
    }

    console.log('🎥 Updating videos for storyteller:', storytellerId)

    // Service client for update (after auth verification)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse the request body
    const body = await request.json()
    const { video_introduction_url, featured_video_url } = body

    console.log('📝 Video update request:', { video_introduction_url, featured_video_url })

    // Validate the storyteller exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, full_name')
      .eq('id', storytellerId)
      .single()

    if (profileError || !profile) {
      console.error('❌ Storyteller not found:', profileError?.message)
      return NextResponse.json(
        { error: 'Storyteller not found' },
        { status: 404 }
      )
    }

    console.log('✅ Storyteller found:', profile.display_name || profile.full_name)

    // Update the video URLs
    const updateData: any = {}

    // Only update fields that are provided
    if (video_introduction_url !== undefined) {
      updateData.video_introduction_url = video_introduction_url || null
    }
    if (featured_video_url !== undefined) {
      updateData.featured_video_url = featured_video_url || null
    }

    console.log('🔄 Updating profile with data:', updateData)

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', storytellerId)

    if (updateError) {
      console.error('❌ Error updating videos:', updateError)
      return NextResponse.json(
        { error: 'Failed to update video links' },
        { status: 500 }
      )
    }

    console.log('✅ Video links updated successfully for:', profile.display_name || profile.full_name)

    return NextResponse.json({
      success: true,
      message: 'Video links updated successfully'
    })

  } catch (error) {
    console.error('Error in video update API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}