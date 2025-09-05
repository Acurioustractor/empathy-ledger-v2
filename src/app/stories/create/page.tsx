'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { StoryInsert, Storyteller } from '@/types/database'
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
  Users,
  MapPin,
  Tag,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

const STORY_TYPES = [
  { value: 'traditional', label: 'Traditional Story', description: 'Ancestral stories passed down through generations' },
  { value: 'personal', label: 'Personal Story', description: 'Individual experiences and memories' },
  { value: 'historical', label: 'Historical Account', description: 'Historical events and documentation' },
  { value: 'educational', label: 'Educational Content', description: 'Teaching stories and lessons' },
  { value: 'healing', label: 'Healing Story', description: 'Stories for healing and wellness' }
]

const AUDIENCES = [
  { value: 'all', label: 'All Ages', description: 'Suitable for everyone' },
  { value: 'children', label: 'Children', description: 'Ages 5-12' },
  { value: 'youth', label: 'Youth', description: 'Ages 13-17' },
  { value: 'adults', label: 'Adults', description: 'Ages 18+' },
  { value: 'elders', label: 'Elders', description: 'Elder community' }
]

const CULTURAL_SENSITIVITY_LEVELS = [
  { 
    value: 'low', 
    label: 'Low Sensitivity', 
    description: 'General content suitable for public sharing',
    color: 'text-green-800 bg-green-100'
  },
  { 
    value: 'medium', 
    label: 'Medium Sensitivity', 
    description: 'Some cultural elements, community review recommended',
    color: 'text-amber-800 bg-amber-100'
  },
  { 
    value: 'high', 
    label: 'High Sensitivity', 
    description: 'Sacred or ceremonial content, requires elder approval',
    color: 'text-red-800 bg-red-100'
  }
]

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
  featured: boolean
  elder_approval_required: boolean
  cultural_review_required: boolean
}

