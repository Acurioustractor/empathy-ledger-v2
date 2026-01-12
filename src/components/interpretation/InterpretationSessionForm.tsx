'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Users, FileText, MessageSquare, Lightbulb, AlertCircle, Save, X } from 'lucide-react'
import { StorySelection } from './StorySelection'
import { KeyInterpretations } from './KeyInterpretations'
import { ConsensusPoints } from './ConsensusPoints'
import { DivergentViews } from './DivergentViews'
import { CulturalContext } from './CulturalContext'
import { Recommendations } from './Recommendations'

interface InterpretationSessionFormProps {
  organizationId: string
  projectId?: string
  initialData?: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function InterpretationSessionForm({
  organizationId,
  projectId,
  initialData,
  onSubmit,
  onCancel
}: InterpretationSessionFormProps) {
  const [formData, setFormData] = useState({
    session_date: initialData?.session_date || new Date().toISOString().split('T')[0],
    facilitator_name: initialData?.facilitator_name || '',
    participant_count: initialData?.participant_count || 0,
    selected_stories: initialData?.selected_stories || [],
    key_interpretations: initialData?.key_interpretations || [''],
    consensus_points: initialData?.consensus_points || [''],
    divergent_views: initialData?.divergent_views || [''],
    cultural_context: initialData?.cultural_context || '',
    recommendations: initialData?.recommendations || ['']
  })

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 7

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Clean up empty arrays
    const cleanedData = {
      ...formData,
      key_interpretations: formData.key_interpretations.filter(i => i.trim()),
      consensus_points: formData.consensus_points.filter(p => p.trim()),
      divergent_views: formData.divergent_views.filter(v => v.trim()),
      recommendations: formData.recommendations.filter(r => r.trim()),
      stories_discussed: formData.selected_stories.length
    }

    onSubmit(cleanedData)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.session_date && formData.facilitator_name && formData.participant_count > 0
      case 2:
        return formData.selected_stories.length > 0
      case 3:
        return formData.key_interpretations.some(i => i.trim())
      default:
        return true
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? 'Edit' : 'New'} Interpretation Session
          </h2>
          <p className="text-sm text-gray-600">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-clay-600 hover:bg-clay-700"
            disabled={!canProceed()}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Session
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex-1">
                <div
                  className={`h-2 rounded-full transition-all ${
                    i + 1 <= currentStep ? 'bg-clay-600' : 'bg-gray-200'
                  }`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Session Details */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-clay-600" />
              Session Details
            </CardTitle>
            <CardDescription>Basic information about the interpretation session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="session_date">Session Date *</Label>
              <Input
                id="session_date"
                type="date"
                value={formData.session_date}
                onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="facilitator_name">Facilitator Name *</Label>
              <Input
                id="facilitator_name"
                value={formData.facilitator_name}
                onChange={(e) => setFormData({ ...formData, facilitator_name: e.target.value })}
                placeholder="Name of session facilitator"
                required
              />
            </div>

            <div>
              <Label htmlFor="participant_count">Number of Participants *</Label>
              <Input
                id="participant_count"
                type="number"
                min="1"
                value={formData.participant_count}
                onChange={(e) => setFormData({ ...formData, participant_count: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Story Selection */}
      {currentStep === 2 && (
        <StorySelection
          organizationId={organizationId}
          projectId={projectId}
          selectedStories={formData.selected_stories}
          onChange={(stories) => setFormData({ ...formData, selected_stories: stories })}
        />
      )}

      {/* Step 3: Key Interpretations */}
      {currentStep === 3 && (
        <KeyInterpretations
          interpretations={formData.key_interpretations}
          onChange={(interpretations) => setFormData({ ...formData, key_interpretations: interpretations })}
        />
      )}

      {/* Step 4: Consensus Points */}
      {currentStep === 4 && (
        <ConsensusPoints
          points={formData.consensus_points}
          onChange={(points) => setFormData({ ...formData, consensus_points: points })}
        />
      )}

      {/* Step 5: Divergent Views */}
      {currentStep === 5 && (
        <DivergentViews
          views={formData.divergent_views}
          onChange={(views) => setFormData({ ...formData, divergent_views: views })}
        />
      )}

      {/* Step 6: Cultural Context */}
      {currentStep === 6 && (
        <CulturalContext
          context={formData.cultural_context}
          onChange={(context) => setFormData({ ...formData, cultural_context: context })}
        />
      )}

      {/* Step 7: Recommendations */}
      {currentStep === 7 && (
        <Recommendations
          recommendations={formData.recommendations}
          onChange={(recommendations) => setFormData({ ...formData, recommendations })}
        />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>

        {currentStep < totalSteps ? (
          <Button
            type="button"
            onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
            disabled={!canProceed()}
            className="bg-clay-600 hover:bg-clay-700"
          >
            Next
          </Button>
        ) : (
          <Button
            type="submit"
            className="bg-clay-600 hover:bg-clay-700"
            disabled={!canProceed()}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Session
          </Button>
        )}
      </div>
    </form>
  )
}
