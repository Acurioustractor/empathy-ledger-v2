'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Shield,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  Users,
  Camera,
  Bot,
  Share2
} from 'lucide-react'
import { ConsentsList } from './ConsentsList'
import { ConsentAuditTrail } from './ConsentAuditTrail'
import { ExpirationReminders } from './ExpirationReminders'
import { WithdrawalProcessor } from './WithdrawalProcessor'

interface ConsentTrackingDashboardProps {
  storytellerId?: string
  organizationId?: string
  adminView?: boolean
}

interface ConsentStats {
  total: number
  active: number
  withdrawn: number
  expired: number
  expiringThisMonth: number
  byType: {
    story: number
    photo: number
    ai: number
    sharing: number
  }
}

export function ConsentTrackingDashboard({
  storytellerId,
  organizationId,
  adminView = false
}: ConsentTrackingDashboardProps) {
  const [stats, setStats] = useState<ConsentStats>({
    total: 0,
    active: 0,
    withdrawn: 0,
    expired: 0,
    expiringThisMonth: 0,
    byType: {
      story: 0,
      photo: 0,
      ai: 0,
      sharing: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  const fetchStats = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (storytellerId) params.set('storyteller_id', storytellerId)
      if (organizationId) params.set('organization_id', organizationId)

      const response = await fetch(`/api/consent/stats?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch consent stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [storytellerId, organizationId])

  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (storytellerId) params.set('storyteller_id', storytellerId)
      if (organizationId) params.set('organization_id', organizationId)

      const response = await fetch(`/api/consent/export?${params.toString()}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `consent-report-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to export consent data:', error)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-sky-600" />
            Consent Tracking Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            {adminView
              ? 'Manage and monitor all consents across the platform'
              : 'Track and manage your consent preferences'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Consents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-sky-600">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All consent records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-sage-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently valid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Withdrawn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ember-600">{stats.withdrawn}</div>
            <p className="text-xs text-muted-foreground mt-1">Revoked consent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{stats.expired}</div>
            <p className="text-xs text-muted-foreground mt-1">Past expiry date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-clay-600">{stats.expiringThisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">Within 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Consent Types Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sage-100 rounded-lg">
                <FileText className="h-5 w-5 text-sage-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.byType.story}</div>
                <div className="text-sm text-muted-foreground">Story Consents</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100 rounded-lg">
                <Camera className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.byType.photo}</div>
                <div className="text-sm text-muted-foreground">Photo/Video</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-clay-100 rounded-lg">
                <Bot className="h-5 w-5 text-clay-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.byType.ai}</div>
                <div className="text-sm text-muted-foreground">AI Processing</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Share2 className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.byType.sharing}</div>
                <div className="text-sm text-muted-foreground">External Sharing</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            All Consents ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="expiring" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Expiring Soon ({stats.expiringThisMonth})
          </TabsTrigger>
          <TabsTrigger value="withdrawn" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Withdrawn ({stats.withdrawn})
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ConsentsList
            storytellerId={storytellerId}
            organizationId={organizationId}
            adminView={adminView}
            onConsentUpdated={fetchStats}
          />
        </TabsContent>

        <TabsContent value="expiring" className="space-y-4">
          <ExpirationReminders
            storytellerId={storytellerId}
            organizationId={organizationId}
            onRenewalCompleted={fetchStats}
          />
        </TabsContent>

        <TabsContent value="withdrawn" className="space-y-4">
          <WithdrawalProcessor
            storytellerId={storytellerId}
            organizationId={organizationId}
            onRestoreCompleted={fetchStats}
          />
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <ConsentAuditTrail
            storytellerId={storytellerId}
            organizationId={organizationId}
          />
        </TabsContent>
      </Tabs>

      {/* GDPR Compliance Notice */}
      <Card className="bg-gradient-to-r from-sky-50 to-sage-50 border-sky-200">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <Shield className="h-8 w-8 text-sky-600 mt-1" />
            <div>
              <h3 className="font-semibold text-sky-900">GDPR & Indigenous Data Sovereignty</h3>
              <p className="text-sm text-sky-800 mt-1">
                This consent tracking system honors both GDPR requirements and Indigenous data sovereignty principles.
                All consents are:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-sky-700">
                <li>• <strong>Freely given</strong> - No coercion or pressure</li>
                <li>• <strong>Specific</strong> - Clear purpose for each consent</li>
                <li>• <strong>Informed</strong> - Full disclosure of data usage</li>
                <li>• <strong>Unambiguous</strong> - Explicit opt-in required</li>
                <li>• <strong>Revocable</strong> - Can be withdrawn at any time</li>
                <li>• <strong>Culturally appropriate</strong> - Honors OCAP principles</li>
              </ul>
              <div className="mt-3 text-xs text-sky-600">
                <strong>Legal Basis:</strong> GDPR Articles 6, 7, 13, 14, 15, 16, 17, 18, 21 |
                UN Declaration on the Rights of Indigenous Peoples (UNDRIP) Articles 18, 19, 31
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
