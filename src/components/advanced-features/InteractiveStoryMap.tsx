'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Layers, Filter } from 'lucide-react'
import { MapLegend } from './MapLegend'

interface InteractiveStoryMapProps {
  organizationId: string
}

export function InteractiveStoryMap({ organizationId }: InteractiveStoryMapProps) {
  const [showTerritories, setShowTerritories] = useState(true)
  const [showHeatmap, setShowHeatmap] = useState(false)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-500" />
              Interactive Story Map
            </CardTitle>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={showTerritories ? 'default' : 'outline'}
                onClick={() => setShowTerritories(!showTerritories)}
              >
                <Layers className="h-4 w-4 mr-2" />
                Territories
              </Button>
              <Button
                size="sm"
                variant={showHeatmap ? 'default' : 'outline'}
                onClick={() => setShowHeatmap(!showHeatmap)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Heatmap
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Map Placeholder - would use Mapbox/Leaflet in production */}
          <div className="h-[600px] bg-gray-100 rounded border-2 border-gray-300 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Interactive Map Visualization
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Stories plotted on traditional territories with clickable markers,
                  territory overlays, and clustering. Integrates with Mapbox GL JS.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4">
                  <div className="bg-clay-500 w-4 h-4 rounded-full" title="Anishinaabe" />
                  <div className="bg-sage-500 w-4 h-4 rounded-full" title="Cree" />
                  <div className="bg-sky-500 w-4 h-4 rounded-full" title="Haudenosaunee" />
                </div>
              </div>
            </div>

            {/* Map would render here */}
          </div>

          <MapLegend />
        </CardContent>
      </Card>
    </div>
  )
}
