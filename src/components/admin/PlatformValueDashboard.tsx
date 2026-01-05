'use client'

import { useState, useEffect } from 'react'
import {
  Brain,
  Database,
  FileText,
  Share2,
  Users,
  TrendingUp,
  Shield,
  BookOpen,
  Layers,
  Sparkles,
  Globe,
  Activity,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import KnowledgeSearch from './KnowledgeSearch'

interface KnowledgeBaseStats {
  totalDocuments: number
  totalChunks: number
  totalExtractions: number
  totalRelationships: number
  documentsByCategory: Record<string, number>
  averageConfidence: number
  culturalSafetyCoverage: number
}

interface PlatformStats {
  totalStorytellers: number
  totalStories: number
  totalOrganizations: number
  totalProjects: number
  activeUsers: number
}

interface SyndicationStats {
  totalSites: number
  activeDistributions: number
  pendingRequests: number
  totalRevenue: number
}

export default function PlatformValueDashboard() {
  const [kbStats, setKbStats] = useState<KnowledgeBaseStats | null>(null)
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [syndicationStats, setSyndicationStats] = useState<SyndicationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      // Fetch knowledge base stats
      const kbResponse = await fetch('/api/knowledge-base/stats')
      if (kbResponse.ok) {
        const kbData = await kbResponse.json()
        setKbStats(kbData)
      } else {
        // Use demo data if API not available
        setKbStats({
          totalDocuments: 231,
          totalChunks: 22506,
          totalExtractions: 506,
          totalRelationships: 0,
          documentsByCategory: {
            Method: 8,
            Practice: 35,
            Principle: 170,
            Procedure: 18
          },
          averageConfidence: 0.91,
          culturalSafetyCoverage: 0.925
        })
      }

      // Demo platform stats
      setPlatformStats({
        totalStorytellers: 127,
        totalStories: 89,
        totalOrganizations: 12,
        totalProjects: 34,
        activeUsers: 45
      })

      // Demo syndication stats
      setSyndicationStats({
        totalSites: 6,
        activeDistributions: 3,
        pendingRequests: 2,
        totalRevenue: 1250.50
      })

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Value Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Ecosystem capabilities and AI-powered features
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={fetchStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-violet-100 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Knowledge Base
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{kbStats?.totalChunks.toLocaleString()}</div>
            <p className="text-violet-200 text-sm mt-1">Semantic chunks indexed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Training Examples
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{kbStats?.totalExtractions.toLocaleString()}</div>
            <p className="text-emerald-200 text-sm mt-1">Q&A pairs for SLM</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Storytellers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{platformStats?.totalStorytellers}</div>
            <p className="text-blue-200 text-sm mt-1">Active community members</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-100 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Syndication Sites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{syndicationStats?.totalSites}</div>
            <p className="text-amber-200 text-sm mt-1">Partner organizations</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="knowledge" className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="platform">Platform</TabsTrigger>
          <TabsTrigger value="syndication">Syndication</TabsTrigger>
        </TabsList>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Document Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-violet-600" />
                  Documentation by Category
                </CardTitle>
                <CardDescription>PMPP Framework distribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {kbStats?.documentsByCategory && Object.entries(kbStats.documentsByCategory).map(([category, count]) => {
                  const total = kbStats.totalDocuments
                  const percentage = Math.round((count / total) * 100)
                  const colors: Record<string, string> = {
                    Principle: 'bg-violet-500',
                    Method: 'bg-blue-500',
                    Practice: 'bg-emerald-500',
                    Procedure: 'bg-amber-500'
                  }
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{category}</span>
                        <span className="text-gray-500">{count} docs ({percentage}%)</span>
                      </div>
                      <Progress value={percentage} className="h-2" indicatorClassName={colors[category] || 'bg-gray-500'} />
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Quality Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  Quality & Safety Metrics
                </CardTitle>
                <CardDescription>AI extraction confidence and cultural safety</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">Average Confidence</span>
                    <span className="font-bold text-emerald-600">{((kbStats?.averageConfidence || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(kbStats?.averageConfidence || 0) * 100} className="h-3" indicatorClassName="bg-emerald-500" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">Cultural Safety</span>
                    <span className="font-bold text-blue-600">{((kbStats?.culturalSafetyCoverage || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(kbStats?.culturalSafetyCoverage || 0) * 100} className="h-3" indicatorClassName="bg-blue-500" />
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-violet-50 rounded-lg">
                      <FileText className="h-6 w-6 text-violet-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-violet-900">{kbStats?.totalDocuments}</div>
                      <div className="text-xs text-violet-700">Documents</div>
                    </div>
                    <div className="text-center p-4 bg-emerald-50 rounded-lg">
                      <BookOpen className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-emerald-900">{kbStats?.totalExtractions}</div>
                      <div className="text-xs text-emerald-700">Q&A Pairs</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Capabilities
              </CardTitle>
              <CardDescription>Features powered by the knowledge base</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg hover:border-purple-300 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Database className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">RAG Search</h3>
                  </div>
                  <p className="text-sm text-gray-600">Semantic search across {kbStats?.totalChunks.toLocaleString()} chunks with 70-90% accuracy</p>
                  <Badge className="mt-2 bg-purple-100 text-purple-800 border-0">Active</Badge>
                </div>

                <div className="p-4 border rounded-lg hover:border-emerald-300 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Sparkles className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">SLM Training</h3>
                  </div>
                  <p className="text-sm text-gray-600">{kbStats?.totalExtractions} Q&A pairs ready for fine-tuning specialized models</p>
                  <Badge className="mt-2 bg-emerald-100 text-emerald-800 border-0">Ready</Badge>
                </div>

                <div className="p-4 border rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Cultural Safety</h3>
                  </div>
                  <p className="text-sm text-gray-600">{((kbStats?.culturalSafetyCoverage || 0) * 100).toFixed(0)}% of extractions verified for cultural safety</p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800 border-0">Protected</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Knowledge Search */}
          <KnowledgeSearch />
        </TabsContent>

        {/* Platform Tab */}
        <TabsContent value="platform" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Storytellers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{platformStats?.totalStorytellers}</div>
                <p className="text-xs text-gray-500 mt-1">Community members</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Stories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{platformStats?.totalStories}</div>
                <p className="text-xs text-gray-500 mt-1">Published stories</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Organizations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{platformStats?.totalOrganizations}</div>
                <p className="text-xs text-gray-500 mt-1">Partner orgs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{platformStats?.activeUsers}</div>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Platform Capabilities
              </CardTitle>
              <CardDescription>Multi-tenant storytelling platform features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Cultural Safety Protocols</h4>
                    <p className="text-sm text-gray-600 mt-1">OCAP principles, consent management, and cultural sensitivity controls</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Brain className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">AI-Powered Analysis</h4>
                    <p className="text-sm text-gray-600 mt-1">Transcript analysis, theme extraction, and quote identification</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Layers className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Multi-Tenant Architecture</h4>
                    <p className="text-sm text-gray-600 mt-1">Organizations, projects, and storytellers with granular permissions</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Share2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Story Syndication</h4>
                    <p className="text-sm text-gray-600 mt-1">Controlled sharing with revenue share and consent tracking</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Syndication Tab */}
        <TabsContent value="syndication" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Partner Sites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{syndicationStats?.totalSites}</div>
                <p className="text-xs text-gray-500 mt-1">ACT Farm network</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Active Shares
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{syndicationStats?.activeDistributions}</div>
                <p className="text-xs text-gray-500 mt-1">Stories syndicated</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{syndicationStats?.pendingRequests}</div>
                <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">${syndicationStats?.totalRevenue.toFixed(0)}</div>
                <p className="text-xs text-gray-500 mt-1">Total earned</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-blue-600" />
                Syndication Network
              </CardTitle>
              <CardDescription>ACT Farm partner sites ready for story distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'JusticeHub', focus: 'Youth justice stories', status: 'active' },
                  { name: 'The Harvest', focus: 'Food & agriculture', status: 'active' },
                  { name: 'Territory Voices', focus: 'First Nations perspectives', status: 'active' },
                  { name: 'Digital Pathways', focus: 'Technology & training', status: 'pending' },
                  { name: 'Health Futures', focus: 'Health & wellbeing', status: 'pending' },
                  { name: 'Climate Action', focus: 'Environmental stories', status: 'pending' }
                ].map(site => (
                  <div key={site.name} className="p-4 border rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{site.name}</h4>
                      <Badge className={site.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                        {site.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{site.focus}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
