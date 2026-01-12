'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tag,
  MapPin,
  Users,
  FolderKanban,
  Sparkles,
  Loader2,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TagAutocomplete, SelectedTag, AITagSuggestion } from './TagAutocomplete'
import { LocationPicker, LocationData } from './LocationPicker'
import { StorytellerPicker } from './StorytellerPicker'

// Types
export interface MediaAsset {
  id: string
  title?: string
  thumbnailUrl?: string
  contentType: string
  projectCode?: string
  culturalSensitivityLevel?: string
  facesDetected?: number
}

interface MediaTag {
  id: string
  tagId: string
  tagName: string
  tagSlug: string
  category: string
  source: string
  confidence: number | null
  verified: boolean
  elderApproved: boolean
  culturalSensitivityLevel: string
  addedAt: string
}

interface EnhancedMediaTaggerProps {
  mediaId: string
  media?: MediaAsset
  onSave?: () => void
  readOnly?: boolean
  className?: string
}

const ACT_PROJECTS = [
  { value: 'empathy-ledger', label: 'Empathy Ledger' },
  { value: 'justicehub', label: 'JusticeHub' },
  { value: 'act-farm', label: 'ACT Farm' },
  { value: 'harvest', label: 'The Harvest' },
  { value: 'goods', label: 'Goods on Country' },
  { value: 'placemat', label: 'ACT Placemat' },
  { value: 'studio', label: 'ACT Studio' },
]

