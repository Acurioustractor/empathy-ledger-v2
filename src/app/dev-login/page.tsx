'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, LogIn } from 'lucide-react'

export default function DevLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('benjamin@act.place')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      if (data.session) {
        setMessage('✅ Signed in successfully!')
        setTimeout(() => {
          router.push('/admin/stories')
        }, 1000)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error: magicLinkError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/stories`,
        },
      })

      if (magicLinkError) {
        setError(magicLinkError.message)
        return
      }

      setMessage('✅ Check your email for the magic link!')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Not Available</CardTitle>
            <CardDescription>This page is only available in development mode.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Development Login</CardTitle>
          <CardDescription>
            Sign in to authenticate as Benjamin Knight and create/edit stories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="benjamin@act.place"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded-md text-sm">
                {message}
              </div>
            )}

            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !password}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In with Password
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleMagicLink}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Magic Link to Email'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t text-sm text-stone-600">
            <p className="font-medium mb-2">📝 Development Notes:</p>
            <ul className="space-y-1 text-xs">
              <li>• Use your Supabase password for benjamin@act.place</li>
              <li>• Or use the magic link option (check email)</li>
              <li>• Once logged in, you can create and edit stories</li>
              <li>• Session will persist across page refreshes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
