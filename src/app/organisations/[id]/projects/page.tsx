import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { ProjectsCollection } from '@/components/organization/ProjectsCollection'

interface ProjectsPageProps {
  params: { id: string }
}

async function getOrganizationProjects(organizationId: string) {
  const supabase = createSupabaseServerClient()
  
  // Get organisation to get tenant_id
  const { data: organisation } = await supabase
    .from('organizations')
    .select('tenant_id')
    .eq('id', organizationId)
    .single()

  if (!organisation) {
    throw new Error('Organization not found')
  }

  // Get all projects for this tenant
  // This includes both organisation-specific projects AND community projects in the tenant
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('tenant_id', organisation.tenant_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching organisation projects:', error)
    return []
  }

  return projects || []
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { id } = params
  const projects = await getOrganizationProjects(id)

  return (
    <ProjectsCollection 
      projects={projects}
      organizationId={id}
    />
  )
}