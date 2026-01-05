'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { ArrowLeft, BarChart3, Download, TrendingUp, Calendar, RefreshCw } from 'lucide-react'

export default function AnalyticsTestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testOrganizationId = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'

  const testExportAnalytics = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        organization_id: testOrganizationId,
        format: 'csv',
        date_range: '30days',
        include_stories: 'true',
        include_themes: 'true',
        include_consents: 'true'
      })
      const response = await fetch(`/api/analytics/export?${params.toString()}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-export-${Date.now()}.csv`
        a.click()
        setResult({ success: true, message: 'Export downloaded successfully' })
      } else {
        const data = await response.json()
        setResult(data)
      }
    } catch (err: any) {
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const testThemeAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/themes?organization_id=${testOrganizationId}&time_range=30days`)
      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const testProjectTimeline = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/timeline?organization_id=${testOrganizationId}&view_mode=month`)
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
          <h1 className="text-3xl font-bold">Analytics Test</h1>
          <p className="text-gray-600">Test data export, themes, and timeline APIs</p>
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
              <CardTitle>Test Analytics APIs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">GET /api/analytics/export</div>
                    <div className="text-sm text-gray-600">Export analytics to CSV (7 data types)</div>
                  </div>
                </div>
                <Button onClick={testExportAnalytics} disabled={loading}>
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test Export'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-medium">GET /api/analytics/themes</div>
                    <div className="text-sm text-gray-600">Get theme distribution with trends</div>
                  </div>
                </div>
                <Button onClick={testThemeAnalytics} disabled={loading}>
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">GET /api/analytics/timeline</div>
                    <div className="text-sm text-gray-600">Get project timeline events</div>
                  </div>
                </div>
                <Button onClick={testProjectTimeline} disabled={loading}>
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Feature Highlights */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle>Export Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium mb-1">Data Types (7)</div>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Stories</li>
                    <li>• Storytellers</li>
                    <li>• Themes</li>
                    <li>• Reviews</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium mb-1">More Data</div>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Consents</li>
                    <li>• Invitations</li>
                    <li>• Campaigns</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle>Theme Analytics Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Theme distribution</li>
                    <li>• Trend indicators (up/down/stable)</li>
                    <li>• Growth percentages</li>
                  </ul>
                </div>
                <div>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Top themes ranking</li>
                    <li>• Period comparison</li>
                    <li>• 4 date ranges (7/30/90/all)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle>Timeline Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Month/quarter/year views</li>
                    <li>• 5 event types tracked</li>
                    <li>• Events by date grouping</li>
                  </ul>
                </div>
                <div>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Stories created</li>
                    <li>• Reviews submitted</li>
                    <li>• Campaigns launched</li>
                  </ul>
                </div>
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
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm max-h-96">
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
