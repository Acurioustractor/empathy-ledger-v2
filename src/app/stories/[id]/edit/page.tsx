'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { Story, StoryUpdate, Storyteller } from '@/types/database'
import { cn } from '@/lib/utils'
import { 
  Save, 
  Send, 
  ArrowLeft, 
  BookOpen,
  Shield,
  Crown,
  AlertTriangle,
  Info,
  Trash2,
  Eye,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

const STORY_TYPES = [
  { value: 'traditional', label: 'Traditional Story' },
  { value: 'personal', label: 'Personal Story' },
  { value: 'historical', label: 'Historical Account' },
  { value: 'educational', label: 'Educational Content' },
  { value: 'healing', label: 'Healing Story' }
]

const AUDIENCES = [
  { value: 'all', label: 'All Ages' },
  { value: 'children', label: 'Children' },
  { value: 'youth', label: 'Youth' },
  { value: 'adults', label: 'Adults' },
  { value: 'elders', label: 'Elders' }
]

const CULTURAL_SENSITIVITY_LEVELS = [
  { 
    value: 'low', 
    label: 'Low Sensitivity', 
    color: 'text-green-800 bg-green-100'
  },
  { 
    value: 'medium', 
    label: 'Medium Sensitivity',
    color: 'text-amber-800 bg-amber-100'
  },
  { 
    value: 'high', 
    label: 'High Sensitivity',
    color: 'text-red-800 bg-red-100'
  }
]

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', description: 'Private, not visible to others' },
  { value: 'review', label: 'Under Review', description: 'Submitted for cultural review' },
  { value: 'published', label: 'Published', description: 'Live and visible to community' },
  { value: 'archived', label: 'Archived', description: 'Removed from public view' }
]

interface StoryWithRelations extends Story {
  storyteller?: Storyteller
  author?: {
    id: string
    display_name: string
    first_name?: string
    last_name?: string
  }
}

interface FormData {
  title: string
  content: string
  storyteller_id: string
  story_type: string
  audience: string
  cultural_sensitivity_level: string
  location: string
  tags: string
  cultural_context: string
  status: string
  featured: boolean
  elder_approval: boolean | null
  cultural_review_status: string
}

