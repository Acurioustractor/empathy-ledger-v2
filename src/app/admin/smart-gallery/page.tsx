'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Sparkles,
  Wand2,
  Users,
  Palette,
  Camera,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Settings,
  BarChart3,
  Eye,
  Play,
  Pause
} from 'lucide-react'

// Import our new Smart Gallery components
import { SmartGallery } from '@/components/gallery/SmartGallery'
import { ThemeCollection } from '@/components/gallery/ThemeCollection'

// Types matching our database schema
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

interface ThemeWithMedia {
  id: string
  name: string
  category: string
  description?: string
  media: MediaAsset[]
  count: number
}

export default function SmartGalleryAdminPage() {
  const [media, setMedia] = useState<SmartMediaItem[]>([])
  const [themes, setThemes] = useState<ThemeWithMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedTab, setSelectedTab] = useState('gallery')

  // Stats
  const [stats, setStats] = useState({
    totalMedia: 0,
    analyzed: 0,
    withFaces: 0,
    withThemes: 0,
    pendingReview: 0,
    pendingConsent: 0
  })

  // Batch analysis state
  const [batchAnalyzing, setBatchAnalyzing] = useState(false)
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 })

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch media with analysis data
      const mediaResponse = await fetch('/api/admin/media?include_analysis=true')
      if (mediaResponse.ok) {
        const data = await mediaResponse.json()
        const mediaItems: SmartMediaItem[] = (data.media || []).map((item: any) => ({
          id: item.id,
          url: item.publicUrl || item.url,
          title: item.title || item.filename,
          alt_text: item.description,
          media_type: item.mimeType?.startsWith('video/') ? 'video' : 'image',
          width: item.width,
          height: item.height,
          visibility: item.visibility || 'private',
          created_at: item.createdAt || item.created_at,
          uploader_id: item.uploadedBy,
          uploader_name: item.uploaderName,
          analysis: item.analysis,
          faces: item.faces,
          themes: item.themes
        }))
        setMedia(mediaItems)

        // Calculate stats
        const analyzed = mediaItems.filter(m => m.analysis?.processed_at).length
        const withFaces = mediaItems.filter(m => (m.faces?.length || 0) > 0).length
        const withThemes = mediaItems.filter(m => m.themes?.primary_theme).length
        const pendingReview = mediaItems.filter(m =>
          m.analysis?.cultural_review_required &&
          m.analysis?.cultural_review_status === 'pending'
        ).length
        const pendingConsent = mediaItems.filter(m =>
          m.faces?.some(f => !f.recognition_consent_granted && f.linked_storyteller_id)
        ).length

        setStats({
          totalMedia: mediaItems.length,
          analyzed,
          withFaces,
          withThemes,
          pendingReview,
          pendingConsent
        })
      }

      // Fetch themes
      const themesResponse = await fetch('/api/v1/content-hub/themes')
      if (themesResponse.ok) {
        const data = await themesResponse.json()
        setThemes(data.themes || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Analyze single media
  const handleAnalyzeMedia = async (mediaId: string) => {
    setAnalyzing(true)
    try {
      const response = await fetch('/api/admin/media/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId, consentGranted: true })
      })

      if (response.ok) {
        // Refresh data to get updated analysis
        await fetchData()
      } else {
        const error = await response.json()
        console.error('Analysis failed:', error)
        alert('Analysis failed: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error analyzing media:', error)
      alert('Error analyzing media')
    } finally {
      setAnalyzing(false)
    }
  }

  // Batch analyze unanalyzed media
  const handleBatchAnalyze = async () => {
    const unanalyzed = media.filter(m => !m.analysis?.processed_at)
    if (unanalyzed.length === 0) {
      alert('All media has already been analyzed!')
      return
    }

    if (!confirm(`Analyze ${unanalyzed.length} unanalyzed media items? This requires consent for AI processing.`)) {
      return
    }

    setBatchAnalyzing(true)
    setBatchProgress({ current: 0, total: unanalyzed.length })

    for (let i = 0; i < unanalyzed.length; i++) {
      try {
        await fetch('/api/admin/media/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mediaId: unanalyzed[i].id, consentGranted: true })
        })
        setBatchProgress({ current: i + 1, total: unanalyzed.length })
      } catch (error) {
        console.error(`Error analyzing ${unanalyzed[i].id}:`, error)
      }
    }

    setBatchAnalyzing(false)
    await fetchData()
  }

  // Tag person in media
  const handleTagPerson = async (mediaId: string, faceId: string, storytellerId: string) => {
    try {
      const response = await fetch('/api/admin/media/tag-person', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId, faceId, storytellerId })
      })

      if (response.ok) {
        await fetchData()
      } else {
        const error = await response.json()
        alert('Failed to tag person: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error tagging person:', error)
    }
  }

  // Request blur for face
  const handleRequestBlur = async (mediaId: string, faceId: string) => {
    try {
      const response = await fetch('/api/admin/media/blur-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId, faceId, blur: true })
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error requesting blur:', error)
    }
  }

  // Verify tags
  const handleVerifyTags = async (mediaId: string, tags: string[]) => {
    try {
      const response = await fetch('/api/admin/media/verify-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId, verifiedTags: tags })
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error verifying tags:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
          <span className="ml-2 text-stone-600">Loading Smart Gallery...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-sage-50 via-earth-50/30 to-stone-50 border border-stone-200 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-sage-600" />
              Smart Gallery
            </h1>
            <p className="text-stone-600 mt-1">
              AI-powered media organization with consent-gated analysis
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={handleBatchAnalyze}
              disabled={batchAnalyzing || stats.analyzed === stats.totalMedia}
              className="bg-sage-600 hover:bg-sage-700"
            >
              {batchAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {batchProgress.current}/{batchProgress.total}
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Analyze All ({stats.totalMedia - stats.analyzed})
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-stone-50 to-stone-100/50 border-stone-200">
          <CardContent className="p-4 text-center">
            <Camera className="h-5 w-5 text-stone-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-stone-800">{stats.totalMedia}</p>
            <p className="text-xs text-stone-600">Total Media</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-sage-50 to-sage-100/50 border-sage-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-5 w-5 text-sage-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-sage-700">{stats.analyzed}</p>
            <p className="text-xs text-stone-600">Analyzed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-earth-50 to-earth-100/50 border-earth-200">
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 text-earth-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-earth-700">{stats.withFaces}</p>
            <p className="text-xs text-stone-600">With Faces</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-clay-50 to-clay-100/50 border-clay-200">
          <CardContent className="p-4 text-center">
            <Palette className="h-5 w-5 text-clay-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-clay-700">{stats.withThemes}</p>
            <p className="text-xs text-stone-600">With Themes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-5 w-5 text-amber-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-amber-700">{stats.pendingReview}</p>
            <p className="text-xs text-stone-600">Pending Review</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
          <CardContent className="p-4 text-center">
            <Eye className="h-5 w-5 text-purple-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-purple-700">{stats.pendingConsent}</p>
            <p className="text-xs text-stone-600">Pending Consent</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats.pendingReview > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>{stats.pendingReview} media items</strong> have been flagged for cultural review.
            Elder approval is required before AI analysis results are visible.
          </AlertDescription>
        </Alert>
      )}

      {stats.pendingConsent > 0 && (
        <Alert className="border-purple-200 bg-purple-50">
          <Users className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800">
            <strong>{stats.pendingConsent} people</strong> have been identified but haven't granted consent.
            Their faces will remain blurred until consent is received.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="gallery" className="gap-2">
            <Camera className="h-4 w-4" />
            Smart Gallery
          </TabsTrigger>
          <TabsTrigger value="themes" className="gap-2">
            <Palette className="h-4 w-4" />
            Theme Collections
          </TabsTrigger>
          <TabsTrigger value="people" className="gap-2">
            <Users className="h-4 w-4" />
            People
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery">
          <SmartGallery
            initialMedia={media}
            onAnalyzeMedia={handleAnalyzeMedia}
            onTagPerson={handleTagPerson}
            onRequestBlur={handleRequestBlur}
            onVerifyTags={handleVerifyTags}
            showAIFeatures={true}
          />
        </TabsContent>

        <TabsContent value="themes">
          <ThemeCollection
            themes={themes.map(t => ({
              ...t,
              media: media
                .filter(m =>
                  m.themes?.primary_theme === t.name ||
                  m.themes?.secondary_themes?.includes(t.name)
                )
                .map(m => ({
                  id: m.id,
                  url: m.url,
                  title: m.title,
                  created_at: m.created_at
                }))
            }))}
          />
        </TabsContent>

        <TabsContent value="people">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-earth-600" />
                People Recognition
              </CardTitle>
              <CardDescription>
                Manage face recognition with two-party consent
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* People grouped by storyteller */}
              {(() => {
                const peopleMap = new Map<string, { name: string; photos: SmartMediaItem[] }>()

                media.forEach(item => {
                  item.faces?.forEach(face => {
                    if (face.linked_storyteller_id) {
                      const key = face.linked_storyteller_id
                      const existing = peopleMap.get(key) || { name: face.linked_storyteller_name || 'Unknown', photos: [] }
                      if (!existing.photos.find(p => p.id === item.id)) {
                        peopleMap.set(key, { name: existing.name, photos: [...existing.photos, item] })
                      }
                    }
                  })
                })

                const people = Array.from(peopleMap.entries())
                  .map(([id, data]) => ({ id, ...data }))
                  .sort((a, b) => b.photos.length - a.photos.length)

                if (people.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-stone-300 mx-auto mb-4" />
                      <p className="text-stone-500">No people tagged yet</p>
                      <p className="text-sm text-stone-400 mt-1">
                        Analyze media to detect faces, then tag people with consent
                      </p>
                    </div>
                  )
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {people.map(person => (
                      <Card key={person.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-earth-100 flex items-center justify-center">
                              <Users className="h-6 w-6 text-earth-600" />
                            </div>
                            <div>
                              <p className="font-medium">{person.name}</p>
                              <p className="text-sm text-stone-500">{person.photos.length} photos</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-1">
                            {person.photos.slice(0, 4).map(photo => (
                              <div key={photo.id} className="aspect-square rounded overflow-hidden">
                                <img
                                  src={photo.url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-sage-600" />
                Content Analytics
              </CardTitle>
              <CardDescription>
                Overview of media intelligence insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Analysis Progress */}
                <div>
                  <h4 className="font-medium mb-3">Analysis Progress</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Media Analyzed</span>
                        <span>{Math.round((stats.analyzed / stats.totalMedia) * 100)}%</span>
                      </div>
                      <div className="w-full bg-stone-200 rounded-full h-2">
                        <div
                          className="bg-sage-600 h-2 rounded-full"
                          style={{ width: `${(stats.analyzed / stats.totalMedia) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Faces Identified</span>
                        <span>{stats.withFaces}</span>
                      </div>
                      <div className="w-full bg-stone-200 rounded-full h-2">
                        <div
                          className="bg-earth-600 h-2 rounded-full"
                          style={{ width: `${(stats.withFaces / stats.totalMedia) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Themes Extracted</span>
                        <span>{stats.withThemes}</span>
                      </div>
                      <div className="w-full bg-stone-200 rounded-full h-2">
                        <div
                          className="bg-clay-600 h-2 rounded-full"
                          style={{ width: `${(stats.withThemes / stats.totalMedia) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Themes */}
                <div>
                  <h4 className="font-medium mb-3">Top Themes</h4>
                  <div className="space-y-2">
                    {themes.slice(0, 5).map(theme => (
                      <div key={theme.id} className="flex items-center justify-between p-2 bg-stone-50 rounded">
                        <span className="text-sm">{theme.name}</span>
                        <Badge variant="outline">{theme.count} items</Badge>
                      </div>
                    ))}
                    {themes.length === 0 && (
                      <p className="text-sm text-stone-500 text-center py-4">
                        No themes extracted yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
