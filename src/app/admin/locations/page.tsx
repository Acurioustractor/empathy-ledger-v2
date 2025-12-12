'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { LocationPicker } from '@/components/ui/location-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Search, Check, X, User } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Profile {
  id: string
  display_name: string
  email: string
  profile_image_url?: string
  profile_locations?: Array<{
    is_primary: boolean
    location: {
      name: string
      city: string | null
      state: string | null
      country: string
    }
  }>
}

export default function LocationManagementPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showOnlyMissing, setShowOnlyMissing] = useState(true)
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [primaryLocationId, setPrimaryLocationId] = useState<string | null>(null)
  const [traditionalLocationId, setTraditionalLocationId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchProfiles()
  }, [])

  useEffect(() => {
    let filtered = profiles

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by missing locations
    if (showOnlyMissing) {
      filtered = filtered.filter(p =>
        !p.profile_locations || p.profile_locations.length === 0
      )
    }

    setFilteredProfiles(filtered)
  }, [profiles, searchQuery, showOnlyMissing])

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/storytellers?page=1&limit=50')
      if (!response.ok) throw new Error('Failed to fetch profiles')

      const data = await response.json()
      setProfiles(data.storytellers || [])
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveLocation = async (profileId: string) => {
    if (!primaryLocationId) {
      alert('Please select at least a primary location')
      return
    }

    try {
      setSaving(true)

      // First, delete existing profile_locations
      await fetch(`/api/profiles/${profileId}/locations`, {
        method: 'DELETE'
      })

      // Add new locations
      const locations = []

      if (primaryLocationId) {
        locations.push({
          profile_id: profileId,
          location_id: primaryLocationId,
          is_primary: true,
          location_type: 'current'
        })
      }

      if (traditionalLocationId && traditionalLocationId !== primaryLocationId) {
        locations.push({
          profile_id: profileId,
          location_id: traditionalLocationId,
          is_primary: false,
          location_type: 'traditional'
        })
      }

      const response = await fetch(`/api/profiles/${profileId}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations })
      })

      if (!response.ok) throw new Error('Failed to save locations')

      setSuccessMessage(`✅ Saved locations for profile`)
      setTimeout(() => setSuccessMessage(''), 3000)

      // Reset form
      setSelectedProfile(null)
      setPrimaryLocationId(null)
      setTraditionalLocationId(null)

      // Refresh profiles
      fetchProfiles()
    } catch (error) {
      console.error('Error saving locations:', error)
      alert('Failed to save locations')
    } finally {
      setSaving(false)
    }
  }

  const getLocationDisplay = (profile: Profile) => {
    if (!profile.profile_locations || profile.profile_locations.length === 0) {
      return <Badge variant="secondary">No location</Badge>
    }

    const primary = profile.profile_locations.find(l => l.is_primary)
    if (primary?.location) {
      const parts = [
        primary.location.name,
        primary.location.city !== primary.location.name ? primary.location.city : null,
        primary.location.state,
        primary.location.country
      ].filter(Boolean)
      return <Badge variant="outline">{parts.join(', ')}</Badge>
    }

    return <Badge variant="secondary">Location data incomplete</Badge>
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p>Loading profiles...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Location Management</h1>
        <p className="text-muted-foreground">
          Assign locations to storyteller profiles. {profiles.filter(p => !p.profile_locations || p.profile_locations.length === 0).length} profiles missing locations.
        </p>
      </div>

      {successMessage && (
        <Alert className="mb-6">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile List */}
        <Card>
          <CardHeader>
            <CardTitle>Profiles</CardTitle>
            <CardDescription>
              Click a profile to assign location
            </CardDescription>

            {/* Filters */}
            <div className="space-y-4 pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyMissing}
                  onChange={(e) => setShowOnlyMissing(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Show only profiles without locations</span>
              </label>
            </div>
          </CardHeader>

          <CardContent className="max-h-[600px] overflow-y-auto">
            <div className="space-y-2">
              {filteredProfiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => {
                    setSelectedProfile(profile.id)
                    setPrimaryLocationId(null)
                    setTraditionalLocationId(null)
                  }}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedProfile === profile.id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        {profile.profile_image_url ? (
                          <img
                            src={profile.profile_image_url}
                            alt={profile.display_name || ''}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {profile.display_name || 'Unnamed'}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {profile.email}
                        </p>
                        <div className="mt-1">
                          {getLocationDisplay(profile)}
                        </div>
                      </div>
                    </div>
                    {selectedProfile === profile.id && (
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}

              {filteredProfiles.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No profiles found
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Assign Locations</CardTitle>
            <CardDescription>
              {selectedProfile ? 'Select locations for this profile' : 'Select a profile first'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {!selectedProfile ? (
              <div className="text-center text-muted-foreground py-12">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Select a profile from the list to assign locations</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Primary Location (Current) *
                  </label>
                  <LocationPicker
                    value={primaryLocationId}
                    onChange={(id) => setPrimaryLocationId(id)}
                    filterByCountry="Australia"
                    createIfNotFound={true}
                    allowFreeText={true}
                    placeholder="Search or enter location..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Where they currently live
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Traditional Territory (Optional)
                  </label>
                  <LocationPicker
                    value={traditionalLocationId}
                    onChange={(id) => setTraditionalLocationId(id)}
                    createIfNotFound={true}
                    allowFreeText={true}
                    showCulturalInfo={true}
                    placeholder="Search or enter traditional country..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Cultural connection or traditional country
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => saveLocation(selectedProfile)}
                    disabled={!primaryLocationId || saving}
                    className="flex-1"
                  >
                    {saving ? 'Saving...' : 'Save Locations'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedProfile(null)
                      setPrimaryLocationId(null)
                      setTraditionalLocationId(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}