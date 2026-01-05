'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, ChevronLeft, ChevronRight, FolderOpen, Users, BookOpen } from 'lucide-react'

interface ProjectEvent {
  id: string
  project_id: string
  project_name: string
  event_type: 'created' | 'story_added' | 'milestone' | 'completed' | 'campaign_launched'
  event_date: string
  description: string
  story_count?: number
  storyteller_count?: number
}

interface ProjectTimelineProps {
  organizationId: string
  projectId?: string
}

type ViewMode = 'month' | 'quarter' | 'year'

export function ProjectTimeline({ organizationId, projectId }: ProjectTimelineProps) {
  const [events, setEvents] = useState<ProjectEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    fetchEvents()
  }, [organizationId, projectId, currentDate, viewMode])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        organization_id: organizationId,
        view_mode: viewMode,
        year: currentDate.getFullYear().toString(),
        month: (currentDate.getMonth() + 1).toString()
      })
      if (projectId) params.set('project_id', projectId)

      const response = await fetch(`/api/analytics/timeline?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Failed to fetch timeline:', error)
    } finally {
      setLoading(false)
    }
  }

  const navigatePrevious = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else if (viewMode === 'quarter') {
      newDate.setMonth(newDate.getMonth() - 3)
    } else {
      newDate.setFullYear(newDate.getFullYear() - 1)
    }
    setCurrentDate(newDate)
  }

  const navigateNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1)
    } else if (viewMode === 'quarter') {
      newDate.setMonth(newDate.getMonth() + 3)
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getEventIcon = (eventType: ProjectEvent['event_type']) => {
    switch (eventType) {
      case 'created':
        return <FolderOpen className="h-4 w-4 text-sky-600" />
      case 'story_added':
        return <BookOpen className="h-4 w-4 text-sage-600" />
      case 'milestone':
        return <Calendar className="h-4 w-4 text-amber-600" />
      case 'completed':
        return <Badge className="bg-sage-600">Complete</Badge>
      case 'campaign_launched':
        return <Badge className="bg-sky-600">Campaign</Badge>
    }
  }

  const getEventBadgeColor = (eventType: ProjectEvent['event_type']) => {
    switch (eventType) {
      case 'created': return 'border-sky-600 text-sky-600'
      case 'story_added': return 'border-sage-600 text-sage-600'
      case 'milestone': return 'border-amber-600 text-amber-600'
      case 'completed': return 'border-sage-600 text-sage-600 bg-sage-50'
      case 'campaign_launched': return 'border-sky-600 text-sky-600 bg-sky-50'
    }
  }

  const formatPeriod = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    } else if (viewMode === 'quarter') {
      const quarter = Math.floor(currentDate.getMonth() / 3) + 1
      return `Q${quarter} ${currentDate.getFullYear()}`
    } else {
      return currentDate.getFullYear().toString()
    }
  }

  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const date = new Date(event.event_date).toLocaleDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(event)
    return acc
  }, {} as Record<string, ProjectEvent[]>)

  const sortedDates = Object.keys(groupedEvents).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  )

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading timeline...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-sky-600" />
              Project Timeline
            </CardTitle>
            <CardDescription>
              Track project milestones and activity over time
            </CardDescription>
          </div>
          <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={navigatePrevious}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{formatPeriod()}</h3>
            {!isCurrentPeriod(currentDate, viewMode) && (
              <Button variant="ghost" size="sm" onClick={goToToday}>
                Today
              </Button>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={navigateNext}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Timeline */}
        {sortedDates.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No Activity</p>
            <p className="text-sm mt-1">No project events in this period</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted" />

            <div className="space-y-8">
              {sortedDates.map(date => (
                <div key={date} className="relative">
                  {/* Date Label */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-sky-100 border-4 border-white">
                      <Calendar className="h-5 w-5 text-sky-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {groupedEvents[date].length} {groupedEvents[date].length === 1 ? 'event' : 'events'}
                      </p>
                    </div>
                  </div>

                  {/* Events for this date */}
                  <div className="ml-16 space-y-3">
                    {groupedEvents[date].map(event => (
                      <Card key={event.id} className="border-l-4" style={{
                        borderLeftColor: event.event_type === 'created' ? '#4A90A4' :
                                        event.event_type === 'story_added' ? '#6B8E72' :
                                        event.event_type === 'milestone' ? '#D4A373' :
                                        event.event_type === 'completed' ? '#6B8E72' : '#4A90A4'
                      }}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getEventIcon(event.event_type)}
                                <h5 className="font-medium">{event.project_name}</h5>
                                <Badge variant="outline" className={`text-xs ${getEventBadgeColor(event.event_type)}`}>
                                  {event.event_type.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                              {(event.story_count || event.storyteller_count) && (
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  {event.story_count !== undefined && (
                                    <div className="flex items-center gap-1">
                                      <BookOpen className="h-3 w-3" />
                                      <span>{event.story_count} stories</span>
                                    </div>
                                  )}
                                  {event.storyteller_count !== undefined && (
                                    <div className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      <span>{event.storyteller_count} storytellers</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(event.event_date).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {events.length > 0 && (
          <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-sky-600" />
              <h4 className="font-medium text-sky-900">Period Summary</h4>
            </div>
            <div className="text-sm text-sky-800 space-y-1">
              <p>• {events.length} total events</p>
              <p>• {new Set(events.map(e => e.project_id)).size} active projects</p>
              <p>• {events.filter(e => e.event_type === 'story_added').length} stories added</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper function to check if a date is in the current period
function isCurrentPeriod(date: Date, viewMode: ViewMode): boolean {
  const now = new Date()

  if (viewMode === 'month') {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  } else if (viewMode === 'quarter') {
    const dateQuarter = Math.floor(date.getMonth() / 3)
    const nowQuarter = Math.floor(now.getMonth() / 3)
    return dateQuarter === nowQuarter && date.getFullYear() === now.getFullYear()
  } else {
    return date.getFullYear() === now.getFullYear()
  }
}
