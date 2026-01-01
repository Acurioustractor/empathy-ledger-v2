'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Info,
  BookOpen,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react'
import { StoryTemplate } from './StoryTemplates'
import { FloatingAIAssistant } from '@/components/ai/FloatingAIAssistant'

interface GuidedStoryCreatorProps {
  template: StoryTemplate
  onBack: () => void
  onSave: (storyData: any) => void
  onPreview: (storyData: any) => void
  initialData?: any
}

interface StorySection {
  title: string
  content: string
  completed: boolean
}

export function GuidedStoryCreator({
  template,
  onBack,
  onSave,
  onPreview,
  initialData
}: GuidedStoryCreatorProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [storyTitle, setStoryTitle] = useState(initialData?.title || '')
  const [showGuidance, setShowGuidance] = useState(true)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])

  const [sections, setSections] = useState<StorySection[]>(() => {
    return template.prompts.map((prompt, index) => ({
      title: prompt.title,
      content: initialData?.sections?.[index]?.content || '',
      completed: false
    }))
  })

  const [storyMetadata, setStoryMetadata] = useState({
    culturalSensitivity: template.culturalSensitivity,
    tags: initialData?.tags || [],
    location: initialData?.location || '',
    culturalNotes: initialData?.culturalNotes || ''
  })

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled) {
      const timer = setTimeout(() => {
        handleAutoSave()
      }, 2000) // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timer)
    }
  }, [sections, storyTitle, storyMetadata, autoSaveEnabled])

  const handleAutoSave = () => {
    const storyData = {
      title: storyTitle,
      template: template.id,
      sections,
      metadata: storyMetadata,
      progress: calculateProgress(),
      lastSaved: new Date().toISOString()
    }

    // Save to localStorage as draft
    localStorage.setItem('story-draft', JSON.stringify(storyData))
  }

  const updateSectionContent = (index: number, content: string) => {
    setSections(prev => prev.map((section, i) => ({
      ...section,
      content: i === index ? content : section.content,
      completed: i === index ? content.trim().length > 0 : section.completed
    })))
  }

  const calculateProgress = () => {
    const completedSections = sections.filter(section => section.completed).length
    const titleCompleted = storyTitle.trim().length > 0 ? 1 : 0
    return ((completedSections + titleCompleted) / (sections.length + 1)) * 100
  }

  const canProceed = () => {
    if (currentStep === -1) return storyTitle.trim().length > 0
    return sections[currentStep]?.content?.trim().length > 0
  }

  const goToNextStep = () => {
    if (currentStep < sections.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > -1) {
      setCurrentStep(currentStep - 1)
    } else {
      setCurrentStep(-1)
    }
  }

  const generateStoryPreview = () => {
    let fullStory = `# ${storyTitle}\n\n`

    sections.forEach((section, index) => {
      if (section.content.trim()) {
        fullStory += `## ${section.title}\n\n${section.content}\n\n`
      }
    })

    return fullStory
  }

  const handleFinish = () => {
    const storyData = {
      title: storyTitle,
      content: generateStoryPreview(),
      template: template.id,
      sections,
      metadata: storyMetadata,
      story_type: template.category,
      cultural_sensitivity_level: template.culturalSensitivity,
      status: 'draft'
    }

    onSave(storyData)
  }

  const handlePreview = () => {
    const storyData = {
      title: storyTitle,
      content: generateStoryPreview(),
      sections,
      metadata: storyMetadata
    }

    onPreview(storyData)
  }

  // AI Assistant Handlers
  const handleAISuggestionAccept = (suggestion: string, type: string) => {
    if (type === 'title' && currentStep === -1) {
      setStoryTitle(suggestion)
    } else if (type === 'content' && currentStep >= 0) {
      updateSectionContent(currentStep, sections[currentStep]?.content + ' ' + suggestion)
    }
  }

  const handleCulturalFlag = (issue: string, severity: 'low' | 'medium' | 'high') => {
    // Add cultural sensitivity alert to metadata
    setStoryMetadata(prev => ({
      ...prev,
      culturalFlags: [...(prev.culturalFlags || []), { issue, severity, timestamp: new Date() }]
    }))
  }

  const progress = calculateProgress()
  const currentPrompt = currentStep >= 0 ? template.prompts[currentStep] : null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Button>
          <div>
            <Typography variant="h2" className="text-2xl font-semibold">
              {template.title}
            </Typography>
            <Typography variant="body2" className="text-grey-600">
              {template.description}
            </Typography>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGuidance(!showGuidance)}
          >
            {showGuidance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showGuidance ? 'Hide' : 'Show'} Guidance
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAIAssistant(!showAIAssistant)}
          >
            <Sparkles className="w-4 h-4" />
            AI Assistant
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Typography variant="subtitle2" className="font-medium">
            Story Progress
          </Typography>
          <Typography variant="caption" className="text-sm text-grey-600">
            {Math.round(progress)}% Complete
          </Typography>
        </div>
        <Progress value={progress} className="h-2" />

        <div className="flex items-center justify-between mt-3 text-sm text-grey-600">
          <span>
            Step {Math.max(0, currentStep + 1)} of {sections.length + 1}
          </span>
          <span>
            {sections.filter(s => s.completed).length} of {sections.length} sections completed
          </span>
        </div>
      </Card>

      {/* Cultural Sensitivity Alert */}
      {(template.culturalSensitivity === 'high' || template.culturalSensitivity === 'restricted') && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Cultural Sensitivity Notice:</strong> This story template deals with culturally sensitive content.
            Please review the cultural guidelines carefully and consider consulting with community elders or cultural advisors.
            {template.culturalSensitivity === 'restricted' && ' Elder approval will be required before publication.'}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Story Title Step */}
          {currentStep === -1 && (
            <Card className="p-6">
              <Typography variant="h3" className="text-xl font-semibold mb-4">
                Give Your Story a Title
              </Typography>

              <div className="space-y-4">
                <div>
                  <Input
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    placeholder="Enter a compelling title for your story..."
                    className="text-lg"
                  />
                </div>

                {showGuidance && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Title Tips:</strong> A good title captures the essence of your story and draws readers in.
                      It can be descriptive ("My Journey to Recovery"), emotional ("Finding Home Again"),
                      or intriguing ("The Day Everything Changed").
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </Card>
          )}

          {/* Story Section Steps */}
          {currentStep >= 0 && currentPrompt && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h3" className="text-xl font-semibold">
                  {currentPrompt.title}
                </Typography>
                <Badge variant="outline">
                  Step {currentStep + 1} of {sections.length}
                </Badge>
              </div>

              <div className="space-y-4">
                <Textarea
                  value={sections[currentStep]?.content || ''}
                  onChange={(e) => updateSectionContent(currentStep, e.target.value)}
                  placeholder={currentPrompt.placeholder}
                  rows={8}
                  className="min-h-[200px]"
                />

                {showGuidance && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Writing Guidance:</strong> {currentPrompt.guidance}
                      {currentPrompt.culturalNote && (
                        <div className="mt-2 p-2 bg-orange-50 rounded border-l-2 border-orange-300">
                          <strong>Cultural Note:</strong> {currentPrompt.culturalNote}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Word count */}
                <div className="text-right text-sm text-grey-500">
                  {sections[currentStep]?.content?.split(' ').filter(word => word.length > 0).length || 0} words
                </div>
              </div>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={currentStep === -1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              {currentStep < sections.length - 1 ? (
                <Button
                  onClick={goToNextStep}
                  disabled={!canProceed()}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handlePreview}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    onClick={handleFinish}
                    disabled={progress < 80}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Story
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Story Structure Overview */}
          <Card className="p-4">
            <Typography variant="subtitle1" className="font-semibold mb-3">
              Story Structure
            </Typography>

            <div className="space-y-2">
              {/* Title */}
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-grey-50">
                {storyTitle ? <CheckCircle className="w-4 h-4 text-green-500" /> : <BookOpen className="w-4 h-4 text-grey-400" />}
                <span className="text-sm font-medium">Title</span>
              </div>

              {/* Sections */}
              {sections.map((section, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colours",
                    currentStep === index ? "bg-blue-100 border border-blue-300" : "bg-grey-50 hover:bg-grey-100"
                  )}
                  onClick={() => setCurrentStep(index)}
                >
                  {section.completed ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <BookOpen className="w-4 h-4 text-grey-400" />
                  )}
                  <span className="text-sm font-medium truncate">
                    {section.title}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Cultural Guidelines */}
          {template.culturalGuidelines.length > 0 && (
            <Card className="p-4">
              <Typography variant="subtitle1" className="font-semibold mb-3 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                Cultural Guidelines
              </Typography>

              <ul className="space-y-2">
                {template.culturalGuidelines.map((guideline, index) => (
                  <li key={index} className="text-sm text-grey-600 flex items-start">
                    <span className="w-2 h-2 rounded-full bg-blue-300 mr-2 mt-2 flex-shrink-0"></span>
                    {guideline}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* AI Writing Assistant */}
          <Card className="p-4">
            <Typography variant="subtitle1" className="font-semibold mb-3 flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Writing Assistant
            </Typography>

            <div className="space-y-3">
              <Button variant="outline" size="sm" className="w-full">
                Get Writing Suggestions
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Check Grammar
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Improve Flow
              </Button>
            </div>

            <Typography variant="caption" className="text-xs text-grey-500 mt-2">
              AI assistance respects cultural sensitivity settings
            </Typography>
          </Card>
        </div>
      </div>

      {/* Floating AI Assistant */}
      <FloatingAIAssistant
        storytellerId="current-user"
        currentContent={currentStep === -1 ? storyTitle : (sections[currentStep]?.content || '')}
        culturalContext={template.culturalSensitivity}
        storyType={template.category}
        isVisible={showAIAssistant}
        onToggle={() => setShowAIAssistant(!showAIAssistant)}
        onSuggestionAccept={handleAISuggestionAccept}
        onCulturalFlag={handleCulturalFlag}
      />
    </div>
  )
}

// Utility function for className merging
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}