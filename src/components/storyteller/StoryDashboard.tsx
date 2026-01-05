'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Typography } from '@/components/ui/typography'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Grid3x3,
  List,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Share2,
  Eye,
  Heart,
  Clock,
  Filter,
  CheckCircle,
  XCircle,
  Archive,
  FileText,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Story {
  id: string
  title: string
  content?: string
  summary?: string
  status: 'draft' | 'published' | 'archived' | 'review'
  hasVideo: boolean
  videoEmbedCode?: string
  themes: string[]
  createdAt: string
  publishedAt?: string
  views?: number
  reactions?: number
  shares?: number
  reading_time_minutes?: number
  metadata: {
    views?: number
    reactions?: number
    shares?: number
  }
}

interface StoryDashboardProps {
  stories: Story[]
  storytellerId: string
  storytellerName: string
  storytellerAvatar?: string
  onCreateStory?: () => void
  onEditStory?: (storyId: string) => void
  onDeleteStory?: (storyId: string) => void
  onShareStory?: (storyId: string) => void
}

type ViewMode = 'grid' | 'list'
type StatusFilter = 'all' | 'draft' | 'published' | 'archived' | 'review'
type SortOption = 'newest' | 'oldest' | 'alphabetical'

export function StoryDashboard({
  stories,
  storytellerId,
  storytellerName,
  storytellerAvatar,
  onCreateStory,
  onEditStory,
  onDeleteStory,
  onShareStory,
}: StoryDashboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [selectedStories, setSelectedStories] = useState<Set<string>>(new Set())
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false)

  // Calculate stats by status - NO FAKE DATA
  const stats = useMemo(() => {
    const draft = stories.filter(s => s.status === 'draft').length
    const published = stories.filter(s => s.status === 'published').length
    const archived = stories.filter(s => s.status === 'archived').length
    const review = stories.filter(s => s.status === 'review').length

    // Don't show views/reactions since we don't track them yet
    return { draft, published, archived, review }
  }, [stories])

  // Filter and sort stories
  const filteredAndSortedStories = useMemo(() => {
    let filtered = stories

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.summary?.toLowerCase().includes(query) ||
        s.themes.some(theme => theme.toLowerCase().includes(query))
      )
    }

    // Apply sorting - REAL DATA ONLY
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'alphabetical':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    return sorted
  }, [stories, statusFilter, searchQuery, sortBy])

  const handleSelectAll = () => {
    if (selectedStories.size === filteredAndSortedStories.length) {
      setSelectedStories(new Set())
    } else {
      setSelectedStories(new Set(filteredAndSortedStories.map(s => s.id)))
    }
  }

  const handleSelectStory = (storyId: string) => {
    const newSelected = new Set(selectedStories)
    if (newSelected.has(storyId)) {
      newSelected.delete(storyId)
    } else {
      newSelected.add(storyId)
    }
    setSelectedStories(newSelected)
  }

  const handleBulkPublish = async () => {
    setIsBulkActionLoading(true)
    // TODO: Implement bulk publish API call
    console.log('Bulk publish:', Array.from(selectedStories))
    setTimeout(() => {
      setIsBulkActionLoading(false)
      setSelectedStories(new Set())
    }, 1000)
  }

  const handleBulkArchive = async () => {
    setIsBulkActionLoading(true)
    // TODO: Implement bulk archive API call
    console.log('Bulk archive:', Array.from(selectedStories))
    setTimeout(() => {
      setIsBulkActionLoading(false)
      setSelectedStories(new Set())
    }, 1000)
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedStories.size} stories? This cannot be undone.`)) {
      return
    }
    setIsBulkActionLoading(true)
    // TODO: Implement bulk delete API call
    console.log('Bulk delete:', Array.from(selectedStories))
    setTimeout(() => {
      setIsBulkActionLoading(false)
      setSelectedStories(new Set())
    }, 1000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'review':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'archived':
        return 'bg-gray-100 text-gray-600 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Total Stories</div>
            <div className="text-2xl font-bold">{stories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Published</div>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Drafts</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Archived</div>
            <div className="text-2xl font-bold text-gray-600">{stats.archived}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Total Stories</div>
            <div className="text-2xl font-bold text-blue-600">{stories.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="alphabetical">A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          {/* View Toggle */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Create Story */}
          <Button onClick={onCreateStory} className="bg-earth-600 hover:bg-earth-700">
            <Plus className="h-4 w-4 mr-2" />
            New Story
          </Button>
        </div>
      </div>

      {/* Tabs for Status Filtering */}
      <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            All ({stories.length})
          </TabsTrigger>
          <TabsTrigger value="draft">
            <FileText className="h-4 w-4 mr-1" />
            Drafts ({stats.draft})
          </TabsTrigger>
          <TabsTrigger value="published">
            <CheckCircle className="h-4 w-4 mr-1" />
            Published ({stats.published})
          </TabsTrigger>
          <TabsTrigger value="review">
            <Clock className="h-4 w-4 mr-1" />
            In Review ({stats.review})
          </TabsTrigger>
          <TabsTrigger value="archived">
            <Archive className="h-4 w-4 mr-1" />
            Archived ({stats.archived})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          {/* Bulk Actions */}
          {selectedStories.size > 0 && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectedStories.size === filteredAndSortedStories.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  {selectedStories.size} selected
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkPublish}
                  disabled={isBulkActionLoading}
                >
                  {isBulkActionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Publish
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkArchive}
                  disabled={isBulkActionLoading}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkDelete}
                  disabled={isBulkActionLoading}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {/* Stories Grid/List */}
          {filteredAndSortedStories.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <Typography variant="story-title" className="mb-3 text-stone-700">
                  {searchQuery ? 'No stories found' : 'No stories yet'}
                </Typography>
                <Typography variant="cultural-body" className="text-stone-600 mb-6">
                  {searchQuery
                    ? 'Try adjusting your search or filters'
                    : 'Start sharing your stories with the community'}
                </Typography>
                {!searchQuery && onCreateStory && (
                  <Button onClick={onCreateStory} className="bg-earth-600 hover:bg-earth-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Story
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div
              className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              )}
            >
              {filteredAndSortedStories.map((story) => (
                <StoryDashboardCard
                  key={story.id}
                  story={story}
                  viewMode={viewMode}
                  isSelected={selectedStories.has(story.id)}
                  onSelect={() => handleSelectStory(story.id)}
                  onEdit={() => onEditStory?.(story.id)}
                  onDelete={() => onDeleteStory?.(story.id)}
                  onShare={() => onShareStory?.(story.id)}
                  getStatusColor={getStatusColor}
                  formatDate={formatDate}
                  formatNumber={formatNumber}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface StoryDashboardCardProps {
  story: Story
  viewMode: ViewMode
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
  onShare: () => void
  getStatusColor: (status: string) => string
  formatDate: (date: string) => string
  formatNumber: (num: number) => string
}

function StoryDashboardCard({
  story,
  viewMode,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onShare,
  getStatusColor,
  formatDate,
  formatNumber,
}: StoryDashboardCardProps) {
  if (viewMode === 'list') {
    return (
      <Card className={cn('hover:shadow-md transition-shadow', isSelected && 'ring-2 ring-blue-500')}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Checkbox checked={isSelected} onCheckedChange={onSelect} />

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 mb-2">
                <Link href={`/stories/${story.id}`} className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg hover:text-earth-600 transition-colors truncate">
                    {story.title}
                  </h3>
                </Link>
                <Badge className={getStatusColor(story.status)} variant="outline">
                  {story.status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(story.createdAt)}
                </span>
                {story.reading_time_minutes && (
                  <span>{story.reading_time_minutes} min read</span>
                )}
              </div>

              {story.themes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {story.themes.slice(0, 3).map((theme, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {theme}
                    </Badge>
                  ))}
                  {story.themes.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{story.themes.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={onShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/stories/${story.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Story
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Grid view
  return (
    <Card className={cn('hover:shadow-lg transition-all', isSelected && 'ring-2 ring-blue-500')}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <Checkbox checked={isSelected} onCheckedChange={onSelect} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/stories/${story.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Story
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Link href={`/stories/${story.id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-earth-600 transition-colors line-clamp-2">
            {story.title}
          </h3>
        </Link>

        <Badge className={getStatusColor(story.status)} variant="outline" size="sm">
          {story.status}
        </Badge>

        {story.summary && (
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
            {story.summary}
          </p>
        )}

        {story.themes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {story.themes.slice(0, 2).map((theme, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {theme}
              </Badge>
            ))}
            {story.themes.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{story.themes.length - 2}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs text-muted-foreground">
          <span>Created {formatDate(story.createdAt)}</span>
          {story.publishedAt && (
            <span>Published {formatDate(story.publishedAt)}</span>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="outline" onClick={onEdit} className="flex-1">
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="outline" onClick={onShare} className="flex-1">
            <Share2 className="h-3 w-3 mr-1" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
