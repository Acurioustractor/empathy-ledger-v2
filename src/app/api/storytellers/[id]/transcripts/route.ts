// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient, createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { getAuthenticatedUser, canAccessStoryteller, isSuperAdmin } from '@/lib/auth/api-auth'

export async function GET(
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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    // Use service client for admins to avoid RLS recursion issues
    const supabase = isSuperAdmin(user.email)
      ? createSupabaseServiceClient()
      : await createSupabaseServerClient()

    // Simple query with just essential fields that we know exist
    const query = supabase
      .from('transcripts')
      .select(`
        id,
        title,
        word_count,
        duration,
        created_at,
        updated_at,
        status
      `)
      .eq('storyteller_id', storytellerId)
      .order('created_at', { ascending: false })

    if (limit > 0) {
      query.limit(limit)
    }

    if (page > 1) {
      query.range((page - 1) * limit, page * limit - 1)
    }

    const { data: transcripts, error } = await query

    if (error) {
      console.error('Error fetching storyteller transcripts:', error)
      return NextResponse.json({ error: 'Failed to fetch transcripts' }, { status: 500 })
    }

    return NextResponse.json({
      transcripts: transcripts || [],
      total: transcripts?.length || 0,
      page,
      limit
    })

  } catch (error) {
    console.error('Error in storyteller transcripts API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
