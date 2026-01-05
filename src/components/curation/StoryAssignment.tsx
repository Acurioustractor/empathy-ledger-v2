'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { FolderOpen, Search, User, Calendar, Tag as TagIcon, Check, Move } from 'lucide-react'

interface Story {
  id: string
  title: string
  storyteller_name: string
  created_at: string
  status: string
  current_project_id?: string
  current_project_name?: string
  themes?: string[]
  word_count?: number
}

interface Project {
  id: string
  name: string
  description?: string
  story_count: number
}

interface StoryAssignmentProps {
  organizationId: string
  projectId?: string
  onAssignmentComplete: () => void
}

export function StoryAssignment({ organizationId, projectId, onAssignmentComplete }: StoryAssignmentProps) {
  const { toast } = useToast()
  const [stories, setStories] = useState<Story[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredStories, setFilteredStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [assignmentFilter, setAssignmentFilter] = useState<string>('unassigned')
  const [selectedStories, setSelectedStories] = useState<Set<string>>(new Set())
  const [targetProjectId, setTargetProjectId] = useState<string>('')
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({ organization_id: organizationId })
        if (projectId) params.set('project_id', projectId)

        // Fetch stories
        const storiesRes = await fetch(`/api/curation/stories?${params.toString()}`)
        if (storiesRes.ok) {
          const storiesData = await storiesRes.json()
          setStories(storiesData.stories || [])
          setFilteredStories(storiesData.stories || [])
        }

        // Fetch projects
        const projectsRes = await fetch(`/api/projects?${params.toString()}`)
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json()
          setProjects(projectsData.projects || [])
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [organizationId, projectId])

  // Filter stories
  useEffect(() => {
    let filtered = stories.filter(story => {
      const matchesSearch = searchTerm === '' ||
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.storyteller_name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || story.status === statusFilter

      const matchesAssignment =
        assignmentFilter === 'all' ||
        (assignmentFilter === 'unassigned' && !story.current_project_id) ||
        (assignmentFilter === 'assigned' && story.current_project_id)

      return matchesSearch && matchesStatus && matchesAssignment
    })

    // Sort by created date (newest first)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    setFilteredStories(filtered)
  }, [stories, searchTerm, statusFilter, assignmentFilter])

  const toggleStorySelection = (storyId: string) => {
    const newSelection = new Set(selectedStories)
    if (newSelection.has(storyId)) {
      newSelection.delete(storyId)
    } else {
      newSelection.add(storyId)
    }
    setSelectedStories(newSelection)
  }

  const selectAll = () => {
    if (selectedStories.size === filteredStories.length) {
      setSelectedStories(new Set())
    } else {
      setSelectedStories(new Set(filteredStories.map(s => s.id)))
    }
  }

  const handleAssign = async () => {
    if (selectedStories.size === 0) {
      toast({
        title: 'No Stories Selected',
        description: 'Please select at least one story to assign.',
        variant: 'destructive'
      })
      return
    }

    if (!targetProjectId) {
      toast({
        title: 'No Project Selected',
        description: 'Please select a target project.',
        variant: 'destructive'
      })
      return
    }

    try {
      setAssigning(true)

      const response = await fetch('/api/curation/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          organization_id: organizationId,
          project_id: targetProjectId,
          story_ids: Array.from(selectedStories)
        })
      })

      if (!response.ok) {
        throw new Error('Failed to assign stories')
      }

      const result = await response.json()

      toast({
        title: 'Stories Assigned',
        description: `${result.count} ${result.count === 1 ? 'story' : 'stories'} assigned to project.`,
      })

      // Reset selection
      setSelectedStories(new Set())
      setTargetProjectId('')
      onAssignmentComplete()
    } catch (error) {
      console.error('Failed to assign stories:', error)
      toast({
        title: 'Assignment Failed',
        description: 'Unable to assign stories. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setAssigning(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading stories...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters & Actions */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Story or storyteller..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Assignment</label>
              <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stories</SelectItem>
                  <SelectItem value="unassigned">Unassigned Only</SelectItem>
                  <SelectItem value="assigned">Assigned Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedStories.size > 0 && (
            <div className="flex items-center justify-between p-4 bg-sky-50 border border-sky-200 rounded-lg">
              <div className="flex items-center gap-4">
                <p className="text-sm font-medium">
                  {selectedStories.size} {selectedStories.size === 1 ? 'story' : 'stories'} selected
                </p>
                <Select value={targetProjectId} onValueChange={setTargetProjectId}>
                  <SelectTrigger className="w-64 bg-white">
                    <SelectValue placeholder="Select target project..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name} ({project.story_count} stories)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAssign} disabled={assigning || !targetProjectId}>
                {assigning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Assigning...
                  </>
                ) : (
                  <>
                    <Move className="h-4 w-4 mr-2" />
                    Assign to Project
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stories List */}
      <div className="space-y-2">
        {filteredStories.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedStories.size === filteredStories.length && filteredStories.length > 0}
                onCheckedChange={selectAll}
              />
              <span className="text-sm text-muted-foreground">
                Select all ({filteredStories.length})
              </span>
            </div>
          </div>
        )}

        {filteredStories.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No stories found</p>
              <p className="text-sm mt-1">
                {stories.length === 0
                  ? 'No stories available for assignment'
                  : 'No stories match your filters'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredStories.map((story) => (
            <Card key={story.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedStories.has(story.id)}
                    onCheckedChange={() => toggleStorySelection(story.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-semibold">{story.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {story.status.replace('_', ' ')}
                        </Badge>
                        {story.current_project_id ? (
                          <Badge variant="outline" className="border-sage-600 text-sage-600">
                            <Check className="h-3 w-3 mr-1" />
                            Assigned
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-clay-600 text-clay-600">
                            Unassigned
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{story.storyteller_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(story.created_at).toLocaleDateString()}</span>
                      </div>
                      {story.word_count && (
                        <div className="flex items-center gap-1">
                          <span>{story.word_count.toLocaleString()} words</span>
                        </div>
                      )}
                    </div>

                    {story.current_project_name && (
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <FolderOpen className="h-4 w-4 text-sage-600" />
                        <span className="text-sage-700 font-medium">{story.current_project_name}</span>
                      </div>
                    )}

                    {story.themes && story.themes.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <TagIcon className="h-3 w-3 text-muted-foreground" />
                        {story.themes.map((theme, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
