import Link from 'next/link'
import { ArrowRight, Heart, Shield } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center space-y-4 mb-8">
            <div className="flex justify-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-clay-500 to-sage-600 shadow-cultural">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            <Typography variant="cultural-heading" className="text-2xl font-bold">
              Welcome Back
            </Typography>
            <Typography variant="body" className="text-stone-600 dark:text-stone-400">
              Sign in to your Empathy Ledger account
            </Typography>
          </div>

          {/* Sign In Form */}
          <Card variant="cultural" size="cultural">
            <CardHeader cultural>
              <CardTitle cultural>Sign In</CardTitle>
              <CardDescription cultural>
                Enter your credentials to access your cultural storytelling space
              </CardDescription>
            </CardHeader>
            
            <CardContent cultural>
              <form className="space-y-6">
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
                    placeholder="Enter your password"
                    cultural
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-sm">
                    <input 
                      type="checkbox" 
                      className="rounded border-stone-300 text-clay-600 focus:ring-clay-500"
                    />
                    <span className="text-stone-600 dark:text-stone-400">Remember me</span>
                  </label>
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-sm text-clay-600 hover:text-clay-700 dark:text-clay-400 dark:hover:text-clay-300"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button 
                  type="submit" 
                  variant="cultural-primary" 
                  size="cultural" 
                  className="w-full"
                >
                  Sign In
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

              {/* Social Sign In (Placeholder) */}
              <div className="space-y-3">
                <Button variant="outline" size="cultural" className="w-full" disabled>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google (Coming Soon)
                </Button>
                
                <Button variant="outline" size="cultural" className="w-full" disabled>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook (Coming Soon)
                </Button>
              </div>

              {/* Cultural Safety Notice */}
              <div className="mt-6 p-4 bg-sage-50 dark:bg-sage-950/30 rounded-lg border border-sage-200 dark:border-sage-800/50">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-sage-600 dark:text-sage-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <Typography variant="small" className="font-medium text-sage-800 dark:text-sage-200 mb-1">
                      Cultural Safety Commitment
                    </Typography>
                    <Typography variant="caption" className="text-sage-700 dark:text-sage-300 leading-relaxed">
                      Your personal information and cultural data are protected according to Indigenous data sovereignty principles and OCAP protocols.
                    </Typography>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <Typography variant="body-small" className="text-stone-600 dark:text-stone-400">
              Don't have an account?{" "}
              <Link 
                href="/auth/signup" 
                className="font-medium text-clay-600 hover:text-clay-700 dark:text-clay-400 dark:hover:text-clay-300"
              >
                Sign up for free
              </Link>
            </Typography>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}