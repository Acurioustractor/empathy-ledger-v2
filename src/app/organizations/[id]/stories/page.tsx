import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { StoryCollection } from '@/components/organization/StoryCollection'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

interface StoriesPageProps {
  params: Promise<{ id: string }>
}

async function getOrganizationStories(organizationId: string) {
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

  // Get all stories for this tenant with author information
  const { data: stories, error } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      author_id,
      story_type,
      privacy_level,
      cultural_sensitivity_level,
      status,
      themes,
      created_at,
      profiles!stories_author_id_fkey (
        display_name,
        full_name,
        avatar_url
      )
    `)
    .eq('tenant_id', organization.tenant_id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching organization stories:', error)
    return []
  }

  // Transform the data to match our component interface
  const transformedStories = (stories || []).map(story => ({
    ...story,
    author: story.profiles
  }))

  return transformedStories
}

export default async function StoriesPage({ params }: StoriesPageProps) {
  const stories = await getOrganizationStories(params.id)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <StoryCollection 
          stories={stories}
          organizationId={params.id}
        />
      </div>

      <Footer />
    </div>
  )
}