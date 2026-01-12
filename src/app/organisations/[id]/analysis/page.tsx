import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, Users, FileText, Calendar, ChevronRight } from 'lucide-react'

// Use service role to bypass RLS for organization data
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface OrganizationAnalysisPageProps {
  params: { id: string }
}

export default async function OrganizationAnalysisPage({ params }: OrganizationAnalysisPageProps) {
  const { id: organizationId } = params
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Get organisation details
  const { data: organisation } = await supabase
    .from('organizations')
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-50 via-sage-50/30 to-earth-50/20 border-b border-stone-200 px-6 py-6 -mx-6 -mt-6 rounded-t-xl">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-display-sm font-bold tracking-tight text-stone-900">
              Impact Analysis Dashboard
            </h1>
            <p className="text-body-md text-stone-600 mt-2 max-w-3xl leading-relaxed">
              Explore the human stories, cultural impact, and systems change potential
              across all {organisation.name} projects through comprehensive analysis.
            </p>
            <div className="flex items-center gap-6 text-body-sm text-stone-500 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-sage-500 rounded-full"></div>
                <span>Organization: {organisation.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-earth-500 rounded-full"></div>
                <span>{analyzableProjects.length} Projects with Analysis</span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="w-14 h-14 bg-gradient-to-br from-sage-500 to-earth-600 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {organisation.description && (
          <div className="mt-4 p-4 bg-white/60 rounded-lg border border-stone-200">
            <p className="text-body-sm text-stone-600 leading-relaxed">{organisation.description}</p>
          </div>
        )}
      </div>

      {/* Projects Analysis Grid */}
      {analyzableProjects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {analyzableProjects.map((project) => (
            <Card key={project.id} className="bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="text-body-lg font-semibold text-stone-800">{project.name}</span>
                  <Badge
                    variant="outline"
                    className={project.status === 'active'
                      ? 'bg-sage-100 text-sage-700 border-sage-200'
                      : 'bg-stone-100 text-stone-600 border-stone-200'
                    }
                  >
                    {project.status}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-body-sm text-stone-500">
                  {project.description || 'Project analysis available'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Project Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-body-sm text-stone-600">
                      <Users className="w-4 h-4 text-sage-600" />
                      <span>{project.storytellerCount} Storytellers</span>
                    </div>
                    <div className="flex items-center gap-2 text-body-sm text-stone-600">
                      <FileText className="w-4 h-4 text-earth-600" />
                      <span>{project.transcriptCount} Transcripts</span>
                    </div>
                    <div className="flex items-center gap-2 text-body-sm text-stone-500 col-span-2">
                      <Calendar className="w-4 h-4" />
                      <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Analysis Button */}
                  <Button asChild className="w-full bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800">
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
        <Card className="bg-white rounded-xl border border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-stone-800">
              <Activity className="w-5 h-5 text-stone-500" />
              No Analysis Available
            </CardTitle>
            <CardDescription className="text-stone-500">
              Projects need transcripts to generate impact analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-body-md text-stone-600 mb-4">
              To generate impact analysis, projects need to have storyteller transcripts.
              Once transcripts are available, comprehensive analysis will show:
            </p>
            <ul className="space-y-2 text-body-sm text-stone-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-sage-500 rounded-full"></div>
                <span>Cultural impact insights and themes</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-earth-500 rounded-full"></div>
                <span>Community empowerment metrics</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-clay-500 rounded-full"></div>
                <span>Powerful quotes and story highlights</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                <span>Recommendations for project continuation</span>
              </li>
            </ul>

            <div className="mt-6">
              <Button asChild variant="outline" className="border-stone-300 hover:bg-stone-50">
                <Link href={`/organisations/${organizationId}/projects`}>
                  Manage Projects
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export async function generateMetadata({ params }: OrganizationAnalysisPageProps) {
  const { id: organizationId } = params
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data: organisation } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', organizationId)
    .single()

  return {
    title: organisation ? `${organisation.name} - Impact Analysis` : 'Impact Analysis',
    description: 'Comprehensive impact analysis of community stories and cultural insights'
  }
}