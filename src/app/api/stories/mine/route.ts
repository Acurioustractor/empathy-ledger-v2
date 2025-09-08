import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's stories
    const { data: stories, error } = await supabase
      .from('stories')
      .select(`
        *,
        storytellers!inner(
          id,
          full_name,
          display_name,
          avatar_url,
          cultural_background
        )
      `)
      .eq('storytellers.profile_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user stories:', error)
      return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
    }

    return NextResponse.json({ stories })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}