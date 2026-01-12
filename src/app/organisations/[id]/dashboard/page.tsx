import { createClient } from '@supabase/supabase-js'
import { OrganizationMetrics } from '@/components/organization/OrganizationMetrics'
import { RecentActivity } from '@/components/organization/RecentActivity'
import { MemberHighlights } from '@/components/organization/MemberHighlights'
import { RecentProjects } from '@/components/organization/RecentProjects'
import { DashboardQuickActions } from '@/components/organization/DashboardQuickActions'

// Use service role to bypass RLS for organization data
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface OrganizationDashboardProps {
  params: { id: string }
}

async function getOrganizationData(organizationId: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  // Get organisation details
  const { data: organisation } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single()

  if (!organisation) {
    throw new Error('Organization not found')
  }

  // Get member count from profile_organizations junction table
  const { count: memberCount } = await supabase
    .from('profile_organizations')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('is_active', true)

  // Get story count from stories in organisation
  const { count: storyCount } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)

  // Get project count for this specific organisation
  const { count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)

  // Get analytics count
  const { count: analyticsCount } = await supabase
    .from('personal_insights')
    .select('*, profiles!inner(tenant_id)', { count: 'exact', head: true })
    .eq('profiles.tenant_id', organisation.tenant_id)

  // Get recent members (last 5) from organisation
  const { data: recentMembers } = await supabase
    .from('profile_organizations')
    .select(`
      profiles!inner(
        id,
        display_name,
        full_name,
        current_role,
        created_at
      )
    `)
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get recent stories (last 5) from organisation
  const { data: recentStories } = await supabase
    .from('stories')
    .select('id, title, author_id, created_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get recent projects (last 5) for this organisation
  const { data: recentProjects } = await supabase
    .from('projects')
    .select('id, name, description, status, location, organization_id, created_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    organisation,
    metrics: {
      memberCount: memberCount || 0,
      storyCount: storyCount || 0,
      analyticsCount: analyticsCount || 0,
      projectCount: projectCount || 0,
    },
    recentMembers: recentMembers?.map(m => m.profiles) || [],
    recentStories: recentStories || [],
    recentProjects: recentProjects || [],
  }
}

export default async function OrganizationDashboard({
  params,
}: OrganizationDashboardProps) {
  const { id } = params
  const data = await getOrganizationData(id)

  return (
    <div className="space-y-6">
      {/* Welcome Header with Quick Actions */}
      <div className="bg-gradient-to-r from-stone-50 via-sage-50/30 to-earth-50/20 border-b border-stone-200 px-6 py-6 -mx-6 -mt-6 rounded-t-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-display-sm font-bold tracking-tight text-stone-900">
              Welcome back to {data.organisation.name}
            </h1>
            <p className="text-body-md text-stone-600 mt-1">
              Your community overview and insights dashboard
            </p>
          </div>

          {/* Quick Action Buttons */}
          <DashboardQuickActions organizationId={id} />
        </div>
      </div>

      <div className="space-y-6">
        {/* Metrics Overview */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-body-lg font-semibold text-stone-800">Community Metrics</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-stone-200 to-transparent"></div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <OrganizationMetrics metrics={data.metrics} />
          </div>
        </section>

        {/* Recent Activity Grid */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-body-lg font-semibold text-stone-800">Recent Activity</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-stone-200 to-transparent"></div>
          </div>
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            <RecentActivity
              stories={data.recentStories}
              organizationId={id}
            />

            <RecentProjects
              projects={data.recentProjects}
              organizationId={id}
            />

            <MemberHighlights
              members={data.recentMembers}
              organizationId={id}
            />
          </div>
        </section>
      </div>
    </div>
  )
}