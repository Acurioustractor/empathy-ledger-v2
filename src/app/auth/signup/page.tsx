import Link from 'next/link'
import { ArrowRight, Heart, Shield, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

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
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="text-sm font-medium text-stone-700 dark:text-stone-300">
                          First Name
                        </label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="Your first name"
                          cultural
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="text-sm font-medium text-stone-700 dark:text-stone-300">
                          Last Name
                        </label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Your last name"
                          cultural
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-stone-700 dark:text-stone-300">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        cultural
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium text-stone-700 dark:text-stone-300">
                        Password
                      </label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a strong password"
                        cultural
                        required
                      />
                      <Typography variant="caption" className="text-stone-500 dark:text-stone-400">
                        Must be at least 8 characters with mixed case, numbers, and symbols
                      </Typography>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="text-sm font-medium text-stone-700 dark:text-stone-300">
                        Confirm Password
                      </label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        cultural
                        required
                      />
                    </div>

                    {/* Cultural Affiliation (Optional) */}
                    <div className="space-y-2">
                      <label htmlFor="culturalBackground" className="text-sm font-medium text-stone-700 dark:text-stone-300">
                        Cultural Background <span className="text-stone-500">(Optional)</span>
                      </label>
                      <Input
                        id="culturalBackground"
                        type="text"
                        placeholder="e.g., Cree, Métis, Coast Salish, etc."
                        cultural
                      />
                      <Typography variant="caption" className="text-stone-500 dark:text-stone-400">
                        This helps us connect you with relevant cultural communities
                      </Typography>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="space-y-4">
                      <label className="flex items-start space-x-3 text-sm">
                        <input 
                          type="checkbox" 
                          className="mt-1 rounded border-stone-300 text-clay-600 focus:ring-clay-500"
                          required
                        />
                        <span className="text-stone-600 dark:text-stone-400 leading-relaxed">
                          I agree to the{" "}
                          <Link href="/terms" className="text-clay-600 hover:text-clay-700 dark:text-clay-400 font-medium">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-clay-600 hover:text-clay-700 dark:text-clay-400 font-medium">
                            Privacy Policy
                          </Link>
                        </span>
                      </label>

                      <label className="flex items-start space-x-3 text-sm">
                        <input 
                          type="checkbox" 
                          className="mt-1 rounded border-stone-300 text-sage-600 focus:ring-sage-500"
                          required
                        />
                        <span className="text-stone-600 dark:text-stone-400 leading-relaxed">
                          I understand and respect the cultural protocols and consent requirements for sharing Indigenous stories and content
                        </span>
                      </label>

                      <label className="flex items-start space-x-3 text-sm">
                        <input 
                          type="checkbox" 
                          className="mt-1 rounded border-stone-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-stone-600 dark:text-stone-400 leading-relaxed">
                          I would like to receive updates about new stories, community events, and platform features
                        </span>
                      </label>
                    </div>

                    <Button 
                      type="submit" 
                      variant="cultural-primary" 
                      size="cultural" 
                      className="w-full"
                    >
                      Create Account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-stone-200 dark:border-stone-800"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-background text-stone-500">Or continue with</span>
                    </div>
                  </div>

                  {/* Social Sign Up (Placeholder) */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="cultural" disabled>
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </Button>
                    
                    <Button variant="outline" size="cultural" disabled>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </Button>
                  </div>
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