'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2, AlertTriangle, Mail, User } from 'lucide-react'

interface InvitationDetails {
  id: string
  storyId: string
  storytellerName: string
  storyTitle?: string
  expiresAt: string
}

type PageState =
  | 'loading'
  | 'invalid'
  | 'expired'
  | 'needs_auth'
  | 'accepting'
  | 'success'
  | 'error'

export default function MagicAuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createSupabaseClient()

  const [state, setState] = useState<PageState>('loading')
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)

  const token = searchParams.get('token')

  // Validate token on mount
  useEffect(() => {
    async function validateAndProcess() {
      if (!token) {
        setState('invalid')
        setError('No invitation token provided')
        return
      }

      try {
        // Validate the token
        const validateRes = await fetch(`/api/invitations/validate?token=${token}`)
        const validateData = await validateRes.json()

        if (!validateRes.ok || !validateData.valid) {
          if (validateData.error?.includes('expired')) {
            setState('expired')
          } else {
            setState('invalid')
          }
          setError(validateData.error || 'Invalid invitation')
          return
        }

        setInvitation(validateData.invitation)

        // Check if user is already logged in
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          // User is logged in, accept the invitation
          setState('accepting')
          await acceptInvitation(user.id)
        } else {
          // User needs to sign in/up
          setState('needs_auth')
          // Pre-fill email if provided in invitation
          if (validateData.invitation?.storytellerEmail) {
            setEmail(validateData.invitation.storytellerEmail)
          }
        }
      } catch (err) {
        console.error('Error processing magic link:', err)
        setState('error')
        setError('Something went wrong. Please try again.')
      }
    }

    validateAndProcess()
  }, [token])

  async function acceptInvitation(userId: string) {
    try {
      const res = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, userId })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setState('success')
        // Redirect to story after short delay
        setTimeout(() => {
          router.push(`/stories/${data.storyId}`)
        }, 2000)
      } else {
        setState('error')
        setError(data.error || 'Failed to accept invitation')
      }
    } catch (err) {
      console.error('Error accepting invitation:', err)
      setState('error')
      setError('Failed to accept invitation')
    }
  }

  async function handleSignInWithEmail() {
    if (!email.trim()) {
      setError('Please enter your email')
      return
    }

    setIsSigningIn(true)
    setError(null)

    try {
      // Use Supabase magic link with redirect back to this page
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/magic?token=${token}`,
          data: {
            display_name: invitation?.storytellerName,
            is_storyteller: true
          }
        }
      })

      if (error) {
        setError(error.message)
      } else {
        setError(null)
        // Show success message
        setState('error') // Reuse error state to show info
        setError('Check your email! We sent you a sign-in link.')
      }
    } catch (err) {
      console.error('Sign in error:', err)
      setError('Failed to send sign-in email')
    } finally {
      setIsSigningIn(false)
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user && state === 'needs_auth') {
          setState('accepting')
          await acceptInvitation(session.user.id)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [state, token])

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-earth-800 dark:text-earth-200">
            {state === 'loading' && 'Processing...'}
            {state === 'invalid' && 'Invalid Link'}
            {state === 'expired' && 'Link Expired'}
            {state === 'needs_auth' && 'Welcome!'}
            {state === 'accepting' && 'Setting Up...'}
            {state === 'success' && 'You\'re In!'}
            {state === 'error' && 'Oops'}
          </CardTitle>
          <CardDescription>
            {state === 'needs_auth' && invitation && (
              <>Hi {invitation.storytellerName}, sign in to view your story</>
            )}
            {state === 'success' && 'Redirecting you to your story...'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Loading State */}
          {state === 'loading' && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
              <p className="mt-4 text-stone-600 dark:text-stone-400">
                Validating your invitation...
              </p>
            </div>
          )}

          {/* Invalid/Expired State */}
          {(state === 'invalid' || state === 'expired') && (
            <div className="text-center py-4">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <p className="text-stone-600 dark:text-stone-400 mb-4">
                {state === 'expired'
                  ? 'This invitation link has expired. Please ask for a new one.'
                  : error || 'This invitation link is not valid.'}
              </p>
              <Button
                variant="outline"
                onClick={() => router.push('/')}
              >
                Go Home
              </Button>
            </div>
          )}

          {/* Needs Auth State - Sign In Form */}
          {state === 'needs_auth' && (
            <div className="space-y-4">
              {error && (
                <Alert variant={error.includes('Check your email') ? 'default' : 'destructive'}>
                  <AlertDescription>
                    {error.includes('Check your email') ? (
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {error}
                      </span>
                    ) : error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSignInWithEmail()}
                />
              </div>

              <Button
                className="w-full bg-sage-600 hover:bg-sage-700"
                onClick={handleSignInWithEmail}
                disabled={isSigningIn}
              >
                {isSigningIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Sign In with Email
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-stone-500 dark:text-stone-400">
                We'll send you a secure sign-in link. No password needed.
              </p>
            </div>
          )}

          {/* Accepting State */}
          {state === 'accepting' && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
              <p className="mt-4 text-stone-600 dark:text-stone-400">
                Setting up your account...
              </p>
            </div>
          )}

          {/* Success State */}
          {state === 'success' && (
            <div className="flex flex-col items-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-stone-600 dark:text-stone-400">
                You now have access to your story!
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-stone-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirecting...
              </div>
            </div>
          )}

          {/* Error State */}
          {state === 'error' && !error?.includes('Check your email') && (
            <div className="text-center py-4">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-stone-600 dark:text-stone-400 mb-4">
                {error || 'Something went wrong. Please try again.'}
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
