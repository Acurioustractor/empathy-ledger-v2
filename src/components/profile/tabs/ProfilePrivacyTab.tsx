'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Eye,
  EyeOff,
  Globe,
  Users,
  Lock,
  Shield,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

interface PrivacySettings {
  profile_visibility: 'public' | 'community' | 'private'
  show_email: boolean
  show_phone: boolean
  show_location: boolean
  show_cultural_background: boolean
  show_languages: boolean
  show_organizations: boolean
  show_projects: boolean
  allow_messages: boolean
  allow_story_requests: boolean
  show_in_storyteller_directory: boolean
}

interface ConsentPreferences {
  data_collection: boolean
  analytics: boolean
  cultural_data_sharing: boolean
  third_party_sharing: boolean
  marketing_communications: boolean
}

interface ProfilePrivacyTabProps {
  isEditing: boolean
  privacySettings: PrivacySettings
  consentPreferences: ConsentPreferences
  onPrivacyChange: (field: string, value: any) => void
  onConsentChange: (field: string, value: boolean) => void
}

export function ProfilePrivacyTab({
  isEditing,
  privacySettings,
  consentPreferences,
  onPrivacyChange,
  onConsentChange
}: ProfilePrivacyTabProps) {

  const visibilityOptions = [
    {
      value: 'public',
      label: 'Public',
      description: 'Visible to everyone, including search engines',
      icon: <Globe className="w-4 h-4" />
    },
    {
      value: 'community',
      label: 'Community Only',
      description: 'Visible to authenticated users and organization members',
      icon: <Users className="w-4 h-4" />
    },
    {
      value: 'private',
      label: 'Private',
      description: 'Only visible to you and administrators',
      icon: <Lock className="w-4 h-4" />
    }
  ]

  const currentVisibility = visibilityOptions.find(
    opt => opt.value === privacySettings.profile_visibility
  ) || visibilityOptions[1]

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'bg-green-100 text-green-800 border-green-200'
      case 'community': return 'bg-sage-100 text-sage-800 border-sage-200'
      case 'private': return 'bg-stone-100 text-stone-800 border-stone-200'
      default: return 'bg-stone-100 text-stone-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-earth-600" />
          Privacy & Consent
        </h3>
        <p className="text-sm text-stone-600 mt-1">
          Control who can see your information and how your data is used
        </p>
      </div>

      {/* Current Status Alert */}
      <Alert className={getVisibilityColor(privacySettings.profile_visibility)}>
        <div className="flex items-center gap-2">
          {currentVisibility.icon}
          <AlertDescription>
            <strong>Your profile is {currentVisibility.label}</strong>
            <br />
            <span className="text-sm">{currentVisibility.description}</span>
          </AlertDescription>
        </div>
      </Alert>

      {/* Overall Profile Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile Visibility</CardTitle>
          <CardDescription>
            Set the default visibility for your entire profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <Select
              value={privacySettings.profile_visibility}
              onValueChange={(value) => onPrivacyChange('profile_visibility', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {visibilityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-stone-600">{option.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="p-4 bg-stone-50 rounded-lg border">
              <div className="flex items-center gap-3">
                {currentVisibility.icon}
                <div>
                  <div className="font-medium">{currentVisibility.label}</div>
                  <div className="text-sm text-stone-600">{currentVisibility.description}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Granular Field Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">What Information to Share</CardTitle>
          <CardDescription>
            Fine-tune what specific information is visible in your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              { field: 'show_email', label: 'Email Address', icon: <Eye className="w-4 h-4" /> },
              { field: 'show_phone', label: 'Phone Number', icon: <Eye className="w-4 h-4" /> },
              { field: 'show_location', label: 'Location Information', icon: <Eye className="w-4 h-4" /> },
              { field: 'show_cultural_background', label: 'Cultural Background', icon: <Eye className="w-4 h-4" /> },
              { field: 'show_languages', label: 'Languages Spoken', icon: <Eye className="w-4 h-4" /> },
              { field: 'show_organizations', label: 'Organization Memberships', icon: <Eye className="w-4 h-4" /> },
              { field: 'show_projects', label: 'Project Participations', icon: <Eye className="w-4 h-4" /> }
            ].map((item) => (
              <div key={item.field} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {item.icon}
                  <Label htmlFor={item.field} className="cursor-pointer">
                    {item.label}
                  </Label>
                </div>
                {isEditing ? (
                  <Switch
                    id={item.field}
                    checked={privacySettings[item.field as keyof PrivacySettings] as boolean}
                    onCheckedChange={(checked) => onPrivacyChange(item.field, checked)}
                  />
                ) : (
                  <Badge variant={privacySettings[item.field as keyof PrivacySettings] ? 'default' : 'outline'}>
                    {privacySettings[item.field as keyof PrivacySettings] ? (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        Visible
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" />
                        Hidden
                      </>
                    )}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interaction Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Interaction Preferences</CardTitle>
          <CardDescription>
            Control how others can interact with you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              { field: 'allow_messages', label: 'Allow Messages', description: 'Let community members send you messages' },
              { field: 'allow_story_requests', label: 'Allow Story Requests', description: 'Accept requests to contribute stories' },
              { field: 'show_in_storyteller_directory', label: 'Show in Storyteller Directory', description: 'Appear in public storyteller listings' }
            ].map((item) => (
              <div key={item.field} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                <div>
                  <Label htmlFor={item.field} className="cursor-pointer font-medium">
                    {item.label}
                  </Label>
                  <p className="text-xs text-stone-600 mt-1">{item.description}</p>
                </div>
                {isEditing ? (
                  <Switch
                    id={item.field}
                    checked={privacySettings[item.field as keyof PrivacySettings] as boolean}
                    onCheckedChange={(checked) => onPrivacyChange(item.field, checked)}
                  />
                ) : (
                  <Badge variant={privacySettings[item.field as keyof PrivacySettings] ? 'default' : 'outline'}>
                    {privacySettings[item.field as keyof PrivacySettings] ? 'Enabled' : 'Disabled'}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Consent */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data & Consent</CardTitle>
          <CardDescription>
            Manage your consent for data collection and usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              { field: 'data_collection', label: 'Essential Data Collection', description: 'Required for platform functionality', required: true },
              { field: 'analytics', label: 'Analytics & Performance', description: 'Help us improve the platform' },
              { field: 'cultural_data_sharing', label: 'Cultural Data Sharing', description: 'Share cultural insights with research partners' },
              { field: 'third_party_sharing', label: 'Third-Party Integrations', description: 'Allow approved third-party services' },
              { field: 'marketing_communications', label: 'Marketing Communications', description: 'Receive updates and newsletters' }
            ].map((item) => (
              <div key={item.field} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`consent-${item.field}`} className="cursor-pointer font-medium">
                      {item.label}
                    </Label>
                    {item.required && (
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 mt-1">{item.description}</p>
                </div>
                {isEditing && !item.required ? (
                  <Switch
                    id={`consent-${item.field}`}
                    checked={consentPreferences[item.field as keyof ConsentPreferences]}
                    onCheckedChange={(checked) => onConsentChange(item.field, checked)}
                  />
                ) : (
                  <Badge variant={consentPreferences[item.field as keyof ConsentPreferences] || item.required ? 'default' : 'outline'}>
                    {consentPreferences[item.field as keyof ConsentPreferences] || item.required ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Granted
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" />
                        Declined
                      </>
                    )}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cultural Data Notice */}
      <Alert className="bg-amber-50 border-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <AlertDescription className="text-sm text-stone-700">
          <strong>Cultural Data Protection:</strong> Your cultural information is handled with special care.
          Traditional knowledge and cultural practices are protected according to Indigenous data sovereignty principles.
        </AlertDescription>
      </Alert>

      {/* Information */}
      <Card className="bg-clay-50 border-clay-200">
        <CardContent className="p-4 text-sm text-stone-700 space-y-2">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-clay-700 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p><strong>Understanding Privacy Levels:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li><strong>Public:</strong> Anyone can see this information, including search engines</li>
                <li><strong>Community:</strong> Only authenticated users in your organizations can see this</li>
                <li><strong>Private:</strong> Only you and system administrators can see this</li>
              </ul>
              <p className="text-xs mt-2 text-stone-600">
                You can change these settings at any time. Some fields may override your general visibility setting.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
