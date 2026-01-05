'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { ArrowLeft, LayoutGrid, Tag, Folder, RefreshCw } from 'lucide-react'

export default function CurationTestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testOrganizationId = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'

  const testGetStats = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/curation/stats?organization_id=${testOrganizationId}`)
      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const testGetStories = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/curation/stories?organization_id=${testOrganizationId}`)
      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const testAssignStories = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/curation/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: testOrganizationId,
          project_id: 'test-project-id',
          story_ids: ['test-story-1', 'test-story-2']
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

  const testAddThemes = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/curation/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story_id: 'test-story-id',
          themes: ['Land & Territory', 'Cultural Identity', 'Family & Community']
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

  const testGetCampaigns = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/curation/campaigns?organization_id=${testOrganizationId}`)
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
          <h1 className="text-3xl font-bold">Story Curation Test</h1>
          <p className="text-gray-600">Test story assignment, themes, and campaigns</p>
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
              <CardTitle>Test Curation APIs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <LayoutGrid className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">GET /api/curation/stats</div>
                    <div className="text-sm text-gray-600">Get curation statistics</div>
                  </div>
                </div>
                <Button onClick={testGetStats} disabled={loading}>
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <LayoutGrid className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-medium">GET /api/curation/stories</div>
                    <div className="text-sm text-gray-600">Get stories with themes</div>
                  </div>
                </div>
                <Button onClick={testGetStories} disabled={loading}>
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Folder className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">POST /api/curation/assign</div>
                    <div className="text-sm text-gray-600">Assign stories to project</div>
                  </div>
                </div>
                <Button onClick={testAssignStories} disabled={loading}>
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-amber-600" />
                  <div>
                    <div className="font-medium">POST /api/curation/themes</div>
                    <div className="text-sm text-gray-600">Add themes to story</div>
                  </div>
                </div>
                <Button onClick={testAddThemes} disabled={loading}>
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Folder className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="font-medium">GET /api/curation/campaigns</div>
                    <div className="text-sm text-gray-600">Get all campaigns</div>
                  </div>
                </div>
                <Button onClick={testGetCampaigns} disabled={loading}>
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
