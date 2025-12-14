'use client'

import React, { useEffect, useState, useRef } from 'react'
import { MapPin, Building2, Users, Calendar, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !mapRef.current || mapInstanceRef.current) return

    // Dynamically load Leaflet
    const loadMap = async () => {
      // Load Leaflet CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
      link.crossOrigin = ''
      document.head.appendChild(link)

      // Load Leaflet JS
      const L = (await import('leaflet')).default

      // Fix default marker icon path issue
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })

      // Calculate center
      const allCoords: [number, number][] = [
        ...stops.filter(s => s.latitude && s.longitude).map(s => [s.latitude, s.longitude] as [number, number]),
        ...requests.filter(r => r.latitude && r.longitude).map(r => [r.latitude!, r.longitude!] as [number, number]),
        ...dreamOrgs.filter(o => o.latitude && o.longitude).map(o => [o.latitude!, o.longitude!] as [number, number])
      ]

      const defaultCenter: [number, number] = allCoords.length > 0
        ? [
            allCoords.reduce((sum, c) => sum + c[0], 0) / allCoords.length,
            allCoords.reduce((sum, c) => sum + c[1], 0) / allCoords.length
          ]
        : [20, 0]

      // Initialize map
      const map = L.map(mapRef.current!).setView(defaultCenter, 2)
      mapInstanceRef.current = map

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map)

      // Create custom icons
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

      const icons = {
        confirmed: createIcon('#22c55e'),
        request: createIcon('#f59e0b'),
        dreamOrg: createIcon('#0ea5e9'),
        completed: createIcon('#c2410c')
      }

      // Add tour stops
      stops.forEach((stop) => {
        if (stop.latitude && stop.longitude) {
          const icon = stop.status === 'completed' ? icons.completed : icons.confirmed
          const marker = L.marker([stop.latitude, stop.longitude], { icon }).addTo(map)

          const popupContent = `
            <div class="p-2 min-w-[200px]">
              <div class="flex items-center gap-2 mb-2">
                <strong>${stop.title || stop.location_text}</strong>
              </div>
              <span class="inline-block px-2 py-1 text-xs rounded bg-green-100 text-green-700 mb-2">
                ${stop.status.replace('_', ' ')}
              </span>
              ${stop.date_start ? `
                <p class="text-xs text-gray-500">
                  ${new Date(stop.date_start).toLocaleDateString()}
                  ${stop.date_end ? ` - ${new Date(stop.date_end).toLocaleDateString()}` : ''}
                </p>
              ` : ''}
              ${stop.description ? `<p class="text-sm mt-2 text-gray-600">${stop.description}</p>` : ''}
              ${stop.stories_collected && stop.stories_collected > 0 ?
                `<p class="text-xs mt-2 text-green-600">${stop.stories_collected} stories collected</p>` : ''}
            </div>
          `
          marker.bindPopup(popupContent)
        }
      })

      // Add community requests
      requests.forEach((request) => {
        if (request.latitude && request.longitude) {
          const marker = L.marker([request.latitude, request.longitude], { icon: icons.request }).addTo(map)

          const popupContent = `
            <div class="p-2 min-w-[200px]">
              <div class="flex items-center gap-2 mb-2">
                <strong>${request.location_text}</strong>
              </div>
              <span class="inline-block px-2 py-1 text-xs rounded bg-amber-100 text-amber-700 mb-2">
                Community Request
              </span>
              <p class="text-xs text-gray-500">Nominated by ${request.name}</p>
              <p class="text-sm mt-2 text-gray-600">"${request.why_visit}"</p>
            </div>
          `
          marker.bindPopup(popupContent)
        }
      })

      // Add dream organizations
      dreamOrgs.forEach((org) => {
        if (org.latitude && org.longitude) {
          const marker = L.marker([org.latitude, org.longitude], { icon: icons.dreamOrg }).addTo(map)

          const popupContent = `
            <div class="p-2 min-w-[200px]">
              <div class="flex items-center gap-2 mb-2">
                <strong>${org.name}</strong>
              </div>
              <span class="inline-block px-2 py-1 text-xs rounded bg-sky-100 text-sky-700 mb-2">
                ${org.category.replace(/_/g, ' ')}
              </span>
              ${org.location_text ? `<p class="text-xs text-gray-500">${org.location_text}</p>` : ''}
              <p class="text-sm mt-2 text-gray-600">${org.description}</p>
            </div>
          `
          marker.bindPopup(popupContent)
        }
      })

      setMapLoaded(true)
    }

    loadMap()

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isClient, stops, requests, dreamOrgs])

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

  return (
    <div className="relative">
      {/* Map container */}
      <div
        ref={mapRef}
        className="w-full h-[500px] md:h-[600px] bg-stone-100 dark:bg-stone-900"
      />

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
