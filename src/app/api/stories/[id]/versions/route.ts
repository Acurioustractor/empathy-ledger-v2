import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get versions with creator info
    const { data: versions, error: fetchError } = await supabase
      .from('story_versions')
      .select(`
        *,
        created_by:storytellers!created_by (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('story_id', id)
      .order('version_number', { ascending: false })

    if (fetchError) {
      console.error('Error fetching versions:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch versions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ versions })
  } catch (error) {
    console.error('Error in GET /api/stories/[id]/versions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
