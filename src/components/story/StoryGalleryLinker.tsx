'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Images, 
  Plus, 
  X, 
  Search,
  Link,
  Unlink,
  Camera
} from 'lucide-react'
import CreateGalleryModal from '@/components/project/CreateGalleryModal'

interface Gallery {
  id: string
  title: string
  description: string
  cultural_theme: string
  photo_count: number
  created_at: string
  visibility: string
  cultural_sensitivity_level: string
}

interface StoryGalleryLinkerProps {
  storyId: string
  storyTitle: string
  culturalTheme?: string
  organizationId?: string
  onLinksChanged?: () => void
}

export default function StoryGalleryLinker({
  storyId,
  storyTitle,
  culturalTheme,
  organizationId,
  onLinksChanged
}: StoryGalleryLinkerProps) {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [linkedGalleries, setLinkedGalleries] = useState<Gallery[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    loadGalleries()
    loadLinkedGalleries()
  }, [storyId])

  const loadGalleries = async () => {
    try {
      const { data, error } = await supabase
        .from('galleries')
        .select('id, title, description, cultural_theme, photo_count, created_at, visibility, cultural_sensitivity_level')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setGalleries(data)
      }
    } catch (error) {
      console.error('Error loading galleries:', error)
    }
  }

  const loadLinkedGalleries = async () => {
    try {
      const { data, error } = await supabase
        .from('story_gallery_links')
        .select(`
          *,
          galleries:gallery_id (
            id,
            title,
            description,
            cultural_theme,
            photo_count,
            created_at,
            visibility,
            cultural_sensitivity_level
          )
        `)
        .eq('story_id', storyId)

      if (!error && data) {
        const linked = data.map(link => link.galleries).filter(Boolean)
        setLinkedGalleries(linked)
      }
    } catch (error) {
      console.error('Error loading linked galleries:', error)
    }
  }

  const linkGallery = async (galleryId: string, linkType: string = 'related') => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('story_gallery_links')
        .insert({
          story_id: storyId,
          gallery_id: galleryId,
          link_type: linkType,
          description: `Gallery linked to story: ${storyTitle}`
        })

      if (!error) {
        await loadLinkedGalleries()
        onLinksChanged?.()
      }
    } catch (error) {
      console.error('Error linking gallery:', error)
    } finally {
      setLoading(false)
    }
  }

  const unlinkGallery = async (galleryId: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('story_gallery_links')
        .delete()
        .eq('story_id', storyId)
        .eq('gallery_id', galleryId)

      if (!error) {
        await loadLinkedGalleries()
        onLinksChanged?.()
      }
    } catch (error) {
      console.error('Error unlinking gallery:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredGalleries = galleries.filter(gallery => {
    const matchesSearch = gallery.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gallery.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gallery.cultural_theme?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const notLinked = !linkedGalleries.some(linked => linked.id === gallery.id)
    
    return matchesSearch && notLinked
  })

  const handleGalleryCreated = (newGallery: any) => {
    setGalleries([newGallery, ...galleries])
    // Auto-link the newly created gallery
    linkGallery(newGallery.id, 'featured')
  }

  return (
    <div className="space-y-6">
      {/* Linked Galleries Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Images className="h-5 w-5" />
            Linked Galleries ({linkedGalleries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {linkedGalleries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Images className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No galleries linked to this story yet</p>
              <p className="text-sm">Create or link galleries to provide visual context</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {linkedGalleries.map((gallery) => (
                <Card key={gallery.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium">{gallery.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {gallery.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {gallery.photo_count} photos
                          </Badge>
                          {gallery.cultural_theme && (
                            <Badge variant="secondary" className="text-xs">
                              {gallery.cultural_theme.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => unlinkGallery(gallery.id)}
                        disabled={loading}
                      >
                        <Unlink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Gallery Section */}
      <Card>
        <CardHeader>
          <CardTitle>Link Existing Gallery or Create New</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Create New Gallery */}
          <Button
            onClick={() => setShowCreateModal(true)}
            className="w-full"
            variant="outline"
          >
            <Camera className="h-4 w-4 mr-2" />
            Create New Gallery for This Story
          </Button>

          {/* Search Existing */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search existing galleries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Available Galleries */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredGalleries.map((gallery) => (
                <Card key={gallery.id} className="border">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-sm">{gallery.title}</h5>
                          <Badge variant="outline" className="text-xs">
                            {gallery.photo_count} photos
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {gallery.description}
                        </p>
                        {gallery.cultural_theme && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {gallery.cultural_theme.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => linkGallery(gallery.id)}
                        disabled={loading}
                      >
                        <Link className="h-4 w-4 mr-1" />
                        Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredGalleries.length === 0 && searchTerm && (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No galleries match your search</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Gallery Modal */}
      <CreateGalleryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        storyId={storyId}
        organizationId={organizationId}
        context={{
          title: `${storyTitle} - Gallery`,
          culturalTheme: culturalTheme,
          description: `Photo gallery related to the story: ${storyTitle}`
        }}
        onGalleryCreated={handleGalleryCreated}
      />
    </div>
  )
}