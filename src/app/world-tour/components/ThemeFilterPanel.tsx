'use client'

import React from 'react'
import { X, Filter, Check, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useMapContext } from '../context/MapContext'
import { getThemeColor } from './types/map-types'

interface ThemeFilterPanelProps {
  className?: string
  compact?: boolean
}

export function ThemeFilterPanel({ className, compact = false }: ThemeFilterPanelProps) {
  const {
    state,
    toggleTheme,
    clearThemeFilters
  } = useMapContext()

  const { trendingThemes, activeThemes, themeColorMap } = state

  // Sort themes by count
  const sortedThemes = [...trendingThemes].sort((a, b) => b.count - a.count)

  if (compact) {
    if (sortedThemes.length === 0) {
      return (
        <div className={cn("text-center py-4 text-sm text-muted-foreground", className)}>
          No themes available yet. Add stories with themes to enable filtering.
        </div>
      )
    }

    return (
      <div className={cn("flex flex-wrap gap-2 justify-center items-center", className)}>
        {activeThemes.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={clearThemeFilters}
          >
            <X className="w-3 h-3 mr-1" />
            Clear filters
          </Button>
        )}
        {sortedThemes.slice(0, 15).map((theme) => {
          const isActive = activeThemes.includes(theme.name.toLowerCase())
          const color = themeColorMap[theme.name.toLowerCase()] || getThemeColor(theme.name)

          return (
            <Badge
              key={theme.name}
              variant="outline"
              className={cn(
                "cursor-pointer transition-all hover:scale-105",
                isActive && "ring-2 ring-offset-1"
              )}
              style={{
                backgroundColor: isActive ? `${color}30` : 'transparent',
                borderColor: color,
                color: isActive ? color : undefined
              }}
              onClick={() => toggleTheme(theme.name)}
            >
              {isActive && <Check className="w-3 h-3 mr-1" />}
              {theme.name}
              <span className="ml-1 opacity-60">{theme.count}</span>
            </Badge>
          )
        })}
      </div>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter by Theme
          </CardTitle>
          {activeThemes.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={clearThemeFilters}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Clear ({activeThemes.length})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-2">
            {sortedThemes.map((theme) => {
              const isActive = activeThemes.includes(theme.name.toLowerCase())
              const color = themeColorMap[theme.name.toLowerCase()] || getThemeColor(theme.name)

              return (
                <button
                  key={theme.name}
                  onClick={() => toggleTheme(theme.name)}
                  className={cn(
                    "w-full flex items-center gap-2 p-2 rounded-lg transition-all",
                    "hover:bg-stone-100 dark:hover:bg-stone-800",
                    isActive && "bg-stone-100 dark:bg-stone-800"
                  )}
                >
                  {/* Color indicator */}
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full flex items-center justify-center transition-all",
                      isActive ? "ring-2 ring-offset-1" : "opacity-60"
                    )}
                    style={{ backgroundColor: color, ringColor: color }}
                  >
                    {isActive && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>

                  {/* Theme name */}
                  <span className={cn(
                    "flex-1 text-left text-sm capitalize",
                    isActive && "font-medium"
                  )}>
                    {theme.name}
                  </span>

                  {/* Story count */}
                  <span className="text-xs text-muted-foreground">
                    {theme.count} {theme.count === 1 ? 'story' : 'stories'}
                  </span>

                  {/* Trend indicator */}
                  {theme.trend === 'up' && (
                    <span className="text-green-500 text-xs">↑</span>
                  )}
                  {theme.trend === 'down' && (
                    <span className="text-red-500 text-xs">↓</span>
                  )}

                  {/* New badge */}
                  {theme.isNew && (
                    <Badge variant="secondary" className="text-xs h-5 bg-amber-100 text-amber-700">
                      New
                    </Badge>
                  )}
                </button>
              )
            })}

            {sortedThemes.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No themes found
              </p>
            )}
          </div>
        </ScrollArea>

        {/* Selected themes summary */}
        {activeThemes.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2">Active filters:</p>
            <div className="flex flex-wrap gap-1">
              {activeThemes.map((themeName) => {
                const color = themeColorMap[themeName] || getThemeColor(themeName)
                return (
                  <Badge
                    key={themeName}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: `${color}30`, color }}
                    onClick={() => toggleTheme(themeName)}
                  >
                    {themeName}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                )
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground mb-2">Legend:</p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="text-green-500">↑</span> Trending up
            </div>
            <div className="flex items-center gap-1">
              <span className="text-red-500">↓</span> Declining
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs h-4 bg-amber-100 text-amber-700">
                New
              </Badge>
              Last 7 days
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
