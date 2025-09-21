'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { MetricCard } from '@/components/ui/metric-card'
import { StoryCard } from '@/components/ui/story-card'
import { Typography } from '@/components/ui/typography'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import {
  User,
  FileText,
  BookOpen,
  Play,
  Clock,
  ChevronLeft,
  PlusCircle,
  Video,
  Calendar,
  MapPin,
  Mail,
  Users,
  Camera,
  Loader2,
  BarChart3
} from 'lucide-react'
import { TranscriptList } from '@/components/storyteller/TranscriptList'
import { VideoPlayer } from '@/components/media/VideoPlayer'
import { MediaUploader } from '@/components/media/MediaUploader'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { StorytellerAnalyticsTest } from '@/components/analytics/StorytellerAnalyticsTest'

interface DetailedTranscript {
  id: string
  title: string
  content: string
  wordCount: number
  characterCount: number
  hasVideo: boolean
  videoUrl?: string
  videoPlatform?: string
  videoThumbnail?: string
  status: string
  createdAt: string
  metadata: any
}

interface DetailedStory {
  id: string
  title: string
  content?: string
  summary?: string
  status: string
  hasVideo: boolean
  videoEmbedCode?: string
  themes: string[]
  createdAt: string
  publishedAt?: string
  metadata: any
}

interface PhotoAsset {
  id: string
  filename: string
  title?: string
  url: string
  description?: string
  createdAt: string
  fileSize: number
  width?: number
  height?: number
  metadata: any
}

interface StorytellerDetail {
  id: string
  fullName: string
  displayName: string
  bio?: string
  avatarUrl?: string
  email?: string
  culturalBackground?: string
  location?: string
  transcripts: DetailedTranscript[]
  stories: DetailedStory[]
  photos: PhotoAsset[]
  stats: {
    totalTranscripts: number
    totalStories: number
    totalVideos: number
    totalPhotos: number
    totalCharacters: number
    draftStories: number
    publishedStories: number
    pendingTranscripts: number
  }
  organizationContext?: {
    id: string
    name: string
  }
}

interface ApiResponse {
  success: boolean
  storyteller: StorytellerDetail
}

