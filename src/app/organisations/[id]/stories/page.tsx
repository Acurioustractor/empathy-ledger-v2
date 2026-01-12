import { createClient } from '@supabase/supabase-js'
import { StoryCollection } from '@/components/organization/StoryCollection'

// Use service role to bypass RLS for organization data
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface StoriesPageProps {
  params: { id: string }
}

async function getOrganizationStories(organizationId: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  // Get organisation to get tenant_id
  const { data: organisation } = await supabase
    .from('organizations')
    .select('tenant_id')
    .eq('id', organizationId)
    .single()

  if (!organisation) {
    throw new Error('Organization not found')
  }

  // Get all stories for this tenant (simplified query without join for now)
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
      created_at
    `)
    .eq('tenant_id', organisation.tenant_id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching organisation stories:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return []
  }

  // Transform the data to match our component interface (without author info for now)
  const transformedStories = (stories || []).map(story => ({
    ...story,
    author: null // Temporarily remove author info until we fix the join
  }))

  return transformedStories
}

export default async function StoriesPage({ params }: StoriesPageProps) {
  const { id } = params
  const stories = await getOrganizationStories(id)

  return (
    <StoryCollection 
      stories={stories}
      organizationId={id}
    />
  )
}