/**
 * DEBUG ENDPOINT - Temporary
 * GET /api/debug/profile?id=<uuid>
 *
 * Tests direct profile lookup with service role
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('🔍 Debug profile lookup:', {
    id,
    hasUrl: !!url,
    hasServiceKey: !!serviceKey
  })

  if (!url || !serviceKey) {
    return NextResponse.json({
      error: 'Missing env vars',
      hasUrl: !!url,
      hasServiceKey: !!serviceKey
    }, { status: 500 })
  }

  const supabase = createClient(url, serviceKey)

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, display_name')
    .eq('id', id)
    .single()

  console.log('📊 Debug profile result:', {
    hasData: !!data,
    error: error?.message,
    code: error?.code
  })

  return NextResponse.json({
    success: !error && !!data,
    profile: data,
    error: error?.message,
    errorCode: error?.code
  })
}
