// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { requireSuperAdminAuth } from '@/lib/middleware/admin-auth'

import { createServiceRoleClient } from '@/lib/supabase/service-role-client'



export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  // Require super admin authentication
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const supabase = createServiceRoleClient()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const language = searchParams.get('language') || ''

    console.log(`📝 Fetching transcripts for organization: ${params.orgId}`)

    // Get organization details
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, slug, tenant_id')
      .eq('id', params.orgId)
      .single()

    if (orgError || !organization) {
      console.error('❌ Organization not found:', params.orgId, orgError)
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Get all storyteller IDs for this organization's tenant
    const { data: storytellers, error: storytellersError } = await supabase
      .from('profiles')
      .select('id, tenant_roles, display_name')
      .eq('tenant_id', organization.tenant_id)

    console.log(`🔍 Found ${storytellers?.length || 0} profiles for tenant ${organization.tenant_id}`)

    // Filter to only those with storyteller role
    const storytellerProfiles = (storytellers || []).filter(p =>
      p.tenant_roles && Array.isArray(p.tenant_roles) && p.tenant_roles.includes('storyteller')
    )

    console.log(`📊 Filtered to ${storytellerProfiles.length} storytellers:`, storytellerProfiles.map(s => s.display_name))

    const storytellerIds = storytellerProfiles.map(s => s.id)

    if (storytellerIds.length === 0) {
      // No storytellers = no transcripts
      console.log(`⚠️ No storytellers found for ${organization.name}`)
      return NextResponse.json({
        transcripts: [],
        organizationName: organization.name,
        organizationId: organization.id,
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      })
    }

    // Build query filtering by storyteller IDs (since transcripts don't have organization_id)
    let query = supabase
      .from('transcripts')
      .select(`
        *,
        profiles!storyteller_id(
          display_name,
          email
        )
      `, { count: 'exact' })
      .in('storyteller_id', storytellerIds) // 🔒 CRITICAL: Filter by organization's storytellers

    // Apply additional filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,transcript_content.ilike.%${search}%`)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (language) {
      query = query.eq('language', language)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query
      .range(from, to)
      .order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      console.error('❌ Error fetching organization transcripts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch transcripts' },
        { status: 500 }
      )
    }

    // Transform the data to match the expected format
    const transcripts = (data || []).map((transcript: any) => {
      // Calculate word count from transcript text
      const textContent = transcript.transcript_content || transcript.text || ''
      const wordCount = textContent
        ? textContent.split(/\s+/).filter((word: string) => word.length > 0).length
        : 0

      return {
        id: transcript.id,
        title: transcript.title,
        storyteller_name: transcript.profiles?.display_name ||
                         transcript.profiles?.email ||
                         (transcript.storyteller_id ? `Profile ID: ${transcript.storyteller_id}` : 'No Storyteller ID'),
        storyteller_id: transcript.storyteller_id,
        status: transcript.status || 'pending',
        duration: transcript.duration_seconds || transcript.duration || 0,
        file_size: transcript.file_size || 0,
        word_count: wordCount,
        language: transcript.language || 'en',
        location: transcript.location || null,
        created_at: transcript.created_at,
        updated_at: transcript.updated_at,
        has_story: false,
        project_name: null,
        organization_id: transcript.organization_id
      }
    })

    console.log(`✅ Found ${transcripts.length} transcripts for ${organization.name} (total: ${count})`)

    return NextResponse.json({
      transcripts,
      organizationName: organization.name,
      organizationId: organization.id,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('❌ Unexpected error fetching organization transcripts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
