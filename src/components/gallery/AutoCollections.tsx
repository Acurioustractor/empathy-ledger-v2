'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Users,
  MapPin,
  FolderKanban,
  Calendar,
  Tag,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaPreview {
  id: string
  title: string
  thumbnail_url: string
  media_type: string
  created_at: string
}

interface CollectionItem {
  id: string
  name: string
  description?: string
  count: number
  thumbnail_url?: string
  metadata?: {
    avatar_url?: string
    indigenous_territory?: string
    latitude?: number
    longitude?: number
    project_code?: string
    category?: string
    cultural_sensitivity_level?: string
    year?: number
    month?: number
    media?: MediaPreview[]
  }
}

interface Collections {
  people?: CollectionItem[]
  places?: CollectionItem[]
  projects?: CollectionItem[]
  time?: CollectionItem[]
  tags?: CollectionItem[]
}

interface AutoCollectionsProps {
  onCollectionSelect?: (type: string, id: string, name: string) => void
  onMediaSelect?: (mediaId: string) => void
  className?: string
}

export function AutoCollections({
  onCollectionSelect,
  onMediaSelect,
  className
}: AutoCollectionsProps) {
  const [collections, setCollections] = useState<Collections>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('people')
  const [selectedCollection, setSelectedCollection] = useState<{
    type: string
    item: CollectionItem
  } | null>(null)
  const [totals, setTotals] = useState({
    people: 0,
    places: 0,
    projects: 0,
    time: 0,
    tags: 0
  })

  const fetchCollections = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/media/collections?include_media=true&media_limit=8')
      if (response.ok) {
        const data = await response.json()
        setCollections(data.collections || {})
        setTotals(data.totals || {})
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  const handleCollectionClick = (type: string, item: CollectionItem) => {
    if (onCollectionSelect) {
      onCollectionSelect(type, item.id, item.name)
    } else {
      setSelectedCollection({ type, item })
    }
  }

  const CollectionCard = ({
    item,
    type,
    icon: Icon
  }: {
    item: CollectionItem
    type: string
    icon: React.ElementType
  }) => (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] min-w-[200px] max-w-[200px]"
      onClick={() => handleCollectionClick(type, item)}
    >
      <div className="aspect-square bg-stone-100 relative">
        {item.thumbnail_url ? (
          <img
            src={item.thumbnail_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : item.metadata?.avatar_url ? (
          <img
            src={item.metadata.avatar_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="h-12 w-12 text-stone-300" />
          </div>
        )}

        {/* Count badge */}
        <Badge
          className="absolute bottom-2 right-2 bg-black/70 text-white"
        >
          {item.count}
        </Badge>

        {/* Indigenous territory indicator */}
        {type === 'places' && item.metadata?.indigenous_territory && (
          <Badge
            variant="outline"
            className="absolute top-2 left-2 bg-sage-50/90 text-sage-700 border-sage-300 text-xs"
          >
            Traditional Land
          </Badge>
        )}

        {/* Cultural sensitivity indicator */}
        {type === 'tags' && item.metadata?.cultural_sensitivity_level === 'sacred' && (
          <Badge
            variant="outline"
            className="absolute top-2 left-2 bg-amber-50/90 text-amber-700 border-amber-300 text-xs"
          >
            Sacred
          </Badge>
        )}
      </div>

      <CardContent className="p-3">
        <p className="font-medium text-sm truncate">{item.name}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {item.description}
          </p>
        )}
      </CardContent>
    </Card>
  )

  const CollectionRow = ({
    title,
    items,
    type,
    icon: Icon,
    emptyMessage
  }: {
    title: string
    items: CollectionItem[]
    type: string
    icon: React.ElementType
    emptyMessage: string
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Icon className="h-5 w-5 text-sage-600" />
          {title}
          <Badge variant="secondary" className="ml-1">{items.length}</Badge>
        </h3>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab(type)}
            className="text-sage-600"
          >
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      {items.length > 0 ? (
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-4">
            {items.slice(0, 6).map(item => (
              <CollectionCard
                key={item.id}
                item={item}
                type={type}
                icon={Icon}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <Card className="p-6 text-center bg-stone-50">
          <Icon className="h-8 w-8 text-stone-300 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </Card>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
        <span className="ml-2 text-stone-600">Loading collections...</span>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card className="bg-gradient-to-r from-sage-50 via-earth-50/30 to-stone-50 border-stone-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-sage-600" />
                Smart Collections
              </CardTitle>
              <CardDescription>
                Automatically organized by people, places, projects, and time
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchCollections} disabled={loading}>
              <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            activeTab === 'people' && 'ring-2 ring-sage-500'
          )}
          onClick={() => setActiveTab('people')}
        >
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 text-earth-600 mx-auto mb-1" />
            <p className="text-2xl font-bold">{totals.people}</p>
            <p className="text-xs text-muted-foreground">People</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            activeTab === 'places' && 'ring-2 ring-sage-500'
          )}
          onClick={() => setActiveTab('places')}
        >
          <CardContent className="p-4 text-center">
            <MapPin className="h-5 w-5 text-sage-600 mx-auto mb-1" />
            <p className="text-2xl font-bold">{totals.places}</p>
            <p className="text-xs text-muted-foreground">Places</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            activeTab === 'projects' && 'ring-2 ring-sage-500'
          )}
          onClick={() => setActiveTab('projects')}
        >
          <CardContent className="p-4 text-center">
            <FolderKanban className="h-5 w-5 text-clay-600 mx-auto mb-1" />
            <p className="text-2xl font-bold">{totals.projects}</p>
            <p className="text-xs text-muted-foreground">Projects</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            activeTab === 'time' && 'ring-2 ring-sage-500'
          )}
          onClick={() => setActiveTab('time')}
        >
          <CardContent className="p-4 text-center">
            <Calendar className="h-5 w-5 text-purple-600 mx-auto mb-1" />
            <p className="text-2xl font-bold">{totals.time}</p>
            <p className="text-xs text-muted-foreground">Time Periods</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            activeTab === 'tags' && 'ring-2 ring-sage-500'
          )}
          onClick={() => setActiveTab('tags')}
        >
          <CardContent className="p-4 text-center">
            <Tag className="h-5 w-5 text-amber-600 mx-auto mb-1" />
            <p className="text-2xl font-bold">{totals.tags}</p>
            <p className="text-xs text-muted-foreground">Tags</p>
          </CardContent>
        </Card>
      </div>

      {/* Collection Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="people" className="gap-2">
            <Users className="h-4 w-4" />
            People
          </TabsTrigger>
          <TabsTrigger value="places" className="gap-2">
            <MapPin className="h-4 w-4" />
            Places
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-2">
            <FolderKanban className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="time" className="gap-2">
            <Calendar className="h-4 w-4" />
            Time
          </TabsTrigger>
          <TabsTrigger value="tags" className="gap-2">
            <Tag className="h-4 w-4" />
            Tags
          </TabsTrigger>
        </TabsList>

        <TabsContent value="people">
          <CollectionGrid
            items={collections.people || []}
            type="people"
            icon={Users}
            onItemClick={(item) => handleCollectionClick('people', item)}
            emptyMessage="No people tagged in media yet. Tag storytellers in your photos to create people collections."
          />
        </TabsContent>

        <TabsContent value="places">
          <CollectionGrid
            items={collections.places || []}
            type="places"
            icon={MapPin}
            onItemClick={(item) => handleCollectionClick('places', item)}
            emptyMessage="No locations added to media yet. Add locations to your photos to create place collections."
          />
        </TabsContent>

        <TabsContent value="projects">
          <CollectionGrid
            items={collections.projects || []}
            type="projects"
            icon={FolderKanban}
            onItemClick={(item) => handleCollectionClick('projects', item)}
            emptyMessage="No media assigned to projects yet. Tag media with project codes to create project collections."
          />
        </TabsContent>

        <TabsContent value="time">
          <CollectionGrid
            items={collections.time || []}
            type="time"
            icon={Calendar}
            onItemClick={(item) => handleCollectionClick('time', item)}
            emptyMessage="No media with dates yet."
          />
        </TabsContent>

        <TabsContent value="tags">
          <CollectionGrid
            items={collections.tags || []}
            type="tags"
            icon={Tag}
            onItemClick={(item) => handleCollectionClick('tags', item)}
            emptyMessage="No tags with media yet. Add tags to your photos to create tag collections."
          />
        </TabsContent>
      </Tabs>

      {/* Collection Detail Dialog */}
      <Dialog
        open={!!selectedCollection}
        onOpenChange={(open) => !open && setSelectedCollection(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCollection && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedCollection.type === 'people' && <Users className="h-5 w-5 text-earth-600" />}
                  {selectedCollection.type === 'places' && <MapPin className="h-5 w-5 text-sage-600" />}
                  {selectedCollection.type === 'projects' && <FolderKanban className="h-5 w-5 text-clay-600" />}
                  {selectedCollection.type === 'time' && <Calendar className="h-5 w-5 text-purple-600" />}
                  {selectedCollection.type === 'tags' && <Tag className="h-5 w-5 text-amber-600" />}
                  {selectedCollection.item.name}
                  <Badge variant="outline" className="ml-2">
                    {selectedCollection.item.count} items
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {selectedCollection.item.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedCollection.item.description}
                  </p>
                )}

                {selectedCollection.item.metadata?.indigenous_territory && (
                  <Badge variant="outline" className="bg-sage-50 text-sage-700">
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedCollection.item.metadata.indigenous_territory}
                  </Badge>
                )}

                {/* Media Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {(selectedCollection.item.metadata?.media || []).map((media) => (
                    <Card
                      key={media.id}
                      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => {
                        onMediaSelect?.(media.id)
                        setSelectedCollection(null)
                      }}
                    >
                      <div className="aspect-square bg-stone-100">
                        {media.thumbnail_url ? (
                          <img
                            src={media.thumbnail_url}
                            alt={media.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <ImageIcon className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-2">
                        <p className="text-xs font-medium truncate">{media.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(media.created_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedCollection.item.count > (selectedCollection.item.metadata?.media?.length || 0) && (
                  <p className="text-sm text-muted-foreground text-center">
                    Showing {selectedCollection.item.metadata?.media?.length || 0} of {selectedCollection.item.count} items
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Sub-component for grid view of collections
function CollectionGrid({
  items,
  type,
  icon: Icon,
  onItemClick,
  emptyMessage
}: {
  items: CollectionItem[]
  type: string
  icon: React.ElementType
  onItemClick: (item: CollectionItem) => void
  emptyMessage: string
}) {
  if (items.length === 0) {
    return (
      <Card className="p-12 text-center bg-stone-50">
        <Icon className="h-12 w-12 text-stone-300 mx-auto mb-4" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {items.map(item => (
        <Card
          key={item.id}
          className="overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
          onClick={() => onItemClick(item)}
        >
          <div className="aspect-square bg-stone-100 relative">
            {item.thumbnail_url ? (
              <img
                src={item.thumbnail_url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : item.metadata?.avatar_url ? (
              <img
                src={item.metadata.avatar_url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon className="h-12 w-12 text-stone-300" />
              </div>
            )}

            <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
              {item.count}
            </Badge>

            {type === 'places' && item.metadata?.indigenous_territory && (
              <Badge
                variant="outline"
                className="absolute top-2 left-2 bg-sage-50/90 text-sage-700 border-sage-300 text-xs"
              >
                Traditional Land
              </Badge>
            )}

            {type === 'tags' && item.metadata?.cultural_sensitivity_level === 'sacred' && (
              <Badge
                variant="outline"
                className="absolute top-2 left-2 bg-amber-50/90 text-amber-700 border-amber-300 text-xs"
              >
                Sacred
              </Badge>
            )}

            {type === 'tags' && item.metadata?.category && (
              <Badge
                variant="outline"
                className="absolute top-2 right-2 bg-white/90 text-xs capitalize"
              >
                {item.metadata.category}
              </Badge>
            )}
          </div>

          <CardContent className="p-3">
            <p className="font-medium text-sm truncate">{item.name}</p>
            {item.description && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {item.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default AutoCollections
