'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import {
  Webhook,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  Send,
  Settings,
  Loader2,
  ExternalLink
} from 'lucide-react'

interface WebhookLog {
  id: string
  site_id: string
  event_type: string
  payload: any
  status: 'pending' | 'delivered' | 'failed'
  status_code?: number
  error_message?: string
  retryable: boolean
  retry_count: number
  delivered_at?: string
  created_at: string
  site?: {
    name: string
    slug: string
  }
}

interface SyndicationSite {
  id: string
  slug: string
  name: string
  webhook_url?: string
  webhook_secret?: string
  webhook_events?: string[]
  status: string
}

export default function WebhooksAdminPage() {
  const [logs, setLogs] = useState<WebhookLog[]>([])
  const [sites, setSites] = useState<SyndicationSite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRetrying, setIsRetrying] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    failed: 0,
    pending: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch logs
      const logsResponse = await fetch('/api/admin/webhooks/delivery-logs')
      if (logsResponse.ok) {
        const logsData = await logsResponse.json()
        setLogs(logsData.logs || [])
        setStats(logsData.stats || { total: 0, delivered: 0, failed: 0, pending: 0 })
      }

      // Fetch sites
      const sitesResponse = await fetch('/api/syndication/sites')
      if (sitesResponse.ok) {
        const sitesData = await sitesResponse.json()
        setSites(sitesData.sites || [])
      }
    } catch (error) {
      console.error('Error fetching webhook data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const retryFailed = async () => {
    setIsRetrying(true)
    try {
      const response = await fetch('/api/admin/webhooks/retry', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Retried ${data.retriedCount} webhooks`)
        fetchData()
      }
    } catch (error) {
      console.error('Error retrying webhooks:', error)
    } finally {
      setIsRetrying(false)
    }
  }

  const testWebhook = async (siteId: string) => {
    try {
      const response = await fetch('/api/admin/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId })
      })

      const data = await response.json()
      if (data.success) {
        alert('Test webhook sent successfully!')
      } else {
        alert(`Webhook test failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Error testing webhook:', error)
      alert('Failed to send test webhook')
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Delivered</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getEventBadge = (event: string) => {
    switch (event) {
      case 'consent.granted':
        return <Badge variant="outline" className="bg-green-50 text-green-700">consent.granted</Badge>
      case 'consent.revoked':
        return <Badge variant="outline" className="bg-red-50 text-red-700">consent.revoked</Badge>
      case 'content.updated':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">content.updated</Badge>
      case 'content.unpublished':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700">content.unpublished</Badge>
      default:
        return <Badge variant="outline">{event}</Badge>
    }
  }

  const failedCount = stats.failed
  const successRate = stats.total > 0 ? ((stats.delivered / stats.total) * 100).toFixed(1) : '0'

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Webhook className="h-6 w-6 text-blue-600" />
              Webhook Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor and manage syndication webhook deliveries
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={fetchData}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {failedCount > 0 && (
              <Button
                onClick={retryFailed}
                disabled={isRetrying}
                className="gap-2"
              >
                {isRetrying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Retry Failed ({failedCount})
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Total Webhooks</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Delivered</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.delivered}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-muted-foreground">Failed</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.failed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-muted-foreground">Success Rate</span>
              </div>
              <p className="text-2xl font-bold mt-1">{successRate}%</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="logs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="logs" className="gap-2">
              <Clock className="h-4 w-4" />
              Delivery Logs
            </TabsTrigger>
            <TabsTrigger value="sites" className="gap-2">
              <Settings className="h-4 w-4" />
              Site Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Recent Webhook Deliveries</CardTitle>
                <CardDescription>
                  Last 100 webhook delivery attempts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No webhook deliveries yet
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Site</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Response</TableHead>
                        <TableHead>Retries</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{getEventBadge(log.event_type)}</TableCell>
                          <TableCell>{log.site?.name || 'Unknown'}</TableCell>
                          <TableCell>{getStatusBadge(log.status)}</TableCell>
                          <TableCell>
                            {log.status_code && (
                              <span className="font-mono text-sm">
                                {log.status_code}
                              </span>
                            )}
                            {log.error_message && (
                              <span className="text-xs text-red-600 block truncate max-w-[200px]">
                                {log.error_message}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{log.retry_count}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(log.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sites">
            <Card>
              <CardHeader>
                <CardTitle>Syndication Site Webhooks</CardTitle>
                <CardDescription>
                  Configure webhook endpoints for each syndication site
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sites.map((site) => (
                    <div
                      key={site.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{site.name}</h3>
                          <Badge variant="outline">{site.slug}</Badge>
                          <Badge className={site.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                            {site.status}
                          </Badge>
                        </div>
                        {site.webhook_url ? (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            {site.webhook_url}
                          </p>
                        ) : (
                          <p className="text-sm text-amber-600">No webhook configured</p>
                        )}
                        {site.webhook_events && site.webhook_events.length > 0 && (
                          <div className="flex gap-1 flex-wrap mt-1">
                            {site.webhook_events.map(event => (
                              <Badge key={event} variant="secondary" className="text-xs">
                                {event}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {site.webhook_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testWebhook(site.id)}
                            className="gap-1"
                          >
                            <Send className="h-3 w-3" />
                            Test
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}
