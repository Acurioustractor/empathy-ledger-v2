'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Shield, Sparkles, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SacredKnowledgeProtectionProps {
  storytellerId: string
  initialSettings?: {
    protectionEnabled: boolean
    defaultProtection: 'none' | 'moderate' | 'strict'
    autoDetect: boolean
  }
  onSettingsChange?: (settings: Record<string, unknown>) => void
  className?: string
}

type ProtectionLevel = 'none' | 'moderate' | 'strict'

export function SacredKnowledgeProtection({
  storytellerId,
  initialSettings = {
    protectionEnabled: false,
    defaultProtection: 'none',
    autoDetect: false,
  },
  onSettingsChange,
  className
}: SacredKnowledgeProtectionProps) {
  const [settings, setSettings] = useState(initialSettings)

  const handleProtectionToggle = () => {
    const newSettings = {
      ...settings,
      protectionEnabled: !settings.protectionEnabled,
    }
    setSettings(newSettings)
    onSettingsChange?.(newSettings)
  }

  const handleLevelChange = (level: ProtectionLevel) => {
    const newSettings = { ...settings, defaultProtection: level }
    setSettings(newSettings)
    onSettingsChange?.(newSettings)
  }

  const handleAutoDetectToggle = () => {
    const newSettings = { ...settings, autoDetect: !settings.autoDetect }
    setSettings(newSettings)
    onSettingsChange?.(newSettings)
  }

  const protectionLevels = [
    {
      value: 'none' as const,
      label: 'No Default Protection',
      description: 'Stories are public by default. You can mark individual stories as sacred.',
      icon: Eye,
      color: 'text-gray-600',
    },
    {
      value: 'moderate' as const,
      label: 'Moderate Protection',
      description: 'Stories require community membership to view. AI analysis allowed with consent.',
      icon: Shield,
      color: 'text-amber-600',
    },
    {
      value: 'strict' as const,
      label: 'Strict Protection',
      description: 'Stories private by default. NO AI analysis. Elder review required.',
      icon: Lock,
      color: 'text-red-600',
    },
  ]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Info */}
      <Alert className="bg-clay-50 border-clay-200">
        <Shield className="h-4 w-4 text-clay-600" />
        <AlertDescription className="text-clay-800">
          <strong>Sacred Knowledge Protection:</strong> Some stories contain cultural knowledge that should be
          protected. These settings help you safeguard sacred, ceremonial, or culturally sensitive content.
        </AlertDescription>
      </Alert>

      {/* Master Toggle */}
      <Card className={cn(
        'transition-all duration-200',
        settings.protectionEnabled && 'border-2 border-clay-300 bg-clay-50/30'
      )}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-clay-600" />
                Enable Sacred Knowledge Protection
              </CardTitle>
              <CardDescription className="mt-2">
                Activate cultural safety protocols for your stories
              </CardDescription>
            </div>
            <Switch
              checked={settings.protectionEnabled}
              onCheckedChange={handleProtectionToggle}
              aria-label="Toggle Sacred Knowledge Protection"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Protection Level Selection */}
      {settings.protectionEnabled && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Default Protection Level</CardTitle>
              <CardDescription>
                Choose the default protection level for your stories. You can override this for individual stories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={settings.defaultProtection}
                onValueChange={(value) => handleLevelChange(value as ProtectionLevel)}
              >
                <div className="space-y-4">
                  {protectionLevels.map((level) => {
                    const Icon = level.icon
                    const isSelected = settings.defaultProtection === level.value

                    return (
                      <div
                        key={level.value}
                        className={cn(
                          'flex items-start space-x-3 space-y-0 p-4 rounded-lg border-2 transition-all',
                          isSelected
                            ? 'border-clay-400 bg-clay-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <RadioGroupItem value={level.value} id={level.value} />
                        <div className="flex-1">
                          <Label
                            htmlFor={level.value}
                            className="font-medium cursor-pointer flex items-center gap-2"
                          >
                            <Icon className={cn('h-4 w-4', level.color)} />
                            {level.label}
                            {isSelected && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-clay-100 text-clay-700 rounded-full">
                                Active
                              </span>
                            )}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {level.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Auto-Detection Toggle */}
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    AI-Assisted Sacred Content Detection
                  </CardTitle>
                  <CardDescription className="mt-2 text-purple-700">
                    AI can suggest when stories might contain sacred content. You always have final approval.
                  </CardDescription>
                </div>
                <Switch
                  checked={settings.autoDetect}
                  onCheckedChange={handleAutoDetectToggle}
                  aria-label="Toggle AI-Assisted Detection"
                />
              </div>
            </CardHeader>
            {settings.autoDetect && (
              <CardContent>
                <Alert className="bg-white border-purple-200">
                  <AlertDescription className="text-sm text-purple-800">
                    <strong>How it works:</strong> AI scans for keywords, phrases, and patterns that may
                    indicate sacred content (ceremonies, rituals, restricted knowledge). You'll receive a
                    suggestion to mark the story as sacred, but you make the final decision.
                  </AlertDescription>
                </Alert>
              </CardContent>
            )}
          </Card>

          {/* Strict Mode Warning */}
          {settings.defaultProtection === 'strict' && (
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Strict Protection Active:</strong> All your stories will default to:
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Private visibility (only you can see)</li>
                  <li>NO AI analysis (theme extraction, network discovery disabled)</li>
                  <li>Elder review required before sharing</li>
                  <li>Manual approval needed to make public</li>
                </ul>
                <p className="mt-2">
                  This is the safest option for stories containing sacred ceremonies, restricted knowledge,
                  or culturally sensitive information.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Cultural Protocol Notes */}
          <Card className="bg-clay-50 border-clay-200">
            <CardHeader>
              <CardTitle className="text-sm">Sacred Knowledge Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-clay-800">
              <p>
                <strong>Examples of sacred knowledge that should be protected:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Ceremonial practices and protocols</li>
                <li>Restricted cultural knowledge (gender-specific, clan-specific, age-specific)</li>
                <li>Sacred sites and their locations</li>
                <li>Spiritual teachings meant only for community members</li>
                <li>Traditional ecological knowledge with cultural restrictions</li>
                <li>Language or songs with ceremonial significance</li>
              </ul>
              <p className="mt-3">
                <strong>When in doubt, protect it.</strong> It's better to be cautious with cultural knowledge
                than to share what should remain within the community.
              </p>
            </CardContent>
          </Card>

          {/* Elder Consultation */}
          <Alert className="bg-sage-50 border-sage-200">
            <AlertDescription className="text-sage-800">
              <strong>Need guidance?</strong> If you're unsure whether a story contains sacred knowledge,
              you can request Elder review. Elders from your community can provide cultural guidance on
              appropriate sharing and protection levels.
            </AlertDescription>
          </Alert>
        </>
      )}

      {/* Disabled State Message */}
      {!settings.protectionEnabled && (
        <Alert>
          <EyeOff className="h-4 w-4" />
          <AlertDescription>
            Sacred Knowledge Protection is currently disabled. Enable it above to activate cultural safety
            protocols for your stories.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
