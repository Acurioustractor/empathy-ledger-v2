'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  Search,
  X,
  Plus,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Shield,
  Sparkles,
  Eye,
  Camera,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Storyteller {
  id: string
  displayName: string
  preferredName?: string
  pronouns?: string
  photoUrl?: string
  culturalGroup?: string
  isElder?: boolean
}

export interface LinkedStoryteller extends Storyteller {
  linkId: string
  relationship: string
  consentStatus: string
  source: string
  linkedAt: string
}

interface FaceDetection {
  id: string
  confidence: number
  region: {
    x: number
    y: number
    width: number
    height: number
  }
  suggestedStorytellerId?: string
  suggestedStoryteller?: Storyteller
}

interface StorytellerPickerProps {
  mediaId: string
  facesDetected?: number
  faceDetections?: FaceDetection[]
  onSave?: () => void
  onRemove?: () => void
  readOnly?: boolean
  className?: string
}

const RELATIONSHIP_OPTIONS = [
  { value: 'appears_in', label: 'Appears in', icon: Eye },
  { value: 'photographer', label: 'Photographer', icon: Camera },
  { value: 'subject', label: 'Subject', icon: User },
  { value: 'owner', label: 'Owner', icon: Shield },
  { value: 'tagged_by_face', label: 'Tagged by face', icon: Sparkles },
]

