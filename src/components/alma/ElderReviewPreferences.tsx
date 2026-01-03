'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Clock, Bell, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ElderReviewPreferencesProps {
  storytellerId: string
  initialPreferences?: {
    autoRouteToElders: boolean
    reviewTrigger: 'always' | 'sacred-only' | 'manual'
    notificationFrequency: 'immediate' | 'daily' | 'weekly'
    preferredElders: string[]
  }
  onPreferencesChange?: (preferences: Record<string, unknown>) => void
  className?: string
}

type ReviewTrigger = 'always' | 'sacred-only' | 'manual'
type NotificationFrequency = 'immediate' | 'daily' | 'weekly'

export function ElderReviewPreferences({
  storytellerId,
  initialPreferences = {
    autoRouteToElders: false,
    reviewTrigger: 'manual',
    notificationFrequency: 'daily',
    preferredElders: [],
  },
  onPreferencesChange,
  className
}: ElderReviewPreferencesProps) {
  const [preferences, setPreferences] = useState(initialPreferences)

  const handleAutoRouteToggle = () => {
    const newPreferences = {
      ...preferences,
      autoRouteToElders: !preferences.autoRouteToElders,
    }
    setPreferences(newPreferences)
    onPreferencesChange?.(newPreferences)
  }

  const handleTriggerChange = (trigger: ReviewTrigger) => {
    const newPreferences = { ...preferences, reviewTrigger: trigger }
    setPreferences(newPreferences)
    onPreferencesChange?.(newPreferences)
  }

  const handleNotificationChange = (frequency: NotificationFrequency) => {
    const newPreferences = { ...preferences, notificationFrequency: frequency }
    setPreferences(newPreferences)
    onPreferencesChange?.(newPreferences)
  }

  const reviewTriggers = [
    {
      value: 'manual' as const,
      label: 'Manual Request Only',
      description: 'I will manually request Elder review when I need it',
      icon: '👤',
    },
    {
      value: 'sacred-only' as const,
      label: 'Sacred Content Auto-Route',
      description: 'Automatically send stories marked as sacred knowledge for Elder review',
      icon: '🛡️',
    },
    {
      value: 'always' as const,
      label: 'Review All Stories',
      description: 'Send every story for Elder review before sharing publicly',
      icon: '✓',
    },
  ]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Info */}
      <Alert className="bg-sage-50 border-sage-200">
        <Users className="h-4 w-4 text-sage-600" />
        <AlertDescription className="text-sage-800">
          <strong>Elder Review:</strong> Community Elders provide cultural guidance and ensure stories are
          shared appropriately. Their authority is respected and their recommendations are carefully considered.
        </AlertDescription>
      </Alert>

      {/* Auto-Route Toggle */}
      <Card className={cn(
        'transition-all duration-200',
        preferences.autoRouteToElders && 'border-2 border-sage-300 bg-sage-50/30'
      )}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-sage-600" />
                Enable Elder Review
              </CardTitle>
              <CardDescription className="mt-2">
                Allow Elders from your community to review your stories before they're shared
              </CardDescription>
            </div>
            <Switch
              checked={preferences.autoRouteToElders}
              onCheckedChange={handleAutoRouteToggle}
              aria-label="Toggle Elder Review"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Review Trigger Settings */}
      {preferences.autoRouteToElders && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">When to Request Elder Review</CardTitle>
              <CardDescription>
                Choose when your stories should be sent to Elders for cultural guidance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={preferences.reviewTrigger}
                onValueChange={(value) => handleTriggerChange(value as ReviewTrigger)}
              >
                <div className="space-y-4">
                  {reviewTriggers.map((trigger) => {
                    const isSelected = preferences.reviewTrigger === trigger.value

                    return (
                      <div
                        key={trigger.value}
                        className={cn(
                          'flex items-start space-x-3 space-y-0 p-4 rounded-lg border-2 transition-all',
                          isSelected
                            ? 'border-sage-400 bg-sage-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <RadioGroupItem value={trigger.value} id={trigger.value} />
                        <div className="flex-1">
                          <Label
                            htmlFor={trigger.value}
                            className="font-medium cursor-pointer flex items-center gap-2"
                          >
                            <span className="text-lg">{trigger.icon}</span>
                            {trigger.label}
                            {isSelected && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-sage-100 text-sage-700 rounded-full">
                                Active
                              </span>
                            )}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {trigger.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Review Notifications
              </CardTitle>
              <CardDescription>
                How often should we notify you about Elder review status?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notification-frequency" className="flex-1">
                    Notification Frequency
                  </Label>
                  <Select
                    value={preferences.notificationFrequency}
                    onValueChange={(value) => handleNotificationChange(value as NotificationFrequency)}
                  >
                    <SelectTrigger id="notification-frequency" className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">
                        <div className="flex items-center gap-2">
                          <Bell className="h-3 w-3" />
                          Immediate
                        </div>
                      </SelectItem>
                      <SelectItem value="daily">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          Daily Digest
                        </div>
                      </SelectItem>
                      <SelectItem value="weekly">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          Weekly Summary
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-800">
                    {preferences.notificationFrequency === 'immediate' && (
                      'You\'ll receive a notification as soon as an Elder reviews your story.'
                    )}
                    {preferences.notificationFrequency === 'daily' && (
                      'You\'ll receive a daily summary of all Elder reviews at 6 PM.'
                    )}
                    {preferences.notificationFrequency === 'weekly' && (
                      'You\'ll receive a weekly summary of all Elder reviews every Monday morning.'
                    )}
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Elder Review Process Explanation */}
          <Card className="bg-clay-50 border-clay-200">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-clay-600" />
                How Elder Review Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-clay-800">
              <div className="flex gap-3">
                <span className="flex-shrink-0 font-bold text-clay-600">1.</span>
                <p>
                  <strong>You submit a story:</strong> When you create or update a story (based on your trigger
                  settings above), it's added to the Elder review queue.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 font-bold text-clay-600">2.</span>
                <p>
                  <strong>Elder reviews cultural content:</strong> An Elder from your community reviews the
                  story for cultural appropriateness, sacred content, and community protocols.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 font-bold text-clay-600">3.</span>
                <p>
                  <strong>You receive feedback:</strong> The Elder can approve, request changes, or provide
                  cultural guidance. You maintain full control and can choose whether to accept their recommendations.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 font-bold text-clay-600">4.</span>
                <p>
                  <strong>You decide what to do:</strong> Elder review is advisory, not mandatory. Their wisdom
                  is deeply respected, but you have final authority over your stories.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Alert className="bg-amber-50 border-amber-200">
            <AlertDescription className="text-amber-800">
              <strong>Important:</strong> Elder review times vary based on Elder availability (typically 2-7 days).
              If your story requires urgent sharing, you can publish it first and request Elder review afterward.
              Elders may suggest changes even after publication.
            </AlertDescription>
          </Alert>
        </>
      )}

      {/* Disabled State Message */}
      {!preferences.autoRouteToElders && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Elder Review is currently disabled. Enable it above to receive cultural guidance from community
            Elders. You can always manually request Elder review for individual stories regardless of this setting.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
