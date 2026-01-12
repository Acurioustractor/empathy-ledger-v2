'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  User, MapPin, Globe, Calendar, Clock, Heart, Share2,
  Play, Pause, Volume2, VolumeX, ChevronRight, ChevronDown,
  Award, Users, BookOpen, Video, Music, Image, FileText,
  Sparkles, Star, Crown, Shield, Leaf, Handshake, TrendingUp,
  MessageCircle, Link as LinkIcon, ExternalLink, Download, Eye, EyeOff,
  Network, Map, Languages, Building, GraduationCap, Target,
  Zap, ArrowRight, ArrowLeft, MoreHorizontal, Filter, Search
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Avatar } from '@/components/ui/avatar'
import { VideoPlayer } from '@/components/media/VideoPlayer'
import { VideoEmbed } from '@/components/media/VideoEmbed'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { EnhancedStorytellerProfile } from '@/types/storyteller-card'

interface ImmersiveStorytellerProfileProps {
  storytellerId: string
  profile?: EnhancedStorytellerProfile
}

interface StoryPreview {
  id: string
  title: string
  excerpt: string
  audio_url?: string
  video_url?: string
  transcript_preview: string
  themes: string[]
  engagement_score: number
  created_at: string
  duration_minutes?: number
  view_count: number
  cultural_context?: string
}

interface MediaItem {
  id: string
  type: 'image' | 'video' | 'audio' | 'document'
  url: string
  thumbnail_url?: string
  title: string
  description?: string
  cultural_significance?: string
  created_at: string
  tags: string[]
}

interface ConnectionNode {
  id: string
  name: string
  avatar_url?: string
  relationship_type: 'collaborator' | 'mentor' | 'mentee' | 'colleague' | 'community_member'
  shared_projects: number
  connection_strength: number
}

// ========================================================================
// Constants
// ========================================================================

const BADGE_STYLES = {
  elder: {
    className: 'bg-terracotta text-white border-0 shadow-lg',
    icon: Crown,
    label: 'Elder'
  },
  featured: {
    className: 'bg-ochre text-white border-0 shadow-lg',
    icon: Star,
    label: 'Featured'
  },
  knowledgeKeeper: {
    className: 'bg-sage text-white border-0 shadow-lg',
    icon: Leaf,
    label: 'Knowledge Keeper'
  }
} as const

const RELATIONSHIP_CONFIG = {
  mentor: {
    color: 'from-terracotta-500 to-terracotta-600',
    icon: GraduationCap
  },
  mentee: {
    color: 'from-sage-500 to-sage-600',
    icon: Users
  },
  collaborator: {
    color: 'from-sage-500 to-sage-600',
    icon: Handshake
  },
  colleague: {
    color: 'from-ochre-500 to-ochre-600',
    icon: Building
  },
  community_member: {
    color: 'from-charcoal-500 to-charcoal-600',
    icon: Network
  }
} as const

const MEDIA_CONFIG = {
  image: {
    icon: Image,
    color: 'from-terracotta to-terracotta-600'
  },
  video: {
    icon: Video,
    color: 'from-terracotta to-ochre'
  },
  audio: {
    icon: Music,
    color: 'from-ochre to-ochre-600'
  },
  document: {
    icon: FileText,
    color: 'from-sage to-sage-600'
  }
} as const

const ANIMATION_DELAYS = {
  hero: {
    image: 0,
    name: 0.2,
    location: 0.3,
    cultural: 0.4,
    bio: 0.5,
    stats: 0.6,
    actions: 0.7
  },
  stagger: 0.1
}

// ========================================================================
// Helper Functions
// ========================================================================

function formatDate(date: string, format: 'short' | 'long' = 'short'): string {
  const dateObj = new Date(date)

  if (format === 'short') {
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })
  }

  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function calculateOverallImpact(areas: Array<{ value: number }>): number {
  const average = areas.reduce((sum, area) => sum + area.value, 0) / areas.length
  return Math.round(average * 100)
}

function calculateAverageConnectionStrength(connections: ConnectionNode[]): number {
  if (connections.length === 0) return 0
  const sum = connections.reduce((acc, c) => acc + c.connection_strength, 0)
  return Math.round((sum / connections.length) * 100)
}

function calculateYearsActive(createdAt: string, yearsOfExperience?: number): number {
  if (yearsOfExperience) return yearsOfExperience
  const years = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365))
  return years
}

function getRelationshipConfig(type: string) {
  return RELATIONSHIP_CONFIG[type as keyof typeof RELATIONSHIP_CONFIG] || RELATIONSHIP_CONFIG.community_member
}

function getMediaConfig(type: string) {
  return MEDIA_CONFIG[type as keyof typeof MEDIA_CONFIG] || MEDIA_CONFIG.document
}

