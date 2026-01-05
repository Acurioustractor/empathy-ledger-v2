'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Eye, EyeOff, Users, Lock, Globe2, Shield, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StoryVisibilityControlsProps {
  storyId?: string
  initialVisibility?: VisibilityLevel
  initialRequiresElderReview?: boolean
  initialCulturalSensitivity?: CulturalSensitivityLevel
  onChange?: (settings: VisibilitySettings) => void
  onSave?: (settings: VisibilitySettings) => Promise<void>
  className?: string
  showSaveButton?: boolean
}

type VisibilityLevel = 'public' | 'community' | 'private' | 'restricted'
type CulturalSensitivityLevel = 'none' | 'moderate' | 'high' | 'sacred'

interface VisibilitySettings {
  visibility: VisibilityLevel
  requiresElderReview: boolean
  culturalSensitivityLevel: CulturalSensitivityLevel
}

export function StoryVisibilityControls({
  storyId,
  initialVisibility = 'community',
  initialRequiresElderReview = false,
  initialCulturalSensitivity = 'none',
  onChange,
  onSave,
  className,
  showSaveButton = false
}: StoryVisibilityControlsProps) {
  const [visibility, setVisibility] = useState<VisibilityLevel>(initialVisibility)
  const [requiresElderReview, setRequiresElderReview] = useState(initialRequiresElderReview)
  const [culturalSensitivity, setCulturalSensitivity] = useState<CulturalSensitivityLevel>(initialCulturalSensitivity)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleVisibilityChange = (value: VisibilityLevel) => {
    setVisibility(value)
    notifyChange({ visibility: value, requiresElderReview, culturalSensitivityLevel: culturalSensitivity })
  }

  const handleElderReviewToggle = (checked: boolean) => {
    setRequiresElderReview(checked)
    notifyChange({ visibility, requiresElderReview: checked, culturalSensitivityLevel: culturalSensitivity })
  }

  const handleCulturalSensitivityChange = (value: CulturalSensitivityLevel) => {
    setCulturalSensitivity(value)
    // Automatically enable elder review for sacred content
    const elderReview = value === 'sacred' ? true : requiresElderReview
    setRequiresElderReview(elderReview)
    notifyChange({ visibility, requiresElderReview: elderReview, culturalSensitivityLevel: value })
  }

  const notifyChange = (settings: VisibilitySettings) => {
    onChange?.(settings)
    setSaveSuccess(false)
  }

  const handleSave = async () => {
    if (!onSave) return

    setIsSaving(true)
    try {
      await onSave({ visibility, requiresElderReview, culturalSensitivityLevel: culturalSensitivity })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save visibility settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const visibilityOptions = [
    {
      value: 'public' as const,
      icon: Globe2,
      label: 'Public',
      description: 'Anyone can discover and read your story',
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200'
    },
    {
      value: 'community' as const,
      icon: Users,
      label: 'Community',
      description: 'Only members of your communities/organizations can see this',
      color: 'text-sage-600',
      bgColor: 'bg-sage-50',
      borderColor: 'border-sage-200'
    },
    {
      value: 'private' as const,
      icon: EyeOff,
      label: 'Private',
      description: 'Only you can see this story (useful for drafts)',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    {
      value: 'restricted' as const,
      icon: Lock,
      label: 'Restricted',
      description: 'You manually approve each person who can access',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    }
  ]

  const culturalSensitivityOptions = [
    {
      value: 'none' as const,
      label: 'None',
      description: 'General audience content, no special considerations',
      color: 'text-gray-700'
    },
    {
      value: 'moderate' as const,
      label: 'Moderate',
      description: 'Some cultural context needed to understand fully',
      color: 'text-blue-700'
    },
    {
      value: 'high' as const,
      label: 'High',
      description: 'Culturally significant content, requires respect and context',
      color: 'text-clay-700'
    },
    {
      value: 'sacred' as const,
      label: 'Sacred',
      description: 'Ceremonial or sacred knowledge - Elder review required',
      color: 'text-ember-700'
    }
  ]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Visibility Level Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-sky-600" />
            Who Can See This Story?
          </CardTitle>
          <CardDescription>
            Control who has permission to view your story
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={visibility} onValueChange={handleVisibilityChange}>
            <div className="space-y-3">
              {visibilityOptions.map((option) => {
                const Icon = option.icon
                const isSelected = visibility === option.value

                return (
                  <label
                    key={option.value}
                    htmlFor={`visibility-${option.value}`}
                    className={cn(
                      'flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                      'hover:border-clay-300',
                      isSelected ? `${option.borderColor} ${option.bgColor}` : 'border-gray-200 bg-white'
                    )}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`visibility-${option.value}`}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={cn('h-5 w-5', isSelected ? option.color : 'text-gray-400')} />
                        <span className="font-semibold text-clay-900">{option.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className={cn('h-5 w-5 mt-1', option.color)} />
                    )}
                  </label>
                )
              })}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Cultural Sensitivity Level */}
      <Card className="border-clay-200 bg-clay-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-clay-600" />
            Cultural Sensitivity Level
          </CardTitle>
          <CardDescription>
            Indicate if this story contains culturally significant or sacred content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={culturalSensitivity} onValueChange={handleCulturalSensitivityChange}>
            <div className="space-y-2">
              {culturalSensitivityOptions.map((option) => {
                const isSelected = culturalSensitivity === option.value

                return (
                  <label
                    key={option.value}
                    htmlFor={`cultural-${option.value}`}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                      'hover:border-clay-300',
                      isSelected ? 'border-clay-300 bg-white' : 'border-clay-200 bg-white/50'
                    )}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`cultural-${option.value}`}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn('font-medium', option.color)}>{option.label}</span>
                        {option.value === 'sacred' && isSelected && (
                          <Badge variant="outline" className="bg-ember-50 text-ember-700 border-ember-300">
                            Elder Review Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-clay-600" />
                    )}
                  </label>
                )
              })}
            </div>
          </RadioGroup>

          {culturalSensitivity === 'sacred' && (
            <Alert className="mt-4 bg-ember-50 border-ember-300">
              <Shield className="h-4 w-4 text-ember-700" />
              <AlertDescription className="text-ember-800 text-sm">
                <strong>Sacred Content Protection:</strong> This story will automatically require Elder
                review before publication and will not be processed by AI systems.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Elder Review Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Elder Review</CardTitle>
          <CardDescription>
            Have community Elders review this story before making it visible to others
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-sage-50 rounded-lg border border-sage-200">
            <div className="flex-1">
              <Label htmlFor="elder-review-toggle" className="cursor-pointer font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-sage-600" />
                Request Elder Review
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {culturalSensitivity === 'sacred'
                  ? 'Required for sacred content'
                  : 'Optional - Elders will review before story is shared'}
              </p>
            </div>
            <Switch
              id="elder-review-toggle"
              checked={requiresElderReview || culturalSensitivity === 'sacred'}
              onCheckedChange={handleElderReviewToggle}
              disabled={culturalSensitivity === 'sacred'}
              className="data-[state=checked]:bg-sage-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Settings Summary */}
      <Alert className="bg-sky-50 border-sky-200">
        <Info className="h-4 w-4 text-sky-600" />
        <AlertDescription className="text-sky-800 text-sm">
          <strong>Current Settings:</strong> This story is <strong>{visibility}</strong>
          {culturalSensitivity !== 'none' && (
            <>, marked as <strong>{culturalSensitivity} cultural sensitivity</strong></>
          )}
          {requiresElderReview && <>, and requires Elder review before publication</>}.
        </AlertDescription>
      </Alert>

      {/* Save Button (optional) */}
      {showSaveButton && onSave && (
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Settings'}
            {saveSuccess && <CheckCircle2 className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      )}
    </div>
  )
}
