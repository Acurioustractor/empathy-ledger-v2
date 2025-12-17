'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  MapPin, Globe, Heart, Users, Plane, Sparkles,
  ArrowRight, MessageCircle, HandHeart, Building2,
  Mic, BookOpen, UserCircle, Compass, Filter, Maximize2, BarChart3
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

import { MapProvider, useMapContext } from './context/MapContext'
import { TourMap } from './components/TourMap'
import { TourRequestForm } from './components/TourRequestForm'
import { DreamOrganizations } from './components/DreamOrganizations'
import { DreamStoryTypes } from './components/DreamStoryTypes'
import { StoryMapSidebar } from './components/StoryMapSidebar'
import { ThemeFilterPanel } from './components/ThemeFilterPanel'
import { ThemeDashboard } from './components/ThemeDashboard'
import { WorldTourNav } from './components/WorldTourNav'
import { ValueShowcase } from './components/ValueShowcase'

// Story types we're seeking
const storyTypes: Array<{
  icon: typeof UserCircle
  title: string
  description: string
  color: 'clay' | 'sage' | 'sky'
}> = [
  {
    icon: UserCircle,
    title: "Elder Wisdom",
    description: "Traditional knowledge, life lessons, and cultural teachings passed down through generations.",
    color: "clay"
  },
  {
    icon: Sparkles,
    title: "Youth Voices",
    description: "Dreams, challenges, and perspectives from the next generation of changemakers.",
    color: "sky"
  },
  {
    icon: Heart,
    title: "Healing Journeys",
    description: "Stories of resilience, recovery, and the path toward personal and collective healing.",
    color: "sage"
  },
  {
    icon: BookOpen,
    title: "Cultural Preservation",
    description: "Practices, ceremonies, languages, and traditions that define community identity.",
    color: "clay"
  },
  {
    icon: Users,
    title: "Community Transformation",
    description: "How communities are creating change, solving problems, and building better futures.",
    color: "sky"
  },
  {
    icon: MessageCircle,
    title: "Cross-Generational Dialogue",
    description: "Conversations between generations that bridge the past, present, and future.",
    color: "sage"
  }
]

export default function WorldTourPage() {
  return (
    <MapProvider>
      <WorldTourContent />
    </MapProvider>
  )
}

