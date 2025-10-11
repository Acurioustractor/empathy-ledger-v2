/**
 * Location Type Definitions
 * Centralized location types for consistent usage across the application
 */

export interface Location {
  id: string
  created_at: string
  updated_at: string
  name: string
  city: string | null
  state: string | null
  country: string | null
  postal_code: string | null
  latitude: number | null
  longitude: number | null
  description?: string | null
  indigenous_territory?: string | null
  language_group?: string | null
  cultural_significance?: string | null
  timezone?: string | null
  region_type?: string | null
  parent_location_id?: string | null
}

export interface LocationInput {
  name: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  latitude?: number
  longitude?: number
  description?: string
  indigenous_territory?: string
  language_group?: string
}

/**
 * Mixin interface for entities that can have location data
 */
export interface WithLocation {
  location_id: string | null
  location_text: string | null
  latitude: number | null
  longitude: number | null

  // Optional expanded location data (from join)
  location?: Location
}

/**
 * Helper type for location display
 */
export interface LocationDisplay {
  text: string
  city?: string
  state?: string
  country?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

/**
 * Location picker component props
 */
export interface LocationPickerProps {
  value: string | null              // location_id
  textValue?: string | null          // location_text fallback
  onChange: (locationId: string | null, locationText: string | null) => void
  onCoordinatesChange?: (lat: number | null, lng: number | null) => void

  // UI options
  allowFreeText?: boolean            // Allow custom text if location not in DB
  createIfNotFound?: boolean         // Auto-create location records
  showMap?: boolean                  // Show map picker
  filterByCountry?: string           // Limit to specific country
  placeholder?: string
  disabled?: boolean
  required?: boolean

  // Display options
  showCoordinates?: boolean
  showCulturalInfo?: boolean

  className?: string
}

/**
 * Geocoding result from external services
 */
export interface GeocodeResult {
  name: string
  city: string | null
  state: string | null
  country: string | null
  latitude: number
  longitude: number
  formatted_address: string
}

/**
 * Helper functions type
 */
export type LocationFormatter = (location: Location | LocationDisplay) => string
export type LocationParser = (text: string) => Partial<LocationInput>

/**
 * Utility type for entities with location - used in Stories, Transcripts, etc.
 */
export interface StoryLocation extends WithLocation {
  // Additional story-specific location fields if needed
}

export interface TranscriptLocation extends WithLocation {
  // Additional transcript-specific location fields if needed
}

export interface ProfileLocation extends WithLocation {
  // Profiles might have additional location complexity
  geographic_scope?: string
  geographic_connections?: string[]
}

export interface OrganizationLocation extends WithLocation {
  // Organizations use location as text currently
}

export interface ProjectLocation extends WithLocation {
  // Projects use location as text currently
}