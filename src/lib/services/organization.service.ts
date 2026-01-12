import { createBrowserClient } from '@supabase/ssr'

// Supabase schema drift: use relaxed typing to avoid breaking on missing columns/tables
type Organization = Record<string, any>
type Profile = Record<string, any>
type Story = Record<string, any>
type PersonalInsights = Record<string, any>

export interface OrganizationMetrics {
  memberCount: number
  storyCount: number
  analyticsCount: number
  engagementScore: number
  recentActivityCount: number
}

export interface CommunityInsights {
  topThemes: Array<{ theme: string; count: number }>
  topValues: Array<{ value: string; count: number }>
  topStrengths: Array<{ strength: string; count: number }>
  culturalMarkers: string[]
  skillsDistribution: Array<{ category: string; members: number }>
}

export interface MentorshipMatch {
  mentorId: string
  menteeId: string
  matchScore: number
  sharedInterests: string[]
  complementarySkills: string[]
}

export class OrganizationService {
  private supabase = createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  /**
   * Get organisation by ID with access verification
   */
  async getOrganization(organizationId: string): Promise<Organization | null> {
    try {
      const { data, error } = await this.supabase
        .from('tenants')
        .select('*')
        .eq('id', organizationId)
        .single()

      if (error) {
        console.error('Error fetching organisation:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Organization service error:', error)
      return null
    }
  }

  /**
   * Get all members of an organisation by tenant ID
   */
  async getOrganizationMembers(tenantId: string): Promise<Profile[]> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching organisation members:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Organization members service error:', error)
      return []
    }
  }

  /**
   * Get all stories for an organisation by tenant ID
   */
  async getOrganizationStories(tenantId: string, limit = 50): Promise<Story[]> {
    try {
      const { data, error } = await this.supabase
        .from('stories')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching organisation stories:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Organization stories service error:', error)
      return []
    }
  }

  /**
   * Get organisation metrics and KPIs
   */
  async getOrganizationMetrics(tenantId: string): Promise<OrganizationMetrics> {
    try {
      // Get member count
      const { count: memberCount } = await this.supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)

      // Get story count
      const { count: storyCount } = await this.supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)

      // Get analytics count - need to join with profiles to filter by tenant
      const { data: analyticsData } = await this.supabase
        .from('personal_insights')
        .select('profile_id, profiles!inner(tenant_id)')
        .eq('profiles.tenant_id', tenantId)

      const analyticsCount = analyticsData?.length || 0

      // Get recent activity count (stories created in last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { count: recentActivityCount } = await this.supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('created_at', thirtyDaysAgo.toISOString())

      // Calculate engagement score (simple formula for now)
      const totalMembers = memberCount || 0
      const engagementScore = totalMembers > 0 
        ? Math.round(((analyticsCount + (recentActivityCount || 0)) / totalMembers) * 100)
        : 0

      return {
        memberCount: memberCount || 0,
        storyCount: storyCount || 0,
        analyticsCount,
        engagementScore,
        recentActivityCount: recentActivityCount || 0,
      }
    } catch (error) {
      console.error('Organization metrics service error:', error)
      return {
        memberCount: 0,
        storyCount: 0,
        analyticsCount: 0,
        engagementScore: 0,
        recentActivityCount: 0,
      }
    }
  }

  /**
   * Get aggregated community insights from member analytics
   */
  async getCommunityInsights(tenantId: string): Promise<CommunityInsights> {
    try {
      // Get all analytics for organisation members
      const { data: insights } = await this.supabase
        .from('personal_insights')
        .select('narrative_themes, core_values, personal_strengths, cultural_identity_markers, profiles!inner(tenant_id)')
        .eq('profiles.tenant_id', tenantId)

      if (!insights || insights.length === 0) {
        return {
          topThemes: [],
          topValues: [],
          topStrengths: [],
          culturalMarkers: [],
          skillsDistribution: []
        }
      }

      // Aggregate themes, values, and strengths
      const allThemes: string[] = []
      const allValues: string[] = []
      const allStrengths: string[] = []
      const allCulturalMarkers: string[] = []

      insights.forEach(insight => {
        if (insight.narrative_themes) {
          allThemes.push(...(insight.narrative_themes as string[]))
        }
        if (insight.core_values) {
          allValues.push(...(insight.core_values as string[]))
        }
        if (insight.personal_strengths) {
          allStrengths.push(...(insight.personal_strengths as string[]))
        }
        if (insight.cultural_identity_markers) {
          allCulturalMarkers.push(...(insight.cultural_identity_markers as string[]))
        }
      })

      // Count frequencies
      const themeCount = this.countFrequencies(allThemes)
      const valueCount = this.countFrequencies(allValues)
      const strengthCount = this.countFrequencies(allStrengths)

      return {
        topThemes: Object.entries(themeCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([theme, count]) => ({ theme, count })),
        topValues: Object.entries(valueCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([value, count]) => ({ value, count })),
        topStrengths: Object.entries(strengthCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([strength, count]) => ({ strength, count })),
        culturalMarkers: [...new Set(allCulturalMarkers)],
        skillsDistribution: []  // TODO: Implement skills categorization
      }
    } catch (error) {
      console.error('Community insights service error:', error)
      return {
        topThemes: [],
        topValues: [],
        topStrengths: [],
        culturalMarkers: [],
        skillsDistribution: []
      }
    }
  }

  /**
   * Get potential mentorship matches within organisation
   */
  async getMentorshipMatches(tenantId: string): Promise<MentorshipMatch[]> {
    try {
      // Get members who are available for mentoring
      const { data: members } = await this.supabase
        .from('profiles')
        .select('id, display_name, skills, interests, mentoring_availability')
        .eq('tenant_id', tenantId)
        .eq('mentoring_availability', true)

      if (!members || members.length < 2) {
        return []
      }

      // Simple matching algorithm based on complementary skills
      const matches: MentorshipMatch[] = []

      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          const member1 = members[i]
          const member2 = members[j]

          const skills1 = member1.skills as string[] || []
          const skills2 = member2.skills as string[] || []
          const interests1 = member1.interests as string[] || []
          const interests2 = member2.interests as string[] || []

          const sharedInterests = interests1.filter(interest => 
            interests2.includes(interest)
          )

          const complementarySkills = skills1.filter(skill => 
            !skills2.includes(skill)
          )

          if (sharedInterests.length > 0 || complementarySkills.length > 0) {
            matches.push({
              mentorId: member1.id,
              menteeId: member2.id,
              matchScore: sharedInterests.length + complementarySkills.length,
              sharedInterests,
              complementarySkills
            })
          }
        }
      }

      return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10)
    } catch (error) {
      console.error('Mentorship matches service error:', error)
      return []
    }
  }

  /**
   * Verify user has access to organisation
   */
  async verifyOrganizationAccess(organizationId: string, userId: string): Promise<boolean> {
    try {
      // Get user's profile
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('tenant_id, tenant_roles')
        .eq('id', userId)
        .single()

      if (!profile) {
        return false
      }

      // Get organisation tenant ID
      const { data: organisation } = await this.supabase
        .from('tenants')
        .select('tenant_id')
        .eq('id', organizationId)
        .single()

      if (!organisation) {
        return false
      }

      // Check if user is in same tenant or has admin role
      const hasAccess = profile.tenant_id === organisation.tenant_id ||
        (profile.tenant_roles as string[])?.includes('admin') ||
        (profile.tenant_roles as string[])?.includes('organization_admin')

      return hasAccess
    } catch (error) {
      console.error('Organization access verification error:', error)
      return false
    }
  }

  /**
   * Helper function to count frequencies
   */
  private countFrequencies(items: string[]): Record<string, number> {
    return items.reduce((counts, item) => {
      counts[item] = (counts[item] || 0) + 1
      return counts
    }, {} as Record<string, number>)
  }
}
