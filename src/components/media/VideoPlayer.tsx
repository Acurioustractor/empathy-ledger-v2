'use client'

import { VideoEmbed } from './VideoEmbed'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Video,
  FileText,
  Calendar,
  Clock,
  ExternalLink,
  User,
  Play
} from 'lucide-react'

interface VideoContent {
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
}

interface VideoPlayerProps {
  videos: VideoContent[]
  title?: string
  emptyMessage?: string
  organizationContext?: {
    id: string
    name: string
  }
}

export function VideoPlayer({ 
  videos, 
  title = "Video Content",
  emptyMessage = "No video content available",
  organizationContext 
}: VideoPlayerProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'transcript': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'story': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default: return 'bg-grey-100 text-grey-800 dark:bg-grey-900/20 dark:text-grey-400'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transcript': return FileText
      case 'story': return User
      default: return Video
    }
  }

  if (videos.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <Video className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">
              Video content from transcripts and stories
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="text-center py-12">
            <div className="p-3 bg-muted/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Video className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No video content</h3>
            <p className="text-muted-foreground">
              {emptyMessage}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <Video className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">
              {videos.length} video{videos.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Play className="h-3 w-3" />
            {videos.length}
          </Badge>
          {organizationContext && (
            <Badge variant="outline">
              {organizationContext.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid gap-6">
        {videos.map((video) => {
          const TypeIcon = getTypeIcon(video.type)
          
          return (
            <Card key={video.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${video.type === 'transcript' ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-green-100 dark:bg-green-900/20'}`}>
                      <TypeIcon className={`h-5 w-5 ${video.type === 'transcript' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{video.title}</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(video.createdAt)}
                        </div>
                        {video.videoPlatform && (
                          <div className="flex items-center gap-1">
                            <Video className="h-4 w-4" />
                            {video.videoPlatform}
                          </div>
                        )}
                        {video.status && (
                          <Badge variant="outline" className="text-xs">
                            {video.status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getTypeColor(video.type)}>
                          {video.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="px-6 pb-6">
                  <VideoEmbed
                    videoUrl={video.videoUrl}
                    videoPlatform={video.videoPlatform}
                    videoEmbedCode={video.videoEmbedCode}
                    videoThumbnail={video.videoThumbnail}
                    title={video.title}
                    showControls={true}
                    muted={true}
                    onError={(error) => {
                      console.error(`Video error for ${video.id}:`, error)
                    }}
                    onLoad={() => {
                      console.log(`Video loaded for ${video.id}`)
                    }}
                  />
                </div>

                {/* Video Metadata */}
                {video.metadata && Object.keys(video.metadata).length > 0 && (
                  <div className="px-6 pb-6">
                    <Separator className="mb-4" />
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Video Details
                      </summary>
                      <div className="mt-3 p-3 bg-muted/30 rounded text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          {video.videoPlatform && (
                            <div>
                              <span className="font-medium">Platform:</span>
                              <span className="ml-1 capitalize">{video.videoPlatform}</span>
                            </div>
                          )}
                          {video.videoUrl && (
                            <div>
                              <span className="font-medium">Source:</span>
                              <Button
                                variant="link"
                                size="sm"
                                asChild
                                className="h-auto p-0 ml-1 text-xs"
                              >
                                <a href={video.videoUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  External Link
                                </a>
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        {Object.keys(video.metadata).length > 0 && (
                          <div className="mt-3 pt-3 border-t border-muted-foreground/20">
                            <pre className="whitespace-pre-wrap text-muted-foreground text-xs overflow-x-auto">
                              {JSON.stringify(video.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}