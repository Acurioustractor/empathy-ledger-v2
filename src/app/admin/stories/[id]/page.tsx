'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import MediaLinkingManager from '@/components/media/MediaLinkingManager'
import StoryMediaEditor from '@/components/admin/StoryMediaEditor'
import StoryContentEditor from '@/components/admin/StoryContentEditor'
import {
  ArrowLeft,
  Save,
  Eye,
  Edit,
  User,
  Calendar,
  Clock,
  BookOpen,
  FileText,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Sparkles,
  MessageSquare,
  Globe,
  Lock,
  Users,
  Tag,
  Trash2,
  MoreVertical,
  ExternalLink,
  Crown,
  Heart,
  Share2,
  ChevronRight,
  Play,
  Loader2,
  RefreshCw,
  Quote,
  Lightbulb,
  TrendingUp
} from 'lucide-react'

interface StoryData {
  id: string
  title: string
  content: string
  excerpt?: string
  status: 'draft' | 'published' | 'under_review' | 'flagged' | 'archived'
  visibility: 'public' | 'community' | 'organisation' | 'private'
  story_type: string
  cultural_sensitivity_level: 'low' | 'medium' | 'high'
  themes: string[]
  tags: string[]
  featured: boolean
  elder_approved: boolean
  ceremonial_content: boolean
  traditional_knowledge: boolean
  consent_status: 'granted' | 'pending' | 'denied'
  cultural_context?: string
  location?: string
  created_at: string
  updated_at: string
  author_id: string
  transcript_id?: string
  // Media fields
  hero_image_url?: string
  hero_image_caption?: string
  video_url?: string
  video_platform?: string
  video_embed_code?: string
  inline_media?: Array<{
    id: string
    url: string
    type: 'image' | 'video'
    caption?: string
    position?: number
  }>
  author?: {
    id: string
    display_name: string
    avatar_url?: string
    cultural_background?: string
    cultural_affiliations?: string[]
    elder_status?: boolean
    bio?: string
  }
  transcript?: {
    id: string
    title: string
    word_count?: number
    duration?: number
    ai_summary?: string
    themes?: string[]
    project_name?: string
  }
  stats?: {
    views_count: number
    likes_count: number
    comments_count: number
    shares_count: number
    reading_time: number
  }
  transcript_analysis?: {
    themes: string[]
    key_concepts: string[]
    cultural_elements: string[]
    sentiment: string
    key_quotes?: string[]
  }
  related_stories?: Array<{
    id: string
    title: string
    excerpt?: string
    storyteller_name: string
    created_at: string
  }>
}