function WorldTourContent() {
  const { state, setMapData, setLoading, setError } = useMapContext()
  const { dreamOrgs, isLoading, trendingThemes, activeThemes } = state
  const [showThemeFilter, setShowThemeFilter] = useState(false)

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

  const scrollToForm = () => {
    document.getElementById('request-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Sticky Navigation */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-sky-600" />
            <span className="font-semibold hidden sm:inline">World Tour</span>
          </div>
          <WorldTourNav />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-background to-clay-50/30 dark:from-sky-950/20 dark:via-background dark:to-clay-950/10">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-sky-100/10 to-clay-100/10 dark:from-sky-900/5 dark:to-clay-900/5"
             style={{
               backgroundImage: `radial-gradient(circle at 1px 1px, rgb(120 113 108 / 0.15) 1px, transparent 0)`,
               backgroundSize: '24px 24px'
             }}
        />

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-sky-300/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-clay-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-sage-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <div className="relative inline-block">
              <Badge variant="cultural-featured" size="cultural" className="w-fit mx-auto shadow-lg backdrop-blur-sm">
                <Plane className="w-3 h-3 mr-1" />
                World Tour 2025
              </Badge>
              <div className="absolute -inset-2 bg-gradient-to-r from-sky-400/20 to-clay-400/20 rounded-full blur-lg -z-10"></div>
            </div>

            <div className="relative">
              <Typography variant="h1" className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-center mx-auto">
                Join the{" "}
                <span className="relative inline-block">
                  <span className="text-sky-700 dark:text-sky-300">
                    Empathy Ledger
                  </span>
                  <div className="absolute -inset-1 bg-gradient-to-r from-sky-200/50 to-clay-200/50 dark:from-sky-800/50 dark:to-clay-800/50 rounded-lg blur-sm -z-10"></div>
                </span>
                {" "}World Tour
              </Typography>
            </div>

            <div className="relative max-w-2xl mx-auto">
              <Typography variant="lead" className="text-stone-600 dark:text-stone-400 leading-relaxed">
                We're traveling the world to capture stories that matter. Invite us to your community,
                connect us with storytellers, and be part of a global movement to preserve voices
                and build empathy across cultures.
              </Typography>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent"></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button
                variant="clay-primary"
                size="cultural-lg"
                onClick={scrollToForm}
                className="shadow-lg hover:shadow-xl hover:shadow-clay-200/30 transition-all duration-300"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Invite Us to Your Community
              </Button>
              <Button variant="sage-secondary" size="cultural-lg" asChild className="shadow-lg hover:shadow-xl hover:shadow-sage-200/30 transition-all duration-300">
                <Link href="/about">
                  Learn Our Mission
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-16 md:py-24 bg-background relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <Badge variant="cultural-new" size="cultural" className="mb-4">
              <Globe className="w-3 h-3 mr-1" />
              Interactive Story Map
            </Badge>
            <Typography variant="h2" className="text-3xl md:text-4xl font-bold mb-4">
              Explore Stories Around the World
            </Typography>
            <Typography variant="body-lg" className="text-muted-foreground">
              Click any marker to dive into stories, see thematic connections across continents,
              and discover how humanity is connected through shared experiences.
            </Typography>
          </div>

          {/* Map Controls */}
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <Button
              variant={showThemeFilter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowThemeFilter(!showThemeFilter)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              {showThemeFilter ? 'Hide' : 'Show'} Theme Filters
              {activeThemes.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeThemes.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Theme Filter Panel */}
          {showThemeFilter && (
            <div className="mb-6 max-w-4xl mx-auto">
              <ThemeFilterPanel compact />
            </div>
          )}

          {/* Map */}
          <div className="rounded-2xl overflow-hidden shadow-xl border border-stone-200 dark:border-stone-800">
            <TourMap />
          </div>

          {/* Updated Map Legend */}
          <div className="flex flex-wrap justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-clay-500 flex items-center justify-center">
                <BookOpen className="w-2 h-2 text-white" />
              </div>
              <span className="text-sm text-muted-foreground">Stories</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                <UserCircle className="w-2 h-2 text-white" />
              </div>
              <span className="text-sm text-muted-foreground">Storytellers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm text-muted-foreground">Tour Stops</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-500"></div>
              <span className="text-sm text-muted-foreground">Community Requests</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-sky-500"></div>
              <span className="text-sm text-muted-foreground">Dream Partners</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-purple-500 opacity-60" style={{ borderStyle: 'dashed' }}></div>
              <span className="text-sm text-muted-foreground">Theme Connections</span>
            </div>
          </div>

          {/* Live Stats Banner - Transcript-first */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-clay-50 to-clay-100/50 dark:from-clay-950/50 dark:to-clay-900/30 rounded-xl p-4 text-center border border-clay-200/50 dark:border-clay-800/50">
              <div className="text-2xl md:text-3xl font-bold text-clay-600 dark:text-clay-400">
                {state.stats?.totalTranscripts || state.stats?.analyzedTranscripts || 0}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Interviews</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/50 dark:to-indigo-900/30 rounded-xl p-4 text-center border border-indigo-200/50 dark:border-indigo-800/50">
              <div className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {state.stats?.totalStorytellers || state.storytellers?.length || 0}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Voices</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30 rounded-xl p-4 text-center border border-purple-200/50 dark:border-purple-800/50">
              <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
                {state.stats?.uniqueThemes || trendingThemes.length}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Themes</div>
            </div>
            <div className="bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-950/50 dark:to-sky-900/30 rounded-xl p-4 text-center border border-sky-200/50 dark:border-sky-800/50">
              <div className="text-2xl md:text-3xl font-bold text-sky-600 dark:text-sky-400">
                {state.stats?.totalPublishedStories || state.stories.length || 0}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Stories</div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <StoryMapSidebar />

        {/* Theme Dashboard */}
        <ThemeDashboard />
      </section>

      {/* Value Showcase Section - Shows the immense value of participating */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-stone-50 via-background to-clay-50/30 dark:from-stone-950 dark:via-background dark:to-clay-950/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ValueShowcase />
        </div>
      </section>

      {/* Request Form Section */}
      <section id="request-form" className="py-16 md:py-24 bg-gradient-to-br from-clay-50/50 via-background to-sage-50/30 dark:from-clay-950/10 dark:via-background dark:to-sage-950/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="cultural-featured" size="cultural" className="mb-4">
              <HandHeart className="w-3 h-3 mr-1" />
              Nominate Your Community
            </Badge>
            <Typography variant="h2" className="text-3xl md:text-4xl font-bold mb-4">
              Invite Empathy Ledger to Visit
            </Typography>
            <Typography variant="body-lg" className="text-muted-foreground">
              Know a community with powerful stories to share? Tell us why we should visit,
              who the storytellers are, and how you can help make it happen.
            </Typography>
          </div>

          <div className="max-w-2xl mx-auto">
            <TourRequestForm onSuccess={fetchMapData} />
          </div>
        </div>
      </section>

      {/* Dream Story Types Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="cultural-storyteller" size="cultural" className="mb-4">
              <Mic className="w-3 h-3 mr-1" />
              Stories We Seek
            </Badge>
            <Typography variant="h2" className="text-3xl md:text-4xl font-bold mb-4">
              The Voices We Want to Amplify
            </Typography>
            <Typography variant="body-lg" className="text-muted-foreground">
              We're seeking stories that inspire empathy, preserve culture, and create
              meaningful connections across communities and generations.
            </Typography>
          </div>

          <DreamStoryTypes storyTypes={storyTypes} />
        </div>
      </section>

      {/* Dream Organizations Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-sage-50/50 via-background to-sky-50/30 dark:from-sage-950/10 dark:via-background dark:to-sky-950/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="cultural-new" size="cultural" className="mb-4">
              <Building2 className="w-3 h-3 mr-1" />
              Dream Partners
            </Badge>
            <Typography variant="h2" className="text-3xl md:text-4xl font-bold mb-4">
              Organizations We Dream of Partnering With
            </Typography>
            <Typography variant="body-lg" className="text-muted-foreground">
              These are the organizations doing incredible work that aligns with our mission.
              If you have a connection, we'd love an introduction.
            </Typography>
          </div>

          <DreamOrganizations organizations={dreamOrgs} loading={isLoading} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-clay-100 via-background to-sage-100 dark:from-clay-950/30 dark:via-background dark:to-sage-950/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <Typography variant="h2" className="text-3xl md:text-4xl font-bold">
              Be Part of the Journey
            </Typography>
            <Typography variant="body-lg" className="text-muted-foreground max-w-xl mx-auto">
              Every story matters. Every voice deserves to be heard. Join us in building
              a more empathetic world, one community at a time.
            </Typography>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                variant="clay-primary"
                size="cultural-lg"
                onClick={scrollToForm}
                className="shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Nominate Your Community
              </Button>
              <Button variant="sage-secondary" size="cultural-lg" asChild className="shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href="/stories">
                  Explore Stories
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Mission Values */}
            <div className="pt-8 border-t border-stone-200 dark:border-stone-800 mt-8">
              <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-clay-500" />
                  <span>Consent-First Approach</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-sage-500" />
                  <span>Community Benefit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-sky-500" />
                  <span>Cultural Safety</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
