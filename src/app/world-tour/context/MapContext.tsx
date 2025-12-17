'use client'

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react'
import type {
  MapStory,
  TourStop,
  TourRequest,
  DreamOrg,
  ThematicConnection,
  TrendingTheme,
  MarkerType,
  SelectedMarker,
  MapStoryteller
} from '../components/types/map-types'

// State interface
interface MapState {
  // Selection state
  selectedMarker: SelectedMarker | null

  // Filter state
  activeThemes: string[]
  showTourStops: boolean
  showRequests: boolean
  showDreamOrgs: boolean
  showStories: boolean
  showStorytellers: boolean
  showConnections: boolean

  // UI state
  sidebarOpen: boolean
  dashboardExpanded: boolean

  // Data (cached)
  stories: MapStory[]
  storytellers: MapStoryteller[]
  stops: TourStop[]
  requests: TourRequest[]
  dreamOrgs: DreamOrg[]
  connections: ThematicConnection[]
  trendingThemes: TrendingTheme[]
  themeColorMap: Record<string, string>

  // Analytics stats
  stats: {
    totalStops: number
    confirmedStops: number
    completedStops: number
    totalRequests: number
    totalDreamOrgs: number
    // Stories on map (with locations)
    totalStories: number
    totalStoriesWithoutLocation?: number
    // Total published stories (regardless of location)
    totalPublishedStories: number
    // Storytellers on map (with locations)
    totalStorytellers: number
    uniqueThemes: number
    // Transcript-level metrics
    totalTranscripts: number
    analyzedTranscripts: number
    // Story-level metrics
    storiesWithTranscripts: number
    eldersCount: number
    featuredStorytellers: number
    averageImpactScore: number
    consentVerifiedStories: number
    publicStories: number
    aiAnalyzedThemes: number
  }

  // Loading states
  isLoading: boolean
  error: string | null
}

// Action types
type MapAction =
  | { type: 'SELECT_MARKER'; payload: SelectedMarker }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'TOGGLE_THEME'; payload: string }
  | { type: 'SET_ACTIVE_THEMES'; payload: string[] }
  | { type: 'CLEAR_THEME_FILTERS' }
  | { type: 'TOGGLE_LAYER'; payload: 'stops' | 'requests' | 'dreamOrgs' | 'stories' | 'storytellers' | 'connections' }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'TOGGLE_DASHBOARD' }
  | { type: 'SET_DATA'; payload: Partial<MapState> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

// Initial state
const initialState: MapState = {
  selectedMarker: null,
  activeThemes: [],
  showTourStops: true,
  showRequests: true,
  showDreamOrgs: true,
  showStories: true,
  showStorytellers: true,
  showConnections: true,
  sidebarOpen: false,
  dashboardExpanded: false,
  stories: [],
  storytellers: [],
  stops: [],
  requests: [],
  dreamOrgs: [],
  connections: [],
  trendingThemes: [],
  themeColorMap: {},
  stats: {
    totalStops: 0,
    confirmedStops: 0,
    completedStops: 0,
    totalRequests: 0,
    totalDreamOrgs: 0,
    // Stories on map
    totalStories: 0,
    totalStoriesWithoutLocation: 0,
    // Total published stories
    totalPublishedStories: 0,
    // Storytellers on map
    totalStorytellers: 0,
    uniqueThemes: 0,
    // Transcript-level metrics
    totalTranscripts: 0,
    analyzedTranscripts: 0,
    // Story-level metrics
    storiesWithTranscripts: 0,
    eldersCount: 0,
    featuredStorytellers: 0,
    averageImpactScore: 0,
    consentVerifiedStories: 0,
    publicStories: 0,
    aiAnalyzedThemes: 0
  },
  isLoading: true,
  error: null
}

// Reducer
function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case 'SELECT_MARKER':
      return {
        ...state,
        selectedMarker: action.payload,
        sidebarOpen: true
      }

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedMarker: null,
        sidebarOpen: false
      }

    case 'TOGGLE_THEME': {
      const theme = action.payload.toLowerCase()
      const isActive = state.activeThemes.includes(theme)
      return {
        ...state,
        activeThemes: isActive
          ? state.activeThemes.filter(t => t !== theme)
          : [...state.activeThemes, theme]
      }
    }

    case 'SET_ACTIVE_THEMES':
      return {
        ...state,
        activeThemes: action.payload.map(t => t.toLowerCase())
      }

    case 'CLEAR_THEME_FILTERS':
      return {
        ...state,
        activeThemes: []
      }

    case 'TOGGLE_LAYER': {
      const layerMap: Record<string, keyof MapState> = {
        stops: 'showTourStops',
        requests: 'showRequests',
        dreamOrgs: 'showDreamOrgs',
        stories: 'showStories',
        storytellers: 'showStorytellers',
        connections: 'showConnections'
      }
      const key = layerMap[action.payload]
      return {
        ...state,
        [key]: !state[key]
      }
    }

    case 'SET_SIDEBAR_OPEN':
      return {
        ...state,
        sidebarOpen: action.payload
      }

    case 'TOGGLE_DASHBOARD':
      return {
        ...state,
        dashboardExpanded: !state.dashboardExpanded
      }

    case 'SET_DATA':
      return {
        ...state,
        ...action.payload
      }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      }

    default:
      return state
  }
}

