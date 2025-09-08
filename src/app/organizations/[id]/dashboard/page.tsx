import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { OrganizationMetrics } from '@/components/organization/OrganizationMetrics'
import { RecentActivity } from '@/components/organization/RecentActivity'
import { MemberHighlights } from '@/components/organization/MemberHighlights'
import { RecentProjects } from '@/components/organization/RecentProjects'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

interface OrganizationDashboardProps {
  params: Promise<{ id: string }>
}

async function getOrganizationData(organizationId: string) {
  const supabase = await createSupabaseServerClient()
  
  // Get organization details
  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single()

  if (!organization) {
    throw new Error('Organization not found')
  }

  // Get member count
  const { count: memberCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', organization.tenant_id)

  // Get story count
  const { count: storyCount } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', organization.tenant_id)

  // Get project count
  const { count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', organization.tenant_id)

  // Get analytics count
  const { count: analyticsCount } = await supabase
    .from('personal_insights')
    .select('*, profiles!inner(tenant_id)', { count: 'exact', head: true })
    .eq('profiles.tenant_id', organization.tenant_id)

  // Get recent members (last 5)
  const { data: recentMembers } = await supabase
    .from('profiles')
    .select('id, display_name, full_name, current_role, created_at')
    .eq('tenant_id', organization.tenant_id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get recent stories (last 5)
  const { data: recentStories } = await supabase
    .from('stories')
    .select('id, title, author_id, created_at')
    .eq('tenant_id', organization.tenant_id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get recent projects (last 5)
  const { data: recentProjects } = await supabase
    .from('projects')
    .select('id, name, description, status, location, organization_id, created_at')
    .eq('tenant_id', organization.tenant_id)
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    organization,
    metrics: {
      memberCount: memberCount || 0,
      storyCount: storyCount || 0,
      analyticsCount: analyticsCount || 0,
      projectCount: projectCount || 0,
    },
    recentMembers: recentMembers || [],
    recentStories: recentStories || [],
    recentProjects: recentProjects || [],
  }
}

export default async function OrganizationDashboard({
  params,
}: OrganizationDashboardProps) {
  const { id } = await params
  const data = await getOrganizationData(id)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {data.organization.name} Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome to your community overview and insights
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <OrganizationMetrics metrics={data.metrics} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
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
        </div>
      </div>

      <Footer />
    </div>
  )
}