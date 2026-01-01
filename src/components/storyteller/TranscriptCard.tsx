'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  FileText,
  Play,
  Clock,
  Eye,
  EyeOff,
  Calendar,
  User,
  Video,
  ExternalLink,
  Sparkles,
  BookOpen,
  Trash2,
  MoreVertical,
  Edit
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { TranscriptToStory } from './TranscriptToStory'

interface TranscriptCardProps {
  transcript: {
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
    metadata?: any
  }
  showContent?: boolean
  onCreateStory?: (transcriptId: string) => void
  onEdit?: (transcriptId: string) => void
  onDelete?: (transcriptId: string) => void
  organizationContext?: {
    id: string
    name: string
  }
}

export function TranscriptCard({
  transcript,
  showContent = false,
  onCreateStory,
  onEdit,
  onDelete,
  organizationContext
}: TranscriptCardProps) {
  const [expanded, setExpanded] = useState(showContent)
  const [showAIDialog, setShowAIDialog] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatWordCount = (count: number) => {
    if (count > 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-grey-100 text-grey-800 dark:bg-grey-900/20 dark:text-grey-400'
    }
  }

  const truncateContent = (content: string, maxLength: number = 300) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const handleStoryCreated = (storyId: string) => {
    setShowAIDialog(false)
    // Navigate to the created story
    window.location.href = `/stories/${storyId}/edit`
  }

  return (
    <>
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold line-clamp-2">
                {transcript.title}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(transcript.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {formatWordCount(transcript.wordCount)} words
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  ~{Math.ceil(transcript.wordCount / 200)} min read
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(transcript.status)}>
              {transcript.status}
            </Badge>
            {transcript.hasVideo && (
              <Badge variant="secondary" className="gap-1">
                <Video className="h-3 w-3" />
                {transcript.videoPlatform || 'Video'}
              </Badge>
            )}
          </div>
          
          {/* Actions dropdown */}
          {(onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(transcript.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Transcript
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(transcript.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {organizationContext && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {organizationContext.name}
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Video Section */}
        {transcript.hasVideo && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Video Content</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
              {transcript.videoThumbnail && (
                <img 
                  src={transcript.videoThumbnail} 
                  alt="Video thumbnail"
                  className="w-12 h-12 rounded object-cover"
                />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {transcript.videoPlatform === 'descript' ? 'Descript Video' : 'Video Content'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Source material for this transcript
                </p>
              </div>
              {transcript.videoUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={transcript.videoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Content Preview/Full */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">Transcript Content</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setExpanded(!expanded)}
              className="gap-1"
            >
              {expanded ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Show
                </>
              )}
            </Button>
          </div>
          
          <div className="prose prose-sm max-w-none">
            <div className="p-4 bg-muted/50 rounded-lg text-sm leading-relaxed">
              {expanded ? (
                <div className="max-h-96 overflow-y-auto">
                  {transcript.content.split('\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index} className="mb-3 last:mb-0">
                        {paragraph}
                      </p>
                    )
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {truncateContent(transcript.content)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{transcript.wordCount.toLocaleString()} words</span>
            <span>{transcript.characterCount.toLocaleString()} characters</span>
          </div>
          
          {(transcript.status === 'completed' || transcript.status === 'pending') && (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => setShowAIDialog(true)}
                className="gap-1 bg-purple-600 hover:bg-purple-700"
              >
                <Sparkles className="h-4 w-4" />
                AI Generate
              </Button>
              {onCreateStory && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onCreateStory(transcript.id)}
                  className="gap-1"
                >
                  <BookOpen className="h-4 w-4" />
                  Manual Story
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Metadata */}
        {transcript.metadata && Object.keys(transcript.metadata).length > 0 && (
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
              Technical Details
            </summary>
            <div className="mt-2 p-3 bg-muted/30 rounded text-xs">
              <pre className="whitespace-pre-wrap text-muted-foreground">
                {JSON.stringify(transcript.metadata, null, 2)}
              </pre>
            </div>
          </details>
        )}
      </CardContent>
    </Card>

    {/* AI Story Generation Dialog */}
    <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Story Generation</DialogTitle>
        </DialogHeader>
        <TranscriptToStory
          transcript={transcript}
          onStoryCreated={handleStoryCreated}
          onCancel={() => setShowAIDialog(false)}
        />
      </DialogContent>
    </Dialog>
    </>
  )
}