'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Sparkles,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Wand2,
  BookOpen,
  Users,
  Shield,
  ChevronUp,
  ChevronDown,
  X,
  Zap,
  Heart,
  Globe
} from 'lucide-react'

interface AIAssistantProps {
  storytellerId: string
  currentContent: string
  culturalContext: 'low' | 'medium' | 'high' | 'restricted'
  storyType: string
  isVisible: boolean
  onToggle: () => void
  onSuggestionAccept: (suggestion: string, type: string) => void
  onCulturalFlag: (issue: string, severity: 'low' | 'medium' | 'high') => void
}

interface AISuggestion {
  id: string
  type: 'continue' | 'improve' | 'cultural' | 'structure' | 'description'
  title: string
  content: string
  confidence: number
  culturallyApproved: boolean
  reasoning?: string
}

interface CulturalCheck {
  passed: boolean
  issues: Array<{
    type: string
    severity: 'low' | 'medium' | 'high'
    description: string
    suggestion: string
  }>
  protocolsRequired: string[]
}

export function FloatingAIAssistant({
  storytellerId,
  currentContent,
  culturalContext,
  storyType,
  isVisible,
  onToggle,
  onSuggestionAccept,
  onCulturalFlag
}: AIAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeTab, setActiveTab] = useState<'suggestions' | 'cultural' | 'tools'>('suggestions')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [culturalCheck, setCulturalCheck] = useState<CulturalCheck | null>(null)
  const [aiPrompt, setAiPrompt] = useState('')

  // 2025 AI Features: Real-time content analysis
  useEffect(() => {
    if (currentContent && currentContent.length > 100) {
      performCulturalAnalysis()
    }
  }, [currentContent, culturalContext])

  const performCulturalAnalysis = async () => {
    // Simulate AI cultural sensitivity scanning
    const issues = []
    const protocolsRequired = []

    // Mock cultural analysis based on content and context
    if (culturalContext === 'high' || culturalContext === 'restricted') {
      if (currentContent.toLowerCase().includes('traditional') ||
          currentContent.toLowerCase().includes('ceremony') ||
          currentContent.toLowerCase().includes('sacred')) {
        issues.push({
          type: 'traditional_knowledge',
          severity: 'high' as const,
          description: 'Content may contain traditional knowledge requiring elder review',
          suggestion: 'Consider adding elder review requirement before publication'
        })
        protocolsRequired.push('elder_review')
      }
    }

    // Simulate checking for sensitive topics
    if (currentContent.toLowerCase().includes('trauma') ||
        currentContent.toLowerCase().includes('healing')) {
      issues.push({
        type: 'emotional_content',
        severity: 'medium' as const,
        description: 'Content contains emotional themes that may require content warnings',
        suggestion: 'Add appropriate content warnings for sensitive readers'
      })
    }

    setCulturalCheck({
      passed: issues.length === 0 || issues.every(i => i.severity === 'low'),
      issues,
      protocolsRequired
    })
  }

  const generateAISuggestions = async (type: string) => {
    setIsLoading(true)

    try {
      // Simulate 2025 AI suggestion generation
      const newSuggestions: AISuggestion[] = []

      switch (type) {
        case 'continue':
          newSuggestions.push({
            id: 'continue_1',
            type: 'continue',
            title: 'Continue the narrative',
            content: 'The journey that followed taught me lessons I never expected to learn...',
            confidence: 0.85,
            culturallyApproved: true,
            reasoning: 'Based on your storytelling style and cultural context'
          })
          break

        case 'improve':
          newSuggestions.push({
            id: 'improve_1',
            type: 'improve',
            title: 'Enhance emotional resonance',
            content: 'Consider adding sensory details about how this moment felt physically and emotionally',
            confidence: 0.78,
            culturallyApproved: true,
            reasoning: 'Sensory details strengthen reader connection'
          })
          break

        case 'cultural':
          if (culturalContext !== 'low') {
            newSuggestions.push({
              id: 'cultural_1',
              type: 'cultural',
              title: 'Cultural context enhancement',
              content: 'Consider adding context about how this experience connects to community values and traditions',
              confidence: 0.82,
              culturallyApproved: true,
              reasoning: 'Helps readers understand cultural significance'
            })
          }
          break

        case 'structure':
          newSuggestions.push({
            id: 'structure_1',
            type: 'structure',
            title: 'Improve story flow',
            content: 'Consider adding a transition sentence to connect this paragraph to the next section',
            confidence: 0.73,
            culturallyApproved: true,
            reasoning: 'Better flow improves readability'
          })
          break
      }

      setSuggestions(prev => [...prev, ...newSuggestions])
    } catch (error) {
      console.error('AI suggestion generation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomPrompt = async () => {
    if (!aiPrompt.trim()) return

    setIsLoading(true)
    try {
      // Simulate custom AI prompt processing
      const customSuggestion: AISuggestion = {
        id: `custom_${Date.now()}`,
        type: 'improve',
        title: `Custom suggestion: ${aiPrompt.substring(0, 30)}...`,
        content: `Based on your request "${aiPrompt}", consider: [AI-generated suggestion would appear here]`,
        confidence: 0.75,
        culturallyApproved: culturalContext === 'low' || !aiPrompt.toLowerCase().includes('sacred'),
        reasoning: 'Custom AI assistance based on your specific request'
      }

      setSuggestions(prev => [customSuggestion, ...prev])
      setAiPrompt('')
    } catch (error) {
      console.error('Custom AI prompt failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 z-50"
      >
        <Sparkles className="w-6 h-6 text-white" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 max-h-[70vh] overflow-hidden shadow-xl border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50 z-50">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5" />
            <Typography variant="subtitle1" className="font-semibold text-white">
              AI Story Assistant
            </Typography>
            <Badge variant="outline" className="text-white border-white/50">
              2025 Enhanced
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Cultural Status */}
        <div className="mt-2 flex items-center space-x-2">
          <Shield className="w-4 h-4" />
          <span className="text-sm">
            Cultural Level: {culturalContext.toUpperCase()}
          </span>
          {culturalCheck && (
            <Badge
              variant={culturalCheck.passed ? "default" : "destructive"}
              className="text-xs"
            >
              {culturalCheck.passed ? 'Approved' : 'Needs Review'}
            </Badge>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-col h-96">
          {/* Tabs */}
          <div className="flex border-b bg-grey-50">
            {[
              { id: 'suggestions', label: 'AI Suggestions', icon: Lightbulb },
              { id: 'cultural', label: 'Cultural Check', icon: Shield },
              { id: 'tools', label: 'AI Tools', icon: Wand2 }
            ].map(tab => (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 rounded-none border-b-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 bg-white text-purple-700'
                    : 'border-transparent hover:bg-grey-100'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-1" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'suggestions' && (
              <div className="space-y-4">
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateAISuggestions('continue')}
                    disabled={isLoading}
                    className="text-xs h-8"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Continue Writing
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateAISuggestions('improve')}
                    disabled={isLoading}
                    className="text-xs h-8"
                  >
                    <Heart className="w-3 h-3 mr-1" />
                    Improve Flow
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateAISuggestions('cultural')}
                    disabled={isLoading}
                    className="text-xs h-8"
                  >
                    <Globe className="w-3 h-3 mr-1" />
                    Cultural Context
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateAISuggestions('structure')}
                    disabled={isLoading}
                    className="text-xs h-8"
                  >
                    <BookOpen className="w-3 h-3 mr-1" />
                    Story Structure
                  </Button>
                </div>

                {/* Custom Prompt */}
                <div className="space-y-2">
                  <Typography variant="caption" className="font-medium">
                    Custom AI Request:
                  </Typography>
                  <div className="flex space-x-2">
                    <Textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Ask AI to help with specific writing needs..."
                      rows={2}
                      className="text-sm"
                    />
                    <Button
                      onClick={handleCustomPrompt}
                      disabled={isLoading || !aiPrompt.trim()}
                      size="sm"
                      className="px-3"
                    >
                      <Sparkles className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Suggestions List */}
                <div className="space-y-3">
                  {suggestions.length === 0 && !isLoading && (
                    <Typography variant="caption" className="text-grey-500 text-center block">
                      Click buttons above to get AI writing suggestions
                    </Typography>
                  )}

                  {isLoading && (
                    <div className="flex items-center justify-center py-4">
                      <Sparkles className="w-4 h-4 animate-spin mr-2" />
                      <Typography variant="caption">
                        AI thinking...
                      </Typography>
                    </div>
                  )}

                  {suggestions.map(suggestion => (
                    <Card key={suggestion.id} className="p-3 border border-grey-200">
                      <div className="flex items-start justify-between mb-2">
                        <Typography variant="subtitle2" className="font-medium text-sm">
                          {suggestion.title}
                        </Typography>
                        <Badge
                          variant={suggestion.culturallyApproved ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {Math.round(suggestion.confidence * 100)}%
                        </Badge>
                      </div>

                      <Typography variant="caption" className="text-grey-600 mb-2 block">
                        {suggestion.content}
                      </Typography>

                      {suggestion.reasoning && (
                        <Typography variant="caption" className="text-grey-500 text-xs italic mb-2 block">
                          {suggestion.reasoning}
                        </Typography>
                      )}

                      {!suggestion.culturallyApproved && (
                        <Alert className="mb-2 p-2">
                          <AlertTriangle className="h-3 w-3" />
                          <AlertDescription className="text-xs">
                            Cultural review recommended for this suggestion
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => onSuggestionAccept(suggestion.content, suggestion.type)}
                          className="text-xs h-7 px-2"
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))}
                          className="text-xs h-7 px-2"
                        >
                          Dismiss
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'cultural' && (
              <div className="space-y-4">
                {culturalCheck ? (
                  <>
                    <div className="flex items-center space-x-2">
                      {culturalCheck.passed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                      )}
                      <Typography variant="subtitle2" className="font-medium">
                        Cultural Analysis
                      </Typography>
                    </div>

                    {culturalCheck.issues.length > 0 && (
                      <div className="space-y-2">
                        {culturalCheck.issues.map((issue, index) => (
                          <Alert
                            key={index}
                            className={`p-3 ${
                              issue.severity === 'high' ? 'border-red-200 bg-red-50' :
                              issue.severity === 'medium' ? 'border-orange-200 bg-orange-50' :
                              'border-yellow-200 bg-yellow-50'
                            }`}
                          >
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <Typography variant="subtitle2" className="font-medium mb-1">
                                {issue.type.replace('_', ' ').toUpperCase()}
                              </Typography>
                              <Typography variant="caption" className="text-sm mb-2 block">
                                {issue.description}
                              </Typography>
                              <Typography variant="caption" className="text-xs italic">
                                Suggestion: {issue.suggestion}
                              </Typography>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    )}

                    {culturalCheck.protocolsRequired.length > 0 && (
                      <div>
                        <Typography variant="subtitle2" className="font-medium mb-2">
                          Required Protocols:
                        </Typography>
                        <div className="space-y-1">
                          {culturalCheck.protocolsRequired.map((protocol, index) => (
                            <Badge key={index} variant="outline" className="mr-2">
                              {protocol.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Typography variant="caption" className="text-grey-500">
                    Write some content to see cultural analysis
                  </Typography>
                )}
              </div>
            )}

            {activeTab === 'tools' && (
              <div className="space-y-4">
                <Typography variant="subtitle2" className="font-medium">
                  2025 AI Writing Tools
                </Typography>

                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Generate Story Title Ideas
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Create Story Outline
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                    <Users className="w-4 h-4 mr-2" />
                    Suggest Collaboration Partners
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                    <Globe className="w-4 h-4 mr-2" />
                    Add Cultural Context
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                    <Heart className="w-4 h-4 mr-2" />
                    Enhance Emotional Impact
                  </Button>
                </div>

                <Alert className="p-3 bg-blue-50 border-blue-200">
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>AI Ethics:</strong> All suggestions respect cultural protocols and Indigenous knowledge sovereignty
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}