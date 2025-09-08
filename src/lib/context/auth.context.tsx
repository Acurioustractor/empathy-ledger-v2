'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import type { Profile, ConsentPreferences, PrivacySettings } from '@/types/database'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
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

  // Derived state
  const isAuthenticated = !!user && !!session
  const hasCompletedOnboarding = profile?.onboarding_completed ?? false
  const isStoryteller = profile?.is_storyteller ?? false
  const isElder = profile?.is_elder ?? false
  const consentPreferences = profile?.consent_preferences as ConsentPreferences | null
  const privacySettings = profile?.privacy_settings as PrivacySettings | null

  // Fetch user profile
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in fetchProfile:', error)
      return null
    }
  }

  // Update profile
  const updateProfile = async (updates: Partial<Profile>): Promise<Profile | null> => {
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
  }

  // Refresh profile data
  const refreshProfile = async () => {
    if (!user) return

    const profileData = await fetchProfile(user.id)
    setProfile(profileData)
  }

  // Update consent preferences
  const updateConsentPreferences = async (preferences: Partial<ConsentPreferences>) => {
    if (!profile) return

    const updatedPreferences = {
      ...consentPreferences,
      ...preferences,
    }

    await updateProfile({
      consent_preferences: updatedPreferences as any,
    })
  }

  // Update privacy settings
  const updatePrivacySettings = async (settings: Partial<PrivacySettings>) => {
    if (!profile) return

    const updatedSettings = {
      ...privacySettings,
      ...settings,
    }

    await updateProfile({
      privacy_settings: updatedSettings as any,
    })
  }

  // Sign out
  const signOut = async () => {
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
  }

  // Initialize auth state and set up listeners
  useEffect(() => {
    let mounted = true

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)

          if (session?.user) {
            const profileData = await fetchProfile(session.user.id)
            if (mounted) {
              setProfile(profileData)
            }
          }

          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // Fetch or create profile for authenticated user
          const profileData = await fetchProfile(session.user.id)
          setProfile(profileData)

          // Create profile if it doesn't exist
          if (!profileData && session.user.email) {
            try {
              const { data: newProfile } = await supabase
                .from('profiles')
                .insert({
                  id: session.user.id,
                  email: session.user.email,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  onboarding_completed: false,
                  is_storyteller: false,
                  is_elder: false,
                  profile_visibility: 'private',
                })
                .select()
                .single()

              if (newProfile) {
                setProfile(newProfile)
              }
            } catch (error) {
              console.error('Error creating profile:', error)
            }
          }
        } else {
          setProfile(null)
        }

        setIsLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Listen for profile changes in real-time
  useEffect(() => {
    if (!user) return

    const profileSubscription = supabase
      .channel(`profile_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          setProfile(payload.new as Profile)
        }
      )
      .subscribe()

    return () => {
      profileSubscription.unsubscribe()
    }
  }, [user])

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated,
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

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
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