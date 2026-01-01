'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Brain,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Sparkles,
  Search,
  Settings,
  Download,
  Upload,
  Zap,
  Target,
  AlertCircle
} from 'lucide-react'

interface ProfileSuggestion {
  field: string
  value: string
  confidence: number
  reasoning: string
  evidence: string[]
  shouldApply: boolean
}

interface BulkAnalysisResult {
  storytellerId: string
  name: string
  suggestionsCount: number
  topSuggestions: ProfileSuggestion[]
}

interface BulkProfileManagerProps {
  organizationId: string
  tenantId: string
}

export function BulkProfileManager({ organizationId, tenantId }: BulkProfileManagerProps) {
  const [loading, setLoading] = useState(false)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [selectedProfiles, setSelectedProfiles] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<string>('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (tenantId) {
      loadBulkAnalysis()
    }
  }, [tenantId])

  const loadBulkAnalysis = async () => {
    try {
      setLoading(true)
      console.log('🔍 Loading bulk profile analysis...')

      const response = await fetch('/api/admin/profiles/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulkMode: true,
          tenantId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to load analysis')
      }

      const result = await response.json()
      setAnalysisData(result)
      console.log('✅ Bulk analysis loaded:', result.summary)

    } catch (error) {
      console.error('❌ Error loading bulk analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyBulkSuggestions = async () => {
    if (selectedProfiles.size === 0) return

    try {
      setLoading(true)
      console.log(`🚀 Applying suggestions to ${selectedProfiles.size} profiles`)

      // In production, would call bulk update API
      const response = await fetch('/api/admin/profiles/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileIds: Array.from(selectedProfiles),
          action: bulkAction,
          tenantId
        })
      })

      if (response.ok) {
        console.log('✅ Bulk update applied successfully')
        await loadBulkAnalysis() // Reload to show updated data
        setSelectedProfiles(new Set())
      }

    } catch (error) {
      console.error('❌ Error applying bulk suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportSuggestions = () => {
    if (!analysisData) return

    const csvContent = analysisData.priorityProfiles.map((profile: BulkAnalysisResult) =>
      `"${profile.name}","${profile.suggestionsCount}","${profile.topSuggestions.map(s => s.field + ': ' + s.value).join('; ')}"`
    ).join('\n')

    const blob = new Blob([`Name,Suggestions Count,Top Suggestions\n${csvContent}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `profile-suggestions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const toggleProfileSelection = (profileId: string) => {
    const newSelection = new Set(selectedProfiles)
    if (newSelection.has(profileId)) {
      newSelection.delete(profileId)
    } else {
      newSelection.add(profileId)
    }
    setSelectedProfiles(newSelection)
  }

  const selectAllProfiles = () => {
    if (!analysisData?.priorityProfiles) return

    const allIds = analysisData.priorityProfiles.map((p: BulkAnalysisResult) => p.storytellerId)
    setSelectedProfiles(new Set(allIds))
  }

  const clearSelection = () => {
    setSelectedProfiles(new Set())
  }

  if (loading && !analysisData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 animate-pulse text-blue-600" />
            <span className="text-lg">Analyzing profiles with AI...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!analysisData) {
    return <div>No analysis data available</div>
  }

  return (
    <div className="space-y-6">
      {/* Header with Summary Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Brain className="h-6 w-6 mr-2 text-blue-600" />
            AI-Powered Profile Enhancement
          </h2>
          <p className="text-grey-600">Analyze and bulk update storyteller profiles using AI suggestions</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={exportSuggestions}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={loadBulkAnalysis} disabled={loading}>
            <Sparkles className="h-4 w-4 mr-2" />
            {loading ? 'Analyzing...' : 'Re-analyse'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-grey-600">Total Profiles</p>
                <p className="text-2xl font-bold">{analysisData.summary.totalStorytellers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Sparkles className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-grey-600">AI Suggestions</p>
                <p className="text-2xl font-bold">{analysisData.summary.totalSuggestions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-grey-600">Avg Completeness</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">{analysisData.summary.avgCompleteness}%</p>
                  <Badge className="ml-2 bg-green-100 text-green-800">Good</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-grey-600">Priority Profiles</p>
                <p className="text-2xl font-bold">{analysisData.summary.priorityProfilesCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
          <TabsTrigger value="bulk-actions">Bulk Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Completeness Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Average Completeness</span>
                    <span>{analysisData.summary.avgCompleteness}%</span>
                  </div>
                  <Progress value={analysisData.summary.avgCompleteness} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-grey-600">Profiles with suggestions</p>
                    <p className="font-semibold text-lg">{analysisData.summary.priorityProfilesCount}</p>
                  </div>
                  <div>
                    <p className="text-grey-600">Total AI suggestions</p>
                    <p className="font-semibold text-lg">{analysisData.summary.totalSuggestions}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-6">
          <div className="space-y-4">
            {analysisData.priorityProfiles.map((profile: BulkAnalysisResult) => (
              <Card key={profile.storytellerId} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedProfiles.has(profile.storytellerId)}
                        onCheckedChange={() => toggleProfileSelection(profile.storytellerId)}
                      />
                      <div>
                        <CardTitle className="text-lg">{profile.name}</CardTitle>
                        <p className="text-sm text-grey-600">{profile.suggestionsCount} AI suggestions</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {profile.suggestionsCount} suggestions
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profile.topSuggestions.map((suggestion, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-grey-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {suggestion.field.replace('_', ' ')}
                            </Badge>
                            <span className="font-medium">{suggestion.value}</span>
                          </div>
                          <p className="text-sm text-grey-600 mt-1">{suggestion.reasoning}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            {suggestion.confidence}% confidence
                          </Badge>
                          <Checkbox
                            checked={suggestion.shouldApply}
                            onCheckedChange={(checked) => {
                              // Update suggestion shouldApply status
                              suggestion.shouldApply = checked as boolean
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bulk-actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Profile Actions</CardTitle>
              <p className="text-sm text-grey-600">
                Apply AI suggestions or perform bulk updates on selected profiles
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Selected Profiles</p>
                  <p className="text-sm text-grey-600">{selectedProfiles.size} of {analysisData.priorityProfiles.length} profiles selected</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={selectAllProfiles}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Clear
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Bulk Action Type
                </label>
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an action..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apply-ai-suggestions">Apply AI Suggestions</SelectItem>
                    <SelectItem value="add-specialties">Add Specialties</SelectItem>
                    <SelectItem value="update-cultural-background">Update Cultural Background</SelectItem>
                    <SelectItem value="assign-projects">Assign to Projects</SelectItem>
                    <SelectItem value="update-locations">Update Locations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-grey-600">
                  This action will affect {selectedProfiles.size} profiles
                </div>
                <Button
                  onClick={applyBulkSuggestions}
                  disabled={selectedProfiles.size === 0 || !bulkAction || loading}
                  className="flex items-center"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {loading ? 'Applying...' : 'Apply Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manual Bulk Updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <Settings className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-800">Advanced Options</p>
                    <p className="text-sm text-yellow-700">
                      Manually update multiple profiles with custom values for projects, organisations, and locations
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="flex items-center justify-center h-20">
                  <div className="text-center">
                    <Upload className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm">Import CSV</div>
                  </div>
                </Button>
                <Button variant="outline" className="flex items-center justify-center h-20">
                  <div className="text-center">
                    <Users className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm">Batch Assign</div>
                  </div>
                </Button>
                <Button variant="outline" className="flex items-center justify-center h-20">
                  <div className="text-center">
                    <Search className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm">Find & Replace</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}