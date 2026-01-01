'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Mail,
  Plus,
  Users,
  Clock,
  Check,
  X,
  Trash2,
  Copy,
  ExternalLink,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface Invitation {
  id: string
  email: string
  role: string
  invite_code: string
  expires_at: string
  used_at: string | null
  created_at: string
  status: 'pending' | 'accepted' | 'expired'
  invited_by_profile?: {
    display_name: string
  }
  organisation: {
    name: string
    slug: string
  }
}

interface MemberInvitationsProps {
  organizationId: string
  organizationSlug: string
  canManage?: boolean
}

export default function MemberInvitations({
  organizationId,
  organizationSlug,
  canManage = false
}: MemberInvitationsProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showInviteForm, setShowInviteForm] = useState(false)

  // Form state
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')

  useEffect(() => {
    if (canManage) {
      fetchInvitations()
    }
  }, [organizationId, canManage])

  const fetchInvitations = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/organisations/${organizationId}/invitations`)

      if (!response.ok) {
        throw new Error('Failed to fetch invitations')
      }

      const data = await response.json()
      setInvitations(data.invitations || [])
    } catch (error) {
      console.error('Error fetching invitations:', error)
      setError('Failed to load invitations')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !role) {
      setError('Email and role are required')
      return
    }

    setCreating(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/organisations/${organizationId}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          role
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create invitation')
      }

      setSuccess(`Invitation sent to ${email}`)
      setEmail('')
      setRole('member')
      setShowInviteForm(false)

      // Refresh invitations list
      fetchInvitations()

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create invitation')
    } finally {
      setCreating(false)
    }
  }

  const copyInviteLink = (inviteCode: string) => {
    const inviteUrl = `${window.location.origin}/join/${inviteCode}`
    navigator.clipboard.writeText(inviteUrl)
    setSuccess('Invitation link copied to clipboard!')

    setTimeout(() => setSuccess(''), 3000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200'
      case 'expired': return 'bg-red-100 text-red-800 border-red-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-grey-100 text-grey-800 border-grey-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <Check className="w-3 h-3" />
      case 'expired': return <X className="w-3 h-3" />
      case 'pending': return <Clock className="w-3 h-3" />
      default: return null
    }
  }

  if (!canManage) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to manage invitations for this organisation.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-grey-900">Member Invitations</h2>
          <p className="text-grey-600 mt-1">Invite new members to join your organisation</p>
        </div>
        <Button onClick={() => setShowInviteForm(!showInviteForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Invite Form */}
      {showInviteForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Send Invitation
            </CardTitle>
            <CardDescription>
              Invite someone to join your organisation by email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateInvitation} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="person@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer - Can view content</SelectItem>
                    <SelectItem value="member">Member - Can participate and contribute</SelectItem>
                    <SelectItem value="admin">Admin - Can manage organisation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={creating}>
                  {creating ? 'Sending...' : 'Send Invitation'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInviteForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Pending & Recent Invitations ({invitations.length})
          </CardTitle>
          <CardDescription>
            Manage outstanding invitations and view recent activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Loading invitations...</p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8 text-grey-500">
              <Mail className="w-12 h-12 mx-auto mb-4 text-grey-300" />
              <p className="font-medium">No invitations yet</p>
              <p className="text-sm">Send your first invitation to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-grey-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">{invitation.email}</span>
                      <Badge className={getStatusColor(invitation.status)}>
                        {getStatusIcon(invitation.status)}
                        <span className="ml-1 capitalize">{invitation.status}</span>
                      </Badge>
                      <Badge variant="outline">{invitation.role}</Badge>
                    </div>
                    <div className="text-sm text-grey-500">
                      Invited {new Date(invitation.created_at).toLocaleDateString()}
                      {invitation.invited_by_profile?.display_name && (
                        <span> by {invitation.invited_by_profile.display_name}</span>
                      )}
                      {invitation.status === 'pending' && (
                        <span> • Expires {new Date(invitation.expires_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {invitation.status === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyInviteLink(invitation.invite_code)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/join/${invitation.invite_code}`, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}