export default function StoryEditorPage() {
  const params = useParams()
  const router = useRouter()
  const storyId = params.id as string

  const [story, setStory] = useState<StoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('content')
  const [isEditing, setIsEditing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Editing state
  const [editData, setEditData] = useState<Partial<StoryData>>({})

  // Related data
  const [storytellerTranscripts, setStorytellerTranscripts] = useState<any[]>([])
  const [storytellerStories, setStorytellerStories] = useState<any[]>([])
  const [loadingRelated, setLoadingRelated] = useState(false)

  useEffect(() => {
    if (storyId) {
      fetchStory()
    }
  }, [storyId])

  useEffect(() => {
    if (story?.author_id) {
      fetchStorytellerData(story.author_id)
    }
  }, [story?.author_id])

  const fetchStory = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/stories/${storyId}`)
      if (!response.ok) throw new Error('Failed to fetch story')
      const data = await response.json()
      setStory(data)
      setEditData(data)
    } catch (err) {
      console.error('Error fetching story:', err)
      setError('Failed to load story')
    } finally {
      setLoading(false)
    }
  }

  const fetchStorytellerData = async (storytellerId: string) => {
    try {
      setLoadingRelated(true)

      // Fetch storyteller's other transcripts
      const transcriptsRes = await fetch(`/api/storytellers/${storytellerId}/transcripts?limit=10`)
      if (transcriptsRes.ok) {
        const transcriptsData = await transcriptsRes.json()
        setStorytellerTranscripts(transcriptsData.transcripts || [])
      }

      // Fetch storyteller's other stories (all status for admin view)
      const storiesRes = await fetch(`/api/storytellers/${storytellerId}/stories?limit=10&status=all`)
      if (storiesRes.ok) {
        const storiesData = await storiesRes.json()
        setStorytellerStories(storiesData.stories?.filter((s: any) => s.id !== storyId) || [])
      }
    } catch (err) {
      console.error('Error fetching storyteller data:', err)
    } finally {
      setLoadingRelated(false)
    }
  }

  const handleSave = async () => {
    if (!story) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/stories/${storyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })

      if (!response.ok) throw new Error('Failed to save story')

      const updatedStory = await response.json()

      // Merge updated story with existing enriched data (author, transcript, stats)
      // since PATCH doesn't return these relationships
      const mergedStory = {
        ...story,
        ...updatedStory,
        author: story.author,
        transcript: story.transcript,
        transcript_analysis: story.transcript_analysis,
        stats: story.stats
      }

      setStory(mergedStory)
      setEditData(mergedStory)
      setHasUnsavedChanges(false)
      setIsEditing(false)
    } catch (err) {
      console.error('Error saving story:', err)
      setError('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleFieldChange = (field: string, value: any) => {
    setEditData(prev => {
      // Only mark as unsaved if the value actually changed
      const currentValue = prev[field as keyof typeof prev]
      if (currentValue !== value) {
        setHasUnsavedChanges(true)
      }
      return { ...prev, [field]: value }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-sage-100 text-sage-700 border border-sage-200'
      case 'draft': return 'bg-stone-100 text-stone-700 border border-stone-200'
      case 'under_review': return 'bg-amber-100 text-amber-700 border border-amber-200'
      case 'flagged': return 'bg-clay-100 text-clay-700 border border-clay-200'
      case 'archived': return 'bg-stone-100 text-stone-600 border border-stone-200'
      default: return 'bg-stone-100 text-stone-600 border border-stone-200'
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="w-4 h-4" />
      case 'community': return <Users className="w-4 h-4" />
      case 'organisation': return <Users className="w-4 h-4" />
      case 'private': return <Lock className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
    }
  }

  const getSensitivityColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-clay-100 text-clay-700 border border-clay-200'
      case 'medium': return 'bg-amber-100 text-amber-700 border border-amber-200'
      case 'low': return 'bg-sage-100 text-sage-700 border border-sage-200'
      default: return 'bg-stone-100 text-stone-600 border border-stone-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-sage-50/20 to-earth-50/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600"></div>
            <span className="ml-2 text-stone-600">Loading story...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-sage-50/20 to-earth-50/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error || 'Story not found'}</AlertDescription>
          </Alert>
          <Button onClick={() => router.push('/admin/stories')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stories
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-sage-50/20 to-earth-50/10">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin/stories')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="h-6 w-px bg-stone-200" />
              <div>
                <h1 className="text-lg font-semibold text-stone-900 line-clamp-1">
                  {isEditing ? 'Editing: ' : ''}{story.title}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge className={getStatusColor(story.status)}>{story.status}</Badge>
                  {hasUnsavedChanges && (
                    <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                      Unsaved changes
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false)
                      setEditData(story)
                      setHasUnsavedChanges(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/stories/${story.id}`, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Story
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content - 8 columns */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Content Editor Card */}
            <Card className="border-stone-200">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <CardHeader className="border-b border-stone-100 pb-4">
                  <TabsList className="grid grid-cols-5 w-full">
                    <TabsTrigger value="content" className="flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Content</span>
                    </TabsTrigger>
                    <TabsTrigger value="media" className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Media</span>
                    </TabsTrigger>
                    <TabsTrigger value="transcript" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline">Transcript</span>
                    </TabsTrigger>
                    <TabsTrigger value="cultural" className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span className="hidden sm:inline">Cultural</span>
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      <span className="hidden sm:inline">Settings</span>
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Content Tab */}
                  <TabsContent value="content" className="mt-0 space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Title</label>
                      {isEditing ? (
                        <Input
                          value={editData.title || ''}
                          onChange={(e) => handleFieldChange('title', e.target.value)}
                          className="text-lg font-semibold"
                          placeholder="Story title..."
                        />
                      ) : (
                        <h2 className="text-2xl font-bold text-stone-900">{story.title}</h2>
                      )}
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Excerpt / Summary</label>
                      {isEditing ? (
                        <Textarea
                          value={editData.excerpt || ''}
                          onChange={(e) => handleFieldChange('excerpt', e.target.value)}
                          rows={3}
                          placeholder="Brief summary of the story..."
                          className="resize-none"
                        />
                      ) : (
                        <p className="text-stone-600 leading-relaxed">
                          {story.excerpt || 'No excerpt provided'}
                        </p>
                      )}
                    </div>

                    {/* Main Content */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Story Content</label>
                      <StoryContentEditor
                        content={editData.content || story.content || ''}
                        onChange={(content) => handleFieldChange('content', content)}
                        placeholder="Write or paste the story content..."
                        isEditing={isEditing}
                        storytellerId={story.author?.id}
                        className="min-h-[500px]"
                      />
                    </div>
                  </TabsContent>

                  {/* Media Tab */}
                  <TabsContent value="media" className="mt-0">
                    <StoryMediaEditor
                      storyId={story.id}
                      storyTitle={story.title}
                      mediaData={{
                        hero_image_url: editData.hero_image_url || story.hero_image_url,
                        hero_image_caption: editData.hero_image_caption || story.hero_image_caption,
                        video_url: editData.video_url || story.video_url,
                        video_platform: editData.video_platform || story.video_platform,
                        video_embed_code: editData.video_embed_code || story.video_embed_code,
                        inline_media: editData.inline_media || story.inline_media
                      }}
                      transcriptId={story.transcript_id}
                      transcriptQuotes={story.transcript_analysis?.key_quotes?.map((quote, idx) => ({
                        id: `quote-${idx}`,
                        quote_text: quote,
                        themes: story.transcript_analysis?.themes?.slice(0, 2)
                      })) || []}
                      onMediaChange={(data) => {
                        setEditData(prev => ({ ...prev, ...data }))
                        setHasUnsavedChanges(true)
                      }}
                      isEditing={isEditing}
                      storytellerId={story.author?.id}
                    />

                    {/* Legacy Media Linking (for existing linked media) */}
                    <div className="mt-8 pt-8 border-t border-stone-200">
                      <h3 className="text-lg font-semibold text-stone-800 mb-2">Linked Media Assets</h3>
                      <p className="text-sm text-stone-500 mb-4">
                        Media from the platform library linked to this story
                      </p>
                      <MediaLinkingManager
                        contentType="story"
                        contentId={story.id}
                        contentTitle={story.title}
                      />
                    </div>
                  </TabsContent>

                  {/* Transcript Tab */}
                  <TabsContent value="transcript" className="mt-0">
                    <div className="space-y-6">
                      {story.transcript ? (
                        <>
                          {/* Source Transcript */}
                          <Card className="bg-gradient-to-br from-earth-50 to-earth-100/50 border-earth-200">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-earth-800">
                                <FileText className="w-5 h-5" />
                                Source Transcript
                              </CardTitle>
                              <CardDescription className="text-earth-600">
                                This story was created from transcript analysis
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-stone-800">{story.transcript.title}</p>
                                  <div className="flex items-center gap-4 mt-1 text-sm text-stone-500">
                                    {story.transcript.word_count && (
                                      <span>{story.transcript.word_count.toLocaleString()} words</span>
                                    )}
                                    {story.transcript.duration && (
                                      <span>{Math.round(story.transcript.duration / 60)} min</span>
                                    )}
                                    {story.transcript.project_name && (
                                      <Badge variant="outline">{story.transcript.project_name}</Badge>
                                    )}
                                  </div>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/admin/transcripts/${story.transcript.id}`}>
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    View Full
                                  </Link>
                                </Button>
                              </div>

                              {story.transcript.ai_summary && (
                                <div className="bg-white/50 rounded-lg p-4">
                                  <p className="text-sm font-medium text-stone-700 mb-2">AI Summary</p>
                                  <p className="text-sm text-stone-600 leading-relaxed">
                                    {story.transcript.ai_summary}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* AI Analysis */}
                          {story.transcript_analysis && (
                            <Card className="border-stone-200">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Sparkles className="w-5 h-5 text-sage-600" />
                                  AI Analysis
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {story.transcript_analysis.themes?.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-stone-700 mb-2">Themes</p>
                                    <div className="flex flex-wrap gap-2">
                                      {story.transcript_analysis.themes.map((theme, idx) => (
                                        <Badge key={idx} variant="secondary">{theme}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {story.transcript_analysis.key_concepts?.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-stone-700 mb-2">Key Concepts</p>
                                    <div className="flex flex-wrap gap-2">
                                      {story.transcript_analysis.key_concepts.map((concept, idx) => (
                                        <Badge key={idx} className="bg-sage-100 text-sage-700 border border-sage-200">{concept}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {story.transcript_analysis.key_quotes?.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-stone-700 mb-2">Key Quotes</p>
                                    <div className="space-y-2">
                                      {story.transcript_analysis.key_quotes.slice(0, 3).map((quote, idx) => (
                                        <div key={idx} className="border-l-2 border-sage-200 pl-4 py-2">
                                          <Quote className="w-4 h-4 text-sage-500 mb-1" />
                                          <p className="text-sm italic text-stone-600">"{quote}"</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-12">
                          <FileText className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-stone-700 mb-2">No Source Transcript</h3>
                          <p className="text-stone-500 mb-4">
                            This story was not created from a transcript
                          </p>
                          <Button variant="outline">
                            <LinkIcon className="w-4 h-4 mr-2" />
                            Link a Transcript
                          </Button>
                        </div>
                      )}

                      {/* Other Transcripts from this Storyteller */}
                      {storytellerTranscripts.length > 0 && (
                        <Card className="border-stone-200">
                          <CardHeader>
                            <CardTitle className="text-base">
                              Other Transcripts by {story.author?.display_name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {storytellerTranscripts.slice(0, 5).map((transcript) => (
                                <div
                                  key={transcript.id}
                                  className="flex items-center justify-between p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
                                >
                                  <div>
                                    <p className="font-medium text-stone-800">{transcript.title}</p>
                                    <p className="text-xs text-stone-500">
                                      {transcript.word_count?.toLocaleString()} words
                                    </p>
                                  </div>
                                  <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/admin/transcripts/${transcript.id}`}>
                                      <ChevronRight className="w-4 h-4" />
                                    </Link>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  {/* Cultural Tab */}
                  <TabsContent value="cultural" className="mt-0">
                    <div className="space-y-6">
                      {/* Cultural Sensitivity Level */}
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          Cultural Sensitivity Level
                        </label>
                        {isEditing ? (
                          <Select
                            value={editData.cultural_sensitivity_level || 'low'}
                            onValueChange={(value) => handleFieldChange('cultural_sensitivity_level', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low - General content</SelectItem>
                              <SelectItem value="medium">Medium - Cultural context required</SelectItem>
                              <SelectItem value="high">High - Sacred/ceremonial content</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={getSensitivityColor(story.cultural_sensitivity_level)}>
                            {story.cultural_sensitivity_level} sensitivity
                          </Badge>
                        )}
                      </div>

                      {/* Cultural Protocols */}
                      <Card className="bg-gradient-to-br from-earth-50 to-earth-100/50 border-earth-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-earth-800">
                            <Shield className="w-5 h-5" />
                            Cultural Protocols
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                              <span className="text-sm text-stone-600">Elder Approved</span>
                              <Badge className={story.elder_approved
                                ? 'bg-sage-100 text-sage-700 border border-sage-200'
                                : 'bg-stone-100 text-stone-600 border border-stone-200'
                              }>
                                {story.elder_approved ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                              <span className="text-sm text-stone-600">Ceremonial Content</span>
                              <Badge className={story.ceremonial_content
                                ? 'bg-earth-100 text-earth-700 border border-earth-200'
                                : 'bg-stone-100 text-stone-600 border border-stone-200'
                              }>
                                {story.ceremonial_content ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                              <span className="text-sm text-stone-600">Traditional Knowledge</span>
                              <Badge className={story.traditional_knowledge
                                ? 'bg-earth-100 text-earth-700 border border-earth-200'
                                : 'bg-stone-100 text-stone-600 border border-stone-200'
                              }>
                                {story.traditional_knowledge ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                              <span className="text-sm text-stone-600">Consent Status</span>
                              <Badge className={
                                story.consent_status === 'granted' ? 'bg-sage-100 text-sage-700 border border-sage-200' :
                                story.consent_status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                'bg-clay-100 text-clay-700 border border-clay-200'
                              }>
                                {story.consent_status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Cultural Context */}
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          Cultural Context Notes
                        </label>
                        {isEditing ? (
                          <Textarea
                            value={editData.cultural_context || ''}
                            onChange={(e) => handleFieldChange('cultural_context', e.target.value)}
                            rows={4}
                            placeholder="Add cultural context or notes about this story..."
                          />
                        ) : story.cultural_context ? (
                          <div className="p-4 bg-earth-50 rounded-lg border border-earth-200">
                            <p className="text-sm text-earth-800 leading-relaxed">{story.cultural_context}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-stone-500">No cultural context notes provided</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Settings Tab */}
                  <TabsContent value="settings" className="mt-0">
                    <div className="space-y-6">
                      {/* Status and Visibility */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">Status</label>
                          {isEditing ? (
                            <Select
                              value={editData.status || 'draft'}
                              onValueChange={(value) => handleFieldChange('status', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="under_review">Under Review</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="flagged">Flagged</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge className={getStatusColor(story.status)}>{story.status}</Badge>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">Visibility</label>
                          {isEditing ? (
                            <Select
                              value={editData.visibility || 'public'}
                              onValueChange={(value) => handleFieldChange('visibility', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="public">Public</SelectItem>
                                <SelectItem value="community">Community Only</SelectItem>
                                <SelectItem value="organisation">Organisation Only</SelectItem>
                                <SelectItem value="private">Private</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex items-center gap-2">
                              {getVisibilityIcon(story.visibility)}
                              <span className="capitalize">{story.visibility}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Story Type */}
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Story Type</label>
                        {isEditing ? (
                          <Select
                            value={editData.story_type || 'personal'}
                            onValueChange={(value) => handleFieldChange('story_type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="personal">Personal Journey</SelectItem>
                              <SelectItem value="family">Family Story</SelectItem>
                              <SelectItem value="community">Community Story</SelectItem>
                              <SelectItem value="cultural">Cultural Heritage</SelectItem>
                              <SelectItem value="professional">Professional Life</SelectItem>
                              <SelectItem value="historical">Historical Event</SelectItem>
                              <SelectItem value="educational">Educational</SelectItem>
                              <SelectItem value="healing">Healing Journey</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline" className="capitalize">{story.story_type}</Badge>
                        )}
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Tags</label>
                        {isEditing ? (
                          <Input
                            value={editData.tags?.join(', ') || ''}
                            onChange={(e) => handleFieldChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                            placeholder="Enter tags separated by commas..."
                          />
                        ) : story.tags?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {story.tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline">#{tag}</Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-stone-500">No tags</p>
                        )}
                      </div>

                      {/* Themes */}
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Themes</label>
                        {story.themes?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {story.themes.map((theme, idx) => (
                              <Badge key={idx} className="bg-sage-100 text-sage-700 border border-sage-200">
                                {theme}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-stone-500">No themes identified</p>
                        )}
                      </div>

                      {/* Featured */}
                      <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                        <div>
                          <p className="font-medium text-stone-800">Featured Story</p>
                          <p className="text-sm text-stone-500">Show this story on the homepage</p>
                        </div>
                        <Badge className={story.featured
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-stone-100 text-stone-600 border border-stone-200'
                        }>
                          {story.featured ? 'Featured' : 'Not Featured'}
                        </Badge>
                      </div>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar - 4 columns */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Storyteller Card */}
            {story.author ? (
              <Card className="border-stone-200 overflow-hidden">
                <div className="bg-gradient-to-r from-sage-50 via-earth-50/30 to-stone-50 px-6 py-4 border-b border-stone-100">
                  <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Storyteller
                  </h3>
                </div>
                <CardContent className="p-6">
                  <div className="text-center">
                    {/* Avatar */}
                    <Link href={`/storytellers/${story.author.id}`} className="inline-block group">
                      <div className="relative">
                        {story.author.avatar_url ? (
                          <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden ring-4 ring-sage-100 group-hover:ring-sage-200 transition-all">
                            <Image
                              src={story.author.avatar_url}
                              alt={story.author.display_name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 mx-auto rounded-full bg-sage-100 flex items-center justify-center ring-4 ring-sage-100 group-hover:ring-sage-200 transition-all">
                            <span className="text-2xl font-bold text-sage-600">
                              {story.author.display_name.charAt(0)}
                            </span>
                          </div>
                        )}
                        {story.author.elder_status && (
                          <div className="absolute -top-1 -right-1">
                            <Badge className="bg-amber-100 text-amber-700 border border-amber-200">
                              <Crown className="w-3 h-3" />
                            </Badge>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Name */}
                    <Link href={`/storytellers/${story.author.id}`} className="block mt-3 group">
                      <h4 className="font-semibold text-stone-800 group-hover:text-sage-700 transition-colors">
                        {story.author.display_name}
                      </h4>
                    </Link>

                    {story.author.cultural_background && (
                      <p className="text-sm text-sage-600 mt-1">{story.author.cultural_background}</p>
                    )}

                    {/* Cultural Affiliations */}
                    {story.author.cultural_affiliations && story.author.cultural_affiliations.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-center mt-3">
                        {story.author.cultural_affiliations.map((affiliation, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{affiliation}</Badge>
                        ))}
                      </div>
                    )}

                    {/* Bio */}
                    {story.author.bio && (
                      <p className="text-sm text-stone-600 mt-4 line-clamp-3 text-left">
                        {story.author.bio}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/storytellers/${story.author.id}`}>
                          View Profile
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/admin/storytellers/${story.author.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-stone-200 overflow-hidden">
                <div className="bg-gradient-to-r from-sage-50 via-earth-50/30 to-stone-50 px-6 py-4 border-b border-stone-100">
                  <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Storyteller
                  </h3>
                </div>
                <CardContent className="p-6">
                  <div className="text-center text-stone-500">
                    <User className="w-12 h-12 mx-auto text-stone-300 mb-3" />
                    <p className="text-sm">No storyteller assigned</p>
                    <p className="text-xs text-stone-400 mt-1">
                      This story doesn&apos;t have a linked storyteller profile
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Story Stats */}
            <Card className="border-stone-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sage-600" />
                  Story Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-stone-50 rounded-lg">
                    <p className="text-2xl font-bold text-stone-800">{story.stats?.views_count || 0}</p>
                    <p className="text-xs text-stone-500">Views</p>
                  </div>
                  <div className="text-center p-3 bg-sage-50 rounded-lg">
                    <p className="text-2xl font-bold text-sage-700">{story.stats?.likes_count || 0}</p>
                    <p className="text-xs text-stone-500">Likes</p>
                  </div>
                  <div className="text-center p-3 bg-earth-50 rounded-lg">
                    <p className="text-2xl font-bold text-earth-700">{story.stats?.comments_count || 0}</p>
                    <p className="text-xs text-stone-500">Comments</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-700">{story.stats?.shares_count || 0}</p>
                    <p className="text-xs text-stone-500">Shares</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-sm text-stone-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {story.stats?.reading_time || Math.ceil((story.content?.split(' ').length || 0) / 200)} min read
                  </span>
                  <span>{story.content?.split(' ').length?.toLocaleString() || 0} words</span>
                </div>
              </CardContent>
            </Card>

            {/* Meta Information */}
            <Card className="border-stone-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Meta Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Created</span>
                  <span className="text-stone-700">{new Date(story.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Last Updated</span>
                  <span className="text-stone-700">{new Date(story.updated_at).toLocaleDateString()}</span>
                </div>
                {story.location && (
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Location</span>
                    <span className="text-stone-700">{story.location}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Story ID</span>
                  <code className="text-xs bg-stone-100 px-2 py-1 rounded">{story.id.slice(0, 8)}...</code>
                </div>
              </CardContent>
            </Card>

            {/* Other Stories from Storyteller */}
            {story.author && (storytellerStories.length > 0 || loadingRelated) && (
              <Card className="border-stone-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    More from {story.author?.display_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingRelated ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
                      <span className="ml-2 text-sm text-stone-500">Loading stories...</span>
                    </div>
                  ) : storytellerStories.length === 0 ? (
                    <p className="text-sm text-stone-500 text-center py-4">
                      No other stories from this storyteller
                    </p>
                  ) : (
                  <div className="space-y-3">
                    {storytellerStories.slice(0, 4).map((relatedStory) => (
                      <Link
                        key={relatedStory.id}
                        href={`/admin/stories/${relatedStory.id}`}
                        className="block p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-stone-800 line-clamp-1">{relatedStory.title}</p>
                          {relatedStory.status && relatedStory.status !== 'published' && (
                            <Badge variant="outline" className="text-xs shrink-0">
                              {relatedStory.status}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-1">
                          {new Date(relatedStory.created_at).toLocaleDateString()}
                        </p>
                      </Link>
                    ))}
                  </div>
                  )}
                  {!loadingRelated && storytellerStories.length > 4 && (
                    <Button variant="ghost" size="sm" className="w-full mt-3" asChild>
                      <Link href={`/storytellers/${story.author_id}/stories`}>
                        View all {storytellerStories.length} stories
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="border-stone-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Summary
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Re-analyze Transcript
                </Button>
                <Button variant="outline" className="w-full justify-start text-clay-600 hover:text-clay-700" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Story
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
