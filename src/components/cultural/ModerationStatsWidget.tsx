'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react'

interface ModerationStats {
  total_reviewed: number
  approved: number
  flagged: number
  blocked: number
  elder_review_required: number
  pending_elder_review: number
}

interface ModerationStatsWidgetProps {
  elderId?: string
  organizationId?: string
  showTimeframeSelector?: boolean
  compact?: boolean
  className?: string
}

export function ModerationStatsWidget({
  elderId,
  organizationId,
  showTimeframeSelector = true,
  compact = false,
  className = ''
}: ModerationStatsWidgetProps) {
  const [stats, setStats] = useState<ModerationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week')

  useEffect(() => {
    const fetchStats = async () => {
      if (!elderId) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const url = `/api/ai/cultural-safety?elder_id=${elderId}&action=stats&timeframe=${timeframe}`
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error('Failed to fetch moderation statistics')
        }

        const data = await response.json()
        setStats(data.moderation_stats || null)
      } catch (err) {
        console.error('Error fetching moderation stats:', err)
        setError(err instanceof Error ? err.message : 'Failed to load statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [elderId, timeframe])

  const getApprovalRate = () => {
    if (!stats || stats.total_reviewed === 0) return 0
    return Math.round((stats.approved / stats.total_reviewed) * 100)
  }

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case 'day': return 'Today'
      case 'week': return 'This Week'
      case 'month': return 'This Month'
      default: return 'This Week'
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-earth-600" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-6 text-center text-stone-500">
          <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-amber-500" />
          <p className="text-sm">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card className={className}>
        <CardContent className="py-6 text-center text-stone-500">
          <Shield className="w-8 h-8 mx-auto mb-2 text-stone-400" />
          <p className="text-sm">No moderation data available</p>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-earth-600" />
              <span className="font-medium text-earth-800">Moderation</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {getTimeframeLabel()}
            </Badge>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-stone-50 rounded">
              <p className="text-lg font-bold text-stone-700">{stats.total_reviewed}</p>
              <p className="text-xs text-stone-500">Total</p>
            </div>
            <div className="p-2 bg-sage-50 rounded">
              <p className="text-lg font-bold text-sage-700">{stats.approved}</p>
              <p className="text-xs text-stone-500">OK</p>
            </div>
            <div className="p-2 bg-amber-50 rounded">
              <p className="text-lg font-bold text-amber-700">{stats.flagged}</p>
              <p className="text-xs text-stone-500">Flagged</p>
            </div>
            <div className="p-2 bg-red-50 rounded">
              <p className="text-lg font-bold text-red-700">{stats.blocked}</p>
              <p className="text-xs text-stone-500">Blocked</p>
            </div>
          </div>

          {stats.pending_elder_review > 0 && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-earth-600">
              <Clock className="w-4 h-4" />
              <span>{stats.pending_elder_review} pending elder review</span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const approvalRate = getApprovalRate()

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-earth-600" />
              Cultural Safety Moderation
            </CardTitle>
            <CardDescription>Content review statistics</CardDescription>
          </div>

          {showTimeframeSelector && (
            <Select value={timeframe} onValueChange={(v) => setTimeframe(v as typeof timeframe)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Approval Rate Banner */}
        <div className="mb-6 p-4 bg-gradient-to-r from-earth-50 to-sage-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-600">Approval Rate</p>
              <p className="text-3xl font-bold text-earth-800">{approvalRate}%</p>
            </div>
            <div className="p-3 bg-white rounded-full shadow-sm">
              {approvalRate >= 70 ? (
                <TrendingUp className="w-6 h-6 text-sage-600" />
              ) : approvalRate >= 50 ? (
                <TrendingUp className="w-6 h-6 text-amber-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600" />
              )}
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {stats.approved} of {stats.total_reviewed} items approved
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-stone-50 rounded-lg text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-stone-100 rounded-full">
                <Shield className="w-4 h-4 text-stone-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-stone-700">{stats.total_reviewed}</p>
            <p className="text-xs text-stone-500">Total Reviewed</p>
          </div>

          <div className="p-4 bg-sage-50 rounded-lg text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-sage-100 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-sage-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-sage-700">{stats.approved}</p>
            <p className="text-xs text-stone-500">Approved</p>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-amber-100 rounded-full">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-700">{stats.flagged}</p>
            <p className="text-xs text-stone-500">Flagged</p>
          </div>

          <div className="p-4 bg-red-50 rounded-lg text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-red-100 rounded-full">
                <XCircle className="w-4 h-4 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-700">{stats.blocked}</p>
            <p className="text-xs text-stone-500">Blocked</p>
          </div>

          <div className="p-4 bg-earth-50 rounded-lg text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-earth-100 rounded-full">
                <Users className="w-4 h-4 text-earth-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-earth-700">{stats.elder_review_required}</p>
            <p className="text-xs text-stone-500">Elder Required</p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-purple-100 rounded-full">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-700">{stats.pending_elder_review}</p>
            <p className="text-xs text-stone-500">Pending Review</p>
          </div>
        </div>

        {/* Pending Alert */}
        {stats.pending_elder_review > 5 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              <strong>{stats.pending_elder_review}</strong> items are waiting for elder review.
              Consider reviewing high-priority items first.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
