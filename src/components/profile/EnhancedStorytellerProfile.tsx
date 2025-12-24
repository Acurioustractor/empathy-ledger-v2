'use client'

// ENHANCED STORYTELLER PROFILE WITH INDIGENOUS IMPACT SHOWCASE
// Uses actual Supabase profile fields + new impact measurement data

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { StorytellerImpactNotifications } from '@/components/impact/RealTimeImpactNotifications'
import {
  User, Crown, Heart, Sparkles, Award, TrendingUp,
  Calendar, MapPin, Globe, Users, BookOpen, Video,
  Star, Shield, Leaf, Handshake, ArrowUp, Clock
} from 'lucide-react'

interface StorytellerProfileData {
  // Core Supabase fields
  id: string
  display_name: string
  bio?: string
  profile_image_url?: string
  cultural_background?: string
  tenant_roles?: string[]
  is_storyteller: boolean
  is_elder: boolean
  is_featured: boolean
  video_introduction_url?: string
  featured_video_url?: string

  // New impact measurement fields
  total_impact_insights: number
  primary_impact_type?: string
  impact_confidence_score?: number
  cultural_protocol_score?: number
  community_leadership_score?: number
  knowledge_transmission_score?: number
  healing_integration_score?: number
  relationship_building_score?: number
  system_navigation_score?: number
  last_impact_analysis?: string
  impact_badges?: string[]
  storyteller_ranking?: number
}

interface EnhancedStorytellerProfileProps {
  storytellerId: string
}

export function EnhancedStorytellerProfile({ storytellerId }: EnhancedStorytellerProfileProps) {
  const [profile, setProfile] = useState<StorytellerProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStorytellerProfile()
  }, [storytellerId])

  const fetchStorytellerProfile = async () => {
    try {
      const response = await fetch(`/api/storytellers/${storytellerId}/profile-with-impact`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
      }
    } catch (error) {
      console.error('Error fetching storyteller profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <ProfileSkeleton />
  }

  if (!profile) {
    return <div className="text-center p-8">Storyteller profile not found</div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Real-time impact notifications */}
      <StorytellerImpactNotifications storytellerId={storytellerId} />

      {/* Hero Section */}
      <ProfileHeroSection profile={profile} />

      {/* Impact Dashboard */}
      <ImpactDashboardSection profile={profile} />

      {/* Cultural Contributions */}
      <CulturalContributionsSection profile={profile} />

      {/* Community Impact Timeline */}
      <ImpactTimelineSection profile={profile} />
    </div>
  )
}

