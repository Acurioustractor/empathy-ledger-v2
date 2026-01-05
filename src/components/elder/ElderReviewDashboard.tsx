'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  MessageSquare,
  Shield,
  Crown,
  Flag,
  RefreshCw
} from 'lucide-react'
import { ReviewQueue } from './ReviewQueue'
import { StoryPreview } from './StoryPreview'
import { ApprovalWorkflow } from './ApprovalWorkflow'
import { ReviewHistory } from './ReviewHistory'

interface ElderReviewDashboardProps {
  elderId: string
  elderName: string
}

interface ReviewStats {
  pending: number
  approved: number
  rejected: number
  requestedChanges: number
  escalated: number
}

export function ElderReviewDashboard({ elderId, elderName }: ElderReviewDashboardProps) {
  const [stats, setStats] = useState<ReviewStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    requestedChanges: 0,
    escalated: 0
  })
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('queue')
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/elder/review-stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch review stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleStorySelected = (storyId: string) => {
    setSelectedStoryId(storyId)
    setActiveTab('preview')
  }

  const handleReviewCompleted = () => {
    setSelectedStoryId(null)
    setActiveTab('queue')
    fetchStats()
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Crown className="h-8 w-8 text-amber-600" />
            Elder Review Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome, {elderName}. Your cultural wisdom protects our community stories.
          </p>
        </div>
        <Button variant="outline" onClick={fetchStats} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting your wisdom</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-sage-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground mt-1">Culturally safe</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ember-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground mt-1">Cultural concerns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Changes Requested
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-clay-600">{stats.requestedChanges}</div>
            <p className="text-xs text-muted-foreground mt-1">Revisions needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Escalated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-sky-600">{stats.escalated}</div>
            <p className="text-xs text-muted-foreground mt-1">Council review</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Review Queue ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!selectedStoryId} className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Story Preview
          </TabsTrigger>
          <TabsTrigger value="workflow" disabled={!selectedStoryId} className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Approval Workflow
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Review History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <ReviewQueue
            elderId={elderId}
            onStorySelected={handleStorySelected}
            onRefresh={fetchStats}
          />
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {selectedStoryId ? (
            <StoryPreview
              storyId={selectedStoryId}
              elderId={elderId}
              onNavigateToWorkflow={() => setActiveTab('workflow')}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Select a story from the review queue to preview</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          {selectedStoryId ? (
            <ApprovalWorkflow
              storyId={selectedStoryId}
              elderId={elderId}
              elderName={elderName}
              onReviewCompleted={handleReviewCompleted}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Select a story from the review queue to begin approval workflow</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <ReviewHistory elderId={elderId} />
        </TabsContent>
      </Tabs>

      {/* Cultural Affirmation */}
      <Card className="bg-gradient-to-r from-amber-50 to-sage-50 border-amber-200">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <Shield className="h-8 w-8 text-amber-600 mt-1" />
            <div>
              <h3 className="font-semibold text-amber-900">Your Role as Cultural Guardian</h3>
              <p className="text-sm text-amber-800 mt-1">
                You are trusted to protect sacred knowledge, ensure cultural protocols are honored,
                and guide storytellers in sharing wisdom safely. Your decisions maintain the integrity
                of our community's narrative sovereignty.
              </p>
              <div className="mt-3 text-xs text-amber-700">
                <strong>Remember:</strong> When in doubt, consult with other Elders.
                It is always appropriate to escalate sensitive content to the Elder Council.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
