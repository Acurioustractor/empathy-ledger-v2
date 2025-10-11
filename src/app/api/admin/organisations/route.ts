import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Get all organizations with basic stats
    const { data: organisations, error } = await supabase
      .from('organizations')
      .select(`
        id,
        name,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching organisations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch organisations' },
        { status: 500 }
      )
    }

    // Calculate stats for each organisation using tenant_id relationships
    const orgsWithStats = await Promise.all(
      (organisations || []).map(async (org) => {
        try {
          // Count members in this organization
          const { count: memberCount } = await supabase
            .from('organization_members')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', org.id)

          // Count stories in this organization
          const { count: storyCount } = await supabase
            .from('stories')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', org.id)

          const { count: projectCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', org.id)

          return {
            ...org,
            member_count: memberCount || 0,
            story_count: storyCount || 0,
            project_count: projectCount || 0
          }
        } catch (error) {
          console.error(`💥 Error calculating stats for ${org.name}:`, error)
          return {
            ...org,
            member_count: 0,
            story_count: 0,
            project_count: 0
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      organisations: orgsWithStats
    })

  } catch (error) {
    console.error('Error in admin organisations endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createSupabaseServerClient()

    // Generate slug for the organisation
    const slug = body.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '')

    const { data: organisation, error } = await supabase
      .from('organizations')
      .insert({
        name: body.name
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating organisation:', error)
      return NextResponse.json(
        { error: 'Failed to create organisation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      organisation
    })

  } catch (error) {
    console.error('Error in admin organisation creation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}