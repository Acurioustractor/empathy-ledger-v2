'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { ArrowLeft, FileCheck, AlertCircle, Download, RefreshCw } from 'lucide-react'

export default function ConsentTrackingTestPage() {
  const [stats, setStats] = useState<any>(null)
  const [consents, setConsents] = useState<any[]>([])
  const [expiring, setExpiring] = useState<any[]>([])
  const [auditTrail, setAuditTrail] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testOrganizationId = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
  const testStorytellerId = 'test-storyteller-id'

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/consent/stats?organization_id=${testOrganizationId}`)
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data.stats)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchConsents = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/consent/all?organization_id=${testOrganizationId}`)
      if (!response.ok) throw new Error('Failed to fetch consents')
      const data = await response.json()
      setConsents(data.consents || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchExpiring = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/consent/expiring?organization_id=${testOrganizationId}`)
      if (!response.ok) throw new Error('Failed to fetch expiring consents')
      const data = await response.json()
      setExpiring(data.consents || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchAuditTrail = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/consent/audit-trail?organization_id=${testOrganizationId}`)
      if (!response.ok) throw new Error('Failed to fetch audit trail')
      const data = await response.json()
      setAuditTrail(data.events || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testRenewConsent = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/consent/test-consent-id/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          renewal_period: '5years'
        })
      })
      if (!response.ok) throw new Error('Failed to renew consent')
      alert('Consent renewed successfully!')
      await fetchStats()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testWithdrawConsent = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/consent/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent_id: 'test-consent-id',
          reason: 'Test withdrawal'
        })
      })
      if (!response.ok) throw new Error('Failed to withdraw consent')
      alert('Consent withdrawn successfully!')
      await fetchStats()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testExportConsents = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/consent/export?organization_id=${testOrganizationId}`)
      if (!response.ok) throw new Error('Failed to export consents')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `consents-export-${Date.now()}.csv`
      a.click()
      alert('Consents exported successfully!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
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
          <h1 className="text-3xl font-bold">Consent Tracking Test</h1>
          <p className="text-gray-600">Test GDPR/OCAP compliant consent management</p>
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{stats.withdrawn}</div>
              <div className="text-sm text-gray-600">Withdrawn</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-600">{stats.expired}</div>
              <div className="text-sm text-gray-600">Expired</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-amber-600">{stats.expiringThisMonth}</div>
              <div className="text-sm text-gray-600">Expiring Soon</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Consent Types */}
      {stats?.byType && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Consents by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.byType.story}</div>
                <div className="text-sm text-gray-600">Story</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.byType.photo}</div>
                <div className="text-sm text-gray-600">Photo</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.byType.ai}</div>
                <div className="text-sm text-gray-600">AI Processing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{stats.byType.sharing}</div>
                <div className="text-sm text-gray-600">Sharing</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Tests */}
      <Tabs defaultValue="endpoints" className="space-y-6">
        <TabsList>
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="consents">All Consents</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle>Test API Endpoints</CardTitle>
              <CardDescription>Test all 8 Consent Tracking API endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">GET /api/consent/stats</div>
                    <div className="text-sm text-gray-600">Get consent statistics</div>
                  </div>
                  <Button onClick={fetchStats} disabled={loading}>
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">GET /api/consent/all</div>
                    <div className="text-sm text-gray-600">Get all consents</div>
                  </div>
                  <Button onClick={fetchConsents} disabled={loading}>
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">GET /api/consent/expiring</div>
                    <div className="text-sm text-gray-600">Get expiring consents (30 days)</div>
                  </div>
                  <Button onClick={fetchExpiring} disabled={loading}>
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">POST /api/consent/[id]/renew</div>
                    <div className="text-sm text-gray-600">Renew consent (4 periods)</div>
                  </div>
                  <Button onClick={testRenewConsent} disabled={loading}>
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">POST /api/consent/withdraw</div>
                    <div className="text-sm text-gray-600">Withdraw consent</div>
                  </div>
                  <Button onClick={testWithdrawConsent} disabled={loading}>
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">GET /api/consent/audit-trail</div>
                    <div className="text-sm text-gray-600">Get complete audit trail</div>
                  </div>
                  <Button onClick={fetchAuditTrail} disabled={loading}>
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">GET /api/consent/export</div>
                    <div className="text-sm text-gray-600">Export consents to CSV</div>
                  </div>
                  <Button onClick={testExportConsents} disabled={loading}>
                    {loading ? <Download className="h-4 w-4 mr-2" /> : null}
                    {loading ? 'Exporting...' : 'Test Export'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consents">
          <Card>
            <CardHeader>
              <CardTitle>All Consents</CardTitle>
              <CardDescription>{consents.length} total consents</CardDescription>
            </CardHeader>
            <CardContent>
              {consents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No consents found
                </div>
              ) : (
                <div className="space-y-3">
                  {consents.slice(0, 10).map((consent) => (
                    <div key={consent.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{consent.content_title || 'Untitled'}</div>
                        <Badge
                          variant={
                            consent.status === 'active' ? 'default' :
                            consent.status === 'withdrawn' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {consent.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        Type: {consent.consent_type} | Granted: {new Date(consent.granted_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring">
          <Card>
            <CardHeader>
              <CardTitle>Expiring Soon</CardTitle>
              <CardDescription>{expiring.length} consents expiring within 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {expiring.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No expiring consents
                </div>
              ) : (
                <div className="space-y-3">
                  {expiring.map((consent) => (
                    <div key={consent.id} className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{consent.content_title || 'Untitled'}</div>
                        <Badge variant="outline" className="border-amber-600 text-amber-600">
                          Expires: {new Date(consent.expires_at).toLocaleDateString()}
                        </Badge>
                      </div>
                      <div className="text-sm text-amber-700">
                        {consent.days_until_expiry} days remaining
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>{auditTrail.length} audit events</CardDescription>
            </CardHeader>
            <CardContent>
              {auditTrail.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No audit events found
                </div>
              ) : (
                <div className="space-y-3">
                  {auditTrail.slice(0, 20).map((event) => (
                    <div key={event.id} className="p-3 border rounded-lg text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{event.event_type}</span>
                        <span className="text-gray-600">
                          {new Date(event.performed_at).toLocaleString()}
                        </span>
                      </div>
                      {event.details && (
                        <div className="text-gray-600">{event.details}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
