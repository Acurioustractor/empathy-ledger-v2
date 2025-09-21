import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storytellerId } = await params
    const supabase = createSupabaseServerClient()

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, display_name, bio, summary')
      .eq('id', storytellerId)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        display_name: profile.display_name,
        bio: profile.bio,
        summary: profile.summary || ''
      }
    })

  } catch (error) {
    console.error('Error fetching profile summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile summary' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storytellerId } = await params
    const { summary } = await request.json()

    if (!summary || typeof summary !== 'string') {
      return NextResponse.json(
        { error: 'Summary is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    // Update the profile summary
    const { data, error } = await supabase
      .from('profiles')
      .update({
        summary: summary.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', storytellerId)
      .select('id, display_name, summary')
      .single()

    if (error) {
      console.error('Error updating profile summary:', error)
      return NextResponse.json(
        { error: 'Failed to update summary' },
        { status: 500 }
      )
    }

    console.log(`✅ Profile summary updated for ${data.display_name}`)

    return NextResponse.json({
      success: true,
      message: 'Summary updated successfully',
      profile: {
        id: data.id,
        display_name: data.display_name,
        summary: data.summary
      }
    })

  } catch (error) {
    console.error('Error updating profile summary:', error)
    return NextResponse.json(
      { error: 'Failed to update summary' },
      { status: 500 }
    )
  }
}