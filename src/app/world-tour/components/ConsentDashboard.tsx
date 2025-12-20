'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import {
  Shield, ShieldCheck, ShieldAlert, ShieldQuestion,
  Users, Lock, Globe, Eye, TrendingUp, AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
const AreaChart = dynamic(
  () => import('recharts').then(mod => mod.AreaChart),
  { ssr: false }
)
const Area = dynamic(
  () => import('recharts').then(mod => mod.Area),
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

interface ConsentData {
  totalStorytellers: number
  consentedToPublic: number
  consentedToCommunity: number
  consentedToPrivate: number
  pendingConsent: number
  consentByMonth: Array<{ month: string; consented: number; pending: number }>
  consentTypes: Record<string, number>
}

interface ConsentDashboardProps {
  data: ConsentData | null
  loading?: boolean
}

const CONSENT_COLORS = {
  public: '#22c55e',
  community: '#3b82f6',
  private: '#8b5cf6',
  pending: '#f59e0b'
}

export function ConsentDashboard({ data, loading }: ConsentDashboardProps) {
  const pieData = useMemo(() => {
    if (!data) return []
    return [
      { name: 'Public', value: data.consentedToPublic, color: CONSENT_COLORS.public },
      { name: 'Community', value: data.consentedToCommunity, color: CONSENT_COLORS.community },
      { name: 'Private', value: data.consentedToPrivate, color: CONSENT_COLORS.private },
      { name: 'Pending', value: data.pendingConsent, color: CONSENT_COLORS.pending }
    ].filter(item => item.value > 0)
  }, [data])

  const consentRate = useMemo(() => {
    if (!data || data.totalStorytellers === 0) return 0
    const consented = data.consentedToPublic + data.consentedToCommunity
    return Math.round((consented / data.totalStorytellers) * 100)
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
      {/* Consent Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ConsentCard
          icon={<Globe className="w-5 h-5" />}
          label="Public Consent"
          value={data.consentedToPublic}
          total={data.totalStorytellers}
          color="green"
          description="Stories visible to everyone"
        />
        <ConsentCard
          icon={<Users className="w-5 h-5" />}
          label="Community Only"
          value={data.consentedToCommunity}
          total={data.totalStorytellers}
          color="blue"
          description="Visible to community members"
        />
        <ConsentCard
          icon={<Lock className="w-5 h-5" />}
          label="Private"
          value={data.consentedToPrivate}
          total={data.totalStorytellers}
          color="purple"
          description="Only visible to storyteller"
        />
        <ConsentCard
          icon={<ShieldQuestion className="w-5 h-5" />}
          label="Pending Review"
          value={data.pendingConsent}
          total={data.totalStorytellers}
          color="amber"
          description="Awaiting consent decision"
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Consent Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              Consent Distribution
            </CardTitle>
            <CardDescription>
              How storytellers have configured their privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    // @ts-expect-error - recharts label type issue
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white dark:bg-stone-900 border rounded-lg shadow-lg p-3">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {data.value} storytellers
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
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Consent Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Consent Trend
            </CardTitle>
            <CardDescription>
              Monthly consent status changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.consentByMonth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConsented" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => value.substring(5)}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="consented"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorConsented)"
                    name="Consented"
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPending)"
                    name="Pending"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consent Health Score */}
      <Card className={cn(
        "border-2",
        consentRate >= 80 ? "border-green-200 dark:border-green-900" :
        consentRate >= 50 ? "border-amber-200 dark:border-amber-900" :
        "border-red-200 dark:border-red-900"
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {consentRate >= 80 ? (
                <ShieldCheck className="w-8 h-8 text-green-500" />
              ) : consentRate >= 50 ? (
                <Shield className="w-8 h-8 text-amber-500" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-red-500" />
              )}
              <div>
                <h3 className="font-semibold text-lg">Consent Health Score</h3>
                <p className="text-sm text-muted-foreground">
                  Percentage of storytellers with public or community consent
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{consentRate}%</div>
              <Badge
                variant="secondary"
                className={cn(
                  consentRate >= 80 ? "bg-green-100 text-green-700" :
                  consentRate >= 50 ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                )}
              >
                {consentRate >= 80 ? 'Excellent' : consentRate >= 50 ? 'Good' : 'Needs Attention'}
              </Badge>
            </div>
          </div>
          <Progress
            value={consentRate}
            className="h-3"
          />
          {data.pendingConsent > 0 && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-sm">
                {data.pendingConsent} storyteller{data.pendingConsent !== 1 ? 's' : ''} have pending consent decisions
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ConsentCard({
  icon,
  label,
  value,
  total,
  color,
  description
}: {
  icon: React.ReactNode
  label: string
  value: number
  total: number
  color: 'green' | 'blue' | 'purple' | 'amber'
  description: string
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0

  const colorClasses = {
    green: 'bg-green-50 dark:bg-green-950/30 text-green-600 border-green-200 dark:border-green-800',
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 border-purple-200 dark:border-purple-800',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-200 dark:border-amber-800'
  }

  return (
    <Card className={cn("border", colorClasses[color])}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground">{description}</div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {percentage}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
