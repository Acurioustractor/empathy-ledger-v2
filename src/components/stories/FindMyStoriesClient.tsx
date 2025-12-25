'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, CheckCircle2, Loader2 } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { magicLinkService } from '@/lib/services/magic-link.service'

interface Story {
  id: string
  title: string | null
  summary: string | null
  created_at: string
  location_name: string | null
  permission_tier: number | null
}

interface UnclaimedStory {
  id: string
  story_id: string
  storyteller_name: string
  storyteller_email: string | null
  storyteller_phone: string | null
  token: string
  created_at: string
  accepted_at: string | null
  expires_at: string
  stories: Story | null
}

interface FindMyStoriesClientProps {
  unclaimedStories: UnclaimedStory[]
  userId: string
}

export function FindMyStoriesClient({ unclaimedStories, userId }: FindMyStoriesClientProps) {
  const router = useRouter()
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleClaimStory = async (invitation: UnclaimedStory) => {
    setClaimingId(invitation.id)
    setError(null)

    try {
      // Accept the invitation using the magic link service
      const result = await magicLinkService.acceptInvitation(invitation.token, userId)

      if (result.success && result.storyId) {
        // Success! Redirect to the story
        router.push(`/my-story/${result.storyId}`)
        router.refresh()
      } else {
        setError(result.error || 'Failed to claim story')
        setClaimingId(null)
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      setClaimingId(null)
    }
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {unclaimedStories.map((invitation) => {
        const story = invitation.stories
        const expired = isExpired(invitation.expires_at)

        return (
          <Card
            key={invitation.id}
            variant="cultural"
            className={`hover:border-clay-300 dark:hover:border-clay-700 transition-colors ${expired ? 'opacity-50' : ''}`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  {/* Storyteller Name */}
                  <div className="flex items-center gap-2 mb-2">
                    <Typography variant="h6" className="font-semibold text-clay-700 dark:text-clay-300">
                      {invitation.storyteller_name}
                    </Typography>
                    {invitation.storyteller_email && (
                      <Typography variant="caption" className="text-muted-foreground">
                        ({invitation.storyteller_email})
                      </Typography>
                    )}
                  </div>

                  {/* Story Title */}
                  {story?.title && (
                    <Typography variant="body" className="font-medium mb-2">
                      {story.title}
                    </Typography>
                  )}

                  {/* Story Summary */}
                  {story?.summary && (
                    <Typography variant="body-small" className="text-muted-foreground mb-3 line-clamp-2">
                      {story.summary}
                    </Typography>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {story?.created_at && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>Captured: {new Date(story.created_at).toLocaleDateString()}</span>
                      </div>
                    )}
                    {story?.location_name && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{story.location_name}</span>
                      </div>
                    )}
                    {invitation.storyteller_phone && (
                      <div className="flex items-center gap-1.5">
                        <span>📱 {invitation.storyteller_phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Expiry Warning */}
                  {expired && (
                    <div className="mt-3">
                      <Alert variant="destructive" className="py-2">
                        <AlertDescription className="text-sm">
                          This invitation has expired. Contact support to claim this story.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>

                {/* Claim Button */}
                <div className="flex-shrink-0">
                  <Button
                    variant={expired ? "outline" : "cultural-primary"}
                    size="cultural"
                    onClick={() => handleClaimStory(invitation)}
                    disabled={claimingId === invitation.id || expired}
                  >
                    {claimingId === invitation.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Claiming...
                      </>
                    ) : expired ? (
                      'Expired'
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Claim Story
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
