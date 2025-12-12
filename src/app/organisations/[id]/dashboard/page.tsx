export const dynamic = 'force-dynamic'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { getDashboardAnalytics } from '@/lib/services/organization-dashboard.service'
import { EnhancedOrganizationMetrics } from '@/components/organization/EnhancedOrganizationMetrics'
import { TrendingThemesWidget } from '@/components/organization/widgets/TrendingThemesWidget'
import { StoryPipelineWidget } from '@/components/organization/widgets/StoryPipelineWidget'
import { TopContributorsWidget } from '@/components/organization/widgets/TopContributorsWidget'
import { ProjectHealthWidget } from '@/components/organization/widgets/ProjectHealthWidget'
import { MultiOrgSummary } from '@/components/organization/MultiOrgSummary'
import { DashboardQuickActions } from '@/components/organization/DashboardQuickActions'

interface OrganizationDashboardProps {
  params: Promise<{ id: string }>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any

interface OrganizationRecord {
  id: string
  name: string
  tenant_id: string
  [key: string]: unknown
}

async function getOrganizationData(organizationId: string) {
  const supabase = createSupabaseServerClient()

  // Get organisation details
  const { data, error } = await (supabase as AnyClient)
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single()

  const organisation = data as OrganizationRecord | null

  if (error || !organisation) {
    throw new Error('Organization not found')
  }

  // Get enhanced analytics data
  const analytics = await getDashboardAnalytics(organizationId, organisation.tenant_id)

  // Get user's other organizations for multi-org summary
  const { data: { user } } = await supabase.auth.getUser()
  let userOrganizations: Array<{
    id: string
    name: string
    memberCount: number
    storyCount: number
    projectCount: number
  }> = []

  if (user) {
    // Get all organizations the user is a member of
    const { data: memberOrgs } = await (supabase as AnyClient)
      .from('profile_organizations')
      .select(`
        organization_id,
        organizations (
          id,
          name
        )
      `)
      .eq('profile_id', user.id)
      .eq('is_active', true)

    if (memberOrgs && memberOrgs.length > 0) {
      // Get stats for each org
      userOrganizations = await Promise.all(
        memberOrgs.map(async (membership: { organization_id: string; organizations: { id: string; name: string } | null }) => {
          const orgId = membership.organization_id
          const orgName = membership.organizations?.name || 'Unknown'

          const { count: memberCount } = await supabase
            .from('profile_organizations')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId)
            .eq('is_active', true)

          const { count: storyCount } = await supabase
            .from('stories')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId)

          const { count: projectCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId)

          return {
            id: orgId,
            name: orgName,
            memberCount: memberCount || 0,
            storyCount: storyCount || 0,
            projectCount: projectCount || 0
          }
        })
      )
    }
  }

  return {
    organisation,
    analytics,
    userOrganizations
  }
}

export default async function OrganizationDashboard({
  params,
}: OrganizationDashboardProps) {
  const { id } = await params
  const { organisation, analytics, userOrganizations } = await getOrganizationData(id)

  return (
    <div className="space-y-8">
      {/* Welcome Header with Quick Actions */}
      <div className="bg-gradient-to-r from-earth-50 to-sage-50 border-b border-stone-200 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-earth-900">
                Welcome back to {organisation.name}
              </h1>
              <p className="text-earth-600 mt-2 text-lg">
                Your community overview and insights dashboard
              </p>
            </div>

            {/* Quick Action Buttons */}
            <DashboardQuickActions organizationId={id} />
          </div>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* Enhanced Metrics Overview */}
        <div>
          <h2 className="text-xl font-semibold text-grey-900 mb-6">Community Metrics</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <EnhancedOrganizationMetrics
              metrics={analytics.metrics}
              organizationId={id}
            />
          </div>
        </div>

        {/* Analytics Insights Row */}
        <div>
          <h2 className="text-xl font-semibold text-grey-900 mb-6">Analytics Insights</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <TrendingThemesWidget
              themes={analytics.themes}
              organizationId={id}
            />
            <StoryPipelineWidget
              pipeline={analytics.pipeline}
              organizationId={id}
            />
          </div>
        </div>

        {/* Activity Grid */}
        <div>
          <h2 className="text-xl font-semibold text-grey-900 mb-6">Activity & Health</h2>
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <TopContributorsWidget
              contributors={analytics.contributors}
              organizationId={id}
            />
            <ProjectHealthWidget
              projects={analytics.projectHealth}
              organizationId={id}
            />
          </div>
        </div>

        {/* Multi-Organization Summary (only shows if user has multiple orgs) */}
        {userOrganizations.length > 1 && (
          <div>
            <h2 className="text-xl font-semibold text-grey-900 mb-6">Organization Overview</h2>
            <MultiOrgSummary
              organizations={userOrganizations}
              currentOrgId={id}
            />
          </div>
        )}
      </div>
    </div>
  )
}