export default function StorytellerDashboard() {
  const params = useParams()
  const searchParams = useSearchParams()
  const storytellerId = params.id as string
  const organizationId = searchParams.get('org')
  
  const [data, setData] = useState<StorytellerDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('stories')
  const [showMediaUploader, setShowMediaUploader] = useState(false)
  const [showTextTranscriptDialog, setShowTextTranscriptDialog] = useState(false)
  const [textTranscriptForm, setTextTranscriptForm] = useState({
    title: '',
    text: ''
  })
  const [isCreatingTranscript, setIsCreatingTranscript] = useState(false)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true)
        console.log('🔍 Fetching dashboard for storyteller:', storytellerId)
        
        const url = `/api/storytellers/${storytellerId}/dashboard${organizationId ? `?org=${organizationId}` : ''}`
        const response = await fetch(url)
        const result: ApiResponse = await response.json()
        
        console.log('📊 Dashboard API response:', result)
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch storyteller data')
        }
        
        setData(result.storyteller)
      } catch (err) {
        console.error('❌ Error fetching storyteller dashboard:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
  }, [storytellerId, organizationId])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatWordCount = (count: number) => {
    if (count > 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200'
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'review': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-grey-100 text-grey-800 border-grey-200'
    }
  }

  const handleCreateStory = (transcriptId: string) => {
    // Navigate to story creation page with transcript pre-selected
    const params = new URLSearchParams()
    params.set('transcript', transcriptId)
    if (organizationId) {
      params.set('org', organizationId)
    }
    window.open(`/stories/create?${params.toString()}`, '_blank')
  }

  const handleDeleteTranscript = async (transcriptId: string) => {
    // Find the transcript to get its title for the confirmation
    const transcript = data?.transcripts.find(t => t.id === transcriptId)
    const transcriptTitle = transcript?.title || 'this transcript'

    const confirmMessage = `Are you sure you want to delete "${transcriptTitle}"?\n\nThis action cannot be undone and will permanently remove the transcript and all its content.`

    if (!confirm(confirmMessage)) return

    try {
      console.log('🗑️ Deleting transcript:', transcriptId)

      const response = await fetch(`/api/transcripts/${transcriptId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (response.ok) {
        console.log('✅ Transcript deleted successfully')

        // Update local state to remove the deleted transcript
        setData(prevData => {
          if (!prevData) return prevData

          const updatedTranscripts = prevData.transcripts.filter(t => t.id !== transcriptId)
          const updatedStats = {
            ...prevData.stats,
            totalTranscripts: updatedTranscripts.length,
            pendingTranscripts: updatedTranscripts.filter(t => t.status === 'pending').length
          }

          return {
            ...prevData,
            transcripts: updatedTranscripts,
            stats: updatedStats
          }
        })

        // Show success feedback
        alert(`"${transcriptTitle}" has been deleted successfully.`)
      } else {
        console.error('❌ Failed to delete transcript:', result)
        alert(`Failed to delete transcript: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ Error deleting transcript:', error)
      alert('Failed to delete transcript. Please check your connection and try again.')
    }
  }

  const handleCreateTextTranscript = async () => {
    if (!textTranscriptForm.title.trim() || !textTranscriptForm.text.trim()) {
      alert('Please enter both a title and text for the transcript')
      return
    }

    setIsCreatingTranscript(true)
    
    try {
      const response = await fetch('/api/transcripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: textTranscriptForm.title,
          text: textTranscriptForm.text,
          createdBy: storytellerId
        })
      })

      if (response.ok) {
        // Reset form and close dialog
        setTextTranscriptForm({ title: '', text: '' })
        setShowTextTranscriptDialog(false)
        // Refresh dashboard data
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`Failed to create transcript: ${error.message}`)
      }
    } catch (error) {
      console.error('Error creating transcript:', error)
      alert('Failed to create transcript')
    } finally {
      setIsCreatingTranscript(false)
    }
  }

  const prepareVideoData = () => {
    if (!data) return []
    
    const videos: Array<{
      id: string
      title: string
      type: 'transcript' | 'story'
      hasVideo: boolean
      videoUrl?: string
      videoPlatform?: string
      videoEmbedCode?: string
      videoThumbnail?: string
      createdAt: string
      status?: string
      metadata?: any
    }> = []

    // Add videos from transcripts
    data.transcripts.filter(t => t.hasVideo).forEach(transcript => {
      videos.push({
        id: `transcript-${transcript.id}`,
        title: transcript.title,
        type: 'transcript',
        hasVideo: transcript.hasVideo,
        videoUrl: transcript.videoUrl,
        videoPlatform: transcript.videoPlatform,
        videoThumbnail: transcript.videoThumbnail,
        createdAt: transcript.createdAt,
        status: transcript.status,
        metadata: transcript.metadata
      })
    })

    // Add videos from stories
    data.stories.filter(s => s.hasVideo).forEach(story => {
      videos.push({
        id: `story-${story.id}`,
        title: story.title,
        type: 'story',
        hasVideo: story.hasVideo,
        videoEmbedCode: story.videoEmbedCode,
        createdAt: story.createdAt,
        status: story.status,
        metadata: story.metadata
      })
    })

    // Sort by creation date (newest first)
    return videos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading storyteller dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error: {error || 'Failed to load storyteller data'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Storytellers', href: '/storytellers' },
            { label: data.displayName || data.fullName, href: `/storytellers/${storytellerId}` },
            { label: 'Dashboard', href: `/storytellers/${storytellerId}/dashboard` }
          ]}
        />
        
        {/* Dashboard Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 ring-4 ring-offset-2 ring-earth-200">
              <AvatarImage src={data.avatarUrl} alt={data.fullName} />
              <AvatarFallback className="bg-gradient-to-br from-earth-200 to-sage-200 text-earth-800 font-semibold text-lg">
                {getInitials(data.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Typography variant="cultural-title" className="text-earth-800 mb-1">
                {data.displayName || data.fullName}'s Dashboard
              </Typography>
              <Typography variant="cultural-body" className="text-stone-600 mb-2">
                Your storytelling journey and cultural heritage preservation.
              </Typography>
              {data.culturalBackground && (
                <Badge className="bg-sage-100 text-sage-800 border-sage-300">
                  {data.culturalBackground}
                </Badge>
              )}
            </div>
          </div>
        </div>

      {/* Storytelling Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MetricCard
          variant="stories"
          title="Transcripts Collected"
          value={data.stats.totalTranscripts}
          description={`${data.stats.pendingTranscripts} awaiting review`}
          icon={FileText}
        />
        
        <MetricCard
          variant="stories"
          title="Stories Shared"
          value={data.stats.totalStories}
          description={`${data.stats.publishedStories} published to community`}
          icon={BookOpen}
        />
        
        <MetricCard
          variant="storytellers"
          title="Visual Stories"
          value={data.stats.totalVideos}
          description="Video and multimedia content"
          icon={Video}
        />
        
        <MetricCard
          variant="community"
          title="Words Preserved"
          value={formatWordCount(data.stats.totalCharacters / 5)}
          description="Cultural wisdom documented"
          icon={User}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="transcripts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Transcripts ({data.stats.totalTranscripts})
          </TabsTrigger>
          <TabsTrigger value="stories" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Stories ({data.stats.totalStories})
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Photos ({data.stats.totalPhotos})
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Videos ({data.stats.totalVideos})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Transcripts Tab */}
        <TabsContent value="transcripts" className="space-y-4" id="transcripts-section">
          <div className="flex items-center justify-between">
