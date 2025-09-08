'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/auth.context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  Mail, 
  Shield, 
  BookOpen, 
  Settings, 
  Heart,
  Crown,
  Edit3,
  Save,
  X,
  BarChart3
} from 'lucide-react'

export function ProfileDashboard() {
  const { user, profile, updateProfile, signOut, isStoryteller } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    display_name: profile?.display_name || '',
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    current_role: profile?.current_role || '',
    cultural_background: profile?.cultural_background || ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Sync editData when profile loads
  useEffect(() => {
    if (profile) {
      setEditData({
        display_name: profile.display_name || '',
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        current_role: profile.current_role || '',
        cultural_background: profile.cultural_background || ''
      })
    }
  }, [profile])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Please sign in to view your profile</p>
          <Button onClick={() => window.location.href = '/auth/signin'}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    setIsLoading(true)
    setMessage('')
    
    try {
      const updated = await updateProfile(editData)
      if (updated) {
        setIsEditing(false)
        setMessage('Profile updated successfully!')
      } else {
        setMessage('Failed to update profile')
      }
    } catch (error) {
      setMessage('Error updating profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      display_name: profile?.display_name || '',
      full_name: profile?.full_name || '',
      bio: profile?.bio || '',
      current_role: profile?.current_role || '',
      cultural_background: profile?.cultural_background || ''
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Personal Details</TabsTrigger>
          <TabsTrigger value="stories">My Stories</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
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
                      {profile?.display_name || profile?.full_name || 'User'}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
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
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-clay-600" />
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Stories Created</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Stories Liked</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">Super</div>
                  <div className="text-sm text-muted-foreground">Admin Level</div>
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
              <div className={`grid grid-cols-1 ${isStoryteller ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
                {isStoryteller && user?.id && (
                  <Button 
                    onClick={() => window.location.href = `/storytellers/${user.id}/dashboard`} 
                    variant="cultural-primary"
                    className="h-auto p-4 col-span-full md:col-span-1"
                  >
                    <div className="text-center">
                      <BarChart3 className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">Storyteller Dashboard</div>
                      <div className="text-sm opacity-80">Your command center</div>
                    </div>
                  </Button>
                )}
                <Button onClick={() => window.location.href = '/stories/create'} className="h-auto p-4">
                  <div className="text-center">
                    <BookOpen className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Create New Story</div>
                    <div className="text-sm opacity-80">Share your experiences</div>
                  </div>
                </Button>
                <Button onClick={() => window.location.href = '/admin'} variant="outline" className="h-auto p-4">
                  <div className="text-center">
                    <Shield className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Admin Dashboard</div>
                    <div className="text-sm opacity-80">Manage platform</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details and bio</CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button onClick={handleSave} size="sm" disabled={isLoading}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Display Name</label>
                  {isEditing ? (
                    <Input
                      value={editData.display_name}
                      onChange={(e) => setEditData({...editData, display_name: e.target.value})}
                      placeholder="How you'd like to be known"
                    />
                  ) : (
                    <div className="p-3 bg-muted/50 rounded-md">{profile?.display_name || 'Not set'}</div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Full Name</label>
                  {isEditing ? (
                    <Input
                      value={editData.full_name}
                      onChange={(e) => setEditData({...editData, full_name: e.target.value})}
                      placeholder="Your full name"
                    />
                  ) : (
                    <div className="p-3 bg-muted/50 rounded-md">{profile?.full_name || 'Not set'}</div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Current Role</label>
                  {isEditing ? (
                    <Input
                      value={editData.current_role}
                      onChange={(e) => setEditData({...editData, current_role: e.target.value})}
                      placeholder="What do you do?"
                    />
                  ) : (
                    <div className="p-3 bg-muted/50 rounded-md">{profile?.current_role || 'Not set'}</div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Cultural Background</label>
                  {isEditing ? (
                    <Input
                      value={editData.cultural_background}
                      onChange={(e) => setEditData({...editData, cultural_background: e.target.value})}
                      placeholder="Your cultural heritage"
                    />
                  ) : (
                    <div className="p-3 bg-muted/50 rounded-md">{profile?.cultural_background || 'Not set'}</div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Bio</label>
                {isEditing ? (
                  <Textarea
                    value={editData.bio}
                    onChange={(e) => setEditData({...editData, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                ) : (
                  <div className="p-3 bg-muted/50 rounded-md min-h-[100px]">
                    {profile?.bio || 'No bio added yet. Click edit to add one!'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Stories</CardTitle>
              <CardDescription>Stories you've created and shared</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No stories yet</h3>
                <p className="text-muted-foreground mb-4">
                  Share your first story and connect with the community
                </p>
                <Button onClick={() => window.location.href = '/stories/create'}>
                  Create Your First Story
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences and security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Email Address</h4>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Button variant="outline" size="sm">Change Email</Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-muted-foreground">Last updated recently</p>
                </div>
                <Button variant="outline" size="sm">Change Password</Button>
              </div>
              
              <div className="pt-4 border-t">
                <Button onClick={signOut} variant="destructive">
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}