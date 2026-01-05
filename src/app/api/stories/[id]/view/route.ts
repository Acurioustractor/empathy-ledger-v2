import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createSupabaseServerClient()

    const { data: { user } } = await supabase.auth.getUser()
    const viewerIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    await supabase
      .from('story_views')
      .insert({
        story_id: id,
        viewer_id: user?.id || null,
        viewer_ip: viewerIp,
        viewing_at: new Date().toISOString()
      })

    await supabase.rpc('increment_story_views', { story_id: id })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error tracking view:', error)
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 })
  }
}
