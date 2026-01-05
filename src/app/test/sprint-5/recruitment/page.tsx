'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { ArrowLeft, UserPlus, Mail, Smartphone, Link as LinkIcon, QrCode, RefreshCw } from 'lucide-react'

export default function RecruitmentTestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testOrganizationId = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'

  const testSendInvitations = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/recruitment/send-invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: testOrganizationId,
          channel: 'email',
          recipients: [{ name: 'Test User', value: 'test@example.com' }],
          message: 'Test invitation',
          expiry_days: 14
        })
      })
      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const testGenerateMagicLink = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/recruitment/magic-links/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: testOrganizationId,
          channel: 'standalone',
          expiry_days: 7
        })
      })
      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const testGenerateQRCode = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/recruitment/qr-codes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: testOrganizationId,
          event_name: 'Test Event',
          size: 256
        })
      })
      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const testGetInvitations = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/recruitment/invitations?organization_id=${testOrganizationId}`)
      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/test/sprint-5">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sprint 5
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Recruitment Test</h1>
          <p className="text-gray-600">Test multi-channel recruitment APIs</p>
        </div>
      </div>

      <Tabs defaultValue="endpoints">
        <TabsList>
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Recruitment APIs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">POST /api/recruitment/send-invitations</div>
                    <div className="text-sm text-gray-600">Send email/SMS invitations</div>
                  </div>
                </div>
                <Button onClick={testSendInvitations} disabled={loading}>
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <LinkIcon className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-medium">POST /api/recruitment/magic-links/generate</div>
                    <div className="text-sm text-gray-600">Generate magic link</div>
                  </div>
                </div>
                <Button onClick={testGenerateMagicLink} disabled={loading}>
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <QrCode className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">POST /api/recruitment/qr-codes/generate</div>
                    <div className="text-sm text-gray-600">Generate QR code for events</div>
                  </div>
                </div>
                <Button onClick={testGenerateQRCode} disabled={loading}>
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <UserPlus className="h-5 w-5 text-amber-600" />
                  <div>
                    <div className="font-medium">GET /api/recruitment/invitations</div>
                    <div className="text-sm text-gray-600">Get all invitations</div>
                  </div>
                </div>
                <Button onClick={testGetInvitations} disabled={loading}>
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Run a test to see results
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
