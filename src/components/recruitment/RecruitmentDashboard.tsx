'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  Mail,
  MessageSquare,
  QrCode,
  Link2,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  RefreshCw,
  Plus,
  TrendingUp
} from 'lucide-react'
import { InvitationManager } from './InvitationManager'
import { MagicLinkGenerator } from './MagicLinkGenerator'
import { QRCodeGenerator } from './QRCodeGenerator'
import { InvitationTracker } from './InvitationTracker'

interface RecruitmentDashboardProps {
  organizationId: string
  projectId?: string
  adminView?: boolean
}

interface RecruitmentStats {
  totalInvitations: number
  pending: number
  accepted: number
  declined: number
  expired: number
  conversionRate: number
  byChannel: {
    email: number
    sms: number
    magicLink: number
    qrCode: number
  }
  recentActivity: {
    last7Days: number
    last30Days: number
  }
}

export function RecruitmentDashboard({
  organizationId,
  projectId,
  adminView = false
}: RecruitmentDashboardProps) {
  const [stats, setStats] = useState<RecruitmentStats>({
    totalInvitations: 0,
    pending: 0,
    accepted: 0,
    declined: 0,
    expired: 0,
    conversionRate: 0,
    byChannel: {
      email: 0,
      sms: 0,
      magicLink: 0,
      qrCode: 0
    },
    recentActivity: {
      last7Days: 0,
      last30Days: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('email')
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ organization_id: organizationId })
      if (projectId) params.set('project_id', projectId)

      const response = await fetch(`/api/recruitment/stats?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch recruitment stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [organizationId, projectId])

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-sage-600" />
            Storyteller Recruitment
          </h1>
          <p className="text-muted-foreground mt-1">
            Invite storytellers via email, SMS, magic links, and QR codes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setInviteDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Invitation
          </Button>
          <Button variant="outline" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Invitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-sage-600">{stats.totalInvitations}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Accepted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-sage-600">{stats.accepted}</div>
            <p className="text-xs text-muted-foreground mt-1">Joined platform</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Declined
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ember-600">{stats.declined}</div>
            <p className="text-xs text-muted-foreground mt-1">Not interested</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-clay-600">{stats.expired}</div>
            <p className="text-xs text-muted-foreground mt-1">Link expired</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-sky-600">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Acceptance rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Channel Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sage-100 rounded-lg">
                <Mail className="h-5 w-5 text-sage-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.byChannel.email}</div>
                <div className="text-sm text-muted-foreground">Email Invites</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.byChannel.sms}</div>
                <div className="text-sm text-muted-foreground">SMS Invites</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-clay-100 rounded-lg">
                <Link2 className="h-5 w-5 text-clay-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.byChannel.magicLink}</div>
                <div className="text-sm text-muted-foreground">Magic Links</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <QrCode className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.byChannel.qrCode}</div>
                <div className="text-sm text-muted-foreground">QR Code Scans</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Invites
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            SMS Invites
          </TabsTrigger>
          <TabsTrigger value="magic" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Magic Links
          </TabsTrigger>
          <TabsTrigger value="qr" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            QR Codes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="space-y-4">
          <InvitationManager
            organizationId={organizationId}
            projectId={projectId}
            channel="email"
            onInvitationSent={fetchStats}
          />
        </TabsContent>

        <TabsContent value="sms" className="space-y-4">
          <InvitationManager
            organizationId={organizationId}
            projectId={projectId}
            channel="sms"
            onInvitationSent={fetchStats}
          />
        </TabsContent>

        <TabsContent value="magic" className="space-y-4">
          <MagicLinkGenerator
            organizationId={organizationId}
            projectId={projectId}
            onLinkGenerated={fetchStats}
          />
        </TabsContent>

        <TabsContent value="qr" className="space-y-4">
          <QRCodeGenerator
            organizationId={organizationId}
            projectId={projectId}
            onQRGenerated={fetchStats}
          />
        </TabsContent>
      </Tabs>

      {/* Invitation Tracker */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invitations</CardTitle>
          <CardDescription>Track invitation status and responses</CardDescription>
        </CardHeader>
        <CardContent>
          <InvitationTracker
            organizationId={organizationId}
            projectId={projectId}
            onStatusChanged={fetchStats}
          />
        </CardContent>
      </Card>

      {/* Cultural Reminder */}
      <Card className="bg-gradient-to-r from-sage-50 to-sky-50 border-sage-200">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <Users className="h-8 w-8 text-sage-600 mt-1" />
            <div>
              <h3 className="font-semibold text-sage-900">Respectful Recruitment Practices</h3>
              <p className="text-sm text-sage-800 mt-1">
                When recruiting storytellers, remember to:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-sage-700">
                <li>• Respect cultural protocols when reaching out to communities</li>
                <li>• Obtain Elder approval before mass invitations</li>
                <li>• Clearly explain the purpose and cultural safety measures</li>
                <li>• Never pressure or coerce participation</li>
                <li>• Honor "no" responses without follow-up</li>
                <li>• Ensure consent forms are culturally appropriate</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
