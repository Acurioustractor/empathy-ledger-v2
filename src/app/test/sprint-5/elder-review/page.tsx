'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { ArrowLeft, Shield, AlertCircle, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'

export default function ElderReviewTestPage() {
  const [stats, setStats] = useState<any>(null)
  const [reviewQueue, setReviewQueue] = useState<any[]>([])
  const [reviewHistory, setReviewHistory] = useState<any[]>([])
  const [concerns, setConcerns] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Test organization ID (replace with actual test data)
  const testOrganizationId = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
  const testElderId = 'test-elder-id'

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/elder/review-stats?elder_id=${testElderId}`)
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data.stats)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviewQueue = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/elder/review-queue?organization_id=${testOrganizationId}`)
      if (!response.ok) throw new Error('Failed to fetch review queue')
      const data = await response.json()
      setReviewQueue(data.stories || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviewHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/elder/review-history?elder_id=${testElderId}`)
      if (!response.ok) throw new Error('Failed to fetch review history')
      const data = await response.json()
      setReviewHistory(data.reviews || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchConcerns = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/elder/concerns')
      if (!response.ok) throw new Error('Failed to fetch concerns')
      const data = await response.json()
      setConcerns(data.concerns || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testSubmitReview = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/elder/review-queue/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story_id: 'test-story-id',
          elder_id: testElderId,
          decision: 'approve',
          cultural_guidance: 'Test cultural guidance notes',
          concerns: [],
          requested_changes: null,
          escalation_reason: null
        })
      })
      if (!response.ok) throw new Error('Failed to submit review')
      const data = await response.json()
      alert('Review submitted successfully!')
      await fetchStats()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchConcerns()
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/test/sprint-5">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sprint 5
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Elder Review System Test</h1>
          <p className="text-gray-600">Test all Elder Review APIs and workflows</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-amber-600">{stats.requestedChanges}</div>
              <div className="text-sm text-gray-600">Changes Requested</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">{stats.escalated}</div>
              <div className="text-sm text-gray-600">Escalated</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* API Tests */}
      <Tabs defaultValue="endpoints" className="space-y-6">
        <TabsList>
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="queue">Review Queue</TabsTrigger>
          <TabsTrigger value="history">Review History</TabsTrigger>
          <TabsTrigger value="concerns">Concern Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle>Test API Endpoints</CardTitle>
              <CardDescription>Test all 5 Elder Review API endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">GET /api/elder/review-stats</div>
                    <div className="text-sm text-gray-600">Get review statistics</div>
                  </div>
                  <Button onClick={fetchStats} disabled={loading}>
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">GET /api/elder/review-queue</div>
                    <div className="text-sm text-gray-600">Get pending reviews</div>
                  </div>
                  <Button onClick={fetchReviewQueue} disabled={loading}>
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">POST /api/elder/review-queue/submit</div>
                    <div className="text-sm text-gray-600">Submit review decision</div>
                  </div>
                  <Button onClick={testSubmitReview} disabled={loading}>
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">GET /api/elder/review-history</div>
                    <div className="text-sm text-gray-600">Get review history</div>
                  </div>
                  <Button onClick={fetchReviewHistory} disabled={loading}>
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">GET /api/elder/concerns</div>
                    <div className="text-sm text-gray-600">Get concern categories</div>
                  </div>
                  <Button onClick={fetchConcerns} disabled={loading}>
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue">
          <Card>
            <CardHeader>
              <CardTitle>Review Queue</CardTitle>
              <CardDescription>
                {reviewQueue.length} stories pending review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reviewQueue.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No stories in review queue
                </div>
              ) : (
                <div className="space-y-3">
                  {reviewQueue.map((story) => (
                    <div key={story.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{story.title}</div>
                          <div className="text-sm text-gray-600">
                            Priority: {story.priority || 'medium'}
                          </div>
                        </div>
                        <Badge>{story.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Review History</CardTitle>
              <CardDescription>
                {reviewHistory.length} past reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reviewHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No review history available
                </div>
              ) : (
                <div className="space-y-3">
                  {reviewHistory.map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{review.story_title}</div>
                        <Badge
                          variant={
                            review.decision === 'approve' ? 'default' :
                            review.decision === 'reject' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {review.decision}
                        </Badge>
                      </div>
                      {review.cultural_guidance && (
                        <div className="text-sm text-gray-600">
                          {review.cultural_guidance}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="concerns">
          <Card>
            <CardHeader>
              <CardTitle>Cultural Concern Categories</CardTitle>
              <CardDescription>
                {concerns.length} concern categories available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {concerns.map((concern, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">{concern.label}</div>
                    <div className="text-xs text-gray-600 mt-1">{concern.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
