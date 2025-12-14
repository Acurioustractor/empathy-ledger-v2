'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Building2, Users, Calendar, ExternalLink, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

// Types
interface TourStop {
  id: string
  location_text: string
  city?: string
  country?: string
  latitude: number
  longitude: number
  status: 'planned' | 'confirmed' | 'in_progress' | 'completed'
  title?: string
  description?: string
  date_start?: string
  date_end?: string
  stories_collected?: number
}

interface TourRequest {
  id: string
  location_text: string
  city?: string
  country?: string
  latitude?: number
  longitude?: number
  name: string
  why_visit: string
  status: string
}

interface DreamOrg {
  id: string
  name: string
  location_text?: string
  latitude?: number
  longitude?: number
  category: string
  description: string
  contact_status: string
}

interface TourMapProps {
  stops: TourStop[]
  requests: TourRequest[]
  dreamOrgs: DreamOrg[]
  loading?: boolean
}

export function TourMap({ stops, requests, dreamOrgs, loading }: TourMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [selectedItem, setSelectedItem] = useState<{
    type: 'stop' | 'request' | 'dreamOrg'
    data: TourStop | TourRequest | DreamOrg
  } | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Create custom marker icons once on client
  const [icons, setIcons] = useState<{
    confirmed: any
    request: any
    dreamOrg: any
    completed: any
  } | null>(null)

  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        // Fix default marker icon path issue
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        // Create custom colored markers using divIcon
        const createIcon = (color: string) => L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            background-color: ${color};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12]
        })

        setIcons({
          confirmed: createIcon('#22c55e'), // green
          request: createIcon('#f59e0b'),   // amber
          dreamOrg: createIcon('#0ea5e9'),  // sky
          completed: createIcon('#c2410c')  // clay/terracotta
        })
      })
    }
  }, [isClient])

  if (!isClient || loading) {
    return (
      <div className="w-full h-[500px] md:h-[600px] bg-stone-100 dark:bg-stone-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-clay-500 mx-auto mb-2" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }

  // Calculate bounds to fit all markers, or use default world view
  const allCoords: [number, number][] = [
    ...stops.filter(s => s.latitude && s.longitude).map(s => [s.latitude, s.longitude] as [number, number]),
    ...requests.filter(r => r.latitude && r.longitude).map(r => [r.latitude!, r.longitude!] as [number, number]),
    ...dreamOrgs.filter(o => o.latitude && o.longitude).map(o => [o.latitude!, o.longitude!] as [number, number])
  ]

  // Default center (world view) or calculated center
  const defaultCenter: [number, number] = allCoords.length > 0
    ? [
        allCoords.reduce((sum, c) => sum + c[0], 0) / allCoords.length,
        allCoords.reduce((sum, c) => sum + c[1], 0) / allCoords.length
      ]
    : [20, 0] // World center

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'in_progress':
        return 'default'
      case 'completed':
        return 'secondary'
      case 'planned':
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <div className="relative">
      {/* Map */}
      <div className="w-full h-[500px] md:h-[600px]">
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <MapContainer
          center={defaultCenter}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Confirmed/Completed Tour Stops */}
          {icons && stops.map((stop) => (
            stop.latitude && stop.longitude && (
              <Marker
                key={`stop-${stop.id}`}
                position={[stop.latitude, stop.longitude]}
                icon={stop.status === 'completed' ? icons.completed : icons.confirmed}
                eventHandlers={{
                  click: () => setSelectedItem({ type: 'stop', data: stop })
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <strong>{stop.title || stop.location_text}</strong>
                    </div>
                    <Badge variant={getStatusBadgeVariant(stop.status)} className="mb-2">
                      {stop.status.replace('_', ' ')}
                    </Badge>
                    {stop.date_start && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(stop.date_start).toLocaleDateString()}
                        {stop.date_end && ` - ${new Date(stop.date_end).toLocaleDateString()}`}
                      </p>
                    )}
                    {stop.description && (
                      <p className="text-sm mt-2 text-muted-foreground">{stop.description}</p>
                    )}
                    {stop.stories_collected && stop.stories_collected > 0 && (
                      <p className="text-xs mt-2 text-green-600">
                        {stop.stories_collected} stories collected
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          ))}

          {/* Community Requests */}
          {icons && requests.map((request) => (
            request.latitude && request.longitude && (
              <Marker
                key={`request-${request.id}`}
                position={[request.latitude, request.longitude]}
                icon={icons.request}
                eventHandlers={{
                  click: () => setSelectedItem({ type: 'request', data: request })
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-amber-500" />
                      <strong>{request.location_text}</strong>
                    </div>
                    <Badge variant="outline" className="mb-2 bg-amber-50 text-amber-700 border-amber-200">
                      Community Request
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      Nominated by {request.name}
                    </p>
                    <p className="text-sm mt-2 text-muted-foreground line-clamp-3">
                      "{request.why_visit}"
                    </p>
                  </div>
                </Popup>
              </Marker>
            )
          ))}

          {/* Dream Organizations */}
          {icons && dreamOrgs.map((org) => (
            org.latitude && org.longitude && (
              <Marker
                key={`org-${org.id}`}
                position={[org.latitude, org.longitude]}
                icon={icons.dreamOrg}
                eventHandlers={{
                  click: () => setSelectedItem({ type: 'dreamOrg', data: org })
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-sky-500" />
                      <strong>{org.name}</strong>
                    </div>
                    <Badge variant="outline" className="mb-2 bg-sky-50 text-sky-700 border-sky-200">
                      {org.category.replace('_', ' ')}
                    </Badge>
                    {org.location_text && (
                      <p className="text-xs text-muted-foreground">
                        {org.location_text}
                      </p>
                    )}
                    <p className="text-sm mt-2 text-muted-foreground line-clamp-3">
                      {org.description}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>

      {/* Stats overlay */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
          <CardContent className="p-3">
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-green-600">{stops.filter(s => s.status === 'confirmed' || s.status === 'in_progress').length}</div>
                <div className="text-xs text-muted-foreground">Confirmed</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-amber-600">{requests.length}</div>
                <div className="text-xs text-muted-foreground">Requests</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-sky-600">{dreamOrgs.length}</div>
                <div className="text-xs text-muted-foreground">Dream Partners</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
