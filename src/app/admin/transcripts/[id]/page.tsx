'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Edit, Download, Trash2, FileText, Clock, User, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Transcript {
  id: string
  title: string
  transcript_content: string
  status: string
  word_count: number
  character_count: number
  duration_seconds: number
  created_at: string
  updated_at: string
  storyteller_id: string
  tenant_id: string
  profiles?: {
    full_name: string
    display_name: string
  }
}

export default function AdminTranscriptViewPage() {
  const router = useRouter()
  const params = useParams()
  const transcriptId = params.id as string

  const [transcript, setTranscript] = useState<Transcript | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        setTranscript(data.transcript)
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

  const handleEdit = () => {
    router.push(`/admin/transcripts/${transcriptId}/edit`)
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/transcripts/${transcriptId}/export`)
      if (!response.ok) throw new Error('Failed to download transcript')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `transcript-${transcriptId}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading transcript:', error)
      alert('Failed to download transcript. Please try again.')
    }
  }

  const handleDelete = async () => {
    if (!transcript) return

    if (!confirm(`Are you sure you want to delete the transcript "${transcript.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/transcripts/${transcriptId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete transcript')

      alert('Transcript deleted successfully.')
      router.push('/admin/transcripts')
    } catch (error) {
      console.error('Error deleting transcript:', error)
      alert('Failed to delete transcript. Please try again.')
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'pending_review': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-grey-100 text-grey-800'
    }
  }

  const formatStatus = (status: string) => {
    if (!status) return 'Unknown'
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

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

  if (error || !transcript) {
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
            {error || 'Transcript not found'}
          </div>
        </div>
      </div>
    )
  }

  const storytellerName = transcript.profiles?.display_name || transcript.profiles?.full_name || 'Unknown Storyteller'

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
            <h1 className="text-3xl font-bold text-grey-900">{transcript.title}</h1>
            <p className="text-grey-600">Transcript Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Transcript Info */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(transcript.status)}>
              {formatStatus(transcript.status)}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {formatDuration(transcript.duration_seconds || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Word Count</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(transcript.word_count || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Storyteller Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Storyteller Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>
                {storytellerName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-lg font-medium">{storytellerName}</div>
              <div className="text-sm text-grey-500">ID: {transcript.storyteller_id}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transcript Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transcript Content</CardTitle>
              <CardDescription>
                Created {formatDate(transcript.created_at)}
                {transcript.updated_at !== transcript.created_at && (
                  <> • Last updated {formatDate(transcript.updated_at)}</>
                )}
              </CardDescription>
            </div>
            <div className="text-sm text-grey-500">
              {transcript.character_count || 0} characters
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap bg-grey-50 p-4 rounded-lg border text-sm leading-relaxed">
              {transcript.transcript_content || 'No content available'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}