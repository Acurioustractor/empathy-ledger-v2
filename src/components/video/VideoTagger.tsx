'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tag,
  Users,
  MapPin,
  Plus,
  X,
  Loader2,
  Search,
  ChevronDown
} from 'lucide-react'
import { VideoLocationPicker } from './VideoLocationPicker'

interface VideoTaggerProps {
  videoId: string
  onSave?: () => void
}

interface TagItem {
  id: string
  name: string
  slug: string
  category: string
}

interface Storyteller {
  id: string
  name: string
  imageUrl: string | null
  relationship?: string
  consentStatus?: string
}

interface Location {
  latitude: number
  longitude: number
  placeName: string
  locality?: string
  region?: string
  country?: string
  indigenousTerritory?: string
}

const RELATIONSHIP_OPTIONS = [
  { value: 'appears_in', label: 'Appears In' },
  { value: 'interviewer', label: 'Interviewer' },
  { value: 'interviewee', label: 'Interviewee' },
  { value: 'narrator', label: 'Narrator' },
  { value: 'producer', label: 'Producer' },
  { value: 'featured', label: 'Featured' },
]

// Simple searchable dropdown component
function SearchableDropdown<T extends { id: string; name: string }>({
  items,
  onSelect,
  placeholder,
  renderItem,
  disabled,
}: {
  items: T[]
  onSelect: (item: T) => void
  placeholder: string
  renderItem: (item: T) => React.ReactNode
  disabled?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div ref={dropdownRef} className="relative">
      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        type="button"
      >
        <Plus className="h-4 w-4" />
        {placeholder}
        <ChevronDown className="h-4 w-4 ml-auto" />
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-8 h-8"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {filteredItems.length === 0 ? (
              <p className="text-sm text-stone-500 text-center py-4">No results found</p>
            ) : (
              filteredItems.slice(0, 20).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-stone-100 cursor-pointer"
                  onClick={() => {
                    onSelect(item)
                    setIsOpen(false)
                    setSearch('')
                  }}
                >
                  {renderItem(item)}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function VideoTagger({ videoId, onSave }: VideoTaggerProps) {
  // Tags state
  const [tags, setTags] = useState<TagItem[]>([])
  const [availableTags, setAvailableTags] = useState<TagItem[]>([])
  const [loadingTags, setLoadingTags] = useState(true)
  const [savingTags, setSavingTags] = useState(false)

  // Storytellers state
  const [storytellers, setStorytellers] = useState<Storyteller[]>([])
  const [availableStorytellers, setAvailableStorytellers] = useState<Storyteller[]>([])
  const [loadingStorytellers, setLoadingStorytellers] = useState(true)
  const [savingStorytellers, setSavingStorytellers] = useState(false)

  // Location state
  const [location, setLocation] = useState<Location | null>(null)

  // Fetch current tags
  useEffect(() => {
    const fetchTags = async () => {
      setLoadingTags(true)
      try {
        const [currentRes, availableRes] = await Promise.all([
          fetch(`/api/videos/${videoId}/tags`),
          fetch('/api/tags')
        ])

        const currentData = await currentRes.json()
        const availableData = await availableRes.json()

        setTags(currentData.tags || [])
        setAvailableTags(availableData.tags || [])
      } catch (err) {
        console.error('Error fetching tags:', err)
      } finally {
        setLoadingTags(false)
      }
    }

    fetchTags()
  }, [videoId])

  // Fetch current storytellers
  useEffect(() => {
    const fetchStorytellers = async () => {
      setLoadingStorytellers(true)
      try {
        const [currentRes, availableRes] = await Promise.all([
          fetch(`/api/videos/${videoId}/storytellers`),
          fetch('/api/storytellers?limit=100')
        ])

        const currentData = await currentRes.json()
        const availableData = await availableRes.json()

        setStorytellers(currentData.storytellers || [])

        // Map storytellers API response to our format
        const rawStorytellers = availableData.storytellers || availableData.data || []
        const mappedStorytellers = rawStorytellers.map((s: any) => ({
          id: s.id,
          name: s.display_name || s.name,
          imageUrl: s.avatar_url || s.profile_image_url || s.imageUrl
        }))
        setAvailableStorytellers(mappedStorytellers)
      } catch (err) {
        console.error('Error fetching storytellers:', err)
      } finally {
        setLoadingStorytellers(false)
      }
    }

    fetchStorytellers()
  }, [videoId])

  // Fetch current location
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await fetch(`/api/videos/${videoId}/location`)
        const data = await res.json()
        setLocation(data.location)
      } catch (err) {
        console.error('Error fetching location:', err)
      }
    }

    fetchLocation()
  }, [videoId])

  // Add tag
  const addTag = async (tag: TagItem) => {
    if (tags.some(t => t.id === tag.id)) return

    setSavingTags(true)
    try {
      await fetch(`/api/videos/${videoId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagIds: [tag.id] })
      })

      setTags([...tags, tag])
    } catch (err) {
      console.error('Error adding tag:', err)
    } finally {
      setSavingTags(false)
    }
  }

  // Remove tag
  const removeTag = async (tagId: string) => {
    setSavingTags(true)
    try {
      await fetch(`/api/videos/${videoId}/tags?tagId=${tagId}`, {
        method: 'DELETE'
      })

      setTags(tags.filter(t => t.id !== tagId))
    } catch (err) {
      console.error('Error removing tag:', err)
    } finally {
      setSavingTags(false)
    }
  }

  // Add storyteller
  const addStoryteller = async (storyteller: Storyteller) => {
    if (storytellers.some(s => s.id === storyteller.id)) return

    setSavingStorytellers(true)
    try {
      await fetch(`/api/videos/${videoId}/storytellers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storytellers: [{
            id: storyteller.id,
            relationship: 'appears_in',
            consentStatus: 'pending'
          }]
        })
      })

      setStorytellers([...storytellers, { ...storyteller, relationship: 'appears_in', consentStatus: 'pending' }])
    } catch (err) {
      console.error('Error adding storyteller:', err)
    } finally {
      setSavingStorytellers(false)
    }
  }

  // Remove storyteller
  const removeStoryteller = async (storytellerId: string) => {
    setSavingStorytellers(true)
    try {
      await fetch(`/api/videos/${videoId}/storytellers?storytellerId=${storytellerId}`, {
        method: 'DELETE'
      })

      setStorytellers(storytellers.filter(s => s.id !== storytellerId))
    } catch (err) {
      console.error('Error removing storyteller:', err)
    } finally {
      setSavingStorytellers(false)
    }
  }

  // Update storyteller relationship
  const updateStorytellerRelationship = async (storytellerId: string, relationship: string) => {
    try {
      await fetch(`/api/videos/${videoId}/storytellers`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storytellerId, relationship })
      })

      setStorytellers(storytellers.map(s =>
        s.id === storytellerId ? { ...s, relationship } : s
      ))
    } catch (err) {
      console.error('Error updating relationship:', err)
    }
  }

  // Filter available tags (exclude already selected)
  const filteredTags = availableTags.filter(t => !tags.some(st => st.id === t.id))

  // Filter available storytellers (exclude already selected)
  const filteredStorytellers = availableStorytellers.filter(s => !storytellers.some(ss => ss.id === s.id))

  return (
    <Tabs defaultValue="tagger-tags" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="tagger-tags" className="gap-2">
          <Tag className="h-4 w-4" />
          Tags
          {tags.length > 0 && (
            <Badge variant="secondary" className="ml-1">{tags.length}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="tagger-people" className="gap-2">
          <Users className="h-4 w-4" />
          People
          {storytellers.length > 0 && (
            <Badge variant="secondary" className="ml-1">{storytellers.length}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="tagger-location" className="gap-2">
          <MapPin className="h-4 w-4" />
          Location
          {location && (
            <Badge variant="secondary" className="ml-1">1</Badge>
          )}
        </TabsTrigger>
      </TabsList>

      {/* Tags Tab */}
      <TabsContent value="tagger-tags" className="space-y-4 mt-4">
        {loadingTags ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <>
            <SearchableDropdown
              items={filteredTags}
              onSelect={addTag}
              placeholder="Add Tags"
              disabled={savingTags}
              renderItem={(tag) => (
                <div className="flex items-center justify-between w-full">
                  <span>{tag.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {tag.category}
                  </Badge>
                </div>
              )}
            />

            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {tag.name}
                    <button
                      type="button"
                      className="h-4 w-4 p-0 hover:bg-destructive/20 rounded inline-flex items-center justify-center"
                      onClick={() => removeTag(tag.id)}
                      disabled={savingTags}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tags added yet
              </p>
            )}
          </>
        )}
      </TabsContent>

      {/* People Tab */}
      <TabsContent value="tagger-people" className="space-y-4 mt-4">
        {loadingStorytellers ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <>
            <SearchableDropdown
              items={filteredStorytellers}
              onSelect={addStoryteller}
              placeholder="Add People"
              disabled={savingStorytellers}
              renderItem={(s) => (
                <div className="flex items-center gap-2">
                  {s.imageUrl ? (
                    <img
                      src={s.imageUrl}
                      alt={s.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center">
                      <Users className="h-3 w-3 text-stone-500" />
                    </div>
                  )}
                  <span>{s.name}</span>
                </div>
              )}
            />

            {storytellers.length > 0 ? (
              <div className="space-y-2">
                {storytellers.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2 bg-stone-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {s.imageUrl ? (
                        <img
                          src={s.imageUrl}
                          alt={s.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center">
                          <Users className="h-4 w-4 text-stone-500" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{s.name}</p>
                        <Select
                          value={s.relationship || 'appears_in'}
                          onValueChange={(v) => updateStorytellerRelationship(s.id, v)}
                        >
                          <SelectTrigger className="h-6 text-xs border-0 bg-transparent p-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {RELATIONSHIP_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeStoryteller(s.id)}
                      disabled={savingStorytellers}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No people linked yet
              </p>
            )}
          </>
        )}
      </TabsContent>

      {/* Location Tab */}
      <TabsContent value="tagger-location" className="mt-4">
        <VideoLocationPicker
          videoId={videoId}
          initialLocation={location}
          onSave={(newLocation) => {
            setLocation(newLocation)
            onSave?.()
          }}
          onRemove={() => {
            setLocation(null)
            onSave?.()
          }}
        />
      </TabsContent>
    </Tabs>
  )
}
