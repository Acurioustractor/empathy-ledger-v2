import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { ProjectsCollection } from '@/components/organization/ProjectsCollection'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

interface ProjectsPageProps {
  params: Promise<{ id: string }>
}

async function getOrganizationProjects(organizationId: string) {
  const supabase = await createSupabaseServerClient()
  
  // Get organization to get tenant_id
  const { data: organization } = await supabase
    .from('organizations')
    .select('tenant_id')
    .eq('id', organizationId)
    .single()

  if (!organization) {
    throw new Error('Organization not found')
  }

  // Get all projects for this tenant
  // This includes both organization-specific projects AND community projects in the tenant
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('tenant_id', organization.tenant_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching organization projects:', error)
    return []
  }

  return projects || []
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const projects = await getOrganizationProjects(params.id)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <ProjectsCollection 
          projects={projects}
          organizationId={params.id}
        />
      </div>

      <Footer />
    </div>
  )
}