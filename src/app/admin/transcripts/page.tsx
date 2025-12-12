'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Download, Eye, Edit, MoreHorizontal, Mic, Clock, FileText, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Transcript {
  id: string
  title: string
  storyteller_name: string
  storyteller_id: string | null
  status: 'processing' | 'completed' | 'failed' | 'pending_review' | 'pending'
  duration: number // in seconds
  file_size: number // in bytes
  word_count: number // number of words in transcript
  language: string
  location: string | null
  created_at: string
  updated_at: string
  has_story: boolean
  project_name?: string
  organization_name?: string
}

export default function AdminTranscriptsPage() {
  const router = useRouter()
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [languageFilter, setLanguageFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchTranscripts = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: searchTerm,
        status: statusFilter === 'all' ? '' : statusFilter,
        language: languageFilter === 'all' ? '' : languageFilter
      })

      const response = await fetch(`/api/admin/transcripts?${params}`)
      if (!response.ok) throw new Error('Failed to fetch transcripts')

      const data = await response.json()
      setTranscripts(data.transcripts || [])
      setTotalPages(Math.ceil(data.total / 20))
      setTotalCount(data.total)
    } catch (error) {
      console.error('Error fetching transcripts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTranscripts(currentPage)
  }, [currentPage, searchTerm, statusFilter, languageFilter])

  const handleExport = async () => {
    try {
      // Create CSV from current transcripts data
      const csvContent = [
        // CSV headers
        ['Title', 'Storyteller', 'Status', 'Word Count', 'Duration', 'Language', 'Created'].join(','),
        // CSV data rows
        ...transcripts.map(t => [
          `"${t.title}"`,
          `"${t.storyteller_name}"`,
          t.status,
          t.word_count || 0,
          t.duration || 0,
          t.language || 'en',
          new Date(t.created_at).toLocaleDateString()
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `transcripts-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting transcripts:', error)
      alert('Failed to export transcripts. Please try again.')
    }
  }

  const handleUploadAudio = () => {
    router.push('/transcripts/create')
  }

  const handleViewTranscript = (transcriptId: string) => {
    router.push(`/admin/transcripts/${transcriptId}`)
  }

  const handleEditTranscript = (transcriptId: string) => {
    router.push(`/admin/transcripts/${transcriptId}/edit`)
  }

  const handleCreateStory = (transcriptId: string) => {
    router.push(`/stories/create?transcript_id=${transcriptId}`)
  }

  const handleDownloadAudio = async (transcriptId: string) => {
    try {
      const response = await fetch(`/api/transcripts/${transcriptId}/download/audio`)
      if (!response.ok) throw new Error('Failed to download audio')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `transcript-${transcriptId}-audio.mp3`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading audio:', error)
      alert('Failed to download audio. Please try again.')
    }
  }

  const handleDownloadText = async (transcriptId: string) => {
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
      alert('Failed to download transcript text. Please try again.')
    }
  }

  const handleDeleteTranscript = async (transcriptId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the transcript "${title}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/transcripts/${transcriptId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete transcript')

      // Refresh the transcripts list
      fetchTranscripts(currentPage)
      alert('Transcript deleted successfully.')
    } catch (error) {
      console.error('Error deleting transcript:', error)
      alert('Failed to delete transcript. Please try again.')
    }
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

  const formatWordCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatStatus = (status: string) => {
    if (!status) return 'Unknown'
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  // Calculate stats from current transcripts
  const completedTranscripts = transcripts.filter(t => t.status === 'completed').length
  const processingTranscripts = transcripts.filter(t => t.status === 'processing').length
  const totalDuration = transcripts.reduce((sum, t) => sum + t.duration, 0)
  const totalWords = transcripts.reduce((sum, t) => sum + t.word_count, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-grey-900">Transcripts</h1>
          <p className="text-grey-600">
            Manage audio transcriptions, review accuracy, and track processing status
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleUploadAudio}>
            <Mic className="w-4 h-4 mr-2" />
            Upload Audio
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transcripts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Audio recordings processed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTranscripts}</div>
            <p className="text-xs text-muted-foreground">
              Ready for review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(totalDuration)}</div>
            <p className="text-xs text-muted-foreground">
              Hours of audio
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Words</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatWordCount(totalWords)}</div>
            <p className="text-xs text-muted-foreground">
              Words transcribed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-grey-400" />
                <Input
                  placeholder="Search transcripts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setLanguageFilter('all')
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Transcripts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transcripts ({totalCount})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transcript</TableHead>
                  <TableHead>Storyteller</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Words</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading transcripts...
                    </TableCell>
                  </TableRow>
                ) : transcripts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No transcripts found
                    </TableCell>
                  </TableRow>
                ) : (
                  transcripts.map((transcript) => (
                    <TableRow key={transcript.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transcript.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-grey-500">
                              {formatFileSize(transcript.file_size)}
                            </span>
                            {transcript.has_story && (
                              <Badge variant="outline" className="text-xs">
                                Story Created
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={`/placeholder-avatar.jpg`} />
                            <AvatarFallback className="text-xs">
                              {transcript.storyteller_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="text-sm font-medium">
                              {transcript.storyteller_name}
                            </span>
                            {transcript.organization_name && (
                              <div className="text-xs text-grey-500">
                                {transcript.organization_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transcript.status)}>
                          {formatStatus(transcript.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">
                          {formatDuration(transcript.duration)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">
                          {formatWordCount(transcript.word_count)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {transcript.location ? (
                          <span className="text-sm">
                            {transcript.location}
                          </span>
                        ) : (
                          <span className="text-sm text-grey-400">
                            Not specified
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatDate(transcript.created_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewTranscript(transcript.id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Transcript
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditTranscript(transcript.id)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Text
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {!transcript.has_story && (
                              <DropdownMenuItem onClick={() => handleCreateStory(transcript.id)}>
                                Create Story
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDownloadAudio(transcript.id)}>
                              Download Audio
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadText(transcript.id)}>
                              Download Text
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteTranscript(transcript.id, transcript.title)}
                            >
                              Delete Transcript
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-grey-600">
                Showing {(currentPage - 1) * 20 + 1} to {Math.min(currentPage * 20, totalCount)} of {totalCount} transcripts
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}