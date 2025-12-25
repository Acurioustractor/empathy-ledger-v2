export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Mail, Sparkles, ArrowRight } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

interface PageProps {
  searchParams: { email?: string; name?: string }
}

export default function VerifyMagicLinkPage({ searchParams }: PageProps) {
  const email = searchParams.email
  const name = searchParams.name

  // Redirect to signin if no email provided
  if (!email) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-clay-500 to-sage-500 mb-6">
              <Mail className="w-10 h-10 text-white" />
            </div>

            <Badge variant="cultural-featured" size="cultural" className="w-fit mx-auto mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Magic Link Sent
            </Badge>

            <Typography variant="cultural-display" className="text-3xl lg:text-4xl font-bold mb-4">
              {name ? `Welcome, ${name}!` : 'Check Your Email'}
            </Typography>

            <Typography variant="lead" className="text-stone-600 dark:text-stone-400">
              We've sent a secure link to
            </Typography>
            <Typography variant="lead" className="text-clay-700 dark:text-clay-300 font-semibold mt-2">
              {email}
            </Typography>
          </div>

          <Card variant="cultural" size="cultural">
            <CardHeader cultural>
              <CardTitle cultural>Access Your Story</CardTitle>
              <CardDescription cultural>
                Click the link in your email to securely access your story
              </CardDescription>
            </CardHeader>

            <CardContent cultural>
              <div className="space-y-6">
                {/* Instructions */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-clay-100 dark:bg-clay-900/30 flex items-center justify-center">
                      <span className="text-sm font-semibold text-clay-700 dark:text-clay-300">1</span>
                    </div>
                    <div>
                      <Typography variant="body" className="font-semibold text-foreground mb-1">
                        Check your email inbox
                      </Typography>
                      <Typography variant="body-small" className="text-muted-foreground">
                        Look for an email from Empathy Ledger with your magic link
                      </Typography>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-clay-100 dark:bg-clay-900/30 flex items-center justify-center">
                      <span className="text-sm font-semibold text-clay-700 dark:text-clay-300">2</span>
                    </div>
                    <div>
                      <Typography variant="body" className="font-semibold text-foreground mb-1">
                        Click the magic link
                      </Typography>
                      <Typography variant="body-small" className="text-muted-foreground">
                        The link will securely log you in and take you directly to your story
                      </Typography>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-clay-100 dark:bg-clay-900/30 flex items-center justify-center">
                      <span className="text-sm font-semibold text-clay-700 dark:text-clay-300">3</span>
                    </div>
                    <div>
                      <Typography variant="body" className="font-semibold text-foreground mb-1">
                        Review and set privacy
                      </Typography>
                      <Typography variant="body-small" className="text-muted-foreground">
                        You'll be able to review your story and choose who can see it
                      </Typography>
                    </div>
                  </div>
                </div>

                {/* What's a Magic Link? */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-200 dark:border-stone-800"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-card text-stone-500">Why a magic link?</span>
                  </div>
                </div>

                <div className="bg-sage-50 dark:bg-sage-950/20 rounded-lg p-4 border border-sage-200 dark:border-sage-800">
                  <Typography variant="body-small" className="text-sage-700 dark:text-sage-300 leading-relaxed">
                    <strong className="font-semibold">Magic links are secure and passwordless.</strong> No need to remember
                    a password - just click the link in your email and you're in. Each link is unique to you and expires
                    after use for your security.
                  </Typography>
                </div>

                {/* Help Section */}
                <div className="space-y-4">
                  <Typography variant="body-small" className="text-muted-foreground">
                    If you don't see the email within a few minutes:
                  </Typography>

                  <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Check your spam or junk mail folder</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Make sure {email} is the correct email address</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Try adding noreply@empathyledger.com to your contacts</span>
                    </li>
                  </ul>
                </div>

                {/* Back Link */}
                <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
                  <Typography variant="body-small" className="text-center text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      href="/auth/signin"
                      className="font-medium text-clay-600 hover:text-clay-700 dark:text-clay-400 inline-flex items-center gap-1"
                    >
                      Sign in here
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Help */}
          <div className="mt-8 text-center">
            <Typography variant="body-small" className="text-muted-foreground">
              Need help?{" "}
              <Link
                href="/support"
                className="font-medium text-sage-600 hover:text-sage-700 dark:text-sage-400"
              >
                Contact our support team
              </Link>
            </Typography>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
