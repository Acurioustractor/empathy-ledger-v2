'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Palette,
  Layers,
  Grid3x3,
  List,
  Search,
  Heart,
  Sparkles,
  Cloud,
  Sun,
  Moon,
  Mountain,
  Users,
  Home,
  Leaf,
  Flame,
  Droplets,
  Wind,
  Star,
  Eye,
  ChevronRight,
  LayoutGrid
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
interface MediaItem {
  id: string
  url: string
  title: string
  created_at: string
}

interface NarrativeTheme {
  id: string
  name: string
  category: string
  description?: string
  icon?: string
  color?: string
}

interface ThemeWithMedia extends NarrativeTheme {
  media: MediaItem[]
  count: number
}

interface ThemeCategory {
  name: string
  description?: string
  themes: ThemeWithMedia[]
  totalMedia: number
}

interface ThemeCollectionProps {
  themes: ThemeWithMedia[]
  categories?: string[]
  onThemeSelect?: (themeName: string) => void
  onMediaSelect?: (mediaId: string) => void
  selectedTheme?: string | null
  className?: string
}

// Theme icons mapping
const THEME_ICONS: Record<string, React.ReactNode> = {
  // Emotional
  'joy': <Sun className="h-4 w-4" />,
  'hope': <Star className="h-4 w-4" />,
  'love': <Heart className="h-4 w-4" />,
  'peace': <Cloud className="h-4 w-4" />,
  'grief': <Moon className="h-4 w-4" />,
  'healing': <Sparkles className="h-4 w-4" />,

  // Cultural
  'country': <Mountain className="h-4 w-4" />,
  'community': <Users className="h-4 w-4" />,
  'family': <Home className="h-4 w-4" />,
  'ceremony': <Flame className="h-4 w-4" />,
  'dreaming': <Star className="h-4 w-4" />,

  // Environmental
  'land': <Leaf className="h-4 w-4" />,
  'water': <Droplets className="h-4 w-4" />,
  'fire': <Flame className="h-4 w-4" />,
  'sky': <Wind className="h-4 w-4" />,

  // Default
  'default': <Palette className="h-4 w-4" />
}

// Theme colors mapping
const THEME_COLORS: Record<string, string> = {
  // Emotional - warm tones
  'joy': 'bg-amber-100 text-amber-700 border-amber-200',
  'hope': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'love': 'bg-rose-100 text-rose-700 border-rose-200',
  'peace': 'bg-sky-100 text-sky-700 border-sky-200',
  'grief': 'bg-slate-100 text-slate-700 border-slate-200',
  'healing': 'bg-emerald-100 text-emerald-700 border-emerald-200',

  // Cultural - earth tones
  'country': 'bg-earth-100 text-earth-700 border-earth-200',
  'community': 'bg-sage-100 text-sage-700 border-sage-200',
  'family': 'bg-stone-100 text-stone-700 border-stone-200',
  'ceremony': 'bg-clay-100 text-clay-700 border-clay-200',
  'dreaming': 'bg-indigo-100 text-indigo-700 border-indigo-200',

  // Default
  'default': 'bg-stone-100 text-stone-700 border-stone-200'
}

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  'emotional': 'from-rose-500 to-amber-500',
  'cultural': 'from-earth-500 to-sage-500',
  'environmental': 'from-emerald-500 to-sky-500',
  'narrative': 'from-indigo-500 to-purple-500',
  'default': 'from-stone-500 to-stone-600'
}