function groupConnectionsByType(connections: ConnectionNode[]): Record<string, number> {
  return connections.reduce((acc, conn) => {
    acc[conn.relationship_type] = (acc[conn.relationship_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

// ========================================================================
// Main Component
// ========================================================================

export function ImmersiveStorytellerProfile({ storytellerId, profile }: ImmersiveStorytellerProfileProps) {
  const [fullProfile, setFullProfile] = useState<EnhancedStorytellerProfile | null>(profile || null)
  const [stories, setStories] = useState<StoryPreview[]>([])
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [connections, setConnections] = useState<ConnectionNode[]>([])
  const [loading, setLoading] = useState(!profile)
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAudioTime, setCurrentAudioTime] = useState(0)
  const [showFullBio, setShowFullBio] = useState(false)

  useEffect(() => {
    if (!profile) {
      fetchProfileData()
    }
    fetchStoriesAndMedia()
  }, [storytellerId, profile])

  async function fetchProfileData() {
    try {
      const response = await fetch(`/api/storytellers/${storytellerId}`)
      if (response.ok) {
        const data = await response.json()
        setFullProfile(data.profile)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchStoriesAndMedia() {
    try {
      const [storiesRes, mediaRes, connectionsRes] = await Promise.all([
        fetch(`/api/storytellers/${storytellerId}/stories`),
        fetch(`/api/storytellers/${storytellerId}/media`),
        fetch(`/api/storytellers/${storytellerId}/connections`)
      ])

      if (storiesRes.ok) {
        const storiesData = await storiesRes.json()
        setStories(storiesData.stories || [])
      }

      if (mediaRes.ok) {
        const mediaData = await mediaRes.json()
        setMediaItems(mediaData.media || [])
      }

      if (connectionsRes.ok) {
        const connectionsData = await connectionsRes.json()
        setConnections(connectionsData.connections || [])
      }
    } catch (error) {
      console.error('Error fetching additional data:', error)
    }
  }

  if (loading) {
    return <ProfileLoadingSkeleton />
  }

  if (!fullProfile) {
    return <ProfileNotFound />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-ochre-50 to-sage-50">
      <NavigationHeader storytellerId={storytellerId} />

      <ProfileHeroSection
        profile={fullProfile}
        showFullBio={showFullBio}
        onToggleBio={() => setShowFullBio(!showFullBio)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 -mt-24 relative z-10">
          <div className="lg:col-span-2 space-y-8">
            <StoryCollectionSection
              stories={stories}
              activeStoryId={activeStoryId}
              onStorySelect={setActiveStoryId}
              isPlaying={isPlaying}
              onPlayToggle={setIsPlaying}
            />

            <VoiceAndTranscriptsSection
              stories={stories}
              profile={fullProfile}
            />
          </div>

          <div className="space-y-8">
            <ImpactMetricsCard profile={fullProfile} />
            <CommunityConnectionsCard connections={connections} />
            <CulturalContextCard profile={fullProfile} />
          </div>
        </div>

        <div className="mt-12 space-y-12">
          <JourneyTimelineSection profile={fullProfile} stories={stories} />
          <MediaGallerySection mediaItems={mediaItems} />
          <RelatedStorytellersSection connections={connections} />
        </div>
      </div>
    </div>
  )
}

// ========================================================================
// Sub-components
// ========================================================================

function NavigationHeader({ storytellerId }: { storytellerId: string }) {
  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-ochre-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href={`/storytellers/${storytellerId}`} className="flex items-center space-x-2 text-charcoal-700 hover:text-terracotta transition-colours">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Profile</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href={`/storytellers/${storytellerId}`}
              className="px-3 py-2 text-sm bg-ochre-100 text-charcoal-700 rounded-lg hover:bg-ochre-200 transition-colours"
            >
              Standard View
            </Link>
            <Link
              href={`/storytellers/${storytellerId}/enhanced`}
              className="px-3 py-2 text-sm bg-ochre-100 text-charcoal-700 rounded-lg hover:bg-ochre-200 transition-colours"
            >
              Enhanced View
            </Link>
            <span className="px-3 py-2 text-sm bg-terracotta-100 text-terracotta-700 rounded-lg">
              Immersive View
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}

function ProfileNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-charcoal-200 rounded-full mx-auto" />
        <h2 className="text-xl font-semibold text-charcoal-900">Storyteller not found</h2>
        <p className="text-charcoal-600">The profile you're looking for doesn't exist or has been removed.</p>
      </div>
    </div>
  )
}

function ProfileHeroSection({
  profile,
  showFullBio,
  onToggleBio
}: {
  profile: EnhancedStorytellerProfile
  showFullBio: boolean
  onToggleBio: () => void
}) {
  const statusBadges = [
    profile.elder_status && { key: 'elder', ...BADGE_STYLES.elder },
    profile.featured && { key: 'featured', ...BADGE_STYLES.featured },
    profile.traditional_knowledge_keeper && { key: 'knowledgeKeeper', ...BADGE_STYLES.knowledgeKeeper }
  ].filter(Boolean)

  const quickStats = [
    { label: 'Stories', value: profile.story_count },
    { label: 'Transcripts', value: profile.content_stats?.transcript_count || 0 },
    { label: 'Organizations', value: profile.organisations?.length || 0 },
    profile.years_of_experience && { label: 'Years Experience', value: profile.years_of_experience }
  ].filter(Boolean)

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal-900 via-terracotta-900 to-sage-900">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[url('/patterns/indigenous-pattern.svg')] opacity-10" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <ProfileAvatar profile={profile} />

          <StatusBadges badges={statusBadges} />

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ANIMATION_DELAYS.hero.name }}
            className="text-5xl sm:text-6xl font-bold text-white mb-4"
          >
            {profile.display_name}
          </motion.h1>

          {profile.profile?.locations?.[0] && (
            <LocationDisplay
              location={profile.profile.locations[0]}
              delay={ANIMATION_DELAYS.hero.location}
            />
          )}

          {profile.cultural_background && (
            <CulturalBackgroundBadge
              background={profile.cultural_background}
              delay={ANIMATION_DELAYS.hero.cultural}
            />
          )}

          {profile.bio && (
            <BioSection
              bio={profile.bio}
              showFull={showFullBio}
              onToggle={onToggleBio}
              delay={ANIMATION_DELAYS.hero.bio}
            />
          )}

          <QuickStatsGrid stats={quickStats} delay={ANIMATION_DELAYS.hero.stats} />

          <HeroActionButtons delay={ANIMATION_DELAYS.hero.actions} />
        </motion.div>
      </div>
    </div>
  )
}

function ProfileAvatar({ profile }: { profile: EnhancedStorytellerProfile }) {
  return (
    <div className="relative inline-block mb-8">
      <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white/20 backdrop-blur-sm shadow-2xl">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.display_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-terracotta-400 to-ochre-600 flex items-center justify-center">
            <User className="w-20 h-20 text-white/80" />
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadges({ badges }: { badges: any[] }) {
  if (badges.length === 0) return null

  return (
    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
      {badges.map((badge) => {
        const Icon = badge.icon
        return (
          <Badge key={badge.key} className={badge.className}>
            <Icon className="w-3 h-3 mr-1" />
            {badge.label}
          </Badge>
        )
      })}
    </div>
  )
}

function LocationDisplay({ location, delay }: { location: any, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex items-center justify-center gap-2 text-ochre-100 text-lg mb-6"
    >
      <MapPin className="w-5 h-5" />
      <span>{location.name || location}</span>
    </motion.div>
  )
}

function CulturalBackgroundBadge({ background, delay }: { background: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full text-white mb-8"
    >
      <Globe className="w-5 h-5" />
      <span className="text-lg font-medium">{background}</span>
    </motion.div>
  )
}

function BioSection({ bio, showFull, onToggle, delay }: { bio: string, showFull: boolean, onToggle: () => void, delay: number }) {
  const shouldTruncate = bio.length > 200

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
        <div className={`text-xl leading-relaxed ${showFull ? '' : 'line-clamp-3'}`}>
          {bio}
        </div>
        {shouldTruncate && (
          <Button
            variant="ghost"
            onClick={onToggle}
            className="mt-4 text-ochre-200 hover:text-white hover:bg-white/10"
          >
            {showFull ? (
              <>Show Less <ChevronDown className="w-4 h-4 ml-1" /></>
            ) : (
              <>Read More <ChevronRight className="w-4 h-4 ml-1" /></>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  )
}

function QuickStatsGrid({ stats, delay }: { stats: any[], delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex justify-center gap-8 mt-12"
    >
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="text-3xl font-bold text-white">{stat.value}</div>
          <div className="text-ochre-200">{stat.label}</div>
        </div>
      ))}
    </motion.div>
  )
}

function HeroActionButtons({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex justify-center gap-4 mt-8"
    >
      <Button size="lg" className="bg-white text-charcoal-900 hover:bg-cream">
        <MessageCircle className="w-5 h-5 mr-2" />
        Connect
      </Button>
      <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
        <Share2 className="w-5 h-5 mr-2" />
        Share Profile
      </Button>
      <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
        <Heart className="w-5 h-5 mr-2" />
        Follow
      </Button>
    </motion.div>
  )
}

function StoryCollectionSection({
  stories,
  activeStoryId,
  onStorySelect,
  isPlaying,
  onPlayToggle
}: {
  stories: StoryPreview[]
  activeStoryId: string | null
  onStorySelect: (id: string | null) => void
  isPlaying: boolean
  onPlayToggle: (playing: boolean) => void
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-3xl shadow-xl p-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-charcoal-900 mb-2">Story Collection</h2>
          <p className="text-charcoal-600">Explore the rich tapestry of shared experiences</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {stories.length} Stories
        </Badge>
      </div>

      {stories.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Stories Yet"
          description="Stories and experiences will appear here as they're shared"
        />
      ) : (
        <div className="grid gap-6">
          {stories.map((story, index) => (
            <StoryCard
              key={story.id}
              story={story}
              isActive={activeStoryId === story.id}
              isPlaying={isPlaying && activeStoryId === story.id}
              onSelect={() => onStorySelect(activeStoryId === story.id ? null : story.id)}
              onPlayToggle={onPlayToggle}
              index={index}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

function StoryCard({
  story,
  isActive,
  isPlaying,
  onSelect,
  onPlayToggle,
  index
}: {
  story: StoryPreview
  isActive: boolean
  isPlaying: boolean
  onSelect: () => void
  onPlayToggle: (playing: boolean) => void
  index: number
}) {
  const cardClasses = isActive
    ? 'border-terracotta-300 shadow-lg bg-terracotta-50'
    : 'border-ochre-200 hover:border-ochre-300 hover:shadow-md'

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * ANIMATION_DELAYS.stagger }}
      className={`border rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${cardClasses}`}
      onClick={onSelect}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-charcoal-900 mb-2">{story.title}</h3>
            <p className="text-charcoal-600 leading-relaxed">{story.excerpt}</p>
          </div>

          {story.audio_url && (
            <Button
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onPlayToggle(!isPlaying)
              }}
              className="ml-4"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          )}
        </div>

        <StoryMetadata story={story} />
        <StoryThemes themes={story.themes} />

        <AnimatePresence>
          {isActive && <StoryExpandedContent story={story} />}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function StoryMetadata({ story }: { story: StoryPreview }) {
  return (
    <div className="flex items-center gap-4 text-sm text-charcoal-500 mb-4">
      <div className="flex items-center gap-1">
        <Calendar className="w-4 h-4" />
        {new Date(story.created_at).toLocaleDateString()}
      </div>
      {story.duration_minutes && (
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {story.duration_minutes} min
        </div>
      )}
      <div className="flex items-center gap-1">
        <Eye className="w-4 h-4" />
        {story.view_count} views
      </div>
    </div>
  )
}

function StoryThemes({ themes }: { themes: string[] }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {themes.map((theme) => (
        <Badge key={theme} variant="secondary" className="text-xs">
          {theme}
        </Badge>
      ))}
    </div>
  )
}

function StoryExpandedContent({ story }: { story: StoryPreview }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="border-t pt-4 mt-4"
    >
      {story.audio_url && (
        <div className="mb-4">
          <div className="bg-cream rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Music className="w-5 h-5 text-terracotta" />
              <span className="font-medium">Audio Recording</span>
            </div>
            <audio controls className="w-full" src={story.audio_url}>
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h4 className="font-medium text-charcoal-900 mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Transcript Preview
        </h4>
        <div className="bg-cream rounded-lg p-4 text-sm text-charcoal-700 leading-relaxed">
          "{story.transcript_preview}..."
        </div>
      </div>

      {story.cultural_context && (
        <div className="mb-4">
          <h4 className="font-medium text-charcoal-900 mb-2 flex items-center gap-2">
            <Leaf className="w-4 h-4" />
            Cultural Context
          </h4>
          <p className="text-sm text-charcoal-600 bg-sage-50 rounded-lg p-3">
            {story.cultural_context}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" size="sm">
          <ExternalLink className="w-4 h-4 mr-2" />
          Read Full Story
        </Button>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
    </motion.div>
  )
}

function VoiceAndTranscriptsSection({
  stories,
  profile
}: {
  stories: StoryPreview[]
  profile: EnhancedStorytellerProfile
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const audioStories = stories.filter(story => story.audio_url)
  const quotableStories = stories.filter(story => story.transcript_preview)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white rounded-3xl shadow-xl p-8"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-charcoal-900 mb-2">Voice & Wisdom</h2>
        <p className="text-charcoal-600">Listen to authentic voices and meaningful insights</p>
      </div>

      <Tabs defaultValue="quotes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quotes" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Key Quotes
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            Audio Highlights
          </TabsTrigger>
          <TabsTrigger value="transcripts" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Transcripts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="mt-6">
          <QuotesTab stories={quotableStories} />
        </TabsContent>

        <TabsContent value="audio" className="mt-6">
          <AudioTab stories={audioStories} />
        </TabsContent>

        <TabsContent value="transcripts" className="mt-6">
          <TranscriptsTab stories={stories} />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

function QuotesTab({ stories }: { stories: StoryPreview[] }) {
  return (
    <div className="grid gap-4">
      {stories.slice(0, 3).map((story, index) => (
        <motion.div
          key={story.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * ANIMATION_DELAYS.stagger }}
          className="bg-gradient-to-r from-ochre-50 to-terracotta-50 rounded-2xl p-6 border-l-4 border-terracotta"
        >
          <blockquote className="text-lg italic text-charcoal-700 mb-4">
            "{story.transcript_preview}"
          </blockquote>
          <div className="flex items-center justify-between">
            <cite className="text-sm text-charcoal-600">From "{story.title}"</cite>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{story.themes[0]}</Badge>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function AudioTab({ stories }: { stories: StoryPreview[] }) {
  return (
    <div className="grid gap-4">
      {stories.map((story, index) => (
        <motion.div
          key={story.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * ANIMATION_DELAYS.stagger }}
          className="bg-cream rounded-2xl p-6"
        >
          <h4 className="font-semibold text-charcoal-900 mb-3">{story.title}</h4>
          <audio controls className="w-full mb-3">
            <source src={story.audio_url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          <div className="flex items-center justify-between text-sm text-charcoal-600">
            <span>{story.duration_minutes} minutes</span>
            <div className="flex gap-2">
              {story.themes.slice(0, 2).map(theme => (
                <Badge key={theme} variant="secondary" className="text-xs">
                  {theme}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function TranscriptsTab({ stories }: { stories: StoryPreview[] }) {
  return (
    <div className="space-y-4">
      {stories.map((story, index) => (
        <motion.div
          key={story.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * ANIMATION_DELAYS.stagger }}
          className="border border-ochre-200 rounded-xl p-4 hover:border-ochre-300 transition-colours"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-charcoal-900">{story.title}</h4>
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Read Full
            </Button>
          </div>
          <p className="text-sm text-charcoal-600 line-clamp-2">{story.transcript_preview}</p>
          <div className="flex items-center gap-2 mt-3">
            <Clock className="w-4 h-4 text-charcoal-400" />
            <span className="text-xs text-charcoal-500">
              {new Date(story.created_at).toLocaleDateString()}
            </span>
            <span className="text-xs text-charcoal-300">•</span>
            <span className="text-xs text-charcoal-500">{story.view_count} views</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function ProfileLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-ochre-50 to-sage-50">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal-900 via-terracotta-900 to-sage-900" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-32">
          <div className="text-center animate-pulse">
            <div className="w-40 h-40 bg-white/20 rounded-full mx-auto mb-8" />
            <div className="h-12 bg-white/20 rounded-lg w-96 mx-auto mb-4" />
            <div className="h-6 bg-white/20 rounded-lg w-64 mx-auto mb-8" />
            <div className="h-32 bg-white/20 rounded-2xl max-w-4xl mx-auto" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 -mt-24 relative z-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-xl p-8 animate-pulse">
              <div className="h-8 bg-ochre-200 rounded w-48 mb-6" />
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-ochre-200 rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl shadow-xl p-6 animate-pulse">
                <div className="h-6 bg-ochre-200 rounded w-32 mb-4" />
                <div className="h-24 bg-ochre-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ImpactMetricsCard({ profile }: { profile: EnhancedStorytellerProfile }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const impactAreas = [
    {
      label: 'Community Leadership',
      value: profile.ai_insights?.confidence_score || 0.8,
      icon: Users,
      colour: 'from-sage-500 to-sage-600'
    },
    {
      label: 'Cultural Knowledge',
      value: profile.traditional_knowledge_keeper ? 0.95 : 0.7,
      icon: Leaf,
      colour: 'from-sage-500 to-sage-600'
    },
    {
      label: 'Storytelling Impact',
      value: Math.min(profile.story_count / 20, 1),
      icon: BookOpen,
      colour: 'from-terracotta-500 to-terracotta-600'
    },
    {
      label: 'Network Influence',
      value: Math.min((profile.organisations?.length || 0) / 5, 1),
      icon: Network,
      colour: 'from-ochre-500 to-ochre-600'
    }
  ]

  const overallScore = calculateOverallImpact(impactAreas)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-3xl shadow-xl p-6"
    >
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-terracotta" />
        Community Impact
      </h3>

      <div className="space-y-6">
        <ImpactScoreDisplay score={overallScore} />
        <ImpactAreasList areas={impactAreas} isInView={isInView} />
        <KeyAchievements profile={profile} />
        <AvailabilityIndicators profile={profile} />
      </div>
    </motion.div>
  )
}

function ImpactScoreDisplay({ score }: { score: number }) {
  return (
    <div className="text-center p-6 bg-gradient-to-br from-terracotta-50 to-ochre-50 rounded-2xl border border-terracotta-100">
      <div className="text-4xl font-bold text-terracotta mb-2">
        {score}%
      </div>
      <div className="text-sm font-medium text-charcoal-600">Overall Impact Score</div>
      <div className="text-xs text-charcoal-500 mt-1">Based on community engagement and contributions</div>
    </div>
  )
}

function ImpactAreasList({ areas, isInView }: { areas: any[], isInView: boolean }) {
  return (
    <div className="space-y-4">
      {areas.map((area, index) => {
        const Icon = area.icon
        return (
          <motion.div
            key={area.label}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: index * ANIMATION_DELAYS.stagger }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${area.colour} text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-charcoal-900">{area.label}</span>
              </div>
              <span className="text-sm font-semibold text-charcoal-600">
                {Math.round(area.value * 100)}%
              </span>
            </div>
            <div className="w-full bg-ochre-100 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { width: `${area.value * 100}%` } : {}}
                transition={{ delay: 0.5 + index * ANIMATION_DELAYS.stagger, duration: 1 }}
                className={`h-2 rounded-full bg-gradient-to-r ${area.colour}`}
              />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function KeyAchievements({ profile }: { profile: EnhancedStorytellerProfile }) {
  const achievements = [
    { label: 'Stories Shared', value: profile.story_count, color: 'terracotta' },
    { label: 'Organizations', value: profile.organisations?.length || 0, color: 'ochre' },
    { label: 'Projects', value: profile.projects?.length || 0, color: 'sage' },
    { label: 'Years Experience', value: profile.years_of_experience || 'N/A', color: 'charcoal' }
  ]

  return (
    <div className="pt-4 border-t border-ochre-100">
      <h4 className="font-semibold text-charcoal-900 mb-3">Key Achievements</h4>
      <div className="grid grid-cols-2 gap-3">
        {achievements.map((achievement) => (
          <div key={achievement.label} className={`text-center p-3 bg-${achievement.color}-50 rounded-lg`}>
            <div className={`text-2xl font-bold text-${achievement.color}-600`}>{achievement.value}</div>
            <div className={`text-xs text-${achievement.color}-600`}>{achievement.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AvailabilityIndicators({ profile }: { profile: EnhancedStorytellerProfile }) {
  const availabilities = [
    profile.mentor_availability && { label: 'Available for mentoring', color: 'sage' },
    profile.speaking_availability && { label: 'Available for speaking engagements', color: 'terracotta' },
    profile.collaboration_availability && { label: 'Open to collaborations', color: 'ochre' }
  ].filter(Boolean)

  if (availabilities.length === 0) return null

  return (
    <div className="pt-4 border-t border-ochre-100">
      <h4 className="font-semibold text-charcoal-900 mb-3">Availability</h4>
      <div className="space-y-2">
        {availabilities.map((availability) => (
          <div key={availability.label} className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 bg-${availability.color} rounded-full`}></div>
            <span className="text-charcoal-700">{availability.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CommunityConnectionsCard({ connections }: { connections: ConnectionNode[] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [showAll, setShowAll] = useState(false)

  const displayConnections = showAll ? connections : connections.slice(0, 6)
  const avgStrength = calculateAverageConnectionStrength(connections)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white rounded-3xl shadow-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <Network className="w-6 h-6 text-terracotta" />
          Network
        </h3>
        <Badge variant="outline" className="text-sm">
          {connections.length} connections
        </Badge>
      </div>

      {connections.length === 0 ? (
        <EmptyState
          icon={Network}
          title="No connections yet"
          description="Connections will appear as relationships are built"
        />
      ) : (
        <>
          <NetworkStrengthVisualization
            avgStrength={avgStrength}
            isInView={isInView}
          />

          <ConnectionsList
            connections={displayConnections}
            isInView={isInView}
          />

          {connections.length > 6 && (
            <Button
              variant="ghost"
              onClick={() => setShowAll(!showAll)}
              className="w-full mt-4 text-terracotta hover:text-terracotta-700 hover:bg-terracotta-50"
            >
              {showAll ? (
                <>Show Less <ChevronDown className="w-4 h-4 ml-1" /></>
              ) : (
                <>View All {connections.length} Connections <ArrowRight className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          )}

          <RelationshipTypeBreakdown connections={connections} />
        </>
      )}
    </motion.div>
  )
}

function NetworkStrengthVisualization({ avgStrength, isInView }: { avgStrength: number, isInView: boolean }) {
  return (
    <div className="mb-6 p-4 bg-gradient-to-br from-ochre-50 to-terracotta-50 rounded-2xl">
      <h4 className="font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-terracotta" />
        Network Strength
      </h4>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-ochre-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: `${Math.min(avgStrength, 100)}%` } : {}}
            transition={{ delay: 0.5, duration: 1 }}
            className="h-2 rounded-full bg-gradient-to-r from-terracotta to-ochre"
          />
        </div>
        <span className="text-sm font-semibold text-terracotta">
          {avgStrength}%
        </span>
      </div>
      <p className="text-xs text-charcoal-600 mt-1">Average connection strength across network</p>
    </div>
  )
}

function ConnectionsList({ connections, isInView }: { connections: ConnectionNode[], isInView: boolean }) {
  return (
    <div className="space-y-3">
      {connections.map((connection, index) => (
        <ConnectionItem
          key={connection.id}
          connection={connection}
          index={index}
          isInView={isInView}
        />
      ))}
    </div>
  )
}

function ConnectionItem({ connection, index, isInView }: { connection: ConnectionNode, index: number, isInView: boolean }) {
  const config = getRelationshipConfig(connection.relationship_type)
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: ANIMATION_DELAYS.stagger * index }}
      className="group flex items-center gap-3 p-3 rounded-xl hover:bg-cream transition-colours cursor-pointer"
    >
      <div className="relative">
        {connection.avatar_url ? (
          <img
            src={connection.avatar_url}
            alt={connection.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta-400 to-ochre-500 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        )}

        <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-gradient-to-r ${config.color} shadow-sm`}>
          <Icon className="w-3 h-3 text-white" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-charcoal-900 truncate">{connection.name}</div>
        <div className="flex items-center gap-2 text-xs text-charcoal-500">
          <span className="capitalize">{connection.relationship_type.replace('_', ' ')}</span>
          {connection.shared_projects > 0 && (
            <>
              <span>•</span>
              <span>{connection.shared_projects} shared projects</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-12 bg-ochre-200 rounded-full h-1">
          <div
            className={`h-1 rounded-full bg-gradient-to-r ${config.color}`}
            style={{ width: `${connection.connection_strength * 100}%` }}
          />
        </div>
        <ChevronRight className="w-4 h-4 text-charcoal-300 group-hover:text-charcoal-500 transition-colours" />
      </div>
    </motion.div>
  )
}

function RelationshipTypeBreakdown({ connections }: { connections: ConnectionNode[] }) {
  const grouped = groupConnectionsByType(connections)

  return (
    <div className="mt-6 pt-4 border-t border-ochre-100">
      <h4 className="font-semibold text-charcoal-900 mb-3">Relationship Types</h4>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(grouped).map(([type, count]) => {
          const config = getRelationshipConfig(type)
          const Icon = config.icon
          return (
            <div key={type} className="flex items-center gap-2 text-sm">
              <div className={`p-1 rounded bg-gradient-to-r ${config.color} text-white`}>
                <Icon className="w-3 h-3" />
              </div>
              <span className="text-charcoal-700 capitalize flex-1">{type.replace('_', ' ')}</span>
              <span className="font-medium text-charcoal-900">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CulturalContextCard({ profile }: { profile: EnhancedStorytellerProfile }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white rounded-3xl shadow-xl p-6"
    >
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Leaf className="w-6 h-6 text-sage" />
        Cultural Heritage
      </h3>

      <div className="space-y-6">
        {profile.cultural_background && (
          <CulturalBackgroundSection
            background={profile.cultural_background}
            specialties={profile.specialties}
            isInView={isInView}
          />
        )}

        {profile.languages && profile.languages.length > 0 && (
          <LanguagesSection
            languages={profile.languages}
            isInView={isInView}
          />
        )}

        {profile.cultural_affiliations && profile.cultural_affiliations.length > 0 && (
          <CulturalAffiliationsSection
            affiliations={profile.cultural_affiliations}
            isInView={isInView}
          />
        )}

        {((profile.specialties && profile.specialties.length > 0) ||
          (profile.expertise_areas && profile.expertise_areas.length > 0)) && (
          <AreasOfFocusSection
            specialties={profile.specialties}
            expertiseAreas={profile.expertise_areas}
            isInView={isInView}
          />
        )}

        {profile.community_roles && profile.community_roles.length > 0 && (
          <CommunityRolesSection
            roles={profile.community_roles}
            isInView={isInView}
          />
        )}

        {profile.traditional_knowledge_keeper && (
          <KnowledgeKeeperBadge isInView={isInView} />
        )}
      </div>
    </motion.div>
  )
}

function CulturalBackgroundSection({ background, specialties, isInView }: { background: string, specialties?: string[], isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: 0.1 }}
      className="p-4 bg-gradient-to-br from-sage-50 to-sage-100 rounded-2xl border border-sage-200"
    >
      <h4 className="font-semibold text-charcoal-900 mb-2 flex items-center gap-2">
        <Map className="w-4 h-4 text-sage" />
        Cultural Background
      </h4>
      <p className="text-charcoal-700">{background}</p>
      {specialties && specialties.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {specialties.map(specialty => (
            <Badge key={specialty} variant="outline" className="text-xs border-sage-300 text-sage-700">
              {specialty}
            </Badge>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function LanguagesSection({ languages, isInView }: { languages: string[], isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: 0.3 }}
      className="space-y-3"
    >
      <h4 className="font-semibold text-charcoal-900 flex items-center gap-2">
        <Languages className="w-4 h-4 text-ochre" />
        Languages
      </h4>
      <div className="flex flex-wrap gap-2">
        {languages.map((language, index) => (
          <motion.div
            key={language}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.4 + index * ANIMATION_DELAYS.stagger }}
          >
            <Badge variant="secondary" className="bg-ochre-100 text-ochre-700 border-ochre-200">
              {language}
            </Badge>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function CulturalAffiliationsSection({ affiliations, isInView }: { affiliations: string[], isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: 0.4 }}
      className="space-y-3"
    >
      <h4 className="font-semibold text-charcoal-900 flex items-center gap-2">
        <Shield className="w-4 h-4 text-terracotta" />
        Cultural Affiliations
      </h4>
      <div className="space-y-2">
        {affiliations.map((affiliation, index) => (
          <motion.div
            key={affiliation}
            initial={{ opacity: 0, x: -10 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5 + index * ANIMATION_DELAYS.stagger }}
            className="flex items-center gap-2 p-2 rounded-lg bg-terracotta-50 border border-terracotta-100"
          >
            <div className="w-2 h-2 bg-terracotta rounded-full flex-shrink-0" />
            <span className="text-sm text-charcoal-700">{affiliation}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function AreasOfFocusSection({ specialties, expertiseAreas, isInView }: { specialties?: string[], expertiseAreas?: string[], isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: 0.5 }}
      className="space-y-3"
    >
      <h4 className="font-semibold text-charcoal-900 flex items-center gap-2">
        <Target className="w-4 h-4 text-terracotta" />
        Areas of Focus
      </h4>
      <div className="grid grid-cols-1 gap-2">
        {specialties?.map((specialty, index) => (
          <motion.div
            key={`specialty-${specialty}`}
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 + index * 0.05 }}
            className="text-sm bg-terracotta-50 text-terracotta-700 px-3 py-2 rounded-lg border border-terracotta-100"
          >
            {specialty}
          </motion.div>
        ))}
        {expertiseAreas?.map((area, index) => (
          <motion.div
            key={`expertise-${area}`}
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7 + index * 0.05 }}
            className="text-sm bg-sage-50 text-sage-700 px-3 py-2 rounded-lg border border-sage-100"
          >
            {area}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function CommunityRolesSection({ roles, isInView }: { roles: string[], isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: 0.6 }}
      className="space-y-3"
    >
      <h4 className="font-semibold text-charcoal-900 flex items-center gap-2">
        <Users className="w-4 h-4 text-sage" />
        Community Roles
      </h4>
      <div className="space-y-2">
        {roles.map((role, index) => (
          <motion.div
            key={role}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.7 + index * ANIMATION_DELAYS.stagger }}
            className="flex items-center gap-3 p-3 bg-sage-50 rounded-xl border border-sage-100"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-sage to-sage-600 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-charcoal-900">{role}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function KnowledgeKeeperBadge({ isInView }: { isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay: 0.8 }}
      className="p-4 bg-gradient-to-br from-ochre-50 to-terracotta-50 rounded-2xl border-2 border-ochre-200"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-terracotta to-ochre rounded-xl flex items-center justify-center">
          <Crown className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="font-bold text-terracotta-800">Traditional Knowledge Keeper</h4>
          <p className="text-sm text-ochre-700">Recognized holder of traditional cultural knowledge</p>
        </div>
      </div>
    </motion.div>
  )
}

function JourneyTimelineSection({ profile, stories }: { profile: EnhancedStorytellerProfile, stories: StoryPreview[] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const timelineEvents = createTimelineEvents(profile, stories)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="bg-white rounded-3xl shadow-xl p-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-charcoal-900 mb-2 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-terracotta" />
            Journey Timeline
          </h2>
          <p className="text-charcoal-600">A chronological view of contributions and milestones</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {timelineEvents.length} Events
        </Badge>
      </div>

      {timelineEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Journey Beginning"
          description="Timeline will grow as stories and experiences are shared"
        />
      ) : (
        <>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-terracotta to-ochre" />

            <div className="space-y-8">
              {timelineEvents.map((event, index) => (
                <TimelineEvent
                  key={event.id}
                  event={event}
                  index={index}
                  isInView={isInView}
                />
              ))}
            </div>
          </div>

          <TimelineStats
            events={timelineEvents}
            profile={profile}
            isInView={isInView}
          />
        </>
      )}
    </motion.div>
  )
}

function createTimelineEvents(profile: EnhancedStorytellerProfile, stories: StoryPreview[]) {
  const events = [
    {
      id: 'joined',
      date: profile.created_at,
      type: 'milestone' as const,
      title: 'Joined Community',
      description: 'Became part of the storytelling community',
      icon: Star,
      colour: 'from-terracotta to-terracotta-600'
    },
    ...stories.map(story => ({
      id: story.id,
      date: story.created_at,
      type: 'story' as const,
      title: story.title,
      description: story.excerpt,
      icon: BookOpen,
      colour: 'from-ochre to-ochre-600',
      themes: story.themes
    })),
    ...(profile.organisations || []).map(org => ({
      id: `org-${org.id}`,
      date: org.start_date || profile.created_at,
      type: 'organisation' as const,
      title: `Joined ${org.name}`,
      description: `${org.role} at ${org.name}`,
      icon: Building,
      colour: 'from-sage to-sage-600'
    })),
    ...(profile.projects || []).map(project => ({
      id: `project-${project.id}`,
      date: project.start_date || profile.created_at,
      type: 'project' as const,
      title: project.name,
      description: `${project.role} - ${project.description || 'Project participation'}`,
      icon: Target,
      colour: 'from-charcoal to-charcoal-600'
    }))
  ]

  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

function TimelineEvent({ event, index, isInView }: { event: any, index: number, isInView: boolean }) {
  const Icon = event.icon
  const badgeColor = event.type === 'story' ? 'border-ochre-200 text-ochre-700' :
    event.type === 'organisation' ? 'border-sage-200 text-sage-700' :
    event.type === 'project' ? 'border-charcoal-200 text-charcoal-700' :
    'border-terracotta-200 text-terracotta-700'

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * ANIMATION_DELAYS.stagger }}
      className="relative flex items-start gap-6"
    >
      <div className="relative z-10">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${event.colour} flex items-center justify-center text-white shadow-lg`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-ochre-200 rounded-lg px-2 py-1 shadow-sm">
          <div className="text-xs font-medium text-charcoal-600 whitespace-nowrap">
            {formatDate(event.date, 'short')}
          </div>
        </div>
      </div>

      <div className="flex-1 pb-8">
        <div className="bg-cream rounded-2xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-semibold text-charcoal-900">{event.title}</h3>
            <Badge variant="outline" className={`capitalize ${badgeColor}`}>
              {event.type}
            </Badge>
          </div>

          <p className="text-charcoal-600 mb-4">{event.description}</p>

          {event.type === 'story' && event.themes && (
            <div className="flex flex-wrap gap-2">
              {event.themes.slice(0, 3).map((theme: string) => (
                <Badge key={theme} variant="secondary" className="text-xs">
                  {theme}
                </Badge>
              ))}
              {event.themes.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{event.themes.length - 3} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 mt-4 text-sm text-charcoal-500">
            <Clock className="w-4 h-4" />
            {formatDate(event.date, 'long')}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function TimelineStats({ events, profile, isInView }: { events: any[], profile: EnhancedStorytellerProfile, isInView: boolean }) {
  const stats = [
    { label: 'Stories', value: events.filter(e => e.type === 'story').length, color: 'ochre' },
    { label: 'Organizations', value: events.filter(e => e.type === 'organisation').length, color: 'sage' },
    { label: 'Projects', value: events.filter(e => e.type === 'project').length, color: 'charcoal' },
    { label: 'Years Active', value: calculateYearsActive(profile.created_at, profile.years_of_experience), color: 'terracotta' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.5 }}
      className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      {stats.map((stat) => (
        <div key={stat.label} className={`text-center p-4 bg-${stat.color}-50 rounded-xl`}>
          <div className={`text-2xl font-bold text-${stat.color}-600`}>
            {stat.value}
          </div>
          <div className={`text-sm text-${stat.color}-600`}>{stat.label}</div>
        </div>
      ))}
    </motion.div>
  )
}

function MediaGallerySection({ mediaItems }: { mediaItems: MediaItem[] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'audio' | 'document'>('all')

  const filteredMedia = filter === 'all' ? mediaItems : mediaItems.filter(item => item.type === filter)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="bg-white rounded-3xl shadow-xl p-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-charcoal-900 mb-2 flex items-center gap-3">
            <Image className="w-8 h-8 text-terracotta" />
            Media Gallery
          </h2>
          <p className="text-charcoal-600">Photos, videos, audio recordings and documents</p>
        </div>

        <MediaTypeFilter filter={filter} onFilterChange={setFilter} />
      </div>

      {filteredMedia.length === 0 ? (
        <EmptyState
          icon={Image}
          title={filter === 'all' ? 'No Media Yet' : `No ${filter} files`}
          description={filter === 'all'
            ? 'Media files will appear here as they are shared'
            : `${filter} files will appear here when uploaded`
          }
        />
      ) : (
        <>
          <MediaStats mediaItems={mediaItems} isInView={isInView} />
          <MediaGrid
            mediaItems={filteredMedia}
            onSelect={setSelectedMedia}
            isInView={isInView}
          />
          <CulturalProtocolNotice isInView={isInView} />
        </>
      )}
    </motion.div>
  )
}

function MediaTypeFilter({ filter, onFilterChange }: { filter: string, onFilterChange: (filter: any) => void }) {
  const filterTypes = ['all', 'image', 'video', 'audio', 'document'] as const

  return (
    <div className="flex items-center gap-2">
      {filterTypes.map(type => {
        const config = type === 'all' ? null : getMediaConfig(type)
        const Icon = type === 'all' ? Filter : config?.icon || Filter

        return (
          <Button
            key={type}
            variant={filter === type ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(type)}
            className="capitalize"
          >
            <Icon className="w-4 h-4 mr-1" />
            {type}
          </Button>
        )
      })}
    </div>
  )
}

function MediaStats({ mediaItems, isInView }: { mediaItems: MediaItem[], isInView: boolean }) {
  const mediaTypes = ['image', 'video', 'audio', 'document'] as const

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {mediaTypes.map(type => {
        const count = mediaItems.filter(item => item.type === type).length
        const config = getMediaConfig(type)
        const Icon = config.icon

        return (
          <motion.div
            key={type}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1 }}
            className="text-center p-4 bg-cream rounded-xl"
          >
            <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center text-white`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-charcoal-900">{count}</div>
            <div className="text-sm text-charcoal-600 capitalize">{type}s</div>
          </motion.div>
        )
      })}
    </div>
  )
}

function MediaGrid({ mediaItems, onSelect, isInView }: { mediaItems: MediaItem[], onSelect: (item: MediaItem) => void, isInView: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {mediaItems.map((item, index) => (
        <MediaGridItem
          key={item.id}
          item={item}
          index={index}
          onSelect={onSelect}
          isInView={isInView}
        />
      ))}
    </div>
  )
}

function MediaGridItem({ item, index, onSelect, isInView }: { item: MediaItem, index: number, onSelect: (item: MediaItem) => void, isInView: boolean }) {
  const config = getMediaConfig(item.type)
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * ANIMATION_DELAYS.stagger }}
      className="group cursor-pointer"
      onClick={() => onSelect(item)}
    >
      <div className="relative bg-ochre-100 rounded-2xl overflow-hidden aspect-square hover:shadow-lg transition-shadow">
        <MediaPreview item={item} config={config} Icon={Icon} />

        <div className="absolute top-3 right-3">
          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${config.color} text-white shadow-lg`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        {item.cultural_significance && (
          <div className="absolute top-3 left-3">
            <div className="p-1.5 rounded-lg bg-ochre text-white shadow-lg">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>

      <MediaInfo item={item} />
    </motion.div>
  )
}

function MediaPreview({ item, config, Icon }: { item: MediaItem, config: any, Icon: any }) {
  if (item.type === 'image') {
    return (
      <img
        src={item.thumbnail_url || item.url}
        alt={item.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    )
  }

  if (item.type === 'video') {
    return (
      <div className="w-full h-full bg-ochre-200 flex items-center justify-center relative">
        {item.thumbnail_url ? (
          <img
            src={item.thumbnail_url}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Video className="w-12 h-12 text-charcoal-400" />
        )}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <Play className="w-8 h-8 text-white" />
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full h-full bg-gradient-to-br ${config.color} flex items-center justify-center`}>
      <Icon className="w-12 h-12 text-white" />
    </div>
  )
}

function MediaInfo({ item }: { item: MediaItem }) {
  return (
    <div className="mt-3">
      <h4 className="font-medium text-charcoal-900 truncate">{item.title}</h4>
      {item.description && (
        <p className="text-sm text-charcoal-600 line-clamp-2 mt-1">{item.description}</p>
      )}

      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {item.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {item.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{item.tags.length - 2}
            </Badge>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-2 text-xs text-charcoal-500">
        <span>{new Date(item.created_at).toLocaleDateString()}</span>
        <div className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          <span>View</span>
        </div>
      </div>
    </div>
  )
}

function CulturalProtocolNotice({ isInView }: { isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.5 }}
      className="mt-8 p-4 bg-gradient-to-r from-ochre-50 to-terracotta-50 rounded-2xl border border-ochre-200"
    >
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 text-ochre mt-0.5" />
        <div>
          <h4 className="font-semibold text-terracotta-800">Cultural Protocol Respected</h4>
          <p className="text-sm text-ochre-700 mt-1">
            All shared media respects Indigenous cultural protocols and has appropriate permissions for viewing and sharing.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function RelatedStorytellersSection({ connections }: { connections: ConnectionNode[] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const featuredConnections = connections
    .sort((a, b) => b.connection_strength - a.connection_strength)
    .slice(0, 8)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="bg-white rounded-3xl shadow-xl p-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-charcoal-900 mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-terracotta" />
            Connected Storytellers
          </h2>
          <p className="text-charcoal-600">Discover other voices in the community network</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {connections.length} connections
        </Badge>
      </div>

      {featuredConnections.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Building Connections"
          description="Connected storytellers will appear here as relationships develop"
        />
      ) : (
        <>
          <NetworkVisualization
            connections={featuredConnections}
            totalProjects={connections.reduce((sum, c) => sum + c.shared_projects, 0)}
            isInView={isInView}
          />

          <StorytellerGrid
            connections={featuredConnections}
            isInView={isInView}
          />

          {connections.length > 8 && (
            <ViewAllConnectionsButton
              count={connections.length}
              isInView={isInView}
            />
          )}
        </>
      )}
    </motion.div>
  )
}

function NetworkVisualization({ connections, totalProjects, isInView }: { connections: ConnectionNode[], totalProjects: number, isInView: boolean }) {
  return (
    <div className="mb-8 p-6 bg-gradient-to-br from-ochre-50 to-terracotta-50 rounded-2xl">
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-terracotta to-ochre rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>

          {connections.slice(0, 6).map((connection, index) => {
            const angle = (index * 60) * (Math.PI / 180)
            const radius = 60
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius

            return (
              <motion.div
                key={connection.id}
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: 0.2 + index * ANIMATION_DELAYS.stagger }}
                className="absolute w-6 h-6 bg-white rounded-full border-2 border-ochre-300 flex items-center justify-center"
                style={{
                  left: `calc(50% + ${x}px - 12px)`,
                  top: `calc(50% + ${y}px - 12px)`
                }}
              >
                <div className="w-2 h-2 bg-ochre-400 rounded-full" />
              </motion.div>
            )
          })}
        </div>

        <h3 className="text-lg font-semibold text-charcoal-900 mb-2">Community Network</h3>
        <p className="text-sm text-charcoal-600">
          Connected through {totalProjects} shared projects
        </p>
      </div>
    </div>
  )
}

function StorytellerGrid({ connections, isInView }: { connections: ConnectionNode[], isInView: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {connections.map((connection, index) => (
        <StorytellerCard
          key={connection.id}
          connection={connection}
          index={index}
          isInView={isInView}
        />
      ))}
    </div>
  )
}

function StorytellerCard({ connection, index, isInView }: { connection: ConnectionNode, index: number, isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * ANIMATION_DELAYS.stagger }}
      className="group cursor-pointer"
    >
      <div className="bg-cream rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:bg-white">
        <div className="relative w-16 h-16 mx-auto mb-4">
          {connection.avatar_url ? (
            <img
              src={connection.avatar_url}
              alt={connection.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-terracotta-400 to-ochre-500 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          )}

          <div className="absolute inset-0 rounded-full border-2 border-transparent">
            <div
              className="absolute inset-0 rounded-full border-2 border-terracotta"
              style={{
                borderWidth: `${Math.max(2, connection.connection_strength * 4)}px`,
                opacity: connection.connection_strength
              }}
            />
          </div>
        </div>

        <div className="text-center">
          <h4 className="font-semibold text-charcoal-900 mb-2">{connection.name}</h4>
          <p className="text-sm text-charcoal-600 capitalize mb-3">
            {connection.relationship_type.replace('_', ' ')}
          </p>

          {connection.shared_projects > 0 && (
            <div className="text-xs text-terracotta bg-terracotta-50 rounded-full px-3 py-1 inline-block">
              {connection.shared_projects} shared projects
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="w-full bg-ochre-200 rounded-full h-1">
            <div
              className="h-1 rounded-full bg-gradient-to-r from-terracotta to-ochre"
              style={{ width: `${connection.connection_strength * 100}%` }}
            />
          </div>
          <div className="text-xs text-charcoal-500 text-center mt-1">
            {Math.round(connection.connection_strength * 100)}% connection
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function ViewAllConnectionsButton({ count, isInView }: { count: number, isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ delay: 0.5 }}
      className="text-center mt-8"
    >
      <Button variant="outline" size="lg" className="bg-terracotta-50 border-terracotta-200 text-terracotta-700 hover:bg-terracotta-100">
        <Network className="w-5 h-5 mr-2" />
        View All {count} Connections
      </Button>
    </motion.div>
  )
}

function EmptyState({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="text-center py-12">
      <Icon className="w-16 h-16 text-charcoal-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-charcoal-900 mb-2">{title}</h3>
      <p className="text-charcoal-600">{description}</p>
    </div>
  )
}
