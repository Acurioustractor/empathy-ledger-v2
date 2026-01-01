'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Users, BookOpen, Loader2, Globe2 } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { cn } from '@/lib/utils'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
)

// Cultural territory and story data types
interface CulturalLocation {
  id: string
  name: string
  coordinates: [number, number] // [latitude, longitude]
  culturalGroup: string
  traditionalTerritory?: string
  storyCount: number
  storytellerCount: number
  description: string
  establishedYear?: number
  languages: string[]
  culturalFocus: string[]
  stories: {
    id: string
    title: string
    excerpt: string
    storyteller: string
    type: 'traditional' | 'personal' | 'historical' | 'educational'
  }[]
}

// Sample cultural locations data
const sampleLocations: CulturalLocation[] = [
  {
    id: '1',
    name: 'Coastal Nations Cultural Center',
    coordinates: [49.2827, -123.1207], // Vancouver area
    culturalGroup: 'Coast Salish',
    traditionalTerritory: 'Musqueam, Squamish, Tsleil-Waututh Traditional Territory',
    storyCount: 45,
    storytellerCount: 12,
    description: 'A vibrant community centre preserving Coast Salish stories, traditions, and wisdom.',
    establishedYear: 1995,
    languages: ['Halkomelem', 'Squamish', 'English'],
    culturalFocus: ['Traditional Stories', 'Canoe Culture', 'Cedar Traditions'],
    stories: [
      {
        id: '1',
        title: 'The Story of Saysutshun (Gabriola Island)',
        excerpt: 'A traditional story about the flat island and its significance...',
        storyteller: 'Elder Mary George',
        type: 'traditional'
      },
      {
        id: '2',
        title: 'Cedar: The Tree of Life',
        excerpt: 'How cedar became central to our way of life and survival...',
        storyteller: 'Robert Point',
        type: 'educational'
      }
    ]
  },
  {
    id: '2',
    name: 'Plains Heritage Lodge',
    coordinates: [50.4452, -104.6189], // Saskatchewan area
    culturalGroup: 'Cree Nation',
    traditionalTerritory: 'Treaty 4 Territory',
    storyCount: 32,
    storytellerCount: 8,
    description: 'Preserving Plains Cree stories, buffalo culture, and prairie wisdom.',
    establishedYear: 1987,
    languages: ['Plains Cree', 'English'],
    culturalFocus: ['Buffalo Stories', 'Medicine Wheel Teachings', 'Star Knowledge'],
    stories: [
      {
        id: '3',
        title: 'When the Buffalo Returned',
        excerpt: 'A story of resilience and the sacred relationship with buffalo...',
        storyteller: 'Elder Joseph Crowfeather',
        type: 'traditional'
      }
    ]
  },
  {
    id: '3',
    name: 'Arctic Community Stories',
    coordinates: [69.5037, -133.0021], // Inuvik area
    culturalGroup: 'Inuvialuit',
    traditionalTerritory: 'Inuvialuit Settlement Region',
    storyCount: 28,
    storytellerCount: 6,
    description: 'Preserving Arctic stories, hunting traditions, and ice knowledge.',
    establishedYear: 2001,
    languages: ['Inuvialuktun', 'English'],
    culturalFocus: ['Sea Ice Stories', 'Polar Bear Relations', 'Arctic Survival'],
    stories: [
      {
        id: '4',
        title: 'Reading the Ice',
        excerpt: 'Traditional knowledge of sea ice patterns and safety...',
        storyteller: 'Sarah Kanguq',
        type: 'educational'
      }
    ]
  }
]

interface InteractiveMapProps {
  className?: string
  height?: string
  showLocationDetails?: boolean
  selectedLocationId?: string | null
  onLocationSelect?: (location: CulturalLocation) => void
}

