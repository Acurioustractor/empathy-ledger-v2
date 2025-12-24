import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase/service-role-client'
import StoryView from '@/components/story/story-view'
import { ConsentFooterCompact } from '@/components/story/consent-footer'

/**
 * Token-Based Story Access Route
 *
 * /s/:token
 *
 * This route serves stories via ephemeral access tokens.
 * When a storyteller withdraws their story, all token-based links immediately stop working.
 *
 * Flow:
 * 1. Validate token (not revoked, not expired, not max views)
 * 2. Check story status (not withdrawn)
 * 3. Increment view count
 * 4. Serve story content
 */

interface Props {
  params: { token: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createSupabaseServiceClient()

  // Validate token
  const { data: validation } = await supabase.rpc('validate_and_increment_token', {
    p_token: params.token,
  })

  if (!validation || !validation[0]?.is_valid) {
    return {
      title: 'Story Unavailable - Empathy Ledger',
      description: 'This story link is no longer active.',
    }
  }

  // Get story details for metadata
  const { data: story } = await supabase
    .from('stories')
    .select(
      `
      id,
      title,
      content,
      storyteller:profiles!stories_storyteller_id_fkey(
        display_name,
        profile_image_url
      )
    `
    )
    .eq('id', validation[0].story_id)
    .single()

  if (!story) {
    return {
      title: 'Story Not Found - Empathy Ledger',
    }
  }

  // Generate excerpt for description
  const excerpt =
    story.content?.substring(0, 155).trim() + '...' || 'A story on Empathy Ledger'

  return {
    title: `${story.title} - ${story.storyteller?.display_name || 'Unknown'} - Empathy Ledger`,
    description: excerpt,
    openGraph: {
      title: story.title,
      description: excerpt,
      type: 'article',
      images: story.storyteller?.profile_image_url
        ? [
            {
              url: story.storyteller.profile_image_url,
              width: 800,
              height: 600,
              alt: story.storyteller.display_name,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: story.title,
      description: excerpt,
      images: story.storyteller?.profile_image_url
        ? [story.storyteller.profile_image_url]
        : [],
    },
  }
}

export default async function TokenStoryPage({ params }: Props) {
  const supabase = createSupabaseServiceClient()

  // Validate token and increment view count
  const { data: validation, error: validationError } = await supabase.rpc(
    'validate_and_increment_token',
    {
      p_token: params.token,
    }
  )

  // Token validation failed
  if (validationError || !validation || !validation[0]?.is_valid) {
    const reason = validation?.[0]?.reason || 'Unknown error'

    // Show appropriate message based on reason
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-destructive"
              fill="none"
              strokeWidth={2}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Story Unavailable
            </h1>
            <p className="text-muted-foreground">{getReasonMessage(reason)}</p>
          </div>

          {reason === 'Token has been revoked' && (
            <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
              <p>
                The storyteller has withdrawn this story or revoked this share
                link. This is part of our commitment to giving storytellers full
                control over their content.
              </p>
            </div>
          )}

          {reason === 'Story has been withdrawn' && (
            <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
              <p>
                The storyteller has chosen to withdraw this story. We respect
                their right to control their narrative and content.
              </p>
            </div>
          )}

          <div className="pt-4">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                strokeWidth={2}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              Return to Empathy Ledger
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Get story with all relationships
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select(
      `
      *,
      permission_tier,
      consent_verified_at,
      elder_reviewed,
      elder_reviewed_at,
      storyteller:profiles!stories_storyteller_id_fkey(
        id,
        display_name,
        profile_image_url,
        cultural_background,
        pronouns
      ),
      project:projects(
        id,
        name,
        description
      )
    `
    )
    .eq('id', validation[0].story_id)
    .single()

  if (storyError || !story) {
    notFound()
  }

  // Double-check story status (should have been caught by token validation)
  if (story.status === 'withdrawn') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-2xl font-bold text-foreground">
            Story Withdrawn
          </h1>
          <p className="text-muted-foreground">
            The storyteller has chosen to withdraw this story.
          </p>
        </div>
      </div>
    )
  }

  // Render story view
  return (
    <div className="min-h-screen bg-background">
      {/* Banner indicating this is a shared link */}
      <div className="bg-accent/10 border-b border-accent/20">
        <div className="container mx-auto px-4 py-3 text-center">
          <p className="text-sm text-accent-foreground">
            <span className="inline-flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                strokeWidth={2}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                />
              </svg>
              Shared story link
            </span>
            {' · '}
            This link was shared by the storyteller and can be withdrawn at any
            time.
          </p>
        </div>
      </div>

      {/* Story content */}
      <StoryView story={story} />

      {/* Consent footer - compact variant for embedded/shared views */}
      {story.consent_verified_at && story.storyteller && (
        <ConsentFooterCompact
          storytellerName={story.storyteller.display_name}
          consentVerifiedAt={story.consent_verified_at}
        />
      )}
    </div>
  )
}

function getReasonMessage(reason: string): string {
  switch (reason) {
    case 'Token not found':
      return 'This share link is invalid or does not exist.'
    case 'Token has been revoked':
      return 'This share link has been revoked by the storyteller.'
    case 'Token has expired':
      return 'This share link has expired.'
    case 'Maximum views reached':
      return 'This share link has reached its maximum number of views.'
    case 'Story has been withdrawn':
      return 'This story has been withdrawn by the storyteller.'
    default:
      return 'This share link is no longer active.'
  }
}
