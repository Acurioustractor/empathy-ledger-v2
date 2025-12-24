'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/auth.context'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileOverviewTab } from './tabs/ProfileOverviewTab'
import { ProfilePersonalTab } from './tabs/ProfilePersonalTab'
import { ProfileCulturalTab } from './tabs/ProfileCulturalTab'
import { ProfileContactTab } from './tabs/ProfileContactTab'
import { ProfileAccessibilityTab } from './tabs/ProfileAccessibilityTab'
import { ProfileLocationsTab } from './tabs/ProfileLocationsTab'
import { ProfileStorytellerTab } from './tabs/ProfileStorytellerTab'
import { ProfileOrganizationsTab } from './tabs/ProfileOrganizationsTab'
import { ProfilePrivacyTab } from './tabs/ProfilePrivacyTab'
import { ProfileSettingsTab } from './tabs/ProfileSettingsTab'
import { SharingSettings } from './SharingSettings'
import { AddLocationDialog } from './AddLocationDialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  User,
  Mail,
  Shield,
  BookOpen,
  Settings,
  Heart,
  Crown,
  Edit3,
  Save,
  X,
  BarChart3,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Users,
  Utensils,
  Accessibility,
  Eye,
  Bell,
  Lock,
  Plus,
  Trash2,
  Building2,
  FolderKanban,
  Landmark,
  Share2
} from 'lucide-react'

// Type definitions for profile data
interface ProfileFormData {
  // Personal Info
  first_name: string
  last_name: string
  display_name: string
  preferred_name: string
  bio: string
  pronouns: string
  date_of_birth: string
  phone: string
  avatar_url: string
  email: string

  // Cultural & Storytelling
  cultural_background: string
  cultural_affiliations: string[]
  languages_spoken: string[]
  storytelling_experience: string
  is_storyteller: boolean
  is_elder: boolean
  traditional_knowledge_keeper: boolean
  cultural_permissions: Record<string, any>
  cultural_protocols: Record<string, any>

  // Contact & Location
  address: Record<string, any>
  timezone: string
  emergency_contact: Record<string, any>
  social_links: Record<string, any>
  preferred_communication: string[]

  // Accessibility & Dietary
  dietary_requirements: string[]
  accessibility_needs: string[]

  // Community & Interests
  occupation: string
  current_role: string
  interests: string[]
  community_roles: string[]

  // Privacy & Consent
  profile_visibility: 'public' | 'community' | 'private'
  consent_preferences: Record<string, any>
  privacy_settings: Record<string, any>
  notification_preferences: Record<string, any>

  // Admin Flags
  onboarding_completed: boolean
}

