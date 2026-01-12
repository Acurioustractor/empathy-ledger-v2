'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Shield, Eye, Database, Download, Trash2, CheckCircle2, Loader2, Scale, ExternalLink } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { VisibilitySelector } from './VisibilitySelector'
import { DataSovereigntyPreferences } from './DataSovereigntyPreferences'
import { ContactPermissions } from './ContactPermissions'
import { ExportDataDialog } from './ExportDataDialog'
import { DeleteAccountDialog } from './DeleteAccountDialog'
import { cn } from '@/lib/utils'

interface PrivacySettingsPanelProps {
  storytellerId: string
  storytellerEmail: string
  className?: string
  testMode?: boolean // If true, don't actually save to API (for test pages)
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface PlatformSharingSettings {
  justicehub_enabled: boolean
}

export function PrivacySettingsPanel({
  storytellerId,
  storytellerEmail,
  className,
  testMode = false
}: PrivacySettingsPanelProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [activeTab, setActiveTab] = useState('visibility')
  const [platformSharing, setPlatformSharing] = useState<PlatformSharingSettings>({
    justicehub_enabled: false
  })

  // Load initial platform sharing settings
  React.useEffect(() => {
    if (!testMode && storytellerId) {
      fetch(`/api/storytellers/${storytellerId}`)
        .then(res => res.json())
        .then(data => {
          // API returns justicehub_enabled at root level
          if (data.justicehub_enabled !== undefined) {
            setPlatformSharing({
              justicehub_enabled: data.justicehub_enabled || false
            })
          }
        })
        .catch(err => console.error('Failed to load platform settings:', err))
    }
  }, [storytellerId, testMode])

  const handleJusticeHubToggle = async (enabled: boolean) => {
    setPlatformSharing(prev => ({ ...prev, justicehub_enabled: enabled }))
    await handleSettingsChange({ justicehub_enabled: enabled })
  }

  const handleSettingsChange = async (settings: Record<string, unknown>) => {
    // In test mode, just update state without saving to API
    if (testMode) {
      setSaveStatus('saving')
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 500))
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 3000)
      return
    }

    setSaveStatus('saving')

    try {
      const response = await fetch('/api/user/privacy-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storytellerId,
          settings,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      setSaveStatus('saved')

      // Auto-clear saved status after 5 seconds (extended for better visibility)
      setTimeout(() => {
        setSaveStatus('idle')
      }, 5000)
    } catch (error) {
      console.error('Settings save error:', error)
      setSaveStatus('error')
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-clay-900 flex items-center gap-2">
          <Shield className="h-6 w-6 text-sage-600" />
          Privacy & Data Control
        </h2>
        <p className="text-muted-foreground mt-1">
          You own your stories and data. Control who sees them and how they're used.
        </p>
      </div>

      {/* Save Status Alert */}
      {saveStatus !== 'idle' && (
        <Alert className={cn(
          saveStatus === 'saved' && 'border-green-200 bg-green-50 text-green-800',
          saveStatus === 'saving' && 'border-blue-200 bg-blue-50 text-blue-800',
          saveStatus === 'error' && 'border-red-200 bg-red-50 text-red-800'
        )}>
          <AlertDescription className="flex items-center gap-2">
            {saveStatus === 'saved' && (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Settings saved successfully
              </>
            )}
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving your preferences...
              </>
            )}
            {saveStatus === 'error' && (
              <>
                Failed to save settings. Please try again.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs - Larger touch targets for tablets (44px minimum) */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid h-auto">
          <TabsTrigger value="visibility" className="gap-2 min-h-[44px] py-3">
            <Eye className="h-5 w-5" />
            <span className="hidden sm:inline">Visibility</span>
          </TabsTrigger>
          <TabsTrigger value="sovereignty" className="gap-2 min-h-[44px] py-3">
            <Shield className="h-5 w-5" />
            <span className="hidden sm:inline">Data Control</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2 min-h-[44px] py-3">
            <Database className="h-5 w-5" />
            <span className="hidden sm:inline">Contact</span>
          </TabsTrigger>
        </TabsList>

        {/* Visibility Tab */}
        <TabsContent value="visibility" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-sky-600" />
                Story Visibility
              </CardTitle>
              <CardDescription>
                Control who can see your stories by default. You can override this for individual stories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VisibilitySelector
                storytellerId={storytellerId}
                onSettingsChange={handleSettingsChange}
              />
            </CardContent>
          </Card>

          <Card className="bg-sage-50 border-sage-200">
            <CardContent className="pt-6">
              <p className="text-sm text-sage-800">
                <strong>Privacy Levels Explained:</strong>
              </p>
              <ul className="mt-2 space-y-1 text-sm text-sage-700">
                <li><strong>Public:</strong> Anyone can discover and read your stories</li>
                <li><strong>Community:</strong> Only members of your communities/organizations can see</li>
                <li><strong>Private:</strong> Only you can see, useful for drafts and personal reflection</li>
                <li><strong>Restricted:</strong> You manually approve each person who can access</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Sovereignty Tab */}
        <TabsContent value="sovereignty" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-clay-600" />
                Data Sovereignty (OCAP Principles)
              </CardTitle>
              <CardDescription>
                Control how your data is used, shared, and processed. Based on Indigenous data sovereignty principles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataSovereigntyPreferences
                storytellerId={storytellerId}
                onSettingsChange={handleSettingsChange}
              />
            </CardContent>
          </Card>

          {/* Platform Sharing - JusticeHub Opt-in */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-blue-600" />
                Platform Sharing
              </CardTitle>
              <CardDescription>
                Choose which partner platforms can display your profile and stories you've shared.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-blue-200 bg-blue-50/50">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="justicehub-toggle" className="text-base font-medium text-clay-900 cursor-pointer">
                      Allow my profile on JusticeHub
                    </Label>
                    <a
                      href="https://justicehub.org.au"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <p className="text-sm text-clay-600">
                    When enabled, your public profile and stories you've explicitly shared may appear on JusticeHub,
                    a platform supporting youth justice reform. You control which specific stories are shared separately.
                  </p>
                </div>
                <Switch
                  id="justicehub-toggle"
                  checked={platformSharing.justicehub_enabled}
                  onCheckedChange={handleJusticeHubToggle}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              <Alert className="bg-sage-50 border-sage-200">
                <AlertDescription className="text-sm text-sage-800">
                  <strong>Your Control:</strong> This setting only makes you discoverable on partner platforms.
                  You still choose which individual stories to share using the "Share Your Story" feature.
                  You can revoke access at any time.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card className="bg-clay-50 border-clay-200">
            <CardContent className="pt-6">
              <p className="text-sm text-clay-800">
                <strong>OCAP Principles:</strong>
              </p>
              <ul className="mt-2 space-y-1 text-sm text-clay-700">
                <li><strong>Ownership:</strong> Your community owns the data</li>
                <li><strong>Control:</strong> You control how it's collected and used</li>
                <li><strong>Access:</strong> You decide who can access it</li>
                <li><strong>Possession:</strong> You have the right to manage and protect it</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Permissions</CardTitle>
              <CardDescription>
                Control who can contact you and how they can reach you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactPermissions
                storytellerId={storytellerId}
                onSettingsChange={handleSettingsChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Data Management Actions */}
      <Card className="border-2 border-dashed border-muted">
        <CardHeader>
          <CardTitle className="text-lg">Data Management</CardTitle>
          <CardDescription>
            Your rights under GDPR: Export your data anytime, or request complete account deletion.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <ExportDataDialog storytellerId={storytellerId} className="flex-1" />
            <DeleteAccountDialog
              storytellerId={storytellerId}
              storytellerEmail={storytellerEmail}
              className="flex-1"
            />
          </div>

          <Alert className="bg-sky-50 border-sky-200">
            <AlertDescription className="text-sm text-sky-800">
              <strong>Your Rights:</strong> Under GDPR, you have the right to access all your data (Article 15)
              and request complete deletion (Article 17). These rights are non-negotiable and always available.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Cultural Data Sovereignty Notice */}
      <Alert className="bg-clay-50 border-clay-200">
        <Shield className="h-4 w-4 text-clay-600" />
        <AlertDescription className="text-clay-800">
          <strong>Indigenous Data Sovereignty:</strong> Your stories and cultural knowledge belong to you and your
          community. We are stewards, not owners. These settings ensure your data is used according to your wishes
          and cultural protocols. For sacred or culturally sensitive content, Elder review is available upon request.
        </AlertDescription>
      </Alert>
    </div>
  )
}
