'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import {
  User,
  UserPlus,
  EyeOff,
  Eye,
  CheckCircle,
  AlertTriangle,
  Search,
  X,
  Shield,
  Users,
  Loader2,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
interface FaceLocation {
  x: number
  y: number
  width: number
  height: number
}

interface DetectedFace {
  id: string
  location: FaceLocation
  linked_storyteller_id: string | null
  linked_storyteller_name?: string
  recognition_consent_granted: boolean
  can_be_public: boolean
  blur_requested: boolean
  confidence?: number
}

interface Storyteller {
  id: string
  name: string
  avatar_url?: string
}

interface PersonHighlightProps {
  mediaId: string
  imageUrl: string
  imageWidth: number
  imageHeight: number
  faces: DetectedFace[]
  availableStorytellers?: Storyteller[]
  onTagPerson: (faceId: string, storytellerId: string) => Promise<void>
  onRequestBlur: (faceId: string, blur: boolean) => Promise<void>
  onRequestConsent: (faceId: string, storytellerId: string) => Promise<void>
  onUntagPerson?: (faceId: string) => Promise<void>
  readOnly?: boolean
  className?: string
}

export function PersonHighlight({
  mediaId,
  imageUrl,
  imageWidth,
  imageHeight,
  faces,
  availableStorytellers = [],
  onTagPerson,
  onRequestBlur,
  onRequestConsent,
  onUntagPerson,
  readOnly = false,
  className
}: PersonHighlightProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [selectedFace, setSelectedFace] = useState<DetectedFace | null>(null)
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false)
  const [isConsentDialogOpen, setIsConsentDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [hoveredFace, setHoveredFace] = useState<string | null>(null)

  // Calculate scale when container resizes
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth
        setScale(containerWidth / imageWidth)
      }
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [imageWidth])

  // Filter storytellers based on search
  const filteredStorytellers = availableStorytellers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle tagging a face
  const handleTagFace = async (storytellerId: string) => {
    if (!selectedFace) return

    setLoading(true)
    try {
      await onTagPerson(selectedFace.id, storytellerId)
      setIsTagDialogOpen(false)
      setSelectedFace(null)
    } catch (error) {
      console.error('Failed to tag person:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle blur request
  const handleBlurRequest = async (faceId: string, blur: boolean) => {
    setLoading(true)
    try {
      await onRequestBlur(faceId, blur)
    } catch (error) {
      console.error('Failed to update blur:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle consent request
  const handleConsentRequest = async () => {
    if (!selectedFace || !selectedFace.linked_storyteller_id) return

    setLoading(true)
    try {
      await onRequestConsent(selectedFace.id, selectedFace.linked_storyteller_id)
      setIsConsentDialogOpen(false)
    } catch (error) {
      console.error('Failed to request consent:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate box position in pixels
  const getBoxStyle = (location: FaceLocation) => {
    return {
      left: `${location.x * scale}px`,
      top: `${location.y * scale}px`,
      width: `${location.width * scale}px`,
      height: `${location.height * scale}px`,
    }
  }

  // Render face status badge
  const getFaceStatusBadge = (face: DetectedFace) => {
    if (face.blur_requested) {
      return (
        <Badge className="bg-stone-600 text-white text-xs">
          <EyeOff className="h-3 w-3 mr-1" />
          Blurred
        </Badge>
      )
    }
    if (!face.linked_storyteller_id) {
      return (
        <Badge variant="outline" className="text-xs">
          <User className="h-3 w-3 mr-1" />
          Unknown
        </Badge>
      )
    }
    if (!face.recognition_consent_granted) {
      return (
        <Badge className="bg-amber-500 text-white text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Pending Consent
        </Badge>
      )
    }
    return (
      <Badge className="bg-sage-600 text-white text-xs">
        <CheckCircle className="h-3 w-3 mr-1" />
        Consented
      </Badge>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Image with face overlays */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg bg-stone-100"
        style={{ maxWidth: imageWidth }}
      >
        {/* Main image */}
        <img
          src={imageUrl}
          alt="Media with face highlights"
          className="w-full h-auto"
          style={{ maxWidth: '100%' }}
        />

        {/* Face boxes */}
        {faces.map((face) => (
          <div
            key={face.id}
            className={cn(
              'absolute border-2 rounded cursor-pointer transition-all',
              face.blur_requested && 'backdrop-blur-lg bg-black/20',
              hoveredFace === face.id && 'ring-2 ring-offset-2',
              face.linked_storyteller_id
                ? face.recognition_consent_granted
                  ? 'border-sage-500 hover:border-sage-400 ring-sage-500'
                  : 'border-amber-500 hover:border-amber-400 ring-amber-500'
                : 'border-stone-400 hover:border-stone-300 ring-stone-400',
              readOnly && 'cursor-default'
            )}
            style={getBoxStyle(face.location)}
            onMouseEnter={() => setHoveredFace(face.id)}
            onMouseLeave={() => setHoveredFace(null)}
            onClick={() => {
              if (!readOnly) {
                setSelectedFace(face)
                if (!face.linked_storyteller_id) {
                  setIsTagDialogOpen(true)
                }
              }
            }}
          >
            {/* Name label */}
            {face.linked_storyteller_name && !face.blur_requested && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <Badge
                  variant="secondary"
                  className="text-xs shadow-md"
                >
                  {face.linked_storyteller_name}
                </Badge>
              </div>
            )}

            {/* Hover tooltip */}
            {hoveredFace === face.id && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
                {getFaceStatusBadge(face)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Face list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-earth-600" />
            People in this photo ({faces.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {faces.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-4">
              No faces detected in this image
            </p>
          ) : (
            <div className="space-y-2">
              {faces.map((face) => (
                <div
                  key={face.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border transition-colors',
                    hoveredFace === face.id ? 'bg-stone-100 border-stone-300' : 'bg-stone-50 border-stone-200'
                  )}
                  onMouseEnter={() => setHoveredFace(face.id)}
                  onMouseLeave={() => setHoveredFace(null)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
                      {face.blur_requested ? (
                        <EyeOff className="h-5 w-5 text-stone-400" />
                      ) : (
                        <User className="h-5 w-5 text-stone-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {face.linked_storyteller_name || 'Unknown person'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {getFaceStatusBadge(face)}
                        {face.can_be_public && (
                          <Badge variant="outline" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Public OK
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {!readOnly && (
                    <div className="flex items-center gap-2">
                      {/* Blur toggle */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBlurRequest(face.id, !face.blur_requested)}
                        disabled={loading}
                        title={face.blur_requested ? 'Remove blur' : 'Request blur'}
                      >
                        {face.blur_requested ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>

                      {/* Tag/Edit button */}
                      {!face.linked_storyteller_id ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFace(face)
                            setIsTagDialogOpen(true)
                          }}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Tag
                        </Button>
                      ) : !face.recognition_consent_granted ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFace(face)
                            setIsConsentDialogOpen(true)
                          }}
                          className="text-amber-600 border-amber-300 hover:bg-amber-50"
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Request Consent
                        </Button>
                      ) : (
                        onUntagPerson && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onUntagPerson(face.id)}
                            className="text-stone-400 hover:text-stone-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tag Person Dialog */}
      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-earth-600" />
              Tag Person
            </DialogTitle>
            <DialogDescription>
              Select a storyteller to tag in this photo. They will be notified to provide consent.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search storytellers..."
                className="pl-9"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredStorytellers.length === 0 ? (
                <p className="text-sm text-stone-500 text-center py-4">
                  No storytellers found
                </p>
              ) : (
                filteredStorytellers.map((storyteller) => (
                  <button
                    key={storyteller.id}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-stone-100 transition-colors text-left"
                    onClick={() => handleTagFace(storyteller.id)}
                    disabled={loading}
                  >
                    <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center overflow-hidden">
                      {storyteller.avatar_url ? (
                        <img
                          src={storyteller.avatar_url}
                          alt={storyteller.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-stone-400" />
                      )}
                    </div>
                    <span className="font-medium">{storyteller.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          <Alert className="border-sage-200 bg-sage-50">
            <Shield className="h-4 w-4 text-sage-600" />
            <AlertDescription className="text-sage-800 text-sm">
              <strong>Two-party consent required:</strong> Both the uploader and the tagged person must consent before face data is stored or made public.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Consent Request Dialog */}
      <Dialog open={isConsentDialogOpen} onOpenChange={setIsConsentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              Request Consent
            </DialogTitle>
            <DialogDescription>
              Send a consent request to {selectedFace?.linked_storyteller_name}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">
                This person has been tagged but hasn't granted consent yet. Their face will remain blurred until consent is granted.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <p className="text-sm font-medium">The consent request will ask for permission to:</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked disabled />
                  Store face recognition data
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked disabled />
                  Display unblurred in community view
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox />
                  Display unblurred in public view
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConsentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConsentRequest}
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Send Consent Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PersonHighlight
