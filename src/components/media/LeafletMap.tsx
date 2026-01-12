'use client'

import React, { useEffect, useRef, useState } from 'react'

// Default center (Australia)
const DEFAULT_CENTER: [number, number] = [-25.2744, 133.7751]
const DEFAULT_ZOOM = 4

interface LeafletMapProps {
  markerPosition: [number, number] | null
  onMapClick?: (lat: number, lng: number) => void
  mapRef?: React.MutableRefObject<any>
}

export default function LeafletMapComponent({ markerPosition, onMapClick, mapRef }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)

  // Initialize map using vanilla Leaflet (avoiding react-leaflet context issues)
  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return

    // Dynamic import of leaflet
    import('leaflet').then((L) => {
      // Fix default marker icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      // Create map
      const center = markerPosition || DEFAULT_CENTER
      const zoom = markerPosition ? 12 : DEFAULT_ZOOM

      const map = L.map(containerRef.current!, {
        center: center,
        zoom: zoom,
      })

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map)

      // Add marker if position provided
      if (markerPosition) {
        markerRef.current = L.marker(markerPosition).addTo(map)
      }

      // Add click handler
      if (onMapClick) {
        map.on('click', (e: any) => {
          onMapClick(e.latlng.lat, e.latlng.lng)
        })
      }

      mapInstanceRef.current = map

      // Expose to parent if ref provided
      if (mapRef) {
        mapRef.current = map
      }

      setIsReady(true)
    })

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, []) // Empty deps - only run once on mount

  // Update marker position when it changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isReady) return

    import('leaflet').then((L) => {
      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }

      // Add new marker if position provided
      if (markerPosition) {
        markerRef.current = L.marker(markerPosition).addTo(mapInstanceRef.current)
        mapInstanceRef.current.setView(markerPosition, 12)
      }
    })
  }, [markerPosition, isReady])

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      style={{ height: '100%', width: '100%', minHeight: '250px' }}
    />
  )
}
