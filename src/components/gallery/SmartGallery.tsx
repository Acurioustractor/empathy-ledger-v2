'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Sparkles,
  Layers,
  Users,
  Tag,
  Search,
  Grid3x3,
  LayoutGrid,
  Wand2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Filter,
  SortAsc,
  Camera,
  User,
  Palette
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
interface MediaAsset {
  id: string
  url: string
  title: string
  alt_text?: string
  media_type: 'image' | 'video' | 'audio'
  width?: number
  height?: number
  visibility: 'private' | 'community' | 'public'
  created_at: string
  uploader_id?: string
  uploader_name?: string
}

interface AIAnalysis {
  id: string
  media_asset_id: string
  ai_consent_granted: boolean
  detected_objects: Record<string, number>[] | null
  scene_classification: string | null
  auto_tags: string[]
  verified_tags: string[]
  cultural_review_required: boolean
  cultural_review_status: 'pending' | 'approved' | 'rejected' | null
  processed_at: string | null
}

interface PersonRecognition {
  id: string
  media_asset_id: string
  face_location: { x: number; y: number; width: number; height: number }
  linked_storyteller_id: string | null
  linked_storyteller_name?: string
  recognition_consent_granted: boolean
  can_be_public: boolean
  blur_requested: boolean
}

interface NarrativeTheme {
  id: string
  media_asset_id: string
  primary_theme: string
  secondary_themes: string[]
  emotional_tone: string | null
  related_story_id?: string
}

interface SmartMediaItem extends MediaAsset {
  analysis?: AIAnalysis
  faces?: PersonRecognition[]
  themes?: NarrativeTheme
}

interface ThemeGroup {
  theme: string
  count: number
  items: SmartMediaItem[]
}

interface PersonGroup {
  storyteller_id: string | null
  name: string
  count: number
  items: SmartMediaItem[]
}

interface SmartGalleryProps {
  initialMedia?: SmartMediaItem[]
  onAnalyzeMedia?: (mediaId: string) => Promise<void>
  onTagPerson?: (mediaId: string, faceId: string, storytellerId: string) => Promise<void>
  onRequestBlur?: (mediaId: string, faceId: string) => Promise<void>
  onVerifyTags?: (mediaId: string, tags: string[]) => Promise<void>
  showAIFeatures?: boolean
  className?: string
}

type ViewMode = 'grid' | 'themes' | 'people' | 'timeline'
type SortMode = 'newest' | 'oldest' | 'most_faces' | 'most_tags'

