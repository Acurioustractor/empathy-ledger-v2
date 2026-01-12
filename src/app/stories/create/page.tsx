'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth.context'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Typography } from '@/components/ui/typography'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  MapPin,
  Tag,
  Loader2,
  Image as ImageIcon,
  CheckCircle,
  Heart,
  Edit,
  Video
} from 'lucide-react'
import Link from 'next/link'
import StoryContentEditor from '@/components/admin/StoryContentEditor'
import StoryMediaEditor from '@/components/admin/StoryMediaEditor'
import UnifiedContentFields from '@/components/stories/UnifiedContentFields'

const STORY_TYPES = [
  { value: 'personal', label: 'Personal Journey', description: 'Your life experiences, memories, and personal stories' },
  { value: 'family', label: 'Family Stories', description: 'Family history, traditions, and generational tales' },
  { value: 'community', label: 'Community Stories', description: 'Local history, shared experiences, and community narratives' },
  { value: 'cultural', label: 'Cultural Heritage', description: 'Traditional stories, cultural practices, and ancestral wisdom' },
  { value: 'professional', label: 'Professional Life', description: 'Career journeys, workplace experiences, and professional insights' },
  { value: 'historical', label: 'Historical Events', description: 'Historical accounts and documentation' },
  { value: 'educational', label: 'Educational Content', description: 'Teaching stories and lessons learned' },
  { value: 'healing', label: 'Healing & Recovery', description: 'Stories of resilience, healing, and recovery' }
]

const AUDIENCES = [
  { value: 'all', label: 'All Ages', description: 'Suitable for everyone' },
  { value: 'children', label: 'Children', description: 'Ages 5-12' },
  { value: 'youth', label: 'Youth', description: 'Ages 13-17' },
  { value: 'adults', label: 'Adults', description: 'Ages 18+' },
  { value: 'elders', label: 'Elders', description: 'Elder community' }
]

const CONTENT_SHARING_LEVELS = [
  {
    value: 'standard',
    label: 'Standard Story',
    description: 'Standard sharing - appropriate for general audiences',
    colour: 'text-green-800 bg-green-100'
  },
  {
    value: 'sensitive',
    label: 'Sensitive Content',
    description: 'Sensitive content requiring careful handling',
    colour: 'text-blue-800 bg-blue-100'
  },
  {
    value: 'high_sensitivity',
    label: 'High Sensitivity',
    description: 'Highly sensitive cultural or personal content',
    colour: 'text-amber-800 bg-amber-100'
  },
  {
    value: 'restricted',
    label: 'Restricted Access',
    description: 'Restricted access with special protocols required',
    colour: 'text-red-800 bg-red-100'
  }
]

interface FormData {
  title: string
  content: string
  story_type: string
  audience: string
  cultural_sensitivity_level: string
  location: string
  tags: string[] // Changed from string to array
  themes: string[] // New field
  cultural_context: string
  featured: boolean
  elder_approval_required: boolean
  cultural_review_required: boolean
  media_assets: any[]
  // New editorial fields
  article_type?: string | null
  slug?: string
  meta_title?: string
  meta_description?: string
  featured_image_id?: string | null
  syndication_destinations?: string[]
  // Enhancement: Organization and project context
  selectedOrganizations: string[]
  selectedProjects: string[]
  customTags: string[]
  culturalGuidanceNotes: string
  // Media fields for rich editor
  hero_image_url?: string
  hero_image_caption?: string
  video_url?: string
  video_platform?: string
  video_embed_code?: string
  inline_media?: Array<{
    id: string
    url: string
    type: 'image' | 'video'
    caption?: string
    position?: number
  }>
}

