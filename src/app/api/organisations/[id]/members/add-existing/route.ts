// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'



export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    const { storytellerId } = await request.json()
    
    if (!organizationId || !storytellerId) {
      return NextResponse.json(
        { error: 'Organization ID and storyteller ID are required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    // Get organisation to find tenant_id
    const { data: organisation } = await supabase
      .from('organizations')
      .select('tenant_id, name')
      .eq('id', organizationId)
      .single()

    if (!organisation) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Get the storyteller profile
    const { data: storyteller } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', storytellerId)
      .single()

    if (!storyteller) {
      return NextResponse.json(
        { error: 'Storyteller not found' },
        { status: 404 }
      )
    }

    // Use service role client to bypass RLS for updating tenant
    const { createClient } = await import('@supabase/supabase-js')
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Update the storyteller's tenant_id to add them to the organisation
    const { data: updatedMember, error } = await serviceSupabase
      .from('profiles')
      .update({
        tenant_id: organisation.tenant_id,
        tenant_roles: [...(storyteller.tenant_roles || []), 'member']
      })
      .eq('id', storytellerId)
      .select()
      .single()

    if (error) {
      console.error('Error adding storyteller to organisation:', error)
      return NextResponse.json(
        { error: 'Failed to add storyteller to organisation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      member: updatedMember,
      message: `${storyteller.display_name || storyteller.full_name} added to ${organisation.name}`
    })

  } catch (error) {
    console.error('Error in add existing storyteller:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}