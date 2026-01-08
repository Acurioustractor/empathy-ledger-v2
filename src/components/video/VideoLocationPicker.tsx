'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  MapPin,
  Search,
  Loader2,
  Save,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Globe,
  Navigation,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'

// Dynamically import LeafletMap to avoid SSR issues
const LeafletMap = dynamic(
  () => import('@/components/media/LeafletMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] flex items-center justify-center bg-stone-100 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    )
  }
)

export interface VideoLocationData {
  latitude: number
  longitude: number
  placeName?: string
  placeId?: string
  indigenousTerritory?: string
  traditionalName?: string
  locality?: string
  region?: string
  country?: string
  source?: string
}

interface VideoLocationPickerProps {
  videoId: string
  initialLocation?: VideoLocationData | null
  onSave?: (location: VideoLocationData) => void
  onRemove?: () => void
  readOnly?: boolean
  className?: string
}

// Australian indigenous territories (sample data)
const INDIGENOUS_TERRITORIES = [
  { name: 'Wurundjeri', bounds: { lat: [-37.9, -37.7], lng: [144.9, 145.2] } },
  { name: 'Gadigal', bounds: { lat: [-34.0, -33.8], lng: [151.1, 151.3] } },
  { name: 'Kaurna', bounds: { lat: [-35.0, -34.7], lng: [138.4, 138.8] } },
  { name: 'Ngunnawal', bounds: { lat: [-35.5, -35.2], lng: [149.0, 149.3] } },
  { name: 'Turrbal', bounds: { lat: [-27.6, -27.3], lng: [152.9, 153.2] } },
  { name: 'Jagera', bounds: { lat: [-27.7, -27.4], lng: [152.8, 153.1] } },
  { name: 'Larrakia', bounds: { lat: [-12.6, -12.3], lng: [130.7, 131.0] } },
  { name: 'Whadjuk', bounds: { lat: [-32.1, -31.8], lng: [115.7, 116.0] } },
]

function findIndigenousTerritory(lat: number, lng: number): string | undefined {
  for (const territory of INDIGENOUS_TERRITORIES) {
    if (
      lat >= territory.bounds.lat[0] &&
      lat <= territory.bounds.lat[1] &&
      lng >= territory.bounds.lng[0] &&
      lng <= territory.bounds.lng[1]
    ) {
      return territory.name
    }
  }
  return undefined
}

// Geocoding using Nominatim (OpenStreetMap)
async function searchLocation(query: string): Promise<Array<{
  display_name: string
  lat: string
  lon: string
  place_id: string
  address?: {
    city?: string
    town?: string
    village?: string
    state?: string
    country?: string
  }
}>> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      { headers: { 'User-Agent': 'EmpathyLedger/1.0' } }
    )
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Geocoding error:', error)
  }
  return []
}

// Reverse geocoding
async function reverseGeocode(lat: number, lng: number): Promise<{
  display_name: string
  address?: {
    city?: string
    town?: string
    village?: string
    state?: string
    country?: string
  }
} | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      { headers: { 'User-Agent': 'EmpathyLedger/1.0' } }
    )
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error)
  }
  return null
}

