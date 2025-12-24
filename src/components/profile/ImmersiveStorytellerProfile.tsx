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

  const fetchProfileData = async () => {
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

  const fetchStoriesAndMedia = async () => {
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-stone-200 rounded-full mx-auto" />
          <h2 className="text-xl font-semibold text-stone-900">Storyteller not found</h2>
          <p className="text-stone-600">The profile you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-terracotta-50">
      {/* Navigation Header */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href={`/storytellers/${storytellerId}`} className="flex items-center space-x-2 text-stone-700 hover:text-terracotta-600 transition-colours">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Profile</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href={`/storytellers/${storytellerId}`}
                className="px-3 py-2 text-sm bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colours"
              >
                Standard View
              </Link>
              <Link
                href={`/storytellers/${storytellerId}/enhanced`}
                className="px-3 py-2 text-sm bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colours"
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

      {/* Immersive Hero Section */}
      <ProfileHeroSection
        profile={fullProfile}
        showFullBio={showFullBio}
        onToggleBio={() => setShowFullBio(!showFullBio)}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 -mt-24 relative z-10">
          {/* Left Column - Stories & Voice */}
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

          {/* Right Column - Impact & Connections */}
          <div className="space-y-8">
            <ImpactMetricsCard profile={fullProfile} />
            <CommunityConnectionsCard connections={connections} />
            <CulturalContextCard profile={fullProfile} />
          </div>
        </div>

        {/* Full Width Sections */}
        <div className="mt-12 space-y-12">
          <JourneyTimelineSection profile={fullProfile} stories={stories} />
          <MediaGallerySection mediaItems={mediaItems} />
          <RelatedStorytellersSection connections={connections} />
        </div>
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
  return (
    <div className="relative overflow-hidden">
      {/* Background with Cultural Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-terracotta-900 via-purple-900 to-sage-900">
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
          {/* Profile Image & Status */}
          <div className="relative inline-block mb-8">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white/20 backdrop-blur-sm shadow-2xl">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-sage-400 to-clay-600 flex items-center justify-center">
                  <User className="w-20 h-20 text-white/80" />
                </div>
              )}
            </div>

            {/* Status Badges */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {profile.elder_status && (
                <Badge className="bg-amber-500 text-white border-0 shadow-lg">
                  <Crown className="w-3 h-3 mr-1" />
                  Elder
                </Badge>
              )}
              {profile.featured && (
                <Badge className="bg-pink-500 text-white border-0 shadow-lg">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              {profile.traditional_knowledge_keeper && (
                <Badge className="bg-green-500 text-white border-0 shadow-lg">
                  <Leaf className="w-3 h-3 mr-1" />
                  Knowledge Keeper
                </Badge>
              )}
            </div>
          </div>

          {/* Name & Location */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl sm:text-6xl font-bold text-white mb-4"
          >
            {profile.display_name}
          </motion.h1>

          {profile.profile?.locations?.[0] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2 text-sage-100 text-lg mb-6"
            >
              <MapPin className="w-5 h-5" />
              <span>{profile.profile.locations[0].name || profile.profile.locations[0]}</span>
            </motion.div>
          )}

          {/* Cultural Background */}
          {profile.cultural_background && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full text-white mb-8"
            >
              <Globe className="w-5 h-5" />
              <span className="text-lg font-medium">{profile.cultural_background}</span>
            </motion.div>
          )}

          {/* Bio */}
          {profile.bio && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
                <div className={`text-xl leading-relaxed ${showFullBio ? '' : 'line-clamp-3'}`}>
                  {profile.bio}
                </div>
                {profile.bio.length > 200 && (
                  <Button
                    variant="ghost"
                    onClick={onToggleBio}
                    className="mt-4 text-sage-200 hover:text-white hover:bg-white/10"
                  >
                    {showFullBio ? (
                      <>Show Less <ChevronDown className="w-4 h-4 ml-1" /></>
                    ) : (
                      <>Read More <ChevronRight className="w-4 h-4 ml-1" /></>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center gap-8 mt-12"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{profile.story_count}</div>
              <div className="text-sage-200">Stories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{profile.content_stats?.transcript_count || 0}</div>
              <div className="text-sage-200">Transcripts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{profile.organisations?.length || 0}</div>
              <div className="text-sage-200">Organizations</div>
            </div>
            {profile.years_of_experience && (
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{profile.years_of_experience}</div>
                <div className="text-sage-200">Years Experience</div>
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex justify-center gap-4 mt-8"
          >
            <Button size="lg" className="bg-white text-terracotta-900 hover:bg-sage-50">
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
        </motion.div>
      </div>
    </div>
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
          <h2 className="text-3xl font-bold text-stone-900 mb-2">Story Collection</h2>
          <p className="text-stone-600">Explore the rich tapestry of shared experiences</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {stories.length} Stories
        </Badge>
      </div>

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

      {stories.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-stone-900 mb-2">No Stories Yet</h3>
          <p className="text-stone-600">Stories and experiences will appear here as they're shared</p>
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
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`border rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${
        isActive ? 'border-terracotta-300 shadow-lg bg-terracotta-50' : 'border-stone-200 hover:border-stone-300 hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-stone-900 mb-2">{story.title}</h3>
            <p className="text-stone-600 leading-relaxed">{story.excerpt}</p>
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

        {/* Story Metadata */}
        <div className="flex items-center gap-4 text-sm text-stone-500 mb-4">
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

        {/* Themes */}
        <div className="flex flex-wrap gap-2 mb-4">
          {story.themes.map((theme) => (
            <Badge key={theme} variant="secondary" className="text-xs">
              {theme}
            </Badge>
          ))}
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t pt-4 mt-4"
            >
              {/* Audio Player */}
              {story.audio_url && (
                <div className="mb-4">
                  <div className="bg-stone-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Music className="w-5 h-5 text-terracotta-600" />
                      <span className="font-medium">Audio Recording</span>
                    </div>
                    <audio
                      controls
                      className="w-full"
                      src={story.audio_url}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              )}

              {/* Transcript Preview */}
              <div className="mb-4">
                <h4 className="font-medium text-stone-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Transcript Preview
                </h4>
                <div className="bg-stone-50 rounded-lg p-4 text-sm text-stone-700 leading-relaxed">
                  "{story.transcript_preview}..."
                </div>
              </div>

              {/* Cultural Context */}
              {story.cultural_context && (
                <div className="mb-4">
                  <h4 className="font-medium text-stone-900 mb-2 flex items-center gap-2">
                    <Leaf className="w-4 h-4" />
                    Cultural Context
                  </h4>
                  <p className="text-sm text-stone-600 bg-green-50 rounded-lg p-3">
                    {story.cultural_context}
                  </p>
                </div>
              )}

              {/* Actions */}
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
          )}
        </AnimatePresence>
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
        <h2 className="text-3xl font-bold text-stone-900 mb-2">Voice & Wisdom</h2>
        <p className="text-stone-600">Listen to authentic voices and meaningful insights</p>
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
          <div className="grid gap-4">
            {quotableStories.slice(0, 3).map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-r from-sage-50 to-terracotta-50 rounded-2xl p-6 border-l-4 border-terracotta-500"
              >
                <blockquote className="text-lg italic text-stone-700 mb-4">
                  "{story.transcript_preview}"
                </blockquote>
                <div className="flex items-center justify-between">
                  <cite className="text-sm text-stone-600">From "{story.title}"</cite>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{story.themes[0]}</Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audio" className="mt-6">
          <div className="grid gap-4">
            {audioStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-stone-50 rounded-2xl p-6"
              >
                <h4 className="font-semibold text-stone-900 mb-3">{story.title}</h4>
                <audio controls className="w-full mb-3">
                  <source src={story.audio_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
                <div className="flex items-center justify-between text-sm text-stone-600">
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
        </TabsContent>

        <TabsContent value="transcripts" className="mt-6">
          <div className="space-y-4">
            {stories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-stone-200 rounded-xl p-4 hover:border-stone-300 transition-colours"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-stone-900">{story.title}</h4>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Read Full
                  </Button>
                </div>
                <p className="text-sm text-stone-600 line-clamp-2">{story.transcript_preview}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Clock className="w-4 h-4 text-stone-400" />
                  <span className="text-xs text-stone-500">
                    {new Date(story.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-stone-300">•</span>
                  <span className="text-xs text-stone-500">{story.view_count} views</span>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

function ProfileLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-terracotta-50">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-terracotta-900 via-purple-900 to-sage-900" />
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
              <div className="h-8 bg-stone-200 rounded w-48 mb-6" />
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-stone-200 rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl shadow-xl p-6 animate-pulse">
                <div className="h-6 bg-stone-200 rounded w-32 mb-4" />
                <div className="h-24 bg-stone-200 rounded" />
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
      icon: <Users className="w-5 h-5" />,
      colour: 'from-sage-500 to-sage-600'
    },
    {
      label: 'Cultural Knowledge',
      value: profile.traditional_knowledge_keeper ? 0.95 : 0.7,
      icon: <Leaf className="w-5 h-5" />,
      colour: 'from-green-500 to-green-600'
    },
    {
      label: 'Storytelling Impact',
      value: Math.min(profile.story_count / 20, 1),
      icon: <BookOpen className="w-5 h-5" />,
      colour: 'from-clay-500 to-clay-600'
    },
    {
      label: 'Network Influence',
      value: Math.min((profile.organisations?.length || 0) / 5, 1),
      icon: <Network className="w-5 h-5" />,
      colour: 'from-orange-500 to-orange-600'
    }
  ]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-3xl shadow-xl p-6"
    >
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-terracotta-600" />
        Community Impact
      </h3>

      <div className="space-y-6">
        {/* Overall Impact Score */}
        <div className="text-center p-6 bg-gradient-to-br from-terracotta-50 to-clay-50 rounded-2xl border border-terracotta-100">
          <div className="text-4xl font-bold text-terracotta-600 mb-2">
            {Math.round((impactAreas.reduce((sum, area) => sum + area.value, 0) / impactAreas.length) * 100)}%
          </div>
          <div className="text-sm font-medium text-stone-600">Overall Impact Score</div>
          <div className="text-xs text-stone-500 mt-1">Based on community engagement and contributions</div>
        </div>

        {/* Individual Impact Areas */}
        <div className="space-y-4">
          {impactAreas.map((area, index) => (
            <motion.div
              key={area.label}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${area.colour} text-white`}>
                    {area.icon}
                  </div>
                  <span className="font-medium text-stone-900">{area.label}</span>
                </div>
                <span className="text-sm font-semibold text-stone-600">
                  {Math.round(area.value * 100)}%
                </span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${area.value * 100}%` } : {}}
                  transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                  className={`h-2 rounded-full bg-gradient-to-r ${area.colour}`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Key Achievements */}
        <div className="pt-4 border-t border-stone-100">
          <h4 className="font-semibold text-stone-900 mb-3">Key Achievements</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-sage-50 rounded-lg">
              <div className="text-2xl font-bold text-sage-600">{profile.story_count}</div>
              <div className="text-xs text-sage-600">Stories Shared</div>
            </div>
            <div className="text-center p-3 bg-clay-50 rounded-lg">
              <div className="text-2xl font-bold text-clay-600">{profile.organisations?.length || 0}</div>
              <div className="text-xs text-clay-600">Organizations</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{profile.projects?.length || 0}</div>
              <div className="text-xs text-green-600">Projects</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {profile.years_of_experience || 'N/A'}
              </div>
              <div className="text-xs text-orange-600">Years Experience</div>
            </div>
          </div>
        </div>

        {/* Availability Indicators */}
        {(profile.mentor_availability || profile.speaking_availability || profile.collaboration_availability) && (
          <div className="pt-4 border-t border-stone-100">
            <h4 className="font-semibold text-stone-900 mb-3">Availability</h4>
            <div className="space-y-2">
              {profile.mentor_availability && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-stone-700">Available for mentoring</span>
                </div>
              )}
              {profile.speaking_availability && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-sage-500 rounded-full"></div>
                  <span className="text-stone-700">Available for speaking engagements</span>
                </div>
              )}
              {profile.collaboration_availability && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-clay-500 rounded-full"></div>
                  <span className="text-stone-700">Open to collaborations</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function CommunityConnectionsCard({ connections }: { connections: ConnectionNode[] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [showAll, setShowAll] = useState(false)

  const displayConnections = showAll ? connections : connections.slice(0, 6)

  const getRelationshipColor = (type: string) => {
    switch (type) {
      case 'mentor': return 'from-clay-500 to-clay-600'
      case 'mentee': return 'from-sage-500 to-sage-600'
      case 'collaborator': return 'from-green-500 to-green-600'
      case 'colleague': return 'from-orange-500 to-orange-600'
      default: return 'from-grey-500 to-grey-600'
    }
  }

  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case 'mentor': return <GraduationCap className="w-3 h-3" />
      case 'mentee': return <Users className="w-3 h-3" />
      case 'collaborator': return <Handshake className="w-3 h-3" />
      case 'colleague': return <Building className="w-3 h-3" />
      default: return <Network className="w-3 h-3" />
    }
  }

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
          <Network className="w-6 h-6 text-terracotta-600" />
          Network
        </h3>
        <Badge variant="outline" className="text-sm">
          {connections.length} connections
        </Badge>
      </div>

      {connections.length === 0 ? (
        <div className="text-center py-8">
          <Network className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500">No connections yet</p>
          <p className="text-sm text-stone-400">Connections will appear as relationships are built</p>
        </div>
      ) : (
        <>
          {/* Connection Strength Visualization */}
          <div className="mb-6 p-4 bg-gradient-to-br from-sage-50 to-terracotta-50 rounded-2xl">
            <h4 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-terracotta-600" />
              Network Strength
            </h4>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-stone-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? {
                    width: `${Math.min((connections.reduce((sum, c) => sum + c.connection_strength, 0) / connections.length) * 100, 100)}%`
                  } : {}}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="h-2 rounded-full bg-gradient-to-r from-terracotta-500 to-clay-600"
                />
              </div>
              <span className="text-sm font-semibold text-terracotta-600">
                {Math.round((connections.reduce((sum, c) => sum + c.connection_strength, 0) / connections.length) * 100)}%
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-1">Average connection strength across network</p>
          </div>

          {/* Individual Connections */}
          <div className="space-y-3">
            {displayConnections.map((connection, index) => (
              <motion.div
                key={connection.id}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.1 * index }}
                className="group flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colours cursor-pointer"
              >
                <div className="relative">
                  {connection.avatar_url ? (
                    <img
                      src={connection.avatar_url}
                      alt={connection.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage-400 to-clay-500 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}

                  {/* Relationship Type Badge */}
                  <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-gradient-to-r ${getRelationshipColor(connection.relationship_type)} shadow-sm`}>
                    {getRelationshipIcon(connection.relationship_type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-stone-900 truncate">{connection.name}</div>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span className="capitalize">{connection.relationship_type.replace('_', ' ')}</span>
                    {connection.shared_projects > 0 && (
                      <>
                        <span>•</span>
                        <span>{connection.shared_projects} shared projects</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Connection Strength Indicator */}
                <div className="flex items-center gap-2">
                  <div className="w-12 bg-stone-200 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full bg-gradient-to-r ${getRelationshipColor(connection.relationship_type)}`}
                      style={{ width: `${connection.connection_strength * 100}%` }}
                    />
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-colours" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Show More/Less Toggle */}
          {connections.length > 6 && (
            <Button
              variant="ghost"
              onClick={() => setShowAll(!showAll)}
              className="w-full mt-4 text-terracotta-600 hover:text-terracotta-700 hover:bg-terracotta-50"
            >
              {showAll ? (
                <>Show Less <ChevronDown className="w-4 h-4 ml-1" /></>
              ) : (
                <>View All {connections.length} Connections <ArrowRight className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          )}

          {/* Relationship Type Breakdown */}
          <div className="mt-6 pt-4 border-t border-stone-100">
            <h4 className="font-semibold text-stone-900 mb-3">Relationship Types</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(
                connections.reduce((acc, conn) => {
                  acc[conn.relationship_type] = (acc[conn.relationship_type] || 0) + 1
                  return acc
                }, {} as Record<string, number>)
              ).map(([type, count]) => (
                <div key={type} className="flex items-center gap-2 text-sm">
                  <div className={`p-1 rounded bg-gradient-to-r ${getRelationshipColor(type)}`}>
                    {getRelationshipIcon(type)}
                  </div>
                  <span className="text-stone-700 capitalize flex-1">{type.replace('_', ' ')}</span>
                  <span className="font-medium text-stone-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
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
        <Leaf className="w-6 h-6 text-green-600" />
        Cultural Heritage
      </h3>

      <div className="space-y-6">
        {/* Traditional Territory */}
        {profile.cultural_background && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100"
          >
            <h4 className="font-semibold text-stone-900 mb-2 flex items-center gap-2">
              <Map className="w-4 h-4 text-green-600" />
              Cultural Background
            </h4>
            <p className="text-stone-700">{profile.cultural_background}</p>
            {profile.specialties && profile.specialties.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {(profile.specialties || []).map(specialty => (
                  <Badge key={specialty} variant="outline" className="text-xs border-green-300 text-green-700">
                    {specialty}
                  </Badge>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Cultural Background */}
        {profile.cultural_background && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="p-4 bg-gradient-to-br from-sage-50 to-terracotta-50 rounded-2xl border border-sage-100"
          >
            <h4 className="font-semibold text-stone-900 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-sage-600" />
              Cultural Background
            </h4>
            <p className="text-stone-700">{profile.cultural_background}</p>
          </motion.div>
        )}

        {/* Languages */}
        {profile.languages && profile.languages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h4 className="font-semibold text-stone-900 flex items-center gap-2">
              <Languages className="w-4 h-4 text-clay-600" />
              Languages
            </h4>
            <div className="flex flex-wrap gap-2">
              {(profile.languages || []).map((language, index) => (
                <motion.div
                  key={language}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Badge variant="secondary" className="bg-clay-100 text-clay-700 border-clay-200">
                    {language}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Cultural Affiliations */}
        {profile.cultural_affiliations && profile.cultural_affiliations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <h4 className="font-semibold text-stone-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-600" />
              Cultural Affiliations
            </h4>
            <div className="space-y-2">
              {(profile.cultural_affiliations || []).map((affiliation, index) => (
                <motion.div
                  key={affiliation}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 border border-orange-100"
                >
                  <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                  <span className="text-sm text-stone-700">{affiliation}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Specialties & Expertise */}
        {((profile.specialties && profile.specialties.length > 0) ||
          (profile.expertise_areas && profile.expertise_areas.length > 0)) && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <h4 className="font-semibold text-stone-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-terracotta-600" />
              Areas of Focus
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {profile.specialties?.map((specialty, index) => (
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
              {profile.expertise_areas?.map((area, index) => (
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
        )}

        {/* Community Roles */}
        {profile.community_roles && profile.community_roles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <h4 className="font-semibold text-stone-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" />
              Community Roles
            </h4>
            <div className="space-y-2">
              {(profile.community_roles || []).map((role, index) => (
                <motion.div
                  key={role}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-stone-900">{role}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Knowledge Keeper Badge */}
        {profile.traditional_knowledge_keeper && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.8 }}
            className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-amber-800">Traditional Knowledge Keeper</h4>
                <p className="text-sm text-amber-700">Recognized holder of traditional cultural knowledge</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

function JourneyTimelineSection({ profile, stories }: { profile: EnhancedStorytellerProfile, stories: StoryPreview[] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  // Create timeline events from profile and stories
  const timelineEvents = [
    {
      id: 'joined',
      date: profile.created_at,
      type: 'milestone',
      title: 'Joined Community',
      description: 'Became part of the storytelling community',
      icon: <Star className="w-4 h-4" />,
      colour: 'from-sage-500 to-sage-600'
    },
    ...stories.map(story => ({
      id: story.id,
      date: story.created_at,
      type: 'story' as const,
      title: story.title,
      description: story.excerpt,
      icon: <BookOpen className="w-4 h-4" />,
      colour: 'from-clay-500 to-clay-600',
      themes: story.themes
    })),
    ...((profile.organisations || []).map(org => ({
      id: `org-${org.id}`,
      date: org.start_date || profile.created_at,
      type: 'organisation' as const,
      title: `Joined ${org.name}`,
      description: `${org.role} at ${org.name}`,
      icon: <Building className="w-4 h-4" />,
      colour: 'from-green-500 to-green-600'
    }))),
    ...((profile.projects || []).map(project => ({
      id: `project-${project.id}`,
      date: project.start_date || profile.created_at,
      type: 'project' as const,
      title: project.name,
      description: `${project.role} - ${project.description || 'Project participation'}`,
      icon: <Target className="w-4 h-4" />,
      colour: 'from-orange-500 to-orange-600'
    })))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

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
          <h2 className="text-3xl font-bold text-stone-900 mb-2 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-terracotta-600" />
            Journey Timeline
          </h2>
          <p className="text-stone-600">A chronological view of contributions and milestones</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {timelineEvents.length} Events
        </Badge>
      </div>

      {timelineEvents.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-stone-900 mb-2">Journey Beginning</h3>
          <p className="text-stone-600">Timeline will grow as stories and experiences are shared</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-terracotta-500 to-clay-600" />

          {/* Timeline Events */}
          <div className="space-y-8">
            {timelineEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start gap-6"
              >
                {/* Timeline Marker */}
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${event.colour} flex items-center justify-center text-white shadow-lg`}>
                    {event.icon}
                  </div>
                  {/* Date Badge */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-stone-200 rounded-lg px-2 py-1 shadow-sm">
                    <div className="text-xs font-medium text-stone-600 whitespace-nowrap">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {/* Event Content */}
                <div className="flex-1 pb-8">
                  <div className="bg-stone-50 rounded-2xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-stone-900">{event.title}</h3>
                      <Badge
                        variant="outline"
                        className={`capitalize ${
                          event.type === 'story' ? 'border-clay-200 text-clay-700' :
                          event.type === 'organisation' ? 'border-green-200 text-green-700' :
                          event.type === 'project' ? 'border-orange-200 text-orange-700' :
                          'border-sage-200 text-sage-700'
                        }`}
                      >
                        {event.type}
                      </Badge>
                    </div>

                    <p className="text-stone-600 mb-4">{event.description}</p>

                    {/* Themes for stories */}
                    {event.type === 'story' && 'themes' in event && event.themes && (
                      <div className="flex flex-wrap gap-2">
                        {event.themes.slice(0, 3).map(theme => (
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

                    {/* Full date */}
                    <div className="flex items-center gap-2 mt-4 text-sm text-stone-500">
                      <Clock className="w-4 h-4" />
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Timeline Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="text-center p-4 bg-clay-50 rounded-xl">
              <div className="text-2xl font-bold text-clay-600">
                {timelineEvents.filter(e => e.type === 'story').length}
              </div>
              <div className="text-sm text-clay-600">Stories</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">
                {timelineEvents.filter(e => e.type === 'organisation').length}
              </div>
              <div className="text-sm text-green-600">Organizations</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <div className="text-2xl font-bold text-orange-600">
                {timelineEvents.filter(e => e.type === 'project').length}
              </div>
              <div className="text-sm text-orange-600">Projects</div>
            </div>
            <div className="text-center p-4 bg-sage-50 rounded-xl">
              <div className="text-2xl font-bold text-sage-600">
                {profile.years_of_experience || Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365))}
              </div>
              <div className="text-sm text-sage-600">Years Active</div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

function MediaGallerySection({ mediaItems }: { mediaItems: MediaItem[] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'audio' | 'document'>('all')

  const filteredMedia = filter === 'all' ? mediaItems : mediaItems.filter(item => item.type === filter)

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5" />
      case 'video': return <Video className="w-5 h-5" />
      case 'audio': return <Music className="w-5 h-5" />
      case 'document': return <FileText className="w-5 h-5" />
      default: return <FileText className="w-5 h-5" />
    }
  }

  const getMediaColor = (type: string) => {
    switch (type) {
      case 'image': return 'from-pink-500 to-rose-600'
      case 'video': return 'from-red-500 to-red-600'
      case 'audio': return 'from-clay-500 to-clay-600'
      case 'document': return 'from-sage-500 to-sage-600'
      default: return 'from-grey-500 to-grey-600'
    }
  }

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
          <h2 className="text-3xl font-bold text-stone-900 mb-2 flex items-center gap-3">
            <Image className="w-8 h-8 text-pink-600" />
            Media Gallery
          </h2>
          <p className="text-stone-600">Photos, videos, audio recordings and documents</p>
        </div>

        {/* Media Type Filter */}
        <div className="flex items-center gap-2">
          {(['all', 'image', 'video', 'audio', 'document'] as const).map(type => (
            <Button
              key={type}
              variant={filter === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(type)}
              className="capitalize"
            >
              {type === 'all' ? (
                <Filter className="w-4 h-4 mr-1" />
              ) : (
                getMediaIcon(type)
              )}
              {type}
            </Button>
          ))}
        </div>
      </div>

      {filteredMedia.length === 0 ? (
        <div className="text-center py-12">
          <Image className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-stone-900 mb-2">
            {filter === 'all' ? 'No Media Yet' : `No ${filter} files`}
          </h3>
          <p className="text-stone-600">
            {filter === 'all'
              ? 'Media files will appear here as they are shared'
              : `${filter} files will appear here when uploaded`
            }
          </p>
        </div>
      ) : (
        <>
          {/* Media Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {(['image', 'video', 'audio', 'document'] as const).map(type => {
              const count = mediaItems.filter(item => item.type === type).length
              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.1 }}
                  className="text-center p-4 bg-stone-50 rounded-xl"
                >
                  <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br ${getMediaColor(type)} flex items-center justify-center text-white`}>
                    {getMediaIcon(type)}
                  </div>
                  <div className="text-2xl font-bold text-stone-900">{count}</div>
                  <div className="text-sm text-stone-600 capitalize">{type}s</div>
                </motion.div>
              )
            })}
          </div>

          {/* Media Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMedia.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => setSelectedMedia(item)}
              >
                <div className="relative bg-stone-100 rounded-2xl overflow-hidden aspect-square hover:shadow-lg transition-shadow">
                  {/* Media Preview */}
                  {item.type === 'image' ? (
                    <img
                      src={item.thumbnail_url || item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : item.type === 'video' ? (
                    <div className="w-full h-full bg-stone-200 flex items-center justify-center relative">
                      {item.thumbnail_url ? (
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Video className="w-12 h-12 text-stone-400" />
                      )}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getMediaColor(item.type)} flex items-center justify-center`}>
                      {getMediaIcon(item.type)}
                    </div>
                  )}

                  {/* Media Type Badge */}
                  <div className="absolute top-3 right-3">
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${getMediaColor(item.type)} text-white shadow-lg`}>
                      {getMediaIcon(item.type)}
                    </div>
                  </div>

                  {/* Cultural Significance Indicator */}
                  {item.cultural_significance && (
                    <div className="absolute top-3 left-3">
                      <div className="p-1.5 rounded-lg bg-amber-500 text-white shadow-lg">
                        <Leaf className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Media Info */}
                <div className="mt-3">
                  <h4 className="font-medium text-stone-900 truncate">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm text-stone-600 line-clamp-2 mt-1">{item.description}</p>
                  )}

                  {/* Tags */}
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

                  <div className="flex items-center justify-between mt-2 text-xs text-stone-500">
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Cultural Protocol Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="mt-8 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200"
          >
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800">Cultural Protocol Respected</h4>
                <p className="text-sm text-amber-700 mt-1">
                  All shared media respects Indigenous cultural protocols and has appropriate permissions for viewing and sharing.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
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
          <h2 className="text-3xl font-bold text-stone-900 mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-terracotta-600" />
            Connected Storytellers
          </h2>
          <p className="text-stone-600">Discover other voices in the community network</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {connections.length} connections
        </Badge>
      </div>

      {featuredConnections.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-stone-900 mb-2">Building Connections</h3>
          <p className="text-stone-600">Connected storytellers will appear here as relationships develop</p>
        </div>
      ) : (
        <>
          {/* Connection Network Visualization */}
          <div className="mb-8 p-6 bg-gradient-to-br from-terracotta-50 to-clay-50 rounded-2xl">
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                {/* Central Node */}
                <div className="absolute inset-0 bg-gradient-to-br from-terracotta-500 to-clay-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>

                {/* Connection Nodes */}
                {featuredConnections.slice(0, 6).map((connection, index) => {
                  const angle = (index * 60) * (Math.PI / 180)
                  const radius = 60
                  const x = Math.cos(angle) * radius
                  const y = Math.sin(angle) * radius

                  return (
                    <motion.div
                      key={connection.id}
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : {}}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="absolute w-6 h-6 bg-white rounded-full border-2 border-terracotta-300 flex items-center justify-center"
                      style={{
                        left: `calc(50% + ${x}px - 12px)`,
                        top: `calc(50% + ${y}px - 12px)`
                      }}
                    >
                      <div className="w-2 h-2 bg-terracotta-400 rounded-full" />
                    </motion.div>
                  )
                })}
              </div>

              <h3 className="text-lg font-semibold text-stone-900 mb-2">Community Network</h3>
              <p className="text-sm text-stone-600">
                Connected through {connections.reduce((sum, c) => sum + c.shared_projects, 0)} shared projects
              </p>
            </div>
          </div>

          {/* Featured Connections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredConnections.map((connection, index) => (
              <motion.div
                key={connection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="bg-stone-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:bg-white">
                  {/* Avatar */}
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    {connection.avatar_url ? (
                      <img
                        src={connection.avatar_url}
                        alt={connection.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-sage-400 to-clay-500 flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                    )}

                    {/* Connection Strength Ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-transparent">
                      <div
                        className="absolute inset-0 rounded-full border-2 border-terracotta-500"
                        style={{
                          borderWidth: `${Math.max(2, connection.connection_strength * 4)}px`,
                          opacity: connection.connection_strength
                        }}
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="text-center">
                    <h4 className="font-semibold text-stone-900 mb-2">{connection.name}</h4>
                    <p className="text-sm text-stone-600 capitalize mb-3">
                      {connection.relationship_type.replace('_', ' ')}
                    </p>

                    {connection.shared_projects > 0 && (
                      <div className="text-xs text-terracotta-600 bg-terracotta-50 rounded-full px-3 py-1 inline-block">
                        {connection.shared_projects} shared projects
                      </div>
                    )}
                  </div>

                  {/* Connection Strength Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-stone-200 rounded-full h-1">
                      <div
                        className="h-1 rounded-full bg-gradient-to-r from-terracotta-500 to-clay-600"
                        style={{ width: `${connection.connection_strength * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-stone-500 text-center mt-1">
                      {Math.round(connection.connection_strength * 100)}% connection
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View All Button */}
          {connections.length > 8 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 }}
              className="text-center mt-8"
            >
              <Button variant="outline" size="lg" className="bg-terracotta-50 border-terracotta-200 text-terracotta-700 hover:bg-terracotta-100">
                <Network className="w-5 h-5 mr-2" />
                View All {connections.length} Connections
              </Button>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  )
}