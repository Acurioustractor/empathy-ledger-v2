'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StoryCard } from '@/components/story/story-card'
import { StoryDashboard } from '@/components/storyteller/StoryDashboard'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import Link from 'next/link'
import {
  BookOpen,
  Grid3X3,
  LayoutDashboard,
  Eye,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react'

export default function Sprint4TestPage() {
  const [loading, setLoading] = useState(true)
  const [stories, setStories] = useState<any[]>([])

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/stories?status=published&limit=6')
        if (response.ok) {
          const data = await response.json()
          setStories(data.stories || [])
        }
      } catch (error) {
        console.error('Error fetching stories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStories()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-sage-50/20 to-clay-50/10">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-earth-800 via-earth-700 to-clay-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="bg-amber-500 text-white mb-4 text-sm">
              <Sparkles className="w-3 h-3 mr-1 inline" />
              Sprint 4 Complete
            </Badge>
            <Typography variant="cultural-hero" className="text-white mb-4">
              Public Story Experience
            </Typography>
            <Typography variant="cultural-subtitle" className="text-earth-200 max-w-3xl mx-auto mb-8">
              Comprehensive story discovery, management, and engagement features showcasing all Sprint 4 deliverables.
            </Typography>

            {/* Sprint 4 Deliverables */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <Typography variant="small" className="font-semibold text-white">
                      Story Dashboard
                    </Typography>
                    <Typography variant="small" className="text-earth-200 text-xs">
                      Management Hub
                    </Typography>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <Typography variant="small" className="font-semibold text-white">
                      Public Homepage
                    </Typography>
                    <Typography variant="small" className="text-earth-200 text-xs">
                      Story Browsing
                    </Typography>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <Typography variant="small" className="font-semibold text-white">
                      Story Page
                    </Typography>
                    <Typography variant="small" className="text-earth-200 text-xs">
                      Full Story View
                    </Typography>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <Typography variant="small" className="font-semibold text-white">
                      Enhanced Card
                    </Typography>
                    <Typography variant="small" className="text-earth-200 text-xs">
                      Reactions & Sharing
                    </Typography>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="story-cards" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="story-cards" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Story Cards
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Live Pages
            </TabsTrigger>
          </TabsList>

          {/* Story Cards Tab */}
          <TabsContent value="story-cards" className="space-y-8">
            <div className="text-center mb-8">
              <Typography variant="h2" className="mb-3">
                Enhanced Story Cards
              </Typography>
              <Typography variant="body" className="text-grey-600 max-w-2xl mx-auto">
                Story cards with engagement metrics, quick reactions, and share functionality. Cards adapt to grid and list views.
              </Typography>
            </div>

            {/* Grid View */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h3" className="text-earth-800">
                  Grid View
                </Typography>
                <Badge variant="outline">Default Layout</Badge>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="h-96 animate-pulse bg-grey-100" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stories.slice(0, 3).map((story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      variant="default"
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* List View */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h3" className="text-earth-800">
                  Compact List View
                </Typography>
                <Badge variant="outline">Optimized for Scanning</Badge>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="h-32 animate-pulse bg-grey-100" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {stories.slice(0, 3).map((story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      variant="compact"
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Features List */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 mt-8">
              <Typography variant="h4" className="mb-4 text-blue-900">
                Story Card Features
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <Typography variant="small" className="font-semibold text-blue-900">
                      Quick Reactions
                    </Typography>
                    <Typography variant="small" className="text-blue-700">
                      Heart button with instant feedback and count updates
                    </Typography>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <Typography variant="small" className="font-semibold text-blue-900">
                      Share Functionality
                    </Typography>
                    <Typography variant="small" className="text-blue-700">
                      Native share API with clipboard fallback
                    </Typography>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <Typography variant="small" className="font-semibold text-blue-900">
                      Engagement Metrics
                    </Typography>
                    <Typography variant="small" className="text-blue-700">
                      Views, likes, reading time, and location display
                    </Typography>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <Typography variant="small" className="font-semibold text-blue-900">
                      Responsive Layouts
                    </Typography>
                    <Typography variant="small" className="text-blue-700">
                      Grid and list variants for different browsing modes
                    </Typography>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8">
            <div className="text-center mb-8">
              <Typography variant="h2" className="mb-3">
                Story Dashboard Component
              </Typography>
              <Typography variant="body" className="text-grey-600 max-w-2xl mx-auto">
                Comprehensive story management interface with search, filters, sorting, bulk actions, and real-time stats.
              </Typography>
            </div>

            <Card className="p-6">
              <StoryDashboard
                stories={stories.map(s => ({
                  ...s,
                  themes: s.tags || [],
                  createdAt: s.created_at,
                  publishedAt: s.publication_date,
                  hasVideo: false,
                  metadata: {
                    views: s.views_count || 0,
                    reactions: s.likes_count || 0,
                    shares: s.shares_count || 0
                  }
                }))}
                storytellerId="dev-super-admin"
                storytellerName="Test User"
                onCreateStory={() => alert('Create story clicked')}
                onEditStory={(id) => alert(`Edit story ${id}`)}
                onDeleteStory={async (id) => alert(`Delete story ${id}`)}
                onShareStory={(id) => alert(`Share story ${id}`)}
              />
            </Card>

            {/* Dashboard Features */}
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <Typography variant="h4" className="mb-4 text-green-900">
                Dashboard Features
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Typography variant="small" className="font-semibold text-green-900 mb-2">
                    Management
                  </Typography>
                  <ul className="space-y-1 text-sm text-green-700">
                    <li>• Create, edit, delete stories</li>
                    <li>• Bulk publish/archive/delete</li>
                    <li>• Status tabs (all/published/drafts/review)</li>
                    <li>• Multi-select with checkboxes</li>
                  </ul>
                </div>
                <div>
                  <Typography variant="small" className="font-semibold text-green-900 mb-2">
                    Discovery
                  </Typography>
                  <ul className="space-y-1 text-sm text-green-700">
                    <li>• Full-text search across titles/content</li>
                    <li>• Filter by theme tags</li>
                    <li>• Sort by date, views, reactions</li>
                    <li>• Grid/list view toggle</li>
                  </ul>
                </div>
                <div>
                  <Typography variant="small" className="font-semibold text-green-900 mb-2">
                    Analytics
                  </Typography>
                  <ul className="space-y-1 text-sm text-green-700">
                    <li>• Story count by status</li>
                    <li>• Total views and reactions</li>
                    <li>• Per-story engagement metrics</li>
                    <li>• Reading time estimates</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Live Pages Tab */}
          <TabsContent value="pages" className="space-y-8">
            <div className="text-center mb-8">
              <Typography variant="h2" className="mb-3">
                Live Production Pages
              </Typography>
              <Typography variant="body" className="text-grey-600 max-w-2xl mx-auto">
                Visit the live pages to see all components working together with real data from the database.
              </Typography>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Public Homepage */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <Typography variant="h4" className="mb-2">
                      Public Stories Homepage
                    </Typography>
                    <Typography variant="body" className="text-grey-600 text-sm mb-4">
                      Browse {stories.length}+ published stories with advanced filtering, search, and grid/list views.
                    </Typography>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href="/stories" className="flex items-center justify-center gap-2">
                    View Stories Page
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </Card>

              {/* Dashboard */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <LayoutDashboard className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <Typography variant="h4" className="mb-2">
                      Storyteller Dashboard
                    </Typography>
                    <Typography variant="body" className="text-grey-600 text-sm mb-4">
                      Manage stories, transcripts, photos, and analytics from the storyteller hub.
                    </Typography>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href="/storytellers/dev-super-admin/dashboard" className="flex items-center justify-center gap-2">
                    View Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </Card>

              {/* Individual Story */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <Typography variant="h4" className="mb-2">
                      Individual Story Page
                    </Typography>
                    <Typography variant="body" className="text-grey-600 text-sm mb-4">
                      Full story view with media, author info, social sharing, and cultural badges.
                    </Typography>
                  </div>
                </div>
                <Button asChild className="w-full" disabled={stories.length === 0}>
                  <Link
                    href={stories.length > 0 ? `/stories/${stories[0].id}` : '#'}
                    className="flex items-center justify-center gap-2"
                  >
                    View Example Story
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </Card>

              {/* Stats Card */}
              <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <Typography variant="h4" className="mb-4 text-amber-900">
                  Sprint 4 Stats
                </Typography>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Typography variant="small" className="text-amber-800">
                      Components Built
                    </Typography>
                    <Badge className="bg-amber-600 text-white">4/4</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography variant="small" className="text-amber-800">
                      Stories in Database
                    </Typography>
                    <Badge className="bg-amber-600 text-white">315</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography variant="small" className="text-amber-800">
                      Published Stories
                    </Typography>
                    <Badge className="bg-amber-600 text-white">154</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography variant="small" className="text-amber-800">
                      Test Pages Created
                    </Typography>
                    <Badge className="bg-green-600 text-white">1</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}