export default function InteractiveMap({
  className,
  height = '500px',
  showLocationDetails = true,
  selectedLocationId,
  onLocationSelect
}: InteractiveMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<CulturalLocation | null>(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  // Handle client-side rendering for Leaflet
  useEffect(() => {
    setIsClient(true)
    
    // Dynamically import Leaflet CSS and setup
    import('leaflet/dist/leaflet.css')
    import('leaflet').then((L) => {
      // Fix default marker icons in webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        iconUrl: '/leaflet/marker-icon.png',
        shadowUrl: '/leaflet/marker-shadow.png',
      })
      setLeafletLoaded(true)
    })
  }, [])

  const handleLocationClick = (location: CulturalLocation) => {
    setSelectedLocation(location)
    onLocationSelect?.(location)
  }

  // Cultural-themed custom marker icon
  const createCulturalIcon = (location: CulturalLocation) => {
    if (typeof window === 'undefined') return null
    
    return new (window as any).L.DivIcon({
      html: `
        <div class="bg-gradient-to-br from-clay-500 to-sage-600 w-8 h-8 rounded-full border-2 border-white shadow-cultural flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
          </svg>
        </div>
      `,
      className: 'cultural-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    })
  }

  if (!isClient || !leafletLoaded) {
    return (
      <div 
        className={cn("flex items-center justify-center bg-gradient-to-br from-clay-100 to-sage-100 dark:from-clay-950/20 dark:to-sage-950/10 rounded-lg border border-stone-200 dark:border-stone-800", className)}
        style={{ height }}
      >
        <div className="text-center space-y-4 p-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-clay-500 to-sage-600 flex items-center justify-center">
              <Globe2 className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
          <Typography variant="cultural-subheading" className="text-stone-600 dark:text-stone-400">
            Loading Cultural Map
          </Typography>
          <Typography variant="caption" className="text-stone-500">
            Preparing to explore traditional territories and cultural stories...
          </Typography>
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-clay-500" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative rounded-lg overflow-hidden border border-stone-200 dark:border-stone-800 shadow-cultural">
        <MapContainer
          centre={[60.0, -110.0]} // Centered on Canada
          zoom={4}
          style={{ height, width: '100%' }}
          className="z-0"
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {sampleLocations.map((location) => (
            <React.Fragment key={location.id}>
              {/* Cultural territory circle */}
              <Circle
                centre={location.coordinates}
                radius={50000} // 50km radius
                pathOptions={{
                  colour: '#a68b6c', // clay-600
                  fillColor: '#6f7a6f', // sage-500
                  fillOpacity: 0.1,
                  weight: 2,
                  opacity: 0.6
                }}
              />
              
              {/* Cultural centre marker */}
              <Marker
                position={location.coordinates}
                icon={createCulturalIcon(location)}
                eventHandlers={{
                  click: () => handleLocationClick(location)
                }}
              >
                <Popup
                  maxWidth={300}
                  className="cultural-popup"
                >
                  <div className="p-2">
                    <Typography variant="h6" className="mb-2 text-clay-800">
                      {location.name}
                    </Typography>
                    <Typography variant="body-small" className="mb-3 text-stone-600">
                      {location.description}
                    </Typography>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-sage-600" />
                        <Typography variant="caption">
                          {location.storyCount} stories
                        </Typography>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-clay-600" />
                        <Typography variant="caption">
                          {location.storytellerCount} storytellers
                        </Typography>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {location.culturalFocus.slice(0, 2).map((focus, index) => (
                        <Badge key={index} variant="clay-soft" size="sm">
                          {focus}
                        </Badge>
                      ))}
                    </div>

                    <Button
                      variant="cultural-primary"
                      size="sm"
                      className="w-full"
                      onClick={() => handleLocationClick(location)}
                    >
                      Explore Stories
                    </Button>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}
        </MapContainer>

        {/* Map Legend */}
        <div className="absolute top-4 right-4 z-10">
          <Card variant="cultural" size="compact" className="bg-background/95 backdrop-blur-sm">
            <CardContent className="p-3">
              <Typography variant="small" className="font-semibold mb-2 text-clay-700 dark:text-clay-300">
                Cultural Territories
              </Typography>
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-clay-500 to-sage-600" />
                  <span className="text-stone-600 dark:text-stone-400">Cultural Centers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full border-2 border-sage-500 bg-sage-500/10" />
                  <span className="text-stone-600 dark:text-stone-400">Traditional Territories</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Location Details Panel */}
      {showLocationDetails && selectedLocation && (
        <Card variant="cultural" className="mt-6">
          <CardHeader cultural>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle cultural className="text-xl">
                  {selectedLocation.name}
                </CardTitle>
                <CardDescription cultural className="mt-1">
                  {selectedLocation.traditionalTerritory && (
                    <span className="text-sage-600 dark:text-sage-400 font-medium">
                      {selectedLocation.traditionalTerritory}
                    </span>
                  )}
                </CardDescription>
              </div>
              <Badge variant="cultural-storyteller" size="cultural">
                {selectedLocation.culturalGroup}
              </Badge>
            </div>
          </CardHeader>

          <CardContent cultural>
            <Typography variant="body" className="mb-6">
              {selectedLocation.description}
            </Typography>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-stone-50 dark:bg-stone-900/30 rounded-lg">
              <div className="text-center">
                <Typography variant="cultural-heading" className="text-clay-600 dark:text-clay-400">
                  {selectedLocation.storyCount}
                </Typography>
                <Typography variant="caption">Stories</Typography>
              </div>
              <div className="text-center">
                <Typography variant="cultural-heading" className="text-sage-600 dark:text-sage-400">
                  {selectedLocation.storytellerCount}
                </Typography>
                <Typography variant="caption">Storytellers</Typography>
              </div>
              <div className="text-center">
                <Typography variant="cultural-heading" className="text-sky-600 dark:text-sky-400">
                  {selectedLocation.languages.length}
                </Typography>
                <Typography variant="caption">Languages</Typography>
              </div>
              <div className="text-center">
                <Typography variant="cultural-heading" className="text-stone-600 dark:text-stone-400">
                  {selectedLocation.establishedYear || 'N/A'}
                </Typography>
                <Typography variant="caption">Established</Typography>
              </div>
            </div>

            {/* Cultural Focus Areas */}
            <div className="mb-6">
              <Typography variant="h6" className="mb-3 text-clay-700 dark:text-clay-300">
                Cultural Focus Areas
              </Typography>
              <div className="flex flex-wrap gap-2">
                {selectedLocation.culturalFocus.map((focus, index) => (
                  <Badge key={index} variant="clay-soft" size="cultural">
                    {focus}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Featured Stories */}
            <div className="mb-6">
              <Typography variant="h6" className="mb-3 text-clay-700 dark:text-clay-300">
                Featured Stories
              </Typography>
              <div className="space-y-3">
                {selectedLocation.stories.slice(0, 2).map((story) => (
                  <div key={story.id} className="p-3 border border-stone-200 dark:border-stone-800 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <Typography variant="small" className="font-semibold text-stone-800 dark:text-stone-200">
                        {story.title}
                      </Typography>
                      <Badge variant="sage-soft" size="sm">
                        {story.type}
                      </Badge>
                    </div>
                    <Typography variant="caption" className="text-stone-600 dark:text-stone-400 mb-2">
                      by {story.storyteller}
                    </Typography>
                    <Typography variant="body-small" className="text-stone-600 dark:text-stone-400">
                      {story.excerpt}
                    </Typography>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <Button variant="cultural-primary" size="cultural">
                <BookOpen className="w-4 h-4 mr-2" />
                View All Stories
              </Button>
              <Button variant="sage-outline" size="cultural">
                <Users className="w-4 h-4 mr-2" />
                Meet Storytellers
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}