'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  MapPin,
  Image as ImageIcon,
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  RefreshCw,
  Users,
  Tag
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
)

interface MapMediaItem {
  id: string
  title: string
  thumbnail_url: string
  media_type: string
  latitude: number
  longitude: number
  place_name?: string
  indigenous_territory?: string
  created_at: string
  tags?: string[]
  storytellers?: Array<{ id: string; name: string }>
}

interface MapCluster {
  id: string
  latitude: number
  longitude: number
  count: number
  place_name?: string
  indigenous_territory?: string
  media: MapMediaItem[]
}

interface MapGalleryViewProps {
  onMediaSelect?: (mediaId: string) => void
  projectFilter?: string
  tagFilter?: string
  storytellerFilter?: string
  className?: string
}

export function MapGalleryView({
  onMediaSelect,
  projectFilter,
  tagFilter,
  storytellerFilter,
  className
}: MapGalleryViewProps) {
  const [mapItems, setMapItems] = useState<MapMediaItem[]>([])
  const [clusters, setClusters] = useState<MapCluster[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'items' | 'clusters'>('clusters')
  const [selectedCluster, setSelectedCluster] = useState<MapCluster | null>(null)
  const [selectedMedia, setSelectedMedia] = useState<MapMediaItem | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  // Australia-centered default view
  const defaultCenter: [number, number] = [-25.2744, 133.7751]
  const defaultZoom = 4

  // Fetch map data
  const fetchMapData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (viewMode === 'clusters') {
        params.set('cluster', 'true')
        params.set('precision', '1') // Rough clustering
      }
      if (projectFilter) params.set('project', projectFilter)
      if (tagFilter) params.set('tag', tagFilter)
      if (storytellerFilter) params.set('storyteller', storytellerFilter)

      const response = await fetch(`/api/media/map?${params}`)
      if (response.ok) {
        const data = await response.json()
        if (data.type === 'clustered') {
          setClusters(data.clusters || [])
          setMapItems([])
        } else {
          setMapItems(data.items || [])
          setClusters([])
        }
      }
    } catch (error) {
      console.error('Error fetching map data:', error)
    } finally {
      setLoading(false)
    }
  }, [viewMode, projectFilter, tagFilter, storytellerFilter])

  useEffect(() => {
    fetchMapData()
  }, [fetchMapData])

  // Set mapReady on client
  useEffect(() => {
    setMapReady(true)
  }, [])

  // Create custom marker icons
  const createClusterIcon = useCallback((count: number) => {
    if (typeof window === 'undefined') return null

    const L = require('leaflet')
    const size = count > 50 ? 50 : count > 20 ? 40 : count > 5 ? 35 : 30
    const color = count > 50 ? '#7c4d33' : count > 20 ? '#65623a' : '#8b9a5b'

    return L.divIcon({
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${size > 35 ? 14 : 12}px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ">
          ${count}
        </div>
      `,
      className: 'custom-cluster-icon',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    })
  }, [])

  const createMediaIcon = useCallback(() => {
    if (typeof window === 'undefined') return null

    const L = require('leaflet')
    return L.divIcon({
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: #8b9a5b;
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
      `,
      className: 'custom-media-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    })
  }, [])

  const totalItems = viewMode === 'clusters'
    ? clusters.reduce((sum, c) => sum + c.count, 0)
    : mapItems.length

  if (!mapReady) {
    return (
      <div className={cn('flex items-center justify-center h-96 bg-stone-100 rounded-lg', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
      </div>
    )
  }

  const mapContent = (
    <div className={cn('relative', isFullscreen ? 'fixed inset-0 z-50' : 'h-[600px]')}>
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <Button
          size="sm"
          variant="secondary"
          className="bg-white shadow-md"
          onClick={() => setViewMode(viewMode === 'clusters' ? 'items' : 'clusters')}
        >
          {viewMode === 'clusters' ? 'Show All' : 'Cluster'}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="bg-white shadow-md"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="bg-white shadow-md"
          onClick={fetchMapData}
          disabled={loading}
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
        </Button>
      </div>

      {/* Stats overlay */}
      <div className="absolute top-4 left-4 z-[1000]">
        <Card className="bg-white/95 shadow-md">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-sage-600" />
              <span className="font-medium">{totalItems}</span>
              <span className="text-muted-foreground">media with locations</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="h-full w-full rounded-lg"
        style={{ minHeight: isFullscreen ? '100vh' : '600px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Clusters */}
        {viewMode === 'clusters' && clusters.map(cluster => (
          <Marker
            key={cluster.id}
            position={[cluster.latitude, cluster.longitude]}
            icon={createClusterIcon(cluster.count)}
            eventHandlers={{
              click: () => setSelectedCluster(cluster)
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="font-medium">
                  {cluster.place_name || 'Location'}
                </div>
                {cluster.indigenous_territory && (
                  <div className="text-xs text-sage-700 mt-1">
                    {cluster.indigenous_territory}
                  </div>
                )}
                <div className="text-sm text-muted-foreground mt-1">
                  {cluster.count} media items
                </div>
                <Button
                  size="sm"
                  className="mt-2 w-full bg-sage-600 hover:bg-sage-700"
                  onClick={() => setSelectedCluster(cluster)}
                >
                  View Media
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Individual items */}
        {viewMode === 'items' && mapItems.map(item => (
          <Marker
            key={item.id}
            position={[item.latitude, item.longitude]}
            icon={createMediaIcon()}
            eventHandlers={{
              click: () => setSelectedMedia(item)
            }}
          >
            <Popup>
              <div className="p-1 min-w-[180px]">
                {item.thumbnail_url && (
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                )}
                <div className="font-medium text-sm">{item.title}</div>
                {item.indigenous_territory && (
                  <div className="text-xs text-sage-700">
                    {item.indigenous_territory}
                  </div>
                )}
                <Button
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => onMediaSelect?.(item.id)}
                >
                  View Details
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-[1001]">
          <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
        </div>
      )}
    </div>
  )

  return (
    <div className={className}>
      {mapContent}

      {/* Cluster Preview Dialog */}
      <Dialog open={!!selectedCluster} onOpenChange={(open) => !open && setSelectedCluster(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-sage-600" />
              {selectedCluster?.place_name || 'Location'}
              {selectedCluster?.indigenous_territory && (
                <Badge variant="outline" className="ml-2 bg-sage-50 text-sage-700">
                  {selectedCluster.indigenous_territory}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedCluster && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {selectedCluster.count} media items at this location
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {selectedCluster.media.map(item => (
                  <Card
                    key={item.id}
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      setSelectedCluster(null)
                      setSelectedMedia(item)
                    }}
                  >
                    <div className="aspect-square bg-stone-100">
                      {item.thumbnail_url ? (
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-2">
                      <p className="text-xs font-medium truncate">{item.title}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedCluster.count > selectedCluster.media.length && (
                <p className="text-sm text-muted-foreground text-center">
                  Showing {selectedCluster.media.length} of {selectedCluster.count} items
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Media Detail Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={(open) => !open && setSelectedMedia(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMedia?.title || 'Media Details'}</DialogTitle>
          </DialogHeader>

          {selectedMedia && (
            <div className="space-y-4">
              {selectedMedia.thumbnail_url && (
                <img
                  src={selectedMedia.thumbnail_url}
                  alt={selectedMedia.title}
                  className="w-full rounded-lg"
                />
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Location</p>
                  <p>{selectedMedia.place_name || 'Unknown'}</p>
                </div>
                {selectedMedia.indigenous_territory && (
                  <div>
                    <p className="font-medium text-muted-foreground">Traditional Territory</p>
                    <p className="text-sage-700">{selectedMedia.indigenous_territory}</p>
                  </div>
                )}
                <div>
                  <p className="font-medium text-muted-foreground">Date</p>
                  <p>{new Date(selectedMedia.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Type</p>
                  <p className="capitalize">{selectedMedia.media_type}</p>
                </div>
              </div>

              {selectedMedia.tags && selectedMedia.tags.length > 0 && (
                <div>
                  <p className="font-medium text-muted-foreground text-sm mb-2 flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedMedia.tags.map(tag => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedMedia.storytellers && selectedMedia.storytellers.length > 0 && (
                <div>
                  <p className="font-medium text-muted-foreground text-sm mb-2 flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    People
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMedia.storytellers.map(person => (
                      <Badge key={person.id} variant="secondary">{person.name}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {onMediaSelect && (
                <Button
                  className="w-full bg-sage-600 hover:bg-sage-700"
                  onClick={() => {
                    onMediaSelect(selectedMedia.id)
                    setSelectedMedia(null)
                  }}
                >
                  View Full Details
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MapGalleryView
