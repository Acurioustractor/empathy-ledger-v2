'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  User,
  FileText,
  Image as ImageIcon,
  Mic,
  Globe,
  Lock,
  Trash2,
  Share2,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  Play,
  Pause,
  Loader2,
  ArrowLeft,
  Settings,
  Shield,
  XCircle
} from 'lucide-react'
import Link from 'next/link'

interface StoryData {
  id: string
  title: string
  content: string
  status: 'draft' | 'review' | 'published' | 'archived'
  is_public: boolean
  created_at: string
  updated_at: string
  featured_image_url?: string
  storyteller_id?: string
  notes?: string
}

interface TranscriptData {
  id: string
  content: string | null
  transcript_text: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  audio_url?: string
  duration?: number
  duration_seconds?: number
  created_at: string
}

interface MediaItem {
  id: string
  url: string
  type: 'image' | 'video' | 'audio'
  caption?: string
  created_at: string
}

interface DistributionData {
  id: string
  platform: string
  distribution_url?: string
  status: 'active' | 'revoked' | 'expired'
  created_at: string
  view_count: number
}

export default function MyStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const supabase = createSupabaseClient()

  const [storyId, setStoryId] = useState<string>('')
  const [story, setStory] = useState<StoryData | null>(null)
  const [transcripts, setTranscripts] = useState<TranscriptData[]>([])
  const [media, setMedia] = useState<MediaItem[]>([])
  const [distributions, setDistributions] = useState<DistributionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  // Privacy controls
  const [isPublic, setIsPublic] = useState(false)
  const [notes, setNotes] = useState('')

  // Audio playback
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)

  // Resolve params
  useEffect(() => {
    params.then(p => setStoryId(p.id))
  }, [params])

  // Load story data
  useEffect(() => {
    if (!storyId) return

    async function loadStory() {
      try {
        setLoading(true)
        setError(null)

        // Check auth
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/signin')
          return
        }

        // Fetch story
        const { data: storyData, error: storyError } = await supabase
          .from('stories')
          .select('*')
          .eq('id', storyId)
          .single()

        if (storyError || !storyData) {
          setError('Story not found')
          return
        }

        // Verify ownership
        if (storyData.storyteller_id !== user.id && storyData.author_id !== user.id) {
          setError('You do not have access to this story')
          return
        }

        setStory(storyData)
        setIsPublic(storyData.is_public || false)
        setNotes(storyData.notes || '')
        setIsOwner(true)

        // Fetch transcripts
        const { data: transcriptData } = await supabase
          .from('transcripts')
          .select('*')
          .eq('story_id', storyId)
          .order('created_at', { ascending: false })

        if (transcriptData) {
          setTranscripts(transcriptData)
        }

        // Fetch media
        const { data: mediaData } = await supabase
          .from('media_assets')
          .select('*')
          .eq('story_id', storyId)
          .order('created_at', { ascending: false })

        if (mediaData) {
          setMedia(mediaData.map(m => ({
            id: m.id,
            url: m.url || m.file_url,
            type: m.media_type || 'image',
            caption: m.caption,
            created_at: m.created_at
          })))
        }

        // Fetch distributions
        const { data: distData } = await supabase
          .from('story_distributions')
          .select('*')
          .eq('story_id', storyId)
          .order('created_at', { ascending: false })

        if (distData) {
          setDistributions(distData)
        }

      } catch (err) {
        console.error('Error loading story:', err)
        setError('Failed to load story')
      } finally {
        setLoading(false)
      }
    }

    loadStory()
  }, [storyId, supabase, router])

  // Save privacy settings
  const handleSavePrivacy = async () => {
    if (!story) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('stories')
        .update({
          is_public: isPublic,
          notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', story.id)

      if (error) throw error

      setStory({ ...story, is_public: isPublic, notes })
    } catch (err) {
      console.error('Error saving:', err)
      setError('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  // Revoke distribution
  const handleRevokeDistribution = async (distId: string) => {
    try {
      const { error } = await supabase
        .from('story_distributions')
        .update({
          status: 'revoked',
          revoked_at: new Date().toISOString()
        })
        .eq('id', distId)

      if (error) throw error

      setDistributions(distributions.map(d =>
        d.id === distId ? { ...d, status: 'revoked' as const } : d
      ))
    } catch (err) {
      console.error('Error revoking:', err)
    }
  }

  // Delete story
  const handleDeleteStory = async () => {
    if (!story || !confirm('Are you sure you want to delete this story? This cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('stories')
        .update({ status: 'archived' })
        .eq('id', story.id)

      if (error) throw error

      router.push('/storyteller/dashboard')
    } catch (err) {
      console.error('Error deleting:', err)
      setError('Failed to delete story')
    }
  }

  // Format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
          <p className="text-stone-500">Loading your story...</p>
        </div>
      </div>
    )
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <p className="text-stone-600 dark:text-stone-400 mb-4">
              {error || 'Story not found'}
            </p>
            <Button variant="outline" onClick={() => router.push('/storyteller/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-stone-900/80 backdrop-blur border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/storyteller/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              My Stories
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant={story.status === 'published' ? 'default' : 'secondary'}>
                {story.status}
              </Badge>
              {isPublic ? (
                <Badge variant="outline" className="text-green-600">
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </Badge>
              ) : (
                <Badge variant="outline" className="text-stone-500">
                  <Lock className="h-3 w-3 mr-1" />
                  Private
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Story Title */}
        <div>
          <h1 className="text-2xl font-bold text-earth-800 dark:text-earth-200">
            {story.title}
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Created {new Date(story.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">
              <FileText className="h-4 w-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="media">
              <ImageIcon className="h-4 w-4 mr-2" />
              Media
            </TabsTrigger>
            <TabsTrigger value="sharing">
              <Share2 className="h-4 w-4 mr-2" />
              Sharing
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            {/* Featured Image */}
            {story.featured_image_url && (
              <Card>
                <CardContent className="p-0">
                  <img
                    src={story.featured_image_url}
                    alt="Story"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>
            )}

            {/* Transcript */}
            {transcripts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mic className="h-5 w-5" />
                    Your Interview
                  </CardTitle>
                  <CardDescription>
                    Recorded and transcribed from your conversation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {transcripts.map((transcript) => (
                    <div key={transcript.id} className="space-y-3">
                      {/* Audio Player */}
                      {transcript.audio_url && (
                        <div className="bg-stone-100 dark:bg-stone-800 rounded-lg p-4">
                          <div className="flex items-center gap-4">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                const audio = document.getElementById(`audio-${transcript.id}`) as HTMLAudioElement
                                if (playingAudio === transcript.id) {
                                  audio?.pause()
                                  setPlayingAudio(null)
                                } else {
                                  audio?.play()
                                  setPlayingAudio(transcript.id)
                                }
                              }}
                            >
                              {playingAudio === transcript.id ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Audio Recording</p>
                              {(transcript.duration_seconds || transcript.duration) && (
                                <p className="text-xs text-stone-500">
                                  {formatDuration(transcript.duration_seconds || transcript.duration || 0)}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline">
                              {transcript.status === 'completed' ? (
                                <><CheckCircle2 className="h-3 w-3 mr-1 text-green-500" /> Transcribed</>
                              ) : transcript.status === 'processing' ? (
                                <><Clock className="h-3 w-3 mr-1 animate-spin" /> Processing</>
                              ) : transcript.status === 'failed' ? (
                                <><XCircle className="h-3 w-3 mr-1 text-red-500" /> Failed</>
                              ) : (
                                <><Clock className="h-3 w-3 mr-1" /> Pending</>
                              )}
                            </Badge>
                          </div>
                          <audio
                            id={`audio-${transcript.id}`}
                            src={transcript.audio_url}
                            onEnded={() => setPlayingAudio(null)}
                            className="hidden"
                          />
                        </div>
                      )}

                      {/* Transcript Text */}
                      {(transcript.content || transcript.transcript_text) && transcript.status === 'completed' && (
                        <div className="prose prose-stone dark:prose-invert max-w-none">
                          <p className="text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
                            {transcript.content || transcript.transcript_text}
                          </p>
                        </div>
                      )}

                      {transcript.status === 'processing' && (
                        <Alert>
                          <Clock className="h-4 w-4" />
                          <AlertDescription>
                            Your interview is being transcribed. This usually takes a few minutes.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Story Content */}
            {story.content && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Story Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-stone dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{story.content}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No content yet */}
            {!story.content && transcripts.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <FileText className="h-12 w-12 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-500">
                    Your story content will appear here once it's added.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-4">
            {media.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {media.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.caption || 'Media'}
                        className="w-full h-40 object-cover"
                      />
                    ) : item.type === 'video' ? (
                      <video
                        src={item.url}
                        className="w-full h-40 object-cover"
                        controls
                      />
                    ) : (
                      <div className="h-40 flex items-center justify-center bg-stone-100 dark:bg-stone-800">
                        <Mic className="h-8 w-8 text-stone-400" />
                      </div>
                    )}
                    {item.caption && (
                      <CardContent className="p-2">
                        <p className="text-xs text-stone-500 truncate">{item.caption}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <ImageIcon className="h-12 w-12 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-500">
                    Photos and videos will appear here when they're added to your story.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Sharing Tab */}
          <TabsContent value="sharing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Where Your Story is Shared
                </CardTitle>
                <CardDescription>
                  See all the places your story appears and control access
                </CardDescription>
              </CardHeader>
              <CardContent>
                {distributions.length > 0 ? (
                  <div className="space-y-3">
                    {distributions.map((dist) => (
                      <div
                        key={dist.id}
                        className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            dist.status === 'active'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-stone-200 text-stone-500'
                          }`}>
                            {dist.status === 'active' ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{dist.platform}</p>
                            <p className="text-xs text-stone-500">
                              {dist.view_count} views
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {dist.distribution_url && dist.status === 'active' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(dist.distribution_url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          {dist.status === 'active' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleRevokeDistribution(dist.id)}
                            >
                              Revoke
                            </Button>
                          ) : (
                            <Badge variant="secondary">Revoked</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Shield className="h-12 w-12 text-stone-300 mx-auto mb-4" />
                    <p className="text-stone-500">
                      Your story hasn't been shared anywhere yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Privacy Settings</CardTitle>
                <CardDescription>
                  Control who can see your story
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="public-toggle" className="text-base">
                      Make Story Public
                    </Label>
                    <p className="text-sm text-stone-500">
                      {isPublic
                        ? 'Anyone can find and view your story'
                        : 'Only you and people you share the link with can see your story'}
                    </p>
                  </div>
                  <Switch
                    id="public-toggle"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Personal Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes about this story for yourself..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-stone-500">
                    These notes are private and only visible to you.
                  </p>
                </div>

                <Button
                  onClick={handleSavePrivacy}
                  disabled={saving}
                  className="w-full bg-sage-600 hover:bg-sage-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleDeleteStory}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete This Story
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
