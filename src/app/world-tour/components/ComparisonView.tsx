'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import {
  GitCompare, Globe, Sparkles, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, Minus, BarChart3, ChevronDown
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

// Dynamic imports for charts
const ResponsiveContainer = dynamic(
  () => import('recharts').then(mod => mod.ResponsiveContainer),
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
const Legend = dynamic(
  () => import('recharts').then(mod => mod.Legend) as any,
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

interface ComparisonData {
  regions: Array<{
    name: string
    stories: number
    storytellers: number
    themes: number
    avgQuality: number
    avgEngagement: number
  }>
  themes: Array<{
    name: string
    stories: number
    regions: number
    growth: number
    sentiment: number
  }>
}

interface ComparisonViewProps {
  data: ComparisonData | null
  loading?: boolean
}

const CHART_COLORS = ['#C45B28', '#4A7C59', '#6B8E8E', '#8B7355', '#9B8B7A']

export function ComparisonView({ data, loading }: ComparisonViewProps) {
  const [compareMode, setCompareMode] = useState<'regions' | 'themes'>('regions')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<string>('stories')

  const sortedRegions = useMemo(() => {
    if (!data?.regions) return []
    return [...data.regions].sort((a, b) => {
      const key = sortBy as keyof typeof a
      return (b[key] as number) - (a[key] as number)
    })
  }, [data?.regions, sortBy])

  const sortedThemes = useMemo(() => {
    if (!data?.themes) return []
    return [...data.themes].sort((a, b) => {
      const key = sortBy as keyof typeof a
      return (b[key] as number) - (a[key] as number)
    })
  }, [data?.themes, sortBy])

  const comparisonData = useMemo(() => {
    if (compareMode === 'regions') {
      const selected = selectedItems.length > 0
        ? sortedRegions.filter(r => selectedItems.includes(r.name))
        : sortedRegions.slice(0, 5)

      return selected.map(region => ({
        name: region.name.length > 15 ? region.name.substring(0, 15) + '...' : region.name,
        fullName: region.name,
        stories: region.stories,
        storytellers: region.storytellers,
        themes: region.themes,
        engagement: region.avgEngagement
      }))
    } else {
      const selected = selectedItems.length > 0
        ? sortedThemes.filter(t => selectedItems.includes(t.name))
        : sortedThemes.slice(0, 5)

      return selected.map(theme => ({
        name: theme.name.length > 15 ? theme.name.substring(0, 15) + '...' : theme.name,
        fullName: theme.name,
        stories: theme.stories,
        regions: theme.regions,
        sentiment: Math.round(theme.sentiment * 100),
        growth: theme.growth
      }))
    }
  }, [compareMode, selectedItems, sortedRegions, sortedThemes])

  const radarData = useMemo(() => {
    if (compareMode === 'regions' && comparisonData.length > 0) {
      const regionData = comparisonData as Array<{ name: string; fullName: string; stories: number; storytellers: number; themes: number; engagement: number }>
      const maxStories = Math.max(...regionData.map(d => d.stories), 1)
      const maxStorytellers = Math.max(...regionData.map(d => d.storytellers || 0), 1)
      const maxThemes = Math.max(...regionData.map(d => d.themes || 0), 1)
      const maxEngagement = Math.max(...regionData.map(d => d.engagement || 0), 1)

      return [
        { metric: 'Stories', ...Object.fromEntries(regionData.map(d => [d.name, (d.stories / maxStories) * 100])) },
        { metric: 'Storytellers', ...Object.fromEntries(regionData.map(d => [d.name, ((d.storytellers || 0) / maxStorytellers) * 100])) },
        { metric: 'Themes', ...Object.fromEntries(regionData.map(d => [d.name, ((d.themes || 0) / maxThemes) * 100])) },
        { metric: 'Engagement', ...Object.fromEntries(regionData.map(d => [d.name, ((d.engagement || 0) / maxEngagement) * 100])) }
      ]
    }
    return []
  }, [compareMode, comparisonData])

  const toggleSelection = (item: string) => {
    setSelectedItems(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : prev.length < 5
          ? [...prev, item]
          : prev
    )
  }

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
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-purple-500" />
            Comparison View
          </CardTitle>
          <CardDescription>
            Compare metrics across regions or themes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <Tabs value={compareMode} onValueChange={(v) => {
              setCompareMode(v as 'regions' | 'themes')
              setSelectedItems([])
            }}>
              <TabsList>
                <TabsTrigger value="regions" className="gap-2">
                  <Globe className="w-4 h-4" />
                  Regions
                </TabsTrigger>
                <TabsTrigger value="themes" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Themes
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <BarChart3 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stories">Stories</SelectItem>
                <SelectItem value="storytellers">Storytellers</SelectItem>
                {compareMode === 'regions' && (
                  <>
                    <SelectItem value="themes">Themes</SelectItem>
                    <SelectItem value="avgEngagement">Engagement</SelectItem>
                  </>
                )}
                {compareMode === 'themes' && (
                  <>
                    <SelectItem value="regions">Regions</SelectItem>
                    <SelectItem value="sentiment">Sentiment</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>

            {selectedItems.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedItems([])}
              >
                Clear Selection ({selectedItems.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selection Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Select {compareMode === 'regions' ? 'Regions' : 'Themes'} to Compare
          </CardTitle>
          <CardDescription>
            Select up to 5 items for comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(compareMode === 'regions' ? sortedRegions : sortedThemes).slice(0, 15).map((item: any) => {
              const isSelected = selectedItems.includes(item.name)
              return (
                <Badge
                  key={item.name}
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-colors",
                    isSelected && "bg-purple-600"
                  )}
                  onClick={() => toggleSelection(item.name)}
                >
                  {item.name}
                  <span className="ml-1 opacity-70">({item.stories})</span>
                </Badge>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Side-by-Side Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white dark:bg-stone-900 border rounded-lg shadow-lg p-3">
                            <p className="font-medium mb-2">{payload[0]?.payload?.fullName || label}</p>
                            {payload.map((p: any) => (
                              <p key={p.dataKey} className="text-sm" style={{ color: p.color }}>
                                {p.name}: {p.value}
                              </p>
                            ))}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Bar dataKey="stories" fill={CHART_COLORS[0]} name="Stories" radius={[4, 4, 0, 0]} />
                  {compareMode === 'regions' && (
                    <Bar dataKey="storytellers" fill={CHART_COLORS[1]} name="Storytellers" radius={[4, 4, 0, 0]} />
                  )}
                  {compareMode === 'themes' && (
                    <Bar dataKey="regions" fill={CHART_COLORS[1]} name="Regions" radius={[4, 4, 0, 0]} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Radar Chart (for regions only) */}
        {compareMode === 'regions' && radarData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Multi-Metric Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                    <PolarGrid stroke="#e5e5e5" />
                    {/* @ts-expect-error - recharts types issue */}
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    {comparisonData.slice(0, 5).map((item, index) => (
                      <Radar
                        key={item.name}
                        name={item.fullName}
                        dataKey={item.name}
                        stroke={CHART_COLORS[index % CHART_COLORS.length]}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        fillOpacity={0.2}
                      />
                    ))}
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Stats Table */}
        <Card className={cn(compareMode === 'themes' && "lg:col-span-2")}>
          <CardHeader>
            <CardTitle className="text-base">Detailed Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4">{compareMode === 'regions' ? 'Region' : 'Theme'}</th>
                    <th className="text-right py-2 px-4">Stories</th>
                    <th className="text-right py-2 px-4">{compareMode === 'regions' ? 'Storytellers' : 'Regions'}</th>
                    <th className="text-right py-2 px-4">{compareMode === 'regions' ? 'Themes' : 'Sentiment'}</th>
                    <th className="text-right py-2 pl-4">{compareMode === 'regions' ? 'Engagement' : 'Growth'}</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((item: any, index) => (
                    <tr key={item.name} className="border-b last:border-0">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          />
                          <span className="font-medium">{item.fullName}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">{item.stories}</td>
                      <td className="text-right py-3 px-4">
                        {compareMode === 'regions' ? item.storytellers : item.regions}
                      </td>
                      <td className="text-right py-3 px-4">
                        {compareMode === 'regions' ? item.themes : `${item.sentiment}%`}
                      </td>
                      <td className="text-right py-3 pl-4">
                        {compareMode === 'regions' ? (
                          item.engagement
                        ) : (
                          <span className={cn(
                            "flex items-center justify-end gap-1",
                            item.growth > 0 ? "text-green-600" : item.growth < 0 ? "text-red-600" : "text-stone-500"
                          )}>
                            {item.growth > 0 ? <TrendingUp className="w-3 h-3" /> :
                             item.growth < 0 ? <TrendingDown className="w-3 h-3" /> :
                             <Minus className="w-3 h-3" />}
                            {Math.abs(item.growth)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
