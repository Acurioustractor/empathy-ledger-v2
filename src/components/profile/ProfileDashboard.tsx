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
import { ProfilePersonalTab } from './tabs/ProfilePersonalTab'
import { ProfileLocationsTab } from './tabs/ProfileLocationsTab'
import { ProfileStorytellerTab } from './tabs/ProfileStorytellerTab'
import { ProfileOrganizationsTab } from './tabs/ProfileOrganizationsTab'
import { ProfilePrivacyTab } from './tabs/ProfilePrivacyTab'
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
  Landmark
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
          <p className="text-lg text-grey-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Show auth prompt only if we're certain user isn't authenticated after timeout
  if (showLoadingTimeout && !user && !profile) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-lg text-grey-600 mb-4">Please sign in to view your profile</p>
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

  // Helper component for array field management
  const ArrayFieldEditor = ({ 
    field, 
    label, 
    placeholder 
  }: { 
    field: keyof ProfileFormData
    label: string
    placeholder: string 
  }) => {
    const [newItem, setNewItem] = useState('')
    const items = editData[field] as string[]

    return (
      <div>
        <Label className="text-sm font-medium mb-2 block">{label}</Label>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input 
                value={item}
                onChange={(e) => {
                  const newItems = [...items]
                  newItems[index] = e.target.value
                  setEditData(prev => ({ ...prev, [field]: newItems }))
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeArrayItem(field, index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={placeholder}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                addArrayItem(field, newItem)
                setNewItem('')
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    )
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
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-clay-500 to-sage-600 flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      {profile?.display_name || profile?.full_name || profile?.first_name || 'User'}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>{user?.email}</span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {profile?.is_elder && (
                    <Badge variant="secondary" className="bg-sage-100 text-sage-800">
                      <Crown className="w-3 h-3 mr-1" />
                      Elder
                    </Badge>
                  )}
                  {profile?.is_storyteller && (
                    <Badge variant="secondary" className="bg-clay-100 text-clay-800">
                      <BookOpen className="w-3 h-3 mr-1" />
                      Storyteller
                    </Badge>
                  )}
                  {profile?.traditional_knowledge_keeper && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      <Crown className="w-3 h-3 mr-1" />
                      Knowledge Keeper
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-earth-50 rounded-lg border border-earth-200">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-earth-600" />
                  <div className="text-2xl font-bold">{storyCount}</div>
                  <div className="text-sm text-grey-600">Stories Created</div>
                </div>
                <div className="text-center p-4 bg-sage-50 rounded-lg border border-sage-200">
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-sage-600" />
                  <div className="text-2xl font-bold">{organizations.length}</div>
                  <div className="text-sm text-grey-600">Organizations</div>
                </div>
                <div className="text-center p-4 bg-clay-50 rounded-lg border border-clay-200">
                  <FolderKanban className="w-8 h-8 mx-auto mb-2 text-clay-600" />
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <div className="text-sm text-grey-600">Projects</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{locations.length}</div>
                  <div className="text-sm text-grey-600">Locations</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`grid grid-cols-1 ${profile?.is_storyteller ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
                {profile?.is_storyteller && user?.id && (
                  <Button 
                    onClick={() => router.push(`/storytellers/${user.id}/dashboard`)} 
                    variant="cultural-primary"
                    className="h-auto p-4 col-span-full md:col-span-1"
                  >
                    <div className="text-center">
                      <BarChart3 className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">Storyteller Dashboard</div>
                      <div className="text-sm opacity-80">Your command centre</div>
                    </div>
                  </Button>
                )}
                <Button onClick={() => router.push('/stories/create')} className="h-auto p-4">
                  <div className="text-center">
                    <BookOpen className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Create New Story</div>
                    <div className="text-sm opacity-80">Share your experiences</div>
                  </div>
                </Button>
                <Button onClick={() => setActiveTab('personal')} variant="outline" className="h-auto p-4">
                  <div className="text-center">
                    <Edit3 className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Edit Profile</div>
                    <div className="text-sm opacity-80">Update your information</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cultural & Storytelling</CardTitle>
                  <CardDescription>Cultural background, languages, and storytelling experience</CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button onClick={handleSave} size="sm" disabled={isSaving}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cultural Background */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cultural Identity</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label>Cultural Background</Label>
                    {isEditing ? (
                      <Textarea
                        value={editData.cultural_background}
                        onChange={(e) => setEditData({...editData, cultural_background: e.target.value})}
                        placeholder="Describe your cultural heritage and background"
                        rows={3}
                      />
                    ) : (
                      <div className="p-3 bg-muted/50 rounded-md min-h-[80px]">
                        {editData.cultural_background || 'Not set'}
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <>
                      <ArrayFieldEditor
                        field="cultural_affiliations"
                        label="Cultural Affiliations"
                        placeholder="Add cultural affiliation"
                      />
                      <ArrayFieldEditor
                        field="languages_spoken"
                        label="Languages Spoken"
                        placeholder="Add language"
                      />
                    </>
                  )}
                  {!isEditing && (
                    <>
                      <div>
                        <Label>Cultural Affiliations</Label>
                        <div className="p-3 bg-muted/50 rounded-md">
                          {editData.cultural_affiliations.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {editData.cultural_affiliations.map((affiliation, index) => (
                                <Badge key={index} variant="secondary">{affiliation}</Badge>
                              ))}
                            </div>
                          ) : (
                            'None added'
                          )}
                        </div>
                      </div>
                      <div>
                        <Label>Languages Spoken</Label>
                        <div className="p-3 bg-muted/50 rounded-md">
                          {editData.languages_spoken.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {editData.languages_spoken.map((language, index) => (
                                <Badge key={index} variant="secondary">{language}</Badge>
                              ))}
                            </div>
                          ) : (
                            'None added'
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Storytelling & Roles */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Storytelling & Community Roles</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label>Storytelling Experience</Label>
                    {isEditing ? (
                      <Textarea
                        value={editData.storytelling_experience}
                        onChange={(e) => setEditData({...editData, storytelling_experience: e.target.value})}
                        placeholder="Describe your storytelling background and experience"
                        rows={3}
                      />
                    ) : (
                      <div className="p-3 bg-muted/50 rounded-md min-h-[80px]">
                        {editData.storytelling_experience || 'Not set'}
                      </div>
                    )}
                  </div>
                  
                  {/* Role Toggles */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label>Storyteller</Label>
                        <p className="text-sm text-muted-foreground">Share stories with the community</p>
                      </div>
                      {isEditing ? (
                        <Switch
                          checked={editData.is_storyteller}
                          onCheckedChange={(checked) => setEditData({...editData, is_storyteller: checked})}
                        />
                      ) : (
                        <Badge variant={editData.is_storyteller ? "default" : "secondary"}>
                          {editData.is_storyteller ? 'Yes' : 'No'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label>Elder</Label>
                        <p className="text-sm text-muted-foreground">Recognized community elder</p>
                      </div>
                      {isEditing ? (
                        <Switch
                          checked={editData.is_elder}
                          onCheckedChange={(checked) => setEditData({...editData, is_elder: checked})}
                        />
                      ) : (
                        <Badge variant={editData.is_elder ? "default" : "secondary"}>
                          {editData.is_elder ? 'Yes' : 'No'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label>Knowledge Keeper</Label>
                        <p className="text-sm text-muted-foreground">Guardian of traditional knowledge</p>
                      </div>
                      {isEditing ? (
                        <Switch
                          checked={editData.traditional_knowledge_keeper}
                          onCheckedChange={(checked) => setEditData({...editData, traditional_knowledge_keeper: checked})}
                        />
                      ) : (
                        <Badge variant={editData.traditional_knowledge_keeper ? "default" : "secondary"}>
                          {editData.traditional_knowledge_keeper ? 'Yes' : 'No'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact & Location Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Contact & Location</CardTitle>
                  <CardDescription>Address, emergency contacts, and communication preferences</CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button onClick={handleSave} size="sm" disabled={isSaving}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Communication Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Communication</h3>
                {isEditing && (
                  <ArrayFieldEditor
                    field="preferred_communication"
                    label="Preferred Communication Methods"
                    placeholder="e.g., Email, Phone, Text"
                  />
                )}
                {!isEditing && (
                  <div>
                    <Label>Preferred Communication Methods</Label>
                    <div className="p-3 bg-muted/50 rounded-md">
                      {editData.preferred_communication.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {editData.preferred_communication.map((method, index) => (
                            <Badge key={index} variant="secondary">{method}</Badge>
                          ))}
                        </div>
                      ) : (
                        'None specified'
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Professional</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Occupation</Label>
                    {isEditing ? (
                      <Input
                        value={editData.occupation}
                        onChange={(e) => setEditData({...editData, occupation: e.target.value})}
                        placeholder="Your occupation"
                      />
                    ) : (
                      <div className="p-3 bg-muted/50 rounded-md">{editData.occupation || 'Not set'}</div>
                    )}
                  </div>
                  <div>
                    <Label>Current Role</Label>
                    {isEditing ? (
                      <Input
                        value={editData.current_role}
                        onChange={(e) => setEditData({...editData, current_role: e.target.value})}
                        placeholder="Your current role"
                      />
                    ) : (
                      <div className="p-3 bg-muted/50 rounded-md">{editData.current_role || 'Not set'}</div>
                    )}
                  </div>
                </div>
                {isEditing && (
                  <>
                    <ArrayFieldEditor
                      field="interests"
                      label="Interests"
                      placeholder="Add interest"
                    />
                    <ArrayFieldEditor
                      field="community_roles"
                      label="Community Roles"
                      placeholder="Add community role"
                    />
                  </>
                )}
                {!isEditing && (
                  <>
                    <div>
                      <Label>Interests</Label>
                      <div className="p-3 bg-muted/50 rounded-md">
                        {editData.interests.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {editData.interests.map((interest, index) => (
                              <Badge key={index} variant="secondary">{interest}</Badge>
                            ))}
                          </div>
                        ) : (
                          'None added'
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>Community Roles</Label>
                      <div className="p-3 bg-muted/50 rounded-md">
                        {editData.community_roles.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {editData.community_roles.map((role, index) => (
                              <Badge key={index} variant="secondary">{role}</Badge>
                            ))}
                          </div>
                        ) : (
                          'None added'
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accessibility Tab */}
        <TabsContent value="accessibility" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Accessibility & Dietary</CardTitle>
                  <CardDescription>Accessibility needs and dietary requirements</CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button onClick={handleSave} size="sm" disabled={isSaving}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing && (
                <>
                  <ArrayFieldEditor
                    field="accessibility_needs"
                    label="Accessibility Needs"
                    placeholder="Add accessibility need"
                  />
                  <ArrayFieldEditor
                    field="dietary_requirements"
                    label="Dietary Requirements"
                    placeholder="Add dietary requirement"
                  />
                </>
              )}
              {!isEditing && (
                <>
                  <div>
                    <Label>Accessibility Needs</Label>
                    <div className="p-3 bg-muted/50 rounded-md">
                      {editData.accessibility_needs.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {editData.accessibility_needs.map((need, index) => (
                            <Badge key={index} variant="secondary">
                              <Accessibility className="w-3 h-3 mr-1" />
                              {need}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        'None specified'
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Dietary Requirements</Label>
                    <div className="p-3 bg-muted/50 rounded-md">
                      {editData.dietary_requirements.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {editData.dietary_requirements.map((requirement, index) => (
                            <Badge key={index} variant="secondary">
                              <Utensils className="w-3 h-3 mr-1" />
                              {requirement}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        'None specified'
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
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
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences and security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Email Address</h4>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <Button variant="outline" size="sm">Change Email</Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-muted-foreground">Last updated recently</p>
                </div>
                <Button variant="outline" size="sm">Change Password</Button>
              </div>
              
              <div className="pt-4 border-t">
                <Button onClick={signOut} variant="destructive">
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
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