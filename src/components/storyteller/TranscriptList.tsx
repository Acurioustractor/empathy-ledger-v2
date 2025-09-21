'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TranscriptCard } from './TranscriptCard'
import { 
  Search,
  Filter,
  SortAsc,
  FileText,
  Video,
  Clock,
  Calendar
} from 'lucide-react'

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
  metadata?: any
}

interface TranscriptListProps {
  transcripts: DetailedTranscript[]
  title?: string
  showSearch?: boolean
  showFilters?: boolean
  onCreateStory?: (transcriptId: string) => void
  onEdit?: (transcriptId: string) => void
  onDelete?: (transcriptId: string) => void
  organizationContext?: {
    id: string
    name: string
  }
  emptyMessage?: string
}

type SortOption = 'newest' | 'oldest' | 'wordCount' | 'title'
type FilterOption = 'all' | 'completed' | 'processing' | 'pending' | 'withVideo' | 'withoutVideo'

export function TranscriptList({
  transcripts,
  title = "Transcripts",
  showSearch = true,
  showFilters = true,
  onCreateStory,
  onEdit,
  onDelete,
  organizationContext,
  emptyMessage = "No transcripts found"
}: TranscriptListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')

  const filteredAndSortedTranscripts = useMemo(() => {
    let filtered = transcripts

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(transcript => 
        transcript.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transcript.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status/type filter
    switch (filterBy) {
      case 'completed':
        filtered = filtered.filter(t => t.status === 'completed')
        break
      case 'processing':
        filtered = filtered.filter(t => t.status === 'processing')
        break
      case 'pending':
        filtered = filtered.filter(t => t.status === 'pending')
        break
      case 'withVideo':
        filtered = filtered.filter(t => t.hasVideo)
        break
      case 'withoutVideo':
        filtered = filtered.filter(t => !t.hasVideo)
        break
      // 'all' shows everything
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'wordCount':
          return b.wordCount - a.wordCount
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    return sorted
  }, [transcripts, searchTerm, sortBy, filterBy])

  const stats = useMemo(() => {
    const total = transcripts.length
    const completed = transcripts.filter(t => t.status === 'completed').length
    const withVideo = transcripts.filter(t => t.hasVideo).length
    const totalWords = transcripts.reduce((sum, t) => sum + t.wordCount, 0)
    
    return {
      total,
      completed,
      withVideo,
      totalWords
    }
  }, [transcripts])

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">
              {stats.total} transcripts • {stats.completed} completed • {stats.totalWords.toLocaleString()} total words
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <FileText className="h-3 w-3" />
            {stats.total}
          </Badge>
          {stats.withVideo > 0 && (
            <Badge variant="outline" className="gap-1">
              <Video className="h-3 w-3" />
              {stats.withVideo}
            </Badge>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {showSearch && (
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transcripts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}
              
              {showFilters && (
                <div className="flex gap-2">
                  <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterOption)}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="withVideo">With Video</SelectItem>
                      <SelectItem value="withoutVideo">Text Only</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <SelectTrigger className="w-40">
                      <SortAsc className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="wordCount">Word Count</SelectItem>
                      <SelectItem value="title">Title A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Bar */}
      {filteredAndSortedTranscripts.length > 0 && filteredAndSortedTranscripts.length !== transcripts.length && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing {filteredAndSortedTranscripts.length} of {transcripts.length} transcripts
          </span>
          {searchTerm && (
            <Badge variant="secondary" className="text-xs">
              "{searchTerm}"
            </Badge>
          )}
          {filterBy !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              {filterBy.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </Badge>
          )}
        </div>
      )}

      {/* Transcripts List */}
      <div className="space-y-4">
        {filteredAndSortedTranscripts.length > 0 ? (
          filteredAndSortedTranscripts.map((transcript) => (
            <TranscriptCard
              key={transcript.id}
              transcript={transcript}
              onCreateStory={onCreateStory}
              onEdit={onEdit}
              onDelete={onDelete}
              organizationContext={organizationContext}
            />
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="p-3 bg-muted/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {searchTerm || filterBy !== 'all' ? 'No matching transcripts' : emptyMessage}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterBy !== 'all' 
                  ? 'Try adjusting your search terms or filters'
                  : 'Transcripts will appear here once they are created'
                }
              </p>
              {(searchTerm || filterBy !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('')
                    setFilterBy('all')
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Load More (placeholder for pagination) */}
      {filteredAndSortedTranscripts.length > 0 && filteredAndSortedTranscripts.length >= 10 && (
        <div className="text-center">
          <Button variant="outline">
            Load More Transcripts
          </Button>
        </div>
      )}
    </div>
  )
}