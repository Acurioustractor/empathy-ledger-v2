import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { platform } = await request.json()
    const supabase = await createSupabaseServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    await supabase
      .from('story_shares')
      .insert({
        story_id: id,
        sharer_id: user?.id || null,
        platform,
        shared_at: new Date().toISOString()
      })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error tracking share:', error)
    return NextResponse.json({ error: 'Failed to track share' }, { status: 500 })
  }
}
