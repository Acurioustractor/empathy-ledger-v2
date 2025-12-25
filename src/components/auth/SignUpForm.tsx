'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { signUpUser, type SignUpFormData } from '@/app/actions/auth-actions'

export function SignUpForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    culturalBackground: '',
    acceptTerms: false,
    acceptCulturalProtocols: false,
    marketingOptIn: false,
  })

  const handleInputChange = (field: keyof SignUpFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Basic client-side validation
      if (!formData.firstName || !formData.lastName) {
        throw new Error('First and last name are required')
      }

      if (!formData.email || !formData.password) {
        throw new Error('Email and password are required')
      }

      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters')
      }

      if (!formData.acceptTerms || !formData.acceptCulturalProtocols) {
        throw new Error('You must accept the terms and cultural protocols')
      }

      // Call server action
      const result = await signUpUser(formData)

      if (!result.success) {
        throw new Error(result.error || 'Signup failed')
      }

      // Success! Redirect to verification page if email confirmation required
      if (result.requiresEmailVerification) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`)
      } else {
        // If no verification needed, redirect to onboarding
        router.push('/onboarding/welcome')
      }

    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || 'An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Name Fields */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-sm font-medium text-stone-700 dark:text-stone-300">
            First Name
          </label>
          <Input
            id="firstName"
            type="text"
            placeholder="Your first name"
            value={formData.firstName}
            onChange={handleInputChange('firstName')}
            disabled={isLoading}
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
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
            disabled={isLoading}
            cultural
            required
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-stone-700 dark:text-stone-300">
          Email Address
        </label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          value={formData.email}
          onChange={handleInputChange('email')}
          disabled={isLoading}
          cultural
          required
        />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-stone-700 dark:text-stone-300">
          Password
        </label>
        <Input
          id="password"
          type="password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={handleInputChange('password')}
          disabled={isLoading}
          cultural
          required
        />
        <Typography variant="caption" className="text-stone-500 dark:text-stone-400">
          Must be at least 8 characters with mixed case, numbers, and symbols
        </Typography>
      </div>

      {/* Cultural Background (Optional) */}
      <div className="space-y-2">
        <label htmlFor="culturalBackground" className="text-sm font-medium text-stone-700 dark:text-stone-300">
          Cultural Background <span className="text-stone-500">(Optional)</span>
        </label>
        <Input
          id="culturalBackground"
          type="text"
          placeholder="e.g., Cree, Métis, Coast Salish, etc."
          value={formData.culturalBackground}
          onChange={handleInputChange('culturalBackground')}
          disabled={isLoading}
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
            checked={formData.acceptTerms}
            onChange={handleInputChange('acceptTerms')}
            disabled={isLoading}
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
            checked={formData.acceptCulturalProtocols}
            onChange={handleInputChange('acceptCulturalProtocols')}
            disabled={isLoading}
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
            checked={formData.marketingOptIn}
            onChange={handleInputChange('marketingOptIn')}
            disabled={isLoading}
          />
          <span className="text-stone-600 dark:text-stone-400 leading-relaxed">
            I would like to receive updates about new stories, community events, and platform features
          </span>
        </label>
      </div>

      {/* Submit Button */}
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
            Creating Account...
          </>
        ) : (
          <>
            Create Account
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>

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
    </form>
  )
}
