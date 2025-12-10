'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  BookOpen,
  MapPin,
  Calendar,
  User,
  Plus,
  Check,
  Clock,
  Loader2,
  X
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface Story {
  id: string
  title: string
  summary: string | null
  featured_image: string | null
  themes: string[]
  created_at: string
  location?: string
  storyteller: {
    id: string
    display_name: string
    avatar_url: string | null
  } | null
  request_status?: 'none' | 'pending' | 'approved' | 'declined'
  project_id?: string
}

interface Project {
  id: string
  name: string
  slug: string
}

interface StoryCatalogProps {
  appId: string
  projects: Project[]
}

export function StoryCatalog({ appId, projects }: StoryCatalogProps) {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<string>('all')
  const [availableThemes, setAvailableThemes] = useState<string[]>([])

  // Request dialog state
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [requestMessage, setRequestMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchStories()
    fetchThemes()
  }, [appId, selectedTheme, searchQuery])

  async function fetchStories() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ app_id: appId })
      if (selectedTheme && selectedTheme !== 'all') params.set('theme', selectedTheme)
      if (searchQuery) params.set('search', searchQuery)

      const response = await fetch(`/api/partner/catalog?${params}`)
      if (response.ok) {
        const data = await response.json()
        setStories(data.stories || [])
      }
    } catch (error) {
      console.error('Failed to fetch stories:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchThemes() {
    try {
      const response = await fetch('/api/external/themes')
      if (response.ok) {
        const data = await response.json()
        setAvailableThemes(data.themes || [])
      }
    } catch (error) {
      console.error('Failed to fetch themes:', error)
    }
  }

  function openRequestDialog(story: Story) {
    setSelectedStory(story)
    setSelectedProject(projects[0]?.id || '')
    setRequestMessage('')
    setRequestDialogOpen(true)
  }

  async function handleRequestSubmit() {
    if (!selectedStory || !selectedProject) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/partner/catalog/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story_id: selectedStory.id,
          project_id: selectedProject,
          message: requestMessage
        })
      })

      if (response.ok) {
        // Update local state
        setStories(stories.map(s =>
          s.id === selectedStory.id
            ? { ...s, request_status: 'pending' as const, project_id: selectedProject }
            : s
        ))
        setRequestDialogOpen(false)
      }
    } catch (error) {
      console.error('Failed to request story:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // Mock data for demo
  const mockStories: Story[] = [
    {
      id: '1',
      title: 'My Climate Journey',
      summary: 'A story about how climate change affected my community and how we came together to find solutions.',
      featured_image: '/api/placeholder/400/225',
      themes: ['climate', 'community', 'resilience'],
      created_at: '2024-01-15',
      location: 'Sydney, NSW',
      storyteller: {
        id: 'st1',
        display_name: 'Maria Thompson',
        avatar_url: null
      },
      request_status: 'none'
    },
    {
      id: '2',
      title: 'Finding Home',
      summary: 'After years of displacement, this is my story of finding belonging and community.',
      featured_image: '/api/placeholder/400/225',
      themes: ['housing', 'hope', 'identity'],
      created_at: '2024-01-10',
      location: 'Melbourne, VIC',
      storyteller: {
        id: 'st2',
        display_name: 'David Kim',
        avatar_url: null
      },
      request_status: 'approved'
    },
    {
      id: '3',
      title: 'Voices of Change',
      summary: 'How grassroots organizing transformed our neighborhood.',
      featured_image: '/api/placeholder/400/225',
      themes: ['advocacy', 'community', 'justice'],
      created_at: '2024-01-05',
      storyteller: {
        id: 'st3',
        display_name: 'Sam Lee',
        avatar_url: null
      },
      request_status: 'pending'
    },
    {
      id: '4',
      title: 'Healing Waters',
      summary: 'Traditional practices and modern healing in Aboriginal communities.',
      featured_image: '/api/placeholder/400/225',
      themes: ['culture', 'health', 'tradition'],
      created_at: '2024-01-01',
      location: 'Cairns, QLD',
      storyteller: {
        id: 'st4',
        display_name: 'Elder Sarah',
        avatar_url: null
      },
      request_status: 'none'
    }
  ]

  const displayStories = stories.length > 0 ? stories : mockStories

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-sage-600" />
          Story Catalog
        </h1>
        <p className="text-stone-500 mt-1">
          Browse stories available for syndication
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Search stories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedTheme} onValueChange={setSelectedTheme}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All themes</SelectItem>
            {(availableThemes.length > 0 ? availableThemes : ['climate', 'community', 'justice', 'health', 'housing', 'culture']).map((theme) => (
              <SelectItem key={theme} value={theme}>
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Story Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onRequest={() => openRequestDialog(story)}
            />
          ))}
        </div>
      )}

      {/* Request Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Story for Project</DialogTitle>
            <DialogDescription>
              Send a request to {selectedStory?.storyteller?.display_name || 'the storyteller'} to feature "{selectedStory?.title}" in your project.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-stone-700">
                Select Project
              </label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700">
                Message to Storyteller (optional)
              </label>
              <Textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Explain why you'd like to feature this story..."
                className="mt-1"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRequestSubmit}
              disabled={!selectedProject || submitting}
              className="bg-sage-600 hover:bg-sage-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StoryCard({
  story,
  onRequest
}: {
  story: Story
  onRequest: () => void
}) {
  const statusConfig = {
    none: { label: 'Request', icon: Plus, variant: 'default' as const },
    pending: { label: 'Pending', icon: Clock, variant: 'secondary' as const },
    approved: { label: 'In Project', icon: Check, variant: 'outline' as const },
    declined: { label: 'Declined', icon: X, variant: 'destructive' as const }
  }

  const status = statusConfig[story.request_status || 'none']
  const StatusIcon = status.icon

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="aspect-video relative bg-gradient-to-br from-sage-100 to-earth-100">
        {story.featured_image && (
          <img
            src={story.featured_image}
            alt={story.title}
            className="w-full h-full object-cover"
          />
        )}
        {story.location && (
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs flex items-center gap-1">
            <MapPin className="h-3 w-3 text-stone-500" />
            {story.location}
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Themes */}
        <div className="flex flex-wrap gap-1">
          {story.themes.slice(0, 3).map((theme) => (
            <Badge key={theme} variant="secondary" className="text-xs">
              {theme}
            </Badge>
          ))}
          {story.themes.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{story.themes.length - 3}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-stone-900 line-clamp-2">
          {story.title}
        </h3>

        {/* Summary */}
        {story.summary && (
          <p className="text-sm text-stone-500 line-clamp-2">
            {story.summary}
          </p>
        )}

        {/* Storyteller */}
        {story.storyteller && (
          <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
            <Avatar className="h-6 w-6">
              <AvatarImage src={story.storyteller.avatar_url || undefined} />
              <AvatarFallback className="text-xs bg-sage-100 text-sage-700">
                {story.storyteller.display_name[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-stone-600">
              {story.storyteller.display_name}
            </span>
          </div>
        )}

        {/* Action Button */}
        <Button
          variant={status.variant}
          size="sm"
          className="w-full"
          disabled={story.request_status === 'pending' || story.request_status === 'approved'}
          onClick={onRequest}
        >
          <StatusIcon className="h-4 w-4 mr-2" />
          {status.label}
        </Button>
      </CardContent>
    </Card>
  )
}

export default StoryCatalog
