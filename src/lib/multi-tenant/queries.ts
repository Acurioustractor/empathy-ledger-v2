/**
 * Multi-Tenant Query Helpers
 *
 * BEST PRACTICE: Always use these helpers instead of raw Supabase queries
 * They automatically filter by organization_id to prevent data leakage
 *
 * Example:
 *   ❌ BAD:  supabase.from('stories').select('*')
 *   ✅ GOOD: getOrganizationStories(supabase, orgId)
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

type SupabaseClientType = SupabaseClient<Database>

/**
 * Get stories for a specific organization
 * AUTOMATICALLY filters by organization_id
 */
export async function getOrganizationStories(
  supabase: SupabaseClientType,
  organizationId: string,
  options?: {
    status?: string[]
    limit?: number
    offset?: number
    includeRelations?: boolean
  }
) {
  let query = supabase
    .from('stories')
    .select(
      options?.includeRelations
        ? `
          *,
          storyteller:storyteller_id(id, display_name, avatar_url),
          author:author_id(id, display_name),
          organization:organization_id(id, name, slug)
        `
        : '*'
    )
    .eq('organization_id', organizationId) // 🔒 CRITICAL: Organization filter

  if (options?.status) {
    query = query.in('status', options.status)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error, count } = await query

  return { data, error, count }
}

/**
 * Get stories count by status for organization
 */
export async function getOrganizationStoriesByStatus(
  supabase: SupabaseClientType,
  organizationId: string
) {
  const { data, error } = await supabase
    .from('stories')
    .select('status')
    .eq('organization_id', organizationId) // 🔒 CRITICAL: Organization filter

  if (error) {
    return {
      total: 0,
      draft: 0,
      pending: 0,
      review: 0,
      approved: 0,
      published: 0,
      archived: 0
    }
  }

  const counts = {
    total: data.length,
    draft: 0,
    pending: 0,
    review: 0,
    approved: 0,
    published: 0,
    archived: 0
  }

  data.forEach(story => {
    const status = story.status || 'draft'
    if (status in counts) {
      counts[status as keyof typeof counts]++
    }
  })

  return counts
}

/**
 * Get transcripts for organization
 */
export async function getOrganizationTranscripts(
  supabase: SupabaseClientType,
  organizationId: string,
  options?: {
    limit?: number
    offset?: number
  }
) {
  let query = supabase
    .from('transcripts')
    .select('*')
    .eq('organization_id', organizationId) // 🔒 CRITICAL: Organization filter
    .order('created_at', { ascending: false })

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  return await query
}

/**
 * Get blog posts for organization
 */
export async function getOrganizationBlogPosts(
  supabase: SupabaseClientType,
  organizationId: string,
  options?: {
    status?: string[]
    limit?: number
    includeStories?: boolean
  }
) {
  let query = supabase
    .from('blog_posts')
    .select(
      options?.includeStories
        ? `
          *,
          organization:organization_id(id, name, slug)
        `
        : '*'
    )
    .eq('organization_id', organizationId) // 🔒 CRITICAL: Organization filter

  if (options?.status) {
    query = query.in('status', options.status)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  query = query.order('created_at', { ascending: false })

  return await query
}

/**
 * Get organization members
 */
export async function getOrganizationMembers(
  supabase: SupabaseClientType,
  organizationId: string
) {
  return await supabase
    .from('organization_members')
    .select(`
      *,
      profile:profile_id(
        id,
        display_name,
        full_name,
        email,
        avatar_url
      )
    `)
    .eq('organization_id', organizationId) // 🔒 CRITICAL: Organization filter
    .eq('is_active', true)
    .order('joined_at', { ascending: false })
}

/**
 * Get organization projects
 */
export async function getOrganizationProjects(
  supabase: SupabaseClientType,
  organizationId: string,
  options?: {
    status?: string[]
    limit?: number
  }
) {
  let query = supabase
    .from('projects')
    .select('*')
    .eq('organization_id', organizationId) // 🔒 CRITICAL: Organization filter

  if (options?.status) {
    query = query.in('status', options.status)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  query = query.order('created_at', { ascending: false })

  return await query
}

/**
 * Get organization dashboard stats
 * Returns complete overview of organization's content
 */
export async function getOrganizationDashboardStats(
  supabase: SupabaseClientType,
  organizationId: string
) {
  // Run all queries in parallel for performance
  const [
    storiesResult,
    transcriptsResult,
    blogPostsResult,
    membersResult,
    projectsResult
  ] = await Promise.all([
    supabase
      .from('stories')
      .select('id, status', { count: 'exact' })
      .eq('organization_id', organizationId), // 🔒 CRITICAL

    supabase
      .from('transcripts')
      .select('id', { count: 'exact' })
      .eq('organization_id', organizationId), // 🔒 CRITICAL

    supabase
      .from('blog_posts')
      .select('id, status', { count: 'exact' })
      .eq('organization_id', organizationId), // 🔒 CRITICAL

    supabase
      .from('organization_members')
      .select('id', { count: 'exact' })
      .eq('organization_id', organizationId) // 🔒 CRITICAL
      .eq('is_active', true),

    supabase
      .from('projects')
      .select('id, status', { count: 'exact' })
      .eq('organization_id', organizationId) // 🔒 CRITICAL
  ])

  // Calculate story counts by status
  const storyCounts = {
    total: storiesResult.count || 0,
    draft: 0,
    pending: 0,
    review: 0,
    published: 0
  }

  storiesResult.data?.forEach(story => {
    const status = story.status || 'draft'
    if (status === 'draft') storyCounts.draft++
    else if (status === 'pending') storyCounts.pending++
    else if (status === 'review') storyCounts.review++
    else if (status === 'published') storyCounts.published++
  })

  // Calculate blog post counts
  const blogCounts = {
    total: blogPostsResult.count || 0,
    draft: 0,
    published: 0
  }

  blogPostsResult.data?.forEach(post => {
    const status = post.status || 'draft'
    if (status === 'draft') blogCounts.draft++
    else if (status === 'published') blogCounts.published++
  })

  return {
    stories: storyCounts,
    transcripts: {
      total: transcriptsResult.count || 0
    },
    blogPosts: blogCounts,
    members: {
      total: membersResult.count || 0
    },
    projects: {
      total: projectsResult.count || 0
    }
  }
}

/**
 * Create a story in organization
 * Automatically sets organization_id
 */
export async function createOrganizationStory(
  supabase: SupabaseClientType,
  organizationId: string,
  storyData: any
) {
  return await supabase
    .from('stories')
    .insert({
      ...storyData,
      organization_id: organizationId // 🔒 CRITICAL: Force correct organization
    })
    .select()
    .single()
}

/**
 * Update a story (validates organization ownership)
 */
export async function updateOrganizationStory(
  supabase: SupabaseClientType,
  organizationId: string,
  storyId: string,
  updates: any
) {
  return await supabase
    .from('stories')
    .update(updates)
    .eq('id', storyId)
    .eq('organization_id', organizationId) // 🔒 CRITICAL: Verify ownership
    .select()
    .single()
}

/**
 * Delete a story (validates organization ownership)
 */
export async function deleteOrganizationStory(
  supabase: SupabaseClientType,
  organizationId: string,
  storyId: string
) {
  return await supabase
    .from('stories')
    .delete()
    .eq('id', storyId)
    .eq('organization_id', organizationId) // 🔒 CRITICAL: Verify ownership
}
