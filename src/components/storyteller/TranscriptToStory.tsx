'use client'

import React, { useState, useEffect } from 'react'
import { useTranscriptAnalysis } from '@/lib/hooks/useTranscriptAnalysis'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Typography } from '@/components/ui/typography'
import { 
  Sparkles, 
  FileText, 
  BookOpen, 
  Loader2,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Clock,
  Hash,
  Heart,
  Camera,
  Edit,
  Save,
  Send,
  ChevronRight,
  Brain,
  Lightbulb,
  Users,
  Shield,
  Tags,
  Building2,
  Bookmark,
  RefreshCw,
  Eye,
  Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TranscriptToStoryProps {
  transcript: {
    id: string
    title: string
    content?: string
    text?: string
    formatted_text?: string
    word_count?: number
    character_count?: number
    duration?: number
    storyteller_id?: string
    cultural_sensitivity?: string
    metadata?: any
  }
  // Enhancement: Organization context for auto-tagging
  organizationContext?: {
    id: string
    name: string
    projects?: Array<{
      id: string
      name: string
      tags?: string[]
    }>
  }
  // Enhancement: Progress saving capabilities
  onProgressSaved?: (progressData: any) => void
  savedProgress?: any
  // Enhancement: Enhanced callbacks with context
  onStoryCreated?: (storyId: string, storyData?: any) => void
  onCancel?: () => void
  onCulturalWarning?: (warning: any) => void
}

export function TranscriptToStory({ 
  transcript, 
  organizationContext,
  onProgressSaved,
  savedProgress,
  onStoryCreated,
  onCancel,
  onCulturalWarning
}: TranscriptToStoryProps) {
  const {
    analyzeTranscript,
    checkAnalysisStatus,
    isAnalyzing,
    progress,
    error,
    result,
    reset
  } = useTranscriptAnalysis()

  const [activeTab, setActiveTab] = useState('analysis')
  const [storyOptions, setStoryOptions] = useState({
    targetAudience: 'all' as const,
    storyType: 'personal' as const,
    maxLength: 3000,
    culturalContext: '',
    generateStory: true,
    includeThemes: true,
    // Enhancement: Auto-tagging features
    selectedProjects: [] as string[],
    suggestedTags: [] as string[],
    customTags: [] as string[]
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editedStory, setEditedStory] = useState('')
  const [hasExistingAnalysis, setHasExistingAnalysis] = useState(false)
  
  // Enhancement: Progress saving state
  const [progressSaved, setProgressSaved] = useState(false)
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null)
  
  // Enhancement: Cultural sensitivity warnings
  const [culturalWarnings, setCulturalWarnings] = useState<any[]>([])
  const [showCulturalGuidance, setShowCulturalGuidance] = useState(false)
  
  // Enhancement: AI suggestions state
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([])
  const [showAISuggestions, setShowAISuggestions] = useState(false)

  useEffect(() => {
    // Check if transcript has already been analysed
    checkAnalysisStatus(transcript.id).then(status => {
      if (status?.hasAnalysis) {
        setHasExistingAnalysis(true)
      }
    })
  }, [transcript.id])

  // Enhancement: Load saved progress
  useEffect(() => {
    if (savedProgress) {
      setStoryOptions(prev => ({
        ...prev,
        ...savedProgress.storyOptions
      }))
      setEditedStory(savedProgress.editedStory || '')
      setActiveTab(savedProgress.activeTab || 'analysis')
    }
  }, [savedProgress])

  // Enhancement: Auto-save progress
  useEffect(() => {
    const saveProgress = () => {
      const progressData = {
        transcriptId: transcript.id,
        storyOptions,
        editedStory,
        activeTab,
        timestamp: new Date().toISOString()
      }
      
      onProgressSaved?.(progressData)
      setProgressSaved(true)
      setLastSaveTime(new Date())
      
      // Reset save indicator after 3 seconds
      setTimeout(() => setProgressSaved(false), 3000)
    }
    
    const timeoutId = setTimeout(saveProgress, 2000) // Auto-save after 2 seconds of inactivity
    return () => clearTimeout(timeoutId)
  }, [storyOptions, editedStory, activeTab, transcript.id, onProgressSaved])

  // Enhancement: Cultural sensitivity analysis
  useEffect(() => {
    if (result?.analysis) {
      const warnings = analyzeCulturalSensitivity(result.analysis)
      setCulturalWarnings(warnings)
      if (warnings.length > 0) {
        setShowCulturalGuidance(true)
        onCulturalWarning?.(warnings)
      }
    }
  }, [result, onCulturalWarning])

  // Enhancement: Cultural sensitivity analysis helper
  const analyzeCulturalSensitivity = (analysis: any) => {
    const warnings: any[] = []
    
    // Check for high sensitivity keywords
    const highSensitivityKeywords = ['ceremony', 'sacred', 'elder', 'traditional', 'spiritual', 'ancestral', 'ritual']
    const mediumSensitivityKeywords = ['cultural', 'heritage', 'community', 'family tradition', 'teachings']
    
    const allContent = [
      ...analysis.themes,
      ...analysis.culturalElements,
      analysis.emotionalTone
    ].join(' ').toLowerCase()

    highSensitivityKeywords.forEach(keyword => {
      if (allContent.includes(keyword)) {
        warnings.push({
          level: 'high',
          type: 'cultural_content',
          keyword,
          message: `This story contains ${keyword} which may require cultural guidance or elder approval`,
          guidance: `Consider consulting with cultural advisors about sharing content related to ${keyword}`
        })
      }
    })

    mediumSensitivityKeywords.forEach(keyword => {
      if (allContent.includes(keyword)) {
        warnings.push({
          level: 'medium',
          type: 'cultural_awareness',
          keyword,
          message: `This story includes ${keyword} - please ensure respectful representation`,
          guidance: `Review the portrayal of ${keyword} to ensure it aligns with community values`
        })
      }
    })

    return warnings
  }

  // Enhancement: Auto-tagging helper
  const generateAutoTags = (analysis: any, organizationContext?: any) => {
    const suggestedTags: string[] = []
    
    // Add theme-based tags
    analysis.themes?.forEach((theme: string) => {
      suggestedTags.push(theme.toLowerCase().replace(/\s+/g, '-'))
    })
    
    // Add cultural element tags
    analysis.culturalElements?.forEach((element: string) => {
      suggestedTags.push(`cultural-${element.toLowerCase().replace(/\s+/g, '-')}`)
    })
    
    // Add organisation/project context tags
    if (organizationContext?.projects) {
      organizationContext.projects.forEach((project: any) => {
        if (project.tags) {
          suggestedTags.push(...project.tags)
        }
      })
    }
    
    return [...new Set(suggestedTags)] // Remove duplicates
  }

  const handleAnalyze = async () => {
    const result = await analyzeTranscript(transcript.id, storyOptions)
    if (result?.story) {
      setEditedStory(result.story.content)
      setActiveTab('story')
      
      // Enhancement: Generate auto-tags
      if (result.analysis) {
        const suggestedTags = generateAutoTags(result.analysis, organizationContext)
        setStoryOptions(prev => ({
          ...prev,
          suggestedTags
        }))
        
        // Generate AI-powered suggestions
        const suggestions = generateAISuggestions(result.analysis, result.story)
        setAiSuggestions(suggestions)
        setShowAISuggestions(suggestions.length > 0)
      }
    }
  }

  // Enhancement: Generate AI-powered suggestions
  const generateAISuggestions = (analysis: any, story: any) => {
    const suggestions: any[] = []

    // Story improvement suggestions
    if (story.metadata.confidence < 0.85) {
      suggestions.push({
        type: 'improvement',
        icon: Lightbulb,
        title: 'Story Enhancement Opportunity',
        description: 'The AI confidence for this story is lower than usual. Consider adding more specific details or cultural context.',
        action: 'Review and enhance',
        priority: 'medium'
      })
    }

    // Cultural guidance suggestions
    if (analysis.culturalElements?.length > 0) {
      suggestions.push({
        type: 'cultural',
        icon: Shield,
        title: 'Cultural Review Recommended',
        description: 'This story contains cultural elements. Consider having it reviewed by community elders or cultural advisors.',
        action: 'Request cultural review',
        priority: 'high'
      })
    }

    // Media enhancement suggestions
    if (analysis.mediaSuggestions?.length > 0) {
      suggestions.push({
        type: 'media',
        icon: Camera,
        title: 'Visual Enhancement Available',
        description: `${analysis.mediaSuggestions.length} media suggestions available to enhance your story's impact.`,
        action: 'Add media',
        priority: 'low'
      })
    }

    // Organization tagging suggestions
    if (organizationContext && storyOptions.selectedProjects.length === 0) {
      suggestions.push({
        type: 'organisation',
        icon: Building2,
        title: 'Link to Organization Project',
        description: 'Consider linking this story to relevant organisation projects for better discovery.',
        action: 'Link to project',
        priority: 'medium'
      })
    }

    return suggestions
  }

  const handleSaveStory = async () => {
    if (!result?.story) return

    try {
      // Enhancement: Include auto-tagging and project linking
      const allTags = [
        ...storyOptions.suggestedTags,
        ...storyOptions.customTags
      ].filter(Boolean)

      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: result.story.title,
          content: editedStory || result.story.content,
          summary: result.story.summary,
          transcript_id: transcript.id,
          storyteller_id: transcript.storyteller_id,
          themes: result.story.themes,
          story_type: storyOptions.storyType,
          status: 'draft',
          ai_generated_summary: true,
          // Enhancement: Include enhanced metadata
          media_metadata: {
            suggestions: result.story.mediaSuggestions,
            culturalWarnings,
            aiSuggestions: aiSuggestions.map(s => ({
              type: s.type,
              title: s.title,
              priority: s.priority
            }))
          },
          // Enhancement: Auto-generated tags
          tags: allTags,
          // Enhancement: Project associations
          project_associations: storyOptions.selectedProjects.map(projectId => ({
            project_id: projectId,
            role: 'story'
          })),
          // Enhancement: Cultural sensitivity data
          cultural_sensitivity_level: determineCulturalSensitivityLevel(),
          requires_elder_approval: culturalWarnings.some(w => w.level === 'high'),
          cultural_notes: culturalWarnings.map(w => w.guidance).join('; ')
        })
      })

      if (response.ok) {
        const { id, story } = await response.json()
        
        // Enhancement: Link to projects if selected
        if (storyOptions.selectedProjects.length > 0) {
          await linkStoryToProjects(id, storyOptions.selectedProjects)
        }
        
        onStoryCreated?.(id, story)
      }
    } catch (err) {
      console.error('Error saving story:', err)
    }
  }

  // Enhancement: Helper function to determine cultural sensitivity level
  const determineCulturalSensitivityLevel = () => {
    if (culturalWarnings.some(w => w.level === 'high')) return 'high'
    if (culturalWarnings.some(w => w.level === 'medium')) return 'medium'
    return 'low'
  }

  // Enhancement: Helper function to link story to projects
  const linkStoryToProjects = async (storyId: string, projectIds: string[]) => {
    try {
      for (const projectId of projectIds) {
        await fetch(`/api/projects/${projectId}/stories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ story_id: storyId, role: 'story' })
        })
      }
    } catch (err) {
      console.error('Error linking story to projects:', err)
    }
  }

  const getProgressMessage = () => {
    if (progress <= 10) return 'Initializing AI analysis...'
    if (progress <= 30) return 'Reading transcript content...'
    if (progress <= 60) return 'Analyzing themes and emotions...'
    if (progress <= 90) return 'Generating story narrative...'
    return 'Finalizing story creation...'
  }

  const transcriptText = transcript.content || transcript.text || transcript.formatted_text || ''
  const wordCount = transcript.word_count || transcriptText.split(/\s+/).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  AI Story Generation
                </CardTitle>
                
                {/* Enhancement: Progress saving indicator */}
                {progressSaved && (
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                    <Bookmark className="h-3 w-3 mr-1" />
                    Saved
                  </Badge>
                )}
                
                {lastSaveTime && !progressSaved && (
                  <span className="text-xs text-muted-foreground">
                    Last saved {lastSaveTime.toLocaleTimeString()}
                  </span>
                )}
              </div>
              
              <CardDescription>
                Transform your transcript into a compelling story using AI with cultural sensitivity
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              {hasExistingAnalysis && (
                <Badge variant="secondary">
                  <Brain className="h-3 w-3 mr-1" />
                  Previously Analyzed
                </Badge>
              )}
              
              {/* Enhancement: Cultural sensitivity indicator */}
              {culturalWarnings.length > 0 && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    culturalWarnings.some(w => w.level === 'high') 
                      ? "text-red-600 border-red-200 bg-red-50" 
                      : "text-orange-600 border-orange-200 bg-orange-50"
                  )}
                >
                  <Shield className="h-3 w-3 mr-1" />
                  Cultural Guidance
                </Badge>
              )}
              
              {/* Enhancement: Organization context indicator */}
              {organizationContext && (
                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                  <Building2 className="h-3 w-3 mr-1" />
                  {organizationContext.name}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-grey-500" />
              <span className="text-muted-foreground">Source:</span>
              <span className="font-medium">{transcript.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-grey-500" />
              <span className="text-muted-foreground">Words:</span>
              <span className="font-medium">{wordCount.toLocaleString()}</span>
            </div>
            {transcript.duration && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-grey-500" />
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{Math.round(transcript.duration / 60)} min</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhancement: Cultural Sensitivity Warnings */}
      {culturalWarnings.length > 0 && showCulturalGuidance && (
        <Alert className={cn(
          culturalWarnings.some(w => w.level === 'high') 
            ? "border-red-200 bg-red-50" 
            : "border-orange-200 bg-orange-50"
        )}>
          <AlertTriangle className="h-4 w-4" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <Typography variant="body-sm" className="font-semibold">
                Cultural Sensitivity Guidance
              </Typography>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowCulturalGuidance(false)}
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-2">
              {culturalWarnings.map((warning, index) => (
                <div key={index} className="text-sm">
                  <p className="font-medium">{warning.message}</p>
                  <p className="text-muted-foreground mt-1">{warning.guidance}</p>
                </div>
              ))}
            </div>
          </div>
        </Alert>
      )}

      {/* Enhancement: AI Suggestions Panel */}
      {showAISuggestions && aiSuggestions.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-600" />
                AI Suggestions
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAISuggestions(false)}
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-md border border-blue-100">
                  <suggestion.icon className={cn(
                    "h-5 w-5 mt-0.5",
                    suggestion.priority === 'high' ? "text-red-500" :
                    suggestion.priority === 'medium' ? "text-orange-500" : "text-blue-500"
                  )} />
                  <div className="flex-1">
                    <Typography variant="body-sm" className="font-medium">
                      {suggestion.title}
                    </Typography>
                    <Typography variant="body-xs" className="text-muted-foreground mt-1">
                      {suggestion.description}
                    </Typography>
                  </div>
                  <Button variant="outline" size="sm">
                    {suggestion.action}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Options Panel */}
      {!isAnalyzing && !result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Story Generation Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Target Audience
                </label>
                <Select
                  value={storyOptions.targetAudience}
                  onValueChange={(value: any) => 
                    setStoryOptions(prev => ({ ...prev, targetAudience: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        All Ages
                      </div>
                    </SelectItem>
                    <SelectItem value="children">Children (5-12)</SelectItem>
                    <SelectItem value="youth">Youth (13-17)</SelectItem>
                    <SelectItem value="adults">Adults (18+)</SelectItem>
                    <SelectItem value="elders">Elders</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Story Type
                </label>
                <Select
                  value={storyOptions.storyType}
                  onValueChange={(value: any) => 
                    setStoryOptions(prev => ({ ...prev, storyType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal Journey</SelectItem>
                    <SelectItem value="family">Family Story</SelectItem>
                    <SelectItem value="community">Community Story</SelectItem>
                    <SelectItem value="cultural">Cultural Heritage</SelectItem>
                    <SelectItem value="professional">Professional Life</SelectItem>
                    <SelectItem value="historical">Historical Event</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="healing">Healing Journey</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Cultural Context (Optional)
              </label>
              <Textarea
                placeholder="Add any cultural context or considerations for the AI to respect..."
                value={storyOptions.culturalContext}
                onChange={(e) => 
                  setStoryOptions(prev => ({ ...prev, culturalContext: e.target.value }))
                }
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Story Length
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="500"
                  value={storyOptions.maxLength}
                  onChange={(e) => 
                    setStoryOptions(prev => ({ ...prev, maxLength: parseInt(e.target.value) }))
                  }
                  className="flex-1"
                />
                <span className="text-sm font-medium w-20 text-right">
                  {storyOptions.maxLength.toLocaleString()} words
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Approximately {Math.ceil(storyOptions.maxLength / 200)} minute read
              </p>
            </div>

            {/* Enhancement: Project Linking */}
            {organizationContext?.projects && organizationContext.projects.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Link to Projects (Optional)
                </label>
                <div className="space-y-2">
                  {organizationContext.projects.map((project) => (
                    <label key={project.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={storyOptions.selectedProjects.includes(project.id)}
                        onChange={(e) => {
                          const isChecked = e.target.checked
                          setStoryOptions(prev => ({
                            ...prev,
                            selectedProjects: isChecked 
                              ? [...prev.selectedProjects, project.id]
                              : prev.selectedProjects.filter(id => id !== project.id)
                          }))
                        }}
                        className="rounded border-grey-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium">{project.name}</span>
                      {project.tags && project.tags.length > 0 && (
                        <div className="flex gap-1">
                          {project.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Enhancement: Auto-tagging Section */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Tags className="h-4 w-4" />
                Story Tags (Auto-generated after analysis)
              </label>
              
              {/* Suggested Tags */}
              {storyOptions.suggestedTags.length > 0 && (
                <div className="mb-3">
                  <Typography variant="body-xs" className="text-muted-foreground mb-2">
                    AI Suggested Tags:
                  </Typography>
                  <div className="flex flex-wrap gap-2">
                    {storyOptions.suggestedTags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Custom Tags Input */}
              <div>
                <Textarea
                  placeholder="Add custom tags (comma-separated)..."
                  value={storyOptions.customTags.join(', ')}
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                    setStoryOptions(prev => ({ ...prev, customTags: tags }))
                  }}
                  rows={2}
                  className="text-sm"
                />
                <Typography variant="body-xs" className="text-muted-foreground mt-1">
                  Tags help organise stories and make them easier to find by your community
                </Typography>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex-1"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Story
              </Button>
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Indicator */}
      {isAnalyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">
                    {getProgressMessage()}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {progress}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {result && (
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Analysis Complete
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={reset}
              >
                Start Over
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="analysis">
                  <Brain className="h-4 w-4 mr-2" />
                  Analysis
                </TabsTrigger>
                <TabsTrigger value="story">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Story ({result.story?.metadata.wordCount || 0} words)
                </TabsTrigger>
                <TabsTrigger value="media">
                  <Camera className="h-4 w-4 mr-2" />
                  Media ({result.analysis.mediaSuggestions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analysis" className="mt-6 space-y-6">
                {/* Themes */}
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Identified Themes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.analysis.themes.map((theme, idx) => (
                      <Badge key={idx} variant="secondary">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Emotional Tone */}
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Emotional Journey
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {result.analysis.emotionalTone}
                  </p>
                </div>

                {/* Key Moments */}
                <div>
                  <h3 className="text-sm font-medium mb-3">
                    Key Story Moments
                  </h3>
                  <div className="space-y-3">
                    {result.analysis.keyMoments.slice(0, 3).map((moment, idx) => (
                      <div key={idx} className="border-l-2 border-purple-200 pl-4">
                        <p className="text-sm">{moment.text}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {moment.significance}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {moment.emotion}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cultural Elements */}
                {result.analysis.culturalElements.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Cultural Elements
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.analysis.culturalElements.map((element, idx) => (
                        <Badge key={idx} variant="outline">
                          {element}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="story" className="mt-6">
                {result.story && (
                  <div className="space-y-4">
                    {/* Story Header */}
                    <div className="border-b pb-4">
                      <h2 className="text-2xl font-bold mb-2">
                        {result.story.title}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {result.story.summary}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>{result.story.metadata.wordCount} words</span>
                        <span>•</span>
                        <span>{result.story.metadata.readingTime} min read</span>
                        <span>•</span>
                        <span>Confidence: {Math.round(result.story.metadata.confidence * 100)}%</span>
                      </div>
                    </div>

                    {/* Story Content */}
                    <div className="relative">
                      {isEditing ? (
                        <Textarea
                          value={editedStory}
                          onChange={(e) => setEditedStory(e.target.value)}
                          className="min-h-[400px] font-serif text-base leading-relaxed"
                        />
                      ) : (
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap font-serif text-base leading-relaxed">
                            {editedStory || result.story.content}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Story Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant={isEditing ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {isEditing ? 'Done Editing' : 'Edit Story'}
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={handleSaveStory}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save as Draft
                      </Button>
                      
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          // Navigate to full story editor
                          window.location.href = `/stories/create?transcript=${transcript.id}&draft=true`
                        }}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Continue to Full Editor
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="media" className="mt-6">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Suggested media to enhance your story:
                  </p>
                  {result.analysis.mediaSuggestions.map((suggestion, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">
                              {suggestion.type}
                            </Badge>
                            <Badge variant="secondary">
                              {suggestion.placement}
                            </Badge>
                          </div>
                          <p className="text-sm">{suggestion.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Related to: {suggestion.relatedTheme}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}