function ProfileHeroSection({ profile }: { profile: StorytellerProfileData }) {
  const getRankingBadge = () => {
    if (!profile.storyteller_ranking) return null

    if (profile.storyteller_ranking <= 10) {
      return { icon: <Crown className="w-5 h-5" />, label: 'Top 10 Storyteller', colour: 'bg-yellow-500' }
    } else if (profile.storyteller_ranking <= 50) {
      return { icon: <Star className="w-5 h-5" />, label: 'Leading Voice', colour: 'bg-sage-500' }
    } else {
      return { icon: <Sparkles className="w-5 h-5" />, label: 'Rising Storyteller', colour: 'bg-green-500' }
    }
  }

  const rankingBadge = getRankingBadge()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-sage-600 to-clay-600 text-white rounded-xl p-8"
    >
      <div className="flex items-start gap-6">
        {/* Profile Image */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
            {profile.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt={profile.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-white/70" />
            )}
          </div>

          {/* Status indicators */}
          <div className="absolute -bottom-2 -right-2 flex gap-1">
            {profile.is_elder && (
              <div className="bg-amber-500 p-1 rounded-full" title="Community Elder">
                <Crown className="w-4 h-4 text-white" />
              </div>
            )}
            {profile.is_featured && (
              <div className="bg-pink-500 p-1 rounded-full" title="Featured Storyteller">
                <Star className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{profile.display_name}</h1>
            {rankingBadge && (
              <div className={`${rankingBadge.colour} px-3 py-1 rounded-full flex items-center gap-2 text-sm font-medium`}>
                {rankingBadge.icon}
                {rankingBadge.label}
              </div>
            )}
          </div>

          {profile.primary_impact_type && (
            <div className="bg-white/20 px-4 py-2 rounded-lg mb-4 inline-block">
              <div className="text-sm opacity-90">Primary Impact Area</div>
              <div className="font-semibold capitalize">
                {profile.primary_impact_type.replace('_', ' ')}
              </div>
            </div>
          )}

          {profile.bio && (
            <p className="text-white/90 text-lg leading-relaxed mb-4">
              {profile.bio}
            </p>
          )}

          {profile.cultural_background && (
            <div className="flex items-center gap-2 text-white/80">
              <MapPin className="w-4 h-4" />
              <span>{profile.cultural_background}</span>
            </div>
          )}
        </div>

        {/* Impact Score */}
        {profile.impact_confidence_score && (
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">
              {Math.round(profile.impact_confidence_score * 100)}%
            </div>
            <div className="text-sm opacity-90">Impact Confidence</div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function ImpactDashboardSection({ profile }: { profile: StorytellerProfileData }) {
  const impactAreas = [
    {
      key: 'cultural_protocol_score',
      label: 'Cultural Protocol',
      value: profile.cultural_protocol_score || 0,
      icon: <Shield className="w-5 h-5" />,
      colour: 'bg-sage-500'
    },
    {
      key: 'community_leadership_score',
      label: 'Community Leadership',
      value: profile.community_leadership_score || 0,
      icon: <Users className="w-5 h-5" />,
      colour: 'bg-clay-500'
    },
    {
      key: 'knowledge_transmission_score',
      label: 'Knowledge Transmission',
      value: profile.knowledge_transmission_score || 0,
      icon: <BookOpen className="w-5 h-5" />,
      colour: 'bg-green-500'
    },
    {
      key: 'healing_integration_score',
      label: 'Healing Integration',
      value: profile.healing_integration_score || 0,
      icon: <Heart className="w-5 h-5" />,
      colour: 'bg-pink-500'
    },
    {
      key: 'relationship_building_score',
      label: 'Relationship Building',
      value: profile.relationship_building_score || 0,
      icon: <Handshake className="w-5 h-5" />,
      colour: 'bg-orange-500'
    },
    {
      key: 'system_navigation_score',
      label: 'System Navigation',
      value: profile.system_navigation_score || 0,
      icon: <TrendingUp className="w-5 h-5" />,
      colour: 'bg-terracotta-500'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-stone-900">Indigenous Impact Profile</h2>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-sage-600">{profile.total_impact_insights}</div>
            <div className="text-sm text-stone-600">Total Insights</div>
          </div>
          {profile.storyteller_ranking && (
            <div className="text-center">
              <div className="text-2xl font-bold text-clay-600">#{profile.storyteller_ranking}</div>
              <div className="text-sm text-stone-600">Community Ranking</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {impactAreas.map((area) => (
          <ImpactAreaCard key={area.key} area={area} />
        ))}
      </div>

      {/* Impact Badges */}
      {profile.impact_badges && profile.impact_badges.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-stone-900 mb-3">Impact Achievements</h3>
          <div className="flex flex-wrap gap-2">
            {profile.impact_badges.map((badge, index) => (
              <div key={index} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Award className="w-4 h-4" />
                {badge}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

function ImpactAreaCard({ area }: { area: any }) {
  const percentage = Math.round(area.value * 100)

  return (
    <div className="bg-stone-50 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`${area.colour} p-2 rounded-lg text-white`}>
          {area.icon}
        </div>
        <div>
          <div className="font-medium text-stone-900">{area.label}</div>
          <div className="text-2xl font-bold text-stone-900">{percentage}%</div>
        </div>
      </div>

      <div className="w-full bg-stone-200 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className={`h-2 rounded-full ${area.colour}`}
        />
      </div>
    </div>
  )
}

function CulturalContributionsSection({ profile }: { profile: StorytellerProfileData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <h2 className="text-2xl font-bold text-stone-900 mb-6">Cultural Contributions</h2>

      {/* Video Introduction */}
      {profile.video_introduction_url && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <Video className="w-5 h-5" />
            Video Introduction
          </h3>
          <div className="aspect-video bg-stone-100 rounded-lg flex items-center justify-center">
            <p className="text-stone-600">Video player would be integrated here</p>
          </div>
        </div>
      )}

      {/* Placeholder for stories, transcripts, etc. */}
      <div className="text-stone-600">
        <p>Additional cultural contributions and stories will be displayed here as they are integrated with the impact analysis system.</p>
      </div>
    </motion.div>
  )
}

function ImpactTimelineSection({ profile }: { profile: StorytellerProfileData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
        <Clock className="w-6 h-6" />
        Community Impact Timeline
      </h2>

      {profile.last_impact_analysis ? (
        <div className="text-sm text-stone-600">
          Last analysis: {new Date(profile.last_impact_analysis).toLocaleDateString()}
        </div>
      ) : (
        <div className="text-stone-600 text-center py-8">
          <Sparkles className="w-12 h-12 text-stone-400 mx-auto mb-4" />
          <p className="text-lg font-medium">Ready for Impact Analysis</p>
          <p className="text-sm">Upload stories and transcripts to begin measuring Indigenous community impact</p>
        </div>
      )}
    </motion.div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
      <div className="bg-stone-300 rounded-xl h-48"></div>
      <div className="bg-stone-300 rounded-xl h-64"></div>
      <div className="bg-stone-300 rounded-xl h-32"></div>
    </div>
  )
}