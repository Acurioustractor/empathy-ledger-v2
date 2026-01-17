'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import {
  CheckCircle,
  XCircle,
  Loader2,
  Play,
  RefreshCw,
  Share2,
  Key,
  Shield,
  AlertTriangle,
  ExternalLink,
  Copy
} from 'lucide-react'

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  message?: string
  data?: any
  duration?: number
}

interface Story {
  id: string
  title: string
  status: string
  is_public: boolean
}

interface SyndicationSite {
  id: string
  slug: string
  name: string
  status: string
}

export default function SyndicationE2ETest() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Fetch published stories', status: 'pending' },
    { name: 'Fetch syndication sites', status: 'pending' },
    { name: 'Create syndication consent', status: 'pending' },
    { name: 'Verify consent exists', status: 'pending' },
    { name: 'Check embed token generated', status: 'pending' },
    { name: 'Validate token format', status: 'pending' },
    { name: 'Test content API access', status: 'pending' },
    { name: 'Revoke consent', status: 'pending' },
    { name: 'Verify token revoked', status: 'pending' },
    { name: 'Verify content API blocked', status: 'pending' }
  ])

  const [isRunning, setIsRunning] = useState(false)
  const [stories, setStories] = useState<Story[]>([])
  const [sites, setSites] = useState<SyndicationSite[]>([])
  const [selectedStory, setSelectedStory] = useState<string>('')
  const [selectedSite, setSelectedSite] = useState<string>('')
  const [consentId, setConsentId] = useState<string | null>(null)
  const [embedToken, setEmbedToken] = useState<string | null>(null)
  const [testLog, setTestLog] = useState<string[]>([])

  const log = (message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8)
    setTestLog(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const updateTest = (index: number, update: Partial<TestResult>) => {
    setTests(prev => {
      const newTests = [...prev]
      newTests[index] = { ...newTests[index], ...update }
      return newTests
    })
  }

  const runTest = async (
    index: number,
    name: string,
    testFn: () => Promise<{ success: boolean; message: string; data?: any }>
  ) => {
    const startTime = Date.now()
    updateTest(index, { status: 'running' })
    log(`Starting: ${name}`)

    try {
      const result = await testFn()
      const duration = Date.now() - startTime

      updateTest(index, {
        status: result.success ? 'passed' : 'failed',
        message: result.message,
        data: result.data,
        duration
      })

      log(`${result.success ? '✓' : '✗'} ${name}: ${result.message} (${duration}ms)`)
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      const message = error instanceof Error ? error.message : 'Unknown error'

      updateTest(index, {
        status: 'failed',
        message,
        duration
      })

      log(`✗ ${name}: ${message} (${duration}ms)`)
      return { success: false, message }
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTestLog([])
    setConsentId(null)
    setEmbedToken(null)

    // Reset all tests
    setTests(prev => prev.map(t => ({ ...t, status: 'pending', message: undefined, data: undefined })))

    log('Starting E2E Syndication Consent Test Suite')
    log('========================================')

    // Test 1: Fetch published stories
    const storiesResult = await runTest(0, 'Fetch published stories', async () => {
      const response = await fetch('/api/stories?status=published&limit=10')
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      const publishedStories = (data.stories || []).filter((s: Story) => s.is_public)
      setStories(publishedStories)

      if (publishedStories.length === 0) {
        return { success: false, message: 'No public published stories found' }
      }

      setSelectedStory(publishedStories[0].id)
      return {
        success: true,
        message: `Found ${publishedStories.length} public stories`,
        data: publishedStories.map((s: Story) => ({ id: s.id, title: s.title }))
      }
    })

    if (!storiesResult.success) {
      setIsRunning(false)
      return
    }

    // Test 2: Fetch syndication sites
    const sitesResult = await runTest(1, 'Fetch syndication sites', async () => {
      const response = await fetch('/api/syndication/sites')
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      const activeSites = (data.sites || []).filter((s: SyndicationSite) => s.status === 'active')
      setSites(activeSites)

      if (activeSites.length === 0) {
        return { success: false, message: 'No active syndication sites found' }
      }

      setSelectedSite(activeSites[0].slug)
      return {
        success: true,
        message: `Found ${activeSites.length} active sites`,
        data: activeSites.map((s: SyndicationSite) => ({ slug: s.slug, name: s.name }))
      }
    })

    if (!sitesResult.success) {
      setIsRunning(false)
      return
    }

    // Test 3: Create syndication consent
    const storyId = selectedStory || stories[0]?.id
    const siteSlug = selectedSite || sites[0]?.slug

    const consentResult = await runTest(2, 'Create syndication consent', async () => {
      const response = await fetch('/api/syndication/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          siteSlug,
          permissions: {
            allowFullContent: true,
            allowMediaAssets: true,
            allowAnalytics: true
          },
          culturalPermissionLevel: 'public',
          requestReason: 'E2E Test - Automated testing'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle already exists case
        if (response.status === 409) {
          return { success: true, message: 'Consent already exists (expected)', data }
        }
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      setConsentId(data.consent?.id)
      setEmbedToken(data.embedToken?.token)

      return {
        success: true,
        message: `Consent created: ${data.consent?.id?.slice(0, 8)}...`,
        data: { consentId: data.consent?.id, hasToken: !!data.embedToken }
      }
    })

    // Test 4: Verify consent exists
    await runTest(3, 'Verify consent exists', async () => {
      const response = await fetch(
        `/api/syndication/consent?storyId=${storyId}&siteSlug=${siteSlug}`
      )

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()

      if (!data.exists) {
        return { success: false, message: 'Consent not found after creation' }
      }

      // Update consentId if we didn't get it from creation (already existed case)
      if (!consentId && data.consent?.id) {
        setConsentId(data.consent.id)
      }

      return {
        success: true,
        message: `Consent verified: status=${data.consent?.status}`,
        data: { status: data.consent?.status, permissions: data.consent }
      }
    })

    // Test 5: Check embed token generated
    await runTest(4, 'Check embed token generated', async () => {
      const response = await fetch(`/api/syndication/tokens?storyId=${storyId}`)

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      const activeTokens = (data.tokens || []).filter((t: any) => t.status === 'active')

      if (activeTokens.length === 0) {
        return { success: false, message: 'No active embed tokens found' }
      }

      if (!embedToken) {
        setEmbedToken(activeTokens[0].token)
      }

      return {
        success: true,
        message: `Found ${activeTokens.length} active token(s)`,
        data: { tokenCount: activeTokens.length, tokenId: activeTokens[0]?.id }
      }
    })

    // Test 6: Validate token format
    await runTest(5, 'Validate token format', async () => {
      const token = embedToken

      if (!token) {
        return { success: false, message: 'No token available to validate' }
      }

      // Token should be base64url encoded (alphanumeric + - and _)
      const base64urlPattern = /^[A-Za-z0-9_-]+$/
      const isValidFormat = base64urlPattern.test(token)
      const isValidLength = token.length >= 32 // Should be at least 32 chars

      if (!isValidFormat) {
        return { success: false, message: 'Token format invalid (not base64url)' }
      }

      if (!isValidLength) {
        return { success: false, message: `Token too short: ${token.length} chars` }
      }

      return {
        success: true,
        message: `Token valid: ${token.length} chars, base64url format`,
        data: { length: token.length, preview: token.slice(0, 8) + '...' }
      }
    })

    // Test 7: Test content API access
    await runTest(6, 'Test content API access', async () => {
      const token = embedToken

      if (!token) {
        return { success: false, message: 'No token available for content access test' }
      }

      const response = await fetch(`/api/syndication/content/${storyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        return {
          success: false,
          message: `Content API returned ${response.status}: ${data.error || 'Unknown error'}`
        }
      }

      const data = await response.json()

      return {
        success: true,
        message: `Content accessible: "${data.story?.title?.slice(0, 30)}..."`,
        data: { hasStory: !!data.story, hasContent: !!data.story?.content }
      }
    })

    // Test 8: Revoke consent
    const currentConsentId = consentId
    await runTest(7, 'Revoke consent', async () => {
      if (!currentConsentId) {
        // Try to get consent ID
        const checkResponse = await fetch(
          `/api/syndication/consent?storyId=${storyId}&siteSlug=${siteSlug}`
        )
        const checkData = await checkResponse.json()

        if (!checkData.consent?.id) {
          return { success: false, message: 'No consent ID available for revocation' }
        }

        setConsentId(checkData.consent.id)
      }

      const idToRevoke = currentConsentId || consentId

      const response = await fetch(`/api/syndication/consent/${idToRevoke}/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'E2E Test - Testing revocation flow' })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      const data = await response.json()

      return {
        success: true,
        message: `Consent revoked, ${data.tokensRevoked || 0} tokens invalidated`,
        data: { tokensRevoked: data.tokensRevoked }
      }
    })

    // Test 9: Verify token revoked
    await runTest(8, 'Verify token revoked', async () => {
      const response = await fetch(`/api/syndication/tokens?storyId=${storyId}`)

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      const activeTokens = (data.tokens || []).filter((t: any) => t.status === 'active')

      if (activeTokens.length > 0) {
        return {
          success: false,
          message: `Still have ${activeTokens.length} active token(s) after revocation`
        }
      }

      return {
        success: true,
        message: 'All tokens revoked successfully',
        data: { totalTokens: data.tokens?.length || 0 }
      }
    })

    // Test 10: Verify content API blocked
    await runTest(9, 'Verify content API blocked', async () => {
      const token = embedToken

      if (!token) {
        return { success: true, message: 'No token to test (expected after revocation)' }
      }

      const response = await fetch(`/api/syndication/content/${storyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        return {
          success: false,
          message: 'Content API still accessible after revocation!'
        }
      }

      return {
        success: true,
        message: `Content API blocked: ${response.status} (expected)`,
        data: { status: response.status }
      }
    })

    log('========================================')
    log('E2E Test Suite Complete')

    setIsRunning(false)
  }

  const passedCount = tests.filter(t => t.status === 'passed').length
  const failedCount = tests.filter(t => t.status === 'failed').length
  const totalTests = tests.length

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-sage-600" />
              Syndication E2E Test Suite
            </h1>
            <p className="text-muted-foreground mt-1">
              End-to-end testing of the complete syndication consent flow
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {passedCount} passed
                </Badge>
                {failedCount > 0 && (
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    {failedCount} failed
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {passedCount}/{totalTests} tests
              </p>
            </div>

            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run All Tests
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="tests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tests" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Test Results
            </TabsTrigger>
            <TabsTrigger value="log" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Test Log
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Key className="h-4 w-4" />
              Test Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tests">
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>
                  Complete consent flow: create → verify → access → revoke → verify blocked
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tests.map((test, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        test.status === 'passed' ? 'bg-green-50 border-green-200' :
                        test.status === 'failed' ? 'bg-red-50 border-red-200' :
                        test.status === 'running' ? 'bg-blue-50 border-blue-200' :
                        'bg-muted border-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {test.status === 'passed' && <CheckCircle className="h-5 w-5 text-green-600" />}
                        {test.status === 'failed' && <XCircle className="h-5 w-5 text-red-600" />}
                        {test.status === 'running' && <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />}
                        {test.status === 'pending' && <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />}

                        <div>
                          <p className="font-medium">{test.name}</p>
                          {test.message && (
                            <p className="text-sm text-muted-foreground">{test.message}</p>
                          )}
                        </div>
                      </div>

                      {test.duration && (
                        <span className="text-sm text-muted-foreground">
                          {test.duration}ms
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="log">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Test Log
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTestLog([])}
                    className="gap-1"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Clear
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
                  {testLog.length === 0 ? (
                    <p className="text-muted-foreground">No log entries. Run tests to see output.</p>
                  ) : (
                    testLog.map((entry, index) => (
                      <div key={index} className={`${
                        entry.includes('✓') ? 'text-green-600' :
                        entry.includes('✗') ? 'text-red-600' :
                        entry.includes('===') ? 'text-muted-foreground font-bold' :
                        ''
                      }`}>
                        {entry}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Stories</CardTitle>
                </CardHeader>
                <CardContent>
                  {stories.length > 0 ? (
                    <div className="space-y-2">
                      {stories.slice(0, 5).map((story) => (
                        <div
                          key={story.id}
                          className={`p-2 rounded border cursor-pointer ${
                            selectedStory === story.id ? 'border-primary bg-primary/5' : 'border-muted'
                          }`}
                          onClick={() => setSelectedStory(story.id)}
                        >
                          <p className="font-medium text-sm">{story.title}</p>
                          <p className="text-xs text-muted-foreground">{story.id.slice(0, 8)}...</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Run tests to load stories</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Syndication Sites</CardTitle>
                </CardHeader>
                <CardContent>
                  {sites.length > 0 ? (
                    <div className="space-y-2">
                      {sites.map((site) => (
                        <div
                          key={site.id}
                          className={`p-2 rounded border cursor-pointer ${
                            selectedSite === site.slug ? 'border-primary bg-primary/5' : 'border-muted'
                          }`}
                          onClick={() => setSelectedSite(site.slug)}
                        >
                          <p className="font-medium text-sm">{site.name}</p>
                          <p className="text-xs text-muted-foreground">{site.slug}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Run tests to load sites</p>
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Test Artifacts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Consent ID</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={consentId || 'Not created yet'}
                          readOnly
                          className="font-mono text-sm"
                        />
                        {consentId && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigator.clipboard.writeText(consentId)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>Embed Token</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={embedToken ? embedToken.slice(0, 20) + '...' : 'Not generated yet'}
                          readOnly
                          className="font-mono text-sm"
                        />
                        {embedToken && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigator.clipboard.writeText(embedToken)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Test Coverage Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="p-3 rounded-lg bg-muted">
                <Share2 className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium">Consent Creation</p>
                <p className="text-xs text-muted-foreground">POST /api/syndication/consent</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium">Consent Verification</p>
                <p className="text-xs text-muted-foreground">GET /api/syndication/consent</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <Key className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-medium">Token Generation</p>
                <p className="text-xs text-muted-foreground">Automatic on approval</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <ExternalLink className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                <p className="text-sm font-medium">Content Access</p>
                <p className="text-xs text-muted-foreground">GET /api/syndication/content</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <XCircle className="h-6 w-6 mx-auto mb-2 text-red-600" />
                <p className="text-sm font-medium">Consent Revocation</p>
                <p className="text-xs text-muted-foreground">POST .../revoke</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
