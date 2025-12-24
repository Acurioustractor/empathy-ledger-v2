'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Plus,
  Users,
  Calendar,
  Activity,
  FileText,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { ProjectStoriesTabProps } from './types'

// Create story form component
const CreateStoryForm: React.FC<{
  projectId: string
  onSubmit: (data: any) => void
}> = ({ projectId, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    authorId: '',
    category: 'personal',
    type: 'written',
    privacy: 'organisation',
    culturalSensitivity: 'standard',
    requiresElderApproval: false,
    status: 'draft'
  })
  const [storytellers, setStorytellers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch project storytellers
  useEffect(() => {
    const fetchStorytellers = async () => {
      try {
        const response = await fetch(`/api/admin/projects/${projectId}/storytellers`)
        if (response.ok) {
          const data = await response.json()
          setStorytellers(data.storytellers || [])
        } else {
          console.error('Failed to fetch storytellers')
        }
      } catch (error) {
        console.error('Error fetching storytellers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStorytellers()
  }, [projectId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  if (loading) {
    return <div className="text-center py-4">Loading storytellers...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="title">Story Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter story title..."
            required
          />
        </div>

        <div>
          <Label htmlFor="author">Storyteller</Label>
          <Select value={formData.authorId} onValueChange={(value) => setFormData({ ...formData, authorId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select storyteller" />
            </SelectTrigger>
            <SelectContent>
              {storytellers.map((storyteller) => (
                <SelectItem key={storyteller.id} value={storyteller.id}>
                  <div className="flex items-center gap-2">
                    <span>{storyteller.name}</span>
                    {storyteller.isElder && <Badge variant="secondary">Elder</Badge>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="community">Community</SelectItem>
              <SelectItem value="cultural">Cultural</SelectItem>
              <SelectItem value="historical">Historical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="culturalSensitivity">Cultural Sensitivity</Label>
          <Select value={formData.culturalSensitivity} onValueChange={(value) => setFormData({ ...formData, culturalSensitivity: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="sensitive">Culturally Sensitive</SelectItem>
              <SelectItem value="sacred">Sacred/Restricted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="privacy">Privacy Level</Label>
          <Select value={formData.privacy} onValueChange={(value) => setFormData({ ...formData, privacy: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="organisation">Organization Only</SelectItem>
              <SelectItem value="project">Project Team Only</SelectItem>
              <SelectItem value="public">Public</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="summary">Summary (Optional)</Label>
        <Textarea
          id="summary"
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          placeholder="Brief summary of the story..."
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="content">Story Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Write your story here..."
          rows={8}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="requiresElderApproval"
          checked={formData.requiresElderApproval}
          onChange={(e) => setFormData({ ...formData, requiresElderApproval: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="requiresElderApproval">Requires Elder Approval</Label>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Create Story</Button>
      </div>
    </form>
  )
}

// Edit story form component
const EditStoryForm: React.FC<{
  story: any
  onSubmit: (data: any) => void
}> = ({ story, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: story.title || '',
    content: story.content || '',
    summary: story.summary || '',
    category: story.category || 'personal',
    status: story.status || 'draft'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-title">Story Title</Label>
        <Input
          id="edit-title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="community">Community</SelectItem>
              <SelectItem value="cultural">Cultural</SelectItem>
              <SelectItem value="historical">Historical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="edit-status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="review">In Review</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="edit-summary">Summary</Label>
        <Textarea
          id="edit-summary"
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="edit-content">Story Content</Label>
        <Textarea
          id="edit-content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={8}
          required
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit">Update Story</Button>
      </div>
    </form>
  )
}

export const ProjectStoriesTab: React.FC<ProjectStoriesTabProps> = ({ projectId }) => {
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingStory, setEditingStory] = useState<any>(null)
  const [stats, setStats] = useState<any>({})

  const fetchStories = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/projects/${projectId}/stories`)
      if (response.ok) {
        const data = await response.json()
        setStories(data.stories || [])
        setStats(data.stats || {})
      } else {
        console.error('Failed to fetch stories')
      }
    } catch (error) {
      console.error('Error fetching stories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStories()
  }, [projectId])

  const handleCreateStory = async (storyData: any) => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyData)
      })
      if (response.ok) {
        await fetchStories()
        setIsCreateDialogOpen(false)
        console.log('Story created successfully')
      } else {
        const error = await response.json()
        alert(`Failed to create story: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating story:', error)
      alert('Failed to create story')
    }
  }

  const handleEditStory = async (storyData: any) => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/stories`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId: editingStory.id, ...storyData })
      })
      if (response.ok) {
        await fetchStories()
        setIsEditDialogOpen(false)
        setEditingStory(null)
        console.log('Story updated successfully')
      } else {
        console.error('Failed to update story')
      }
    } catch (error) {
      console.error('Error updating story:', error)
    }
  }

  const handleDeleteStory = async (storyId: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return

    try {
      const response = await fetch(`/api/admin/projects/${projectId}/stories?storyId=${storyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchStories()
        console.log('Story deleted successfully')
      } else {
        console.error('Failed to delete story')
      }
    } catch (error) {
      console.error('Error deleting story:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-700">Published</Badge>
      case 'draft':
        return <Badge variant="outline">Draft</Badge>
      case 'review':
        return <Badge className="bg-yellow-100 text-yellow-700">In Review</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading stories...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Project Stories</h3>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Stories created within this project by assigned storytellers
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Story
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Story</DialogTitle>
              <DialogDescription>
                Create a new story within this project
              </DialogDescription>
            </DialogHeader>
            <CreateStoryForm projectId={projectId} onSubmit={handleCreateStory} />
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Story</DialogTitle>
              <DialogDescription>
                Update story details and content
              </DialogDescription>
            </DialogHeader>
            {editingStory && (
              <EditStoryForm story={editingStory} onSubmit={handleEditStory} />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Story Stats */}
      {stats.totalStories > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-sage-600">{stats.totalStories}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Total Stories</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.published}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Published</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Drafts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-clay-600">{stats.elderApproved}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Elder Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-stone-600">{stats.totalWords?.toLocaleString()}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Total Words</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stories List */}
      {stories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-stone-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No stories created yet</h3>
            <p className="text-stone-600 dark:text-stone-400 mb-4">
              Create stories within this project to organise content by storytellers and themes.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Story
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {stories.map((story) => (
            <Card key={story.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold">{story.title}</h4>
                      {getStatusBadge(story.status)}
                      {story.culturalSensitivity !== 'standard' && (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          {story.culturalSensitivity}
                        </Badge>
                      )}
                      {story.elderApproved && (
                        <Badge className="bg-green-100 text-green-700">Elder Approved</Badge>
                      )}
                    </div>

                    {story.summary && (
                      <p className="text-stone-600 dark:text-stone-400 mb-3 line-clamp-2">
                        {story.summary}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-stone-500">
                      {story.author && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{story.author.name}</span>
                          {story.author.isElder && <Badge variant="secondary">Elder</Badge>}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        <span>{story.wordCount} words</span>
                      </div>
                      <Badge variant="outline">{story.category}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/stories/${story.id}`} target="_blank">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingStory(story)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteStory(story.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}