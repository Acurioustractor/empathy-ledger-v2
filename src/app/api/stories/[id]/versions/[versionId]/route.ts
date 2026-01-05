import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const { id, versionId } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get specific version
    const { data: version, error: fetchError } = await supabase
      .from('story_versions')
      .select(`
        *,
        created_by:storytellers!created_by (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('id', versionId)
      .eq('story_id', id)
      .single()

    if (fetchError || !version) {
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ version })
  } catch (error) {
    console.error('Error in GET /api/stories/[id]/versions/[versionId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
