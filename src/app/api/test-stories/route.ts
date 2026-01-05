import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Missing environment variables', supabaseUrl: !!supabaseUrl, serviceKey: !!serviceKey }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    const { data, error, count } = await supabase
      .from('stories')
      .select('id, title, status, is_public', { count: 'exact' })
      .eq('status', 'published')
      .eq('is_public', true)
      .limit(2)

    if (error) {
      return NextResponse.json({ error: 'Query failed', details: error }, { status: 500 })
    }

    return NextResponse.json({ success: true, count, stories: data })
  } catch (error: any) {
    return NextResponse.json({ error: 'Exception', message: error.message }, { status: 500 })
  }
}
