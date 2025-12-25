export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Heart, Shield, CheckCircle2 } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { SignUpForm } from '@/components/auth/SignUpForm'

const benefits = [
  "Share your cultural stories respectfully",
  "Connect with storytellers and knowledge keepers", 
  "Preserve wisdom for future generations",
  "Maintain control over your cultural content"
]

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Side - Benefits */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="cultural-featured" size="cultural" className="w-fit">
                  <Heart className="w-3 h-3 mr-1" />
                  Join Our Community
                </Badge>
                <Typography variant="cultural-display" className="text-3xl lg:text-4xl font-bold leading-tight">
                  Start Your Cultural{" "}
                  <span className="bg-gradient-to-r from-clay-600 to-sage-600 bg-clip-text text-transparent">
                    Storytelling Journey
                  </span>
                </Typography>
                <Typography variant="lead" className="text-stone-600 dark:text-stone-400">
                  Join a respectful platform designed for Indigenous communities to share, preserve, and celebrate their stories and wisdom.
                </Typography>
              </div>

              {/* Benefits List */}
              <div className="space-y-4">
                <Typography variant="h6" className="text-clay-700 dark:text-clay-300 font-semibold">
                  What you'll get:
                </Typography>
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-sage-600 dark:text-sage-400 mt-0.5 flex-shrink-0" />
                      <Typography variant="body" className="text-stone-600 dark:text-stone-400">
                        {benefit}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cultural Values */}
              <Card variant="cultural" className="border-sage-200 dark:border-sage-800 bg-gradient-to-br from-sage-50/50 to-sage-100/30 dark:from-sage-950/20 dark:to-sage-900/10">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Shield className="w-8 h-8 text-sage-600 dark:text-sage-400 flex-shrink-0" />
                    <div>
                      <Typography variant="h6" className="text-sage-800 dark:text-sage-200 font-semibold mb-2">
                        Built on OCAP Principles
                      </Typography>
                      <Typography variant="body-small" className="text-sage-700 dark:text-sage-300 leading-relaxed">
                        Ownership, Control, Access, and Possession - ensuring Indigenous communities maintain sovereignty over their cultural data and stories.
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Sign Up Form */}
            <div>
              <Card variant="cultural" size="cultural">
                <CardHeader cultural>
                  <CardTitle cultural>Create Your Account</CardTitle>
                  <CardDescription cultural>
                    Get started with your free Empathy Ledger account
                  </CardDescription>
                </CardHeader>
                
                <CardContent cultural>
                  <SignUpForm />
                </CardContent>
              </Card>

              {/* Sign In Link */}
              <div className="mt-6 text-center">
                <Typography variant="body-small" className="text-stone-600 dark:text-stone-400">
                  Already have an account?{" "}
                  <Link 
                    href="/auth/signin" 
                    className="font-medium text-clay-600 hover:text-clay-700 dark:text-clay-400 dark:hover:text-clay-300"
                  >
                    Sign in here
                  </Link>
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}