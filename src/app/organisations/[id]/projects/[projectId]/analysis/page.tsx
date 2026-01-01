import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { ProjectAnalysisView } from '@/components/projects/ProjectAnalysisView'
import { FullScreenAnalysisButton } from '@/components/projects/FullScreenAnalysisButton'

interface ProjectAnalysisPageProps {
  params: Promise<{ id: string; projectId: string }>
}

export default async function ProjectAnalysisPage({ params }: ProjectAnalysisPageProps) {
  const { id: organizationId, projectId } = params
  const supabase = createSupabaseServerClient()

  // Get project details
  const { data: project } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      description,
      status,
      created_at,
      organization_id,
      organisations:organization_id(
        id,
        name,
        type
      )
    `)
    .eq('id', projectId)
    .eq('organization_id', organizationId)
    .single()

  if (!project) {
    notFound()
  }

  // Get organisation details for context
  const { data: organisation } = await supabase
    .from('organizations')
    .select('id, name, type, description')
    .eq('id', organizationId)
    .single()

  if (!organisation) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-grey-600 mb-4">
            <span className="hover:text-blue-600 transition-colours cursor-pointer">
              {organisation.name}
            </span>
            <span className="mx-2">→</span>
            <span className="hover:text-blue-600 transition-colours cursor-pointer">
              Projects
            </span>
            <span className="mx-2">→</span>
            <span className="hover:text-blue-600 transition-colours cursor-pointer">
              {project.name}
            </span>
            <span className="mx-2">→</span>
            <span className="text-grey-900 font-medium">Analysis</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-grey-900 mb-4">
                  {project.name} - Impact Analysis
                </h1>
                <p className="text-xl text-grey-700 mb-6 leading-relaxed">
                  Understanding the human stories, cultural impact, and systems change potential
                  through the voices of community members who shared their experiences.
                </p>
                <div className="flex items-center gap-6 text-sm text-grey-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Organization: {organisation.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Status: {project.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Full Screen Button */}
                <FullScreenAnalysisButton
                  projectId={projectId}
                  organizationId={organizationId}
                  projectName={project.name}
                  organizationName={organisation.name}
                  project={project}
                  organisation={organisation}
                />
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            {project.description && (
              <div className="mt-6 p-4 bg-stone-50 rounded-lg">
                <p className="text-grey-700 leading-relaxed">{project.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Component */}
        <ProjectAnalysisView
          projectId={projectId}
          organizationId={organizationId}
          projectName={project.name}
          organizationName={organisation.name}
        />
      </div>
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProjectAnalysisPageProps) {
  const { projectId } = await params
  const supabase = createSupabaseServerClient()

  const { data: project } = await supabase
    .from('projects')
    .select('name, description')
    .eq('id', projectId)
    .single()

  return {
    title: project ? `${project.name} - Impact Analysis` : 'Project Analysis',
    description: project?.description || 'Analyzing the human impact and systems change potential of community stories'
  }
}