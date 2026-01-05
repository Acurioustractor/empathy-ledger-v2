'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Brain, Sparkles, Network, BarChart3, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIConsentControlsProps {
  storytellerId: string
  initialConsent?: {
    themeExtraction: boolean
    networkDiscovery: boolean
    impactAnalytics: boolean
    voiceAnalysis: boolean
  }
  onConsentChange?: (consent: Record<string, boolean>) => void
  className?: string
}

export function AIConsentControls({
  storytellerId,
  initialConsent = {
    themeExtraction: true,
    networkDiscovery: true,
    impactAnalytics: true,
    voiceAnalysis: true,
  },
  onConsentChange,
  className
}: AIConsentControlsProps) {
  const [consent, setConsent] = useState(initialConsent)

  const handleConsentToggle = (key: keyof typeof consent) => {
    const newConsent = { ...consent, [key]: !consent[key] }
    setConsent(newConsent)
    onConsentChange?.(newConsent)
  }

  const aiFeatures = [
    {
      key: 'themeExtraction' as const,
      label: 'Theme Extraction',
      description: 'AI identifies themes and patterns in your stories to help connect with similar narratives',
      icon: Brain,
      color: 'text-purple-600',
      benefit: 'Helps others discover your stories through thematic connections',
    },
    {
      key: 'networkDiscovery' as const,
      label: 'Network Discovery',
      description: 'Find connections with other storytellers who share similar experiences or themes',
      icon: Network,
      color: 'text-blue-600',
      benefit: 'Build community with storytellers on similar journeys',
    },
    {
      key: 'impactAnalytics' as const,
      label: 'Impact Analytics',
      description: 'See how your stories influence and reach your community',
      icon: BarChart3,
      color: 'text-green-600',
      benefit: 'Understand the reach and influence of your storytelling',
    },
    {
      key: 'voiceAnalysis' as const,
      label: 'Voice Analysis (Audio Stories)',
      description: 'Analyze tone, emotion, and prosody in audio stories to enrich transcripts',
      icon: Sparkles,
      color: 'text-amber-600',
      benefit: 'Capture the emotional depth of spoken stories',
    },
  ]

  const consentedCount = Object.values(consent).filter(Boolean).length

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Info */}
      <Alert className="bg-purple-50 border-purple-200">
        <Brain className="h-4 w-4 text-purple-600" />
        <AlertDescription className="text-purple-800">
          <strong>AI is Your Choice:</strong> AI features are enabled by default to help you discover themes and connections.
          You can disable any feature anytime. Your stories remain yours regardless of your choices.
        </AlertDescription>
      </Alert>

      {/* Consent Summary */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-900">{consentedCount}/4</p>
            <p className="text-sm text-purple-700 mt-1">
              AI Features Enabled
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Feature Controls */}
      <div className="space-y-4">
        {aiFeatures.map((feature) => {
          const Icon = feature.icon
          const isEnabled = consent[feature.key]

          return (
            <Card
              key={feature.key}
              className={cn(
                'transition-all duration-200',
                isEnabled && 'border-2 border-purple-300 bg-purple-50/30'
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className={cn('h-5 w-5 mt-0.5', feature.color)} />
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {feature.label}
                        {isEnabled && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                            Enabled
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={() => handleConsentToggle(feature.key)}
                    aria-label={`Toggle ${feature.label}`}
                  />
                </div>
              </CardHeader>
              {isEnabled && (
                <CardContent className="pt-0">
                  <div className="flex items-start gap-2 p-3 bg-white rounded-md border border-purple-100">
                    <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-purple-700">
                      <strong>Benefit:</strong> {feature.benefit}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Important Notes */}
      <Card className="bg-clay-50 border-clay-200">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-clay-600" />
            Important: Your Control, Always
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-clay-800">
          <p>
            <strong>✓ You own your data:</strong> AI analyzes your stories to help you and your community,
            but you retain full ownership.
          </p>
          <p>
            <strong>✓ Consent is revocable:</strong> Turn off any feature at any time. Existing AI results
            will be preserved unless you request deletion.
          </p>
          <p>
            <strong>✓ Sacred content protected:</strong> Stories marked as sacred knowledge are NEVER analyzed
            by AI, regardless of these settings.
          </p>
          <p>
            <strong>✓ Elder review respected:</strong> If your story requires Elder review, AI analysis waits
            until after Elder approval.
          </p>
          <p>
            <strong>✓ Transparency guaranteed:</strong> All AI results show confidence scores and are
            reviewable/editable by you.
          </p>
        </CardContent>
      </Card>

      {/* All Disabled Notice */}
      {consentedCount === 0 && (
        <Alert className="bg-sage-50 border-sage-200">
          <AlertDescription className="text-sage-800">
            All AI features are currently disabled. Your stories will be shared exactly as you create them, without any
            automated analysis. You can re-enable AI features above if you'd like help discovering themes,
            connecting with other storytellers, or measuring your impact.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
