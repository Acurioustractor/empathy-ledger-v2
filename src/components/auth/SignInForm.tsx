'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getSupabaseBrowser } from '@/lib/supabase/browser'

interface SignInFormProps {
  redirectTo?: string
}

export function SignInForm({ redirectTo = '/admin' }: SignInFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔐 Starting signin process...', { email, password: '***' })
    setIsLoading(true)
    setError('')

    try {
      console.log('🔐 Attempting authentication with Supabase...')
      const { data, error } = await getSupabaseBrowser().auth.signInWithPassword({
        email,
        password,
      })

      console.log('🔐 Supabase response:', { data: !!data, error: error?.message })

      if (error) {
        console.error('🔐 Authentication error:', error)
        setError(error.message)
        setIsLoading(false)
        return
      }

      if (data.user) {
        console.log('🔐 Authentication successful, redirecting...')
        router.push(redirectTo)
      }
    } catch (error) {
      setError('An unexpected error occurred')
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // For demo purposes, provide easy access accounts
  const demoAccounts = [
    { email: 'admin@empathyledger.com', password: 'admin123', role: 'Super Admin' },
    { email: 'moderator@empathyledger.com', password: 'moderator123', role: 'Content Moderator' },
    { email: 'elder@empathyledger.com', password: 'elder123', role: 'Community Elder' },
  ]

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    
    setIsLoading(true)
    setError('')

    try {
      const { data, error } = await getSupabaseBrowser().auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      })

      if (error) {
        // If demo account doesn't exist, try to create it
        console.log('Demo account not found, would need to be created in database')
        setError('Demo account not set up. Please use regular sign up process.')
        setIsLoading(false)
        return
      }

      if (data.user) {
        router.push(redirectTo)
      }
    } catch (error) {
      setError('Demo login failed')
      console.error('Demo sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSignIn} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            cultural
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              cultural
              required
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </form>

      {/* Demo Accounts for Testing */}
      <div className="mt-8 p-4 bg-clay-50 dark:bg-clay-950/30 rounded-lg border border-clay-200 dark:border-clay-800/50">
        <h4 className="font-medium text-clay-800 dark:text-clay-200 mb-3">Demo Accounts (For Testing)</h4>
        <div className="space-y-2">
          {demoAccounts.map((account, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-clay-900/50 rounded border">
              <div>
                <p className="text-sm font-medium">{account.role}</p>
                <p className="text-xs text-stone-600 dark:text-stone-400">{account.email}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin(account.email, account.password)}
                disabled={isLoading}
              >
                Use Demo
              </Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-stone-600 dark:text-stone-400 mt-2">
          * Demo accounts require database setup. Use the sign-up process to create a real account.
        </p>
      </div>
    </div>
  )
}