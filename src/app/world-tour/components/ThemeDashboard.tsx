'use client'

import React, { useState, useEffect } from 'react'
import {
  ChevronUp,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Globe,
  BarChart3,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useMapContext } from '../context/MapContext'
import { getThemeColor, type TrendingTheme } from './types/map-types'

interface ThemeDashboardProps {
  className?: string
}

interface TrendingResponse {
  trending: TrendingTheme[]
  emerging: TrendingTheme[]
  crossRegional: {
    theme: string
    regions: string[]
    connectionCount: number
    color: string
  }[]
  totalThemes: number
  totalStories: number
  lastUpdated: string
}

export function ThemeDashboard({ className }: ThemeDashboardProps) {
  const { state, toggleDashboard, toggleTheme } = useMapContext()
  const { dashboardExpanded, trendingThemes } = state

  const [trendingData, setTrendingData] = useState<TrendingResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  // Fetch trending data
  const fetchTrendingData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/world-tour/themes/trending?timeRange=${timeRange}`)
      if (!response.ok) throw new Error('Failed to fetch trending themes')
      const data = await response.json()
      setTrendingData(data)
    } catch (err) {
      setError('Unable to load theme analytics')
      console.error('Trending themes error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (dashboardExpanded) {
      fetchTrendingData()
    }
  }, [dashboardExpanded, timeRange])

  // Find max count for progress bars
  const maxCount = Math.max(
    ...(trendingData?.trending.map(t => t.count) || [1]),
    1
  )

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-[1000] transition-all duration-300 ease-out",
      dashboardExpanded ? "translate-y-0" : "translate-y-[calc(100%-48px)]",
      className
    )}>
      {/* Toggle handle */}
      <div className="flex justify-center">
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            "rounded-b-none rounded-t-lg shadow-lg h-8 px-4",
            "bg-white dark:bg-stone-900 border border-b-0"
          )}
          onClick={toggleDashboard}
        >
          {dashboardExpanded ? (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              Hide Analytics
            </>
          ) : (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Theme Analytics
              {trendingThemes.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5">
                  {trendingThemes.length} themes
                </Badge>
              )}
            </>
          )}
        </Button>
      </div>

      {/* Dashboard content */}
      <Card className="rounded-t-none border-t-0 bg-white/98 dark:bg-stone-900/98 backdrop-blur-sm">
        <CardContent className="p-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-clay-500" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="w-6 h-6 text-red-500 mb-2" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={fetchTrendingData}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            </div>
          )}

          {trendingData && !loading && (
            <Tabs defaultValue="trending" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="trending" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </TabsTrigger>
                  <TabsTrigger value="emerging" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Emerging
                  </TabsTrigger>
                  <TabsTrigger value="global" className="text-xs">
                    <Globe className="w-3 h-3 mr-1" />
                    Cross-Regional
                  </TabsTrigger>
                </TabsList>

                {/* Time range selector */}
                <div className="flex gap-1">
                  {(['7d', '30d', '90d'] as const).map((range) => (
                    <Button
                      key={range}
                      variant={timeRange === range ? 'default' : 'ghost'}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setTimeRange(range)}
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Trending Themes Tab */}
              <TabsContent value="trending" className="mt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {trendingData.trending.slice(0, 12).map((theme, index) => (
                    <ThemeCard
                      key={theme.name}
                      theme={theme}
                      rank={index + 1}
                      maxCount={maxCount}
                      onClick={() => toggleTheme(theme.name)}
                    />
                  ))}
                </div>

                {/* Summary stats */}
                <div className="flex gap-6 mt-4 pt-4 border-t text-sm text-muted-foreground">
                  <div>
                    <span className="font-semibold text-foreground">{trendingData.totalStories}</span> stories analyzed
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">{trendingData.totalThemes}</span> unique themes
                  </div>
                  <div className="text-xs">
                    Updated {new Date(trendingData.lastUpdated).toLocaleTimeString()}
                  </div>
                </div>
              </TabsContent>

              {/* Emerging Themes Tab */}
              <TabsContent value="emerging" className="mt-0">
                {trendingData.emerging.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No new themes emerged in the last 7 days</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {trendingData.emerging.map((theme) => (
                      <Card
                        key={theme.name}
                        className="cursor-pointer hover:border-amber-400 transition-all"
                        onClick={() => toggleTheme(theme.name)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500 mt-0.5" />
                            <div>
                              <p className="font-medium capitalize text-sm">{theme.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {theme.count} stories • {theme.regions.length} regions
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Cross-Regional Tab */}
              <TabsContent value="global" className="mt-0">
                {trendingData.crossRegional.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No cross-regional themes found (requires 3+ regions)</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trendingData.crossRegional.map((item) => (
                      <Card
                        key={item.theme}
                        className="cursor-pointer hover:border-sky-400 transition-all"
                        onClick={() => toggleTheme(item.theme)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <div className="flex-1">
                              <p className="font-medium capitalize text-sm">{item.theme}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.connectionCount} stories across {item.regions.length} regions
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1 max-w-[300px]">
                              {item.regions.slice(0, 5).map((region) => (
                                <Badge key={region} variant="outline" className="text-xs">
                                  {region}
                                </Badge>
                              ))}
                              {item.regions.length > 5 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{item.regions.length - 5} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Theme card component
function ThemeCard({
  theme,
  rank,
  maxCount,
  onClick
}: {
  theme: TrendingTheme
  rank: number
  maxCount: number
  onClick: () => void
}) {
  const color = theme.color || getThemeColor(theme.name)
  const percentage = (theme.count / maxCount) * 100

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all overflow-hidden"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-bold text-muted-foreground">#{rank}</span>
          {theme.trend === 'up' && (
            <TrendingUp className="w-3 h-3 text-green-500" />
          )}
          {theme.trend === 'down' && (
            <TrendingDown className="w-3 h-3 text-red-500" />
          )}
          {theme.isNew && (
            <Badge variant="secondary" className="text-xs h-4 bg-amber-100 text-amber-700">
              New
            </Badge>
          )}
        </div>

        <p className="font-medium capitalize text-sm truncate" title={theme.name}>
          {theme.name}
        </p>

        <div className="mt-2">
          <Progress
            value={percentage}
            className="h-1.5"
            style={{
              // @ts-expect-error - custom CSS variable
              '--progress-background': color
            } as any}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {theme.count} stories
          </p>
        </div>

        {theme.velocity !== 0 && (
          <p className={cn(
            "text-xs mt-1",
            theme.velocity > 0 ? "text-green-600" : "text-red-600"
          )}>
            {theme.velocity > 0 ? '+' : ''}{Math.round(theme.velocity * 100)}% vs last period
          </p>
        )}
      </CardContent>
    </Card>
  )
}
