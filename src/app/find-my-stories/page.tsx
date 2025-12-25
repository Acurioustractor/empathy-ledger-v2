export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { Search, Calendar, MapPin, User, CheckCircle2, Clock } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { FindMyStoriesClient } from '@/components/stories/FindMyStoriesClient'

export default async function FindMyStoriesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin?redirect=/find-my-stories')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, email')
    .eq('id', user.id)
    .single()

  // Get unclaimed stories that might belong to this user
  // Search by email or name similarity
  const { data: unclaimedStories } = await supabase
    .from('story_review_invitations')
    .select(`
      id,
      story_id,
      storyteller_name,
      storyteller_email,
      storyteller_phone,
      token,
      created_at,
      accepted_at,
      expires_at,
      stories:story_id (
        id,
        title,
        summary,
        created_at,
        location_name,
        permission_tier
      )
    `)
    .is('storyteller_id', null)
    .or(`storyteller_email.eq.${user.email},storyteller_email.ilike.%${profile?.display_name?.split(' ')[0]}%`)
    .order('created_at', { ascending: false })
    .limit(50)

  // Get already claimed stories for this user
  const { data: claimedStories } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      summary,
      created_at,
      location_name,
      permission_tier
    `)
    .eq('storyteller_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-12">
            <Badge variant="cultural-featured" size="cultural" className="w-fit mb-4">
              <Search className="w-3 h-3 mr-1" />
              Find Your Stories
            </Badge>

            <Typography variant="cultural-display" className="text-3xl lg:text-4xl font-bold mb-4">
              Your Stories
            </Typography>

            <Typography variant="lead" className="text-stone-600 dark:text-stone-400 max-w-3xl">
              Stories that have been captured for you. You can claim stories created by field workers or
              view stories you've already linked to your account.
            </Typography>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card variant="cultural">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="body-small" className="text-muted-foreground mb-1">
                      My Stories
                    </Typography>
                    <Typography variant="h4" className="font-bold text-clay-600 dark:text-clay-400">
                      {claimedStories?.length || 0}
                    </Typography>
                  </div>
                  <CheckCircle2 className="w-10 h-10 text-sage-500 dark:text-sage-400" />
                </div>
              </CardContent>
            </Card>

            <Card variant="cultural">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="body-small" className="text-muted-foreground mb-1">
                      Waiting to Claim
                    </Typography>
                    <Typography variant="h4" className="font-bold text-amber-600 dark:text-amber-400">
                      {unclaimedStories?.length || 0}
                    </Typography>
                  </div>
                  <Clock className="w-10 h-10 text-amber-500 dark:text-amber-400" />
                </div>
              </CardContent>
            </Card>

            <Card variant="cultural">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="body-small" className="text-muted-foreground mb-1">
                      Total Captured
                    </Typography>
                    <Typography variant="h4" className="font-bold text-blue-600 dark:text-blue-400">
                      {(claimedStories?.length || 0) + (unclaimedStories?.length || 0)}
                    </Typography>
                  </div>
                  <User className="w-10 h-10 text-blue-500 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Unclaimed Stories Section */}
          {unclaimedStories && unclaimedStories.length > 0 && (
            <div className="mb-12">
              <Card variant="cultural">
                <CardHeader cultural>
                  <CardTitle cultural>Stories Waiting for You to Claim</CardTitle>
                  <CardDescription cultural>
                    These stories were captured by field workers and match your profile. Click to claim them.
                  </CardDescription>
                </CardHeader>

                <CardContent cultural>
                  <FindMyStoriesClient
                    unclaimedStories={unclaimedStories}
                    userId={user.id}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Claimed Stories Section */}
          {claimedStories && claimedStories.length > 0 && (
            <div>
              <Card variant="cultural">
                <CardHeader cultural>
                  <CardTitle cultural>Your Claimed Stories</CardTitle>
                  <CardDescription cultural>
                    Stories you've already linked to your account
                  </CardDescription>
                </CardHeader>

                <CardContent cultural>
                  <div className="space-y-4">
                    {claimedStories.map((story) => (
                      <Card
                        key={story.id}
                        variant="cultural"
                        className="hover:border-clay-300 dark:hover:border-clay-700 transition-colors cursor-pointer"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-4 h-4 text-sage-600 dark:text-sage-400" />
                                <Typography variant="h6" className="font-semibold">
                                  {story.title || 'Untitled Story'}
                                </Typography>
                              </div>

                              {story.summary && (
                                <Typography variant="body-small" className="text-muted-foreground mb-3 line-clamp-2">
                                  {story.summary}
                                </Typography>
                              )}

                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                {story.created_at && (
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(story.created_at).toLocaleDateString()}</span>
                                  </div>
                                )}
                                {story.location_name && (
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    <span>{story.location_name}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <Button
                              variant="cultural-primary"
                              size="cultural"
                              asChild
                            >
                              <a href={`/my-story/${story.id}`}>
                                View Story
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Empty State */}
          {(!unclaimedStories || unclaimedStories.length === 0) &&
           (!claimedStories || claimedStories.length === 0) && (
            <Card variant="cultural" className="text-center py-12">
              <CardContent>
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <Typography variant="h5" className="font-semibold mb-2">
                  No Stories Found
                </Typography>
                <Typography variant="body" className="text-muted-foreground mb-6">
                  We couldn't find any stories associated with your account yet.
                </Typography>
                <Typography variant="body-small" className="text-muted-foreground">
                  Stories created by field workers will appear here when they match your name or email.
                </Typography>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
