'use client'

import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { Check, ChevronsUpDown, MapPin, Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Location, LocationPickerProps } from '@/types/location'

/**
 * LocationPicker Component
 *
 * A flexible location picker that:
 * - Searches existing locations from database
 * - Allows free text input as fallback
 * - Optionally creates new location records
 * - Supports coordinate input for mapping
 *
 * @example
 * ```tsx
 * <LocationPicker
 *   value={story.location_id}
 *   textValue={story.location_text}
 *   onChange={(id, text) => {
 *     updateStory({ location_id: id, location_text: text })
 *   }}
 *   allowFreeText={true}
 *   createIfNotFound={true}
 * />
 * ```
 */
export function LocationPicker({
  value,
  textValue,
  onChange,
  onCoordinatesChange,
  allowFreeText = true,
  createIfNotFound = false,
  showMap = false,
  filterByCountry,
  placeholder = 'Select or enter location...',
  disabled = false,
  required = false,
  showCoordinates = false,
  showCulturalInfo = false,
  className,
}: LocationPickerProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [freeTextInput, setFreeTextInput] = useState(textValue || '')
  const [showFreeTextInput, setShowFreeTextInput] = useState(false)

  // Fetch locations from database
  const fetchLocations = useCallback(async (search: string) => {
    if (!search || search.length < 2) {
      setLocations([])
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        search,
        limit: '10'
      })

      if (filterByCountry) {
        params.append('country', filterByCountry)
      }

      const response = await fetch(`/api/locations?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLocations(data.locations || [])
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
    } finally {
      setLoading(false)
    }
  }, [filterByCountry])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        fetchLocations(searchTerm)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, fetchLocations])

  // Load selected location details
  useEffect(() => {
    if (value && !selectedLocation) {
      fetch(`/api/locations/${value}`)
        .then(res => res.json())
        .then(data => {
          if (data.location) {
            setSelectedLocation(data.location)
          }
        })
        .catch(console.error)
    }
  }, [value, selectedLocation])

  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location)
    onChange(location.id, location.name)

    if (onCoordinatesChange && location.latitude && location.longitude) {
      onCoordinatesChange(location.latitude, location.longitude)
    }

    setOpen(false)
    setShowFreeTextInput(false)
  }

  const handleFreeTextSubmit = async () => {
    if (!freeTextInput.trim()) return

    if (createIfNotFound) {
      // Create new location record
      try {
        const response = await fetch('/api/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: freeTextInput,
            city: extractCity(freeTextInput),
            country: filterByCountry || 'Australia',
          })
        })

        if (response.ok) {
          const data = await response.json()
          handleSelectLocation(data.location)
        }
      } catch (error) {
        console.error('Error creating location:', error)
        // Fall back to text-only
        onChange(null, freeTextInput)
      }
    } else {
      // Just use text value
      onChange(null, freeTextInput)
    }

    setShowFreeTextInput(false)
    setOpen(false)
  }

  const handleClear = () => {
    setSelectedLocation(null)
    setFreeTextInput('')
    onChange(null, null)
    if (onCoordinatesChange) {
      onCoordinatesChange(null, null)
    }
  }

  const displayValue = selectedLocation
    ? formatLocationDisplay(selectedLocation)
    : freeTextInput || textValue || ''

  return (
    <div className={cn('space-y-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'w-full justify-between',
              !displayValue && 'text-muted-foreground'
            )}
          >
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {displayValue || placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <div className="flex flex-col">
            {/* Search Input */}
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            {/* Results List */}
            <div className="max-h-[300px] overflow-y-auto">
              {loading ? (
                <div className="py-6 text-center text-sm">Searching...</div>
              ) : locations.length === 0 ? (
                <div className="py-6 text-center text-sm space-y-2">
                  <p>No locations found</p>
                  {allowFreeText && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowFreeTextInput(true)
                        setOpen(false)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Enter custom location
                    </Button>
                  )}
                </div>
              ) : (
                <div className="p-1">
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      onClick={() => {
                        console.log('Clicked location:', location)
                        handleSelectLocation(location)
                      }}
                      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-grey-100 active:bg-grey-200"
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === location.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{location.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {[location.city, location.state, location.country]
                            .filter(Boolean)
                            .join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}

                  {allowFreeText && (
                    <div
                      onClick={() => {
                        setShowFreeTextInput(true)
                        setOpen(false)
                      }}
                      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-grey-100 active:bg-grey-200 border-t mt-1 pt-2"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Enter custom location
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Free text input dialog */}
      {showFreeTextInput && (
        <div className="space-y-2 p-3 border rounded-md bg-muted">
          <Label>Custom Location</Label>
          <div className="flex gap-2">
            <Input
              value={freeTextInput}
              onChange={(e) => setFreeTextInput(e.target.value)}
              placeholder="Enter location name..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleFreeTextSubmit()
                }
              }}
            />
            <Button onClick={handleFreeTextSubmit} size="sm">
              {createIfNotFound ? 'Create' : 'Use'}
            </Button>
            <Button
              onClick={() => setShowFreeTextInput(false)}
              variant="ghost"
              size="sm"
            >
              Cancel
            </Button>
          </div>
          {createIfNotFound && (
            <p className="text-xs text-muted-foreground">
              This will create a new location record
            </p>
          )}
        </div>
      )}

      {/* Clear button */}
      {displayValue && !disabled && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-8"
        >
          Clear location
        </Button>
      )}

      {/* Coordinate inputs (if enabled) */}
      {showCoordinates && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="latitude" className="text-xs">
              Latitude
            </Label>
            <Input
              id="latitude"
              type="number"
              step="0.000001"
              value={selectedLocation?.latitude || ''}
              onChange={(e) => {
                const lat = parseFloat(e.target.value) || null
                if (onCoordinatesChange && selectedLocation?.longitude) {
                  onCoordinatesChange(lat, selectedLocation.longitude)
                }
              }}
              placeholder="-33.8688"
              className="h-8"
            />
          </div>
          <div>
            <Label htmlFor="longitude" className="text-xs">
              Longitude
            </Label>
            <Input
              id="longitude"
              type="number"
              step="0.000001"
              value={selectedLocation?.longitude || ''}
              onChange={(e) => {
                const lng = parseFloat(e.target.value) || null
                if (onCoordinatesChange && selectedLocation?.latitude) {
                  onCoordinatesChange(selectedLocation.latitude, lng)
                }
              }}
              placeholder="151.2093"
              className="h-8"
            />
          </div>
        </div>
      )}

      {/* Cultural info display (if enabled) */}
      {showCulturalInfo && selectedLocation?.indigenous_territory && (
        <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md">
          <div className="font-medium">Indigenous Territory</div>
          <div>{selectedLocation.indigenous_territory}</div>
        </div>
      )}
    </div>
  )
}

// Helper functions
function formatLocationDisplay(location: Location): string {
  return [location.name, location.city, location.state, location.country]
    .filter(Boolean)
    .join(', ')
}

function extractCity(text: string): string | null {
  // Simple heuristic: first part before comma
  const parts = text.split(',')
  return parts[0]?.trim() || null
}