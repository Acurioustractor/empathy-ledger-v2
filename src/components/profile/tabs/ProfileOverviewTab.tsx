'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Mail,
  BookOpen,
  Crown,
  Edit3,
  BarChart3,
  MapPin,
  Building2,
  FolderKanban
} from 'lucide-react'

interface ProfileOverviewTabProps {
  profile: {
    display_name?: string
    full_name?: string
    first_name?: string
    is_elder?: boolean
    is_storyteller?: boolean
    traditional_knowledge_keeper?: boolean
  } | null
  user: {
    id?: string
    email?: string
  } | null
  storyCount: number
  organizations: any[]
  projects: any[]
  locations: any[]
  onNavigateToTab: (tab: string) => void
}

export function ProfileOverviewTab({
  profile,
  user,
  storyCount,
  organizations,
  projects,
  locations,
  onNavigateToTab
}: ProfileOverviewTabProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-clay-500 to-sage-600 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {profile?.display_name || profile?.full_name || profile?.first_name || 'User'}
                </CardTitle>
                <CardDescription className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {profile?.is_elder && (
                <Badge variant="secondary" className="bg-sage-100 text-sage-800">
                  <Crown className="w-3 h-3 mr-1" />
                  Elder
                </Badge>
              )}
              {profile?.is_storyteller && (
                <Badge variant="secondary" className="bg-clay-100 text-clay-800">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Storyteller
                </Badge>
              )}
              {profile?.traditional_knowledge_keeper && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  <Crown className="w-3 h-3 mr-1" />
                  Knowledge Keeper
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-earth-50 rounded-lg border border-earth-200">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-earth-600" />
              <div className="text-2xl font-bold">{storyCount}</div>
              <div className="text-sm text-stone-600">Stories Created</div>
            </div>
            <div className="text-center p-4 bg-sage-50 rounded-lg border border-sage-200">
              <Building2 className="w-8 h-8 mx-auto mb-2 text-sage-600" />
              <div className="text-2xl font-bold">{organizations.length}</div>
              <div className="text-sm text-stone-600">Organizations</div>
            </div>
            <div className="text-center p-4 bg-clay-50 rounded-lg border border-clay-200">
              <FolderKanban className="w-8 h-8 mx-auto mb-2 text-clay-600" />
              <div className="text-2xl font-bold">{projects.length}</div>
              <div className="text-sm text-stone-600">Projects</div>
            </div>
            <div className="text-center p-4 bg-sage-50 rounded-lg border border-sage-200">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-sage-600" />
              <div className="text-2xl font-bold">{locations.length}</div>
              <div className="text-sm text-stone-600">Locations</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`grid grid-cols-1 ${profile?.is_storyteller ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
            {profile?.is_storyteller && user?.id && (
              <Button
                onClick={() => router.push(`/storytellers/${user.id}/dashboard`)}
                variant="cultural-primary"
                className="h-auto p-4 col-span-full md:col-span-1"
              >
                <div className="text-center">
                  <BarChart3 className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Storyteller Dashboard</div>
                  <div className="text-sm opacity-80">Your command centre</div>
                </div>
              </Button>
            )}
            <Button onClick={() => router.push('/stories/create')} className="h-auto p-4">
              <div className="text-center">
                <BookOpen className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Create New Story</div>
                <div className="text-sm opacity-80">Share your experiences</div>
              </div>
            </Button>
            <Button onClick={() => onNavigateToTab('personal')} variant="outline" className="h-auto p-4">
              <div className="text-center">
                <Edit3 className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Edit Profile</div>
                <div className="text-sm opacity-80">Update your information</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
