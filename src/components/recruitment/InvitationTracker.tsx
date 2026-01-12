'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Mail,
  MessageSquare,
  Link2,
  QrCode,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  User,
  Calendar,
  Search,
  AlertTriangle,
  RotateCcw
} from 'lucide-react'

interface Invitation {
  id: string
  channel: 'email' | 'sms' | 'magic_link' | 'qr_code'
  recipient_name?: string
  recipient_contact?: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  sent_at: string
  expires_at: string
  accepted_at?: string
  declined_at?: string
  last_viewed_at?: string
  reminder_sent_at?: string
}

interface InvitationTrackerProps {
  organizationId?: string
  projectId?: string
}

export function InvitationTracker({ organizationId, projectId }: InvitationTrackerProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [filteredInvitations, setFilteredInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [channelFilter, setChannelFilter] = useState<string>('all')

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (organizationId) params.set('organization_id', organizationId)
        if (projectId) params.set('project_id', projectId)

        const response = await fetch(`/api/recruitment/invitations?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setInvitations(data.invitations || [])
          setFilteredInvitations(data.invitations || [])
        }
      } catch (error) {
        console.error('Failed to fetch invitations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvitations()
  }, [organizationId, projectId])

  // Filter invitations
  useEffect(() => {
    const filtered = invitations.filter(invitation => {
      const matchesSearch = searchTerm === '' ||
        invitation.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invitation.recipient_contact?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || invitation.status === statusFilter
      const matchesChannel = channelFilter === 'all' || invitation.channel === channelFilter

      return matchesSearch && matchesStatus && matchesChannel
    })

    // Sort by sent date (newest first)
    filtered.sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())

    setFilteredInvitations(filtered)
  }, [invitations, searchTerm, statusFilter, channelFilter])

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/recruitment/invitations/${invitationId}/resend`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        // Refresh invitations
        const updatedInvitations = invitations.map(inv =>
          inv.id === invitationId
            ? { ...inv, reminder_sent_at: new Date().toISOString() }
            : inv
        )
        setInvitations(updatedInvitations)
      }
    } catch (error) {
      console.error('Failed to resend invitation:', error)
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'sms':
        return <MessageSquare className="h-4 w-4" />
      case 'magic_link':
        return <Link2 className="h-4 w-4" />
      case 'qr_code':
        return <QrCode className="h-4 w-4" />
      default:
        return <Send className="h-4 w-4" />
    }
  }

  const getStatusBadge = (invitation: Invitation) => {
    // Check if expired
    const isExpired = new Date(invitation.expires_at) < new Date()

    switch (invitation.status) {
      case 'accepted':
        return (
          <Badge variant="outline" className="border-sage-600 text-sage-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        )
      case 'declined':
        return (
          <Badge variant="outline" className="border-ember-600 text-ember-600">
            <XCircle className="h-3 w-3 mr-1" />
            Declined
          </Badge>
        )
      case 'expired':
        return (
          <Badge variant="outline" className="border-amber-600 text-amber-600">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        )
      case 'pending':
        if (isExpired) {
          return (
            <Badge variant="outline" className="border-amber-600 text-amber-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Expired
            </Badge>
          )
        }
        return (
          <Badge variant="outline" className="border-clay-600 text-clay-600">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      default:
        return <Badge variant="outline">{invitation.status}</Badge>
    }
  }

  const getRelativeTime = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return then.toLocaleDateString()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading invitations...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Name or contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Channel</label>
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="magic_link">Magic Link</SelectItem>
                  <SelectItem value="qr_code">QR Code</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invitations List */}
      <div className="space-y-2">
        {filteredInvitations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Send className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No invitations found</p>
              <p className="text-sm mt-1">
                {invitations.length === 0
                  ? 'Send your first invitation to start recruiting storytellers'
                  : 'No invitations match your filters'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredInvitations.map((invitation) => (
            <Card key={invitation.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="capitalize">
                        {getChannelIcon(invitation.channel)}
                        <span className="ml-1">{invitation.channel.replace('_', ' ')}</span>
                      </Badge>
                      {getStatusBadge(invitation)}
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">
                        {invitation.recipient_name || 'Anonymous'}
                      </p>
                    </div>

                    {invitation.recipient_contact && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {invitation.recipient_contact}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Sent {getRelativeTime(invitation.sent_at)}</span>
                      </div>
                      {invitation.status === 'pending' && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Expires {new Date(invitation.expires_at).toLocaleDateString()}</span>
                        </div>
                      )}
                      {invitation.accepted_at && (
                        <div className="flex items-center gap-1 text-sage-600">
                          <CheckCircle className="h-3 w-3" />
                          <span>Accepted {getRelativeTime(invitation.accepted_at)}</span>
                        </div>
                      )}
                      {invitation.last_viewed_at && invitation.status === 'pending' && (
                        <div className="flex items-center gap-1 text-sky-600">
                          <span>Viewed {getRelativeTime(invitation.last_viewed_at)}</span>
                        </div>
                      )}
                    </div>

                    {invitation.reminder_sent_at && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Reminder sent {getRelativeTime(invitation.reminder_sent_at)}
                      </div>
                    )}
                  </div>

                  {invitation.status === 'pending' &&
                   new Date(invitation.expires_at) > new Date() &&
                   (invitation.channel === 'email' || invitation.channel === 'sms') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResendInvitation(invitation.id)}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Resend
                    </Button>
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
