'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Network,
  TrendingUp,
  Users,
  Target,
  ArrowRight,
  Building,
  MapPin,
  DollarSign,
  Lightbulb,
  RefreshCcw,
  Activity,
  Zap,
  Globe
} from 'lucide-react'

interface CrossSectorConnection {
  sectors: [string, string]
  connectionStrength: number
  sharedStorytellers: number
  storytellerIds: string[]
}

interface SectorImpactData {
  sector: string
  storytellerCount: number
  avgContentPerStoryteller: number
  topThemes: string[]
  dominantChangeMakerTypes: string[]
  geographicReach: string[]
  impactPotential: number
}

interface CollaborationOpportunity {
  sectors: [string, string]
  storyteller: string
  storytellerId: string
  sharedThemes: string[]
  collaborationType: string
  potential: string
  evidence: string
}

interface PolicyChangePotential {
  sector: string
  storytellerCount: number
  topThemes: string[]
  urgency: string
  changeType: string
  stakeholders: string[]
  potential: string
}

interface InvestmentInsights {
  highImpactSectors: Array<{
    sector: string
    impactPotential: number
    storytellerCount: number
    evidence: string
  }>
  readyForInvestment: Array<{
    sector: string
    readinessScore: number
    leadershipCapacity: number
    requiredInvestment: string
    timeToImpact: string
  }>
}

interface CrossSectorAnalysis {
  success: boolean
  organisation: {
    id: string
    name: string
    tenantId: string
  }
  analysis: {
    totalStorytellers: number
    totalAnalyzedContent: number
    crossSectorConnections: CrossSectorConnection[]
    sectorImpactMap: SectorImpactData[]
    collaborationOpportunities: CollaborationOpportunity[]
    policyChangePotential: PolicyChangePotential[]
    investmentInsights: InvestmentInsights
  }
}

interface CrossSectorInsightsProps {
  organizationId: string
}

