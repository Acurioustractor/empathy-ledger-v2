'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { AuthRecovery } from '@/lib/utils/auth-recovery'
import type { Profile, ConsentPreferences, PrivacySettings } from '@/types/database'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<Profile | null>
  refreshProfile: () => Promise<void>
  hasCompletedOnboarding: boolean
  isStoryteller: boolean
  isElder: boolean
  consentPreferences: ConsentPreferences | null
  privacySettings: PrivacySettings | null
  updateConsentPreferences: (preferences: Partial<ConsentPreferences>) => Promise<void>
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  // Derived state - computed once per render
  const baseIsAuthenticated = Boolean(user && session)

  // Development mode bypass DISABLED - use real authentication
  // To re-enable: const isDevelopmentBypass = process.env.NODE_ENV === 'development' && !baseIsAuthenticated
  const isDevelopmentBypass = false
  const isAuthenticated = baseIsAuthenticated

  // Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Auth Context State:', {
      baseIsAuthenticated,
      isDevelopmentBypass,
      isAuthenticated,
      isLoading,
      hasUser: !!user,
      hasSession: !!session
    })
  }

  const hasCompletedOnboarding = Boolean(profile?.onboarding_completed ?? true) // Default to true to prevent loops
  const isStoryteller = Boolean(
    profile?.tenant_roles?.includes('storyteller') ||
    profile?.tenant_roles?.includes('admin') ||
    profile?.is_storyteller ||
    isDevelopmentBypass // Grant storyteller access in development
  )
  const isElder = Boolean(profile?.is_elder)
  const isSuperAdmin = AuthRecovery.isAdminEmail(user?.email || null) ||
    Boolean(profile?.tenant_roles?.includes('super_admin')) ||
    Boolean(profile?.tenant_roles?.includes('admin')) ||
    user?.email === 'knighttss@gmail.com' ||
    isDevelopmentBypass // Grant super admin access in development
  const isAdmin = isSuperAdmin || Boolean(profile?.tenant_roles?.includes('admin')) || isDevelopmentBypass
  const consentPreferences = profile?.consent_preferences as ConsentPreferences | null
  const privacySettings = profile?.privacy_settings as PrivacySettings | null

  // Fetch user profile with error handling and timeout
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      )

      const { data, error } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]).catch((err) => {
        console.error('Profile fetch timeout/error:', err?.message || err)
        return { data: null, error: err }
      }) as any

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in fetchProfile:', error)
      return null
    }
  }, [])

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<Profile>): Promise<Profile | null> => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        return null
      }

      setProfile(data)
      return data
    } catch (error) {
      console.error('Error in updateProfile:', error)
      return null
    }
  }, [user])

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (!user) return

    const profileData = await fetchProfile(user.id)
    setProfile(profileData)
  }, [user, fetchProfile])

  // Update consent preferences
  const updateConsentPreferences = useCallback(async (preferences: Partial<ConsentPreferences>) => {
    if (!profile) return

    const updatedPreferences = {
      ...consentPreferences,
      ...preferences,
    }

    await updateProfile({
      consent_preferences: updatedPreferences as any,
    })
  }, [profile, consentPreferences, updateProfile])

  // Update privacy settings
  const updatePrivacySettings = useCallback(async (settings: Partial<PrivacySettings>) => {
    if (!profile) return

    const updatedSettings = {
      ...privacySettings,
      ...settings,
    }

    await updateProfile({
      privacy_settings: updatedSettings as any,
    })
  }, [profile, privacySettings, updateProfile])

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setProfile(null)
      // Redirect to home page after sign out
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }, [])

  // Initialize auth state - runs once on mount
  useEffect(() => {
    if (initialized) return

    let isMounted = true
    
    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing authentication system...')

        // Add timeout to prevent hanging
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        )

        // Get session with timeout and error handling
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]).catch((err) => {
          console.log('⏰ Auth session error/timeout:', err?.message || err)
          return { data: { session: null }, error: err }
        }) as any
        
        if (!isMounted) return

        if (error) {
          console.error('❌ Session error:', error)
          if (isMounted) {
            setIsLoading(false)
            setInitialized(true)
          }
          return
        }

        console.log('👤 Session status:', session ? 'Found' : 'None')

        let profileData = null

        if (isMounted) {
          setSession(session)
          setUser(session?.user ?? null)
        }

        if (session?.user && isMounted) {
          console.log('📝 Fetching profile for:', session.user.email)

          // Check if this is a super admin
          const isSuper = AuthRecovery.isAdminEmail(session.user.email)

          profileData = await fetchProfile(session.user.id)
          
          if (!isMounted) return

          if (!profileData) {
            console.log('🔧 Creating missing profile...')
            const created = await AuthRecovery.createMissingProfile(session.user.id, session.user.email!)
            
            if (created && isMounted) {
              profileData = await fetchProfile(session.user.id)
            }
          }

          if (profileData && isMounted) {
            if (isSuper) {
              // Ensure super admin has all permissions
              const adminProfile = {
                ...profileData,
                is_storyteller: true,
                tenant_roles: ['admin', 'storyteller'],
                onboarding_completed: true
              }
              setProfile(adminProfile)
              console.log('🔑 Super admin profile configured')
            } else {
              setProfile(profileData)
              console.log('✅ Profile loaded:', profileData.display_name || session.user.email)
            }
          }
        }

        if (isMounted) {
          setIsLoading(false)
          setInitialized(true)
          console.log('🎉 Auth initialization complete', {
            hasUser: !!user,
            hasSession: !!session,
            profileEmail: profileData?.email
          })
        }
      } catch (error) {
        console.error('💥 Auth initialization failed:', error)
        if (isMounted) {
          setIsLoading(false)
          setInitialized(true)
        }
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
    }
  }, [initialized, fetchProfile])

  // Auth state change listener - separate from initialization
  useEffect(() => {
    if (!initialized) return

    console.log('🔗 Setting up auth state listener...')
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Only log and process certain events, ignore others to prevent loops
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          console.log('🔄 Auth state changed:', event, session?.user?.email || 'no user')
        }
        
        // Only update state for meaningful auth events
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          setSession(session)
          setUser(session?.user ?? null)

          if (session?.user && event === 'SIGNED_IN') {
            const isSuper = AuthRecovery.isAdminEmail(session.user.email)
            let profileData = await fetchProfile(session.user.id)

            // Create profile if missing
            if (!profileData && session.user.email) {
              console.log('🔧 Creating missing profile during signin...')
              const created = await AuthRecovery.createMissingProfile(session.user.id, session.user.email)
              if (created) {
                profileData = await fetchProfile(session.user.id)
              }
            }

            if (profileData) {
              if (isSuper) {
                // Ensure super admin always has full permissions
                const adminProfile = {
                  ...profileData,
                  is_storyteller: true,
                  tenant_roles: ['admin', 'storyteller'],
                  onboarding_completed: true
                }
                setProfile(adminProfile)
                console.log('🔑 Admin profile set after signin')
              } else {
                setProfile(profileData)
                console.log('✅ Profile set after signin')
              }
            }
          } else if (event === 'SIGNED_OUT') {
            setProfile(null)
            console.log('🚪 Profile cleared after signout')
          }
        }
      }
    )

    return () => {
      console.log('🧹 Cleaning up auth listener')
      subscription.unsubscribe()
    }
  }, [initialized, fetchProfile])

  // Development mode bypass DISABLED - use real authentication only
  // To re-enable development mode, uncomment the following:
  // const shouldUseDevelopmentMode = process.env.NODE_ENV === 'development' && !baseIsAuthenticated
  const shouldUseDevelopmentMode = false

  const developmentUser = null
  const developmentProfile = null

  const value: AuthContextType = {
    user: user,
    session: session,
    profile: profile,
    isLoading,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    signOut,
    updateProfile,
    refreshProfile,
    hasCompletedOnboarding,
    isStoryteller,
    isElder,
    consentPreferences,
    privacySettings,
    updateConsentPreferences,
    updatePrivacySettings,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Default SSR-safe values for when context is not available during static generation
const defaultAuthContext: AuthContextType = {
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isSuperAdmin: false,
  signOut: async () => {},
  updateProfile: async () => null,
  refreshProfile: async () => {},
  hasCompletedOnboarding: false,
  isStoryteller: false,
  isElder: false,
  consentPreferences: null,
  privacySettings: null,
  updateConsentPreferences: async () => {},
  updatePrivacySettings: async () => {},
}

export function useAuth(): AuthContextType {
  // During SSG, return default values to prevent useContext errors
  if (typeof window === 'undefined') {
    return defaultAuthContext
  }

  try {
    const context = useContext(AuthContext)
    // Return default during SSR/SSG when provider isn't mounted
    if (context === undefined) {
      return defaultAuthContext
    }
    return context
  } catch {
    // Return default when React context dispatcher is null (SSG)
    return defaultAuthContext
  }
}

export function useProfile() {
  const { profile, updateProfile, refreshProfile, isLoading } = useAuth()
  return { profile, updateProfile, refreshProfile, isLoading }
}

export function useConsent() {
  const { 
    consentPreferences, 
    updateConsentPreferences, 
    privacySettings, 
    updatePrivacySettings 
  } = useAuth()
  
  return { 
    consentPreferences, 
    updateConsentPreferences, 
    privacySettings, 
    updatePrivacySettings 
  }
}

export function useStoryteller() {
  const { profile, isStoryteller, isElder } = useAuth()
  return { 
    profile, 
    isStoryteller, 
    isElder,
    culturalPermissions: profile?.cultural_permissions,
    culturalProtocols: profile?.cultural_protocols,
  }
}