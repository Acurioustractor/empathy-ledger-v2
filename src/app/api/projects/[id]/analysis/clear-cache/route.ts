import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params

    // Use service role client to delete cache
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: deleteError } = await supabaseAdmin
      .from('project_analyses')
      .delete()
      .eq('project_id', projectId)

    if (deleteError) {
      console.error('Failed to clear cache:', deleteError)
      return NextResponse.json(
        { error: 'Failed to clear analysis cache' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Analysis cache cleared successfully'
    })
  } catch (error: any) {
    console.error('Error clearing cache:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
