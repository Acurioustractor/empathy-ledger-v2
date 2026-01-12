'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Shield,
  Search,
  AlertTriangle,
  Archive,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  Users,
  Calendar,
  ExternalLink,
  Filter,
  Download
} from 'lucide-react'

interface AuditLogEntry {
  id: string
  admin_profile_id: string
  action_type: string
  target_type: string
  target_id: string
  action_metadata: Record<string, any>
  success: boolean
  created_at: string
  profiles?: {
    display_name: string
  }
}

interface ModerationAction {
  id: string
  story_id: string
  action: 'pull_down' | 'refuse' | 'restore'
  reason: string
  performed_by: string
  performed_at: string
  story?: {
    title: string
    status: string
  }
}

interface ReviewItem {
  id: string
  story_id?: string
  article_id?: string
  status: string
  reviewer_id?: string
  created_at: string
  stories?: {
    id: string
    title: string
  }
}

export default function ContentControlPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch audit logs and reviews in parallel
      const [auditRes, reviewsRes] = await Promise.all([
        fetch('/api/admin/audit-logs?limit=100'),
        fetch('/api/admin/reviews?limit=50')
      ])

      if (auditRes.ok) {
        const data = await auditRes.json()
        setAuditLogs(data.logs || [])
      }

      if (reviewsRes.ok) {
        const data = await reviewsRes.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Error fetching content control data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePullDown = async (storyId: string) => {
    if (!confirm('Are you sure you want to pull down this story? This will archive it and revoke all syndication.')) {
      return
    }

    try {
      const res = await fetch('/api/admin/moderation/pull-down', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId })
      })

      if (res.ok) {
        alert('Story pulled down successfully')
        fetchData()
      } else {
        const error = await res.json()
        alert(`Failed to pull down: ${error.error}`)
      }
    } catch (error) {
      console.error('Error pulling down story:', error)
      alert('Failed to pull down story')
    }
  }

  const getActionBadge = (actionType: string) => {
    switch (actionType) {
      case 'pull_down':
        return <Badge className="bg-clay-100 text-clay-700 border-clay-200"><Archive className="w-3 h-3 mr-1" /> Pull Down</Badge>
      case 'refuse':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200"><XCircle className="w-3 h-3 mr-1" /> Refused</Badge>
      case 'approve':
        return <Badge className="bg-sage-100 text-sage-700 border-sage-200"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>
      case 'publish':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200"><Eye className="w-3 h-3 mr-1" /> Published</Badge>
      case 'cross_org_publish':
        return <Badge className="bg-purple-100 text-purple-700 border-purple-200"><ExternalLink className="w-3 h-3 mr-1" /> Cross-Org</Badge>
      default:
        return <Badge variant="outline">{actionType}</Badge>
    }
  }

  const filteredLogs = auditLogs.filter(log => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      if (!log.action_type.toLowerCase().includes(search) &&
          !log.target_type.toLowerCase().includes(search) &&
          !log.target_id.toLowerCase().includes(search)) {
        return false
      }
    }
    if (actionFilter !== 'all' && log.action_type !== actionFilter) {
      return false
    }
    return true
  })

  // Stats
  const totalActions = auditLogs.length
  const pullDowns = auditLogs.filter(l => l.action_type === 'pull_down').length
  const pendingReviews = reviews.filter(r => r.status === 'pending').length
  const successfulActions = auditLogs.filter(l => l.success).length

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-sage-600" />
          <span className="ml-2 text-stone-600">Loading content control...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-50 via-sage-50/30 to-earth-50/20 border border-stone-200 rounded-xl px-6 py-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-display-sm font-bold tracking-tight text-stone-900 flex items-center gap-2">
              <Shield className="w-8 h-8" />
              Content Control
            </h1>
            <p className="text-body-md text-stone-600 mt-1">
              Moderation, audit trails, and content protection for the ACT ecosystem
            </p>
          </div>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-stone-50 to-stone-100/50 border-stone-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-stone-800">{totalActions}</p>
              <p className="text-xs text-stone-600">Total Actions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-clay-50 to-clay-100/50 border-clay-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-clay-700">{pullDowns}</p>
              <p className="text-xs text-stone-600">Pull Downs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-700">{pendingReviews}</p>
              <p className="text-xs text-stone-600">Pending Reviews</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-sage-50 to-sage-100/50 border-sage-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-sage-700">{successfulActions}</p>
              <p className="text-xs text-stone-600">Successful</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="audit" className="space-y-6">
        <TabsList className="bg-stone-100">
          <TabsTrigger value="audit" className="data-[state=active]:bg-white">
            <FileText className="w-4 h-4 mr-2" />
            Audit Trail
          </TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-white">
            <Eye className="w-4 h-4 mr-2" />
            Pending Reviews
          </TabsTrigger>
          <TabsTrigger value="moderation" className="data-[state=active]:bg-white">
            <Shield className="w-4 h-4 mr-2" />
            Moderation Actions
          </TabsTrigger>
        </TabsList>

        {/* Audit Trail Tab */}
        <TabsContent value="audit">
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>
                Complete history of all admin actions across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="px-4 py-2 border border-stone-300 rounded-md"
                >
                  <option value="all">All Actions</option>
                  <option value="pull_down">Pull Downs</option>
                  <option value="refuse">Refused</option>
                  <option value="approve">Approved</option>
                  <option value="publish">Published</option>
                  <option value="cross_org_publish">Cross-Org Publish</option>
                </select>
              </div>

              {/* Logs Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="text-left py-3 px-4 font-medium text-stone-700">Action</th>
                      <th className="text-left py-3 px-4 font-medium text-stone-700">Target</th>
                      <th className="text-left py-3 px-4 font-medium text-stone-700">Admin</th>
                      <th className="text-left py-3 px-4 font-medium text-stone-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-stone-700">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map(log => (
                      <tr key={log.id} className="border-b border-stone-100 hover:bg-stone-50">
                        <td className="py-3 px-4">{getActionBadge(log.action_type)}</td>
                        <td className="py-3 px-4">
                          <span className="text-stone-500">{log.target_type}:</span>{' '}
                          <span className="font-mono text-xs">{log.target_id.substring(0, 8)}...</span>
                        </td>
                        <td className="py-3 px-4 text-stone-600">
                          {log.profiles?.display_name || 'Unknown'}
                        </td>
                        <td className="py-3 px-4">
                          {log.success ? (
                            <CheckCircle className="w-4 h-4 text-sage-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-clay-600" />
                          )}
                        </td>
                        <td className="py-3 px-4 text-stone-500">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredLogs.length === 0 && (
                <p className="text-center text-stone-500 py-8">No audit logs found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Reviews Tab */}
        <TabsContent value="reviews">
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle>Pending Reviews</CardTitle>
              <CardDescription>
                Content awaiting elder or admin review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reviews.filter(r => r.status === 'pending').length === 0 ? (
                <div className="text-center py-12 text-stone-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending reviews</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.filter(r => r.status === 'pending').map(review => (
                    <div
                      key={review.id}
                      className="p-4 rounded-lg border border-amber-200 bg-amber-50/50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-stone-900">
                            {review.stories?.title || 'Unknown Story'}
                          </h4>
                          <p className="text-sm text-stone-500">
                            Submitted {new Date(review.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-sage-300 text-sage-700 hover:bg-sage-50"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-clay-300 text-clay-700 hover:bg-clay-50"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Moderation Actions Tab */}
        <TabsContent value="moderation">
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle>Moderation Actions</CardTitle>
              <CardDescription>
                Quick actions for content moderation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pull Down Story */}
                <div className="p-6 rounded-lg border border-clay-200 bg-clay-50/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-clay-100">
                      <Archive className="w-5 h-5 text-clay-700" />
                    </div>
                    <div>
                      <h4 className="font-medium text-stone-900">Pull Down Content</h4>
                      <p className="text-sm text-stone-500">Archive and revoke syndication</p>
                    </div>
                  </div>
                  <Input
                    placeholder="Enter Story ID..."
                    className="mb-3"
                    id="pulldown-story-id"
                  />
                  <Button
                    variant="outline"
                    className="w-full border-clay-300 text-clay-700 hover:bg-clay-100"
                    onClick={() => {
                      const input = document.getElementById('pulldown-story-id') as HTMLInputElement
                      if (input?.value) {
                        handlePullDown(input.value)
                      }
                    }}
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Pull Down Story
                  </Button>
                </div>

                {/* Refuse Content */}
                <div className="p-6 rounded-lg border border-amber-200 bg-amber-50/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-amber-100">
                      <XCircle className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="font-medium text-stone-900">Refuse Publication</h4>
                      <p className="text-sm text-stone-500">Mark content as unsuitable</p>
                    </div>
                  </div>
                  <Input
                    placeholder="Enter Story ID..."
                    className="mb-3"
                    id="refuse-story-id"
                  />
                  <Button
                    variant="outline"
                    className="w-full border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Refuse Story
                  </Button>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-stone-50 border border-stone-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-stone-900">Moderation Guidelines</h4>
                    <ul className="mt-2 text-sm text-stone-600 space-y-1">
                      <li>• Pull-down immediately removes content from all ACT sites</li>
                      <li>• Refused content stays in draft but cannot be published</li>
                      <li>• All moderation actions are logged for audit purposes</li>
                      <li>• Storytellers are notified of moderation decisions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
