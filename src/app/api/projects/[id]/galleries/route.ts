import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: projectId } = params
    const supabase = createSupabaseServerClient()

    const { data: galleries, error } = await supabase
      .from('photo_galleries')
      .select(`
        id,
        title,
        description,
        created_at,
        organisation:organisations(id, name)
      `)
      .eq('project_id', projectId)

    if (error) {
      console.error('Error fetching project galleries:', error)
      return NextResponse.json({ error: 'Failed to fetch galleries' }, { status: 500 })
    }

    const galleriesWithCounts = await Promise.all(
      (galleries || []).map(async (gallery) => {
        // Use gallery_media_associations to get actual photo count (matches organisation galleries API)
        const { count: photoCount } = await supabase
          .from('gallery_media_associations')
          .select('*', { count: 'exact', head: true })
          .eq('gallery_id', gallery.id)

        return {
          id: gallery.id,
          title: gallery.title,
          photoCount: photoCount || 0,
          organisation: gallery.organisation
        }
      })
    )

    return NextResponse.json({ galleries: galleriesWithCounts })

  } catch (error) {
    console.error('Project galleries API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}