export function ProfileDashboard() {
  const { user, profile, updateProfile, signOut, isStoryteller, isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Relationship data
  const [organizations, setOrganizations] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [storyCount, setStoryCount] = useState(0)
  const [isLoadingRelationships, setIsLoadingRelationships] = useState(false)

  // Location dialog
  const [showLocationDialog, setShowLocationDialog] = useState(false)

  // Initialize form data with all profile fields
  const [editData, setEditData] = useState<ProfileFormData>({
    // Personal Info
    first_name: '',
    last_name: '',
    display_name: '',
    preferred_name: '',
    bio: '',
    pronouns: '',
    date_of_birth: '',
    phone: '',
    avatar_url: '',
    email: '',

    // Cultural & Storytelling
    cultural_background: '',
    cultural_affiliations: [],
    languages_spoken: [],
    storytelling_experience: '',
    is_storyteller: false,
    is_elder: false,
    traditional_knowledge_keeper: false,
    cultural_permissions: {},
    cultural_protocols: {},

    // Contact & Location
    address: {},
    timezone: '',
    emergency_contact: {},
    social_links: {},
    preferred_communication: [],

    // Accessibility & Dietary
    dietary_requirements: [],
    accessibility_needs: [],

    // Community & Interests
    occupation: '',
    current_role: '',
    interests: [],
    community_roles: [],

    // Privacy & Consent
    profile_visibility: 'community',
    consent_preferences: {},
    privacy_settings: {},
    notification_preferences: {},

    // Admin Flags
    onboarding_completed: false
  })

  // Sync editData when profile loads
  useEffect(() => {
    if (profile) {
      setEditData({
        // Personal Info
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        display_name: profile.display_name || '',
        preferred_name: profile.preferred_name || '',
        bio: profile.bio || '',
        pronouns: profile.pronouns || '',
        date_of_birth: profile.date_of_birth || '',
        phone: profile.phone || '',
        avatar_url: profile.avatar_url || '',
        email: user?.email || profile.email || '',

        // Cultural & Storytelling
        cultural_background: profile.cultural_background || '',
        cultural_affiliations: profile.cultural_affiliations || [],
        languages_spoken: profile.languages_spoken || [],
        storytelling_experience: profile.storytelling_experience || '',
        is_storyteller: profile.is_storyteller || false,
        is_elder: profile.is_elder || false,
        traditional_knowledge_keeper: profile.traditional_knowledge_keeper || false,
        cultural_permissions: profile.cultural_permissions || {},
        cultural_protocols: profile.cultural_protocols || {},

        // Contact & Location
        address: profile.address || {},
        timezone: profile.timezone || '',
        emergency_contact: profile.emergency_contact || {},
        social_links: profile.social_links || {},
        preferred_communication: profile.preferred_communication || [],

        // Accessibility & Dietary
        dietary_requirements: profile.dietary_requirements || [],
        accessibility_needs: profile.accessibility_needs || [],

        // Community & Interests
        occupation: profile.occupation || '',
        current_role: profile.current_role || '',
        interests: profile.interests || [],
        community_roles: profile.community_roles || [],

        // Privacy & Consent
        profile_visibility: profile.profile_visibility || 'community',
        consent_preferences: profile.consent_preferences || {},
        privacy_settings: profile.privacy_settings || {},
        notification_preferences: profile.notification_preferences || {},

        // Admin Flags
        onboarding_completed: profile.onboarding_completed || false
      })
    }
  }, [profile, user])

  // Fetch organizations, projects, and locations
  useEffect(() => {
    const fetchRelationships = async () => {
      if (!user) return

      setIsLoadingRelationships(true)
      try {
        const response = await fetch('/api/profiles/me')
        if (response.ok) {
          const data = await response.json()
          setOrganizations(data.organizations || [])
          setProjects(data.projects || [])
          setLocations(data.locations || [])
          setStoryCount(data.storyCount || 0)
        }
      } catch (error) {
        console.error('Error fetching relationships:', error)
      } finally {
        setIsLoadingRelationships(false)
      }
    }

    fetchRelationships()
  }, [user])

  // Add timeout loading state to prevent infinite hanging
  const [showLoadingTimeout, setShowLoadingTimeout] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoadingTimeout(true)
    }, 2000) // 2 second timeout
    
    return () => clearTimeout(timer)
  }, [])

  // Only show loading for a brief period, then allow access
  if (isAuthLoading && !showLoadingTimeout) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clay-600 mx-auto mb-4"></div>
          <p className="text-lg text-stone-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Show auth prompt only if we're certain user isn't authenticated after timeout
  if (showLoadingTimeout && !user && !profile) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-lg text-stone-600 mb-4">Please sign in to view your profile</p>
          <Button onClick={() => router.push('/auth/signin')}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage('')
    
    try {
      const updated = await updateProfile(editData)
      if (updated) {
        setIsEditing(false)
        setMessage('Profile updated successfully!')
      } else {
        setMessage('Failed to update profile')
      }
    } catch (error) {
      setMessage('Error updating profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form data to original profile values
    if (profile) {
      setEditData({
        // Personal Info
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        display_name: profile.display_name || '',
        preferred_name: profile.preferred_name || '',
        bio: profile.bio || '',
        pronouns: profile.pronouns || '',
        date_of_birth: profile.date_of_birth || '',
        phone: profile.phone || '',
        avatar_url: profile.avatar_url || '',
        email: user?.email || profile.email || '',

        // Cultural & Storytelling
        cultural_background: profile.cultural_background || '',
        cultural_affiliations: profile.cultural_affiliations || [],
        languages_spoken: profile.languages_spoken || [],
        storytelling_experience: profile.storytelling_experience || '',
        is_storyteller: profile.is_storyteller || false,
        is_elder: profile.is_elder || false,
        traditional_knowledge_keeper: profile.traditional_knowledge_keeper || false,
        cultural_permissions: profile.cultural_permissions || {},
        cultural_protocols: profile.cultural_protocols || {},

        // Contact & Location
        address: profile.address || {},
        timezone: profile.timezone || '',
        emergency_contact: profile.emergency_contact || {},
        social_links: profile.social_links || {},
        preferred_communication: profile.preferred_communication || [],

        // Accessibility & Dietary
        dietary_requirements: profile.dietary_requirements || [],
        accessibility_needs: profile.accessibility_needs || [],

        // Community & Interests
        occupation: profile.occupation || '',
        current_role: profile.current_role || '',
        interests: profile.interests || [],
        community_roles: profile.community_roles || [],

        // Privacy & Consent
        profile_visibility: profile.profile_visibility || 'community',
        consent_preferences: profile.consent_preferences || {},
        privacy_settings: profile.privacy_settings || {},
        notification_preferences: profile.notification_preferences || {},

        // Admin Flags
        onboarding_completed: profile.onboarding_completed || false
      })
    }
    setIsEditing(false)
  }

  // Helper functions for array field management
  const addArrayItem = (field: keyof ProfileFormData, value: string) => {
    if (value.trim()) {
      setEditData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()]
      }))
    }
  }

  const removeArrayItem = (field: keyof ProfileFormData, index: number) => {
    setEditData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }))
  }

  // Location management functions
  const handleAddLocation = async (locationData: any) => {
    try {
      const response = await fetch('/api/profiles/me/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locationData)
      })

      if (response.ok) {
        const newLocation = await response.json()
        setLocations(prev => [...prev, newLocation])
        setMessage('Location added successfully!')
      } else {
        setMessage('Failed to add location')
      }
    } catch (error) {
      console.error('Error adding location:', error)
      setMessage('Error adding location')
    }
  }

  const handleRemoveLocation = async (id: string) => {
    try {
      const response = await fetch(`/api/profiles/me/locations?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setLocations(prev => prev.filter(loc => loc.id !== id))
        setMessage('Location removed successfully!')
      } else {
        setMessage('Failed to remove location')
      }
    } catch (error) {
      console.error('Error removing location:', error)
      setMessage('Error removing location')
    }
  }

  const handleToggleLocationVisibility = async (id: string) => {
    const location = locations.find(loc => loc.id === id)
    if (!location) return

    try {
      const response = await fetch('/api/profiles/me/locations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          is_public: !location.isPublic
        })
      })

      if (response.ok) {
        setLocations(prev =>
          prev.map(loc =>
            loc.id === id ? { ...loc, isPublic: !loc.isPublic } : loc
          )
        )
        setMessage('Location visibility updated!')
      } else {
        setMessage('Failed to update visibility')
      }
    } catch (error) {
      console.error('Error updating visibility:', error)
      setMessage('Error updating visibility')
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="cultural">Cultural</TabsTrigger>
          <TabsTrigger value="locations">
            <MapPin className="w-3 h-3 mr-1" />
            Locations
          </TabsTrigger>
          {profile?.is_storyteller && (
            <TabsTrigger value="storyteller">
              <BookOpen className="w-3 h-3 mr-1" />
              Storyteller
            </TabsTrigger>
          )}
          <TabsTrigger value="organizations">
            <Building2 className="w-3 h-3 mr-1" />
            Orgs
          </TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="accessibility">Access</TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield className="w-3 h-3 mr-1" />
            Privacy
          </TabsTrigger>
          {profile?.is_storyteller && (
            <TabsTrigger value="sharing">
              <Share2 className="w-3 h-3 mr-1" />
              Sharing
            </TabsTrigger>
          )}
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <ProfileOverviewTab
            profile={profile}
            user={user}
            storyCount={storyCount}
            organizations={organizations}
            projects={projects}
            locations={locations}
            onNavigateToTab={setActiveTab}
          />
        </TabsContent>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-6">
          <ProfilePersonalTab
            editData={editData}
            setEditData={setEditData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            isSaving={isSaving}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </TabsContent>

        {/* Cultural & Storytelling Tab */}
        <TabsContent value="cultural" className="space-y-6">
          <ProfileCulturalTab
            editData={editData}
            setEditData={setEditData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            isSaving={isSaving}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </TabsContent>

        {/* Contact & Location Tab */}
        <TabsContent value="contact" className="space-y-6">
          <ProfileContactTab
            editData={editData}
            setEditData={setEditData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            isSaving={isSaving}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </TabsContent>

        {/* Accessibility Tab */}
        <TabsContent value="accessibility" className="space-y-6">
          <ProfileAccessibilityTab
            editData={editData}
            setEditData={setEditData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            isSaving={isSaving}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <ProfilePrivacyTab
            isEditing={isEditing}
            privacySettings={{
              profile_visibility: editData.profile_visibility,
              show_email: false,
              show_phone: false,
              show_location: true,
              show_cultural_background: true,
              show_languages: true,
              show_organizations: true,
              show_projects: true,
              allow_messages: true,
              allow_story_requests: editData.is_storyteller,
              show_in_storyteller_directory: editData.is_storyteller
            }}
            consentPreferences={{
              data_collection: true,
              analytics: true,
              cultural_data_sharing: false,
              third_party_sharing: false,
              marketing_communications: false
            }}
            onPrivacyChange={(field, value) => setEditData({...editData, [field]: value})}
            onConsentChange={(field, value) => {
              const consent = editData.consent_preferences as Record<string, any> || {}
              setEditData({
                ...editData,
                consent_preferences: { ...consent, [field]: value }
              })
            }}
          />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <ProfileSettingsTab
            userEmail={user?.email}
            onSignOut={signOut}
          />
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-6">
          <ProfileLocationsTab
            isEditing={isEditing}
            locations={locations}
            onAddLocation={() => setShowLocationDialog(true)}
            onRemoveLocation={handleRemoveLocation}
            onToggleVisibility={handleToggleLocationVisibility}
          />
        </TabsContent>

        {/* Storyteller Tab */}
        {profile?.is_storyteller && (
          <TabsContent value="storyteller" className="space-y-6">
            <ProfileStorytellerTab
              isEditing={isEditing}
              isStoryteller={editData.is_storyteller}
              isElder={editData.is_elder}
              traditionalKnowledgeKeeper={editData.traditional_knowledge_keeper}
              storytellingExperience={editData.storytelling_experience}
              specialties={[]}
              preferredTopics={[]}
              storytellingStyle={[]}
              availabilityStatus=""
              yearsOfExperience={0}
              onFieldChange={(field, value) => setEditData({...editData, [field]: value})}
            />
          </TabsContent>
        )}

        {/* Organizations Tab */}
        <TabsContent value="organizations" className="space-y-6">
          <ProfileOrganizationsTab
            organizations={organizations}
            projects={projects}
            onViewOrganization={(id) => router.push(`/organisations/${id}`)}
            onViewProject={(id) => router.push(`/projects/${id}`)}
          />
        </TabsContent>

        {/* Sharing Tab - for storytellers */}
        {profile?.is_storyteller && (
          <TabsContent value="sharing" className="space-y-6">
            <SharingSettings />
          </TabsContent>
        )}
      </Tabs>

      {/* Location Dialog */}
      <AddLocationDialog
        open={showLocationDialog}
        onOpenChange={setShowLocationDialog}
        onAdd={handleAddLocation}
      />
    </div>
  )
}