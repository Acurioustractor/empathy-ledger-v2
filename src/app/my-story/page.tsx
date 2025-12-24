'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context/auth.context'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Mic, BookOpen, User, ChevronRight, Lock, Globe, Users,
  Plus, Heart, Clock, Play, Settings
} from 'lucide-react'
import { BottomNav } from '@/components/layout/BottomNav'

interface Story {
  id: string
  title: string
  status: string
  visibility: string
  created_at: string
  excerpt?: string
}

export default function MyStoryPage() {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()
  const supabase = createSupabaseClient()

  const [stories, setStories] = useState<Story[]>([])
  const [loadingStories, setLoadingStories] = useState(true)
  const [storytellerProfile, setStorytellerProfile] = useState<any>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin?redirect=/my-story')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      fetchMyStories()
      fetchStorytellerProfile()
    }
  }, [user])

  const fetchMyStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('id, title, status, visibility, created_at, content')
        .eq('author_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && data) {
        setStories(data.map(s => ({
          ...s,
          excerpt: s.content?.substring(0, 100) + '...'
        })))
      }
    } catch (err) {
      console.error('Error fetching stories:', err)
    } finally {
      setLoadingStories(false)
    }
  }

  const fetchStorytellerProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (data) {
        setStorytellerProfile(data)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'private': return <Lock className="w-3 h-3" />
      case 'community': return <Users className="w-3 h-3" />
      case 'public': return <Globe className="w-3 h-3" />
      default: return <Lock className="w-3 h-3" />
    }
  }

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'private': return 'Just me'
      case 'community': return 'Community'
      case 'public': return 'Everyone'
      default: return 'Private'
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const displayName = storytellerProfile?.display_name ||
                      profile?.display_name ||
                      user?.email?.split('@')[0] ||
                      'Storyteller'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <Heart className="w-12 h-12 text-amber-600 mx-auto" />
          </div>
          <p className="mt-4 text-amber-800">Loading your stories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-stone-900">{displayName}</p>
                <p className="text-xs text-amber-700">Storyteller</p>
              </div>
            </div>
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="text-amber-700">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* Welcome Message */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-stone-900">
            Welcome back, {displayName.split(' ')[0]}
          </h1>
          <p className="text-amber-700 mt-1">
            Your stories matter. Every one of them.
          </p>
        </div>

        {/* Primary Action - Record Story */}
        <Link href="/capture">
          <Card className="bg-gradient-to-r from-amber-500 to-orange-500 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                    <Mic className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Share a Story</h2>
                    <p className="text-amber-100 text-sm">Record or write your story</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-white/80" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* My Stories Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              My Stories
            </h2>
            <Badge variant="outline" className="bg-white">
              {stories.length} {stories.length === 1 ? 'story' : 'stories'}
            </Badge>
          </div>

          {loadingStories ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                  <div className="h-5 bg-stone-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-stone-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : stories.length === 0 ? (
            <Card className="bg-white/80 border-amber-200">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="font-semibold text-stone-900 mb-2">No stories yet</h3>
                <p className="text-stone-600 text-sm mb-4">
                  Your stories are waiting to be told. Start by sharing something meaningful to you.
                </p>
                <Link href="/capture">
                  <Button className="bg-amber-500 hover:bg-amber-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Share Your First Story
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {stories.map(story => (
                <Link key={story.id} href={`/stories/${story.id}`}>
                  <Card className="bg-white hover:shadow-md transition-all cursor-pointer border-amber-100">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-stone-900 truncate">
                            {story.title || 'Untitled Story'}
                          </h3>
                          <div className="flex items-center gap-3 mt-2 text-xs text-stone-500">
                            <span className="flex items-center gap-1">
                              {getVisibilityIcon(story.visibility)}
                              {getVisibilityLabel(story.visibility)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {getTimeAgo(story.created_at)}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            story.status === 'published'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }
                        >
                          {story.status === 'published' ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <Link href="/stories">
            <Card className="bg-white/80 hover:bg-white transition-all cursor-pointer border-amber-100">
              <CardContent className="p-4 text-center">
                <Globe className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-stone-700">Browse Stories</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/storytellers">
            <Card className="bg-white/80 hover:bg-white transition-all cursor-pointer border-amber-100">
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-stone-700">Storytellers</p>
              </CardContent>
            </Card>
          </Link>
        </div>

      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Spacer for bottom nav */}
      <div className="h-20 md:h-0" />
    </div>
  )
}
