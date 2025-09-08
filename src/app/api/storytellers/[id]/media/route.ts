import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storytellerId } = await params
    
    if (!storytellerId) {
      return NextResponse.json(
        { error: 'Storyteller ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()

    // Get media files for the storyteller
    const { data: media, error } = await supabase
      .from('media_assets')
      .select(`
        id,
        filename,
        file_type,
        file_size,
        upload_date,
        storyteller_id,
        title,
        description
      `)
      .eq('storyteller_id', storytellerId)
      .order('upload_date', { ascending: false })

    if (error) {
      console.error('Error fetching storyteller media:', error)
      return NextResponse.json(
        { error: 'Failed to fetch media' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      media: media || []
    })

  } catch (error) {
    console.error('Error in storyteller media endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}