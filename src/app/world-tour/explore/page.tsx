'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  X, Filter, Maximize2, Minimize2, ChevronLeft, ChevronRight,
  BookOpen, MapPin, Building2, Users, GitBranch, BarChart3,
  Layers, Info, ZoomIn, ZoomOut, Compass, Globe, User, Award, Sparkles
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import { MapProvider, useMapContext } from '../context/MapContext'
import { FullScreenMap } from './FullScreenMap'
import { StoryMapSidebar } from '../components/StoryMapSidebar'
import { ThemeFilterPanel } from '../components/ThemeFilterPanel'
import { WorldTourNavCompact } from '../components/WorldTourNav'
import StoryGalaxyViz from '../components/StoryGalaxyViz'

export default function ExplorePage() {
  return (
    <MapProvider>
      <ExploreContent />
    </MapProvider>
  )
}

function ExploreContent() {
  const { state, setMapData, setLoading, setError, toggleLayer } = useMapContext()
  const {
    stories,
    storytellers,
    stops,
    requests,
    dreamOrgs,
    trendingThemes,
    activeThemes,
    showStories,
    showStorytellers,
    showTourStops,
    showRequests,
    showDreamOrgs,
    showConnections,
    isLoading,
    sidebarOpen,
    stats
  } = state

  const [showFilters, setShowFilters] = useState(false)
  const [showLayers, setShowLayers] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d')

  useEffect(() => {
    fetchMapData()
  }, [])

  const fetchMapData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/world-tour/map-data')
      if (response.ok) {
        const data = await response.json()
        setMapData({
          stops: data.stops || [],
          requests: data.requests || [],
          dreamOrgs: data.dreamOrgs || [],
          stories: data.stories || [],
          storytellers: data.storytellers || [],
          connections: data.thematicConnections || [],
          trendingThemes: data.trendingThemes || [],
          themeColorMap: data.themeColorMap || {},
          stats: data.stats || {},
          isLoading: false
        })
      } else {
        setError('Failed to load map data')
      }
    } catch (error) {
      console.error('Error fetching map data:', error)
      setError('Error loading map data')
    }
  }

  // Auto-hide intro after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 bg-stone-950">
      {/* Full Screen Map or 3D Galaxy */}
      {viewMode === '2d' ? (
        <FullScreenMap />
      ) : (
        <div className="absolute inset-0">
          <StoryGalaxyViz
            stories={stories}
            showControls={true}
            autoRotate={true}
            onStorySelect={(storyId) => {
              // TODO: See issue #9 in empathy-ledger-v2: Handle story selection - could open sidebar with story details
              console.log('Selected story:', storyId)
            }}
          />
        </div>
      )}

      {/* Intro Overlay */}
      {showIntro && !isLoading && (
        <div
          className="absolute inset-0 z-[500] bg-gradient-to-b from-stone-950/90 via-stone-950/70 to-transparent pointer-events-none animate-fade-out"
          style={{ animationDelay: '3s', animationDuration: '2s', animationFillMode: 'forwards' }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white space-y-4 max-w-2xl px-8">
              {viewMode === '2d' ? (
                <>
                  <Globe className="w-16 h-16 mx-auto text-sky-400 animate-pulse" />
                  <h1 className="text-4xl md:text-5xl font-bold">
                    Explore Stories Around the World
                  </h1>
                  <p className="text-lg text-stone-300">
                    Click any marker to discover stories. See how themes connect people across continents.
                  </p>
                </>
              ) : (
                <>
                  <Sparkles className="w-16 h-16 mx-auto text-sky-400 animate-pulse" />
                  <h1 className="text-4xl md:text-5xl font-bold">
                    Story Galaxy
                  </h1>
                  <p className="text-lg text-stone-300">
                    Each node represents a story. Click to explore connections across themes and communities.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4 flex items-center justify-between">
        {/* Left: Nav & Title */}
        <div className="flex items-center gap-4">
          <WorldTourNavCompact variant="transparent" />
          <div className="hidden md:block pl-4 border-l border-white/20">
            <h1 className="text-white font-semibold">Explore Stories</h1>
            <p className="text-white/60 text-xs">
              {stories.length} stories • {trendingThemes.length} themes • {stops.length} tour stops
            </p>
          </div>
        </div>

        {/* Right: Control Buttons */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "bg-white/10 backdrop-blur-md text-white hover:bg-white/20",
              viewMode === '3d' && "bg-white/30"
            )}
            onClick={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}
          >
            {viewMode === '2d' ? (
              <>
                <Sparkles className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">3D Galaxy</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">2D Map</span>
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "bg-white/10 backdrop-blur-md text-white hover:bg-white/20",
              showFilters && "bg-white/30"
            )}
            onClick={() => { setShowFilters(!showFilters); setShowLayers(false) }}
          >
            <Filter className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Themes</span>
            {activeThemes.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 bg-sky-500 text-white">
                {activeThemes.length}
              </Badge>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "bg-white/10 backdrop-blur-md text-white hover:bg-white/20",
              showLayers && "bg-white/30"
            )}
            onClick={() => { setShowLayers(!showLayers); setShowFilters(false) }}
          >
            <Layers className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Layers</span>
          </Button>
        </div>
      </div>

      {/* Theme Filter Panel (Slide Down) */}
      {showFilters && (
        <div className="absolute top-20 left-4 right-4 md:left-auto md:right-4 md:w-[400px] z-[1000] animate-in slide-in-from-top-2">
          <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-lg shadow-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter by Theme
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <ThemeFilterPanel />
          </div>
        </div>
      )}

      {/* Layer Controls Panel (Slide Down) */}
      {showLayers && (
        <div className="absolute top-20 right-4 z-[1000] animate-in slide-in-from-top-2">
          <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-lg shadow-2xl p-4 w-[240px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Map Layers
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowLayers(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <LayerToggle
                icon={<BookOpen className="w-4 h-4" />}
                label="Stories"
                count={stories.length}
                active={showStories}
                color="text-clay-600"
                onClick={() => toggleLayer('stories')}
              />
              <LayerToggle
                icon={<User className="w-4 h-4" />}
                label="Storytellers"
                count={storytellers?.length || 0}
                active={showStorytellers}
                color="text-rose-500"
                onClick={() => toggleLayer('storytellers')}
              />
              <LayerToggle
                icon={<MapPin className="w-4 h-4" />}
                label="Tour Stops"
                count={stops.length}
                active={showTourStops}
                color="text-green-500"
                onClick={() => toggleLayer('stops')}
              />
              <LayerToggle
                icon={<Users className="w-4 h-4" />}
                label="Requests"
                count={requests.length}
                active={showRequests}
                color="text-amber-500"
                onClick={() => toggleLayer('requests')}
              />
              <LayerToggle
                icon={<Building2 className="w-4 h-4" />}
                label="Dream Partners"
                count={dreamOrgs.length}
                active={showDreamOrgs}
                color="text-sky-500"
                onClick={() => toggleLayer('dreamOrgs')}
              />
              <LayerToggle
                icon={<GitBranch className="w-4 h-4" />}
                label="Connections"
                count={state.connections.length}
                active={showConnections}
                color="text-clay-500"
                onClick={() => toggleLayer('connections')}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Stats Bar */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 text-white">
          <div className="flex gap-4 md:gap-6 text-sm">
            <div className="text-center">
              <div className="font-bold text-clay-400">{stats?.totalStories || stories.length}</div>
              <div className="text-xs text-white/60">Stories</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-rose-400">{stats?.totalStorytellers || storytellers?.length || 0}</div>
              <div className="text-xs text-white/60">Voices</div>
            </div>
            <div className="text-center hidden sm:block">
              <div className="font-bold text-amber-400">{stats?.eldersCount || 0}</div>
              <div className="text-xs text-white/60">Elders</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-400">{stats?.analyzedTranscripts || 0}</div>
              <div className="text-xs text-white/60">Interviews</div>
            </div>
            <div className="text-center hidden md:block">
              <div className="font-bold text-clay-400">{stats?.uniqueThemes || trendingThemes.length}</div>
              <div className="text-xs text-white/60">Themes</div>
            </div>
            <div className="text-center hidden md:block">
              <div className="font-bold text-sky-400">{stats?.averageImpactScore || 0}%</div>
              <div className="text-xs text-white/60">Impact</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Indicator */}
      {activeThemes.length > 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000]">
          <div className="bg-sky-500/90 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtering by {activeThemes.length} theme{activeThemes.length !== 1 ? 's' : ''}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-white hover:bg-white/20"
              onClick={() => setShowFilters(true)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <StoryMapSidebar />

      {/* CSS for fade-out animation */}
      <style jsx global>{`
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; pointer-events: none; }
        }
        .animate-fade-out {
          animation-name: fade-out;
        }
      `}</style>
    </div>
  )
}

// Layer Toggle Component
function LayerToggle({
  icon,
  label,
  count,
  active,
  color,
  onClick
}: {
  icon: React.ReactNode
  label: string
  count: number
  active: boolean
  color: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-2 rounded-lg transition-all",
        "hover:bg-stone-100 dark:hover:bg-stone-800",
        active ? "opacity-100" : "opacity-50"
      )}
    >
      <span className={color}>{icon}</span>
      <span className="flex-1 text-left text-sm">{label}</span>
      <span className="text-xs text-muted-foreground">{count}</span>
      <div className={cn(
        "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
        active ? "bg-sky-500 border-sky-500" : "border-stone-300"
      )}>
        {active && <span className="text-white text-xs">✓</span>}
      </div>
    </button>
  )
}
