'use client'

export const dynamic = 'force-dynamic'

import React from 'react'
import { StorytellerCard } from '@/components/storyteller/storyteller-card'
import { Typography } from '@/components/ui/typography'

const demoStorytellers = [
  {
    id: '1',
    display_name: 'Sarah Crow Feather',
    bio: 'Traditional knowledge keeper and educator working to preserve Lakota language and customs for future generations. Sharing stories and wisdom that connect us to our ancestors.',
    cultural_background: 'Lakota',
    specialties: ['Traditional Stories', 'Language Preservation', 'Cultural Education'],
    years_of_experience: 22,
    preferred_topics: ['Oral Tradition', 'Cultural Heritage'],
    story_count: 47,
    featured: true,
    status: 'active' as const,
    elder_status: true,
    storytelling_style: ['Oral Tradition', 'Educational'],
    location: 'Pine Ridge, South Dakota',
    profile: {
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
      cultural_affiliations: ['Lakota Nation'],
      pronouns: 'she/her'
    },
    organisations: [
      { id: 'org-1', name: 'Lakota Language Consortium', role: 'Board Member' },
      { id: 'org-2', name: 'Indigenous Education Alliance', role: 'Cultural Advisor' }
    ],
    projects: [
      { id: 'proj-1', name: 'Youth Language Immersion', role: 'Lead Instructor' }
    ]
  },
  {
    id: '2',
    display_name: 'Marcus Whitehorse',
    bio: 'Contemporary storyteller blending traditional Navajo narratives with modern digital media. Passionate about making Indigenous stories accessible to younger generations through technology.',
    cultural_background: 'Navajo',
    specialties: ['Digital Storytelling', 'Youth Engagement', 'Contemporary Art'],
    years_of_experience: 8,
    preferred_topics: ['Digital Media', 'Cultural Fusion'],
    story_count: 23,
    featured: true,
    status: 'active' as const,
    elder_status: false,
    storytelling_style: ['Digital Storytelling', 'Performance'],
    location: 'Window Rock, Arizona',
    profile: {
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      pronouns: 'he/him'
    },
    organisations: [
      { id: 'org-3', name: 'Digital Indigenous Network', role: 'Creator' }
    ],
    projects: [
      { id: 'proj-2', name: 'Stories Through Technology', role: 'Founder' }
    ]
  },
  {
    id: '3',
    display_name: 'Emma Thunderbird',
    bio: 'Rising voice in the storytelling community, focusing on personal healing narratives and community connection through shared experiences.',
    cultural_background: 'Cree',
    specialties: ['Personal Narratives', 'Community Building', 'Healing Stories'],
    years_of_experience: 3,
    preferred_topics: ['Healing', 'Personal Growth'],
    story_count: 12,
    featured: false,
    status: 'active' as const,
    elder_status: false,
    storytelling_style: ['Written Narrative', 'Interactive'],
    location: 'Edmonton, Alberta',
    profile: {
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      pronouns: 'she/her'
    },
    specialties: ['Healing Stories', 'Community Building']
  },
  {
    id: '4',
    display_name: 'Thomas Redsky',
    bio: 'Master storyteller with decades of experience preserving and sharing Anishinaabe traditions. Known for captivating audiences with tales of creation and cultural wisdom.',
    cultural_background: 'Anishinaabe',
    specialties: ['Creation Stories', 'Traditional Wisdom', 'Cultural Ceremonies'],
    years_of_experience: 35,
    preferred_topics: ['Traditional Knowledge', 'Ceremonial Stories'],
    story_count: 89,
    featured: true,
    status: 'active' as const,
    elder_status: true,
    storytelling_style: ['Oral Tradition', 'Ceremonial'],
    location: 'Kenora, Ontario',
    profile: {
      avatar_url: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400',
      pronouns: 'he/him'
    },
    organisations: [
      { id: 'org-4', name: 'Anishinaabe Cultural Centre', role: 'Elder Advisor' }
    ]
  }
]

export default function TestModernCardsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-sage-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <Typography variant="h1" className="text-4xl font-bold mb-4 bg-gradient-to-r from-earth-700 to-sage-700 bg-clip-text text-transparent">
            ✨ Refined Storyteller Cards
          </Typography>
          <Typography variant="body" className="text-grey-600 text-lg max-w-2xl mx-auto">
            Clean, spacious design with subtle animations and breathing room
          </Typography>
        </div>

        {/* Features List */}
        <div className="mb-12 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-grey-100">
          <Typography variant="h2" className="text-xl font-semibold mb-4 text-earth-700">
            🎨 Refined Design Features
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-sage-500">✓</span>
              <span><strong>Generous Spacing:</strong> More breathing room between elements</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sage-500">✓</span>
              <span><strong>Subtle Effects:</strong> Gentle hover states without overwhelming</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sage-500">✓</span>
              <span><strong>Clean Badges:</strong> Simple, elegant status indicators</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sage-500">✓</span>
              <span><strong>Minimal Animation:</strong> Smooth transitions that feel natural</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sage-500">✓</span>
              <span><strong>Icon Balance:</strong> Icons that support, not distract</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sage-500">✓</span>
              <span><strong>Visual Hierarchy:</strong> Clear focus on content over decoration</span>
            </div>
          </div>
        </div>

        {/* Cards Grid - More Spacious */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {demoStorytellers.map((storyteller) => (
            <StorytellerCard
              key={storyteller.id}
              storyteller={storyteller}
              variant="default"
              showStories={true}
              showActions={true}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-12 bg-white rounded-2xl p-6 shadow-md border border-grey-100">
          <Typography variant="h3" className="text-lg font-semibold mb-4 text-earth-700">
            💫 Subtle Hover Effects
          </Typography>
          <ul className="space-y-2 text-sm text-grey-600">
            <li>• Card lifts gently with soft shadow</li>
            <li>• Arrow slides smoothly to the right</li>
            <li>• Clean transitions without distraction</li>
            <li>• Focus remains on the storyteller and their story</li>
          </ul>
        </div>
      </div>
    </div>
  )
}