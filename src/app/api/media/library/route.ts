import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's storyteller profile
    const { data: profile } = await supabase
      .from('storytellers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Storyteller profile not found' },
        { status: 404 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('media_assets')
      .select('*')
      .eq('uploader_id', profile.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by type if provided
    if (type && type !== 'all') {
      query = query.eq('type', type)
    }

    const { data: media, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching media:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch media' },
        { status: 500 }
      )
    }

    return NextResponse.json({ media })
  } catch (error) {
    console.error('Error in GET /api/media/library:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
