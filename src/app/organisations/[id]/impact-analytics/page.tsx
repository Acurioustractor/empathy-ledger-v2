export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StorytellerAnalyticsDashboard } from '@/components/analytics/StorytellerAnalyticsDashboard'
import { CrossSectorInsights } from '@/components/analytics/CrossSectorInsights'
import { PhilanthropyIntelligenceDashboard } from '@/components/analytics/PhilanthropyIntelligenceDashboard'
import {
  BarChart3,
  Network,
  TrendingUp,
  Users,
  Target,
  Lightbulb,
  Star,
  Zap
} from 'lucide-react'

interface ImpactAnalyticsPageProps {
  params: Promise<{ id: string }>
}

export default async function ImpactAnalyticsPage({ params }: ImpactAnalyticsPageProps) {
  const { id: organizationId } = await params

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Zap className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Advanced Impact Analytics
          </h1>
        </div>
        <p className="text-xl text-grey-600 max-w-3xl mx-auto">
          Comprehensive storyteller-centric analytics with real-time community impact scoring,
          cross-sector insights, and AI-powered philanthropy intelligence
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Badge className="bg-green-100 text-green-800">
            <Target className="h-3 w-3 mr-1" />
            Hub & Spoke Model
          </Badge>
          <Badge className="bg-blue-100 text-blue-800">
            <BarChart3 className="h-3 w-3 mr-1" />
            Real-time Scoring
          </Badge>
          <Badge className="bg-purple-100 text-purple-800">
            <Lightbulb className="h-3 w-3 mr-1" />
            AI Intelligence
          </Badge>
        </div>
      </div>

      {/* System Overview */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Network className="h-6 w-6 mr-2" />
            System Architecture Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white rounded-lg border">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-2">Storyteller Hub</h3>
              <p className="text-sm text-grey-600">
                Individual storytellers at the centre with comprehensive impact metrics,
                network connections, and personal analytics dashboards
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <Network className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-2">Cross-Sector Spokes</h3>
              <p className="text-sm text-grey-600">
                Connections radiating outward showing collaboration opportunities,
                sector bridges, and policy change potential
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <Star className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-2">Investment Intelligence</h3>
              <p className="text-sm text-grey-600">
                AI-powered philanthropy insights with opportunity identification,
                risk assessment, and portfolio optimization
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs defaultValue="storyteller" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="storyteller" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Storyteller Analytics
          </TabsTrigger>
          <TabsTrigger value="cross-sector" className="flex items-center">
            <Network className="h-4 w-4 mr-2" />
            Cross-Sector Insights
          </TabsTrigger>
          <TabsTrigger value="philanthropy" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Philanthropy Intelligence
          </TabsTrigger>
        </TabsList>

        <TabsContent value="storyteller" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Individual Storyteller Impact Analytics
              </CardTitle>
              <p className="text-sm text-grey-600">
                Hub-centred view with 8 impact types, network connections, content analytics, and influence metrics
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">🎯 Impact Measurement Types</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <Badge variant="outline">Cultural Protocol</Badge>
                    <Badge variant="outline">Community Leadership</Badge>
                    <Badge variant="outline">Knowledge Transmission</Badge>
                    <Badge variant="outline">Healing Integration</Badge>
                    <Badge variant="outline">Relationship Building</Badge>
                    <Badge variant="outline">System Navigation</Badge>
                    <Badge variant="outline">Collective Mobilization</Badge>
                    <Badge variant="outline">Intergenerational Connection</Badge>
                  </div>
                </div>

                <div className="text-center py-4">
                  <p className="text-grey-600 mb-4">Select a storyteller to view their comprehensive analytics dashboard</p>
                  <Button disabled className="bg-grey-100 text-grey-500">
                    Demo: Select Storyteller Required
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cross-sector" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Network className="h-5 w-5 mr-2" />
                Cross-Sector Connection Analysis
              </CardTitle>
              <p className="text-sm text-grey-600">
                Visualization of how storytellers connect across different sectors and collaboration opportunities
              </p>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading cross-sector insights...</span>
                  </div>
                }
              >
                <CrossSectorInsights organizationId={organizationId} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="philanthropy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                AI-Powered Philanthropy Intelligence
              </CardTitle>
              <p className="text-sm text-grey-600">
                Investment opportunity identification, portfolio performance tracking, and strategic recommendations
              </p>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-2">Loading philanthropy intelligence...</span>
                  </div>
                }
              >
                <PhilanthropyIntelligenceDashboard organizationId={organizationId} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Key Features Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center">
          <CardContent className="p-6">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Real-time Impact Scoring</h3>
            <p className="text-sm text-grey-600">
              Live calculation of 8 community impact types with evidence-based confidence metrics
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <Network className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Network Mapping</h3>
            <p className="text-sm text-grey-600">
              AI-powered analysis of storyteller connections through shared themes and collaboration patterns
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Content Analytics</h3>
            <p className="text-sm text-grey-600">
              Theme extraction, velocity tracking, and impact measurement from stories and transcripts
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <Lightbulb className="h-8 w-8 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Investment Intelligence</h3>
            <p className="text-sm text-grey-600">
              AI-generated opportunities with risk assessment, readiness scoring, and portfolio optimization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Technical Implementation Notes */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg">🚀 Implementation Highlights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">🏗️ Architecture</h4>
              <ul className="space-y-1 text-grey-600">
                <li>• Hub and spoke model with storytellers at centre</li>
                <li>• Real-time API endpoints for analytics</li>
                <li>• Supabase service role for comprehensive data access</li>
                <li>• React Server Components for performance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🤖 AI Features</h4>
              <ul className="space-y-1 text-grey-600">
                <li>• Theme extraction from transcript metadata</li>
                <li>• Network connection discovery through shared themes</li>
                <li>• Investment opportunity scoring and risk assessment</li>
                <li>• Cross-sector collaboration identification</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}