export default function EditStoryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [story, setStory] = useState<StoryWithRelations | null>(null)
  const [storytellers, setStorytellers] = useState<Storyteller[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    storyteller_id: '',
    story_type: 'personal',
    audience: 'all',
    cultural_sensitivity_level: 'medium',
    location: '',
    tags: '',
    cultural_context: '',
    status: 'draft',
    featured: false,
    elder_approval: null,
    cultural_review_status: 'pending'
  })

  useEffect(() => {
    fetchStory()
    fetchStorytellers()
  }, [params.id])

  const fetchStory = async () => {
    try {
      const response = await fetch(`/api/stories/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          notFound()
          return
        }
        throw new Error('Failed to fetch story')
      }

      const data: StoryWithRelations = await response.json()
      setStory(data)
      
      // Populate form data
      setFormData({
        title: data.title,
        content: data.content,
        storyteller_id: data.storyteller_id || '',
        story_type: data.story_type,
        audience: data.audience,
        cultural_sensitivity_level: data.cultural_sensitivity_level,
        location: data.location || '',
        tags: data.tags?.join(', ') || '',
        cultural_context: typeof data.cultural_context === 'string' 
          ? data.cultural_context 
          : data.cultural_context?.description || '',
        status: data.status,
        featured: data.featured,
        elder_approval: data.elder_approval,
        cultural_review_status: data.cultural_review_status
      })
    } catch (error) {
      console.error('Error fetching story:', error)
      notFound()
    } finally {
      setLoading(false)
    }
  }

  const fetchStorytellers = async () => {
    try {
      const response = await fetch('/api/storytellers')
      if (response.ok) {
        const data = await response.json()
        setStorytellers(data.storytellers || data)
      }
    } catch (error) {
      console.error('Error fetching storytellers:', error)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Story title is required'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Story content is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      setSaving(true)

      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const updateData: StoryUpdate = {
        title: formData.title,
        content: formData.content,
        storyteller_id: formData.storyteller_id || null,
        story_type: formData.story_type as any,
        audience: formData.audience as any,
        cultural_sensitivity_level: formData.cultural_sensitivity_level as any,
        location: formData.location || null,
        tags: tags.length > 0 ? tags : null,
        cultural_context: formData.cultural_context ? { description: formData.cultural_context } : null,
        status: formData.status as any,
        featured: formData.featured,
        elder_approval: formData.elder_approval,
        cultural_review_status: formData.cultural_review_status as any,
        updated_at: new Date().toISOString()
      }

      const response = await fetch(`/api/stories/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error('Failed to update story')
      }

      const updatedStory = await response.json()
      setStory(updatedStory)
      
      // Show success message or redirect
      alert('Story updated successfully!')
      
    } catch (error) {
      console.error('Error updating story:', error)
      alert('Failed to update story. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      return
    }

    try {
      setSaving(true)
      
      const response = await fetch(`/api/stories/${params.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete story')
      }

      router.push('/stories')
      
    } catch (error) {
      console.error('Error deleting story:', error)
      alert('Failed to delete story. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-earth-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!story) {
    return notFound()
  }

  const selectedSensitivity = CULTURAL_SENSITIVITY_LEVELS.find(
    level => level.value === formData.cultural_sensitivity_level
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-earth-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" asChild className="text-earth-600 hover:text-earth-700">
              <Link href={`/stories/${story.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Story
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href={`/stories/${story.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Link>
            </Button>
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <Typography variant="h1" className="mb-2">
                Edit Story
              </Typography>
              <Typography variant="large" className="text-gray-600">
                Make changes to "{story.title}"
              </Typography>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant={story.status === 'published' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {story.status}
              </Badge>
              {story.cultural_review_status && (
                <Badge variant="outline" className="capitalize">
                  {story.cultural_review_status.replace('_', ' ')}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <form className="space-y-8">
          {/* Basic Information */}
          <Card className="p-6">
            <Typography variant="h3" className="mb-6 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Story Details
            </Typography>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Story Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter story title"
                  className={cn(errors.title && 'border-red-500')}
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Storyteller
                </label>
                <Select 
                  value={formData.storyteller_id} 
                  onValueChange={(value) => handleInputChange('storyteller_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a storyteller or leave blank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Author only)</SelectItem>
                    {storytellers.map(storyteller => (
                      <SelectItem key={storyteller.id} value={storyteller.id}>
                        {storyteller.display_name}
                        {storyteller.elder_status && <Crown className="inline ml-2 h-3 w-3" />}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Story Type *
                  </label>
                  <Select 
                    value={formData.story_type} 
                    onValueChange={(value) => handleInputChange('story_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STORY_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Audience *
                  </label>
                  <Select 
                    value={formData.audience} 
                    onValueChange={(value) => handleInputChange('audience', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AUDIENCES.map(audience => (
                        <SelectItem key={audience.value} value={audience.value}>
                          {audience.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Status *
                  </label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          <div>
                            <div className="font-medium">{status.label}</div>
                            <div className="text-xs text-gray-500">{status.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Story Content *
                </label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  rows={15}
                  className={cn('resize-none', errors.content && 'border-red-500')}
                />
                {errors.content && (
                  <p className="text-red-600 text-sm mt-1">{errors.content}</p>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  {formData.content.length} characters • ~{Math.ceil(formData.content.split(' ').length / 200)} min read
                </div>
              </div>
            </div>
          </Card>

          {/* Cultural Information */}
          <Card className="p-6">
            <Typography variant="h3" className="mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Cultural Considerations
            </Typography>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cultural Sensitivity Level *
                </label>
                <Select 
                  value={formData.cultural_sensitivity_level} 
                  onValueChange={(value) => handleInputChange('cultural_sensitivity_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CULTURAL_SENSITIVITY_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="flex items-center gap-2">
                          <Shield className="h-3 w-3" />
                          <span>{level.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedSensitivity && (
                  <div className={cn('p-2 rounded mt-2', selectedSensitivity.color)}>
                    <Typography variant="small">
                      {selectedSensitivity.label} content
                    </Typography>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Cultural Context
                </label>
                <Textarea
                  value={formData.cultural_context}
                  onChange={(e) => handleInputChange('cultural_context', e.target.value)}
                  rows={3}
                  placeholder="Additional cultural context..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Geographic location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tags
                  </label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="Comma-separated tags"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Review Status */}
          <Card className="p-6">
            <Typography variant="h3" className="mb-6 flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Review & Approval
            </Typography>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange('featured', checked)}
                />
                <div>
                  <label htmlFor="featured" className="text-sm font-medium cursor-pointer">
                    Featured Story
                  </label>
                  <p className="text-xs text-gray-600">
                    Highlight this story on the platform
                  </p>
                </div>
              </div>

              {formData.cultural_sensitivity_level === 'high' && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    High sensitivity stories require additional cultural review and elder approval.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  asChild
                >
                  <Link href={`/stories/${story.id}`}>
                    Cancel
                  </Link>
                </Button>
              </div>
              
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Story
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  )
}