'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  Flag,
  Calendar,
  User,
  Search,
  Eye,
  ChevronRight
} from 'lucide-react'

interface ReviewHistoryItem {
  id: string
  story_id: string
  story_title: string
  storyteller_name: string
  decision: 'approve' | 'reject' | 'request_changes' | 'escalate'
  reviewed_at: string
  cultural_guidance?: string
  concerns?: string[]
  requested_changes?: string
  escalation_reason?: string
}

interface ReviewHistoryProps {
  elderId: string
}

export function ReviewHistory({ elderId }: ReviewHistoryProps) {
  const [history, setHistory] = useState<ReviewHistoryItem[]>([])
  const [filteredHistory, setFilteredHistory] = useState<ReviewHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [decisionFilter, setDecisionFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/elder/review-history')
        if (response.ok) {
          const data = await response.json()
          setHistory(data.history || [])
          setFilteredHistory(data.history || [])
        }
      } catch (error) {
        console.error('Failed to fetch review history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [elderId])

  // Filter history
  useEffect(() => {
    const filtered = history.filter(item => {
      const matchesSearch = searchTerm === '' ||
        item.story_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.storyteller_name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDecision = decisionFilter === 'all' || item.decision === decisionFilter

      return matchesSearch && matchesDecision
    })

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.reviewed_at).getTime() - new Date(a.reviewed_at).getTime())

    setFilteredHistory(filtered)
  }, [history, searchTerm, decisionFilter])

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'approve':
        return (
          <Badge variant="outline" className="border-sage-600 text-sage-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case 'reject':
        return (
          <Badge variant="outline" className="border-ember-600 text-ember-600">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      case 'request_changes':
        return (
          <Badge variant="outline" className="border-clay-600 text-clay-600">
            <MessageSquare className="h-3 w-3 mr-1" />
            Changes Requested
          </Badge>
        )
      case 'escalate':
        return (
          <Badge variant="outline" className="border-sky-600 text-sky-600">
            <Flag className="h-3 w-3 mr-1" />
            Escalated
          </Badge>
        )
      default:
        return <Badge variant="outline">{decision}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading review history...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Story title or storyteller..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Decision</label>
              <Select value={decisionFilter} onValueChange={setDecisionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Decisions</SelectItem>
                  <SelectItem value="approve">Approved</SelectItem>
                  <SelectItem value="reject">Rejected</SelectItem>
                  <SelectItem value="request_changes">Changes Requested</SelectItem>
                  <SelectItem value="escalate">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No review history</p>
              <p className="text-sm mt-1">
                {history.length === 0
                  ? 'You haven\'t reviewed any stories yet'
                  : 'No reviews match your filters'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredHistory.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getDecisionBadge(item.decision)}
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{formatDate(item.reviewed_at)}</span>
                      </div>
                      <h3 className="font-semibold truncate">{item.story_title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <User className="h-4 w-4" />
                        <span>{item.storyteller_name}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    >
                      <ChevronRight className={`h-4 w-4 transition-transform ${expandedId === item.id ? 'rotate-90' : ''}`} />
                    </Button>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === item.id && (
                    <div className="pt-3 border-t space-y-3">
                      {item.cultural_guidance && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Cultural Guidance</h4>
                          <p className="text-sm text-muted-foreground">{item.cultural_guidance}</p>
                        </div>
                      )}

                      {item.concerns && item.concerns.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Concerns Identified</h4>
                          <div className="flex flex-wrap gap-2">
                            {item.concerns.map((concern, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {concern.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.requested_changes && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Requested Changes</h4>
                          <p className="text-sm text-muted-foreground">{item.requested_changes}</p>
                        </div>
                      )}

                      {item.escalation_reason && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Escalation Reason</h4>
                          <p className="text-sm text-muted-foreground">{item.escalation_reason}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
