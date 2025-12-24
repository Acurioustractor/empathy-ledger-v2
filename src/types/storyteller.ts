/**
 * Storyteller Profile Types
 * Domain: Content & Storytelling
 */

export interface StorytellerProfile {
  id: string
  display_name: string
  bio: string | null
  cultural_background: string | null
  specialties: string[] | null
  years_of_experience: number | null
  preferred_topics: string[] | null
  story_count: number
  featured: boolean
  status: 'active' | 'inactive' | 'pending'
  elder_status: boolean
  storytelling_style: string[] | null

  // Location & Territory
  location?: string | null
  geographic_scope?: string | null
  traditional_territory?: string | null

  // Cultural & Knowledge
  traditional_knowledge_keeper?: boolean

  // Metadata (JSON fields)
  availability?: Record<string, unknown> | null
  cultural_protocols?: Record<string, unknown> | null
  community_recognition?: string[] | Record<string, unknown> | string | null
  performance_preferences?: Record<string, unknown> | null
  compensation_preferences?: Record<string, unknown> | null
  travel_availability?: Record<string, unknown> | null
  technical_requirements?: Record<string, unknown> | null

  profile?: {
    avatar_url?: string
    cultural_affiliations?: string[]
    pronouns?: string
    display_name?: string
    bio?: string
    phone?: string
    social_links?: Record<string, string>
    languages_spoken?: string[]
    interests?: string[]
    preferred_communication?: string[]
    occupation?: string
    timezone?: string
  }
}

export interface Story {
  id: string
  title: string
  content: string
  status: 'draft' | 'review' | 'published' | 'archived'
  featured: boolean
  story_type: 'traditional' | 'personal' | 'historical' | 'educational' | 'healing'
  audience: 'children' | 'youth' | 'adults' | 'elders' | 'all'
  cultural_sensitivity_level: 'low' | 'medium' | 'high'
  elder_approval: boolean | null
  cultural_review_status: 'pending' | 'approved' | 'rejected' | 'needs_changes'
  views_count: number
  likes_count: number
  shares_count: number
  reading_time_minutes: number | null
  tags: string[] | null
  location: string | null
  created_at: string
}

export interface StoryTheme {
  theme: string
  icon: React.ReactNode
  description: string
}

export interface JourneyStep {
  title: string
  description: string
  icon: React.ReactNode
  timeframe?: string
}

export interface ExperienceLevel {
  label: string
  colour: string
}