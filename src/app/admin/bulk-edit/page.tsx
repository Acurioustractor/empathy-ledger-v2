'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Save, Sparkles, Users, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface Transcript {
  id: string
  title: string
  storyteller_id: string | null
  organization_id: string
  project_id: string | null
  created_at: string
}

interface Storyteller {
  id: string
  full_name: string
  display_name: string
}

interface Organization {
  id: string
  name: string
}

export default function BulkEditPage() {
  const router = useRouter()

  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [storytellers, setStorytellers] = useState<Storyteller[]>([])
  const [selectedTranscripts, setSelectedTranscripts] = useState<Set<string>>(new Set())
  const [assignedStorytellers, setAssignedStorytellers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrganizations()
  }, [])

  useEffect(() => {
    if (selectedOrgId) {
      fetchOrphanedTranscripts()
      fetchStorytellers()
    }
  }, [selectedOrgId])

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/admin/organizations')
      if (response.ok) {
        const data = await response.json()
        setOrganizations(data.organizations || [])
      }
    } catch (error) {
      console.error('Error fetching organizations:', error)
    }
  }

  const fetchOrphanedTranscripts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/transcripts?organization_id=${selectedOrgId}&storyteller_id=null`)

      if (response.ok) {
        const data = await response.json()
        setTranscripts(data.transcripts || [])
      }
    } catch (error) {
      console.error('Error fetching orphaned transcripts:', error)
      setError('Failed to fetch transcripts')
    } finally {
      setLoading(false)
    }
  }

  const fetchStorytellers = async () => {
    try {
      const response = await fetch(`/api/admin/storytellers?organization_id=${selectedOrgId}&limit=500`)

      if (response.ok) {
        const data = await response.json()
        setStorytellers(data.storytellers || [])
      }
    } catch (error) {
      console.error('Error fetching storytellers:', error)
    }
  }

  const toggleTranscript = (transcriptId: string) => {
    const newSet = new Set(selectedTranscripts)
    if (newSet.has(transcriptId)) {
      newSet.delete(transcriptId)
    } else {
      newSet.add(transcriptId)
    }
    setSelectedTranscripts(newSet)
  }

  const toggleAll = () => {
    if (selectedTranscripts.size === transcripts.length) {
      setSelectedTranscripts(new Set())
    } else {
      setSelectedTranscripts(new Set(transcripts.map(t => t.id)))
    }
  }

  const assignStoryteller = (transcriptId: string, storytellerId: string) => {
    setAssignedStorytellers(prev => ({
      ...prev,
      [transcriptId]: storytellerId
    }))
  }

  const inferStorytellerFromTitle = (transcript: Transcript): string | null => {
    const title = transcript.title.toLowerCase()

    // Try to match storyteller name in the title
    for (const storyteller of storytellers) {
      const nameLower = storyteller.full_name.toLowerCase()
      const displayNameLower = storyteller.display_name?.toLowerCase() || ''
      const firstName = nameLower.split(' ')[0]

      // Check if title contains full name, display name, or first name
      if (title.includes(nameLower) ||
          title.includes(displayNameLower) ||
          (firstName && title.includes(firstName) && title.match(new RegExp(`\\b${firstName}\\d*\\b`)))) {
        return storyteller.id
      }
    }

    return null
  }

  const inferAll = () => {
    const newAssignments: Record<string, string> = { ...assignedStorytellers }
    let inferredCount = 0

    for (const transcript of transcripts) {
      if (!assignedStorytellers[transcript.id]) {
        const inferredId = inferStorytellerFromTitle(transcript)
        if (inferredId) {
          newAssignments[transcript.id] = inferredId
          inferredCount++
        }
      }
    }

    setAssignedStorytellers(newAssignments)
    setSuccess(`Inferred ${inferredCount} storytellers from titles`)
    setTimeout(() => setSuccess(null), 3000)
  }

  const bulkAssignSelected = async (storytellerId: string) => {
    if (selectedTranscripts.size === 0 || !storytellerId) return

    try {
      setSaving(true)
      setError(null)

      const updates = Array.from(selectedTranscripts).map(transcriptId => ({
        transcript_id: transcriptId,
        storyteller_id: storytellerId
      }))

      const response = await fetch('/api/admin/transcripts/bulk-assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      })

      if (!response.ok) {
        throw new Error('Failed to bulk assign storytellers')
      }

      setSuccess(`Assigned storyteller to ${updates.length} transcripts`)
      setSelectedTranscripts(new Set())

      // Refresh the list
      fetchOrphanedTranscripts()

    } catch (error) {
      console.error('Error bulk assigning:', error)
      setError('Failed to bulk assign storytellers')
    } finally {
      setSaving(false)
    }
  }

  const saveAssignments = async () => {
    if (Object.keys(assignedStorytellers).length === 0) {
      setError('No assignments to save')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const updates = Object.entries(assignedStorytellers).map(([transcriptId, storytellerId]) => ({
        transcript_id: transcriptId,
        storyteller_id: storytellerId
      }))

      const response = await fetch('/api/admin/transcripts/bulk-assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      })

      if (!response.ok) {
        throw new Error('Failed to save assignments')
      }

      const data = await response.json()
      setSuccess(`Successfully assigned ${data.updated || updates.length} storytellers!`)
      setAssignedStorytellers({})

      // Refresh the list
      setTimeout(() => {
        fetchOrphanedTranscripts()
        setSuccess(null)
      }, 2000)

    } catch (error) {
      console.error('Error saving assignments:', error)
      setError('Failed to save assignments')
    } finally {
      setSaving(false)
    }
  }

  const getStorytellerName = (storytellerId: string): string => {
    const storyteller = storytellers.find(s => s.id === storytellerId)
    return storyteller?.full_name || storyteller?.display_name || 'Unknown'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Bulk Edit Transcripts</h1>
          <p className="text-grey-600">Assign storytellers to orphaned transcripts</p>
        </div>
      </div>

      {/* Organization Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Organization
          </CardTitle>
          <CardDescription>
            Choose an organization to view and edit its orphaned transcripts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder="Select an organization..." />
            </SelectTrigger>
            <SelectContent>
              {organizations.map(org => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Success/Error Messages */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Transcripts List */}
      {selectedOrgId && (
        <>
          {/* Toolbar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedTranscripts.size === transcripts.length && transcripts.length > 0}
                    onCheckedChange={toggleAll}
                  />
                  <span className="text-sm text-grey-600">
                    {selectedTranscripts.size} of {transcripts.length} selected
                  </span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={inferAll}
                    disabled={loading || transcripts.length === 0}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Infer from Titles
                  </Button>

                  <Button
                    onClick={saveAssignments}
                    disabled={saving || Object.keys(assignedStorytellers).length === 0}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : `Save ${Object.keys(assignedStorytellers).length} Assignments`}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transcripts Table */}
          {loading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-grey-600">Loading transcripts...</p>
              </CardContent>
            </Card>
          ) : transcripts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-grey-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-grey-600">No orphaned transcripts found!</p>
                <p className="text-sm text-grey-500">All transcripts in this organization have storytellers assigned.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Orphaned Transcripts ({transcripts.length})
                </CardTitle>
                <CardDescription>
                  Transcripts without assigned storytellers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transcripts.map(transcript => {
                    const assignedStoryellerId = assignedStorytellers[transcript.id]

                    return (
                      <div
                        key={transcript.id}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-grey-50"
                      >
                        <Checkbox
                          checked={selectedTranscripts.has(transcript.id)}
                          onCheckedChange={() => toggleTranscript(transcript.id)}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-medium truncate">{transcript.title}</h4>
                              <p className="text-sm text-grey-500">
                                Created: {new Date(transcript.created_at).toLocaleDateString()}
                              </p>
                            </div>

                            {assignedStoryellerId && (
                              <Badge variant="secondary" className="shrink-0">
                                → {getStorytellerName(assignedStoryellerId)}
                              </Badge>
                            )}
                          </div>

                          <div className="mt-3">
                            <Select
                              value={assignedStoryellerId || ''}
                              onValueChange={(value) => assignStoryteller(transcript.id, value)}
                            >
                              <SelectTrigger className="w-full md:w-96">
                                <SelectValue placeholder="Select storyteller..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {storytellers.map(storyteller => (
                                  <SelectItem key={storyteller.id} value={storyteller.id}>
                                    {storyteller.full_name || storyteller.display_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
