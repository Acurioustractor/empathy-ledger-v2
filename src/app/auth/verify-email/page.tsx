export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Mail, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { ResendVerificationButton } from '@/components/auth/ResendVerificationButton'

interface PageProps {
  searchParams: { email?: string }
}

export default function VerifyEmailPage({ searchParams }: PageProps) {
  const email = searchParams.email

  // Redirect to signup if no email provided
  if (!email) {
    redirect('/auth/signup')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sage-100 dark:bg-sage-900/20 mb-6">
              <Mail className="w-10 h-10 text-sage-600 dark:text-sage-400" />
            </div>

            <Badge variant="cultural-featured" size="cultural" className="w-fit mx-auto mb-4">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Account Created
            </Badge>

            <Typography variant="cultural-display" className="text-3xl lg:text-4xl font-bold mb-4">
              Check Your Email
            </Typography>

            <Typography variant="lead" className="text-stone-600 dark:text-stone-400">
              We've sent a verification link to
            </Typography>
            <Typography variant="lead" className="text-clay-700 dark:text-clay-300 font-semibold mt-2">
              {email}
            </Typography>
          </div>

          <Card variant="cultural" size="cultural">
            <CardHeader cultural>
              <CardTitle cultural>Next Steps</CardTitle>
              <CardDescription cultural>
                Complete these steps to activate your account
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
                        Check your inbox
                      </Typography>
                      <Typography variant="body-small" className="text-muted-foreground">
                        Look for an email from Empathy Ledger with the subject "Verify your email address"
                      </Typography>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-clay-100 dark:bg-clay-900/30 flex items-center justify-center">
                      <span className="text-sm font-semibold text-clay-700 dark:text-clay-300">2</span>
                    </div>
                    <div>
                      <Typography variant="body" className="font-semibold text-foreground mb-1">
                        Click the verification link
                      </Typography>
                      <Typography variant="body-small" className="text-muted-foreground">
                        The link will confirm your email address and activate your account
                      </Typography>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-clay-100 dark:bg-clay-900/30 flex items-center justify-center">
                      <span className="text-sm font-semibold text-clay-700 dark:text-clay-300">3</span>
                    </div>
                    <div>
                      <Typography variant="body" className="font-semibold text-foreground mb-1">
                        Complete your profile
                      </Typography>
                      <Typography variant="body-small" className="text-muted-foreground">
                        You'll be guided through a brief onboarding to set up your storyteller profile
                      </Typography>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-200 dark:border-stone-800"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-card text-stone-500">Having trouble?</span>
                  </div>
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

                  {/* Resend Button */}
                  <div className="pt-4">
                    <ResendVerificationButton email={email} />
                  </div>
                </div>

                {/* Back to Sign In */}
                <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
                  <Typography variant="body-small" className="text-center text-muted-foreground">
                    Already verified?{" "}
                    <Link
                      href="/auth/signin"
                      className="font-medium text-clay-600 hover:text-clay-700 dark:text-clay-400 inline-flex items-center gap-1"
                    >
                      Sign in to your account
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
              Still need help?{" "}
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
