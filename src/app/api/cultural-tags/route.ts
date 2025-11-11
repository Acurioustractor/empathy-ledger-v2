// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

import type { CulturalTagInsert } from '@/types/database'



export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const sensitivity = searchParams.get('sensitivity')
    const parentId = searchParams.get('parent_id')
    const includeUsage = searchParams.get('include_usage') === 'true'
    
    const supabase = createSupabaseServerClient()
    
    // Get current user for permission checks
    const { data: { user } } = await supabase.auth.getUser()
    
    let query = supabase
      .from('cultural_tags')
      .select('*')
      .order('name', { ascending: true })

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }
    
    if (sensitivity) {
      query = query.eq('cultural_sensitivity_level', sensitivity)
    }
    
    if (parentId) {
      query = query.eq('parent_tag_id', parentId)
    }

    const { data: tags, error } = await query

    if (error) {
      console.error('Error fetching cultural tags:', error)
      return NextResponse.json({ error: 'Failed to fetch cultural tags' }, { status: 500 })
    }

    // Filter tags based on access restrictions and user permissions
    const filteredTags = tags?.filter(tag => {
      // Check if tag requires elder approval and user permissions
      if (tag.requires_elder_approval && !user) {
        return false
      }

      // High sensitivity tags might have additional restrictions
      if (tag.cultural_sensitivity_level === 'high') {
        // Add additional permission checks here if needed
        // For now, allow if user is authenticated
        if (!user) return false
      }

      return true
    }) || []

    // Group by category if requested
    if (includeUsage) {
      const grouped = filteredTags.reduce((acc, tag) => {
        if (!acc[tag.category]) {
          acc[tag.category] = []
        }
        acc[tag.category].push(tag)
        return acc
      }, {} as Record<string, typeof filteredTags>)

      return NextResponse.json({ 
        tags: filteredTags, 
        categorised: grouped,
        categories: Object.keys(grouped)
      })
    }

    return NextResponse.json({ tags: filteredTags })
  } catch (error) {
    console.error('Error in cultural tags API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user has permissions to create cultural tags
    // This should typically be restricted to elders or cultural administrators
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_elder, cultural_permissions')
      .eq('id', user.id)
      .single()

    if (!profile?.is_elder) {
      // Additional permission checks could be added here
      // For now, we'll allow authenticated users but log for review
      console.log(`Non-elder user ${user.id} attempting to create cultural tag`)
    }

    const body = await request.json()
    const { 
      name, 
      slug,
      description, 
      category,
      cultural_sensitivity_level,
      requires_elder_approval,
      access_restrictions,
      parent_tag_id,
      traditional_name,
      cultural_protocols,
      appropriate_contexts
    } = body

    if (!name || !slug || !category) {
      return NextResponse.json({ 
        error: 'Name, slug, and category are required' 
      }, { status: 400 })
    }

    // Check if slug is unique
    const { data: existingTag } = await supabase
      .from('cultural_tags')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingTag) {
      return NextResponse.json({ 
        error: 'A tag with this slug already exists' 
      }, { status: 400 })
    }

    // Build tag hierarchy if parent exists
    let tagHierarchy: string[] = [name]
    if (parent_tag_id) {
      const { data: parentTag } = await supabase
        .from('cultural_tags')
        .select('name, tag_hierarchy')
        .eq('id', parent_tag_id)
        .single()
      
      if (parentTag) {
        tagHierarchy = [...(parentTag.tag_hierarchy || []), name]
      }
    }

    const tagData: CulturalTagInsert = {
      name,
      slug,
      description,
      category,
      cultural_sensitivity_level: cultural_sensitivity_level || 'low',
      requires_elder_approval: requires_elder_approval || false,
      access_restrictions: access_restrictions || {},
      parent_tag_id,
      tag_hierarchy: tagHierarchy,
      traditional_name,
      cultural_protocols,
      appropriate_contexts
    }

    const { data: tag, error } = await supabase
      .from('cultural_tags')
      .insert(tagData)
      .select()
      .single()

    if (error) {
      console.error('Error creating cultural tag:', error)
      return NextResponse.json({ error: 'Failed to create cultural tag' }, { status: 500 })
    }

    return NextResponse.json({ tag }, { status: 201 })
  } catch (error) {
    console.error('Error in cultural tag creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}