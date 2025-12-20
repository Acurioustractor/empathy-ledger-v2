'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import {
  Users, Crown, Heart, Globe, Scale, Target,
  TrendingUp, AlertTriangle, CheckCircle2, Sparkles
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

// Dynamic imports for charts
const ResponsiveContainer = dynamic(
  () => import('recharts').then(mod => mod.ResponsiveContainer),
  { ssr: false }
)
const PieChart = dynamic(
  () => import('recharts').then(mod => mod.PieChart),
  { ssr: false }
)
const Pie = dynamic(
  () => import('recharts').then(mod => mod.Pie),
  { ssr: false }
)
const Cell = dynamic(
  () => import('recharts').then(mod => mod.Cell),
  { ssr: false }
)
const BarChart = dynamic(
  () => import('recharts').then(mod => mod.BarChart),
  { ssr: false }
)
const Bar = dynamic(
  () => import('recharts').then(mod => mod.Bar),
  { ssr: false }
)
const XAxis = dynamic(
  () => import('recharts').then(mod => mod.XAxis),
  { ssr: false }
)
const YAxis = dynamic(
  () => import('recharts').then(mod => mod.YAxis),
  { ssr: false }
)
const Tooltip = dynamic(
  () => import('recharts').then(mod => mod.Tooltip),
  { ssr: false }
)
const RadarChart = dynamic(
  () => import('recharts').then(mod => mod.RadarChart),
  { ssr: false }
)
const Radar = dynamic(
  () => import('recharts').then(mod => mod.Radar),
  { ssr: false }
)
const PolarGrid = dynamic(
  () => import('recharts').then(mod => mod.PolarGrid),
  { ssr: false }
)
const PolarAngleAxis = dynamic(
  () => import('recharts').then(mod => mod.PolarAngleAxis),
  { ssr: false }
)
const PolarRadiusAxis = dynamic(
  () => import('recharts').then(mod => mod.PolarRadiusAxis),
  { ssr: false }
)

interface EquityData {
  totalStorytellers: number
  elderCount: number
  youthCount: number
  genderDistribution: Record<string, number>
  culturalAffiliations: Array<{ affiliation: string; count: number }>
  regionDistribution: Array<{ region: string; count: number; percentage: number }>
  underrepresentedRegions: string[]
  diversityIndex: number
  representationGoals: Array<{ goal: string; current: number; target: number }>
}

interface EquityDashboardProps {
  data: EquityData | null
  loading?: boolean
}

const REGION_COLORS = [
  '#C45B28', '#4A7C59', '#6B8E8E', '#8B7355',
  '#9B8B7A', '#7A9B8B', '#5B6C8A', '#8A5B6C',
  '#6B5B8A', '#8A7A5B', '#5B8A6B', '#8A5B5B'
]

const GENDER_COLORS: Record<string, string> = {
  'Male': '#3b82f6',
  'Female': '#ec4899',
  'Non-binary': '#8b5cf6',
  'Other': '#6b7280',
  'Not specified': '#d1d5db',
  'Prefer not to say': '#9ca3af'
}