export default function CreateStoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [storytellers, setStorytellers] = useState<Storyteller[]>([])
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
    featured: false,
    elder_approval_required: false,
    cultural_review_required: true
  })

  useEffect(() => {
    fetchStorytellers()
  }, [])

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

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Story title is required'
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters long'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Story content is required'
    } else if (formData.content.length < 50) {
      newErrors.content = 'Content must be at least 50 characters long'
    }

    if (!formData.story_type) {
      newErrors.story_type = 'Story type is required'
    }

    if (!formData.audience) {
      newErrors.audience = 'Target audience is required'
    }

    if (!formData.cultural_sensitivity_level) {
      newErrors.cultural_sensitivity_level = 'Cultural sensitivity level is required'
    }

    // Validate high sensitivity requirements
    if (formData.cultural_sensitivity_level === 'high' && !formData.elder_approval_required) {
      newErrors.elder_approval = 'High sensitivity stories require elder approval'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveDraft = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      await saveStory('draft')
    } catch (error) {
      console.error('Error saving draft:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitForReview = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      await saveStory('review')
    } catch (error) {
      console.error('Error submitting for review:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveStory = async (status: 'draft' | 'review') => {
    // Get author ID from auth context (this would come from your auth system)
    const authorId = 'temp-author-id' // Replace with actual auth

    const tags = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    const storyData: Partial<StoryInsert> = {
      title: formData.title,
      content: formData.content,
      author_id: authorId,
      storyteller_id: formData.storyteller_id || null,
      status,
      story_type: formData.story_type as any,
      audience: formData.audience as any,
      cultural_sensitivity_level: formData.cultural_sensitivity_level as any,
      location: formData.location || null,
      tags: tags.length > 0 ? tags : null,
      cultural_context: formData.cultural_context ? { description: formData.cultural_context } : null,
      featured: formData.featured,
      elder_approval: formData.elder_approval_required ? null : false,
      cultural_review_status: formData.cultural_review_required ? 'pending' : 'approved',
      consent_status: 'pending'
    }

    const response = await fetch('/api/stories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(storyData),
    })

    if (!response.ok) {
      throw new Error('Failed to save story')
    }

    const savedStory = await response.json()
    
    if (status === 'draft') {
      // Show success message for draft
      alert('Story saved as draft!')
    } else {
      // Redirect to story page for review submission
      router.push(`/stories/${savedStory.id}`)
    }
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
              <Link href="/stories">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Stories
              </Link>
            </Button>
          </div>
          
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <BookOpen className="h-12 w-12 text-earth-600" />
            </div>
            <Typography variant="h1" className="mb-4">
              Create New Story
            </Typography>
            <Typography variant="large" className="text-gray-600">
              Share your cultural narrative with respect and authenticity
            </Typography>
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
                  placeholder="Enter a compelling title for your story"
                  className={cn(errors.title && 'border-red-500')}
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Storyteller (Optional)
                </label>
                <Select 
                  value={formData.storyteller_id} 
                  onValueChange={(value) => handleInputChange('storyteller_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a storyteller or leave blank if you're the author" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (I am the author)</SelectItem>
                    {storytellers.map(storyteller => (
                      <SelectItem key={storyteller.id} value={storyteller.id}>
                        {storyteller.display_name}
                        {storyteller.elder_status && <Crown className="inline ml-2 h-3 w-3" />}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Story Type *
                  </label>
                  <Select 
                    value={formData.story_type} 
                    onValueChange={(value) => handleInputChange('story_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select story type" />
                    </SelectTrigger>
                    <SelectContent>
                      {STORY_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.story_type && (
                    <p className="text-red-600 text-sm mt-1">{errors.story_type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Target Audience *
                  </label>
                  <Select 
                    value={formData.audience} 
                    onValueChange={(value) => handleInputChange('audience', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target audience" />
                    </SelectTrigger>
                    <SelectContent>
                      {AUDIENCES.map(audience => (
                        <SelectItem key={audience.value} value={audience.value}>
                          <div>
                            <div className="font-medium">{audience.label}</div>
                            <div className="text-xs text-gray-500">{audience.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.audience && (
                    <p className="text-red-600 text-sm mt-1">{errors.audience}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Story Content *
                </label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Write your story here. Share your narrative with authenticity and respect for cultural protocols..."
                  rows={12}
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
                    <SelectValue placeholder="Select sensitivity level" />
                  </SelectTrigger>
                  <SelectContent>
                    {CULTURAL_SENSITIVITY_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        <div>
                          <div className="flex items-center gap-2">
                            <Shield className="h-3 w-3" />
                            <span className="font-medium">{level.label}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{level.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedSensitivity && (
                  <div className={cn('p-3 rounded-lg mt-2', selectedSensitivity.color)}>
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <strong>{selectedSensitivity.label}:</strong> {selectedSensitivity.description}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Cultural Context (Optional)
                </label>
                <Textarea
                  value={formData.cultural_context}
                  onChange={(e) => handleInputChange('cultural_context', e.target.value)}
                  placeholder="Provide additional cultural context, traditions, or protocols relevant to this story..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location (Optional)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Geographic location or cultural territory"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tags (Optional)
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="ceremony, wisdom, family, tradition (comma-separated)"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Review Requirements */}
          <Card className="p-6">
            <Typography variant="h3" className="mb-6 flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Review & Approval
            </Typography>
            
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <Switch
                  id="cultural-review"
                  checked={formData.cultural_review_required}
                  onCheckedChange={(checked) => handleInputChange('cultural_review_required', checked)}
                />
                <div>
                  <label htmlFor="cultural-review" className="text-sm font-medium cursor-pointer">
                    Require Cultural Review
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Have this story reviewed by cultural advisors before publication
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Switch
                  id="elder-approval"
                  checked={formData.elder_approval_required}
                  onCheckedChange={(checked) => handleInputChange('elder_approval_required', checked)}
                />
                <div>
                  <label htmlFor="elder-approval" className="text-sm font-medium cursor-pointer">
                    Require Elder Approval
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Have this story approved by community elders before publication
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange('featured', checked)}
                />
                <div>
                  <label htmlFor="featured" className="text-sm font-medium cursor-pointer">
                    Nominate as Featured Story
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Suggest this story for featuring on the platform
                  </p>
                </div>
              </div>

              {formData.cultural_sensitivity_level === 'high' && !formData.elder_approval_required && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    High sensitivity stories typically require elder approval to ensure cultural protocols are respected.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save as Draft
                </Button>
                
                <Button
                  type="button"
                  onClick={handleSubmitForReview}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit for Review
                </Button>
              </div>
              
              <Typography variant="small" className="text-gray-600 text-center sm:text-right">
                Stories undergo cultural review to ensure respectful sharing
              </Typography>
            </div>
          </Card>
        </form>
      </div>
    </div>
  )
}