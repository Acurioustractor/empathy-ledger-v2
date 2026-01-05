'use client'

import { useState, useEffect } from 'react'
import {
  Share2,
  Globe,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Users,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ConsentData {
  id: string
  story_id: string
  site_id: string
  status: 'pending' | 'approved' | 'denied' | 'revoked' | 'expired'
  approved_at: string | null
  created_at: string
  allow_full_content: boolean
  allow_media_assets: boolean
  allow_analytics: boolean
  revenue_share_percentage: number
  site: {
    slug: string
    name: string
    description: string
    purpose: string
    audience: string
  }
  story: {
    id: string
    title: string
  }
}

interface EngagementData {
  story_id: string
  views: number
  clicks: number
  shares: number
}

interface RevenueData {
  totalEarned: number
  pendingPayout: number
  thisMonth: number
  topStory: string
  topStoryEarnings: number
}

export default function SyndicationDashboard() {
  const [consents, setConsents] = useState<ConsentData[]>([])
  const [engagements, setEngagements] = useState<Record<string, EngagementData>>({})
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState<string | null>(null)

  // Fetch consents on mount
  useEffect(() => {
    fetchConsents()
  }, [])

  async function fetchConsents() {
    try {
      setLoading(true)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Authentication required', {
          description: 'Please log in to view your syndicated content'
        })
        return
      }

      // Fetch all consents for this storyteller
      const { data, error } = await supabase
        .from('syndication_consent')
        .select(`
          *,
          site:syndication_sites!syndication_consent_site_id_fkey(slug, name, description, purpose, audience),
          story:stories!syndication_consent_story_id_fkey(id, title)
        `)
        .eq('storyteller_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching consents:', error)
        toast.error('Error loading consents', {
          description: error.message
        })
        return
      }

      setConsents(data || [])

      // Fetch engagement data for approved consents
      const approvedStoryIds = (data || [])
        .filter(c => c.status === 'approved')
        .map(c => c.story_id)

      if (approvedStoryIds.length > 0) {
        await fetchEngagements(approvedStoryIds)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error', {
        description: 'Failed to load syndication data'
      })
    } finally {
      setLoading(false)
    }
  }

  async function fetchEngagements(storyIds: string[]) {
    try {
      // Aggregate engagement events by story
      const { data, error } = await supabase
        .from('syndication_engagement_events')
        .select('story_id, event_type')
        .in('story_id', storyIds)

      if (error) {
        console.error('Error fetching engagements:', error)
        return
      }

      // Count events by type for each story
      const aggregated: Record<string, EngagementData> = {}

      storyIds.forEach(storyId => {
        const events = data?.filter(e => e.story_id === storyId) || []
        aggregated[storyId] = {
          story_id: storyId,
          views: events.filter(e => e.event_type === 'view').length,
          clicks: events.filter(e => e.event_type === 'click').length,
          shares: events.filter(e => e.event_type === 'share').length
        }
      })

      setEngagements(aggregated)
    } catch (error) {
      console.error('Error aggregating engagements:', error)
    }
  }

  async function handleRevoke(consentId: string) {
    try {
      setRevoking(consentId)

      const response = await fetch(`/api/syndication/consent/${consentId}/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Revoked by storyteller via dashboard'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to revoke consent')
      }

      toast.success('Consent revoked', {
        description: 'Your story has been removed from the external site'
      })

      // Refresh consents
      await fetchConsents()
    } catch (error: any) {
      console.error('Error revoking consent:', error)
      toast.error('Error', {
        description: error.message
      })
    } finally {
      setRevoking(null)
    }
  }

  // Calculate stats from real data
  const activeConsents = consents.filter(c => c.status === 'approved')
  const pendingConsents = consents.filter(c => c.status === 'pending')
  const totalViews = Object.values(engagements).reduce((sum, e) => sum + e.views, 0)

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-lg text-gray-600">Loading your syndication data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Share Your Stories
        </h1>
        <p className="text-lg text-gray-600">
          Control where your stories appear and earn when organizations use them
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Active Distributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {activeConsents.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Stories shared across sites</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {pendingConsents.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting your decision</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              $0.00
            </div>
            <p className="text-xs text-gray-500 mt-1">Revenue tracking coming soon</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-violet-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Reach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Views across all sites</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="requests" className="relative">
            Requests
            {pendingConsents.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingConsents.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        {/* Pending Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          {pendingConsents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Share2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No pending requests</p>
                <p className="text-gray-400 text-sm mt-2">
                  When organizations want to share your stories, they'll appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingConsents.map(consent => (
              <Card key={consent.id} className="border-2 hover:border-blue-300 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Globe className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-xl">{consent.site.name}</CardTitle>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          {consent.revenue_share_percentage}% revenue share
                        </Badge>
                      </div>
                      <CardDescription className="text-base">
                        Wants to share: <span className="font-medium text-gray-700">{consent.story.title}</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900 mb-1">Why they want your story:</p>
                    <p className="text-sm text-blue-800">{consent.site.purpose}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Who will see it:</p>
                      <p className="text-gray-900 font-medium">{consent.site.audience}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Requested:</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(consent.created_at).toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
                    <Clock className="h-4 w-4 inline mr-2" />
                    <strong>Pending elder approval</strong> - This story requires cultural permission before syndication
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
                    <AlertCircle className="h-3 w-3 inline mr-1" />
                    You can revoke consent anytime, even after approval.
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Active Distributions Tab */}
        <TabsContent value="active" className="space-y-4">
          {activeConsents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No active distributions</p>
                <p className="text-gray-400 text-sm mt-2">
                  Grant consent to start sharing your stories across the ACT ecosystem
                </p>
              </CardContent>
            </Card>
          ) : (
            activeConsents.map(consent => {
              const engagement = engagements[consent.story_id] || { views: 0, clicks: 0, shares: 0 }
              return (
                <Card key={consent.id} className="border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                          <CardTitle className="text-xl">{consent.site.name}</CardTitle>
                          <Badge className="bg-emerald-100 text-emerald-800 border-0">
                            Active
                          </Badge>
                        </div>
                        <CardDescription className="text-base">
                          {consent.story.title}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-900">{engagement.views.toLocaleString()}</div>
                        <div className="text-xs text-blue-700 mt-1">Views</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-900">{engagement.clicks}</div>
                        <div className="text-xs text-purple-700 mt-1">Clicks</div>
                      </div>
                      <div className="text-center p-4 bg-pink-50 rounded-lg">
                        <div className="text-2xl font-bold text-pink-900">{engagement.shares}</div>
                        <div className="text-xs text-pink-700 mt-1">Shares</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm pt-4 border-t">
                      <div className="text-gray-500">
                        Sharing since {new Date(consent.approved_at || consent.created_at).toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <Button
                        onClick={() => handleRevoke(consent.id)}
                        variant="outline"
                        size="sm"
                        disabled={revoking === consent.id}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        {revoking === consent.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Revoking...
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Stop Sharing
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardHeader>
                <CardTitle className="text-emerald-900">Total Earned</CardTitle>
                <CardDescription className="text-emerald-700">Lifetime earnings from syndication</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-emerald-900">
                  $0.00
                </div>
                <p className="text-sm text-emerald-700 mt-2">Revenue tracking coming soon</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Pending Payout</CardTitle>
                <CardDescription className="text-blue-700">Your next payment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-900">
                  $0.00
                </div>
                <div className="mt-3 p-3 bg-white/60 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-1">Payment Schedule</p>
                  <p className="text-xs text-blue-700">
                    Payments are processed on the <strong>15th of each month</strong> for earnings from the previous month.
                    Minimum payout is $50. Amounts under $50 roll over to the next month.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-50">
            <CardContent className="py-8 text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Revenue Tracking</p>
              <p className="text-sm text-gray-500">
                Coming in Sprint 3 - Earn when organizations use your stories
              </p>
            </CardContent>
          </Card>

          {/* Payment Information Card */}
          <Card className="border-2 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-900 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                How Payments Work
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-white rounded-lg border border-amber-100">
                  <p className="font-medium text-amber-900">When</p>
                  <p className="text-amber-700 text-xs mt-1">15th of each month for previous month&apos;s earnings</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-amber-100">
                  <p className="font-medium text-amber-900">Minimum</p>
                  <p className="text-amber-700 text-xs mt-1">$50 minimum payout (smaller amounts roll over)</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-amber-100">
                  <p className="font-medium text-amber-900">Method</p>
                  <p className="text-amber-700 text-xs mt-1">Bank transfer to your linked account</p>
                </div>
              </div>
              <p className="text-xs text-amber-700">
                Questions about payments? Contact support@empathy-ledger.com
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