export function EquityDashboard({ data, loading }: EquityDashboardProps) {
  const genderPieData = useMemo(() => {
    if (!data) return []
    return Object.entries(data.genderDistribution)
      .filter(([, count]) => count > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: GENDER_COLORS[name] || '#6b7280'
      }))
  }, [data])

  const regionBarData = useMemo(() => {
    if (!data) return []
    return data.regionDistribution.slice(0, 10).map((r, i) => ({
      ...r,
      color: REGION_COLORS[i % REGION_COLORS.length]
    }))
  }, [data])

  const representationRadar = useMemo(() => {
    if (!data) return []
    return data.representationGoals.map(goal => ({
      goal: goal.goal,
      current: Math.min((goal.current / goal.target) * 100, 100),
      fullMark: 100
    }))
  }, [data])

  if (loading || !data) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-stone-200 dark:bg-stone-800 rounded w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-stone-100 dark:bg-stone-900 rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Diversity Index Score */}
      <Card className={cn(
        "border-2",
        data.diversityIndex >= 70 ? "border-green-200 dark:border-green-900" :
        data.diversityIndex >= 40 ? "border-amber-200 dark:border-amber-900" :
        "border-red-200 dark:border-red-900"
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Scale className="w-8 h-8 text-purple-500" />
              <div>
                <h3 className="font-semibold text-lg">Diversity Index</h3>
                <p className="text-sm text-muted-foreground">
                  Simpson's diversity index measuring representation balance
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{data.diversityIndex}%</div>
              <Badge
                variant="secondary"
                className={cn(
                  data.diversityIndex >= 70 ? "bg-green-100 text-green-700" :
                  data.diversityIndex >= 40 ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                )}
              >
                {data.diversityIndex >= 70 ? 'Highly Diverse' :
                 data.diversityIndex >= 40 ? 'Moderately Diverse' : 'Needs More Diversity'}
              </Badge>
            </div>
          </div>
          <Progress value={data.diversityIndex} className="h-3" />
        </CardContent>
      </Card>

      {/* Key Demographics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DemographicCard
          icon={<Users className="w-5 h-5" />}
          label="Total Storytellers"
          value={data.totalStorytellers}
          color="blue"
        />
        <DemographicCard
          icon={<Crown className="w-5 h-5" />}
          label="Elders"
          value={data.elderCount}
          percentage={data.totalStorytellers > 0 ? Math.round((data.elderCount / data.totalStorytellers) * 100) : 0}
          color="amber"
        />
        <DemographicCard
          icon={<Sparkles className="w-5 h-5" />}
          label="Youth Voices"
          value={data.youthCount}
          percentage={data.totalStorytellers > 0 ? Math.round((data.youthCount / data.totalStorytellers) * 100) : 0}
          color="purple"
        />
        <DemographicCard
          icon={<Globe className="w-5 h-5" />}
          label="Regions"
          value={data.regionDistribution.length}
          color="green"
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-pink-500" />
              Gender Distribution
            </CardTitle>
            <CardDescription>
              Representation across gender identities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {genderPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload
                        const pct = data.totalStorytellers > 0
                          ? Math.round((d.value / data.totalStorytellers) * 100)
                          : 0
                        return (
                          <div className="bg-white dark:bg-stone-900 border rounded-lg shadow-lg p-3">
                            <p className="font-medium">{d.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {d.value} ({pct}%)
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {genderPieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm truncate">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Regional Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-500" />
              Regional Distribution
            </CardTitle>
            <CardDescription>
              Geographic representation of storytellers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={regionBarData}
                  layout="vertical"
                  margin={{ left: 10, right: 30 }}
                >
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="region"
                    width={100}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => value.length > 12 ? value.substring(0, 12) + '...' : value}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload
                        return (
                          <div className="bg-white dark:bg-stone-900 border rounded-lg shadow-lg p-3">
                            <p className="font-medium">{d.region}</p>
                            <p className="text-sm text-muted-foreground">
                              {d.count} storytellers ({d.percentage}%)
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {regionBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Representation Goals & Cultural Affiliations */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Representation Goals Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              Representation Goals
            </CardTitle>
            <CardDescription>
              Progress toward diversity targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={representationRadar} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <PolarGrid stroke="#e5e5e5" />
                  {/* @ts-expect-error - recharts types issue */}
                  <PolarAngleAxis dataKey="goal" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Progress"
                    dataKey="current"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.5}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {/* Goals List */}
            <div className="space-y-3 mt-4">
              {data.representationGoals.map((goal) => {
                const progress = Math.min((goal.current / goal.target) * 100, 100)
                const isAchieved = goal.current >= goal.target

                return (
                  <div key={goal.goal} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {isAchieved ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-amber-500" />
                        )}
                        {goal.goal}
                      </span>
                      <span className="text-muted-foreground">
                        {goal.current} / {goal.target}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Cultural Affiliations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              Cultural Affiliations
            </CardTitle>
            <CardDescription>
              Communities and cultures represented
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px]">
              <div className="space-y-2 pr-4">
                {data.culturalAffiliations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No cultural affiliations recorded yet</p>
                  </div>
                ) : (
                  data.culturalAffiliations.map((affiliation, index) => (
                    <div
                      key={affiliation.affiliation}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: REGION_COLORS[index % REGION_COLORS.length] }}
                      >
                        {affiliation.count}
                      </div>
                      <span className="flex-1 font-medium">{affiliation.affiliation}</span>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Underrepresented Regions Alert */}
      {data.underrepresentedRegions.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Underrepresented Regions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  These regions have less than 5% representation and could benefit from more outreach:
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.underrepresentedRegions.map((region) => (
                    <Badge
                      key={region}
                      variant="outline"
                      className="border-amber-300 text-amber-700"
                    >
                      {region}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function DemographicCard({
  icon,
  label,
  value,
  percentage,
  color
}: {
  icon: React.ReactNode
  label: string
  value: number
  percentage?: number
  color: 'blue' | 'amber' | 'purple' | 'green'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600',
    green: 'bg-green-50 dark:bg-green-950/30 text-green-600'
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className={cn("inline-flex p-2 rounded-lg mb-2", colorClasses[color])}>
          {icon}
        </div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold">{value}</span>
          {percentage !== undefined && (
            <span className="text-sm text-muted-foreground mb-0.5">({percentage}%)</span>
          )}
        </div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  )
}
