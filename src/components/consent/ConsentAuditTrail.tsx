'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Calendar,
  Search,
  Shield
} from 'lucide-react'

interface AuditEvent {
  id: string
  consent_id: string
  event_type: 'granted' | 'renewed' | 'withdrawn' | 'expired' | 'modified'
  content_title?: string
  consent_type: string
  performed_by: string
  performed_at: string
  details?: string
  ip_address?: string
}

interface ConsentAuditTrailProps {
  storytellerId?: string
  organizationId?: string
}

export function ConsentAuditTrail({ storytellerId, organizationId }: ConsentAuditTrailProps) {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [eventFilter, setEventFilter] = useState<string>('all')

  useEffect(() => {
    const fetchAuditTrail = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (storytellerId) params.set('storyteller_id', storytellerId)
        if (organizationId) params.set('organization_id', organizationId)

        const response = await fetch(`/api/consent/audit-trail?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setEvents(data.events || [])
          setFilteredEvents(data.events || [])
        }
      } catch (error) {
        console.error('Failed to fetch audit trail:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAuditTrail()
  }, [storytellerId, organizationId])

  // Filter events
  useEffect(() => {
    const filtered = events.filter(event => {
      const matchesSearch = searchTerm === '' ||
        event.content_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.performed_by.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesEvent = eventFilter === 'all' || event.event_type === eventFilter

      return matchesSearch && matchesEvent
    })

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime())

    setFilteredEvents(filtered)
  }, [events, searchTerm, eventFilter])

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case 'granted':
        return (
          <Badge variant="outline" className="border-sage-600 text-sage-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Granted
          </Badge>
        )
      case 'renewed':
        return (
          <Badge variant="outline" className="border-sky-600 text-sky-600">
            <Clock className="h-3 w-3 mr-1" />
            Renewed
          </Badge>
        )
      case 'withdrawn':
        return (
          <Badge variant="outline" className="border-ember-600 text-ember-600">
            <XCircle className="h-3 w-3 mr-1" />
            Withdrawn
          </Badge>
        )
      case 'expired':
        return (
          <Badge variant="outline" className="border-amber-600 text-amber-600">
            <Clock className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        )
      case 'modified':
        return (
          <Badge variant="outline" className="border-clay-600 text-clay-600">
            <FileText className="h-3 w-3 mr-1" />
            Modified
          </Badge>
        )
      default:
        return <Badge variant="outline">{eventType}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading audit trail...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Content or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Event Type</label>
              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="granted">Granted</SelectItem>
                  <SelectItem value="renewed">Renewed</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="modified">Modified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="space-y-2">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No audit events</p>
              <p className="text-sm mt-1">
                {events.length === 0
                  ? 'No consent events have been recorded yet'
                  : 'No events match your filters'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getEventBadge(event.event_type)}
                      <Badge variant="outline" className="capitalize text-xs">
                        {event.consent_type}
                      </Badge>
                    </div>
                    {event.content_title && (
                      <p className="text-sm font-medium truncate">{event.content_title}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{event.performed_by}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(event.performed_at).toLocaleString()}</span>
                      </div>
                    </div>
                    {event.details && (
                      <p className="text-xs text-muted-foreground mt-1">{event.details}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
