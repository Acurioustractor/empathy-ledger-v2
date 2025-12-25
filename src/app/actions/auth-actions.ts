'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type SignUpFormData = {
  firstName: string
  lastName: string
  email: string
  password: string
  culturalBackground?: string
  acceptTerms: boolean
  acceptCulturalProtocols: boolean
  marketingOptIn?: boolean
}

export type AuthActionResult = {
  success: boolean
  error?: string
  userId?: string
  requiresEmailVerification?: boolean
}

/**
 * Sign up a new user with Supabase Auth and create their profile
 */
export async function signUpUser(formData: SignUpFormData): Promise<AuthActionResult> {
  try {
    const supabase = await createClient()

    // Validate required fields
    if (!formData.email || !formData.password) {
      return { success: false, error: 'Email and password are required' }
    }

    if (!formData.acceptTerms || !formData.acceptCulturalProtocols) {
      return { success: false, error: 'You must accept the terms and cultural protocols' }
    }

    // 1. Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          display_name: `${formData.firstName} ${formData.lastName}`,
          cultural_background: formData.culturalBackground || null,
        }
      }
    })

    if (authError) {
      console.error('Auth signup error:', authError)
      return {
        success: false,
        error: authError.message || 'Failed to create account'
      }
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user account' }
    }

    // 2. Create profile record
    // Note: This might be handled by database trigger, but we'll ensure it exists
    const displayName = `${formData.firstName} ${formData.lastName}`.trim()

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: formData.email,
        display_name: displayName,
        first_name: formData.firstName,
        last_name: formData.lastName,
        cultural_background: formData.culturalBackground || null,
        is_storyteller: true,
        onboarding_completed: false,
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't fail signup if profile creation fails - it might be created by trigger
      // The user can still complete their profile later
    }

    // 3. Check if email confirmation is required
    const requiresEmailVerification = !authData.session

    return {
      success: true,
      userId: authData.user.id,
      requiresEmailVerification,
    }

  } catch (error: any) {
    console.error('Signup error:', error)
    return {
      success: false,
      error: error.message || 'An unexpected error occurred during signup'
    }
  }
}

/**
 * Sign in an existing user
 */
export async function signInUser(email: string, password: string): Promise<AuthActionResult> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (!data.user) {
      return { success: false, error: 'Login failed' }
    }

    // Revalidate and redirect
    revalidatePath('/', 'layout')

    return {
      success: true,
      userId: data.user.id,
    }

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Login failed'
    }
  }
}

/**
 * Sign out the current user
 */
export async function signOutUser(): Promise<AuthActionResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/')

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Sign out failed'
    }
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<AuthActionResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Password reset failed'
    }
  }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email: string): Promise<AuthActionResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      }
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to resend verification email'
    }
  }
}
