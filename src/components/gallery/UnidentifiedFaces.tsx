'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Users,
  User,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  CheckCircle,
  Link2,
  AlertTriangle,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface UnidentifiedFace {
  id: string
  media_asset_id: string
  thumbnail_url: string
  media_title: string
  face_location: {
    x: number
    y: number
    width: number
    height: number
  }
  created_at: string
}

interface FaceGroup {
  id: string
  faces: UnidentifiedFace[]
  suggested_storyteller?: {
    id: string
    name: string
    avatar_url?: string
  }
}

interface Storyteller {
  id: string
  display_name: string
  avatar_url?: string
  bio?: string
}

interface UnidentifiedFacesProps {
  onRefresh?: () => void
  className?: string
}

export function UnidentifiedFaces({ onRefresh, className }: UnidentifiedFacesProps) {
  const [faceGroups, setFaceGroups] = useState<FaceGroup[]>([])
  const [unlinkedFaces, setUnlinkedFaces] = useState<UnidentifiedFace[]>([])
  const [loading, setLoading] = useState(true)
  const [linking, setLinking] = useState(false)

  // Dialog states
  const [selectedGroup, setSelectedGroup] = useState<FaceGroup | null>(null)
  const [selectedFace, setSelectedFace] = useState<UnidentifiedFace | null>(null)
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [storytellerSearch, setStorytellerSearch] = useState('')
  const [storytellers, setStorytellers] = useState<Storyteller[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  // Fetch unidentified faces
  const fetchFaces = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch from media_storytellers with pending/unlinked status
      const response = await fetch('/api/media/faces/unidentified')
      if (response.ok) {
        const data = await response.json()
        setFaceGroups(data.groups || [])
        setUnlinkedFaces(data.unlinked || [])
      }
    } catch (error) {
      console.error('Error fetching unidentified faces:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFaces()
  }, [fetchFaces])

  // Search storytellers
  const searchStorytellers = useCallback(async (query: string) => {
    if (query.length < 2) {
      setStorytellers([])
      return
    }

    setSearchLoading(true)
    try {
      const response = await fetch(`/api/storytellers?search=${encodeURIComponent(query)}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setStorytellers(data.storytellers || [])
      }
    } catch (error) {
      console.error('Error searching storytellers:', error)
    } finally {
      setSearchLoading(false)
    }
  }, [])

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchStorytellers(storytellerSearch)
    }, 300)
    return () => clearTimeout(debounce)
  }, [storytellerSearch, searchStorytellers])

  // Link faces to storyteller
  const handleLinkFaces = async (storytellerId: string, faceIds: string[]) => {
    setLinking(true)
    try {
      const response = await fetch('/api/media/faces/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storytellerId,
          faceIds,
          relationship: 'appears_in',
          consentStatus: 'pending' // Will need storyteller consent
        })
      })

      if (response.ok) {
        // Refresh the list
        await fetchFaces()
        setIsLinkDialogOpen(false)
        setSelectedGroup(null)
        setSelectedFace(null)
        onRefresh?.()
      }
    } catch (error) {
      console.error('Error linking faces:', error)
    } finally {
      setLinking(false)
    }
  }

  // Open link dialog for a group or single face
  const openLinkDialog = (groupOrFace: FaceGroup | UnidentifiedFace) => {
    if ('faces' in groupOrFace) {
      setSelectedGroup(groupOrFace)
      setSelectedFace(null)
    } else {
      setSelectedFace(groupOrFace)
      setSelectedGroup(null)
    }
    setIsLinkDialogOpen(true)
    setStorytellerSearch('')
    setStorytellers([])
  }

  const getFaceIds = () => {
    if (selectedGroup) return selectedGroup.faces.map(f => f.id)
    if (selectedFace) return [selectedFace.id]
    return []
  }

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center h-48', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
        <span className="ml-2 text-stone-600">Finding faces...</span>
      </div>
    )
  }

  const totalFaces = faceGroups.reduce((sum, g) => sum + g.faces.length, 0) + unlinkedFaces.length

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card className="bg-gradient-to-r from-earth-50 via-stone-50 to-stone-50 border-stone-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-earth-600" />
                Unidentified Faces
              </CardTitle>
              <CardDescription>
                Group similar faces and link them to storytellers
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white">
                {totalFaces} unidentified
              </Badge>
              <Button variant="outline" size="sm" onClick={fetchFaces} disabled={loading}>
                <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {totalFaces === 0 ? (
        <Card className="p-12 text-center bg-stone-50">
          <CheckCircle className="h-12 w-12 text-sage-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-900 mb-2">All faces identified!</h3>
          <p className="text-stone-500">
            There are no unidentified faces in your media library.
          </p>
        </Card>
      ) : (
        <>
          {/* Face Groups */}
          {faceGroups.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-stone-700 flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Grouped Faces ({faceGroups.length} groups)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {faceGroups.map(group => (
                  <Card
                    key={group.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => openLinkDialog(group)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-earth-100 flex items-center justify-center">
                          {group.suggested_storyteller?.avatar_url ? (
                            <img
                              src={group.suggested_storyteller.avatar_url}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-6 w-6 text-earth-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {group.suggested_storyteller?.name || 'Unknown Person'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {group.faces.length} photos
                          </p>
                        </div>
                        {group.suggested_storyteller && (
                          <Badge variant="outline" className="bg-sage-50 text-sage-700">
                            Suggested
                          </Badge>
                        )}
                      </div>

                      {/* Face previews */}
                      <div className="grid grid-cols-4 gap-1">
                        {group.faces.slice(0, 4).map(face => (
                          <div
                            key={face.id}
                            className="aspect-square rounded overflow-hidden bg-stone-100"
                          >
                            {face.thumbnail_url && (
                              <img
                                src={face.thumbnail_url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      {group.faces.length > 4 && (
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          +{group.faces.length - 4} more
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Individual Unlinked Faces */}
          {unlinkedFaces.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-stone-700 flex items-center gap-2">
                <User className="h-4 w-4" />
                Individual Faces ({unlinkedFaces.length})
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {unlinkedFaces.map(face => (
                  <Card
                    key={face.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => openLinkDialog(face)}
                  >
                    <div className="aspect-square bg-stone-100 relative">
                      {face.thumbnail_url ? (
                        <img
                          src={face.thumbnail_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="h-8 w-8 text-stone-300" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-2">
                      <p className="text-xs truncate">{face.media_title}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Link to Storyteller Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-earth-600" />
              Link to Storyteller
            </DialogTitle>
            <DialogDescription>
              {selectedGroup
                ? `Link ${selectedGroup.faces.length} photos to a storyteller`
                : 'Link this face to a storyteller'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Preview of faces being linked */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {(selectedGroup?.faces || (selectedFace ? [selectedFace] : [])).slice(0, 6).map(face => (
                <div
                  key={face.id}
                  className="w-16 h-16 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0"
                >
                  {face.thumbnail_url && (
                    <img
                      src={face.thumbnail_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ))}
              {selectedGroup && selectedGroup.faces.length > 6 && (
                <div className="w-16 h-16 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-muted-foreground">
                    +{selectedGroup.faces.length - 6}
                  </span>
                </div>
              )}
            </div>

            {/* Storyteller search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Storytellers</label>
              <input
                type="text"
                value={storytellerSearch}
                onChange={(e) => setStorytellerSearch(e.target.value)}
                placeholder="Type a name..."
                className="w-full px-3 py-2 border border-stone-200 rounded-md"
              />

              {/* Search results */}
              {searchLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-sage-600" />
                </div>
              ) : storytellers.length > 0 ? (
                <div className="max-h-48 overflow-y-auto border border-stone-200 rounded-md divide-y">
                  {storytellers.map(storyteller => (
                    <button
                      key={storyteller.id}
                      className="w-full flex items-center gap-3 p-3 hover:bg-sage-50 transition-colors text-left"
                      onClick={() => handleLinkFaces(storyteller.id, getFaceIds())}
                      disabled={linking}
                    >
                      <div className="w-10 h-10 rounded-full bg-earth-100 flex items-center justify-center overflow-hidden">
                        {storyteller.avatar_url ? (
                          <img
                            src={storyteller.avatar_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-earth-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{storyteller.display_name}</p>
                        {storyteller.bio && (
                          <p className="text-xs text-muted-foreground truncate">
                            {storyteller.bio}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : storytellerSearch.length >= 2 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No storytellers found
                </p>
              ) : null}
            </div>

            {/* Consent notice */}
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">
                <strong>Consent Required:</strong> The storyteller will be notified and must consent before being publicly linked to these photos.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)} disabled={linking}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UnidentifiedFaces
