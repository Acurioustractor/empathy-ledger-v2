'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import SeedInterviewWizard from './SeedInterviewWizard'
import DocumentImportDialog from './DocumentImportDialog'
import {
  FileText,
  MessageSquare,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Calendar
} from 'lucide-react'

interface OrganizationContext {
  id: string
  organization_id: string
  mission: string | null
  vision: string | null
  values: string[] | null
  approach_description: string | null
  cultural_frameworks: string[] | null
  key_principles: string[] | null
  impact_philosophy: string | null
  impact_domains: {
    individual?: string[]
    family?: string[]
    community?: string[]
    systems?: string[]
  } | null
  measurement_approach: string | null
  website: string | null
  context_type: 'manual' | 'seed_interview' | 'imported' | 'quick'
  extraction_quality_score: number | null
  ai_model_used: string | null
  created_at: string
  updated_at: string
}

interface OrganizationContextManagerProps {
  organizationId: string
  canEdit: boolean
}

export default function OrganizationContextManager({
  organizationId,
  canEdit
}: OrganizationContextManagerProps) {
  const [context, setContext] = useState<OrganizationContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editedContext, setEditedContext] = useState<Partial<OrganizationContext>>({})
  const [showSeedInterview, setShowSeedInterview] = useState(false)
  const [showDocumentImport, setShowDocumentImport] = useState(false)

  useEffect(() => {
    fetchContext()
  }, [organizationId])

  const fetchContext = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/organizations/${organizationId}/context`)
      const data = await response.json()

      if (data.exists) {
        setContext(data.context)
      }
    } catch (err) {
      setError('Failed to load organization context')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditedContext(context || {})
    setEditing(true)
  }

  const handleCancel = () => {
    setEditedContext({})
    setEditing(false)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      const method = context ? 'PATCH' : 'POST'
      const response = await fetch(`/api/organizations/${organizationId}/context`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedContext)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save context')
      }

      const data = await response.json()
      setContext(data.context)
      setEditing(false)
      setEditedContext({})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save context')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof OrganizationContext, value: any) => {
    setEditedContext(prev => ({ ...prev, [field]: value }))
  }

  const addArrayItem = (field: 'values' | 'cultural_frameworks' | 'key_principles', value: string) => {
    if (!value.trim()) return

    const currentArray = editedContext[field] || context?.[field] || []
    updateField(field, [...currentArray, value.trim()])
  }

  const removeArrayItem = (field: 'values' | 'cultural_frameworks' | 'key_principles', index: number) => {
    const currentArray = editedContext[field] || context?.[field] || []
    updateField(field, currentArray.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    )
  }

  if (!context && !editing) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-blue-100 p-3">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">No Context Defined Yet</h3>
            <p className="text-gray-600 mb-4">
              Add your organization's context to enable project-specific impact analysis and better AI insights.
            </p>
          </div>
          {canEdit && (
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Create Context Manually
              </Button>
              <Button variant="outline" onClick={() => setShowSeedInterview(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Seed Interview
              </Button>
              <Button variant="outline" onClick={() => setShowDocumentImport(true)}>
                <FileText className="h-4 w-4 mr-2" />
                Import Document
              </Button>
            </div>
          )}
        </div>
      </Card>
    )
  }

  const displayContext = editing ? editedContext : context

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {context && context.extraction_quality_score && context.extraction_quality_score < 60 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This context was extracted with low confidence ({context.extraction_quality_score}%).
            Please review and update as needed.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Organization Context</h2>
            {context && (
              <Badge variant={context.context_type === 'manual' ? 'secondary' : 'default'}>
                {context.context_type === 'seed_interview' && 'From Seed Interview'}
                {context.context_type === 'imported' && 'Imported'}
                {context.context_type === 'manual' && 'Manual'}
              </Badge>
            )}
            {context?.extraction_quality_score && (
              <Badge variant={context.extraction_quality_score >= 80 ? 'default' : 'secondary'}>
                {context.extraction_quality_score}% Quality
              </Badge>
            )}
          </div>
          {canEdit && (
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button onClick={handleCancel} variant="outline" disabled={saving}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Context
                </Button>
              )}
            </div>
          )}
        </div>

        <Tabs defaultValue="core" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="core">Core Identity</TabsTrigger>
            <TabsTrigger value="approach">Approach</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>

          <TabsContent value="core" className="space-y-6 mt-6">
            {/* Mission */}
            <div>
              <Label htmlFor="mission" className="text-base font-semibold">Mission</Label>
              <p className="text-sm text-gray-600 mb-2">Your organization's core purpose</p>
              {editing ? (
                <Textarea
                  id="mission"
                  value={displayContext?.mission || ''}
                  onChange={(e) => updateField('mission', e.target.value)}
                  placeholder="What does your organization exist to do?"
                  className="min-h-[80px]"
                />
              ) : (
                <p className="text-gray-900">{displayContext?.mission || 'Not specified'}</p>
              )}
            </div>

            <Separator />

            {/* Vision */}
            <div>
              <Label htmlFor="vision" className="text-base font-semibold">Vision</Label>
              <p className="text-sm text-gray-600 mb-2">The world you're working toward</p>
              {editing ? (
                <Textarea
                  id="vision"
                  value={displayContext?.vision || ''}
                  onChange={(e) => updateField('vision', e.target.value)}
                  placeholder="What future are you working to create?"
                  className="min-h-[80px]"
                />
              ) : (
                <p className="text-gray-900">{displayContext?.vision || 'Not specified'}</p>
              )}
            </div>

            <Separator />

            {/* Values */}
            <div>
              <Label className="text-base font-semibold">Core Values</Label>
              <p className="text-sm text-gray-600 mb-2">The principles that guide your work</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {(displayContext?.values || []).map((value, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {value}
                    {editing && (
                      <button
                        onClick={() => removeArrayItem('values', index)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              {editing && (
                <div className="flex gap-2">
                  <Input
                    id="new-value"
                    placeholder="Add a value"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addArrayItem('values', e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.getElementById('new-value') as HTMLInputElement
                      addArrayItem('values', input.value)
                      input.value = ''
                    }}
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="approach" className="space-y-6 mt-6">
            {/* Approach Description */}
            <div>
              <Label htmlFor="approach" className="text-base font-semibold">Approach Description</Label>
              <p className="text-sm text-gray-600 mb-2">How you work and what makes you unique</p>
              {editing ? (
                <Textarea
                  id="approach"
                  value={displayContext?.approach_description || ''}
                  onChange={(e) => updateField('approach_description', e.target.value)}
                  placeholder="Describe your approach to the work..."
                  className="min-h-[120px]"
                />
              ) : (
                <p className="text-gray-900 whitespace-pre-wrap">{displayContext?.approach_description || 'Not specified'}</p>
              )}
            </div>

            <Separator />

            {/* Cultural Frameworks */}
            <div>
              <Label className="text-base font-semibold">Cultural Frameworks</Label>
              <p className="text-sm text-gray-600 mb-2">Cultural practices and protocols you follow</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {(displayContext?.cultural_frameworks || []).map((framework, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {framework}
                    {editing && (
                      <button
                        onClick={() => removeArrayItem('cultural_frameworks', index)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              {editing && (
                <div className="flex gap-2">
                  <Input
                    id="new-framework"
                    placeholder="e.g., Dadirri, Two-way learning"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addArrayItem('cultural_frameworks', e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.getElementById('new-framework') as HTMLInputElement
                      addArrayItem('cultural_frameworks', input.value)
                      input.value = ''
                    }}
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Key Principles */}
            <div>
              <Label className="text-base font-semibold">Key Principles</Label>
              <p className="text-sm text-gray-600 mb-2">Operating principles that guide your decisions</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {(displayContext?.key_principles || []).map((principle, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {principle}
                    {editing && (
                      <button
                        onClick={() => removeArrayItem('key_principles', index)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              {editing && (
                <div className="flex gap-2">
                  <Input
                    id="new-principle"
                    placeholder="Add a principle"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addArrayItem('key_principles', e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.getElementById('new-principle') as HTMLInputElement
                      addArrayItem('key_principles', input.value)
                      input.value = ''
                    }}
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="impact" className="space-y-6 mt-6">
            {/* Impact Philosophy */}
            <div>
              <Label htmlFor="impact-philosophy" className="text-base font-semibold">Impact Philosophy</Label>
              <p className="text-sm text-gray-600 mb-2">Your theory of change and how you create impact</p>
              {editing ? (
                <Textarea
                  id="impact-philosophy"
                  value={displayContext?.impact_philosophy || ''}
                  onChange={(e) => updateField('impact_philosophy', e.target.value)}
                  placeholder="Describe your theory of change..."
                  className="min-h-[120px]"
                />
              ) : (
                <p className="text-gray-900 whitespace-pre-wrap">{displayContext?.impact_philosophy || 'Not specified'}</p>
              )}
            </div>

            <Separator />

            {/* Measurement Approach */}
            <div>
              <Label htmlFor="measurement" className="text-base font-semibold">Measurement Approach</Label>
              <p className="text-sm text-gray-600 mb-2">How you know you're making a difference</p>
              {editing ? (
                <Textarea
                  id="measurement"
                  value={displayContext?.measurement_approach || ''}
                  onChange={(e) => updateField('measurement_approach', e.target.value)}
                  placeholder="How do you measure your impact?"
                  className="min-h-[100px]"
                />
              ) : (
                <p className="text-gray-900 whitespace-pre-wrap">{displayContext?.measurement_approach || 'Not specified'}</p>
              )}
            </div>

            <Separator />

            {/* Impact Domains */}
            {displayContext?.impact_domains && (
              <div>
                <Label className="text-base font-semibold">Impact Domains</Label>
                <p className="text-sm text-gray-600 mb-3">Areas where you create impact</p>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(displayContext.impact_domains).map(([domain, areas]) => (
                    <div key={domain} className="border rounded-lg p-4">
                      <h4 className="font-semibold text-sm text-gray-700 mb-2 capitalize">{domain}</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {(areas as string[]).map((area, index) => (
                          <li key={index} className="text-sm text-gray-600">{area}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="metadata" className="space-y-6 mt-6">
            {/* Website */}
            <div>
              <Label htmlFor="website" className="text-base font-semibold">Website</Label>
              {editing ? (
                <Input
                  id="website"
                  type="url"
                  value={displayContext?.website || ''}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://yourorganization.org"
                />
              ) : (
                <p className="text-gray-900">
                  {displayContext?.website ? (
                    <a href={displayContext.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {displayContext.website}
                    </a>
                  ) : (
                    'Not specified'
                  )}
                </p>
              )}
            </div>

            <Separator />

            {/* Metadata */}
            {context && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {new Date(context.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Last Updated: {new Date(context.updated_at).toLocaleDateString()}</span>
                </div>
                {context.ai_model_used && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Sparkles className="h-4 w-4" />
                    <span>Extracted by: {context.ai_model_used}</span>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Dialogs */}
      <SeedInterviewWizard
        organizationId={organizationId}
        open={showSeedInterview}
        onClose={() => setShowSeedInterview(false)}
        onComplete={() => {
          fetchContext()
          setShowSeedInterview(false)
        }}
      />

      <DocumentImportDialog
        organizationId={organizationId}
        type="organization"
        open={showDocumentImport}
        onClose={() => setShowDocumentImport(false)}
        onComplete={() => {
          fetchContext()
          setShowDocumentImport(false)
        }}
      />
    </div>
  )
}
