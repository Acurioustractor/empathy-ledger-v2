import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { ProjectRelationshipManager } from '@/components/organization/ProjectRelationshipManager'

interface ManageProjectPageProps {
  params: Promise<{ id: string; projectId: string }>
}

export default async function ManageProjectPage({ params }: ManageProjectPageProps) {
  const { id: organizationId, projectId } = await params
  const supabase = createSupabaseServerClient()

  // Get project details
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, description')
    .eq('id', projectId)
    .single()

  if (!project) {
    notFound()
  }

  // Get organisation details
  const { data: organisation } = await supabase
    .from('organisations')
    .select('id, name')
    .eq('id', organizationId)
    .single()

  if (!organisation) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProjectRelationshipManager
        projectId={projectId}
        projectName={project.name}
        organizationId={organizationId}
      />
    </div>
  )
}