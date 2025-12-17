'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMapContext } from '../context/MapContext'
import { getThemeColor } from '../components/types/map-types'

export function FullScreenMap() {
  const {
    state,
    selectMarker,
    filteredStories,
    filteredConnections
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

  // Initialize map with dark style
  useEffect(() => {
    if (!isClient || !mapRef.current || mapInstanceRef.current) return

    const loadMap = async () => {
      // Load Leaflet CSS - force reload
      const existingLink = document.querySelector('link[href*="leaflet"]')
      if (existingLink) existingLink.remove()

      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)

      // Wait for CSS to load
      await new Promise(resolve => {
        link.onload = resolve
        setTimeout(resolve, 500) // Fallback timeout
      })

      const L = (await import('leaflet')).default
      leafletRef.current = L

      // Fix default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })

      // Ensure the container has dimensions before initializing
      if (!mapRef.current) return
      const rect = mapRef.current.getBoundingClientRect()
      console.log('Map container dimensions:', rect.width, rect.height)

      // Initialize map with world view
      const map = L.map(mapRef.current, {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 18,
        worldCopyJump: true,
        zoomControl: false // We'll add custom controls
      })
      mapInstanceRef.current = map

      // Dark map tiles (CartoDB Dark Matter)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map)

      // Add zoom control to bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map)

      // Create connection layer
      connectionLayerRef.current = L.layerGroup().addTo(map)

      // Force map to recalculate size
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
      }
    }
  }, [isClient])

  // Create glowing marker icon
  const createIcon = useCallback((color: string, size: number = 24, isStory: boolean = false, pulseAnimation: boolean = false) => {
    if (!leafletRef.current) return null
    const L = leafletRef.current

    const innerContent = isStory
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`
      : ''

    const pulseClass = pulseAnimation ? 'animate-pulse-glow' : ''

    return L.divIcon({
      className: 'custom-marker-fullscreen',
      html: `
        <div class="${pulseClass}" style="
          position: relative;
          width: ${size}px;
          height: ${size}px;
        ">
          <div style="
            position: absolute;
            inset: -4px;
            background: ${color};
            opacity: 0.3;
            border-radius: 50%;
            filter: blur(4px);
          "></div>
          <div style="
            position: relative;
            background-color: ${color};
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 10px ${color}80, 0 2px 8px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          " onmouseover="this.style.transform='scale(1.3)'; this.style.boxShadow='0 0 20px ${color}, 0 4px 12px rgba(0,0,0,0.5)';"
             onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 0 10px ${color}80, 0 2px 8px rgba(0,0,0,0.5)';">
            ${innerContent}
          </div>
        </div>
      `,
      iconSize: [size + 8, size + 8],
      iconAnchor: [(size + 8) / 2, (size + 8) / 2],
      popupAnchor: [0, -(size + 8) / 2]
    })
  }, [])

  // Create storyteller icon with impact score ring
  const createStorytellerIcon = useCallback((
    impactScore: number,
    isElder: boolean,
    isFeatured: boolean,
    avatarUrl: string | null
  ) => {
    if (!leafletRef.current) return null
    const L = leafletRef.current

    const size = isElder ? 36 : isFeatured ? 32 : 28
    const ringColor = isElder ? '#f59e0b' : isFeatured ? '#ec4899' : '#f43f5e'

    // Impact score determines ring thickness and glow intensity
    const ringThickness = Math.max(2, Math.floor(impactScore / 20))
    const glowIntensity = impactScore / 100

    // Avatar or initials placeholder
    const avatarContent = avatarUrl
      ? `<img src="${avatarUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`

    // Elder crown indicator
    const elderBadge = isElder
      ? `<div style="position: absolute; top: -8px; left: 50%; transform: translateX(-50%); background: #f59e0b; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
           <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
         </div>`
      : ''

    // Featured star indicator
    const featuredBadge = !isElder && isFeatured
      ? `<div style="position: absolute; top: -6px; right: -6px; background: #ec4899; border-radius: 50%; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
           <span style="color: white; font-size: 8px;">★</span>
         </div>`
      : ''

    return L.divIcon({
      className: 'custom-marker-fullscreen storyteller-marker',
      html: `
        <div style="
          position: relative;
          width: ${size}px;
          height: ${size}px;
        ">
          <!-- Glow effect based on impact score -->
          <div style="
            position: absolute;
            inset: -6px;
            background: ${ringColor};
            opacity: ${0.2 + glowIntensity * 0.3};
            border-radius: 50%;
            filter: blur(6px);
          "></div>
          <!-- Impact score ring -->
          <div style="
            position: absolute;
            inset: 0;
            background: conic-gradient(
              ${ringColor} ${impactScore * 3.6}deg,
              rgba(255,255,255,0.2) ${impactScore * 3.6}deg
            );
            border-radius: 50%;
            padding: ${ringThickness}px;
          ">
            <div style="
              width: 100%;
              height: 100%;
              background: #1c1917;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              cursor: pointer;
              transition: transform 0.2s ease;
            " onmouseover="this.style.transform='scale(1.1)';"
               onmouseout="this.style.transform='scale(1)';">
              ${avatarContent}
            </div>
          </div>
          ${elderBadge}
          ${featuredBadge}
        </div>
      `,
      iconSize: [size + 12, size + 12],
      iconAnchor: [(size + 12) / 2, (size + 12) / 2],
      popupAnchor: [0, -(size + 12) / 2]
    })
  }, [])

  // Update markers when data changes
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

        const isCompleted = stop.status === 'completed'
        const color = isCompleted ? '#c2410c' : '#22c55e'
        const icon = createIcon(color, 30, false, !isCompleted)
        if (!icon) return

        const marker = L.marker([stop.latitude, stop.longitude], { icon })
          .addTo(map)
          .on('click', () => selectMarker(stop.id, 'stop', stop))

        markersRef.current.push(marker)
      })
    }

    // Add request markers
    if (showRequests) {
      requests.forEach((request) => {
        if (!request.latitude || !request.longitude) return

        const icon = createIcon('#f59e0b', 22)
        if (!icon) return

        const marker = L.marker([request.latitude, request.longitude], { icon })
          .addTo(map)
          .on('click', () => selectMarker(request.id, 'request', request))

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
          .on('click', () => selectMarker(org.id, 'dreamOrg', org))

        markersRef.current.push(marker)
      })
    }

    // Add story markers
    if (showStories) {
      filteredStories.forEach((story) => {
        const themeColor = getThemeColor(story.dominantTheme)
        const icon = createIcon(themeColor, 20, true)
        if (!icon) return

        const marker = L.marker([story.location.lat, story.location.lng], { icon })
          .addTo(map)
          .on('click', () => selectMarker(story.id, 'story', story))

        markersRef.current.push(marker)
      })
    }

    // Add storyteller markers
    if (showStorytellers && storytellers) {
      storytellers.forEach((storyteller) => {
        if (!storyteller.location?.lat || !storyteller.location?.lng) return

        const icon = createStorytellerIcon(
          storyteller.impactScore || 0,
          storyteller.isElder || false,
          storyteller.isFeatured || false,
          storyteller.avatarUrl
        )
        if (!icon) return

        const marker = L.marker(
          [storyteller.location.lat, storyteller.location.lng],
          { icon }
        )
          .addTo(map)
          .on('click', () => selectMarker(storyteller.id, 'storyteller', storyteller))

        // Add tooltip with name and impact score
        marker.bindTooltip(
          `<div class="text-xs p-1">
            <strong>${storyteller.name}</strong>
            ${storyteller.isElder ? ' <span style="color: #f59e0b">👑 Elder</span>' : ''}
            <br/>
            <span style="color: #f43f5e">Impact: ${storyteller.impactScore || 0}%</span>
            ${storyteller.storyCount ? `<br/><span style="color: #a78bfa">${storyteller.storyCount} stories</span>` : ''}
          </div>`,
          { className: 'dark-tooltip', direction: 'top', offset: [0, -10] }
        )

        markersRef.current.push(marker)
      })
    }

    // Fit bounds if we have markers
    if (markersRef.current.length > 0) {
      const bounds = L.latLngBounds(markersRef.current.map(m => m.getLatLng()))
      map.fitBounds(bounds, { padding: [100, 100], maxZoom: 5 })
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

  // Update thematic connections with glowing lines
  useEffect(() => {
    if (!mapLoaded || !connectionLayerRef.current || !leafletRef.current) return

    const L = leafletRef.current
    const connectionLayer = connectionLayerRef.current

    connectionLayer.clearLayers()

    if (!showConnections || filteredConnections.length === 0) return

    filteredConnections.forEach((conn) => {
      const midLat = (conn.sourceCoords[0] + conn.targetCoords[0]) / 2
      const midLng = (conn.sourceCoords[1] + conn.targetCoords[1]) / 2

      const distance = Math.sqrt(
        Math.pow(conn.targetCoords[0] - conn.sourceCoords[0], 2) +
        Math.pow(conn.targetCoords[1] - conn.sourceCoords[1], 2)
      )
      const offsetLat = midLat + (distance * 0.15)

      const themeColor = getThemeColor(conn.sharedThemes[0] || 'connection')

      const curvePoints = generateCurvePoints(
        conn.sourceCoords,
        [offsetLat, midLng],
        conn.targetCoords,
        30
      )

      // Glow effect (wider, more transparent line underneath)
      L.polyline(curvePoints, {
        color: themeColor,
        weight: Math.max(4, conn.strength * 8),
        opacity: 0.2,
        smoothFactor: 1
      }).addTo(connectionLayer)

      // Main line
      const polyline = L.polyline(curvePoints, {
        color: themeColor,
        weight: Math.max(1.5, conn.strength * 3),
        opacity: 0.6 + (conn.strength * 0.3),
        smoothFactor: 1
      }).addTo(connectionLayer)

      polyline.bindTooltip(
        `<div class="text-xs p-1">
          <strong>Shared:</strong> ${conn.sharedThemes.slice(0, 3).join(', ')}
        </div>`,
        { sticky: true, className: 'dark-tooltip' }
      )
    })
  }, [mapLoaded, filteredConnections, showConnections])

  // Always render the map container so Leaflet can initialize
  // Show loading overlay on top when needed
  return (
    <>
      {/* Map Container - always rendered */}
      <div
        ref={mapRef}
        className="absolute inset-0 w-full h-full z-0"
        style={{ minHeight: '100vh', height: '100%', width: '100%' }}
      />

      {/* Loading Overlay */}
      {(!isClient || isLoading || !mapLoaded) && (
        <div className="absolute inset-0 z-10 bg-stone-950 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-sky-500 mx-auto mb-3" />
            <p className="text-white/60">Loading world map...</p>
          </div>
        </div>
      )}
      <style jsx global>{`
        .custom-marker-fullscreen {
          background: transparent !important;
          border: none !important;
        }
        .dark-tooltip {
          background: rgba(0,0,0,0.8) !important;
          border: 1px solid rgba(255,255,255,0.2) !important;
          color: white !important;
          border-radius: 6px !important;
        }
        .dark-tooltip::before {
          border-top-color: rgba(0,0,0,0.8) !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          background: rgba(255,255,255,0.1) !important;
          backdrop-filter: blur(8px) !important;
        }
        .leaflet-control-zoom a {
          background: transparent !important;
          color: white !important;
          border-color: rgba(255,255,255,0.2) !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(255,255,255,0.2) !important;
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}

// Generate bezier curve points
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
