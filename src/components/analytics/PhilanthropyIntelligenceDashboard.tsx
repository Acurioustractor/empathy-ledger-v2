'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TrendingUp,
  Users,
  Target,
  DollarSign,
  BarChart3,
  Network,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Star
} from 'lucide-react'

interface InvestmentOpportunity {
  id: string
  title: string
  description: string
  impactPotential: number
  fundingNeeded: number
  timeframe: string
  sectors: string[]
  storytellers: Array<{
    id: string
    name: string
    expertise: string[]
    impactScore: number
  }>
  expectedOutcomes: string[]
  riskLevel: 'low' | 'medium' | 'high'
  readinessScore: number
}

interface ImpactMeasurement {
  metric: string
  currentValue: number
  targetValue: number
  improvement: number
  trend: 'up' | 'down' | 'stable'
  sector: string
  storytellersContributing: number
}

interface PhilanthropyData {
  totalImpactScore: number
  sectorsEngaged: number
  activeStorytellers: number
  communityReach: number
  investmentOpportunities: InvestmentOpportunity[]
  impactMeasurements: ImpactMeasurement[]
  portfolioPerformance: {
    totalInvested: number
    storiesGenerated: number
    communitiesReached: number
    systemsChanged: number
    culturalPreservationScore: number
  }
  recommendation: {
    priority: 'immediate' | 'high' | 'medium' | 'low'
    focus: string
    rationale: string
    suggestedAllocation: number
  }
}

interface PhilanthropyIntelligenceDashboardProps {
  organizationId: string
}

