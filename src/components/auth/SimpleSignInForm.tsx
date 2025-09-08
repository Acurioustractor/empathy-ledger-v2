'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SimpleSignInFormProps {
  redirectTo?: string
}

export function SimpleSignInForm({ redirectTo = '/profile' }: SimpleSignInFormProps) {
  const [email, setEmail] = useState('benjamin@act.place')
  const [password, setPassword] = useState('benjamin123')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔐 Simple signin starting...')
    setIsLoading(true)
    setError('')

    try {
      // Create fresh client like the working test
      const supabase = createClient(
        'https://yvnuayzslukamizrlhwb.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNDQ4NTAsImV4cCI6MjA3MTgyMDg1MH0.UV8JOXSwANMl72lRjw-9d4CKniHSlDk9hHZpKHYN6Bs'
      )

      console.log('🔐 Making auth request...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('🔐 Auth response:', { data: !!data, error: error?.message })

      if (error) {
        console.error('🔐 Auth error:', error)
        setError(error.message)
        return
      }

      if (data.user) {
        console.log('🔐 Success! Redirecting...')
        // Use full page redirect instead of client-side routing to avoid chunk loading issues
        window.location.href = redirectTo
      }
    } catch (error) {
      console.error('🔐 Exception:', error)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
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

        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-600">
        <p>Benjamin Knight Account Pre-filled</p>
        <p>benjamin@act.place / benjamin123</p>
      </div>
    </div>
  )
}