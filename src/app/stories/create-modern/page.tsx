'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth.context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { StoryTemplates, StoryTemplate, STORY_TEMPLATES } from '@/components/stories/StoryTemplates'
import { GuidedStoryCreator } from '@/components/stories/GuidedStoryCreator'
import { StoryModeSelector } from '@/components/stories/StoryModeSelector'
import { MediaCanvasEditor } from '@/components/media/MediaCanvasEditor'
import { TranscriptImporter } from '@/components/stories/TranscriptImporter'
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  FileText,
  Plus
} from 'lucide-react'
import Link from 'next/link'

type CreationMode = 'mode-selection' | 'template-selection' | 'guided-creation' | 'transcript-import' | 'media-canvas' | 'preview'

interface SelectedStoryMode {
  id: 'quick' | 'rich' | 'transcript' | 'collaborative'
  title: string
  subtitle: string
  description: string
  duration: string
  targetLength: string
  aiFeatures: string[]
  culturalSupport: boolean
  complexity: 'beginner' | 'intermediate' | 'advanced'
}

interface StoryPreview {
  title: string
  content: string
  sections?: any[]
  metadata?: any
}

export default function ModernCreateStoryPage() {
  const router = useRouter()
  const { user, profile, isAuthenticated } = useAuth()
  const [mode, setMode] = useState<CreationMode>('mode-selection')
  const [selectedStoryMode, setSelectedStoryMode] = useState<SelectedStoryMode | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<StoryTemplate | null>(null)
  const [storyPreview, setStoryPreview] = useState<StoryPreview | null>(null)
  const [loading, setLoading] = useState(false)
  const [savedDraft, setSavedDraft] = useState<any>(null)

  // Check for saved drafts on mount
  useEffect(() => {
    const draft = localStorage.getItem('story-draft')
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft)
        setSavedDraft(parsedDraft)
      } catch (e) {
        console.error('Error parsing saved draft:', e)
      }
    }
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [isAuthenticated, router])

  const handleStoryModeSelect = (storyMode: any) => {
    setSelectedStoryMode(storyMode)

    switch (storyMode.id) {
      case 'quick':
      case 'rich':
        setMode('template-selection')
        break
      case 'transcript':
        setMode('transcript-import')
        break
      case 'collaborative':
        setMode('media-canvas')
        break
      default:
        setMode('template-selection')
    }
  }

  const handleTemplateSelect = (template: StoryTemplate) => {
    setSelectedTemplate(template)
    setMode('guided-creation')
  }

  const handleBackToTemplates = () => {
    setSelectedTemplate(null)
    setMode('template-selection')
  }

  const handleBackToModeSelection = () => {
    setSelectedStoryMode(null)
    setSelectedTemplate(null)
    setMode('mode-selection')
  }

  const handleStoryPreview = (storyData: StoryPreview) => {
    setStoryPreview(storyData)
    setMode('preview')
  }

  const handleBackToEditor = () => {
    setMode('guided-creation')
  }

  const handleSaveStory = async (storyData: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...storyData,
          author_id: user?.id,
          storyteller_id: profile?.id,
          tenant_id: profile?.tenant_id
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save story')
      }

      const result = await response.json()

      // Clear the draft
      localStorage.removeItem('story-draft')

      // Redirect to the story or stories list
      router.push(`/stories/${result.story.id}`)

    } catch (error) {
      console.error('Error saving story:', error)
      alert('Failed to save story. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePublishStory = async () => {
    if (!storyPreview) return

    setLoading(true)
    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...storyPreview,
          author_id: user?.id,
          storyteller_id: profile?.id,
          tenant_id: profile?.tenant_id,
          status: 'published',
          story_mode: selectedStoryMode?.id,
          ai_features_used: selectedStoryMode?.aiFeatures,
          creation_method: '2025_ai_assisted',
          cultural_sensitivity_level: selectedTemplate?.culturalSensitivity || selectedStoryMode?.culturalSupport ? 'medium' : 'low'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to publish story')
      }

      const result = await response.json()

      // Clear the draft
      localStorage.removeItem('story-draft')

      // Redirect to the published story
      router.push(`/stories/${result.story.id}`)

    } catch (error) {
      console.error('Error publishing story:', error)
      alert('Failed to publish story. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const continueDraft = () => {
    if (savedDraft) {
      const template = STORY_TEMPLATES.find(t => t.id === savedDraft.template)
      if (template) {
        setSelectedTemplate(template)
        setMode('guided-creation')
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <Typography variant="h2" className="text-2xl font-semibold mb-4">
            Please Sign In
          </Typography>
          <Typography variant="body1" className="text-grey-600 mb-6">
            You need to be signed in to create stories.
          </Typography>
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          {mode === 'mode-selection' ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Sparkles className="w-8 h-8 text-blue-500" />
                <Typography variant="h1" className="text-3xl font-bold">
                  Create Your Story
                </Typography>
              </div>
              <Typography variant="body1" className="text-grey-600 max-w-2xl mx-auto">
                Choose how you'd like to create your story with our 2025 AI-powered platform
              </Typography>
            </div>
          ) : mode === 'template-selection' ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Sparkles className="w-8 h-8 text-blue-500" />
                <Typography variant="h1" className="text-3xl font-bold">
                  Choose Your Template
                </Typography>
              </div>
              <Typography variant="body1" className="text-grey-600 max-w-2xl mx-auto">
                {selectedStoryMode?.title} - {selectedStoryMode?.description}
              </Typography>

              {/* Quick Stats */}
              <div className="flex items-center justify-center space-x-8 text-sm text-grey-600">
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{STORY_TEMPLATES.length} Templates</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>Cultural Guidance</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Auto-Save Drafts</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleBackToModeSelection}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Mode Selection
              </Button>
              <Typography variant="h1" className="text-2xl font-semibold">
                {mode === 'guided-creation' && 'Create Story'}
                {mode === 'transcript-import' && 'Import Transcript'}
                {mode === 'media-canvas' && 'Multimedia Story Builder'}
                {mode === 'preview' && 'Preview Story'}
              </Typography>
              {selectedStoryMode && (
                <Badge variant="outline" className="ml-2">
                  {selectedStoryMode.title}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Saved Draft Notice */}
        {savedDraft && mode === 'mode-selection' && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <strong>Draft Found:</strong> You have an unfinished story "{savedDraft.title || 'Untitled'}"
                (saved {new Date(savedDraft.lastSaved).toLocaleDateString()})
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => localStorage.removeItem('story-draft')}>
                  Discard
                </Button>
                <Button size="sm" onClick={continueDraft}>
                  Continue Draft
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        {mode === 'mode-selection' && (
          <StoryModeSelector
            onModeSelect={handleStoryModeSelect}
            culturalContext={profile?.cultural_sensitivity_level || 'medium'}
            userExperience={profile?.storytelling_experience || 'beginner'}
          />
        )}

        {mode === 'template-selection' && (
          <div>
            <div className="flex items-center space-x-4 mb-6">
              <Button variant="ghost" onClick={handleBackToModeSelection}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Mode Selection
              </Button>
              {selectedStoryMode && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {selectedStoryMode.title}
                  </Badge>
                  <Typography variant="body2" className="text-grey-600">
                    {selectedStoryMode.duration} • {selectedStoryMode.targetLength}
                  </Typography>
                </div>
              )}
            </div>
            <StoryTemplates
              onSelectTemplate={handleTemplateSelect}
              selectedTemplate={selectedTemplate?.id}
            />
          </div>
        )}

        {mode === 'media-canvas' && (
          <div>
            <div className="flex items-center space-x-4 mb-6">
              <Button variant="ghost" onClick={handleBackToModeSelection}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Mode Selection
              </Button>
              {selectedStoryMode && (
                <Badge variant="outline">
                  {selectedStoryMode.title}
                </Badge>
              )}
            </div>
            <MediaCanvasEditor
              onSave={handleSaveStory}
              onPreview={handleStoryPreview}
              culturalContext={profile?.cultural_sensitivity_level || 'medium'}
              storyType={selectedStoryMode?.id || 'collaborative'}
            />
          </div>
        )}

        {mode === 'transcript-import' && (
          <div>
            <div className="flex items-center space-x-4 mb-6">
              <Button variant="ghost" onClick={handleBackToModeSelection}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Mode Selection
              </Button>
              {selectedStoryMode && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {selectedStoryMode.title}
                  </Badge>
                  <Typography variant="body2" className="text-grey-600">
                    {selectedStoryMode.duration} • AI-powered conversion
                  </Typography>
                </div>
              )}
            </div>
            <TranscriptImporter
              onStoryCreated={handleSaveStory}
              onCancel={handleBackToModeSelection}
              culturalContext={profile?.cultural_sensitivity_level || 'medium'}
            />
          </div>
        )}

        {mode === 'guided-creation' && selectedTemplate && (
          <GuidedStoryCreator
            template={selectedTemplate}
            onBack={handleBackToTemplates}
            onSave={handleSaveStory}
            onPreview={handleStoryPreview}
            initialData={savedDraft?.template === selectedTemplate.id ? savedDraft : undefined}
            storyMode={selectedStoryMode}
          />
        )}

        {mode === 'preview' && storyPreview && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Preview Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={handleBackToEditor}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Editor
                </Button>
                <div>
                  <Typography variant="h2" className="text-2xl font-semibold">
                    Story Preview
                  </Typography>
                  {selectedStoryMode && (
                    <Typography variant="body2" className="text-grey-600">
                      {selectedStoryMode.title} • {selectedStoryMode.complexity} level
                    </Typography>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleSaveStory({
                    ...storyPreview,
                    status: 'draft',
                    story_mode: selectedStoryMode?.id,
                    ai_features_used: selectedStoryMode?.aiFeatures
                  })}
                  disabled={loading}
                >
                  Save as Draft
                </Button>
                <Button
                  onClick={handlePublishStory}
                  disabled={loading}
                >
                  Publish Story
                </Button>
              </div>
            </div>

            {/* Preview Content */}
            <Card className="p-8">
              <article className="prose prose-lg max-w-none">
                <h1 className="text-3xl font-bold mb-6">{storyPreview.title}</h1>

                {storyPreview.sections?.map((section, index) => (
                  section.content.trim() && (
                    <div key={index} className="mb-8">
                      <h2 className="text-xl font-semibold mb-4 text-grey-800">
                        {section.title}
                      </h2>
                      <div className="whitespace-pre-wrap text-grey-700 leading-relaxed">
                        {section.content}
                      </div>
                    </div>
                  )
                ))}
              </article>
            </Card>

            {/* Cultural Review Notice */}
            {selectedTemplate?.culturalSensitivity === 'high' || selectedTemplate?.culturalSensitivity === 'restricted' ? (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Cultural Review Required:</strong> Due to the cultural sensitivity of this content,
                  your story will be submitted for cultural review before publication.
                  {selectedTemplate.culturalSensitivity === 'restricted' && ' Elder approval is required for restricted content.'}
                </AlertDescription>
              </Alert>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}