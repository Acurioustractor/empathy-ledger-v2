'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  ArrowRight,
  Users,
  Building2,
  Globe,
  TrendingUp,
  Heart,
  BookOpen,
  Shield,
  Handshake,
  Lightbulb,
  Target,
  ChevronLeft,
  Star
} from 'lucide-react'

// MULTI-LEVEL IMPACT DASHBOARD
// Supports drilling down: Site-wide → Organization → Individual Storyteller → Specific Insights

interface DashboardLevel {
  type: 'site' | 'organisation' | 'storyteller' | 'insights'
  id?: string
  name: string
  breadcrumb: string[]
}

interface ImpactMetrics {
  totalInsights: number
  totalStorytellers: number
  totalOrganizations: number
  avgConfidenceScore: number
  topImpactAreas: Array<{
    area: string
    score: number
    colour: string
    icon: React.ReactNode
  }>
  impactTypeDistribution: Array<{
    type: string
    count: number
    percentage: number
    colour: string
  }>
  sovereigntyProgress: {
    communityLedDecisions: number
    culturalProtocolsRespected: number
    externalSystemsResponding: number
    resourceControlIncreasing: number
  }
  trending: {
    fastestGrowingAreas: string[]
    topPerformers: Array<{
      id: string
      name: string
      score: number
      change: number
    }>
  }
}

interface IndividualInsight {
  id: string
  impactType: string
  quote: string
  confidence: number
  culturalSensitivity: string
  transformationEvidence: string[]
  createdAt: string
}

