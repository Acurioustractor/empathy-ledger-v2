'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Known admin emails - check profile for admin status after login
const ADMIN_EMAILS = [
  'benjamin@act.place',
  'knighttss@gmail.com',
  'ben@empathyledger.com',
]

interface SimpleSignInFormProps {
  redirectTo?: string
}

export function SimpleSignInForm({ redirectTo: propRedirectTo }: SimpleSignInFormProps) {
  const searchParams = useSearchParams()
  const urlRedirect = searchParams?.get('redirect')
  const defaultRedirect = propRedirectTo || urlRedirect || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔐 Starting signin process...')
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      if (!email || !password) {
        setError('Please enter both email and password')
        setIsLoading(false)
        return
      }

      console.log('🔐 Attempting authentication for:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        console.error('🔐 Authentication failed:', error.message)
        setError(error.message)
        setIsLoading(false)
        return
      }

      if (data.user && data.session) {
        console.log('🔐 Authentication successful!')
        setSuccess(true)

        // Check if user is admin and determine redirect
        const userEmail = data.user.email?.toLowerCase() || ''
        const isLikelyAdmin = ADMIN_EMAILS.some(e => e.toLowerCase() === userEmail)

        // Also check profile for admin status
        const { data: profile } = await supabase
          .from('profiles')
          .select('tenant_roles, super_admin')
          .eq('id', data.user.id)
          .single()

        const hasAdminRole = profile?.tenant_roles?.includes('admin') ||
                           profile?.tenant_roles?.includes('super_admin') ||
                           profile?.super_admin === true

        // Determine final redirect
        let finalRedirect = defaultRedirect
        if ((isLikelyAdmin || hasAdminRole) && !urlRedirect) {
          // Admin without specific redirect → send to admin panel
          finalRedirect = '/admin'
        }

        console.log('🔐 Redirecting to:', finalRedirect)

        // Shorter delay for better UX
        setTimeout(() => {
          window.location.replace(finalRedirect)
        }, 1000)
      } else {
        setError('Authentication failed - no user data received')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('🔐 Signin exception:', error)
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    console.log('🔐 Starting Google OAuth signin...')
    setIsLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
          queryParams: {
            prompt: 'select_account'
          }
        }
      })

      if (error) {
        console.error('🔐 Google OAuth failed:', error.message)
        setError(error.message)
        setIsLoading(false)
        return
      }

      console.log('🔐 Google OAuth initiated successfully')
      // OAuth will redirect, so we don't need to handle success here
    } catch (error) {
      console.error('🔐 Google signin exception:', error)
      setError('Failed to initiate Google sign-in. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Google OAuth Section */}
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-stone-600 mb-4">Sign in with your Google account</p>
        </div>
        
        <Button 
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 flex items-center justify-center gap-3"
          disabled={isLoading || success}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-stone-500">Or continue with email</span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSignIn} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            disabled={isLoading}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="default" className="border-green-200 bg-green-50 text-green-800">
            <AlertDescription>✅ Login successful! Redirecting...</AlertDescription>
          </Alert>
        )}

        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading || success}
        >
          {success ? '✅ Success! Redirecting...' : isLoading ? '⏳ Signing In...' : 'Sign In with Email'}
        </Button>
      </form>

      <div className="text-center text-sm text-stone-600">
        <p className="text-xs text-stone-400">Enter your credentials to sign in</p>
      </div>
    </div>
  )
}