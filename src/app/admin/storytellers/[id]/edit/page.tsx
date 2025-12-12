'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, X, Mic, Plus, Upload, FileAudio, Eye, Edit, Trash2, Calendar, Clock, Sparkles, ChevronDown, ChevronUp, Pencil, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import ConnectionManager from '@/components/admin/ConnectionManager'
import { AvatarUpload } from '@/components/profile/AvatarUpload'

interface ProjectAssignment {
  id: string
  name: string
  status: string
  role: string
  assignmentStatus: string
  organization: {
    id: string
    name: string
  } | null
  joinedAt: string
}

interface StorytellerEditData {
  id: string
  display_name: string
  full_name: string
  email: string
  bio: string
  cultural_background: string
  location: string
  featured: boolean
  elder: boolean
  status: 'active' | 'pending' | 'suspended' | 'inactive'
  profile_image_url?: string
  story_count: number
  created_at: string
  projects?: ProjectAssignment[]
}

interface Transcript {
  id: string
  title: string
  transcript_content: string
  status: string
  word_count: number
  duration: number
  created_at: string
  updated_at: string
  ai_processing_status?: string | null
  themes?: string[] | null
  key_quotes?: string[] | null
  ai_summary?: string | null
}

interface PageProps {
  params: { id: string }
}

