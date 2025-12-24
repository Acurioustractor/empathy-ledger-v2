/**
 * Theme Taxonomy for Empathy Ledger
 *
 * This centralized theme system enables consistent filtering, tagging,
 * and AI enrichment across storyteller and story cards.
 *
 * Themes are organized into categories that reflect Indigenous storytelling
 * traditions and cultural values.
 */

// Theme Categories with cultural relevance
export const THEME_CATEGORIES = {
  cultural: {
    label: 'Cultural Identity',
    description: 'Stories about cultural heritage, traditions, and identity',
    color: 'earth',
    themes: ['identity', 'heritage', 'tradition', 'language', 'ceremony', 'customs', 'beliefs']
  },
  family: {
    label: 'Family & Kinship',
    description: 'Stories about family bonds, ancestry, and community relationships',
    color: 'sage',
    themes: ['kinship', 'elders', 'children', 'ancestors', 'community', 'generations', 'parenthood']
  },
  land: {
    label: 'Land & Country',
    description: 'Stories about connection to land, nature, and sacred places',
    color: 'clay',
    themes: ['country', 'connection', 'seasons', 'wildlife', 'sacred-sites', 'environment', 'rivers', 'mountains']
  },
  resilience: {
    label: 'Resilience & Healing',
    description: 'Stories of survival, strength, and recovery',
    color: 'amber',
    themes: ['survival', 'adaptation', 'strength', 'healing', 'hope', 'overcoming', 'recovery', 'perseverance']
  },
  knowledge: {
    label: 'Knowledge & Wisdom',
    description: 'Stories carrying traditional knowledge and teachings',
    color: 'purple',
    themes: ['wisdom', 'teaching', 'learning', 'stories', 'dreams', 'prophecy', 'spirituality']
  },
  justice: {
    label: 'Justice & Rights',
    description: 'Stories about advocacy, rights, and social change',
    color: 'blue',
    themes: ['advocacy', 'rights', 'truth-telling', 'reconciliation', 'sovereignty', 'self-determination']
  },
  arts: {
    label: 'Arts & Expression',
    description: 'Stories about creative expression and cultural arts',
    color: 'pink',
    themes: ['art', 'music', 'dance', 'craft', 'storytelling', 'performance', 'visual-arts']
  },
  everyday: {
    label: 'Everyday Life',
    description: 'Stories about daily experiences and personal journeys',
    color: 'stone',
    themes: ['work', 'education', 'health', 'relationships', 'migration', 'urban-life', 'rural-life']
  }
} as const

// Flat list of all themes for easy filtering
export const ALL_THEMES = Object.values(THEME_CATEGORIES).flatMap(cat => cat.themes)

// Theme to category mapping
export const THEME_TO_CATEGORY: Record<string, keyof typeof THEME_CATEGORIES> = {}
Object.entries(THEME_CATEGORIES).forEach(([category, data]) => {
  data.themes.forEach(theme => {
    THEME_TO_CATEGORY[theme] = category as keyof typeof THEME_CATEGORIES
  })
})

// Cultural backgrounds for filtering
export const CULTURAL_BACKGROUNDS = [
  { value: 'first-nations', label: 'First Nations' },
  { value: 'inuit', label: 'Inuit' },
  { value: 'metis', label: 'Métis' },
  { value: 'aboriginal-australian', label: 'Aboriginal Australian' },
  { value: 'torres-strait-islander', label: 'Torres Strait Islander' },
  { value: 'maori', label: 'Māori' },
  { value: 'native-american', label: 'Native American' },
  { value: 'pacific-islander', label: 'Pacific Islander' },
  { value: 'african-diaspora', label: 'African Diaspora' },
  { value: 'other', label: 'Other Indigenous' }
] as const

// Storyteller specialties
export const SPECIALTIES = [
  { value: 'traditional-stories', label: 'Traditional Stories' },
  { value: 'historical-narratives', label: 'Historical Narratives' },
  { value: 'healing-stories', label: 'Healing Stories' },
  { value: 'cultural-teachings', label: 'Cultural Teachings' },
  { value: 'language-preservation', label: 'Language Preservation' },
  { value: 'ceremonial-knowledge', label: 'Ceremonial Knowledge' },
  { value: 'land-connection', label: 'Land Connection' },
  { value: 'family-histories', label: 'Family Histories' },
  { value: 'community-stories', label: 'Community Stories' },
  { value: 'youth-education', label: 'Youth Education' }
] as const

// Story types
export const STORY_TYPES = [
  { value: 'personal', label: 'Personal Journey' },
  { value: 'family', label: 'Family Stories' },
  { value: 'community', label: 'Community Stories' },
  { value: 'cultural', label: 'Cultural Heritage' },
  { value: 'professional', label: 'Professional Life' },
  { value: 'historical', label: 'Historical Events' },
  { value: 'educational', label: 'Educational' },
  { value: 'healing', label: 'Healing & Recovery' }
] as const

// Cultural sensitivity levels
export const SENSITIVITY_LEVELS = [
  { value: 'public', label: 'Public', description: 'Open to all viewers', color: 'green' },
  { value: 'sensitive', label: 'Culturally Sensitive', description: 'View with cultural respect', color: 'amber' },
  { value: 'community', label: 'Community Only', description: 'Restricted to community members', color: 'blue' },
  { value: 'elder', label: 'Elder Knowledge', description: 'Requires elder approval to view', color: 'purple' }
] as const

// Audience types
export const AUDIENCES = [
  { value: 'all', label: 'All Ages' },
  { value: 'children', label: 'Children' },
  { value: 'youth', label: 'Youth' },
  { value: 'adults', label: 'Adults' },
  { value: 'elders', label: 'Elders' }
] as const

// Sort options for storytellers
export const STORYTELLER_SORT_OPTIONS = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'story_count', label: 'Most Stories' },
  { value: 'recent', label: 'Recently Active' },
  { value: 'featured', label: 'Featured First' },
  { value: 'elder', label: 'Elders First' }
] as const

// Sort options for stories
export const STORY_SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title', label: 'Title (A-Z)' },
  { value: 'views', label: 'Most Viewed' },
  { value: 'featured', label: 'Featured First' }
] as const

// Helper functions
export function getThemeCategory(theme: string): keyof typeof THEME_CATEGORIES | null {
  return THEME_TO_CATEGORY[theme] || null
}

export function getThemeColor(theme: string): string {
  const category = getThemeCategory(theme)
  if (!category) return 'stone'
  return THEME_CATEGORIES[category].color
}

export function getCategoryThemes(category: keyof typeof THEME_CATEGORIES): readonly string[] {
  return THEME_CATEGORIES[category].themes
}

export function formatThemeLabel(theme: string): string {
  return theme
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Type exports
export type ThemeCategory = keyof typeof THEME_CATEGORIES
export type Theme = typeof ALL_THEMES[number]
export type CulturalBackground = typeof CULTURAL_BACKGROUNDS[number]['value']
export type Specialty = typeof SPECIALTIES[number]['value']
export type StoryType = typeof STORY_TYPES[number]['value']
export type SensitivityLevel = typeof SENSITIVITY_LEVELS[number]['value']
export type Audience = typeof AUDIENCES[number]['value']