// Context interface
interface MapContextValue {
  state: MapState

  // Selection actions
  selectMarker: (id: string, type: MarkerType, data: any) => void
  clearSelection: () => void

  // Filter actions
  toggleTheme: (theme: string) => void
  setActiveThemes: (themes: string[]) => void
  clearThemeFilters: () => void
  toggleLayer: (layer: 'stops' | 'requests' | 'dreamOrgs' | 'stories' | 'storytellers' | 'connections') => void

  // UI actions
  setSidebarOpen: (open: boolean) => void
  toggleDashboard: () => void

  // Data actions
  setMapData: (data: Partial<MapState>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Computed values
  filteredStories: MapStory[]
  filteredConnections: ThematicConnection[]
  visibleMarkerCount: number
}

// Create context
const MapContext = createContext<MapContextValue | null>(null)

// Provider component
export function MapProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(mapReducer, initialState)

  // Selection actions
  const selectMarker = useCallback((id: string, type: MarkerType, data: any) => {
    dispatch({ type: 'SELECT_MARKER', payload: { id, type, data } })
  }, [])

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' })
  }, [])

  // Filter actions
  const toggleTheme = useCallback((theme: string) => {
    dispatch({ type: 'TOGGLE_THEME', payload: theme })
  }, [])

  const setActiveThemes = useCallback((themes: string[]) => {
    dispatch({ type: 'SET_ACTIVE_THEMES', payload: themes })
  }, [])

  const clearThemeFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_THEME_FILTERS' })
  }, [])

  const toggleLayer = useCallback((layer: 'stops' | 'requests' | 'dreamOrgs' | 'stories' | 'storytellers' | 'connections') => {
    dispatch({ type: 'TOGGLE_LAYER', payload: layer })
  }, [])

  // UI actions
  const setSidebarOpen = useCallback((open: boolean) => {
    dispatch({ type: 'SET_SIDEBAR_OPEN', payload: open })
  }, [])

  const toggleDashboard = useCallback(() => {
    dispatch({ type: 'TOGGLE_DASHBOARD' })
  }, [])

  // Data actions
  const setMapData = useCallback((data: Partial<MapState>) => {
    dispatch({ type: 'SET_DATA', payload: data })
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }, [])

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }, [])

  // Computed: filtered stories based on active themes
  const filteredStories = React.useMemo(() => {
    if (state.activeThemes.length === 0) {
      return state.stories
    }

    return state.stories.filter(story =>
      story.themes.some(theme =>
        state.activeThemes.includes(theme.toLowerCase())
      )
    )
  }, [state.stories, state.activeThemes])

  // Computed: filtered connections based on active themes
  const filteredConnections = React.useMemo(() => {
    if (state.activeThemes.length === 0) {
      return state.connections
    }

    return state.connections.filter(conn =>
      conn.sharedThemes.some(theme =>
        state.activeThemes.includes(theme.toLowerCase())
      )
    )
  }, [state.connections, state.activeThemes])

  // Computed: total visible markers
  const visibleMarkerCount = React.useMemo(() => {
    let count = 0
    if (state.showTourStops) count += state.stops.length
    if (state.showRequests) count += state.requests.length
    if (state.showDreamOrgs) count += state.dreamOrgs.length
    if (state.showStories) count += filteredStories.length
    if (state.showStorytellers) count += state.storytellers.length
    return count
  }, [
    state.showTourStops, state.stops.length,
    state.showRequests, state.requests.length,
    state.showDreamOrgs, state.dreamOrgs.length,
    state.showStories, filteredStories.length,
    state.showStorytellers, state.storytellers.length
  ])

  const value: MapContextValue = {
    state,
    selectMarker,
    clearSelection,
    toggleTheme,
    setActiveThemes,
    clearThemeFilters,
    toggleLayer,
    setSidebarOpen,
    toggleDashboard,
    setMapData,
    setLoading,
    setError,
    filteredStories,
    filteredConnections,
    visibleMarkerCount
  }

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  )
}

// Custom hook
export function useMapContext() {
  const context = useContext(MapContext)
  if (!context) {
    throw new Error('useMapContext must be used within a MapProvider')
  }
  return context
}
