'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  X, MapPin, User, Calendar, Quote, ArrowRight,
  BookOpen, Building2, Users, Sparkles, ExternalLink,
  Loader2, AlertCircle, Star, Award, Target, Heart, Globe,
  TrendingUp, Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useMapContext } from '../context/MapContext'
import { getThemeColor } from './types/map-types'

interface StoryDetail {
  story: {
    id: string
    title: string
    excerpt: string
    fullContent: string
    themes: string[]
    keyQuotes: { text: string; context: string }[]
    createdAt: string
    location: { name: string; lat: number; lng: number } | null
    culturalSensitivity: string | null
    storyType: string | null
  }
  storyteller: {
    id: string
    name: string
    avatarUrl: string | null
    bio: string
    otherStories: { id: string; title: string }[]
    profileUrl: string
  }
  connections: {
    storyId: string
    title: string
    sharedThemes: string[]
    location: string
    storytellerName: string
  }[]
  themeColors: Record<string, string>
}

export function StoryMapSidebar() {
  const { state, clearSelection, toggleTheme, selectMarker } = useMapContext()
  const { selectedMarker, sidebarOpen } = state

  const [storyDetail, setStoryDetail] = useState<StoryDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch story details when a story is selected
  useEffect(() => {
    if (selectedMarker?.type === 'story' && selectedMarker.id) {
      fetchStoryDetail(selectedMarker.id)
    } else {
      setStoryDetail(null)
    }
  }, [selectedMarker])

  const fetchStoryDetail = async (storyId: string) => {
    // For demo stories, use the data already in selectedMarker
    if (storyId.startsWith('demo-')) {
      const demoData = selectedMarker?.data
      if (demoData) {
        setStoryDetail({
          story: {
            id: demoData.id,
            title: demoData.title,
            excerpt: demoData.excerpt,
            fullContent: demoData.excerpt,
            themes: demoData.themes || [],
            keyQuotes: demoData.keyQuotes?.map((q: string) => ({ text: q, context: '' })) || [],
            createdAt: demoData.createdAt,
            location: demoData.location,
            culturalSensitivity: demoData.culturalSensitivity,
            storyType: 'demonstration'
          },
          storyteller: {
            id: demoData.storyteller?.id || 'demo',
            name: demoData.storyteller?.name || 'Demo Storyteller',
            avatarUrl: demoData.storyteller?.avatarUrl || null,
            bio: 'This is a demonstration story showing how the platform visualizes stories from around the world.',
            otherStories: [],
            profileUrl: '#'
          },
          connections: [],
          themeColors: {}
        })
      }
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/world-tour/stories/${storyId}`)
      if (!response.ok) throw new Error('Failed to fetch story')
      const data = await response.json()
      setStoryDetail(data)
    } catch (err) {
      setError('Unable to load story details')
      console.error('Story fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!sidebarOpen) return null

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-[1001] w-full sm:w-[400px] md:w-[450px]",
        "bg-background border-l shadow-2xl",
        "transform transition-transform duration-300 ease-out",
        sidebarOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-clay-50 to-sage-50 dark:from-clay-950/30 dark:to-sage-950/30">
        <div className="flex items-center gap-2">
          {selectedMarker?.type === 'story' && <BookOpen className="w-5 h-5 text-clay-600" />}
          {selectedMarker?.type === 'stop' && <MapPin className="w-5 h-5 text-green-600" />}
          {selectedMarker?.type === 'request' && <Users className="w-5 h-5 text-amber-600" />}
          {selectedMarker?.type === 'dreamOrg' && <Building2 className="w-5 h-5 text-sky-600" />}
          {selectedMarker?.type === 'storyteller' && <User className="w-5 h-5 text-rose-600" />}
          <span className="font-semibold capitalize">
            {selectedMarker?.type === 'dreamOrg' ? 'Dream Partner' : selectedMarker?.type || 'Details'}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={clearSelection}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-64px)]">
        <div className="p-4 space-y-6">
          {/* Story Content */}
          {selectedMarker?.type === 'story' && (
            <>
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-clay-500" />
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                  <p className="text-muted-foreground">{error}</p>
                </div>
              )}

              {storyDetail && !loading && (
                <>
                  {/* Story Title & Location */}
                  <div>
                    <h2 className="text-xl font-bold mb-2">{storyDetail.story.title}</h2>
                    {storyDetail.story.location && (
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <MapPin className="w-3 h-3" />
                        <span>{storyDetail.story.location.name}</span>
                      </div>
                    )}
                    {storyDetail.story.createdAt && (
                      <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(storyDetail.story.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Themes */}
                  {storyDetail.story.themes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">Themes</h3>
                      <div className="flex flex-wrap gap-2">
                        {storyDetail.story.themes.map((theme, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            style={{
                              backgroundColor: `${storyDetail.themeColors[theme.toLowerCase()] || getThemeColor(theme)}20`,
                              borderColor: storyDetail.themeColors[theme.toLowerCase()] || getThemeColor(theme),
                              color: storyDetail.themeColors[theme.toLowerCase()] || getThemeColor(theme)
                            }}
                            onClick={() => toggleTheme(theme)}
                          >
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Story Excerpt */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Story</h3>
                    <p className="text-sm leading-relaxed">
                      {storyDetail.story.excerpt || storyDetail.story.fullContent?.substring(0, 500)}
                      {(storyDetail.story.excerpt?.length || 0) > 500 && '...'}
                    </p>
                    <Link href={`/stories/${storyDetail.story.id}`}>
                      <Button variant="link" className="px-0 mt-2 text-clay-600">
                        Read full story <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>

                  {/* Key Quotes */}
                  {storyDetail.story.keyQuotes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                        <Quote className="w-3 h-3" />
                        Key Quotes
                      </h3>
                      <div className="space-y-2">
                        {storyDetail.story.keyQuotes.slice(0, 3).map((quote, index) => (
                          <blockquote
                            key={index}
                            className="border-l-2 border-clay-300 pl-3 text-sm italic text-muted-foreground"
                          >
                            "{quote.text}"
                          </blockquote>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Storyteller - Enhanced */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Meet the Storyteller
                    </h3>
                    <Link href={storyDetail.storyteller.profileUrl}>
                      <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-stone-50 to-clay-50/30 dark:from-stone-900 dark:to-clay-900/30 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-clay-300 dark:hover:border-clay-700 transition-all cursor-pointer group">
                        <Avatar className="w-14 h-14 ring-2 ring-white dark:ring-stone-800 shadow-md">
                          <AvatarImage src={storyDetail.storyteller.avatarUrl || undefined} />
                          <AvatarFallback className="bg-clay-100 text-clay-600 text-lg">
                            {storyDetail.storyteller.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate group-hover:text-clay-600 transition-colors">
                            {storyDetail.storyteller.name}
                          </p>
                          {storyDetail.storyteller.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {storyDetail.storyteller.bio}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-2 text-sm text-clay-600">
                            View full profile
                            <ExternalLink className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Other stories by this storyteller */}
                    {storyDetail.storyteller.otherStories.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          More stories by {storyDetail.storyteller.name.split(' ')[0]} ({storyDetail.storyteller.otherStories.length})
                        </p>
                        <div className="space-y-2">
                          {storyDetail.storyteller.otherStories.slice(0, 3).map(story => (
                            <Link
                              key={story.id}
                              href={`/stories/${story.id}`}
                              className="flex items-center gap-2 p-2 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                            >
                              <BookOpen className="w-3 h-3 text-clay-500 flex-shrink-0" />
                              <span className="text-sm truncate">{story.title}</span>
                            </Link>
                          ))}
                        </div>
                        {storyDetail.storyteller.otherStories.length > 3 && (
                          <Link href={storyDetail.storyteller.profileUrl}>
                            <Button variant="ghost" size="sm" className="w-full mt-2 text-xs">
                              View all {storyDetail.storyteller.otherStories.length} stories
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Connected Stories */}
                  {storyDetail.connections.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Thematically Connected Stories
                        </h3>
                        <div className="space-y-3">
                          {storyDetail.connections.slice(0, 5).map(conn => (
                            <div
                              key={conn.storyId}
                              className="p-3 border rounded-lg hover:border-clay-300 transition-colors cursor-pointer"
                              onClick={() => selectMarker(conn.storyId, 'story', conn)}
                            >
                              <p className="font-medium text-sm line-clamp-1">{conn.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                by {conn.storytellerName} • {conn.location}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {conn.sharedThemes.slice(0, 3).map((theme, i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="text-xs"
                                    style={{
                                      backgroundColor: `${getThemeColor(theme)}20`,
                                      color: getThemeColor(theme)
                                    }}
                                  >
                                    {theme}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* Tour Stop Content */}
          {selectedMarker?.type === 'stop' && (
            <TourStopContent data={selectedMarker.data as any} />
          )}

          {/* Request Content */}
          {selectedMarker?.type === 'request' && (
            <RequestContent data={selectedMarker.data as any} />
          )}

          {/* Dream Org Content */}
          {selectedMarker?.type === 'dreamOrg' && (
            <DreamOrgContent data={selectedMarker.data as any} />
          )}

          {/* Storyteller Content */}
          {selectedMarker?.type === 'storyteller' && (
            <StorytellerContent data={selectedMarker.data as any} />
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

// Sub-components for other marker types
function TourStopContent({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">{data.title || data.location_text}</h2>
        <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
          <MapPin className="w-3 h-3" />
          <span>{data.city}, {data.country}</span>
        </div>
      </div>

      <Badge
        variant={data.status === 'confirmed' ? 'default' : 'outline'}
        className={cn(
          data.status === 'confirmed' && 'bg-green-500',
          data.status === 'completed' && 'bg-clay-500'
        )}
      >
        {data.status}
      </Badge>

      {data.date_start && (
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="w-3 h-3" />
          <span>
            {new Date(data.date_start).toLocaleDateString()}
            {data.date_end && ` - ${new Date(data.date_end).toLocaleDateString()}`}
          </span>
        </div>
      )}

      {data.description && (
        <p className="text-sm text-muted-foreground">{data.description}</p>
      )}

      {data.stories_collected > 0 && (
        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <p className="text-sm font-medium text-green-700 dark:text-green-300">
            {data.stories_collected} stories collected
          </p>
        </div>
      )}
    </div>
  )
}

function RequestContent({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">{data.location_text}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Nominated by {data.name}
        </p>
      </div>

      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
        Community Request
      </Badge>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Why visit?</h3>
        <p className="text-sm">{data.why_visit}</p>
      </div>
    </div>
  )
}

function DreamOrgContent({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">{data.name}</h2>
        {data.location_text && (
          <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
            <MapPin className="w-3 h-3" />
            <span>{data.location_text}</span>
          </div>
        )}
      </div>

      <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
        {data.category?.replace(/_/g, ' ')}
      </Badge>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">About</h3>
        <p className="text-sm">{data.description}</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Why We Want to Connect</h3>
        <p className="text-sm text-sage-700 dark:text-sage-300">{data.why_connect}</p>
      </div>

      {data.website_url && (
        <a
          href={data.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-sky-600 hover:underline"
        >
          <ExternalLink className="w-3 h-3" />
          Visit Website
        </a>
      )}
    </div>
  )
}

function StorytellerContent({ data }: { data: any }) {
  const impactScore = data.impactScore || 0
  const metrics = data.metrics || {}

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="flex items-start gap-4">
        <div className="relative">
          <Avatar className="w-20 h-20 ring-4 ring-white dark:ring-stone-800 shadow-lg">
            <AvatarImage src={data.avatarUrl || undefined} />
            <AvatarFallback className="bg-rose-100 text-rose-600 text-xl">
              {data.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          {data.isElder && (
            <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1.5 shadow-md border-2 border-white">
              <Star className="w-3 h-3 text-white fill-white" />
            </div>
          )}
          {!data.isElder && data.isFeatured && (
            <div className="absolute -top-1 -right-1 bg-pink-500 rounded-full p-1.5 shadow-md border-2 border-white">
              <Award className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {data.name}
          </h2>
          {data.isElder && (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 mt-1">
              <Star className="w-3 h-3 mr-1 fill-amber-500" />
              Community Elder
            </Badge>
          )}
          {data.locationName && (
            <div className="flex items-center gap-1 text-muted-foreground text-sm mt-2">
              <MapPin className="w-3 h-3" />
              <span>{data.locationName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Impact Score Ring */}
      <div className="flex items-center justify-center py-4">
        <div className="relative w-32 h-32">
          {/* Background ring */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-stone-200 dark:text-stone-700"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${impactScore * 2.51} 251`}
              className="text-rose-500 transition-all duration-1000"
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-rose-600">{impactScore}</span>
            <span className="text-xs text-muted-foreground">Impact Score</span>
          </div>
        </div>
      </div>

      {/* Impact Metrics Grid */}
      {metrics && Object.keys(metrics).length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Impact Breakdown
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {metrics.communityEngagement > 0 && (
              <MetricCard
                icon={<Users className="w-4 h-4" />}
                label="Community"
                value={metrics.communityEngagement}
                color="text-sage-500"
              />
            )}
            {metrics.culturalPreservation > 0 && (
              <MetricCard
                icon={<Shield className="w-4 h-4" />}
                label="Cultural"
                value={metrics.culturalPreservation}
                color="text-amber-500"
              />
            )}
            {metrics.systemChangeInfluence > 0 && (
              <MetricCard
                icon={<Target className="w-4 h-4" />}
                label="Influence"
                value={metrics.systemChangeInfluence}
                color="text-clay-500"
              />
            )}
            {metrics.mentorshipImpact > 0 && (
              <MetricCard
                icon={<Heart className="w-4 h-4" />}
                label="Mentorship"
                value={metrics.mentorshipImpact}
                color="text-rose-500"
              />
            )}
            {metrics.crossSectorCollaboration > 0 && (
              <MetricCard
                icon={<Globe className="w-4 h-4" />}
                label="Collaboration"
                value={metrics.crossSectorCollaboration}
                color="text-green-500"
              />
            )}
            {metrics.communitiesReached > 0 && (
              <MetricCard
                icon={<MapPin className="w-4 h-4" />}
                label="Communities"
                value={metrics.communitiesReached}
                color="text-sky-500"
                isCount
              />
            )}
          </div>
        </div>
      )}

      {/* Bio */}
      {data.bio && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">About</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.bio}</p>
        </div>
      )}

      {/* Expertise Areas */}
      {data.expertiseAreas?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {data.expertiseAreas.map((area: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-clay-50 text-clay-700 border-clay-200">
                {area}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Cultural Affiliations */}
      {data.culturalAffiliations?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Cultural Affiliations</h3>
          <div className="flex flex-wrap gap-2">
            {data.culturalAffiliations.map((affiliation: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                {affiliation}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Community Roles */}
      {data.communityRoles?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Community Roles</h3>
          <div className="flex flex-wrap gap-2">
            {data.communityRoles.map((role: string, index: number) => (
              <Badge key={index} variant="secondary">
                {role}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Story Count */}
      {data.storyCount > 0 && (
        <div className="p-3 bg-clay-50 dark:bg-clay-950/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-clay-600" />
              <span className="text-sm font-medium">{data.storyCount} Stories Shared</span>
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* View Full Profile */}
      <Link href={`/storytellers/${data.id}`}>
        <Button className="w-full bg-rose-600 hover:bg-rose-700">
          <User className="w-4 h-4 mr-2" />
          View Full Profile
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </div>
  )
}

// Metric card helper component
function MetricCard({
  icon,
  label,
  value,
  color,
  isCount = false
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
  isCount?: boolean
}) {
  return (
    <div className="p-2 bg-stone-50 dark:bg-stone-900 rounded-lg">
      <div className={cn("flex items-center gap-1 mb-1", color)}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-lg font-bold">
        {isCount ? value : `${value}%`}
      </div>
    </div>
  )
}
