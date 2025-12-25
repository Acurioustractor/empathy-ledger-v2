export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Heart, BookOpen, Users, Sparkles, ArrowRight } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function OnboardingWelcomePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, first_name, is_storyteller')
    .eq('id', user.id)
    .single()

  const displayName = profile?.first_name || profile?.display_name || 'Friend'

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 via-white to-clay-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">

          {/* Welcome Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-clay-500 to-sage-500 mb-6">
              <Heart className="w-10 h-10 text-white" />
            </div>

            <Badge variant="cultural-featured" size="cultural" className="w-fit mx-auto mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Welcome to Empathy Ledger
            </Badge>

            <Typography variant="cultural-display" className="text-4xl lg:text-5xl font-bold mb-4">
              Welcome, {displayName}!
            </Typography>

            <Typography variant="lead" className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              Your account is ready. Let's explore what you can do on Empathy Ledger.
            </Typography>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card variant="cultural" className="border-2 hover:border-clay-300 dark:hover:border-clay-700 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-clay-100 dark:bg-clay-900/30 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-clay-600 dark:text-clay-400" />
                </div>
                <Typography variant="h6" className="font-semibold mb-2">
                  Share Your Stories
                </Typography>
                <Typography variant="body-small" className="text-muted-foreground">
                  Create and preserve your cultural stories with respect and care
                </Typography>
              </CardContent>
            </Card>

            <Card variant="cultural" className="border-2 hover:border-sage-300 dark:hover:border-sage-700 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-sage-600 dark:text-sage-400" />
                </div>
                <Typography variant="h6" className="font-semibold mb-2">
                  Connect with Others
                </Typography>
                <Typography variant="body-small" className="text-muted-foreground">
                  Discover storytellers and knowledge keepers in your community
                </Typography>
              </CardContent>
            </Card>

            <Card variant="cultural" className="border-2 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <Typography variant="h6" className="font-semibold mb-2">
                  Build Your Legacy
                </Typography>
                <Typography variant="body-small" className="text-muted-foreground">
                  Preserve wisdom for future generations with OCAP principles
                </Typography>
              </CardContent>
            </Card>
          </div>

          {/* Next Steps */}
          <Card variant="cultural" size="cultural" className="mb-8">
            <CardContent className="p-8">
              <Typography variant="h5" className="font-semibold mb-6 text-center">
                What would you like to do first?
              </Typography>

              <div className="space-y-4">
                <Link href="/profile/edit">
                  <Button variant="cultural-primary" size="cultural" className="w-full justify-between">
                    <span>Complete Your Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link href="/storytellers">
                  <Button variant="outline" size="cultural" className="w-full justify-between">
                    <span>Explore Community Storytellers</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link href="/stories/new">
                  <Button variant="outline" size="cultural" className="w-full justify-between">
                    <span>Create Your First Story</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Skip to Dashboard */}
          <div className="text-center">
            <Typography variant="body-small" className="text-muted-foreground mb-2">
              Already familiar with everything?
            </Typography>
            <Link
              href="/dashboard"
              className="text-clay-600 hover:text-clay-700 dark:text-clay-400 font-medium inline-flex items-center gap-1"
            >
              Go to Dashboard
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
