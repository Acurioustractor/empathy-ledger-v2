// All interpretation session sub-components in one file for efficiency

'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, X, FileText, Users, MessageSquare, Lightbulb, AlertCircle, MapPin } from 'lucide-react'

// ===== Story Selection =====
interface StorySelectionProps {
  organizationId: string
  projectId?: string
  selectedStories: string[]
  onChange: (stories: string[]) => void
}

export function StorySelection({ organizationId, projectId, selectedStories, onChange }: StorySelectionProps) {
  const [stories, setStories] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchStories()
  }, [organizationId, projectId])

  const fetchStories = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('organization_id', organizationId)
      if (projectId) params.append('project_id', projectId)

      const response = await fetch(`/api/stories?${params}`)
      const data = await response.json()
      setStories(data.stories || [])
    } catch (error) {
      console.error('Error fetching stories:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleStory = (storyId: string) => {
    if (selectedStories.includes(storyId)) {
      onChange(selectedStories.filter(id => id !== storyId))
    } else {
      onChange([...selectedStories, storyId])
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-clay-600" />
          Story Selection
        </CardTitle>
        <CardDescription>
          Select stories that were discussed in this interpretation session
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clay-600 mx-auto"></div>
          </div>
        ) : stories.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No stories available</p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {stories.map(story => (
              <div
                key={story.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Checkbox
                  checked={selectedStories.includes(story.id)}
                  onCheckedChange={() => toggleStory(story.id)}
                />
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">{story.title}</div>
                  <div className="text-xs text-gray-500">{story.storyteller_name}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 text-sm text-gray-600">
          {selectedStories.length} {selectedStories.length === 1 ? 'story' : 'stories'} selected
        </div>
      </CardContent>
    </Card>
  )
}

// ===== Key Interpretations =====
interface KeyInterpretationsProps {
  interpretations: string[]
  onChange: (interpretations: string[]) => void
}

export function KeyInterpretations({ interpretations, onChange }: KeyInterpretationsProps) {
  const addInterpretation = () => {
    onChange([...interpretations, ''])
  }

  const updateInterpretation = (index: number, value: string) => {
    const updated = [...interpretations]
    updated[index] = value
    onChange(updated)
  }

  const removeInterpretation = (index: number) => {
    onChange(interpretations.filter((_, i) => i !== index))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-clay-600" />
          Key Interpretations
        </CardTitle>
        <CardDescription>
          What were the main insights and interpretations that emerged?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {interpretations.map((interpretation, index) => (
          <div key={index} className="flex items-start gap-2">
            <Textarea
              value={interpretation}
              onChange={(e) => updateInterpretation(index, e.target.value)}
              placeholder="Enter a key interpretation..."
              rows={2}
              className="flex-1"
            />
            {interpretations.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeInterpretation(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addInterpretation}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Interpretation
        </Button>
      </CardContent>
    </Card>
  )
}

// ===== Consensus Points =====
export function ConsensusPoints({ points, onChange }: { points: string[], onChange: (points: string[]) => void }) {
  const addPoint = () => onChange([...points, ''])
  const updatePoint = (index: number, value: string) => {
    const updated = [...points]
    updated[index] = value
    onChange(updated)
  }
  const removePoint = (index: number) => onChange(points.filter((_, i) => i !== index))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-sage-600" />
          Consensus Points
        </CardTitle>
        <CardDescription>
          Areas where the group reached agreement or shared understanding
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {points.map((point, index) => (
          <div key={index} className="flex items-start gap-2">
            <Textarea
              value={point}
              onChange={(e) => updatePoint(index, e.target.value)}
              placeholder="Enter a consensus point..."
              rows={2}
              className="flex-1"
            />
            {points.length > 1 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => removePoint(index)}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addPoint} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Consensus Point
        </Button>
      </CardContent>
    </Card>
  )
}

// ===== Divergent Views =====
export function DivergentViews({ views, onChange }: { views: string[], onChange: (views: string[]) => void }) {
  const addView = () => onChange([...views, ''])
  const updateView = (index: number, value: string) => {
    const updated = [...views]
    updated[index] = value
    onChange(updated)
  }
  const removeView = (index: number) => onChange(views.filter((_, i) => i !== index))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-600" />
          Divergent Views
        </CardTitle>
        <CardDescription>
          Different perspectives or interpretations that emerged (optional)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {views.length === 0 || (views.length === 1 && !views[0]) ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 mb-3">No divergent views recorded</p>
            <Button type="button" variant="outline" size="sm" onClick={addView}>
              <Plus className="w-4 h-4 mr-2" />
              Add Divergent View
            </Button>
          </div>
        ) : (
          <>
            {views.map((view, index) => (
              <div key={index} className="flex items-start gap-2">
                <Textarea
                  value={view}
                  onChange={(e) => updateView(index, e.target.value)}
                  placeholder="Describe a different perspective..."
                  rows={2}
                  className="flex-1"
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeView(index)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addView} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Another View
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ===== Cultural Context =====
export function CulturalContext({ context, onChange }: { context: string, onChange: (context: string) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-clay-600" />
          Cultural Context
        </CardTitle>
        <CardDescription>
          Important cultural context or considerations that emerged
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          value={context}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe the cultural context, protocols observed, or important cultural considerations..."
          rows={6}
        />
      </CardContent>
    </Card>
  )
}

// ===== Recommendations =====
export function Recommendations({ recommendations, onChange }: { recommendations: string[], onChange: (recommendations: string[]) => void }) {
  const addRecommendation = () => onChange([...recommendations, ''])
  const updateRecommendation = (index: number, value: string) => {
    const updated = [...recommendations]
    updated[index] = value
    onChange(updated)
  }
  const removeRecommendation = (index: number) => onChange(recommendations.filter((_, i) => i !== index))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-sky-600" />
          Recommendations
        </CardTitle>
        <CardDescription>
          Actions or next steps recommended by the group
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, index) => (
          <div key={index} className="flex items-start gap-2">
            <Textarea
              value={rec}
              onChange={(e) => updateRecommendation(index, e.target.value)}
              placeholder="Enter a recommendation..."
              rows={2}
              className="flex-1"
            />
            {recommendations.length > 1 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => removeRecommendation(index)}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addRecommendation} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Recommendation
        </Button>
      </CardContent>
    </Card>
  )
}

// ===== Session Summary =====
export function SessionSummary({ session }: { session: any }) {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-gray-600">Facilitator</Label>
          <p className="font-medium text-gray-900">{session.facilitator_name}</p>
        </div>
        <div>
          <Label className="text-sm text-gray-600">Participants</Label>
          <p className="font-medium text-gray-900">{session.participant_count} people</p>
        </div>
      </div>

      {/* Key Interpretations */}
      {session.key_interpretations && session.key_interpretations.length > 0 && (
        <div>
          <Label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-clay-600" />
            Key Interpretations
          </Label>
          <ul className="space-y-2">
            {session.key_interpretations.map((interp: string, i: number) => (
              <li key={i} className="text-sm text-gray-700 pl-4 border-l-2 border-clay-300">
                {interp}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Consensus Points */}
      {session.consensus_points && session.consensus_points.length > 0 && (
        <div>
          <Label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-sage-600" />
            Consensus Points
          </Label>
          <ul className="space-y-2">
            {session.consensus_points.map((point: string, i: number) => (
              <li key={i} className="text-sm text-gray-700 pl-4 border-l-2 border-sage-300">
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Divergent Views */}
      {session.divergent_views && session.divergent_views.length > 0 && (
        <div>
          <Label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-600" />
            Divergent Views
          </Label>
          <ul className="space-y-2">
            {session.divergent_views.map((view: string, i: number) => (
              <li key={i} className="text-sm text-gray-700 pl-4 border-l-2 border-amber-300">
                {view}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cultural Context */}
      {session.cultural_context && (
        <div>
          <Label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-clay-600" />
            Cultural Context
          </Label>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{session.cultural_context}</p>
        </div>
      )}

      {/* Recommendations */}
      {session.recommendations && session.recommendations.length > 0 && (
        <div>
          <Label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-sky-600" />
            Recommendations
          </Label>
          <ul className="space-y-2">
            {session.recommendations.map((rec: string, i: number) => (
              <li key={i} className="text-sm text-gray-700 pl-4 border-l-2 border-sky-300">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
