import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { notFound } from 'next/navigation'
import { ProjectAnalysisView } from '@/components/projects/ProjectAnalysisView'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

async function getProject(projectId: string) {
  const supabase = createSupabaseServerClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      description,
      organization_id,
      organisations:organization_id(id, name)
    `)
    .eq('id', projectId)
    .single()

  if (error || !project) {
    return null
  }

  return project
}

export default async function ProjectAnalysisPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProject(id)

  if (!project) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-sage-50/20 to-clay-50/10">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProjectAnalysisView
          projectId={project.id}
          organizationId={project.organization_id || ''}
          projectName={project.name}
          organizationName={project.organisations?.name || 'Unknown'}
        />
      </div>

      <Footer />
    </div>
  )
}
