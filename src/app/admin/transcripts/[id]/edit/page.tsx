'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, X, FileText, Clock, User, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Transcript {
  id: string
  title: string
  transcript_content: string
  status: string
  word_count: number
  character_count: number
  duration_seconds: number
  source_video_url: string
  audio_url: string
  language: string
  created_at: string
  updated_at: string
  storyteller_id: string
  tenant_id: string
  profiles?: {
    full_name: string
    display_name: string
  }
}

export default function AdminTranscriptEditPage() {
  const router = useRouter()
  const params = useParams()
  const transcriptId = params.id as string

  const [transcript, setTranscript] = useState<Transcript | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    transcript_content: '',
    status: 'completed',
    source_video_url: '',
    audio_url: '',
    language: 'en'
  })

  useEffect(() => {
    fetchTranscript()
  }, [transcriptId])

  const fetchTranscript = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/transcripts/${transcriptId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch transcript')
      }

      const data = await response.json()
      if (data.success) {
        const t = data.transcript
        setTranscript(t)
        setFormData({
          title: t.title || '',
          transcript_content: t.transcript_content || '',
          status: t.status || 'completed',
          source_video_url: t.source_video_url || '',
          audio_url: t.audio_url || '',
          language: t.language || 'en'
        })
      } else {
        throw new Error(data.error || 'Failed to load transcript')
      }
    } catch (err) {
      console.error('Error fetching transcript:', err)
      setError(err instanceof Error ? err.message : 'Failed to load transcript')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.transcript_content.trim()) {
      setError('Title and transcript content are required')
      return
    }

    try {
      setSaving(true)
      setError(null)

      // Calculate word count
      const wordCount = formData.transcript_content.split(/\s+/).filter(word => word.length > 0).length
      const characterCount = formData.transcript_content.length

      const response = await fetch(`/api/transcripts/${transcriptId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          word_count: wordCount,
          character_count: characterCount
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update transcript')
      }

      // Redirect back to transcript view
      router.push(`/admin/transcripts/${transcriptId}`)
    } catch (err) {
      console.error('Error updating transcript:', err)
      setError('Failed to update transcript. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const wordCount = formData.transcript_content.split(/\s+/).filter(word => word.length > 0).length
  const characterCount = formData.transcript_content.length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="text-lg">Loading transcript...</div>
        </div>
      </div>
    )
  }

  if (error && !transcript) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="text-lg text-red-600">
            {error}
          </div>
        </div>
      </div>
    )
  }

  const storytellerName = transcript?.profiles?.display_name || transcript?.profiles?.full_name || 'Unknown Storyteller'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Edit Transcript</h1>
            <p className="text-stone-600">
              Update transcript content and details
              {transcript?.storyteller_id && (
                <>
                  {' · '}
                  <a
                    href={`/admin/storytellers/${transcript.storyteller_id}/edit`}
                    className="text-sage-600 hover:underline"
                  >
                    View {transcript?.profiles?.display_name || transcript?.profiles?.full_name || 'Storyteller'}'s Profile
                  </a>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <X className="w-4 h-4 mr-2" />
            Cancel
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

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update the transcript title and content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter transcript title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">Transcript Content *</Label>
                <Textarea
                  id="content"
                  value={formData.transcript_content}
                  onChange={(e) => handleInputChange('transcript_content', e.target.value)}
                  placeholder="Enter the full transcript text here..."
                  rows={20}
                  required
                  className="min-h-[500px] font-mono text-sm"
                />
                <div className="flex justify-between text-xs text-stone-500 mt-1">
                  <span>Words: {wordCount.toLocaleString()}</span>
                  <span>Characters: {characterCount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
              <CardDescription>
                Optional information about the transcript
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="source_url">Source Video URL</Label>
                <Input
                  id="source_url"
                  type="url"
                  value={formData.source_video_url}
                  onChange={(e) => handleInputChange('source_video_url', e.target.value)}
                  placeholder="https://example.com/video.mp4"
                />
              </div>

              <div>
                <Label htmlFor="audio_url">Audio URL</Label>
                <Input
                  id="audio_url"
                  type="url"
                  value={formData.audio_url}
                  onChange={(e) => handleInputChange('audio_url', e.target.value)}
                  placeholder="https://example.com/audio.mp3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
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

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Storyteller Info */}
          {transcript && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Storyteller
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>
                      {storytellerName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{storytellerName}</div>
                    <div className="text-sm text-stone-500">ID: {transcript.storyteller_id}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Stats */}
          {transcript && (
            <Card>
              <CardHeader>
                <CardTitle>Current Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-stone-600">Status</span>
                  <Badge variant={transcript.status === 'completed' ? 'default' : 'secondary'}>
                    {transcript.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-stone-600">Duration</span>
                  <span className="text-sm font-mono">
                    {formatDuration(transcript.duration_seconds || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-stone-600">Original Words</span>
                  <span className="text-sm">{(transcript.word_count || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-stone-600">Created</span>
                  <span className="text-sm">
                    {new Date(transcript.created_at).toLocaleDateString()}
                  </span>
                </div>
                {transcript.updated_at !== transcript.created_at && (
                  <div className="flex justify-between">
                    <span className="text-sm text-stone-600">Last Updated</span>
                    <span className="text-sm">
                      {new Date(transcript.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}