export function CrossSectorInsights({ organizationId }: CrossSectorInsightsProps) {
  const [data, setData] = useState<CrossSectorAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchInsights = async () => {
    try {
      setRefreshing(true)
      const response = await fetch(`/api/organisations/${organizationId}/cross-sector-insights`)

      if (!response.ok) {
        throw new Error(`Failed to fetch insights: ${response.statusText}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch insights')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [organizationId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-stone-200 rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-stone-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Network className="w-5 h-5" />
            Error Loading Cross-Sector Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-stone-600">{error || 'Failed to load insights'}</p>
          <Button onClick={fetchInsights} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const getConnectionColor = (strength: number) => {
    if (strength >= 70) return 'bg-green-500'
    if (strength >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-stone-100 text-stone-800'
    }
  }

  const getInvestmentColor = (size: string) => {
    switch (size) {
      case 'large': return 'bg-clay-100 text-clay-800'
      case 'medium': return 'bg-sage-100 text-sage-800'
      case 'small': return 'bg-green-100 text-green-800'
      default: return 'bg-stone-100 text-stone-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Cross-Sector Insights</h2>
          <p className="text-stone-600 mt-1">
            {data.organisation.name} • {data.analysis.totalStorytellers} storytellers across sectors
          </p>
        </div>
        <Button
          onClick={fetchInsights}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCcw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-sage-600" />
              Storytellers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-sage-600 mb-1">
              {data.analysis.totalStorytellers}
            </div>
            <p className="text-sm text-stone-600">Active across sectors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {data.analysis.totalAnalyzedContent}
            </div>
            <p className="text-sm text-stone-600">Analyzed pieces</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Network className="w-5 h-5 text-clay-600" />
              Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-clay-600 mb-1">
              {data.analysis.crossSectorConnections.length}
            </div>
            <p className="text-sm text-stone-600">Cross-sector links</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-600" />
              Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {data.analysis.collaborationOpportunities.length}
            </div>
            <p className="text-sm text-stone-600">Collaboration potential</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="connections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connections">Sector Connections</TabsTrigger>
          <TabsTrigger value="impact">Impact Map</TabsTrigger>
          <TabsTrigger value="opportunities">Collaboration</TabsTrigger>
          <TabsTrigger value="investment">Investment Insights</TabsTrigger>
        </TabsList>

        {/* Sector Connections */}
        <TabsContent value="connections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5" />
                Cross-Sector Connection Strength
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.analysis.crossSectorConnections.slice(0, 8).map((connection, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-sage-50 text-sage-700">
                          {connection.sectors[0]}
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-stone-400" />
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {connection.sectors[1]}
                        </Badge>
                      </div>
                      <div className="text-sm text-stone-600">
                        {connection.sharedStorytellers} shared storytellers
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-stone-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getConnectionColor(connection.connectionStrength)}`}
                          style={{ width: `${connection.connectionStrength}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-stone-900 w-12">
                        {connection.connectionStrength}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Impact Map */}
        <TabsContent value="impact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.analysis.sectorImpactMap.slice(0, 8).map((sector, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      {sector.sector}
                    </span>
                    <Badge className="bg-sage-100 text-sage-800">
                      {sector.storytellerCount} storytellers
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Impact Potential</span>
                        <span className="text-lg font-bold text-sage-600">
                          {sector.impactPotential}%
                        </span>
                      </div>
                      <Progress value={sector.impactPotential} className="h-2" />
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-stone-900 mb-2">Top Themes</h4>
                      <div className="flex flex-wrap gap-1">
                        {sector.topThemes.map((theme, themeIndex) => (
                          <Badge key={themeIndex} variant="outline" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-stone-900 mb-2">Change Maker Types</h4>
                      <div className="flex flex-wrap gap-1">
                        {sector.dominantChangeMakerTypes.map((type, typeIndex) => (
                          <Badge key={typeIndex} variant="outline" className="text-xs bg-green-50 text-green-700">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-stone-600">
                      <MapPin className="w-3 h-3" />
                      <span>Geographic Reach: {sector.geographicReach.join(', ')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Collaboration Opportunities */}
        <TabsContent value="opportunities" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Collaboration Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Active Collaboration Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.analysis.collaborationOpportunities.slice(0, 6).map((opportunity, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-clay-50 text-clay-700">
                            {opportunity.sectors[0]}
                          </Badge>
                          <span className="text-xs text-stone-500">×</span>
                          <Badge variant="outline" className="bg-orange-50 text-orange-700">
                            {opportunity.sectors[1]}
                          </Badge>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {opportunity.potential}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-stone-900 mb-1">{opportunity.storyteller}</h4>
                      <p className="text-sm text-stone-600 mb-2">{opportunity.evidence}</p>
                      <div className="flex flex-wrap gap-1">
                        {opportunity.sharedThemes.map((theme, themeIndex) => (
                          <Badge key={themeIndex} variant="outline" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Policy Change Potential */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Policy Change Potential
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.analysis.policyChangePotential.slice(0, 6).map((policy, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-stone-900">{policy.sector}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={getUrgencyColor(policy.urgency)}>
                            {policy.urgency}
                          </Badge>
                          <Badge variant="outline">
                            {policy.changeType}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-stone-600 mb-2">
                        <span>{policy.storytellerCount} storytellers</span>
                        <span>•</span>
                        <span>{policy.potential} potential</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {policy.topThemes.map((theme, themeIndex) => (
                          <Badge key={themeIndex} variant="outline" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Investment Insights */}
        <TabsContent value="investment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* High Impact Sectors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  High Impact Investment Sectors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.analysis.investmentInsights.highImpactSectors.map((sector, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-stone-900">{sector.sector}</h4>
                        <span className="text-lg font-bold text-green-600">
                          {sector.impactPotential}%
                        </span>
                      </div>
                      <div className="mb-2">
                        <Progress value={sector.impactPotential} className="h-2" />
                      </div>
                      <p className="text-sm text-stone-600">{sector.evidence}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ready for Investment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Ready for Investment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.analysis.investmentInsights.readyForInvestment.map((investment, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-stone-900">{investment.sector}</h4>
                        <Badge className={getInvestmentColor(investment.requiredInvestment)}>
                          {investment.requiredInvestment}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-stone-600">Readiness:</span>
                          <span className="ml-1 font-semibold">{investment.readinessScore}%</span>
                        </div>
                        <div>
                          <span className="text-stone-600">Leadership:</span>
                          <span className="ml-1 font-semibold">{investment.leadershipCapacity}</span>
                        </div>
                        <div>
                          <span className="text-stone-600">Time to Impact:</span>
                          <span className="ml-1 font-semibold">{investment.timeToImpact}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}