'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, Landmark, Plus, Trash2, Eye, EyeOff, Globe2 } from 'lucide-react'

interface Location {
  id: string
  name: string
  type: 'current' | 'traditional' | 'birthplace' | 'significant'
  isPublic: boolean
  isPrimary: boolean
}

interface ProfileLocationsTabProps {
  isEditing: boolean
  locations: Location[]
  onAddLocation: () => void
  onRemoveLocation: (id: string) => void
  onToggleVisibility: (id: string) => void
}

export function ProfileLocationsTab({
  isEditing,
  locations = [],
  onAddLocation,
  onRemoveLocation,
  onToggleVisibility
}: ProfileLocationsTabProps) {

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'traditional': return <Landmark className="w-4 h-4 text-amber-600" />
      case 'current': return <MapPin className="w-4 h-4 text-earth-600" />
      default: return <Globe2 className="w-4 h-4 text-sage-600" />
    }
  }

  const getLocationTypeLabel = (type: string) => {
    switch (type) {
      case 'current': return 'Current Location'
      case 'traditional': return 'Traditional Territory'
      case 'birthplace': return 'Birthplace'
      case 'significant': return 'Significant Place'
      default: return 'Location'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-grey-900">Locations & Traditional Territory</h3>
          <p className="text-sm text-grey-600 mt-1">
            Manage your connection to place - current location, traditional territories, and significant places
          </p>
        </div>
        {isEditing && (
          <Button onClick={onAddLocation} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        )}
      </div>

      {/* Privacy Notice */}
      <Alert className="bg-sage-50 border-sage-200">
        <Eye className="w-4 h-4 text-sage-600" />
        <AlertDescription className="text-sm text-grey-700">
          <strong>Visibility Control:</strong> You can control which locations appear on your public profile.
          Traditional territories are especially important for cultural context.
        </AlertDescription>
      </Alert>

      {/* Locations List */}
      <div className="space-y-4">
        {locations.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin className="w-12 h-12 text-grey-300 mb-4" />
              <p className="text-grey-500 text-center mb-4">
                No locations added yet
              </p>
              {isEditing && (
                <Button onClick={onAddLocation} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Location
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          locations.map((location) => (
            <Card key={location.id} className={!location.isPublic ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getLocationIcon(location.type)}
                    <div>
                      <CardTitle className="text-base">
                        {location.name}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {getLocationTypeLabel(location.type)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {location.isPrimary && (
                      <Badge variant="secondary" className="text-xs">
                        Primary
                      </Badge>
                    )}
                    <Badge
                      variant={location.isPublic ? 'default' : 'outline'}
                      className={location.isPublic ? 'bg-green-100 text-green-800' : 'bg-grey-100 text-grey-600'}
                    >
                      {location.isPublic ? (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          Public
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          Private
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              {isEditing && (
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onToggleVisibility(location.id)}
                    >
                      {location.isPublic ? (
                        <>
                          <EyeOff className="w-3 h-3 mr-2" />
                          Make Private
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3 mr-2" />
                          Make Public
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onRemoveLocation(location.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-2" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Context Information */}
      <Card className="bg-clay-50 border-clay-200">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Landmark className="w-4 h-4 text-amber-600" />
            About Traditional Territory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-grey-700">
          <p>
            <strong>Traditional Territory</strong> refers to the ancestral lands of Indigenous peoples,
            where cultural practices, languages, and ways of life have been maintained for generations.
          </p>
          <p className="text-xs text-grey-600">
            Sharing your connection to traditional territory helps others understand the cultural context
            of your stories and experiences.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
