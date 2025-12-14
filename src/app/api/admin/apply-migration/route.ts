import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/apply-migration
 *
 * Applies database migrations using the service role key.
 * This endpoint should be protected and only used by admins.
 */
export async function POST(request: NextRequest) {
  try {
    // Check for secret key in header for security
    const authHeader = request.headers.get('x-admin-key')
    if (authHeader !== process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    })

    const results: { statement: string; success: boolean; error?: string }[] = []

    // Check current columns
    const { data: columns, error: colError } = await supabase
      .from('transcripts')
      .select('*')
      .limit(0)

    if (colError) {
      console.log('Table check error (might be permissions):', colError)
    }

    // The migrations will be applied via direct SQL in Supabase dashboard
    // For now, let's just verify the table structure

    // Try to query to see what columns exist
    const { data: sample, error: sampleError } = await supabase
      .from('transcripts')
      .select('id, storyteller_id, title, status')
      .limit(1)

    return NextResponse.json({
      message: 'Migration check complete',
      tableAccessible: !sampleError,
      sampleError: sampleError?.message,
      note: 'Please apply the migration SQL in the Supabase dashboard SQL editor',
      migrationFile: 'supabase/migrations/20251213_transcripts_story_id.sql'
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
