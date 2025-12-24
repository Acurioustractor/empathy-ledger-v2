'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { 
  Save, 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Shield, 
  Crown, 
  Heart, 
  AlertTriangle,
  CheckCircle,
  Building2,
  Settings,
  Activity,
  Flag
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UserData {
  id: string
  email: string
  first_name?: string
  last_name?: string
  display_name?: string
  avatar_url?: string
  cultural_background?: string
  location?: string
  bio?: string
  pronouns?: string
  created_at: string
  last_sign_in_at: string
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  roles: string[]
  is_storyteller: boolean
  is_elder: boolean
  is_admin: boolean
  cultural_affiliations?: string[]
  verification_status: {
    email: boolean
    identity: boolean
    cultural: boolean
  }
  organisation?: {
    id: string
    name: string
  }
  stats: {
    stories_count: number
    stories_read: number
    community_engagement: number
  }
  flags: {
    count: number
    reasons: string[]
  }
}

interface UserEditFormProps {
  userId: string
}

const UserEditForm: React.FC<UserEditFormProps> = ({ userId }) => {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    display_name: '',
    email: '',
    bio: '',
    cultural_background: '',
    location: '',
    pronouns: '',
    status: 'active' as 'active' | 'inactive' | 'suspended' | 'pending',
    is_storyteller: false,
    is_elder: false,
    is_admin: false,
    cultural_affiliations: [] as string[],
    verification_email: false,
    verification_identity: false,
    verification_cultural: false
  })

  useEffect(() => {
    fetchUser()
  }, [userId])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users/${userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }
      
      const userData = await response.json()
      setUser(userData)
      
      // Populate form with user data
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        display_name: userData.display_name || '',
        email: userData.email || '',
        bio: userData.bio || '',
        cultural_background: userData.cultural_background || '',
        location: userData.location || '',
        pronouns: userData.pronouns || '',
        status: userData.status || 'active',
        is_storyteller: userData.is_storyteller || false,
        is_elder: userData.is_elder || false,
        is_admin: userData.is_admin || false,
        cultural_affiliations: userData.cultural_affiliations || [],
        verification_email: userData.verification_status?.email || false,
        verification_identity: userData.verification_status?.identity || false,
        verification_cultural: userData.verification_status?.cultural || false
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          verification_status: {
            email: formData.verification_email,
            identity: formData.verification_identity,
            cultural: formData.verification_cultural
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      
      // Refresh user data
      await fetchUser()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (firstName?: string, lastName?: string, displayName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`
    } else if (displayName) {
      const names = displayName.split(' ')
      return names.length > 1 ? `${names[0][0]}${names[1][0]}` : names[0][0]
    } else if (email) {
      return email[0].toUpperCase()
    }
    return 'U'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 border-green-600'
      case 'inactive': return 'text-stone-600 border-grey-600'
      case 'suspended': return 'text-red-600 border-red-600'
      case 'pending': return 'text-yellow-600 border-yellow-600'
      default: return 'text-stone-600 border-grey-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">Loading user data...</div>
          <div className="text-muted-foreground">Please wait while we fetch the user information</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!user) {
    return (
      <Alert>
        <User className="w-4 h-4" />
        <AlertDescription>User not found</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {success && (
        <Alert>
          <CheckCircle className="w-4 h-4" />
          <AlertDescription>User updated successfully!</AlertDescription>
        </Alert>
      )}

      {/* User Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="bg-clay-100 text-clay-700 text-xl">
                {getInitials(user.first_name, user.last_name, user.display_name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-xl">{user.display_name || `${user.first_name} ${user.last_name}` || 'Unnamed User'}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={getStatusColor(user.status)}>
                  {user.status}
                </Badge>
                {user.is_admin && (
                  <Badge variant="destructive" className="gap-1">
                    <Crown className="w-3 h-3" />
                    Admin
                  </Badge>
                )}
                {user.is_elder && (
                  <Badge variant="sage-soft" className="gap-1">
                    <Heart className="w-3 h-3" />
                    Elder
                  </Badge>
                )}
                {user.is_storyteller && (
                  <Badge variant="clay-soft" className="gap-1">
                    <User className="w-3 h-3" />
                    Storyteller
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Edit Form Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="roles">Roles & Access</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update user's basic profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="Enter display name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="User's biography"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cultural_background">Cultural Background</Label>
                  <Input
                    id="cultural_background"
                    value={formData.cultural_background}
                    onChange={(e) => setFormData({ ...formData, cultural_background: e.target.value })}
                    placeholder="Cultural background"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Location"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="pronouns">Pronouns</Label>
                <Input
                  id="pronouns"
                  value={formData.pronouns}
                  onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
                  placeholder="they/them, she/her, he/him, etc."
                />
              </div>

              <div>
                <Label htmlFor="status">Account Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>Manage user's roles and access levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Storyteller</Label>
                    <p className="text-sm text-stone-600">Can create and share stories</p>
                  </div>
                  <Switch
                    checked={formData.is_storyteller}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_storyteller: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Community Elder</Label>
                    <p className="text-sm text-stone-600">Has special cultural oversight privileges</p>
                  </div>
                  <Switch
                    checked={formData.is_elder}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_elder: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Administrator</Label>
                    <p className="text-sm text-stone-600">Has admin access to manage platform</p>
                  </div>
                  <Switch
                    checked={formData.is_admin}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_admin: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
              <CardDescription>Manage user's verification badges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Email Verified</Label>
                  <p className="text-sm text-stone-600">Email address has been verified</p>
                </div>
                <Switch
                  checked={formData.verification_email}
                  onCheckedChange={(checked) => setFormData({ ...formData, verification_email: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Identity Verified</Label>
                  <p className="text-sm text-stone-600">Identity has been verified</p>
                </div>
                <Switch
                  checked={formData.verification_identity}
                  onCheckedChange={(checked) => setFormData({ ...formData, verification_identity: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Cultural Verification</Label>
                  <p className="text-sm text-stone-600">Cultural background has been verified</p>
                </div>
                <Switch
                  checked={formData.verification_cultural}
                  onCheckedChange={(checked) => setFormData({ ...formData, verification_cultural: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-stone-600">Stories Shared</p>
                    <p className="text-2xl font-bold">{user.stats?.stories_count || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-600">Stories Read</p>
                    <p className="text-2xl font-bold">{user.stats?.stories_read || 0}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-stone-600">Community Engagement</p>
                  <p className="text-2xl font-bold">{user.stats?.community_engagement || 0}%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-stone-600">Member Since</p>
                  <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-600">Last Sign In</p>
                  <p className="font-medium">
                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                {user.organisation && (
                  <div>
                    <p className="text-sm text-stone-600">Organization</p>
                    <p className="font-medium flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {user.organisation.name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {user.flags && user.flags.count > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Flags & Issues</CardTitle>
                <CardDescription>{user.flags.count} flag(s) reported</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {user.flags.reasons.map((reason, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-red-50 border-l-4 border-red-500 rounded">
                      <Flag className="w-4 h-4 text-red-600" />
                      <span className="text-sm">{reason}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Save Actions */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default UserEditForm