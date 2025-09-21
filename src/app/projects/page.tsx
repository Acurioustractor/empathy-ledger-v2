import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { ProjectsListing } from '@/components/projects/ProjectsListing'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

async function getAllProjects() {
  const supabase = createSupabaseServerClient()
  
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      organisation:organisations(id, name, type),
      created_by_profile:profiles!projects_created_by_fkey(id, display_name, full_name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return projects || []
}

export default async function ProjectsPage() {
  const projects = await getAllProjects()

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-sage-50/20 to-clay-50/10">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-earth-800 via-earth-700 to-clay-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Community Projects
            </h1>
            <p className="text-earth-200 text-lg md:text-xl max-w-3xl mx-auto">
              Discover and manage storytelling projects that preserve and share cultural wisdom, community stories, and meaningful connections.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProjectsListing projects={projects} />
      </div>
      
      <Footer />
    </div>
  )
}