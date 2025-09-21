import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, Users, FileText, Calendar, ChevronRight } from 'lucide-react'

interface OrganizationAnalysisPageProps {
  params: Promise<{ id: string }>
}

export default async function OrganizationAnalysisPage({ params }: OrganizationAnalysisPageProps) {
  const { id: organizationId } = await params
  const supabase = createSupabaseServerClient()

  // Get organisation details
  const { data: organisation } = await supabase
    .from('organisations')
    .select('id, name, type, description')
    .eq('id', organizationId)
    .single()

  if (!organisation) {
    notFound()
  }

  // Get all projects for this organisation with basic analytics
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      description,
      status,
      created_at,
      updated_at
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (projectsError) {
    console.error('Error fetching projects:', projectsError)
  }

  // Get transcript counts for each project
  const projectsWithCounts = await Promise.all(
    (projects || []).map(async (project) => {
      const { count } = await supabase
        .from('transcripts')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id)

      // Get unique storytellers count for this project
      const { data: storytellers } = await supabase
        .from('transcripts')
        .select('storyteller_id')
        .eq('project_id', project.id)
        .not('storyteller_id', 'is', null)

      const uniqueStorytellers = new Set(storytellers?.map(t => t.storyteller_id)).size

      return {
        ...project,
        transcriptCount: count || 0,
        storytellerCount: uniqueStorytellers
      }
    })
  )

  // Filter projects that have transcripts (can be analysed)
  const analyzableProjects = projectsWithCounts.filter(p => p.transcriptCount > 0)

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
            <span className="text-grey-900 font-medium">Impact Analysis</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-grey-900 mb-4">
                  Impact Analysis Dashboard
                </h1>
                <p className="text-xl text-grey-700 mb-6 leading-relaxed">
                  Explore the human stories, cultural impact, and systems change potential
                  across all {organisation.name} projects through comprehensive analysis.
                </p>
                <div className="flex items-center gap-6 text-sm text-grey-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Organization: {organisation.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{analyzableProjects.length} Projects with Analysis</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {organisation.description && (
              <div className="mt-6 p-4 bg-stone-50 rounded-lg">
                <p className="text-grey-700 leading-relaxed">{organisation.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Projects Analysis Grid */}
        {analyzableProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {analyzableProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className="text-lg">{project.name}</span>
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {project.description || 'Project analysis available'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Project Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm text-grey-600">
                        <Users className="w-4 h-4" />
                        <span>{project.storytellerCount} Storytellers</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-grey-600">
                        <FileText className="w-4 h-4" />
                        <span>{project.transcriptCount} Transcripts</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-grey-600 col-span-2">
                        <Calendar className="w-4 h-4" />
                        <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Analysis Button */}
                    <Button asChild className="w-full">
                      <Link
                        href={`/organisations/${organizationId}/projects/${project.id}/analysis`}
                        className="flex items-center justify-center gap-2"
                      >
                        <Activity className="w-4 h-4" />
                        View Impact Analysis
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                No Analysis Available
              </CardTitle>
              <CardDescription>
                Projects need transcripts to generate impact analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-grey-600 mb-4">
                To generate impact analysis, projects need to have storyteller transcripts.
                Once transcripts are available, comprehensive analysis will show:
              </p>
              <ul className="space-y-2 text-sm text-grey-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>Cultural impact insights and themes</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Community empowerment metrics</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>Powerful quotes and story highlights</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <span>Recommendations for project continuation</span>
                </li>
              </ul>

              <div className="mt-6">
                <Button asChild variant="outline">
                  <Link href={`/organisations/${organizationId}/projects`}>
                    Manage Projects
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: OrganizationAnalysisPageProps) {
  const { id: organizationId } = await params
  const supabase = createSupabaseServerClient()

  const { data: organisation } = await supabase
    .from('organisations')
    .select('name')
    .eq('id', organizationId)
    .single()

  return {
    title: organisation ? `${organisation.name} - Impact Analysis` : 'Impact Analysis',
    description: 'Comprehensive impact analysis of community stories and cultural insights'
  }
}