export default function CreateStoryPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState('details')
  const [createdStoryId, setCreatedStoryId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    story_type: 'personal',
    audience: 'all',
    cultural_sensitivity_level: 'standard',
    location: '',
    tags: [], // Changed to array
    themes: [], // New field
    cultural_context: '',
    featured: false,
    elder_approval_required: false,
    cultural_review_required: false,
    media_assets: [],
    // New editorial fields
    article_type: null,
    slug: '',
    meta_title: '',
    meta_description: '',
    featured_image_id: null,
    syndication_destinations: [],
    // Enhancement: Organization and project context
    selectedOrganizations: [],
    selectedProjects: [],
    customTags: [],
    culturalGuidanceNotes: ''
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [isAuthenticated, router])

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    const updatedData = { ...formData, [field]: value }
    
    // Auto-enable cultural review for cultural content
    if (field === 'story_type' && value === 'cultural') {
      updatedData.cultural_review_required = true
    }
    if (field === 'cultural_sensitivity_level' && (value === 'high_sensitivity' || value === 'restricted')) {
      updatedData.cultural_review_required = true
    }
    if (field === 'cultural_sensitivity_level' && value === 'restricted') {
      updatedData.elder_approval_required = true
    }
    
    setFormData(updatedData)
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

    // For rich text content, strip HTML tags to get actual text length
    const contentText = formData.content.replace(/<[^>]*>/g, '').trim()
    if (!contentText) {
      newErrors.content = 'Story content is required'
    } else if (contentText.length < 20) {
      newErrors.content = 'Content must be at least 20 characters long'
    }

    if (!formData.story_type) {
      newErrors.story_type = 'Story type is required'
    }

    if (!formData.audience) {
      newErrors.audience = 'Target audience is required'
    }

    if (!formData.cultural_sensitivity_level) {
      newErrors.cultural_sensitivity_level = 'Sharing level is required'
    }

    // Validate restricted content requirements
    if (formData.cultural_sensitivity_level === 'restricted' && !formData.elder_approval_required) {
      newErrors.elder_approval = 'Restricted stories typically require elder approval'
    }

    setErrors(newErrors)

    // Log validation errors for debugging
    if (Object.keys(newErrors).length > 0) {
      console.log('Validation errors:', newErrors)
    }

    return Object.keys(newErrors).length === 0
  }

  const handleSaveDraft = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      await saveStory('draft')
    } catch (error) {
      console.error('Error saving draft:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save draft' })
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
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to submit for review' })
    } finally {
      setLoading(false)
    }
  }

  const saveStory = async (status: 'draft' | 'review') => {
    // Get author ID from auth context
    const authorId = user?.id
    if (!authorId) {
      throw new Error('You must be logged in to create a story')
    }

    // Build complete story data with all fields from the form
    const storyData = {
      title: formData.title,
      content: formData.content,
      author_id: authorId,
      storyteller_id: authorId,
      status: status === 'draft' ? 'draft' : 'review', // Map 'review' to 'review' status
      story_type: formData.story_type,
      audience: formData.audience,
      cultural_sensitivity_level: formData.cultural_sensitivity_level,
      is_featured: formData.featured,
      requires_elder_review: formData.elder_approval_required,
      location: formData.location || null,
      tags: formData.tags || [], // Now already an array
      themes: formData.themes || [], // New field
      cultural_context: formData.cultural_context || null,
      cultural_guidance_notes: formData.culturalGuidanceNotes || null,
      privacy_level: formData.cultural_sensitivity_level === 'standard' ? 'public' : 'private',
      enable_ai_processing: true,
      has_explicit_consent: false,
      // New editorial fields
      article_type: formData.article_type || null,
      slug: formData.slug || null,
      meta_title: formData.meta_title || null,
      meta_description: formData.meta_description || null,
      featured_image_id: formData.featured_image_id || null,
      syndication_destinations: formData.syndication_destinations || [],
      // Media fields
      hero_image_url: formData.hero_image_url || null,
      hero_image_caption: formData.hero_image_caption || null,
      video_url: formData.video_url || null,
      video_platform: formData.video_platform || null,
      video_embed_code: formData.video_embed_code || null,
      inline_media: formData.inline_media || []
    }

    const response = await fetch('/api/stories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(storyData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to save story (${response.status})`)
    }

    const savedStory = await response.json()

    // Store the story ID for media editor
    setCreatedStoryId(savedStory.id)

    if (status === 'draft') {
      // Show success message for draft and switch to media tab
      alert('Story saved as draft! You can now add media.')
      setActiveTab('media')
    } else {
      // Redirect to story page for review submission
      router.push(`/stories/${savedStory.id}`)
    }
  }

  const selectedSensitivity = CONTENT_SHARING_LEVELS.find(
    level => level.value === formData.cultural_sensitivity_level
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="min-h-screen bg-gradient-to-b from-stone-50 via-clay-50/20 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Page Header */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="outline" size="cultural-sm" asChild className="border-stone-300 hover:border-earth-400">
                <Link href="/stories" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Stories
                </Link>
              </Button>
            </div>

            <div className="text-center mb-10">
              <div className="flex justify-center mb-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-earth-600 via-clay-600 to-sage-600 shadow-cultural">
                  <Heart className="h-8 w-8 text-white" />
                </div>
              </div>
              <Typography variant="h1" className="mb-4 text-grey-900">
                Share Your Story
              </Typography>
              <Typography variant="large" className="text-stone-600 max-w-2xl mx-auto">
                Every story matters. Share your experience with respect and authenticity
              </Typography>
              <div className="mt-6 max-w-2xl mx-auto">
                <div className="bg-sage-50 border border-sage-200 rounded-lg p-4">
                  <p className="text-sm text-sage-800 font-medium mb-2">📝 How to create your story:</p>
                  <ol className="text-sm text-sage-700 space-y-1 list-decimal list-inside">
                    <li>Fill in story details (title, type, audience)</li>
                    <li>Write your content with the rich text editor</li>
                    <li>Save as draft to unlock media features</li>
                    <li>Add photos, videos, or Descript links</li>
                    <li>Submit for review when ready</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

        {errors.submit && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {errors.submit}
            </AlertDescription>
          </Alert>
        )}

        <form className="space-y-8">
          {/* Content & Media Tabs */}
          <Card className="border-stone-200 shadow-sm">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b border-stone-100">
                <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-auto">
                  <TabsTrigger
                    value="details"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-earth-600 data-[state=active]:bg-transparent px-6 py-4"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Story Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="content"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-earth-600 data-[state=active]:bg-transparent px-6 py-4"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Content
                  </TabsTrigger>
                  <TabsTrigger
                    value="media"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-earth-600 data-[state=active]:bg-transparent px-6 py-4"
                    disabled={!createdStoryId}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Media
                    {!createdStoryId && <span className="ml-2 text-xs text-grey-400">(Save draft first)</span>}
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Details Tab */}
              <TabsContent value="details" className="p-6 space-y-4">
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
                              <div className="text-xs text-grey-500">{type.description}</div>
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
                              <div className="text-xs text-grey-500">{audience.description}</div>
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

                {/* Article/Editorial Features & Syndication */}
                <div className="mt-8">
                  <UnifiedContentFields
                    formData={formData}
                    onChange={handleInputChange}
                    isSuperAdmin={false}
                    organizations={[]}
                  />
                </div>
              </TabsContent>

              {/* Content Tab - Rich Text Editor */}
              <TabsContent value="content" className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Story Content *
                    </label>
                    <StoryContentEditor
                      content={formData.content}
                      onChange={(content) => handleInputChange('content', content)}
                      placeholder="Write your story here. Share your narrative with authenticity and respect for cultural protocols..."
                      isEditing={true}
                      storytellerId={user?.id}
                      className="min-h-[500px]"
                    />
                    {errors.content && (
                      <p className="text-red-600 text-sm mt-1">{errors.content}</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Media Tab - Advanced Media Editor */}
              <TabsContent value="media" className="p-6">
                {createdStoryId ? (
                  <StoryMediaEditor
                    storyId={createdStoryId}
                    storyTitle={formData.title}
                    mediaData={{
                      hero_image_url: formData.hero_image_url,
                      hero_image_caption: formData.hero_image_caption,
                      video_url: formData.video_url,
                      video_platform: formData.video_platform,
                      video_embed_code: formData.video_embed_code,
                      inline_media: formData.inline_media
                    }}
                    onMediaChange={(data) => {
                      setFormData(prev => ({ ...prev, ...data }))
                    }}
                    isEditing={true}
                    storytellerId={user?.id}
                  />
                ) : (
                  <div className="text-center py-12 text-grey-500">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 text-grey-300" />
                    <p className="font-medium">Save your story as a draft first</p>
                    <p className="text-sm mt-2">You can add media after creating the story</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>

          {/* Privacy & Sharing */}
          <Card className="p-6 border-stone-200 shadow-sm">
            <Typography variant="h3" className="mb-6 flex items-center gap-2 text-grey-900">
              <Shield className="h-5 w-5 text-earth-600" />
              Privacy & Sharing Settings
            </Typography>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Sharing Level *
                </label>
                <Select 
                  value={formData.cultural_sensitivity_level} 
                  onValueChange={(value) => handleInputChange('cultural_sensitivity_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose how to share your story" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_SHARING_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        <div>
                          <div className="flex items-center gap-2">
                            <Shield className="h-3 w-3" />
                            <span className="font-medium">{level.label}</span>
                          </div>
                          <div className="text-xs text-grey-500 mt-1">{level.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedSensitivity && (
                  <div className={cn('p-3 rounded-lg mt-2', selectedSensitivity.colour)}>
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <strong>{selectedSensitivity.label}:</strong> {selectedSensitivity.description}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {(formData.cultural_sensitivity_level === 'high_sensitivity' || formData.cultural_sensitivity_level === 'restricted') && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cultural Context (Required for High Sensitivity/Restricted)
                  </label>
                  <Textarea
                    value={formData.cultural_context}
                    onChange={(e) => handleInputChange('cultural_context', e.target.value)}
                    placeholder="Provide additional cultural context, traditions, or protocols relevant to this story..."
                    rows={4}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location (Optional)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-grey-400 h-4 w-4" />
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
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-grey-400 h-4 w-4" />
                    <Input
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="family, memories, travel, career, love, healing (comma-separated)"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Additional Options */}
          <Card className="p-6 border-stone-200 shadow-sm">
            <Typography variant="h3" className="mb-6 flex items-center gap-2 text-grey-900">
              <Crown className="h-5 w-5 text-amber-600" />
              Additional Options
            </Typography>
            
            <div className="space-y-6">
              {(formData.story_type === 'cultural' || formData.cultural_sensitivity_level === 'high_sensitivity' || formData.cultural_sensitivity_level === 'restricted') && (
                <>
                  <div className="flex items-start gap-3">
                    <Switch
                      id="cultural-review"
                      checked={formData.cultural_review_required}
                      onCheckedChange={(checked) => handleInputChange('cultural_review_required', checked)}
                    />
                    <div>
                      <label htmlFor="cultural-review" className="text-sm font-medium cursor-pointer">
                        Cultural Review
                      </label>
                      <p className="text-xs text-grey-600 mt-1">
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
                        Elder Approval
                      </label>
                      <p className="text-xs text-grey-600 mt-1">
                        Have this story approved by community elders before publication
                      </p>
                    </div>
                  </div>
                </>
              )}

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
                  <p className="text-xs text-grey-600 mt-1">
                    Suggest this story for highlighting on the platform
                  </p>
                </div>
              </div>

              {formData.cultural_sensitivity_level === 'restricted' && !formData.elder_approval_required && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    Restricted stories typically require elder approval to ensure cultural protocols are respected.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6 border-stone-200 shadow-sm bg-stone-50/50">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="cultural"
                  onClick={handleSaveDraft}
                  disabled={loading}
                  className="flex items-center gap-2 border-stone-300 hover:border-earth-400 hover:bg-earth-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save as Draft
                </Button>

                <Button
                  type="button"
                  variant="earth-primary"
                  size="cultural"
                  onClick={handleSubmitForReview}
                  disabled={loading}
                  className="flex items-center gap-2 shadow-cultural hover:shadow-lg"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit for Review
                </Button>
              </div>
              
              <Typography variant="small" className="text-grey-600 text-center sm:text-right">
                {(formData.story_type === 'cultural' || formData.cultural_sensitivity_level === 'high_sensitivity' || formData.cultural_sensitivity_level === 'restricted')
                  ? 'Cultural and sensitive stories undergo review to ensure respectful sharing'
                  : 'Your story will be published once submitted for review'
                }
              </Typography>
            </div>
          </Card>
        </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}