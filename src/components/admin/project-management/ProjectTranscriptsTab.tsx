'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Plus,
  Mic,
  Users,
  Calendar,
  Clock,
  FileText,
  Activity,
  Edit,
  Trash2
} from 'lucide-react'
import { ProjectTranscriptsTabProps } from './types'

// Create transcript form component
const CreateTranscriptForm: React.FC<{
  projectId: string
  onSubmit: (data: any) => void
}> = ({ projectId, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    storytellerId: '',
    recordingDate: '',
    duration: '',
    audioUrl: '',
    videoUrl: '',
    videoTitle: '',
    culturalSensitivity: 'standard',
    requiresElderReview: false,
    quality: 'good',
    status: 'completed'
  })
  const [storytellers, setStorytellers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch project storytellers
  useEffect(() => {
    const fetchStorytellers = async () => {
      try {
        const response = await fetch(`/api/admin/projects/${projectId}/storytellers`)
        if (response.ok) {
          const data = await response.json()
          setStorytellers(data.storytellers || [])
        }
      } catch (error) {
        console.error('Error fetching storytellers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStorytellers()
  }, [projectId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      duration: formData.duration ? parseInt(formData.duration) : null
    }
    onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="title">Transcript Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter transcript title..."
            required
          />
        </div>

        <div>
          <Label htmlFor="storyteller">Storyteller</Label>
          <Select value={formData.storytellerId} onValueChange={(value) => setFormData({ ...formData, storytellerId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select storyteller" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No specific storyteller</SelectItem>
              {storytellers.map((storyteller) => (
                <SelectItem key={storyteller.id} value={storyteller.id}>
                  <div className="flex items-center gap-2">
                    <span>{storyteller.name}</span>
                    {storyteller.isElder && <Badge variant="secondary">Elder</Badge>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="recordingDate">Recording Date</Label>
          <Input
            id="recordingDate"
            type="date"
            value={formData.recordingDate}
            onChange={(e) => setFormData({ ...formData, recordingDate: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="duration">Duration (seconds)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="Duration in seconds"
          />
        </div>

        <div>
          <Label htmlFor="quality">Quality</Label>
          <Select value={formData.quality} onValueChange={(value) => setFormData({ ...formData, quality: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="audioUrl">Audio URL (Optional)</Label>
          <Input
            id="audioUrl"
            value={formData.audioUrl}
            onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div>
          <Label htmlFor="videoUrl">Video URL (Optional)</Label>
          <Input
            id="videoUrl"
            value={formData.videoUrl}
            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </div>

      <div>
        <Label htmlFor="videoTitle">Video Title (Optional)</Label>
        <Input
          id="videoTitle"
          value={formData.videoTitle}
          onChange={(e) => setFormData({ ...formData, videoTitle: e.target.value })}
          placeholder="Title of the video recording"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="culturalSensitivity">Cultural Sensitivity</Label>
          <Select value={formData.culturalSensitivity} onValueChange={(value) => setFormData({ ...formData, culturalSensitivity: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="sensitive">Culturally Sensitive</SelectItem>
              <SelectItem value="sacred">Sacred/Restricted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="content">Transcript Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Paste or type the transcript content here..."
          rows={8}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="elderReview"
          checked={formData.requiresElderReview}
          onChange={(e) => setFormData({ ...formData, requiresElderReview: e.target.checked })}
        />
        <Label htmlFor="elderReview">Requires Elder Review</Label>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={loading || !formData.title}>
          {loading ? 'Loading...' : 'Create Transcript'}
        </Button>
      </div>
    </form>
  )
}

// Edit transcript form component
const EditTranscriptForm: React.FC<{
  transcript: any
  onSubmit: (data: any) => void
}> = ({ transcript, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: transcript.title || '',
    content: transcript.content || '',
    recordingDate: transcript.recordingDate || '',
    duration: transcript.duration ? transcript.duration.toString() : '',
    audioUrl: transcript.audioUrl || '',
    videoUrl: transcript.videoUrl || '',
    videoTitle: transcript.videoTitle || '',
    culturalSensitivity: transcript.culturalSensitivity || 'standard',
    requiresElderReview: transcript.requiresElderReview || false,
    quality: transcript.quality || 'good',
    status: transcript.status || 'completed'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      duration: formData.duration ? parseInt(formData.duration) : null
    }
    onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="edit-title">Transcript Title</Label>
        <Input
          id="edit-title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-recordingDate">Recording Date</Label>
          <Input
            id="edit-recordingDate"
            type="date"
            value={formData.recordingDate}
            onChange={(e) => setFormData({ ...formData, recordingDate: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="edit-duration">Duration (seconds)</Label>
          <Input
            id="edit-duration"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-quality">Quality</Label>
          <Select value={formData.quality} onValueChange={(value) => setFormData({ ...formData, quality: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="edit-status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-audioUrl">Audio URL</Label>
          <Input
            id="edit-audioUrl"
            value={formData.audioUrl}
            onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="edit-videoUrl">Video URL</Label>
          <Input
            id="edit-videoUrl"
            value={formData.videoUrl}
            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="edit-content">Transcript Content</Label>
        <Textarea
          id="edit-content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={8}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit">Update Transcript</Button>
      </div>
    </form>
  )
}

export const ProjectTranscriptsTab: React.FC<ProjectTranscriptsTabProps> = ({ projectId }) => {
  const [transcripts, setTranscripts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTranscript, setEditingTranscript] = useState<any>(null)
  const [stats, setStats] = useState<any>({})

  const fetchTranscripts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/projects/${projectId}/transcripts`)
      if (response.ok) {
        const data = await response.json()
        setTranscripts(data.transcripts || [])
        setStats(data.stats || {})
      } else {
        console.error('Failed to fetch transcripts')
      }
    } catch (error) {
      console.error('Error fetching transcripts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTranscripts()
  }, [projectId])

  const handleCreateTranscript = async (transcriptData: any) => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/transcripts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transcriptData)
      })

      if (response.ok) {
        await fetchTranscripts()
        setIsCreateDialogOpen(false)
        console.log('Transcript created successfully')
      } else {
        const error = await response.json()
        alert(`Failed to create transcript: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating transcript:', error)
      alert('Failed to create transcript')
    }
  }

  const handleEditTranscript = async (transcriptData: any) => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/transcripts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcriptId: editingTranscript.id, ...transcriptData })
      })

      if (response.ok) {
        await fetchTranscripts()
        setIsEditDialogOpen(false)
        setEditingTranscript(null)
        console.log('Transcript updated successfully')
      } else {
        console.error('Failed to update transcript')
      }
    } catch (error) {
      console.error('Error updating transcript:', error)
    }
  }

  const handleDeleteTranscript = async (transcriptId: string) => {
    if (!confirm('Are you sure you want to delete this transcript?')) return

    try {
      const response = await fetch(`/api/admin/projects/${projectId}/transcripts?transcriptId=${transcriptId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchTranscripts()
        console.log('Transcript deleted successfully')
      } else {
        console.error('Failed to delete transcript')
      }
    } catch (error) {
      console.error('Error deleting transcript:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-700">Processing</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return 'Unknown'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return <div className="text-center py-8">Loading transcripts...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Project Transcripts</h3>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Audio and video transcripts for storyteller interviews and recordings
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Transcript
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Transcript</DialogTitle>
              <DialogDescription>
                Create a new transcript within this project
              </DialogDescription>
            </DialogHeader>
            <CreateTranscriptForm projectId={projectId} onSubmit={handleCreateTranscript} />
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Transcript</DialogTitle>
              <DialogDescription>
                Update transcript details and content
              </DialogDescription>
            </DialogHeader>
            {editingTranscript && (
              <EditTranscriptForm transcript={editingTranscript} onSubmit={handleEditTranscript} />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Transcript Stats */}
      {stats.totalTranscripts > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalTranscripts}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Total Transcripts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.processing}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Processing</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.elderReviewed}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Elder Reviewed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{Math.floor((stats.totalDuration || 0) / 60)}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Minutes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-stone-600">{stats.totalWords?.toLocaleString()}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Total Words</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transcripts List */}
      {transcripts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Mic className="w-12 h-12 mx-auto text-stone-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No transcripts created yet</h3>
            <p className="text-stone-600 dark:text-stone-400 mb-4">
              Create transcripts from storyteller interviews, recordings, and other audio/video content.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Transcript
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {transcripts.map((transcript) => (
            <Card key={transcript.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold">{transcript.title}</h4>
                      {getStatusBadge(transcript.status)}
                      {transcript.culturalSensitivity !== 'standard' && (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          {transcript.culturalSensitivity}
                        </Badge>
                      )}
                      {transcript.elderReviewed && (
                        <Badge className="bg-green-100 text-green-700">Elder Reviewed</Badge>
                      )}
                      {transcript.requiresElderReview && !transcript.elderReviewed && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          Needs Elder Review
                        </Badge>
                      )}
                    </div>

                    {transcript.content && (
                      <p className="text-stone-600 dark:text-stone-400 mb-3 line-clamp-3">
                        {transcript.content.substring(0, 200)}...
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-stone-500">
                      {transcript.storyteller && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{transcript.storyteller.name}</span>
                          {transcript.storyteller.isElder && <Badge variant="secondary">Elder</Badge>}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{transcript.recordingDate ? new Date(transcript.recordingDate).toLocaleDateString() : new Date(transcript.createdAt).toLocaleDateString()}</span>
                      </div>
                      {transcript.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(transcript.duration)}</span>
                        </div>
                      )}
                      {transcript.wordCount && (
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{transcript.wordCount} words</span>
                        </div>
                      )}
                      {transcript.confidence && (
                        <div className="flex items-center gap-1">
                          <Activity className="w-4 h-4" />
                          <span>{Math.round(transcript.confidence * 100)}% accuracy</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {transcript.audioUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={transcript.audioUrl} target="_blank">
                          <Mic className="w-4 h-4 mr-2" />
                          Audio
                        </a>
                      </Button>
                    )}
                    {transcript.videoUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={transcript.videoUrl} target="_blank">
                          <Activity className="w-4 h-4 mr-2" />
                          Video
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingTranscript(transcript)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTranscript(transcript.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}