import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { ProjectDetails } from '@/components/projects/ProjectDetails'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

async function getProject(projectId: string) {
  const supabase = createSupabaseServerClient()
  
  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      organisation:organisations(id, name, type, location, website_url),
      created_by_profile:profiles!projects_created_by_fkey(id, display_name, full_name, profile_image_url)
    `)
    .eq('id', projectId)
    .single()

  if (error || !project) {
    return null
  }

  return project
}

async function getProjectRelationships(projectId: string) {
  const supabase = createSupabaseServerClient()

  // Get project organisations
  const { data: organisations } = await supabase
    .from('project_organizations')
    .select(`
      id,
      role,
      created_at,
      organisation:organisations(id, name, type, location)
    `)
    .eq('project_id', projectId)

  // Get project storytellers
  const { data: storytellers } = await supabase
    .from('project_storytellers')
    .select(`
      id,
      role,
      status,
      joined_at,
      storyteller:profiles(id, display_name, full_name, profile_image_url, cultural_background)
    `)
    .eq('project_id', projectId)

  // Get project galleries
  const { data: galleries } = await supabase
    .from('photo_galleries')
    .select(`
      id,
      title,
      description,
      photo_count,
      created_at
    `)
    .eq('project_id', projectId)

  return {
    organisations: organisations || [],
    storytellers: storytellers || [],
    galleries: galleries || []
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
  
  const [project, relationships] = await Promise.all([
    getProject(id),
    getProjectRelationships(id)
  ])

  if (!project) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-sage-50/20 to-clay-50/10">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProjectDetails 
          project={project} 
          relationships={relationships}
        />
      </div>
      
      <Footer />
    </div>
  )
}