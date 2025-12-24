'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  FileText,
  Clock,
  User,
  Calendar,
  Search,
  Filter,
  Play,
  Download,
  Trash2,
  Edit,
  Eye,
  MoreHorizontal,
  Brain,
  BookOpen,
  Tag,
  Video,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TranscriptCreationDialog } from '@/components/transcripts/TranscriptCreationDialog'

interface TranscriptData {
  id: string
  title: string
  storyteller: {
    id: string
    name: string
    avatarUrl?: string
  }
  wordCount: number
  characterCount: number
  status: 'pending' | 'reviewed' | 'approved' | 'published'
  hasVideo: boolean
  videoUrl?: string
  videoPlatform?: string
  createdAt: string
  updatedAt: string
  project?: {
    id: string
    name: string
  }
  analysis?: {
    themes: string[]
    emotionalTone: string
    suggestedTitle: string
    suggestedSummary: string
    analyzedAt: string
  }
  isAnalyzed?: boolean
  hasGeneratedStory?: boolean
}

interface TranscriptsData {
  transcripts: TranscriptData[]
  stats: {
    total: number
    pending: number
    reviewed: number
    approved: number
    published: number
    withVideo: number
  }
  organisation: {
    id: string
    name: string
  }
}

export default function OrganizationTranscripts() {
  const params = useParams()
  const router = useRouter()
  const organizationId = params?.id as string
  
  const [data, setData] = useState<TranscriptsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [videoModal, setVideoModal] = useState<{ isOpen: boolean; transcript?: TranscriptData }>({ isOpen: false })
  const [availableProjects, setAvailableProjects] = useState<Array<{ id: string; name: string }>>([])
  const [projectAssignments, setProjectAssignments] = useState<{ [transcriptId: string]: string }>({})
  const [loadingAssignments, setLoadingAssignments] = useState<{ [transcriptId: string]: boolean }>({})
  const [showAddTranscriptDialog, setShowAddTranscriptDialog] = useState(false)

  useEffect(() => {
    const fetchTranscripts = async () => {
      if (!organizationId) return
      
      try {
        setIsLoading(true)
        const response = await fetch(`/api/organisations/${organizationId}/transcripts`)
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch transcripts')
        }
        
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transcripts')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTranscripts()
  }, [organizationId])

  useEffect(() => {
    const fetchProjects = async () => {
      if (!organizationId) return

      try {
        const response = await fetch(`/api/organisations/${organizationId}/projects`)
        if (response.ok) {
          const projects = await response.json()
          setAvailableProjects(projects)
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      }
    }

    fetchProjects()
  }, [organizationId])

  const formatWordCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'reviewed': return 'bg-sage-100 text-sage-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'published': return 'bg-clay-100 text-clay-800'
      default: return 'bg-stone-100 text-stone-800'
    }
  }

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const getDisplayTitle = (transcript: TranscriptData): string => {
    // If we have AI-suggested title, use it
    if (transcript.analysis?.suggestedTitle && transcript.analysis.suggestedTitle.trim()) {
      return transcript.analysis.suggestedTitle
    }

    // If title is generic or empty, create a better one
    const title = transcript.title?.trim() || ''
    const storytellerName = transcript.storyteller.name?.trim() || ''

    // Check if title is generic
    const isGenericTitle = !title ||
      title.toLowerCase() === 'untitled transcript' ||
      title.toLowerCase() === 'transcript' ||
      title === storytellerName.split(' ')[0] || // Just first name
      title === storytellerName || // Just full name
      title.toLowerCase().includes('untitled')

    if (isGenericTitle) {
      // Create a descriptive title based on storyteller and context
      const projectSuffix = transcript.project ? ` - ${transcript.project.name}` : ''
      const dateSuffix = ` (${formatDate(transcript.createdAt)})`
      return `${storytellerName} Interview${projectSuffix}${dateSuffix}`
    }

    // Return the original title if it seems reasonable
    return title
  }

  const getSuggestedTitlePreview = (transcript: TranscriptData): string | null => {
    // Show AI suggestion as a preview if it's different from current display
    if (transcript.analysis?.suggestedTitle) {
      const current = getDisplayTitle(transcript)
      const suggested = transcript.analysis.suggestedTitle
      if (suggested !== current && suggested.trim()) {
        return suggested
      }
    }
    return null
  }

  const filteredTranscripts = data?.transcripts.filter(transcript => {
    const displayTitle = getDisplayTitle(transcript)
    const matchesSearch = displayTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transcript.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transcript.storyteller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transcript.analysis?.suggestedTitle?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    const matchesStatus = statusFilter === 'all' || transcript.status === statusFilter
    const matchesProject = projectFilter === 'all' ||
      (projectFilter === 'no-project' && !transcript.project) ||
      transcript.project?.id === projectFilter
    return matchesSearch && matchesStatus && matchesProject
  }) || []

  // Get unique projects for filter (from existing transcript projects)
  const transcriptProjects = data?.transcripts.reduce((projects, transcript) => {
    if (transcript.project && !projects.find(p => p.id === transcript.project!.id)) {
      projects.push(transcript.project)
    }
    return projects
  }, [] as Array<{ id: string; name: string }>) || []

  // Action handlers
  const handleViewTranscript = (transcriptId: string) => {
    router.push(`/transcripts/${transcriptId}`)
  }

  const handleEditTranscript = (transcriptId: string) => {
    router.push(`/admin/transcripts/${transcriptId}/edit`)
  }

  const handleWatchVideo = (transcript: TranscriptData) => {
    if (transcript.videoUrl) {
      window.open(transcript.videoUrl, '_blank')
    } else if (transcript.videoPlatform) {
      // Handle platform-specific video viewing
      console.log(`Opening video from ${transcript.videoPlatform}`)
      alert(`Video will be opened from ${transcript.videoPlatform}`)
    }
  }

  const handleExportTranscript = async (transcriptId: string, title: string) => {
    try {
      const response = await fetch(`/api/transcripts/${transcriptId}/export`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        throw new Error('Failed to export transcript')
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export transcript. Please try again.')
    }
  }

  const handleRemoveTranscript = async (transcriptId: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/transcripts/${transcriptId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Refresh the data
        setData(prev => prev ? {
          ...prev,
          transcripts: prev.transcripts.filter(t => t.id !== transcriptId),
          stats: {
            ...prev.stats,
            total: prev.stats.total - 1
          }
        } : null)
        alert('Transcript removed successfully')
      } else {
        throw new Error('Failed to remove transcript')
      }
    } catch (error) {
      console.error('Remove failed:', error)
      alert('Failed to remove transcript. Please try again.')
    }
  }

  const handleAnalyzeTranscript = async (transcriptId: string, title: string) => {
    if (!confirm(`Analyze "${title}" using AI to extract themes and insights?`)) {
      return
    }

    try {
      // Get auth token
      const authToken = localStorage.getItem('authToken') || ''

      const response = await fetch('/api/ai/analyse-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          transcriptId,
          generateStory: false,
          includeThemes: true,
          targetAudience: 'all',
          storyType: 'personal'
        })
      })

      const result = await response.json()

      if (response.ok) {
        alert('Transcript analysed successfully! Themes and insights have been extracted.')
        // Refresh the data to show analysis results
        window.location.reload()
      } else {
        throw new Error(result.error || 'Failed to analyse transcript')
      }
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Failed to analyse transcript. Please try again.')
    }
  }

  const handleGenerateBetterTitles = async () => {
    const transcriptsNeedingTitles = data?.transcripts.filter(t => {
      const title = t.title?.trim() || ''
      return !title ||
        title.toLowerCase() === 'untitled transcript' ||
        title.toLowerCase() === 'transcript' ||
        title === t.storyteller.name.split(' ')[0] ||
        title === t.storyteller.name ||
        title.toLowerCase().includes('untitled')
    }) || []

    if (transcriptsNeedingTitles.length === 0) {
      alert('All transcripts already have good titles!')
      return
    }

    if (!confirm(`Generate better titles for ${transcriptsNeedingTitles.length} transcripts using AI?`)) {
      return
    }

    try {
      for (const transcript of transcriptsNeedingTitles) {
        await handleAnalyzeTranscript(transcript.id, transcript.title)
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error('Bulk title generation failed:', error)
      alert('Some titles may not have been generated. Please try again.')
    }
  }

  const handleGenerateStory = async (transcriptId: string, title: string) => {
    if (!confirm(`Generate a story from "${title}" using AI?`)) {
      return
    }

    try {
      const authToken = localStorage.getItem('authToken') || ''

      const response = await fetch('/api/ai/analyse-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          transcriptId,
          generateStory: true,
          includeThemes: true,
          targetAudience: 'all',
          storyType: 'personal',
          maxLength: 3000
        })
      })

      const result = await response.json()

      if (response.ok) {
        alert('Story generated successfully and saved as draft!')
        // Refresh the data
        window.location.reload()
      } else {
        throw new Error(result.error || 'Failed to generate story')
      }
    } catch (error) {
      console.error('Story generation failed:', error)
      alert('Failed to generate story. Please try again.')
    }
  }

  const handleViewVideo = (transcript: TranscriptData) => {
    if (transcript.videoUrl) {
      setVideoModal({ isOpen: true, transcript })
    } else {
      alert('Video URL not available')
    }
  }

  const handleAssignProject = async (transcriptId: string, projectId: string | null) => {
    setLoadingAssignments(prev => ({ ...prev, [transcriptId]: true }))

    try {
      const response = await fetch(`/api/transcripts/${transcriptId}/assign-project`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: projectId === 'none' ? null : projectId
        })
      })

      if (response.ok) {
        // Update the local data
        setData(prev => prev ? {
          ...prev,
          transcripts: prev.transcripts.map(t =>
            t.id === transcriptId
              ? {
                  ...t,
                  project: projectId && projectId !== 'none'
                    ? availableProjects.find(p => p.id === projectId) || null
                    : null
                }
              : t
          )
        } : null)

        // Update project assignments state
        setProjectAssignments(prev => ({ ...prev, [transcriptId]: projectId || 'none' }))
      } else {
        throw new Error('Failed to assign project')
      }
    } catch (error) {
      console.error('Project assignment failed:', error)
      alert('Failed to assign project. Please try again.')
    } finally {
      setLoadingAssignments(prev => ({ ...prev, [transcriptId]: false }))
    }
  }

  const handleTranscriptCreated = async (transcriptId: string) => {
    setShowAddTranscriptDialog(false)
    // Refresh the transcripts list
    const response = await fetch(`/api/organisations/${organizationId}/transcripts`)
    const result = await response.json()
    if (result && !result.error) {
      setData(result)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse text-muted-foreground">
          Loading transcripts...
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-destructive">
          Error: {error || 'Failed to load transcripts'}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Transcripts</h1>
            <Badge variant="secondary">{data.stats.total}</Badge>
          </div>
          <p className="text-muted-foreground">
            Review and manage all storyteller transcripts for {data.organisation.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleGenerateBetterTitles}
            className="text-sage-600 hover:text-sage-700 border-sage-200 hover:bg-sage-50"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Improve Titles
          </Button>
          <Button
            onClick={() => setShowAddTranscriptDialog(true)}
            className="bg-earth-600 hover:bg-earth-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transcript
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{data.stats.total}</div>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{data.stats.pending}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-sage-600">{data.stats.reviewed}</div>
            <p className="text-sm text-muted-foreground">Reviewed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{data.stats.approved}</div>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-clay-600">{data.stats.published}</div>
            <p className="text-sm text-muted-foreground">Published</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transcripts or storytellers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[180px]">
            <Tag className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="no-project">No Project</SelectItem>
            {transcriptProjects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Transcripts Grid */}
      <div className="grid gap-4">
        {filteredTranscripts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' 
                  ? 'No transcripts match your filters'
                  : 'No transcripts found'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTranscripts.map((transcript) => (
            <Card key={transcript.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">
                              {getDisplayTitle(transcript)}
                            </h3>
                            {getSuggestedTitlePreview(transcript) && (
                              <div className="mt-1 p-2 bg-sage-50 border border-sage-200 rounded text-sm">
                                <div className="flex items-center gap-1 text-sage-600 mb-1">
                                  <Sparkles className="h-3 w-3" />
                                  <span className="font-medium">AI Suggested Title:</span>
                                </div>
                                <div className="text-sage-700 italic">
                                  "{getSuggestedTitlePreview(transcript)}"
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {transcript.isAnalyzed && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                <Brain className="h-3 w-3 mr-1" />
                                Analyzed
                              </Badge>
                            )}
                            {transcript.hasGeneratedStory && (
                              <Badge variant="secondary" className="text-xs bg-clay-100 text-clay-700">
                                <BookOpen className="h-3 w-3 mr-1" />
                                Story
                              </Badge>
                            )}
                            <Badge className={cn("text-xs", getStatusColor(transcript.status))}>
                              {transcript.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={transcript.storyteller.avatarUrl} />
                              <AvatarFallback className="text-xs">
                                {getInitials(transcript.storyteller.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{transcript.storyteller.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {transcript.project ? (
                              <div className="flex items-center gap-1">
                                <Tag className="h-3 w-3 text-earth-600" />
                                <Badge variant="outline" className="text-xs bg-earth-50 text-earth-700 border-earth-200">
                                  {transcript.project.name}
                                </Badge>
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground">No project assigned</div>
                            )}

                            {/* Project Assignment Dropdown */}
                            <Select
                              value={projectAssignments[transcript.id] || transcript.project?.id || 'none'}
                              onValueChange={(value) => handleAssignProject(transcript.id, value)}
                              disabled={loadingAssignments[transcript.id]}
                            >
                              <SelectTrigger className="h-6 w-6 p-0 border-none bg-transparent hover:bg-muted/50">
                                <Plus className="h-3 w-3" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No Project</SelectItem>
                                {availableProjects.map((project) => (
                                  <SelectItem key={project.id} value={project.id}>
                                    {project.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* AI Analysis Summary */}
                        {transcript.analysis && (
                          <div className="mt-3 p-3 bg-sage-50 rounded-lg border border-sage-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="h-4 w-4 text-sage-600" />
                              <span className="text-sm font-medium text-sage-700">AI Analysis</span>
                            </div>
                            {transcript.analysis.suggestedSummary && (
                              <p className="text-sm text-sage-600 mb-2 line-clamp-2">
                                {transcript.analysis.suggestedSummary}
                              </p>
                            )}
                            {transcript.analysis.themes.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {transcript.analysis.themes.slice(0, 3).map((theme, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs bg-sage-100 text-sage-700">
                                    {theme}
                                  </Badge>
                                ))}
                                {transcript.analysis.themes.length > 3 && (
                                  <Badge variant="secondary" className="text-xs bg-sage-100 text-sage-700">
                                    +{transcript.analysis.themes.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{formatWordCount(transcript.wordCount)} words</span>
                      </div>
                      {transcript.hasVideo && (
                        <div className="flex items-center gap-1">
                          <Play className="h-4 w-4" />
                          <span>Video</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(transcript.createdAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 pt-2">
                      {/* Primary Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewTranscript(transcript.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {transcript.hasVideo && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewVideo(transcript)}
                            className="text-sage-600 hover:text-sage-700 border-sage-200 hover:bg-sage-50"
                          >
                            <Video className="h-4 w-4 mr-1" />
                            Watch Video
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportTranscript(transcript.id, transcript.title)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTranscript(transcript.id)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>

                      {/* AI Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {!transcript.isAnalyzed ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAnalyzeTranscript(transcript.id, getDisplayTitle(transcript))}
                            className="text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
                          >
                            <Brain className="h-4 w-4 mr-1" />
                            Analyze & Get Title
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="text-green-600 border-green-200 bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Analyzed
                          </Button>
                        )}

                        {transcript.isAnalyzed && !transcript.hasGeneratedStory ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateStory(transcript.id, transcript.title)}
                            className="text-clay-600 hover:text-clay-700 border-clay-200 hover:bg-clay-50"
                          >
                            <ArrowRight className="h-4 w-4 mr-1" />
                            Generate Story
                          </Button>
                        ) : transcript.hasGeneratedStory ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="text-clay-600 border-clay-200 bg-clay-50"
                          >
                            <BookOpen className="h-4 w-4 mr-1" />
                            Story Created
                          </Button>
                        ) : null}

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                          onClick={() => handleRemoveTranscript(transcript.id, transcript.title)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Video Modal */}
      {videoModal.isOpen && videoModal.transcript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold">{videoModal.transcript.title}</h3>
                <p className="text-sm text-muted-foreground">
                  by {videoModal.transcript.storyteller.name}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVideoModal({ isOpen: false })}
              >
                ✕
              </Button>
            </div>
            <div className="p-4">
              {videoModal.transcript.videoUrl && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  {videoModal.transcript.videoPlatform === 'youtube' ? (
                    <iframe
                      src={videoModal.transcript.videoUrl}
                      className="w-full h-full"
                      allowFullScreen
                      title={videoModal.transcript.title}
                    />
                  ) : (
                    <video
                      src={videoModal.transcript.videoUrl}
                      controls
                      className="w-full h-full"
                      title={videoModal.transcript.title}
                    />
                  )}
                </div>
              )}
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Word Count:</span> {videoModal.transcript.wordCount.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {videoModal.transcript.status}
                </div>
                {videoModal.transcript.project && (
                  <div>
                    <span className="font-medium">Project:</span> {videoModal.transcript.project.name}
                  </div>
                )}
                <div>
                  <span className="font-medium">Created:</span> {formatDate(videoModal.transcript.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Transcript Dialog */}
      {showAddTranscriptDialog && (
        <TranscriptCreationDialog
          organizationId={organizationId}
          onSuccess={handleTranscriptCreated}
          onCancel={() => setShowAddTranscriptDialog(false)}
        />
      )}
    </div>
  )
}