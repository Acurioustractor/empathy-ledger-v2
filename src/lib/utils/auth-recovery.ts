/**
 * Authentication Recovery Utilities
 * 
 * Utilities to diagnose and fix common authentication issues
 * including loops, stuck loading states, and session corruption.
 */

import { supabase } from '@/lib/supabase/client'
import { adminConfig } from '@/lib/config/admin-config'

interface AuthDiagnostics {
  hasSession: boolean
  hasUser: boolean
  hasProfile: boolean
  sessionExpired: boolean
  profileExists: boolean
  userId: string | null
  email: string | null
  lastActivity: string | null
}

export class AuthRecovery {
  /**
   * Diagnose current authentication state
   */
  static async diagnose(): Promise<AuthDiagnostics> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      const diagnostics: AuthDiagnostics = {
        hasSession: !!session && !sessionError,
        hasUser: !!session?.user,
        hasProfile: false,
        sessionExpired: false,
        profileExists: false,
        userId: session?.user?.id || null,
        email: session?.user?.email || null,
        lastActivity: session?.user?.last_sign_in_at || null
      }

      // Check if session is expired
      if (session?.expires_at) {
        diagnostics.sessionExpired = new Date(session.expires_at * 1000) < new Date()
      }

      // Check if profile exists
      if (session?.user?.id) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .eq('id', session.user.id)
          .single()

        diagnostics.hasProfile = !!profile && !profileError
        diagnostics.profileExists = !!profile
      }

      return diagnostics
    } catch (error) {
      console.error('Auth diagnostics failed:', error)
      return {
        hasSession: false,
        hasUser: false,
        hasProfile: false,
        sessionExpired: false,
        profileExists: false,
        userId: null,
        email: null,
        lastActivity: null
      }
    }
  }

  /**
   * Clear all authentication state and force a fresh start
   */
  static async clearAllAuthState(): Promise<void> {
    try {
      console.log('🧹 Clearing all authentication state...')
      
      // Sign out from Supabase
      await supabase.auth.signOut()
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        const keysToRemove = [
          'supabase.auth.token',
          'sb-auth-token',
          'supabase-auth-token'
        ]
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key)
          sessionStorage.removeItem(key)
        })
        
        // Clear all supabase-related items
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i)
          if (key && key.includes('supabase')) {
            localStorage.removeItem(key)
          }
        }
      }
      
      console.log('✅ Authentication state cleared')
    } catch (error) {
      console.error('❌ Error clearing auth state:', error)
    }
  }

  /**
   * Force refresh the current session
   */
  static async refreshSession(): Promise<boolean> {
    try {
      console.log('🔄 Refreshing authentication session...')
      
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('❌ Session refresh failed:', error)
        return false
      }
      
      console.log('✅ Session refreshed successfully')
      return !!data.session
    } catch (error) {
      console.error('❌ Session refresh error:', error)
      return false
    }
  }

  /**
   * Attempt to recover from authentication loops
   */
  static async recoverFromLoop(): Promise<void> {
    try {
      console.log('🔄 Attempting to recover from authentication loop...')
      
      const diagnostics = await this.diagnose()
      console.log('📊 Auth diagnostics:', diagnostics)
      
      if (diagnostics.sessionExpired) {
        console.log('⏰ Session expired, attempting refresh...')
        const refreshed = await this.refreshSession()
        
        if (!refreshed) {
          console.log('🧹 Refresh failed, clearing state...')
          await this.clearAllAuthState()
        }
      } else if (diagnostics.hasSession && !diagnostics.hasProfile) {
        console.log('👤 Session exists but no profile, checking database...')
        // This case is handled in the auth context by creating a profile
      } else if (!diagnostics.hasSession) {
        console.log('🚪 No session found, clearing any residual state...')
        await this.clearAllAuthState()
      }
      
      console.log('✅ Recovery attempt completed')
    } catch (error) {
      console.error('❌ Recovery failed:', error)
      await this.clearAllAuthState()
    }
  }

  /**
   * Check if user should be super admin based on email
   * Uses the centralized admin configuration system
   */
  static isAdminEmail(email: string | null): boolean {
    return adminConfig.isSuperAdmin(email)
  }

  /**
   * Check if user should be granted admin access
   * This checks both super admin emails and database admin status
   */
  static async isAdmin(userId: string, email: string | null): Promise<boolean> {
    // Check super admin status first
    if (adminConfig.isSuperAdmin(email)) {
      return true
    }

    // TODO: Check database for organisation admin status
    // This would check organization_roles table for admin roles
    // For now, fallback to super admin only
    return false
  }

  /**
   * Get user permissions based on admin status
   */
  static async getUserPermissions(userId: string, email: string | null) {
    // Check if user has organisation admin roles
    const isOrgAdmin = false // TODO: Check organization_roles table
    
    return adminConfig.getUserPermissions(email, isOrgAdmin)
  }

  /**
   * Create a missing profile for a user
   */
  static async createMissingProfile(userId: string, email: string): Promise<boolean> {
    try {
      console.log(`👤 Creating missing profile for user: ${email}`)
      
      const profileData = {
        id: userId,
        email: email,
        display_name: email.split('@')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        onboarding_completed: false,
        is_storyteller: this.isAdminEmail(email), // Admin emails also get storyteller access
        is_elder: false,
        profile_visibility: 'private',
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        console.error('❌ Profile creation failed:', error)
        return false
      }

      console.log('✅ Profile created successfully')
      return true
    } catch (error) {
      console.error('❌ Profile creation error:', error)
      return false
    }
  }
}

/**
 * Browser console utilities for debugging
 * Usage: window.authRecovery.diagnose() in browser console
 */
if (typeof window !== 'undefined') {
  (window as any).authRecovery = AuthRecovery
}
