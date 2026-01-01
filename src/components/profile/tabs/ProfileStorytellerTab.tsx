'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Eye,
  Shield,
  Crown,
  Sparkles,
  BookOpen,
  Users,
  ExternalLink,
  Info
} from 'lucide-react'

interface ProfileStorytellerTabProps {
  isEditing: boolean
  isStoryteller: boolean
  isElder: boolean
  traditionalKnowledgeKeeper: boolean
  storytellingExperience: string
  specialties: string[]
  preferredTopics: string[]
  storytellingStyle: string[]
  availabilityStatus: string
  yearsOfExperience: number
  onFieldChange: (field: string, value: any) => void
}

export function ProfileStorytellerTab({
  isEditing,
  isStoryteller,
  isElder,
  traditionalKnowledgeKeeper,
  storytellingExperience,
  specialties = [],
  preferredTopics = [],
  storytellingStyle = [],
  availabilityStatus,
  yearsOfExperience,
  onFieldChange
}: ProfileStorytellerTabProps) {

  const experienceLevels = [
    { value: 'beginner', label: 'Beginning My Journey (0-2 years)' },
    { value: 'developing', label: 'Developing Skills (3-5 years)' },
    { value: 'experienced', label: 'Experienced (6-10 years)' },
    { value: 'seasoned', label: 'Seasoned Storyteller (11-20 years)' },
    { value: 'elder', label: 'Elder/Master Storyteller (20+ years)' }
  ]

  const availabilityOptions = [
    { value: 'available', label: 'Available for New Stories' },
    { value: 'limited', label: 'Limited Availability' },
    { value: 'unavailable', label: 'Not Currently Available' }
  ]

  const commonStyles = [
    'Traditional Oral',
    'Written Narrative',
    'Visual Storytelling',
    'Performance',
    'Interactive',
    'Digital Media'
  ]

  const commonTopics = [
    'Cultural Heritage',
    'Traditional Knowledge',
    'Land & Territory',
    'Language Revitalization',
    'Community History',
    'Personal Journey',
    'Contemporary Issues',
    'Healing & Wellness'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-grey-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-earth-600" />
          Storyteller Profile
        </h3>
        <p className="text-sm text-grey-600 mt-1">
          This information appears on your public storyteller profile page
        </p>
      </div>

      {/* Public Profile Notice */}
      <Alert className="bg-blue-50 border-blue-200">
        <Eye className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-sm text-grey-700">
          <strong>Public Information:</strong> Everything on this page is visible to the community.
          Use the Privacy tab to control what other profile information is shared.
        </AlertDescription>
      </Alert>

      {/* Storyteller Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Storyteller Status</CardTitle>
          <CardDescription>Your role and recognition in the community</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Active Storyteller */}
          <div className="flex items-center justify-between p-4 bg-sage-50 rounded-lg border border-sage-200">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-earth-600" />
              <div>
                <p className="font-medium text-grey-900">Active Storyteller</p>
                <p className="text-sm text-grey-600">Your profile appears in storyteller listings</p>
              </div>
            </div>
            {isEditing ? (
              <Switch
                checked={isStoryteller}
                onCheckedChange={(checked) => onFieldChange('is_storyteller', checked)}
              />
            ) : (
              <Badge variant={isStoryteller ? 'default' : 'outline'}>
                {isStoryteller ? 'Active' : 'Inactive'}
              </Badge>
            )}
          </div>

          {/* Elder Status */}
          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-grey-900">Elder Status</p>
                <p className="text-sm text-grey-600">Recognized community elder</p>
              </div>
            </div>
            {isEditing ? (
              <Switch
                checked={isElder}
                onCheckedChange={(checked) => onFieldChange('is_elder', checked)}
              />
            ) : (
              <Badge variant={isElder ? 'default' : 'outline'} className="bg-amber-100 text-amber-800">
                {isElder ? 'Elder' : 'Not Elder'}
              </Badge>
            )}
          </div>

          {/* Traditional Knowledge Keeper */}
          <div className="flex items-center justify-between p-4 bg-clay-50 rounded-lg border border-clay-200">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-clay-700" />
              <div>
                <p className="font-medium text-grey-900">Traditional Knowledge Keeper</p>
                <p className="text-sm text-grey-600">Holder of traditional cultural knowledge</p>
              </div>
            </div>
            {isEditing ? (
              <Switch
                checked={traditionalKnowledgeKeeper}
                onCheckedChange={(checked) => onFieldChange('traditional_knowledge_keeper', checked)}
              />
            ) : (
              <Badge variant={traditionalKnowledgeKeeper ? 'default' : 'outline'} className="bg-clay-200 text-clay-900">
                {traditionalKnowledgeKeeper ? 'Knowledge Keeper' : 'No'}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Storytelling Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Experience & Availability</CardTitle>
          <CardDescription>Help others understand your storytelling journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="experience-level">Experience Level</Label>
            {isEditing ? (
              <Select
                value={storytellingExperience}
                onValueChange={(value) => onFieldChange('storytelling_experience', value)}
              >
                <SelectTrigger id="experience-level">
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-grey-900 py-2">
                {experienceLevels.find(l => l.value === storytellingExperience)?.label || 'Not specified'}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="years-experience">Years of Experience</Label>
            {isEditing ? (
              <Input
                id="years-experience"
                type="number"
                min="0"
                value={yearsOfExperience}
                onChange={(e) => onFieldChange('years_of_experience', parseInt(e.target.value))}
              />
            ) : (
              <p className="text-grey-900 py-2">{yearsOfExperience || 0} years</p>
            )}
          </div>

          <div>
            <Label htmlFor="availability">Availability Status</Label>
            {isEditing ? (
              <Select
                value={availabilityStatus}
                onValueChange={(value) => onFieldChange('availability_status', value)}
              >
                <SelectTrigger id="availability">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  {availabilityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-grey-900 py-2">
                {availabilityOptions.find(o => o.value === availabilityStatus)?.label || 'Not specified'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Storytelling Styles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Storytelling Styles</CardTitle>
          <CardDescription>How you prefer to share stories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {commonStyles.map((style) => {
              const isSelected = storytellingStyle.includes(style)
              return isEditing ? (
                <Badge
                  key={style}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const newStyles = isSelected
                      ? storytellingStyle.filter(s => s !== style)
                      : [...storytellingStyle, style]
                    onFieldChange('storytelling_style', newStyles)
                  }}
                >
                  {style}
                </Badge>
              ) : isSelected ? (
                <Badge key={style} variant="secondary">{style}</Badge>
              ) : null
            })}
            {!isEditing && storytellingStyle.length === 0 && (
              <p className="text-grey-500 text-sm">No styles specified</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preferred Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferred Topics</CardTitle>
          <CardDescription>The themes and subjects you're most passionate about</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {commonTopics.map((topic) => {
              const isSelected = preferredTopics.includes(topic)
              return isEditing ? (
                <Badge
                  key={topic}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const newTopics = isSelected
                      ? preferredTopics.filter(t => t !== topic)
                      : [...preferredTopics, topic]
                    onFieldChange('preferred_topics', newTopics)
                  }}
                >
                  {topic}
                </Badge>
              ) : isSelected ? (
                <Badge key={topic} variant="secondary">{topic}</Badge>
              ) : null
            })}
            {!isEditing && preferredTopics.length === 0 && (
              <p className="text-grey-500 text-sm">No topics specified</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Public Profile */}
      {isStoryteller && (
        <Card className="bg-earth-50 border-earth-200">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-earth-600" />
              <div>
                <p className="font-medium text-grey-900">View Your Public Profile</p>
                <p className="text-sm text-grey-600">See how others see your storyteller profile</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Profile
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
