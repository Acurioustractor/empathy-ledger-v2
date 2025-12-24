"use client"

/**
 * Profile Settings Page - Example Usage of AvatarUpload Component
 *
 * This shows how to integrate the AvatarUpload component into a user profile settings page.
 *
 * Usage in your app:
 *
 * 1. In a Server Component, fetch the user's profile:
 *    ```tsx
 *    import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
 *    import { ProfileSettings } from '@/components/profile/profile-settings-example'
 *
 *    export default async function ProfilePage() {
 *      const supabase = createSupabaseServerClient()
 *      const { data: { user } } = await supabase.auth.getUser()
 *
 *      const { data: profile } = await supabase
 *        .from('profiles')
 *        .select('*')
 *        .eq('id', user.id)
 *        .single()
 *
 *      return <ProfileSettings profile={profile} />
 *    }
 *    ```
 *
 * 2. Or use it in a Client Component with useEffect:
 *    ```tsx
 *    'use client'
 *    import { useEffect, useState } from 'react'
 *    import { createSupabaseBrowserClient } from '@/lib/supabase/client'
 *    import { AvatarUpload } from '@/components/profile/avatar-upload'
 *
 *    export default function ProfilePage() {
 *      const [profile, setProfile] = useState(null)
 *      const supabase = createSupabaseBrowserClient()
 *
 *      useEffect(() => {
 *        async function fetchProfile() {
 *          const { data: { user } } = await supabase.auth.getUser()
 *          const { data } = await supabase
 *            .from('profiles')
 *            .select('*')
 *            .eq('id', user.id)
 *            .single()
 *          setProfile(data)
 *        }
 *        fetchProfile()
 *      }, [])
 *
 *      if (!profile) return <div>Loading...</div>
 *
 *      return (
 *        <div className="max-w-4xl mx-auto p-6">
 *          <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
 *
 *          <AvatarUpload
 *            userId={profile.id}
 *            currentAvatarUrl={profile.profile_image_url}
 *            displayName={profile.display_name}
 *            onUploadComplete={(url) => {
 *              console.log('New avatar URL:', url)
 *              // Optionally refresh profile data or show success message
 *            }}
 *          />
 *        </div>
 *      )
 *    }
 *    ```
 */

import { useState } from "react"
import { AvatarUpload } from "./avatar-upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Save, AlertCircle } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

interface Profile {
  id: string
  display_name: string
  full_name?: string
  bio?: string
  cultural_background?: string
  profile_image_url?: string
  pronouns?: string
  location?: string
}

interface ProfileSettingsProps {
  profile: Profile
}

export function ProfileSettings({ profile: initialProfile }: ProfileSettingsProps) {
  const [profile, setProfile] = useState(initialProfile)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createSupabaseBrowserClient()

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: profile.display_name,
          full_name: profile.full_name,
          bio: profile.bio,
          cultural_background: profile.cultural_background,
          pronouns: profile.pronouns,
          location: profile.location
        })
        .eq('id', profile.id)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)

    } catch (err: any) {
      console.error('Save error:', err)
      setError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = (url: string) => {
    setProfile(prev => ({ ...prev, profile_image_url: url }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile information and how you appear to others in the community
        </p>
      </div>

      {/* Avatar Upload Section */}
      <AvatarUpload
        userId={profile.id}
        currentAvatarUrl={profile.profile_image_url}
        displayName={profile.display_name}
        onUploadComplete={handleAvatarUpload}
      />

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal details and how you'd like to be known in the community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name *</Label>
            <Input
              id="display_name"
              value={profile.display_name}
              onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="How you'd like to be known"
            />
            <p className="text-xs text-muted-foreground">
              This is the name that will appear on your stories and profile
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={profile.full_name || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Your full legal name (optional)"
            />
          </div>

          {/* Pronouns */}
          <div className="space-y-2">
            <Label htmlFor="pronouns">Pronouns</Label>
            <Input
              id="pronouns"
              value={profile.pronouns || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, pronouns: e.target.value }))}
              placeholder="e.g., they/them, she/her, he/him"
            />
          </div>

          <Separator />

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us a bit about yourself..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Share what's important to you and what brings you to this community
            </p>
          </div>

          {/* Cultural Background */}
          <div className="space-y-2">
            <Label htmlFor="cultural_background">Cultural Background</Label>
            <Input
              id="cultural_background"
              value={profile.cultural_background || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, cultural_background: e.target.value }))}
              placeholder="e.g., Wurundjeri, Filipino-Australian, Italian"
            />
            <p className="text-xs text-muted-foreground">
              Share your cultural identity if you'd like (this is displayed with respect on your profile)
            </p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={profile.location || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Naarm/Melbourne, Country NSW"
            />
            <p className="text-xs text-muted-foreground">
              Where you're based (traditional territory or city name)
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-success/10 text-success rounded-md">
              <Save className="w-4 h-4" />
              <p className="text-sm">Profile updated successfully</p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={saving || !profile.display_name}
              className="gap-2"
            >
              {saving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
