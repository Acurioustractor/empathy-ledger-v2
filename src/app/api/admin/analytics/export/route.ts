import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '30d'

    // Calculate date range
    const now = new Date()
    const daysAgo = parseInt(range.replace('d', ''))
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)

    // Fetch basic analytics data
    const { data: users } = await supabase
      .from('profiles')
      .select('*')
      .gte('created_at', startDate.toISOString())

    const { data: stories } = await supabase
      .from('stories')
      .select('*')
      .gte('created_at', startDate.toISOString())

    // Generate CSV
    const csv = [
      'Date,Users,Stories,Projects,Organizations',
      `${now.toISOString()},${users?.length || 0},${stories?.length || 0},0,0`,
    ].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-${range}-${now.toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Analytics export error:', error)
    return NextResponse.json(
      { error: 'Failed to export analytics' },
      { status: 500 }
    )
  }
}
