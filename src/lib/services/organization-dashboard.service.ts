/**
 * Organization Dashboard Service
 * Provides enhanced metrics, trends, and analytics for organization dashboards
 */

import { createSupabaseServiceClient } from '@/lib/supabase/client-ssr'

// Helper type for bypassing strict type checking on tables not in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = any

// Types
export interface EnhancedMetrics {
  members: {
    total: number
    trend: number // percentage change
    newThisMonth: number
    storytellers: number
    elders: number
  }
  stories: {
    total: number
    published: number
    drafts: number
    inReview: number
    newThisWeek: number
    trend: number
  }
  projects: {
    total: number
    active: number
    completed: number
    newThisMonth: number
  }
  impact: {
    score: number // 0-100
    confidence: number // 0-1
    topAreas: string[]
  }
  syndication: {
    appsConnected: number
    storiesShared: number
    totalViews: number
  }
}

export interface ThemeData {
  name: string
  count: number
  trend: 'up' | 'down' | 'stable'
}

export interface PipelineData {
  draft: number
  inReview: number
  published: number
}

export interface ContributorData {
  id: string
  name: string
  avatar: string | null
  stories: number
  transcripts: number
  lastActive: string | null
}

export interface ProjectHealth {
  id: string
  name: string
  status: 'on-track' | 'at-risk' | 'completed' | 'not-started'
  progress: number // 0-100
  storiesCollected: number
  targetStories: number | null
  daysUntilDeadline: number | null
  participantCount: number
}

export interface MemberActivity {
  id: string
  name: string
  avatar: string | null
  role: string
  lastActive: string | null
  contributions: number
  joinedAt: string
}

export interface DashboardAnalyticsData {
  metrics: EnhancedMetrics
  themes: ThemeData[]
  pipeline: PipelineData
  contributors: ContributorData[]
  projectHealth: ProjectHealth[]
  memberActivity: MemberActivity[]
}

/**
 * Get trend percentage comparing current period to previous period
 */
function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

/**
 * Get the start of current and previous periods for trend calculations
 */
function getPeriodDates() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - 7)

  return {
    now: now.toISOString(),
    startOfMonth: startOfMonth.toISOString(),
    startOfLastMonth: startOfLastMonth.toISOString(),
    startOfWeek: startOfWeek.toISOString()
  }
}

/**
 * Get enhanced metrics with trends for an organization
 */
export async function getOrganizationTrends(
  organizationId: string,
  tenantId: string
): Promise<EnhancedMetrics> {
  const supabase = createSupabaseServiceClient()
  const dates = getPeriodDates()

  // Get member counts
  const { count: totalMembers } = await supabase
    .from('profile_organizations')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('is_active', true)

  const { count: newMembersThisMonth } = await supabase
    .from('profile_organizations')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .gte('joined_at', dates.startOfMonth)

  const { count: newMembersLastMonth } = await supabase
    .from('profile_organizations')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .gte('joined_at', dates.startOfLastMonth)
    .lt('joined_at', dates.startOfMonth)

  // Get storytellers and elders count
  const { data: memberProfiles } = await supabase
    .from('profile_organizations')
    .select('profiles(is_storyteller, is_elder)')
    .eq('organization_id', organizationId)
    .eq('is_active', true)

  const storytellers = memberProfiles?.filter(m => m.profiles?.is_storyteller).length || 0
  const elders = memberProfiles?.filter(m => m.profiles?.is_elder).length || 0

  // Get story counts
  const { data: stories } = await supabase
    .from('stories')
    .select('id, status, created_at')
    .eq('organization_id', organizationId)

  const totalStories = stories?.length || 0
  const published = stories?.filter(s => s.status === 'published').length || 0
  const drafts = stories?.filter(s => s.status === 'draft').length || 0
  const inReview = stories?.filter(s => s.status === 'pending' || s.status === 'in_review').length || 0
  const newThisWeek = stories?.filter(s =>
    new Date(s.created_at) >= new Date(dates.startOfWeek)
  ).length || 0

  const storiesLastMonth = stories?.filter(s =>
    new Date(s.created_at) >= new Date(dates.startOfLastMonth) &&
    new Date(s.created_at) < new Date(dates.startOfMonth)
  ).length || 0

  const storiesThisMonth = stories?.filter(s =>
    new Date(s.created_at) >= new Date(dates.startOfMonth)
  ).length || 0

  // Get project counts
  const { data: projects } = await (supabase as AnySupabaseClient)
    .from('projects')
    .select('id, status, created_at')
    .eq('organization_id', organizationId)

  const projectList = projects as Array<{ id: string; status: string; created_at: string }> | null
  const totalProjects = projectList?.length || 0
  const activeProjects = projectList?.filter(p => p.status === 'active' || p.status === 'in_progress').length || 0
  const completedProjects = projectList?.filter(p => p.status === 'completed').length || 0
  const newProjectsThisMonth = projectList?.filter(p =>
    new Date(p.created_at) >= new Date(dates.startOfMonth)
  ).length || 0

  // Get community impact metrics (if available)
  // Using AnySupabaseClient for tables not in generated types
  let impactScore = 75 // Default score
  let impactConfidence = 0.75
  let topImpactAreas: string[] = ['Community', 'Culture', 'Connection']

  try {
    const { data: impactMetrics } = await (supabase as AnySupabaseClient)
      .from('community_impact_metrics')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (impactMetrics?.avg_confidence_score) {
      impactScore = Math.round(impactMetrics.avg_confidence_score * 100)
      impactConfidence = impactMetrics.avg_confidence_score
    }
    if (impactMetrics?.top_impact_areas) {
      topImpactAreas = impactMetrics.top_impact_areas.slice(0, 3)
    }
  } catch {
    // Table may not exist, use defaults
  }

  // Get syndication stats (tables created in recent migration)
  let storiesShared = 0
  let uniqueAppsCount = 0
  let totalViews = 0

  try {
    const storyIds = stories?.map(s => s.id) || []
    if (storyIds.length > 0) {
      const { count: sharedCount } = await (supabase as AnySupabaseClient)
        .from('story_syndication_consent')
        .select('*', { count: 'exact', head: true })
        .eq('consent_granted', true)
        .in('story_id', storyIds)

      storiesShared = sharedCount || 0

      const { data: syndicationData } = await (supabase as AnySupabaseClient)
        .from('story_syndication_consent')
        .select('app_id')
        .eq('consent_granted', true)
        .in('story_id', storyIds)

      const uniqueApps = new Set(syndicationData?.map((s: { app_id: string }) => s.app_id) || [])
      uniqueAppsCount = uniqueApps.size

      const { count: viewCount } = await (supabase as AnySupabaseClient)
        .from('story_access_log')
        .select('*', { count: 'exact', head: true })
        .in('story_id', storyIds)

      totalViews = viewCount || 0
    }
  } catch {
    // Tables may not exist yet, use defaults
  }

  return {
    members: {
      total: totalMembers || 0,
      trend: calculateTrend(newMembersThisMonth || 0, newMembersLastMonth || 0),
      newThisMonth: newMembersThisMonth || 0,
      storytellers,
      elders
    },
    stories: {
      total: totalStories,
      published,
      drafts,
      inReview,
      newThisWeek,
      trend: calculateTrend(storiesThisMonth, storiesLastMonth)
    },
    projects: {
      total: totalProjects,
      active: activeProjects,
      completed: completedProjects,
      newThisMonth: newProjectsThisMonth
    },
    impact: {
      score: impactScore,
      confidence: impactConfidence,
      topAreas: topImpactAreas
    },
    syndication: {
      appsConnected: uniqueAppsCount,
      storiesShared,
      totalViews
    }
  }
}

