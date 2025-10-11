'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import ProjectSeedInterviewWizard from './ProjectSeedInterviewWizard'
import DocumentImportDialog from '../organization/DocumentImportDialog'
import {
  FileText,
  MessageSquare,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Calendar,
  Link,
  Target,
  Users,
  TrendingUp
} from 'lucide-react'

interface ProjectContext {
  id: string
  project_id: string
  organization_id: string
  purpose: string | null
  context: string | null
  target_population: string | null
  expected_outcomes: Array<{
    category: string
    description: string
    indicators: string[]
    timeframe: 'short_term' | 'medium_term' | 'long_term'
  }> | null
  success_criteria: string[] | null
  timeframe: string | null
  program_model: string | null
  cultural_approaches: string[] | null
  key_activities: string[] | null
  context_type: 'manual' | 'seed_interview' | 'imported' | 'full' | 'quick'
  ai_extracted: boolean
  extraction_quality_score: number | null
  ai_model_used: string | null
  inherits_from_org: boolean
  created_at: string
  updated_at: string
}

interface OrganizationContext {
  mission: string
  vision: string
  values: string[]
  cultural_frameworks: string[]
  impact_philosophy: string
}

interface ProjectContextManagerProps {
  projectId: string
  canEdit: boolean
}

export default function ProjectContextManager({
  projectId,
  canEdit
}: ProjectContextManagerProps) {
  const [context, setContext] = useState<ProjectContext | null>(null)
  const [orgContext, setOrgContext] = useState<OrganizationContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editedContext, setEditedContext] = useState<Partial<ProjectContext>>({})
  const [showSeedInterview, setShowSeedInterview] = useState(false)
  const [showDocumentImport, setShowDocumentImport] = useState(false)

  useEffect(() => {
    fetchContext()
  }, [projectId])

  const fetchContext = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${projectId}/context`)
      const data = await response.json()

      if (data.exists) {
        setContext(data.context)
        setOrgContext(data.organizationContext)
      }
    } catch (err) {
      setError('Failed to load project context')
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
      const response = await fetch(`/api/projects/${projectId}/context`, {
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

      // Refetch to get updated org context if inheritance changed
      await fetchContext()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save context')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof ProjectContext, value: any) => {
    setEditedContext(prev => ({ ...prev, [field]: value }))
  }

  const addArrayItem = (field: 'success_criteria' | 'cultural_approaches' | 'key_activities', value: string) => {
    if (!value.trim()) return

    const currentArray = editedContext[field] || context?.[field] || []
    updateField(field, [...currentArray, value.trim()])
  }

  const removeArrayItem = (field: 'success_criteria' | 'cultural_approaches' | 'key_activities', index: number) => {
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
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">No Project Context Defined</h3>
            <p className="text-gray-600 mb-4">
              Add project context to enable outcome tracking and project-specific AI analysis.
            </p>
          </div>
          {canEdit && (
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Create Manually
              </Button>
              <Button variant="outline" onClick={() => setShowSeedInterview(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Seed Interview
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
  const inheritsFromOrg = displayContext?.inherits_from_org !== false

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

      {/* Inheritance Status */}
      {inheritsFromOrg && orgContext && (
        <Alert>
          <Link className="h-4 w-4" />
          <AlertDescription>
            This project inherits cultural frameworks and values from the organization.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Project Context</h2>
            {context && (
              <>
                <Badge variant={context.context_type === 'manual' ? 'secondary' : 'default'}>
                  {context.context_type === 'seed_interview' && 'From Interview'}
                  {context.context_type === 'imported' && 'Imported'}
                  {context.context_type === 'full' && 'Full Profile'}
                  {context.context_type === 'manual' && 'Manual'}
                </Badge>
                {context.extraction_quality_score && (
                  <Badge variant={context.extraction_quality_score >= 80 ? 'default' : 'secondary'}>
                    {context.extraction_quality_score}% Quality
                  </Badge>
                )}
              </>
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

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
            <TabsTrigger value="approach">Approach</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Inheritance Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Link className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">Inherit from Organization</p>
                  <p className="text-sm text-gray-600">Use organization's cultural frameworks and values</p>
                </div>
              </div>
              {editing ? (
                <Switch
                  checked={displayContext?.inherits_from_org !== false}
                  onCheckedChange={(checked) => updateField('inherits_from_org', checked)}
                />
              ) : (
                <Badge variant={inheritsFromOrg ? 'default' : 'secondary'}>
                  {inheritsFromOrg ? 'Enabled' : 'Disabled'}
                </Badge>
              )}
            </div>

            {/* Purpose */}
            <div>
              <Label htmlFor="purpose" className="text-base font-semibold">Purpose</Label>
              <p className="text-sm text-gray-600 mb-2">What this project is trying to achieve</p>
              {editing ? (
                <Textarea
                  id="purpose"
                  value={displayContext?.purpose || ''}
                  onChange={(e) => updateField('purpose', e.target.value)}
                  placeholder="What is this project trying to achieve?"
                  className="min-h-[80px]"
                />
              ) : (
                <p className="text-gray-900">{displayContext?.purpose || 'Not specified'}</p>
              )}
            </div>

            <Separator />

            {/* Context */}
            <div>
              <Label htmlFor="context-field" className="text-base font-semibold">Context</Label>
              <p className="text-sm text-gray-600 mb-2">Why this project exists</p>
              {editing ? (
                <Textarea
                  id="context-field"
                  value={displayContext?.context || ''}
                  onChange={(e) => updateField('context', e.target.value)}
                  placeholder="What is the community need or opportunity this addresses?"
                  className="min-h-[80px]"
                />
              ) : (
                <p className="text-gray-900">{displayContext?.context || 'Not specified'}</p>
              )}
            </div>

            <Separator />

            {/* Target Population */}
            <div>
              <Label htmlFor="target" className="text-base font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Target Population
              </Label>
              <p className="text-sm text-gray-600 mb-2">Who you're working with</p>
              {editing ? (
                <Textarea
                  id="target"
                  value={displayContext?.target_population || ''}
                  onChange={(e) => updateField('target_population', e.target.value)}
                  placeholder="Who are the people this project serves?"
                  className="min-h-[60px]"
                />
              ) : (
                <p className="text-gray-900">{displayContext?.target_population || 'Not specified'}</p>
              )}
            </div>

            <Separator />

            {/* Timeframe */}
            <div>
              <Label htmlFor="timeframe" className="text-base font-semibold">Timeframe</Label>
              <p className="text-sm text-gray-600 mb-2">Project duration or phases</p>
              {editing ? (
                <Textarea
                  id="timeframe"
                  value={displayContext?.timeframe || ''}
                  onChange={(e) => updateField('timeframe', e.target.value)}
                  placeholder="e.g., 2-year pilot program, ongoing initiative"
                  className="min-h-[60px]"
                />
              ) : (
                <p className="text-gray-900">{displayContext?.timeframe || 'Not specified'}</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="outcomes" className="space-y-6 mt-6">
            {/* Expected Outcomes */}
            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Expected Outcomes
              </Label>
              <p className="text-sm text-gray-600 mb-3">The impact you're working to create</p>
              {displayContext?.expected_outcomes && displayContext.expected_outcomes.length > 0 ? (
                <div className="space-y-3">
                  {displayContext.expected_outcomes.map((outcome, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{outcome.category}</h4>
                        <Badge variant="outline" className="capitalize">
                          {outcome.timeframe.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{outcome.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {outcome.indicators.map((indicator, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {indicator}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No outcomes defined yet. Use seed interview or import to extract outcomes.</p>
              )}
            </div>

            <Separator />

            {/* Success Criteria */}
            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Success Criteria
              </Label>
              <p className="text-sm text-gray-600 mb-2">How you'll know you've succeeded</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {(displayContext?.success_criteria || []).map((criteria, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {criteria}
                    {editing && (
                      <button
                        onClick={() => removeArrayItem('success_criteria', index)}
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
                  <Textarea
                    id="new-criteria"
                    placeholder="Add success criteria"
                    className="min-h-[60px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        const value = e.currentTarget.value
                        if (value.trim()) {
                          addArrayItem('success_criteria', value)
                          e.currentTarget.value = ''
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.getElementById('new-criteria') as HTMLTextAreaElement
                      if (input.value.trim()) {
                        addArrayItem('success_criteria', input.value)
                        input.value = ''
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="approach" className="space-y-6 mt-6">
            {/* Program Model */}
            <div>
              <Label htmlFor="program-model" className="text-base font-semibold">Program Model</Label>
              <p className="text-sm text-gray-600 mb-2">How the project works</p>
              {editing ? (
                <Textarea
                  id="program-model"
                  value={displayContext?.program_model || ''}
                  onChange={(e) => updateField('program_model', e.target.value)}
                  placeholder="Describe how the project operates..."
                  className="min-h-[120px]"
                />
              ) : (
                <p className="text-gray-900 whitespace-pre-wrap">{displayContext?.program_model || 'Not specified'}</p>
              )}
            </div>

            <Separator />

            {/* Cultural Approaches */}
            <div>
              <Label className="text-base font-semibold">Cultural Approaches</Label>
              <p className="text-sm text-gray-600 mb-2">Cultural practices and protocols used in this project</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {(displayContext?.cultural_approaches || []).map((approach, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {approach}
                    {editing && (
                      <button
                        onClick={() => removeArrayItem('cultural_approaches', index)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              {inheritsFromOrg && orgContext?.cultural_frameworks && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-1">Inherited from organization:</p>
                  <div className="flex flex-wrap gap-2">
                    {orgContext.cultural_frameworks.map((framework, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Link className="h-3 w-3 mr-1" />
                        {framework}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {editing && (
                <div className="flex gap-2">
                  <Textarea
                    id="new-approach"
                    placeholder="Add cultural approach"
                    className="min-h-[60px]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.getElementById('new-approach') as HTMLTextAreaElement
                      if (input.value.trim()) {
                        addArrayItem('cultural_approaches', input.value)
                        input.value = ''
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Key Activities */}
            <div>
              <Label className="text-base font-semibold">Key Activities</Label>
              <p className="text-sm text-gray-600 mb-2">Main activities and services</p>
              <div className="space-y-2">
                {(displayContext?.key_activities || []).map((activity, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-sm flex-1">{activity}</span>
                    {editing && (
                      <button
                        onClick={() => removeArrayItem('key_activities', index)}
                        className="hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {editing && (
                <div className="flex gap-2 mt-2">
                  <Textarea
                    id="new-activity"
                    placeholder="Add key activity"
                    className="min-h-[60px]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.getElementById('new-activity') as HTMLTextAreaElement
                      if (input.value.trim()) {
                        addArrayItem('key_activities', input.value)
                        input.value = ''
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="metadata" className="space-y-6 mt-6">
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
                {context.inherits_from_org && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Link className="h-4 w-4" />
                    <span>Inheriting cultural context from organization</span>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Dialogs */}
      <ProjectSeedInterviewWizard
        projectId={projectId}
        open={showSeedInterview}
        onClose={() => setShowSeedInterview(false)}
        onComplete={() => {
          fetchContext()
          setShowSeedInterview(false)
        }}
      />

      <DocumentImportDialog
        projectId={projectId}
        type="project"
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