export function ThemeCollection({
  themes,
  categories: defaultCategories,
  onThemeSelect,
  onMediaSelect,
  selectedTheme,
  className
}: ThemeCollectionProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'mosaic'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [previewTheme, setPreviewTheme] = useState<ThemeWithMedia | null>(null)

  // Group themes by category
  const themeCategories = useMemo(() => {
    const categoryMap = new Map<string, ThemeWithMedia[]>()

    themes.forEach(theme => {
      const category = theme.category || 'uncategorized'
      const existing = categoryMap.get(category) || []
      categoryMap.set(category, [...existing, theme])
    })

    const result: ThemeCategory[] = Array.from(categoryMap.entries())
      .map(([name, categoryThemes]) => ({
        name,
        themes: categoryThemes.sort((a, b) => b.count - a.count),
        totalMedia: categoryThemes.reduce((sum, t) => sum + t.count, 0)
      }))
      .sort((a, b) => b.totalMedia - a.totalMedia)

    return result
  }, [themes])

  // Filter themes based on search
  const filteredThemes = useMemo(() => {
    if (!searchQuery) return themes

    const query = searchQuery.toLowerCase()
    return themes.filter(theme =>
      theme.name.toLowerCase().includes(query) ||
      theme.category?.toLowerCase().includes(query) ||
      theme.description?.toLowerCase().includes(query)
    )
  }, [themes, searchQuery])

  // Get theme icon
  const getThemeIcon = (themeName: string) => {
    const key = themeName.toLowerCase()
    for (const [iconKey, icon] of Object.entries(THEME_ICONS)) {
      if (key.includes(iconKey)) return icon
    }
    return THEME_ICONS.default
  }

  // Get theme color
  const getThemeColor = (themeName: string) => {
    const key = themeName.toLowerCase()
    for (const [colorKey, color] of Object.entries(THEME_COLORS)) {
      if (key.includes(colorKey)) return color
    }
    return THEME_COLORS.default
  }

  // Get category gradient
  const getCategoryGradient = (categoryName: string) => {
    const key = categoryName.toLowerCase()
    for (const [catKey, gradient] of Object.entries(CATEGORY_COLORS)) {
      if (key.includes(catKey)) return gradient
    }
    return CATEGORY_COLORS.default
  }

  // Handle theme click
  const handleThemeClick = (theme: ThemeWithMedia) => {
    if (onThemeSelect) {
      onThemeSelect(theme.name)
    } else {
      setPreviewTheme(theme)
    }
  }

  // Stats
  const totalThemes = themes.length
  const totalMedia = themes.reduce((sum, t) => sum + t.count, 0)
  const categoryCount = themeCategories.length

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card className="bg-gradient-to-r from-clay-50 via-earth-50/30 to-sage-50 border-stone-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Palette className="h-5 w-5 text-clay-600" />
                Theme Collections
              </CardTitle>
              <CardDescription>
                Discover content organized by narrative themes
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white">
                {totalThemes} themes
              </Badge>
              <Badge variant="outline" className="bg-white">
                {totalMedia} items
              </Badge>
              <Badge variant="outline" className="bg-white">
                {categoryCount} categories
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search themes..."
                className="pl-9"
              />
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'mosaic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('mosaic')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>

            {/* Category Filter */}
            {themeCategories.length > 1 && (
              <select
                value={activeCategory || ''}
                onChange={(e) => setActiveCategory(e.target.value || null)}
                className="px-3 py-2 border border-stone-200 rounded-md text-sm"
              >
                <option value="">All Categories</option>
                {themeCategories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name} ({cat.themes.length})
                  </option>
                ))}
              </select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredThemes
            .filter(t => !activeCategory || t.category === activeCategory)
            .map((theme) => (
              <Card
                key={theme.id}
                className={cn(
                  'group cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] overflow-hidden',
                  selectedTheme === theme.name && 'ring-2 ring-sage-500'
                )}
                onClick={() => handleThemeClick(theme)}
              >
                {/* Theme preview mosaic */}
                <div className="relative aspect-square bg-stone-100">
                  {theme.media.length > 0 ? (
                    <div className="grid grid-cols-2 w-full h-full">
                      {theme.media.slice(0, 4).map((item, idx) => (
                        <div key={item.id} className="relative overflow-hidden">
                          <img
                            src={item.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getThemeIcon(theme.name)}
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2">
                      <Button size="sm" variant="secondary" className="w-full">
                        <Eye className="h-4 w-4 mr-1" />
                        View All
                      </Button>
                    </div>
                  </div>

                  {/* Count badge */}
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-black/70 text-white border-0">
                      {theme.count}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn('p-1 rounded', getThemeColor(theme.name))}>
                      {getThemeIcon(theme.name)}
                    </div>
                    <span className="font-medium text-sm truncate">{theme.name}</span>
                  </div>
                  {theme.category && (
                    <Badge variant="outline" className="text-xs">
                      {theme.category}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-stone-200">
              {filteredThemes
                .filter(t => !activeCategory || t.category === activeCategory)
                .map((theme) => (
                  <div
                    key={theme.id}
                    className={cn(
                      'flex items-center gap-4 p-4 hover:bg-stone-50 cursor-pointer transition-colors',
                      selectedTheme === theme.name && 'bg-sage-50'
                    )}
                    onClick={() => handleThemeClick(theme)}
                  >
                    {/* Theme icon */}
                    <div className={cn('p-3 rounded-lg', getThemeColor(theme.name))}>
                      {getThemeIcon(theme.name)}
                    </div>

                    {/* Theme info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{theme.name}</span>
                        {theme.category && (
                          <Badge variant="outline" className="text-xs">
                            {theme.category}
                          </Badge>
                        )}
                      </div>
                      {theme.description && (
                        <p className="text-sm text-stone-500 truncate">
                          {theme.description}
                        </p>
                      )}
                    </div>

                    {/* Preview thumbnails */}
                    <div className="hidden md:flex items-center gap-1">
                      {theme.media.slice(0, 4).map((item) => (
                        <div key={item.id} className="w-10 h-10 rounded overflow-hidden">
                          <img
                            src={item.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Count and arrow */}
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{theme.count} items</Badge>
                      <ChevronRight className="h-4 w-4 text-stone-400" />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mosaic View - By Category */}
      {viewMode === 'mosaic' && (
        <div className="space-y-8">
          {themeCategories
            .filter(cat => !activeCategory || cat.name === activeCategory)
            .map((category) => (
              <div key={category.name}>
                {/* Category header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    'h-1 w-8 rounded-full bg-gradient-to-r',
                    getCategoryGradient(category.name)
                  )} />
                  <h3 className="text-lg font-semibold capitalize">{category.name}</h3>
                  <Badge variant="outline">{category.totalMedia} items</Badge>
                </div>

                {/* Category themes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.themes.slice(0, 6).map((theme) => (
                    <Card
                      key={theme.id}
                      className={cn(
                        'cursor-pointer transition-all hover:shadow-md overflow-hidden',
                        selectedTheme === theme.name && 'ring-2 ring-sage-500'
                      )}
                      onClick={() => handleThemeClick(theme)}
                    >
                      <div className="flex">
                        {/* Preview image */}
                        <div className="w-24 h-24 flex-shrink-0 bg-stone-100">
                          {theme.media[0] ? (
                            <img
                              src={theme.media[0].url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {getThemeIcon(theme.name)}
                            </div>
                          )}
                        </div>

                        {/* Theme info */}
                        <CardContent className="flex-1 p-3 flex flex-col justify-center">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={cn('p-1 rounded', getThemeColor(theme.name))}>
                              {getThemeIcon(theme.name)}
                            </div>
                            <span className="font-medium text-sm">{theme.name}</span>
                          </div>
                          <p className="text-xs text-stone-500">{theme.count} items</p>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>

                {category.themes.length > 6 && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveCategory(category.name)}
                  >
                    View all {category.themes.length} themes in {category.name}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Empty State */}
      {filteredThemes.length === 0 && (
        <Card className="p-12 text-center">
          <Palette className="h-16 w-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-900 mb-2">No themes found</h3>
          <p className="text-stone-500">
            {searchQuery
              ? 'Try adjusting your search'
              : 'Analyze media to extract narrative themes'}
          </p>
        </Card>
      )}

      {/* Theme Preview Dialog */}
      <Dialog open={!!previewTheme} onOpenChange={() => setPreviewTheme(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {previewTheme && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className={cn('p-2 rounded', getThemeColor(previewTheme.name))}>
                    {getThemeIcon(previewTheme.name)}
                  </div>
                  {previewTheme.name}
                  <Badge variant="outline">{previewTheme.count} items</Badge>
                </DialogTitle>
              </DialogHeader>

              {previewTheme.description && (
                <p className="text-stone-600">{previewTheme.description}</p>
              )}

              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-4">
                {previewTheme.media.map((item) => (
                  <div
                    key={item.id}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-sage-500 transition-all"
                    onClick={() => onMediaSelect?.(item.id)}
                  >
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ThemeCollection
