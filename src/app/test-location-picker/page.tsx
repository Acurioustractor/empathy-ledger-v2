'use client'

import { useState } from 'react'
import { LocationPicker } from '@/components/ui/location-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestLocationPickerPage() {
  const [locationId, setLocationId] = useState<string | null>(null)
  const [locationText, setLocationText] = useState<string | null>(null)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Location Picker Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Location Picker</h3>
            <LocationPicker
              value={locationId}
              textValue={locationText}
              onChange={(id, text) => {
                setLocationId(id)
                setLocationText(text)
                console.log('Location changed:', { id, text })
              }}
              onCoordinatesChange={(lat, lng) => {
                setLatitude(lat)
                setLongitude(lng)
                console.log('Coordinates changed:', { lat, lng })
              }}
              allowFreeText={true}
              createIfNotFound={true}
              showCoordinates={true}
              showCulturalInfo={true}
              filterByCountry="Australia"
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Current Values</h3>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-medium">Location ID:</div>
                <div className="text-muted-foreground">{locationId || 'None'}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-medium">Location Text:</div>
                <div className="text-muted-foreground">{locationText || 'None'}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-medium">Latitude:</div>
                <div className="text-muted-foreground">{latitude || 'None'}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-medium">Longitude:</div>
                <div className="text-muted-foreground">{longitude || 'None'}</div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-2">Instructions</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Type at least 2 characters to search existing locations</li>
              <li>Select a location from the dropdown</li>
              <li>Or click "Enter custom location" to add a new location</li>
              <li>If createIfNotFound is enabled, new locations will be saved to the database</li>
              <li>Coordinates can be edited manually if showCoordinates is enabled</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}