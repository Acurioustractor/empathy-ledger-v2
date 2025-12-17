'use client'

import { useEffect, useRef, useMemo } from 'react'
import { Flame, Layers, Eye, EyeOff, Gauge } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface HeatmapPoint {
  lat: number
  lng: number
  intensity?: number
}

interface HeatmapOverlayProps {
  points: HeatmapPoint[]
  mapInstance: any // Leaflet map instance
  visible: boolean
  onVisibilityChange: (visible: boolean) => void
  className?: string
}

export function HeatmapOverlay({
  points,
  mapInstance,
  visible,
  onVisibilityChange,
  className
}: HeatmapOverlayProps) {
  const heatLayerRef = useRef<any>(null)
  const intensityRef = useRef<number>(0.6)

  // Create/update heatmap layer
  useEffect(() => {
    if (!mapInstance || !visible) {
      // Remove existing layer
      if (heatLayerRef.current && mapInstance) {
        mapInstance.removeLayer(heatLayerRef.current)
        heatLayerRef.current = null
      }
      return
    }

    const initHeatmap = async () => {
      try {
        // Dynamically load leaflet.heat
        if (typeof window !== 'undefined') {
          const L = (await import('leaflet')).default

          // Load heat plugin if not already loaded
          if (!L.heatLayer) {
            await import('leaflet.heat')
          }

          // Remove existing layer
          if (heatLayerRef.current) {
            mapInstance.removeLayer(heatLayerRef.current)
          }

          // Prepare heat data
          const heatData = points.map(p => [
            p.lat,
            p.lng,
            p.intensity || 1
          ])

          if (heatData.length === 0) return

          // Create new heat layer
          // @ts-ignore - leaflet.heat adds heatLayer to L
          heatLayerRef.current = L.heatLayer(heatData, {
            radius: 25,
            blur: 15,
            maxZoom: 10,
            max: 1.0,
            gradient: {
              0.0: '#3b82f6',
              0.25: '#22c55e',
              0.5: '#eab308',
              0.75: '#f97316',
              1.0: '#ef4444'
            }
          }).addTo(mapInstance)
        }
      } catch (error) {
        console.error('Error initializing heatmap:', error)
      }
    }

    initHeatmap()

    return () => {
      if (heatLayerRef.current && mapInstance) {
        mapInstance.removeLayer(heatLayerRef.current)
        heatLayerRef.current = null
      }
    }
  }, [mapInstance, visible, points])

  // Update intensity
  const handleIntensityChange = (values: number[]) => {
    const intensity = values[0]
    intensityRef.current = intensity

    if (heatLayerRef.current) {
      heatLayerRef.current.setOptions({
        radius: Math.round(15 + intensity * 20),
        blur: Math.round(10 + intensity * 10)
      })
    }
  }

  const stats = useMemo(() => {
    if (points.length === 0) return null

    const avgLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length
    const avgLng = points.reduce((sum, p) => sum + p.lng, 0) / points.length

    // Find clusters (simplified)
    const clusters = new Map<string, number>()
    points.forEach(p => {
      const key = `${Math.round(p.lat / 5) * 5},${Math.round(p.lng / 5) * 5}`
      clusters.set(key, (clusters.get(key) || 0) + 1)
    })

    const hotspots = Array.from(clusters.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key, count]) => ({ key, count }))

    return {
      total: points.length,
      center: { lat: avgLat, lng: avgLng },
      hotspots
    }
  }, [points])

  return (
    <Card className={cn("bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm shadow-lg", className)}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-medium">Story Density Heatmap</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVisibilityChange(!visible)}
            className={cn(!visible && "opacity-50")}
          >
            {visible ? (
              <Eye className="w-4 h-4 mr-1" />
            ) : (
              <EyeOff className="w-4 h-4 mr-1" />
            )}
            {visible ? 'Hide' : 'Show'}
          </Button>
        </div>

        {visible && (
          <>
            {/* Intensity Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <Label className="flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  Intensity
                </Label>
                <span className="text-muted-foreground">
                  {Math.round(intensityRef.current * 100)}%
                </span>
              </div>
              <Slider
                defaultValue={[0.6]}
                min={0.2}
                max={1}
                step={0.1}
                onValueChange={handleIntensityChange}
              />
            </div>

            {/* Legend */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Density Scale</Label>
              <div className="h-3 rounded-full overflow-hidden flex">
                <div className="flex-1 bg-blue-500" />
                <div className="flex-1 bg-green-500" />
                <div className="flex-1 bg-yellow-500" />
                <div className="flex-1 bg-orange-500" />
                <div className="flex-1 bg-red-500" />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="pt-2 border-t space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Points</span>
                  <Badge variant="secondary">{stats.total}</Badge>
                </div>
                {stats.hotspots.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <span>Top clusters: </span>
                    {stats.hotspots.map((h, i) => (
                      <span key={h.key}>
                        {h.count} stories{i < stats.hotspots.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Simpler in-map control version
export function HeatmapControl({
  visible,
  onToggle,
  pointCount
}: {
  visible: boolean
  onToggle: () => void
  pointCount: number
}) {
  return (
    <Button
      variant={visible ? 'default' : 'outline'}
      size="sm"
      onClick={onToggle}
      className={cn(
        "gap-2",
        visible && "bg-orange-500 hover:bg-orange-600"
      )}
    >
      <Flame className="w-4 h-4" />
      <span className="hidden sm:inline">Heatmap</span>
      {visible && <Badge variant="secondary" className="ml-1 text-xs">{pointCount}</Badge>}
    </Button>
  )
}
