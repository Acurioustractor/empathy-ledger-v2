/**
 * Tags API - Tag CRUD and Management
 * GET /api/tags - List/search tags
 * POST /api/tags - Create a new tag
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export interface Tag {
  id: string
  name: string
  slug: string
  description?: string
  category: string
  parentTagId?: string
  culturalSensitivityLevel: string
  requiresElderApproval: boolean
  usageCount: number
  createdAt: string
}

// GET - List/search tags
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const url = new URL(request.url)

    // Query parameters
    const search = url.searchParams.get('search')
    const category = url.searchParams.get('category')
    const sensitivity = url.searchParams.get('sensitivity')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200)
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const includeUsageCounts = url.searchParams.get('includeUsageCounts') !== 'false'
    const sortBy = url.searchParams.get('sortBy') || 'usage_count'
    const sortOrder = url.searchParams.get('sortOrder') || 'desc'

    // Build query
    let query = supabase
      .from('tags')
      .select('*', { count: 'exact' })

    // Search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Category filter
    if (category) {
      query = query.eq('category', category)
    }

    // Sensitivity filter
    if (sensitivity) {
      query = query.eq('cultural_sensitivity_level', sensitivity)
    }

    // Sorting
    const ascending = sortOrder === 'asc'
    switch (sortBy) {
      case 'name':
        query = query.order('name', { ascending })
        break
      case 'created_at':
        query = query.order('created_at', { ascending })
        break
      case 'usage_count':
      default:
        query = query.order('usage_count', { ascending: false })
        break
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform to response format
    const tags: Tag[] = (data || []).map((tag: any) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      category: tag.category,
      parentTagId: tag.parent_tag_id,
      culturalSensitivityLevel: tag.cultural_sensitivity_level,
      requiresElderApproval: tag.requires_elder_approval,
      usageCount: tag.usage_count,
      createdAt: tag.created_at
    }))

    // Get category counts for filtering UI
    const { data: categoryCounts } = await supabase
      .from('tags')
      .select('category')

    const categoryBreakdown: Record<string, number> = {}
    for (const row of categoryCounts || []) {
      categoryBreakdown[row.category] = (categoryBreakdown[row.category] || 0) + 1
    }

    return NextResponse.json({
      tags,
      pagination: {
        total: count || tags.length,
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0)
      },
      categories: categoryBreakdown
    })

  } catch (error) {
    console.error('Error in GET /api/tags:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}

// POST - Create a new tag
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const body = await request.json()

    const {
      name,
      description,
      category = 'general',
      parentTagId,
      culturalSensitivityLevel = 'public',
      tenantId
    } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 })
    }

    // Generate slug
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Check if tag already exists
    const { data: existing } = await supabase
      .from('tags')
      .select('id, name')
      .eq('slug', slug)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({
        error: 'Tag already exists',
        existingTag: { id: existing.id, name: existing.name }
      }, { status: 409 })
    }

    // Create the tag
    const { data: newTag, error } = await supabase
      .from('tags')
      .insert({
        name: name.trim(),
        slug,
        description,
        category,
        parent_tag_id: parentTagId,
        cultural_sensitivity_level: culturalSensitivityLevel,
        requires_elder_approval: ['sacred', 'sensitive'].includes(culturalSensitivityLevel),
        tenant_id: tenantId
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      tag: {
        id: newTag.id,
        name: newTag.name,
        slug: newTag.slug,
        description: newTag.description,
        category: newTag.category,
        culturalSensitivityLevel: newTag.cultural_sensitivity_level,
        requiresElderApproval: newTag.requires_elder_approval,
        usageCount: 0,
        createdAt: newTag.created_at
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/tags:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create tag' },
      { status: 500 }
    )
  }
}
