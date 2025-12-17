// World Tour Map Type Definitions

export interface MapStoryteller {
  id: string
  name: string
  avatarUrl: string | null
  location: {
    lat: number
    lng: number
    name: string
  }
  locationName: string
  isElder: boolean
  isFeatured: boolean
  impactScore: number
  storyCount: number
  communityRoles: string[]
  impactFocusAreas: string[]
  expertiseAreas: string[]
  culturalAffiliations: string[]
  bio: string
  visibility: string
  metrics?: {
    communityEngagement: number
    culturalPreservation: number
    systemChangeInfluence: number
    mentorshipImpact: number
    crossSectorCollaboration: number
    communitiesReached: number
    documentedOutcomes: string[]
  } | null
}

export interface MapStory {
  id: string
  title: string
  excerpt: string
  themes: string[]
  dominantTheme: string
  location: {
    lat: number
    lng: number
    name: string
  }
  storyteller: {
    id: string
    name: string
    avatarUrl: string | null
    location?: string | null
    isElder?: boolean
    isFeatured?: boolean
    impactScore?: number
    storyCount?: number
    communityRoles?: string[]
    visibility?: string
  }
  keyQuotes: string[]
  createdAt: string
  culturalSensitivity?: string | null
  // Enhanced fields
  hasTranscript?: boolean
  transcriptAnalyzed?: boolean
  isPublic?: boolean
  consentVerified?: boolean
}

export interface ThematicConnection {
  sourceId: string
  targetId: string
  sourceCoords: [number, number]
  targetCoords: [number, number]
  sharedThemes: string[]
  strength: number // 0-1 based on theme overlap
}

export interface TrendingTheme {
  name: string
  count: number
  trend: 'up' | 'down' | 'stable'
  velocity: number // rate of change
  regions: string[]
  isNew: boolean // emerged in last 7 days
  color: string // assigned color for visualization
}

export interface TourStop {
  id: string
  location_text: string
  city?: string
  country?: string
  latitude: number
  longitude: number
  status: 'planned' | 'confirmed' | 'in_progress' | 'completed'
  title?: string
  description?: string
  date_start?: string
  date_end?: string
  stories_collected?: number
  storytellers_met?: number
}

export interface TourRequest {
  id: string
  location_text: string
  city?: string
  country?: string
  latitude?: number
  longitude?: number
  name: string
  why_visit: string
  status: string
}

export interface DreamOrg {
  id: string
  name: string
  logo_url?: string
  website_url?: string
  location_text?: string
  latitude?: number
  longitude?: number
  category: string
  description: string
  why_connect: string
  contact_status: string
}

export interface MapData {
  stops: TourStop[]
  requests: TourRequest[]
  dreamOrgs: DreamOrg[]
  stories: MapStory[]
  thematicConnections: ThematicConnection[]
  trendingThemes: TrendingTheme[]
  themeColorMap: Record<string, string>
  stats: MapStats
}

export interface MapStats {
  totalStops: number
  confirmedStops: number
  completedStops: number
  totalRequests: number
  totalDreamOrgs: number
  totalStories: number
  countriesRequested: number
  uniqueThemes: number
}

export type MarkerType = 'story' | 'stop' | 'request' | 'dreamOrg' | 'storyteller'

export interface SelectedMarker {
  id: string
  type: MarkerType
  data: MapStory | TourStop | TourRequest | DreamOrg | MapStoryteller
}

// Theme color palette for visualization
export const THEME_COLORS: Record<string, string> = {
  // Cultural themes
  'elder wisdom': '#8B4513',
  'cultural preservation': '#CD853F',
  'traditional knowledge': '#D2691E',
  'indigenous rights': '#A0522D',

  // Personal themes
  'healing': '#6B8E23',
  'resilience': '#556B2F',
  'identity': '#9ACD32',
  'family': '#8FBC8F',

  // Community themes
  'community': '#4682B4',
  'connection': '#5F9EA0',
  'education': '#6495ED',
  'youth': '#00CED1',

  // Universal themes
  'hope': '#FFD700',
  'love': '#FF69B4',
  'justice': '#9370DB',
  'transformation': '#DA70D6',

  // Default
  'default': '#718096'
}

export function getThemeColor(theme: string): string {
  const normalizedTheme = theme.toLowerCase()

  // Check for exact match
  if (THEME_COLORS[normalizedTheme]) {
    return THEME_COLORS[normalizedTheme]
  }

  // Check for partial match
  for (const [key, color] of Object.entries(THEME_COLORS)) {
    if (normalizedTheme.includes(key) || key.includes(normalizedTheme)) {
      return color
    }
  }

  // Generate consistent color from theme name
  let hash = 0
  for (let i = 0; i < theme.length; i++) {
    hash = theme.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash % 360)
  return `hsl(${hue}, 65%, 45%)`
}