export default function EditStorytellerPage({ params }: PageProps) {
  const router = useRouter()
  const [storyteller, setStoryteller] = useState<StorytellerEditData | null>(null)
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [transcriptsLoading, setTranscriptsLoading] = useState(false)

  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    cultural_background: '',
    featured: false,
    elder: false,
    status: 'active' as const
  })

  // Transcript form state
  const [transcriptData, setTranscriptData] = useState({
    title: '',
    content: '',
    source_video_url: '',
    language: 'en',
    status: 'completed'
  })
  const [creatingTranscript, setCreatingTranscript] = useState(false)
  const [transcriptSuccess, setTranscriptSuccess] = useState('')

  // Audio upload state
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioUploading, setAudioUploading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // AI Analysis state
  const [analyzingTranscript, setAnalyzingTranscript] = useState<string | null>(null)
  const [expandedSummaries, setExpandedSummaries] = useState<Set<string>>(new Set())
  const [editingTranscript, setEditingTranscript] = useState<string | null>(null)
  const [editedSummary, setEditedSummary] = useState<string>('')
  const [editedQuotes, setEditedQuotes] = useState<string[]>([])
  const [savingEdit, setSavingEdit] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    fetchStoryteller()
    fetchTranscripts()
  }, [params.id])

  const fetchStoryteller = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/storytellers/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch storyteller')

      const data = await response.json()
      setStoryteller(data.storyteller)
      setFormData({
        display_name: data.storyteller.display_name || '',
        bio: data.storyteller.bio || '',
        cultural_background: data.storyteller.cultural_background || '',
        featured: data.storyteller.featured || false,
        elder: data.storyteller.elder || false,
        status: data.storyteller.status || 'active'
      })
    } catch (error) {
      console.error('Error fetching storyteller:', error)
      setError('Failed to load storyteller data')
    } finally {
      setLoading(false)
    }
  }

  const fetchTranscripts = async () => {
    try {
      setTranscriptsLoading(true)
      const response = await fetch(`/api/admin/transcripts?storyteller_id=${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch transcripts')

      const data = await response.json()
      setTranscripts(data.transcripts || [])
    } catch (error) {
      console.error('Error fetching transcripts:', error)
      // Don't set error state for transcript loading, just log it
    } finally {
      setTranscriptsLoading(false)
    }
  }

  const handleAnalyzeTranscript = async (transcriptId: string) => {
    try {
      setAnalyzingTranscript(transcriptId)

      const response = await fetch(`/api/transcripts/${transcriptId}/analyze`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start analysis')
      }

      const result = await response.json()

      setTranscriptSuccess(`Analysis started! This will take 2-5 minutes. The page will update automatically.`)
      setTimeout(() => setTranscriptSuccess(''), 5000)

      // Poll for updates
      const pollInterval = setInterval(async () => {
        const statusRes = await fetch(`/api/transcripts/${transcriptId}/analyze`)
        const status = await statusRes.json()

        if (status.complete) {
          clearInterval(pollInterval)
          setAnalyzingTranscript(null)
          fetchTranscripts() // Refresh to show results
          setTranscriptSuccess('Analysis complete! Themes and quotes extracted.')
          setTimeout(() => setTranscriptSuccess(''), 5000)
        }
      }, 10000) // Check every 10 seconds

      // Stop polling after 10 minutes
      setTimeout(() => clearInterval(pollInterval), 600000)

    } catch (error) {
      console.error('Error analyzing transcript:', error)
      setError(error instanceof Error ? error.message : 'Failed to analyze transcript')
      setAnalyzingTranscript(null)
    }
  }

  const toggleSummary = (transcriptId: string) => {
    setExpandedSummaries(prev => {
      const newSet = new Set(prev)
      if (newSet.has(transcriptId)) {
        newSet.delete(transcriptId)
      } else {
        newSet.add(transcriptId)
      }
      return newSet
    })
  }

  const handleEditAnalysis = (transcript: Transcript) => {
    setEditingTranscript(transcript.id)
    setEditedSummary(transcript.ai_summary || '')
    setEditedQuotes(transcript.key_quotes || [])
  }

  const handleCancelEdit = () => {
    setEditingTranscript(null)
    setEditedSummary('')
    setEditedQuotes([])
  }

  const handleSaveAnalysis = async (transcriptId: string) => {
    try {
      setSavingEdit(true)

      const response = await fetch(`/api/transcripts/${transcriptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ai_summary: editedSummary,
          key_quotes: editedQuotes.filter(q => q.trim() !== '')
        })
      })

      if (!response.ok) throw new Error('Failed to save changes')

      setTranscriptSuccess('Analysis updated successfully!')
      setEditingTranscript(null)
      fetchTranscripts()
    } catch (error) {
      console.error('Error saving analysis:', error)
      setTranscriptError('Failed to save changes')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleQuoteChange = (index: number, value: string) => {
    setEditedQuotes(prev => {
      const newQuotes = [...prev]
      newQuotes[index] = value
      return newQuotes
    })
  }

  const handleAddQuote = () => {
    setEditedQuotes(prev => [...prev, ''])
  }

  const handleRemoveQuote = (index: number) => {
    setEditedQuotes(prev => prev.filter((_, i) => i !== index))
  }

  const handleAvatarUpload = async (file: File): Promise<string | null> => {
    setUploadingAvatar(true)
    try {
      // Upload to media API
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', `Avatar for ${storyteller?.display_name || 'storyteller'}`)

      const uploadResponse = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || 'Failed to upload avatar')
      }

      const uploadResult = await uploadResponse.json()
      console.log('Upload result:', uploadResult)

      // Get both the media ID and CDN URL from the upload
      const mediaId = uploadResult.mediaId
      const avatarUrl = uploadResult.asset?.cdn_url

      if (!mediaId || !avatarUrl) {
        throw new Error('Failed to get avatar data from upload response')
      }

      console.log('Avatar uploaded:', { mediaId, avatarUrl })

      // Update the storyteller profile with media_id
      const updateResponse = await fetch(`/api/admin/storytellers/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_media_id: mediaId })
      })

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json()
        console.error('Update error:', errorData)
        throw new Error(errorData.error || 'Failed to update profile with new avatar')
      }

      console.log('Profile updated successfully')

      // Update local state
      setStoryteller(prev => prev ? { ...prev, profile_image_url: avatarUrl } : null)

      // Clear error if successful
      setError('')

      return avatarUrl
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload avatar')
      return null
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')

      const response = await fetch(`/api/admin/storytellers/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to update storyteller')

      // Refresh the data to show updated values
      await fetchStoryteller()

      // Show success message instead of redirecting
      setError('')
      setSaving(false)

      // Optional: Show a success toast/message
      alert('Storyteller profile updated successfully!')
    } catch (error) {
      console.error('Error updating storyteller:', error)
      setError('Failed to update storyteller')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTranscriptChange = (field: string, value: string) => {
    setTranscriptData(prev => ({ ...prev, [field]: value }))
  }

  const handleAudioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm']
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid audio file (MP3, WAV, OGG, WEBM)')
      return
    }

    // Validate file size (500MB limit)
    if (file.size > 500 * 1024 * 1024) {
      setError('Audio file size must be less than 500MB')
      return
    }

    setAudioFile(file)
    setError('')
  }

  const uploadAudioFile = async (): Promise<string | null> => {
    if (!audioFile) return null

    setAudioUploading(true)
    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', audioFile)
      formData.append('mediaType', 'audio')
      formData.append('title', transcriptData.title || `Audio for ${transcriptData.title}`)

      // Get the current session token
      const { supabase } = await import('@/lib/supabase/client')
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload audio file')
      }

      const result = await response.json()
      return result.publicUrl || result.url || result.data?.publicUrl
    } catch (error) {
      console.error('Audio upload error:', error)
      setError('Failed to upload audio file')
      return null
    } finally {
      setAudioUploading(false)
    }
  }

  const removeAudioFile = () => {
    setAudioFile(null)
    setAudioUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeleteTranscript = async (transcriptId: string) => {
    const transcript = transcripts.find(t => t.id === transcriptId)
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
        setTranscripts(prevTranscripts =>
          prevTranscripts.filter(t => t.id !== transcriptId)
        )

        // Show success feedback
        setTranscriptSuccess(`Transcript "${transcriptTitle}" deleted successfully!`)
        setError('')

        setTimeout(() => {
          setTranscriptSuccess('')
        }, 3000)
      } else {
        console.error('❌ Failed to delete transcript:', result)
        setError(`Failed to delete transcript: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ Error deleting transcript:', error)
      setError('Failed to delete transcript. Please check your connection and try again.')
    }
  }

  const handleCreateTranscript = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!transcriptData.title || !transcriptData.content) {
      setError('Please fill in transcript title and content')
      return
    }

    setCreatingTranscript(true)
    setError('')
    setTranscriptSuccess('')

    try {
      // Upload audio file first if provided
      let uploadedAudioUrl = ''
      if (audioFile) {
        uploadedAudioUrl = await uploadAudioFile() || ''
      }

      const response = await fetch('/api/admin/transcripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyteller_id: params.id,
          title: transcriptData.title,
          transcript_text: transcriptData.content,
          source_video_url: transcriptData.source_video_url,
          audio_url: uploadedAudioUrl,
          status: transcriptData.status,
          metadata: {
            created_via: 'admin_interface',
            created_from: 'storyteller_edit_page',
            has_audio: !!audioFile
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create transcript')
      }

      const result = await response.json()
      setTranscriptSuccess(`Transcript "${transcriptData.title}" created successfully!`)

      // Refresh transcripts list
      fetchTranscripts()

      // Clear form
      setTranscriptData({
        title: '',
        content: '',
        source_video_url: '',
        language: 'en',
        status: 'completed'
      })
      removeAudioFile()
    } catch (error) {
      console.error('Error creating transcript:', error)
      setError('Failed to create transcript. Please try again.')
    } finally {
      setCreatingTranscript(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/storytellers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-grey-900">Loading...</h1>
        </div>
      </div>
    )
  }

  if (error && !storyteller) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/storytellers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-grey-900">Error</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/storytellers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-grey-900">
              Edit Storyteller
            </h1>
            <p className="text-grey-600">
              Update {storyteller?.display_name || storyteller?.full_name}'s profile information
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/admin/storytellers">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {transcriptSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <p className="text-green-600">{transcriptSuccess}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabbed Content */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="projects">Projects ({storyteller?.projects?.length || 0})</TabsTrigger>
          <TabsTrigger value="transcripts">Transcripts</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Main Information */}
            <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update the storyteller's core profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  placeholder="How should this storyteller be displayed?"
                />
              </div>

              <div>
                <Label htmlFor="cultural_background">Cultural Background</Label>
                <Input
                  id="cultural_background"
                  value={formData.cultural_background}
                  onChange={(e) => handleInputChange('cultural_background', e.target.value)}
                  placeholder="e.g., Aboriginal Australian, Torres Strait Islander"
                />
              </div>

              <div>
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about this storyteller's background and experience..."
                  rows={6}
                />
              </div>
            </CardContent>
            </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Avatar Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>Upload or change the storyteller's avatar</CardDescription>
                </CardHeader>
                <CardContent>
                  <AvatarUpload
                    currentAvatarUrl={storyteller?.profile_image_url}
                    userName={storyteller?.display_name || storyteller?.full_name || 'Storyteller'}
                    onUpload={handleAvatarUpload}
                    isEditing={true}
                  />
                </CardContent>
              </Card>

              {/* Status & Settings */}
              <Card>
            <CardHeader>
              <CardTitle>Status & Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured Storyteller</Label>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange('featured', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="elder">Elder Status</Label>
                <Switch
                  id="elder"
                  checked={formData.elder}
                  onCheckedChange={(checked) => handleInputChange('elder', checked)}
                />
              </div>

              <div>
                <Label htmlFor="status">Account Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full mt-1 rounded-md border border-grey-300 px-3 py-2 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </CardContent>
              </Card>

              {/* Current Info */}
              {storyteller && (
                <Card>
              <CardHeader>
                <CardTitle>Current Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-grey-600">Stories</span>
                  <Badge variant="secondary">{storyteller.story_count}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-grey-600">Email</span>
                  <span className="text-sm">{storyteller.email || 'No email'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-grey-600">Location</span>
                  <span className="text-sm">{storyteller.location || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-grey-600">Joined</span>
                  <span className="text-sm">
                    {new Date(storyteller.created_at).toLocaleDateString()}
                  </span>
                </div>
                </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Project Assignments</CardTitle>
              <CardDescription>
                Projects where {storyteller?.display_name || 'this storyteller'} is assigned
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!storyteller?.projects || storyteller.projects.length === 0 ? (
                <div className="text-center py-8 text-grey-500">
                  No project assignments yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {storyteller.projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-grey-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{project.name}</h3>
                          <Badge variant={project.assignmentStatus === 'active' ? 'default' : 'secondary'}>
                            {project.assignmentStatus}
                          </Badge>
                          <Badge variant="outline">{project.role}</Badge>
                        </div>
                        {project.organization && (
                          <p className="text-sm text-grey-600 mt-1">
                            Organization: {project.organization.name}
                          </p>
                        )}
                        <p className="text-xs text-grey-500 mt-1">
                          Joined: {new Date(project.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/admin/projects/${project.id}/storytellers`}>
                          View Project
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transcripts Tab */}
        <TabsContent value="transcripts">
          <div className="space-y-6">
            {/* Existing Transcripts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileAudio className="w-5 h-5" />
                    <span>Existing Transcripts ({transcripts.length})</span>
                  </div>
                  {transcriptsLoading && (
                    <div className="text-sm text-grey-500">Loading...</div>
                  )}
                </CardTitle>
                <CardDescription>
                  View and manage transcripts for {storyteller?.display_name || 'this storyteller'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transcriptsLoading ? (
                  <div className="text-center py-4">Loading transcripts...</div>
                ) : transcripts.length === 0 ? (
                  <div className="text-center py-8 text-grey-500">
                    <FileAudio className="w-12 h-12 mx-auto mb-4 text-grey-300" />
                    <p>No transcripts found</p>
                    <p className="text-sm">Create your first transcript below</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transcripts.map((transcript) => {
                      const hasAIAnalysis = transcript.ai_processing_status === 'completed' && (transcript.themes || transcript.key_quotes || transcript.ai_summary)
                      const isAnalyzing = analyzingTranscript === transcript.id || transcript.ai_processing_status === 'processing' || transcript.ai_processing_status === 'queued'
                      const isExpanded = expandedSummaries.has(transcript.id)

                      return (
                        <div key={transcript.id} className="border rounded-lg">
                          <div className="flex items-center justify-between p-4 hover:bg-grey-50">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="font-medium">{transcript.title}</h3>
                                <Badge variant={transcript.status === 'completed' ? 'default' : 'secondary'}>
                                  {transcript.status}
                                </Badge>
                                {isAnalyzing && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                    <Sparkles className="w-3 h-3 mr-1 animate-spin" />
                                    Analyzing...
                                  </Badge>
                                )}
                                {hasAIAnalysis && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    AI Analyzed
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-sm text-grey-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {Math.floor(transcript.duration / 60)}:{(transcript.duration % 60).toString().padStart(2, '0')}
                                </div>
                                <div>{transcript.word_count || 0} words</div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(transcript.created_at).toLocaleDateString()}
                                </div>
                              </div>

                              {/* Theme badges */}
                              {transcript.themes && transcript.themes.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {transcript.themes.slice(0, 4).map((theme, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {theme}
                                    </Badge>
                                  ))}
                                  {transcript.themes.length > 4 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{transcript.themes.length - 4} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Analyze button */}
                              {!hasAIAnalysis && !isAnalyzing && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAnalyzeTranscript(transcript.id)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Sparkles className="w-4 h-4 mr-1" />
                                  Analyze
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`/admin/transcripts/${transcript.id}`, '_blank')}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`/admin/transcripts/${transcript.id}/edit`, '_blank')}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`/stories/create?transcript_id=${transcript.id}`, '_blank')}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTranscript(transcript.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Expandable summary section */}
                          {hasAIAnalysis && (
                            <div className="border-t">
                              <button
                                onClick={() => toggleSummary(transcript.id)}
                                className="w-full px-4 py-2 text-left text-sm font-medium text-grey-700 hover:bg-grey-50 flex items-center justify-between"
                              >
                                <span className="flex items-center gap-2">
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  Summary & Key Quotes
                                </span>
                                {isExpanded && editingTranscript !== transcript.id && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEditAnalysis(transcript)
                                    }}
                                  >
                                    <Pencil className="w-3 h-3 mr-1" />
                                    Edit
                                  </Button>
                                )}
                              </button>

                              {isExpanded && (
                                <div className="px-4 pb-4 space-y-3">
                                  {editingTranscript === transcript.id ? (
                                    /* Edit Mode */
                                    <div className="space-y-4">
                                      {/* Editable Summary */}
                                      <div>
                                        <Label className="text-sm font-medium text-grey-700 mb-2 block">📝 AI Summary:</Label>
                                        <Textarea
                                          value={editedSummary}
                                          onChange={(e) => setEditedSummary(e.target.value)}
                                          className="min-h-[100px]"
                                          placeholder="Enter summary..."
                                        />
                                      </div>

                                      {/* Editable Quotes */}
                                      <div>
                                        <div className="flex items-center justify-between mb-2">
                                          <Label className="text-sm font-medium text-grey-700">💬 Key Quotes:</Label>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAddQuote}
                                          >
                                            <Plus className="w-3 h-3 mr-1" />
                                            Add Quote
                                          </Button>
                                        </div>
                                        <div className="space-y-2">
                                          {editedQuotes.map((quote, idx) => (
                                            <div key={idx} className="flex gap-2">
                                              <Textarea
                                                value={quote}
                                                onChange={(e) => handleQuoteChange(idx, e.target.value)}
                                                className="flex-1 min-h-[60px]"
                                                placeholder={`Quote ${idx + 1}...`}
                                              />
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveQuote(idx)}
                                                className="text-red-600 hover:text-red-700"
                                              >
                                                <X className="w-4 h-4" />
                                              </Button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Save/Cancel Buttons */}
                                      <div className="flex gap-2 justify-end pt-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={handleCancelEdit}
                                          disabled={savingEdit}
                                        >
                                          <X className="w-3 h-3 mr-1" />
                                          Cancel
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => handleSaveAnalysis(transcript.id)}
                                          disabled={savingEdit}
                                        >
                                          <Check className="w-3 h-3 mr-1" />
                                          {savingEdit ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    /* View Mode */
                                    <>
                                      {transcript.ai_summary && (
                                        <div>
                                          <p className="text-sm font-medium text-grey-700 mb-1">📝 AI Summary:</p>
                                          <p className="text-sm text-grey-600">{transcript.ai_summary}</p>
                                        </div>
                                      )}

                                      {transcript.key_quotes && transcript.key_quotes.length > 0 && (
                                        <div>
                                          <p className="text-sm font-medium text-grey-700 mb-2">💬 Key Quotes ({transcript.key_quotes.length}):</p>
                                          <div className="space-y-2">
                                            {transcript.key_quotes.map((quote, idx) => (
                                              <div key={idx} className="border-l-2 border-blue-400 pl-3 py-1">
                                                <p className="text-sm text-grey-700 italic">"{quote}"</p>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add New Transcript */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mic className="w-5 h-5" />
                  <span>Add New Transcript</span>
                </CardTitle>
                <CardDescription>
                  Create a new transcript for {storyteller?.display_name || 'this storyteller'}
                </CardDescription>
              </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTranscript} className="space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="transcript-title">Title *</Label>
                  <Input
                    id="transcript-title"
                    value={transcriptData.title}
                    onChange={(e) => handleTranscriptChange('title', e.target.value)}
                    placeholder="e.g., Traditional Stories from the Elders"
                    required
                  />
                </div>

                {/* Content */}
                <div>
                  <Label htmlFor="transcript-content">Transcript Content *</Label>
                  <Textarea
                    id="transcript-content"
                    value={transcriptData.content}
                    onChange={(e) => handleTranscriptChange('content', e.target.value)}
                    placeholder="Enter the full transcript text here..."
                    rows={12}
                    required
                    className="min-h-[300px]"
                  />
                  <p className="text-xs text-grey-500 mt-1">
                    Word count: {transcriptData.content.split(/\s+/).filter(word => word.length > 0).length}
                  </p>
                </div>

                {/* Audio Upload Section */}
                <div>
                  <Label>Audio File</Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={audioUploading}
                      >
                        <FileAudio className="w-4 h-4 mr-2" />
                        {audioFile ? 'Change Audio File' : 'Select Audio File'}
                      </Button>
                      {audioFile && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeAudioFile}
                          disabled={audioUploading}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/webm"
                      onChange={handleAudioFileSelect}
                      className="hidden"
                    />

                    {audioFile && (
                      <div className="text-sm text-grey-600 bg-grey-50 p-2 rounded">
                        <div className="flex items-center gap-2">
                          <FileAudio className="w-4 h-4" />
                          <span>{audioFile.name}</span>
                          <span className="text-grey-400">
                            ({(audioFile.size / (1024 * 1024)).toFixed(1)} MB)
                          </span>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-grey-500">
                      Supports MP3, WAV, OGG, WEBM files up to 500MB
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Source URL */}
                  <div>
                    <Label htmlFor="transcript-url">Source Video URL</Label>
                    <Input
                      id="transcript-url"
                      type="url"
                      value={transcriptData.source_video_url}
                      onChange={(e) => handleTranscriptChange('source_video_url', e.target.value)}
                      placeholder="https://example.com/video.mp4"
                    />
                  </div>

                  {/* Language */}
                  <div>
                    <Label htmlFor="transcript-language">Language</Label>
                    <Select value={transcriptData.language} onValueChange={(value) => handleTranscriptChange('language', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <Label htmlFor="transcript-status">Status</Label>
                  <Select value={transcriptData.status} onValueChange={(value) => handleTranscriptChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit Button */}
                <div className="flex items-center space-x-4 pt-4">
                  <Button type="submit" disabled={creatingTranscript || audioUploading}>
                    <Plus className="w-4 h-4 mr-2" />
                    {audioUploading ? 'Uploading Audio...' : creatingTranscript ? 'Creating...' : 'Create Transcript'}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/admin/transcripts">
                      View All Transcripts
                    </Link>
                  </Button>
                </div>
              </form>
            </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Connections Tab */}
        <TabsContent value="connections">
          {storyteller && (
            <ConnectionManager
              storytellerId={storyteller.id}
              storytellerName={storyteller.display_name || storyteller.full_name || 'Unknown'}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}