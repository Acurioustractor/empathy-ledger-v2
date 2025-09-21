import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    const supabase = createSupabaseServerClient()

    // Get all projects for this organisation
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name, description, status')
      .eq('organization_id', organizationId)
      .order('name')

    if (error) {
      console.error('Error fetching organisation projects:', error)
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    return NextResponse.json(projects || [])
  } catch (error) {
    console.error('Error in organisation projects route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}