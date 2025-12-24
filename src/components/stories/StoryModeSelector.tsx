'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Zap,
  Palette,
  FileText,
  Users,
  Clock,
  Sparkles,
  Shield,
  ArrowRight,
  CheckCircle,
  Info,
  Heart,
  Globe,
  Mic,
  Video,
  Image,
  BookOpen
} from 'lucide-react'

interface StoryMode {
  id: 'quick' | 'rich' | 'transcript' | 'collaborative'
  title: string
  subtitle: string
  description: string
  duration: string
  targetLength: string
  icon: React.ElementType
  colour: string
  gradient: string
  aiFeatures: string[]
  culturalSupport: boolean
  complexity: 'beginner' | 'intermediate' | 'advanced'
  examples: string[]
  bestFor: string[]
}

const STORY_MODES: StoryMode[] = [
  {
    id: 'quick',
    title: 'Quick Story',
    subtitle: 'Fast & Personal',
    description: 'Perfect for personal narratives and quick storytelling. AI helps with title generation, readability optimization, and basic media integration.',
    duration: '5-10 minutes',
    targetLength: '200-500 words',
    icon: Zap,
    colour: 'text-green-700',
    gradient: 'from-green-500 to-emerald-500',
    aiFeatures: ['Auto-title generation', 'Readability optimization', 'Basic media suggestions', 'Grammar checking'],
    culturalSupport: true,
    complexity: 'beginner',
    examples: ['Personal journey', 'Daily reflection', 'Simple memory', 'Quick update'],
    bestFor: ['First-time storytellers', 'Personal narratives', 'Quick sharing', 'Mobile users']
  },
  {
    id: 'rich',
    title: 'Rich Multimedia Story',
    subtitle: 'Full-Featured Experience',
    description: 'Create immersive multimedia stories with interactive elements, photos, videos, and advanced AI assistance for professional storytelling.',
    duration: '30-60 minutes',
    targetLength: '500+ words with multimedia',
    icon: Palette,
    colour: 'text-clay-700',
    gradient: 'from-clay-500 to-pink-500',
    aiFeatures: ['Content structuring', 'Media suggestions', 'Theme detection', 'Interactive elements', 'Cultural context'],
    culturalSupport: true,
    complexity: 'intermediate',
    examples: ['Community impact story', 'Cultural documentary', 'Photo essay', 'Interactive timeline'],
    bestFor: ['Experienced storytellers', 'Community organisations', 'Educational content', 'Public sharing']
  },
  {
    id: 'transcript',
    title: 'Transform Transcript',
    subtitle: 'From Interview to Story',
    description: 'Convert existing interviews, conversations, or transcripts into polished narrative stories with AI-powered theme extraction and quote integration.',
    duration: '15-30 minutes',
    targetLength: 'Based on source material',
    icon: FileText,
    colour: 'text-sage-700',
    gradient: 'from-sage-500 to-cyan-500',
    aiFeatures: ['Quote extraction', 'Theme identification', 'Narrative structure', 'Speaker attribution', 'Cultural protocol detection'],
    culturalSupport: true,
    complexity: 'intermediate',
    examples: ['Elder interview story', 'Oral history conversion', 'Meeting summary', 'Research narrative'],
    bestFor: ['Oral historians', 'Researchers', 'Community archivists', 'Interview content']
  },
  {
    id: 'collaborative',
    title: 'Community Story',
    subtitle: 'Multiple Voices',
    description: 'Create stories with multiple contributors, featuring real-time collaboration, perspective merging, and community-driven cultural protocols.',
    duration: 'Ongoing process',
    targetLength: 'Variable collaborative content',
    icon: Users,
    colour: 'text-orange-700',
    gradient: 'from-orange-500 to-red-500',
    aiFeatures: ['Perspective merging', 'Voice consistency', 'Cultural protocols', 'Conflict resolution', 'Community consensus'],
    culturalSupport: true,
    complexity: 'advanced',
    examples: ['Community event story', 'Multi-generational narrative', 'Collective memory', 'Shared experience'],
    bestFor: ['Community groups', 'Multi-perspective stories', 'Collective narratives', 'Cultural preservation']
  }
]

