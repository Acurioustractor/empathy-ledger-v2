'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sparkles,
  Map,
  Layers,
  Grid3x3,
  Users,
  MapPin,
  FolderKanban,
  Calendar,
  Tag,
  Image as ImageIcon,
  RefreshCw,
  Scan
} from 'lucide-react'

// Import our Phase 2 components
import { AutoCollections } from '@/components/gallery/AutoCollections'
import { MapGalleryView } from '@/components/gallery/MapGalleryView'
import { UnidentifiedFaces } from '@/components/gallery/UnidentifiedFaces'
import { EnhancedMediaTagger } from '@/components/media/EnhancedMediaTagger'

export default function SmartCollectionsPage() {
  const [selectedTab, setSelectedTab] = useState('collections')
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null)
  const [filterContext, setFilterContext] = useState<{
    type: string
    id: string
    name: string
  } | null>(null)

  // Handle collection selection - filter the map/gallery by this collection
  const handleCollectionSelect = useCallback((type: string, id: string, name: string) => {
    setFilterContext({ type, id, name })
    setSelectedTab('map') // Switch to map to show filtered results
  }, [])

  // Handle media selection - open the tagger dialog
  const handleMediaSelect = useCallback((mediaId: string) => {
    setSelectedMediaId(mediaId)
  }, [])

  // Clear filter
  const clearFilter = useCallback(() => {
    setFilterContext(null)
  }, [])

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-sage-50 via-earth-50/30 to-stone-50 border border-stone-200 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-sage-600" />
              Smart Collections
            </h1>
            <p className="text-stone-600 mt-1">
              Automatically organized media by people, places, projects, and time
            </p>
          </div>
          <Badge variant="outline" className="bg-sage-50 text-sage-700 border-sage-300">
            Phase 2: Smart Organization
          </Badge>
        </div>
      </div>

      {/* Active Filter Banner */}
      {filterContext && (
        <Card className="bg-sage-50 border-sage-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {filterContext.type === 'people' && <Users className="h-5 w-5 text-earth-600" />}
              {filterContext.type === 'places' && <MapPin className="h-5 w-5 text-sage-600" />}
              {filterContext.type === 'projects' && <FolderKanban className="h-5 w-5 text-clay-600" />}
              {filterContext.type === 'time' && <Calendar className="h-5 w-5 text-purple-600" />}
              {filterContext.type === 'tags' && <Tag className="h-5 w-5 text-amber-600" />}
              <div>
                <p className="text-sm font-medium">Filtered by {filterContext.type}</p>
                <p className="text-sm text-sage-700">{filterContext.name}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={clearFilter}>
              Clear Filter
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="collections" className="gap-2">
            <Layers className="h-4 w-4" />
            Collections
          </TabsTrigger>
          <TabsTrigger value="map" className="gap-2">
            <Map className="h-4 w-4" />
            Map View
          </TabsTrigger>
          <TabsTrigger value="faces" className="gap-2">
            <Scan className="h-4 w-4" />
            Faces
          </TabsTrigger>
        </TabsList>

        {/* Collections Tab */}
        <TabsContent value="collections">
          <AutoCollections
            onCollectionSelect={handleCollectionSelect}
            onMediaSelect={handleMediaSelect}
          />
        </TabsContent>

        {/* Map Tab */}
        <TabsContent value="map">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-sage-600" />
                Media Map
              </CardTitle>
              <CardDescription>
                View all media with locations on an interactive map
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MapGalleryView
                onMediaSelect={handleMediaSelect}
                projectFilter={filterContext?.type === 'projects' ? filterContext.id : undefined}
                tagFilter={filterContext?.type === 'tags' ? filterContext.id : undefined}
                storytellerFilter={filterContext?.type === 'people' ? filterContext.id : undefined}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Faces Tab */}
        <TabsContent value="faces">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Scan className="h-5 w-5 text-earth-600" />
                Face Recognition & Linking
              </CardTitle>
              <CardDescription>
                Identify and link faces to storytellers with consent management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UnidentifiedFaces onMediaSelect={handleMediaSelect} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feature Overview */}
      <Card className="bg-stone-50 border-stone-200">
        <CardHeader>
          <CardTitle className="text-lg">Phase 2 Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 bg-white rounded-lg border border-stone-200">
              <Users className="h-6 w-6 text-earth-600 mb-2" />
              <h4 className="font-medium">People Collections</h4>
              <p className="text-sm text-muted-foreground">
                Auto-grouped by tagged storytellers with consent
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-stone-200">
              <MapPin className="h-6 w-6 text-sage-600 mb-2" />
              <h4 className="font-medium">Place Collections</h4>
              <p className="text-sm text-muted-foreground">
                Organized by location with indigenous territory recognition
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-stone-200">
              <FolderKanban className="h-6 w-6 text-clay-600 mb-2" />
              <h4 className="font-medium">Project Collections</h4>
              <p className="text-sm text-muted-foreground">
                Grouped by ACT ecosystem projects
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-stone-200">
              <Map className="h-6 w-6 text-purple-600 mb-2" />
              <h4 className="font-medium">Interactive Map</h4>
              <p className="text-sm text-muted-foreground">
                Visualize media locations with clustering and filtering
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-stone-200">
              <Scan className="h-6 w-6 text-amber-600 mb-2" />
              <h4 className="font-medium">Face Grouping</h4>
              <p className="text-sm text-muted-foreground">
                Identify and link unidentified faces to storytellers
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Tagger Dialog */}
      <Dialog open={!!selectedMediaId} onOpenChange={(open) => !open && setSelectedMediaId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Edit Media
            </DialogTitle>
          </DialogHeader>

          {selectedMediaId && (
            <EnhancedMediaTagger
              mediaId={selectedMediaId}
              mediaUrl="" // Will be loaded by the component
              onSave={() => setSelectedMediaId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
