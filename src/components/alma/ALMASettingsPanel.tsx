'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Brain, Shield, Users, FileHeart, CheckCircle2, Loader2, Sparkles, HelpCircle, Info } from 'lucide-react'
import { AIConsentControls } from './AIConsentControls'
import { SacredKnowledgeProtection } from './SacredKnowledgeProtection'
import { ElderReviewPreferences } from './ElderReviewPreferences'
import { CulturalSafetySettings } from './CulturalSafetySettings'
import { cn } from '@/lib/utils'

interface ALMASettingsPanelProps {
  storytellerId: string
  className?: string
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function ALMASettingsPanel({
  storytellerId,
  className
}: ALMASettingsPanelProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [activeTab, setActiveTab] = useState('ai-consent')
  const [settings, setSettings] = useState({
    aiConsent: {},
    sacredKnowledge: {},
    elderReview: {},
    culturalSafety: {},
  })

  const handleSettingsChange = async (category: keyof typeof settings, newSettings: Record<string, unknown>) => {
    // Update local state
    const updatedSettings = {
      ...settings,
      [category]: newSettings,
    }
    setSettings(updatedSettings)

    // Auto-save to backend
    setSaveStatus('saving')

    try {
      const response = await fetch('/api/user/alma-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storytellerId,
          settings: updatedSettings,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save ALMA settings')
      }

      setSaveStatus('saved')

      // Auto-clear saved status after 5 seconds (extended for better visibility)
      setTimeout(() => {
        setSaveStatus('idle')
      }, 5000)
    } catch (error) {
      console.error('ALMA settings save error:', error)
      setSaveStatus('error')
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-clay-900 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-600" />
          ALMA: Cultural Safety & AI Settings
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1">
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  <strong>What is ALMA?</strong><br />
                  ALMA helps protect your stories and culture. You control what AI can and cannot do with your content.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h2>
        <p className="text-muted-foreground mt-1">
          Control how AI interacts with your stories. Your cultural protocols always come first.
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
                ALMA settings saved successfully
              </>
            )}
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving your cultural safety preferences...
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

      {/* ALMA Framework Explanation - Simplified */}
      <Card className="bg-gradient-to-br from-purple-50 via-clay-50 to-sage-50 border-2 border-clay-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            How ALMA Protects Your Stories
          </CardTitle>
          <CardDescription>
            Simple controls to keep your cultural knowledge safe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TooltipProvider>
              <div className="flex gap-3 p-3 bg-white rounded-md border border-purple-100">
                <Brain className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <p className="font-medium text-sm text-purple-900">You Choose</p>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-purple-400" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>AI will only look at your stories if you say yes. You can change this anytime.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-xs text-purple-700">AI only works when you allow it</p>
                </div>
              </div>
            </TooltipProvider>
            <TooltipProvider>
              <div className="flex gap-3 p-3 bg-white rounded-md border border-clay-100">
                <Shield className="h-5 w-5 text-clay-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <p className="font-medium text-sm text-clay-900">Culture First</p>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-clay-400" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Sacred stories, ceremonies, and secret knowledge are automatically protected. AI cannot access them.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-xs text-clay-700">Sacred content stays protected</p>
                </div>
              </div>
            </TooltipProvider>
            <TooltipProvider>
              <div className="flex gap-3 p-3 bg-white rounded-md border border-sage-100">
                <Users className="h-5 w-5 text-sage-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <p className="font-medium text-sm text-sage-900">Elders Decide</p>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-sage-400" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Community Elders always have the final word on cultural matters. Their authority is respected above all.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-xs text-sage-700">Elders have final authority</p>
                </div>
              </div>
            </TooltipProvider>
            <TooltipProvider>
              <div className="flex gap-3 p-3 bg-white rounded-md border border-sky-100">
                <FileHeart className="h-5 w-5 text-sky-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <p className="font-medium text-sm text-sky-900">Your Stories</p>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-sky-400" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>You always own your stories. AI might help with themes or summaries, but your knowledge belongs to you.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-xs text-sky-700">You own everything you share</p>
                </div>
              </div>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* Tabs - Larger touch targets for tablets (44px minimum) */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="ai-consent" className="gap-2 min-h-[44px] py-3 px-2">
            <Brain className="h-5 w-5" />
            <span className="hidden sm:inline text-sm">AI Consent</span>
          </TabsTrigger>
          <TabsTrigger value="sacred-knowledge" className="gap-2 min-h-[44px] py-3 px-2">
            <Shield className="h-5 w-5" />
            <span className="hidden sm:inline text-sm">Sacred Content</span>
          </TabsTrigger>
          <TabsTrigger value="elder-review" className="gap-2 min-h-[44px] py-3 px-2">
            <Users className="h-5 w-5" />
            <span className="hidden sm:inline text-sm">Elder Review</span>
          </TabsTrigger>
          <TabsTrigger value="cultural-safety" className="gap-2 min-h-[44px] py-3 px-2">
            <FileHeart className="h-5 w-5" />
            <span className="hidden sm:inline text-sm">Protocols</span>
          </TabsTrigger>
        </TabsList>

        {/* AI Consent Tab */}
        <TabsContent value="ai-consent" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Processing Consent
              </CardTitle>
              <CardDescription>
                Control which AI features can analyze your stories. All features are opt-in and can be disabled anytime.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIConsentControls
                storytellerId={storytellerId}
                onConsentChange={(consent) => handleSettingsChange('aiConsent', consent)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sacred Knowledge Tab */}
        <TabsContent value="sacred-knowledge" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-clay-600" />
                Sacred Knowledge Protection
              </CardTitle>
              <CardDescription>
                Protect culturally sensitive, ceremonial, or sacred content from public sharing and AI analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SacredKnowledgeProtection
                storytellerId={storytellerId}
                onSettingsChange={(sacredSettings) => handleSettingsChange('sacredKnowledge', sacredSettings)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Elder Review Tab */}
        <TabsContent value="elder-review" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-sage-600" />
                Elder Review Preferences
              </CardTitle>
              <CardDescription>
                Configure when and how community Elders review your stories for cultural appropriateness.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ElderReviewPreferences
                storytellerId={storytellerId}
                onPreferencesChange={(elderPrefs) => handleSettingsChange('elderReview', elderPrefs)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cultural Safety Tab */}
        <TabsContent value="cultural-safety" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileHeart className="h-5 w-5 text-sky-600" />
                Cultural Safety Protocols
              </CardTitle>
              <CardDescription>
                Set community-specific protocols, content warnings, and cultural guidelines for your stories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CulturalSafetySettings
                storytellerId={storytellerId}
                onSettingsChange={(safetySettings) => handleSettingsChange('culturalSafety', safetySettings)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Indigenous Data Sovereignty Notice */}
      <Alert className="bg-clay-50 border-clay-200">
        <Shield className="h-4 w-4 text-clay-600" />
        <AlertDescription className="text-clay-800">
          <strong>ALMA Framework & Indigenous Data Sovereignty:</strong> These settings implement OCAP principles
          (Ownership, Control, Access, Possession) and respect Indigenous data sovereignty. Your community's cultural
          protocols always take precedence over AI processing. Elder authority is non-negotiable. You own your stories,
          we are stewards.
        </AlertDescription>
      </Alert>
    </div>
  )
}
