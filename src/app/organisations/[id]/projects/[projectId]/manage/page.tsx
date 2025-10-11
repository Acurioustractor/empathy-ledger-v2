import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { ProjectRelationshipManager } from '@/components/organization/ProjectRelationshipManager'
import { ProjectContextManager } from '@/components/projects/ProjectContextManager'

interface ManageProjectPageProps {
  params: Promise<{ id: string; projectId: string }>
}

export default async function ManageProjectPage({ params }: ManageProjectPageProps) {
  const { id: organizationId, projectId } = await params
  const supabase = createSupabaseServerClient()

  // Get project details with context information
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, description, context_model, context_description, context_updated_at')
    .eq('id', projectId)
    .single()

  if (!project) {
    notFound()
  }

  // Get organisation details
  const { data: organisation } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('id', organizationId)
    .single()

  if (!organisation) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* AI Context Setup */}
      <ProjectContextManager
        projectId={projectId}
        projectName={project.name}
        currentContext={{
          model: project.context_model as 'none' | 'quick' | 'full',
          description: project.context_description,
          updatedAt: project.context_updated_at
        }}
      />

      {/* Storyteller Relationships */}
      <ProjectRelationshipManager
        projectId={projectId}
        projectName={project.name}
        organizationId={organizationId}
      />
    </div>
  )
}