export function VideoLocationPicker({
  videoId,
  initialLocation,
  onSave,
  onRemove,
  readOnly = false,
  className,
}: VideoLocationPickerProps) {
  const [location, setLocation] = useState<VideoLocationData | null>(initialLocation || null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Map state
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    initialLocation ? [initialLocation.latitude, initialLocation.longitude] : null
  )

  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const mapRef = useRef<any>(null)

  // Load location from API
  useEffect(() => {
    async function loadLocation() {
      if (!videoId) return
      setLoading(true)
      try {
        const response = await fetch(`/api/videos/${videoId}/location`)
        if (response.ok) {
          const data = await response.json()
          if (data.location) {
            setLocation(data.location)
            setMarkerPosition([data.location.latitude, data.location.longitude])
          }
        }
      } catch (err) {
        console.error('Failed to load location:', err)
      } finally {
        setLoading(false)
      }
    }

    if (!initialLocation) {
      loadLocation()
    }
  }, [videoId, initialLocation])

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true)
      const results = await searchLocation(searchQuery)
      setSearchResults(results)
      setShowResults(true)
      setSearching(false)
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  // Handle map click
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    if (readOnly) return

    setMarkerPosition([lat, lng])
    setError(null)
    setSuccess(null)

    // Auto-detect indigenous territory
    const territory = findIndigenousTerritory(lat, lng)

    // Reverse geocode to get place name and address details
    const geoResult = await reverseGeocode(lat, lng)

    setLocation({
      latitude: lat,
      longitude: lng,
      placeName: geoResult?.display_name,
      indigenousTerritory: territory,
      locality: geoResult?.address?.city || geoResult?.address?.town || geoResult?.address?.village,
      region: geoResult?.address?.state,
      country: geoResult?.address?.country,
      source: 'map_click'
    })
  }, [readOnly])

  // Handle search result selection
  const handleSelectResult = async (result: any) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)

    setMarkerPosition([lat, lng])
    setShowResults(false)
    setSearchQuery(result.display_name)

    // Auto-detect indigenous territory
    const territory = findIndigenousTerritory(lat, lng)

    setLocation({
      latitude: lat,
      longitude: lng,
      placeName: result.display_name,
      placeId: result.place_id,
      indigenousTerritory: territory,
      locality: result.address?.city || result.address?.town || result.address?.village,
      region: result.address?.state,
      country: result.address?.country,
      source: 'search'
    })

    // Center map on selected location
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], 12)
    }
  }

  // Save location
  const handleSave = async () => {
    if (!location) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/videos/${videoId}/location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(location)
      })

      if (response.ok) {
        const data = await response.json()
        setLocation(data.location)
        setSuccess('Location saved successfully')
        onSave?.(data.location)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save location')
      }
    } catch (err) {
      setError('Failed to save location')
    } finally {
      setSaving(false)
    }
  }

  // Remove location
  const handleRemove = async () => {
    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/videos/${videoId}/location`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setLocation(null)
        setMarkerPosition(null)
        setSearchQuery('')
        setSuccess('Location removed')
        onRemove?.()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to remove location')
      }
    } catch (err) {
      setError('Failed to remove location')
    } finally {
      setSaving(false)
    }
  }

  // Use current location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        handleMapClick(latitude, longitude)
        if (mapRef.current) {
          mapRef.current.flyTo([latitude, longitude], 14)
        }
        setLoading(false)
      },
      () => {
        setError('Failed to get your location')
        setLoading(false)
      }
    )
  }

  const hasChanges = location && !initialLocation ||
    (location && initialLocation && (
      location.latitude !== initialLocation.latitude ||
      location.longitude !== initialLocation.longitude
    ))

  // Show loading state only during initial API fetch
  if (loading && !location && !markerPosition) {
    return (
      <div className={cn('py-8 text-center', className)}>
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-stone-400" />
        <p className="mt-2 text-sm text-stone-500">Loading location...</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Status messages */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Search bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a location..."
              className="pl-10"
              disabled={readOnly}
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-stone-400" />
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleUseCurrentLocation}
            disabled={readOnly || loading}
            title="Use my current location"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </div>

        {/* Search results dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result, i) => (
              <button
                key={i}
                className="w-full px-4 py-2 text-left text-sm hover:bg-stone-100 border-b last:border-0"
                onClick={() => handleSelectResult(result)}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-stone-400 flex-shrink-0" />
                  <span className="line-clamp-2">{result.display_name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="relative h-[250px] rounded-lg overflow-hidden border border-stone-200">
        <LeafletMap
          markerPosition={markerPosition}
          onMapClick={readOnly ? undefined : handleMapClick}
          mapRef={mapRef}
        />

        {/* Click instruction overlay */}
        {!readOnly && !markerPosition && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-black/70 text-white text-sm px-3 py-2 rounded-lg text-center pointer-events-none">
            Click on the map to set location, or search above
          </div>
        )}
      </div>

      {/* Location details */}
      {location && (
        <div className="space-y-3 p-4 bg-stone-50 rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sage-600" />
              Location Details
            </h4>
            {location.source && (
              <Badge variant="outline" className="text-xs">
                {location.source === 'map_click' ? 'Map click' :
                 location.source === 'search' ? 'Search' :
                 location.source === 'manual' ? 'Manual' : location.source}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <Label className="text-xs text-stone-500">Latitude</Label>
              <p className="font-mono">{location.latitude.toFixed(6)}</p>
            </div>
            <div>
              <Label className="text-xs text-stone-500">Longitude</Label>
              <p className="font-mono">{location.longitude.toFixed(6)}</p>
            </div>
          </div>

          {(location.locality || location.region || location.country) && (
            <div className="text-sm">
              <Label className="text-xs text-stone-500">Address</Label>
              <p>
                {[location.locality, location.region, location.country]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </div>
          )}

          {location.indigenousTerritory && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple-600" />
              <div>
                <Label className="text-xs text-stone-500">Traditional Land</Label>
                <p className="text-sm font-medium text-purple-800">
                  {location.indigenousTerritory} Country
                </p>
              </div>
            </div>
          )}

          {/* Traditional name input */}
          {!readOnly && (
            <div>
              <Label className="text-xs text-stone-500">Traditional Name (optional)</Label>
              <Input
                value={location.traditionalName || ''}
                onChange={(e) => setLocation({
                  ...location,
                  traditionalName: e.target.value
                })}
                placeholder="Enter traditional/indigenous name..."
                className="mt-1"
              />
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {!readOnly && (
        <div className="flex items-center justify-between pt-2">
          {location && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={saving}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          )}
          <div className="flex-1" />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !location || !hasChanges}
            className="bg-sage-600 hover:bg-sage-700"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Save Location
          </Button>
        </div>
      )}
    </div>
  )
}

export default VideoLocationPicker
