'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Plus,
  Target,
  TrendingUp,
  Users,
  MapPin,
  FileText,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Building2,
  Heart,
  Save,
  X,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

interface HarvestedOutcome {
  id: string
  created_at: string
  title: string
  description: string
  outcome_type: 'unexpected_benefit' | 'community_impact' | 'real_world_change' | 'policy_influence' | 'other'
  linked_stories: string[]
  people_affected: number
  geographic_scope: string
  time_lag_months: number
  evidence_urls: string[]
  evidence_description: string
  organization_id: string
  project_id?: string
}

interface HarvestedOutcomesDashboardProps {
  organizationId: string
  projectId?: string
}

export function HarvestedOutcomesDashboard({ organizationId, projectId }: HarvestedOutcomesDashboardProps) {
  const [outcomes, setOutcomes] = useState<HarvestedOutcome[]>([])
  const [selectedOutcome, setSelectedOutcome] = useState<HarvestedOutcome | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchOutcomes()
  }, [organizationId, projectId])

  const fetchOutcomes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('organization_id', organizationId)
      if (projectId) params.append('project_id', projectId)

      const response = await fetch(`/api/outcomes/harvested?${params}`)
      if (!response.ok) throw new Error('Failed to fetch outcomes')

      const data = await response.json()
      setOutcomes(data.outcomes || [])
    } catch (error) {
      console.error('Error fetching outcomes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveOutcome = async (outcomeData: Partial<HarvestedOutcome>) => {
    try {
      const url = isEditing && selectedOutcome
        ? `/api/outcomes/harvested/${selectedOutcome.id}`
        : '/api/outcomes/harvested'

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...outcomeData,
          organization_id: organizationId,
          project_id: projectId
        })
      })

      if (!response.ok) throw new Error('Failed to save outcome')

      await fetchOutcomes()
      setIsCreating(false)
      setIsEditing(false)
      setSelectedOutcome(null)
      alert('Outcome saved successfully!')
    } catch (error) {
      console.error('Error saving outcome:', error)
      alert('Failed to save outcome')
    }
  }

  const handleDeleteOutcome = async (outcomeId: string) => {
    if (!confirm('Are you sure you want to delete this outcome?')) return

    try {
      const response = await fetch(`/api/outcomes/harvested/${outcomeId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete')

      await fetchOutcomes()
      if (selectedOutcome?.id === outcomeId) setSelectedOutcome(null)
      alert('Outcome deleted successfully!')
    } catch (error) {
      console.error('Error deleting outcome:', error)
      alert('Failed to delete outcome')
    }
  }

  const filteredOutcomes = filter === 'all'
    ? outcomes
    : outcomes.filter(o => o.outcome_type === filter)

  const getOutcomeTypeIcon = (type: string) => {
    switch (type) {
      case 'unexpected_benefit': return <Sparkles className="w-4 h-4" />
      case 'community_impact': return <Users className="w-4 h-4" />
      case 'real_world_change': return <TrendingUp className="w-4 h-4" />
      case 'policy_influence': return <Building2 className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  const getOutcomeTypeColor = (type: string) => {
    switch (type) {
      case 'unexpected_benefit': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'community_impact': return 'bg-green-100 text-green-800 border-green-200'
      case 'real_world_change': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'policy_influence': return 'bg-amber-100 text-amber-800 border-amber-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clay-600"></div>
      </div>
    )
  }

  if (isCreating || isEditing) {
    return (
      <HarvestedOutcomeForm
        organizationId={organizationId}
        projectId={projectId}
        initialData={isEditing ? selectedOutcome : undefined}
        onSave={handleSaveOutcome}
        onCancel={() => {
          setIsCreating(false)
          setIsEditing(false)
          setSelectedOutcome(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Harvested Outcomes</h2>
          <p className="text-sm text-gray-600">
            Track unexpected benefits and real-world changes from storytelling
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="bg-clay-600 hover:bg-clay-700">
          <Plus className="w-4 h-4 mr-2" />
          New Outcome
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Outcomes</p>
                <p className="text-2xl font-bold text-gray-900">{outcomes.length}</p>
              </div>
              <Target className="w-8 h-8 text-clay-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">People Affected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {outcomes.reduce((sum, o) => sum + (o.people_affected || 0), 0).toLocaleString()}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Policy Influences</p>
                <p className="text-2xl font-bold text-gray-900">
                  {outcomes.filter(o => o.outcome_type === 'policy_influence').length}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Community Impacts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {outcomes.filter(o => o.outcome_type === 'community_impact').length}
                </p>
              </div>
              <Heart className="w-8 h-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium">Filter by type:</Label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All outcomes</SelectItem>
                <SelectItem value="unexpected_benefit">Unexpected Benefits</SelectItem>
                <SelectItem value="community_impact">Community Impacts</SelectItem>
                <SelectItem value="real_world_change">Real World Changes</SelectItem>
                <SelectItem value="policy_influence">Policy Influences</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Outcomes List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Outcomes ({filteredOutcomes.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredOutcomes.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No outcomes yet</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => setIsCreating(true)}>
                    Create First Outcome
                  </Button>
                </div>
              ) : (
                filteredOutcomes.map(outcome => (
                  <button
                    key={outcome.id}
                    onClick={() => setSelectedOutcome(outcome)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedOutcome?.id === outcome.id
                        ? 'bg-clay-50 border-clay-300 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-clay-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-medium text-sm text-gray-900 line-clamp-2">
                        {outcome.title}
                      </span>
                      <Badge className={`${getOutcomeTypeColor(outcome.outcome_type)} text-xs flex items-center gap-1`}>
                        {getOutcomeTypeIcon(outcome.outcome_type)}
                      </Badge>
                    </div>
                    {outcome.people_affected > 0 && (
                      <div className="text-xs text-gray-600 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {outcome.people_affected.toLocaleString()} people affected
                      </div>
                    )}
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedOutcome ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedOutcome.title}</CardTitle>
                    <CardDescription>
                      Created {new Date(selectedOutcome.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(true)
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteOutcome(selectedOutcome.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold">Description</Label>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{selectedOutcome.description}</p>
                </div>

                {selectedOutcome.people_affected > 0 && (
                  <div>
                    <Label className="text-sm font-semibold">People Affected</Label>
                    <p className="text-sm text-gray-700 mt-1">{selectedOutcome.people_affected.toLocaleString()} people</p>
                  </div>
                )}

                {selectedOutcome.geographic_scope && (
                  <div>
                    <Label className="text-sm font-semibold">Geographic Scope</Label>
                    <p className="text-sm text-gray-700 mt-1">{selectedOutcome.geographic_scope}</p>
                  </div>
                )}

                {selectedOutcome.time_lag_months > 0 && (
                  <div>
                    <Label className="text-sm font-semibold">Time Lag</Label>
                    <p className="text-sm text-gray-700 mt-1">{selectedOutcome.time_lag_months} months after storytelling</p>
                  </div>
                )}

                {selectedOutcome.evidence_description && (
                  <div>
                    <Label className="text-sm font-semibold">Evidence</Label>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{selectedOutcome.evidence_description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select an outcome to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// Simple form component
function HarvestedOutcomeForm({ organizationId, projectId, initialData, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    outcome_type: initialData?.outcome_type || 'unexpected_benefit',
    people_affected: initialData?.people_affected || 0,
    geographic_scope: initialData?.geographic_scope || '',
    time_lag_months: initialData?.time_lag_months || 0,
    evidence_description: initialData?.evidence_description || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{initialData ? 'Edit' : 'New'} Harvested Outcome</h2>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" className="bg-clay-600 hover:bg-clay-700">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label htmlFor="title">Outcome Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief title for this outcome"
              required
            />
          </div>

          <div>
            <Label htmlFor="outcome_type">Outcome Type *</Label>
            <Select
              value={formData.outcome_type}
              onValueChange={(value) => setFormData({ ...formData, outcome_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unexpected_benefit">Unexpected Benefit</SelectItem>
                <SelectItem value="community_impact">Community Impact</SelectItem>
                <SelectItem value="real_world_change">Real World Change</SelectItem>
                <SelectItem value="policy_influence">Policy Influence</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the outcome in detail..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="people_affected">People Affected</Label>
              <Input
                id="people_affected"
                type="number"
                min="0"
                value={formData.people_affected}
                onChange={(e) => setFormData({ ...formData, people_affected: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label htmlFor="time_lag_months">Time Lag (months)</Label>
              <Input
                id="time_lag_months"
                type="number"
                min="0"
                value={formData.time_lag_months}
                onChange={(e) => setFormData({ ...formData, time_lag_months: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="geographic_scope">Geographic Scope</Label>
            <Input
              id="geographic_scope"
              value={formData.geographic_scope}
              onChange={(e) => setFormData({ ...formData, geographic_scope: e.target.value })}
              placeholder="e.g., Local community, Regional, National"
            />
          </div>

          <div>
            <Label htmlFor="evidence_description">Evidence Description</Label>
            <Textarea
              id="evidence_description"
              value={formData.evidence_description}
              onChange={(e) => setFormData({ ...formData, evidence_description: e.target.value })}
              placeholder="Describe the evidence supporting this outcome..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