<Typography variant="story-title" className="text-earth-800">
              Transcripts ({data.stats.totalTranscripts})
            </Typography>
            <div className="flex gap-2">
              <Button variant="sage-outline" size="cultural" onClick={() => setShowTextTranscriptDialog(true)}>
                <FileText className="h-4 w-4 mr-2" />
                Add Text Transcript
              </Button>
              <Button variant="earth-primary" size="cultural" onClick={() => setShowMediaUploader(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Upload Audio/Video
              </Button>
            </div>
          </div>
          
          <TranscriptList
            transcripts={data.transcripts}
            onCreateStory={handleCreateStory}
            onDelete={handleDeleteTranscript}
            organizationContext={data.organizationContext}
            emptyMessage="No transcripts yet. Upload audio or video content to generate transcripts."
          />
        </TabsContent>

        {/* Stories Tab */}
        <TabsContent value="stories" className="space-y-4">
          <div className="flex items-center justify-between">
<Typography variant="story-title" className="text-earth-800">
              Stories ({data.stats.totalStories})
            </Typography>
            <Button variant="earth-primary" size="cultural">
              <PlusCircle className="h-4 w-4 mr-2" />
              Share New Story
            </Button>
          </div>
          
          <div className="grid gap-6">
            {data.stories.map((story) => (
              <StoryCard
                key={story.id}
                storyId={story.id}
                title={story.title}
                excerpt={story.summary}
                storytellerId={storytellerId}
                storytellerName={data.displayName || data.fullName}
                storytellerAvatar={data.avatarUrl}
                culturalSensitivity={story.status === 'published' ? 'public' : 'community'}
                themes={story.themes}
                publishedDate={story.publishedAt || story.createdAt}
                hasVideo={story.hasVideo}
                status={story.status as any}
                variant={story.status === 'published' ? 'featured' : 'default'}
                className="hover:shadow-cultural transition-all duration-300"
              />
            ))}
            
            {data.stories.length === 0 && (
              <Card className="border-2 border-dashed border-stone-300 bg-stone-50">
                <CardContent className="text-center py-16">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-earth-400" />
                  <Typography variant="story-title" className="mb-3 text-stone-700">
                    Your Story Collection Awaits
                  </Typography>
                  <Typography variant="cultural-body" className="text-stone-600 mb-6 max-w-md mx-auto">
                    Every story preserves wisdom. Start sharing your cultural heritage and personal experiences with your community.
                  </Typography>
                  <div className="flex gap-3 justify-center">
                    <Button variant="earth-outline" asChild>
                      <Link href="/stories/create">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Write New Story
                      </Link>
                    </Button>
                    {data.transcripts.length > 0 && (
                      <Button variant="sage-primary" onClick={() => setActiveTab('transcripts')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Create from Transcript
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos" className="space-y-4">
          <div className="flex items-center justify-between">
<Typography variant="story-title" className="text-earth-800">
              Photo Gallery ({data.stats.totalPhotos})
            </Typography>
            <Button variant="clay-primary" size="cultural" onClick={() => setShowMediaUploader(true)}>
              <Camera className="h-4 w-4 mr-2" />
              Add Photos
            </Button>
          </div>
          
          {data.photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.photos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square relative group">
                    <img
                      src={photo.url}
                      alt={photo.title || photo.filename}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NSA3NUg5NVY4NUg4NVY3NVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2ZyBpZD0iaW1hZ2UiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDgwLDgwKSI+CjxwYXRoIGQ9Ik0yMSAzSDNDMS44OSAzIDEgMy44OSAxIDVWMTlDMSAyMC4xIDEuODkgMjEgMyAyMUgyMUMyMi4xIDIxIDIzIDIwLjEgMjMgMTlWNUMyMyAzLjg5IDIyLjEgMyAyMSAzWk03IDlMOSAxMUw5IDExTDE0IDEzTDE5IDE2VjE5SDVWMTBMNyA5WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4KPC9zdmc+'
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colours" />
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-medium text-sm truncate">{photo.title || photo.filename}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{formatDate(photo.createdAt)}</span>
                      <span>•</span>
                      <span>{(photo.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                    {photo.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {photo.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No photos yet</h3>
                <p className="text-muted-foreground mb-4">
                  Upload photos to build your visual story collection.
                </p>
                <Button onClick={() => setShowMediaUploader(true)}>
                  <Camera className="h-4 w-4 mr-2" />
                  Upload Photos
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-4">
          <VideoPlayer
            videos={prepareVideoData()}
            organizationContext={data.organizationContext}
            emptyMessage="Upload transcripts with video or add video embeds to stories."
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <StorytellerAnalyticsTest storytellerId={storytellerId} />
        </TabsContent>
      </Tabs>
      </div>
      
      {/* Media Upload Dialog */}
      <Dialog open={showMediaUploader} onOpenChange={setShowMediaUploader}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
          </DialogHeader>
          <MediaUploader
            enableTranscription={activeTab === 'transcripts'}
            acceptedTypes={
              activeTab === 'photos' 
                ? ['image/*'] 
                : activeTab === 'videos'
                ? ['video/*']
                : ['audio/*', 'video/*', 'image/*']
            }
            maxFiles={activeTab === 'photos' ? 10 : 5}
            onUploadComplete={(media) => {
              console.log('Media uploaded:', media)
              setShowMediaUploader(false)
              // Refresh dashboard data to show new content
              window.location.reload()
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Text Transcript Dialog */}
      <Dialog open={showTextTranscriptDialog} onOpenChange={setShowTextTranscriptDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Text Transcript</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transcript-title">Title</Label>
              <Input
                id="transcript-title"
                placeholder="Enter transcript title..."
                value={textTranscriptForm.title}
                onChange={(e) => setTextTranscriptForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transcript-text">Transcript Text</Label>
              <Textarea
                id="transcript-text"
                placeholder="Enter or paste your transcript text here..."
                value={textTranscriptForm.text}
                onChange={(e) => setTextTranscriptForm(prev => ({ ...prev, text: e.target.value }))}
                rows={12}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {textTranscriptForm.text.length} characters, ~{Math.ceil(textTranscriptForm.text.split(' ').length)} words
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowTextTranscriptDialog(false)}
                disabled={isCreatingTranscript}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTextTranscript}
                disabled={isCreatingTranscript || !textTranscriptForm.title.trim() || !textTranscriptForm.text.trim()}
              >
                {isCreatingTranscript ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Transcript'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  )
}