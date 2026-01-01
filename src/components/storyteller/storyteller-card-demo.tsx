'use client'

import React from 'react'
import { UnifiedStorytellerCard } from './unified-storyteller-card'
import { Typography } from '@/components/ui/typography'

// Demo data showcasing all features
const demoStorytellers = [
  {
    id: 'demo-1',
    display_name: 'Sarah Crow Feather',
    bio: 'Traditional knowledge keeper and educator working to preserve Lakota language and customs for future generations. Sarah has been sharing stories for over 20 years and mentors young people in cultural practices.',
    location: 'Pine Ridge, South Dakota',
    traditional_territory: 'Lakota Territory',
    geographic_scope: 'regional' as const,
    cultural_background: 'Lakota',
    avatar_url: null,
    featured: true,
    elder_status: true,
    status: 'active' as const,
    story_count: 47,
    years_of_experience: 22,
    last_active: '2024-01-15',

    organisations: [
      {
        id: 'org-1',
        name: 'Lakota Language Consortium',
        role: 'Board Member',
        status: 'active' as const,
        type: 'tribal' as const
      },
      {
        id: 'org-2',
        name: 'Indigenous Education Alliance',
        role: 'Cultural Advisor',
        status: 'active' as const,
        type: 'nonprofit' as const
      }
    ],

    projects: [
      {
        id: 'proj-1',
        name: 'Youth Language Immersion Program',
        role: 'Lead Instructor',
        status: 'active' as const,
        type: 'educational' as const
      },
      {
        id: 'proj-2',
        name: 'Oral History Documentation',
        role: 'Senior Storyteller',
        status: 'active' as const,
        type: 'cultural' as const
      }
    ],

    ai_insights: {
      profile_completeness: 87,
      top_themes: [
        { theme: 'Traditional Medicine', count: 12, confidence: 92 },
        { theme: 'Language Preservation', count: 18, confidence: 95 },
        { theme: 'Youth Education', count: 8, confidence: 89 }
      ],
      cultural_markers: ['Lakota Ceremonies', 'Sacred Plants', 'Oral Traditions'],
      suggested_tags: [
        {
          category: 'specialties',
          value: 'Ceremony Leadership',
          confidence: 85,
          evidence_count: 5
        },
        {
          category: 'expertise_areas',
          value: 'Traditional Healing',
          confidence: 78,
          evidence_count: 3
        }
      ],
      last_analyzed: '2024-01-10'
    },

    content_stats: {
      transcripts: 23,
      stories: 47,
      videos: 8,
      analyzed_content: 31
    },

    cultural_affiliations: ['Oglala Lakota', 'Seven Council Fires'],
    languages: ['Lakota', 'English'],
    specialties: ['Traditional Medicine', 'Ceremony', 'Language Teaching'],
    expertise_areas: ['Cultural Education', 'Youth Mentorship'],
    impact_focus_areas: ['Language Revitalization', 'Cultural Preservation'],
    community_roles: ['Elder', 'Teacher', 'Ceremony Leader'],

    followers_count: 234,
    engagement_rate: 78
  },

  {
    id: 'demo-2',
    display_name: 'Marcus Johnson',
    bio: 'Community organizer and advocate focused on urban Indigenous issues and housing rights.',
    location: 'Minneapolis, Minnesota',
    geographic_scope: 'local' as const,
    cultural_background: 'Ojibwe',
    avatar_url: null,
    featured: false,
    elder_status: false,
    status: 'active' as const,
    story_count: 12,
    years_of_experience: 5,
    last_active: '2024-01-18',

    organisations: [
      {
        id: 'org-3',
        name: 'Minneapolis Indigenous Council',
        role: 'Program Coordinator',
        status: 'active' as const,
        type: 'community' as const
      }
    ],

    projects: [
      {
        id: 'proj-3',
        name: 'Urban Indigenous Housing Initiative',
        role: 'Lead Organizer',
        status: 'active' as const,
        type: 'community' as const
      },
      {
        id: 'proj-4',
        name: 'Native Youth Mentorship',
        role: 'Mentor',
        status: 'planning' as const,
        type: 'educational' as const
      }
    ],

    ai_insights: {
      profile_completeness: 45,
      top_themes: [
        { theme: 'Housing Justice', count: 8, confidence: 94 },
        { theme: 'Urban Indigenous Issues', count: 6, confidence: 88 }
      ],
      cultural_markers: ['Urban Native Experience'],
      suggested_tags: [
        {
          category: 'expertise_areas',
          value: 'Community Organizing',
          confidence: 92,
          evidence_count: 7
        },
        {
          category: 'impact_focus_areas',
          value: 'Housing Rights',
          confidence: 89,
          evidence_count: 5
        }
      ],
      last_analyzed: '2024-01-12'
    },

    content_stats: {
      transcripts: 8,
      stories: 12,
      videos: 2,
      analyzed_content: 10
    },

    cultural_affiliations: ['Ojibwe'],
    languages: ['English', 'Ojibwe'],
    specialties: ['Community Organizing', 'Advocacy'],
    impact_focus_areas: ['Housing Justice', 'Urban Indigenous Issues'],

    followers_count: 67,
    engagement_rate: 65
  },

  {
    id: 'demo-3',
    display_name: 'Dr. Elena Ramirez-Bear',
    bio: 'Academic researcher and policy advisor specialising in Indigenous rights and environmental justice.',
    location: 'Vancouver, BC',
    geographic_scope: 'international' as const,
    cultural_background: 'Métis',
    avatar_url: null,
    featured: true,
    elder_status: false,
    status: 'active' as const,
    story_count: 31,
    years_of_experience: 15,
    last_active: '2024-01-17',

    organisations: [
      {
        id: 'org-4',
        name: 'University of British Columbia',
        role: 'Associate Professor',
        status: 'active' as const,
        type: 'government' as const
      },
      {
        id: 'org-5',
        name: 'Indigenous Climate Action',
        role: 'Research Director',
        status: 'active' as const,
        type: 'nonprofit' as const
      }
    ],

    projects: [
      {
        id: 'proj-5',
        name: 'Climate Change Impact Study',
        role: 'Principal Investigator',
        status: 'active' as const,
        type: 'research' as const
      },
      {
        id: 'proj-6',
        name: 'Policy Framework Development',
        role: 'Lead Researcher',
        status: 'completed' as const,
        type: 'research' as const
      }
    ],

    ai_insights: {
      profile_completeness: 92,
      top_themes: [
        { theme: 'Environmental Justice', count: 15, confidence: 96 },
        { theme: 'Climate Change', count: 11, confidence: 93 },
        { theme: 'Indigenous Rights', count: 9, confidence: 91 }
      ],
      cultural_markers: ['Academic Research', 'Policy Development'],
      suggested_tags: [],
      last_analyzed: '2024-01-08'
    },

    content_stats: {
      transcripts: 18,
      stories: 31,
      videos: 12,
      analyzed_content: 29
    },

    cultural_affiliations: ['Métis Nation', 'Red River Métis'],
    languages: ['English', 'French', 'Michif'],
    specialties: ['Environmental Research', 'Policy Analysis', 'Academic Writing'],
    expertise_areas: ['Climate Science', 'Indigenous Law', 'Environmental Policy'],
    impact_focus_areas: ['Environmental Justice', 'Climate Action', 'Indigenous Rights'],
    community_roles: ['Researcher', 'Policy Advisor', 'Educator'],

    followers_count: 892,
    engagement_rate: 84
  }
]

