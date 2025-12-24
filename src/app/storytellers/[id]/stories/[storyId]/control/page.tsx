import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import StoryControlDashboard from '@/components/story/story-control-dashboard'

export const metadata: Metadata = {
  title: 'Story Control - Empathy Ledger',
  description: 'Manage sharing and permissions for your story',
}

interface Props {
  params: {
    id: string // storyteller id
    storyId: string
  }
}

export default async function StoryControlPage({ params }: Props) {
  const supabase = createSupabaseServerClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Get story with storyteller info
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select(
      `
      *,
      storyteller:profiles!stories_storyteller_id_fkey(
        id,
        display_name,
        profile_image_url
      ),
      project:projects(
        id,
        name
      )
    `
    )
    .eq('id', params.storyId)
    .single()

  if (storyError || !story) {
    notFound()
  }

  // Verify user is the storyteller
  if (story.storyteller_id !== user.id) {
    redirect(`/storytellers/${params.id}`)
  }

  // Get share link analytics
  const { data: shareLinks } = await supabase
    .from('story_access_tokens')
    .select('*')
    .eq('story_id', params.storyId)
    .order('created_at', { ascending: false })

  const activeLinks = shareLinks?.filter(
    (link) => !link.revoked && new Date(link.expires_at) > new Date()
  ) || []

  const totalViews = shareLinks?.reduce((sum, link) => sum + link.view_count, 0) || 0

  const lastAccessed = shareLinks
    ?.filter((link) => link.last_accessed_at)
    .sort(
      (a, b) =>
        new Date(b.last_accessed_at!).getTime() -
        new Date(a.last_accessed_at!).getTime()
    )[0]?.last_accessed_at

  return (
    <div className="min-h-screen bg-background">
      <StoryControlDashboard
        story={story}
        shareLinks={shareLinks || []}
        analytics={{
          totalViews,
          activeLinks: activeLinks.length,
          lastAccessed: lastAccessed || null,
        }}
      />
    </div>
  )
}