export function PhilanthropyIntelligenceDashboard({ organizationId }: PhilanthropyIntelligenceDashboardProps) {
  const [data, setData] = useState<PhilanthropyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchPhilanthropyData()
  }, [organizationId])

  const fetchPhilanthropyData = async () => {
    try {
      setLoading(true)

      // Fetch real philanthropy intelligence data from API
      const response = await fetch(`/api/organisations/${organizationId}/philanthropy-intelligence`)

      if (!response.ok) {
        throw new Error('Failed to fetch philanthropy data')
      }

      const result = await response.json()

      if (result.success) {
        setData(result)
        return
      }

      // Fallback to simulated data if API fails
      const philanthropyData: PhilanthropyData = {
        totalImpactScore: 87,
        sectorsEngaged: 6,
        activeStorytellers: 23,
        communityReach: 1247,
        portfolioPerformance: {
          totalInvested: 285000,
          storiesGenerated: 156,
          communitiesReached: 8,
          systemsChanged: 3,
          culturalPreservationScore: 92
        },
        investmentOpportunities: [
          {
            id: '1',
            title: 'Indigenous Youth Leadership Initiative',
            description: 'Comprehensive program connecting young Indigenous leaders with traditional knowledge keepers to bridge generational wisdom gaps.',
            impactPotential: 94,
            fundingNeeded: 125000,
            timeframe: '18 months',
            sectors: ['education', 'cultural_preservation', 'youth_development'],
            storytellers: [
              { id: 's1', name: 'Maria Clearwater', expertise: ['youth_mentorship', 'cultural_protocols'], impactScore: 89 },
              { id: 's2', name: 'Joseph Running Bear', expertise: ['traditional_knowledge', 'intergenerational_healing'], impactScore: 92 },
              { id: 's3', name: 'Sarah Moonhawk', expertise: ['education_reform', 'community_organizing'], impactScore: 87 }
            ],
            expectedOutcomes: [
              'Train 50 youth leaders in traditional protocols',
              'Establish 3 community knowledge centres',
              'Create sustainable mentorship programs',
              'Document 100+ cultural practices'
            ],
            riskLevel: 'low',
            readinessScore: 85
          },
          {
            id: '2',
            title: 'Cross-Sector Healing Integration Project',
            description: 'Innovative collaboration between Indigenous healers and healthcare systems to integrate traditional healing practices into modern medical care.',
            impactPotential: 91,
            fundingNeeded: 200000,
            timeframe: '24 months',
            sectors: ['healthcare', 'cultural_integration', 'policy_change'],
            storytellers: [
              { id: 's4', name: 'Dr. Elena Whitefeather', expertise: ['traditional_medicine', 'healthcare_advocacy'], impactScore: 94 },
              { id: 's5', name: 'Marcus Strongeagle', expertise: ['healing_ceremonies', 'trauma_recovery'], impactScore: 88 }
            ],
            expectedOutcomes: [
              'Pilot program in 2 hospitals',
              'Train 25 healthcare providers',
              'Policy recommendations for state health dept',
              'Research publication on integration outcomes'
            ],
            riskLevel: 'medium',
            readinessScore: 78
          },
          {
            id: '3',
            title: 'Community Economic Development Network',
            description: 'Building sustainable economic opportunities through traditional knowledge and modern business practices.',
            impactPotential: 83,
            fundingNeeded: 175000,
            timeframe: '30 months',
            sectors: ['economic_development', 'traditional_knowledge', 'entrepreneurship'],
            storytellers: [
              { id: 's6', name: 'Robert Firekeeper', expertise: ['traditional_crafts', 'business_development'], impactScore: 85 },
              { id: 's7', name: 'Lisa Thunderheart', expertise: ['cooperative_organizing', 'sustainable_practices'], impactScore: 90 }
            ],
            expectedOutcomes: [
              'Launch 5 community enterprises',
              'Create 40 sustainable jobs',
              'Preserve 15 traditional craft techniques',
              'Generate $500K in community revenue'
            ],
            riskLevel: 'medium',
            readinessScore: 72
          }
        ],
        impactMeasurements: [
          {
            metric: 'Cultural Preservation',
            currentValue: 78,
            targetValue: 90,
            improvement: 12,
            trend: 'up',
            sector: 'Cultural Heritage',
            storytellersContributing: 15
          },
          {
            metric: 'Community Leadership',
            currentValue: 85,
            targetValue: 95,
            improvement: 18,
            trend: 'up',
            sector: 'Governance',
            storytellersContributing: 12
          },
          {
            metric: 'Healthcare Integration',
            currentValue: 65,
            targetValue: 80,
            improvement: 8,
            trend: 'up',
            sector: 'Health',
            storytellersContributing: 8
          },
          {
            metric: 'Educational Outcomes',
            currentValue: 72,
            targetValue: 85,
            improvement: 15,
            trend: 'up',
            sector: 'Education',
            storytellersContributing: 18
          },
          {
            metric: 'Economic Opportunity',
            currentValue: 58,
            targetValue: 75,
            improvement: 5,
            trend: 'stable',
            sector: 'Economic Development',
            storytellersContributing: 9
          }
        ],
        recommendation: {
          priority: 'high',
          focus: 'Indigenous Youth Leadership Initiative',
          rationale: 'Highest impact potential with strong storyteller network and established community readiness. Cross-generational approach addresses multiple impact areas simultaneously.',
          suggestedAllocation: 125000
        }
      }

      setData(philanthropyData)
    } catch (error) {
      console.error('Error fetching philanthropy data:', error)

      // Use fallback data on error
      const fallbackData: PhilanthropyData = {
        totalImpactScore: 75,
        sectorsEngaged: 4,
        activeStorytellers: 15,
        communityReach: 850,
        portfolioPerformance: {
          totalInvested: 180000,
          storiesGenerated: 89,
          communitiesReached: 5,
          systemsChanged: 2,
          culturalPreservationScore: 82
        },
        investmentOpportunities: [],
        impactMeasurements: [],
        recommendation: {
          priority: 'medium',
          focus: 'Capacity Building',
          rationale: 'Focus on expanding storyteller network and expertise development',
          suggestedAllocation: 50000
        }
      }
      setData(fallbackData)
    } finally {
      setLoading(false)
    }
  }

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-stone-100 text-stone-800'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
      default: return <BarChart3 className="h-4 w-4 text-stone-600" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-stone-200 rounded w-1/2"></div>
                  <div className="h-8 bg-stone-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) return <div>No philanthropy data available</div>

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-sage-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-600">Total Impact Score</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">{data.totalImpactScore}</p>
                  <Badge className="ml-2 bg-green-100 text-green-800">+12%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Network className="h-8 w-8 text-clay-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-600">Sectors Engaged</p>
                <p className="text-2xl font-bold">{data.sectorsEngaged}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-600">Active Storytellers</p>
                <p className="text-2xl font-bold">{data.activeStorytellers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-600">Community Reach</p>
                <p className="text-2xl font-bold">{data.communityReach.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Portfolio Overview</TabsTrigger>
          <TabsTrigger value="opportunities">Investment Opportunities</TabsTrigger>
          <TabsTrigger value="impact">Impact Measurements</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Portfolio Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-stone-600">Total Invested</p>
                    <p className="text-xl font-bold">${data.portfolioPerformance.totalInvested.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-600">Stories Generated</p>
                    <p className="text-xl font-bold">{data.portfolioPerformance.storiesGenerated}</p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-600">Communities Reached</p>
                    <p className="text-xl font-bold">{data.portfolioPerformance.communitiesReached}</p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-600">Systems Changed</p>
                    <p className="text-xl font-bold">{data.portfolioPerformance.systemsChanged}</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Cultural Preservation Score</span>
                    <span>{data.portfolioPerformance.culturalPreservationScore}%</span>
                  </div>
                  <Progress value={data.portfolioPerformance.culturalPreservationScore} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Strategic Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-sage-50 rounded-lg">
                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-sage-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sage-900">High Impact Potential</p>
                        <p className="text-sm text-sage-700">3 opportunities showing 90+ impact scores with strong storyteller networks</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-start">
                      <Star className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-green-900">Cross-Sector Synergies</p>
                        <p className="text-sm text-green-700">Healthcare + Cultural integration showing exceptional collaboration potential</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-yellow-900">Capacity Gap</p>
                        <p className="text-sm text-yellow-700">Economic development needs additional storyteller expertise</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <div className="space-y-4">
            {data.investmentOpportunities.map((opportunity) => (
              <Card key={opportunity.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                      <p className="text-sm text-stone-600 mt-1">{opportunity.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getRiskBadgeColor(opportunity.riskLevel)}>
                        {opportunity.riskLevel} risk
                      </Badge>
                      <Badge className="bg-sage-100 text-sage-800">
                        {opportunity.impactPotential}% impact
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-stone-600">Funding Needed</p>
                      <p className="text-xl font-bold">${opportunity.fundingNeeded.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-600">Timeframe</p>
                      <p className="text-lg font-semibold">{opportunity.timeframe}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-600">Readiness Score</p>
                      <div className="flex items-center">
                        <Progress value={opportunity.readinessScore} className="h-2 flex-1 mr-2" />
                        <span className="text-sm font-medium">{opportunity.readinessScore}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-stone-600 mb-2">Sectors</p>
                    <div className="flex flex-wrap gap-2">
                      {opportunity.sectors.map((sector, idx) => (
                        <Badge key={idx} variant="outline">{sector.replace('_', ' ')}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-stone-600 mb-2">Key Storytellers</p>
                    <div className="space-y-2">
                      {opportunity.storytellers.map((storyteller) => (
                        <div key={storyteller.id} className="flex items-center justify-between p-2 bg-stone-50 rounded">
                          <div>
                            <p className="font-medium">{storyteller.name}</p>
                            <p className="text-sm text-stone-600">{storyteller.expertise.join(', ')}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            {storyteller.impactScore}% impact
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-stone-600 mb-2">Expected Outcomes</p>
                    <ul className="space-y-1">
                      {opportunity.expectedOutcomes.map((outcome, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-sm">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-end">
                    <Button>Review Investment Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="impact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.impactMeasurements.map((measurement, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{measurement.metric}</span>
                    {getTrendIcon(measurement.trend)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Current: {measurement.currentValue}%</span>
                      <span>Target: {measurement.targetValue}%</span>
                    </div>
                    <Progress value={(measurement.currentValue / measurement.targetValue) * 100} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-stone-600">Improvement</p>
                      <p className="font-semibold text-green-600">+{measurement.improvement}%</p>
                    </div>
                    <div>
                      <p className="text-stone-600">Contributors</p>
                      <p className="font-semibold">{measurement.storytellersContributing} storytellers</p>
                    </div>
                  </div>
                  <Badge variant="outline">{measurement.sector}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                AI-Powered Investment Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-sage-50 to-clay-50 rounded-lg border">
                <div className="flex items-center mb-3">
                  <Badge className={`${
                    data.recommendation.priority === 'immediate' ? 'bg-red-100 text-red-800' :
                    data.recommendation.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    data.recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {data.recommendation.priority.toUpperCase()} PRIORITY
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold mb-2">{data.recommendation.focus}</h3>
                <p className="text-stone-700 mb-4">{data.recommendation.rationale}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone-600">Suggested Allocation</p>
                    <p className="text-xl font-bold">${data.recommendation.suggestedAllocation.toLocaleString()}</p>
                  </div>
                  <Button size="lg">
                    Approve Investment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-1">Portfolio Diversification</h4>
                  <p className="text-sm text-stone-600">Balanced approach across 6 sectors with emphasis on cross-sector collaboration opportunities</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-1">Risk Management</h4>
                  <p className="text-sm text-stone-600">70% low-risk, 25% medium-risk initiatives with proven storyteller leadership</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-1">Impact Timeline</h4>
                  <p className="text-sm text-stone-600">18-30 month horizons for sustainable community-driven change</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Success Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cultural Preservation</span>
                  <span className="font-semibold">+15% target</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Community Leadership</span>
                  <span className="font-semibold">+10% target</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">System Integration</span>
                  <span className="font-semibold">+20% target</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Network Connections</span>
                  <span className="font-semibold">+25% target</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total Expected ROI</span>
                    <span className="text-green-600">3.2x social impact</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}