export function StorytellerCardDemo() {
  const handleApplyAISuggestion = (suggestion: any) => {
    console.log('Applying AI suggestion:', suggestion)
    // In real implementation, this would update the storyteller's profile
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <Typography variant="h1" className="text-2xl font-bold mb-2">
          Enhanced Storyteller Cards Demo
        </Typography>
        <Typography variant="body" className="text-grey-600 mb-6">
          Showcasing organisations/projects tagging, location context, and AI-driven profile enhancement
        </Typography>
      </div>

      {/* Default Cards */}
      <div>
        <Typography variant="h2" className="text-xl font-semibold mb-4">
          Default View
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoStorytellers.map((storyteller) => (
            <UnifiedStorytellerCard
              key={storyteller.id}
              storyteller={storyteller}
              variant="default"
              showAIInsights={true}
              onApplyAISuggestion={handleApplyAISuggestion}
            />
          ))}
        </div>
      </div>

      {/* Detailed Card */}
      <div>
        <Typography variant="h2" className="text-xl font-semibold mb-4">
          Detailed View (Featured Storyteller)
        </Typography>
        <div className="max-w-2xl">
          <UnifiedStorytellerCard
            storyteller={demoStorytellers[0]}
            variant="detailed"
            showAIInsights={true}
            onApplyAISuggestion={handleApplyAISuggestion}
          />
        </div>
      </div>

      {/* Compact Cards */}
      <div>
        <Typography variant="h2" className="text-xl font-semibold mb-4">
          Compact View
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demoStorytellers.slice(0, 2).map((storyteller) => (
            <UnifiedStorytellerCard
              key={storyteller.id}
              storyteller={storyteller}
              variant="compact"
              showAIInsights={false}
            />
          ))}
        </div>
      </div>

      {/* Feature Highlights */}
      <div>
        <Typography variant="h2" className="text-xl font-semibold mb-4">
          Key Features
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Typography variant="h3" className="font-semibold text-blue-800 mb-2">
              🏢 Organizations & Projects
            </Typography>
            <ul className="text-blue-700 space-y-1">
              <li>• Color-coded by type (tribal, nonprofit, community, government)</li>
              <li>• Status indicators (active, completed, planning)</li>
              <li>• Role details in expanded view</li>
              <li>• Show/hide additional affiliations</li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <Typography variant="h3" className="font-semibold text-green-800 mb-2">
              🗺️ Enhanced Location Context
            </Typography>
            <ul className="text-green-700 space-y-1">
              <li>• Modern location + traditional territory</li>
              <li>• Geographic scope indicators</li>
              <li>• Cultural geography connections</li>
              <li>• Respectful territorial acknowledgment</li>
            </ul>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Typography variant="h3" className="font-semibold text-purple-800 mb-2">
              🤖 AI-Driven Insights
            </Typography>
            <ul className="text-purple-700 space-y-1">
              <li>• Profile completeness scoring</li>
              <li>• Story theme extraction</li>
              <li>• Cultural marker identification</li>
              <li>• Smart tag suggestions with confidence</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}