export function StorytellerPicker({
  mediaId,
  facesDetected = 0,
  faceDetections = [],
  onSave,
  onRemove,
  readOnly = false,
  className,
}: StorytellerPickerProps) {
  const [linkedStorytellers, setLinkedStorytellers] = useState<LinkedStoryteller[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Search state
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Storyteller[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedRelationship, setSelectedRelationship] = useState<string>('appears_in')

  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Load linked storytellers
  useEffect(() => {
    async function loadStorytellers() {
      if (!mediaId) return
      setLoading(true)
      try {
        const response = await fetch(`/api/media/${mediaId}/storytellers`)
        if (response.ok) {
          const data = await response.json()
          setLinkedStorytellers(data.storytellers || [])
        }
      } catch (err) {
        console.error('Failed to load storytellers:', err)
        setError('Failed to load linked storytellers')
      } finally {
        setLoading(false)
      }
    }
    loadStorytellers()
  }, [mediaId])

  // Search storytellers
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const response = await fetch(`/api/storytellers?search=${encodeURIComponent(searchQuery)}&limit=10`)
        if (response.ok) {
          const data = await response.json()
          // Transform to our Storyteller type
          const storytellers: Storyteller[] = (data.storytellers || []).map((s: any) => ({
            id: s.id,
            displayName: s.display_name,
            preferredName: s.preferred_name,
            pronouns: s.pronouns,
            photoUrl: s.avatar_url || s.profile?.avatar_url,
            culturalGroup: s.cultural_background?.[0],
            isElder: s.elder_status
          }))
          // Filter out already linked storytellers
          const linkedIds = linkedStorytellers.map(ls => ls.id)
          setSearchResults(storytellers.filter(s => !linkedIds.includes(s.id)))
        }
      } catch (err) {
        console.error('Failed to search storytellers:', err)
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, linkedStorytellers])

  // Link a storyteller
  const handleLinkStoryteller = async (storyteller: Storyteller, relationship?: string) => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/media/${mediaId}/storytellers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storytellers: [{
            storytellerId: storyteller.id,
            relationship: relationship || selectedRelationship,
            source: 'manual'
          }]
        })
      })

      if (response.ok) {
        // Reload to get the new link
        const reloadResponse = await fetch(`/api/media/${mediaId}/storytellers`)
        if (reloadResponse.ok) {
          const data = await reloadResponse.json()
          setLinkedStorytellers(data.storytellers || [])
        }
        setSuccess(`Linked ${storyteller.displayName}`)
        setSearchOpen(false)
        setSearchQuery('')
        onSave?.()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to link storyteller')
      }
    } catch (err) {
      setError('Failed to link storyteller')
    } finally {
      setSaving(false)
    }
  }

  // Unlink a storyteller
  const handleUnlinkStoryteller = async (linkId: string, displayName: string) => {
    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/media/${mediaId}/storytellers`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkIds: [linkId] })
      })

      if (response.ok) {
        setLinkedStorytellers(prev => prev.filter(ls => ls.linkId !== linkId))
        setSuccess(`Unlinked ${displayName}`)
        onRemove?.()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to unlink storyteller')
      }
    } catch (err) {
      setError('Failed to unlink storyteller')
    } finally {
      setSaving(false)
    }
  }

  // Accept face detection suggestion
  const handleAcceptFaceSuggestion = async (detection: FaceDetection) => {
    if (!detection.suggestedStoryteller) return

    await handleLinkStoryteller(detection.suggestedStoryteller, 'tagged_by_face')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const getRelationshipInfo = (value: string) => {
    return RELATIONSHIP_OPTIONS.find(opt => opt.value === value) || RELATIONSHIP_OPTIONS[0]
  }

  if (loading) {
    return (
      <div className={cn('py-12 text-center', className)}>
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-stone-400" />
        <p className="mt-2 text-sm text-stone-500">Loading storytellers...</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Status messages */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Face detection info */}
      {facesDetected > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-800 mb-2">
            <Sparkles className="h-4 w-4" />
            {facesDetected} face{facesDetected > 1 ? 's' : ''} detected
          </div>
          {faceDetections.filter(d => d.suggestedStoryteller).length > 0 && (
            <div className="space-y-2">
              {faceDetections.filter(d => d.suggestedStoryteller).map((detection) => (
                <div
                  key={detection.id}
                  className="flex items-center justify-between p-2 bg-white rounded border border-blue-100"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={detection.suggestedStoryteller?.photoUrl} />
                      <AvatarFallback className="text-xs">
                        {getInitials(detection.suggestedStoryteller?.displayName || '?')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{detection.suggestedStoryteller?.displayName}</p>
                      <p className="text-xs text-stone-500">
                        {Math.round(detection.confidence * 100)}% match
                      </p>
                    </div>
                  </div>
                  {!readOnly && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAcceptFaceSuggestion(detection)}
                        disabled={saving}
                        className="h-7 text-xs"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-stone-500"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Linked storytellers */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4 text-sage-600" />
          Linked Storytellers ({linkedStorytellers.length})
        </h4>

        {linkedStorytellers.length === 0 ? (
          <p className="text-sm text-stone-500 italic py-2">No storytellers linked yet</p>
        ) : (
          <div className="space-y-2">
            {linkedStorytellers.map((ls) => {
              const relationshipInfo = getRelationshipInfo(ls.relationship)
              const RelIcon = relationshipInfo.icon

              return (
                <div
                  key={ls.linkId}
                  className="flex items-center justify-between p-3 bg-stone-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={ls.photoUrl} />
                      <AvatarFallback>
                        {getInitials(ls.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{ls.displayName}</p>
                        {ls.isElder && (
                          <Badge variant="outline" className="text-purple-600 border-purple-300 text-xs">
                            Elder
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <RelIcon className="h-3 w-3" />
                        <span>{relationshipInfo.label}</span>
                        {ls.source === 'face_detection' && (
                          <Badge variant="secondary" className="text-[10px]">
                            <Sparkles className="h-2 w-2 mr-0.5" />
                            Face match
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Consent status */}
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        ls.consentStatus === 'approved' && 'text-green-600 border-green-300',
                        ls.consentStatus === 'pending' && 'text-amber-600 border-amber-300',
                        ls.consentStatus === 'declined' && 'text-red-600 border-red-300'
                      )}
                    >
                      {ls.consentStatus}
                    </Badge>

                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnlinkStoryteller(ls.linkId, ls.displayName)}
                        disabled={saving}
                        className="h-8 w-8 p-0 text-stone-400 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add storyteller */}
      {!readOnly && (
        <div className="flex gap-2">
          <Select value={selectedRelationship} onValueChange={setSelectedRelationship}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Relationship" />
            </SelectTrigger>
            <SelectContent>
              {RELATIONSHIP_OPTIONS.map(opt => {
                const OptIcon = opt.icon
                return (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <OptIcon className="h-3 w-3" />
                      <span>{opt.label}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>

          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex-1 justify-start text-stone-500">
                <Plus className="h-4 w-4 mr-2" />
                Add Storyteller...
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0" align="start">
              <Command shouldFilter={false}>
                <div className="flex items-center border-b px-3">
                  <Search className="h-4 w-4 mr-2 text-stone-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search storytellers..."
                    className="border-0 focus-visible:ring-0 px-0"
                  />
                  {searching && <Loader2 className="h-4 w-4 animate-spin text-stone-400" />}
                </div>
                <CommandList>
                  {!searching && searchQuery && searchResults.length === 0 && (
                    <CommandEmpty>No storytellers found</CommandEmpty>
                  )}
                  {searchResults.length > 0 && (
                    <CommandGroup heading="Storytellers">
                      {searchResults.map((storyteller) => (
                        <CommandItem
                          key={storyteller.id}
                          value={storyteller.id}
                          onSelect={() => handleLinkStoryteller(storyteller)}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={storyteller.photoUrl} />
                            <AvatarFallback className="text-xs">
                              {getInitials(storyteller.displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{storyteller.displayName}</span>
                              {storyteller.isElder && (
                                <Badge variant="outline" className="text-purple-600 border-purple-300 text-[10px]">
                                  Elder
                                </Badge>
                              )}
                            </div>
                            {storyteller.culturalGroup && (
                              <span className="text-xs text-stone-500">{storyteller.culturalGroup}</span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  )
}

export default StorytellerPicker
