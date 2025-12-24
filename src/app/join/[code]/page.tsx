'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/context/auth.context'
import {
  CheckCircle,
  AlertTriangle,
  Users,
  Calendar,
  Mail,
  Crown,
  Loader
} from 'lucide-react'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

interface InvitationData {
  id: string
  email: string
  role: string
  expires_at: string
  used_at: string | null
  created_at: string
  status: 'valid' | 'accepted' | 'expired'
  organisation: {
    id: string
    name: string
    slug: string
    description?: string
    logo_url?: string
  }
  invited_by_profile?: {
    display_name: string
  }
}

export default function JoinOrganizationPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile, isAuthenticated } = useAuth()
  const inviteCode = params.code as string

  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (inviteCode) {
      fetchInvitation()
    }
  }, [inviteCode])

  const fetchInvitation = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/invitations/${inviteCode}/accept`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Invitation not found')
      }

      const data = await response.json()
      setInvitation(data.invitation)
    } catch (error) {
      console.error('Error fetching invitation:', error)
      setError(error instanceof Error ? error.message : 'Failed to load invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async () => {
    if (!invitation || !isAuthenticated || !profile) {
      setError('You must be signed in to accept this invitation')
      return
    }

    setAccepting(true)
    setError('')

    try {
      const response = await fetch(`/api/invitations/${inviteCode}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_id: profile.id,
          email: profile.email,
          display_name: profile.display_name
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation')
      }

      setSuccess(data.message)

      // Redirect to organisation dashboard after 3 seconds
      setTimeout(() => {
        router.push(`/organisations/${invitation.organisation.slug}/dashboard`)
      }, 3000)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to accept invitation')
    } finally {
      setAccepting(false)
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full administrative access to manage the organisation, members, and content'
      case 'member':
        return 'Can participate in discussions, create content, and engage with the community'
      case 'viewer':
        return 'Can view and read content but cannot create or modify anything'
      default:
        return 'Member access'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-clay-100 text-clay-800 border-clay-200'
      case 'member': return 'bg-sage-100 text-sage-800 border-sage-200'
      case 'viewer': return 'bg-stone-100 text-stone-800 border-stone-200'
      default: return 'bg-stone-100 text-stone-800 border-stone-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading invitation...</p>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <CardTitle className="text-red-700">Invalid Invitation</CardTitle>
                <CardDescription>
                  This invitation link is not valid or has expired.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button asChild>
                  <a href="/organisations">Browse Organizations</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!invitation) {
    return null
  }

  // If invitation is already accepted
  if (invitation.status === 'accepted') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <CardTitle className="text-green-700">Already Accepted</CardTitle>
                <CardDescription>
                  This invitation has already been accepted.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button asChild>
                  <a href={`/organisations/${invitation.organisation.slug}`}>
                    Visit {invitation.organisation.name}
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // If invitation is expired
  if (invitation.status === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                <CardTitle className="text-orange-700">Invitation Expired</CardTitle>
                <CardDescription>
                  This invitation has expired and is no longer valid.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-stone-600 mb-4">
                  Please contact the organisation administrator for a new invitation.
                </p>
                <Button asChild>
                  <a href="/organisations">Browse Organizations</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto">
          {/* Success Message */}
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {success} Redirecting to organisation dashboard...
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {/* Main Invitation Card */}
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">You're Invited!</CardTitle>
              <CardDescription className="text-lg">
                Join <strong>{invitation.organisation.name}</strong> as a {invitation.role}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Organization Info */}
              <div className="bg-stone-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Organization Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-stone-500" />
                    <span>{invitation.organisation.name}</span>
                  </div>
                  {invitation.organisation.description && (
                    <p className="text-stone-600">{invitation.organisation.description}</p>
                  )}
                </div>
              </div>

              {/* Role Info */}
              <div className="bg-stone-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Your Role</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getRoleColor(invitation.role)}>
                    {invitation.role === 'admin' && <Crown className="w-3 h-3 mr-1" />}
                    {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-stone-600">{getRoleDescription(invitation.role)}</p>
              </div>

              {/* Invitation Details */}
              <div className="bg-stone-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Invitation Details</h3>
                <div className="space-y-2 text-sm text-stone-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>Sent to: {invitation.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Expires: {new Date(invitation.expires_at).toLocaleDateString()}</span>
                  </div>
                  {invitation.invited_by_profile?.display_name && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Invited by: {invitation.invited_by_profile.display_name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {!isAuthenticated ? (
                  <div className="text-center">
                    <p className="text-stone-600 mb-4">You need to sign in to accept this invitation</p>
                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <a href={`/auth/signin?redirect=/join/${inviteCode}`}>
                          Sign In
                        </a>
                      </Button>
                      <Button variant="outline" asChild className="flex-1">
                        <a href={`/auth/signup?redirect=/join/${inviteCode}`}>
                          Sign Up
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      onClick={handleAcceptInvitation}
                      disabled={accepting}
                      className="w-full"
                      size="lg"
                    >
                      {accepting ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Accepting Invitation...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept Invitation
                        </>
                      )}
                    </Button>

                    <Button variant="outline" asChild className="w-full">
                      <a href="/organisations">Decline & Browse Organizations</a>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}