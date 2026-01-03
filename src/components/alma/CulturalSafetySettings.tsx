'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, FileText, Bell, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CulturalSafetySettingsProps {
  storytellerId: string
  initialSettings?: {
    enableContentWarnings: boolean
    enableCulturalProtocols: boolean
    protocolNotes: string
    notifyOnSensitiveContent: boolean
  }
  onSettingsChange?: (settings: Record<string, unknown>) => void
  className?: string
}

export function CulturalSafetySettings({
  storytellerId,
  initialSettings = {
    enableContentWarnings: true,
    enableCulturalProtocols: true,
    protocolNotes: '',
    notifyOnSensitiveContent: true,
  },
  onSettingsChange,
  className
}: CulturalSafetySettingsProps) {
  const [settings, setSettings] = useState(initialSettings)

  const handleToggle = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] }
    setSettings(newSettings)
    onSettingsChange?.(newSettings)
  }

  const handleProtocolNotesChange = (notes: string) => {
    const newSettings = { ...settings, protocolNotes: notes }
    setSettings(newSettings)
    onSettingsChange?.(newSettings)
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Info */}
      <Alert className="bg-clay-50 border-clay-200">
        <Shield className="h-4 w-4 text-clay-600" />
        <AlertDescription className="text-clay-800">
          <strong>Cultural Safety:</strong> These settings help protect you and your community by providing
          appropriate warnings, respecting cultural protocols, and ensuring sensitive content is handled with care.
        </AlertDescription>
      </Alert>

      {/* Content Warnings */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base">Content Warnings</CardTitle>
              <CardDescription className="mt-1">
                Display warnings on stories that contain sensitive topics (trauma, violence, loss, etc.)
              </CardDescription>
            </div>
            <Switch
              checked={settings.enableContentWarnings}
              onCheckedChange={() => handleToggle('enableContentWarnings')}
              aria-label="Toggle Content Warnings"
            />
          </div>
        </CardHeader>
        {settings.enableContentWarnings && (
          <CardContent>
            <Alert className="bg-amber-50 border-amber-200">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-800">
                Readers will see a warning before viewing stories that may contain triggering content.
                This protects your community while still allowing important stories to be shared.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Cultural Protocols */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base">Cultural Protocols</CardTitle>
              <CardDescription className="mt-1">
                Enforce community-specific cultural protocols for viewing and sharing stories
              </CardDescription>
            </div>
            <Switch
              checked={settings.enableCulturalProtocols}
              onCheckedChange={() => handleToggle('enableCulturalProtocols')}
              aria-label="Toggle Cultural Protocols"
            />
          </div>
        </CardHeader>
        {settings.enableCulturalProtocols && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="protocol-notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-clay-600" />
                Protocol Notes (Optional)
              </Label>
              <Textarea
                id="protocol-notes"
                placeholder="e.g., 'Stories about ceremonial practices should only be viewed by initiated community members' or 'Women's stories should be reviewed by women Elders'"
                value={settings.protocolNotes}
                onChange={(e) => handleProtocolNotesChange(e.target.value)}
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                Add any specific cultural protocols that apply to your stories. These notes help Elders
                and community members understand how to respectfully engage with your content.
              </p>
            </div>

            <Alert className="bg-sage-50 border-sage-200">
              <Info className="h-4 w-4 text-sage-600" />
              <AlertDescription className="text-sm text-sage-800">
                <strong>Examples of cultural protocols:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside ml-2">
                  <li>Gender-specific content (men's business, women's business)</li>
                  <li>Age-restricted knowledge (Elder knowledge, youth knowledge)</li>
                  <li>Clan or family-specific stories</li>
                  <li>Seasonal restrictions (stories only shared at certain times)</li>
                  <li>Language protocols (stories should be told in specific language)</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Sensitive Content Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Sensitive Content Notifications
              </CardTitle>
              <CardDescription className="mt-1">
                Receive alerts when AI detects potentially sensitive or sacred content in your stories
              </CardDescription>
            </div>
            <Switch
              checked={settings.notifyOnSensitiveContent}
              onCheckedChange={() => handleToggle('notifyOnSensitiveContent')}
              aria-label="Toggle Sensitive Content Notifications"
            />
          </div>
        </CardHeader>
        {settings.notifyOnSensitiveContent && (
          <CardContent>
            <Alert className="bg-purple-50 border-purple-200">
              <Info className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-sm text-purple-800">
                You'll receive a notification suggesting you review the story for cultural appropriateness.
                This is a helpful prompt, not a restriction. You always have final say.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Community-Specific Protocols Info */}
      <Card className="bg-clay-50 border-clay-200">
        <CardHeader>
          <CardTitle className="text-sm">Understanding Cultural Protocols</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-clay-800">
          <p>
            <strong>Cultural protocols are living practices</strong> that guide how knowledge is shared,
            who can access it, and when it's appropriate to share. They vary by:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Community:</strong> Each Indigenous nation has unique protocols</li>
            <li><strong>Content type:</strong> Ceremonial knowledge vs. everyday stories</li>
            <li><strong>Context:</strong> Public events vs. private family gatherings</li>
            <li><strong>Time:</strong> Seasonal or ceremonial timing</li>
            <li><strong>Audience:</strong> Who should (and shouldn't) access the knowledge</li>
          </ul>
          <p className="mt-3">
            These settings help the platform respect your community's protocols while still allowing
            important stories to be preserved and shared appropriately.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