/**
 * Get theme distribution from organization stories
 */
export async function getThemeDistribution(
  organizationId: string
): Promise<ThemeData[]> {
  const supabase = createSupabaseServiceClient()

  // Use themes field which should exist, fallback gracefully for others
  const { data: stories } = await (supabase as AnySupabaseClient)
    .from('stories')
    .select('themes, created_at')
    .eq('organization_id', organizationId)

  if (!stories || stories.length === 0) {
    return []
  }

  // Aggregate all themes
  const themeCounts: Record<string, { current: number; previous: number }> = {}
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

  stories.forEach((story: { themes?: string[]; created_at: string }) => {
    const allThemes = story.themes || []
    const isRecent = new Date(story.created_at) >= oneMonthAgo

    allThemes.forEach((theme: string) => {
      if (!theme) return
      const normalized = theme.trim().toLowerCase()
      if (!themeCounts[normalized]) {
        themeCounts[normalized] = { current: 0, previous: 0 }
      }
      if (isRecent) {
        themeCounts[normalized].current++
      } else {
        themeCounts[normalized].previous++
      }
    })
  })

  // Convert to array and sort by total count
  return Object.entries(themeCounts)
    .map(([name, counts]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count: counts.current + counts.previous,
      trend: counts.current > counts.previous ? 'up' as const :
             counts.current < counts.previous ? 'down' as const : 'stable' as const
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

/**
 * Get story pipeline status
 */
export async function getStoryPipeline(
  organizationId: string
): Promise<PipelineData> {
  const supabase = createSupabaseServiceClient()

  const { data: stories } = await supabase
    .from('stories')
    .select('status')
    .eq('organization_id', organizationId)

  if (!stories) {
    return { draft: 0, inReview: 0, published: 0 }
  }

  return {
    draft: stories.filter(s => s.status === 'draft').length,
    inReview: stories.filter(s => s.status === 'pending' || s.status === 'in_review').length,
    published: stories.filter(s => s.status === 'published').length
  }
}

/**
 * Get top contributors in the organization
 */
export async function getTopContributors(
  organizationId: string,
  limit: number = 5
): Promise<ContributorData[]> {
  const supabase = createSupabaseServiceClient()

  // Get organization members
  const { data: members } = await supabase
    .from('profile_organizations')
    .select(`
      profile_id,
      profiles (
        id,
        display_name,
        full_name,
        profile_image_url,
        avatar_url
      )
    `)
    .eq('organization_id', organizationId)
    .eq('is_active', true)

  if (!members || members.length === 0) {
    return []
  }

  // Get contribution counts for each member
  const contributorStats = await Promise.all(
    members.map(async (member) => {
      const profileId = member.profile_id

      const { count: storyCount } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .or(`author_id.eq.${profileId},storyteller_id.eq.${profileId}`)

      const { count: transcriptCount } = await supabase
        .from('transcripts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('storyteller_id', profileId)

      // Get last activity
      const { data: lastStory } = await supabase
        .from('stories')
        .select('created_at')
        .or(`author_id.eq.${profileId},storyteller_id.eq.${profileId}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      return {
        id: profileId,
        name: member.profiles?.display_name || member.profiles?.full_name || 'Unknown',
        avatar: member.profiles?.profile_image_url || member.profiles?.avatar_url || null,
        stories: storyCount || 0,
        transcripts: transcriptCount || 0,
        lastActive: lastStory?.created_at || null
      }
    })
  )

  // Sort by total contributions and return top N
  return contributorStats
    .sort((a, b) => (b.stories + b.transcripts) - (a.stories + a.transcripts))
    .slice(0, limit)
}

/**
 * Get project health metrics
 */
export async function getProjectHealth(
  organizationId: string
): Promise<ProjectHealth[]> {
  const supabase = createSupabaseServiceClient()

  const { data: projects } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      status,
      start_date,
      end_date,
      created_at,
      profile_projects (profile_id)
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!projects) return []

  return Promise.all(
    projects.map(async (project) => {
      // Get story count for this project
      const { count: storiesCollected } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id)

      // Calculate days until deadline
      let daysUntilDeadline: number | null = null
      if (project.end_date) {
        const endDate = new Date(project.end_date)
        const today = new Date()
        daysUntilDeadline = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      }

      // Determine status
      let status: 'on-track' | 'at-risk' | 'completed' | 'not-started' = 'on-track'
      if (project.status === 'completed') {
        status = 'completed'
      } else if (project.status === 'draft' || !project.start_date) {
        status = 'not-started'
      } else if (daysUntilDeadline !== null && daysUntilDeadline < 7 && (storiesCollected || 0) < 3) {
        status = 'at-risk'
      }

      // Calculate progress (simple estimate based on stories)
      const targetStories = 10 // Default target
      const progress = Math.min(100, Math.round(((storiesCollected || 0) / targetStories) * 100))

      return {
        id: project.id,
        name: project.name,
        status,
        progress,
        storiesCollected: storiesCollected || 0,
        targetStories,
        daysUntilDeadline,
        participantCount: project.profile_projects?.length || 0
      }
    })
  )
}

/**
 * Get member activity data
 */
export async function getMemberEngagement(
  organizationId: string,
  limit: number = 10
): Promise<MemberActivity[]> {
  const supabase = createSupabaseServiceClient()

  const { data: members } = await (supabase as AnySupabaseClient)
    .from('profile_organizations')
    .select(`
      profile_id,
      role,
      joined_at,
      profiles (
        id,
        display_name,
        full_name,
        profile_image_url,
        avatar_url
      )
    `)
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('joined_at', { ascending: false })
    .limit(limit)

  if (!members) return []

  const results = await Promise.all(
    members.map(async (member: {
      profile_id: string
      role: string | null
      joined_at: string | null
      profiles: {
        id: string
        display_name: string | null
        full_name: string | null
        profile_image_url: string | null
        avatar_url: string | null
      } | null
    }) => {
      const profileId = member.profile_id

      // Get contribution count
      const { count: storyCount } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .or(`author_id.eq.${profileId},storyteller_id.eq.${profileId}`)

      const { count: transcriptCount } = await supabase
        .from('transcripts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('storyteller_id', profileId)

      // Get last activity
      const { data: lastActivity } = await supabase
        .from('stories')
        .select('created_at')
        .or(`author_id.eq.${profileId},storyteller_id.eq.${profileId}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      return {
        id: profileId,
        name: member.profiles?.display_name || member.profiles?.full_name || 'Unknown',
        avatar: member.profiles?.profile_image_url || member.profiles?.avatar_url || null,
        role: member.role || 'member',
        lastActive: lastActivity?.created_at || null,
        contributions: (storyCount || 0) + (transcriptCount || 0),
        joinedAt: member.joined_at || new Date().toISOString()
      }
    })
  )

  return results
}

/**
 * Get all dashboard analytics data in one call
 */
export async function getDashboardAnalytics(
  organizationId: string,
  tenantId: string
): Promise<DashboardAnalyticsData> {
  const [metrics, themes, pipeline, contributors, projectHealth, memberActivity] = await Promise.all([
    getOrganizationTrends(organizationId, tenantId),
    getThemeDistribution(organizationId),
    getStoryPipeline(organizationId),
    getTopContributors(organizationId, 5),
    getProjectHealth(organizationId),
    getMemberEngagement(organizationId, 10)
  ])

  return {
    metrics,
    themes,
    pipeline,
    contributors,
    projectHealth,
    memberActivity
  }
}
