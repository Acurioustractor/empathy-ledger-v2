'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Clock,
  AlertTriangle,
  Flag,
  User,
  Calendar,
  Eye,
  Search
} from 'lucide-react'

interface ReviewQueueItem {
  id: string
  story_id: string
  storyteller_id: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  cultural_sensitivity_level: 'none' | 'moderate' | 'high' | 'sacred'
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'changes_requested' | 'escalated'
  submitted_at: string
  story: {
    title: string
    excerpt?: string
    cultural_tags?: string[]
  }
  storyteller: {
    display_name: string
    profile_image_url?: string
  }
  concerns?: string[]
  assigned_elder_id?: string
}

interface ReviewQueueProps {
  elderId: string
  onStorySelected: (storyId: string) => void
  onRefresh: () => void
}

export function ReviewQueue({ elderId, onStorySelected, onRefresh }: ReviewQueueProps) {
  const [queue, setQueue] = useState<ReviewQueueItem[]>([])
  const [filteredQueue, setFilteredQueue] = useState<ReviewQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [sensitivityFilter, setSensitivityFilter] = useState<string>('all')

  const fetchQueue = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/elder/review-queue')
      if (response.ok) {
        const data = await response.json()
        setQueue(data.queue || [])
        setFilteredQueue(data.queue || [])
      }
    } catch (error) {
      console.error('Failed to fetch review queue:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQueue()
  }, [])

  // Filter queue
  useEffect(() => {
    let filtered = queue.filter(item => {
      const matchesSearch = searchTerm === '' ||
        item.story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.storyteller.display_name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter
      const matchesSensitivity = sensitivityFilter === 'all' || item.cultural_sensitivity_level === sensitivityFilter

      return matchesSearch && matchesPriority && matchesSensitivity
    })

    // Sort by priority (urgent → high → medium → low) and date (oldest first)
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
    filtered.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff
      return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
    })

    setFilteredQueue(filtered)
  }, [queue, searchTerm, priorityFilter, sensitivityFilter])

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive" className="bg-red-600">Urgent</Badge>
      case 'high':
        return <Badge variant="outline" className="border-ember-600 text-ember-600">High</Badge>
      case 'medium':
        return <Badge variant="outline" className="border-amber-600 text-amber-600">Medium</Badge>
      case 'low':
        return <Badge variant="outline" className="border-sage-600 text-sage-600">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getSensitivityBadge = (level: string) => {
    switch (level) {
      case 'sacred':
        return <Badge className="bg-amber-600">Sacred</Badge>
      case 'high':
        return <Badge variant="outline" className="border-clay-600 text-clay-600">High Sensitivity</Badge>
      case 'moderate':
        return <Badge variant="outline" className="border-sky-600 text-sky-600">Moderate</Badge>
      case 'none':
        return <Badge variant="outline" className="border-sage-600 text-sage-600">General</Badge>
      default:
        return <Badge variant="outline">{level}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading review queue...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter Queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Story title or storyteller..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Sensitivity</label>
              <Select value={sensitivityFilter} onValueChange={setSensitivityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="sacred">Sacred</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="none">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queue List */}
      <div className="space-y-3">
        {filteredQueue.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No stories in review queue</p>
              <p className="text-sm mt-1">
                {queue.length === 0
                  ? 'All stories have been reviewed'
                  : 'No stories match your filters'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredQueue.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onStorySelected(item.story_id)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header Row */}
                    <div className="flex items-center gap-2 mb-2">
                      {getPriorityBadge(item.priority)}
                      {getSensitivityBadge(item.cultural_sensitivity_level)}
                      {item.concerns && item.concerns.length > 0 && (
                        <Badge variant="outline" className="border-red-600 text-red-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {item.concerns.length} concerns
                        </Badge>
                      )}
                    </div>

                    {/* Story Title */}
                    <h3 className="font-semibold text-lg mb-1 truncate">{item.story.title}</h3>

                    {/* Storyteller Info */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <User className="h-4 w-4" />
                      <span>{item.storyteller.display_name}</span>
                      <span>•</span>
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(item.submitted_at)}</span>
                    </div>

                    {/* Cultural Tags */}
                    {item.story.cultural_tags && item.story.cultural_tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.story.cultural_tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {item.story.cultural_tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.story.cultural_tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button variant="outline" size="sm" className="flex-shrink-0">
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
