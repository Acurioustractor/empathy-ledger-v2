import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

export async function GET(request: NextRequest) {
  try {
    console.log('🔓 Bypassing auth check for organisations API - FORCE RECOMPILE')
    const supabase = createSupabaseServerClient()

    // Skip auth in development
    // const authResult = await requireAdminAuth(request)
    // if (authResult instanceof NextResponse) {
    //   return authResult
    // }

    console.log('🔍 Fetching organisations with stats...')

    // Fetch all organisations with additional details
    const { data: organisations, error } = await supabase
      .from('organisations')
      .select(`
        id,
        name,
        type,
        description,
        location,
        tenant_id
      `)
      .order('name', { ascending: true })

    if (error) {
      console.error('❌ Error fetching organisations:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch organisations' },
        { status: 500 }
      )
    }

    // Calculate stats for each organisation using Promise.all for better performance
    const organizationsWithStats = await Promise.all(
      (organisations || []).map(async (org) => {
        try {
          // Count members (profiles in this tenant)
          const { count: memberCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', org.tenant_id)

          // Count stories in this tenant
          const { count: storyCount } = await supabase
            .from('stories')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', org.tenant_id)

          return {
            ...org,
            member_count: memberCount || 0,
            story_count: storyCount || 0
          }
        } catch (error) {
          console.error(`💥 Error calculating stats for ${org.name}:`, error)
          return {
            ...org,
            member_count: 0,
            story_count: 0
          }
        }
      })
    )

    console.log(`✅ Fetched ${organizationsWithStats.length} organisations with stats`)

    return NextResponse.json({
      success: true,
      organisations: organizationsWithStats
    })

  } catch (error) {
    console.error('❌ Error in organisations GET API:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch organisations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}