import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params

    // First get the organisation to get tenant_id
    const { data: organisation, error: orgError } = await supabase
      .from('organisations')
      .select('tenant_id')
      .eq('id', organizationId)
      .single()

    if (orgError || !organisation) {
      console.error('❌ Error fetching organisation:', orgError)
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      )
    }

    const tenantId = organisation.tenant_id

    // Get organisation members count (using profiles with matching tenant_id)
    const { count: membersCount, error: membersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)

    if (membersError) {
      console.error('❌ Error counting members:', membersError)
    }

    // Get stories count by tenant_id
    const { count: storiesCount, error: storiesError } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)

    if (storiesError) {
      console.error('❌ Error counting stories:', storiesError)
    }

    // Get photos count from media_assets (using tenant_id)
    const { count: photosCount, error: photosError } = await supabase
      .from('media_assets')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)

    if (photosError) {
      console.error('❌ Error counting photos:', photosError)
    }

    // Get projects count for this organisation specifically
    const { count: projectsCount, error: projectsError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)

    if (projectsError) {
      console.error('❌ Error counting projects:', projectsError)
    }

    // Get photo galleries count (using tenant_id)
    const { count: galleriesCount, error: galleriesError } = await supabase
      .from('photo_galleries')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)

    if (galleriesError) {
      console.error('❌ Error counting galleries:', galleriesError)
    }

    const stats = {
      members: membersCount || 0,
      stories: storiesCount || 0,
      photos: photosCount || 0,
      projects: projectsCount || 0,
      galleries: galleriesCount || 0
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('❌ Error in organisation stats API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch organisation stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}