'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Users,
  Calendar,
  FileText,
  MessageSquare,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { InterpretationSessionForm } from './InterpretationSessionForm'
import { SessionSummary } from './SessionSummary'

interface InterpretationSession {
  id: string
  session_date: string
  facilitator_name: string
  participant_count: number
  stories_discussed: number
  key_interpretations: string[]
  consensus_points: string[]
  divergent_views: string[]
  cultural_context: string
  recommendations: string[]
  created_at: string
  organization_id: string
  project_id?: string
}

interface InterpretationSessionDashboardProps {
  organizationId: string
  projectId?: string
}

export function InterpretationSessionDashboard({
  organizationId,
  projectId
}: InterpretationSessionDashboardProps) {
  const [sessions, setSessions] = useState<InterpretationSession[]>([])
  const [selectedSession, setSelectedSession] = useState<InterpretationSession | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessions()
  }, [organizationId, projectId])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('organization_id', organizationId)
      if (projectId) params.append('project_id', projectId)

      const response = await fetch(`/api/interpretation/sessions?${params}`)
      if (!response.ok) throw new Error('Failed to fetch sessions')

      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSession = async (sessionData: any) => {
    try {
      const response = await fetch('/api/interpretation/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sessionData,
          organization_id: organizationId,
          project_id: projectId
        })
      })

      if (!response.ok) throw new Error('Failed to create session')

      await fetchSessions()
      setIsCreating(false)
      alert('Interpretation session created successfully!')
    } catch (error) {
      console.error('Error creating session:', error)
      alert('Failed to create session. Please try again.')
    }
  }

  const handleUpdateSession = async (sessionData: any) => {
    if (!selectedSession) return

    try {
      const response = await fetch(`/api/interpretation/sessions/${selectedSession.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      })

      if (!response.ok) throw new Error('Failed to update session')

      await fetchSessions()
      setIsEditing(false)
      setSelectedSession(null)
      alert('Session updated successfully!')
    } catch (error) {
      console.error('Error updating session:', error)
      alert('Failed to update session. Please try again.')
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this interpretation session?')) return

    try {
      const response = await fetch(`/api/interpretation/sessions/${sessionId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete session')

      await fetchSessions()
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null)
      }
      alert('Session deleted successfully!')
    } catch (error) {
      console.error('Error deleting session:', error)
      alert('Failed to delete session. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clay-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading interpretation sessions...</p>
        </div>
      </div>
    )
  }

  if (isCreating) {
    return (
      <InterpretationSessionForm
        organizationId={organizationId}
        projectId={projectId}
        onSubmit={handleCreateSession}
        onCancel={() => setIsCreating(false)}
      />
    )
  }

  if (isEditing && selectedSession) {
    return (
      <InterpretationSessionForm
        organizationId={organizationId}
        projectId={projectId}
        initialData={selectedSession}
        onSubmit={handleUpdateSession}
        onCancel={() => {
          setIsEditing(false)
          setSelectedSession(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Community Interpretation Sessions</h2>
          <p className="text-sm text-gray-600">
            Document community discussions and collective understanding of stories
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="bg-clay-600 hover:bg-clay-700">
          <Plus className="w-4 h-4 mr-2" />
          New Session
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-clay-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Participants</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.reduce((sum, s) => sum + s.participant_count, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-sky-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stories Discussed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.reduce((sum, s) => sum + s.stories_discussed, 0)}
                </p>
              </div>
              <FileText className="w-8 h-8 text-sage-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List and Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Sessions ({sessions.length})</CardTitle>
            <CardDescription>Select a session to view details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No sessions yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setIsCreating(true)}
                >
                  Create First Session
                </Button>
              </div>
            ) : (
              sessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`
                    w-full text-left p-3 rounded-lg border transition-all
                    ${selectedSession?.id === session.id
                      ? 'bg-clay-50 border-clay-300 shadow-sm'
                      : 'bg-white border-gray-200 hover:border-clay-200 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(session.session_date).toLocaleDateString()}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {session.participant_count} participants
                    </Badge>
                  </div>
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {session.facilitator_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {session.stories_discussed} stories discussed
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Session Detail */}
        <div className="lg:col-span-2">
          {selectedSession ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Session Details</CardTitle>
                    <CardDescription>
                      {new Date(selectedSession.session_date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSession(selectedSession.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <SessionSummary session={selectedSession} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a session to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
