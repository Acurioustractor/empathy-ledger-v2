'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { StorytellerProfileCard } from '@/components/ui/storyteller-profile-card'
import { 
  BookOpen, 
  User, 
  Crown, 
  Heart, 
  Edit,
  Plus,
  Eye,
  Calendar,
  Users,
  BarChart3,
  Star,
  MessageCircle,
  Award,
  Clock,
  TrendingUp,
  Share2,
  FileText,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/context/auth.context'

interface StorytellerStats {
  totalStories: number
  publishedStories: number
  draftStories: number
  totalViews: number
  totalLikes: number
  totalComments: number
  communityRank: string
  lastActivityDate: string
}

interface Story {
  id: string
  title: string
  status: 'draft' | 'published' | 'pending_review'
  created_at: string
  views: number
  likes: number
  comments: number
  cultural_significance: 'low' | 'medium' | 'high' | 'sacred'
}

const StorytellerDashboard: React.FC = () => {
  const { user, profile, isStoryteller, isElder } = useAuth()
  const [stats, setStats] = useState<StorytellerStats>({
    totalStories: 0,
    publishedStories: 0,
    draftStories: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    communityRank: 'Emerging Storyteller',
    lastActivityDate: new Date().toISOString()
  })
  const [recentStories, setRecentStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && profile) {
      fetchStorytellerData()
    }
  }, [user, profile])

  const fetchStorytellerData = async () => {
    try {
      setLoading(true)
      
      // Fetch storyteller statistics
      const statsResponse = await fetch(`/api/storytellers/${profile?.id}/stats`)
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch recent stories
      const storiesResponse = await fetch(`/api/storytellers/${profile?.id}/stories?limit=5`)
      if (storiesResponse.ok) {
        const storiesData = await storiesResponse.json()
        setRecentStories(storiesData.stories || [])
      }
    } catch (error) {
      console.error('Error fetching storyteller data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'pending_review': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-grey-100 text-grey-800'
      default: return 'bg-grey-100 text-grey-800'
    }
  }

  const getCulturalSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'sacred': return 'bg-purple-100 text-purple-800'
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-orange-100 text-orange-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-grey-100 text-grey-800'
    }
  }

  if (!user) {
    return (
      <Alert>
        <User className="w-4 h-4" />
        <AlertDescription>
          Please sign in to access your storyteller dashboard.
        </AlertDescription>
      </Alert>
    )
  }

  if (!isStoryteller) {
    return (
      <Alert>
        <Crown className="w-4 h-4" />
        <AlertDescription>
          This page is for verified storytellers. <Link href="/storytellers/create" className="underline">Apply to become a storyteller</Link>.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header with Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StorytellerProfileCard
            storytellerId={profile?.id || ''}
            name={profile?.display_name || profile?.first_name || 'Storyteller'}
            displayName={profile?.display_name}
            bio={profile?.bio}
            avatarUrl={profile?.avatar_url || profile?.profile_image_url}
            culturalBackground={profile?.cultural_background}
            culturalAffiliations={profile?.cultural_affiliations || []}
            isElder={isElder}
            traditionalKnowledgeKeeper={profile?.traditional_knowledge_keeper || false}
            languages={profile?.languages || []}
            location={profile?.location}
            joinedDate={profile?.created_at}
            storiesCount={stats.totalStories}
            videosCount={0} // Could be enhanced to include video count
            communitiesCount={1} // Could be enhanced to show actual community count
            followersCount={0} // Could be enhanced to show followers
            engagementRate={stats.totalViews > 0 ? (stats.totalLikes / stats.totalViews) * 100 : 0}
            lastActive={stats.lastActivityDate}
            themes={[]} // Could be enhanced to show story themes
            variant="featured"
            size="large"
            showActions={false} // Don't show follow/message buttons on own dashboard
          />
        </div>
        
        <div className="space-y-3">
          <div className="text-center lg:text-left">
            <h2 className="text-xl font-semibold text-earth-800 mb-2">
              Welcome back!
            </h2>
            <p className="text-stone-600 mb-4">
              Your storytelling journey continues. Share your wisdom and connect with the community.
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/stories/create">
                <Plus className="w-4 h-4 mr-2" />
                New Story
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href={`/storytellers/${profile?.id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href={`/storytellers/${profile?.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                View Public Profile
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
              <BookOpen className="w-4 h-4 text-sage-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sage-800">{stats.totalStories}</div>
            <p className="text-xs text-grey-600 mt-1">
              {stats.publishedStories} published • {stats.draftStories} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-grey-600 mt-1">
              People reached by your stories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Engagement</CardTitle>
              <Heart className="w-4 h-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{stats.totalLikes}</div>
            <p className="text-xs text-grey-600 mt-1">
              Likes • {stats.totalComments} comments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Community Status</CardTitle>
              <Award className="w-4 h-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-amber-800">{stats.communityRank}</div>
            <p className="text-xs text-grey-600 mt-1">
              Your storytelling level
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="stories" className="space-y-6">
        <TabsList className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="stories" className="gap-2">
            <BookOpen className="w-4 h-4" />
            My Stories
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="community" className="gap-2">
            <Users className="w-4 h-4" />
            Community
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
        </TabsList>

        {/* Stories Tab */}
        <TabsContent value="stories" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Stories</h2>
            <Button asChild>
              <Link href="/stories/create">
                <Plus className="w-4 h-4 mr-2" />
                Create New Story
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {recentStories.length > 0 ? (
              recentStories.map((story) => (
                <Card key={story.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{story.title}</h3>
                          <Badge className={getStatusColor(story.status)}>
                            {story.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getCulturalSignificanceColor(story.cultural_significance)}>
                            {story.cultural_significance} significance
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-grey-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(story.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {story.views} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {story.likes} likes
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {story.comments} comments
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/my-story/${story.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            Manage
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/stories/${story.id}/edit`}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-12 h-12 text-grey-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-grey-600 mb-2">No stories yet</h3>
                  <p className="text-grey-500 mb-6">Start sharing your stories with the community</p>
                  <Button asChild>
                    <Link href="/stories/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Story
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="text-center">
            <Button variant="outline" asChild>
              <Link href={`/storytellers/${profile?.id}/stories`}>
                View All Stories
              </Link>
            </Button>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Story Performance</CardTitle>
              <CardDescription>Track how your stories are performing in the community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-grey-600">
                <BarChart3 className="w-12 h-12 text-grey-400 mx-auto mb-4" />
                <p>Detailed analytics will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Community Tab */}
        <TabsContent value="community" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Community Engagement</CardTitle>
              <CardDescription>Connect with other storytellers and community members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-grey-600">
                <Users className="w-12 h-12 text-grey-400 mx-auto mb-4" />
                <p>Community features will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Management</CardTitle>
              <CardDescription>Update your storyteller profile and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button asChild>
                  <Link href={`/storytellers/${profile?.id}/edit`}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/profile">
                    <Settings className="w-4 h-4 mr-2" />
                    Account Settings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default StorytellerDashboard