interface StoryModeSelectorProps {
  onModeSelect: (mode: StoryMode) => void
  culturalContext?: 'low' | 'medium' | 'high' | 'restricted'
  userExperience?: 'beginner' | 'intermediate' | 'advanced'
}

export function StoryModeSelector({
  onModeSelect,
  culturalContext = 'medium',
  userExperience = 'beginner'
}: StoryModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<StoryMode | null>(null)
  const [showDetails, setShowDetails] = useState<string | null>(null)

  const getSuggestedModes = () => {
    return STORY_MODES.filter(mode => {
      // Suggest modes based on user experience
      if (userExperience === 'beginner') {
        return mode.complexity === 'beginner' || mode.complexity === 'intermediate'
      }
      return true
    })
  }

  const renderModeCard = (mode: StoryMode) => {
    const Icon = mode.icon
    const isSelected = selectedMode?.id === mode.id
    const isExpanded = showDetails === mode.id
    const isSuggested = getSuggestedModes().includes(mode)

    return (
      <Card
        key={mode.id}
        className={`relative overflow-hidden transition-all duration-300 cursor-pointer ${
          isSelected
            ? 'ring-2 ring-purple-500 shadow-lg scale-[1.02]'
            : 'hover:shadow-md hover:scale-[1.01]'
        } ${isSuggested ? 'border-green-200' : ''}`}
        onClick={() => {
          setSelectedMode(mode)
          setShowDetails(isExpanded ? null : mode.id)
        }}
      >
        {/* Suggested Badge */}
        {isSuggested && (
          <Badge className="absolute top-3 right-3 bg-green-100 text-green-800 border-green-300">
            Suggested
          </Badge>
        )}

        {/* Header */}
        <div className={`p-6 bg-gradient-to-r ${mode.gradient} text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <Typography variant="h4" className="font-semibold text-white">
                  {mode.title}
                </Typography>
                <Typography variant="body2" className="text-white/80">
                  {mode.subtitle}
                </Typography>
              </div>
            </div>
            <Badge variant="outline" className="text-white border-white/50">
              {mode.complexity}
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-white/90">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{mode.duration}</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm">{mode.targetLength}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <Typography variant="body2" className="text-stone-600 mb-4">
            {mode.description}
          </Typography>

          {/* AI Features Preview */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4 text-clay-500" />
              <Typography variant="subtitle2" className="font-medium">
                AI Features
              </Typography>
            </div>
            <div className="flex flex-wrap gap-1">
              {mode.aiFeatures.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {mode.aiFeatures.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{mode.aiFeatures.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Best For */}
          <div className="mb-4">
            <Typography variant="caption" className="font-medium text-stone-700 mb-1 block">
              Best for:
            </Typography>
            <Typography variant="caption" className="text-stone-600">
              {mode.bestFor.slice(0, 2).join(', ')}
              {mode.bestFor.length > 2 && '...'}
            </Typography>
          </div>

          {/* Cultural Support */}
          {mode.culturalSupport && (
            <div className="flex items-center space-x-2 text-sm text-green-700">
              <Shield className="w-4 h-4" />
              <span>Cultural sensitivity supported</span>
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t bg-stone-50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* All AI Features */}
              <div>
                <Typography variant="subtitle2" className="font-medium mb-2 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-clay-500" />
                  Complete AI Feature Set
                </Typography>
                <ul className="space-y-1">
                  {mode.aiFeatures.map((feature, index) => (
                    <li key={index} className="text-sm text-stone-600 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Examples */}
              <div>
                <Typography variant="subtitle2" className="font-medium mb-2 flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-red-500" />
                  Story Examples
                </Typography>
                <ul className="space-y-1">
                  {mode.examples.map((example, index) => (
                    <li key={index} className="text-sm text-stone-600">
                      • {example}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6 pt-4 border-t">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onModeSelect(mode)
                }}
                className={`w-full bg-gradient-to-r ${mode.gradient} hover:opacity-90`}
              >
                Start {mode.title}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <Typography variant="h1" className="text-3xl font-bold">
          Choose Your Story Creation Mode
        </Typography>
        <Typography variant="body1" className="text-stone-600 max-w-2xl mx-auto">
          Select the storytelling approach that best fits your needs. Each mode is powered by 2025 AI technology
          while respecting cultural protocols and Indigenous knowledge sovereignty.
        </Typography>
      </div>

      {/* Cultural Context Alert */}
      {culturalContext !== 'low' && (
        <Alert className="border-orange-200 bg-orange-50 max-w-4xl mx-auto">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Cultural Story Mode Active:</strong> Enhanced cultural sensitivity features are enabled.
            All AI suggestions will respect Indigenous protocols and community guidelines.
            {culturalContext === 'restricted' && ' Elder review workflows are available for traditional knowledge.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Start Recommendation */}
      {userExperience === 'beginner' && (
        <Alert className="border-sage-200 bg-sage-50 max-w-4xl mx-auto">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>New to storytelling?</strong> We recommend starting with <strong>Quick Story</strong> mode
            to get familiar with the platform, then exploring richer features as you become more comfortable.
          </AlertDescription>
        </Alert>
      )}

      {/* Mode Selection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {STORY_MODES.map(mode => renderModeCard(mode))}
      </div>

      {/* Feature Comparison */}
      <Card className="p-6 bg-gradient-to-br from-grey-50 to-white">
        <Typography variant="h3" className="text-xl font-semibold mb-4 text-center">
          Not sure which mode to choose?
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <Typography variant="subtitle1" className="font-medium">
              Quick & Easy
            </Typography>
            <Typography variant="caption" className="text-stone-600">
              Choose Quick Story for fast, personal narratives with basic AI assistance
            </Typography>
          </div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-clay-100 rounded-full flex items-center justify-center mx-auto">
              <Palette className="w-6 h-6 text-clay-600" />
            </div>
            <Typography variant="subtitle1" className="font-medium">
              Rich & Interactive
            </Typography>
            <Typography variant="caption" className="text-stone-600">
              Choose Rich Story for multimedia content with advanced features
            </Typography>
          </div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6 text-sage-600" />
            </div>
            <Typography variant="subtitle1" className="font-medium">
              Transform Content
            </Typography>
            <Typography variant="caption" className="text-stone-600">
              Choose Transcript mode to convert existing interviews into stories
            </Typography>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Typography variant="caption" className="text-stone-500">
            💡 You can always switch between modes or upgrade your story format later
          </Typography>
        </div>
      </Card>

      {/* 2025 AI Features Highlight */}
      <Card className="p-6 bg-gradient-to-r from-clay-600 to-pink-600 text-white">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Sparkles className="w-6 h-6" />
          <Typography variant="h3" className="text-xl font-semibold text-white">
            Powered by 2025 AI Technology
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="space-y-2">
            <Globe className="w-8 h-8 mx-auto opacity-80" />
            <Typography variant="caption" className="text-white/90">
              Cultural Intelligence
            </Typography>
          </div>
          <div className="space-y-2">
            <Video className="w-8 h-8 mx-auto opacity-80" />
            <Typography variant="caption" className="text-white/90">
              Multimedia Integration
            </Typography>
          </div>
          <div className="space-y-2">
            <Mic className="w-8 h-8 mx-auto opacity-80" />
            <Typography variant="caption" className="text-white/90">
              Voice Consistency
            </Typography>
          </div>
          <div className="space-y-2">
            <Heart className="w-8 h-8 mx-auto opacity-80" />
            <Typography variant="caption" className="text-white/90">
              Community-Driven
            </Typography>
          </div>
        </div>
      </Card>
    </div>
  )
}