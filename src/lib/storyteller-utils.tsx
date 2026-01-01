/**
 * Storyteller Utility Functions
 * Helper functions for storyteller profile features
 */

import * as React from 'react'
import {
  Mic,
  Video,
  Users,
  FileText,
  Camera,
  Music,
  User,
  Palette,
  HandHeart,
  Compass,
  Smile,
  Route,
  Heart,
  Building2,
  Lightbulb
} from 'lucide-react'
import type { StorytellerProfile, ExperienceLevel, StoryTheme, JourneyStep } from '@/types/storyteller'

/**
 * Determines the experience level badge based on years of experience
 */
export const getExperienceLevel = (years: number | null): ExperienceLevel => {
  if (!years) return { label: 'New Storyteller', colour: 'bg-blue-100 text-blue-800' }
  if (years < 2) return { label: 'New Storyteller', colour: 'bg-blue-100 text-blue-800' }
  if (years < 5) return { label: 'Emerging Voice', colour: 'bg-green-100 text-green-800' }
  if (years < 10) return { label: 'Experienced Storyteller', colour: 'bg-purple-100 text-purple-800' }
  if (years < 20) return { label: 'Veteran Storyteller', colour: 'bg-orange-100 text-orange-800' }
  return { label: 'Master Storyteller', colour: 'bg-amber-100 text-amber-800' }
}

/**
 * Returns the appropriate icon for a storytelling style
 */
export const getStorytellingStyleIcon = (style: string): React.ReactNode => {
  switch (style) {
    case 'Oral Tradition':
      return <Mic className="w-4 h-4" />
    case 'Digital Storytelling':
      return <Video className="w-4 h-4" />
    case 'Performance':
      return <Users className="w-4 h-4" />
    case 'Written Narrative':
      return <FileText className="w-4 h-4" />
    case 'Visual Storytelling':
      return <Camera className="w-4 h-4" />
    case 'Song & Music':
      return <Music className="w-4 h-4" />
    case 'Dance & Movement':
      return <User className="w-4 h-4" />
    case 'Interactive':
      return <Palette className="w-4 h-4" />
    default:
      return <User className="w-4 h-4" />
  }
}

/**
 * Extracts story themes from a bio using keyword analysis
 */
export const extractStoryThemes = (bio: string | null): StoryTheme[] => {
  if (!bio) return []

  const themes: StoryTheme[] = []
  const lowerBio = bio.toLowerCase()

  if (lowerBio.includes('volunteer') || lowerBio.includes('service') || lowerBio.includes('community')) {
    themes.push({
      theme: 'Community Service',
      icon: <HandHeart className="w-5 h-5" />,
      description: 'Dedicated to serving and supporting community members'
    })
  }

  if (lowerBio.includes('purpose') || lowerBio.includes('calling') || lowerBio.includes('found') || lowerBio.includes('journey')) {
    themes.push({
      theme: 'Finding Purpose',
      icon: <Compass className="w-5 h-5" />,
      description: 'Discovering meaning and direction in life transitions'
    })
  }

  if (lowerBio.includes('connection') || lowerBio.includes('human') || lowerBio.includes('together') || lowerBio.includes('team')) {
    themes.push({
      theme: 'Human Connection',
      icon: <Users className="w-5 h-5" />,
      description: 'Building meaningful relationships and bonds with others'
    })
  }

  if (lowerBio.includes('humor') || lowerBio.includes('empathy') || lowerBio.includes('uplifting') || lowerBio.includes('camaraderie')) {
    themes.push({
      theme: 'Joy & Empathy',
      icon: <Smile className="w-5 h-5" />,
      description: 'Using humor and understanding to uplift spirits'
    })
  }

  if (lowerBio.includes('retired') || lowerBio.includes('professional') || lowerBio.includes('transition') || lowerBio.includes('newfound')) {
    themes.push({
      theme: 'Life Transitions',
      icon: <Route className="w-5 h-5" />,
      description: 'Navigating changes and new chapters in life'
    })
  }

  if (lowerBio.includes('humanity') || lowerBio.includes('shared') || lowerBio.includes('moments') || lowerBio.includes('remind')) {
    themes.push({
      theme: 'Shared Humanity',
      icon: <Heart className="w-5 h-5" />,
      description: 'Recognizing our common bonds and experiences'
    })
  }

  return themes.slice(0, 4) // Limit to 4 main themes
}

/**
 * Creates journey steps based on storyteller's bio
 */
export const createJourneySteps = (storyteller: StorytellerProfile): JourneyStep[] => {
  const steps: JourneyStep[] = []
  const bio = storyteller.bio || ''

  if (bio.includes('retired') || bio.includes('professional')) {
    steps.push({
      title: 'Professional Career',
      description: 'Building expertise and experience in professional life',
      icon: <Building2 className="w-5 h-5" />,
      timeframe: 'Career Years'
    })
  }

  if (bio.includes('newfound') || bio.includes('found') || bio.includes('calling')) {
    steps.push({
      title: 'Discovering Purpose',
      description: 'Finding new meaning and direction after retirement',
      icon: <Lightbulb className="w-5 h-5" />,
      timeframe: 'Transition'
    })
  }

  if (bio.includes('volunteer') || bio.includes('Orange Sky')) {
    steps.push({
      title: 'Community Service',
      description: 'Joining Orange Sky to provide essential services with human connection',
      icon: <HandHeart className="w-5 h-5" />,
      timeframe: 'Present'
    })
  }

  if (bio.includes('team') || bio.includes('camaraderie') || bio.includes('second home')) {
    steps.push({
      title: 'Building Community',
      description: 'Creating lasting bonds and a sense of belonging through service',
      icon: <Users className="w-5 h-5" />,
      timeframe: 'Ongoing'
    })
  }

  return steps
}