export default function MultiLevelImpactDashboard() {
  const [currentLevel, setCurrentLevel] = useState<DashboardLevel>({
    type: 'site',
    name: 'Global Community Impact',
    breadcrumb: ['Global Impact']
  })

  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null)
  const [insights, setInsights] = useState<IndividualInsight[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data for demonstration
  useEffect(() => {
    loadMockData()
  }, [currentLevel])

  const loadMockData = () => {
    setLoading(true)

    setTimeout(() => {
      setMetrics({
        totalInsights: currentLevel.type === 'site' ? 1847 : currentLevel.type === 'organisation' ? 342 : 89,
        totalStorytellers: currentLevel.type === 'site' ? 156 : currentLevel.type === 'organisation' ? 23 : 1,
        totalOrganizations: currentLevel.type === 'site' ? 12 : 1,
        avgConfidenceScore: 0.847,
        topImpactAreas: [
          {
            area: 'Cultural Continuity',
            score: 0.92,
            colour: '#8B5CF6',
            icon: <BookOpen className="h-4 w-4" />
          },
          {
            area: 'Community Empowerment',
            score: 0.89,
            colour: '#10B981',
            icon: <Users className="h-4 w-4" />
          },
          {
            area: 'Relationship Strengthening',
            score: 0.85,
            colour: '#F59E0B',
            icon: <Heart className="h-4 w-4" />
          },
          {
            area: 'Knowledge Preservation',
            score: 0.82,
            colour: '#EF4444',
            icon: <Lightbulb className="h-4 w-4" />
          }
        ],
        impactTypeDistribution: [
          { type: 'Cultural Protocol', count: 523, percentage: 28, colour: '#8B5CF6' },
          { type: 'Community Leadership', count: 387, percentage: 21, colour: '#10B981' },
          { type: 'Knowledge Transmission', count: 298, percentage: 16, colour: '#F59E0B' },
          { type: 'Healing Integration', count: 234, percentage: 13, colour: '#EF4444' },
          { type: 'Relationship Building', count: 205, percentage: 11, colour: '#6366F1' },
          { type: 'System Navigation', count: 142, percentage: 8, colour: '#EC4899' },
          { type: 'Collective Mobilization', count: 58, percentage: 3, colour: '#14B8A6' }
        ],
        sovereigntyProgress: {
          communityLedDecisions: 156,
          culturalProtocolsRespected: 289,
          externalSystemsResponding: 87,
          resourceControlIncreasing: 134
        },
        trending: {
          fastestGrowingAreas: ['Cultural Protocol', 'Community Leadership', 'Healing Integration'],
          topPerformers: [
            { id: '1', name: 'Snow Foundation', score: 94.2, change: +12.3 },
            { id: '2', name: 'Deadly Hearts Project', score: 91.8, change: +8.7 },
            { id: '3', name: 'Palm Island Community', score: 89.4, change: +15.2 }
          ]
        }
      })

      if (currentLevel.type === 'insights') {
        setInsights([
          {
            id: '1',
            impactType: 'cultural_protocol',
            quote: 'I observe, I never go onto country unless I am welcomed by traditional owners',
            confidence: 0.89,
            culturalSensitivity: 'high',
            transformationEvidence: ['Cultural respect demonstrated', 'Traditional protocols honoured'],
            createdAt: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            impactType: 'community_leadership',
            quote: 'Community leadership, community ownership, our mob is smart',
            confidence: 0.94,
            culturalSensitivity: 'medium',
            transformationEvidence: ['Community self-determination', 'Collective intelligence recognised'],
            createdAt: '2024-01-15T10:30:00Z'
          },
          {
            id: '3',
            impactType: 'knowledge_transmission',
            quote: 'Through my matriarchal lineage, I come from healers, so women in my family are healers',
            confidence: 0.91,
            culturalSensitivity: 'high',
            transformationEvidence: ['Traditional knowledge preserved', 'Intergenerational learning'],
            createdAt: '2024-01-15T10:30:00Z'
          }
        ])
      }

      setLoading(false)
    }, 800)
  }

  const navigateToLevel = (level: DashboardLevel) => {
    setCurrentLevel(level)
  }

  const navigateBack = () => {
    const newBreadcrumb = [...currentLevel.breadcrumb]
    newBreadcrumb.pop()

    if (newBreadcrumb.length === 1) {
      setCurrentLevel({
        type: 'site',
        name: 'Global Community Impact',
        breadcrumb: ['Global Impact']
      })
    } else if (newBreadcrumb.length === 2) {
      setCurrentLevel({
        type: 'organisation',
        id: 'org-1',
        name: newBreadcrumb[1],
        breadcrumb: newBreadcrumb
      })
    } else if (newBreadcrumb.length === 3) {
      setCurrentLevel({
        type: 'storyteller',
        id: 'storyteller-1',
        name: newBreadcrumb[2],
        breadcrumb: newBreadcrumb
      })
    }
  }

  const getImpactTypeIcon = (type: string) => {
    const icons = {
      'Cultural Protocol': <Shield className="h-4 w-4" />,
      'Community Leadership': <Users className="h-4 w-4" />,
      'Knowledge Transmission': <BookOpen className="h-4 w-4" />,
      'Healing Integration': <Heart className="h-4 w-4" />,
      'Relationship Building': <Handshake className="h-4 w-4" />,
      'System Navigation': <Target className="h-4 w-4" />,
      'Collective Mobilization': <TrendingUp className="h-4 w-4" />
    }
    return icons[type as keyof typeof icons] || <Star className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm text-grey-600">
        {currentLevel.breadcrumb.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateBack}
            className="p-1 h-auto"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {currentLevel.breadcrumb.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ArrowRight className="h-3 w-3" />}
            <span className={index === currentLevel.breadcrumb.length - 1 ? 'font-medium text-grey-900' : ''}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-grey-900">{currentLevel.name}</h1>
          <p className="text-grey-600 mt-1">
            {currentLevel.type === 'site' && 'Indigenous community impact across all organisations'}
            {currentLevel.type === 'organisation' && 'Community stories and transformation within this organisation'}
            {currentLevel.type === 'storyteller' && 'Individual impact insights and community contributions'}
            {currentLevel.type === 'insights' && 'Detailed analysis of specific community impact moments'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {currentLevel.type === 'site' && <Globe className="h-8 w-8 text-purple-600" />}
          {currentLevel.type === 'organisation' && <Building2 className="h-8 w-8 text-green-600" />}
          {currentLevel.type === 'storyteller' && <Users className="h-8 w-8 text-blue-600" />}
          {currentLevel.type === 'insights' && <Lightbulb className="h-8 w-8 text-orange-600" />}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-grey-600">Total Insights</p>
                  <p className="text-2xl font-bold text-grey-900">{metrics?.totalInsights.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-grey-600">
                    {currentLevel.type === 'site' ? 'Storytellers' : currentLevel.type === 'organisation' ? 'Community Members' : 'Stories Shared'}
                  </p>
                  <p className="text-2xl font-bold text-grey-900">{metrics?.totalStorytellers}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {currentLevel.type === 'site' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-grey-600">Organizations</p>
                    <p className="text-2xl font-bold text-grey-900">{metrics?.totalOrganizations}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-grey-600">Avg Confidence</p>
                  <p className="text-2xl font-bold text-grey-900">
                    {Math.round((metrics?.avgConfidenceScore || 0) * 100)}%
                  </p>
                </div>
                <Star className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Impact Areas */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Strongest Impact Areas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.topImpactAreas.map((area, index) => (
                  <div key={area.area} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: area.colour + '20' }}>
                        {area.icon}
                      </div>
                      <span className="font-medium">{area.area}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress
                        value={area.score * 100}
                        className="w-20"
                        style={{
                          '--progress-foreground': area.colour
                        } as React.CSSProperties}
                      />
                      <span className="text-sm font-medium w-12 text-right">
                        {Math.round(area.score * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Impact Type Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Impact Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metrics?.impactTypeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    dataKey="count"
                    label={({ type, percentage }) => `${type}: ${percentage}%`}
                  >
                    {metrics?.impactTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.colour} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Views Based on Level */}
      <AnimatePresence mode="wait">
        {currentLevel.type === 'site' && (
          <motion.div
            key="site-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Top Performing Organizations */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Organizations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.trending.topPerformers.map((org, index) => (
                    <div
                      key={org.id}
                      className="flex items-center justify-between p-3 bg-grey-50 rounded-lg cursor-pointer hover:bg-grey-100 transition-colours"
                      onClick={() => navigateToLevel({
                        type: 'organisation',
                        id: org.id,
                        name: org.name,
                        breadcrumb: [...currentLevel.breadcrumb, org.name]
                      })}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          index === 0 ? 'bg-yellow-100 text-yellow-600' :
                          index === 1 ? 'bg-grey-100 text-grey-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium">{org.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{org.score}%</span>
                        <Badge
                          variant="secondary"
                          className={org.change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                        >
                          {org.change > 0 ? '+' : ''}{org.change}%
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-grey-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sovereignty Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Community Sovereignty Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Community-Led Decisions</span>
                    <span className="font-bold">{metrics?.sovereigntyProgress.communityLedDecisions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Cultural Protocols Respected</span>
                    <span className="font-bold">{metrics?.sovereigntyProgress.culturalProtocolsRespected}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">External Systems Responding</span>
                    <span className="font-bold">{metrics?.sovereigntyProgress.externalSystemsResponding}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Resource Control Increasing</span>
                    <span className="font-bold">{metrics?.sovereigntyProgress.resourceControlIncreasing}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentLevel.type === 'insights' && (
          <motion.div
            key="insights-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Individual Impact Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {insights.map((insight) => (
                    <div key={insight.id} className="border rounded-lg p-4 bg-grey-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getImpactTypeIcon(insight.impactType)}
                          <Badge variant="secondary">{insight.impactType.replace('_', ' ')}</Badge>
                          <Badge
                            variant="outline"
                            className={
                              insight.culturalSensitivity === 'high' ? 'border-red-300 text-red-700' :
                              insight.culturalSensitivity === 'medium' ? 'border-yellow-300 text-yellow-700' :
                              'border-green-300 text-green-700'
                            }
                          >
                            {insight.culturalSensitivity} sensitivity
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{Math.round(insight.confidence * 100)}%</span>
                        </div>
                      </div>

                      <blockquote className="border-l-4 border-purple-500 pl-4 italic text-grey-700 mb-3">
                        "{insight.quote}"
                      </blockquote>

                      {insight.transformationEvidence.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {insight.transformationEvidence.map((evidence, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {evidence}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drill-down Actions */}
      {currentLevel.type !== 'insights' && (
        <div className="flex justify-center">
          <Button
            onClick={() => {
              if (currentLevel.type === 'site') {
                navigateToLevel({
                  type: 'organisation',
                  id: 'snow-foundation',
                  name: 'Snow Foundation',
                  breadcrumb: [...currentLevel.breadcrumb, 'Snow Foundation']
                })
              } else if (currentLevel.type === 'organisation') {
                navigateToLevel({
                  type: 'storyteller',
                  id: 'aunty-vicky',
                  name: 'Aunty Vicky Wade',
                  breadcrumb: [...currentLevel.breadcrumb, 'Aunty Vicky Wade']
                })
              } else if (currentLevel.type === 'storyteller') {
                navigateToLevel({
                  type: 'insights',
                  id: 'transcript-1',
                  name: 'Individual Insights',
                  breadcrumb: [...currentLevel.breadcrumb, 'Insights']
                })
              }
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Drill Down
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}