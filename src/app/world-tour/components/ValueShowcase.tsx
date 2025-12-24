'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Globe, Users, BookOpen, Quote, Star,
  MapPin, Heart, Sparkles, Zap,
  ChevronRight, Mic, Building2, Crown,
  BookHeart, HandHeart, Megaphone
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface PlatformStats {
  totalStorytellers: number
  totalStories: number
  totalTranscripts: number
  totalQuotes: number
  totalThemes: number
  totalViews: number
  uniqueCountries: number
  uniqueCities: number
  eldersCount: number
  newStorytellersThisMonth: number
}

interface TopStoryteller {
  id: string
  name: string
  avatarUrl: string | null
  location: string | null
  isElder: boolean
  isFeatured: boolean
  storiesCreated: number
  primaryThemes: string[]
}

interface WisdomQuote {
  id: string
  text: string
  storytellerName: string
  storytellerId: string
  isElder: boolean
  themes: string[]
}

interface ThemeInsight {
  name: string
  category: string
  storyCount: number
  storytellerCount: number
  trend: 'emerging' | 'stable' | 'declining' | 'peak'
  color: string
}

interface ValueDashboardData {
  platformStats: PlatformStats
  topStorytellers: TopStoryteller[]
  wisdomQuotes: WisdomQuote[]
  themeInsights: ThemeInsight[]
  valuePropositions: {
    forStorytellers: string[]
    forOrganizations: string[]
    forCommunities: string[]
  }
}

// Filter quotes to only show meaningful content (not conversation snippets)
function isValidQuote(quote: WisdomQuote): boolean {
  const text = quote.text.trim()

  // Skip if too short
  if (text.length < 50) return false

  // Skip if storyteller name is generic/placeholder
  if (quote.storytellerName === 'A Storyteller' || !quote.storytellerName) return false

  // Skip if quote looks like a form submission or conversation
  const conversationalPatterns = [
    /^(yes|no|okay|sure|thanks|hi|hello|hey)/i,
    /contact form/i,
    /obviously/i,
    /\btest\b/i,
    /lorem ipsum/i,
    /^(I think|I believe|I feel).*\?$/i, // Questions
  ]

  for (const pattern of conversationalPatterns) {
    if (pattern.test(text)) return false
  }

  return true
}

