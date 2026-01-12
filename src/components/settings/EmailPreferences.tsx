'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Mail, Bell, CheckCircle, AlertCircle } from 'lucide-react'

interface EmailPreferences {
  notify_story_approved: boolean
  notify_story_published: boolean
  notify_story_rejected: boolean
  notify_changes_requested: boolean
  notify_review_assigned: boolean
  notify_new_submissions: boolean
  notify_elder_escalation: boolean
  notify_community_mention: boolean
  notify_story_comments: boolean
  weekly_digest: boolean
  monthly_summary: boolean
  unsubscribed: boolean
}

interface PreferenceSwitchProps {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function PreferenceSwitch({ id, label, checked, onChange }: PreferenceSwitchProps) {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={id} className="font-normal">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

interface PreferenceSectionProps {
  title: string
  description: string
  children: React.ReactNode
}

function PreferenceSection({ title, description, children }: PreferenceSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-3 pl-4">{children}</div>
    </div>
  )
}

export function EmailPreferences() {
  const [preferences, setPreferences] = useState<EmailPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    async function loadPreferences() {
      try {
        const response = await fetch('/api/user/email-preferences')
        if (!response.ok) throw new Error('Failed to load preferences')
        const data = await response.json()
        setPreferences(data.preferences)
      } catch (error) {
        console.error('Failed to load preferences:', error)
        setMessage({ type: 'error', text: 'Failed to load email preferences' })
      } finally {
        setLoading(false)
      }
    }
    loadPreferences()
  }, [])

  async function handleSave() {
    if (!preferences) return

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/user/email-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      })

      if (!response.ok) throw new Error('Failed to save preferences')
      setMessage({ type: 'success', text: 'Email preferences saved successfully' })
    } catch (error) {
      console.error('Failed to save preferences:', error)
      setMessage({ type: 'error', text: 'Failed to save preferences. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  function updatePreference(key: keyof EmailPreferences, value: boolean) {
    if (!preferences) return
    setPreferences({ ...preferences, [key]: value })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!preferences) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load email preferences</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Global Unsubscribe Alert */}
      {preferences.unsubscribed && (
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertDescription>
            You are currently unsubscribed from all emails. Toggle the switch below to re-enable
            notifications.
          </AlertDescription>
        </Alert>
      )}

      {/* Message */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Global Email Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>Control when and how we email you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications from Empathy Ledger
              </p>
            </div>
            <Switch
              checked={!preferences.unsubscribed}
              onCheckedChange={(checked) => updatePreference('unsubscribed', !checked)}
            />
          </div>

          {!preferences.unsubscribed && (
            <>
              <Separator />

              <PreferenceSection title="Your Stories" description="Updates about stories you've submitted">
                <PreferenceSwitch
                  id="approved"
                  label="Story approved"
                  checked={preferences.notify_story_approved}
                  onChange={(checked) => updatePreference('notify_story_approved', checked)}
                />
                <PreferenceSwitch
                  id="published"
                  label="Story published"
                  checked={preferences.notify_story_published}
                  onChange={(checked) => updatePreference('notify_story_published', checked)}
                />
                <PreferenceSwitch
                  id="changes"
                  label="Changes requested"
                  checked={preferences.notify_changes_requested}
                  onChange={(checked) => updatePreference('notify_changes_requested', checked)}
                />
                <PreferenceSwitch
                  id="rejected"
                  label="Story rejected"
                  checked={preferences.notify_story_rejected}
                  onChange={(checked) => updatePreference('notify_story_rejected', checked)}
                />
              </PreferenceSection>

              <Separator />

              <PreferenceSection title="Review Activities" description="If you're a reviewer or elder">
                <PreferenceSwitch
                  id="assigned"
                  label="Review assigned to me"
                  checked={preferences.notify_review_assigned}
                  onChange={(checked) => updatePreference('notify_review_assigned', checked)}
                />
                <PreferenceSwitch
                  id="submissions"
                  label="New story submissions"
                  checked={preferences.notify_new_submissions}
                  onChange={(checked) => updatePreference('notify_new_submissions', checked)}
                />
                <PreferenceSwitch
                  id="escalation"
                  label="Elder escalations"
                  checked={preferences.notify_elder_escalation}
                  onChange={(checked) => updatePreference('notify_elder_escalation', checked)}
                />
              </PreferenceSection>

              <Separator />

              <PreferenceSection title="Community" description="Engagement and mentions">
                <PreferenceSwitch
                  id="mention"
                  label="Someone mentions me"
                  checked={preferences.notify_community_mention}
                  onChange={(checked) => updatePreference('notify_community_mention', checked)}
                />
                <PreferenceSwitch
                  id="comments"
                  label="Comments on my stories"
                  checked={preferences.notify_story_comments}
                  onChange={(checked) => updatePreference('notify_story_comments', checked)}
                />
              </PreferenceSection>

              <Separator />

              <PreferenceSection title="Digest Emails" description="Periodic summaries of activity">
                <PreferenceSwitch
                  id="weekly"
                  label="Weekly digest"
                  checked={preferences.weekly_digest}
                  onChange={(checked) => updatePreference('weekly_digest', checked)}
                />
                <PreferenceSwitch
                  id="monthly"
                  label="Monthly summary"
                  checked={preferences.monthly_summary}
                  onChange={(checked) => updatePreference('monthly_summary', checked)}
                />
              </PreferenceSection>
            </>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </Button>
      </div>
    </div>
  )
}
