'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Network,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Filter
} from 'lucide-react'
import { NetworkControls } from './NetworkControls'
import { ThemeNode } from './ThemeNode'

interface ThematicNetworkViewerProps {
  organizationId: string
}

interface NetworkNode {
  id: string
  label: string
  size: number
  color: string
  group: string
}

interface NetworkEdge {
  id: string
  source: string
  target: string
  weight: number
}

export function ThematicNetworkViewer({ organizationId }: ThematicNetworkViewerProps) {
  const [networkData, setNetworkData] = useState<{ nodes: NetworkNode[], edges: NetworkEdge[] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)

  useEffect(() => {
    loadNetworkData()
  }, [organizationId])

  const loadNetworkData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/network/themes?organizationId=${organizationId}`)
      if (response.ok) {
        const data = await response.json()
        setNetworkData(data)
      }
    } catch (err) {
      console.error('Error loading network:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 3))
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5))

  // Mock network visualization (in production, use React Flow or D3.js)
  const mockNodes: NetworkNode[] = [
    { id: '1', label: 'Connection to Land', size: 45, color: '#D97757', group: 'Land & Environment' },
    { id: '2', label: 'Healing', size: 35, color: '#6B8E72', group: 'Wellness' },
    { id: '3', label: 'Identity', size: 30, color: '#4A90A4', group: 'Culture' },
    { id: '4', label: 'Language Preservation', size: 25, color: '#D4A373', group: 'Language' },
    { id: '5', label: 'Intergenerational Knowledge', size: 40, color: '#8B7FB8', group: 'Knowledge' },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5 text-purple-500" />
              Thematic Network
            </CardTitle>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600 w-16 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button size="sm" variant="outline" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[600px] flex items-center justify-center bg-gray-50 rounded border-2 border-dashed border-gray-300">
              <div className="text-center">
                <Network className="h-12 w-12 text-gray-400 mx-auto mb-2 animate-pulse" />
                <p className="text-gray-600">Loading network...</p>
              </div>
            </div>
          ) : (
            <div
              className="h-[600px] bg-gray-50 rounded border-2 border-gray-200 relative overflow-hidden"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
            >
              {/* Network Visualization Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* This would be replaced with React Flow or D3.js visualization */}
                  {mockNodes.map((node, index) => {
                    const angle = (index / mockNodes.length) * 2 * Math.PI
                    const radius = 200
                    const x = Math.cos(angle) * radius + 300
                    const y = Math.sin(angle) * radius + 300

                    return (
                      <div
                        key={node.id}
                        className="absolute"
                        style={{
                          left: `${x}px`,
                          top: `${y}px`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <ThemeNode
                          node={node}
                          onClick={() => setSelectedNode(node)}
                          isSelected={selectedNode?.id === node.id}
                        />
                      </div>
                    )
                  })}

                  {/* Connection lines would be SVG paths */}
                  <svg className="absolute inset-0 pointer-events-none">
                    <line x1="300" y1="100" x2="500" y2="300" stroke="#ccc" strokeWidth="2" />
                    <line x1="300" y1="100" x2="100" y2="300" stroke="#ccc" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white p-3 rounded shadow-lg">
                <p className="text-xs font-medium text-gray-700 mb-2">Node Size = Story Count</p>
                <p className="text-xs text-gray-600">Line Thickness = Connection Strength</p>
              </div>
            </div>
          )}

          {/* Selected Node Info */}
          {selectedNode && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-gray-900">{selectedNode.label}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {selectedNode.size} stories • {selectedNode.group}
              </p>
              <Button size="sm" className="mt-3">
                Explore Theme →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <NetworkControls organizationId={organizationId} />
    </div>
  )
}