export function ValueShowcase() {
  const [data, setData] = useState<ValueDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'storytellers' | 'organizations' | 'communities'>('storytellers')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/world-tour/value-dashboard')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch value dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-48 bg-stone-200 dark:bg-stone-800 rounded-xl" />
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-stone-200 dark:bg-stone-800 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const { platformStats, topStorytellers, wisdomQuotes, themeInsights, valuePropositions } = data

  // Filter to only valid quotes with identified storytellers
  const validQuotes = wisdomQuotes.filter(isValidQuote)

  // Filter to storytellers with real names and stories
  const featuredStorytellers = topStorytellers.filter(
    s => s.name && s.name !== 'A Storyteller' && s.storiesCreated > 0
  )

  return (
    <div className="space-y-12">
      {/* Hero Stats Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-clay-600 via-clay-700 to-stone-800 p-8 md:p-12 text-white">
        <div className="absolute inset-0 bg-[url('/patterns/topography.svg')] opacity-5" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-6 h-6 text-clay-300" />
            <span className="text-clay-200 text-sm font-medium">Global Storytelling Platform</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Every Story Matters
          </h2>
          <p className="text-clay-100 text-lg max-w-2xl mb-8">
            Join a growing community of storytellers preserving culture, sharing wisdom,
            and building bridges of understanding across the world.
          </p>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <StatCard
              icon={<Users className="w-6 h-6" />}
              value={platformStats.totalStorytellers}
              label="Storytellers"
              subtext={platformStats.newStorytellersThisMonth > 0 ? `+${platformStats.newStorytellersThisMonth} this month` : 'Growing community'}
              accent="bg-rose-500"
            />
            <StatCard
              icon={<BookOpen className="w-6 h-6" />}
              value={platformStats.totalStories}
              label="Stories Shared"
              subtext={platformStats.uniqueCountries > 0 ? `Across ${platformStats.uniqueCountries} countries` : 'And counting'}
              accent="bg-amber-500"
            />
            <StatCard
              icon={<Crown className="w-6 h-6" />}
              value={platformStats.eldersCount}
              label="Community Elders"
              subtext="Sharing wisdom"
              accent="bg-clay-500"
            />
            <StatCard
              icon={<Sparkles className="w-6 h-6" />}
              value={platformStats.totalThemes}
              label="Themes Explored"
              subtext="Rich perspectives"
              accent="bg-green-500"
            />
          </div>
        </div>
      </section>

      {/* What Story Impact Means */}
      <section className="py-8">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-4 text-clay-600 border-clay-300 dark:border-clay-700">
            <Heart className="w-3 h-3 mr-1" />
            Our Philosophy
          </Badge>
          <h3 className="text-2xl md:text-3xl font-bold mb-3">What Story Impact Means to Us</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            At Empathy Ledger, we believe stories create change not through metrics,
            but through authentic human connection and cultural preservation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <ImpactCard
            icon={<BookHeart className="w-8 h-8" />}
            title="Cultural Preservation"
            description="Stories carry the knowledge, traditions, and wisdom of communities. By recording and sharing them, we help preserve cultural heritage for future generations."
            color="from-amber-500 to-orange-600"
          />
          <ImpactCard
            icon={<HandHeart className="w-8 h-8" />}
            title="Building Empathy"
            description="When we hear someone's authentic story, we understand their world. Stories bridge divides and help us see our shared humanity across all differences."
            color="from-rose-500 to-pink-600"
          />
          <ImpactCard
            icon={<Megaphone className="w-8 h-8" />}
            title="Amplifying Voices"
            description="Many communities have stories that deserve to be heard. We provide a platform where every voice matters, regardless of background or circumstance."
            color="from-sage-500 to-terracotta-600"
          />
        </div>
      </section>

      {/* Value Proposition Tabs */}
      <section>
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-sm text-muted-foreground">Value for:</span>
          <div className="flex bg-stone-100 dark:bg-stone-900 rounded-lg p-1">
            {(['storytellers', 'organizations', 'communities'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all",
                  activeTab === tab
                    ? "bg-white dark:bg-stone-800 shadow text-clay-600 dark:text-clay-400"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab === 'storytellers' && <Mic className="w-4 h-4 inline mr-2" />}
                {tab === 'organizations' && <Building2 className="w-4 h-4 inline mr-2" />}
                {tab === 'communities' && <Heart className="w-4 h-4 inline mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {valuePropositions[`for${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` as keyof typeof valuePropositions]?.map((prop, i) => (
            <Card key={i} className="group hover:border-clay-300 dark:hover:border-clay-700 transition-colors">
              <CardContent className="p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{prop}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Storytellers */}
      {featuredStorytellers.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-500" />
                Featured Storytellers
              </h3>
              <p className="text-muted-foreground">Voices from our community</p>
            </div>
            <Link href="/storytellers">
              <Button variant="outline" size="sm">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredStorytellers.slice(0, 4).map((storyteller) => (
              <StorytellerCard key={storyteller.id} storyteller={storyteller} />
            ))}
          </div>
        </section>
      )}

      {/* Wisdom Quotes Gallery - only show if we have valid quotes */}
      {validQuotes.length > 0 && (
        <section className="bg-gradient-to-br from-amber-50 via-stone-50 to-clay-50 dark:from-amber-950/30 dark:via-stone-950 dark:to-clay-950/30 -mx-4 px-4 py-12 md:-mx-8 md:px-8 rounded-xl">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4 text-amber-600 border-amber-300">
                <Quote className="w-3 h-3 mr-1" />
                Wisdom Gallery
              </Badge>
              <h3 className="text-2xl font-bold mb-2">Words That Move Us</h3>
              <p className="text-muted-foreground">
                Meaningful quotes from our storytelling community
              </p>
            </div>

            <div className="space-y-6">
              {validQuotes.slice(0, 3).map((quote) => (
                <QuoteCard key={quote.id} quote={quote} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Themes */}
      {themeInsights.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-clay-500" />
                Themes in Stories
              </h3>
              <p className="text-muted-foreground">
                Common threads across our storytelling community
              </p>
            </div>
            <Link href="/world-tour/insights">
              <Button variant="outline" size="sm">
                Explore Themes <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-3">
            {themeInsights.slice(0, 15).map((theme) => (
              <ThemeTag key={theme.name} theme={theme} />
            ))}
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="text-center py-12">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-clay-100 to-sage-100 dark:from-clay-900/50 dark:to-sage-900/50 rounded-full px-6 py-2 mb-6">
          <Zap className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-medium">Ready to share your story?</span>
        </div>
        <h3 className="text-3xl font-bold mb-4">
          Your Voice Matters
        </h3>
        <p className="text-muted-foreground max-w-xl mx-auto mb-8">
          Join {platformStats.totalStorytellers > 0 ? platformStats.totalStorytellers.toLocaleString() : 'our growing community of'} storytellers who are
          preserving culture, inspiring empathy, and connecting communities worldwide.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/stories/create">
            <Button size="lg" className="bg-clay-600 hover:bg-clay-700">
              <BookOpen className="w-5 h-5 mr-2" />
              Share Your Story
            </Button>
          </Link>
          <Link href="/world-tour/explore">
            <Button size="lg" variant="outline">
              <Globe className="w-5 h-5 mr-2" />
              Explore the Map
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

// Stat Card Component
function StatCard({
  icon,
  value,
  label,
  subtext,
  accent
}: {
  icon: React.ReactNode
  value: number | string
  label: string
  subtext: string
  accent: string
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", accent)}>
        {icon}
      </div>
      <p className="text-3xl font-bold">
        {typeof value === 'number' ? (value > 0 ? value.toLocaleString() : '—') : value}
      </p>
      <p className="text-white/90 font-medium">{label}</p>
      <p className="text-white/60 text-sm">{subtext}</p>
    </div>
  )
}

// Impact Card Component
function ImpactCard({
  icon,
  title,
  description,
  color
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}) {
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all">
      <CardContent className="p-6">
        <div className={cn(
          "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-4",
          color
        )}>
          {icon}
        </div>
        <h4 className="text-lg font-semibold mb-2">{title}</h4>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}

// Storyteller Card Component (simplified - no fake scores)
function StorytellerCard({ storyteller }: { storyteller: TopStoryteller }) {
  return (
    <Card className="group hover:shadow-lg transition-all">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="w-14 h-14 ring-2 ring-white shadow">
            <AvatarImage src={storyteller.avatarUrl || undefined} />
            <AvatarFallback className="bg-clay-100 text-clay-600">
              {storyteller.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{storyteller.name}</p>
            {storyteller.location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {storyteller.location}
              </p>
            )}
            <div className="flex gap-1 mt-1">
              {storyteller.isElder && (
                <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                  <Crown className="w-3 h-3 mr-1" />
                  Elder
                </Badge>
              )}
              {storyteller.isFeatured && (
                <Badge className="text-xs bg-clay-100 text-clay-700 border-clay-200">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
          </div>
        </div>

        {storyteller.storiesCreated > 0 && (
          <p className="text-sm text-muted-foreground mb-3">
            {storyteller.storiesCreated} {storyteller.storiesCreated === 1 ? 'story' : 'stories'} shared
          </p>
        )}

        {storyteller.primaryThemes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {storyteller.primaryThemes.slice(0, 3).map(theme => (
              <Badge key={theme} variant="secondary" className="text-xs">
                {theme}
              </Badge>
            ))}
          </div>
        )}

        <Link href={`/storytellers/${storyteller.id}`}>
          <Button variant="ghost" size="sm" className="w-full">
            View Profile <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

// Quote Card Component (simplified - no fake scores)
function QuoteCard({ quote }: { quote: WisdomQuote }) {
  // Truncate very long quotes for readability
  const displayText = quote.text.length > 400
    ? quote.text.substring(0, 400) + '...'
    : quote.text

  return (
    <div className="relative bg-white dark:bg-stone-900 rounded-xl p-6 md:p-8 shadow-sm border">
      <Quote className="absolute top-4 left-4 w-10 h-10 text-amber-200 dark:text-amber-800" />
      <blockquote className="relative z-10 pl-10 pr-4">
        <p className="text-lg md:text-xl italic leading-relaxed mb-6 text-stone-700 dark:text-stone-300">
          "{displayText}"
        </p>
        <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base text-stone-900 dark:text-stone-100">
              — {quote.storytellerName}
            </span>
            {quote.isElder && (
              <Badge variant="secondary" className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                <Crown className="w-3 h-3 mr-1" />
                Elder
              </Badge>
            )}
          </div>
          {quote.themes.length > 0 && (
            <div className="flex gap-1">
              {quote.themes.slice(0, 2).map(theme => (
                <Badge key={theme} variant="outline" className="text-xs">
                  {theme}
                </Badge>
              ))}
            </div>
          )}
        </footer>
      </blockquote>
    </div>
  )
}

// Theme Tag Component
function ThemeTag({ theme }: { theme: ThemeInsight }) {
  return (
    <Badge
      variant="outline"
      className="px-3 py-1.5 text-sm cursor-pointer hover:shadow transition-shadow"
      style={{
        backgroundColor: `${theme.color}15`,
        borderColor: `${theme.color}40`,
        color: theme.color
      }}
    >
      {theme.name}
      {theme.storyCount > 0 && (
        <span className="ml-2 text-xs opacity-70">{theme.storyCount}</span>
      )}
    </Badge>
  )
}

export default ValueShowcase
