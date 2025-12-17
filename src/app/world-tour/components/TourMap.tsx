'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Loader2, BookOpen, MapPin, Building2, Users, Eye, EyeOff, GitBranch, User, Crown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMapContext } from '../context/MapContext'
import { getThemeColor, type MapStory, type ThematicConnection } from './types/map-types'

interface TourMapProps {
  className?: string
}

export function TourMap({ className }: TourMapProps) {
  const {
    state,
    selectMarker,
    filteredStories,
    filteredConnections,
    toggleLayer
  } = useMapContext()

  const {
    stops,
    requests,
    dreamOrgs,
    storytellers,
    showTourStops,
    showRequests,
    showDreamOrgs,
    showStories,
    showStorytellers,
    showConnections,
    activeThemes,
    isLoading
  } = state

  const [isClient, setIsClient] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const connectionLayerRef = useRef<any>(null)
  const leafletRef = useRef<any>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initialize map
  useEffect(() => {
    if (!isClient || !mapRef.current) return

    // If map already exists and is attached to this container, skip
    if (mapInstanceRef.current) {
      // Check if the map container is still valid
      const container = mapInstanceRef.current.getContainer()
      if (container && container.parentNode) {
        return // Map is still valid, don't reinitialize
      }
      // Map container is detached, clean up
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
      setMapLoaded(false)
    }

    const loadMap = async () => {
      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
        link.crossOrigin = ''
        document.head.appendChild(link)
      }

      // Load Leaflet JS
      const L = (await import('leaflet')).default
      leafletRef.current = L

      // Fix default marker icon path issue
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })

      // Double-check container still exists
      if (!mapRef.current) return

      // Initialize map with world view
      const map = L.map(mapRef.current, {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 18,
        worldCopyJump: true
      })
      mapInstanceRef.current = map

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map)

      // Create connection layer (SVG overlay for curved lines)
      connectionLayerRef.current = L.layerGroup().addTo(map)

      // Force a resize after a short delay to ensure proper rendering
      setTimeout(() => {
        map.invalidateSize()
      }, 100)

      setMapLoaded(true)
    }

    loadMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        setMapLoaded(false)
      }
    }
  }, [isClient])

  // Create marker icon helper
  const createIcon = useCallback((color: string, size: number = 24, isStory: boolean = false) => {
    if (!leafletRef.current) return null
    const L = leafletRef.current

    // Story markers have a book icon inside
    const innerContent = isStory
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`
      : ''

    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s ease;
      " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">${innerContent}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2]
    })
  }, [])

  // Create storyteller icon with user silhouette
  const createStorytellerIcon = useCallback((color: string, isElder: boolean = false) => {
    if (!leafletRef.current) return null
    const L = leafletRef.current

    const size = isElder ? 28 : 24
    // User icon SVG
    const userIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
    // Crown icon for elders
    const crownIcon = isElder ? `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1" style="position:absolute;top:-6px;left:50%;transform:translateX(-50%);"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>` : ''

    return L.divIcon({
      className: 'storyteller-marker',
      html: `<div style="
        position: relative;
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s ease;
      " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">${crownIcon}${userIcon}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2]
    })
  }, [])

  // Update markers when data or filters change
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !leafletRef.current) return

    const L = leafletRef.current
    const map = mapInstanceRef.current

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add tour stop markers
    if (showTourStops) {
      stops.forEach((stop) => {
        if (!stop.latitude || !stop.longitude) return

        const color = stop.status === 'completed' ? '#c2410c' : '#22c55e'
        const icon = createIcon(color, 28)
        if (!icon) return

        const marker = L.marker([stop.latitude, stop.longitude], { icon })
          .addTo(map)
          .on('click', () => {
            selectMarker(stop.id, 'stop', stop)
          })

        markersRef.current.push(marker)
      })
    }

    // Add request markers
    if (showRequests) {
      requests.forEach((request) => {
        if (!request.latitude || !request.longitude) return

        const icon = createIcon('#f59e0b', 24)
        if (!icon) return

        const marker = L.marker([request.latitude, request.longitude], { icon })
          .addTo(map)
          .on('click', () => {
            selectMarker(request.id, 'request', request)
          })

        markersRef.current.push(marker)
      })
    }

    // Add dream org markers
    if (showDreamOrgs) {
      dreamOrgs.forEach((org) => {
        if (!org.latitude || !org.longitude) return

        const icon = createIcon('#0ea5e9', 26)
        if (!icon) return

        const marker = L.marker([org.latitude, org.longitude], { icon })
          .addTo(map)
          .on('click', () => {
            selectMarker(org.id, 'dreamOrg', org)
          })

        markersRef.current.push(marker)
      })
    }

    // Add story markers
    if (showStories) {
      filteredStories.forEach((story) => {
        const themeColor = getThemeColor(story.dominantTheme)
        const icon = createIcon(themeColor, 22, true)
        if (!icon) return

        const marker = L.marker([story.location.lat, story.location.lng], { icon })
          .addTo(map)
          .on('click', () => {
            selectMarker(story.id, 'story', story)
          })

        markersRef.current.push(marker)
      })
    }

    // Add storyteller markers
    if (showStorytellers && storytellers) {
      storytellers.forEach((storyteller: any) => {
        if (!storyteller.location?.lat || !storyteller.location?.lng) return

        // Elder storytellers get a special gold color, featured get rose
        const color = storyteller.isElder ? '#d97706' : storyteller.isFeatured ? '#e11d48' : '#6366f1'
        const icon = createStorytellerIcon(color, storyteller.isElder)
        if (!icon) return

        const marker = L.marker([storyteller.location.lat, storyteller.location.lng], { icon })
          .addTo(map)
          .on('click', () => {
            selectMarker(storyteller.id, 'storyteller', storyteller)
          })

        markersRef.current.push(marker)
      })
    }

    // Fit bounds if we have markers
    if (markersRef.current.length > 0) {
      const bounds = L.latLngBounds(
        markersRef.current.map(m => m.getLatLng())
      )
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 })
    }
  }, [
    mapLoaded,
    stops,
    requests,
    dreamOrgs,
    storytellers,
    filteredStories,
    showTourStops,
    showRequests,
    showDreamOrgs,
    showStories,
    showStorytellers,
    selectMarker,
    createIcon,
    createStorytellerIcon
  ])

  // Update thematic connections
  useEffect(() => {
    if (!mapLoaded || !connectionLayerRef.current || !leafletRef.current) return

    const L = leafletRef.current
    const connectionLayer = connectionLayerRef.current

    // Clear existing connections
    connectionLayer.clearLayers()

    if (!showConnections || filteredConnections.length === 0) return

    // Draw curved connection lines
    filteredConnections.forEach((conn) => {
      // Calculate midpoint with offset for curve
      const midLat = (conn.sourceCoords[0] + conn.targetCoords[0]) / 2
      const midLng = (conn.sourceCoords[1] + conn.targetCoords[1]) / 2

      // Create offset for curved appearance
      const distance = Math.sqrt(
        Math.pow(conn.targetCoords[0] - conn.sourceCoords[0], 2) +
        Math.pow(conn.targetCoords[1] - conn.sourceCoords[1], 2)
      )
      const offsetLat = midLat + (distance * 0.1)

      // Get color from dominant shared theme
      const themeColor = getThemeColor(conn.sharedThemes[0] || 'connection')

      // Create curved polyline using quadratic bezier approximation
      const curvePoints = generateCurvePoints(
        conn.sourceCoords,
        [offsetLat, midLng],
        conn.targetCoords,
        20
      )

      const polyline = L.polyline(curvePoints, {
        color: themeColor,
        weight: Math.max(1, conn.strength * 4),
        opacity: 0.4 + (conn.strength * 0.4),
        smoothFactor: 1,
        dashArray: activeThemes.length > 0 ? undefined : '5, 10'
      }).addTo(connectionLayer)

      // Add tooltip
      polyline.bindTooltip(
        `<div class="text-xs">
          <strong>Shared themes:</strong><br/>
          ${conn.sharedThemes.slice(0, 3).join(', ')}
        </div>`,
        { sticky: true }
      )
    })
  }, [mapLoaded, filteredConnections, showConnections, activeThemes])

  return (
    <div className={cn("relative", className)}>
      {/* Map container - always mounted to preserve Leaflet instance */}
      <div
        ref={mapRef}
        className="w-full h-[500px] md:h-[700px] bg-stone-100 dark:bg-stone-900"
        style={{ visibility: isClient ? 'visible' : 'hidden' }}
      />

      {/* Loading overlay - shown on top of map */}
      {(!isClient || isLoading || !mapLoaded) && (
        <div className="absolute inset-0 bg-stone-100/90 dark:bg-stone-900/90 flex items-center justify-center z-[500]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-clay-500 mx-auto mb-2" />
            <p className="text-muted-foreground">Loading story map...</p>
          </div>
        </div>
      )}

      {/* Layer toggle controls */}
      <div className="absolute top-4 right-4 z-[1000]">
        <Card className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm shadow-lg">
          <CardContent className="p-2 space-y-1">
            <LayerToggle
              icon={<BookOpen className="w-4 h-4" />}
              label="Stories"
              count={filteredStories.length}
              active={showStories}
              color="text-clay-600"
              onClick={() => toggleLayer('stories')}
            />
            <LayerToggle
              icon={<User className="w-4 h-4" />}
              label="Storytellers"
              count={storytellers?.length || 0}
              active={showStorytellers}
              color="text-indigo-600"
              onClick={() => toggleLayer('storytellers')}
            />
            <LayerToggle
              icon={<MapPin className="w-4 h-4" />}
              label="Tour Stops"
              count={stops.length}
              active={showTourStops}
              color="text-green-600"
              onClick={() => toggleLayer('stops')}
            />
            <LayerToggle
              icon={<Users className="w-4 h-4" />}
              label="Requests"
              count={requests.length}
              active={showRequests}
              color="text-amber-600"
              onClick={() => toggleLayer('requests')}
            />
            <LayerToggle
              icon={<Building2 className="w-4 h-4" />}
              label="Dream Partners"
              count={dreamOrgs.length}
              active={showDreamOrgs}
              color="text-sky-600"
              onClick={() => toggleLayer('dreamOrgs')}
            />
            <LayerToggle
              icon={<GitBranch className="w-4 h-4" />}
              label="Connections"
              count={filteredConnections.length}
              active={showConnections}
              color="text-purple-600"
              onClick={() => toggleLayer('connections')}
            />
          </CardContent>
        </Card>
      </div>

      {/* Stats overlay */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <Card className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm shadow-lg">
          <CardContent className="p-3">
            <div className="flex gap-4 text-sm">
              <StatItem
                value={filteredStories.length}
                label="Stories"
                color="text-clay-600"
              />
              <StatItem
                value={stops.filter(s => s.status === 'confirmed' || s.status === 'in_progress').length}
                label="Confirmed"
                color="text-green-600"
              />
              <StatItem
                value={requests.length}
                label="Requests"
                color="text-amber-600"
              />
              <StatItem
                value={dreamOrgs.length}
                label="Partners"
                color="text-sky-600"
              />
            </div>
            {activeThemes.length > 0 && (
              <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                Filtering by {activeThemes.length} theme{activeThemes.length !== 1 ? 's' : ''}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Helper component for layer toggles
function LayerToggle({
  icon,
  label,
  count,
  active,
  color,
  onClick
}: {
  icon: React.ReactNode
  label: string
  count: number
  active: boolean
  color: string
  onClick: () => void
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "w-full justify-start gap-2 h-8",
        !active && "opacity-50"
      )}
      onClick={onClick}
    >
      <span className={color}>{icon}</span>
      <span className="flex-1 text-left text-xs">{label}</span>
      <span className="text-xs text-muted-foreground">{count}</span>
      {active ? (
        <Eye className="w-3 h-3 text-muted-foreground" />
      ) : (
        <EyeOff className="w-3 h-3 text-muted-foreground" />
      )}
    </Button>
  )
}

// Helper component for stats
function StatItem({
  value,
  label,
  color
}: {
  value: number
  label: string
  color: string
}) {
  return (
    <div className="text-center">
      <div className={cn("font-bold", color)}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

// Generate points for a quadratic bezier curve
function generateCurvePoints(
  start: [number, number],
  control: [number, number],
  end: [number, number],
  numPoints: number
): [number, number][] {
  const points: [number, number][] = []

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints
    const x = (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * control[0] + t * t * end[0]
    const y = (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * control[1] + t * t * end[1]
    points.push([x, y])
  }

  return points
}