export function SmartGallery({
  initialMedia = [],
  onAnalyzeMedia,
  onTagPerson,
  onRequestBlur,
  onVerifyTags,
  showAIFeatures = true,
  className
}: SmartGalleryProps) {
  const [media, setMedia] = useState<SmartMediaItem[]>(initialMedia)
  const [filteredMedia, setFilteredMedia] = useState<SmartMediaItem[]>(initialMedia)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState<Set<string>>(new Set())

  // View states
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortMode, setSortMode] = useState<SortMode>('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null)

  // Modal states
  const [selectedMedia, setSelectedMedia] = useState<SmartMediaItem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isConsentDialogOpen, setIsConsentDialogOpen] = useState(false)
  const [pendingAnalysisId, setPendingAnalysisId] = useState<string | null>(null)

  // Computed groups
  const [themeGroups, setThemeGroups] = useState<ThemeGroup[]>([])
  const [personGroups, setPersonGroups] = useState<PersonGroup[]>([])

  // Calculate theme groups
  useEffect(() => {
    const themes = new Map<string, SmartMediaItem[]>()

    media.forEach(item => {
      if (item.themes?.primary_theme) {
        const existing = themes.get(item.themes.primary_theme) || []
        themes.set(item.themes.primary_theme, [...existing, item])
      }
      item.themes?.secondary_themes?.forEach(theme => {
        const existing = themes.get(theme) || []
        if (!existing.find(i => i.id === item.id)) {
          themes.set(theme, [...existing, item])
        }
      })
    })

    const groups: ThemeGroup[] = Array.from(themes.entries())
      .map(([theme, items]) => ({ theme, count: items.length, items }))
      .sort((a, b) => b.count - a.count)

    setThemeGroups(groups)
  }, [media])

  // Calculate person groups
  useEffect(() => {
    const people = new Map<string, { name: string; items: SmartMediaItem[] }>()

    media.forEach(item => {
      item.faces?.forEach(face => {
        if (face.linked_storyteller_id) {
          const key = face.linked_storyteller_id
          const existing = people.get(key) || { name: face.linked_storyteller_name || 'Unknown', items: [] }
          if (!existing.items.find(i => i.id === item.id)) {
            people.set(key, { name: existing.name, items: [...existing.items, item] })
          }
        }
      })
    })

    const groups: PersonGroup[] = Array.from(people.entries())
      .map(([storyteller_id, data]) => ({
        storyteller_id,
        name: data.name,
        count: data.items.length,
        items: data.items
      }))
      .sort((a, b) => b.count - a.count)

    setPersonGroups(groups)
  }, [media])

  // Filter and sort media
  useEffect(() => {
    let filtered = [...media]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(query) ||
        item.alt_text?.toLowerCase().includes(query) ||
        item.analysis?.auto_tags?.some(tag => tag.toLowerCase().includes(query)) ||
        item.analysis?.verified_tags?.some(tag => tag.toLowerCase().includes(query)) ||
        item.themes?.primary_theme?.toLowerCase().includes(query)
      )
    }

    // Theme filter
    if (selectedTheme) {
      filtered = filtered.filter(item =>
        item.themes?.primary_theme === selectedTheme ||
        item.themes?.secondary_themes?.includes(selectedTheme)
      )
    }

    // Person filter
    if (selectedPerson) {
      filtered = filtered.filter(item =>
        item.faces?.some(face => face.linked_storyteller_id === selectedPerson)
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortMode) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'most_faces':
          return (b.faces?.length || 0) - (a.faces?.length || 0)
        case 'most_tags':
          return ((b.analysis?.auto_tags?.length || 0) + (b.analysis?.verified_tags?.length || 0)) -
                 ((a.analysis?.auto_tags?.length || 0) + (a.analysis?.verified_tags?.length || 0))
        default:
          return 0
      }
    })

    setFilteredMedia(filtered)
  }, [media, searchQuery, selectedTheme, selectedPerson, sortMode])

  // Handlers
  const handleAnalyze = async (mediaId: string) => {
    setPendingAnalysisId(mediaId)
    setIsConsentDialogOpen(true)
  }

  const confirmAnalysis = async () => {
    if (!pendingAnalysisId || !onAnalyzeMedia) return

    setAnalyzing(prev => new Set(prev).add(pendingAnalysisId))
    setIsConsentDialogOpen(false)

    try {
      await onAnalyzeMedia(pendingAnalysisId)
      // Refresh media data would happen via parent component
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setAnalyzing(prev => {
        const next = new Set(prev)
        next.delete(pendingAnalysisId)
        return next
      })
      setPendingAnalysisId(null)
    }
  }

  const handleViewDetails = (item: SmartMediaItem) => {
    setSelectedMedia(item)
    setIsDetailOpen(true)
  }

  // Stats
  const analyzedCount = media.filter(m => m.analysis?.processed_at).length
  const withFacesCount = media.filter(m => (m.faces?.length || 0) > 0).length
  const withThemesCount = media.filter(m => m.themes?.primary_theme).length
  const pendingReviewCount = media.filter(m => m.analysis?.cultural_review_required && m.analysis?.cultural_review_status === 'pending').length

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card className="bg-gradient-to-r from-sage-50 via-earth-50/30 to-stone-50 border-stone-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-sage-600" />
                Smart Gallery
              </CardTitle>
              <CardDescription>
                AI-powered organization with consent-gated analysis
              </CardDescription>
            </div>
            {showAIFeatures && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white">
                  <Camera className="h-3 w-3 mr-1" />
                  {analyzedCount}/{media.length} analyzed
                </Badge>
                <Badge variant="outline" className="bg-white">
                  <User className="h-3 w-3 mr-1" />
                  {withFacesCount} with faces
                </Badge>
                <Badge variant="outline" className="bg-white">
                  <Palette className="h-3 w-3 mr-1" />
                  {themeGroups.length} themes
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Pending Reviews Alert */}
      {pendingReviewCount > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>{pendingReviewCount} items</strong> require cultural review before AI analysis results are visible.
          </AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, tags, themes..."
                className="pl-9"
              />
            </div>

            {/* View Mode */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="w-auto">
              <TabsList>
                <TabsTrigger value="grid" className="gap-1">
                  <Grid3x3 className="h-4 w-4" />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="themes" className="gap-1">
                  <Palette className="h-4 w-4" />
                  Themes
                </TabsTrigger>
                <TabsTrigger value="people" className="gap-1">
                  <Users className="h-4 w-4" />
                  People
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Sort */}
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="px-3 py-2 border border-stone-200 rounded-md text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_faces">Most Faces</option>
              <option value="most_tags">Most Tags</option>
            </select>
          </div>

          {/* Active Filters */}
          {(selectedTheme || selectedPerson) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-stone-200">
              <span className="text-sm text-stone-500">Active filters:</span>
              {selectedTheme && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-stone-200"
                  onClick={() => setSelectedTheme(null)}
                >
                  Theme: {selectedTheme} &times;
                </Badge>
              )}
              {selectedPerson && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-stone-200"
                  onClick={() => setSelectedPerson(null)}
                >
                  Person: {personGroups.find(p => p.storyteller_id === selectedPerson)?.name} &times;
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <SmartMediaCard
              key={item.id}
              item={item}
              isAnalyzing={analyzing.has(item.id)}
              showAIFeatures={showAIFeatures}
              onAnalyze={() => handleAnalyze(item.id)}
              onViewDetails={() => handleViewDetails(item)}
            />
          ))}
        </div>
      )}

      {/* Themes View */}
      {viewMode === 'themes' && (
        <div className="space-y-6">
          {themeGroups.length === 0 ? (
            <Card className="p-8 text-center">
              <Palette className="h-12 w-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500">No themes extracted yet. Analyze media to discover themes.</p>
            </Card>
          ) : (
            themeGroups.map((group) => (
              <Card key={group.theme}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Palette className="h-4 w-4 text-sage-600" />
                      {group.theme}
                    </CardTitle>
                    <Badge variant="outline">{group.count} items</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {group.items.slice(0, 8).map((item) => (
                      <div
                        key={item.id}
                        className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-sage-500 transition-all"
                        onClick={() => handleViewDetails(item)}
                      >
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {group.count > 8 && (
                      <Button
                        variant="outline"
                        className="aspect-square"
                        onClick={() => setSelectedTheme(group.theme)}
                      >
                        +{group.count - 8} more
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* People View */}
      {viewMode === 'people' && (
        <div className="space-y-6">
          {personGroups.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="h-12 w-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500">No people tagged yet. Tag faces in media to organize by person.</p>
            </Card>
          ) : (
            personGroups.map((group) => (
              <Card key={group.storyteller_id || 'unknown'}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-4 w-4 text-earth-600" />
                      {group.name}
                    </CardTitle>
                    <Badge variant="outline">{group.count} photos</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {group.items.slice(0, 8).map((item) => (
                      <div
                        key={item.id}
                        className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-earth-500 transition-all"
                        onClick={() => handleViewDetails(item)}
                      >
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {group.count > 8 && (
                      <Button
                        variant="outline"
                        className="aspect-square"
                        onClick={() => setSelectedPerson(group.storyteller_id)}
                      >
                        +{group.count - 8} more
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Empty State */}
      {filteredMedia.length === 0 && (
        <Card className="p-12 text-center">
          <Camera className="h-16 w-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-900 mb-2">No media found</h3>
          <p className="text-stone-500">
            {searchQuery || selectedTheme || selectedPerson
              ? 'Try adjusting your search or filters'
              : 'Upload media to get started'}
          </p>
        </Card>
      )}

      {/* Media Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedMedia && (
            <SmartMediaDetail
              item={selectedMedia}
              showAIFeatures={showAIFeatures}
              isAnalyzing={analyzing.has(selectedMedia.id)}
              onAnalyze={() => handleAnalyze(selectedMedia.id)}
              onTagPerson={onTagPerson}
              onRequestBlur={onRequestBlur}
              onVerifyTags={onVerifyTags}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Consent Dialog */}
      <Dialog open={isConsentDialogOpen} onOpenChange={setIsConsentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-sage-600" />
              AI Analysis Consent
            </DialogTitle>
            <DialogDescription>
              This will use AI to analyze the media for:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg">
              <Tag className="h-5 w-5 text-sage-600 mt-0.5" />
              <div>
                <p className="font-medium">Object & Scene Detection</p>
                <p className="text-sm text-stone-500">Identify objects, locations, and scene types</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg">
              <Users className="h-5 w-5 text-earth-600 mt-0.5" />
              <div>
                <p className="font-medium">Face Detection</p>
                <p className="text-sm text-stone-500">Locate faces (linking to people requires separate consent)</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg">
              <Palette className="h-5 w-5 text-clay-600 mt-0.5" />
              <div>
                <p className="font-medium">Theme Extraction</p>
                <p className="text-sm text-stone-500">Identify narrative themes and emotional tone</p>
              </div>
            </div>
          </div>

          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-sm">
              Content flagged as culturally sensitive will require elder review before results are visible.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConsentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAnalysis} className="bg-sage-600 hover:bg-sage-700">
              <Wand2 className="h-4 w-4 mr-2" />
              Analyze with Consent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Sub-component: Smart Media Card
interface SmartMediaCardProps {
  item: SmartMediaItem
  isAnalyzing: boolean
  showAIFeatures: boolean
  onAnalyze: () => void
  onViewDetails: () => void
}

function SmartMediaCard({ item, isAnalyzing, showAIFeatures, onAnalyze, onViewDetails }: SmartMediaCardProps) {
  const hasAnalysis = !!item.analysis?.processed_at
  const faceCount = item.faces?.length || 0
  const hasTheme = !!item.themes?.primary_theme
  const needsReview = item.analysis?.cultural_review_required && item.analysis?.cultural_review_status === 'pending'

  return (
    <Card
      className={cn(
        'group overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]',
        needsReview && 'ring-2 ring-amber-300'
      )}
      onClick={onViewDetails}
    >
      <div className="relative aspect-square bg-stone-100">
        <img
          src={item.url}
          alt={item.title || 'Media'}
          className="w-full h-full object-cover"
        />

        {/* Status badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasAnalysis && (
            <Badge className="bg-sage-600 text-white text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Analyzed
            </Badge>
          )}
          {needsReview && (
            <Badge className="bg-amber-500 text-white text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Review
            </Badge>
          )}
        </div>

        {/* Quick stats */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {faceCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              <User className="h-3 w-3 mr-1" />
              {faceCount}
            </Badge>
          )}
          {hasTheme && (
            <Badge variant="secondary" className="text-xs">
              <Palette className="h-3 w-3 mr-1" />
              {item.themes?.primary_theme}
            </Badge>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); onViewDetails() }}>
            <Eye className="h-4 w-4" />
          </Button>
          {showAIFeatures && !hasAnalysis && (
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => { e.stopPropagation(); onAnalyze() }}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      <CardContent className="p-3">
        <p className="text-sm font-medium truncate">{item.title || 'Untitled'}</p>
        {item.analysis?.auto_tags && item.analysis.auto_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.analysis.auto_tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {item.analysis.auto_tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{item.analysis.auto_tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Sub-component: Smart Media Detail
interface SmartMediaDetailProps {
  item: SmartMediaItem
  showAIFeatures: boolean
  isAnalyzing: boolean
  onAnalyze: () => void
  onTagPerson?: (mediaId: string, faceId: string, storytellerId: string) => Promise<void>
  onRequestBlur?: (mediaId: string, faceId: string) => Promise<void>
  onVerifyTags?: (mediaId: string, tags: string[]) => Promise<void>
}

function SmartMediaDetail({
  item,
  showAIFeatures,
  isAnalyzing,
  onAnalyze,
  onTagPerson,
  onRequestBlur,
  onVerifyTags
}: SmartMediaDetailProps) {
  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle>{item.title || 'Media Details'}</DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Media Preview */}
        <div className="space-y-4">
          <div className="relative aspect-video bg-stone-100 rounded-lg overflow-hidden">
            <img
              src={item.url}
              alt={item.title}
              className="w-full h-full object-contain"
            />
            {/* Face overlays would go here */}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-stone-500">
              {item.width && item.height && `${item.width} x ${item.height}`}
              {item.created_at && ` | ${new Date(item.created_at).toLocaleDateString()}`}
            </div>
            <Badge variant="outline">{item.visibility}</Badge>
          </div>
        </div>

        {/* Analysis Details */}
        <div className="space-y-4">
          {/* AI Analysis Section */}
          {showAIFeatures && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-sage-600" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {item.analysis?.processed_at ? (
                  <div className="space-y-3">
                    {/* Scene */}
                    {item.analysis.scene_classification && (
                      <div>
                        <p className="text-xs font-medium text-stone-500 mb-1">Scene</p>
                        <Badge variant="secondary">{item.analysis.scene_classification}</Badge>
                      </div>
                    )}

                    {/* Auto Tags */}
                    {item.analysis.auto_tags && item.analysis.auto_tags.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-stone-500 mb-1">Auto Tags</p>
                        <div className="flex flex-wrap gap-1">
                          {item.analysis.auto_tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Verified Tags */}
                    {item.analysis.verified_tags && item.analysis.verified_tags.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-stone-500 mb-1">Verified Tags</p>
                        <div className="flex flex-wrap gap-1">
                          {item.analysis.verified_tags.map((tag, idx) => (
                            <Badge key={idx} className="bg-sage-100 text-sage-700 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cultural Review Status */}
                    {item.analysis.cultural_review_required && (
                      <Alert className={cn(
                        'mt-2',
                        item.analysis.cultural_review_status === 'approved' && 'border-sage-200 bg-sage-50',
                        item.analysis.cultural_review_status === 'pending' && 'border-amber-200 bg-amber-50',
                        item.analysis.cultural_review_status === 'rejected' && 'border-clay-200 bg-clay-50'
                      )}>
                        <AlertDescription className="text-sm">
                          Cultural review: <strong>{item.analysis.cultural_review_status || 'pending'}</strong>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Wand2 className="h-8 w-8 text-stone-300 mx-auto mb-2" />
                    <p className="text-sm text-stone-500 mb-3">Not analyzed yet</p>
                    <Button onClick={onAnalyze} disabled={isAnalyzing} size="sm">
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Analyze Now
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Faces Section */}
          {item.faces && item.faces.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-earth-600" />
                  People ({item.faces.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {item.faces.map((face, idx) => (
                    <div key={face.id || idx} className="flex items-center justify-between p-2 bg-stone-50 rounded">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-stone-400" />
                        <span className="text-sm">
                          {face.linked_storyteller_name || 'Unknown person'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {face.blur_requested && (
                          <Badge variant="outline" className="text-xs">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Blur requested
                          </Badge>
                        )}
                        {!face.linked_storyteller_id && onTagPerson && (
                          <Button size="sm" variant="outline">
                            Tag Person
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Themes Section */}
          {item.themes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="h-4 w-4 text-clay-600" />
                  Themes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {item.themes.primary_theme && (
                    <div>
                      <p className="text-xs font-medium text-stone-500 mb-1">Primary</p>
                      <Badge className="bg-clay-100 text-clay-700">
                        {item.themes.primary_theme}
                      </Badge>
                    </div>
                  )}
                  {item.themes.secondary_themes && item.themes.secondary_themes.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-stone-500 mb-1">Secondary</p>
                      <div className="flex flex-wrap gap-1">
                        {item.themes.secondary_themes.map((theme, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {item.themes.emotional_tone && (
                    <div>
                      <p className="text-xs font-medium text-stone-500 mb-1">Emotional Tone</p>
                      <Badge variant="secondary">{item.themes.emotional_tone}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default SmartGallery