export function EnhancedMediaTagger({
  mediaId,
  media,
  onSave,
  readOnly = false,
  className,
}: EnhancedMediaTaggerProps) {
  const [activeTab, setActiveTab] = useState('tags')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Tags state
  const [selectedTags, setSelectedTags] = useState<SelectedTag[]>([])
  const [aiSuggestions, setAiSuggestions] = useState<AITagSuggestion[]>([])
  const [originalTags, setOriginalTags] = useState<string[]>([])

  // Project state
  const [projectCode, setProjectCode] = useState<string | undefined>(media?.projectCode)

  // Load existing tags
  const loadTags = useCallback(async () => {
    if (!mediaId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/media/${mediaId}/tags`)
      if (response.ok) {
        const data = await response.json()

        // Transform to SelectedTag format
        const tags: SelectedTag[] = (data.tags || []).map((t: MediaTag) => ({
          id: t.tagId,
          name: t.tagName,
          slug: t.tagSlug,
          category: t.category,
          culturalSensitivityLevel: t.culturalSensitivityLevel,
          requiresElderApproval: t.culturalSensitivityLevel !== 'public',
          usageCount: 0,
          source: t.source as any,
          confidence: t.confidence,
        }))

        setSelectedTags(tags)
        setOriginalTags(tags.map(t => t.id))
        setAiSuggestions(data.aiSuggestions || [])
      }
    } catch (err) {
      console.error('Failed to load tags:', err)
      setError('Failed to load tags')
    } finally {
      setLoading(false)
    }
  }, [mediaId])

  useEffect(() => {
    loadTags()
  }, [loadTags])

  // Handle tag changes
  const handleTagsChange = (tags: SelectedTag[]) => {
    setSelectedTags(tags)
    setSuccess(null)
  }

  // Accept AI suggestion
  const handleAcceptAISuggestion = async (suggestion: AITagSuggestion) => {
    try {
      const response = await fetch(`/api/media/${mediaId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newTags: [{ name: suggestion.name, category: suggestion.category }],
          source: 'ai_verified',
        }),
      })

      if (response.ok) {
        // Remove from suggestions
        setAiSuggestions(prev => prev.filter(s => s.name !== suggestion.name))
        // Reload tags to get the new one with proper ID
        await loadTags()
        setSuccess(`Added "${suggestion.name}" tag`)
      }
    } catch (err) {
      console.error('Failed to accept suggestion:', err)
    }
  }

  // Reject AI suggestion
  const handleRejectAISuggestion = (suggestion: AITagSuggestion) => {
    setAiSuggestions(prev => prev.filter(s => s.name !== suggestion.name))
  }

  // Save tags
  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Determine added and removed tags
      const currentIds = selectedTags.map(t => t.id)
      const addedIds = currentIds.filter(id => !originalTags.includes(id))
      const removedIds = originalTags.filter(id => !currentIds.includes(id))

      // Add new tags
      if (addedIds.length > 0) {
        await fetch(`/api/media/${mediaId}/tags`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tagIds: addedIds, source: 'manual' }),
        })
      }

      // Remove tags
      if (removedIds.length > 0) {
        await fetch(`/api/media/${mediaId}/tags`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tagIds: removedIds }),
        })
      }

      setOriginalTags(currentIds)
      setSuccess('Tags saved successfully')
      onSave?.()
    } catch (err) {
      console.error('Failed to save tags:', err)
      setError('Failed to save tags')
    } finally {
      setSaving(false)
    }
  }

  // Check if there are unsaved changes
  const hasChanges = JSON.stringify(selectedTags.map(t => t.id).sort()) !==
    JSON.stringify(originalTags.sort())

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-stone-400" />
          <p className="mt-2 text-sm text-stone-500">Loading tags...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Tag className="h-5 w-5 text-sage-600" />
              Media Tagging
            </CardTitle>
            <CardDescription>
              Add tags, location, people, and project associations
            </CardDescription>
          </div>
          {!readOnly && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadTags}
                disabled={loading}
              >
                <RefreshCw className={cn('h-4 w-4 mr-1', loading && 'animate-spin')} />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="bg-sage-600 hover:bg-sage-700"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Status messages */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tags" className="flex items-center gap-1.5">
              <Tag className="h-4 w-4" />
              Tags
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {selectedTags.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="location" className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              Location
            </TabsTrigger>
            <TabsTrigger value="people" className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              People
            </TabsTrigger>
            <TabsTrigger value="project" className="flex items-center gap-1.5">
              <FolderKanban className="h-4 w-4" />
              Project
            </TabsTrigger>
          </TabsList>

          {/* Tags Tab */}
          <TabsContent value="tags" className="mt-4 space-y-4">
            <TagAutocomplete
              selectedTags={selectedTags}
              onTagsChange={handleTagsChange}
              aiSuggestions={aiSuggestions}
              onAcceptAISuggestion={handleAcceptAISuggestion}
              onRejectAISuggestion={handleRejectAISuggestion}
              disabled={readOnly}
              showCategoryFilter
              placeholder="Search or add tags..."
            />

            {/* Cultural sensitivity notice */}
            {selectedTags.some(t => t.culturalSensitivityLevel !== 'public') && (
              <Alert className="border-purple-200 bg-purple-50">
                <AlertTriangle className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-800">
                  This media has culturally sensitive tags and may require elder review before publishing.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location" className="mt-4">
            <LocationPicker
              mediaId={mediaId}
              readOnly={readOnly}
              onSave={(location) => {
                setSuccess(`Location saved: ${location.placeName || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}`)
              }}
              onRemove={() => {
                setSuccess('Location removed')
              }}
            />
          </TabsContent>

          {/* People Tab */}
          <TabsContent value="people" className="mt-4">
            <StorytellerPicker
              mediaId={mediaId}
              facesDetected={media?.facesDetected}
              readOnly={readOnly}
              onSave={() => {
                setSuccess('Storyteller linked successfully')
              }}
              onRemove={() => {
                setSuccess('Storyteller unlinked')
              }}
            />
          </TabsContent>

          {/* Project Tab */}
          <TabsContent value="project" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>ACT Project</Label>
              <Select
                value={projectCode}
                onValueChange={setProjectCode}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project..." />
                </SelectTrigger>
                <SelectContent>
                  {ACT_PROJECTS.map(project => (
                    <SelectItem key={project.value} value={project.value}>
                      {project.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-stone-500">
                Associate this media with an ACT ecosystem project for filtering and syndication.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Unsaved changes indicator */}
        {hasChanges && !readOnly && (
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              Unsaved changes
            </Badge>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default EnhancedMediaTagger
