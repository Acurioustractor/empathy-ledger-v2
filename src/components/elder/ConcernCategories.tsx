'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { AlertTriangle } from 'lucide-react'

interface ConcernCategoriesProps {
  selectedConcerns: string[]
  onConcernsChange: (concerns: string[]) => void
}

const CONCERN_CATEGORIES = [
  {
    id: 'sacred_knowledge',
    label: 'Sacred Knowledge',
    description: 'Contains sacred or ceremonial information that should not be shared publicly'
  },
  {
    id: 'cultural_protocols',
    label: 'Cultural Protocols',
    description: 'Does not follow proper cultural protocols or permission processes'
  },
  {
    id: 'spiritual_content',
    label: 'Spiritual Content',
    description: 'Contains spiritual teachings that require Elder oversight or restricted access'
  },
  {
    id: 'family_consent',
    label: 'Family Consent',
    description: 'Mentions family members or ancestors without proper consent'
  },
  {
    id: 'location_sensitivity',
    label: 'Location Sensitivity',
    description: 'Reveals sacred site locations or culturally sensitive places'
  },
  {
    id: 'historical_accuracy',
    label: 'Historical Accuracy',
    description: 'Contains inaccurate or potentially harmful historical information'
  },
  {
    id: 'language_use',
    label: 'Language Use',
    description: 'Uses sacred language, names, or terms inappropriately'
  },
  {
    id: 'intellectual_property',
    label: 'Intellectual Property',
    description: 'May violate cultural intellectual property or traditional knowledge rights'
  },
  {
    id: 'community_representation',
    label: 'Community Representation',
    description: 'Misrepresents or stereotypes the community'
  },
  {
    id: 'trauma_content',
    label: 'Trauma Content',
    description: 'Contains traumatic or triggering content without proper warnings'
  },
  {
    id: 'external_attribution',
    label: 'External Attribution',
    description: 'Does not properly attribute sources, Elders, or knowledge keepers'
  },
  {
    id: 'seasonal_timing',
    label: 'Seasonal/Timing',
    description: 'Shares knowledge meant for specific seasons or ceremonial times'
  }
]

export function ConcernCategories({ selectedConcerns, onConcernsChange }: ConcernCategoriesProps) {
  const handleToggleConcern = (concernId: string) => {
    if (selectedConcerns.includes(concernId)) {
      onConcernsChange(selectedConcerns.filter(id => id !== concernId))
    } else {
      onConcernsChange([...selectedConcerns, concernId])
    }
  }

  return (
    <Card className="border-ember-600 bg-ember-50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-ember-600" />
          Cultural Concerns (Select all that apply)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {CONCERN_CATEGORIES.map((category) => (
            <div key={category.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
              <Checkbox
                id={category.id}
                checked={selectedConcerns.includes(category.id)}
                onCheckedChange={() => handleToggleConcern(category.id)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label
                  htmlFor={category.id}
                  className="font-medium cursor-pointer text-sm"
                >
                  {category.label}
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {category.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {selectedConcerns.length > 0 && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-ember-300">
            <p className="text-sm font-medium text-ember-900">
              {selectedConcerns.length} concern{selectedConcerns.length > 1 ? 's' : ''} selected
            </p>
            <p className="text-xs text-ember-700 mt-1">
              The storyteller will be notified of these concerns and given guidance on cultural protocols.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
